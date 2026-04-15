-- © 2026 DoctoPal — KVKK Md.11/1-g (Right to Object to Automated Decisions)
-- MADDE 10 of YASAL-UYUM.md

CREATE TABLE IF NOT EXISTS ai_objections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  response_id TEXT,
  category TEXT NOT NULL CHECK (category IN (
    'incorrect', 'incomplete', 'harmful', 'diagnosis', 'prescription', 'other'
  )),
  objection_text TEXT,
  language TEXT DEFAULT 'tr' CHECK (language IN ('tr', 'en')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_ai_objections_user ON ai_objections(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_objections_status ON ai_objections(status, created_at DESC);

-- RLS
ALTER TABLE ai_objections ENABLE ROW LEVEL SECURITY;

-- Anonymous users may submit (server-side insert via service role); authed users too
DROP POLICY IF EXISTS "Anyone can submit objection" ON ai_objections;
CREATE POLICY "Anyone can submit objection" ON ai_objections
  FOR INSERT WITH CHECK (true);

-- Users can view their own objections
DROP POLICY IF EXISTS "Users view own objections" ON ai_objections;
CREATE POLICY "Users view own objections" ON ai_objections
  FOR SELECT USING (auth.uid() = user_id);
