from rest_framework.routers import DefaultRouter
from django.urls import path, include, re_path

from trips.views import TripViewSet, DutySegmentViewSet, LogSheetViewSet

router = DefaultRouter()
router.register('trips', TripViewSet, basename='trip')

urlpatterns = router.urls + [
    re_path(r'^trips/(?P<trip_id>[^/.]+)/duty-segments/$', DutySegmentViewSet.as_view({'get': 'list', 'post': 'create'}), name='duty-segment-list'),
    re_path(r'^trips/(?P<trip_id>[^/.]+)/duty-segments/(?P<pk>[^/.]+)/$', DutySegmentViewSet.as_view({'get': 'retrieve', 'patch': 'partial_update', 'put': 'update', 'delete': 'destroy'}), name='duty-segment-detail'),
    re_path(r'^trips/(?P<trip_id>[^/.]+)/log-sheets/$', LogSheetViewSet.as_view({'get': 'list', 'post': 'create'}), name='log-sheet-list'),
    re_path(r'^trips/(?P<trip_id>[^/.]+)/log-sheets/(?P<pk>[^/.]+)/$', LogSheetViewSet.as_view({'get': 'retrieve', 'delete': 'destroy'}), name='log-sheet-detail'),
]
