# Story 2.3: Create Shipment & Add Packages

## Story Information

| Field | Value |
|-------|-------|
| **Story ID** | 2.3 |
| **Epic** | Epic 2: Admin Inventory Management |
| **Title** | Create Shipment & Add Packages |
| **Status** | ready-for-dev |
| **Created** | 2026-01-22 |
| **Priority** | High |

## User Story

**As an** Admin,
**I want** to create a shipment and add packages with all attributes,
**So that** I can record inventory sent to the producer facility.

## Acceptance Criteria

### AC1: Shipment Form Header
**Given** I am logged in as Admin
**When** I navigate to Inventory > New Shipment
**Then** I see a shipment form with: From Organisation (dropdown), To Organisation (dropdown), Date (default today)

### AC2: Auto-Generated Shipment Code
**Given** I am creating a shipment
**When** I select From Organisation and To Organisation
**Then** the shipment code is auto-generated and displayed (e.g., "TWP-INE-001")
**And** I cannot edit the shipment code

### AC3: Package Entry Table
**Given** I have created a shipment header
**When** I proceed to add packages
**Then** I see a horizontal/tabular entry form with columns:
- Package No (auto-generated, read-only)
- Product Name (dropdown)
- Species (dropdown)
- Humidity (dropdown)
- Type (dropdown)
- Processing (dropdown)
- FSC (dropdown)
- Quality (dropdown)
- Thickness (text input)
- Width (text input)
- Length (text input)
- Pieces (text input)
- Volume m³ (auto-calculated or manual)

### AC4: Volume Auto-Calculation
**Given** I am entering a package row
**When** I enter valid numeric dimensions (e.g., "40", "100", "2000") and pieces (e.g., "500")
**Then** Volume m³ is auto-calculated: (thickness_mm × width_mm × length_mm × pieces) / 1,000,000,000
**And** I see the calculated value in the Volume field

### AC5: Volume Manual Entry for Ranges
**Given** I enter dimension ranges (e.g., "40-50")
**When** the system detects a range (contains "-" in dimension fields)
**Then** Volume m³ is not auto-calculated
**And** I can enter volume manually

### AC6: Add Row
**Given** I have entered a package row
**When** I click "Add Row"
**Then** a new empty row is added with auto-generated package number (e.g., "TWP-001-002")

### AC7: Copy Row
**Given** I have entered a package row
**When** I click "Copy Row"
**Then** a new row is added with the same values as the previous row
**And** the package number is auto-generated
**And** Pieces and Volume fields are cleared (for manual entry)

### AC8: Save Shipment
**Given** I have multiple package rows
**When** I click "Save Shipment"
**Then** the shipment is created in the database
**And** all packages are created in the inventory_packages table
**And** I see a success toast "Shipment created with X packages"
**And** I am redirected to the shipment detail page

### AC9: Pieces as Not Countable
**Given** I enter pieces as "-" (not countable)
**When** I try to save
**Then** the system accepts "-" as valid
**And** volume must be entered manually

---

## Technical Implementation Guide

### Architecture Context

This story implements the core shipment creation flow using the **Inventory Data Model v2** (flat shipment/package model). The database tables (`shipments`, `inventory_packages`) and helper functions (`generate_shipment_code`, `generate_package_number`, `get_next_shipment_number`) already exist in migration `20260122000002_inventory_model_v2.sql`.

The form is a two-part UI:
1. **Shipment Header** - From/To organisation dropdowns + date + auto-generated code
2. **Package Entry Table** - Horizontal spreadsheet-like form with dynamic rows

### Database Schema

```sql
-- Shipments table (already exists)
CREATE TABLE shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_code TEXT NOT NULL UNIQUE,
  shipment_number INTEGER NOT NULL,
  from_party_id UUID REFERENCES parties(id) NOT NULL,
  to_party_id UUID REFERENCES parties(id) NOT NULL,
  shipment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT shipments_different_parties CHECK (from_party_id != to_party_id)
);

-- Inventory Packages table (already exists)
CREATE TABLE inventory_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID REFERENCES shipments(id) NOT NULL,
  package_number TEXT NOT NULL UNIQUE,
  package_sequence INTEGER NOT NULL,
  product_name_id UUID REFERENCES ref_product_names(id),
  wood_species_id UUID REFERENCES ref_wood_species(id),
  humidity_id UUID REFERENCES ref_humidity(id),
  type_id UUID REFERENCES ref_types(id),
  processing_id UUID REFERENCES ref_processing(id),
  fsc_id UUID REFERENCES ref_fsc(id),
  quality_id UUID REFERENCES ref_quality(id),
  thickness TEXT,
  width TEXT,
  length TEXT,
  pieces TEXT,
  volume_m3 DECIMAL,
  volume_is_calculated BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'consumed', 'produced')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(shipment_id, package_sequence)
);
```

### Database Helper Functions (already exist)

```sql
-- Generate shipment code: TWP-INE-001
generate_shipment_code(p_from_party_id UUID, p_to_party_id UUID) RETURNS TEXT

-- Generate package number: TWP-001-001
generate_package_number(p_shipment_id UUID) RETURNS TEXT

-- Get next global shipment number from sequence
get_next_shipment_number() RETURNS INTEGER
```

### Volume Calculation Logic

```typescript
/**
 * Calculate volume in cubic metres from dimensions in mm and piece count.
 * Returns null if any value is a range or non-numeric.
 */
function calculateVolume(
  thickness: string,
  width: string,
  length: string,
  pieces: string
): number | null {
  // Detect ranges (contain "-" but not as first char for negative)
  const isRange = (val: string) => val.includes('-') && val.indexOf('-') > 0;

  if (isRange(thickness) || isRange(width) || isRange(length)) {
    return null; // Manual entry required
  }

  if (pieces === '-' || pieces.trim() === '') {
    return null; // Manual entry required
  }

  const t = parseFloat(thickness);
  const w = parseFloat(width);
  const l = parseFloat(length);
  const p = parseFloat(pieces);

  if (isNaN(t) || isNaN(w) || isNaN(l) || isNaN(p)) {
    return null; // Manual entry required
  }

  // thickness(mm) × width(mm) × length(mm) × pieces / 1,000,000,000 = m³
  return (t * w * l * p) / 1_000_000_000;
}
```

### Implementation Tasks

#### Task 1: Create Shipments Feature Structure
- [ ] Create `apps/portal/src/features/shipments/` folder
- [ ] Create `types.ts` with Shipment, PackageRow, CreateShipmentInput interfaces
- [ ] Create `schemas/shipment.ts` with Zod validation schemas
- [ ] Create barrel exports (`index.ts`, `schemas/index.ts`, `actions/index.ts`, `components/index.ts`)

#### Task 2: Create Server Actions
- [ ] `actions/getActiveOrganisations.ts` - Fetch active organisations for dropdowns (from `parties` table where `is_active = true`)
- [ ] `actions/getShipmentCodePreview.ts` - Preview shipment code for selected from/to orgs (calls `generate_shipment_code` DB function)
- [ ] `actions/getReferenceDropdowns.ts` - Fetch all 7 reference table active options in a single action
- [ ] `actions/createShipment.ts` - Create shipment + all packages in a transaction:
  1. Call `get_next_shipment_number()` for global sequence
  2. Call `generate_shipment_code(from_id, to_id)` for the shipment code
  3. Insert into `shipments`
  4. For each package: insert into `inventory_packages` with `generate_package_number(shipment_id)`

#### Task 3: Create Shipment Header Component
- [ ] `components/ShipmentHeader.tsx` - From/To organisation dropdowns, date picker, shipment code display
- [ ] Auto-fetch and display shipment code preview when both organisations selected
- [ ] Date field defaults to today, editable

#### Task 4: Create Package Entry Table Component
- [ ] `components/PackageEntryTable.tsx` - Horizontal tabular form with dynamic rows
- [ ] Each row has: package number (read-only), 7 dropdown selects, 3 dimension inputs, pieces input, volume field
- [ ] Volume auto-calculates reactively when dimensions + pieces change (if all numeric)
- [ ] Volume field becomes editable when range detected
- [ ] "Add Row" button appends empty row with next package number
- [ ] "Copy Row" button on each row: copies all dropdown + dimension values, clears pieces + volume
- [ ] "Remove Row" button on each row (if more than 1 row)

#### Task 5: Create New Shipment Page
- [ ] Create `apps/portal/src/app/(portal)/admin/inventory/new-shipment/page.tsx`
- [ ] Create `loading.tsx` and `error.tsx`
- [ ] Orchestrate: load reference data + organisations on mount, render ShipmentHeader + PackageEntryTable
- [ ] "Save Shipment" button: validate all fields, call `createShipment` action, show toast, redirect

#### Task 6: Navigation & Routing
- [ ] Add "New Shipment" button/link accessible from inventory section
- [ ] Create placeholder `apps/portal/src/app/(portal)/admin/inventory/[shipmentId]/page.tsx` for redirect target (Story 2.4 will expand)

---

## File Organisation

```
apps/portal/src/features/shipments/
├── actions/
│   ├── getActiveOrganisations.ts
│   ├── getShipmentCodePreview.ts
│   ├── getReferenceDropdowns.ts
│   ├── createShipment.ts
│   └── index.ts
├── components/
│   ├── ShipmentHeader.tsx
│   ├── PackageEntryTable.tsx
│   └── index.ts
├── schemas/
│   ├── shipment.ts
│   └── index.ts
├── types.ts
└── index.ts

apps/portal/src/app/(portal)/admin/inventory/
├── new-shipment/
│   ├── page.tsx
│   ├── loading.tsx
│   └── error.tsx
└── [shipmentId]/
    └── page.tsx  (placeholder for redirect target)
```

---

## Key Patterns & Conventions

### Server Action Pattern (from Story 2.2)

```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { getSession, isAdmin } from "@/lib/auth";
import type { ActionResult } from "../types";

export async function myAction(input: MyInput): Promise<ActionResult<MyOutput>> {
  const session = await getSession();
  if (!session) return { success: false, error: "Not authenticated", code: "UNAUTHENTICATED" };
  if (!isAdmin(session)) return { success: false, error: "Permission denied", code: "FORBIDDEN" };

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).from("table").select("*");

  if (error) return { success: false, error: "...", code: "QUERY_FAILED" };
  return { success: true, data: transformedData };
}
```

### Reference Dropdown Fetching

Use existing pattern from `features/reference-data/actions/getReferenceOptions.ts`. The `getReferenceDropdowns` action should fetch all 7 tables in parallel and return a combined result:

```typescript
interface ReferenceDropdowns {
  productNames: { id: string; value: string }[];
  woodSpecies: { id: string; value: string }[];
  humidity: { id: string; value: string }[];
  types: { id: string; value: string }[];
  processing: { id: string; value: string }[];
  fsc: { id: string; value: string }[];
  quality: { id: string; value: string }[];
}
```

### UK English

All user-facing strings must use UK spelling:
- "Organisation" (not "Organization")
- Consistent with Story 2.2 patterns

---

## Definition of Done

- [ ] Shipment form shows organisation dropdowns (active only)
- [ ] Shipment code auto-generates when both organisations selected
- [ ] Package entry table displays all 13 columns
- [ ] All 7 dropdown fields show active reference data options
- [ ] Package numbers auto-generate sequentially
- [ ] Volume auto-calculates when all dimensions + pieces are numeric
- [ ] Volume field is manually editable when ranges detected
- [ ] Pieces accepts "-" as valid (uncountable)
- [ ] "Add Row" creates new empty row with next package number
- [ ] "Copy Row" copies values, clears pieces/volume, assigns new package number
- [ ] "Save Shipment" creates shipment + all packages in database
- [ ] Success toast shows "Shipment created with X packages"
- [ ] Redirects to shipment detail page after save
- [ ] `from_party_id != to_party_id` constraint respected (DB constraint)
- [ ] No TypeScript errors
- [ ] Build passes

---

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
