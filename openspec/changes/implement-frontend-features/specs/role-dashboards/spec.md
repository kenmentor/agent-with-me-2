## ADDED Requirements

### Requirement: Role-based dashboard routing

The system SHALL route users to the appropriate dashboard based on their role after login. The system SHALL use the role from the authenticated user object stored in Zustand.

#### Scenario: Tenant views tenant dashboard
- **WHEN** user with role "tenant" or "guest" navigates to `/dashboard`
- **THEN** system redirects to `/dashboard/tenant`

#### Scenario: Landlord views landlord dashboard
- **WHEN** user with role "landlord" or "host" navigates to `/dashboard`
- **THEN** system redirects to `/dashboard/landlord`

#### Scenario: Agent views agent dashboard
- **WHEN** user with role "agent" navigates to `/dashboard`
- **THEN** system redirects to `/dashboard/agent`

### Requirement: Tenant dashboard features

The tenant dashboard SHALL display the following sections: saved houses, liked properties, payment history, and tour history.

#### Scenario: View saved houses
- **WHEN** tenant views their dashboard
- **THEN** system displays list of properties the tenant has saved
- **AND** each saved house shows property thumbnail, title, price, and location

#### Scenario: View liked properties
- **WHEN** tenant views liked properties section
- **THEN** system displays properties the tenant has liked
- **AND** shows like/unlike toggle for each property

#### Scenario: View payment history
- **WHEN** tenant views payment history section
- **THEN** system displays all rent payments made by the tenant
- **AND** each payment shows property, amount, date, and status

#### Scenario: View tour history
- **WHEN** tenant views tour history section
- **THEN** system displays all property tours scheduled or completed
- **AND** shows tour date, property, and status (scheduled/completed/cancelled)

### Requirement: Landlord dashboard features

The landlord dashboard SHALL display the following sections: property list with verification status, edit property functionality, and payment history.

#### Scenario: View property list with status
- **WHEN** landlord views their dashboard
- **THEN** system displays all properties owned by the landlord
- **AND** each property shows verification status (verified/unverified/pending)
- **AND** shows property thumbnail, title, and status badge

#### Scenario: Edit property information
- **WHEN** landlord clicks "Edit" on a property
- **THEN** system navigates to `/dashboard/edit/[propertyId]`
- **AND** displays form with current property details
- **AND** allows editing: price, description, pictures, terms, amenities

#### Scenario: View landlord payment history
- **WHEN** landlord views payment history section
- **THEN** system displays all rent payments received for their properties
- **AND** shows tenant name, property, amount, date, and approval status

### Requirement: Agent dashboard features

The agent dashboard SHALL display the following sections: managed properties, scheduled tours to attend, expected payouts, and edit property functionality.

#### Scenario: View managed properties
- **WHEN** agent views their dashboard
- **THEN** system displays all properties associated with the agent (via referral codes)
- **AND** shows property thumbnail, title, landlord name, and status

#### Scenario: View scheduled tours
- **WHEN** agent views tours section
- **THEN** system displays all property tours assigned to the agent
- **AND** shows tour date/time, property address, and tenant contact

#### Scenario: View expected payouts
- **WHEN** agent views payouts section
- **THEN** system displays pending and completed commission payments
- **AND** shows amount, status (pending/paid), and associated property

#### Scenario: Edit property as agent
- **WHEN** agent clicks "Edit" on a managed property
- **THEN** system navigates to `/dashboard/edit/[propertyId]`
- **AND** displays editable property form with same fields as landlord

### Requirement: Shared dashboard layout

All role-specific dashboards SHALL share a common layout structure including: sidebar navigation, header with user info, and consistent styling.

#### Scenario: Dashboard sidebar navigation
- **WHEN** user views any dashboard
- **THEN** sidebar shows role-specific menu items
- **AND** active section is highlighted
- **AND** logout button is accessible

#### Scenario: Responsive dashboard
- **WHEN** dashboard is viewed on mobile device
- **THEN** sidebar collapses to hamburger menu
- **AND** content takes full width
