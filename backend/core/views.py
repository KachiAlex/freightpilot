from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView


class HealthCheckView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response(
            {
                "status": "ok",
                "timestamp": timezone.now(),
                "service": "freightpilot-backend",
            },
            status=status.HTTP_200_OK,
        )
