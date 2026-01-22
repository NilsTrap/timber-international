# Story 2.4: Shipment & Inventory Overview

## Story Information

| Field | Value |
|-------|-------|
| **Story ID** | 2.4 |
| **Epic** | Epic 2: Admin Inventory Management |
| **Title** | Shipment & Inventory Overview |
| **Status** | backlog |
| **Created** | 2026-01-22 |
| **Priority** | Medium |

## User Story

**As an** Admin,
**I want** to view all shipments and inventory packages,
**So that** I can monitor what materials are at producer facilities.

## Acceptance Criteria

### AC1: Overview Page with Tabs
**Given** I am logged in as Admin
**When** I navigate to Inventory > Overview
**Then** I see two tabs: "Shipments" and "Packages"

### AC2: Shipments Tab
**Given** I am on the Shipments tab
**When** I view the table
**Then** I see columns: Shipment Code, From, To, Date, Package Count, Total m³
**And** shipments are sorted by date (newest first)

### AC3: Shipment Detail
**Given** I click on a shipment row
**When** the detail view opens
**Then** I see all packages in that shipment with full attributes
**And** I can edit or add more packages

### AC4: Packages Tab
**Given** I am on the Packages tab
**When** I view the table
**Then** I see all packages with columns: Package No, Shipment, Product, Species, Humidity, Dimensions, Pieces, m³
**And** I see summary cards: Total Packages, Total m³

### AC5: Filter Packages
**Given** I am viewing the packages table
**When** I use the filter bar
**Then** I can filter by: Product Name, Species, Shipment Code
**And** the table updates to show matching packages

### AC6: Sort Columns
**Given** I click column headers
**When** I click
**Then** the table sorts by that column (toggle ascending/descending)

### AC7: Empty State
**Given** no shipments exist
**When** I view the overview
**Then** I see an empty state "No shipments recorded yet"
**And** I see a button "Create First Shipment"

---

## Technical Implementation Guide

### Architecture Context

This is the inventory overview feature for Admin. Shows all shipments and packages with filtering and sorting capabilities.

### Implementation Tasks

#### Task 1: Create Overview Components
- [ ] `ShipmentsTable.tsx` - Table of all shipments
- [ ] `PackagesTable.tsx` - Table of all packages
- [ ] `InventorySummary.tsx` - Summary cards
- [ ] `PackageFilters.tsx` - Filter dropdowns

#### Task 2: Create Server Actions
- [ ] `getShipments.ts` - Fetch all shipments with counts
- [ ] `getPackages.ts` - Fetch packages with filters
- [ ] `getInventorySummary.ts` - Get totals

#### Task 3: Create Overview Page
- [ ] Update `apps/portal/src/app/(portal)/inventory/page.tsx`
- [ ] Add tab navigation
- [ ] Integrate tables and filters

#### Task 4: Create Shipment Detail Page
- [ ] Create `apps/portal/src/app/(portal)/inventory/[shipmentId]/page.tsx`
- [ ] Show packages for that shipment
- [ ] Allow editing

---

## File Organization

```
apps/portal/src/features/inventory/
├── actions/
│   ├── getShipments.ts
│   ├── getPackages.ts
│   ├── getInventorySummary.ts
│   └── index.ts
├── components/
│   ├── ShipmentsTable.tsx
│   ├── PackagesTable.tsx
│   ├── InventorySummary.tsx
│   ├── PackageFilters.tsx
│   └── index.ts
├── types.ts
└── index.ts
```

---

## Definition of Done

- [ ] Inventory page shows Shipments and Packages tabs
- [ ] Shipments table displays all shipments with counts
- [ ] Clicking shipment opens detail view
- [ ] Packages table shows all packages
- [ ] Summary cards show totals
- [ ] Filters work for Product, Species, Shipment
- [ ] Sorting works on all columns
- [ ] Empty state shows when no data
- [ ] No TypeScript errors
