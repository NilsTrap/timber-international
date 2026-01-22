# Story 2.2: Parties Management

## Story Information

| Field | Value |
|-------|-------|
| **Story ID** | 2.2 |
| **Epic** | Epic 2: Admin Inventory Management |
| **Title** | Parties Management |
| **Status** | backlog |
| **Created** | 2026-01-22 |
| **Priority** | High |

## User Story

**As an** Admin,
**I want** to manage parties (organizations like Timber World, producers),
**So that** I can create shipments between them.

## Acceptance Criteria

### AC1: View Parties Table
**Given** I am logged in as Admin
**When** I navigate to Admin > Parties
**Then** I see a table of all parties with columns: Code, Name, Status, Actions

### AC2: Add Party
**Given** I am viewing the parties table
**When** I click "Add Party"
**Then** I see a form with fields: Code (3 uppercase letters, required), Name (required)

### AC3: Create Party
**Given** I am adding a new party
**When** I enter a valid 3-letter code and name
**Then** the party is created
**And** I see a success toast "Party created"
**And** the party appears in the table

### AC4: Code Validation
**Given** I try to add a party with an existing code
**When** I click Save
**Then** I see an error "Party code already exists"

**Given** I enter a code that is not exactly 3 uppercase letters
**When** I try to save
**Then** I see a validation error "Code must be exactly 3 uppercase letters"

### AC5: Edit Party
**Given** I am editing a party
**When** I modify the name and save
**Then** the name is updated
**And** the code remains unchanged (immutable)

### AC6: Deactivate Party
**Given** I try to deactivate a party
**When** the party has existing shipments
**Then** I see a warning "This party has X shipments"
**And** I can only deactivate (soft delete), not delete

---

## Technical Implementation Guide

### Architecture Context

Parties are organizations that participate in shipments. The `parties` table stores the 3-letter code and name. Initial parties (TWP, INE) are seeded in the migration.

### Database Schema

```sql
CREATE TABLE parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code CHAR(3) NOT NULL UNIQUE,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT parties_code_uppercase CHECK (code = UPPER(code))
);
```

### Implementation Tasks

#### Task 1: Create Parties Feature Structure
- [ ] Create `apps/portal/src/features/parties/` folder
- [ ] Create schemas, types, barrel exports

#### Task 2: Create Server Actions
- [ ] `getParties.ts` - Fetch all parties
- [ ] `createParty.ts` - Add new party
- [ ] `updateParty.ts` - Edit party name
- [ ] `toggleParty.ts` - Activate/deactivate

#### Task 3: Create Components
- [ ] `PartiesTable.tsx` - Display parties with actions
- [ ] `PartyForm.tsx` - Add/edit dialog

#### Task 4: Create Admin Parties Page
- [ ] Create `apps/portal/src/app/(portal)/admin/parties/page.tsx`

---

## File Organization

```
apps/portal/src/features/parties/
├── actions/
│   ├── getParties.ts
│   ├── createParty.ts
│   ├── updateParty.ts
│   ├── toggleParty.ts
│   └── index.ts
├── components/
│   ├── PartiesTable.tsx
│   ├── PartyForm.tsx
│   └── index.ts
├── schemas/
│   └── party.ts
├── types.ts
└── index.ts
```

---

## Definition of Done

- [ ] Parties page displays all parties
- [ ] Admin can add new parties with 3-letter codes
- [ ] Admin can edit party names
- [ ] Admin can deactivate parties
- [ ] Code validation enforced (3 uppercase letters, unique)
- [ ] Parties with shipments cannot be deleted
- [ ] No TypeScript errors
