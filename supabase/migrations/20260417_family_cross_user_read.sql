-- Migration: FAZ 3 — Cross-user read access for family members
-- Date: 2026-04-17
-- Problem: user_profiles / user_medications / user_allergies RLS only allow
-- user_id = auth.uid(), so clicking a family member card loads an empty
-- /profile page (queries run but return 0 rows).
-- Fix: add SELECT-only policies so any accepted member in the same
-- family_group can read each other's health data. Writes remain owner-only.

-- ─────────────────────────────────────────────────────
-- Helper: user_ids of everyone accepted-in-my-groups.
-- SECURITY DEFINER avoids RLS recursion when the policy
-- itself queries family_members.
-- Reuses get_member_group_ids() from
-- 20260417_family_member_visibility.sql (must be applied first).
-- ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_family_member_user_ids()
RETURNS SETOF UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT user_id
  FROM public.family_members
  WHERE group_id IN (SELECT public.get_member_group_ids())
    AND invite_status = 'accepted'
    AND user_id IS NOT NULL;
$$;

GRANT EXECUTE ON FUNCTION public.get_family_member_user_ids() TO authenticated;

-- ─────────────────────────────────────────────────────
-- user_profiles: family members can SELECT each other
-- (existing "Users can view own profile" policy stays —
-- RLS policies are OR-combined)
-- ─────────────────────────────────────────────────────
DROP POLICY IF EXISTS "up_family_member_view" ON public.user_profiles;

CREATE POLICY "up_family_member_view"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (id IN (SELECT public.get_family_member_user_ids()));

-- ─────────────────────────────────────────────────────
-- user_medications: family members can SELECT
-- ─────────────────────────────────────────────────────
DROP POLICY IF EXISTS "um_family_member_view" ON public.user_medications;

CREATE POLICY "um_family_member_view"
  ON public.user_medications
  FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT public.get_family_member_user_ids()));

-- ─────────────────────────────────────────────────────
-- user_allergies: family members can SELECT
-- ─────────────────────────────────────────────────────
DROP POLICY IF EXISTS "ua_family_member_view" ON public.user_allergies;

CREATE POLICY "ua_family_member_view"
  ON public.user_allergies
  FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT public.get_family_member_user_ids()));

-- Reload PostgREST schema cache so new policies apply immediately.
NOTIFY pgrst, 'reload schema';
