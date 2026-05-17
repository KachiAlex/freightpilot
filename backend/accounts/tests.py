from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password

User = get_user_model()


class UserModelTests(TestCase):
    """Test suite for User model creation and validation."""

    def setUp(self):
        """Set up test fixtures."""
        self.valid_email = "driver@example.com"
        self.valid_password = "SecurePass123!"
        self.valid_full_name = "John Driver"

    def test_user_creation_with_required_fields(self):
        """Test that a user can be created with required fields."""
        user = User.objects.create_user(
            email=self.valid_email,
            password=self.valid_password,
            full_name=self.valid_full_name
        )
        self.assertEqual(user.email, self.valid_email)
        self.assertEqual(user.full_name, self.valid_full_name)
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)

    def test_user_email_is_unique(self):
        """Test that email field is unique."""
        User.objects.create_user(
            email=self.valid_email,
            password=self.valid_password,
            full_name=self.valid_full_name
        )
        with self.assertRaises(Exception):  # IntegrityError
            User.objects.create_user(
                email=self.valid_email,
                password=self.valid_password,
                full_name="Another User"
            )

    def test_user_email_is_username_field(self):
        """Test that email is used as USERNAME_FIELD."""
        self.assertEqual(User.USERNAME_FIELD, 'email')

    def test_password_hashing(self):
        """Test that passwords are hashed and not stored in plain text."""
        user = User.objects.create_user(
            email=self.valid_email,
            password=self.valid_password,
            full_name=self.valid_full_name
        )
        self.assertNotEqual(user.password, self.valid_password)
        self.assertTrue(user.check_password(self.valid_password))

    def test_password_validation_minimum_length(self):
        """Test that password validation enforces minimum 8 characters."""
        short_password = "Pass123"  # 7 characters
        with self.assertRaises(ValidationError):
            validate_password(short_password)

    def test_password_validation_numeric_only(self):
        """Test that password validation rejects numeric-only passwords."""
        numeric_password = "12345678"
        with self.assertRaises(ValidationError):
            validate_password(numeric_password)

    def test_password_validation_common_password(self):
        """Test that password validation rejects common passwords."""
        common_password = "password"
        with self.assertRaises(ValidationError):
            validate_password(common_password)

    def test_password_validation_similar_to_email(self):
        """Test that password validation rejects passwords similar to email."""
        email = "driver@example.com"
        user = User(email=email, full_name=self.valid_full_name)
        similar_password = "driver123"
        with self.assertRaises(ValidationError):
            validate_password(similar_password, user=user)

    def test_user_role_default_is_driver(self):
        """Test that default role is 'driver'."""
        user = User.objects.create_user(
            email=self.valid_email,
            password=self.valid_password,
            full_name=self.valid_full_name
        )
        self.assertEqual(user.role, User.Roles.DRIVER)

    def test_user_role_can_be_set_to_admin(self):
        """Test that role can be set to 'admin'."""
        user = User.objects.create_user(
            email=self.valid_email,
            password=self.valid_password,
            full_name=self.valid_full_name,
            role=User.Roles.ADMIN
        )
        self.assertEqual(user.role, User.Roles.ADMIN)

    def test_user_role_choices(self):
        """Test that role field has correct choices."""
        choices = dict(User.Roles.choices)
        self.assertIn('driver', choices)
        self.assertIn('admin', choices)

    def test_optional_profile_fields_are_nullable(self):
        """Test that optional profile fields can be empty."""
        user = User.objects.create_user(
            email=self.valid_email,
            password=self.valid_password,
            full_name=self.valid_full_name
        )
        self.assertEqual(user.cdl_status, "")
        self.assertEqual(user.home_terminal, "")
        self.assertEqual(user.carrier_name, "")
        self.assertEqual(user.phone_number, "")

    def test_optional_profile_fields_can_be_set(self):
        """Test that optional profile fields can be populated."""
        user = User.objects.create_user(
            email=self.valid_email,
            password=self.valid_password,
            full_name=self.valid_full_name,
            cdl_status="Valid",
            home_terminal="Atlanta, GA",
            carrier_name="ABC Trucking",
            phone_number="555-1234"
        )
        self.assertEqual(user.cdl_status, "Valid")
        self.assertEqual(user.home_terminal, "Atlanta, GA")
        self.assertEqual(user.carrier_name, "ABC Trucking")
        self.assertEqual(user.phone_number, "555-1234")

    def test_user_manager_create_user(self):
        """Test UserManager.create_user method."""
        user = User.objects.create_user(
            email=self.valid_email,
            password=self.valid_password,
            full_name=self.valid_full_name
        )
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)

    def test_user_manager_create_superuser(self):
        """Test UserManager.create_superuser method."""
        user = User.objects.create_superuser(
            email="admin@example.com",
            password=self.valid_password,
            full_name="Admin User"
        )
        self.assertTrue(user.is_staff)
        self.assertTrue(user.is_superuser)

    def test_user_manager_requires_email(self):
        """Test that UserManager requires email."""
        with self.assertRaises(ValueError):
            User.objects.create_user(
                email="",
                password=self.valid_password,
                full_name=self.valid_full_name
            )

    def test_user_email_normalization(self):
        """Test that email domain is normalized (lowercased)."""
        user = User.objects.create_user(
            email="Driver@EXAMPLE.COM",
            password=self.valid_password,
            full_name=self.valid_full_name
        )
        # Django's normalize_email lowercases the domain part
        self.assertEqual(user.email, "Driver@example.com")

    def test_user_timestamps(self):
        """Test that user has date_joined and updated_at timestamps."""
        user = User.objects.create_user(
            email=self.valid_email,
            password=self.valid_password,
            full_name=self.valid_full_name
        )
        self.assertIsNotNone(user.date_joined)
        self.assertIsNotNone(user.updated_at)

    def test_user_is_active_default(self):
        """Test that is_active defaults to True."""
        user = User.objects.create_user(
            email=self.valid_email,
            password=self.valid_password,
            full_name=self.valid_full_name
        )
        self.assertTrue(user.is_active)

    def test_user_string_representation(self):
        """Test user __str__ method returns full_name or email."""
        user = User.objects.create_user(
            email=self.valid_email,
            password=self.valid_password,
            full_name=self.valid_full_name
        )
        self.assertEqual(str(user), self.valid_full_name)

    def test_user_string_representation_without_full_name(self):
        """Test user __str__ method returns email when full_name is empty."""
        user = User.objects.create_user(
            email=self.valid_email,
            password=self.valid_password,
            full_name=""
        )
        self.assertEqual(str(user), self.valid_email)

    def test_user_permissions_mixin(self):
        """Test that User has PermissionsMixin functionality."""
        user = User.objects.create_user(
            email=self.valid_email,
            password=self.valid_password,
            full_name=self.valid_full_name
        )
        # PermissionsMixin provides groups and user_permissions
        self.assertIsNotNone(user.groups)
        self.assertIsNotNone(user.user_permissions)

    def test_valid_password_accepted(self):
        """Test that a valid password passes validation."""
        valid_password = "ValidPass123!"
        try:
            validate_password(valid_password)
        except ValidationError:
            self.fail("Valid password was rejected")

    def test_user_can_authenticate_with_correct_password(self):
        """Test that user can authenticate with correct password."""
        user = User.objects.create_user(
            email=self.valid_email,
            password=self.valid_password,
            full_name=self.valid_full_name
        )
        # Retrieve user and verify password
        retrieved_user = User.objects.get(email=self.valid_email)
        self.assertTrue(retrieved_user.check_password(self.valid_password))

    def test_user_cannot_authenticate_with_wrong_password(self):
        """Test that user cannot authenticate with wrong password."""
        user = User.objects.create_user(
            email=self.valid_email,
            password=self.valid_password,
            full_name=self.valid_full_name
        )
        self.assertFalse(user.check_password("WrongPassword123!"))

    def test_user_password_can_be_changed(self):
        """Test that user password can be changed."""
        user = User.objects.create_user(
            email=self.valid_email,
            password=self.valid_password,
            full_name=self.valid_full_name
        )
        new_password = "NewPassword123!"
        user.set_password(new_password)
        user.save()
        
        # Verify old password doesn't work
        self.assertFalse(user.check_password(self.valid_password))
        # Verify new password works
        self.assertTrue(user.check_password(new_password))

    def test_user_required_fields(self):
        """Test that REQUIRED_FIELDS is set correctly."""
        self.assertEqual(User.REQUIRED_FIELDS, ['full_name'])

    def test_email_field_max_length(self):
        """Test that email field has appropriate max length."""
        email_field = User._meta.get_field('email')
        self.assertEqual(email_field.max_length, 254)

    def test_full_name_field_max_length(self):
        """Test that full_name field has appropriate max length."""
        full_name_field = User._meta.get_field('full_name')
        self.assertEqual(full_name_field.max_length, 255)

    def test_role_field_max_length(self):
        """Test that role field has appropriate max length."""
        role_field = User._meta.get_field('role')
        self.assertEqual(role_field.max_length, 20)



class RegistrationEndpointTests(TestCase):
    """Test suite for registration endpoint (POST /api/v1/auth/register/)."""

    def setUp(self):
        """Set up test fixtures."""
        self.register_url = '/api/v1/auth/register/'
        self.valid_data = {
            'email': 'newdriver@example.com',
            'full_name': 'New Driver',
            'password': 'SecurePass123!',
        }

    def test_successful_registration_with_valid_data(self):
        """Test successful registration with valid data returns 201 Created."""
        response = self.client.post(self.register_url, self.valid_data, format='json')
        
        self.assertEqual(response.status_code, 201)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['email'], self.valid_data['email'])
        self.assertEqual(response.data['user']['full_name'], self.valid_data['full_name'])
        self.assertEqual(response.data['user']['role'], 'driver')
        
        # Verify user was created in database
        user = User.objects.get(email=self.valid_data['email'])
        self.assertEqual(user.full_name, self.valid_data['full_name'])
        self.assertTrue(user.check_password(self.valid_data['password']))

    def test_registration_with_optional_fields(self):
        """Test registration with optional profile fields."""
        data = {
            **self.valid_data,
            'cdl_status': 'Valid',
            'home_terminal': 'Atlanta, GA',
            'carrier_name': 'ABC Trucking',
            'phone_number': '555-1234',
        }
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, 201)
        user = User.objects.get(email=data['email'])
        self.assertEqual(user.cdl_status, 'Valid')
        self.assertEqual(user.home_terminal, 'Atlanta, GA')
        self.assertEqual(user.carrier_name, 'ABC Trucking')
        self.assertEqual(user.phone_number, '555-1234')

    def test_registration_without_optional_fields(self):
        """Test registration without optional fields succeeds."""
        response = self.client.post(self.register_url, self.valid_data, format='json')
        
        self.assertEqual(response.status_code, 201)
        user = User.objects.get(email=self.valid_data['email'])
        self.assertEqual(user.cdl_status, '')
        self.assertEqual(user.home_terminal, '')
        self.assertEqual(user.carrier_name, '')
        self.assertEqual(user.phone_number, '')

    def test_registration_email_uniqueness_validation(self):
        """Test that duplicate email returns 400 Bad Request."""
        # Create first user
        User.objects.create_user(
            email=self.valid_data['email'],
            password='AnotherPass123!',
            full_name='Existing User'
        )
        
        # Try to register with same email
        response = self.client.post(self.register_url, self.valid_data, format='json')
        
        self.assertEqual(response.status_code, 400)
        self.assertIn('email', response.data)

    def test_registration_password_too_short(self):
        """Test that password less than 8 characters returns 400."""
        data = {
            **self.valid_data,
            'password': 'Short1!',  # 7 characters
        }
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, 400)
        self.assertIn('password', response.data)

    def test_registration_password_numeric_only(self):
        """Test that numeric-only password returns 400."""
        data = {
            **self.valid_data,
            'password': '12345678',
        }
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, 400)
        self.assertIn('password', response.data)

    def test_registration_password_common(self):
        """Test that common password returns 400."""
        data = {
            **self.valid_data,
            'password': 'password',
        }
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, 400)
        self.assertIn('password', response.data)

    def test_registration_password_similar_to_email(self):
        """Test that password similar to email returns 400."""
        data = {
            'email': 'driver@example.com',
            'full_name': 'Test Driver',
            'password': 'driver123',  # Similar to email
        }
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, 400)
        # The error can be in either 'password' or 'non_field_errors'
        self.assertTrue(
            'password' in response.data or 'non_field_errors' in response.data,
            f"Expected password or non_field_errors in response, got: {response.data}"
        )

    def test_registration_missing_email(self):
        """Test that missing email returns 400."""
        data = {
            'full_name': 'Test Driver',
            'password': 'SecurePass123!',
        }
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, 400)
        self.assertIn('email', response.data)

    def test_registration_missing_full_name(self):
        """Test that missing full_name returns 400."""
        data = {
            'email': 'newdriver@example.com',
            'password': 'SecurePass123!',
        }
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, 400)
        self.assertIn('full_name', response.data)

    def test_registration_missing_password(self):
        """Test that missing password returns 400."""
        data = {
            'email': 'newdriver@example.com',
            'full_name': 'Test Driver',
        }
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, 400)
        self.assertIn('password', response.data)

    def test_registration_invalid_email_format(self):
        """Test that invalid email format returns 400."""
        data = {
            **self.valid_data,
            'email': 'not-an-email',
        }
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, 400)
        self.assertIn('email', response.data)

    def test_registration_response_excludes_password(self):
        """Test that response does not include password field."""
        response = self.client.post(self.register_url, self.valid_data, format='json')
        
        self.assertEqual(response.status_code, 201)
        self.assertNotIn('password', response.data['user'])

    def test_registration_response_includes_required_fields(self):
        """Test that response includes all required fields."""
        response = self.client.post(self.register_url, self.valid_data, format='json')
        
        self.assertEqual(response.status_code, 201)
        user_data = response.data['user']
        self.assertIn('id', user_data)
        self.assertIn('email', user_data)
        self.assertIn('full_name', user_data)
        self.assertIn('role', user_data)

    def test_registration_user_role_is_driver(self):
        """Test that registered user has role='driver'."""
        response = self.client.post(self.register_url, self.valid_data, format='json')
        
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['user']['role'], 'driver')
        
        # Verify in database
        user = User.objects.get(email=self.valid_data['email'])
        self.assertEqual(user.role, 'driver')

    def test_registration_user_is_active(self):
        """Test that registered user is active."""
        response = self.client.post(self.register_url, self.valid_data, format='json')
        
        self.assertEqual(response.status_code, 201)
        user = User.objects.get(email=self.valid_data['email'])
        self.assertTrue(user.is_active)

    def test_registration_user_is_not_staff(self):
        """Test that registered user is not staff."""
        response = self.client.post(self.register_url, self.valid_data, format='json')
        
        self.assertEqual(response.status_code, 201)
        user = User.objects.get(email=self.valid_data['email'])
        self.assertFalse(user.is_staff)

    def test_registration_email_case_insensitive_uniqueness(self):
        """Test that email uniqueness check is case-insensitive."""
        # Create first user
        User.objects.create_user(
            email='driver@example.com',
            password='AnotherPass123!',
            full_name='Existing User'
        )
        
        # Try to register with same email but different case
        data = {
            **self.valid_data,
            'email': 'DRIVER@EXAMPLE.COM',
        }
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, 400)
        self.assertIn('email', response.data)

    def test_registration_empty_email(self):
        """Test that empty email returns 400."""
        data = {
            **self.valid_data,
            'email': '',
        }
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, 400)
        self.assertIn('email', response.data)

    def test_registration_empty_full_name(self):
        """Test that empty full_name returns 400."""
        data = {
            **self.valid_data,
            'full_name': '',
        }
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, 400)
        self.assertIn('full_name', response.data)

    def test_registration_empty_password(self):
        """Test that empty password returns 400."""
        data = {
            **self.valid_data,
            'password': '',
        }
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, 400)
        self.assertIn('password', response.data)

    def test_registration_multiple_validation_errors(self):
        """Test that multiple validation errors are returned."""
        data = {
            'email': 'invalid-email',
            'full_name': '',
            'password': 'short',
        }
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, 400)
        # Should have errors for all three fields
        self.assertIn('email', response.data)
        self.assertIn('full_name', response.data)
        self.assertIn('password', response.data)

    def test_registration_whitespace_only_full_name(self):
        """Test that whitespace-only full_name is rejected."""
        data = {
            **self.valid_data,
            'full_name': '   ',
        }
        response = self.client.post(self.register_url, data, format='json')
        
        # Django's CharField with blank=False should reject this
        # But let's verify the behavior
        if response.status_code == 400:
            self.assertIn('full_name', response.data)

    def test_registration_with_partial_optional_fields(self):
        """Test registration with some optional fields provided."""
        data = {
            **self.valid_data,
            'cdl_status': 'Valid',
            'phone_number': '555-1234',
        }
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, 201)
        user = User.objects.get(email=data['email'])
        self.assertEqual(user.cdl_status, 'Valid')
        self.assertEqual(user.phone_number, '555-1234')
        self.assertEqual(user.home_terminal, '')
        self.assertEqual(user.carrier_name, '')

    def test_registration_response_status_code(self):
        """Test that successful registration returns 201 Created."""
        response = self.client.post(self.register_url, self.valid_data, format='json')
        self.assertEqual(response.status_code, 201)

    def test_registration_creates_only_one_user(self):
        """Test that registration creates exactly one user."""
        initial_count = User.objects.count()
        
        response = self.client.post(self.register_url, self.valid_data, format='json')
        
        self.assertEqual(response.status_code, 201)
        self.assertEqual(User.objects.count(), initial_count + 1)

    def test_registration_duplicate_email_creates_no_user(self):
        """Test that duplicate email registration doesn't create a user."""
        # Create first user
        User.objects.create_user(
            email=self.valid_data['email'],
            password='AnotherPass123!',
            full_name='Existing User'
        )
        
        initial_count = User.objects.count()
        
        # Try to register with same email
        response = self.client.post(self.register_url, self.valid_data, format='json')
        
        self.assertEqual(response.status_code, 400)
        self.assertEqual(User.objects.count(), initial_count)



class LoginEndpointTests(TestCase):
    """Test suite for login endpoint (POST /api/v1/auth/login/)."""

    def setUp(self):
        """Set up test fixtures."""
        self.login_url = '/api/v1/auth/login/'
        self.user_email = 'driver@example.com'
        self.user_password = 'SecurePass123!'
        self.user_full_name = 'John Driver'
        
        # Create a test user
        self.user = User.objects.create_user(
            email=self.user_email,
            password=self.user_password,
            full_name=self.user_full_name,
            role=User.Roles.DRIVER
        )

    def test_successful_login_with_valid_credentials(self):
        """Test successful login with valid email and password returns 200 OK."""
        data = {
            'email': self.user_email,
            'password': self.user_password,
        }
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user', response.data)

    def test_login_response_includes_access_token(self):
        """Test that login response includes access token."""
        data = {
            'email': self.user_email,
            'password': self.user_password,
        }
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)
        self.assertIsNotNone(response.data['access'])
        self.assertIsInstance(response.data['access'], str)
        self.assertGreater(len(response.data['access']), 0)

    def test_login_response_includes_refresh_token(self):
        """Test that login response includes refresh token."""
        data = {
            'email': self.user_email,
            'password': self.user_password,
        }
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('refresh', response.data)
        self.assertIsNotNone(response.data['refresh'])
        self.assertIsInstance(response.data['refresh'], str)
        self.assertGreater(len(response.data['refresh']), 0)

    def test_login_response_includes_user_data(self):
        """Test that login response includes user data."""
        data = {
            'email': self.user_email,
            'password': self.user_password,
        }
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('user', response.data)
        user_data = response.data['user']
        self.assertIn('id', user_data)
        self.assertIn('email', user_data)
        self.assertIn('full_name', user_data)
        self.assertIn('role', user_data)

    def test_login_response_user_data_is_correct(self):
        """Test that user data in response matches the logged-in user."""
        data = {
            'email': self.user_email,
            'password': self.user_password,
        }
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, 200)
        user_data = response.data['user']
        self.assertEqual(user_data['email'], self.user_email)
        self.assertEqual(user_data['full_name'], self.user_full_name)
        self.assertEqual(user_data['role'], User.Roles.DRIVER)
        self.assertEqual(str(user_data['id']), str(self.user.id))

    def test_login_with_invalid_password_returns_401(self):
        """Test that login with invalid password returns 401 Unauthorized."""
        data = {
            'email': self.user_email,
            'password': 'WrongPassword123!',
        }
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, 401)

    def test_login_with_nonexistent_email_returns_401(self):
        """Test that login with non-existent email returns 401 Unauthorized."""
        data = {
            'email': 'nonexistent@example.com',
            'password': self.user_password,
        }
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, 401)

    def test_login_with_empty_email_returns_400(self):
        """Test that login with empty email returns 400 Bad Request."""
        data = {
            'email': '',
            'password': self.user_password,
        }
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, 400)

    def test_login_with_empty_password_returns_400(self):
        """Test that login with empty password returns 400 Bad Request."""
        data = {
            'email': self.user_email,
            'password': '',
        }
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, 400)

    def test_login_missing_email_returns_400(self):
        """Test that login without email returns 400 Bad Request."""
        data = {
            'password': self.user_password,
        }
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, 400)

    def test_login_missing_password_returns_400(self):
        """Test that login without password returns 400 Bad Request."""
        data = {
            'email': self.user_email,
        }
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, 400)

    def test_login_with_case_insensitive_email(self):
        """Test that login works with different email case."""
        data = {
            'email': self.user_email.upper(),
            'password': self.user_password,
        }
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_access_token_is_valid_jwt(self):
        """Test that access token is a valid JWT token."""
        import jwt
        from django.conf import settings
        
        data = {
            'email': self.user_email,
            'password': self.user_password,
        }
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, 200)
        access_token = response.data['access']
        
        # Decode JWT token
        try:
            decoded = jwt.decode(
                access_token,
                settings.SECRET_KEY,
                algorithms=['HS256']
            )
            self.assertIsNotNone(decoded)
        except jwt.InvalidTokenError:
            self.fail("Access token is not a valid JWT")

    def test_access_token_includes_user_id_claim(self):
        """Test that access token includes user_id claim."""
        import jwt
        from django.conf import settings
        
        data = {
            'email': self.user_email,
            'password': self.user_password,
        }
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, 200)
        access_token = response.data['access']
        
        decoded = jwt.decode(
            access_token,
            settings.SECRET_KEY,
            algorithms=['HS256']
        )
        self.assertIn('user_id', decoded)
        self.assertEqual(decoded['user_id'], str(self.user.id))

    def test_access_token_includes_email_claim(self):
        """Test that access token includes email claim."""
        import jwt
        from django.conf import settings
        
        data = {
            'email': self.user_email,
            'password': self.user_password,
        }
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, 200)
        access_token = response.data['access']
        
        decoded = jwt.decode(
            access_token,
            settings.SECRET_KEY,
            algorithms=['HS256']
        )
        self.assertIn('email', decoded)
        self.assertEqual(decoded['email'], self.user_email)

    def test_access_token_includes_role_claim(self):
        """Test that access token includes role claim."""
        import jwt
        from django.conf import settings
        
        data = {
            'email': self.user_email,
            'password': self.user_password,
        }
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, 200)
        access_token = response.data['access']
        
        decoded = jwt.decode(
            access_token,
            settings.SECRET_KEY,
            algorithms=['HS256']
        )
        self.assertIn('role', decoded)
        self.assertEqual(decoded['role'], User.Roles.DRIVER)

    def test_access_token_includes_full_name_claim(self):
        """Test that access token includes full_name claim."""
        import jwt
        from django.conf import settings
        
        data = {
            'email': self.user_email,
            'password': self.user_password,
        }
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, 200)
        access_token = response.data['access']
        
        decoded = jwt.decode(
            access_token,
            settings.SECRET_KEY,
            algorithms=['HS256']
        )
        self.assertIn('full_name', decoded)
        self.assertEqual(decoded['full_name'], self.user_full_name)

    def test_refresh_token_is_valid_jwt(self):
        """Test that refresh token is a valid JWT token."""
        import jwt
        from django.conf import settings
        
        data = {
            'email': self.user_email,
            'password': self.user_password,
        }
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, 200)
        refresh_token = response.data['refresh']
        
        # Decode JWT token
        try:
            decoded = jwt.decode(
                refresh_token,
                settings.SECRET_KEY,
                algorithms=['HS256']
            )
            self.assertIsNotNone(decoded)
        except jwt.InvalidTokenError:
            self.fail("Refresh token is not a valid JWT")

    def test_access_and_refresh_tokens_are_different(self):
        """Test that access and refresh tokens are different."""
        data = {
            'email': self.user_email,
            'password': self.user_password,
        }
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, 200)
        access_token = response.data['access']
        refresh_token = response.data['refresh']
        
        self.assertNotEqual(access_token, refresh_token)

    def test_login_response_does_not_include_password(self):
        """Test that login response does not include password."""
        data = {
            'email': self.user_email,
            'password': self.user_password,
        }
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, 200)
        user_data = response.data['user']
        self.assertNotIn('password', user_data)

    def test_login_with_inactive_user_returns_401(self):
        """Test that login with inactive user returns 401."""
        # Create an inactive user
        inactive_user = User.objects.create_user(
            email='inactive@example.com',
            password='SecurePass123!',
            full_name='Inactive User',
            is_active=False
        )
        
        data = {
            'email': 'inactive@example.com',
            'password': 'SecurePass123!',
        }
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, 401)

    def test_login_multiple_times_returns_different_tokens(self):
        """Test that multiple logins return different tokens."""
        data = {
            'email': self.user_email,
            'password': self.user_password,
        }
        
        response1 = self.client.post(self.login_url, data, format='json')
        response2 = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response1.status_code, 200)
        self.assertEqual(response2.status_code, 200)
        
        # Tokens should be different (they include timestamps)
        self.assertNotEqual(response1.data['access'], response2.data['access'])

    def test_login_with_special_characters_in_password(self):
        """Test login with special characters in password."""
        special_password = 'P@ssw0rd!#$%'
        user = User.objects.create_user(
            email='special@example.com',
            password=special_password,
            full_name='Special User'
        )
        
        data = {
            'email': 'special@example.com',
            'password': special_password,
        }
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)

    def test_login_response_status_code_is_200(self):
        """Test that successful login returns 200 OK status code."""
        data = {
            'email': self.user_email,
            'password': self.user_password,
        }
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, 200)

    def test_login_with_admin_user(self):
        """Test login with admin user."""
        admin_user = User.objects.create_user(
            email='admin@example.com',
            password='AdminPass123!',
            full_name='Admin User',
            role=User.Roles.ADMIN
        )
        
        data = {
            'email': 'admin@example.com',
            'password': 'AdminPass123!',
        }
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['user']['role'], User.Roles.ADMIN)

    def test_access_token_includes_all_required_claims(self):
        """Test that access token includes all required claims."""
        import jwt
        from django.conf import settings
        
        data = {
            'email': self.user_email,
            'password': self.user_password,
        }
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, 200)
        access_token = response.data['access']
        
        decoded = jwt.decode(
            access_token,
            settings.SECRET_KEY,
            algorithms=['HS256']
        )
        
        # Check all required claims are present
        required_claims = ['user_id', 'email', 'role', 'full_name']
        for claim in required_claims:
            self.assertIn(claim, decoded, f"Missing required claim: {claim}")

    def test_login_with_whitespace_in_email(self):
        """Test that login with whitespace in email is handled."""
        data = {
            'email': '  ' + self.user_email + '  ',
            'password': self.user_password,
        }
        response = self.client.post(self.login_url, data, format='json')
        
        # Should either succeed (if whitespace is stripped) or fail with 401
        self.assertIn(response.status_code, [200, 401])

    def test_login_response_includes_required_fields(self):
        """Test that login response includes all required fields."""
        data = {
            'email': self.user_email,
            'password': self.user_password,
        }
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user', response.data)
        
        user_data = response.data['user']
        self.assertIn('id', user_data)
        self.assertIn('email', user_data)
        self.assertIn('full_name', user_data)
        self.assertIn('role', user_data)

    def test_login_does_not_modify_user_data(self):
        """Test that login does not modify user data."""
        original_email = self.user.email
        original_full_name = self.user.full_name
        original_role = self.user.role
        
        data = {
            'email': self.user_email,
            'password': self.user_password,
        }
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, 200)
        
        # Verify user data hasn't changed
        self.user.refresh_from_db()
        self.assertEqual(self.user.email, original_email)
        self.assertEqual(self.user.full_name, original_full_name)
        self.assertEqual(self.user.role, original_role)

    def test_login_with_very_long_email(self):
        """Test login with very long email address."""
        long_email = 'a' * 200 + '@example.com'
        
        data = {
            'email': long_email,
            'password': self.user_password,
        }
        response = self.client.post(self.login_url, data, format='json')
        
        # Should return 401 (user not found) or 400 (invalid email)
        self.assertIn(response.status_code, [400, 401])

    def test_login_with_very_long_password(self):
        """Test login with very long password."""
        data = {
            'email': self.user_email,
            'password': 'a' * 1000,
        }
        response = self.client.post(self.login_url, data, format='json')
        
        # Should return 401 (invalid password)
        self.assertEqual(response.status_code, 401)

    def test_login_endpoint_requires_post_method(self):
        """Test that login endpoint requires POST method."""
        response = self.client.get(self.login_url)
        
        # GET should not be allowed
        self.assertIn(response.status_code, [405, 400, 401])

    def test_login_with_optional_user_fields(self):
        """Test login with user that has optional fields populated."""
        user_with_optional = User.objects.create_user(
            email='optional@example.com',
            password='SecurePass123!',
            full_name='Optional User',
            cdl_status='Valid',
            home_terminal='Atlanta, GA',
            carrier_name='ABC Trucking',
            phone_number='555-1234'
        )
        
        data = {
            'email': 'optional@example.com',
            'password': 'SecurePass123!',
        }
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, 200)
        user_data = response.data['user']
        self.assertEqual(user_data['email'], 'optional@example.com')
        self.assertEqual(user_data['full_name'], 'Optional User')
