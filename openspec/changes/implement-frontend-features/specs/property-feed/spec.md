## ADDED Requirements

### Requirement: Property grid view (default)

The system SHALL display properties in a responsive grid layout as the default view on the properties page.

#### Scenario: View properties in grid
- **WHEN** user navigates to `/properties`
- **THEN** system displays properties in a grid (3 columns on desktop, 2 on tablet, 1 on mobile)
- **AND** each property card shows thumbnail, title, location, price, bedrooms, bathrooms

#### Scenario: Filter properties
- **WHEN** user applies filters (type, state, LGA, budget)
- **THEN** grid updates to show only matching properties
- **AND** result count is displayed

### Requirement: Property feed view (TikTok-style)

The system SHALL provide an alternative vertical scroll feed view for property browsing, similar to TikTok's content consumption pattern.

#### Scenario: Toggle to feed view
- **WHEN** user clicks feed toggle button
- **THEN** view changes from grid to vertical scroll
- **AND** single property is shown per viewport height
- **AND** user can scroll vertically through properties

#### Scenario: Feed interaction buttons
- **WHEN** user is viewing a property in feed mode
- **THEN** property card shows: Like button, Share button, Comment button (opens chat)
- **AND** buttons are positioned on the right side of the screen

#### Scenario: Like in feed mode
- **WHEN** user clicks Like button in feed mode
- **THEN** property is added to user's liked properties
- **AND** button animates with heart fill effect
- **AND** like count increments

#### Scenario: Share in feed mode
- **WHEN** user clicks Share button in feed mode
- **THEN** system opens native share dialog or copies link to clipboard
- **AND** shows toast "Link copied!" if clipboard used

#### Scenario: Comment opens chat
- **WHEN** user clicks Comment button in feed mode
- **THEN** system navigates to `/chat/[agentId]`
- **AND** pre-populates message with property reference

### Requirement: View mode preference persistence

The system SHALL remember the user's view mode preference (grid vs feed) and restore it on return visits.

#### Scenario: Persist view mode
- **WHEN** user toggles to feed view
- **THEN** preference is saved to localStorage
- **AND** on next visit, feed view is restored

### Requirement: City-based property discovery

The system SHALL provide a page to discover properties near a user's location or selected city.

#### Scenario: View city properties
- **WHEN** user navigates to `/properties/city`
- **THEN** system requests location permission
- **AND** displays properties sorted by proximity to user
- **AND** shows "free" and "completed" property filters

#### Scenario: City search without location
- **WHEN** location permission is denied or unavailable
- **THEN** system shows city/state selector
- **AND** displays properties for selected location

### Requirement: Property verification status display

Properties SHALL display their verification status on cards and detail pages.

#### Scenario: Verified property badge
- **WHEN** property is verified
- **THEN** card shows green checkmark badge with "Verified" label

#### Scenario: Unverified property indicator
- **WHEN** property is not verified
- **THEN** card shows gray badge with "Unverified" label
- **AND** tooltip explains verification process
