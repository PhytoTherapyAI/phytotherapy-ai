-- ============================================
-- Vaccine Profile — 7 Nisan 2026
-- ============================================
-- Stores user's vaccination history as JSONB array in user_profiles
-- Each entry: { id, name, last_date?, status: 'done'|'not_done'|'unknown', reminder? }

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS vaccines JSONB DEFAULT '[]'::jsonb;
