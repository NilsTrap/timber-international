---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - 'planning-artifacts/prd.md'
  - 'planning-artifacts/architecture.md'
  - 'planning-artifacts/ux-design-specification.md'
scope: 'Producer MVP'
targetUsers: ['Admin (Timber World)', 'Producer (Factory Manager)']
epicCount: 5
storyCount: 20
workflowComplete: true
completedDate: '2026-01-22'
status: 'ready-for-implementation'
---

# Timber-World Producer MVP - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Timber-World **Producer MVP**, decomposing the MVP-scoped requirements from the PRD, UX Design, and Architecture into implementable stories.

**Scope:** Producer Portal MVP - Production Tracking with Admin Inventory Management
**Target Users:** Admin (Timber World) + Producer (Factory Manager)

## Requirements Inventory

### Functional Requirements (MVP-Scoped)

From PRD, filtered to Producer MVP scope (updated to include Admin inventory functions):

```
FR2: Users can authenticate using email and password
FR4: Users can view and update their profile information
FR30: Admin can record inventory sent to producer facilities
FR32: Producers can view current inventory at their facility
FR33: Admin can view inventory levels across all producer facilities
FR42: Producers can report production (input materials → output products)
FR43: Producers can record waste/loss during production
FR44: Producers can submit completed production
FR45: Producers can view their production history
FR46: Producers can view their efficiency metrics
FR51: Admin can view and compare producer efficiency reports
FR52: System calculates production efficiency (output/input ratio)
```

**Total: 12 Functional Requirements**

### Non-Functional Requirements (MVP-Scoped)

From PRD, filtered to what applies to single-user MVP:

```
NFR1: Page load time < 3 seconds on 4G connection
NFR2: API response time < 500ms for standard operations
NFR7: Usable on mid-range desktop browsers
NFR30: Responsive for desktop (1024px minimum width)
NFR32: WCAG AA color contrast ratios
NFR33: Core functions accessible via keyboard
NFR42: Core tasks learnable within 30 minutes without training
NFR43: Clear, actionable error messages
NFR44: Critical actions have confirmation or undo
NFR46: Loading states for operations > 1 second
```

**Total: 10 Non-Functional Requirements**

### Additional Requirements

#### From Architecture (MVP Addendum)

**Database Setup:**
- Create 6 tables: users, products, inventory, processes, production_entries, production_lines
- Seed standard processes: Multi-saw, Planing, Opti-cut, Gluing, Sanding, Finger Jointing
- No RLS needed (single tenant)
- No organization_id columns (single producer)

**Portal App Setup:**
- Create `apps/portal/` within existing Turborepo monorepo
- Follow Next.js App Router patterns from marketing app
- Use @timber/* shared packages
- Simple auth middleware (login check only, no RBAC)

**Simplified Auth (Updated):**
- Supabase Auth with email/password
- Two simple roles: `admin` and `producer`
- Role-based navigation (Admin sees inventory management, Producer sees production)
- Simple role check (not full RBAC)

#### From UX Design Specification

**Core Screens (4 total):**
1. Dashboard - Total inventory, per-process metrics (Outcome %, Waste %)
2. Inventory - Table of all products with totals per product type
3. Production - Create/edit production entry with input/output line items
4. Production History - List of completed processes, click to view/edit

**Key Interactions:**
- Smart output generation (auto-generate from inputs)
- "Apply to All" for common dimension values
- Live running totals during production entry
- Validation confirmation before committing
- Edit existing production entries from history

**Process Configuration:**
- Standard processes: Multi-saw, Planing, Opti-cut, Gluing, Sanding, Finger Jointing
- Custom processes can be added by Factory Manager

**Component Strategy:**
- Use shadcn/ui components (Table, Card, Button, Input, Select, Dialog, Form)
- Custom components: ProductLineItem, ProductionSummary, ProcessSelector, MetricCard

**Accessibility:**
- Keyboard shortcuts: Ctrl+I (add input), Ctrl+O (add output), Ctrl+Enter (validate), Escape (cancel)
- Tab navigation through all flows
- Visible focus indicators

**Form Patterns:**
- "+ Add Item" button for line items
- Validate on blur
- Required fields marked with *
- Running totals update instantly

### FR Coverage Map

| FR | Epic | User | Description |
|----|------|------|-------------|
| FR2 | Epic 1 | Both | Email/password authentication |
| FR4 | Epic 1 | Both | View/update profile |
| FR30 | Epic 2 | Admin | Record inventory sent to producers |
| FR33 | Epic 2 | Admin | View inventory across all facilities |
| FR32 | Epic 3 | Producer | View inventory at their facility |
| FR42 | Epic 4 | Producer | Report production (input → output) |
| FR43 | Epic 4 | Producer | Record waste/loss |
| FR44 | Epic 4 | Producer | Submit completed production |
| FR45 | Epic 5 | Producer | View production history |
| FR46 | Epic 5 | Producer | View efficiency metrics |
| FR51 | Epic 5 | Admin | View producer efficiency reports |
| FR52 | Epic 5 | Both | System calculates efficiency |

**Coverage:** 12/12 FRs mapped (100%)

## Epic List

### Epic 1: Portal Foundation & User Access
**User Outcome:** Users (Admin and Producer) can log into the portal with role-based navigation

**FRs covered:** FR2, FR4

**Additional Requirements:**
- Portal app setup in monorepo (`apps/portal/`)
- Database schema (6 tables + roles)
- Seed data for standard processes
- Two simple roles (admin, producer)
- Role-based dashboard shell and navigation

**Standalone Value:** Both user types can log in and see appropriate navigation for their role.

---

### Epic 2: Admin Inventory Management
**User Outcome:** Admin can input inventory sent to producer facility and view all inventory levels

**FRs covered:** FR30, FR33

**Additional Requirements:**
- Product management (add/edit products)
- Inventory input form (record materials sent to producer)
- Admin inventory overview table
- Inventory totals and filtering

**Standalone Value:** Admin can record what materials were sent to the producer. Complete inventory input system.

---

### Epic 3: Producer Inventory View
**User Outcome:** Producer can view current inventory at their facility with quantities and totals

**FRs covered:** FR32

**Additional Requirements:**
- Producer inventory table (read-only view of what Admin inputted)
- Filtering and sorting
- Totals per product type
- Product details view

**Standalone Value:** Producer sees what materials they have available. Builds on Epic 2.

---

### Epic 4: Production Entry & Tracking
**User Outcome:** Producer can log production transformations (input → process → output) and commit to inventory

**FRs covered:** FR42, FR43, FR44

**Additional Requirements:**
- Production form with process selection (standard + custom)
- Input line items (select from inventory)
- Output line items (with auto-generation from inputs)
- Live m³ calculations
- Waste calculation (input - output)
- Validation workflow with confirmation dialog
- Inventory update on commit

**Standalone Value:** Core production tracking complete. Producer can create production entries that update inventory.

---

### Epic 5: Production Insights & History
**User Outcome:** Producer can view history and edit past entries; Admin can view producer efficiency reports

**FRs covered:** FR45, FR46, FR51, FR52

**Additional Requirements:**
- Production history table for Producer
- Edit existing production entries
- Dashboard metrics (outcome %, waste %)
- Per-process efficiency breakdown
- Admin efficiency overview/comparison
- Efficiency calculation engine

**Standalone Value:** Complete analytics for both user types. Full visibility into production performance.

---

## Epic 1: Portal Foundation & User Access

**Goal:** Users (Admin and Producer) can log into the portal with role-based navigation

**FRs covered:** FR2, FR4

---

### Story 1.1: Portal App & Database Foundation

**As a** developer,
**I want** the portal app and database schema set up,
**So that** all subsequent features have a foundation to build on.

**Acceptance Criteria:**

**Given** the existing Turborepo monorepo
**When** I run the portal app setup
**Then** `apps/portal/` is created with Next.js App Router structure
**And** the app integrates with `@timber/ui`, `@timber/database`, `@timber/config` packages
**And** the app runs successfully on `localhost:3001`

**Given** the Supabase database
**When** migrations are applied
**Then** the following tables exist: `users`, `products`, `inventory`, `processes`, `production_entries`, `production_lines`
**And** a `role` column exists on `users` table (enum: 'admin', 'producer')
**And** standard processes are seeded: Multi-saw, Planing, Opti-cut, Gluing, Sanding, Finger Jointing

---

### Story 1.2: User Registration

**As a** new user,
**I want** to register for an account,
**So that** I can access the portal.

**Acceptance Criteria:**

**Given** I am on the registration page
**When** I enter valid email, password, name, and select a role (admin/producer)
**Then** my account is created in Supabase Auth
**And** a corresponding record is created in the `users` table with my role
**And** I am redirected to the login page with a success message

**Given** I enter an email that already exists
**When** I submit the registration form
**Then** I see an error message "Email already registered"
**And** the form is not submitted

**Given** I enter a password less than 8 characters
**When** I submit the form
**Then** I see a validation error "Password must be at least 8 characters"

---

### Story 1.3: User Login & Session

**As a** registered user,
**I want** to log in to the portal,
**So that** I can access my role-specific features.

**Acceptance Criteria:**

**Given** I am on the login page
**When** I enter valid email and password
**Then** I am authenticated via Supabase Auth
**And** I am redirected to my role-appropriate dashboard
**And** my session persists across page refreshes

**Given** I enter incorrect credentials
**When** I submit the login form
**Then** I see an error message "Invalid email or password"
**And** I remain on the login page

**Given** I am logged in
**When** I click "Logout"
**Then** my session is terminated
**And** I am redirected to the login page

**Given** I try to access a protected route without being logged in
**When** the page loads
**Then** I am redirected to the login page

---

### Story 1.4: Role-Based Navigation

**As a** logged-in user,
**I want** to see navigation appropriate to my role,
**So that** I can access the features relevant to me.

**Acceptance Criteria:**

**Given** I am logged in as Admin
**When** I view the dashboard
**Then** I see navigation links: Dashboard, Inventory (manage), Products (manage)
**And** the dashboard shows an "Admin Overview" header

**Given** I am logged in as Producer
**When** I view the dashboard
**Then** I see navigation links: Dashboard, Inventory (view), Production, History
**And** the dashboard shows a "Production Dashboard" header

**Given** I am a Producer
**When** I try to access an Admin-only route (e.g., /inventory/manage)
**Then** I am redirected to my dashboard with an "Access denied" message

---

### Story 1.5: User Profile Management

**As a** logged-in user,
**I want** to view and update my profile,
**So that** my information stays current.

**Acceptance Criteria:**

**Given** I am logged in
**When** I navigate to my profile page
**Then** I see my current name, email, and role displayed
**And** my role is displayed but not editable

**Given** I am on my profile page
**When** I update my name and click Save
**Then** my name is updated in the database
**And** I see a success toast "Profile updated"

**Given** I am on my profile page
**When** I try to save with an empty name field
**Then** I see a validation error "Name is required"
**And** the form is not submitted

---

## Epic 2: Admin Inventory Management

**Goal:** Admin can input inventory sent to producer facility and view all inventory levels

**FRs covered:** FR30, FR33

---

### Story 2.1: Product Management

**As an** Admin,
**I want** to create and manage products in the catalog,
**So that** I can track different material types in inventory.

**Acceptance Criteria:**

**Given** I am logged in as Admin
**When** I navigate to Products page
**Then** I see a table of all products with columns: Name, Species, Moisture State, Dimensions, Unit
**And** I see an "Add Product" button

**Given** I am on the Products page
**When** I click "Add Product"
**Then** I see a form with fields: Name (required), Species, Moisture State, Dimensions, Unit (default: pcs)

**Given** I am adding a new product
**When** I fill in valid product details and click Save
**Then** the product is created in the `products` table
**And** I see a success toast "Product created"
**And** the product appears in the products table

**Given** I am viewing the products table
**When** I click Edit on a product row
**Then** I see a form pre-filled with the product's current values
**And** I can update and save changes

**Given** I try to create a product without a name
**When** I click Save
**Then** I see a validation error "Product name is required"

---

### Story 2.2: Record Inventory Sent to Producer

**As an** Admin,
**I want** to record inventory sent to the producer facility,
**So that** the producer can see what materials they have available.

**Acceptance Criteria:**

**Given** I am logged in as Admin
**When** I navigate to Inventory > Add Inventory
**Then** I see a form to record inventory

**Given** I am on the Add Inventory form
**When** I select a product from the dropdown
**Then** the product's default species, moisture state, and dimensions are pre-filled
**And** I can override these values if needed

**Given** I am adding inventory
**When** I enter quantity and optional cubic meters, then click Save
**Then** a new record is created in the `inventory` table
**And** I see a success toast "Inventory recorded"
**And** the inventory totals are updated

**Given** existing inventory for a product
**When** I add more inventory of the same product
**Then** the quantity is added to the existing inventory record (or creates new record)
**And** totals reflect the combined amount

**Given** I try to add inventory with quantity <= 0
**When** I click Save
**Then** I see a validation error "Quantity must be greater than 0"

---

### Story 2.3: Admin Inventory Overview

**As an** Admin,
**I want** to view all inventory levels with filtering and totals,
**So that** I can monitor what materials are at the producer facility.

**Acceptance Criteria:**

**Given** I am logged in as Admin
**When** I navigate to Inventory Overview
**Then** I see a table showing all inventory grouped by product
**And** columns display: Product Name, Species, Quantity, Cubic Meters, Last Updated

**Given** I am viewing the inventory overview
**When** I look at the page
**Then** I see summary cards showing: Total Products, Total Quantity, Total Cubic Meters

**Given** inventory exists in the system
**When** I use the search/filter bar
**Then** I can filter by product name or species
**And** the table updates to show matching items only

**Given** I am viewing the inventory table
**When** I click on column headers
**Then** the table sorts by that column (ascending/descending toggle)

**Given** no inventory exists yet
**When** I view the Inventory Overview
**Then** I see an empty state message "No inventory recorded yet"
**And** I see a link to "Add Inventory"

---

## Epic 3: Producer Inventory View

**Goal:** Producer can view current inventory at their facility with quantities and totals

**FRs covered:** FR32

---

### Story 3.1: Producer Inventory Table

**As a** Producer,
**I want** to view the current inventory at my facility,
**So that** I know what materials are available for production.

**Acceptance Criteria:**

**Given** I am logged in as Producer
**When** I navigate to Inventory
**Then** I see a table of all inventory at my facility
**And** columns display: Product Name, Species, Moisture State, Dimensions, Quantity, Cubic Meters

**Given** inventory exists in the system
**When** I view the inventory table
**Then** I see a summary row showing totals per product type
**And** I see overall totals: Total Items, Total Cubic Meters

**Given** I am viewing the inventory table
**When** I look at the page header
**Then** I see summary cards with key metrics: Total Products, Total Quantity, Total m³

**Given** no inventory exists yet
**When** I view the Inventory page
**Then** I see an empty state message "No inventory available"
**And** I see a note "Contact Admin to record incoming materials"

**Given** I am viewing the inventory table
**When** I click on a product row
**Then** I see a detail panel/modal showing full product information
**And** the view is read-only (Producer cannot edit inventory directly)

---

### Story 3.2: Inventory Filtering & Search

**As a** Producer,
**I want** to filter and search inventory,
**So that** I can quickly find specific materials for production.

**Acceptance Criteria:**

**Given** I am viewing the inventory table
**When** I type in the search box
**Then** the table filters to show products matching the search term
**And** search matches against: Product Name, Species

**Given** I am viewing the inventory table
**When** I click on a column header
**Then** the table sorts by that column
**And** clicking again toggles between ascending and descending

**Given** I have filtered/sorted the inventory
**When** I click "Clear Filters"
**Then** the table resets to show all inventory in default order

**Given** I filter inventory and no results match
**When** I view the table
**Then** I see a message "No inventory matches your search"
**And** I see a "Clear Search" button

---

## Epic 4: Production Entry & Tracking

**Goal:** Producer can log production transformations (input → process → output) and commit to inventory

**FRs covered:** FR42, FR43, FR44

---

### Story 4.1: Create Production Entry with Process Selection

**As a** Producer,
**I want** to start a new production entry and select a process,
**So that** I can begin logging a production transformation.

**Acceptance Criteria:**

**Given** I am logged in as Producer
**When** I navigate to Production and click "New Production"
**Then** I see a production form with a process selector

**Given** I am creating a new production entry
**When** I view the process selector
**Then** I see standard processes: Multi-saw, Planing, Opti-cut, Gluing, Sanding, Finger Jointing
**And** I see any custom processes I've added
**And** I see an option to "Add Custom Process"

**Given** I select a process
**When** I confirm selection
**Then** a new `production_entries` record is created with status "draft"
**And** the production date defaults to today
**And** I proceed to the input selection step

**Given** I have a draft production entry
**When** I navigate away and return to Production
**Then** I can see and continue my draft entry
**And** I can start a new entry if preferred

---

### Story 4.2: Add Production Inputs from Inventory

**As a** Producer,
**I want** to select materials from inventory as production inputs,
**So that** I can record what was consumed in the process.

**Acceptance Criteria:**

**Given** I am on a production entry form
**When** I click "+ Add Input"
**Then** I see a product selector showing available inventory items
**And** each item shows: Product Name, Available Quantity, m³

**Given** I am adding an input
**When** I select a product from inventory
**Then** a new input line is added with the product pre-filled
**And** I can enter quantity used (cannot exceed available inventory)
**And** dimensions are inherited from the product but can be overridden

**Given** I have added input lines
**When** I view the inputs section
**Then** I see all input lines with: Product, Quantity, Dimensions, m³
**And** I see a running total of input m³
**And** I can remove any input line by clicking delete

**Given** I try to enter quantity greater than available
**When** I blur the quantity field
**Then** I see a validation error "Quantity exceeds available inventory"

**Given** I have multiple inputs to add
**When** I use keyboard shortcut Ctrl+I
**Then** a new input line is added quickly

---

### Story 4.3: Add Production Outputs

**As a** Producer,
**I want** to record the output products from production,
**So that** I can track what was created from the inputs.

**Acceptance Criteria:**

**Given** I have added inputs to a production entry
**When** I move to the Outputs section
**Then** output lines are auto-generated based on inputs
**And** species and moisture state are inherited from inputs
**And** I can adjust product name, quantity, and dimensions

**Given** I am editing output lines
**When** I need the same dimensions for all outputs
**Then** I can click "Apply to All" to set dimensions across all output lines

**Given** I am adding outputs
**When** I click "+ Add Output"
**Then** a new blank output line is added
**And** I can select/enter: Product Name, Quantity, Dimensions, m³

**Given** I have added output lines
**When** I view the outputs section
**Then** I see all output lines with: Product, Quantity, Dimensions, m³
**And** I see a running total of output m³
**And** I can remove any output line by clicking delete

**Given** I want to add outputs quickly
**When** I use keyboard shortcut Ctrl+O
**Then** a new output line is added

---

### Story 4.4: Live Production Calculations

**As a** Producer,
**I want** to see live calculations as I enter production data,
**So that** I can verify accuracy before committing.

**Acceptance Criteria:**

**Given** I am entering production inputs and outputs
**When** I add or modify any line item
**Then** the following calculations update immediately:
- Total Input m³
- Total Output m³
- Outcome % (output/input × 100)
- Waste % (100 - outcome %)

**Given** I am viewing the production form
**When** I look at the summary section
**Then** I see a ProductionSummary component displaying all calculated metrics
**And** metrics are color-coded (e.g., outcome % shows green if >80%, yellow if 60-80%, red if <60%)

**Given** inputs total 10 m³ and outputs total 8.5 m³
**When** I view the summary
**Then** Outcome % shows 85%
**And** Waste % shows 15%

**Given** I have no inputs entered yet
**When** I view calculations
**Then** metrics show "--" or "0" and don't show errors

---

### Story 4.5: Validate Production & Update Inventory

**As a** Producer,
**I want** to validate and commit my production entry,
**So that** inventory is updated and the production is recorded permanently.

**Acceptance Criteria:**

**Given** I have a complete production entry (inputs + outputs)
**When** I click "Validate"
**Then** I see a confirmation dialog showing:
- Summary of inputs (total m³ to be consumed)
- Summary of outputs (total m³ to be added)
- Calculated outcome % and waste %
- Warning if outcome % is unusual (<50% or >100%)

**Given** I am on the validation confirmation
**When** I confirm by clicking "Validate & Commit"
**Then** the production entry status changes from "draft" to "validated"
**And** input items are deducted from `inventory` table
**And** output items are added to `inventory` table (as new products/quantities)
**And** `validated_at` timestamp is set
**And** I see success toast "Production validated successfully"
**And** I am redirected to production history

**Given** I try to validate without any inputs
**When** I click "Validate"
**Then** I see an error "At least one input is required"

**Given** I try to validate without any outputs
**When** I click "Validate"
**Then** I see an error "At least one output is required"

**Given** I want to cancel validation
**When** I click "Cancel" on the confirmation dialog
**Then** I return to the production form with no changes made
**And** entry remains in "draft" status

**Given** I press Ctrl+Enter
**When** I have a valid production entry
**Then** the validation dialog opens

---

### Story 4.6: Custom Process Management

**As a** Producer,
**I want** to add custom production processes,
**So that** I can track processes specific to my facility.

**Acceptance Criteria:**

**Given** I am selecting a process for production
**When** I click "Add Custom Process"
**Then** I see a dialog to enter a new process name

**Given** I am adding a custom process
**When** I enter a name and click Save
**Then** a new process is created in the `processes` table with `is_standard = false`
**And** the new process appears in my process selector
**And** the new process is automatically selected

**Given** custom processes exist
**When** I view the process selector
**Then** standard processes appear first
**And** custom processes appear below with a "Custom" label

**Given** I try to create a process with a name that already exists
**When** I click Save
**Then** I see an error "Process name already exists"

---

## Epic 5: Production Insights & History

**Goal:** Producer can view history and edit past entries; Admin can view producer efficiency reports

**FRs covered:** FR45, FR46, FR51, FR52

---

### Story 5.1: Production History Table

**As a** Producer,
**I want** to view my production history,
**So that** I can review past production entries and their results.

**Acceptance Criteria:**

**Given** I am logged in as Producer
**When** I navigate to History
**Then** I see a table of all validated production entries
**And** columns display: Date, Process Type, Input m³, Output m³, Outcome %, Waste %

**Given** production entries exist
**When** I view the history table
**Then** entries are sorted by date (newest first) by default
**And** I can click column headers to sort by any column

**Given** I am viewing production history
**When** I use the date filter
**Then** I can filter to a specific date range
**And** the table updates to show only matching entries

**Given** I am viewing production history
**When** I use the process filter dropdown
**Then** I can filter by process type
**And** the table shows only entries for that process

**Given** I click on a history row
**When** the row expands or navigates
**Then** I see full details: all input lines, all output lines, calculations, notes
**And** I see a "Edit" button to modify this entry

**Given** no production entries exist
**When** I view the History page
**Then** I see an empty state "No production history yet"
**And** I see a link to "Create Production Entry"

---

### Story 5.2: Edit Production Entry

**As a** Producer,
**I want** to edit a validated production entry,
**So that** I can correct mistakes in past records.

**Acceptance Criteria:**

**Given** I am viewing a production entry in history
**When** I click "Edit"
**Then** I see the full production form pre-filled with all existing data
**And** status shows "Editing validated entry"

**Given** I am editing a validated entry
**When** I modify inputs, outputs, or process
**Then** calculations update live (same as new entry)
**And** I see a warning "Editing will update inventory accordingly"

**Given** I have made changes to a validated entry
**When** I click "Re-validate"
**Then** I see a confirmation dialog showing:
- Original values vs new values
- Net inventory changes that will occur
- "This will adjust inventory to match new values"

**Given** I confirm re-validation
**When** the system processes the change
**Then** inventory is adjusted (old inputs restored, old outputs removed, new values applied)
**And** the entry's `updated_at` timestamp is updated
**And** I see success toast "Production entry updated"
**And** I am redirected to history

**Given** I am editing an entry
**When** I click "Cancel"
**Then** no changes are saved
**And** I return to history view

**Given** I am editing an entry
**When** I click "Delete Entry"
**Then** I see a confirmation "This will restore inventory to pre-production state"
**And** if confirmed, the entry is deleted and inventory is restored

---

### Story 5.3: Producer Dashboard Metrics

**As a** Producer,
**I want** to see efficiency metrics on my dashboard,
**So that** I can understand my production performance at a glance.

**Acceptance Criteria:**

**Given** I am logged in as Producer
**When** I view my dashboard
**Then** I see MetricCards displaying:
- Total Inventory (current m³)
- Total Production Volume (all-time output m³)
- Overall Outcome % (weighted average across all production)
- Overall Waste % (weighted average)

**Given** production history exists
**When** I view the dashboard
**Then** I see a per-process breakdown table showing:
- Process Name
- Total Entries
- Total Input m³
- Total Output m³
- Average Outcome %
- Average Waste %

**Given** I am viewing per-process metrics
**When** I look at individual process rows
**Then** metrics are color-coded:
- Green: Outcome % ≥ 80%
- Yellow: Outcome % 60-79%
- Red: Outcome % < 60%

**Given** no production has been recorded yet
**When** I view the dashboard
**Then** metrics show "0" or "--" appropriately
**And** I see a prompt "Start tracking production to see metrics"

**Given** I click on a process in the breakdown table
**When** the action completes
**Then** I am taken to History filtered by that process

---

### Story 5.4: Admin Efficiency Reports

**As an** Admin,
**I want** to view producer efficiency reports,
**So that** I can monitor production performance and identify improvements.

**Acceptance Criteria:**

**Given** I am logged in as Admin
**When** I view my dashboard
**Then** I see an "Efficiency Overview" section
**And** I see summary metrics: Total Production Volume, Overall Outcome %, Overall Waste %

**Given** production data exists
**When** I view the Admin dashboard
**Then** I see a per-process efficiency table showing:
- Process Name
- Total Entries
- Total Input m³
- Total Output m³
- Outcome %
- Waste %
- Trend indicator (↑↓ compared to previous period)

**Given** I am viewing efficiency reports
**When** I use the date range filter
**Then** I can view metrics for: This Week, This Month, This Quarter, All Time, Custom Range
**And** all metrics recalculate for the selected period

**Given** I am viewing per-process metrics
**When** I click on a process row
**Then** I see a detailed view with:
- Chart showing outcome % over time
- List of recent production entries for that process
- Best and worst performing entries

**Given** I want to export data
**When** I click "Export"
**Then** I can download efficiency data as CSV
**And** export includes: Date, Process, Input m³, Output m³, Outcome %, Waste %

**Given** no production data exists
**When** I view Admin dashboard
**Then** I see a message "No production data recorded yet"
**And** the efficiency section shows placeholder state
