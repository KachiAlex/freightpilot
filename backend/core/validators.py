import re
from django.core.exceptions import ValidationError


def validate_location_string(value):
    """Validate location strings to prevent injection attacks."""
    if not isinstance(value, str):
        raise ValidationError('Location must be a string')
    
    if len(value) > 500:
        raise ValidationError('Location string is too long (max 500 characters)')
    
    # Allow alphanumeric, spaces, commas, periods, hyphens, and common location characters
    if not re.match(r'^[a-zA-Z0-9\s,.\-\'()]+$', value):
        raise ValidationError('Location contains invalid characters')
    
    return value


def validate_remarks_string(value):
    """Validate remarks strings to prevent injection attacks."""
    if not isinstance(value, str):
        raise ValidationError('Remarks must be a string')
    
    if len(value) > 1000:
        raise ValidationError('Remarks string is too long (max 1000 characters)')
    
    # Allow alphanumeric, spaces, and common punctuation
    if not re.match(r'^[a-zA-Z0-9\s,.\-\'()!?:;]+$', value):
        raise ValidationError('Remarks contains invalid characters')
    
    return value


def sanitize_location_string(value):
    """Sanitize location strings by removing potentially dangerous characters."""
    if not isinstance(value, str):
        return ''
    
    # Remove any characters that aren't alphanumeric, spaces, commas, periods, hyphens
    sanitized = re.sub(r'[^a-zA-Z0-9\s,.\-\'()]', '', value)
    return sanitized.strip()
