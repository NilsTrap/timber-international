-- =============================================
-- Inventory Data Model v2
-- Migration: 20260122000002_inventory_model_v2.sql
-- Description: Flat shipment/package inventory model with admin-managed dropdowns
-- Replaces: Product-based inventory model
-- =============================================

-- =============================================
-- 1. REFERENCE TABLES (Admin-Managed Dropdowns)
-- =============================================

-- Product Names
CREATE TABLE ref_product_names (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  value TEXT NOT NULL UNIQUE,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ref_product_names_active ON ref_product_names(is_active);
CREATE INDEX idx_ref_product_names_sort ON ref_product_names(sort_order);

-- Wood Species
CREATE TABLE ref_wood_species (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  value TEXT NOT NULL UNIQUE,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ref_wood_species_active ON ref_wood_species(is_active);
CREATE INDEX idx_ref_wood_species_sort ON ref_wood_species(sort_order);

-- Humidity Options
CREATE TABLE ref_humidity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  value TEXT NOT NULL UNIQUE,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ref_humidity_active ON ref_humidity(is_active);
CREATE INDEX idx_ref_humidity_sort ON ref_humidity(sort_order);

-- Types (FJ, Full stave)
CREATE TABLE ref_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  value TEXT NOT NULL UNIQUE,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ref_types_active ON ref_types(is_active);
CREATE INDEX idx_ref_types_sort ON ref_types(sort_order);

-- Processing Options
CREATE TABLE ref_processing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  value TEXT NOT NULL UNIQUE,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ref_processing_active ON ref_processing(is_active);
CREATE INDEX idx_ref_processing_sort ON ref_processing(sort_order);

-- FSC Certification
CREATE TABLE ref_fsc (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  value TEXT NOT NULL UNIQUE,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ref_fsc_active ON ref_fsc(is_active);
CREATE INDEX idx_ref_fsc_sort ON ref_fsc(sort_order);

-- Quality Grades
CREATE TABLE ref_quality (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  value TEXT NOT NULL UNIQUE,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ref_quality_active ON ref_quality(is_active);
CREATE INDEX idx_ref_quality_sort ON ref_quality(sort_order);

-- =============================================
-- 2. PARTIES TABLE
-- =============================================

CREATE TABLE parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code CHAR(3) NOT NULL UNIQUE,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT parties_code_uppercase CHECK (code = UPPER(code))
);

CREATE INDEX idx_parties_code ON parties(code);
CREATE INDEX idx_parties_active ON parties(is_active);

-- =============================================
-- 3. SHIPMENTS TABLE
-- =============================================

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

CREATE INDEX idx_shipments_code ON shipments(shipment_code);
CREATE INDEX idx_shipments_number ON shipments(shipment_number);
CREATE INDEX idx_shipments_date ON shipments(shipment_date DESC);
CREATE INDEX idx_shipments_from ON shipments(from_party_id);
CREATE INDEX idx_shipments_to ON shipments(to_party_id);

-- Sequence for global shipment numbering
CREATE SEQUENCE shipment_number_seq START 1;

-- =============================================
-- 4. INVENTORY (PACKAGES) TABLE
-- =============================================

CREATE TABLE inventory_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Shipment Reference
  shipment_id UUID REFERENCES shipments(id) NOT NULL,
  package_number TEXT NOT NULL UNIQUE,
  package_sequence INTEGER NOT NULL,

  -- Dropdown Fields (Foreign Keys to Reference Tables)
  product_name_id UUID REFERENCES ref_product_names(id),
  wood_species_id UUID REFERENCES ref_wood_species(id),
  humidity_id UUID REFERENCES ref_humidity(id),
  type_id UUID REFERENCES ref_types(id),
  processing_id UUID REFERENCES ref_processing(id),
  fsc_id UUID REFERENCES ref_fsc(id),
  quality_id UUID REFERENCES ref_quality(id),

  -- Dimension Fields (Number or Range stored as TEXT)
  thickness TEXT,
  width TEXT,
  length TEXT,

  -- Quantity Fields
  pieces TEXT,
  volume_m3 DECIMAL,
  volume_is_calculated BOOLEAN DEFAULT false,

  -- Status for production tracking
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'consumed', 'produced')),

  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(shipment_id, package_sequence)
);

CREATE INDEX idx_inventory_packages_shipment ON inventory_packages(shipment_id);
CREATE INDEX idx_inventory_packages_number ON inventory_packages(package_number);
CREATE INDEX idx_inventory_packages_product ON inventory_packages(product_name_id);
CREATE INDEX idx_inventory_packages_species ON inventory_packages(wood_species_id);
CREATE INDEX idx_inventory_packages_status ON inventory_packages(status);

-- =============================================
-- 5. TRIGGERS FOR updated_at
-- =============================================

-- Reuse existing function from previous migration
-- CREATE OR REPLACE FUNCTION update_updated_at_column() already exists

CREATE TRIGGER ref_product_names_updated_at
  BEFORE UPDATE ON ref_product_names
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER ref_wood_species_updated_at
  BEFORE UPDATE ON ref_wood_species
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER ref_humidity_updated_at
  BEFORE UPDATE ON ref_humidity
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER ref_types_updated_at
  BEFORE UPDATE ON ref_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER ref_processing_updated_at
  BEFORE UPDATE ON ref_processing
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER ref_fsc_updated_at
  BEFORE UPDATE ON ref_fsc
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER ref_quality_updated_at
  BEFORE UPDATE ON ref_quality
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER parties_updated_at
  BEFORE UPDATE ON parties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER shipments_updated_at
  BEFORE UPDATE ON shipments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER inventory_packages_updated_at
  BEFORE UPDATE ON inventory_packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 6. SEED DATA: Reference Tables
-- =============================================

-- Product Names
INSERT INTO ref_product_names (value, sort_order) VALUES
  ('Unedged boards', 1),
  ('Edged boards', 2),
  ('Strips', 3),
  ('Solid wood panels', 4);

-- Wood Species
INSERT INTO ref_wood_species (value, sort_order) VALUES
  ('Oak', 1),
  ('Ash', 2),
  ('Birch', 3),
  ('Pine', 4);

-- Humidity
INSERT INTO ref_humidity (value, sort_order) VALUES
  ('Fresh cut', 1),
  ('Air dried', 2),
  ('KD 7-9%', 3),
  ('KD 9-11%', 4);

-- Types
INSERT INTO ref_types (value, sort_order) VALUES
  ('FJ', 1),
  ('Full stave', 2);

-- Processing
INSERT INTO ref_processing (value, sort_order) VALUES
  ('Rough sawn', 1),
  ('Calibrated', 2),
  ('Planed', 3),
  ('Opticut', 4),
  ('Sorted', 5),
  ('Unsorted', 6),
  ('Varnished', 7),
  ('Waxed', 8),
  ('Oiled', 9),
  ('Sanded', 10);

-- FSC Certification
INSERT INTO ref_fsc (value, sort_order) VALUES
  ('FSC 100%', 1),
  ('FSC Credit Mix', 2),
  ('No', 3);

-- Quality Grades
INSERT INTO ref_quality (value, sort_order) VALUES
  ('AA', 1),
  ('AV', 2),
  ('AS', 3),
  ('BC', 4),
  ('CC', 5),
  ('ABC', 6),
  ('Insects', 7),
  ('Defected', 8);

-- =============================================
-- 7. SEED DATA: Initial Parties
-- =============================================

INSERT INTO parties (code, name) VALUES
  ('TWP', 'Timber World Platform'),
  ('INE', 'INERCE');

-- =============================================
-- 8. COMMENTS
-- =============================================

COMMENT ON TABLE ref_product_names IS 'Reference table: Product name options (admin-managed)';
COMMENT ON TABLE ref_wood_species IS 'Reference table: Wood species options (admin-managed)';
COMMENT ON TABLE ref_humidity IS 'Reference table: Humidity/moisture options (admin-managed)';
COMMENT ON TABLE ref_types IS 'Reference table: Product type options like FJ, Full stave (admin-managed)';
COMMENT ON TABLE ref_processing IS 'Reference table: Processing method options (admin-managed)';
COMMENT ON TABLE ref_fsc IS 'Reference table: FSC certification options (admin-managed)';
COMMENT ON TABLE ref_quality IS 'Reference table: Quality grade options (admin-managed)';
COMMENT ON TABLE parties IS 'Organizations participating in shipments (TWP, producers, etc.)';
COMMENT ON TABLE shipments IS 'Shipment records between parties with auto-generated codes';
COMMENT ON TABLE inventory_packages IS 'Individual packages/inventory items with all attributes';

COMMENT ON COLUMN inventory_packages.thickness IS 'Thickness in mm - can be exact number (40) or range (40-50)';
COMMENT ON COLUMN inventory_packages.width IS 'Width in mm - can be exact number or range';
COMMENT ON COLUMN inventory_packages.length IS 'Length in mm - can be exact number or range';
COMMENT ON COLUMN inventory_packages.pieces IS 'Piece count - number or "-" for uncountable';
COMMENT ON COLUMN inventory_packages.volume_m3 IS 'Volume in cubic meters - auto-calculated or manual';
COMMENT ON COLUMN inventory_packages.status IS 'Package status: available, reserved, consumed, produced';

-- =============================================
-- 9. HELPER FUNCTIONS
-- =============================================

-- Function to generate shipment code
CREATE OR REPLACE FUNCTION generate_shipment_code(
  p_from_party_id UUID,
  p_to_party_id UUID
) RETURNS TEXT AS $$
DECLARE
  v_from_code CHAR(3);
  v_to_code CHAR(3);
  v_count INTEGER;
BEGIN
  -- Get party codes
  SELECT code INTO v_from_code FROM parties WHERE id = p_from_party_id;
  SELECT code INTO v_to_code FROM parties WHERE id = p_to_party_id;

  -- Count existing shipments between these parties
  SELECT COUNT(*) + 1 INTO v_count
  FROM shipments
  WHERE from_party_id = p_from_party_id AND to_party_id = p_to_party_id;

  -- Return formatted code
  RETURN v_from_code || '-' || v_to_code || '-' || LPAD(v_count::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to generate package number
CREATE OR REPLACE FUNCTION generate_package_number(
  p_shipment_id UUID
) RETURNS TEXT AS $$
DECLARE
  v_shipment_number INTEGER;
  v_package_count INTEGER;
BEGIN
  -- Get shipment number
  SELECT shipment_number INTO v_shipment_number
  FROM shipments WHERE id = p_shipment_id;

  -- Count existing packages in this shipment
  SELECT COUNT(*) + 1 INTO v_package_count
  FROM inventory_packages WHERE shipment_id = p_shipment_id;

  -- Return formatted package number
  RETURN 'TWP-' || LPAD(v_shipment_number::TEXT, 3, '0') || '-' || LPAD(v_package_count::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to get next shipment number (global sequence)
CREATE OR REPLACE FUNCTION get_next_shipment_number() RETURNS INTEGER AS $$
BEGIN
  RETURN nextval('shipment_number_seq');
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- NOTE: Old portal_products and portal_inventory tables are preserved
-- They can be dropped after data migration if needed
-- =============================================
