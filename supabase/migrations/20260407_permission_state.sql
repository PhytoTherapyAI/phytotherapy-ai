-- Add permission_state JSONB column to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS permission_state JSONB DEFAULT '{"notification":"not_asked","location":"not_asked","camera":"not_asked","preframe_shown":false}'::jsonb;
