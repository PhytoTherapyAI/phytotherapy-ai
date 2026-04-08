-- =============================================
-- FAMILY PROFILES — CLEAN SETUP
-- Supabase Dashboard SQL Editor'da \u00e7al\u0131\u015ft\u0131r
-- =============================================

-- 1. Tablolar\u0131 olu\u015ftur (IF NOT EXISTS — g\u00fcvenli)
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

-- 2. RLS etkinle\u015ftir
ALTER TABLE family_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_profile_sessions ENABLE ROW LEVEL SECURITY;

-- 3. Eski policy'leri temizle (varsa)
DROP POLICY IF EXISTS "Owner full access to group" ON family_groups;
DROP POLICY IF EXISTS "Members can view their group" ON family_groups;
DROP POLICY IF EXISTS "Authenticated users can create groups" ON family_groups;
DROP POLICY IF EXISTS "Owner can manage own groups" ON family_groups;
DROP POLICY IF EXISTS "Owner can update own groups" ON family_groups;
DROP POLICY IF EXISTS "Owner can delete own groups" ON family_groups;

DROP POLICY IF EXISTS "Owner manages all members" ON family_members;
DROP POLICY IF EXISTS "Admin manages members" ON family_members;
DROP POLICY IF EXISTS "Member views own record" ON family_members;
DROP POLICY IF EXISTS "Member updates own allows_management" ON family_members;
DROP POLICY IF EXISTS "View pending invites" ON family_members;
DROP POLICY IF EXISTS "Accept own invite" ON family_members;

DROP POLICY IF EXISTS "User manages own session" ON active_profile_sessions;

-- 4. Yeni policy'ler

-- family_groups: INSERT
CREATE POLICY "fg_insert" ON family_groups
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

-- family_groups: SELECT
CREATE POLICY "fg_select_owner" ON family_groups
  FOR SELECT TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "fg_select_member" ON family_groups
  FOR SELECT TO authenticated
  USING (id IN (
    SELECT group_id FROM family_members
    WHERE user_id = auth.uid() AND invite_status = 'accepted'
  ));

-- family_groups: UPDATE/DELETE
CREATE POLICY "fg_update" ON family_groups
  FOR UPDATE TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "fg_delete" ON family_groups
  FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

-- family_members: Owner full access
CREATE POLICY "fm_owner_all" ON family_members
  FOR ALL TO authenticated
  USING (group_id IN (
    SELECT id FROM family_groups WHERE owner_id = auth.uid()
  ));

-- family_members: Admin full access
CREATE POLICY "fm_admin_all" ON family_members
  FOR ALL TO authenticated
  USING (group_id IN (
    SELECT fm2.group_id FROM family_members fm2
    WHERE fm2.user_id = auth.uid()
    AND fm2.role = 'admin'
    AND fm2.invite_status = 'accepted'
  ));

-- family_members: Member can view own record
CREATE POLICY "fm_member_select" ON family_members
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- family_members: Member can update own allows_management
CREATE POLICY "fm_member_update" ON family_members
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- family_members: Anyone can view pending invites (for accept page)
CREATE POLICY "fm_pending_select" ON family_members
  FOR SELECT TO authenticated
  USING (invite_status = 'pending');

-- family_members: Invited user can accept
CREATE POLICY "fm_accept_invite" ON family_members
  FOR UPDATE TO authenticated
  USING (invite_status = 'pending')
  WITH CHECK (user_id = auth.uid());

-- active_profile_sessions: User full access to own session
CREATE POLICY "aps_user_all" ON active_profile_sessions
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- 5. Unique index'ler
DROP INDEX IF EXISTS idx_family_members_group_accepted_user;
DROP INDEX IF EXISTS idx_family_members_group_pending_email;

CREATE UNIQUE INDEX idx_family_members_group_accepted_user
  ON family_members(group_id, user_id)
  WHERE invite_status = 'accepted' AND user_id IS NOT NULL;

CREATE UNIQUE INDEX idx_family_members_group_pending_email
  ON family_members(group_id, invite_email)
  WHERE invite_status = 'pending';
