from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import List, Optional, Tuple

from django.core.cache import cache
from django.utils import timezone
from geopy.distance import geodesic
from geopy.geocoders import Nominatim

from trips.models import DutyStatus, Trip


@dataclass
class TripPlanSegment:
    status: DutyStatus.StatusChoices
    start_time: datetime
    end_time: datetime
    remarks: str = ''


class TripPlannerService:
    """Placeholder planner that will eventually enforce FMCSA HOS rules."""

    def __init__(self, trip: Trip):
        self.trip = trip
        self.preferences = trip.rest_preferences or {}

    def _pref(self, key: str, default: float) -> float:
        value = self.preferences.get(key)
        try:
            return float(value)
        except (TypeError, ValueError):
            return float(default)

    def generate_schedule(self) -> List[TripPlanSegment]:
        # TODO: replace with actual HOS engine
        start = self.trip.start_time
        drive_block_hours = self._pref('drive_block_hours', 4)
        break_minutes = self._pref('break_minutes', 30)
        second_drive_hours = self._pref('second_drive_hours', 3)
        sleeper_hours = self._pref('sleeper_hours', 10)

        drive_block_end = start + timedelta(hours=drive_block_hours)
        break_start = drive_block_end
        break_end = break_start + timedelta(minutes=break_minutes)
        final_drive_end = break_end + timedelta(hours=second_drive_hours)
        sleeper_end = final_drive_end + timedelta(hours=sleeper_hours)

        return [
            TripPlanSegment(DutyStatus.StatusChoices.DRIVING, start, drive_block_end, 'Initial drive block'),
            TripPlanSegment(DutyStatus.StatusChoices.OFF_DUTY, break_start, break_end, 'Scheduled rest stop'),
            TripPlanSegment(DutyStatus.StatusChoices.DRIVING, break_end, final_drive_end, 'Resume driving'),
            TripPlanSegment(DutyStatus.StatusChoices.SLEEPER, final_drive_end, sleeper_end, 'Sleeper berth reset'),
        ]

    def persist(self):
        segments = self.generate_schedule()
        DutyStatus.objects.filter(trip=self.trip).delete()
        duty_records = [
            DutyStatus(
                trip=self.trip,
                status=segment.status,
                start_time=segment.start_time,
                end_time=segment.end_time,
                remarks=segment.remarks,
            )
            for segment in segments
        ]
        DutyStatus.objects.bulk_create(duty_records)

        rest_stops = []
        for segment in segments:
            if segment.status in [DutyStatus.StatusChoices.OFF_DUTY, DutyStatus.StatusChoices.SLEEPER]:
                rest_stops.append(
                    {
                        'status': segment.status,
                        'start_time': segment.start_time.isoformat(),
                        'end_time': segment.end_time.isoformat(),
                        'remarks': segment.remarks,
                    }
                )

        self.trip.schedule_snapshot = {
            'generated_at': timezone.now().isoformat(),
            'segments': [
                {
                    'status': segment.status,
                    'start_time': segment.start_time.isoformat(),
                    'end_time': segment.end_time.isoformat(),
                    'remarks': segment.remarks,
                }
                for segment in segments
            ],
            'rest_stops': rest_stops,
        }
        last_drive = segments[-1]
        if not self.trip.eta:
            self.trip.eta = last_drive.end_time
        self.trip.status = Trip.Status.PLANNED
        self.trip.save(update_fields=['schedule_snapshot', 'eta', 'status'])

        return self.trip


logger = logging.getLogger(__name__)


class RouteEstimator:
    def __init__(
        self,
        user_agent: str = 'freightpilot-route-estimator',
        average_speed_mph: float = 55.0,
        cache_timeout_seconds: int = 60 * 60 * 12,
        max_requests_per_minute: int = 40,
    ):
        self.geocoder = Nominatim(user_agent=user_agent, timeout=10)
        self.average_speed_mph = average_speed_mph
        self.cache_timeout_seconds = cache_timeout_seconds
        self.max_requests_per_minute = max_requests_per_minute

    def _cache_key(self, location: str) -> str:
        return f"route_estimator:geocode:{location.strip().lower()}"

    def _rate_limit_key(self) -> str:
        current_minute = timezone.now().strftime('%Y%m%d%H%M')
        return f"route_estimator:minute:{current_minute}"

    def _check_rate_limit(self) -> None:
        key = self._rate_limit_key()
        current_count = cache.get(key)
        if current_count is None:
            cache.set(key, 1, timeout=60)
            return
        if current_count >= self.max_requests_per_minute:
            raise RuntimeError('Nominatim rate limit reached')
        cache.incr(key)

    def _coords_for(self, location: str) -> Optional[Tuple[float, float]]:
        if not location:
            return None

        cache_key = self._cache_key(location)
        cached_coords = cache.get(cache_key)
        if cached_coords:
            return cached_coords

        try:
            self._check_rate_limit()
        except RuntimeError as exc:
            logger.warning('RouteEstimator rate limit reached: %s', exc)
            return None

        try:
            result = self.geocoder.geocode(location)
            if result:
                coords = (result.latitude, result.longitude)
                cache.set(cache_key, coords, timeout=self.cache_timeout_seconds)
                return coords
        except Exception as exc:  # pragma: no cover - external API errors
            logger.warning('RouteEstimator geocode failed for %s: %s', location, exc)
            return None
        return None

    def estimate(self, origin: str, destination: str) -> Optional[dict]:
        origin_coords = self._coords_for(origin)
        destination_coords = self._coords_for(destination)

        if not origin_coords or not destination_coords:
            return None

        distance_miles = geodesic(origin_coords, destination_coords).miles
        hours = distance_miles / self.average_speed_mph if self.average_speed_mph else 0
        eta = timezone.now() + timedelta(hours=hours)

        return {
            'distance_miles': round(distance_miles, 2),
            'drive_hours': round(hours, 2),
            'eta': eta,
            'origin_coords': origin_coords,
            'destination_coords': destination_coords,
        }
