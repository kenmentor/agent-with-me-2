## ADDED Requirements

### Requirement: User can view chat list

The system SHALL display a list of all chat conversations for the authenticated user, ordered by most recent message. Each conversation item SHALL show the participant name, last message preview, timestamp, and unread count.

#### Scenario: View chat list with conversations
- **WHEN** user navigates to `/chat`
- **THEN** system displays list of conversations sorted by last message time (newest first)
- **AND** each conversation shows participant avatar, name, last message (truncated to 50 chars), relative time
- **AND** unread conversations show badge with count

#### Scenario: View empty chat list
- **WHEN** user has no conversations
- **THEN** system displays message "No conversations yet. Start chatting with a landlord or agent from a property page."

### Requirement: User can search for chat participants

The system SHALL allow users to search for other users by name. The search SHALL be case-insensitive and SHALL return results as the user types (debounced 300ms).

#### Scenario: Search by user name
- **WHEN** user types in the search input on chat page
- **THEN** system filters conversations by participant name matching the search query
- **AND** results update as user types

#### Scenario: No search results
- **WHEN** search query matches no users
- **THEN** system displays message "No users found"

### Requirement: User can start chat via referral code

The system SHALL allow users to start a conversation by entering an agent's referral code. The system SHALL validate the code and create a conversation if valid.

#### Scenario: Start chat with valid referral code
- **WHEN** user enters a valid agent referral code and clicks "Start Chat"
- **THEN** system creates a new conversation with the agent
- **AND** system navigates to the new conversation

#### Scenario: Start chat with invalid referral code
- **WHEN** user enters an invalid referral code and clicks "Start Chat"
- **THEN** system displays error message "Invalid referral code"

### Requirement: User can send and receive messages

The system SHALL allow users to send text messages in a conversation. Messages SHALL be persisted and displayed in chronological order with sender information.

#### Scenario: Send a message
- **WHEN** user types a message and presses Enter or clicks Send
- **THEN** message appears immediately in the conversation
- **AND** message is sent to the backend
- **AND** message is persisted

#### Scenario: Receive a message
- **WHEN** a new message arrives from a conversation participant
- **THEN** message appears in the conversation
- **AND** if user is not viewing the conversation, unread count increments

#### Scenario: View message history
- **WHEN** user opens a conversation
- **THEN** system loads and displays all previous messages
- **AND** messages are sorted by timestamp (oldest first)

### Requirement: Chat persists across sessions

The system SHALL persist chat history in localStorage so that messages survive page refreshes and browser restarts.

#### Scenario: Chat survives page refresh
- **WHEN** user refreshes the page while in a conversation
- **THEN** all messages remain visible
- **AND** scroll position is restored if possible

### Requirement: Real-time updates via polling

The system SHALL poll for new messages every 5 seconds when the chat page is active.

#### Scenario: Poll for new messages
- **WHEN** user is on the chat page or has chat open
- **THEN** system fetches new messages every 5 seconds
- **AND** updates the conversation list with any new messages
