-- F-CHAT-SIDEBAR-002: query_history pin + rename columns
--
-- Issue: ConversationHistory sidebar redesign needs:
--   1. Pin to top toggle (is_pinned)
--   2. Most-recently-pinned at top within pinned group (pinned_at, LIFO)
--   3. Inline rename (custom_title — null fallback to query_text)
--
-- RLS: existing UPDATE policy (auth.uid() = user_id) is sufficient.
--      Field-level gating happens at the API layer (PATCH endpoint
--      whitelists is_pinned + custom_title + pinned_at; other fields
--      ignored). Defense-in-depth: .eq("user_id", auth.user.id) in query.
--
-- Pin limit: 5 per user, enforced at API layer (PATCH counts user's
--      existing pinned rows before allowing is_pinned=true). Unpin is
--      always allowed.
--
-- Status: APPLIED (user ran in Supabase Studio on 2026-04-26).
-- This file lives in /supabase/migrations/ purely for repo tracking.

ALTER TABLE public.query_history
  ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false NOT NULL;

ALTER TABLE public.query_history
  ADD COLUMN IF NOT EXISTS custom_title TEXT NULL;

ALTER TABLE public.query_history
  ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMPTZ NULL;

NOTIFY pgrst, 'reload schema';
