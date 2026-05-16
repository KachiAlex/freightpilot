from rest_framework import permissions


class IsOwnerOrAdmin(permissions.BasePermission):
    """Allow access if user is admin or is the owner/driver of the object.

    This supports both view-level checks (returns True so other checks run) and
    object-level checks via `has_object_permission`.
    """

    def has_permission(self, request, view):
        # Require authentication first
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        # Admins have full access
        try:
            user_role_admin = request.user.role == request.user.Roles.ADMIN
        except Exception:
            user_role_admin = False
        if user_role_admin:
            return True

        # Owners (drivers) can access their own objects
        # Expect objects with a `driver` attribute (Trip)
        return getattr(obj, 'driver', None) == request.user
