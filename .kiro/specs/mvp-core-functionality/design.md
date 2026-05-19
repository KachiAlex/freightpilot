# MVP Core Functionality - Technical Design

## Overview

Freightpilot is a full-stack FMCSA-compliant trip management platform. This design document specifies the technical architecture, API contracts, data models, and implementation patterns for the MVP core functionality.

The system consists of:
- **Backend**: Django REST Framework API with JWT authentication
- **Frontend**: React SPA with React Query for data fetching
- **Database**: PostgreSQL with relational models
- **External Services**: Geopy for route estimation, ReportLab for PDF generation, Email service for password reset

## Architecture Overview

### System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ Auth Pages   │  │ Trip Pages   │  │ Vehicle Mgmt │           │
│  │ (Login,      │  │ (Planner,    │  │ (CRUD)       │           │
│  │  Register,   │  │  List,       │  │              │           │
│  │  Reset)      │  │  Detail)     │  │              │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│         │                  │                  │                  │
│         └──────────────────┼──────────────────┘                  │
│                            │                                     │
│                    ┌───────▼────────┐                            │
│                    │  API Client    │                            │
│                    │  (Axios +      │                            │
│                    │   JWT Auth)    │                            │
│                    └───────┬────────┘                            │
└─────────────────────────────┼──────────────────────────────────┘
                              │ HTTPS
                    ┌─────────▼──────────┐
                    │  Django REST API   │
                    │  ┌──────────────┐  │
                    │  │ Auth Views   │  │
                    │  │ Trip Views   │  │
                    │  │ Vehicle      │  │
                    │  │ DutySegment  │  │
                    │  │ LogSheet     │  │
                    │  └──────────────┘  │
                    │  ┌──────────────┐  │
                    │  │ Services     │  │
                    │  │ - HOS Calc   │  │
                    │  │ - Route Est  │  │
                    │  │ - PDF Gen    │  │
                    │  └──────────────┘  │
                    └─────────┬──────────┘
                              │
                    ┌─────────▼──────────┐
                    │   PostgreSQL DB    │
                    │  ┌──────────────┐  │
                    │  │ Users        │  │
                    │  │ Vehicles     │  │
                    │  │ Trips        │  │
                    │  │ DutyStatus   │  │
                    │  │ LogSheets    │  │
                    │  └──────────────┘  │
                    └────────────────────┘
```

### Authentication Flow

```
User Input (Email/Password)
         │
         ▼
   ┌─────────────────┐
   │ Login Request   │
   └────────┬────────┘
            │
            ▼
   ┌─────────────────────────────────┐
   │ Validate Credentials            │
   │ (Django authenticate)           │
   └────────┬────────────────────────┘
            │
            ├─ Invalid ──▶ Return 401
            │
            ▼
   ┌─────────────────────────────────┐
   │ Generate JWT Tokens             │
   │ - Access (15 min)               │
   │ - Refresh (7 days)              │
   └────────┬────────────────────────┘
            │
            ▼
   ┌─────────────────────────────────┐
   │ Store in localStorage           │
   │ - Authorization header          │
   └────────┬────────────────────────┘
            │
            ▼
   ┌─────────────────────────────────┐
   │ Redirect to Dashboard           │
   └─────────────────────────────────┘
```

### Trip Creation and HOS Flow

```
Trip Form Submission
         │
         ▼
   ┌──────────────────────────┐
   │ Validate Form Inputs     │
   │ - Locations              │
   │ - Start Time             │
   └────────┬─────────────────┘
            │
            ▼
   ┌──────────────────────────┐
   │ POST /api/v1/trips/      │
   │ Create Trip (status=     │
   │ draft)                   │
   └────────┬─────────────────┘
            │
            ▼
   ┌──────────────────────────┐
   │ Route Estimation Service │
   │ - Calculate distance     │
   │ - Calculate drive hours  │
   │ - Set ETA                │
   └────────┬─────────────────┘
            │
            ▼
   ┌──────────────────────────┐
   │ HOS Calculation Service  │
   │ - Initialize available   │
   │   drive hours (11h)      │
   │ - Initialize available   │
   │   duty hours (14h)       │
   └────────┬─────────────────┘
            │
            ▼
   ┌──────────────────────────┐
   │ Return Trip with         │
   │ Estimates & HOS Status   │
   └──────────────────────────┘
```


## Backend Design

### API Endpoint Specifications

#### Authentication Endpoints

**POST /api/v1/auth/register/**
- Request: `{ email, full_name, password, cdl_status?, home_terminal?, carrier_name?, phone_number? }`
- Response: `{ id, email, full_name, role }`
- Status: 201 Created | 400 Bad Request

**POST /api/v1/auth/login/**
- Request: `{ email, password }`
- Response: `{ access, refresh, user: { id, email, full_name, role } }`
- Status: 200 OK | 401 Unauthorized

**POST /api/v1/auth/token/refresh/**
- Request: `{ refresh }`
- Response: `{ access }`
- Status: 200 OK | 401 Unauthorized

**POST /api/v1/auth/password-reset/request/**
- Request: `{ email }`
- Response: `{ detail: "Check your email for reset instructions" }`
- Status: 200 OK (always, for security)

**POST /api/v1/auth/password-reset/confirm/**
- Request: `{ uid, token, new_password }`
- Response: `{ detail: "Password reset successful" }`
- Status: 200 OK | 400 Bad Request

#### Vehicle Endpoints

**POST /api/v1/vehicles/**
- Request: `{ truck_number, trailer_number?, fuel_efficiency_mpg }`
- Response: `{ id, truck_number, trailer_number, fuel_efficiency_mpg, driver }`
- Status: 201 Created | 400 Bad Request

**GET /api/v1/vehicles/**
- Query: `limit=20&offset=0`
- Response: `{ count, next, previous, results: [Vehicle] }`
- Status: 200 OK

**GET /api/v1/vehicles/{id}/**
- Response: `{ id, truck_number, trailer_number, fuel_efficiency_mpg, driver }`
- Status: 200 OK | 404 Not Found

**PATCH /api/v1/vehicles/{id}/**
- Request: `{ truck_number?, trailer_number?, fuel_efficiency_mpg? }`
- Response: `{ id, truck_number, trailer_number, fuel_efficiency_mpg, driver }`
- Status: 200 OK | 403 Forbidden | 404 Not Found

**DELETE /api/v1/vehicles/{id}/**
- Response: (empty)
- Status: 204 No Content | 403 Forbidden | 400 Bad Request

#### Trip Endpoints

**POST /api/v1/trips/**
- Request: `{ pickup_location, dropoff_location, start_time, vehicle_id?, notes?, rest_preferences? }`
- Response: `{ id, status, pickup_location, dropoff_location, start_time, total_distance_miles, estimated_drive_hours, eta, current_available_drive_hours, current_available_duty_hours, current_duty_status }`
- Status: 201 Created | 400 Bad Request

**GET /api/v1/trips/**
- Query: `limit=20&offset=0&status=draft&ordering=-created_at`
- Response: `{ count, next, previous, results: [Trip] }`
- Status: 200 OK

**GET /api/v1/trips/{id}/**
- Response: `{ id, status, pickup_location, dropoff_location, start_time, actual_start_time, actual_end_time, total_distance_miles, estimated_drive_hours, eta, current_available_drive_hours, current_available_duty_hours, current_duty_status, vehicle, duty_segments: [DutyStatus], log_sheets: [LogSheet] }`
- Status: 200 OK | 404 Not Found | 403 Forbidden

**PATCH /api/v1/trips/{id}/**
- Request: `{ status?, notes? }`
- Response: Trip object
- Status: 200 OK | 400 Bad Request | 403 Forbidden

**DELETE /api/v1/trips/{id}/**
- Response: (empty)
- Status: 204 No Content | 400 Bad Request | 403 Forbidden

#### Duty Segment Endpoints

**POST /api/v1/trips/{trip_id}/duty-segments/**
- Request: `{ status, start_time, end_time, remarks? }`
- Response: `{ id, trip, status, start_time, end_time, remarks, duration_hours }`
- Status: 201 Created | 400 Bad Request

**GET /api/v1/trips/{trip_id}/duty-segments/**
- Response: `[DutyStatus]` (chronological order)
- Status: 200 OK

**PATCH /api/v1/trips/{trip_id}/duty-segments/{id}/**
- Request: `{ status?, start_time?, end_time?, remarks? }`
- Response: DutyStatus object
- Status: 200 OK | 400 Bad Request

#### Log Sheet Endpoints

**POST /api/v1/trips/{trip_id}/log-sheets/**
- Request: `{ date }`
- Response: `{ id, trip, date, pdf_file, thumbnail, graph_data }`
- Status: 201 Created | 400 Bad Request

**GET /api/v1/trips/{trip_id}/log-sheets/**
- Response: `[LogSheet]`
- Status: 200 OK

### Database Schema

#### User Model
```
User
├── id (UUID, PK)
├── email (String, unique)
├── full_name (String)
├── password (String, hashed)
├── role (Enum: 'driver', 'dispatcher', 'admin')
├── cdl_status (String, nullable)
├── home_terminal (String, nullable)
├── carrier_name (String, nullable)
├── phone_number (String, nullable)
├── is_active (Boolean)
├── created_at (DateTime)
└── updated_at (DateTime)
```

#### Vehicle Model
```
Vehicle
├── id (UUID, PK)
├── driver (FK → User)
├── truck_number (String)
├── trailer_number (String, nullable)
├── fuel_efficiency_mpg (Float)
├── created_at (DateTime)
└── updated_at (DateTime)

Indexes:
- (driver, created_at)
```

#### Trip Model
```
Trip
├── id (UUID, PK)
├── driver (FK → User)
├── vehicle (FK → Vehicle, nullable)
├── status (Enum: 'draft', 'planned', 'in_progress', 'completed', 'cancelled')
├── pickup_location (String)
├── dropoff_location (String)
├── start_time (DateTime)
├── actual_start_time (DateTime, nullable)
├── actual_end_time (DateTime, nullable)
├── total_distance_miles (Float, nullable)
├── estimated_drive_hours (Float, nullable)
├── eta (DateTime, nullable)
├── current_duty_status (Enum: 'off_duty', 'sleeper_berth', 'driving', 'on_duty')
├── current_available_drive_hours (Float)
├── current_available_duty_hours (Float)
├── current_cycle_hours_used (Float)
├── notes (Text, nullable)
├── rest_preferences (JSON, nullable)
├── schedule_snapshot (JSON, nullable)
├── created_at (DateTime)
└── updated_at (DateTime)

Indexes:
- (driver, status, created_at)
- (driver, start_time)
```

#### DutyStatus Model
```
DutyStatus
├── id (UUID, PK)
├── trip (FK → Trip)
├── status (Enum: 'off_duty', 'sleeper_berth', 'driving', 'on_duty')
├── start_time (DateTime)
├── end_time (DateTime)
├── duration_hours (Float, computed)
├── remarks (Text, nullable)
├── created_at (DateTime)
└── updated_at (DateTime)

Indexes:
- (trip, start_time)
```

#### LogSheet Model
```
LogSheet
├── id (UUID, PK)
├── trip (FK → Trip)
├── date (Date)
├── pdf_file (FileField)
├── thumbnail (ImageField)
├── graph_data (JSON)
├── created_at (DateTime)
└── updated_at (DateTime)

Indexes:
- (trip, date)
```

### Service Layer Design

#### HOS Calculation Service

```python
class HOSCalculationService:
    INITIAL_DRIVE_HOURS = 11
    INITIAL_DUTY_HOURS = 14
    RESET_DRIVE_THRESHOLD = 10  # hours off-duty
    RESET_CYCLE_THRESHOLD = 34  # hours off-duty
    
    def calculate_available_hours(trip: Trip) -> dict:
        """
        Calculate available drive and duty hours based on duty segments.
        Returns: { available_drive_hours, available_duty_hours, cycle_hours_used }
        """
        
    def update_on_duty_segment_added(trip: Trip, segment: DutyStatus) -> None:
        """Update trip HOS status when duty segment is added."""
        
    def check_reset_conditions(trip: Trip, segment: DutyStatus) -> None:
        """Check if 10-hour or 34-hour reset conditions are met."""
```

#### Route Estimation Service

```python
class RouteEstimationService:
    AVERAGE_SPEED_MPH = 60
    
    def estimate_route(pickup: str, dropoff: str, start_time: datetime) -> dict:
        """
        Estimate route distance and drive time using geopy.
        Returns: { distance_miles, drive_hours, eta, coordinates }
        """
        
    def calculate_eta(distance_miles: float, start_time: datetime) -> datetime:
        """Calculate ETA based on distance and average speed."""
```

#### PDF Generation Service

```python
class LogSheetService:
    def generate_log_sheet(trip: Trip, date: date) -> LogSheet:
        """
        Generate FMCSA-compliant log sheet PDF.
        - Extract duty segments for the date
        - Create duty status graph
        - Generate PDF with ReportLab
        - Create thumbnail
        - Store graph_data as JSON
        """
```

### Serializers and Validation

#### User Serializer
- Email validation (format, uniqueness)
- Password validation (min 8 chars, complexity)
- Optional field handling

#### Trip Serializer
- Validate pickup/dropoff locations (non-empty)
- Validate start_time (not in past)
- Validate status transitions
- Nested serializers for duty_segments and log_sheets

#### DutyStatus Serializer
- Validate end_time > start_time
- Validate status enum values
- Calculate duration_hours

### Permission and Authorization Patterns

```python
class IsDriverOwner(BasePermission):
    """Only allow drivers to access their own resources."""
    def has_object_permission(self, request, view, obj):
        return obj.driver == request.user

class IsAuthenticatedDriver(BasePermission):
    """Only allow authenticated drivers."""
    def has_permission(self, request, view):
        return request.user and request.user.role == 'driver'
```

### Error Handling Strategy

All API errors follow this format:
```json
{
  "error_code": "VALIDATION_ERROR",
  "message": "Descriptive error message",
  "details": {
    "field_name": ["Error message for field"]
  }
}
```

Error codes:
- `VALIDATION_ERROR` (400)
- `AUTHENTICATION_REQUIRED` (401)
- `PERMISSION_DENIED` (403)
- `NOT_FOUND` (404)
- `CONFLICT` (409)
- `SERVER_ERROR` (500)


## Frontend Design

### Component Hierarchy

```
App
├── AuthContext (JWT token management)
├── Routes
│   ├── /login → LoginPage
│   ├── /register → RegisterPage
│   ├── /password-reset → PasswordResetRequestPage
│   ├── /password-reset/confirm → PasswordResetConfirmPage
│   ├── /dashboard → Dashboard
│   │   ├── TripList
│   │   │   ├── TripFilterBar
│   │   │   └── TripCard (clickable)
│   │   └── VehicleManagement
│   │       ├── VehicleList
│   │       └── VehicleForm
│   └── /trips/:id → TripDetailPage
│       ├── TripHeader
│       ├── TripInfo
│       ├── HOSClock (if in_progress)
│       ├── MapPlaceholder
│       ├── DutySegmentList
│       ├── DutySegmentForm
│       └── LogSheetList
```

### State Management

**AuthContext** (Context API)
- `user`: Current user object
- `tokens`: { access, refresh }
- `login(email, password)`: Authenticate user
- `logout()`: Clear tokens and redirect
- `refreshToken()`: Refresh access token

**React Query** (Data fetching)
- `useTrips()`: Fetch paginated trips with filters
- `useTrip(id)`: Fetch single trip with nested data
- `useVehicles()`: Fetch user's vehicles
- `useDutySegments(tripId)`: Fetch duty segments
- `useLogSheets(tripId)`: Fetch log sheets

### Form Handling and Validation

**Validation Schema** (using Zod or Yup)
```
LoginForm:
  - email: required, valid email
  - password: required, min 8 chars

RegisterForm:
  - email: required, valid email, unique
  - full_name: required
  - password: required, min 8 chars
  - cdl_status: optional
  - home_terminal: optional
  - carrier_name: optional
  - phone_number: optional

TripPlannerForm:
  - pickup_location: required, non-empty
  - dropoff_location: required, non-empty
  - start_time: required, future date
  - vehicle_id: optional
  - notes: optional
  - rest_preferences: optional

DutySegmentForm:
  - status: required, enum
  - start_time: required
  - end_time: required, > start_time
  - remarks: optional
```

### API Integration Patterns

**API Client** (Axios instance)
```javascript
const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor: Add JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Attempt token refresh
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const { data } = await axios.post('/api/v1/auth/token/refresh/', {
            refresh: refreshToken
          });
          localStorage.setItem('access_token', data.access);
          // Retry original request
          return apiClient(error.config);
        } catch {
          // Redirect to login
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
```

### Loading and Error State Management

**useAsync Hook** (Custom hook)
```javascript
function useAsync(asyncFunction, immediate = true) {
  const [status, setStatus] = useState('idle');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    setStatus('pending');
    try {
      const response = await asyncFunction();
      setData(response);
      setStatus('success');
    } catch (err) {
      setError(err);
      setStatus('error');
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) execute();
  }, [execute, immediate]);

  return { status, data, error, execute };
}
```

### Real-Time Update Mechanisms

**HOS Clock Polling** (TripDetailPage)
```javascript
useEffect(() => {
  if (trip?.status !== 'in_progress') return;

  const interval = setInterval(() => {
    // Fetch fresh trip data every 60 seconds
    queryClient.invalidateQueries(['trip', tripId]);
  }, 60000);

  return () => clearInterval(interval);
}, [trip?.status, tripId]);
```

### Component Specifications

#### TripPlannerForm
- Props: `{ onPreviewChange, onSuccess }`
- State: Form values, validation errors, loading
- Behavior:
  - Real-time field validation
  - Submit calls POST /api/v1/trips/
  - On success: Display distance/time, call onPreviewChange
  - On error: Display error message

#### TripList
- Props: `{ status?, limit?, offset?, sort? }`
- State: Trips, pagination, loading, error
- Behavior:
  - Fetch trips on mount with filters
  - Display trip cards with summary
  - Support pagination controls
  - Click trip card → navigate to detail page

#### TripDetailPage
- Props: `{ tripId }`
- State: Trip data, duty segments, log sheets, loading, error
- Behavior:
  - Fetch trip on mount
  - Display all trip information
  - If in_progress: Show HOSClock with 60s polling
  - Display MapPlaceholder with route
  - List duty segments and log sheets

#### MapPlaceholder
- Props: `{ pickup, dropoff, coordinates? }`
- Behavior:
  - Initialize Leaflet map
  - Add markers for pickup/dropoff
  - Draw line between markers
  - Center map to show both
  - Responsive to container size

#### HOSClock
- Props: `{ trip }`
- State: Current time, available hours
- Behavior:
  - Display current duty status
  - Show available drive hours (color-coded)
  - Show available duty hours (color-coded)
  - Show cycle hours used
  - Update every 60 seconds
  - Warning at <2 hours, critical at 0 hours
