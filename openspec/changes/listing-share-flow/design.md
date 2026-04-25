## Context

After an agent successfully posts a property listing, there's no natural next step to promote it. We want to create a seamless "share your listing" flow that:
1. Feels rewarding and professional
2. Makes it easy to share to WhatsApp/Facebook
3. Provides pre-written copy highlighting the property details
4. Encourages organic reach without being pushy

## Goals / Non-Goals

**Goals:**
- Create a visually appealing share modal that appears after successful listing creation
- Pre-populate share messages with property title, price, location, and a compelling call-to-action
- Support one-tap sharing to WhatsApp and Facebook
- Allow users to easily copy the message text
- Provide option to dismiss and continue browsing

**Non-Goals:**
- Mandatory sharing (users can skip)
- Tracking/referral system (future enhancement)
- Email sharing or other platforms beyond WhatsApp/Facebook
- Deep linking from shared posts back to the listing (handled separately)

## Decisions

### 1. Modal vs Full Page
**Decision**: Use a modal/dialog overlay
**Rationale**: Less invasive, keeps user in context, faster to dismiss

### 2. Share Implementation
**Decision**: Use Web Share API with fallback to clipboard copy
**Rationale**: Native sharing on mobile is best UX; clipboard fallback works on desktop

### 3. Message Template
**Decision**: Dynamic template based on property data
**Rationale**: Each listing gets unique, relevant messaging

### 4. Trigger Point
**Decision**: Show modal immediately after successful API response
**Rationale**: Captures the momentum when user completes the action

## Risks / Trade-offs

- **[Risk]** Web Share API not supported on all browsers → **Mitigation**: Provide fallback with copy-to-clipboard button
- **[Risk]** Users may dismiss modal and forget to share → **Mitigation**: Optional "Share Later" with reminder badge on dashboard
- **[Risk]** Message template may not fit all property types → **Mitigation**: Keep template flexible, allow editing before share