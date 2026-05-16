from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
import csv
import io
from django.utils import timezone

from trips.models import Trip
from trips.serializers import TripCreateSerializer, TripSerializer
from trips.services import RouteEstimator, TripPlannerService


from trips.permissions import IsOwnerOrAdmin


class TripViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    queryset = Trip.objects.select_related('driver', 'vehicle').prefetch_related('duty_segments', 'log_sheets')

    def get_queryset(self):
        try:
            print(f"TripViewSet.get_queryset called: user={self.request.user.email if self.request.user.is_authenticated else 'anon'} path={getattr(self.request, 'path', '')} params={dict(self.request.query_params)}")
        except Exception:
            print("TripViewSet.get_queryset called")
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
