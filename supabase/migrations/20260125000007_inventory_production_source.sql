-- =============================================
-- Story 4.5: Allow inventory_packages to be sourced from production
-- Makes shipment_id nullable, adds production_entry_id reference,
-- and ensures every package has at least one source.
-- =============================================

-- 1. Make shipment_id nullable (production outputs have no shipment)
ALTER TABLE inventory_packages ALTER COLUMN shipment_id DROP NOT NULL;

-- 2. Add production source reference
ALTER TABLE inventory_packages
  ADD COLUMN production_entry_id UUID REFERENCES portal_production_entries(id);

-- 3. Every package must have either a shipment or production source
ALTER TABLE inventory_packages
  ADD CONSTRAINT chk_package_source
  CHECK (shipment_id IS NOT NULL OR production_entry_id IS NOT NULL);

-- 4. Handle unique constraints for package_sequence
-- Drop existing unique constraint that includes nullable shipment_id
ALTER TABLE inventory_packages DROP CONSTRAINT IF EXISTS inventory_packages_shipment_id_package_sequence_key;

-- Re-add as partial unique indexes (only enforce uniqueness within non-null source)
CREATE UNIQUE INDEX idx_inventory_packages_shipment_seq
  ON inventory_packages(shipment_id, package_sequence) WHERE shipment_id IS NOT NULL;

CREATE UNIQUE INDEX idx_inventory_packages_production_seq
  ON inventory_packages(production_entry_id, package_sequence) WHERE production_entry_id IS NOT NULL;

-- 5. Index for production_entry_id lookups
CREATE INDEX idx_inventory_packages_production ON inventory_packages(production_entry_id);

-- 6. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
