## Why

Agents who haven't been verified are being sent to an email verification page when they enter the wrong password - confusing UX. Instead, we want to show a friendly "Apply to Partner With Us" modal/popup when login fails for unverified agents. This creates a smoother onboarding flow and captures potential partners.

## What Changes

1. **Login Error Fix**: When login fails with wrong password, don't redirect to email verification - show error message inline instead
2. **Agent Application Modal**: When an unverified agent tries to login, show a modal offering to apply to partner with the platform
3. **Application Form Page**: New page with additional questions for agents (experience, areas served, etc.)
4. **Application Storage**: Save applications to database with status tracking
5. **Admin Dashboard**: New admin section to view and manage agent applications

## Capabilities

### New Capabilities

- `agent-application-modal`: Modal shown to unverified agents on login failure offering partnership
- `agent-application-form`: Form page for agents to submit partnership applications
- `admin-agent-applications`: Admin dashboard to view/manage agent applications

### Modified Capabilities

- `auth-login`: Fix login error handling to not redirect to verify page for wrong passwords

## Impact

- Modified: `app/auth/login/page.tsx` - fixed error handling
- New: `app/auth/apply/partner/page.tsx` - application form
- New: `app/admin/applications/page.tsx` - admin view
- New: API endpoints for application management
- Database: New `agent_applications` collection