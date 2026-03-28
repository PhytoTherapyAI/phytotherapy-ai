-- ============================================
-- Verification Documents — KVKK/HIPAA Compliant Schema
-- ============================================
-- IMPORTANT: No PII in column values
-- - encrypted_path: AES-256-CBC encrypted storage path (server decrypts)
-- - original_filename_hash: partial base64 (not the real filename)
-- - diploma_number: stored as-is (required for verification matching)
-- ============================================

CREATE TABLE IF NOT EXISTS verification_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Document metadata (no raw paths stored)
  document_type TEXT NOT NULL CHECK (document_type IN (
    'diploma_registration', 'institution_id', 'edevlet_certificate', 'ttb_license', 'other'
  )),
  encrypted_path TEXT NOT NULL,               -- AES-256-CBC encrypted storage path
  original_filename_hash TEXT,                 -- partial hash only, not the real filename
  file_size INTEGER NOT NULL CHECK (file_size > 0 AND file_size <= 5242880), -- max 5MB
  mime_type TEXT NOT NULL CHECK (mime_type IN ('application/pdf', 'image/jpeg', 'image/png')),

  -- Verification data
  diploma_number TEXT,                         -- Sağlık Bakanlığı diploma tescil no
  ttb_sicil_number TEXT,                       -- TTB/TEB sicil no

  -- Status management
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN (
    'pending', 'approved', 'rejected', 'expired'
  )),

  -- Review tracking
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  reviewer_notes TEXT,                         -- internal admin notes

  -- Audit timestamps
  uploaded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '90 days'), -- auto-expire after 90 days

  -- Constraints
  CONSTRAINT unique_user_doctype UNIQUE (user_id, document_type)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_verdoc_user ON verification_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_verdoc_status ON verification_documents(verification_status);
CREATE INDEX IF NOT EXISTS idx_verdoc_expires ON verification_documents(expires_at);

-- RLS Policies
ALTER TABLE verification_documents ENABLE ROW LEVEL SECURITY;

-- Users can only see their own documents
CREATE POLICY "Users view own documents" ON verification_documents
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own documents
CREATE POLICY "Users insert own documents" ON verification_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Only service role can update (admin review)
-- (Service role bypasses RLS automatically)

-- ============================================
-- Verification Audit Log
-- ============================================
CREATE TABLE IF NOT EXISTS verification_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL CHECK (action IN ('upload', 'view', 'delete', 'verify', 'reject')),
  user_id UUID NOT NULL,
  document_id TEXT NOT NULL,
  admin_id UUID,
  ip_address TEXT,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_user ON verification_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON verification_audit_log(action);

-- ============================================
-- Add verification_status to user_profiles
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'verification_status'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN verification_status TEXT DEFAULT 'unverified'
      CHECK (verification_status IN ('unverified', 'pending', 'approved', 'rejected'));
  END IF;
END $$;
