-- Daily Check-in + Water Intake tabloları
-- Supabase Dashboard SQL Editor'da calistir

-- daily_check_ins — kod check_date, energy_level, sleep_quality, mood, bloating kullanıyor
CREATE TABLE IF NOT EXISTS daily_check_ins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  check_date DATE DEFAULT CURRENT_DATE,
  check_in_date DATE DEFAULT CURRENT_DATE,
  energy_level INTEGER,
  sleep_quality INTEGER,
  mood INTEGER,
  bloating INTEGER,
  health_score NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, check_date)
);

-- water_intake — kod intake_date, glasses, target_glasses kullanıyor
CREATE TABLE IF NOT EXISTS water_intake (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  intake_date DATE DEFAULT CURRENT_DATE,
  glasses INTEGER DEFAULT 0,
  target_glasses INTEGER DEFAULT 8,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, intake_date)
);

-- daily_logs — görev tamamlama
CREATE TABLE IF NOT EXISTS daily_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE DEFAULT CURRENT_DATE,
  item_type TEXT,
  item_id TEXT,
  item_name TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE daily_check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_intake ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$
BEGIN
  -- daily_check_ins
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'daily_check_ins' AND policyname = 'checkin_user_all') THEN
    CREATE POLICY "checkin_user_all" ON daily_check_ins FOR ALL TO authenticated
      USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
  -- water_intake
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'water_intake' AND policyname = 'water_user_all') THEN
    CREATE POLICY "water_user_all" ON water_intake FOR ALL TO authenticated
      USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
  -- daily_logs
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'daily_logs' AND policyname = 'logs_user_all') THEN
    CREATE POLICY "logs_user_all" ON daily_logs FOR ALL TO authenticated
      USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
END $$;
