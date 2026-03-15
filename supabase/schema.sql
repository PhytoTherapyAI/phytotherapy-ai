-- ============================================
-- Phytotherapy.ai — Supabase Schema v1.0
-- Sprint 2: Auth + Onboarding
-- ============================================

-- Enable UUID extension (usually enabled by default in Supabase)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. User Profiles
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  age INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  is_pregnant BOOLEAN DEFAULT FALSE,
  is_breastfeeding BOOLEAN DEFAULT FALSE,
  alcohol_use TEXT DEFAULT 'none' CHECK (alcohol_use IN ('none', 'occasional', 'regular', 'heavy')),
  smoking_use TEXT DEFAULT 'none' CHECK (smoking_use IN ('none', 'former', 'current')),
  kidney_disease BOOLEAN DEFAULT FALSE,
  liver_disease BOOLEAN DEFAULT FALSE,
  recent_surgery BOOLEAN DEFAULT FALSE,
  chronic_conditions TEXT[] DEFAULT '{}',
  -- Layer 2 (optional)
  height_cm INTEGER,
  weight_kg DECIMAL,
  blood_group TEXT,
  diet_type TEXT,
  exercise_frequency TEXT,
  sleep_quality TEXT,
  supplements TEXT[] DEFAULT '{}',
  -- System
  onboarding_complete BOOLEAN DEFAULT FALSE,
  onboarding_layer2_complete BOOLEAN DEFAULT FALSE,
  consent_timestamp TIMESTAMPTZ,
  last_medication_update TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. User Medications
-- ============================================
CREATE TABLE IF NOT EXISTS user_medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  brand_name TEXT,
  generic_name TEXT,
  dosage TEXT,
  frequency TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  added_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_medications_user_id ON user_medications(user_id);

-- ============================================
-- 3. User Allergies
-- ============================================
CREATE TABLE IF NOT EXISTS user_allergies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  allergen TEXT NOT NULL,
  severity TEXT DEFAULT 'mild' CHECK (severity IN ('mild', 'moderate', 'severe', 'anaphylaxis')),
  added_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_allergies_user_id ON user_allergies(user_id);

-- ============================================
-- 4. Query History
-- ============================================
CREATE TABLE IF NOT EXISTS query_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  query_text TEXT NOT NULL,
  response_text TEXT,
  query_type TEXT CHECK (query_type IN ('interaction', 'general', 'blood_test')),
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_query_history_user_id ON query_history(user_id);

-- ============================================
-- 5. Blood Tests
-- ============================================
CREATE TABLE IF NOT EXISTS blood_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  test_data JSONB NOT NULL,
  analysis_result TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_blood_tests_user_id ON blood_tests(user_id);

-- ============================================
-- 6. Consent Records
-- ============================================
CREATE TABLE IF NOT EXISTS consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL CHECK (consent_type IN ('terms_of_service', 'privacy_policy', 'medical_disclaimer')),
  ip_address TEXT,
  user_agent TEXT,
  consent_text TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_consent_records_user_id ON consent_records(user_id);

-- ============================================
-- 7. Guest Query Tracking (localStorage fallback, but also server-side)
-- ============================================
CREATE TABLE IF NOT EXISTS guest_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  query_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_guest_queries_session_id ON guest_queries(session_id);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_allergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE query_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;

-- user_profiles: users can only read/write their own data
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON user_profiles FOR DELETE
  USING (auth.uid() = id);

-- user_medications
CREATE POLICY "Users can view own medications"
  ON user_medications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medications"
  ON user_medications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own medications"
  ON user_medications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own medications"
  ON user_medications FOR DELETE
  USING (auth.uid() = user_id);

-- user_allergies
CREATE POLICY "Users can view own allergies"
  ON user_allergies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own allergies"
  ON user_allergies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own allergies"
  ON user_allergies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own allergies"
  ON user_allergies FOR DELETE
  USING (auth.uid() = user_id);

-- query_history
CREATE POLICY "Users can view own queries"
  ON query_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own queries"
  ON query_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own queries"
  ON query_history FOR UPDATE
  USING (auth.uid() = user_id);

-- blood_tests
CREATE POLICY "Users can view own blood tests"
  ON blood_tests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own blood tests"
  ON blood_tests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- consent_records
CREATE POLICY "Users can view own consent records"
  ON consent_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consent records"
  ON consent_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Auto-update updated_at trigger
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
