## Why

The Agent with Me platform has a functional backend but several key frontend features are missing or incomplete. The chat system is stubbed with dummy data, role-based dashboards don't exist as separate views, property discovery lacks modern UI patterns (TikTok-style feed), and authentication only supports email/password. Completing these features will make the platform fully functional.

## What Changes

### Authentication
- Add Google OAuth login option alongside email/password
- Create a role selection hub at `/auth/register` with clear paths for: Rent a house (tenant), Become an agent, Register your property (landlord)
- Improve email verification flow with URL code support

### Chat System
- Implement real-time messaging between tenants, landlords, and agents
- Add user search functionality by name
- Support direct chat via agent referral code or user ID
- Persist and display chat history

### Role-Based Dashboards
- **Tenant Dashboard** (`/dashboard/tenant`): Saved houses, liked properties, payment history, tour history
- **Landlord Dashboard** (`/dashboard/landlord`): List of properties with status (verified/unverified), edit property info, payment history
- **Agent Dashboard** (`/dashboard/agent`): Managed properties, scheduled tours, expected payouts, edit property info

### Property Features
- Add TikTok-style vertical scroll feed as alternative to grid view for property browsing
- Implement city-based property discovery showing nearby free/completed houses
- Property cards with like/share/comment, where comment icon opens agent chat
- Toggle between scroll mode and normal grid (default)

### Property Management
- Property creation flow for landlords (after registration)
- Property editing for authorized users (landlord, agent) at `/dashboard/edit/[id]`
- Agent referral code input during landlord registration to associate with an agent

### Agent Features
- Agent-only user browser and search at `/user`
- Agent referral code system for landlord-agent associations

## Capabilities

### New Capabilities

- `chat-messaging`: Real-time chat system with user search, referral codes, and persistent history
- `role-dashboards`: Separate dashboard views for tenant, landlord, and agent with role-specific features
- `property-feed`: Modern property discovery with TikTok-style vertical scroll and grid toggle
- `social-auth`: Google OAuth integration alongside existing email/password
- `property-management`: Create and edit properties with authorization checks
- `agent-referral`: Agent referral code system linking landlords to agents

### Modified Capabilities

- `user-auth`: Enhancement to add Google login and role selection hub (existing spec not found, will create as new)

## Impact

### Code Changes
- New pages: `/chat`, `/chat/[userId]`, `/dashboard/tenant`, `/dashboard/landlord`, `/dashboard/agent`, `/user`, `/properties/city`
- Modified pages: `/auth/register`, `/dashboard`, `/properties`
- New components: Chat components, role-specific dashboard components, feed mode toggle
- Store changes: Chat state management in Zustand

### Dependencies
- Backend API endpoints (already implemented per user)
- Socket.io or similar for real-time chat (if not already in place)
- Google OAuth configuration

### Existing Files to Modify
- `app/auth/register/page.tsx` - Replace stub with role selection hub
- `app/chat/page.tsx` - Implement real chat with backend
- `app/dashboard/page.tsx` - Role-based routing to appropriate dashboard
- `app/properties/page.tsx` - Add feed toggle and city mode
