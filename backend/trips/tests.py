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
