-- =============================================
-- Production Package Number Counter System
-- Migration: 20260127200000_production_package_counters.sql
--
-- Package number format: N-{process_code}-{0001-9999}
-- Counter is per organisation + process code
-- Wraps from 9999 back to 0001
-- =============================================

-- =============================================
-- 1. CREATE COUNTER TABLE
-- =============================================

CREATE TABLE production_package_counters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  process_code TEXT NOT NULL,
  last_number INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_org_process UNIQUE (organisation_id, process_code),
  CONSTRAINT valid_last_number CHECK (last_number >= 0 AND last_number <= 9999)
);

-- Add index for faster lookups
CREATE INDEX idx_production_package_counters_org ON production_package_counters(organisation_id);

-- Add trigger for updated_at
CREATE TRIGGER production_package_counters_updated_at
  BEFORE UPDATE ON production_package_counters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE production_package_counters IS
  'Tracks sequential package numbers per organisation and process code for production outputs';

-- =============================================
-- 2. CREATE FUNCTION TO GENERATE PACKAGE NUMBER
-- =============================================

CREATE OR REPLACE FUNCTION generate_production_package_number(
  p_organisation_id UUID,
  p_process_code TEXT
) RETURNS TEXT AS $$
DECLARE
  v_next_number INTEGER;
  v_counter_exists BOOLEAN;
BEGIN
  -- Lock the row to prevent race conditions
  SELECT EXISTS(
    SELECT 1 FROM production_package_counters
    WHERE organisation_id = p_organisation_id AND process_code = p_process_code
    FOR UPDATE
  ) INTO v_counter_exists;

  IF v_counter_exists THEN
    -- Increment and get next number (wrap from 9999 to 1)
    UPDATE production_package_counters
    SET last_number = CASE
      WHEN last_number >= 9999 THEN 1
      ELSE last_number + 1
    END,
    updated_at = NOW()
    WHERE organisation_id = p_organisation_id AND process_code = p_process_code
    RETURNING last_number INTO v_next_number;
  ELSE
    -- Create new counter starting at 1
    INSERT INTO production_package_counters (organisation_id, process_code, last_number)
    VALUES (p_organisation_id, p_process_code, 1)
    RETURNING last_number INTO v_next_number;
  END IF;

  -- Return formatted package number: N-{code}-{0001}
  RETURN 'N-' || p_process_code || '-' || LPAD(v_next_number::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_production_package_number IS
  'Generates next sequential package number for production output in format N-{process_code}-{0001-9999}';

-- =============================================
-- 3. SEED EXISTING COUNTERS FOR INERCE (INE)
-- =============================================

-- Calibration process (code likely "CA") - last number was 51
INSERT INTO production_package_counters (organisation_id, process_code, last_number)
SELECT o.id, p.code, 51
FROM organisations o
CROSS JOIN ref_processes p
WHERE o.code = 'INE' AND p.value = 'Calibration'
ON CONFLICT (organisation_id, process_code) DO UPDATE SET last_number = 51;

-- Finger Jointing process (code "FJ") - last number was 5
INSERT INTO production_package_counters (organisation_id, process_code, last_number)
SELECT o.id, p.code, 5
FROM organisations o
CROSS JOIN ref_processes p
WHERE o.code = 'INE' AND p.value = 'Finger Jointing'
ON CONFLICT (organisation_id, process_code) DO UPDATE SET last_number = 5;

-- =============================================
-- 4. RELOAD POSTGREST SCHEMA CACHE
-- =============================================

NOTIFY pgrst, 'reload schema';
