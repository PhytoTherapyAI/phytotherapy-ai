-- ============================================
-- Sprint 9: Calendar Hub Tables
-- Column names match frontend & API code exactly
-- ============================================

-- 1. Calendar Events (medications, supplements, appointments, etc.)
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'medication', 'supplement', 'appointment', 'sport',
    'symptom', 'operation', 'reminder', 'custom'
  )),
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  recurrence TEXT DEFAULT 'none' CHECK (recurrence IN ('none', 'daily', 'weekly', 'monthly')),
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calendar_events_user_date ON calendar_events(user_id, event_date);

-- 2. Daily Logs (medication check-ins, supplement check-ins)
-- Code uses: item_type, item_id, item_name, completed
CREATE TABLE IF NOT EXISTS daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  item_type TEXT NOT NULL,
  item_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, log_date, item_type, item_id)
);

CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date ON daily_logs(user_id, log_date);

-- 3. Water Intake
-- Code uses: intake_date, glasses, target_glasses
CREATE TABLE IF NOT EXISTS water_intake (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  intake_date DATE NOT NULL DEFAULT CURRENT_DATE,
  glasses INTEGER NOT NULL DEFAULT 0,
  target_glasses INTEGER DEFAULT 8,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, intake_date)
);

CREATE INDEX IF NOT EXISTS idx_water_intake_user_date ON water_intake(user_id, intake_date);

-- 4. Vital Records
-- Code uses: vital_type, value, systolic, diastolic, notes, recorded_at
CREATE TABLE IF NOT EXISTS vital_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  vital_type TEXT NOT NULL CHECK (vital_type IN (
    'blood_pressure', 'blood_sugar', 'weight', 'heart_rate', 'temperature', 'spo2'
  )),
  value DECIMAL,
  systolic DECIMAL,
  diastolic DECIMAL,
  notes TEXT,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vital_records_user_date ON vital_records(user_id, recorded_at);

-- ============================================
-- RLS Policies
-- ============================================

ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_intake ENABLE ROW LEVEL SECURITY;
ALTER TABLE vital_records ENABLE ROW LEVEL SECURITY;

-- calendar_events
CREATE POLICY "Users can view own calendar events" ON calendar_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own calendar events" ON calendar_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own calendar events" ON calendar_events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own calendar events" ON calendar_events FOR DELETE USING (auth.uid() = user_id);

-- daily_logs
CREATE POLICY "Users can view own daily logs" ON daily_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own daily logs" ON daily_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own daily logs" ON daily_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own daily logs" ON daily_logs FOR DELETE USING (auth.uid() = user_id);

-- water_intake
CREATE POLICY "Users can view own water intake" ON water_intake FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own water intake" ON water_intake FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own water intake" ON water_intake FOR UPDATE USING (auth.uid() = user_id);

-- vital_records
CREATE POLICY "Users can view own vital records" ON vital_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own vital records" ON vital_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own vital records" ON vital_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own vital records" ON vital_records FOR DELETE USING (auth.uid() = user_id);
