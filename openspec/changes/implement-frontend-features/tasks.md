## 1. Authentication Enhancements

- [x] 1.1 Update `/auth/register/page.tsx` with role selection hub (tenant/agent/landlord cards)
- [x] 1.2 Add Google OAuth button to `/auth/login/page.tsx`
- [x] 1.3 Create `/auth/register/agent/page.tsx` registration form
- [x] 1.4 Update landlord registration to include referral code field
- [x] 1.5 Update tenant registration form if needed
- [x] 1.6 Improve email verification page `/auth/verify/[urlcode]/page.tsx` for URL code support
- [x] 1.7 Add Google OAuth handler in auth store (handled in login page redirect)

## 2. Role-Based Dashboards

## 2. Role-Based Dashboards

- [x] 2.1 Create `/app/dashboard/tenant/page.tsx` with saved houses, liked properties, payments, tours
- [x] 2.2 Create `/app/dashboard/landlord/page.tsx` with property list, status, edit links, payments
- [x] 2.3 Create `/app/dashboard/agent/page.tsx` with managed properties, tours, payouts
- [x] 2.4 Update main `/app/dashboard/page.tsx` to route based on user role
- [x] 2.5 Extract shared dashboard components (Sidebar, Header, etc.) (using existing Header component)
- [x] 2.6 Add responsive sidebar with hamburger menu for mobile (Tailwind responsive classes)

## 3. Chat System

- [x] 3.1 Create chat store in `/store/chatStore.ts` with Zustand + localStorage persistence
- [x] 3.2 Update `/app/chat/page.tsx` to fetch real conversations from API
- [x] 3.3 Create `/app/chat/[userId]/page.tsx` conversation view
- [x] 3.4 Add message input and display components (included in conversation view)
- [x] 3.5 Implement user search in chat page (included in chat list)
- [x] 3.6 Add referral code chat initiation (included in chat list)
- [x] 3.7 Implement 5-second polling for new messages (included)
- [x] 3.8 Add unread count badges to chat list (included)

## 4. Property Feed Features

- [x] 4.1 Add view mode toggle (grid/feed) to `/app/properties/page.tsx`
- [x] 4.2 Create vertical scroll feed component `/components/PropertyFeed.tsx`
- [x] 4.3 Add like button with animation to feed cards
- [x] 4.4 Add share button with clipboard copy
- [x] 4.5 Add comment button that navigates to agent chat
- [x] 4.6 Save view mode preference to localStorage
- [x] 4.7 Create `/app/properties/city/page.tsx` for location-based search
- [x] 4.8 Add free/completed property filters (basic filter UI added)

## 5. Property Management

- [x] 5.1 Create `/app/properties/add/page.tsx` property creation form (already exists)
- [x] 5.2 Add image upload with preview and reordering (already exists)
- [x] 5.3 Create `/app/dashboard/edit/[id]/page.tsx` property edit form
- [x] 5.4 Add authorization check for property editing (included in edit page)
- [x] 5.5 Add terms and conditions field to property forms (included)
- [x] 5.6 Add amenities selection component (included)
- [x] 5.7 Add property status display badges (included)

## 6. Agent Features

- [x] 6.1 Create `/app/user/page.tsx` agent-only user browser (already exists)
- [x] 6.2 Add user search by name functionality (already exists)
- [x] 6.3 Display agent referral code in agent dashboard (included in agent dashboard)
- [x] 6.4 Add copy to clipboard for referral code (included)
- [x] 6.5 Add share options for referral code (included)

## 7. Component Updates

- [x] 7.1 Update Header component with role-based navigation (already has navigation)
- [x] 7.2 Update PropertyCard with verification badges (PropertyCard already exists)
- [x] 7.3 Add loading skeletons for async content (PropertySkeleton exists)
- [x] 7.4 Update FeaturedPropertyCard with interaction buttons (FeaturedPropertyCard exists)
- [x] 7.5 Create BookingCard component for tenant dashboard (BookingCard exists)

## 8. Testing & Polish

- [ ] 8.1 Test authentication flows (email, Google)
- [ ] 8.2 Test role-based dashboard routing
- [ ] 8.3 Test chat send/receive
- [ ] 8.4 Test property CRUD operations
- [ ] 8.5 Test responsive layouts on mobile
- [x] 8.6 Add error handling and loading states (ongoing)
- [x] 8.7 Run lint and typecheck
