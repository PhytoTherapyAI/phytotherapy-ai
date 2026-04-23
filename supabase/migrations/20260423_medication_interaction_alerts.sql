-- F-SAFETY-002.2: persistent safety banner storage
--
-- Problem: the interaction-check banner was session-scoped, so F5 wiped
-- the clinical warning the user hadn't acted on yet. Each alert now
-- survives until the user either (a) explicitly dismisses it for this
-- session, (b) explicitly resolves it ("Doktor onayladı"), or (c) the
-- triggering medication is deleted (auto-resolve).
--
-- Row lifecycle:
--   INSERT when checkInteractionsAfterChange returns dangerous or
--     caution edges for an authenticated user
--   UPDATE dismissed_at = now()  → hide for session (null == visible)
--   UPDATE resolved_at = now()   → permanent hide (null == unresolved)
--
-- RLS: own-user only across select / insert / update. Delete is NOT
-- exposed — rows stay for audit; clients soft-close via resolved_at.

CREATE TABLE IF NOT EXISTS public.medication_interaction_alerts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Whole edges[] + summary snapshot from the interaction-map response
  -- so the banner can re-render post-F5 without a fresh Claude call.
  edges            JSONB NOT NULL,
  summary          TEXT,

  -- "dangerous" | "caution" — determined from the highest edge severity
  -- by the inserter. safe alerts are not persisted (no banner UI).
  severity         TEXT NOT NULL CHECK (severity IN ('dangerous', 'caution')),

  -- Which add action triggered this alert — useful for audit + future
  -- "alert caused by adding X" copy. NULL when unknown (legacy).
  trigger_medication TEXT,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Session dismiss: hide for now but keep row so "yeni ilaç
  -- eklendiğinde geri getir" logic still has history. NULL == visible.
  dismissed_at     TIMESTAMPTZ,

  -- Permanent resolve (doctor acknowledged / no longer relevant).
  -- NULL == unresolved. Used by the profile fetch filter and by the
  -- auto-resolve-on-medication-delete flow.
  resolved_at      TIMESTAMPTZ,
  resolution_note  TEXT
);

-- Partial index — the hot path is "active alerts for user X", scanned
-- on every profile page load. Skip resolved rows at the index level.
CREATE INDEX IF NOT EXISTS idx_mia_user_active
  ON public.medication_interaction_alerts(user_id, created_at DESC)
  WHERE resolved_at IS NULL;

ALTER TABLE public.medication_interaction_alerts ENABLE ROW LEVEL SECURITY;

-- RLS: own rows only. Follows the project convention from CLAUDE.md.
DROP POLICY IF EXISTS "own_select" ON public.medication_interaction_alerts;
CREATE POLICY "own_select" ON public.medication_interaction_alerts
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "own_insert" ON public.medication_interaction_alerts;
CREATE POLICY "own_insert" ON public.medication_interaction_alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "own_update" ON public.medication_interaction_alerts;
CREATE POLICY "own_update" ON public.medication_interaction_alerts
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- No DELETE policy — rows stay for audit. Soft-close via resolved_at.

NOTIFY pgrst, 'reload schema';
