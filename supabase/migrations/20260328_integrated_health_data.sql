-- ============================================
-- Integrated Health Data Hub
-- Unified data from: wearables, labs, doctor notes, supplements
-- FHIR-compatible normalized schema
-- ============================================

-- ── Normalized Health Metrics (from all sources) ──
CREATE TABLE IF NOT EXISTS health_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Source identification
  source TEXT NOT NULL CHECK (source IN (
    'manual', 'wearable', 'lab_test', 'doctor_note', 'fhir_import',
    'apple_health', 'google_fit', 'fitbit', 'garmin', 'oura', 'phytotherapy_ai'
  )),
  source_id TEXT,                       -- external record ID

  -- Metric data (LOINC-coded)
  metric_type TEXT NOT NULL,             -- e.g., 'heart_rate', 'hba1c', 'steps'
  loinc_code TEXT,                       -- LOINC code if applicable
  value DECIMAL NOT NULL,
  unit TEXT NOT NULL,                    -- UCUM unit
  status TEXT CHECK (status IN ('normal', 'high', 'low', 'critical')),

  -- FHIR reference
  fhir_resource_type TEXT,              -- 'Observation', 'MedicationStatement'
  fhir_resource_id TEXT,

  -- Timestamps
  measured_at TIMESTAMPTZ NOT NULL,     -- when the measurement was taken
  imported_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent exact duplicates
  CONSTRAINT unique_metric UNIQUE (user_id, source, metric_type, measured_at)
);

CREATE INDEX IF NOT EXISTS idx_hm_user_type ON health_metrics(user_id, metric_type, measured_at DESC);
CREATE INDEX IF NOT EXISTS idx_hm_source ON health_metrics(source, user_id);
CREATE INDEX IF NOT EXISTS idx_hm_loinc ON health_metrics(loinc_code);

-- RLS
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own metrics" ON health_metrics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own metrics" ON health_metrics FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ── FHIR Export Log ──
CREATE TABLE IF NOT EXISTS fhir_export_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  export_type TEXT NOT NULL,             -- 'bundle', 'medication', 'observation'
  format TEXT DEFAULT 'fhir',            -- 'fhir', 'enabiz', 'hl7v2'
  resource_count INTEGER DEFAULT 0,
  destination TEXT,                      -- where it was sent
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Integration Connections (OAuth tokens) ──
CREATE TABLE IF NOT EXISTS integration_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL,
  access_token_encrypted TEXT,           -- AES-256 encrypted
  refresh_token_encrypted TEXT,          -- AES-256 encrypted
  token_expires_at TIMESTAMPTZ,
  scopes TEXT[],
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
  last_sync_at TIMESTAMPTZ,
  total_records_synced INTEGER DEFAULT 0,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_provider UNIQUE (user_id, provider)
);

ALTER TABLE integration_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own connections" ON integration_connections FOR ALL USING (auth.uid() = user_id);
