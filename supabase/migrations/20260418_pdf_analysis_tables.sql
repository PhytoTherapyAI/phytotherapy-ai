-- Session 33: PDF analysis DB tables
-- Structured storage for radiology analysis results and prospectus scans.
-- Before this, both fell back to generic query_history (non-structured, no trend support).

-- ═══════════════════════════════════════════════════
-- 1) radiology_reports
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.radiology_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT,
  image_type TEXT,
  overall_urgency TEXT,
  analysis_json JSONB,
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.radiology_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own_select" ON public.radiology_reports;
DROP POLICY IF EXISTS "own_insert" ON public.radiology_reports;
DROP POLICY IF EXISTS "own_update" ON public.radiology_reports;
DROP POLICY IF EXISTS "own_delete" ON public.radiology_reports;

CREATE POLICY "own_select" ON public.radiology_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own_insert" ON public.radiology_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_update" ON public.radiology_reports FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_delete" ON public.radiology_reports FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_radiology_reports_user_id ON public.radiology_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_radiology_reports_created_at ON public.radiology_reports(user_id, created_at DESC);

-- ═══════════════════════════════════════════════════
-- 2) prospectus_scans
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.prospectus_scans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  medication_name TEXT,
  file_name TEXT,
  scan_data JSONB,
  profile_alerts JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.prospectus_scans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own_select" ON public.prospectus_scans;
DROP POLICY IF EXISTS "own_insert" ON public.prospectus_scans;
DROP POLICY IF EXISTS "own_update" ON public.prospectus_scans;
DROP POLICY IF EXISTS "own_delete" ON public.prospectus_scans;

CREATE POLICY "own_select" ON public.prospectus_scans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own_insert" ON public.prospectus_scans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_update" ON public.prospectus_scans FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_delete" ON public.prospectus_scans FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_prospectus_scans_user_id ON public.prospectus_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_prospectus_scans_created_at ON public.prospectus_scans(user_id, created_at DESC);

-- ═══════════════════════════════════════════════════
-- Refresh PostgREST schema cache so the new tables are visible immediately
-- ═══════════════════════════════════════════════════
NOTIFY pgrst, 'reload schema';
