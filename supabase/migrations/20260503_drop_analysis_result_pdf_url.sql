-- ═══════════════════════════════════════════════════════════════════
-- DOCTOPAL — SPRINT 25 COMMIT 4b: blood_tests DEPRECATED COLUMNS DROP
-- Tarih: 3 Mayıs 2026
-- Amaç: Sprint 18'de DEPRECATED edilen analysis_result + pdf_url
-- kolonları DROP. Sprint 18 migration'da analysis_json'a backfill
-- yapılmıştı; Sprint 25 Commit 4a'da tüm read/write referansları
-- kod tabanından temizlendi (build temiz, 0 error).
--
-- KULLANIM: Supabase SQL Editor'a yapıştır ve çalıştır.
-- İdempotent — IF EXISTS guard.
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE public.blood_tests
  DROP COLUMN IF EXISTS analysis_result,
  DROP COLUMN IF EXISTS pdf_url;

NOTIFY pgrst, 'reload schema';


-- ═══════════════════════════════════════════════════════════════════
-- DOĞRULAMA SORGULARI
-- ═══════════════════════════════════════════════════════════════════

-- 1. Kolonlar gerçekten gitti mi?
-- SELECT column_name FROM information_schema.columns
--   WHERE table_name = 'blood_tests'
--     AND column_name IN ('analysis_result', 'pdf_url');
-- (boş satır dönmesi beklenir)

-- 2. Yeni kolonlar (Sprint 18) intact mı?
-- SELECT column_name, data_type FROM information_schema.columns
--   WHERE table_name = 'blood_tests'
--   ORDER BY ordinal_position;
-- (analysis_json + summary + overall_urgency görünmeli)
