-- F-CHAT-SIDEBAR-001: query_history DELETE RLS policy
--
-- Issue: query_history had SELECT/INSERT/UPDATE policies; DELETE was
-- missing → users couldn't remove their own conversations from the
-- Health Assistant sidebar. Conversation sidebar redesign needs the
-- Trash2 → DELETE flow, so we add the policy.
--
-- Status: APPLIED (user ran in Supabase Studio on 2026-04-24).
-- This file lives in /supabase/migrations/ purely for repo tracking.
--
-- Service role still bypasses RLS by design (used for admin / cleanup
-- jobs in /api/user-data DELETE etc.).

-- 1) Drop any prior incarnation — idempotent re-run safe.
DROP POLICY IF EXISTS "Users can delete own queries" ON public.query_history;
DROP POLICY IF EXISTS "own_delete" ON public.query_history;

-- 2) Owners-only DELETE.
CREATE POLICY "Users can delete own queries"
  ON public.query_history
  FOR DELETE
  USING (auth.uid() = user_id);

-- 3) Force PostgREST to pick up the new policy without a process reboot.
NOTIFY pgrst, 'reload schema';
