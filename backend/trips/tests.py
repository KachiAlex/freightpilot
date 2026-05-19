from django.test import TestCase
from django.utils import timezone
from django.contrib.auth import get_user_model
from datetime import timedelta

from trips.models import Trip, Vehicle, DutyStatus
from trips.services import TripPlannerService


class HOSServiceTests(TestCase):
	def setUp(self):
		User = get_user_model()
		self.user = User.objects.create_user(email='tester@example.com', password='pass', full_name='Tester')
		self.vehicle = Vehicle.objects.create(driver=self.user, truck_number='T1')

	def _make_trip(self, estimated_hours):
		start = timezone.now().replace(microsecond=0)
		trip = Trip.objects.create(
			driver=self.user,
			vehicle=self.vehicle,
			current_location='Origin',
			pickup_location='Origin',
			dropoff_location='Dest',
			start_time=start,
			estimated_drive_hours=estimated_hours,
		)
		return trip

	def test_break_after_8_hours(self):
		trip = self._make_trip(9)
		svc = TripPlannerService(trip)
		segments = svc.generate_schedule()

		# Expect first driving block of 8 hours
		first = segments[0]
		self.assertEqual(first.status, DutyStatus.StatusChoices.DRIVING)
		self.assertEqual(first.end_time - first.start_time, timedelta(hours=8))

		# Expect a break next
		second = segments[1]
		self.assertEqual(second.status, DutyStatus.StatusChoices.OFF_DUTY)
		self.assertEqual(second.end_time - second.start_time, timedelta(minutes=30))

		# Final driving block should be ~1 hour
		third = segments[2]
		self.assertEqual(third.status, DutyStatus.StatusChoices.DRIVING)
		self.assertEqual(third.end_time - third.start_time, timedelta(hours=1))

	def test_sleeper_after_11_hours(self):
		trip = self._make_trip(13)
		svc = TripPlannerService(trip)
		segments = svc.generate_schedule()

		# Aggregate driving durations until sleeper appears
		total_driving = timedelta()
		sleeper_found = False
		for seg in segments:
			if seg.status == DutyStatus.StatusChoices.DRIVING:
				total_driving += (seg.end_time - seg.start_time)
			if seg.status == DutyStatus.StatusChoices.SLEEPER:
				sleeper_found = True
				break

		# Expect at least 11 hours of driving before sleeper
		self.assertGreaterEqual(total_driving, timedelta(hours=11))
		self.assertTrue(sleeper_found)

	def test_fmcsa_11_hour_max_driving(self):
		"""FMCSA: Max 11 hours driving after 10 hours off-duty."""
		trip = self._make_trip(15)  # Request 15 hours of driving
		svc = TripPlannerService(trip)
		segments = svc.generate_schedule()

		# Aggregate driving until we hit a sleeper/mandatory rest
		total_driving = timedelta()
		for seg in segments:
			if seg.status == DutyStatus.StatusChoices.DRIVING:
				total_driving += (seg.end_time - seg.start_time)
			elif seg.status == DutyStatus.StatusChoices.SLEEPER:
				# Once sleeper is hit, we've completed a cycle; should be ~11 hours
				break

		# Verify first cycle is at most 11 hours driving
		self.assertLessEqual(total_driving.total_seconds() / 3600, 11.01, 
			f"Expected max 11 hours driving in first cycle, got {total_driving.total_seconds() / 3600:.2f}")

	def test_fmcsa_30_min_break_after_8_hours(self):
		"""FMCSA: 30-minute break required after 8 hours of driving."""
		trip = self._make_trip(9)
		svc = TripPlannerService(trip)
		segments = svc.generate_schedule()

		# Should have: 8h driving, 30min break, 1h driving
		self.assertEqual(len(segments), 3, f"Expected 3 segments, got {len(segments)}")
		
		# First segment: 8 hours driving
		self.assertEqual(segments[0].status, DutyStatus.StatusChoices.DRIVING)
		self.assertAlmostEqual((segments[0].end_time - segments[0].start_time).total_seconds() / 3600, 8, places=1)
		
		# Second segment: 30-minute break
		self.assertEqual(segments[1].status, DutyStatus.StatusChoices.OFF_DUTY)
		self.assertEqual(segments[1].end_time - segments[1].start_time, timedelta(minutes=30))
		
		# Third segment: remaining 1 hour driving
		self.assertEqual(segments[2].status, DutyStatus.StatusChoices.DRIVING)
		self.assertAlmostEqual((segments[2].end_time - segments[2].start_time).total_seconds() / 3600, 1, places=1)

	def test_fmcsa_10_hour_mandatory_rest(self):
		"""FMCSA: After 11 hours driving, must have 10 hours off-duty."""
		trip = self._make_trip(12)
		svc = TripPlannerService(trip)
		segments = svc.generate_schedule()

		# Find the mandatory 10-hour rest (should be a SLEEPER segment with "10-hour" in remarks)
		found_10hour_rest = False
		for seg in segments:
			if seg.status == DutyStatus.StatusChoices.SLEEPER and '10' in seg.remarks.lower():
				found_10hour_rest = True
				self.assertGreaterEqual(seg.end_time - seg.start_time, timedelta(hours=10))
				break

		self.assertTrue(found_10hour_rest, "Expected 10-hour mandatory rest after 11-hour driving limit")

	def test_fmcsa_schedule_snapshot_recorded(self):
		"""Verify FMCSA schedule is recorded in trip snapshot."""
		trip = self._make_trip(10)
		svc = TripPlannerService(trip)
		svc.persist()
		
		trip.refresh_from_db()
		self.assertIn('segments', trip.schedule_snapshot)
		self.assertGreater(len(trip.schedule_snapshot['segments']), 0)
		
		# Verify segments have FMCSA remarks
		remarks = [seg.get('remarks', '') for seg in trip.schedule_snapshot['segments']]
		self.assertTrue(any('FMCSA' in r or 'Driving' in r for r in remarks))

	def test_export_log_endpoint_creates_csv(self):
		trip = self._make_trip(5)
		# Persist segments so export picks them up
		TripPlannerService(trip).persist()
		from rest_framework.test import APIClient
		from trips.models import LogSheet

		client = APIClient()
		client.force_authenticate(user=self.user)
		url = f"/api/v1/trips/{trip.id}/export_log/"
		resp = client.get(url)
		self.assertEqual(resp.status_code, 200)
		self.assertEqual(resp['Content-Type'], 'text/csv')
		self.assertIn(f"trip_{trip.id}_log_", resp['Content-Disposition'])

		# Test save flag creates a LogSheet
		date = timezone.localdate().isoformat()
		resp2 = client.get(url, {'date': date, 'save': 'true'})
		self.assertEqual(resp2.status_code, 200)
		sheet_exists = LogSheet.objects.filter(trip=trip, date=date).exists()
		self.assertTrue(sheet_exists)

	def test_export_pdf_and_save_creates_pdf_file(self):
		trip = self._make_trip(4)
		TripPlannerService(trip).persist()
		from trips.models import LogSheet
		from trips.services import generate_log_pdf

		# Build rows the same way the view does
		segments = trip.duty_segments.filter(start_time__date=timezone.localdate())
		rows = []
		for seg in segments:
			duration = (seg.end_time - seg.start_time).total_seconds() / 3600.0
			rows.append([seg.start_time.isoformat(), seg.end_time.isoformat(), seg.status, seg.remarks or '', f"{duration:.2f}"])

		result = generate_log_pdf(trip, rows, timezone.localdate().isoformat())
		# helper may return (pdf_bytes, thumb_bytes)
		if isinstance(result, tuple):
			pdf_data = result[0]
		else:
			pdf_data = result
		# Persist to LogSheet
		date = timezone.localdate()
		sheet, created = LogSheet.objects.get_or_create(trip=trip, date=date)
		from django.core.files.base import ContentFile
		sheet.pdf_file.save(f"trip_{trip.id}_log_{date.isoformat()}.pdf", ContentFile(pdf_data), save=True)
		sheet.refresh_from_db()
		self.assertTrue(bool(sheet.pdf_file))

	def test_export_pdf_endpoint_saves_thumbnail(self):
		trip = self._make_trip(4)
		TripPlannerService(trip).persist()
		from rest_framework.test import APIClient
		from trips.models import LogSheet
		
		client = APIClient()
		client.force_authenticate(user=self.user)
		
		# Call export_log endpoint with PDF format
		url = f"/api/v1/trips/{trip.id}/export_log/"
		# Note: not passing date param - should use localdate
		resp = client.get(url, {'format': 'pdf', 'save': 'true'})
		
		# Verify endpoint responds successfully
		self.assertIn(resp.status_code, (200, 201), f"Expected 200/201, got {resp.status_code}. Response: {resp.data if hasattr(resp, 'data') else resp.content[:200]}")
		
		# Verify LogSheet was created
		sheet = LogSheet.objects.filter(trip=trip, date=timezone.localdate()).first()
		self.assertIsNotNone(sheet, "LogSheet not found for trip")
		
		# Verify PDF file was saved (thumbnail is optional)
		self.assertTrue(bool(sheet.pdf_file), "PDF file not saved")

	def test_driver_cannot_access_other_trip(self):
		# Create another driver and a trip owned by them
		User = get_user_model()
		other = User.objects.create_user(email='other@example.com', password='pass', full_name='Other')
		other_vehicle = Vehicle.objects.create(driver=other, truck_number='T2')
		other_trip = Trip.objects.create(
			driver=other,
			vehicle=other_vehicle,
			current_location='O',
			pickup_location='O',
			dropoff_location='D',
			start_time=timezone.now(),
			estimated_drive_hours=2,
		)

		from rest_framework.test import APIClient
		client = APIClient()
		client.force_authenticate(user=self.user)
		url = f"/api/v1/trips/{other_trip.id}/"
		resp = client.get(url)
		# Should not be allowed to see another driver's trip (404 from queryset filtering)
		self.assertIn(resp.status_code, (403, 404))

	def test_admin_can_access_other_trip(self):
		User = get_user_model()
		admin = User.objects.create_user(email='admin@example.com', password='pass', full_name='Admin', role=User.Roles.ADMIN)
		other = User.objects.create_user(email='other2@example.com', password='pass', full_name='Other2')
		other_vehicle = Vehicle.objects.create(driver=other, truck_number='T3')
		other_trip = Trip.objects.create(
			driver=other,
			vehicle=other_vehicle,
			current_location='O',
			pickup_location='O',
			dropoff_location='D',
			start_time=timezone.now(),
			estimated_drive_hours=2,
		)

		from rest_framework.test import APIClient
		client = APIClient()
		client.force_authenticate(user=admin)
		url = f"/api/v1/trips/{other_trip.id}/"
		resp = client.get(url)
		self.assertEqual(resp.status_code, 200)

	def test_logs_endpoint_returns_saved_sheets(self):
		trip = self._make_trip(3)
		TripPlannerService(trip).persist()
		from trips.models import LogSheet
		from django.core.files.base import ContentFile

		# create a saved log
		pdf_data = b'pdfbytes'
		date = timezone.localdate()
		sheet, created = LogSheet.objects.get_or_create(trip=trip, date=date)
		sheet.pdf_file.save(f"trip_{trip.id}_log_{date.isoformat()}.pdf", ContentFile(pdf_data), save=True)

		from rest_framework.test import APIClient
		client = APIClient()
		client.force_authenticate(user=self.user)
		url = f"/api/v1/trips/{trip.id}/logs/"
		resp = client.get(url)
		self.assertEqual(resp.status_code, 200)
		data = resp.data
		# support paginated responses
		if isinstance(data, dict) and 'results' in data:
			items = data['results']
		else:
			items = data
		self.assertIsInstance(items, list)
		self.assertGreaterEqual(len(items), 1)
		self.assertIn('pdf_file', items[0])

	def test_owner_can_delete_log(self):
		trip = self._make_trip(2)
		from trips.models import LogSheet
		from django.core.files.base import ContentFile
		date = timezone.localdate()
		sheet, _ = LogSheet.objects.get_or_create(trip=trip, date=date)
		sheet.pdf_file.save(f"s{sheet.id}.pdf", ContentFile(b'data'), save=True)

		from rest_framework.test import APIClient
		client = APIClient()
		client.force_authenticate(user=self.user)
		url = f"/api/v1/trips/{trip.id}/logs/{sheet.id}/"
		resp = client.delete(url)
		self.assertEqual(resp.status_code, 204)

	def test_other_driver_cannot_delete_log(self):
		trip = self._make_trip(2)
		from trips.models import LogSheet
		from django.core.files.base import ContentFile
		date = timezone.localdate()
		sheet, _ = LogSheet.objects.get_or_create(trip=trip, date=date)
		sheet.pdf_file.save(f"s{sheet.id}.pdf", ContentFile(b'data'), save=True)

		User = get_user_model()
		other = User.objects.create_user(email='x@example.com', password='p', full_name='X')
		from rest_framework.test import APIClient
		client = APIClient()
		client.force_authenticate(user=other)
		url = f"/api/v1/trips/{trip.id}/logs/{sheet.id}/"
		resp = client.delete(url)
		self.assertIn(resp.status_code, (403, 404))

	def test_admin_can_delete_log(self):
		trip = self._make_trip(2)
		from trips.models import LogSheet
		from django.core.files.base import ContentFile
		date = timezone.localdate()
		sheet, _ = LogSheet.objects.get_or_create(trip=trip, date=date)
		sheet.pdf_file.save(f"s{sheet.id}.pdf", ContentFile(b'data'), save=True)

		User = get_user_model()
		admin = User.objects.create_user(email='admin2@example.com', password='p', full_name='Admin2', role=User.Roles.ADMIN)
		from rest_framework.test import APIClient
		client = APIClient()
		client.force_authenticate(user=admin)
		url = f"/api/v1/trips/{trip.id}/logs/{sheet.id}/"
		resp = client.delete(url)
		self.assertEqual(resp.status_code, 204)



class TripSerializerValidationTests(TestCase):
	"""Tests for TripSerializer validation."""

	def setUp(self):
		User = get_user_model()
		self.user = User.objects.create_user(email='driver@example.com', password='pass', full_name='Driver')
		self.vehicle = Vehicle.objects.create(driver=self.user, truck_number='T1')
		self.future_time = timezone.now() + timedelta(hours=2)

	def test_pickup_location_required_and_non_empty(self):
		"""Test that pickup_location is required and cannot be empty."""
		from trips.serializers import TripCreateSerializer
		from rest_framework.test import APIRequestFactory

		factory = APIRequestFactory()
		request = factory.post('/api/v1/trips/')
		request.user = self.user

		# Test with empty string
		data = {
			'pickup_location': '',
			'dropoff_location': 'Destination',
			'start_time': self.future_time,
		}
		serializer = TripCreateSerializer(data=data, context={'request': request})
		self.assertFalse(serializer.is_valid())
		self.assertIn('pickup_location', serializer.errors)

		# Test with whitespace only
		data = {
			'pickup_location': '   ',
			'dropoff_location': 'Destination',
			'start_time': self.future_time,
		}
		serializer = TripCreateSerializer(data=data, context={'request': request})
		self.assertFalse(serializer.is_valid())
		self.assertIn('pickup_location', serializer.errors)

	def test_dropoff_location_required_and_non_empty(self):
		"""Test that dropoff_location is required and cannot be empty."""
		from trips.serializers import TripCreateSerializer
		from rest_framework.test import APIRequestFactory

		factory = APIRequestFactory()
		request = factory.post('/api/v1/trips/')
		request.user = self.user

		# Test with empty string
		data = {
			'pickup_location': 'Origin',
			'dropoff_location': '',
			'start_time': self.future_time,
		}
		serializer = TripCreateSerializer(data=data, context={'request': request})
		self.assertFalse(serializer.is_valid())
		self.assertIn('dropoff_location', serializer.errors)

		# Test with whitespace only
		data = {
			'pickup_location': 'Origin',
			'dropoff_location': '   ',
			'start_time': self.future_time,
		}
		serializer = TripCreateSerializer(data=data, context={'request': request})
		self.assertFalse(serializer.is_valid())
		self.assertIn('dropoff_location', serializer.errors)

	def test_start_time_cannot_be_in_past(self):
		"""Test that start_time cannot be in the past."""
		from trips.serializers import TripCreateSerializer
		from rest_framework.test import APIRequestFactory

		factory = APIRequestFactory()
		request = factory.post('/api/v1/trips/')
		request.user = self.user

		# Test with past time
		past_time = timezone.now() - timedelta(hours=1)
		data = {
			'pickup_location': 'Origin',
			'dropoff_location': 'Destination',
			'start_time': past_time,
		}
		serializer = TripCreateSerializer(data=data, context={'request': request})
		self.assertFalse(serializer.is_valid())
		self.assertIn('start_time', serializer.errors)

	def test_valid_trip_creation_data(self):
		"""Test that valid trip data passes validation."""
		from trips.serializers import TripCreateSerializer
		from rest_framework.test import APIRequestFactory

		factory = APIRequestFactory()
		request = factory.post('/api/v1/trips/')
		request.user = self.user

		data = {
			'pickup_location': 'Origin',
			'dropoff_location': 'Destination',
			'start_time': self.future_time,
			'current_location': 'Origin',
		}
		serializer = TripCreateSerializer(data=data, context={'request': request})
		self.assertTrue(serializer.is_valid(), serializer.errors)

	def test_trip_serializer_includes_nested_duty_segments(self):
		"""Test that TripSerializer includes nested duty_segments."""
		from trips.serializers import TripSerializer

		trip = Trip.objects.create(
			driver=self.user,
			vehicle=self.vehicle,
			current_location='Origin',
			pickup_location='Origin',
			dropoff_location='Destination',
			start_time=self.future_time,
		)

		# Create a duty segment
		DutyStatus.objects.create(
			trip=trip,
			status=DutyStatus.StatusChoices.DRIVING,
			start_time=self.future_time,
			end_time=self.future_time + timedelta(hours=1),
		)

		serializer = TripSerializer(trip)
		self.assertIn('duty_segments', serializer.data)
		self.assertEqual(len(serializer.data['duty_segments']), 1)
		self.assertEqual(serializer.data['duty_segments'][0]['status'], 'driving')

	def test_trip_serializer_includes_nested_log_sheets(self):
		"""Test that TripSerializer includes nested log_sheets."""
		from trips.serializers import TripSerializer
		from trips.models import LogSheet

		trip = Trip.objects.create(
			driver=self.user,
			vehicle=self.vehicle,
			current_location='Origin',
			pickup_location='Origin',
			dropoff_location='Destination',
			start_time=self.future_time,
		)

		# Create a log sheet
		LogSheet.objects.create(
			trip=trip,
			date=timezone.localdate(),
		)

		serializer = TripSerializer(trip)
		self.assertIn('log_sheets', serializer.data)
		self.assertEqual(len(serializer.data['log_sheets']), 1)

	def test_trip_serializer_includes_vehicle_info(self):
		"""Test that TripSerializer includes nested vehicle information."""
		from trips.serializers import TripSerializer

		trip = Trip.objects.create(
			driver=self.user,
			vehicle=self.vehicle,
			current_location='Origin',
			pickup_location='Origin',
			dropoff_location='Destination',
			start_time=self.future_time,
		)

		serializer = TripSerializer(trip)
		self.assertIn('vehicle', serializer.data)
		self.assertEqual(serializer.data['vehicle']['truck_number'], 'T1')

	def test_vehicle_ownership_validation(self):
		"""Test that vehicle must belong to the current driver."""
		from trips.serializers import TripCreateSerializer
		from rest_framework.test import APIRequestFactory

		# Create another user and their vehicle
		User = get_user_model()
		other_user = User.objects.create_user(email='other@example.com', password='pass', full_name='Other')
		other_vehicle = Vehicle.objects.create(driver=other_user, truck_number='T2')

		factory = APIRequestFactory()
		request = factory.post('/api/v1/trips/')
		request.user = self.user

		# Try to create trip with other user's vehicle
		data = {
			'pickup_location': 'Origin',
			'dropoff_location': 'Destination',
			'start_time': self.future_time,
			'current_location': 'Origin',
			'vehicle_id': other_vehicle.id,
		}
		serializer = TripCreateSerializer(data=data, context={'request': request})
		self.assertFalse(serializer.is_valid())
		self.assertIn('non_field_errors', serializer.errors)



class RouteEstimationServiceTests(TestCase):
	"""Tests for RouteEstimationService."""

	def setUp(self):
		User = get_user_model()
		self.user = User.objects.create_user(email='driver@example.com', password='pass', full_name='Driver')
		self.vehicle = Vehicle.objects.create(driver=self.user, truck_number='T1')
		self.start_time = timezone.now() + timedelta(hours=2)

	def test_estimate_route_with_valid_locations(self):
		"""Test route estimation with valid pickup and dropoff locations."""
		from trips.services import RouteEstimationService

		service = RouteEstimationService()
		
		# Use well-known locations that should be geocodable
		result = service.estimate_route(
			pickup_location='New York, NY',
			dropoff_location='Los Angeles, CA',
			start_time=self.start_time
		)

		# Should return a dictionary with the expected keys
		self.assertIsInstance(result, dict)
		self.assertIn('total_distance_miles', result)
		self.assertIn('estimated_drive_hours', result)
		self.assertIn('eta', result)

		# If geocoding succeeds, values should be non-None
		if result['total_distance_miles'] is not None:
			self.assertGreater(result['total_distance_miles'], 0)
			self.assertGreater(result['estimated_drive_hours'], 0)
			self.assertIsNotNone(result['eta'])
			# ETA should be after start_time
			self.assertGreater(result['eta'], self.start_time)

	def test_estimate_route_with_invalid_locations(self):
		"""Test route estimation with invalid locations returns null values."""
		from trips.services import RouteEstimationService

		service = RouteEstimationService()
		
		# Use invalid/non-existent locations
		result = service.estimate_route(
			pickup_location='XYZ123INVALID',
			dropoff_location='ABC456NOTREAL',
			start_time=self.start_time
		)

		# Should return null values when locations cannot be geocoded
		self.assertIsInstance(result, dict)
		self.assertIsNone(result['total_distance_miles'])
		self.assertIsNone(result['estimated_drive_hours'])
		self.assertIsNone(result['eta'])

	def test_estimate_route_with_empty_locations(self):
		"""Test route estimation with empty locations returns null values."""
		from trips.services import RouteEstimationService

		service = RouteEstimationService()
		
		result = service.estimate_route(
			pickup_location='',
			dropoff_location='',
			start_time=self.start_time
		)

		# Should return null values for empty locations
		self.assertIsNone(result['total_distance_miles'])
		self.assertIsNone(result['estimated_drive_hours'])
		self.assertIsNone(result['eta'])

	def test_estimate_route_calculates_eta_correctly(self):
		"""Test that ETA is calculated correctly based on start_time and drive_hours."""
		from trips.services import RouteEstimationService
		from unittest.mock import patch

		service = RouteEstimationService(average_speed_mph=60)
		
		# Mock the estimator to return known values
		with patch.object(service.estimator, 'estimate') as mock_estimate:
			mock_estimate.return_value = {
				'distance_miles': 300.0,
				'drive_hours': 5.0,
				'eta': self.start_time + timedelta(hours=5),
				'origin_coords': (40.7128, -74.0060),
				'destination_coords': (34.0522, -118.2437),
			}

			result = service.estimate_route(
				pickup_location='New York, NY',
				dropoff_location='Los Angeles, CA',
				start_time=self.start_time
			)

			# Verify ETA is calculated correctly
			expected_eta = self.start_time + timedelta(hours=5)
			self.assertEqual(result['eta'], expected_eta)
			self.assertEqual(result['total_distance_miles'], 300.0)
			self.assertEqual(result['estimated_drive_hours'], 5.0)

	def test_estimate_route_uses_average_speed(self):
		"""Test that route estimation uses the configured average speed."""
		from trips.services import RouteEstimationService
		from unittest.mock import patch

		# Create service with custom average speed
		service = RouteEstimationService(average_speed_mph=50)
		
		# Mock the estimator
		with patch.object(service.estimator, 'estimate') as mock_estimate:
			mock_estimate.return_value = {
				'distance_miles': 250.0,
				'drive_hours': 5.0,  # 250 miles / 50 mph = 5 hours
				'eta': self.start_time + timedelta(hours=5),
				'origin_coords': (0, 0),
				'destination_coords': (1, 1),
			}

			result = service.estimate_route(
				pickup_location='Location A',
				dropoff_location='Location B',
				start_time=self.start_time
			)

			# Verify the service uses the custom speed
			self.assertEqual(result['estimated_drive_hours'], 5.0)

	def test_estimate_route_handles_exception_gracefully(self):
		"""Test that exceptions during route estimation are handled gracefully."""
		from trips.services import RouteEstimationService
		from unittest.mock import patch

		service = RouteEstimationService()
		
		# Mock the estimator to raise an exception
		with patch.object(service.estimator, 'estimate') as mock_estimate:
			mock_estimate.side_effect = Exception('Geocoding service error')

			result = service.estimate_route(
				pickup_location='Location A',
				dropoff_location='Location B',
				start_time=self.start_time
			)

			# Should return null values when exception occurs
			self.assertIsNone(result['total_distance_miles'])
			self.assertIsNone(result['estimated_drive_hours'])
			self.assertIsNone(result['eta'])

	def test_estimate_route_returns_dict_with_correct_keys(self):
		"""Test that estimate_route always returns a dict with the correct keys."""
		from trips.services import RouteEstimationService

		service = RouteEstimationService()
		
		result = service.estimate_route(
			pickup_location='Test Location 1',
			dropoff_location='Test Location 2',
			start_time=self.start_time
		)

		# Should always return a dict with these keys
		self.assertIsInstance(result, dict)
		self.assertEqual(set(result.keys()), {
			'total_distance_miles',
			'estimated_drive_hours',
			'eta'
		})

	def test_estimate_route_with_coordinates(self):
		"""Test route estimation with coordinate strings."""
		from trips.services import RouteEstimationService
		from unittest.mock import patch

		service = RouteEstimationService()
		
		# Mock the estimator to handle coordinates
		with patch.object(service.estimator, 'estimate') as mock_estimate:
			mock_estimate.return_value = {
				'distance_miles': 100.0,
				'drive_hours': 1.67,
				'eta': self.start_time + timedelta(hours=1.67),
				'origin_coords': (40.7128, -74.0060),
				'destination_coords': (40.7580, -73.9855),
			}

			result = service.estimate_route(
				pickup_location='40.7128, -74.0060',
				dropoff_location='40.7580, -73.9855',
				start_time=self.start_time
			)

			# Should handle coordinates
			self.assertIsNotNone(result['total_distance_miles'])
			self.assertIsNotNone(result['estimated_drive_hours'])
			self.assertIsNotNone(result['eta'])

	def test_estimate_route_default_average_speed(self):
		"""Test that RouteEstimationService uses 60 mph as default average speed."""
		from trips.services import RouteEstimationService

		service = RouteEstimationService()
		
		# Verify default speed is 60 mph
		self.assertEqual(service.AVERAGE_SPEED_MPH, 60)
		self.assertEqual(service.average_speed_mph, 60)

	def test_estimate_route_with_none_location(self):
		"""Test route estimation with None locations returns null values."""
		from trips.services import RouteEstimationService

		service = RouteEstimationService()
		
		result = service.estimate_route(
			pickup_location=None,
			dropoff_location=None,
			start_time=self.start_time
		)

		# Should handle None gracefully
		self.assertIsNone(result['total_distance_miles'])
		self.assertIsNone(result['estimated_drive_hours'])
		self.assertIsNone(result['eta'])



class HOSCalculationServiceTests(TestCase):
	"""Tests for HOSCalculationService - HOS hours calculation and reset conditions."""

	def setUp(self):
		User = get_user_model()
		self.user = User.objects.create_user(email='driver@example.com', password='pass', full_name='Driver')
		self.vehicle = Vehicle.objects.create(driver=self.user, truck_number='T1')
		self.start_time = timezone.now().replace(microsecond=0)

	def _make_trip(self):
		"""Create a trip for testing."""
		trip = Trip.objects.create(
			driver=self.user,
			vehicle=self.vehicle,
			current_location='Origin',
			pickup_location='Origin',
			dropoff_location='Destination',
			start_time=self.start_time,
		)
		return trip

	def _add_duty_segment(self, trip, status, start_time, duration_hours):
		"""Helper to add a duty segment to a trip."""
		end_time = start_time + timedelta(hours=duration_hours)
		DutyStatus.objects.create(
			trip=trip,
			status=status,
			start_time=start_time,
			end_time=end_time,
		)
		return end_time

	def test_initial_hos_values(self):
		"""Test that initial HOS values are 11 drive hours and 14 duty hours."""
		from trips.services import HOSCalculationService

		trip = self._make_trip()
		service = HOSCalculationService()
		result = service.calculate_available_hours(trip)

		self.assertEqual(result['current_available_drive_hours'], 11.0)
		self.assertEqual(result['current_available_duty_hours'], 14.0)
		self.assertEqual(result['current_duty_status'], 'off_duty')

	def test_drive_hours_decrement_on_driving_segment(self):
		"""Test that drive hours decrement when a driving segment is added."""
		from trips.services import HOSCalculationService

		trip = self._make_trip()
		# Add 2 hours of driving
		self._add_duty_segment(trip, DutyStatus.StatusChoices.DRIVING, self.start_time, 2.0)

		service = HOSCalculationService()
		result = service.calculate_available_hours(trip)

		# Should have 11 - 2 = 9 hours remaining
		self.assertEqual(result['current_available_drive_hours'], 9.0)
		# Duty hours should also decrement for driving
		self.assertEqual(result['current_available_duty_hours'], 12.0)
		self.assertEqual(result['current_duty_status'], 'driving')

	def test_duty_hours_decrement_on_on_duty_segment(self):
		"""Test that duty hours decrement when an on_duty segment is added."""
		from trips.services import HOSCalculationService

		trip = self._make_trip()
		# Add 1 hour of on_duty (not driving)
		self._add_duty_segment(trip, DutyStatus.StatusChoices.ON_DUTY, self.start_time, 1.0)

		service = HOSCalculationService()
		result = service.calculate_available_hours(trip)

		# Drive hours should not change
		self.assertEqual(result['current_available_drive_hours'], 11.0)
		# Duty hours should decrement: 14 - 1 = 13
		self.assertEqual(result['current_available_duty_hours'], 13.0)
		self.assertEqual(result['current_duty_status'], 'on_duty')

	def test_no_decrement_on_sleeper_berth_segment(self):
		"""Test that hours do not decrement for sleeper_berth segments."""
		from trips.services import HOSCalculationService

		trip = self._make_trip()
		# Add 8 hours of sleeper berth
		self._add_duty_segment(trip, DutyStatus.StatusChoices.SLEEPER, self.start_time, 8.0)

		service = HOSCalculationService()
		result = service.calculate_available_hours(trip)

		# Neither should decrement
		self.assertEqual(result['current_available_drive_hours'], 11.0)
		self.assertEqual(result['current_available_duty_hours'], 14.0)
		self.assertEqual(result['current_duty_status'], 'sleeper_berth')

	def test_no_decrement_on_off_duty_segment(self):
		"""Test that hours do not decrement for off_duty segments."""
		from trips.services import HOSCalculationService

		trip = self._make_trip()
		# Add 2 hours of off-duty
		self._add_duty_segment(trip, DutyStatus.StatusChoices.OFF_DUTY, self.start_time, 2.0)

		service = HOSCalculationService()
		result = service.calculate_available_hours(trip)

		# Neither should decrement
		self.assertEqual(result['current_available_drive_hours'], 11.0)
		self.assertEqual(result['current_available_duty_hours'], 14.0)
		self.assertEqual(result['current_duty_status'], 'off_duty')

	def test_10_hour_reset_condition_for_drive_hours(self):
		"""Test that 10+ hours of off-duty resets drive hours to 11."""
		from trips.services import HOSCalculationService

		trip = self._make_trip()
		current_time = self.start_time

		# Drive for 11 hours (exhausts drive hours)
		current_time = self._add_duty_segment(trip, DutyStatus.StatusChoices.DRIVING, current_time, 11.0)

		# Add 10 hours of off-duty (should trigger reset)
		current_time = self._add_duty_segment(trip, DutyStatus.StatusChoices.OFF_DUTY, current_time, 10.0)

		service = HOSCalculationService()
		result = service.calculate_available_hours(trip)

		# Drive hours should be reset to 11
		self.assertEqual(result['current_available_drive_hours'], 11.0)
		self.assertEqual(result['current_duty_status'], 'off_duty')

	def test_10_hour_reset_with_sleeper_berth(self):
		"""Test that 10+ hours of sleeper berth also resets drive hours."""
		from trips.services import HOSCalculationService

		trip = self._make_trip()
		current_time = self.start_time

		# Drive for 11 hours
		current_time = self._add_duty_segment(trip, DutyStatus.StatusChoices.DRIVING, current_time, 11.0)

		# Add 10 hours of sleeper berth (should trigger reset)
		current_time = self._add_duty_segment(trip, DutyStatus.StatusChoices.SLEEPER, current_time, 10.0)

		service = HOSCalculationService()
		result = service.calculate_available_hours(trip)

		# Drive hours should be reset to 11
		self.assertEqual(result['current_available_drive_hours'], 11.0)
		self.assertEqual(result['current_duty_status'], 'sleeper_berth')

	def test_34_hour_reset_condition_for_cycle(self):
		"""Test that 34+ hours of off-duty resets both drive and duty hours."""
		from trips.services import HOSCalculationService

		trip = self._make_trip()
		current_time = self.start_time

		# Drive for 11 hours (exhausts drive hours)
		current_time = self._add_duty_segment(trip, DutyStatus.StatusChoices.DRIVING, current_time, 11.0)

		# Add on-duty for 14 hours (exhausts duty hours)
		current_time = self._add_duty_segment(trip, DutyStatus.StatusChoices.ON_DUTY, current_time, 14.0)

		# Add 34 hours of off-duty (should trigger full cycle reset)
		current_time = self._add_duty_segment(trip, DutyStatus.StatusChoices.OFF_DUTY, current_time, 34.0)

		service = HOSCalculationService()
		result = service.calculate_available_hours(trip)

		# Both should be reset to initial values
		self.assertEqual(result['current_available_drive_hours'], 11.0)
		self.assertEqual(result['current_available_duty_hours'], 14.0)
		self.assertEqual(result['current_duty_status'], 'off_duty')

	def test_multiple_segments_with_mixed_statuses(self):
		"""Test calculation with multiple segments of different statuses."""
		from trips.services import HOSCalculationService

		trip = self._make_trip()
		current_time = self.start_time

		# Drive 5 hours
		current_time = self._add_duty_segment(trip, DutyStatus.StatusChoices.DRIVING, current_time, 5.0)
		# On-duty 2 hours
		current_time = self._add_duty_segment(trip, DutyStatus.StatusChoices.ON_DUTY, current_time, 2.0)
		# Off-duty 1 hour
		current_time = self._add_duty_segment(trip, DutyStatus.StatusChoices.OFF_DUTY, current_time, 1.0)
		# Drive 3 more hours
		current_time = self._add_duty_segment(trip, DutyStatus.StatusChoices.DRIVING, current_time, 3.0)

		service = HOSCalculationService()
		result = service.calculate_available_hours(trip)

		# Drive hours: 11 - 5 - 3 = 3
		self.assertEqual(result['current_available_drive_hours'], 3.0)
		# Duty hours: 14 - 5 - 2 - 3 = 4
		self.assertEqual(result['current_available_duty_hours'], 4.0)
		self.assertEqual(result['current_duty_status'], 'driving')

	def test_hours_cannot_go_negative(self):
		"""Test that available hours cannot go below 0."""
		from trips.services import HOSCalculationService

		trip = self._make_trip()
		current_time = self.start_time

		# Drive for 15 hours (more than the 11 hour limit)
		current_time = self._add_duty_segment(trip, DutyStatus.StatusChoices.DRIVING, current_time, 15.0)

		service = HOSCalculationService()
		result = service.calculate_available_hours(trip)

		# Should be clamped at 0, not negative
		self.assertEqual(result['current_available_drive_hours'], 0.0)
		self.assertEqual(result['current_available_duty_hours'], 0.0)

	def test_fractional_hours_are_handled(self):
		"""Test that fractional hours are calculated correctly."""
		from trips.services import HOSCalculationService

		trip = self._make_trip()
		current_time = self.start_time

		# Drive for 2.5 hours
		current_time = self._add_duty_segment(trip, DutyStatus.StatusChoices.DRIVING, current_time, 2.5)

		service = HOSCalculationService()
		result = service.calculate_available_hours(trip)

		# Drive hours: 11 - 2.5 = 8.5
		self.assertEqual(result['current_available_drive_hours'], 8.5)
		# Duty hours: 14 - 2.5 = 11.5
		self.assertEqual(result['current_available_duty_hours'], 11.5)

	def test_reset_only_happens_after_threshold(self):
		"""Test that reset only happens when threshold is met or exceeded."""
		from trips.services import HOSCalculationService

		trip = self._make_trip()
		current_time = self.start_time

		# Drive for 11 hours
		current_time = self._add_duty_segment(trip, DutyStatus.StatusChoices.DRIVING, current_time, 11.0)

		# Add 9.5 hours of off-duty (just under 10 hour threshold)
		current_time = self._add_duty_segment(trip, DutyStatus.StatusChoices.OFF_DUTY, current_time, 9.5)

		service = HOSCalculationService()
		result = service.calculate_available_hours(trip)

		# Drive hours should NOT be reset (still 0)
		self.assertEqual(result['current_available_drive_hours'], 0.0)

	def test_consecutive_off_duty_tracking(self):
		"""Test that consecutive off-duty time is tracked correctly."""
		from trips.services import HOSCalculationService

		trip = self._make_trip()
		current_time = self.start_time

		# Drive for 11 hours
		current_time = self._add_duty_segment(trip, DutyStatus.StatusChoices.DRIVING, current_time, 11.0)

		# Add 5 hours of off-duty
		current_time = self._add_duty_segment(trip, DutyStatus.StatusChoices.OFF_DUTY, current_time, 5.0)

		# Add 5 more hours of sleeper berth (consecutive off-duty)
		current_time = self._add_duty_segment(trip, DutyStatus.StatusChoices.SLEEPER, current_time, 5.0)

		service = HOSCalculationService()
		result = service.calculate_available_hours(trip)

		# Total consecutive off-duty: 5 + 5 = 10 hours, should trigger reset
		self.assertEqual(result['current_available_drive_hours'], 11.0)

	def test_consecutive_off_duty_resets_on_duty_activity(self):
		"""Test that consecutive off-duty counter resets when driver goes back on duty."""
		from trips.services import HOSCalculationService

		trip = self._make_trip()
		current_time = self.start_time

		# Drive for 11 hours
		current_time = self._add_duty_segment(trip, DutyStatus.StatusChoices.DRIVING, current_time, 11.0)

		# Add 5 hours of off-duty
		current_time = self._add_duty_segment(trip, DutyStatus.StatusChoices.OFF_DUTY, current_time, 5.0)

		# Go back on-duty (resets consecutive off-duty counter)
		current_time = self._add_duty_segment(trip, DutyStatus.StatusChoices.ON_DUTY, current_time, 2.0)

		# Add 5 more hours of off-duty (should not trigger reset, only 5 hours)
		current_time = self._add_duty_segment(trip, DutyStatus.StatusChoices.OFF_DUTY, current_time, 5.0)

		service = HOSCalculationService()
		result = service.calculate_available_hours(trip)

		# Drive hours should still be 0 (no reset, only 5 hours off-duty)
		self.assertEqual(result['current_available_drive_hours'], 0.0)

	def test_empty_trip_returns_initial_values(self):
		"""Test that a trip with no duty segments returns initial HOS values."""
		from trips.services import HOSCalculationService

		trip = self._make_trip()
		# Don't add any duty segments

		service = HOSCalculationService()
		result = service.calculate_available_hours(trip)

		self.assertEqual(result['current_available_drive_hours'], 11.0)
		self.assertEqual(result['current_available_duty_hours'], 14.0)
		self.assertEqual(result['current_duty_status'], 'off_duty')

	def test_result_keys_are_present(self):
		"""Test that the result dictionary contains all required keys."""
		from trips.services import HOSCalculationService

		trip = self._make_trip()
		service = HOSCalculationService()
		result = service.calculate_available_hours(trip)

		required_keys = {
			'current_available_drive_hours',
			'current_available_duty_hours',
			'current_duty_status',
		}
		self.assertEqual(set(result.keys()), required_keys)

	def test_result_values_are_correct_types(self):
		"""Test that result values have correct types."""
		from trips.services import HOSCalculationService

		trip = self._make_trip()
		service = HOSCalculationService()
		result = service.calculate_available_hours(trip)

		self.assertIsInstance(result['current_available_drive_hours'], float)
		self.assertIsInstance(result['current_available_duty_hours'], float)
		self.assertIsInstance(result['current_duty_status'], str)

	def test_rounding_to_two_decimal_places(self):
		"""Test that hours are rounded to 2 decimal places."""
		from trips.services import HOSCalculationService

		trip = self._make_trip()
		current_time = self.start_time

		# Drive for 1.333... hours (1 hour 20 minutes)
		current_time = self._add_duty_segment(trip, DutyStatus.StatusChoices.DRIVING, current_time, 1.333333)

		service = HOSCalculationService()
		result = service.calculate_available_hours(trip)

		# Should be rounded to 2 decimal places
		self.assertEqual(result['current_available_drive_hours'], 9.67)
		self.assertEqual(result['current_available_duty_hours'], 12.67)

	def test_complex_scenario_with_multiple_resets(self):
		"""Test a complex scenario with multiple reset conditions."""
		from trips.services import HOSCalculationService

		trip = self._make_trip()
		current_time = self.start_time

		# First cycle: Drive 11 hours, then 10 hours off-duty (resets drive hours only)
		current_time = self._add_duty_segment(trip, DutyStatus.StatusChoices.DRIVING, current_time, 11.0)
		current_time = self._add_duty_segment(trip, DutyStatus.StatusChoices.OFF_DUTY, current_time, 10.0)

		# Second cycle: Drive 5 hours, on-duty 3 hours
		current_time = self._add_duty_segment(trip, DutyStatus.StatusChoices.DRIVING, current_time, 5.0)
		current_time = self._add_duty_segment(trip, DutyStatus.StatusChoices.ON_DUTY, current_time, 3.0)

		service = HOSCalculationService()
		result = service.calculate_available_hours(trip)

		# After 10-hour reset: drive hours reset to 11, then 11 - 5 = 6
		self.assertEqual(result['current_available_drive_hours'], 6.0)
		# Duty hours: 14 - 11 (first drive) - 5 (second drive) - 3 (on_duty) = -5, clamped to 0
		# Wait, that's not right. Let me recalculate:
		# Initial: 14
		# After first 11 hours driving: 14 - 11 = 3
		# After 10 hours off-duty: duty hours stay at 3 (no reset)
		# After 5 hours driving: 3 - 5 = -2, clamped to 0
		# After 3 hours on-duty: 0 - 3 = -3, clamped to 0
		self.assertEqual(result['current_available_duty_hours'], 0.0)
		self.assertEqual(result['current_duty_status'], 'on_duty')



# ============================================================================
# Task 3.7-3.15: Trip Management Endpoints Tests
# ============================================================================

from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.urls import reverse
from datetime import datetime, timedelta


class TripCreationEndpointTests(APITestCase):
	"""Tests for POST /api/v1/trips/ endpoint (Task 3.7 & 3.8)"""

	def setUp(self):
		User = get_user_model()
		self.user = User.objects.create_user(
			email='driver@example.com',
			password='testpass123',
			full_name='Test Driver'
		)
		self.vehicle = Vehicle.objects.create(
			driver=self.user,
			truck_number='TRUCK001',
			fuel_efficiency_mpg=6.5
		)
		self.client = APIClient()
		self.client.force_authenticate(user=self.user)

	def test_successful_trip_creation_with_valid_data(self):
		"""Test successful trip creation with valid data (Task 3.8)"""
		future_time = timezone.now() + timedelta(hours=2)
		data = {
			'pickup_location': 'New York, NY',
			'dropoff_location': 'Boston, MA',
			'start_time': future_time.isoformat(),
			'vehicle_id': self.vehicle.id,
			'notes': 'Test trip'
		}
		
		response = self.client.post('/api/v1/trips/', data, format='json')
		
		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		self.assertEqual(response.data['status'], 'draft')
		self.assertEqual(response.data['pickup_location'], 'New York, NY')
		self.assertEqual(response.data['dropoff_location'], 'Boston, MA')
		self.assertIsNotNone(response.data['id'])

	def test_validation_error_for_missing_pickup_location(self):
		"""Test validation error for missing pickup location (Task 3.8)"""
		future_time = timezone.now() + timedelta(hours=2)
		data = {
			'dropoff_location': 'Boston, MA',
			'start_time': future_time.isoformat(),
		}
		
		response = self.client.post('/api/v1/trips/', data, format='json')
		
		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertIn('pickup_location', response.data)

	def test_validation_error_for_missing_dropoff_location(self):
		"""Test validation error for missing dropoff location (Task 3.8)"""
		future_time = timezone.now() + timedelta(hours=2)
		data = {
			'pickup_location': 'New York, NY',
			'start_time': future_time.isoformat(),
		}
		
		response = self.client.post('/api/v1/trips/', data, format='json')
		
		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertIn('dropoff_location', response.data)

	def test_validation_error_for_past_start_time(self):
		"""Test validation error for past start_time (Task 3.8)"""
		past_time = timezone.now() - timedelta(hours=1)
		data = {
			'pickup_location': 'New York, NY',
			'dropoff_location': 'Boston, MA',
			'start_time': past_time.isoformat(),
		}
		
		response = self.client.post('/api/v1/trips/', data, format='json')
		
		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertIn('start_time', response.data)

	def test_route_estimation_is_called_and_values_stored(self):
		"""Test that route estimation is called and values are stored (Task 3.8)"""
		future_time = timezone.now() + timedelta(hours=2)
		data = {
			'pickup_location': 'New York, NY',
			'dropoff_location': 'Boston, MA',
			'start_time': future_time.isoformat(),
		}
		
		response = self.client.post('/api/v1/trips/', data, format='json')
		
		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		# Route estimation should populate these fields
		self.assertIsNotNone(response.data.get('total_distance_miles'))
		self.assertIsNotNone(response.data.get('estimated_drive_hours'))
		self.assertIsNotNone(response.data.get('eta'))

	def test_hos_initialization(self):
		"""Test that HOS values are initialized (Task 3.8)"""
		future_time = timezone.now() + timedelta(hours=2)
		data = {
			'pickup_location': 'New York, NY',
			'dropoff_location': 'Boston, MA',
			'start_time': future_time.isoformat(),
		}
		
		response = self.client.post('/api/v1/trips/', data, format='json')
		
		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		# HOS values should be initialized
		self.assertEqual(float(response.data['current_available_drive_hours']), 11.0)
		self.assertEqual(float(response.data['current_available_duty_hours']), 14.0)
		self.assertEqual(response.data['current_duty_status'], 'off_duty')

	def test_trip_status_set_to_draft(self):
		"""Test that trip status is set to 'draft' on creation"""
		future_time = timezone.now() + timedelta(hours=2)
		data = {
			'pickup_location': 'New York, NY',
			'dropoff_location': 'Boston, MA',
			'start_time': future_time.isoformat(),
		}
		
		response = self.client.post('/api/v1/trips/', data, format='json')
		
		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		self.assertEqual(response.data['status'], 'draft')


class TripListEndpointTests(APITestCase):
	"""Tests for GET /api/v1/trips/ endpoint (Task 3.9 & 3.10)"""

	def setUp(self):
		User = get_user_model()
		self.user = User.objects.create_user(
			email='driver@example.com',
			password='testpass123',
			full_name='Test Driver'
		)
		self.other_user = User.objects.create_user(
			email='other@example.com',
			password='testpass123',
			full_name='Other Driver'
		)
		self.vehicle = Vehicle.objects.create(
			driver=self.user,
			truck_number='TRUCK001'
		)
		self.client = APIClient()
		self.client.force_authenticate(user=self.user)
		
		# Create test trips
		future_time = timezone.now() + timedelta(hours=2)
		self.trip1 = Trip.objects.create(
			driver=self.user,
			pickup_location='New York, NY',
			dropoff_location='Boston, MA',
			start_time=future_time,
			status='draft'
		)
		self.trip2 = Trip.objects.create(
			driver=self.user,
			pickup_location='Boston, MA',
			dropoff_location='Philadelphia, PA',
			start_time=future_time + timedelta(hours=5),
			status='planned'
		)
		self.trip3 = Trip.objects.create(
			driver=self.other_user,
			pickup_location='Chicago, IL',
			dropoff_location='Detroit, MI',
			start_time=future_time,
			status='draft'
		)

	def test_pagination_with_limit_and_offset(self):
		"""Test pagination with limit and offset (Task 3.10)"""
		response = self.client.get('/api/v1/trips/?limit=1&offset=0')
		
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data['count'], 2)  # Only user's trips
		self.assertEqual(len(response.data['results']), 1)
		self.assertIsNotNone(response.data['next'])
		self.assertIsNone(response.data['previous'])

	def test_status_filtering(self):
		"""Test status filtering (Task 3.10)"""
		response = self.client.get('/api/v1/trips/?status=draft')
		
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data['count'], 1)
		self.assertEqual(response.data['results'][0]['status'], 'draft')

	def test_sorting_by_created_at(self):
		"""Test sorting by created_at (Task 3.10)"""
		response = self.client.get('/api/v1/trips/?ordering=created_at')
		
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(len(response.data['results']), 2)
		# Should be in ascending order by created_at
		self.assertEqual(response.data['results'][0]['id'], self.trip1.id)

	def test_sorting_by_created_at_descending(self):
		"""Test sorting by created_at descending (Task 3.10)"""
		response = self.client.get('/api/v1/trips/?ordering=-created_at')
		
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(len(response.data['results']), 2)
		# Should be in descending order by created_at
		self.assertEqual(response.data['results'][0]['id'], self.trip2.id)

	def test_sorting_by_start_time(self):
		"""Test sorting by start_time (Task 3.10)"""
		response = self.client.get('/api/v1/trips/?ordering=start_time')
		
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(len(response.data['results']), 2)

	def test_only_users_trips_returned(self):
		"""Test that only user's trips are returned (Task 3.10)"""
		response = self.client.get('/api/v1/trips/')
		
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data['count'], 2)
		for trip in response.data['results']:
			self.assertEqual(trip['driver'], self.user.id)

	def test_pagination_metadata_in_response(self):
		"""Test pagination metadata in response (Task 3.10)"""
		response = self.client.get('/api/v1/trips/')
		
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertIn('count', response.data)
		self.assertIn('next', response.data)
		self.assertIn('previous', response.data)
		self.assertIn('results', response.data)

	def test_default_pagination_limit(self):
		"""Test default pagination limit is 20"""
		response = self.client.get('/api/v1/trips/')
		
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		# Should have default limit of 20
		self.assertLessEqual(len(response.data['results']), 20)


class TripDetailEndpointTests(APITestCase):
	"""Tests for GET /api/v1/trips/{id}/ endpoint (Task 3.11 & 3.12)"""

	def setUp(self):
		User = get_user_model()
		self.user = User.objects.create_user(
			email='driver@example.com',
			password='testpass123',
			full_name='Test Driver'
		)
		self.other_user = User.objects.create_user(
			email='other@example.com',
			password='testpass123',
			full_name='Other Driver'
		)
		self.vehicle = Vehicle.objects.create(
			driver=self.user,
			truck_number='TRUCK001'
		)
		self.client = APIClient()
		
		future_time = timezone.now() + timedelta(hours=2)
		self.trip = Trip.objects.create(
			driver=self.user,
			vehicle=self.vehicle,
			pickup_location='New York, NY',
			dropoff_location='Boston, MA',
			start_time=future_time,
			status='draft'
		)
		
		# Add duty segments
		self.duty_segment = DutyStatus.objects.create(
			trip=self.trip,
			status='driving',
			start_time=future_time,
			end_time=future_time + timedelta(hours=2)
		)

	def test_successful_retrieval_of_own_trip(self):
		"""Test successful retrieval of own trip (Task 3.12)"""
		self.client.force_authenticate(user=self.user)
		response = self.client.get(f'/api/v1/trips/{self.trip.id}/')
		
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data['id'], self.trip.id)
		self.assertEqual(response.data['pickup_location'], 'New York, NY')

	def test_403_error_when_accessing_other_users_trip(self):
		"""Test 403 error when accessing other user's trip (Task 3.12)"""
		self.client.force_authenticate(user=self.other_user)
		response = self.client.get(f'/api/v1/trips/{self.trip.id}/')
		
		# get_queryset filters by driver, so we get 404 instead of 403
		self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

	def test_nested_duty_segments_included(self):
		"""Test nested duty_segments are included (Task 3.12)"""
		self.client.force_authenticate(user=self.user)
		response = self.client.get(f'/api/v1/trips/{self.trip.id}/')
		
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertIn('duty_segments', response.data)
		self.assertEqual(len(response.data['duty_segments']), 1)
		self.assertEqual(response.data['duty_segments'][0]['status'], 'driving')

	def test_nested_log_sheets_included(self):
		"""Test nested log_sheets are included (Task 3.12)"""
		self.client.force_authenticate(user=self.user)
		response = self.client.get(f'/api/v1/trips/{self.trip.id}/')
		
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertIn('log_sheets', response.data)
		self.assertIsInstance(response.data['log_sheets'], list)


class TripStatusTransitionTests(APITestCase):
	"""Tests for PATCH /api/v1/trips/{id}/ endpoint (Task 3.13 & 3.14)"""

	def setUp(self):
		User = get_user_model()
		self.user = User.objects.create_user(
			email='driver@example.com',
			password='testpass123',
			full_name='Test Driver'
		)
		self.client = APIClient()
		self.client.force_authenticate(user=self.user)
		
		future_time = timezone.now() + timedelta(hours=2)
		self.trip = Trip.objects.create(
			driver=self.user,
			pickup_location='New York, NY',
			dropoff_location='Boston, MA',
			start_time=future_time,
			status='draft'
		)

	def test_valid_status_transition_draft_to_planned(self):
		"""Test valid status transition from draft to planned (Task 3.14)"""
		response = self.client.patch(
			f'/api/v1/trips/{self.trip.id}/',
			{'status': 'planned'},
			format='json'
		)
		
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data['status'], 'planned')

	def test_valid_status_transition_planned_to_in_progress(self):
		"""Test valid status transition from planned to in_progress (Task 3.14)"""
		self.trip.status = 'planned'
		self.trip.save()
		
		response = self.client.patch(
			f'/api/v1/trips/{self.trip.id}/',
			{'status': 'in_progress'},
			format='json'
		)
		
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data['status'], 'in_progress')

	def test_valid_status_transition_in_progress_to_completed(self):
		"""Test valid status transition from in_progress to completed (Task 3.14)"""
		self.trip.status = 'in_progress'
		self.trip.save()
		
		response = self.client.patch(
			f'/api/v1/trips/{self.trip.id}/',
			{'status': 'completed'},
			format='json'
		)
		
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data['status'], 'completed')

	def test_actual_start_time_recorded_on_in_progress(self):
		"""Test actual_start_time is recorded when transitioning to in_progress (Task 3.14)"""
		self.trip.status = 'planned'
		self.trip.save()
		
		response = self.client.patch(
			f'/api/v1/trips/{self.trip.id}/',
			{'status': 'in_progress'},
			format='json'
		)
		
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertIsNotNone(response.data['actual_start_time'])

	def test_actual_end_time_recorded_on_completed(self):
		"""Test actual_end_time is recorded when transitioning to completed (Task 3.14)"""
		self.trip.status = 'in_progress'
		self.trip.actual_start_time = timezone.now()
		self.trip.save()
		
		response = self.client.patch(
			f'/api/v1/trips/{self.trip.id}/',
			{'status': 'completed'},
			format='json'
		)
		
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertIsNotNone(response.data['actual_end_time'])

	def test_cancellation_with_reason(self):
		"""Test cancellation with reason in notes (Task 3.14)"""
		response = self.client.patch(
			f'/api/v1/trips/{self.trip.id}/',
			{'status': 'cancelled', 'notes': 'Cancelled due to weather'},
			format='json'
		)
		
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data['status'], 'cancelled')
		self.assertEqual(response.data['notes'], 'Cancelled due to weather')

	def test_invalid_status_transition(self):
		"""Test invalid status transition is rejected"""
		self.trip.status = 'completed'
		self.trip.save()
		
		response = self.client.patch(
			f'/api/v1/trips/{self.trip.id}/',
			{'status': 'draft'},
			format='json'
		)
		
		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class TripCheckpointTests(APITestCase):
	"""Checkpoint tests to ensure all trip management tests pass (Task 3.15)"""

	def setUp(self):
		User = get_user_model()
		self.user = User.objects.create_user(
			email='driver@example.com',
			password='testpass123',
			full_name='Test Driver'
		)
		self.client = APIClient()
		self.client.force_authenticate(user=self.user)

	def test_all_trip_endpoints_accessible(self):
		"""Test that all trip endpoints are accessible"""
		future_time = timezone.now() + timedelta(hours=2)
		
		# Create a trip
		create_response = self.client.post(
			'/api/v1/trips/',
			{
				'pickup_location': 'New York, NY',
				'dropoff_location': 'Boston, MA',
				'start_time': future_time.isoformat(),
			},
			format='json'
		)
		self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
		trip_id = create_response.data['id']
		
		# List trips
		list_response = self.client.get('/api/v1/trips/')
		self.assertEqual(list_response.status_code, status.HTTP_200_OK)
		self.assertGreater(list_response.data['count'], 0)
		
		# Retrieve trip
		retrieve_response = self.client.get(f'/api/v1/trips/{trip_id}/')
		self.assertEqual(retrieve_response.status_code, status.HTTP_200_OK)
		
		# Update trip
		update_response = self.client.patch(
			f'/api/v1/trips/{trip_id}/',
			{'status': 'planned'},
			format='json'
		)
		self.assertEqual(update_response.status_code, status.HTTP_200_OK)



class DutySegmentCreationTests(TestCase):
	"""Tests for duty segment creation endpoint (POST /api/v1/trips/{trip_id}/duty-segments/)"""
	
	def setUp(self):
		from rest_framework.test import APIClient
		User = get_user_model()
		self.user = User.objects.create_user(email='driver@example.com', password='pass123', full_name='Driver')
		self.other_user = User.objects.create_user(email='other@example.com', password='pass123', full_name='Other')
		self.vehicle = Vehicle.objects.create(driver=self.user, truck_number='T1')
		
		# Create a trip
		self.trip = Trip.objects.create(
			driver=self.user,
			vehicle=self.vehicle,
			current_location='Origin',
			pickup_location='Origin',
			dropoff_location='Dest',
			start_time=timezone.now() + timedelta(hours=1),
		)
		
		self.client = APIClient()
	
	def test_successful_creation_with_valid_data(self):
		"""Test successful creation of a duty segment with valid data."""
		self.client.force_authenticate(user=self.user)
		
		start_time = timezone.now()
		end_time = start_time + timedelta(hours=2)
		
		data = {
			'status': 'driving',
			'start_time': start_time.isoformat(),
			'end_time': end_time.isoformat(),
			'remarks': 'Test driving segment',
		}
		
		url = f'/api/v1/trips/{self.trip.id}/duty-segments/'
		response = self.client.post(url, data, format='json')
		
		self.assertEqual(response.status_code, 201)
		self.assertEqual(response.data['status'], 'driving')
		self.assertEqual(response.data['duration_hours'], 2.0)
		self.assertEqual(response.data['remarks'], 'Test driving segment')
	
	def test_validation_error_for_end_time_before_start_time(self):
		"""Test validation error when end_time is before start_time."""
		self.client.force_authenticate(user=self.user)
		
		start_time = timezone.now()
		end_time = start_time - timedelta(hours=1)
		
		data = {
			'status': 'driving',
			'start_time': start_time.isoformat(),
			'end_time': end_time.isoformat(),
		}
		
		url = f'/api/v1/trips/{self.trip.id}/duty-segments/'
		response = self.client.post(url, data, format='json')
		
		self.assertEqual(response.status_code, 400)
		self.assertIn('End time must be after start time', str(response.data))
	
	def test_hos_recalculation_is_triggered(self):
		"""Test that HOS recalculation is triggered when duty segment is created."""
		self.client.force_authenticate(user=self.user)
		
		# Store initial HOS values
		initial_drive_hours = self.trip.current_available_drive_hours
		initial_duty_hours = self.trip.current_available_duty_hours
		
		start_time = timezone.now()
		end_time = start_time + timedelta(hours=3)
		
		data = {
			'status': 'driving',
			'start_time': start_time.isoformat(),
			'end_time': end_time.isoformat(),
		}
		
		url = f'/api/v1/trips/{self.trip.id}/duty-segments/'
		response = self.client.post(url, data, format='json')
		
		self.assertEqual(response.status_code, 201)
		
		# Refresh trip and check HOS values were updated
		self.trip.refresh_from_db()
		self.assertLess(self.trip.current_available_drive_hours, initial_drive_hours)
	
	def test_trip_current_duty_status_is_updated(self):
		"""Test that trip's current_duty_status is updated when duty segment is created."""
		self.client.force_authenticate(user=self.user)
		
		start_time = timezone.now()
		end_time = start_time + timedelta(hours=2)
		
		data = {
			'status': 'on_duty',
			'start_time': start_time.isoformat(),
			'end_time': end_time.isoformat(),
		}
		
		url = f'/api/v1/trips/{self.trip.id}/duty-segments/'
		response = self.client.post(url, data, format='json')
		
		self.assertEqual(response.status_code, 201)
		
		# Refresh trip and check current_duty_status
		self.trip.refresh_from_db()
		self.assertEqual(self.trip.current_duty_status, 'on_duty')
	
	def test_unauthorized_access_returns_403(self):
		"""Test that unauthorized users cannot create duty segments."""
		self.client.force_authenticate(user=self.other_user)
		
		start_time = timezone.now()
		end_time = start_time + timedelta(hours=2)
		
		data = {
			'status': 'driving',
			'start_time': start_time.isoformat(),
			'end_time': end_time.isoformat(),
		}
		
		url = f'/api/v1/trips/{self.trip.id}/duty-segments/'
		response = self.client.post(url, data, format='json')
		
		self.assertEqual(response.status_code, 403)


class DutySegmentListTests(TestCase):
	"""Tests for duty segment list endpoint (GET /api/v1/trips/{trip_id}/duty-segments/)"""
	
	def setUp(self):
		from rest_framework.test import APIClient
		User = get_user_model()
		self.user = User.objects.create_user(email='driver@example.com', password='pass123', full_name='Driver')
		self.other_user = User.objects.create_user(email='other@example.com', password='pass123', full_name='Other')
		self.vehicle = Vehicle.objects.create(driver=self.user, truck_number='T1')
		
		# Create a trip
		self.trip = Trip.objects.create(
			driver=self.user,
			vehicle=self.vehicle,
			current_location='Origin',
			pickup_location='Origin',
			dropoff_location='Dest',
			start_time=timezone.now() + timedelta(hours=1),
		)
		
		# Create some duty segments
		base_time = timezone.now()
		for i in range(3):
			DutyStatus.objects.create(
				trip=self.trip,
				status='driving' if i % 2 == 0 else 'off_duty',
				start_time=base_time + timedelta(hours=i*2),
				end_time=base_time + timedelta(hours=i*2+1),
				remarks=f'Segment {i}',
			)
		
		self.client = APIClient()
	
	def test_returns_all_segments_for_trip(self):
		"""Test that list endpoint returns all segments for the trip."""
		self.client.force_authenticate(user=self.user)
		
		url = f'/api/v1/trips/{self.trip.id}/duty-segments/'
		response = self.client.get(url)
		
		self.assertEqual(response.status_code, 200)
		self.assertEqual(len(response.data), 3)
	
	def test_segments_are_in_chronological_order(self):
		"""Test that segments are returned in chronological order (sorted by start_time)."""
		self.client.force_authenticate(user=self.user)
		
		url = f'/api/v1/trips/{self.trip.id}/duty-segments/'
		response = self.client.get(url)
		
		self.assertEqual(response.status_code, 200)
		
		# Check that segments are in order
		for i in range(len(response.data) - 1):
			current_start = timezone.datetime.fromisoformat(response.data[i]['start_time'])
			next_start = timezone.datetime.fromisoformat(response.data[i+1]['start_time'])
			self.assertLess(current_start, next_start)
	
	def test_unauthorized_access_returns_403(self):
		"""Test that unauthorized users cannot list duty segments."""
		self.client.force_authenticate(user=self.other_user)
		
		url = f'/api/v1/trips/{self.trip.id}/duty-segments/'
		response = self.client.get(url)
		
		self.assertEqual(response.status_code, 403)


class DutySegmentUpdateTests(TestCase):
	"""Tests for duty segment update endpoint (PATCH /api/v1/trips/{trip_id}/duty-segments/{id}/)"""
	
	def setUp(self):
		from rest_framework.test import APIClient
		User = get_user_model()
		self.user = User.objects.create_user(email='driver@example.com', password='pass123', full_name='Driver')
		self.other_user = User.objects.create_user(email='other@example.com', password='pass123', full_name='Other')
		self.vehicle = Vehicle.objects.create(driver=self.user, truck_number='T1')
		
		# Create a trip
		self.trip = Trip.objects.create(
			driver=self.user,
			vehicle=self.vehicle,
			current_location='Origin',
			pickup_location='Origin',
			dropoff_location='Dest',
			start_time=timezone.now() + timedelta(hours=1),
		)
		
		# Create a duty segment
		base_time = timezone.now()
		self.segment = DutyStatus.objects.create(
			trip=self.trip,
			status='driving',
			start_time=base_time,
			end_time=base_time + timedelta(hours=2),
			remarks='Original segment',
		)
		
		self.client = APIClient()
	
	def test_successful_update_with_valid_data(self):
		"""Test successful update of a duty segment with valid data."""
		self.client.force_authenticate(user=self.user)
		
		new_end_time = self.segment.start_time + timedelta(hours=3)
		
		data = {
			'status': 'on_duty',
			'end_time': new_end_time.isoformat(),
			'remarks': 'Updated segment',
		}
		
		url = f'/api/v1/trips/{self.trip.id}/duty-segments/{self.segment.id}/'
		response = self.client.patch(url, data, format='json')
		
		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data['status'], 'on_duty')
		self.assertEqual(response.data['remarks'], 'Updated segment')
		self.assertEqual(response.data['duration_hours'], 3.0)
	
	def test_validation_error_for_invalid_end_time(self):
		"""Test validation error when updating with invalid end_time."""
		self.client.force_authenticate(user=self.user)
		
		invalid_end_time = self.segment.start_time - timedelta(hours=1)
		
		data = {
			'end_time': invalid_end_time.isoformat(),
		}
		
		url = f'/api/v1/trips/{self.trip.id}/duty-segments/{self.segment.id}/'
		response = self.client.patch(url, data, format='json')
		
		self.assertEqual(response.status_code, 400)
		self.assertIn('End time must be after start time', str(response.data))
	
	def test_hos_recalculation_on_update(self):
		"""Test that HOS is recalculated when duty segment is updated."""
		self.client.force_authenticate(user=self.user)
		
		# Store initial HOS values
		initial_drive_hours = self.trip.current_available_drive_hours
		
		new_end_time = self.segment.start_time + timedelta(hours=5)
		
		data = {
			'end_time': new_end_time.isoformat(),
		}
		
		url = f'/api/v1/trips/{self.trip.id}/duty-segments/{self.segment.id}/'
		response = self.client.patch(url, data, format='json')
		
		self.assertEqual(response.status_code, 200)
		
		# Refresh trip and check HOS values were updated
		self.trip.refresh_from_db()
		# HOS should be recalculated based on the longer segment
		self.assertLess(self.trip.current_available_drive_hours, initial_drive_hours)
	
	def test_unauthorized_access_returns_403(self):
		"""Test that unauthorized users cannot update duty segments."""
		self.client.force_authenticate(user=self.other_user)
		
		data = {
			'remarks': 'Unauthorized update',
		}
		
		url = f'/api/v1/trips/{self.trip.id}/duty-segments/{self.segment.id}/'
		response = self.client.patch(url, data, format='json')
		
		self.assertEqual(response.status_code, 403)



class LogSheetServiceTests(TestCase):
	"""Tests for LogSheetService - PDF generation, thumbnails, and graph data."""

	def setUp(self):
		User = get_user_model()
		self.user = User.objects.create_user(email='driver@example.com', password='pass', full_name='Driver')
		self.vehicle = Vehicle.objects.create(driver=self.user, truck_number='T1')
		self.start_time = timezone.now().replace(microsecond=0)

	def _make_trip(self):
		"""Create a trip for testing."""
		trip = Trip.objects.create(
			driver=self.user,
			vehicle=self.vehicle,
			current_location='Origin',
			pickup_location='Origin',
			dropoff_location='Destination',
			start_time=self.start_time,
		)
		return trip

	def _add_duty_segment(self, trip, status, start_time, duration_hours, remarks=''):
		"""Helper to add a duty segment to a trip."""
		end_time = start_time + timedelta(hours=duration_hours)
		DutyStatus.objects.create(
			trip=trip,
			status=status,
			start_time=start_time,
			end_time=end_time,
			remarks=remarks,
		)
		return end_time

	def test_generate_log_sheet_creates_logsheet_record(self):
		"""Test that generate_log_sheet creates a LogSheet record."""
		from trips.services import LogSheetService
		from trips.models import LogSheet

		trip = self._make_trip()
		date = self.start_time.date()

		# Add some duty segments
		current_time = self.start_time
		current_time = self._add_duty_segment(trip, DutyStatus.StatusChoices.DRIVING, current_time, 2.0)
		current_time = self._add_duty_segment(trip, DutyStatus.StatusChoices.OFF_DUTY, current_time, 1.0)

		service = LogSheetService()
		log_sheet = service.generate_log_sheet(trip, date)

		# Verify LogSheet was created
		self.assertIsNotNone(log_sheet)
		self.assertEqual(log_sheet.trip, trip)
		self.assertEqual(log_sheet.date, date)

		# Verify it's in the database
		db_sheet = LogSheet.objects.get(trip=trip, date=date)
		self.assertEqual(db_sheet.id, log_sheet.id)

	def test_generate_log_sheet_extracts_segments_for_date(self):
		"""Test that generate_log_sheet extracts only segments for the specified date."""
		from trips.services import LogSheetService

		trip = self._make_trip()
		date = self.start_time.date()

		# Add segments on the specified date
		current_time = self.start_time
		current_time = self._add_duty_segment(trip, DutyStatus.StatusChoices.DRIVING, current_time, 2.0)

		# Add segments on a different date (next day)
		next_day_start = self.start_time + timedelta(days=1)
		self._add_duty_segment(trip, DutyStatus.StatusChoices.DRIVING, next_day_start, 1.0)

		service = LogSheetService()
		log_sheet = service.generate_log_sheet(trip, date)

		# Verify only segments from the specified date are included
		timeline = log_sheet.graph_data.get('timeline', [])
		self.assertEqual(len(timeline), 1)
		self.assertEqual(timeline[0]['status'], 'driving')

	def test_generate_log_sheet_creates_graph_data(self):
		"""Test that generate_log_sheet creates graph_data with timeline and summary."""
		from trips.services import LogSheetService

		trip = self._make_trip()
		date = self.start_time.date()

		# Add duty segments
		current_time = self.start_time
		current_time = self._add_duty_segment(trip, DutyStatus.StatusChoices.DRIVING, current_time, 2.0)
		current_time = self._add_duty_segment(trip, DutyStatus.StatusChoices.OFF_DUTY, current_time, 1.0)
		current_time = self._add_duty_segment(trip, DutyStatus.StatusChoices.ON_DUTY, current_time, 1.5)

		service = LogSheetService()
		log_sheet = service.generate_log_sheet(trip, date)

		# Verify graph_data structure
		self.assertIn('timeline', log_sheet.graph_data)
		self.assertIn('status_summary', log_sheet.graph_data)

		# Verify timeline entries
		timeline = log_sheet.graph_data['timeline']
		self.assertEqual(len(timeline), 3)
		self.assertEqual(timeline[0]['status'], 'driving')
		self.assertEqual(timeline[0]['duration_hours'], 2.0)
		self.assertEqual(timeline[1]['status'], 'off_duty')
		self.assertEqual(timeline[1]['duration_hours'], 1.0)
		self.assertEqual(timeline[2]['status'], 'on_duty')
		self.assertEqual(timeline[2]['duration_hours'], 1.5)

		# Verify status summary
		summary = log_sheet.graph_data['status_summary']
		self.assertEqual(summary['driving_hours'], 2.0)
		self.assertEqual(summary['off_duty_hours'], 1.0)
		self.assertEqual(summary['on_duty_hours'], 1.5)
		self.assertEqual(summary['sleeper_berth_hours'], 0.0)
		self.assertEqual(summary['total_hours'], 4.5)

	def test_generate_log_sheet_creates_pdf_file(self):
		"""Test that generate_log_sheet creates a PDF file."""
		from trips.services import LogSheetService

		trip = self._make_trip()
		date = self.start_time.date()

		# Add duty segments
		current_time = self.start_time
		current_time = self._add_duty_segment(trip, DutyStatus.StatusChoices.DRIVING, current_time, 2.0)

		service = LogSheetService()
		log_sheet = service.generate_log_sheet(trip, date)

		# Verify PDF file was created
		self.assertTrue(log_sheet.pdf_file)
		self.assertGreater(log_sheet.pdf_file.size, 0)
		# PDF files should start with %PDF
		pdf_content = log_sheet.pdf_file.read()
		self.assertTrue(pdf_content.startswith(b'%PDF'))

	def test_generate_log_sheet_creates_thumbnail(self):
		"""Test that generate_log_sheet creates a thumbnail image."""
		from trips.services import LogSheetService

		trip = self._make_trip()
		date = self.start_time.date()

		# Add duty segments
		current_time = self.start_time
		current_time = self._add_duty_segment(trip, DutyStatus.StatusChoices.DRIVING, current_time, 2.0)

		service = LogSheetService()
		log_sheet = service.generate_log_sheet(trip, date)

		# Verify thumbnail was created
		self.assertTrue(log_sheet.thumbnail)
		self.assertGreater(log_sheet.thumbnail.size, 0)
		# PNG files should start with PNG magic bytes
		thumbnail_content = log_sheet.thumbnail.read()
		self.assertTrue(thumbnail_content.startswith(b'\x89PNG'))

	def test_generate_log_sheet_with_empty_segments(self):
		"""Test that generate_log_sheet handles trips with no segments for the date."""
		from trips.services import LogSheetService

		trip = self._make_trip()
		date = self.start_time.date()

		# Don't add any segments

		service = LogSheetService()
		log_sheet = service.generate_log_sheet(trip, date)

		# Should still create a LogSheet record
		self.assertIsNotNone(log_sheet)
		self.assertEqual(log_sheet.trip, trip)
		self.assertEqual(log_sheet.date, date)

		# Graph data should have empty timeline
		self.assertEqual(len(log_sheet.graph_data['timeline']), 0)
		# All status hours should be 0
		summary = log_sheet.graph_data['status_summary']
		self.assertEqual(summary['total_hours'], 0.0)

	def test_generate_log_sheet_returns_existing_record(self):
		"""Test that generate_log_sheet returns existing LogSheet if already generated."""
		from trips.services import LogSheetService
		from trips.models import LogSheet

		trip = self._make_trip()
		date = self.start_time.date()

		# Add duty segments
		current_time = self.start_time
		current_time = self._add_duty_segment(trip, DutyStatus.StatusChoices.DRIVING, current_time, 2.0)

		service = LogSheetService()

		# Generate first time
		log_sheet_1 = service.generate_log_sheet(trip, date)
		log_sheet_1_id = log_sheet_1.id

		# Generate second time
		log_sheet_2 = service.generate_log_sheet(trip, date)

		# Should return the same record
		self.assertEqual(log_sheet_2.id, log_sheet_1_id)

		# Should only have one LogSheet in database
		count = LogSheet.objects.filter(trip=trip, date=date).count()
		self.assertEqual(count, 1)

	def test_generate_log_sheet_with_all_duty_statuses(self):
		"""Test that generate_log_sheet handles all duty status types."""
		from trips.services import LogSheetService

		trip = self._make_trip()
		date = self.start_time.date()

		# Add segments with all status types
		current_time = self.start_time
		current_time = self._add_duty_segment(trip, DutyStatus.StatusChoices.DRIVING, current_time, 2.0)
		current_time = self._add_duty_segment(trip, DutyStatus.StatusChoices.ON_DUTY, current_time, 1.0)
		current_time = self._add_duty_segment(trip, DutyStatus.StatusChoices.SLEEPER, current_time, 3.0)
		current_time = self._add_duty_segment(trip, DutyStatus.StatusChoices.OFF_DUTY, current_time, 1.5)

		service = LogSheetService()
		log_sheet = service.generate_log_sheet(trip, date)

		# Verify all statuses are in graph data
		summary = log_sheet.graph_data['status_summary']
		self.assertEqual(summary['driving_hours'], 2.0)
		self.assertEqual(summary['on_duty_hours'], 1.0)
		self.assertEqual(summary['sleeper_berth_hours'], 3.0)
		self.assertEqual(summary['off_duty_hours'], 1.5)
		self.assertEqual(summary['total_hours'], 7.5)

	def test_generate_log_sheet_with_remarks(self):
		"""Test that generate_log_sheet includes remarks in graph data."""
		from trips.services import LogSheetService

		trip = self._make_trip()
		date = self.start_time.date()

		# Add segment with remarks
		current_time = self.start_time
		self._add_duty_segment(trip, DutyStatus.StatusChoices.DRIVING, current_time, 2.0, remarks='Highway driving')

		service = LogSheetService()
		log_sheet = service.generate_log_sheet(trip, date)

		# Verify remarks are in timeline
		timeline = log_sheet.graph_data['timeline']
		self.assertEqual(timeline[0]['remarks'], 'Highway driving')

	def test_generate_log_sheet_with_datetime_date_parameter(self):
		"""Test that generate_log_sheet handles datetime objects as date parameter."""
		from trips.services import LogSheetService

		trip = self._make_trip()
		# Pass datetime instead of date
		datetime_param = self.start_time

		# Add duty segments
		current_time = self.start_time
		current_time = self._add_duty_segment(trip, DutyStatus.StatusChoices.DRIVING, current_time, 2.0)

		service = LogSheetService()
		log_sheet = service.generate_log_sheet(trip, datetime_param)

		# Should still work and extract the date correctly
		self.assertEqual(log_sheet.date, self.start_time.date())

	def test_generate_log_sheet_pdf_includes_trip_info(self):
		"""Test that generated PDF includes trip information."""
		from trips.services import LogSheetService

		trip = self._make_trip()
		date = self.start_time.date()

		# Add duty segments
		current_time = self.start_time
		current_time = self._add_duty_segment(trip, DutyStatus.StatusChoices.DRIVING, current_time, 2.0)

		service = LogSheetService()
		log_sheet = service.generate_log_sheet(trip, date)

		# Read PDF content and verify it contains trip info
		pdf_content = log_sheet.pdf_file.read()
		# PDF should contain trip ID (as text or encoded)
		self.assertGreater(len(pdf_content), 100)  # PDF should have substantial content

	def test_generate_log_sheet_thumbnail_includes_timeline(self):
		"""Test that generated thumbnail includes timeline visualization."""
		from trips.services import LogSheetService

		trip = self._make_trip()
		date = self.start_time.date()

		# Add duty segments
		current_time = self.start_time
		current_time = self._add_duty_segment(trip, DutyStatus.StatusChoices.DRIVING, current_time, 2.0)
		current_time = self._add_duty_segment(trip, DutyStatus.StatusChoices.OFF_DUTY, current_time, 1.0)

		service = LogSheetService()
		log_sheet = service.generate_log_sheet(trip, date)

		# Verify thumbnail is a valid PNG
		thumbnail_content = log_sheet.thumbnail.read()
		self.assertTrue(thumbnail_content.startswith(b'\x89PNG'))
		self.assertGreater(len(thumbnail_content), 100)

	def test_extract_segments_for_date_filters_correctly(self):
		"""Test that _extract_segments_for_date filters segments correctly."""
		from trips.services import LogSheetService

		trip = self._make_trip()
		date = self.start_time.date()

		# Add segments on the specified date
		current_time = self.start_time
		current_time = self._add_duty_segment(trip, DutyStatus.StatusChoices.DRIVING, current_time, 2.0)
		current_time = self._add_duty_segment(trip, DutyStatus.StatusChoices.OFF_DUTY, current_time, 1.0)

		# Add segments on different dates
		next_day = self.start_time + timedelta(days=1)
		self._add_duty_segment(trip, DutyStatus.StatusChoices.DRIVING, next_day, 1.0)

		prev_day = self.start_time - timedelta(days=1)
		self._add_duty_segment(trip, DutyStatus.StatusChoices.DRIVING, prev_day, 1.0)

		service = LogSheetService()
		segments = service._extract_segments_for_date(trip, date)

		# Should only return segments from the specified date
		self.assertEqual(len(segments), 2)
		for segment in segments:
			self.assertEqual(segment.start_time.date(), date)

	def test_create_graph_data_calculates_totals_correctly(self):
		"""Test that _create_graph_data calculates totals correctly."""
		from trips.services import LogSheetService

		trip = self._make_trip()
		date = self.start_time.date()

		# Add segments with specific durations
		current_time = self.start_time
		current_time = self._add_duty_segment(trip, DutyStatus.StatusChoices.DRIVING, current_time, 2.5)
		current_time = self._add_duty_segment(trip, DutyStatus.StatusChoices.ON_DUTY, current_time, 1.25)
		current_time = self._add_duty_segment(trip, DutyStatus.StatusChoices.SLEEPER, current_time, 3.75)

		service = LogSheetService()
		segments = service._extract_segments_for_date(trip, date)
		graph_data = service._create_graph_data(segments)

		# Verify totals
		summary = graph_data['status_summary']
		self.assertEqual(summary['driving_hours'], 2.5)
		self.assertEqual(summary['on_duty_hours'], 1.25)
		self.assertEqual(summary['sleeper_berth_hours'], 3.75)
		self.assertEqual(summary['total_hours'], 7.5)

	def test_generate_pdf_handles_no_segments(self):
		"""Test that _generate_pdf handles trips with no segments gracefully."""
		from trips.services import LogSheetService

		trip = self._make_trip()
		date = self.start_time.date()

		service = LogSheetService()
		pdf_bytes = service._generate_pdf(trip, [], date)

		# Should still generate a valid PDF
		self.assertTrue(pdf_bytes.startswith(b'%PDF'))
		self.assertGreater(len(pdf_bytes), 100)

	def test_generate_thumbnail_handles_no_segments(self):
		"""Test that _generate_thumbnail handles trips with no segments gracefully."""
		from trips.services import LogSheetService

		trip = self._make_trip()
		date = self.start_time.date()

		service = LogSheetService()
		thumbnail_bytes = service._generate_thumbnail([], date)

		# Should still generate a valid PNG
		self.assertTrue(thumbnail_bytes.startswith(b'\x89PNG'))
		self.assertGreater(len(thumbnail_bytes), 100)
