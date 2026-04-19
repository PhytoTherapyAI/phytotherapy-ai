-- Family Premium plan (tier 3: 6-user household package)
-- Adds plan_type / plan_started_at / plan_expires_at / max_members to family_groups
-- so an owner can upgrade a group to "family_premium" and all accepted members
-- inherit Premium automatically (admin role is still manually assigned by owner).
--
-- Free groups: default plan_type='free', max_members=2 (owner + 1 invitee)
-- Family Premium: plan_type='family_premium', max_members=6
--
-- Idempotent: uses IF NOT EXISTS / safe defaults. Re-runnable.

ALTER TABLE public.family_groups
  ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'free'
    CHECK (plan_type IN ('free', 'family_premium')),
  ADD COLUMN IF NOT EXISTS plan_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS max_members INTEGER DEFAULT 6;

-- Backfill: existing groups keep default (6). Owners can adjust via upgrade flow.
-- Explicit update skipped — DEFAULT 6 covers both new and existing NULL rows after ADD.

-- Reload PostgREST schema cache so the new columns are visible immediately.
NOTIFY pgrst, 'reload schema';
