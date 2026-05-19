# Implementation Plan: MVP Core Functionality

## Overview

This implementation plan breaks down the MVP core functionality into discrete, incremental coding tasks. Each task builds on previous steps, with testing integrated throughout. The plan covers backend API development (Django REST Framework), frontend components (React), and service layer implementation.

## Phase 1: Backend Foundation - API Setup & Authentication

- [x] 1.1 Set up Django project structure and core configuration
  - Create Django app structure with proper settings for development/production
  - Configure PostgreSQL database connection
  - Set up Django REST Framework with JWT authentication
  - Configure CORS for frontend integration
  - _Requirements: 17 (API Authentication and Authorization)_

- [x] 1.2 Create User model with authentication fields
  - Implement custom User model with email, full_name, role, and optional profile fields
  - Add password hashing and validation
  - Create database migrations
  - _Requirements: 1 (User Registration), 2 (User Login), 26 (Password Validation), 27 (Email Validation)_

- [x] 1.3 Implement registration endpoint (POST /api/v1/auth/register/)
  - Create UserSerializer with validation for email uniqueness and password strength
  - Implement registration view that creates User with role='driver'
  - Add email format and password validation
  - Return user data on success
  - _Requirements: 1 (User Registration), 26 (Password Validation), 27 (Email Validation)_

- [ ]* 1.4 Write unit tests for registration endpoint
  - Test successful registration with valid data
  - Test email uniqueness validation
  - Test password strength validation
  - Test optional field handling
  - _Requirements: 1 (User Registration)_

- [x] 1.5 Implement login endpoint (POST /api/v1/auth/login/)
  - Create FreightpilotTokenObtainPairSerializer extending TokenObtainPairSerializer
  - Add user role and full_name to JWT token claims
  - Implement login view that returns access and refresh tokens
  - _Requirements: 2 (User Login), 17 (API Authentication and Authorization)_

- [ ]* 1.6 Write unit tests for login endpoint
  - Test successful login with valid credentials
  - Test invalid credentials return 401
  - Test JWT token structure includes user claims
  - _Requirements: 2 (User Login)_

- [x] 1.7 Implement token refresh endpoint (POST /api/v1/auth/token/refresh/)
  - Create refresh token view using DRF's TokenRefreshView
  - Return new access token
  - _Requirements: 2 (User Login), 17 (API Authentication and Authorization)_

- [ ]* 1.8 Write unit tests for token refresh endpoint
  - Test successful token refresh with valid refresh token
  - Test invalid refresh token returns 401
  - _Requirements: 2 (User Login)_

- [x] 1.9 Implement password reset request endpoint (POST /api/v1/auth/password-reset/request/)
  - Create PasswordResetRequestSerializer
  - Generate secure reset token with 24-hour expiration
  - Implement email sending for password reset link
  - Return success message (always, for security)
  - _Requirements: 3 (Password Reset Request)_

- [ ]* 1.10 Write unit tests for password reset request endpoint
  - Test successful request with valid email
  - Test non-existent email returns success (for security)
  - Test reset email is sent with valid token
  - _Requirements: 3 (Password Reset Request)_

- [x] 1.11 Implement password reset confirmation endpoint (POST /api/v1/auth/password-reset/confirm/)
  - Create PasswordResetConfirmSerializer
  - Validate uid and token
  - Update user password if token is valid
  - Invalidate token after successful reset
  - _Requirements: 4 (Password Reset Confirmation)_

- [ ]* 1.12 Write unit tests for password reset confirmation endpoint
  - Test successful password reset with valid token
  - Test invalid token returns 400
  - Test expired token returns 400
  - Test password validation on reset
  - _Requirements: 4 (Password Reset Confirmation)_

- [x] 1.13 Implement API error handling and response formatting
  - Create custom exception handler for consistent error responses
  - Implement error response format with error_code and message
  - Add field-specific error messages for validation errors
  - _Requirements: 18 (API Error Handling)_

- [ ]* 1.14 Write unit tests for error handling
  - Test 400 validation errors include field-specific messages
  - Test 401 authentication errors
  - Test 403 authorization errors
  - Test 404 not found errors
  - _Requirements: 18 (API Error Handling)_

- [x] 1.15 Checkpoint - Ensure all authentication tests pass
  - Ensure all tests pass, ask the user if questions arise.



## Phase 2: Backend - Vehicle Management

- [x] 2.1 Create Vehicle model and database schema
  - Implement Vehicle model with truck_number, trailer_number, fuel_efficiency_mpg
  - Add foreign key relationship to User (driver)
  - Create database indexes on (driver, created_at)
  - Create database migrations
  - _Requirements: 5 (Vehicle Management - Create Vehicle)_

- [x] 2.2 Implement VehicleViewSet with CRUD endpoints
  - Create VehicleSerializer with validation for truck_number (required)
  - Implement POST /api/v1/vehicles/ for vehicle creation
  - Implement GET /api/v1/vehicles/ for listing user's vehicles
  - Implement GET /api/v1/vehicles/{id}/ for retrieving single vehicle
  - Implement PATCH /api/v1/vehicles/{id}/ for updating vehicle
  - Implement DELETE /api/v1/vehicles/{id}/ for deleting vehicle
  - Add IsDriverOwner permission to restrict access to own vehicles
  - _Requirements: 5 (Create Vehicle), 6 (List Vehicles), 7 (Update Vehicle), 8 (Delete Vehicle)_

- [ ]* 2.3 Write unit tests for vehicle endpoints
  - Test vehicle creation with valid data
  - Test truck_number validation (required)
  - Test driver ownership enforcement
  - Test list returns only user's vehicles
  - Test update and delete operations
  - Test cannot delete vehicle with active trips
  - _Requirements: 5, 6, 7, 8 (Vehicle Management)_

- [ ] 2.4 Checkpoint - Ensure all vehicle tests pass
  - Ensure all tests pass, ask the user if questions arise.



## Phase 3: Backend - Trip Management Foundation

- [ ] 3.1 Create Trip model and database schema
  - Implement Trip model with all fields: status, pickup_location, dropoff_location, start_time, etc.
  - Add HOS-related fields: current_available_drive_hours, current_available_duty_hours, current_duty_status
  - Add foreign keys to User (driver) and Vehicle
  - Create database indexes on (driver, status, created_at) and (driver, start_time)
  - Create database migrations
  - _Requirements: 9 (Trip Creation), 16 (Trip Status Transitions)_

- [x] 3.2 Implement TripSerializer with validation
  - Create TripSerializer with validation for pickup_location, dropoff_location, start_time
  - Validate start_time is not in the past
  - Validate pickup and dropoff locations are non-empty
  - Support nested serializers for duty_segments and log_sheets
  - _Requirements: 9 (Trip Creation), 21 (Trip Planning Form Integration)_

- [x] 3.3 Implement RouteEstimationService
  - Create service class with estimate_route() method using geopy
  - Calculate total_distance_miles based on pickup/dropoff locations
  - Calculate estimated_drive_hours using 60 mph average speed
  - Calculate ETA based on start_time and estimated_drive_hours
  - Handle cases where route cannot be calculated (return null values)
  - _Requirements: 9 (Trip Creation), 29 (Route Estimation Service)_

- [x]* 3.4 Write unit tests for RouteEstimationService
  - Test distance calculation for known routes
  - Test drive hours calculation
  - Test ETA calculation
  - Test handling of invalid locations
  - _Requirements: 29 (Route Estimation Service)_

- [x] 3.5 Implement HOSCalculationService
  - Create service class with calculate_available_hours() method
  - Initialize available_drive_hours to 11 and available_duty_hours to 14
  - Implement logic to decrement hours based on duty segment status
  - Implement 10-hour reset condition for drive hours
  - Implement 34-hour reset condition for cycle
  - _Requirements: 28 (HOS Calculation Service)_

- [x]* 3.6 Write unit tests for HOSCalculationService
  - Test initial HOS values (11 drive, 14 duty)
  - Test drive hours decrement on driving segment
  - Test duty hours decrement on on_duty segment
  - Test no decrement on sleeper_berth and off_duty
  - Test 10-hour reset condition
  - Test 34-hour reset condition
  - _Requirements: 28 (HOS Calculation Service)_

- [x] 3.7 Implement POST /api/v1/trips/ endpoint
  - Create TripViewSet with create() method
  - Validate all required fields
  - Call RouteEstimationService to calculate distance and ETA
  - Call HOSCalculationService to initialize HOS values
  - Set trip status to 'draft'
  - Return trip with all calculated values
  - _Requirements: 9 (Trip Creation), 29 (Route Estimation), 28 (HOS Calculation)_

- [x]* 3.8 Write unit tests for trip creation endpoint
  - Test successful trip creation with valid data
  - Test validation errors for missing locations
  - Test validation error for past start_time
  - Test route estimation is called and values stored
  - Test HOS initialization
  - _Requirements: 9 (Trip Creation)_

- [x] 3.9 Implement GET /api/v1/trips/ endpoint with filtering and pagination
  - Implement list() method with pagination (default limit=20, offset=0)
  - Add filtering by status parameter
  - Add sorting by ordering parameter (created_at, start_time, status)
  - Support ascending/descending sort with - prefix
  - Return paginated response with count, next, previous, results
  - Filter trips to only return user's trips
  - _Requirements: 10 (Trip List), 24 (API Response Pagination), 25 (API Sorting and Filtering)_

- [x]* 3.10 Write unit tests for trip list endpoint
  - Test pagination with limit and offset
  - Test status filtering
  - Test sorting by different fields
  - Test only user's trips are returned
  - Test pagination metadata in response
  - _Requirements: 10 (Trip List), 24 (Pagination), 25 (Sorting and Filtering)_

- [x] 3.11 Implement GET /api/v1/trips/{id}/ endpoint
  - Implement retrieve() method that returns trip with nested duty_segments and log_sheets
  - Add IsDriverOwner permission to restrict access
  - Return 403 if trip doesn't belong to user
  - _Requirements: 11 (Trip Detail Page), 17 (Authorization)_

- [x]* 3.12 Write unit tests for trip detail endpoint
  - Test successful retrieval of own trip
  - Test 403 error when accessing other user's trip
  - Test nested duty_segments and log_sheets are included
  - _Requirements: 11 (Trip Detail Page)_

- [x] 3.13 Implement PATCH /api/v1/trips/{id}/ endpoint for status transitions
  - Implement update() method to handle status transitions
  - Validate status transitions (draft → planned → in_progress → completed)
  - Record actual_start_time when transitioning to in_progress
  - Record actual_end_time when transitioning to completed
  - Support cancellation with reason in notes
  - Prevent deletion of in_progress trips
  - _Requirements: 16 (Trip Status Transitions)_

- [x]* 3.14 Write unit tests for trip status transitions
  - Test valid status transitions
  - Test actual_start_time is recorded
  - Test actual_end_time is recorded
  - Test cancellation with reason
  - _Requirements: 16 (Trip Status Transitions)_

- [x] 3.15 Checkpoint - Ensure all trip management tests pass
  - Ensure all tests pass, ask the user if questions arise.



## Phase 4: Backend - Duty Segments & HOS Management

- [x] 4.1 Create DutyStatus model and database schema
  - Implement DutyStatus model with status, start_time, end_time, remarks, duration_hours
  - Add foreign key to Trip
  - Create database indexes on (trip, start_time)
  - Create database migrations
  - _Requirements: 14 (Duty Segment Management)_

- [x] 4.2 Implement DutyStatusSerializer with validation
  - Create serializer with validation for status enum values
  - Validate end_time > start_time
  - Calculate duration_hours automatically
  - _Requirements: 14 (Duty Segment Management)_

- [x] 4.3 Implement POST /api/v1/trips/{trip_id}/duty-segments/ endpoint
  - Create DutySegmentViewSet with create() method
  - Validate all required fields
  - Create DutyStatus record linked to trip
  - Call HOSCalculationService to recalculate available hours
  - Update trip's current_duty_status field
  - Return created duty segment
  - _Requirements: 14 (Duty Segment Management), 28 (HOS Calculation)_

- [ ]* 4.4 Write unit tests for duty segment creation
  - Test successful creation with valid data
  - Test validation error for end_time before start_time
  - Test HOS recalculation is triggered
  - Test trip's current_duty_status is updated
  - _Requirements: 14 (Duty Segment Management)_

- [x] 4.5 Implement GET /api/v1/trips/{trip_id}/duty-segments/ endpoint
  - Implement list() method that returns all duty segments for a trip
  - Return segments in chronological order (sorted by start_time)
  - Add IsDriverOwner permission
  - _Requirements: 14 (Duty Segment Management)_

- [ ]* 4.6 Write unit tests for duty segment list endpoint
  - Test returns all segments for trip
  - Test segments are in chronological order
  - Test 403 error for unauthorized access
  - _Requirements: 14 (Duty Segment Management)_

- [x] 4.7 Implement PATCH /api/v1/trips/{trip_id}/duty-segments/{id}/ endpoint
  - Implement update() method for duty segment updates
  - Validate end_time > start_time
  - Recalculate HOS when segment is updated
  - Add IsDriverOwner permission
  - _Requirements: 14 (Duty Segment Management)_

- [ ]* 4.8 Write unit tests for duty segment update
  - Test successful update with valid data
  - Test validation errors
  - Test HOS recalculation
  - _Requirements: 14 (Duty Segment Management)_

- [x] 4.9 Checkpoint - Ensure all duty segment tests pass
  - Ensure all tests pass, ask the user if questions arise.



## Phase 5: Backend - Log Sheets & PDF Generation

- [x] 5.1 Create LogSheet model and database schema
  - Implement LogSheet model with date, pdf_file, thumbnail, graph_data
  - Add foreign key to Trip
  - Create database indexes on (trip, date)
  - Create database migrations
  - _Requirements: 15 (Log Sheet Generation)_

- [x] 5.2 Implement LogSheetService for PDF generation
  - Create service class with generate_log_sheet() method
  - Extract duty segments for the specified date
  - Create duty status graph data (JSON format)
  - Generate FMCSA-compliant PDF using ReportLab
  - Create thumbnail image of PDF
  - Store graph_data as JSON
  - _Requirements: 15 (Log Sheet Generation)_

- [ ]* 5.3 Write unit tests for LogSheetService
  - Test log sheet generation with valid trip and date
  - Test graph_data extraction from duty segments
  - Test PDF file is created
  - Test thumbnail is created
  - _Requirements: 15 (Log Sheet Generation)_

- [x] 5.4 Implement LogSheetSerializer
  - Create serializer that includes pdf_file URL, thumbnail URL, and graph_data
  - _Requirements: 15 (Log Sheet Generation)_

- [x] 5.5 Implement POST /api/v1/trips/{trip_id}/log-sheets/ endpoint
  - Create LogSheetViewSet with create() method
  - Validate date parameter
  - Check if log sheet already exists for date (return existing if so)
  - Call LogSheetService to generate PDF and thumbnail
  - Create LogSheet record
  - Return log sheet with file URLs
  - _Requirements: 15 (Log Sheet Generation)_

- [ ]* 5.6 Write unit tests for log sheet creation endpoint
  - Test successful log sheet generation
  - Test returns existing log sheet if already generated
  - Test PDF file URL is included in response
  - _Requirements: 15 (Log Sheet Generation)_

- [x] 5.7 Implement GET /api/v1/trips/{trip_id}/log-sheets/ endpoint
  - Implement list() method that returns all log sheets for a trip
  - Include pdf_file URL, thumbnail URL, and graph_data
  - Add IsDriverOwner permission
  - _Requirements: 15 (Log Sheet Generation)_

- [ ]* 5.8 Write unit tests for log sheet list endpoint
  - Test returns all log sheets for trip
  - Test includes file URLs and graph_data
  - Test 403 error for unauthorized access
  - _Requirements: 15 (Log Sheet Generation)_

- [x] 5.9 Checkpoint - Ensure all log sheet tests pass
  - Ensure all tests pass, ask the user if questions arise.



## Phase 6: Frontend - Authentication Pages

- [x] 6.1 Set up React project structure and API client
  - Create React app with routing (React Router)
  - Set up Axios API client with JWT interceptors
  - Implement request interceptor to add Authorization header
  - Implement response interceptor to handle token refresh
  - Implement response interceptor to handle 401 errors and redirect to login
  - Create AuthContext for token management
  - _Requirements: 2 (User Login), 17 (API Authentication)_

- [ ] 6.2 Create form validation utilities
  - Implement email validation function
  - Implement password validation function (min 8 chars)
  - Implement location validation function (non-empty)
  - Implement date validation function (not in past)
  - _Requirements: 19 (Frontend Form Validation)_

- [x] 6.3 Implement LoginPage component
  - Create form with email and password fields
  - Add real-time field validation
  - Disable submit button if validation errors exist
  - Call POST /api/v1/auth/login/ on submit
  - Display loading state on submit button
  - On success: Store tokens in localStorage, redirect to dashboard
  - On error: Display error message
  - _Requirements: 2 (User Login), 19 (Form Validation), 20 (Loading and Error States)_

- [ ]* 6.4 Write component tests for LoginPage
  - Test form validation displays errors
  - Test submit button is disabled with errors
  - Test successful login redirects to dashboard
  - Test error message displays on failed login
  - _Requirements: 2 (User Login)_

- [x] 6.5 Implement RegisterPage component
  - Create form with email, full_name, password, and optional fields
  - Add real-time field validation
  - Validate password min 8 characters
  - Validate email format
  - Disable submit button if validation errors exist
  - Call POST /api/v1/auth/register/ on submit
  - Display loading state on submit button
  - On success: Display success message, redirect to login after 2 seconds
  - On error: Display field-specific error messages
  - _Requirements: 1 (User Registration), 19 (Form Validation), 20 (Loading and Error States)_

- [ ]* 6.6 Write component tests for RegisterPage
  - Test form validation displays errors
  - Test password min length validation
  - Test email format validation
  - Test successful registration redirects to login
  - Test error messages display on failed registration
  - _Requirements: 1 (User Registration)_

- [x] 6.7 Implement PasswordResetRequestPage component
  - Create form with email field
  - Add email validation
  - Call POST /api/v1/auth/password-reset/request/ on submit
  - Display loading state on submit button
  - On success: Display "Check your email for reset instructions"
  - On error: Display error message
  - _Requirements: 3 (Password Reset Request), 19 (Form Validation), 20 (Loading and Error States)_

- [ ]* 6.8 Write component tests for PasswordResetRequestPage
  - Test email validation
  - Test successful request displays success message
  - Test error message displays on failed request
  - _Requirements: 3 (Password Reset Request)_

- [x] 6.9 Implement PasswordResetConfirmPage component
  - Extract uid and token from URL parameters
  - Create form with new password field
  - Add password validation (min 8 chars)
  - Call POST /api/v1/auth/password-reset/confirm/ with uid, token, new_password
  - Display loading state on submit button
  - On success: Display success message, redirect to login after 2 seconds
  - On error: Display error message (handle invalid/expired token)
  - _Requirements: 4 (Password Reset Confirmation), 19 (Form Validation), 20 (Loading and Error States)_

- [ ]* 6.10 Write component tests for PasswordResetConfirmPage
  - Test password validation
  - Test successful reset redirects to login
  - Test error message for invalid token
  - Test error message for expired token
  - _Requirements: 4 (Password Reset Confirmation)_

- [x] 6.11 Checkpoint - Ensure all authentication pages work end-to-end
  - Ensure all tests pass, ask the user if questions arise.



## Phase 7: Frontend - Trip Planning

- [x] 7.1 Implement TripPlannerForm component
  - Create form with pickup_location, dropoff_location, start_time, vehicle_id, notes fields
  - Add real-time field validation
  - Validate pickup and dropoff are non-empty
  - Validate start_time is not in the past
  - Disable submit button if validation errors exist
  - Call POST /api/v1/trips/ on submit
  - Display loading state on submit button
  - On success: Display estimated distance and drive time, call onPreviewChange callback
  - On error: Display error message
  - _Requirements: 9 (Trip Creation), 21 (Trip Planning Form Integration), 19 (Form Validation), 20 (Loading and Error States)_

- [ ]* 7.2 Write component tests for TripPlannerForm
  - Test form validation displays errors
  - Test submit button is disabled with errors
  - Test successful trip creation displays distance and time
  - Test error message displays on failed creation
  - _Requirements: 9 (Trip Creation), 21 (Trip Planning Form Integration)_

- [ ] 7.3 Implement vehicle selection in TripPlannerForm
  - Fetch user's vehicles from GET /api/v1/vehicles/
  - Display vehicle dropdown with truck_number and trailer_number
  - Make vehicle_id optional
  - _Requirements: 9 (Trip Creation), 6 (List Vehicles)_

- [ ]* 7.4 Write component tests for vehicle selection
  - Test vehicles are fetched and displayed
  - Test vehicle can be selected
  - _Requirements: 6 (List Vehicles)_

- [x] 7.5 Checkpoint - Ensure trip planning form works end-to-end
  - Ensure all tests pass, ask the user if questions arise.



## Phase 8: Frontend - Trip List & Detail

- [x] 8.1 Implement TripList component with data fetching
  - Fetch trips from GET /api/v1/trips/ on component mount
  - Display trip cards with pickup location, dropoff location, status, start time
  - Support status filtering via props
  - Support pagination with limit and offset props
  - Support sorting via ordering prop
  - Display loading spinner while fetching
  - Display error message with retry button on error
  - Click trip card navigates to /trips/{trip_id}
  - Display "No trips found" when list is empty
  - _Requirements: 10 (Trip List), 22 (Trip List Data Fetching), 20 (Loading and Error States)_

- [ ]* 8.2 Write component tests for TripList
  - Test trips are fetched and displayed
  - Test status filtering works
  - Test pagination works
  - Test sorting works
  - Test error message displays on failed fetch
  - Test retry button works
  - _Requirements: 10 (Trip List), 22 (Trip List Data Fetching)_

- [x] 8.3 Implement TripDetailPage component
  - Extract trip_id from URL parameter
  - Fetch trip from GET /api/v1/trips/{trip_id}/ on mount
  - Display trip information: pickup, dropoff, start_time, status, vehicle
  - Display HOS status: current_duty_status, current_available_drive_hours, current_available_duty_hours
  - Display estimated distance and drive time
  - Display list of duty segments in chronological order
  - Display list of log sheets with PDF links
  - Display loading spinner while fetching
  - Display error message on failed fetch
  - Handle 403 error with "You do not have permission to view this trip"
  - Handle 404 error with "Trip not found"
  - _Requirements: 11 (Trip Detail Page), 23 (Trip Detail Page Data Fetching), 20 (Loading and Error States)_

- [ ]* 8.4 Write component tests for TripDetailPage
  - Test trip data is fetched and displayed
  - Test HOS status is displayed
  - Test duty segments are displayed
  - Test log sheets are displayed
  - Test error message for unauthorized access
  - Test error message for not found
  - _Requirements: 11 (Trip Detail Page), 23 (Trip Detail Page Data Fetching)_

- [ ] 8.5 Implement HOSClock component
  - Display current_duty_status
  - Display current_available_drive_hours with color coding (green >4h, yellow 2-4h, red <2h)
  - Display current_available_duty_hours with color coding
  - Display current_cycle_hours_used
  - Display warning indicator when available hours <2
  - Display critical alert when available hours = 0
  - Update every 60 seconds by invalidating trip query
  - _Requirements: 13 (Real-Time HOS Clock Display)_

- [ ]* 8.6 Write component tests for HOSClock
  - Test displays current duty status
  - Test color coding for available hours
  - Test warning indicator displays
  - Test critical alert displays
  - _Requirements: 13 (Real-Time HOS Clock Display)_

- [ ] 8.7 Implement HOSClock polling in TripDetailPage
  - Set up 60-second polling interval when trip status is 'in_progress'
  - Invalidate trip query to fetch fresh data
  - Clear interval when trip status changes or component unmounts
  - _Requirements: 13 (Real-Time HOS Clock Display), 23 (Trip Detail Page Data Fetching)_

- [ ]* 8.8 Write component tests for HOSClock polling
  - Test polling starts when trip is in_progress
  - Test polling stops when trip status changes
  - Test polling stops on component unmount
  - _Requirements: 13 (Real-Time HOS Clock Display)_

- [x] 8.9 Checkpoint - Ensure trip list and detail pages work end-to-end
  - Ensure all tests pass, ask the user if questions arise.



## Phase 9: Frontend - Map & Visualization

- [x] 9.1 Implement MapPlaceholder component with Leaflet
  - Initialize Leaflet map on component mount
  - Accept pickup and dropoff location props
  - Display markers for pickup and dropoff locations
  - Draw line connecting pickup and dropoff markers
  - Center map to show both markers with appropriate zoom
  - Add popup to markers showing location name
  - Use OpenStreetMap tiles for base layer
  - Make map responsive to container size
  - _Requirements: 12 (Map Display with Leaflet)_

- [ ]* 9.2 Write component tests for MapPlaceholder
  - Test map initializes with markers
  - Test line is drawn between markers
  - Test map centers to show both markers
  - Test popups display on marker click
  - Test map is responsive
  - _Requirements: 12 (Map Display with Leaflet)_

- [x] 9.3 Integrate MapPlaceholder into TripDetailPage
  - Pass pickup_location and dropoff_location to MapPlaceholder
  - Display map in trip detail view
  - _Requirements: 11 (Trip Detail Page), 12 (Map Display)_

- [x] 9.4 Checkpoint - Ensure map displays correctly in trip detail
  - Ensure all tests pass, ask the user if questions arise.



## Phase 10: Frontend - Vehicle Management

- [x] 10.1 Implement VehicleList component
  - Fetch vehicles from GET /api/v1/vehicles/ on component mount
  - Display vehicle cards with truck_number, trailer_number, fuel_efficiency_mpg
  - Display loading spinner while fetching
  - Display error message with retry button on error
  - Display "No vehicles found" when list is empty
  - Include button to add new vehicle
  - _Requirements: 6 (List Vehicles), 20 (Loading and Error States)_

- [ ]* 10.2 Write component tests for VehicleList
  - Test vehicles are fetched and displayed
  - Test error message displays on failed fetch
  - Test retry button works
  - _Requirements: 6 (List Vehicles)_

- [x] 10.3 Implement VehicleForm component
  - Create form with truck_number, trailer_number, fuel_efficiency_mpg fields
  - Add real-time field validation
  - Validate truck_number is required
  - Disable submit button if validation errors exist
  - Support both create and update modes
  - On create: Call POST /api/v1/vehicles/
  - On update: Call PATCH /api/v1/vehicles/{id}/
  - Display loading state on submit button
  - On success: Display success message, refresh vehicle list
  - On error: Display error message
  - _Requirements: 5 (Create Vehicle), 7 (Update Vehicle), 19 (Form Validation), 20 (Loading and Error States)_

- [ ]* 10.4 Write component tests for VehicleForm
  - Test form validation displays errors
  - Test truck_number is required
  - Test successful vehicle creation
  - Test successful vehicle update
  - Test error message displays on failed submission
  - _Requirements: 5 (Create Vehicle), 7 (Update Vehicle)_

- [ ] 10.5 Implement delete vehicle functionality
  - Add delete button to vehicle cards
  - Call DELETE /api/v1/vehicles/{id}/ on delete
  - Display confirmation dialog before delete
  - Display error message if vehicle has active trips
  - Refresh vehicle list on successful delete
  - _Requirements: 8 (Delete Vehicle)_

- [ ]* 10.6 Write component tests for delete vehicle
  - Test delete button triggers confirmation
  - Test successful deletion refreshes list
  - Test error message for vehicle with active trips
  - _Requirements: 8 (Delete Vehicle)_

- [ ] 10.7 Integrate VehicleList and VehicleForm into Dashboard
  - Display VehicleList component on dashboard
  - Display VehicleForm in modal or separate section
  - Allow switching between list and form views
  - _Requirements: 6 (List Vehicles), 5 (Create Vehicle), 7 (Update Vehicle)_

- [x] 10.8 Checkpoint - Ensure vehicle management works end-to-end
  - Ensure all tests pass, ask the user if questions arise.



## Phase 11: Frontend - Duty Segments & Log Sheets

- [x] 11.1 Implement DutySegmentForm component
  - Create form with status, start_time, end_time, remarks fields
  - Add real-time field validation
  - Validate end_time > start_time
  - Validate status is one of: off_duty, sleeper_berth, driving, on_duty
  - Disable submit button if validation errors exist
  - Call POST /api/v1/trips/{trip_id}/duty-segments/ on submit
  - Display loading state on submit button
  - On success: Refresh duty segments list, clear form
  - On error: Display error message
  - _Requirements: 14 (Duty Segment Management), 19 (Form Validation), 20 (Loading and Error States)_

- [ ]* 11.2 Write component tests for DutySegmentForm
  - Test form validation displays errors
  - Test end_time validation
  - Test successful duty segment creation
  - Test error message displays on failed submission
  - _Requirements: 14 (Duty Segment Management)_

- [x] 11.3 Implement DutySegmentList component
  - Fetch duty segments from GET /api/v1/trips/{trip_id}/duty-segments/
  - Display segments in chronological order
  - Show status, start_time, end_time, duration_hours, remarks
  - Display loading spinner while fetching
  - Display error message on failed fetch
  - _Requirements: 14 (Duty Segment Management), 20 (Loading and Error States)_

- [ ]* 11.4 Write component tests for DutySegmentList
  - Test duty segments are fetched and displayed
  - Test segments are in chronological order
  - Test error message displays on failed fetch
  - _Requirements: 14 (Duty Segment Management)_

- [x] 11.5 Implement LogSheetList component
  - Fetch log sheets from GET /api/v1/trips/{trip_id}/log-sheets/
  - Display log sheets with date, PDF link, thumbnail
  - Display loading spinner while fetching
  - Display error message on failed fetch
  - Include button to generate new log sheet
  - _Requirements: 15 (Log Sheet Generation), 20 (Loading and Error States)_

- [ ]* 11.6 Write component tests for LogSheetList
  - Test log sheets are fetched and displayed
  - Test PDF links are included
  - Test error message displays on failed fetch
  - _Requirements: 15 (Log Sheet Generation)_

- [x] 11.7 Implement LogSheetForm component
  - Create form with date field
  - Add date validation
  - Call POST /api/v1/trips/{trip_id}/log-sheets/ on submit
  - Display loading state on submit button
  - On success: Refresh log sheets list, display success message
  - On error: Display error message
  - _Requirements: 15 (Log Sheet Generation), 19 (Form Validation), 20 (Loading and Error States)_

- [ ]* 11.8 Write component tests for LogSheetForm
  - Test form validation displays errors
  - Test successful log sheet generation
  - Test error message displays on failed submission
  - _Requirements: 15 (Log Sheet Generation)_

- [x] 11.9 Integrate DutySegmentForm, DutySegmentList, LogSheetList, and LogSheetForm into TripDetailPage
  - Display DutySegmentList and DutySegmentForm on trip detail
  - Display LogSheetList and LogSheetForm on trip detail
  - Refresh lists when new segments or log sheets are created
  - _Requirements: 11 (Trip Detail Page), 14 (Duty Segment Management), 15 (Log Sheet Generation)_

- [x] 11.10 Checkpoint - Ensure duty segments and log sheets work end-to-end
  - Ensure all tests pass, ask the user if questions arise.



## Phase 12: Frontend - Dashboard & Navigation

- [x] 12.1 Implement Dashboard component
  - Create main dashboard page after login
  - Display TripPlannerForm for creating new trips
  - Display TripList component showing user's trips
  - Display VehicleManagement section with VehicleList and VehicleForm
  - Add navigation between sections
  - _Requirements: 9 (Trip Creation), 10 (Trip List), 5 (Vehicle Management)_

- [x] 12.2 Implement main navigation and routing
  - Create main App component with routing
  - Set up routes: /login, /register, /password-reset, /password-reset/confirm, /dashboard, /trips/:id
  - Implement ProtectedRoute component that requires authentication
  - Redirect unauthenticated users to /login
  - Redirect authenticated users away from auth pages
  - _Requirements: 2 (User Login), 17 (API Authentication)_

- [x] 12.3 Implement logout functionality
  - Add logout button to navigation
  - Clear tokens from localStorage on logout
  - Redirect to login page
  - _Requirements: 2 (User Login)_

- [x] 12.4 Implement AuthContext for token management
  - Store access and refresh tokens in context
  - Provide login() function that stores tokens
  - Provide logout() function that clears tokens
  - Provide refreshToken() function for token refresh
  - _Requirements: 2 (User Login), 17 (API Authentication)_

- [ ]* 12.5 Write component tests for Dashboard
  - Test dashboard displays after login
  - Test TripPlannerForm is displayed
  - Test TripList is displayed
  - Test VehicleManagement is displayed
  - _Requirements: 9 (Trip Creation), 10 (Trip List), 5 (Vehicle Management)_

- [x] 12.6 Checkpoint - Ensure dashboard and navigation work end-to-end
  - Ensure all tests pass, ask the user if questions arise.



## Phase 13: Integration & End-to-End Testing

- [x] 13.1 Set up end-to-end testing framework
  - Set up Cypress or Playwright for E2E testing
  - Configure test environment with test database
  - Create test utilities for API mocking and data setup
  - _Requirements: All_

- [x] 13.2 Write end-to-end test for user registration and login flow
  - Test user can register with valid data
  - Test user can log in with registered credentials
  - Test user is redirected to dashboard after login
  - Test tokens are stored in localStorage
  - _Requirements: 1 (Registration), 2 (Login)_

- [x] 13.3 Write end-to-end test for trip creation and planning flow
  - Test user can create a trip with valid data
  - Test route estimation is calculated
  - Test HOS values are initialized
  - Test trip appears in trip list
  - _Requirements: 9 (Trip Creation), 10 (Trip List), 28 (HOS Calculation), 29 (Route Estimation)_

- [x] 13.4 Write end-to-end test for vehicle management flow
  - Test user can create a vehicle
  - Test vehicle appears in vehicle list
  - Test user can update vehicle
  - Test user can delete vehicle
  - _Requirements: 5 (Create Vehicle), 6 (List Vehicles), 7 (Update Vehicle), 8 (Delete Vehicle)_

- [ ] 13.5 Write end-to-end test for duty segment and HOS flow
  - Test user can add duty segments to a trip
  - Test HOS values are recalculated
  - Test duty segments appear in trip detail
  - _Requirements: 14 (Duty Segment Management), 28 (HOS Calculation)_

- [ ] 13.6 Write end-to-end test for log sheet generation
  - Test user can generate log sheet
  - Test log sheet appears in trip detail
  - Test PDF file is accessible
  - _Requirements: 15 (Log Sheet Generation)_

- [ ] 13.7 Write end-to-end test for real-time HOS clock
  - Test HOS clock displays on in_progress trip
  - Test HOS clock updates every 60 seconds
  - Test color coding changes based on available hours
  - _Requirements: 13 (Real-Time HOS Clock Display)_

- [ ] 13.8 Write end-to-end test for password reset flow
  - Test user can request password reset
  - Test reset email is sent
  - Test user can confirm password reset with valid token
  - Test user can log in with new password
  - _Requirements: 3 (Password Reset Request), 4 (Password Reset Confirmation)_

- [ ] 13.9 Write end-to-end test for authorization and permissions
  - Test user cannot access other user's trips
  - Test user cannot access other user's vehicles
  - Test user cannot access other user's duty segments
  - Test API returns 403 for unauthorized access
  - _Requirements: 17 (API Authentication and Authorization)_

- [ ] 13.10 Write end-to-end test for error handling
  - Test validation errors are displayed
  - Test network errors are handled with retry
  - Test 401 errors trigger token refresh
  - Test 403 errors display permission denied message
  - _Requirements: 18 (API Error Handling), 20 (Loading and Error States)_

- [x] 13.11 Checkpoint - Ensure all end-to-end tests pass
  - Ensure all tests pass, ask the user if questions arise.



## Phase 14: Performance & Security Hardening

- [x] 14.1 Implement API rate limiting
  - Add rate limiting middleware to Django REST Framework
  - Limit authentication endpoints to prevent brute force
  - Limit general API endpoints to prevent abuse
  - Return 429 Too Many Requests when limit exceeded
  - _Requirements: 17 (API Authentication and Authorization)_

- [x] 14.2 Implement CORS security
  - Configure CORS to allow only frontend domain
  - Restrict allowed methods and headers
  - Set appropriate cache headers
  - _Requirements: 17 (API Authentication and Authorization)_

- [x] 14.3 Implement HTTPS and secure headers
  - Configure Django security middleware
  - Set HSTS header
  - Set X-Frame-Options header
  - Set X-Content-Type-Options header
  - Set Content-Security-Policy header
  - _Requirements: 17 (API Authentication and Authorization)_

- [x] 14.4 Implement input sanitization and validation
  - Validate all user inputs on backend
  - Sanitize location strings to prevent injection
  - Validate all numeric inputs
  - _Requirements: 18 (API Error Handling)_

- [x] 14.5 Optimize database queries
  - Add select_related() for foreign key relationships
  - Add prefetch_related() for reverse relationships
  - Create database indexes for frequently queried fields
  - _Requirements: All_

- [x] 14.6 Implement frontend performance optimizations
  - Code split React components with lazy loading
  - Implement React Query caching strategies
  - Optimize bundle size
  - _Requirements: All_

- [x] 14.7 Implement API response caching
  - Add cache headers to GET endpoints
  - Implement cache invalidation on mutations
  - Use React Query cache management
  - _Requirements: All_

- [x] 14.8 Checkpoint - Ensure performance and security hardening is complete
  - Ensure all tests pass, ask the user if questions arise.



## Phase 15: Documentation & Deployment Preparation

- [x] 15.1 Create API documentation
  - Document all API endpoints with request/response examples
  - Document authentication flow
  - Document error codes and messages
  - Create OpenAPI/Swagger specification
  - _Requirements: All_

- [x] 15.2 Create deployment guide
  - Document environment variables required
  - Document database setup and migrations
  - Document static file configuration
  - Document email service configuration
  - Document PDF generation dependencies
  - _Requirements: All_

- [x] 15.3 Create user guide
  - Document how to register and log in
  - Document how to create and manage vehicles
  - Document how to plan and manage trips
  - Document how to view HOS status
  - Document how to generate log sheets
  - _Requirements: All_

- [x] 15.4 Create developer guide
  - Document project structure
  - Document how to run tests
  - Document how to set up development environment
  - Document coding standards and conventions
  - _Requirements: All_

- [x] 15.5 Set up CI/CD pipeline
  - Configure automated testing on pull requests
  - Configure automated linting and code quality checks
  - Configure automated deployment to staging
  - _Requirements: All_

- [x] 15.6 Prepare production deployment
  - Set up production database
  - Configure production email service
  - Configure production static file storage
  - Set up monitoring and logging
  - _Requirements: All_

- [x] 15.7 Final testing and validation
  - Run full test suite
  - Verify all requirements are met
  - Verify all acceptance criteria are satisfied
  - Perform manual testing of all features
  - _Requirements: All_

- [x] 15.8 Final checkpoint - MVP is ready for deployment
  - Ensure all tests pass, ask the user if questions arise.

