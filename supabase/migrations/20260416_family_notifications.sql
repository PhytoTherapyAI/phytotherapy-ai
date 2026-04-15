-- =============================================
-- FAMILY NOTIFICATIONS — Stage 5
-- Run in Supabase Dashboard SQL Editor
-- =============================================
-- Lightweight notification log scoped to a household. Used for
-- member-to-member reminders ("Took your meds?", "Check in",
-- emergency alerts). Polled by the client (no realtime subscription
-- required at this stage).

CREATE TABLE IF NOT EXISTS family_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES family_groups(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('reminder_meds', 'reminder_checkin', 'reminder_water', 'emergency', 'custom')),
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE family_notifications ENABLE ROW LEVEL SECURITY;

-- Drop any prior policy versions
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'family_notifications'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON family_notifications', pol.policyname);
  END LOOP;
END $$;

-- Recipient can read & mark as read on their own notifications
CREATE POLICY "fn_recipient_select"
  ON family_notifications FOR SELECT TO authenticated
  USING (to_user_id = auth.uid());

CREATE POLICY "fn_recipient_update"
  ON family_notifications FOR UPDATE TO authenticated
  USING (to_user_id = auth.uid())
  WITH CHECK (to_user_id = auth.uid());

-- Sender can insert only if both sender and recipient belong to the
-- same accepted family_members of the same group_id.
CREATE POLICY "fn_sender_insert"
  ON family_notifications FOR INSERT TO authenticated
  WITH CHECK (
    from_user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM family_members
      WHERE group_id = family_notifications.group_id
        AND user_id  = auth.uid()
        AND invite_status = 'accepted'
    )
    AND EXISTS (
      SELECT 1 FROM family_members
      WHERE group_id = family_notifications.group_id
        AND user_id  = family_notifications.to_user_id
        AND invite_status = 'accepted'
    )
  );

-- Sender can also delete their own outgoing notifications (undo)
CREATE POLICY "fn_sender_delete"
  ON family_notifications FOR DELETE TO authenticated
  USING (from_user_id = auth.uid());

-- Index for recipient inbox query (most-recent unread first)
CREATE INDEX IF NOT EXISTS idx_family_notifications_recipient
  ON family_notifications(to_user_id, read, created_at DESC);
