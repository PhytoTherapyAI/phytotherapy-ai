-- F-REALTIME-001: Family invite realtime subscription enabler
-- Adds public.family_members to supabase_realtime publication so postgres_changes
-- INSERT events can be subscribed via channel.on('postgres_changes', ...).
--
-- Status: Apply via Supabase Studio SQL Editor (Vercel deploy auto-run değil).
-- Repo reproducibility için kayıtlı — yeni env'lerde apply edilmesi şart.
--
-- Sprint 8 — Commit 3 (DoctoPal'ın ilk realtime channel'ı).

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'family_members'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.family_members;
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
