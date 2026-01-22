-- =============================================
-- Portal MVP Schema
-- Migration: 20260122000001_portal_mvp_schema.sql
-- Description: Create tables for Producer MVP portal
-- Scope: Producer Portal - Production Tracking with Admin Inventory Management
-- =============================================

-- Note: Tables prefixed with 'portal_' to avoid conflicts with existing marketing schema
-- These will be consolidated when migrating to full platform

-- =============================================
-- 1. PORTAL USERS TABLE
-- Simplified user management for MVP (admin/producer roles)
-- =============================================

CREATE TABLE portal_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'producer' CHECK (role IN ('admin', 'producer')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_portal_users_auth_id ON portal_users(auth_user_id);
CREATE INDEX idx_portal_users_email ON portal_users(email);
CREATE INDEX idx_portal_users_role ON portal_users(role);

-- =============================================
-- 2. PORTAL PRODUCTS TABLE
-- Product catalog for production tracking
-- =============================================

CREATE TABLE portal_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  species TEXT,
  moisture_state TEXT,
  dimensions TEXT,
  unit TEXT DEFAULT 'pcs',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_portal_products_name ON portal_products(name);
CREATE INDEX idx_portal_products_species ON portal_products(species);

-- =============================================
-- 3. PORTAL INVENTORY TABLE
-- Current stock at producer facility
-- =============================================

CREATE TABLE portal_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES portal_products(id) ON DELETE CASCADE NOT NULL,
  quantity DECIMAL NOT NULL DEFAULT 0,
  cubic_meters DECIMAL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_portal_inventory_product_id ON portal_inventory(product_id);

-- =============================================
-- 4. PORTAL PROCESSES TABLE
-- Production process types (standard and custom)
-- =============================================

CREATE TABLE portal_processes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  is_standard BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_portal_processes_name ON portal_processes(name);
CREATE INDEX idx_portal_processes_is_standard ON portal_processes(is_standard);

-- =============================================
-- 5. PORTAL PRODUCTION ENTRIES TABLE
-- Core transformation records (input -> process -> output)
-- =============================================

CREATE TABLE portal_production_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id UUID REFERENCES portal_processes(id) NOT NULL,
  production_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'validated')),
  notes TEXT,
  -- Calculated totals (stored for performance)
  total_input_m3 DECIMAL,
  total_output_m3 DECIMAL,
  outcome_percentage DECIMAL,
  waste_percentage DECIMAL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  validated_at TIMESTAMPTZ
);

CREATE INDEX idx_portal_production_entries_process_id ON portal_production_entries(process_id);
CREATE INDEX idx_portal_production_entries_status ON portal_production_entries(status);
CREATE INDEX idx_portal_production_entries_date ON portal_production_entries(production_date DESC);

-- =============================================
-- 6. PORTAL PRODUCTION LINES TABLE
-- Input and output items for each production entry
-- =============================================

CREATE TABLE portal_production_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  production_entry_id UUID REFERENCES portal_production_entries(id) ON DELETE CASCADE NOT NULL,
  line_type TEXT NOT NULL CHECK (line_type IN ('input', 'output')),
  product_id UUID REFERENCES portal_products(id),
  product_name TEXT,
  quantity DECIMAL NOT NULL,
  cubic_meters DECIMAL,
  dimensions TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_portal_production_lines_entry_id ON portal_production_lines(production_entry_id);
CREATE INDEX idx_portal_production_lines_type ON portal_production_lines(line_type);
CREATE INDEX idx_portal_production_lines_product_id ON portal_production_lines(product_id);

-- =============================================
-- TRIGGERS FOR updated_at
-- =============================================

-- Reuse the existing update_updated_at_column function if it exists,
-- otherwise create it
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER portal_users_updated_at
  BEFORE UPDATE ON portal_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER portal_products_updated_at
  BEFORE UPDATE ON portal_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER portal_inventory_updated_at
  BEFORE UPDATE ON portal_inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER portal_production_entries_updated_at
  BEFORE UPDATE ON portal_production_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SEED DATA: Standard Production Processes
-- =============================================

INSERT INTO portal_processes (name, is_standard) VALUES
  ('Multi-saw', true),
  ('Planing', true),
  ('Opti-cut', true),
  ('Gluing', true),
  ('Sanding', true),
  ('Finger Jointing', true)
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE portal_users IS 'Portal users for MVP (admin/producer roles)';
COMMENT ON TABLE portal_products IS 'Product catalog for production tracking';
COMMENT ON TABLE portal_inventory IS 'Current inventory at producer facility';
COMMENT ON TABLE portal_processes IS 'Production process types (standard and custom)';
COMMENT ON TABLE portal_production_entries IS 'Production transformation records';
COMMENT ON TABLE portal_production_lines IS 'Input/output line items for production entries';

-- =============================================
-- NOTE: RLS not enabled for MVP (single tenant)
-- Will be added when migrating to multi-tenant platform
-- =============================================
