from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from accounts.serializers import FreightpilotTokenObtainPairSerializer
from accounts.views import (
    PasswordResetConfirmView,
    PasswordResetRequestView,
    ProfileView,
    RegisterView,
)
from rest_framework_simplejwt.views import TokenObtainPairView
from core.throttling import AuthLoginThrottle

class FreightpilotTokenObtainPairView(TokenObtainPairView):
    serializer_class = FreightpilotTokenObtainPairSerializer
    throttle_classes = [AuthLoginThrottle]

app_name = "accounts"

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', FreightpilotTokenObtainPairView.as_view(), name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='refresh'),
    path('auth/profile/', ProfileView.as_view(), name='profile'),
    path('auth/password/reset/', PasswordResetRequestView.as_view(), name='password-reset'),
    path('auth/password/reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
]
