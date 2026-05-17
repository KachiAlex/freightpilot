from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import serializers

from trips.models import DutyStatus, LogSheet, Trip, Vehicle

User = get_user_model()


class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = ('id', 'truck_number', 'trailer_number', 'fuel_efficiency_mpg')


class DutyStatusSerializer(serializers.ModelSerializer):
    duration_hours = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = DutyStatus
        fields = (
            'id',
            'status',
            'start_time',
            'end_time',
            'remarks',
            'duration_hours',
        )

    def get_duration_hours(self, obj):
        """Calculate duration_hours from start_time and end_time."""
        if obj.start_time and obj.end_time:
            duration = (obj.end_time - obj.start_time).total_seconds() / 3600
            return round(duration, 2)
        return None

    def validate_status(self, value):
        """Validate that status is one of the allowed enum values."""
        valid_statuses = [choice[0] for choice in DutyStatus.StatusChoices.choices]
        if value not in valid_statuses:
            raise serializers.ValidationError(
                f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            )
        return value

    def validate(self, attrs):
        """Validate that end_time is after start_time."""
        # Get start_time from attrs or from the instance (for partial updates)
        start_time = attrs.get('start_time')
        if start_time is None and self.instance:
            start_time = self.instance.start_time
        
        end_time = attrs.get('end_time')
        if end_time is None and self.instance:
            end_time = self.instance.end_time
        
        if start_time and end_time and end_time <= start_time:
            raise serializers.ValidationError(
                "End time must be after start time."
            )
        return attrs


class LogSheetSerializer(serializers.ModelSerializer):
    pdf_file = serializers.SerializerMethodField(read_only=True)
    thumbnail = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = LogSheet
        fields = (
            'id',
            'trip',
            'date',
            'pdf_file',
            'thumbnail',
            'graph_data',
            'remarks',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'trip', 'created_at', 'updated_at')

    def get_pdf_file(self, obj):
        """Return the URL for the PDF file if it exists."""
        if obj.pdf_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.pdf_file.url)
            return obj.pdf_file.url
        return None

    def get_thumbnail(self, obj):
        """Return the URL for the thumbnail image if it exists."""
        if obj.thumbnail:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.thumbnail.url)
            return obj.thumbnail.url
        return None


class TripSerializer(serializers.ModelSerializer):
    duty_segments = DutyStatusSerializer(many=True, read_only=True)
    log_sheets = LogSheetSerializer(many=True, read_only=True)
    vehicle = VehicleSerializer(read_only=True)

    class Meta:
        model = Trip
        fields = (
            'id',
            'driver',
            'vehicle',
            'current_location',
            'pickup_location',
            'dropoff_location',
            'pickup_latitude',
            'pickup_longitude',
            'dropoff_latitude',
            'dropoff_longitude',
            'start_time',
            'actual_start_time',
            'actual_end_time',
            'driver_type',
            'current_cycle_hours_used',
            'current_available_drive_hours',
            'current_available_duty_hours',
            'current_duty_status',
            'total_distance_miles',
            'estimated_drive_hours',
            'eta',
            'status',
            'schedule_snapshot',
            'rest_preferences',
            'notes',
            'created_at',
            'updated_at',
            'duty_segments',
            'log_sheets',
        )
        read_only_fields = ('driver',)

    def validate_pickup_location(self, value):
        """Validate that pickup_location is non-empty."""
        if not value or not value.strip():
            raise serializers.ValidationError("Pickup location cannot be empty.")
        return value

    def validate_dropoff_location(self, value):
        """Validate that dropoff_location is non-empty."""
        if not value or not value.strip():
            raise serializers.ValidationError("Dropoff location cannot be empty.")
        return value

    def validate_start_time(self, value):
        """Validate that start_time is not in the past."""
        if value < timezone.now():
            raise serializers.ValidationError("Start time cannot be in the past.")
        return value


class TripCreateSerializer(serializers.ModelSerializer):
    vehicle_id = serializers.PrimaryKeyRelatedField(
        queryset=Vehicle.objects.all(), required=False, allow_null=True, source='vehicle'
    )
    current_location = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Trip
        fields = (
            'vehicle_id',
            'current_location',
            'pickup_location',
            'dropoff_location',
            'pickup_latitude',
            'pickup_longitude',
            'dropoff_latitude',
            'dropoff_longitude',
            'start_time',
            'actual_start_time',
            'actual_end_time',
            'driver_type',
            'current_cycle_hours_used',
            'current_available_drive_hours',
            'current_available_duty_hours',
            'current_duty_status',
            'notes',
            'rest_preferences',
            'status',
        )

    def validate_pickup_location(self, value):
        """Validate that pickup_location is non-empty."""
        if not value or not value.strip():
            raise serializers.ValidationError("Pickup location cannot be empty.")
        return value

    def validate_dropoff_location(self, value):
        """Validate that dropoff_location is non-empty."""
        if not value or not value.strip():
            raise serializers.ValidationError("Dropoff location cannot be empty.")
        return value

    def validate_start_time(self, value):
        """Validate that start_time is not in the past."""
        if value < timezone.now():
            raise serializers.ValidationError("Start time cannot be in the past.")
        return value

    def validate(self, attrs):
        user = self.context['request'].user
        vehicle = attrs.get('vehicle')
        if vehicle and vehicle.driver != user:
            raise serializers.ValidationError('Vehicle must belong to the current driver')
        return attrs

    def create(self, validated_data):
        user = self.context['request'].user
        # Set current_location to pickup_location if not provided
        if not validated_data.get('current_location'):
            validated_data['current_location'] = validated_data.get('pickup_location', '')
        return Trip.objects.create(driver=user, **validated_data)
