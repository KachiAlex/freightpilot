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
    class Meta:
        model = DutyStatus
        fields = (
            'id',
            'status',
            'start_time',
            'end_time',
            'remarks',
        )


class LogSheetSerializer(serializers.ModelSerializer):
    class Meta:
        model = LogSheet
        fields = (
            'id',
            'date',
            'graph_data',
            'remarks',
            'pdf_file',
            'thumbnail',
        )


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
