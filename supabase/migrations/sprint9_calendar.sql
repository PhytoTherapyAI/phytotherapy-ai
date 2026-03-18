-- ============================================
-- Sprint 9: Calendar Hub Tables
-- ============================================

-- 8. Calendar Events (medications, supplements, appointments, etc.)
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

CREATE INDEX idx_calendar_events_user_date ON calendar_events(user_id, event_date);

-- 9. Daily Logs (medication check-ins, daily tasks)
CREATE TABLE IF NOT EXISTS daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  log_type TEXT NOT NULL CHECK (log_type IN ('medication', 'supplement', 'task', 'mood', 'energy', 'sleep')),
  reference_id UUID, -- FK to medication/supplement if applicable
  reference_name TEXT, -- display name
  dose_index INTEGER DEFAULT 0, -- which dose of the day (0=first, 1=second, etc.)
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  value TEXT, -- for mood/energy/sleep: score or note
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, log_date, log_type, reference_id, dose_index)
);

CREATE INDEX idx_daily_logs_user_date ON daily_logs(user_id, log_date);

-- 10. Water Intake
CREATE TABLE IF NOT EXISTS water_intake (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  intake_date DATE NOT NULL DEFAULT CURRENT_DATE,
  glasses INTEGER NOT NULL DEFAULT 0, -- number of glasses (250ml each)
  target_glasses INTEGER DEFAULT 8,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, intake_date)
);

CREATE INDEX idx_water_intake_user_date ON water_intake(user_id, intake_date);

-- 11. Vital Records
CREATE TABLE IF NOT EXISTS vital_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  vital_type TEXT NOT NULL CHECK (vital_type IN (
    'blood_pressure', 'blood_sugar', 'weight', 'heart_rate', 'temperature', 'spo2'
  )),
  value_primary DECIMAL NOT NULL, -- systolic / glucose / weight / bpm / temp / spo2
  value_secondary DECIMAL, -- diastolic (for blood pressure)
  unit TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vital_records_user_date ON vital_records(user_id, record_date);

-- ============================================
-- RLS Policies for new tables
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
