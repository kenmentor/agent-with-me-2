## Context

The Agent with Me platform is a Next.js 15 application using React 19, TypeScript, and Zustand for state management. The backend API is already implemented and deployed. The frontend needs several features completed to make the platform functional:

**Current State:**
- Basic property listing and search (grid view)
- Unified dashboard with mock data
- Auth flow: email/password signup with email verification
- Zustand store for authentication with localStorage persistence
- Axios-based API client with backend base URL

**Constraints:**
- Backend endpoints are fixed (need to verify actual API contracts)
- Must use existing component library (Radix UI, shadcn/ui components)
- Must integrate with Paystack for payments (already in place)
- Real-time chat requires backend WebSocket/polling support

## Goals / Non-Goals

**Goals:**
- Complete all frontend features matching the backend capabilities
- Implement role-based routing and dashboards
- Add modern UI patterns (vertical scroll feed)
- Enable social authentication (Google OAuth)
- Create persistent chat system

**Non-Goals:**
- Backend development or API changes
- Native mobile apps
- Admin dashboard (internal tool)
- Advanced analytics or reporting

## Decisions

### 1. Chat Implementation: Polling over WebSockets

**Decision:** Use polling with 5-second intervals instead of WebSockets.

**Rationale:**
- Backend may not support WebSocket connections yet
- Simpler to implement and debug
- Zustand store can handle polling state
- Can upgrade to WebSockets later without breaking changes

**Alternative:** WebSockets via Socket.io
- Pros: True real-time, better performance
- Cons: Requires backend changes, more complex

### 2. Role Routing: Separate Pages per Role

**Decision:** Create separate dashboard pages for each role (`/dashboard/tenant`, `/dashboard/landlord`, `/dashboard/agent`) with a central router.

**Rationale:**
- Cleaner code organization
- Role-specific features are isolated
- Easier to maintain and extend
- URL-based navigation matches user mental model

**Alternative:** Single dashboard with conditional rendering
- Pros: Less files, shared layout
- Cons: Complex conditionals, harder to track role-specific features

### 3. Feed Mode: Component Toggle

**Decision:** Add a toggle button to switch between grid and vertical scroll views on the properties page.

**Rationale:**
- User preference, not a forced UX
- Easy to implement with state toggle
- Both modes share underlying data fetching

**Implementation:**
```
PropertiesPage
├── ViewModeToggle (grid | scroll)
├── GridView (default)
└── ScrollFeed (TikTok-style)
```

### 4. Chat Storage: Zustand + localStorage

**Decision:** Store chat messages in Zustand with localStorage persistence.

**Rationale:**
- Already using Zustand for auth
- Consistent state management approach
- Survives page refreshes
- Can be extended to sync with backend

**Schema per conversation:**
```typescript
interface ChatConversation {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  messages: ChatMessage[];
}

interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  read: boolean;
}
```

### 5. Agent Referral: Code Input + Association

**Decision:** Add referral code input during landlord registration, store association in user profile.

**Flow:**
1. Landlord enters referral code (optional)
2. Backend validates code, associates landlord with agent
3. Agent sees associated landlords in dashboard
4. Chat can be initiated via referral link

### 6. Social Auth: Google OAuth

**Decision:** Add Google OAuth button to login page, integrate with existing auth store.

**Implementation:**
- Use NextAuth.js or custom Google OAuth flow
- Store OAuth tokens alongside regular auth
- Link social account to existing email or create new user

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| Backend chat endpoints not ready | Implement stub UI, use mock data, add TODO comments |
| Polling causes performance issues | Add debouncing, limit to 10-second intervals |
| Role dashboard duplication | Extract shared components (Header, Card, etc.) |
| Google OAuth requires domain verification | Use development credentials first, verify domain later |
| Referral code collision | Backend handles uniqueness, UI shows error for invalid codes |

## Migration Plan

**Phase 1: Auth Enhancements**
1. Update `/auth/register` with role selection hub
2. Add Google OAuth button to `/auth/login`
3. Test email verification with URL codes

**Phase 2: Role Dashboards**
1. Create `/dashboard/tenant`, `/dashboard/landlord`, `/dashboard/agent`
2. Move existing dashboard logic to appropriate role
3. Add role-based routing from main `/dashboard`

**Phase 3: Chat System**
1. Create chat store in Zustand
2. Implement `/chat` list page with real API
3. Create `/chat/[userId]` conversation page
4. Add user search and referral code chat initiation

**Phase 4: Property Features**
1. Add view mode toggle to `/properties`
2. Implement vertical scroll feed component
3. Create `/properties/city` for location-based search
4. Add property interaction buttons (like, share, comment→chat)

**Phase 5: Property Management**
1. Create property creation flow for landlords
2. Implement `/dashboard/edit/[id]` with authorization
3. Add agent referral code to landlord registration

## Open Questions

1. **Chat API Contract**: What endpoints exist for sending/receiving messages? Is there pagination?
2. **WebSocket Support**: Does the backend support WebSockets, or should we stick with polling?
3. **Google OAuth**: Is Google OAuth configured in the backend? What scopes are needed?
4. **Referral Code Format**: What format? Length? How are agents created initially?
5. **Property Verification Flow**: What triggers verification? How does the agent inspection work?
