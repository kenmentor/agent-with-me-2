## ADDED Requirements

### Requirement: Login Error Shows Inline Error Message
When an agent enters an incorrect password, the system SHALL display the error message on the login page instead of redirecting to email verification.

#### Scenario: Wrong password entered
- **WHEN** user enters wrong password
- **THEN** system SHALL display "Invalid email or password" on the login page
- **AND** system SHALL NOT redirect to verification page

### Requirement: Agent Application Modal
When an unverified agent fails login with credentials that exist but need verification, the system SHALL display a modal offering to apply for partnership.

#### Scenario: Unverified agent shown application option
- **WHEN** agent login fails because account needs verification
- **THEN** system SHALL display modal with "Apply to Partner With Us" option
- **AND** modal SHALL show agent's email from attempted login

### Requirement: Agent Partnership Application Form
The system SHALL provide a form for agents to submit partnership applications with the following fields:
- Full name
- Email (pre-filled)
- Phone number
- Years of experience
- Areas served (multi-select)
- Real estate license/registration info
- Motivation/notes

#### Scenario: Agent submits application
- **WHEN** agent fills and submits the application form
- **THEN** system SHALL save application to database
- **AND** show success confirmation
- **AND** redirect to login page

### Requirement: Admin Agent Applications Dashboard
The system SHALL provide an admin dashboard to view and manage agent applications.

#### Scenario: Admin views pending applications
- **WHEN** admin accesses `/admin/applications`
- **THEN** system SHALL display list of all applications
- **AND** show status (pending/reviewing/approved/rejected)
- **AND** allow status updates

### Requirement: Application Status Management
The system SHALL allow admins to update application status from pending to approved/rejected.

#### Scenario: Admin approves application
- **WHEN** admin clicks approve on an application
- **THEN** system SHALL update status to "approved"
- **AND** notify agent via email (optional)