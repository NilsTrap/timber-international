-- =============================================
-- Extend portal_users for User Management
-- Migration: 20260126000004_extend_portal_users.sql
-- Story: 7.2 - User Management within Organization
-- =============================================

-- =============================================
-- 1. ADD NEW COLUMNS TO portal_users
-- =============================================

-- Add is_active flag for enabling/disabling user access
ALTER TABLE portal_users
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Add status column for tracking user lifecycle
ALTER TABLE portal_users
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'invited'
    CHECK (status IN ('invited', 'active'));

-- Add invited_at timestamp
ALTER TABLE portal_users
  ADD COLUMN IF NOT EXISTS invited_at TIMESTAMPTZ;

-- Add invited_by reference (who created this user)
ALTER TABLE portal_users
  ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES portal_users(id);

-- Add last_login_at timestamp (updated on login)
ALTER TABLE portal_users
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- =============================================
-- 2. CREATE INDEXES
-- =============================================

-- Index for filtering users by organisation
CREATE INDEX IF NOT EXISTS idx_portal_users_organisation
  ON portal_users(organisation_id);

-- Index for filtering by status
CREATE INDEX IF NOT EXISTS idx_portal_users_status
  ON portal_users(status);

-- Index for filtering by is_active
CREATE INDEX IF NOT EXISTS idx_portal_users_is_active
  ON portal_users(is_active);

-- =============================================
-- 3. UPDATE EXISTING USERS
-- =============================================

-- Set existing users with auth_user_id to 'active' status
UPDATE portal_users
SET status = 'active'
WHERE auth_user_id IS NOT NULL
  AND status = 'invited';

-- =============================================
-- 4. ADD COMMENTS
-- =============================================

COMMENT ON COLUMN portal_users.is_active IS
  'When false, user cannot log in (deactivated by admin)';

COMMENT ON COLUMN portal_users.status IS
  'User lifecycle: invited (pending credentials) or active (can log in)';

COMMENT ON COLUMN portal_users.invited_at IS
  'Timestamp when user was invited/created by admin';

COMMENT ON COLUMN portal_users.invited_by IS
  'Reference to the admin user who created this user';

COMMENT ON COLUMN portal_users.last_login_at IS
  'Timestamp of last successful login (updated by auth hook)';
