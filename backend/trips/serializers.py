from django.contrib.auth import get_user_model
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


class TripCreateSerializer(serializers.ModelSerializer):
    vehicle_id = serializers.PrimaryKeyRelatedField(
        queryset=Vehicle.objects.all(), required=False, allow_null=True, source='vehicle'
    )

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
            'driver_type',
            'current_cycle_hours_used',
            'current_available_drive_hours',
            'current_available_duty_hours',
            'current_duty_status',
            'notes',
            'rest_preferences',
        )

    def validate(self, attrs):
        user = self.context['request'].user
        vehicle = attrs.get('vehicle')
        if vehicle and vehicle.driver != user:
            raise serializers.ValidationError('Vehicle must belong to the current driver')
        return attrs

    def create(self, validated_data):
        user = self.context['request'].user
        return Trip.objects.create(driver=user, **validated_data)
