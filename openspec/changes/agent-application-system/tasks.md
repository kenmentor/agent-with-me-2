## 1. Fix Login Error Handling

- [x] 1.1 Update login error condition to only redirect on specific 403 status
- [x] 1.2 Test wrong password shows inline error

## 2. Create Agent Application Modal Component

- [x] 2.1 Create `components/ui/AgentApplicationModal.tsx`
- [x] 2.2 Add email display and "Apply Now" button
- [x] 2.3 Add "Dismiss" option
- [x] 2.4 Style modal with Tailwind

## 3. Integrate Modal into Login Flow

- [ ] 3.1 Import modal into login page
- [ ] 3.2 Show modal when backend returns specific error (e.g., account not verified)
- [ ] 3.3 Pass email to modal

## 4. Create Agent Application Form Page

- [x] 4.1 Create `app/auth/apply/partner/page.tsx`
- [x] 4.2 Add form fields: name, phone, experience, areas, license, motivation
- [x] 4.3 Pre-fill email from query params
- [x] 4.4 Add form validation
- [x] 4.5 Connect to backend API

## 5. Create Admin Applications Dashboard

- [x] 5.1 Create `app/admin/applications/page.tsx`
- [x] 5.2 List all applications with filters (pending/approved/rejected)
- [x] 5.3 Add approve/reject action buttons
- [x] 5.4 Add application detail view

## 6. Testing

- [ ] 6.1 Test login with wrong password shows error inline
- [ ] 6.2 Test application modal appears for unverified accounts
- [ ] 6.3 Test application form submission
- [ ] 6.4 Test admin can view and manage applications
- [x] 6.5 Build and verify no errors