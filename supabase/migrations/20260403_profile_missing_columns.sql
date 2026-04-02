-- Add missing columns to user_profiles for lifestyle, body, and contact data
-- These columns are used by the profile page but were never added to the table

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS diet_type TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS exercise_frequency TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS sleep_quality TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS blood_group TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS height_cm INTEGER;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS weight_kg DECIMAL;

-- Contact fields (may already exist from 20260329 migration, IF NOT EXISTS handles it)
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS recovery_email TEXT;
