-- =============================================
-- HEALTH IMPORTS — Apple Health / Google Fit
-- Run in Supabase Dashboard SQL Editor
-- =============================================
-- Tracks each Apple Health (export.zip → export.xml) or Google Fit
-- (Takeout ZIP) bulk import. health_metrics rows reference this table
-- via import_id so deleting an import cascades the rows it created.

CREATE TABLE IF NOT EXISTS health_imports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('apple_health', 'google_fit')),
  file_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing'
    CHECK (status IN ('processing', 'completed', 'failed')),
  records_imported INTEGER NOT NULL DEFAULT 0,
  date_range_start TIMESTAMPTZ,
  date_range_end TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_health_imports_user ON health_imports(user_id, created_at DESC);

ALTER TABLE health_imports ENABLE ROW LEVEL SECURITY;

-- Drop prior versions to keep this idempotent
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'health_imports'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON health_imports', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "hi_select_own" ON health_imports
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "hi_insert_own" ON health_imports
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "hi_update_own" ON health_imports
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "hi_delete_own" ON health_imports
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ─────────────────────────────────────────────
-- Link health_metrics → health_imports
-- (health_metrics already exists from 20260328_integrated_health_data.sql
--  with: id, user_id, source, source_id, metric_type, value, unit,
--  measured_at, etc. + UNIQUE(user_id, source, metric_type, measured_at)
--  + RLS SELECT/INSERT for own rows.)
-- ─────────────────────────────────────────────

ALTER TABLE health_metrics
  ADD COLUMN IF NOT EXISTS import_id UUID
    REFERENCES health_imports(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_health_metrics_import ON health_metrics(import_id);

-- The original migration only granted SELECT/INSERT. Add UPDATE + DELETE
-- for the row owner so users can clean up their own data.
DROP POLICY IF EXISTS "Users update own metrics" ON health_metrics;
CREATE POLICY "Users update own metrics" ON health_metrics
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own metrics" ON health_metrics;
CREATE POLICY "Users delete own metrics" ON health_metrics
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
