-- © 2026 DoctoPal — KVKK 2026/347 İlke Kararı uyumu
-- Aydınlatma (bilgilendirme) ile açık rıza beyanları AYRI AYRI saklanmalı

ALTER TABLE user_profiles
  -- Aydınlatma (information notice) — KVKK Article 10
  ADD COLUMN IF NOT EXISTS aydinlatma_acknowledged BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS aydinlatma_version TEXT,
  ADD COLUMN IF NOT EXISTS aydinlatma_timestamp TIMESTAMPTZ,
  -- Explicit consents (açık rıza) — KVKK Article 11
  ADD COLUMN IF NOT EXISTS consent_ai_processing BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_data_transfer BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_sbar_report BOOLEAN DEFAULT false;

-- Audit log for consent changes (withdrawals, updates)
CREATE TABLE IF NOT EXISTS consent_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL, -- 'ai_processing' | 'data_transfer' | 'sbar_report' | 'medical_disclaimer' | 'aydinlatma'
  granted BOOLEAN NOT NULL,
  version TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consent_log_user ON consent_log(user_id, consent_type, created_at DESC);

-- RLS
ALTER TABLE consent_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own consent log" ON consent_log;
CREATE POLICY "Users can view own consent log" ON consent_log
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own consent log" ON consent_log;
CREATE POLICY "Users can insert own consent log" ON consent_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);
