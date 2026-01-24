-- =============================================
-- Fix: Add created_by to production entries + updated_at trigger for ref_processes
-- =============================================

-- 1. Add created_by column to scope entries to their creator
ALTER TABLE portal_production_entries
  ADD COLUMN created_by UUID REFERENCES auth.users(id);

-- 2. Add updated_at trigger for ref_processes (missing from rename migration)
CREATE TRIGGER ref_processes_updated_at
  BEFORE UPDATE ON ref_processes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
