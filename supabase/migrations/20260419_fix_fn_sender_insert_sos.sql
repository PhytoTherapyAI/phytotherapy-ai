-- Session 33: Fix SOS broadcast RLS failure on family_notifications
--
-- Bug: SOS / broadcast INSERTs fail with "new row violates row-level security
--      policy for family_notifications" even when the sender is a valid
--      accepted member of the group and targets another accepted member.
--
-- Root cause: the old fn_sender_insert policy used two EXISTS subqueries
-- against family_members INSIDE the RLS check. Those subqueries themselves
-- run under RLS, so the caller can only "see" their own family_members row.
-- The EXISTS check for the RECIPIENT's membership fails because the caller
-- can't see the recipient's row through RLS (cross-user SELECT is narrow).
--
-- Fix: extract the membership check into a SECURITY DEFINER function that
-- bypasses RLS for this specific, safe check (both user IDs must be accepted
-- members of the same group). The policy then calls the helper.
--
-- Idempotent: DROP IF EXISTS then CREATE.

-- ═══════════════════════════════════════════════════
-- 1) Helper function — bypasses RLS only for this check
-- ═══════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.are_family_members(
  p_group_id UUID,
  p_user_a UUID,
  p_user_b UUID
) RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    EXISTS (
      SELECT 1 FROM public.family_members
      WHERE group_id = p_group_id
        AND user_id = p_user_a
        AND invite_status = 'accepted'
    )
    AND
    EXISTS (
      SELECT 1 FROM public.family_members
      WHERE group_id = p_group_id
        AND user_id = p_user_b
        AND invite_status = 'accepted'
    );
$$;

-- Grant execute to authenticated (anon doesn't need SOS) so RLS policies
-- referencing this function can call it.
REVOKE ALL ON FUNCTION public.are_family_members(UUID, UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.are_family_members(UUID, UUID, UUID) TO authenticated;

-- ═══════════════════════════════════════════════════
-- 2) Replace fn_sender_insert with helper-based check
-- ═══════════════════════════════════════════════════

DROP POLICY IF EXISTS "fn_sender_insert" ON public.family_notifications;

CREATE POLICY "fn_sender_insert" ON public.family_notifications
  FOR INSERT
  WITH CHECK (
    auth.uid() = from_user_id
    AND public.are_family_members(group_id, auth.uid(), to_user_id)
  );

-- ═══════════════════════════════════════════════════
-- Refresh PostgREST schema cache
-- ═══════════════════════════════════════════════════
NOTIFY pgrst, 'reload schema';
