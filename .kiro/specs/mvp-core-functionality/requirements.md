# MVP Core Functionality Requirements

## Introduction

Freightpilot is a full-stack FMCSA-compliant trip management platform designed for commercial drivers and dispatchers. This specification covers the Priority 1 MVP tasks required to deliver core functionality across authentication, trip planning, vehicle management, and real-time HOS (Hours of Service) compliance tracking.

The MVP enables drivers to register, authenticate, plan trips with route estimation, manage vehicles, view real-time HOS status, and generate FMCSA-compliant log sheets. The backend provides RESTful APIs with JWT authentication, while the frontend delivers a responsive React interface with real-time updates and map visualization.

## Glossary

- **Driver**: A user with the 'driver' role who operates vehicles and creates trips
- **Trip**: A planned or active journey from a pickup location to a dropoff location
- **Vehicle**: A truck and optional trailer assigned to a driver
- **HOS (Hours of Service)**: FMCSA regulations limiting driving and duty hours
- **Duty Status**: Current activity state (off-duty, sleeper berth, driving, on-duty)
- **Duty Segment**: A continuous period with a single duty status
- **Log Sheet**: FMCSA-compliant daily record of duty status and driving hours
- **JWT Token**: JSON Web Token used for stateless authentication
- **API Client**: Axios-based HTTP client with JWT interceptors
- **TripPlannerForm**: React component for creating and planning trips
- **TripList**: React component displaying paginated trip listings
- **TripDetailPage**: React page showing comprehensive trip information
- **MapPlaceholder**: React component for displaying trip routes using Leaflet
- **HOS Clock**: Real-time display of current duty status and available hours
- **Password Reset**: Secure token-based password recovery flow
- **Validation**: Client-side and server-side input verification

## Requirements

### Requirement 1: User Registration

**User Story:** As a new driver, I want to register an account with my email and credentials, so that I can access the Freightpilot platform.

#### Acceptance Criteria

1. WHEN a user submits the registration form with valid email, full name, password, and optional profile fields, THE RegisterPage SHALL validate all inputs and submit to the backend
2. WHEN the backend receives valid registration data, THE AuthService SHALL create a new User with role='driver' and return a success response
3. WHEN registration succeeds, THE RegisterPage SHALL redirect to the login page with a success message
4. IF the email already exists, THE AuthService SHALL return a 400 error with message "Email already registered"
5. IF the password is less than 8 characters, THE RegisterPage SHALL display a validation error before submission
6. IF the backend returns validation errors, THE RegisterPage SHALL display field-specific error messages
7. WHERE optional fields (CDL status, home terminal, carrier name, phone number) are provided, THE User model SHALL store them in the database

### Requirement 2: User Login

**User Story:** As a registered driver, I want to log in with my email and password, so that I can access my trips and vehicle information.

#### Acceptance Criteria

1. WHEN a user submits the login form with email and password, THE LoginPage SHALL validate inputs and submit to the backend
2. WHEN the backend receives valid credentials, THE FreightpilotTokenObtainPairSerializer SHALL return access and refresh JWT tokens
3. WHEN login succeeds, THE AuthContext SHALL store tokens in localStorage and redirect to the dashboard
4. IF credentials are invalid, THE AuthService SHALL return a 401 error with message "Invalid email or password"
5. WHEN the access token expires, THE apiClient interceptor SHALL automatically refresh using the refresh token
6. IF the refresh token is invalid or expired, THE apiClient SHALL clear stored tokens and redirect to login
7. THE access token SHALL include user role and full_name claims for frontend authorization

### Requirement 3: Password Reset Request

**User Story:** As a driver who forgot my password, I want to request a password reset, so that I can regain access to my account.

#### Acceptance Criteria

1. WHEN a user submits the password reset request form with their email, THE PasswordResetRequestPage SHALL submit to the backend
2. WHEN the backend receives a valid email, THE PasswordResetRequestSerializer SHALL generate a secure token and send a reset email
3. WHEN the email is sent, THE PasswordResetRequestPage SHALL display "Check your email for reset instructions"
4. IF the email does not exist in the system, THE PasswordResetRequestSerializer SHALL still display success (for security)
5. THE reset email SHALL contain a link with uid and token parameters pointing to the confirm page
6. THE reset link SHALL be valid for 24 hours from generation
7. WHEN the user clicks the reset link, THE PasswordResetConfirmPage SHALL load with uid and token from URL parameters

### Requirement 4: Password Reset Confirmation

**User Story:** As a driver resetting my password, I want to confirm my identity and set a new password, so that I can regain access with new credentials.

#### Acceptance Criteria

1. WHEN the PasswordResetConfirmPage loads, THE page SHALL extract uid and token from URL parameters
2. WHEN a user submits a new password, THE PasswordResetConfirmPage SHALL validate the password meets requirements (min 8 characters)
3. WHEN the backend receives valid uid, token, and new password, THE PasswordResetConfirmSerializer SHALL verify the token and update the user password
4. IF the token is invalid or expired, THE PasswordResetConfirmSerializer SHALL return a 400 error with message "Reset link is invalid or expired"
5. IF the new password fails validation, THE PasswordResetConfirmSerializer SHALL return validation errors
6. WHEN password reset succeeds, THE PasswordResetConfirmPage SHALL redirect to login with success message
7. THE password reset token SHALL be single-use and invalidated after successful reset

### Requirement 5: Vehicle Management - Create Vehicle

**User Story:** As a driver, I want to add my truck and trailer information, so that I can associate vehicles with my trips.

#### Acceptance Criteria

1. WHEN a driver submits vehicle data (truck number, trailer number, fuel efficiency), THE VehicleAPI SHALL create a Vehicle record linked to the authenticated driver
2. WHEN a vehicle is created, THE Vehicle model SHALL store truck_number, trailer_number, and fuel_efficiency_mpg
3. IF truck_number is missing, THE VehicleAPI SHALL return a 400 error with message "Truck number is required"
4. WHEN a vehicle is created, THE response SHALL include the vehicle id for use in trip creation
5. THE Vehicle model SHALL have a foreign key relationship to the User (driver)
6. WHEN a driver requests their vehicles, THE VehicleAPI SHALL return only vehicles belonging to that driver

### Requirement 6: Vehicle Management - List Vehicles

**User Story:** As a driver, I want to view all my vehicles, so that I can select one when planning a trip.

#### Acceptance Criteria

1. WHEN a driver requests their vehicle list, THE VehicleAPI SHALL return all vehicles where driver matches the authenticated user
2. THE response SHALL include vehicle id, truck_number, trailer_number, and fuel_efficiency_mpg
3. WHEN no vehicles exist, THE VehicleAPI SHALL return an empty list
4. THE VehicleAPI SHALL require authentication (JWT token)
5. IF the user is not authenticated, THE VehicleAPI SHALL return a 401 error

### Requirement 7: Vehicle Management - Update Vehicle

**User Story:** As a driver, I want to update my vehicle information, so that I can keep my truck and trailer details current.

#### Acceptance Criteria

1. WHEN a driver submits updated vehicle data, THE VehicleAPI SHALL update the Vehicle record if it belongs to the authenticated driver
2. IF the vehicle does not belong to the driver, THE VehicleAPI SHALL return a 403 error with message "You do not have permission to update this vehicle"
3. WHEN a vehicle is updated, THE response SHALL include the updated vehicle data
4. THE VehicleAPI SHALL support partial updates (PATCH)

### Requirement 8: Vehicle Management - Delete Vehicle

**User Story:** As a driver, I want to remove a vehicle from my account, so that I can manage my vehicle list.

#### Acceptance Criteria

1. WHEN a driver requests to delete a vehicle, THE VehicleAPI SHALL delete the Vehicle record if it belongs to the authenticated driver
2. IF the vehicle does not belong to the driver, THE VehicleAPI SHALL return a 403 error
3. WHEN a vehicle is deleted, THE VehicleAPI SHALL return a 204 No Content response
4. IF the vehicle is associated with active trips, THE VehicleAPI SHALL return a 400 error with message "Cannot delete vehicle with active trips"

### Requirement 9: Trip Creation with Route Estimation

**User Story:** As a driver, I want to plan a trip by entering pickup and dropoff locations, so that I can see estimated distance, drive time, and HOS impact.

#### Acceptance Criteria

1. WHEN a driver submits the TripPlannerForm with pickup location, dropoff location, and start time, THE form SHALL validate all required fields
2. WHEN the form is submitted, THE TripPlannerForm SHALL call the backend API to create a Trip
3. WHEN the backend receives trip data, THE TripAPI SHALL create a Trip record with status='draft'
4. WHEN a trip is created, THE RouteEstimationService SHALL calculate total_distance_miles and estimated_drive_hours
5. WHEN route estimation completes, THE Trip model SHALL store the calculated values
6. WHEN a trip is created, THE Trip model SHALL set current_available_drive_hours and current_available_duty_hours based on HOS regulations
7. IF pickup or dropoff location is missing, THE TripPlannerForm SHALL display a validation error
8. IF start_time is in the past, THE TripPlannerForm SHALL display a validation error
9. WHEN the trip is created successfully, THE TripPlannerForm SHALL display the estimated distance and drive time to the user

### Requirement 10: Trip List with Filtering and Pagination

**User Story:** As a driver, I want to view my trips with filtering and pagination, so that I can find specific trips and manage large trip lists.

#### Acceptance Criteria

1. WHEN a driver navigates to the dashboard, THE TripList component SHALL fetch trips from the TripAPI
2. WHEN trips are fetched, THE TripAPI SHALL return trips where driver matches the authenticated user
3. WHEN the TripAPI receives a status filter parameter, THE API SHALL return only trips matching that status
4. WHEN the TripAPI receives a limit and offset parameter, THE API SHALL return paginated results
5. WHEN the TripAPI receives a sort parameter, THE API SHALL sort trips by the specified field (created_at, start_time, status)
6. THE TripList component SHALL display trip summary (pickup location, dropoff location, status, start time)
7. WHEN a trip is clicked, THE TripList component SHALL navigate to the TripDetailPage
8. WHEN no trips exist, THE TripList component SHALL display "No trips found"
9. THE TripAPI response SHALL include pagination metadata (count, next, previous)

### Requirement 11: Trip Detail Page

**User Story:** As a driver, I want to view comprehensive trip information, so that I can see all details including route, HOS status, and log sheets.

#### Acceptance Criteria

1. WHEN a driver navigates to a trip detail page, THE TripDetailPage SHALL fetch the trip from the TripAPI using the trip id
2. WHEN the trip is fetched, THE TripDetailPage SHALL display pickup location, dropoff location, start time, status, and vehicle information
3. WHEN the trip is fetched, THE TripDetailPage SHALL display current HOS status (current_duty_status, current_available_drive_hours, current_available_duty_hours)
4. WHEN the trip is fetched, THE TripDetailPage SHALL display estimated distance and drive time
5. WHEN the trip is fetched, THE TripDetailPage SHALL display all duty segments (DutyStatus records) in chronological order
6. WHEN the trip is fetched, THE TripDetailPage SHALL display all log sheets (LogSheet records) with links to PDF files
7. IF the trip does not belong to the authenticated driver, THE TripAPI SHALL return a 403 error
8. WHEN the trip status is 'in_progress', THE TripDetailPage SHALL display a real-time HOS clock
9. THE TripDetailPage SHALL include a MapPlaceholder component showing the trip route

### Requirement 12: Map Display with Leaflet

**User Story:** As a driver, I want to see my trip route on a map, so that I can visualize the pickup and dropoff locations.

#### Acceptance Criteria

1. WHEN the TripDetailPage loads, THE MapPlaceholder component SHALL initialize a Leaflet map
2. WHEN the map initializes, THE MapPlaceholder SHALL display markers for pickup and dropoff locations
3. WHEN the map initializes, THE MapPlaceholder SHALL draw a line connecting pickup and dropoff locations
4. WHEN the map initializes, THE MapPlaceholder SHALL center the map to show both markers
5. WHEN a marker is clicked, THE MapPlaceholder SHALL display a popup with location name
6. THE MapPlaceholder SHALL use OpenStreetMap tiles for the base layer
7. THE MapPlaceholder SHALL be responsive and adapt to container size

### Requirement 13: Real-Time HOS Clock Display

**User Story:** As a driver on an active trip, I want to see my current HOS status and available hours in real-time, so that I can make informed decisions about driving and rest.

#### Acceptance Criteria

1. WHEN a trip has status='in_progress', THE TripDetailPage SHALL display a HOS clock component
2. WHEN the HOS clock displays, THE component SHALL show current_duty_status (off-duty, sleeper berth, driving, on-duty)
3. WHEN the HOS clock displays, THE component SHALL show current_available_drive_hours with visual indicator (color-coded: green >4h, yellow 2-4h, red <2h)
4. WHEN the HOS clock displays, THE component SHALL show current_available_duty_hours with visual indicator
5. WHEN the HOS clock displays, THE component SHALL show current_cycle_hours_used
6. WHEN the trip is active, THE HOS clock SHALL update every 60 seconds by fetching fresh trip data
7. WHEN available hours drop below 2, THE HOS clock SHALL display a warning indicator
8. WHEN available hours reach 0, THE HOS clock SHALL display a critical alert

### Requirement 14: Duty Segment Management

**User Story:** As a driver, I want to record my duty status changes throughout a trip, so that I can maintain accurate FMCSA-compliant logs.

#### Acceptance Criteria

1. WHEN a driver updates their duty status, THE DutySegmentAPI SHALL create a DutyStatus record linked to the trip
2. WHEN a DutyStatus is created, THE record SHALL store status (off_duty, sleeper_berth, driving, on_duty), start_time, end_time, and optional remarks
3. WHEN a DutyStatus is created, THE TripAPI SHALL update the trip's current_duty_status field
4. WHEN a DutyStatus is created, THE HOS calculation service SHALL recalculate available hours based on the new segment
5. WHEN duty segments are fetched, THE DutySegmentAPI SHALL return all segments for a trip in chronological order
6. IF end_time is before start_time, THE DutySegmentAPI SHALL return a 400 error with message "End time must be after start time"
7. WHEN a duty segment is updated, THE DutySegmentAPI SHALL update the record if it belongs to the authenticated driver's trip

### Requirement 15: Log Sheet Generation and Storage

**User Story:** As a driver, I want to generate and store FMCSA-compliant log sheets, so that I can maintain required records for inspections.

#### Acceptance Criteria

1. WHEN a driver requests a log sheet for a specific date, THE LogSheetAPI SHALL generate a LogSheet record for that date
2. WHEN a LogSheet is generated, THE LogSheetService SHALL create a PDF file containing duty status graph and summary
3. WHEN a LogSheet is generated, THE LogSheetService SHALL create a thumbnail image of the PDF
4. WHEN a LogSheet is generated, THE LogSheetService SHALL extract graph_data (duty status timeline) from duty segments
5. WHEN a LogSheet is stored, THE LogSheet model SHALL link it to the trip and store the date
6. WHEN log sheets are fetched, THE LogSheetAPI SHALL return all log sheets for a trip with PDF file URLs
7. IF a log sheet already exists for the date, THE LogSheetAPI SHALL return the existing record
8. WHEN a log sheet is requested, THE response SHALL include pdf_file URL, thumbnail URL, and graph_data

### Requirement 16: Trip Status Transitions

**User Story:** As a driver, I want to update my trip status from draft to planned to in-progress to completed, so that I can track trip lifecycle.

#### Acceptance Criteria

1. WHEN a trip is created, THE Trip model SHALL have status='draft'
2. WHEN a driver updates a trip to status='planned', THE TripAPI SHALL validate that all required fields are populated
3. WHEN a trip transitions to status='in_progress', THE TripAPI SHALL record the actual start time
4. WHEN a trip transitions to status='completed', THE TripAPI SHALL record the actual end time and calculate total_distance_miles if not already set
5. IF a trip is in status='in_progress', THE TripAPI SHALL prevent deletion
6. WHEN a trip status changes, THE TripAPI SHALL return the updated trip with new status
7. WHEN a trip is cancelled, THE TripAPI SHALL set status='cancelled' and record cancellation reason in notes

### Requirement 17: API Authentication and Authorization

**User Story:** As the system, I want to enforce JWT authentication and authorization, so that only authenticated drivers can access their own data.

#### Acceptance Criteria

1. WHEN a request is made without a JWT token, THE API SHALL return a 401 error with message "Authentication credentials were not provided"
2. WHEN a request includes an invalid JWT token, THE API SHALL return a 401 error with message "Invalid token"
3. WHEN a request includes an expired JWT token, THE apiClient interceptor SHALL automatically refresh the token
4. WHEN a driver requests another driver's trip, THE TripAPI SHALL return a 403 error with message "You do not have permission to access this trip"
5. WHEN a driver requests another driver's vehicle, THE VehicleAPI SHALL return a 403 error
6. WHEN a driver requests another driver's duty segments, THE DutySegmentAPI SHALL return a 403 error
7. THE JWT token SHALL include user id, email, role, and full_name claims
8. WHEN a token is refreshed, THE apiClient SHALL update the Authorization header with the new token

### Requirement 18: API Error Handling

**User Story:** As a developer, I want consistent error responses from the API, so that the frontend can handle errors predictably.

#### Acceptance Criteria

1. WHEN an API request fails, THE response SHALL include an error code and descriptive message
2. WHEN validation fails, THE API SHALL return a 400 error with field-specific error messages
3. WHEN authentication fails, THE API SHALL return a 401 error
4. WHEN authorization fails, THE API SHALL return a 403 error
5. WHEN a resource is not found, THE API SHALL return a 404 error
6. WHEN a server error occurs, THE API SHALL return a 500 error with a generic message (no internal details)
7. WHEN an error occurs, THE frontend SHALL display a user-friendly error message
8. WHEN a network error occurs, THE apiClient SHALL retry the request up to 3 times before failing

### Requirement 19: Frontend Form Validation

**User Story:** As a user, I want form validation to provide immediate feedback, so that I can correct errors before submission.

#### Acceptance Criteria

1. WHEN a user types in a form field, THE form SHALL validate the field in real-time
2. WHEN a required field is empty, THE form SHALL display "This field is required"
3. WHEN an email field is invalid, THE form SHALL display "Please enter a valid email address"
4. WHEN a password field is less than 8 characters, THE form SHALL display "Password must be at least 8 characters"
5. WHEN a date field is in the past, THE form SHALL display "Date must be in the future"
6. WHEN a form has validation errors, THE submit button SHALL be disabled
7. WHEN all validations pass, THE submit button SHALL be enabled
8. WHEN a form is submitted, THE frontend SHALL display a loading state on the submit button

### Requirement 20: Frontend Loading and Error States

**User Story:** As a user, I want to see loading indicators and error messages, so that I understand what the application is doing.

#### Acceptance Criteria

1. WHEN data is being fetched, THE component SHALL display a loading spinner
2. WHEN an API request fails, THE component SHALL display an error message with a retry button
3. WHEN a request is retried, THE component SHALL clear the error message and show loading state
4. WHEN data is successfully loaded, THE component SHALL hide the loading spinner
5. WHEN a form is being submitted, THE submit button SHALL show a loading spinner and be disabled
6. WHEN form submission fails, THE form SHALL display the error message and re-enable the submit button
7. WHEN form submission succeeds, THE form SHALL display a success message and redirect after 2 seconds

### Requirement 21: Trip Planning Form Integration

**User Story:** As a driver, I want the TripPlannerForm to integrate with the backend API, so that my trip data is saved and route estimation is calculated.

#### Acceptance Criteria

1. WHEN the TripPlannerForm is submitted, THE form SHALL validate all required fields (pickup location, dropoff location, start time)
2. WHEN the form is submitted, THE form SHALL call POST /api/v1/trips/ with the trip data
3. WHEN the API returns a trip, THE form SHALL display the estimated distance and drive time
4. WHEN the form is submitted, THE form SHALL call onPreviewChange callback with the trip data
5. WHEN the form receives an error response, THE form SHALL display the error message
6. WHEN the form is submitted successfully, THE form SHALL reset and display a success message
7. THE form SHALL support optional fields (vehicle_id, notes, rest_preferences)

### Requirement 22: Trip List Data Fetching

**User Story:** As a driver, I want the TripList component to fetch and display my trips, so that I can see all my planned and active trips.

#### Acceptance Criteria

1. WHEN the TripList component mounts, THE component SHALL fetch trips from GET /api/v1/trips/
2. WHEN the API returns trips, THE component SHALL display each trip with pickup location, dropoff location, status, and start time
3. WHEN the component receives a status filter prop, THE component SHALL fetch trips with ?status=<status> query parameter
4. WHEN the component receives a limit and offset prop, THE component SHALL fetch trips with ?limit=<limit>&offset=<offset> query parameters
5. WHEN the component receives a sort prop, THE component SHALL fetch trips with ?ordering=<sort> query parameter
6. WHEN a trip is clicked, THE component SHALL navigate to /trips/<trip_id>
7. WHEN the API returns an error, THE component SHALL display an error message with a retry button
8. WHEN the component is loading, THE component SHALL display a loading spinner

### Requirement 23: Trip Detail Page Data Fetching

**User Story:** As a driver, I want the TripDetailPage to fetch and display comprehensive trip information, so that I can see all details about my trip.

#### Acceptance Criteria

1. WHEN the TripDetailPage mounts, THE page SHALL extract the trip_id from the URL parameter
2. WHEN the trip_id is extracted, THE page SHALL fetch the trip from GET /api/v1/trips/<trip_id>/
3. WHEN the API returns the trip, THE page SHALL display all trip information including duty segments and log sheets
4. WHEN the trip status is 'in_progress', THE page SHALL display a real-time HOS clock that updates every 60 seconds
5. WHEN the page receives an error response, THE page SHALL display an error message
6. IF the trip does not exist, THE page SHALL display "Trip not found"
7. IF the user is not authorized, THE page SHALL display "You do not have permission to view this trip"

### Requirement 24: API Response Pagination

**User Story:** As a developer, I want API responses to include pagination metadata, so that the frontend can implement pagination controls.

#### Acceptance Criteria

1. WHEN the TripAPI returns a list of trips, THE response SHALL include count (total number of trips)
2. WHEN the TripAPI returns a list of trips, THE response SHALL include next (URL to next page or null)
3. WHEN the TripAPI returns a list of trips, THE response SHALL include previous (URL to previous page or null)
4. WHEN the TripAPI returns a list of trips, THE response SHALL include results (array of trip objects)
5. WHEN limit and offset are provided, THE API SHALL return the specified page of results
6. WHEN limit is not provided, THE API SHALL default to limit=20
7. WHEN offset is not provided, THE API SHALL default to offset=0

### Requirement 25: API Sorting and Filtering

**User Story:** As a developer, I want the API to support sorting and filtering, so that the frontend can provide flexible data views.

#### Acceptance Criteria

1. WHEN the TripAPI receives an ordering parameter, THE API SHALL sort trips by the specified field
2. WHEN the TripAPI receives ordering=created_at, THE API SHALL sort by creation date (ascending)
3. WHEN the TripAPI receives ordering=-created_at, THE API SHALL sort by creation date (descending)
4. WHEN the TripAPI receives a status filter, THE API SHALL return only trips with that status
5. WHEN the TripAPI receives multiple filter parameters, THE API SHALL apply all filters (AND logic)
6. WHEN the TripAPI receives an invalid filter value, THE API SHALL return a 400 error
7. THE API SHALL support filtering by status, driver, vehicle, and date range

### Requirement 26: Password Validation

**User Story:** As the system, I want to enforce strong password requirements, so that user accounts are secure.

#### Acceptance Criteria

1. WHEN a password is set, THE system SHALL require minimum 8 characters
2. WHEN a password is set, THE system SHALL validate using Django's password validators
3. WHEN a password is too common, THE system SHALL return an error "This password is too common"
4. WHEN a password is entirely numeric, THE system SHALL return an error "This password is entirely numeric"
5. WHEN a password is too similar to the email, THE system SHALL return an error "The password is too similar to the email address"

### Requirement 27: Email Validation

**User Story:** As the system, I want to validate email addresses, so that users can be contacted and accounts are unique.

#### Acceptance Criteria

1. WHEN a user registers, THE system SHALL validate the email format
2. WHEN a user registers with an invalid email, THE system SHALL return an error "Enter a valid email address"
3. WHEN a user registers with an existing email, THE system SHALL return an error "Email already registered"
4. WHEN a user requests a password reset, THE system SHALL validate the email format
5. THE email validation SHALL be case-insensitive for uniqueness checks

### Requirement 28: HOS Calculation Service

**User Story:** As the system, I want to calculate available HOS hours based on duty segments, so that drivers can see accurate remaining hours.

#### Acceptance Criteria

1. WHEN a trip is created, THE HOS service SHALL initialize current_available_drive_hours to 11 hours
2. WHEN a trip is created, THE HOS service SHALL initialize current_available_duty_hours to 14 hours
3. WHEN a duty segment with status='driving' is added, THE HOS service SHALL decrement current_available_drive_hours
4. WHEN a duty segment with status='on_duty' is added, THE HOS service SHALL decrement current_available_duty_hours
5. WHEN a duty segment with status='sleeper_berth' is added, THE HOS service SHALL not decrement available hours
6. WHEN a duty segment with status='off_duty' is added, THE HOS service SHALL not decrement available hours
7. WHEN a 10-hour off-duty period is recorded, THE HOS service SHALL reset current_available_drive_hours to 11
8. WHEN a 34-hour off-duty period is recorded, THE HOS service SHALL reset the 7-day cycle

### Requirement 29: Route Estimation Service

**User Story:** As the system, I want to estimate trip distance and drive time, so that drivers can plan their trips accurately.

#### Acceptance Criteria

1. WHEN a trip is created with pickup and dropoff locations, THE route service SHALL calculate total_distance_miles
2. WHEN a trip is created, THE route service SHALL calculate estimated_drive_hours based on distance and average speed
3. WHEN a trip is created, THE route service SHALL use 60 mph as the average speed for estimation
4. WHEN a trip is created, THE route service SHALL set eta based on start_time and estimated_drive_hours
5. IF the route service cannot calculate the route, THE trip SHALL be created with null distance and eta values
6. WHEN a trip is created, THE route service SHALL store the route coordinates in schedule_snapshot

### Requirement 30: User Profile Completeness

**User Story:** As a driver, I want to provide optional profile information, so that my account is complete and accurate.

#### Acceptance Criteria

1. WHEN a user registers, THE system SHALL accept optional fields (CDL status, home terminal, carrier name, phone number)
2. WHEN a user updates their profile, THE system SHALL update the optional fields
3. WHEN optional fields are not provided, THE system SHALL store them as empty strings or null
4. WHEN a user views their profile, THE system SHALL display all fields including optional ones
5. THE User model SHALL have fields for cdl_status, home_terminal, carrier_name, and phone_number

