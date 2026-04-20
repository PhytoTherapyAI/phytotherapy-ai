-- ═══════════════════════════════════════════════════════════════════
-- DOCTOPAL — SESSION 36: FAMILY HISTORY ENTRIES (Master Plan v1.2)
-- Tarih: 21 Nisan 2026
-- Amaç: Aile öyküsü (hastalık + yaş + ilişki) için ayrı tablo.
--
-- KVKK gerekçesi: 3. şahıs (dede/nine/amca/teyze) için detaylı sağlık
-- profili tutmak ihlal riski (Md.6 — özel nitelikli veri açık rıza).
-- Bu tablo sadece "aile öyküsü metadata'sı" tutar — detaylı ilaç/profil
-- YOK. Kullanıcının kendi sağlık geçmişinin bir parçası olarak aile
-- öyküsü, risk haritası hesaplaması ve AI asistanın bağlam kullanımı
-- için.
--
-- KULLANIM: Supabase SQL Editor'a yapıştır ve çalıştır.
-- İdempotent — birden fazla kez çalıştırılabilir (IF NOT EXISTS).
-- NOT: Bu session'da Supabase'de çalıştırılmıyor, repo'ya dosya olarak
-- eklendi. Session 37+ UI entegrasyonu sırasında apply edilecek.
-- ═══════════════════════════════════════════════════════════════════


CREATE TABLE IF NOT EXISTS public.family_history_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  person_relation VARCHAR(50) NOT NULL,
    -- Örnek: anne, baba, kardeş, dede (anne tarafı), nine (baba tarafı),
    -- amca, hala, teyze, dayı, kuzen, vb.
  condition_name VARCHAR(200) NOT NULL,
    -- Serbest metin — örn: "meme kanseri", "tip 2 diyabet", "hipertansiyon",
    -- "erken kalp krizi"
  age_at_diagnosis INTEGER,
    -- Teşhis yaşı — erken başlangıç (örn: 40 altı kardiyovasküler) genetik
    -- risk skorlaması için kritik
  age_at_death INTEGER,
    -- Ölüm yaşı (is_deceased = TRUE ise)
  is_deceased BOOLEAN DEFAULT FALSE,
  notes TEXT,
    -- Serbest not (opsiyonel — "iki taraflı", "40 yaşından sonra tedavi"
    -- gibi)
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_family_history_user_id
  ON public.family_history_entries(user_id);

ALTER TABLE public.family_history_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own_select" ON public.family_history_entries;
DROP POLICY IF EXISTS "own_insert" ON public.family_history_entries;
DROP POLICY IF EXISTS "own_update" ON public.family_history_entries;
DROP POLICY IF EXISTS "own_delete" ON public.family_history_entries;

CREATE POLICY "own_select" ON public.family_history_entries
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own_insert" ON public.family_history_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_update" ON public.family_history_entries
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_delete" ON public.family_history_entries
  FOR DELETE USING (auth.uid() = user_id);

NOTIFY pgrst, 'reload schema';


-- ═══════════════════════════════════════════════════════════════════
-- DOĞRULAMA SORGULARI
-- ═══════════════════════════════════════════════════════════════════

-- 1. Tablo oluştu mu?
-- SELECT COUNT(*) FROM public.family_history_entries;

-- 2. RLS açık mı?
-- SELECT tablename, rowsecurity FROM pg_tables
--   WHERE tablename = 'family_history_entries';

-- 3. Policy'ler var mı?
-- SELECT policyname, cmd FROM pg_policies
--   WHERE tablename = 'family_history_entries';
