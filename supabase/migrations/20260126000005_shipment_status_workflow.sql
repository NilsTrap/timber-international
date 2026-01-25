-- =============================================
-- Shipment Status Workflow Migration
-- Migration: 20260126000005_shipment_status_workflow.sql
-- Story: 8.1 - Shipment Schema for Inter-Org Flow
-- Description: Adds status workflow columns to shipments table
--              for inter-organization shipment approval flow
-- =============================================

-- =============================================
-- 1. ADD STATUS WORKFLOW COLUMNS TO SHIPMENTS
-- =============================================

-- Add status column with default 'completed' for legacy shipments
-- New inter-org shipments will start as 'draft'
ALTER TABLE shipments
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed';

-- Add submitted_at timestamp (when sender submits for approval)
ALTER TABLE shipments
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ;

-- Add reviewed_at timestamp (when receiver accepts/rejects)
ALTER TABLE shipments
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- Add reviewed_by FK to portal_users (who accepted/rejected)
ALTER TABLE shipments
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES portal_users(id);

-- Add rejection_reason for rejected shipments
ALTER TABLE shipments
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add completed_at timestamp (when inventory transfer occurs)
ALTER TABLE shipments
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- =============================================
-- 2. ADD STATUS CHECK CONSTRAINT
-- =============================================

-- Add constraint to enforce valid status values
ALTER TABLE shipments
  ADD CONSTRAINT shipments_status_check
  CHECK (status IN ('draft', 'pending', 'accepted', 'completed', 'rejected'));

-- =============================================
-- 3. MIGRATE EXISTING DATA
-- =============================================

-- Mark all existing shipments as completed (they were processed before this feature)
UPDATE shipments
SET status = 'completed',
    completed_at = created_at
WHERE status IS NULL OR status = 'completed';

-- =============================================
-- 4. ADD INDEXES FOR COMMON QUERIES
-- =============================================

-- Index for filtering by status (common query pattern)
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);

-- Index for pending shipments per organisation (notification queries)
CREATE INDEX IF NOT EXISTS idx_shipments_pending_to_org
  ON shipments(to_organisation_id, status)
  WHERE status = 'pending';

-- =============================================
-- 5. ADD COMMENTS
-- =============================================

COMMENT ON COLUMN shipments.status IS
  'Shipment workflow status: draft (being prepared), pending (awaiting receiver approval), accepted (approved), completed (inventory transferred), rejected (declined by receiver)';

COMMENT ON COLUMN shipments.submitted_at IS
  'Timestamp when shipment was submitted for receiver approval (draft → pending)';

COMMENT ON COLUMN shipments.reviewed_at IS
  'Timestamp when receiver reviewed the shipment (accepted or rejected)';

COMMENT ON COLUMN shipments.reviewed_by IS
  'User ID of the person who accepted or rejected the shipment';

COMMENT ON COLUMN shipments.rejection_reason IS
  'Reason provided by receiver when rejecting a shipment';

COMMENT ON COLUMN shipments.completed_at IS
  'Timestamp when inventory was transferred (on acceptance)';
