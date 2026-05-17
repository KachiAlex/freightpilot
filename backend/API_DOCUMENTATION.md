# Freightpilot API Documentation

## Overview

Freightpilot is an FMCSA-compliant trip planning and HOS management API. This documentation covers all available endpoints, authentication, and error handling.

## Base URL

```
http://localhost:8000/api/v1
```

## Authentication

All endpoints (except registration and password reset) require JWT authentication.

### Obtaining Tokens

**POST /auth/login/**

Request:
```json
{
  "email": "driver@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "email": "driver@example.com",
    "full_name": "John Driver",
    "role": "driver"
  }
}
```

### Using Tokens

Include the access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Refreshing Tokens

**POST /auth/token/refresh/**

Request:
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

Response:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

## Authentication Endpoints

### Register User

**POST /auth/register/**

Request:
```json
{
  "email": "driver@example.com",
  "full_name": "John Driver",
  "password": "SecurePassword123"
}
```

Response (201 Created):
```json
{
  "message": "Account created successfully",
  "user": {
    "id": 1,
    "email": "driver@example.com",
    "full_name": "John Driver",
    "role": "driver"
  }
}
```

### Request Password Reset

**POST /auth/password-reset/request/**

Request:
```json
{
  "email": "driver@example.com"
}
```

Response (200 OK):
```json
{
  "message": "If an account exists for the provided email, reset instructions have been sent."
}
```

### Confirm Password Reset

**POST /auth/password-reset/confirm/**

Request:
```json
{
  "uid": "1",
  "token": "reset-token-here",
  "new_password": "NewPassword123"
}
```

Response (200 OK):
```json
{
  "message": "Password updated successfully."
}
```

## Vehicle Management

### List Vehicles

**GET /vehicles/**

Response (200 OK):
```json
[
  {
    "id": 1,
    "truck_number": "TRUCK-001",
    "trailer_number": "TRAILER-001",
    "fuel_efficiency_mpg": 6.5
  }
]
```

### Create Vehicle

**POST /vehicles/**

Request:
```json
{
  "truck_number": "TRUCK-001",
  "trailer_number": "TRAILER-001",
  "fuel_efficiency_mpg": 6.5
}
```

Response (201 Created):
```json
{
  "id": 1,
  "truck_number": "TRUCK-001",
  "trailer_number": "TRAILER-001",
  "fuel_efficiency_mpg": 6.5
}
```

### Update Vehicle

**PATCH /vehicles/{id}/**

Request:
```json
{
  "fuel_efficiency_mpg": 7.0
}
```

Response (200 OK):
```json
{
  "id": 1,
  "truck_number": "TRUCK-001",
  "trailer_number": "TRAILER-001",
  "fuel_efficiency_mpg": 7.0
}
```

### Delete Vehicle

**DELETE /vehicles/{id}/**

Response (204 No Content)

## Trip Management

### Create Trip

**POST /trips/**

Request:
```json
{
  "pickup_location": "New York, NY",
  "dropoff_location": "Los Angeles, CA",
  "start_time": "2026-05-20T08:00:00Z",
  "vehicle_id": 1,
  "driver_type": "OTR",
  "rest_preferences": {
    "drive_block_hours": 4,
    "break_minutes": 30
  }
}
```

Response (201 Created):
```json
{
  "id": 1,
  "pickup_location": "New York, NY",
  "dropoff_location": "Los Angeles, CA",
  "start_time": "2026-05-20T08:00:00Z",
  "status": "draft",
  "total_distance_miles": 2800,
  "estimated_drive_hours": 46.67,
  "eta": "2026-05-22T06:40:00Z",
  "current_available_drive_hours": 11,
  "current_available_duty_hours": 14,
  "current_duty_status": "off_duty"
}
```

### List Trips

**GET /trips/?status=draft&ordering=-created_at&limit=20&offset=0**

Query Parameters:
- `status`: Filter by trip status (draft, planned, in_progress, completed, cancelled)
- `ordering`: Sort by field (created_at, start_time, status). Use `-` prefix for descending
- `limit`: Number of results per page (default: 20)
- `offset`: Pagination offset (default: 0)

Response (200 OK):
```json
{
  "count": 5,
  "next": "http://localhost:8000/api/v1/trips/?limit=20&offset=20",
  "previous": null,
  "results": [
    {
      "id": 1,
      "pickup_location": "New York, NY",
      "dropoff_location": "Los Angeles, CA",
      "status": "draft",
      "total_distance_miles": 2800,
      "estimated_drive_hours": 46.67
    }
  ]
}
```

### Get Trip Details

**GET /trips/{id}/**

Response (200 OK):
```json
{
  "id": 1,
  "pickup_location": "New York, NY",
  "dropoff_location": "Los Angeles, CA",
  "start_time": "2026-05-20T08:00:00Z",
  "status": "draft",
  "total_distance_miles": 2800,
  "estimated_drive_hours": 46.67,
  "eta": "2026-05-22T06:40:00Z",
  "current_available_drive_hours": 11,
  "current_available_duty_hours": 14,
  "current_duty_status": "off_duty",
  "duty_segments": [],
  "log_sheets": []
}
```

### Update Trip Status

**PATCH /trips/{id}/**

Request:
```json
{
  "status": "in_progress"
}
```

Response (200 OK):
```json
{
  "id": 1,
  "status": "in_progress",
  "actual_start_time": "2026-05-20T08:15:00Z"
}
```

## Duty Segments

### Create Duty Segment

**POST /trips/{trip_id}/duty-segments/**

Request:
```json
{
  "status": "driving",
  "start_time": "2026-05-20T08:00:00Z",
  "end_time": "2026-05-20T12:00:00Z",
  "remarks": "Drove to first rest stop"
}
```

Response (201 Created):
```json
{
  "id": 1,
  "status": "driving",
  "start_time": "2026-05-20T08:00:00Z",
  "end_time": "2026-05-20T12:00:00Z",
  "duration_hours": 4.0,
  "remarks": "Drove to first rest stop"
}
```

### List Duty Segments

**GET /trips/{trip_id}/duty-segments/**

Response (200 OK):
```json
[
  {
    "id": 1,
    "status": "driving",
    "start_time": "2026-05-20T08:00:00Z",
    "end_time": "2026-05-20T12:00:00Z",
    "duration_hours": 4.0,
    "remarks": "Drove to first rest stop"
  }
]
```

## Log Sheets

### Generate Log Sheet

**POST /trips/{trip_id}/log-sheets/**

Request:
```json
{
  "date": "2026-05-20"
}
```

Response (201 Created):
```json
{
  "id": 1,
  "date": "2026-05-20",
  "pdf_file": "http://localhost:8000/media/logs/trip_1_log_2026-05-20.pdf",
  "thumbnail": "http://localhost:8000/media/logs/thumbnails/trip_1_log_2026-05-20.png",
  "graph_data": {}
}
```

### List Log Sheets

**GET /trips/{trip_id}/log-sheets/**

Response (200 OK):
```json
[
  {
    "id": 1,
    "date": "2026-05-20",
    "pdf_file": "http://localhost:8000/media/logs/trip_1_log_2026-05-20.pdf",
    "thumbnail": "http://localhost:8000/media/logs/thumbnails/trip_1_log_2026-05-20.png",
    "graph_data": {}
  }
]
```

## Error Handling

All errors follow a consistent format:

```json
{
  "detail": "Error message describing what went wrong"
}
```

### Common Error Codes

- **400 Bad Request**: Validation error or invalid request format
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: User does not have permission to access this resource
- **404 Not Found**: Resource not found
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error

### Validation Errors

When validation fails, the response includes field-specific errors:

```json
{
  "pickup_location": ["Pickup location cannot be empty."],
  "start_time": ["Start time cannot be in the past."]
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Anonymous users**: 100 requests per hour
- **Authenticated users**: 1000 requests per hour
- **Login endpoint**: 5 requests per minute
- **Registration endpoint**: 10 requests per hour

When rate limit is exceeded, the API returns a 429 status code.

## Pagination

List endpoints support pagination with the following parameters:

- `limit`: Number of results per page (default: 20, max: 100)
- `offset`: Number of results to skip (default: 0)

Response includes:
- `count`: Total number of results
- `next`: URL for next page (null if no more pages)
- `previous`: URL for previous page (null if first page)
- `results`: Array of results

## Filtering and Sorting

### Filtering

Use query parameters to filter results:

```
GET /trips/?status=draft&driver=1
```

### Sorting

Use the `ordering` parameter to sort results:

```
GET /trips/?ordering=-created_at
GET /trips/?ordering=start_time
```

Use `-` prefix for descending order.
