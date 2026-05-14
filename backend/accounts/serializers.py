from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'id',
            'email',
            'full_name',
            'role',
            'cdl_status',
            'home_terminal',
            'carrier_name',
            'phone_number',
            'date_joined',
            'updated_at',
        )
        read_only_fields = fields


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = (
            'email',
            'full_name',
            'password',
            'role',
            'cdl_status',
            'home_terminal',
            'carrier_name',
            'phone_number',
        )

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(password=password, **validated_data)
        return user


class FreightpilotTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['full_name'] = user.full_name
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate(self, attrs):
        email = attrs.get('email', '').lower()
        try:
            attrs['user'] = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            attrs['user'] = None
        return attrs

    def save(self):
        user = self.validated_data.get('user')
        if not user:
            return None

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_url = f"{settings.FRONTEND_BASE_URL}/auth/password-reset/confirm?uid={uid}&token={token}"

        send_mail(
            subject='Freightpilot password reset',
            message=(
                'You requested to reset your Freightpilot password. '
                'Paste the following link into your browser to choose a new password:\n'
                f'{reset_url}\n\n'
                'If you did not request this change, you can ignore this email.'
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=True,
        )

        return {'uid': uid, 'token': token, 'reset_url': reset_url}


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=8)

    default_error_messages = {
        'invalid_link': 'The reset link is invalid or has expired.',
    }

    def validate(self, attrs):
        uid = attrs.get('uid')
        token = attrs.get('token')
        new_password = attrs.get('new_password')
        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
        except (User.DoesNotExist, ValueError, TypeError, OverflowError):
            raise serializers.ValidationError({'uid': self.error_messages['invalid_link']})

        if not default_token_generator.check_token(user, token):
            raise serializers.ValidationError({'token': self.error_messages['invalid_link']})

        validate_password(new_password, user)
        attrs['user'] = user
        return attrs

    def save(self):
        user = self.validated_data['user']
        user.set_password(self.validated_data['new_password'])
        user.save(update_fields=['password'])
        return user
