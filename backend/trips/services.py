
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
    """FMCSA-compliant HOS (Hours of Service) schedule generator.
    
    Implements 49 CFR Part 395 regulations:
    - Maximum 11 hours driving following 10 hours off-duty
    - 30-minute break required after 8 hours cumulative driving
    - 14-hour maximum on-duty window
    - 70-hour/8-day driving limit (cycle tracking not yet integrated)
    - 34-hour restart provision (optional future enhancement)
    
    This service generates duty segments for a trip that comply with FMCSA
    regulations. The generated schedule is used for route planning, ETA,
    and electronic log compliance.
    
    NOTE: This is a planning/estimation engine, not a real-time compliance
    system. Actual hours must be logged and verified against real driving.
    """

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
        """
        Generate FMCSA-compliant HOS schedule.
        
        FMCSA regulations (49 CFR Part 395):
        - Max 11 hours driving following 10 hours off-duty
        - Max 14 hours on-duty in a duty window
        - Max 70 hours in any 8 consecutive days (or 60 hours in 7 days with alternate rule)
        - 30-minute break required after 8 hours of cumulative driving
        - After 11 hours driving, must have 10 hours off-duty
        - 34-hour restart resets 70-hour cycle
        
        This implementation uses a simplified approach for planning.
        """
        start = self.trip.start_time
        try:
            estimated_hours = float(self.trip.estimated_drive_hours or 6.0)
        except (TypeError, ValueError):
            estimated_hours = 6.0

        segments: List[TripPlanSegment] = []
        remaining = estimated_hours
        now = start

        # FMCSA limits
        max_drive_per_duty_window = 11.0  # 11 hours max driving
        max_on_duty_per_window = 14.0  # 14 hours max on-duty
        break_threshold = 8.0  # 30-min break required after 8 hours driving
        required_off_duty_after_drive = 10.0  # 10 hours off-duty after 11 hours driving

        # Track current cycle
        driving_in_cycle = 0.0
        on_duty_in_window = 0.0
        required_break_taken = False

        iterations = 0
        while remaining > 0 and iterations < 500:  # Increased safety limit
            iterations += 1

            # Check if driver has exceeded 11 hours of driving (must take 10-hour break)
            if driving_in_cycle >= max_drive_per_duty_window:
                # Mandatory 10-hour off-duty rest
                rest_end = now + timedelta(hours=required_off_duty_after_drive)
                segments.append(TripPlanSegment(
                    DutyStatus.StatusChoices.SLEEPER,
                    now,
                    rest_end,
                    'FMCSA: 10-hour mandatory rest (after 11-hour max driving)'
                ))
                now = rest_end
                driving_in_cycle = 0.0
                on_duty_in_window = 0.0
                required_break_taken = False
                continue

            # Calculate how much we can drive in this segment
            # Limited by: remaining hours, max drive per window, max on-duty window
            available_drive = min(
                remaining,
                max_drive_per_duty_window - driving_in_cycle,
                max_on_duty_per_window - on_duty_in_window,
            )

            # If we haven't hit the 8-hour break threshold yet and remaining would cross it, drive to threshold
            if not required_break_taken and driving_in_cycle < break_threshold:
                hours_to_break_threshold = break_threshold - driving_in_cycle
                if remaining + driving_in_cycle > break_threshold:
                    available_drive = hours_to_break_threshold

            if available_drive <= 0:
                # On-duty window full or other constraint; take off-duty time
                off_duty_duration = min(2.0, required_off_duty_after_drive)  # Quick rest or full break
                rest_end = now + timedelta(hours=off_duty_duration)
                segments.append(TripPlanSegment(
                    DutyStatus.StatusChoices.OFF_DUTY,
                    now,
                    rest_end,
                    'Regulatory rest period'
                ))
                now = rest_end
                on_duty_in_window = 0.0
                driving_in_cycle = 0.0
                required_break_taken = False
                continue

            # Drive the segment
            drive_end = now + timedelta(hours=available_drive)
            segments.append(TripPlanSegment(
                DutyStatus.StatusChoices.DRIVING,
                now,
                drive_end,
                f'Driving ({available_drive:.2f} hrs)'
            ))

            now = drive_end
            remaining = max(0.0, remaining - available_drive)
            driving_in_cycle += available_drive
            on_duty_in_window += available_drive

            # After reaching 8 hours of driving, require a 30-minute break
            if not required_break_taken and driving_in_cycle >= break_threshold and remaining > 0:
                break_end = now + timedelta(minutes=30)
                segments.append(TripPlanSegment(
                    DutyStatus.StatusChoices.OFF_DUTY,
                    now,
                    break_end,
                    'FMCSA: 30-minute break (after 8 hours driving)'
                ))
                now = break_end
                required_break_taken = True

        # If no segments, add idle time
        if not segments:
            segments.append(TripPlanSegment(
                DutyStatus.StatusChoices.OFF_DUTY,
                start,
                start + timedelta(hours=1),
                'Idle'
            ))

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


class RouteEstimationService:
    """Service for estimating trip routes and calculating drive times.
    
    This service uses geopy to calculate distances between pickup and dropoff
    locations, then estimates drive hours based on an average speed of 60 mph.
    It also calculates the ETA based on the start time and estimated drive hours.
    
    Handles cases where route cannot be calculated by returning null values.
    """
    
    AVERAGE_SPEED_MPH = 60
    
    def __init__(self, average_speed_mph: float = AVERAGE_SPEED_MPH):
        """Initialize the service with an optional average speed.
        
        Args:
            average_speed_mph: Average speed in miles per hour for estimation (default: 60)
        """
        self.average_speed_mph = average_speed_mph
        self.estimator = RouteEstimator(average_speed_mph=average_speed_mph)
    
    def estimate_route(
        self,
        pickup_location: str,
        dropoff_location: str,
        start_time: datetime
    ) -> dict:
        """Estimate route distance, drive hours, and ETA.
        
        Args:
            pickup_location: Pickup location as a string (address or coordinates)
            dropoff_location: Dropoff location as a string (address or coordinates)
            start_time: Trip start time as a datetime object
        
        Returns:
            Dictionary with keys:
            - total_distance_miles: Distance in miles (float or None)
            - estimated_drive_hours: Estimated drive time in hours (float or None)
            - eta: Estimated arrival time as datetime (or None)
            
            Returns null values for all keys if route cannot be calculated.
        """
        try:
            # Use the RouteEstimator to get distance and drive hours
            result = self.estimator.estimate(pickup_location, dropoff_location)
            
            if result is None:
                # Route could not be calculated
                return {
                    'total_distance_miles': None,
                    'estimated_drive_hours': None,
                    'eta': None,
                }
            
            # Extract the values from the estimator result
            distance_miles = result.get('distance_miles')
            drive_hours = result.get('drive_hours')
            
            # Calculate ETA based on start_time and drive_hours
            if drive_hours is not None:
                eta = start_time + timedelta(hours=drive_hours)
            else:
                eta = None
            
            return {
                'total_distance_miles': distance_miles,
                'estimated_drive_hours': drive_hours,
                'eta': eta,
            }
        except Exception as exc:
            # Log the error and return null values
            logger.warning(
                'RouteEstimationService.estimate_route failed for %s -> %s: %s',
                pickup_location,
                dropoff_location,
                exc
            )
            return {
                'total_distance_miles': None,
                'estimated_drive_hours': None,
                'eta': None,
            }


class HOSCalculationService:
    """Service for calculating available HOS (Hours of Service) hours.

    This service calculates available drive and duty hours based on duty segments
    recorded for a trip. It implements FMCSA regulations:
    - Maximum 11 hours driving following 10 hours off-duty
    - Maximum 14 hours on-duty in a duty window
    - 34-hour restart resets the 7-day cycle

    The service tracks:
    - current_available_drive_hours: Starts at 11, decrements on driving segments
    - current_available_duty_hours: Starts at 14, decrements on on_duty segments
    - current_duty_status: Current duty status (off_duty, sleeper_berth, driving, on_duty)
    """

    INITIAL_DRIVE_HOURS = 11
    INITIAL_DUTY_HOURS = 14
    RESET_DRIVE_THRESHOLD = 10  # hours off-duty required to reset drive hours
    RESET_CYCLE_THRESHOLD = 34  # hours off-duty required to reset cycle

    def calculate_available_hours(self, trip: Trip) -> dict:
        """Calculate available drive and duty hours based on duty segments.

        Args:
            trip: Trip object with associated duty segments

        Returns:
            Dictionary with keys:
            - current_available_drive_hours: Available drive hours (float)
            - current_available_duty_hours: Available duty hours (float)
            - current_duty_status: Current duty status (string)
        """
        # Get all duty segments for the trip, ordered by start_time
        duty_segments = trip.duty_segments.all().order_by('start_time')

        # Initialize available hours
        available_drive_hours = self.INITIAL_DRIVE_HOURS
        available_duty_hours = self.INITIAL_DUTY_HOURS
        current_duty_status = 'off_duty'

        # Track consecutive off-duty time for reset conditions
        consecutive_off_duty_hours = 0.0

        # Process each duty segment
        for segment in duty_segments:
            # Calculate segment duration in hours
            duration = (segment.end_time - segment.start_time).total_seconds() / 3600

            # Update current duty status
            current_duty_status = segment.status

            # Check for 10-hour reset condition (drive hours)
            if segment.status == DutyStatus.StatusChoices.OFF_DUTY or segment.status == DutyStatus.StatusChoices.SLEEPER:
                consecutive_off_duty_hours += duration

                # If 10+ hours off-duty, reset drive hours
                if consecutive_off_duty_hours >= self.RESET_DRIVE_THRESHOLD:
                    available_drive_hours = self.INITIAL_DRIVE_HOURS

                # If 34+ hours off-duty, reset cycle (both drive and duty hours)
                if consecutive_off_duty_hours >= self.RESET_CYCLE_THRESHOLD:
                    available_drive_hours = self.INITIAL_DRIVE_HOURS
                    available_duty_hours = self.INITIAL_DUTY_HOURS
                    consecutive_off_duty_hours = 0.0
            else:
                # Reset consecutive off-duty counter when driver goes back on duty
                consecutive_off_duty_hours = 0.0

                # Decrement available hours based on segment status
                if segment.status == DutyStatus.StatusChoices.DRIVING:
                    available_drive_hours = max(0, available_drive_hours - duration)
                    available_duty_hours = max(0, available_duty_hours - duration)
                elif segment.status == DutyStatus.StatusChoices.ON_DUTY:
                    available_duty_hours = max(0, available_duty_hours - duration)

        return {
            'current_available_drive_hours': float(round(available_drive_hours, 2)),
            'current_available_duty_hours': float(round(available_duty_hours, 2)),
            'current_duty_status': current_duty_status,
        }



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
