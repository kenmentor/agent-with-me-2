## ADDED Requirements

### Requirement: Role selection hub on registration

The system SHALL display a role selection hub at `/auth/register` with three clear paths: Rent a house (tenant), Become an agent, Register your property (landlord).

#### Scenario: View registration hub
- **WHEN** user navigates to `/auth/register`
- **THEN** system displays three option cards
- **AND** each card shows icon, title, description, and "Get Started" button

#### Scenario: Select tenant registration
- **WHEN** user clicks "Get Started" on tenant card
- **THEN** system navigates to `/auth/register/tenant`

#### Scenario: Select landlord registration
- **WHEN** user clicks "Get Started" on landlord card
- **THEN** system navigates to `/auth/register/landlord`

#### Scenario: Select agent registration
- **WHEN** user clicks "Get Started" on agent card
- **THEN** system navigates to `/auth/register/agent`

### Requirement: Google OAuth login

The system SHALL provide Google OAuth as a login option alongside email/password.

#### Scenario: Login with Google
- **WHEN** user clicks "Sign in with Google" button on login page
- **THEN** system initiates Google OAuth flow
- **AND** on success, user is authenticated and redirected to dashboard

#### Scenario: Google OAuth new user
- **WHEN** Google account has no existing account
- **THEN** system creates new user account
- **AND** prompts for role selection if needed
- **AND** redirects to dashboard

#### Scenario: Google OAuth existing user
- **WHEN** Google email matches existing account
- **THEN** system links Google account to existing user
- **AND** user is logged in directly

### Requirement: Email/password registration

The system SHALL support traditional email/password registration with the following fields: full name, email, phone number, password, confirm password, date of birth, and terms agreement.

#### Scenario: Successful registration
- **WHEN** user fills all required fields and submits
- **THEN** system creates account
- **AND** sends verification email
- **AND** redirects to verification page

#### Scenario: Registration validation errors
- **WHEN** user submits form with missing or invalid fields
- **THEN** system displays inline error messages for each invalid field
- **AND** form is not submitted

### Requirement: Email verification with URL codes

The system SHALL support email verification via URL code (e.g., `/auth/verify/[urlcode]`) and manual code entry.

#### Scenario: Verify via URL code
- **WHEN** user clicks verification link in email
- **THEN** system extracts code from URL
- **AND** verifies email automatically
- **AND** shows success message and redirects to login

#### Scenario: Verify via manual code entry
- **WHEN** user navigates to `/auth/verify`
- **THEN** system displays code entry form
- **AND** user enters 6-digit code
- **AND** clicks Verify
- **THEN** system verifies code and shows success

#### Scenario: Invalid verification code
- **WHEN** user enters wrong verification code
- **THEN** system displays error "Invalid verification code"
- **AND** allows retry

### Requirement: Landlord registration with agent referral

The landlord registration flow SHALL include an optional agent referral code field.

#### Scenario: Register with referral code
- **WHEN** landlord enters valid referral code during registration
- **THEN** landlord account is associated with the agent
- **AND** confirmation message is shown

#### Scenario: Register with invalid referral code
- **WHEN** landlord enters invalid referral code
- **THEN** system shows error "Invalid referral code"
- **AND** allows skipping or re-entering

### Requirement: Persistent authentication state

The system SHALL maintain authentication state across browser sessions using Zustand with localStorage persistence.

#### Scenario: Return visit authenticated
- **WHEN** user returns to site after closing browser
- **THEN** system restores authentication state from localStorage
- **AND** user remains logged in
