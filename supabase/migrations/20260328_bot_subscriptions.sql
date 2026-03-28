-- ============================================
-- Bot Subscriptions — WhatsApp & Telegram
-- ============================================

CREATE TABLE IF NOT EXISTS bot_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'telegram')),
  channel_id TEXT NOT NULL,              -- phone (WhatsApp) or chat_id (Telegram)
  display_name TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'disconnected')),
  daily_plan_enabled BOOLEAN DEFAULT TRUE,
  send_time TEXT DEFAULT '09:00',        -- HH:MM
  language TEXT DEFAULT 'tr' CHECK (language IN ('en', 'tr')),
  last_message_sent TIMESTAMPTZ,
  last_user_reply TIMESTAMPTZ,
  total_messages_sent INTEGER DEFAULT 0,
  total_tasks_completed INTEGER DEFAULT 0,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_channel UNIQUE (user_id, channel)
);

CREATE INDEX IF NOT EXISTS idx_bot_sub_user ON bot_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_bot_sub_status ON bot_subscriptions(status, daily_plan_enabled);
CREATE INDEX IF NOT EXISTS idx_bot_sub_channel ON bot_subscriptions(channel, channel_id);

-- RLS
ALTER TABLE bot_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own subscriptions" ON bot_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- Bot Messages Log
-- ============================================
CREATE TABLE IF NOT EXISTS bot_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID REFERENCES bot_subscriptions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  channel TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('outgoing', 'incoming')),
  content TEXT NOT NULL,
  task_id TEXT,
  task_completed BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_bot_msg_sub ON bot_messages(subscription_id, sent_at DESC);
