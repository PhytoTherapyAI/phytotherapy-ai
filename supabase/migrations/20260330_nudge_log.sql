-- Nudge Log — Smart notification tracking
-- Tracks sent nudges to prevent duplicates and record acknowledgments

CREATE TABLE IF NOT EXISTS nudge_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('drop_off', 'streak', 'risk_alert')),
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'telegram', 'push')),
  message_content TEXT NOT NULL,
  context JSONB DEFAULT '{}',
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_nudge_user_date ON nudge_log(user_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_nudge_type ON nudge_log(trigger_type, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_nudge_unack ON nudge_log(user_id, acknowledged) WHERE acknowledged = FALSE;

ALTER TABLE nudge_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own nudges" ON nudge_log FOR SELECT USING (auth.uid() = user_id);
