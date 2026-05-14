from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from accounts.serializers import FreightpilotTokenObtainPairSerializer
from accounts.views import ProfileView, RegisterView
from rest_framework_simplejwt.views import TokenObtainPairView

class FreightpilotTokenObtainPairView(TokenObtainPairView):
    serializer_class = FreightpilotTokenObtainPairSerializer

app_name = "accounts"

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', FreightpilotTokenObtainPairView.as_view(), name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='refresh'),
    path('auth/profile/', ProfileView.as_view(), name='profile'),
]
