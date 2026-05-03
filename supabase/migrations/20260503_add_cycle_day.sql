-- ═══════════════════════════════════════════════════════════════════
-- DOCTOPAL — SPRINT 27 COMMIT 3: cycle_day column on user_profiles
-- Tarih: 3 Mayıs 2026
-- Amaç: Sprint 26'da phase-aware analyzeValue eklendi (LH/FSH/Estradiol).
-- Postmenopozal flag schema-light pattern'le bağlandı, ama premenopausal
-- kadınlarda midcycle/luteal phase için explicit input gerekiyor.
-- cycle_day NULL ise → "follicular" default (Sprint 26 davranışı aynen).
-- 1-10 → follicular, 11-17 → midcycle, 18-28 → luteal (endpoint logic).
--
-- KULLANIM: Supabase SQL Editor'a yapıştır ve çalıştır.
-- İdempotent — IF NOT EXISTS guard.
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS cycle_day INTEGER
    CHECK (cycle_day IS NULL OR (cycle_day >= 1 AND cycle_day <= 28));

NOTIFY pgrst, 'reload schema';


-- ═══════════════════════════════════════════════════════════════════
-- DOĞRULAMA SORGULARI
-- ═══════════════════════════════════════════════════════════════════

-- 1. Kolon eklendi mi?
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns
--   WHERE table_name = 'user_profiles' AND column_name = 'cycle_day';

-- 2. CHECK constraint aktif mi?
-- SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint
--   WHERE conrelid = 'public.user_profiles'::regclass
--     AND conname LIKE '%cycle_day%';
