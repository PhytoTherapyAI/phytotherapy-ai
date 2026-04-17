-- Migration: Add invite_code column to family_members for 6-digit code invites
-- Date: 2026-04-17
-- Session 32 — FAZ 2 davet sistemi

-- 1. Add invite_code column (nullable, UNIQUE)
ALTER TABLE public.family_members
  ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE;

-- 2. Index for fast code lookup (only pending invites)
CREATE INDEX IF NOT EXISTS idx_family_members_invite_code
  ON public.family_members(invite_code)
  WHERE invite_code IS NOT NULL AND invite_status = 'pending';

-- 3. Reload PostgREST schema cache so new column is immediately queryable
NOTIFY pgrst, 'reload schema';
