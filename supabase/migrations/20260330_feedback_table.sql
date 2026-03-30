-- Feedback table for user feedback widget
CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page TEXT NOT NULL,
  page_works BOOLEAN,
  broken_description TEXT,
  feature_request TEXT,
  lang TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Anyone can insert feedback (including anonymous users)
CREATE POLICY "Anyone can insert feedback" ON feedback FOR INSERT
  WITH CHECK (true);

-- Only service role can read feedback
CREATE POLICY "Service role can read feedback" ON feedback FOR SELECT
  USING (auth.role() = 'service_role');
