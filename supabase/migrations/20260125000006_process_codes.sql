-- Add code column to ref_processes for output package number generation
-- Example: "PL" for Planing → output packages become PL-001, PL-002, etc.

ALTER TABLE ref_processes ADD COLUMN code TEXT;

-- Set default codes for existing standard processes
UPDATE ref_processes SET code = 'MS' WHERE value = 'Multi-saw';
UPDATE ref_processes SET code = 'PL' WHERE value = 'Planing';
UPDATE ref_processes SET code = 'OC' WHERE value = 'Opti-cut';
UPDATE ref_processes SET code = 'GL' WHERE value = 'Gluing';
UPDATE ref_processes SET code = 'SD' WHERE value = 'Sanding';
UPDATE ref_processes SET code = 'FJ' WHERE value = 'Finger Jointing';

-- Fallback: generate code from first 2 uppercase chars for any process without a code
UPDATE ref_processes SET code = UPPER(LEFT(REPLACE(value, ' ', ''), 2))
WHERE code IS NULL;

-- Make code NOT NULL and UNIQUE after populating all rows
ALTER TABLE ref_processes ALTER COLUMN code SET NOT NULL;
ALTER TABLE ref_processes ADD CONSTRAINT ref_processes_code_unique UNIQUE (code);

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
