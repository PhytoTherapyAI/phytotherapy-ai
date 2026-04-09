-- Fix CHECK constraints for onboarding data
-- Supabase Dashboard SQL Editor'da calistir

-- 1. user_allergies severity — yeni degerler ekle
ALTER TABLE user_allergies DROP CONSTRAINT IF EXISTS user_allergies_severity_check;
ALTER TABLE user_allergies ADD CONSTRAINT user_allergies_severity_check
  CHECK (severity IN ('mild', 'moderate', 'severe', 'unknown', 'anaphylaxis', 'urticaria', 'mild_skin', 'gi_intolerance'));

-- 2. user_profiles alcohol_use — bos string ve null izin ver
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_alcohol_use_check;
-- Eger constraint varsa ve "none" zorunlu tutuyorsa, kaldiriyoruz.
-- alcohol_use serbest text olarak kalsin (compound format: "active|daily" vb.)

-- 3. user_profiles smoking_use — ayni sekilde
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_smoking_use_check;

-- 4. allergies JSONB kolonu (zaten eklediysen sorun yok)
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS allergies JSONB DEFAULT '[]'::jsonb;
