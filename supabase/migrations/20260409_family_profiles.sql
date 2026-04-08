-- Aile Profili Sistemi Migration
-- Supabase Dashboard SQL Editor'da çalıştırılacak

-- Aile grupları
CREATE TABLE IF NOT EXISTS family_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Ailem',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Aile üyeleri
CREATE TABLE IF NOT EXISTS family_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES family_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  role TEXT DEFAULT 'member'
    CHECK (role IN ('owner', 'admin', 'member')),
  nickname TEXT,
  allows_management BOOLEAN DEFAULT FALSE,
  invite_token UUID DEFAULT gen_random_uuid() UNIQUE,
  invite_email TEXT NOT NULL,
  invite_status TEXT DEFAULT 'pending'
    CHECK (invite_status IN ('pending', 'accepted', 'declined')),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(group_id, user_id)
);

-- Aktif profil session
CREATE TABLE IF NOT EXISTS active_profile_sessions (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  viewing_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE family_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_profile_sessions ENABLE ROW LEVEL SECURITY;

-- family_groups policies
CREATE POLICY "Owner full access to group"
  ON family_groups FOR ALL
  USING (owner_id = auth.uid());

CREATE POLICY "Members can view their group"
  ON family_groups FOR SELECT
  USING (
    id IN (
      SELECT group_id FROM family_members
      WHERE user_id = auth.uid()
      AND invite_status = 'accepted'
    )
  );

-- family_members policies
CREATE POLICY "Owner manages all members"
  ON family_members FOR ALL
  USING (
    group_id IN (
      SELECT id FROM family_groups
      WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Admin manages members"
  ON family_members FOR ALL
  USING (
    group_id IN (
      SELECT group_id FROM family_members
      WHERE user_id = auth.uid()
      AND role = 'admin'
      AND invite_status = 'accepted'
    )
  );

CREATE POLICY "Member views own record"
  ON family_members FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Member updates own allows_management"
  ON family_members FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- active_profile_sessions policies
CREATE POLICY "User manages own session"
  ON active_profile_sessions FOR ALL
  USING (user_id = auth.uid());
