-- Migration: allow owners/admins to update any member row in their group
-- Date: 2026-04-18
-- Problem: fm_self_update policy only lets a member UPDATE their own row
-- (user_id = auth.uid()). When the family owner/admin tries to set a
-- relationship tag on another member, the UPDATE silently affects 0 rows
-- (RLS blocks it without an error). UI change doesn't persist.
--
-- Fix: add an UPDATE policy for owners/admins using a SECURITY DEFINER
-- helper so the policy itself doesn't recurse into family_members.
-- WITH CHECK mirrors USING to prevent rewrites that would violate the
-- same predicate.

-- Helper: returns true if auth.uid() is owner or admin of `gid`.
CREATE OR REPLACE FUNCTION public.is_family_admin(gid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.family_members
    WHERE group_id = gid
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
      AND invite_status = 'accepted'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_family_admin(UUID) TO authenticated;

-- Drop any stale policy with the same name to keep this idempotent.
DROP POLICY IF EXISTS "fm_admin_update" ON public.family_members;

CREATE POLICY "fm_admin_update"
  ON public.family_members
  FOR UPDATE
  TO authenticated
  USING (public.is_family_admin(group_id))
  WITH CHECK (public.is_family_admin(group_id));

-- Reload PostgREST schema cache so the new policy applies immediately.
NOTIFY pgrst, 'reload schema';
