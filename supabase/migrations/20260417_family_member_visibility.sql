-- Migration: let non-admin members see other accepted members in their group
-- Date: 2026-04-17
-- Problem: fm_self_select only returns the member's own row, so a regular
-- member (role='member') joining via code sees an empty /select-profile.
-- Fix: add a policy that lets any accepted member SELECT other accepted
-- members in the same group.

-- Helper: returns the list of group_ids the current user is an accepted member of.
-- SECURITY DEFINER so the policy itself can query family_members without
-- triggering a recursive RLS check.
CREATE OR REPLACE FUNCTION public.get_member_group_ids()
RETURNS SETOF UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT group_id
  FROM public.family_members
  WHERE user_id = auth.uid()
    AND invite_status = 'accepted';
$$;

GRANT EXECUTE ON FUNCTION public.get_member_group_ids() TO authenticated;

-- New policy: accepted members can SELECT other accepted members in their group.
DROP POLICY IF EXISTS "fm_group_member_select" ON public.family_members;

CREATE POLICY "fm_group_member_select"
  ON public.family_members
  FOR SELECT
  TO authenticated
  USING (
    invite_status = 'accepted'
    AND group_id IN (SELECT public.get_member_group_ids())
  );

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
