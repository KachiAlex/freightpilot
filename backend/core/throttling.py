from rest_framework.throttling import UserRateThrottle, AnonRateThrottle


class AuthLoginThrottle(UserRateThrottle):
    """Rate limit login attempts to 5 per minute per user."""
    scope = 'auth_login'
    rate = '5/minute'


class AuthRegisterThrottle(AnonRateThrottle):
    """Rate limit registration attempts to 10 per hour per IP."""
    scope = 'auth_register'
    rate = '10/hour'


class GeneralUserThrottle(UserRateThrottle):
    """General rate limit for authenticated users."""
    scope = 'user'
    rate = '1000/hour'


class GeneralAnonThrottle(AnonRateThrottle):
    """General rate limit for anonymous users."""
    scope = 'anon'
    rate = '100/hour'
