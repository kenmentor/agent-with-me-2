## Why

Agents need a compelling, friction-free way to promote their listings after posting a house. Currently, there's no guided flow to share newly created listings to social platforms, limiting organic reach and tenant engagement. We want to make sharing feel natural and rewarding — the first action after listing.

## What Changes

- **New Share Flow Modal**: After successfully posting a house, redirect agents to a share modal pre-populated with the listing details and a clean, professional message template
- **Social Platform Targets**: Quick-share buttons for WhatsApp and Facebook with properly formatted deep links
- **Shareable Content**: Property title, price, location, and a short description in the share message
- **Optional Continue**: Users can dismiss or continue browsing after sharing
- **Share Tracking** (optional): Track if user completed a share action

## Capabilities

### New Capabilities

- `listing-share-flow`: Post-creation flow that guides agents to share their listing to WhatsApp/Facebook with pre-written copy
- `share-message-template`: Dynamic message template with property details that can be copied or shared directly

### Modified Capabilities

- None at this time

## Impact

- New component: ShareModal
- New utility: Generate shareable message from property data
- Modified: `app/properties/add/page.tsx` — redirect to share flow after successful creation
- New routes: None (modal/dialog approach)
- Dependencies: None (uses native share APIs and Web Share API)