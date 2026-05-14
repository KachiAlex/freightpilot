from django.contrib import admin

from trips.models import DutyStatus, LogSheet, Trip, Vehicle


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ('truck_number', 'driver', 'trailer_number', 'fuel_efficiency_mpg', 'updated_at')
    search_fields = ('truck_number', 'trailer_number', 'driver__email')


class DutyStatusInline(admin.TabularInline):
    model = DutyStatus
    extra = 0


class LogSheetInline(admin.TabularInline):
    model = LogSheet
    extra = 0


@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ('id', 'driver', 'pickup_location', 'dropoff_location', 'status', 'start_time')
    list_filter = ('status', 'driver_type')
    search_fields = ('pickup_location', 'dropoff_location', 'driver__email')
    inlines = [DutyStatusInline, LogSheetInline]


@admin.register(DutyStatus)
class DutyStatusAdmin(admin.ModelAdmin):
    list_display = ('trip', 'status', 'start_time', 'end_time')
    list_filter = ('status',)


@admin.register(LogSheet)
class LogSheetAdmin(admin.ModelAdmin):
    list_display = ('trip', 'date')
