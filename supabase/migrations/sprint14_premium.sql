-- Sprint 14: Premium / Freemium Infrastructure
-- Add premium fields to user_profiles

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'premium', 'family', 'doctor')),
  ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_doctor_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS doctor_license_url TEXT;

-- Query history: add is_favorite column if not exists
ALTER TABLE query_history
  ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE;

-- Sprint 15: Badges table
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own badges" ON user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own badges" ON user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Sprint 17: Doctor-patient relationship
CREATE TABLE IF NOT EXISTS doctor_patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invite_code TEXT UNIQUE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'revoked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(doctor_id, patient_id)
);

ALTER TABLE doctor_patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Doctors can view own patients" ON doctor_patients FOR SELECT USING (auth.uid() = doctor_id OR auth.uid() = patient_id);
CREATE POLICY "Doctors can insert patients" ON doctor_patients FOR INSERT WITH CHECK (auth.uid() = doctor_id);
CREATE POLICY "Doctors can update patients" ON doctor_patients FOR UPDATE USING (auth.uid() = doctor_id);

-- Sprint 19: Side effect reports
CREATE TABLE IF NOT EXISTS side_effect_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  supplement_name TEXT NOT NULL,
  medication_name TEXT,
  effect_description TEXT NOT NULL,
  severity TEXT DEFAULT 'mild' CHECK (severity IN ('mild', 'moderate', 'severe')),
  reported_at TIMESTAMPTZ DEFAULT NOW(),
  is_anonymous BOOLEAN DEFAULT TRUE
);

ALTER TABLE side_effect_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own reports" ON side_effect_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert reports" ON side_effect_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Anonymous aggregated view (no RLS needed, handled in API)

-- Sprint 19: Analytics events
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert own events" ON analytics_events FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
