from django.conf import settings
from django.db import models

User = settings.AUTH_USER_MODEL


class TimestampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Vehicle(TimestampedModel):
    driver = models.ForeignKey(User, related_name='vehicles', on_delete=models.CASCADE)
    truck_number = models.CharField(max_length=50)
    trailer_number = models.CharField(max_length=50, blank=True)
    fuel_efficiency_mpg = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)

    def __str__(self):
        return f"{self.truck_number} ({self.driver})"


class Trip(TimestampedModel):
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        PLANNED = 'planned', 'Planned'
        IN_PROGRESS = 'in_progress', 'In Progress'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'

    class DriverType(models.TextChoices):
        SOLO = 'solo', 'Solo'
        TEAM = 'team', 'Team'

    driver = models.ForeignKey(User, related_name='trips', on_delete=models.CASCADE)
    vehicle = models.ForeignKey(Vehicle, related_name='trips', on_delete=models.SET_NULL, null=True, blank=True)
    current_location = models.CharField(max_length=255)
    pickup_location = models.CharField(max_length=255)
    dropoff_location = models.CharField(max_length=255)
    pickup_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    pickup_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    dropoff_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    dropoff_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    start_time = models.DateTimeField()
    driver_type = models.CharField(max_length=10, choices=DriverType.choices, default=DriverType.SOLO)
    current_cycle_hours_used = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    current_available_drive_hours = models.DecimalField(max_digits=4, decimal_places=2, default=11)
    current_available_duty_hours = models.DecimalField(max_digits=4, decimal_places=2, default=14)
    current_duty_status = models.CharField(max_length=50, default='off_duty')
    total_distance_miles = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)
    estimated_drive_hours = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    eta = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    schedule_snapshot = models.JSONField(default=dict, blank=True)
    rest_preferences = models.JSONField(blank=True, null=True, default=dict)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"Trip {self.id} - {self.pickup_location} → {self.dropoff_location}"


class DutyStatus(TimestampedModel):
    class StatusChoices(models.TextChoices):
        OFF_DUTY = 'off_duty', 'Off Duty'
        SLEEPER = 'sleeper_berth', 'Sleeper Berth'
        DRIVING = 'driving', 'Driving'
        ON_DUTY = 'on_duty', 'On Duty (Not Driving)'

    trip = models.ForeignKey(Trip, related_name='duty_segments', on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=StatusChoices.choices)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    remarks = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"{self.trip_id} - {self.status}"


class LogSheet(TimestampedModel):
    trip = models.ForeignKey(Trip, related_name='log_sheets', on_delete=models.CASCADE)
    date = models.DateField()
    pdf_file = models.FileField(upload_to='logs/', blank=True, null=True)
    graph_data = models.JSONField(default=dict, blank=True)
    remarks = models.TextField(blank=True)

    class Meta:
        unique_together = ('trip', 'date')

    def __str__(self):
        return f"Log {self.date} / Trip {self.trip_id}"
