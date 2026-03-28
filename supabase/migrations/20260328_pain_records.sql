-- Pain Diary: pain_records table
CREATE TABLE IF NOT EXISTS pain_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  location TEXT NOT NULL,
  intensity INTEGER CHECK (intensity BETWEEN 1 AND 10),
  pain_type TEXT,
  duration TEXT,
  triggers TEXT[],
  relief_methods TEXT[],
  medications_taken TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pain_user_date ON pain_records(user_id, date DESC);

-- RLS policies
ALTER TABLE pain_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pain records"
  ON pain_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pain records"
  ON pain_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pain records"
  ON pain_records FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pain records"
  ON pain_records FOR DELETE
  USING (auth.uid() = user_id);
