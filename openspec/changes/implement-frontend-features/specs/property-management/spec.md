## ADDED Requirements

### Requirement: Property creation for landlords

The system SHALL provide a property creation flow for landlords to add new listings.

#### Scenario: Navigate to property creation
- **WHEN** logged-in landlord clicks "Add Property" button
- **THEN** system navigates to `/properties/add`

#### Scenario: Fill property details
- **WHEN** landlord fills property form with: title, description, type, category, price, address, state, LGA, bedrooms, bathrooms, area, furnishing, amenities, contact preference, availability date
- **THEN** form validates all required fields
- **AND** shows inline errors for invalid fields

#### Scenario: Upload property images
- **WHEN** landlord uploads property images
- **THEN** images are validated (max 5MB, jpg/png)
- **AND** preview thumbnails are displayed
- **AND** user can reorder or remove images

#### Scenario: Submit property for review
- **WHEN** landlord clicks "Submit"
- **THEN** property is saved with "unverified" status
- **AND** success message is shown
- **AND** landlord is redirected to dashboard

### Requirement: Property editing with authorization

The system SHALL allow only authorized users (property owner or associated agent) to edit property details.

#### Scenario: Authorized user edits property
- **WHEN** authorized user navigates to `/dashboard/edit/[propertyId]`
- **THEN** system displays edit form with current property values
- **AND** user can modify: price, description, pictures, terms, amenities

#### Scenario: Unauthorized user denied access
- **WHEN** unauthorized user navigates to `/dashboard/edit/[propertyId]`
- **THEN** system returns 403 Forbidden
- **AND** shows error message "You are not authorized to edit this property"

### Requirement: Property status management

The system SHALL track and display property verification status: unverified, pending inspection, verified.

#### Scenario: View property status
- **WHEN** landlord views their property
- **THEN** status badge shows current verification state

#### Scenario: Property pending verification
- **WHEN** property is submitted and awaiting inspection
- **THEN** status shows "Pending Verification"
- **AND** estimated timeline is displayed

### Requirement: Property terms and conditions

Landlords SHALL be able to set custom terms and conditions for their property rentals.

#### Scenario: Set property terms
- **WHEN** landlord edits property
- **THEN** terms and conditions field is available
- **AND** tenant must agree to terms before booking

### Requirement: Property amenities management

The system SHALL allow landlords to specify amenities available with the property.

#### Scenario: Select amenities
- **WHEN** landlord edits property
- **THEN** checklist of common amenities is shown
- **AND** custom amenity can be added
- **AND** amenities are saved and displayed on property card
