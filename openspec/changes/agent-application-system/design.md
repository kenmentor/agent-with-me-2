## Context

When users (agents) enter wrong password, they're incorrectly redirected to email verification. Meanwhile, we need a proper system for agents to apply for partnership.

## Goals / Non-Goals

**Goals:**
- Fix login error handling (wrong password should show error, not redirect)
- Create agent application modal for unverified users
- Build application form with additional agent questions
- Build admin dashboard to manage applications

**Non-Goals:**
- Full admin panel (just applications section)
- Payment/invoicing for agents
- Agent verification workflow (future)

## Decisions

### 1. Modal vs Page
**Decision**: Modal first → then dedicated page
**Rationale**: Less friction, can dismiss and retry login

### 2. Application Data
Store: name, email, phone, experience, areas served, license info, motivation

### 3. Status Flow
`pending` → `reviewing` → `approved` / `rejected`

## Risks / Trade-offs

- Backend API needed for application CRUD
- Need admin authentication middleware