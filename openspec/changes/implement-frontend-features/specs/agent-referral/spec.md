## ADDED Requirements

### Requirement: Agent referral code generation

The system SHALL generate unique referral codes for agents upon registration.

#### Scenario: Agent receives referral code
- **WHEN** agent completes registration
- **THEN** system generates unique 8-character alphanumeric code
- **AND** code is displayed in agent dashboard
- **AND** code can be copied to clipboard

### Requirement: Landlord registration with agent referral

Landlords SHALL be able to enter an agent's referral code during registration to establish an association.

#### Scenario: Enter valid referral code
- **WHEN** landlord enters a valid agent referral code
- **THEN** system validates the code
- **AND** creates association between landlord and agent
- **AND** shows success message "Connected with Agent [Name]"

#### Scenario: Enter invalid referral code
- **WHEN** landlord enters an invalid referral code
- **THEN** system displays error "Invalid referral code. Please check and try again."
- **AND** landlord can skip or re-enter

#### Scenario: Skip referral code
- **WHEN** landlord chooses to skip referral code
- **THEN** registration proceeds without agent association
- **AND** landlord can add agent later from settings

### Requirement: Agent sees associated landlords

Agents SHALL be able to view all landlords associated with them via referral codes.

#### Scenario: View associated landlords
- **WHEN** agent views their dashboard
- **THEN** list of associated landlords is displayed
- **AND** shows landlord name, property count, and join date

### Requirement: Agent manages referred properties

Agents SHALL be able to edit properties of landlords they are associated with.

#### Scenario: Agent edits landlord property
- **WHEN** agent clicks edit on a referred property
- **THEN** property edit form is displayed
- **AND** changes are saved to the property

### Requirement: Referral-based chat initiation

Users SHALL be able to start a chat with an agent via their referral code or from property pages.

#### Scenario: Chat from property page
- **WHEN** user clicks "Chat with Agent" on a property
- **THEN** system identifies the agent associated with that property
- **AND** opens chat conversation with the agent

#### Scenario: Chat via referral code
- **WHEN** user enters agent referral code in chat search
- **THEN** system validates the code
- **AND** creates or opens conversation with the agent

### Requirement: Referral code display

Referral codes SHALL be displayed in agent profiles and can be shared.

#### Scenario: View agent referral code
- **WHEN** viewing agent profile
- **THEN** referral code is displayed
- **AND** copy button is available
- **AND** share options (WhatsApp, SMS, etc.) are accessible
