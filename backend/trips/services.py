
from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import List, Optional, Tuple
import io

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
        # Basic HOS prototype (not a legal substitute). Enforces common limits:
        # - Max 11 hours driving in a 14-hour duty window (solo driver)
        # - Required 30-minute break after 8 cumulative driving hours
        # This is a simplified engine to generate reasonable duty segments for the UI.
        start = self.trip.start_time
        # preferences override defaults
        break_minutes = int(self._pref('break_minutes', 30))
        sleeper_hours = self._pref('sleeper_hours', 10)

        # Use estimated drive hours if present, otherwise assume a short trip
        try:
            estimated_hours = float(self.trip.estimated_drive_hours or 6.0)
        except (TypeError, ValueError):
            estimated_hours = 6.0

        segments: List[TripPlanSegment] = []
        remaining = estimated_hours
        now = start

        # Track cumulative driving within the duty window (resets only after sleeper)
        cumulative_drive = 0.0
        max_drive_per_window = 11.0
        break_threshold = 8.0

        # Safety loop guard
        iterations = 0
        while remaining > 0 and iterations < 100:
            iterations += 1

            # If we've exhausted the daily driving allotment, schedule sleeper reset
            if cumulative_drive >= max_drive_per_window:
                sleeper_end = now + timedelta(hours=sleeper_hours)
                segments.append(TripPlanSegment(DutyStatus.StatusChoices.SLEEPER, now, sleeper_end, 'Sleeper berth reset'))
                now = sleeper_end
                cumulative_drive = 0.0
                continue

            # How much we can drive before hitting either the 11-hour cap or the next required break
            available_before_cap = max_drive_per_window - cumulative_drive
            # If approaching break threshold, drive only until break threshold
            if cumulative_drive < break_threshold and remaining + cumulative_drive > break_threshold:
                drive_block = break_threshold - cumulative_drive
            else:
                drive_block = min(remaining, available_before_cap)

            drive_end = now + timedelta(hours=drive_block)
            segments.append(TripPlanSegment(DutyStatus.StatusChoices.DRIVING, now, drive_end, 'Driving'))

            now = drive_end
            remaining = max(0.0, remaining - drive_block)
            cumulative_drive += drive_block

            # After driving to or past the break threshold and if there is remaining driving, schedule a break
            if cumulative_drive >= break_threshold and remaining > 0:
                break_end = now + timedelta(minutes=break_minutes)
                segments.append(TripPlanSegment(DutyStatus.StatusChoices.OFF_DUTY, now, break_end, 'Required break'))
                now = break_end

        # If no segments were produced (edge case), add an off-duty block
        if not segments:
            segments.append(TripPlanSegment(DutyStatus.StatusChoices.OFF_DUTY, start, start + timedelta(hours=1), 'Idle'))

        return segments

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


def generate_log_pdf(trip, rows, export_date):
    """Generate a PDF bytes object for the given trip and rows (list of rows).

    Each row should be: [start_time, end_time, status, remarks, duration_str]
    Returns: bytes of PDF
    """
    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas

    from reportlab.lib import colors

    # TODO: Generate PNG thumbnail using Pillow (PIL) instead of matplotlib
    # Matplotlib tends to hang in test environments. Use simple PIL drawing instead.
    # For now, leave thumb_bytes as None and focus on core functionality.
    # Later: Use Pillow.Image + ImageDraw to draw rectangles and save as PNG.
    thumb_bytes = None

    pdf_buffer = io.BytesIO()
    c = canvas.Canvas(pdf_buffer, pagesize=letter)
    width, height = letter
    y = height - 40

    # Header
    c.setFont('Helvetica-Bold', 14)
    c.drawString(40, y, f"Trip {trip.id} Log — {export_date}")
    y -= 18

    # Summary line
    total_hours = 0.0
    for r in rows:
        try:
            total_hours += float(r[4])
        except Exception:
            pass
    c.setFont('Helvetica', 9)
    c.drawString(40, y, f"Total segments: {len(rows)}  •  Total hours: {total_hours:.2f}")
    y -= 18

    # Timeline graph: horizontal bar representing segments proportionally
    if rows:
        # Parse timestamps
        try:
            starts = [timezone.datetime.fromisoformat(r[0]) for r in rows]
            ends = [timezone.datetime.fromisoformat(r[1]) for r in rows]
            min_t = min(starts)
            max_t = max(ends)
            span_seconds = max(1, (max_t - min_t).total_seconds())
            bar_x = 40
            bar_w = width - 80
            bar_h = 14
            bar_y = y - bar_h

            # Draw background
            c.setFillColor(colors.lightgrey)
            c.rect(bar_x, bar_y, bar_w, bar_h, fill=1, stroke=0)

            # Status color mapping
            status_colors = {
                'driving': colors.green,
                'off_duty': colors.gray,
                'sleeper_berth': colors.blue,
                'on_duty': colors.orange,
            }

            for r in rows:
                try:
                    s = timezone.datetime.fromisoformat(r[0])
                    e = timezone.datetime.fromisoformat(r[1])
                except Exception:
                    continue
                start_frac = (s - min_t).total_seconds() / span_seconds
                end_frac = (e - min_t).total_seconds() / span_seconds
                rx = bar_x + start_frac * bar_w
                rw = max(1, (end_frac - start_frac) * bar_w)
                status_key = (r[2] or '').lower()
                color = status_colors.get(status_key, colors.lightblue)
                c.setFillColor(color)
                c.rect(rx, bar_y, rw, bar_h, fill=1, stroke=0)

            # Labels
            c.setFillColor(colors.black)
            c.setFont('Helvetica', 8)
            c.drawString(bar_x, bar_y - 12, min_t.isoformat())
            c.drawRightString(bar_x + bar_w, bar_y - 12, max_t.isoformat())
            y = bar_y - 24
        except Exception:
            y -= 10

    # Table header
    c.setFont('Helvetica-Bold', 10)
    c.drawString(40, y, 'start_time')
    c.drawString(180, y, 'end_time')
    c.drawString(320, y, 'status')
    c.drawString(420, y, 'duration_hrs')
    y -= 14
    c.setFont('Helvetica', 9)

    for r in rows:
        if y < 60:
            c.showPage()
            y = height - 40
        start_t, end_t, status_text, remarks, duration = r
        c.drawString(40, y, str(start_t))
        c.drawString(180, y, str(end_t))
        c.drawString(320, y, str(status_text))
        c.drawString(420, y, str(duration))
        y -= 12

    # Optionally include schedule snapshot details
    try:
        snapshot = trip.schedule_snapshot or {}
        if snapshot:
            if y < 120:
                c.showPage()
                y = height - 40
            c.setFont('Helvetica-Bold', 11)
            c.drawString(40, y, 'Schedule Snapshot')
            y -= 14
            c.setFont('Helvetica', 8)
            text = c.beginText(40, y)
            text.setLeading(10)
            for k, v in snapshot.items():
                text.textLine(f"{k}: {v}")
            c.drawText(text)
    except Exception:
        pass

    c.showPage()
    c.save()
    pdf_data = pdf_buffer.getvalue()
    pdf_buffer.close()
    # Return PDF bytes and thumbnail bytes (if generated)
    return (pdf_data, thumb_bytes)
