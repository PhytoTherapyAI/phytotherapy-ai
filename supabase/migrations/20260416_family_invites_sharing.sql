-- =============================================
-- FAMILY: invite expiration + per-member sharing preferences
-- Run in Supabase Dashboard SQL Editor
-- =============================================

-- 1. expires_at on family_members (7-day default for new invites)
ALTER TABLE family_members
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days');

-- Backfill: existing pending rows keep 7-day window from their invited_at
UPDATE family_members
  SET expires_at = invited_at + INTERVAL '7 days'
  WHERE expires_at IS NULL AND invite_status = 'pending';

-- 2. Per-member sharing preferences
-- Each member chooses what they share with the rest of the household.
-- Default: only emergency info is shared, all else opt-in.
ALTER TABLE family_members
  ADD COLUMN IF NOT EXISTS shares_health_score BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS shares_medications  BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS shares_allergies    BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS shares_emergency    BOOLEAN DEFAULT TRUE;

-- 3. Existing fm_self_update RLS already lets a user update their OWN row
--    (USING user_id = auth.uid()), so the new sharing columns are write-
--    protected per-user without needing additional policies.

-- 4. Index for pending-invite expiry sweeps (future cleanup job)
CREATE INDEX IF NOT EXISTS idx_family_members_pending_expires
  ON family_members(expires_at)
  WHERE invite_status = 'pending';
