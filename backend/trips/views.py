from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.filters import OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.http import HttpResponse
import csv
import io
from django.utils import timezone

from trips.models import Trip
from trips.serializers import TripCreateSerializer, TripSerializer
from trips.services import RouteEstimator, TripPlannerService
from rest_framework import serializers


from trips.permissions import IsOwnerOrAdmin


class TripPagination(PageNumberPagination):
    """Custom pagination for trips with default limit of 20."""
    page_size = 20
    page_size_query_param = 'limit'
    page_size_query_description = 'Number of results to return per page.'
    max_page_size = 100


class TripViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    queryset = Trip.objects.select_related('driver', 'vehicle').prefetch_related('duty_segments', 'log_sheets')
    pagination_class = TripPagination
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['status']
    ordering_fields = ['created_at', 'start_time', 'status']
    ordering = ['-created_at']

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
        
        # Set status to 'draft' initially
        trip.status = Trip.Status.DRAFT
        
        # Call route estimation to calculate distance and ETA
        route_data = RouteEstimator().estimate(trip.pickup_location, trip.dropoff_location)
        if route_data:
            trip.total_distance_miles = route_data['distance_miles']
            trip.estimated_drive_hours = route_data['drive_hours']
            trip.eta = route_data['eta']
            trip.pickup_latitude = route_data['origin_coords'][0]
            trip.pickup_longitude = route_data['origin_coords'][1]
            trip.dropoff_latitude = route_data['destination_coords'][0]
            trip.dropoff_longitude = route_data['destination_coords'][1]
        
        # Initialize HOS values
        from trips.services import HOSCalculationService
        hos_service = HOSCalculationService()
        hos_values = hos_service.calculate_available_hours(trip)
        trip.current_available_drive_hours = hos_values['current_available_drive_hours']
        trip.current_available_duty_hours = hos_values['current_available_duty_hours']
        trip.current_duty_status = hos_values['current_duty_status']
        
        # Save the trip with all calculated values (status remains 'draft')
        trip.save(
            update_fields=[
                'status',
                'total_distance_miles',
                'estimated_drive_hours',
                'eta',
                'pickup_latitude',
                'pickup_longitude',
                'dropoff_latitude',
                'dropoff_longitude',
                'current_available_drive_hours',
                'current_available_duty_hours',
                'current_duty_status',
            ]
        )
        
        # Generate schedule snapshot for planning purposes (but preserve draft status)
        # Save the current status before persist() changes it
        current_status = trip.status
        TripPlannerService(trip).persist()
        # Restore the draft status if persist() changed it
        if trip.status != current_status:
            trip.status = current_status
            trip.save(update_fields=['status'])
        
        output_serializer = TripSerializer(trip, context={'request': request})
        headers = self.get_success_headers(output_serializer.data)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def list(self, request, *args, **kwargs):
        """List trips with pagination, filtering, and sorting."""
        return super().list(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        """Retrieve a single trip with nested duty_segments and log_sheets."""
        return super().retrieve(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        """Update trip status and handle status transitions."""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Validate status transitions
        new_status = request.data.get('status')
        if new_status and new_status != instance.status:
            self._validate_status_transition(instance, new_status)
            
            # Record actual_start_time when transitioning to in_progress
            if new_status == Trip.Status.IN_PROGRESS and not instance.actual_start_time:
                request.data['actual_start_time'] = timezone.now()
            
            # Record actual_end_time when transitioning to completed
            if new_status == Trip.Status.COMPLETED and not instance.actual_end_time:
                request.data['actual_end_time'] = timezone.now()
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        if getattr(instance, '_prefetched_objects_cache', None):
            instance._prefetched_objects_cache = {}
        
        return Response(TripSerializer(instance, context={'request': request}).data)

    def _validate_status_transition(self, trip, new_status):
        """Validate that status transitions follow the allowed flow."""
        current_status = trip.status
        
        # Define allowed transitions
        allowed_transitions = {
            Trip.Status.DRAFT: [Trip.Status.PLANNED, Trip.Status.CANCELLED],
            Trip.Status.PLANNED: [Trip.Status.IN_PROGRESS, Trip.Status.CANCELLED],
            Trip.Status.IN_PROGRESS: [Trip.Status.COMPLETED, Trip.Status.CANCELLED],
            Trip.Status.COMPLETED: [],
            Trip.Status.CANCELLED: [],
        }
        
        if new_status not in allowed_transitions.get(current_status, []):
            raise serializers.ValidationError(
                f"Cannot transition from {current_status} to {new_status}"
            )
        
        # Prevent deletion of in_progress trips
        if current_status == Trip.Status.IN_PROGRESS and new_status == Trip.Status.CANCELLED:
            # Allow cancellation but could add additional checks here if needed
            pass

    @action(detail=True, methods=['post'])
    def regenerate_schedule(self, request, pk=None):
        # Fetch trip directly and enforce owner/admin permission here to avoid
        # surprising 404s from `get_object()` in some test scenarios.
        from trips.models import Trip as TripModel
        try:
            trip = TripModel.objects.select_related('driver').get(pk=pk)
        except TripModel.DoesNotExist:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

        # enforce object-level permission: only driver or admin may access
        user = request.user
        if trip.driver != user and getattr(user, 'role', None) != user.Roles.ADMIN:
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        TripPlannerService(trip).persist()
        return Response(TripSerializer(trip, context={'request': request}).data)

    @action(detail=True, methods=['get'])
    def export_log(self, request, pk=None):
        """Export a DOT-style log for the trip as CSV or PDF. Optional `date=YYYY-MM-DD`, `format=pdf|csv`, and `save=true` to persist a LogSheet."""
        trip = self.get_object()
        date_str = request.query_params.get('date')
        if date_str:
            try:
                export_date = timezone.datetime.fromisoformat(date_str).date()
            except Exception:
                return Response({'detail': 'invalid date format'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            export_date = timezone.localdate()

        # Collect duty segments for the trip that overlap the requested date
        segments = trip.duty_segments.filter(
            start_time__date=export_date
        ).order_by('start_time')

        # If none found for that date, fall back to schedule_snapshot
        rows = []
        if segments.exists():
            for seg in segments:
                duration = (seg.end_time - seg.start_time).total_seconds() / 3600.0
                rows.append([seg.start_time.isoformat(), seg.end_time.isoformat(), seg.status, seg.remarks or '', f"{duration:.2f}"])
        else:
            snapshot = trip.schedule_snapshot.get('segments', [])
            for seg in snapshot:
                # include segments that fall on the date
                try:
                    st = timezone.datetime.fromisoformat(seg['start_time']).date()
                except Exception:
                    continue
                if st == export_date:
                    start = seg['start_time']
                    end = seg['end_time']
                    status_text = seg.get('status')
                    remarks = seg.get('remarks', '')
                    try:
                        duration = (timezone.datetime.fromisoformat(end) - timezone.datetime.fromisoformat(start)).total_seconds() / 3600.0
                    except Exception:
                        duration = 0.0
                    rows.append([start, end, status_text, remarks, f"{duration:.2f}"])

        # Determine output format: csv (default) or pdf
        out_format = request.query_params.get('format', 'csv').lower()
        save_flag = request.query_params.get('save')

        if out_format == 'pdf':
            try:
                # Generate a simple PDF using ReportLab
                from django.core.files.base import ContentFile
                from trips.models import LogSheet
                from trips.services import generate_log_pdf

                result = generate_log_pdf(trip, rows, export_date.isoformat())
                # generate_log_pdf now returns (pdf_bytes, thumbnail_bytes)
                if isinstance(result, tuple):
                    pdf_data, thumb_bytes = result
                else:
                    pdf_data = result
                    thumb_bytes = None
                filename = f"trip_{trip.id}_log_{export_date.isoformat()}.pdf"
                response = HttpResponse(pdf_data, content_type='application/pdf')
                response['Content-Disposition'] = f'attachment; filename="{filename}"'

                if save_flag and save_flag.lower() in ('1', 'true', 'yes'):
                    sheet, created = LogSheet.objects.get_or_create(trip=trip, date=export_date)
                    sheet.graph_data = trip.schedule_snapshot or {}
                    sheet.remarks = f"Exported by {request.user.email if request.user.is_authenticated else 'anonymous'}"
                    sheet.pdf_file.save(filename, ContentFile(pdf_data), save=False)
                    if thumb_bytes:
                        thumb_name = filename.replace('.pdf', '.png')
                        sheet.thumbnail.save(thumb_name, ContentFile(thumb_bytes), save=False)
                    sheet.save()

                return response
            except Exception as exc:  # pragma: no cover - surface PDF errors during test
                return Response({'error': str(exc), 'type': type(exc).__name__}, status=500)

        # Default: CSV output
        buffer = io.StringIO()
        writer = csv.writer(buffer)
        writer.writerow(['start_time', 'end_time', 'status', 'remarks', 'duration_hours'])
        for r in rows:
            writer.writerow(r)

        csv_content = buffer.getvalue()
        buffer.close()

        filename = f"trip_{trip.id}_log_{export_date.isoformat()}.csv"
        response = HttpResponse(csv_content, content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'

        if save_flag and save_flag.lower() in ('1', 'true', 'yes'):
            from trips.models import LogSheet

            sheet, created = LogSheet.objects.get_or_create(trip=trip, date=export_date)
            sheet.graph_data = trip.schedule_snapshot or {}
            sheet.remarks = f"Exported by {request.user.email if request.user.is_authenticated else 'anonymous'}"
            sheet.save()

        return response

    @action(detail=True, methods=['get'])
    def logs(self, request, pk=None):
        """List saved LogSheet records for the trip."""
        trip = self.get_object()
        sheets = trip.log_sheets.order_by('-date')
        from trips.serializers import LogSheetSerializer
        from rest_framework.pagination import PageNumberPagination

        paginator = PageNumberPagination()
        # allow client to request page_size via query param, otherwise use default
        try:
            page_size = int(request.query_params.get('page_size') or 10)
        except Exception:
            page_size = 10
        paginator.page_size = page_size

        page = paginator.paginate_queryset(sheets, request)
        serializer = LogSheetSerializer(page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)

    @action(detail=True, methods=['delete'], url_path='logs/(?P<sheet_id>[^/.]+)')
    def delete_log(self, request, pk=None, sheet_id=None):
        """Delete a specific LogSheet belonging to this trip."""
        trip = self.get_object()
        from trips.models import LogSheet

        try:
            sheet = LogSheet.objects.get(id=sheet_id, trip=trip)
        except LogSheet.DoesNotExist:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

        # permissions: IsOwnerOrAdmin is already applied at view level; extra check for safety
        if sheet.trip.driver != request.user and getattr(request.user, 'role', None) != request.user.Roles.ADMIN:
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        sheet.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
