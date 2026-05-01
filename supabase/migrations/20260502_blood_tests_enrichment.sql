-- ═══════════════════════════════════════════════════════════════════
-- DOCTOPAL — SPRINT 18: blood_tests RADIOLOGY_REPORTS PATERNİNE YÜKSELTME
-- Tarih: 2 Mayıs 2026
-- Amaç: blood_tests'e analysis_json JSONB + summary TEXT + overall_urgency
-- TEXT eklenir (radiology_reports paterni mirror). Eski analysis_result +
-- pdf_url kolonları KORUNUR (deprecate, Sprint 19+'da DROP).
--
-- KULLANIM: Supabase SQL Editor'a yapıştır ve çalıştır.
-- İdempotent — birden fazla kez çalıştırılabilir (IF NOT EXISTS + WHERE
-- IS NULL guard'lar ile).
-- NOT: Bu migration Supabase'de manuel apply edildi; repo'ya sadece
-- reproducibility için kayıt amaçlı eklendi.
-- ═══════════════════════════════════════════════════════════════════


-- 1. Yeni kolonları ekle
ALTER TABLE public.blood_tests
  ADD COLUMN IF NOT EXISTS analysis_json JSONB,
  ADD COLUMN IF NOT EXISTS summary TEXT,
  ADD COLUMN IF NOT EXISTS overall_urgency TEXT;

-- 2. Mevcut analysis_result rows'undan analysis_json'a backfill
--    (analysis_result Supabase tarafından JSON object olarak yazılmış olabilir,
--     string olabilir, NULL olabilir — try/cast pattern)
UPDATE public.blood_tests
SET analysis_json = CASE
    WHEN analysis_result IS NULL OR analysis_result = '' THEN NULL
    WHEN analysis_result::text LIKE '{%' THEN analysis_result::jsonb
    ELSE NULL  -- malformed, skip backfill
  END
WHERE analysis_json IS NULL AND analysis_result IS NOT NULL;

-- 3. summary + overall_urgency backfill (analysis_json'dan extract)
UPDATE public.blood_tests
SET
  summary = analysis_json->>'summary',
  overall_urgency = analysis_json->>'overallUrgency'
WHERE analysis_json IS NOT NULL
  AND (summary IS NULL OR overall_urgency IS NULL);

-- 4. Composite index (history/trend query optimize, radyolojideki paterni mirror)
CREATE INDEX IF NOT EXISTS idx_blood_tests_user_created
  ON public.blood_tests(user_id, created_at DESC);

-- 5. analysis_result + pdf_url DEPRECATE (NOT drop) — backward compat için tutuluyor.
--    Sprint 19+'da DROP COLUMN ile temizle:
--      ALTER TABLE public.blood_tests DROP COLUMN analysis_result;
--      ALTER TABLE public.blood_tests DROP COLUMN pdf_url;
COMMENT ON COLUMN public.blood_tests.analysis_result IS
  'DEPRECATED Sprint 18 — use analysis_json instead. Backfilled to analysis_json. Remove in Sprint 19+.';
COMMENT ON COLUMN public.blood_tests.pdf_url IS
  'DEPRECATED Sprint 18 — never populated, planned removal Sprint 19+.';

-- 6. PostgREST schema reload
NOTIFY pgrst, 'reload schema';


-- ═══════════════════════════════════════════════════════════════════
-- DOĞRULAMA SORGULARI
-- ═══════════════════════════════════════════════════════════════════

-- 1. Yeni kolonlar görünür mü?
-- SELECT column_name, data_type FROM information_schema.columns
--   WHERE table_name = 'blood_tests' ORDER BY ordinal_position;

-- 2. Backfill başarılı mı?
-- SELECT COUNT(*) AS total,
--        COUNT(analysis_json) AS with_json,
--        COUNT(summary) AS with_summary,
--        COUNT(overall_urgency) AS with_urgency
-- FROM public.blood_tests;

-- 3. Composite index var mı?
-- SELECT indexname FROM pg_indexes
--   WHERE tablename = 'blood_tests';
