-- Sprint 13 Commit 1: Chat conversation continuity model.
-- Parallel track — query_history (legacy pair-row archive) DOKUNULMAZ.
-- Yeni chat_conversations + chat_messages bağımsız evrim, /api/chat v2
-- (Commit 2) ve ChatInterface refactor (Commit 3) bu tablolara yazar.
--
-- Status: Apply via Supabase Studio SQL Editor (Vercel auto-run değil).
-- CLAUDE.md kuralı: yeni tablo + RLS + indexes + NOTIFY pgrst hepsi tek
-- migration. Idempotent guards (IF NOT EXISTS, DROP POLICY IF EXISTS,
-- CREATE OR REPLACE) re-apply safe.

CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  -- target_user_id: aile üyesi modunda farklı (caregiver Anne profili açıkken
  -- target Baba). Default user_id = self.
  target_user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  title TEXT,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  pinned_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  -- user_id denormalize: RLS guard olarak. Caller user_id eşitlik kontrol
  -- her INSERT/SELECT'te. Cross-conversation leak imkansız.
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  attachments JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user
  ON public.chat_conversations(user_id, updated_at DESC)
  WHERE archived_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_chat_conversations_target
  ON public.chat_conversations(target_user_id, updated_at DESC)
  WHERE archived_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_chat_messages_conv
  ON public.chat_messages(conversation_id, created_at ASC);

-- RLS
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own_select" ON public.chat_conversations;
CREATE POLICY "own_select" ON public.chat_conversations
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "own_insert" ON public.chat_conversations;
CREATE POLICY "own_insert" ON public.chat_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "own_update" ON public.chat_conversations;
CREATE POLICY "own_update" ON public.chat_conversations
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "own_delete" ON public.chat_conversations;
CREATE POLICY "own_delete" ON public.chat_conversations
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "own_select" ON public.chat_messages;
CREATE POLICY "own_select" ON public.chat_messages
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "own_insert" ON public.chat_messages;
CREATE POLICY "own_insert" ON public.chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "own_delete" ON public.chat_messages;
CREATE POLICY "own_delete" ON public.chat_messages
  FOR DELETE USING (auth.uid() = user_id);

-- updated_at otomatik trigger (chat_conversations)
CREATE OR REPLACE FUNCTION public.update_chat_conversations_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS chat_conversations_updated_at ON public.chat_conversations;
CREATE TRIGGER chat_conversations_updated_at
  BEFORE UPDATE ON public.chat_conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_chat_conversations_updated_at();

NOTIFY pgrst, 'reload schema';
