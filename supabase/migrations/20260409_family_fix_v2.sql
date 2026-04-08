-- =============================================
-- FAMILY PROFILES — FIX INFINITE RECURSION
-- Supabase Dashboard SQL Editor'da calistir
-- =============================================

-- 1. Tablolari olustur (IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS family_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Ailem',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS family_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES family_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  nickname TEXT,
  allows_management BOOLEAN DEFAULT FALSE,
  invite_token UUID DEFAULT gen_random_uuid() UNIQUE,
  invite_email TEXT NOT NULL,
  invite_status TEXT DEFAULT 'pending' CHECK (invite_status IN ('pending', 'accepted', 'declined')),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS active_profile_sessions (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  viewing_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RLS etkinlestir
ALTER TABLE family_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_profile_sessions ENABLE ROW LEVEL SECURITY;

-- 3. TUM eski policy'leri temizle
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname, tablename FROM pg_policies
    WHERE tablename IN ('family_groups', 'family_members', 'active_profile_sessions')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- 4. SECURITY DEFINER helper fonksiyonlar
--    (RLS'yi bypass ederek sonsuz donguyu kirar)

CREATE OR REPLACE FUNCTION get_user_family_group_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT group_id FROM family_members
  WHERE user_id = auth.uid()
  AND invite_status = 'accepted'
$$;

CREATE OR REPLACE FUNCTION get_owned_group_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT id FROM family_groups
  WHERE owner_id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION is_group_admin(gid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM family_members
    WHERE group_id = gid
    AND user_id = auth.uid()
    AND role IN ('admin', 'owner')
    AND invite_status = 'accepted'
  )
$$;

-- =========================================
-- 5. family_groups policies (recursion-free)
-- =========================================

CREATE POLICY "fg_insert"
  ON family_groups FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "fg_select"
  ON family_groups FOR SELECT TO authenticated
  USING (
    owner_id = auth.uid()
    OR id IN (SELECT get_user_family_group_ids())
  );

CREATE POLICY "fg_update"
  ON family_groups FOR UPDATE TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "fg_delete"
  ON family_groups FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

-- =========================================
-- 6. family_members policies (recursion-free)
-- =========================================

-- Owner of the group can do everything
CREATE POLICY "fm_owner"
  ON family_members FOR ALL TO authenticated
  USING (group_id IN (SELECT get_owned_group_ids()));

-- Admin can do everything in their group
CREATE POLICY "fm_admin"
  ON family_members FOR ALL TO authenticated
  USING (is_group_admin(group_id));

-- Member can view own record
CREATE POLICY "fm_self_select"
  ON family_members FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Member can update own record (allows_management toggle)
CREATE POLICY "fm_self_update"
  ON family_members FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Anyone authenticated can view pending invites (for accept page)
CREATE POLICY "fm_pending"
  ON family_members FOR SELECT TO authenticated
  USING (invite_status = 'pending');

-- Invited user can accept their invite
CREATE POLICY "fm_accept"
  ON family_members FOR UPDATE TO authenticated
  USING (invite_status = 'pending')
  WITH CHECK (user_id = auth.uid());

-- =========================================
-- 7. active_profile_sessions policies
-- =========================================

CREATE POLICY "aps_all"
  ON active_profile_sessions FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- =========================================
-- 8. Unique indexes
-- =========================================

DROP INDEX IF EXISTS idx_family_members_group_accepted_user;
DROP INDEX IF EXISTS idx_family_members_group_pending_email;

CREATE UNIQUE INDEX idx_family_members_group_accepted_user
  ON family_members(group_id, user_id)
  WHERE invite_status = 'accepted' AND user_id IS NOT NULL;

CREATE UNIQUE INDEX idx_family_members_group_pending_email
  ON family_members(group_id, invite_email)
  WHERE invite_status = 'pending';
