-- Sprint 11: Family Profiles
-- Allows users to manage health profiles for family members

CREATE TABLE IF NOT EXISTS family_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  birth_date DATE,
  age INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  relationship TEXT NOT NULL CHECK (relationship IN ('spouse', 'child', 'parent', 'sibling', 'other')),
  is_minor BOOLEAN DEFAULT FALSE,
  -- Health profile (mirror of user_profiles essential fields)
  is_pregnant BOOLEAN DEFAULT FALSE,
  is_breastfeeding BOOLEAN DEFAULT FALSE,
  alcohol_use TEXT DEFAULT 'none' CHECK (alcohol_use IN ('none', 'occasional', 'regular', 'heavy')),
  smoking_use TEXT DEFAULT 'none' CHECK (smoking_use IN ('none', 'former', 'current')),
  kidney_disease BOOLEAN DEFAULT FALSE,
  liver_disease BOOLEAN DEFAULT FALSE,
  chronic_conditions TEXT[] DEFAULT '{}',
  supplements TEXT[] DEFAULT '{}',
  height_cm INTEGER,
  weight_kg DECIMAL,
  -- System
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Family member medications
CREATE TABLE IF NOT EXISTS family_medications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  brand_name TEXT,
  generic_name TEXT,
  dosage TEXT,
  frequency TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  added_at TIMESTAMPTZ DEFAULT NOW()
);

-- Family member allergies
CREATE TABLE IF NOT EXISTS family_allergies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  allergen TEXT NOT NULL,
  severity TEXT DEFAULT 'mild' CHECK (severity IN ('mild', 'moderate', 'severe', 'anaphylaxis')),
  added_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_allergies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own family members" ON family_members
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Users can manage family medications" ON family_medications
  FOR ALL USING (
    family_member_id IN (SELECT id FROM family_members WHERE owner_id = auth.uid())
  );

CREATE POLICY "Users can manage family allergies" ON family_allergies
  FOR ALL USING (
    family_member_id IN (SELECT id FROM family_members WHERE owner_id = auth.uid())
  );

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_family_member_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER family_members_updated_at
  BEFORE UPDATE ON family_members
  FOR EACH ROW
  EXECUTE FUNCTION update_family_member_updated_at();

-- Index for fast family lookup
CREATE INDEX IF NOT EXISTS idx_family_members_owner ON family_members(owner_id);
CREATE INDEX IF NOT EXISTS idx_family_medications_member ON family_medications(family_member_id);
CREATE INDEX IF NOT EXISTS idx_family_allergies_member ON family_allergies(family_member_id);
