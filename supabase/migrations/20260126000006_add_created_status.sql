-- =============================================
-- Add 'created' status to portal_users
-- Migration: 20260126000006_add_created_status.sql
-- Fix: Story 7.2 - User status lifecycle needs 'created' state
-- =============================================

-- The 'created' status is needed for users who have been added
-- but haven't received login credentials yet.
-- Lifecycle: created -> invited -> active

-- Drop the existing check constraint
ALTER TABLE portal_users
  DROP CONSTRAINT IF EXISTS portal_users_status_check;

-- Add updated check constraint with 'created' status
ALTER TABLE portal_users
  ADD CONSTRAINT portal_users_status_check
  CHECK (status IN ('created', 'invited', 'active'));

-- Update the column comment to reflect the new lifecycle
COMMENT ON COLUMN portal_users.status IS
  'User lifecycle: created (no credentials), invited (credentials sent), active (has logged in)';
