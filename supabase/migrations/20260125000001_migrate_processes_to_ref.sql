-- =============================================
-- Migration: Convert portal_processes to ref_processes
-- Aligns processes with the standard reference data pattern
-- so Admins can manage them via Reference Data UI
-- =============================================

-- 1. Add missing columns to match ref_* pattern
ALTER TABLE portal_processes ADD COLUMN sort_order INTEGER;
ALTER TABLE portal_processes ADD COLUMN is_active BOOLEAN DEFAULT true NOT NULL;
ALTER TABLE portal_processes ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();

-- 2. Populate sort_order from existing rows
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY name) AS rn
  FROM portal_processes
)
UPDATE portal_processes
SET sort_order = numbered.rn
FROM numbered
WHERE portal_processes.id = numbered.id;

ALTER TABLE portal_processes ALTER COLUMN sort_order SET NOT NULL;

-- 3. Rename column name → value
ALTER TABLE portal_processes RENAME COLUMN name TO value;

-- 4. Drop is_standard (no longer needed — all processes are admin-managed)
ALTER TABLE portal_processes DROP COLUMN is_standard;

-- 5. Add UNIQUE constraint on value (matches ref_* pattern)
ALTER TABLE portal_processes ADD CONSTRAINT ref_processes_value_unique UNIQUE (value);

-- 6. Drop old indexes
DROP INDEX IF EXISTS idx_portal_processes_name;
DROP INDEX IF EXISTS idx_portal_processes_is_standard;

-- 7. Rename table
ALTER TABLE portal_processes RENAME TO ref_processes;

-- 8. Create new index
CREATE INDEX idx_ref_processes_value ON ref_processes(value);

-- Note: FK on portal_production_entries.process_id automatically follows
-- the table rename in PostgreSQL (references are by OID, not name).

COMMENT ON TABLE ref_processes IS 'Production process types (managed via Admin Reference Data)';
