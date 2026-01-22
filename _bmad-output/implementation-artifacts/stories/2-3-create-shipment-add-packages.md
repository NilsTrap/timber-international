# Story 2.3: Create Shipment & Add Packages

## Story Information

| Field | Value |
|-------|-------|
| **Story ID** | 2.3 |
| **Epic** | Epic 2: Admin Inventory Management |
| **Title** | Create Shipment & Add Packages |
| **Status** | backlog |
| **Created** | 2026-01-22 |
| **Priority** | High |

## User Story

**As an** Admin,
**I want** to create a shipment and add packages with all attributes,
**So that** I can record inventory sent to the producer facility.

## Acceptance Criteria

### AC1: Create Shipment
**Given** I am logged in as Admin
**When** I navigate to Inventory > New Shipment
**Then** I see a shipment form with: From Party (dropdown), To Party (dropdown), Date (default today)

### AC2: Auto-Generate Shipment Code
**Given** I am creating a shipment
**When** I select From Party and To Party
**Then** the shipment code is auto-generated and displayed (e.g., "TWP-INE-001")
**And** I cannot edit the shipment code

### AC3: Package Entry Form
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

### AC4: Auto-Calculate Volume
**Given** I am entering a package row
**When** I enter valid dimensions (e.g., "40", "100", "2000") and pieces (e.g., "500")
**Then** Volume m³ is auto-calculated
**And** I see the calculated value in the Volume field

### AC5: Range Dimensions
**Given** I enter dimension ranges (e.g., "40-50")
**When** the system detects a range
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

### AC9: Pieces Validation
**Given** I enter pieces as "-" (not countable)
**When** I try to save
**Then** the system accepts "-" as valid
**And** volume must be entered manually

---

## Technical Implementation Guide

### Architecture Context

This is the main inventory entry feature. Admin creates shipments between parties and adds packages with all attributes using a spreadsheet-like horizontal entry form.

**Key Features:**
- Auto-generated shipment codes (TWP-INE-001)
- Auto-generated package numbers (TWP-001-001)
- Horizontal tabular entry form
- Dropdown fields from reference tables
- Volume auto-calculation
- Copy row functionality

### Database Tables

```sql
-- Shipments
CREATE TABLE shipments (
  id UUID PRIMARY KEY,
  shipment_code TEXT NOT NULL UNIQUE,
  shipment_number INTEGER NOT NULL,
  from_party_id UUID REFERENCES parties(id),
  to_party_id UUID REFERENCES parties(id),
  shipment_date DATE DEFAULT CURRENT_DATE,
  notes TEXT
);

-- Inventory Packages
CREATE TABLE inventory_packages (
  id UUID PRIMARY KEY,
  shipment_id UUID REFERENCES shipments(id),
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
  volume_is_calculated BOOLEAN DEFAULT false
);
```

### Implementation Tasks

#### Task 1: Create Shipments Feature Structure
- [ ] Create `apps/portal/src/features/shipments/` folder
- [ ] Create schemas for shipment and package
- [ ] Create types

#### Task 2: Create Server Actions
- [ ] `createShipment.ts` - Create shipment with packages
- [ ] `getShipment.ts` - Get shipment with packages
- [ ] `generateShipmentCode.ts` - Get next shipment code
- [ ] `generatePackageNumber.ts` - Get next package number
- [ ] Helper functions for volume calculation

#### Task 3: Create Components
- [ ] `ShipmentForm.tsx` - Header form (from/to/date)
- [ ] `PackageEntryTable.tsx` - Horizontal entry table
- [ ] `PackageRow.tsx` - Single package row with all fields
- [ ] `DropdownField.tsx` - Reusable dropdown with reference data

#### Task 4: Create New Shipment Page
- [ ] Create `apps/portal/src/app/(portal)/inventory/new/page.tsx`
- [ ] Integrate shipment form and package entry table

---

## File Organization

```
apps/portal/src/features/shipments/
├── actions/
│   ├── createShipment.ts
│   ├── getShipment.ts
│   ├── generateShipmentCode.ts
│   └── index.ts
├── components/
│   ├── ShipmentForm.tsx
│   ├── PackageEntryTable.tsx
│   ├── PackageRow.tsx
│   ├── DropdownField.tsx
│   └── index.ts
├── schemas/
│   ├── shipment.ts
│   ├── package.ts
│   └── index.ts
├── utils/
│   ├── volumeCalculation.ts
│   └── index.ts
├── types.ts
└── index.ts
```

---

## Volume Calculation Logic

```typescript
function calculateVolume(
  thickness: string,
  width: string,
  length: string,
  pieces: string
): number | null {
  // Check if all values are exact numbers (not ranges)
  const isRange = (val: string) => val.includes('-');

  if (isRange(thickness) || isRange(width) || isRange(length)) {
    return null; // Manual entry required
  }

  const piecesNum = parseInt(pieces);
  if (isNaN(piecesNum) || pieces === '-') {
    return null; // Manual entry required
  }

  // Convert mm to m and calculate
  const t = parseFloat(thickness) / 1000;
  const w = parseFloat(width) / 1000;
  const l = parseFloat(length) / 1000;

  return t * w * l * piecesNum;
}
```

---

## Definition of Done

- [ ] Shipment form shows party dropdowns
- [ ] Shipment code auto-generates correctly
- [ ] Package entry table displays all columns
- [ ] All dropdown fields show reference data options
- [ ] Package numbers auto-generate
- [ ] Volume calculates when dimensions are exact
- [ ] Add Row works correctly
- [ ] Copy Row copies values and clears pieces/volume
- [ ] Save creates shipment and all packages
- [ ] No TypeScript errors
