-- Sentry Error Auto-Fix Pipeline
-- Stores errors from Sentry webhook for Claude Code auto-fix

CREATE TABLE IF NOT EXISTS sentry_errors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sentry_issue_id TEXT NOT NULL,
  title TEXT NOT NULL,
  culprit TEXT,
  level TEXT DEFAULT 'error',
  platform TEXT DEFAULT 'javascript',
  first_seen TIMESTAMPTZ,
  last_seen TIMESTAMPTZ,
  count INTEGER DEFAULT 1,
  stacktrace TEXT,
  url TEXT,
  browser TEXT,
  raw_payload TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'fixing', 'fixed', 'ignored', 'reopened')),
  auto_fix_attempts INTEGER DEFAULT 0,
  fix_commit_hash TEXT,
  fix_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_sentry_errors_status ON sentry_errors(status);
CREATE INDEX IF NOT EXISTS idx_sentry_errors_issue_id ON sentry_errors(sentry_issue_id);
CREATE INDEX IF NOT EXISTS idx_sentry_errors_created ON sentry_errors(created_at DESC);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_sentry_errors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sentry_errors_updated_at ON sentry_errors;
CREATE TRIGGER sentry_errors_updated_at
  BEFORE UPDATE ON sentry_errors
  FOR EACH ROW
  EXECUTE FUNCTION update_sentry_errors_updated_at();
