-- ============================================
-- Doctor Referral & Linked Accounts System
-- ============================================

-- Doctor referral codes
CREATE TABLE IF NOT EXISTS doctor_referral_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  link TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_referral_code ON doctor_referral_codes(code);

-- Referral tracking
CREATE TABLE IF NOT EXISTS referral_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referral_code_id UUID REFERENCES doctor_referral_codes(id),
  doctor_id UUID REFERENCES auth.users(id),
  patient_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'active', 'premium', 'churned')),
  credits_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_referral_doctor ON referral_records(doctor_id);

-- Linked family accounts
CREATE TABLE IF NOT EXISTS linked_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  linked_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL CHECK (relationship IN ('mother', 'father', 'child', 'spouse', 'grandparent', 'sibling', 'other')),
  permissions TEXT[] DEFAULT '{}',
  pays_subscription BOOLEAN DEFAULT FALSE,
  is_accepted BOOLEAN DEFAULT FALSE,
  invite_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_user_id, linked_user_id)
);
CREATE INDEX IF NOT EXISTS idx_linked_parent ON linked_accounts(parent_user_id);
CREATE INDEX IF NOT EXISTS idx_linked_child ON linked_accounts(linked_user_id);
