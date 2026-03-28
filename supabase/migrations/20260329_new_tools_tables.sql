-- =============================================
-- NEW TOOLS TABLES — 29 March 2026
-- =============================================

-- TOOL 1: Sleep Records
CREATE TABLE IF NOT EXISTS sleep_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  bedtime TIME,
  wake_time TIME,
  sleep_duration DECIMAL,
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 5),
  wake_count INTEGER DEFAULT 0,
  dreams BOOLEAN DEFAULT FALSE,
  factors TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);
CREATE INDEX IF NOT EXISTS idx_sleep_user_date ON sleep_records(user_id, date DESC);

-- TOOL 3: Mood Records (Mental Wellness)
CREATE TABLE IF NOT EXISTS mood_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  mood INTEGER CHECK (mood BETWEEN 1 AND 5),
  energy INTEGER CHECK (energy BETWEEN 1 AND 5),
  stress INTEGER CHECK (stress BETWEEN 1 AND 5),
  anxiety INTEGER CHECK (anxiety BETWEEN 1 AND 5),
  focus INTEGER CHECK (focus BETWEEN 1 AND 5),
  triggers TEXT[],
  coping_methods TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);
CREATE INDEX IF NOT EXISTS idx_mood_user_date ON mood_records(user_id, date DESC);

-- TOOL 5: Nutrition Records
CREATE TABLE IF NOT EXISTS nutrition_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  description TEXT,
  calories INTEGER,
  protein DECIMAL,
  carbs DECIMAL,
  fat DECIMAL,
  fiber DECIMAL,
  key_nutrients JSONB,
  food_drug_alerts TEXT[],
  image_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_nutrition_user_date ON nutrition_records(user_id, date DESC);

-- TOOL 9: Cycle Records (Women's Health)
CREATE TABLE IF NOT EXISTS cycle_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE,
  flow_intensity TEXT CHECK (flow_intensity IN ('light', 'moderate', 'heavy', 'spotting')),
  symptoms TEXT[],
  mood TEXT CHECK (mood IN ('great', 'good', 'neutral', 'low', 'very_low')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cycle_user ON cycle_records(user_id, period_start DESC);

-- TOOL 9: Contraceptive Records
CREATE TABLE IF NOT EXISTS contraceptive_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contraceptive_type TEXT NOT NULL,
  brand_name TEXT,
  active_ingredient TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  daily_reminder BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_contra_user ON contraceptive_records(user_id, is_active);

-- TOOL 5: Vaccination Records
CREATE TABLE IF NOT EXISTS vaccination_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  family_member_id UUID,
  vaccine_name TEXT NOT NULL,
  vaccine_type TEXT,
  dose_number INTEGER DEFAULT 1,
  date_administered DATE,
  next_due_date DATE,
  provider TEXT,
  batch_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_vacc_user ON vaccination_records(user_id, next_due_date);

-- TOOL 11: Allergy & Intolerance Records
CREATE TABLE IF NOT EXISTS allergy_intolerance_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('allergy', 'intolerance', 'sensitivity')),
  trigger_name TEXT NOT NULL,
  category TEXT,
  severity TEXT CHECK (severity IN ('mild', 'moderate', 'severe', 'anaphylaxis')),
  symptoms TEXT[],
  diagnosed_by_doctor BOOLEAN DEFAULT FALSE,
  diagnosis_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS allergy_reaction_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  allergy_id UUID REFERENCES allergy_intolerance_records(id),
  reaction_date TIMESTAMPTZ DEFAULT NOW(),
  severity TEXT,
  symptoms TEXT[],
  trigger_food TEXT,
  treatment_used TEXT,
  notes TEXT
);

-- TOOL 12: Rehabilitation Programs
CREATE TABLE IF NOT EXISTS rehab_programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  surgery_type TEXT,
  surgery_date DATE,
  condition TEXT,
  phase TEXT CHECK (phase IN ('acute', 'subacute', 'recovery', 'maintenance')),
  exercises JSONB,
  restrictions TEXT[],
  start_date DATE,
  target_end_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rehab_daily_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id UUID REFERENCES rehab_programs(id),
  date DATE NOT NULL,
  pain_level INTEGER CHECK (pain_level BETWEEN 0 AND 10),
  exercises_completed JSONB,
  mobility_score INTEGER CHECK (mobility_score BETWEEN 1 AND 10),
  swelling TEXT CHECK (swelling IN ('none', 'mild', 'moderate', 'severe')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
