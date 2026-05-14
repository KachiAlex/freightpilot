from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from trips.models import Trip
from trips.serializers import TripCreateSerializer, TripSerializer
from trips.services import RouteEstimator, TripPlannerService


class TripViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Trip.objects.select_related('driver', 'vehicle').prefetch_related('duty_segments', 'log_sheets')

    def get_queryset(self):
        user = self.request.user
        if user.role == user.Roles.ADMIN:
            return TripViewSet.queryset
        return TripViewSet.queryset.filter(driver=user)

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return TripCreateSerializer
        return TripSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        trip = serializer.save()
        route_data = RouteEstimator().estimate(trip.pickup_location, trip.dropoff_location)
        if route_data:
            trip.total_distance_miles = route_data['distance_miles']
            trip.estimated_drive_hours = route_data['drive_hours']
            trip.eta = route_data['eta']
            trip.pickup_latitude = route_data['origin_coords'][0]
            trip.pickup_longitude = route_data['origin_coords'][1]
            trip.dropoff_latitude = route_data['destination_coords'][0]
            trip.dropoff_longitude = route_data['destination_coords'][1]
            trip.save(
                update_fields=[
                    'total_distance_miles',
                    'estimated_drive_hours',
                    'eta',
                    'pickup_latitude',
                    'pickup_longitude',
                    'dropoff_latitude',
                    'dropoff_longitude',
                ]
            )
        TripPlannerService(trip).persist()
        output_serializer = TripSerializer(trip, context={'request': request})
        headers = self.get_success_headers(output_serializer.data)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=True, methods=['post'])
    def regenerate_schedule(self, request, pk=None):
        trip = self.get_object()
        TripPlannerService(trip).persist()
        return Response(TripSerializer(trip, context={'request': request}).data)
