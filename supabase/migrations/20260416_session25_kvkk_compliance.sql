-- ═══════════════════════════════════════════════════════════════════
-- DOCTOPAL — SESSION 25 KVKK UYUM MİGRASYONU
-- Tarih: 16 Nisan 2026
-- Amaç: RLS, consent, audit, family, yasal uyum altyapısı
-- 
-- KULLANIM: Bu dosyayı Supabase SQL Editor'a yapıştır ve çalıştır.
-- İdempotent — birden fazla kez çalıştırılabilir (IF NOT EXISTS).
-- ═══════════════════════════════════════════════════════════════════


-- ═══════════════════════════════════════════════════════════════════
-- BÖLÜM 1: USER_PROFILES EKSİK SÜTUNLAR
-- ═══════════════════════════════════════════════════════════════════

-- Consent sütunları
ALTER TABLE public.user_profiles 
  ADD COLUMN IF NOT EXISTS consent_ai_processing BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_ai_processing_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS consent_data_transfer BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_data_transfer_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS consent_external_transfer BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_external_transfer_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS consent_sbar_report BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_sbar_report_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS consent_last_updated_at TIMESTAMPTZ;

-- Aydınlatma sütunları
ALTER TABLE public.user_profiles 
  ADD COLUMN IF NOT EXISTS aydinlatma_acknowledged BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS aydinlatma_acknowledged_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS aydinlatma_timestamp TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS aydinlatma_version TEXT DEFAULT 'v1.0';

-- Consent versiyon sütunları (v2.0 tracking)
ALTER TABLE public.user_profiles 
  ADD COLUMN IF NOT EXISTS consent_ai_processing_version TEXT DEFAULT 'v1.0',
  ADD COLUMN IF NOT EXISTS consent_data_transfer_version TEXT DEFAULT 'v1.0',
  ADD COLUMN IF NOT EXISTS consent_sbar_report_version TEXT DEFAULT 'v1.0';


-- ═══════════════════════════════════════════════════════════════════
-- BÖLÜM 2: CONSENT_LOG AUDIT TABLOSU (KVKK Md.12)
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.consent_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  consent_type TEXT NOT NULL,
  granted BOOLEAN NOT NULL,
  previous_value BOOLEAN,
  ip_address TEXT,
  user_agent TEXT,
  source TEXT DEFAULT 'unknown',
  version TEXT DEFAULT 'v1.0',
  aydinlatma_version TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_consent_log_user_id ON public.consent_log(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_log_created_at ON public.consent_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_consent_log_consent_type ON public.consent_log(consent_type);

ALTER TABLE public.consent_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own_select" ON public.consent_log;
DROP POLICY IF EXISTS "own_insert" ON public.consent_log;
CREATE POLICY "own_select" ON public.consent_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own_insert" ON public.consent_log FOR INSERT WITH CHECK (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════════════
-- BÖLÜM 3: AI_OBJECTIONS TABLOSU (KVKK Md.11/1-g İtiraz)
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.ai_objections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  response_id TEXT,
  category TEXT NOT NULL,
  objection_text TEXT,
  language TEXT DEFAULT 'tr',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

ALTER TABLE public.ai_objections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can insert own objections" ON public.ai_objections;
DROP POLICY IF EXISTS "Users can view own objections" ON public.ai_objections;
CREATE POLICY "Users can insert own objections" ON public.ai_objections FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own objections" ON public.ai_objections FOR SELECT USING (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════════════
-- BÖLÜM 4: FAMILY_NOTIFICATIONS TABLOSU
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.family_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.family_groups(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('reminder_meds', 'reminder_checkin', 'reminder_water', 'emergency', 'custom')),
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  read_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_family_notif_to_user ON public.family_notifications(to_user_id);
CREATE INDEX IF NOT EXISTS idx_family_notif_group ON public.family_notifications(group_id);
CREATE INDEX IF NOT EXISTS idx_family_notif_unread ON public.family_notifications(to_user_id, read) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_family_notif_created ON public.family_notifications(created_at DESC);

ALTER TABLE public.family_notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "recipient_select" ON public.family_notifications;
DROP POLICY IF EXISTS "fn_sender_insert" ON public.family_notifications;
DROP POLICY IF EXISTS "recipient_update" ON public.family_notifications;
DROP POLICY IF EXISTS "recipient_delete" ON public.family_notifications;

CREATE POLICY "recipient_select" ON public.family_notifications 
  FOR SELECT USING (auth.uid() = to_user_id);
CREATE POLICY "fn_sender_insert" ON public.family_notifications 
  FOR INSERT WITH CHECK (
    auth.uid() = from_user_id
    AND EXISTS (SELECT 1 FROM public.family_members fm WHERE fm.user_id = auth.uid() AND fm.group_id = family_notifications.group_id)
    AND EXISTS (SELECT 1 FROM public.family_members fm WHERE fm.user_id = family_notifications.to_user_id AND fm.group_id = family_notifications.group_id)
  );
CREATE POLICY "recipient_update" ON public.family_notifications 
  FOR UPDATE USING (auth.uid() = to_user_id) WITH CHECK (auth.uid() = to_user_id);
CREATE POLICY "recipient_delete" ON public.family_notifications 
  FOR DELETE USING (auth.uid() = to_user_id);


-- ═══════════════════════════════════════════════════════════════════
-- BÖLÜM 5: 47 TABLO RLS + POLICY (user_id bazlı)
-- ═══════════════════════════════════════════════════════════════════

DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY[
    'active_profile_sessions', 'allergy_intolerance_records', 'allergy_reaction_log',
    'analytics_events', 'blood_tests', 'bot_messages', 'bot_subscriptions',
    'calendar_events', 'consent_records', 'contraceptive_records', 'cycle_records',
    'daily_check_ins', 'daily_logs', 'family_members', 'fhir_export_log',
    'health_metrics', 'integration_connections', 'mood_records', 'nutrition_records',
    'pain_records', 'proms_responses', 'query_history', 'rehab_daily_log',
    'rehab_programs', 'side_effect_reports', 'sleep_records', 'sos_events',
    'user_allergies', 'user_badges', 'user_medications', 'vaccination_records',
    'verification_audit_log', 'verification_documents', 'vital_records', 'water_intake'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS "own_select" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "own_insert" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "own_update" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "own_delete" ON public.%I', t);
    EXECUTE format('CREATE POLICY "own_select" ON public.%I FOR SELECT USING (auth.uid() = user_id)', t);
    EXECUTE format('CREATE POLICY "own_insert" ON public.%I FOR INSERT WITH CHECK (auth.uid() = user_id)', t);
    EXECUTE format('CREATE POLICY "own_update" ON public.%I FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)', t);
    EXECUTE format('CREATE POLICY "own_delete" ON public.%I FOR DELETE USING (auth.uid() = user_id)', t);
  END LOOP;
END $$;

-- user_profiles (id = auth.uid(), user_id yok)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own_select" ON public.user_profiles;
DROP POLICY IF EXISTS "own_insert" ON public.user_profiles;
DROP POLICY IF EXISTS "own_update" ON public.user_profiles;
DROP POLICY IF EXISTS "own_delete" ON public.user_profiles;
CREATE POLICY "own_select" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "own_insert" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "own_update" ON public.user_profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "own_delete" ON public.user_profiles FOR DELETE USING (auth.uid() = id);


-- ═══════════════════════════════════════════════════════════════════
-- BÖLÜM 6: ÖZEL TABLOLAR (user_id olmayan)
-- ═══════════════════════════════════════════════════════════════════

-- doctor_feedback (doctor_id)
ALTER TABLE public.doctor_feedback ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "doctor_select" ON public.doctor_feedback;
DROP POLICY IF EXISTS "doctor_insert" ON public.doctor_feedback;
DROP POLICY IF EXISTS "doctor_update" ON public.doctor_feedback;
DROP POLICY IF EXISTS "doctor_delete" ON public.doctor_feedback;
CREATE POLICY "doctor_select" ON public.doctor_feedback FOR SELECT USING (auth.uid() = doctor_id);
CREATE POLICY "doctor_insert" ON public.doctor_feedback FOR INSERT WITH CHECK (auth.uid() = doctor_id);
CREATE POLICY "doctor_update" ON public.doctor_feedback FOR UPDATE USING (auth.uid() = doctor_id) WITH CHECK (auth.uid() = doctor_id);
CREATE POLICY "doctor_delete" ON public.doctor_feedback FOR DELETE USING (auth.uid() = doctor_id);

-- doctor_patients (doctor_id + patient_id)
ALTER TABLE public.doctor_patients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "either_select" ON public.doctor_patients;
DROP POLICY IF EXISTS "doctor_insert" ON public.doctor_patients;
DROP POLICY IF EXISTS "doctor_update" ON public.doctor_patients;
DROP POLICY IF EXISTS "doctor_delete" ON public.doctor_patients;
CREATE POLICY "either_select" ON public.doctor_patients FOR SELECT USING (auth.uid() = doctor_id OR auth.uid() = patient_id);
CREATE POLICY "doctor_insert" ON public.doctor_patients FOR INSERT WITH CHECK (auth.uid() = doctor_id);
CREATE POLICY "doctor_update" ON public.doctor_patients FOR UPDATE USING (auth.uid() = doctor_id OR auth.uid() = patient_id) WITH CHECK (auth.uid() = doctor_id OR auth.uid() = patient_id);
CREATE POLICY "doctor_delete" ON public.doctor_patients FOR DELETE USING (auth.uid() = doctor_id);

-- doctor_referral_codes (doctor_id)
ALTER TABLE public.doctor_referral_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "doctor_select" ON public.doctor_referral_codes;
DROP POLICY IF EXISTS "doctor_insert" ON public.doctor_referral_codes;
DROP POLICY IF EXISTS "doctor_update" ON public.doctor_referral_codes;
DROP POLICY IF EXISTS "doctor_delete" ON public.doctor_referral_codes;
CREATE POLICY "doctor_select" ON public.doctor_referral_codes FOR SELECT USING (auth.uid() = doctor_id);
CREATE POLICY "doctor_insert" ON public.doctor_referral_codes FOR INSERT WITH CHECK (auth.uid() = doctor_id);
CREATE POLICY "doctor_update" ON public.doctor_referral_codes FOR UPDATE USING (auth.uid() = doctor_id) WITH CHECK (auth.uid() = doctor_id);
CREATE POLICY "doctor_delete" ON public.doctor_referral_codes FOR DELETE USING (auth.uid() = doctor_id);

-- family_groups (owner_id)
ALTER TABLE public.family_groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "owner_select" ON public.family_groups;
DROP POLICY IF EXISTS "owner_insert" ON public.family_groups;
DROP POLICY IF EXISTS "owner_update" ON public.family_groups;
DROP POLICY IF EXISTS "owner_delete" ON public.family_groups;
CREATE POLICY "owner_select" ON public.family_groups FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "owner_insert" ON public.family_groups FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "owner_update" ON public.family_groups FOR UPDATE USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "owner_delete" ON public.family_groups FOR DELETE USING (auth.uid() = owner_id);

-- family_allergies (family_members join ile)
ALTER TABLE public.family_allergies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "via_member_select" ON public.family_allergies;
DROP POLICY IF EXISTS "via_member_insert" ON public.family_allergies;
DROP POLICY IF EXISTS "via_member_update" ON public.family_allergies;
DROP POLICY IF EXISTS "via_member_delete" ON public.family_allergies;
CREATE POLICY "via_member_select" ON public.family_allergies FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.family_members fm WHERE fm.id = family_allergies.family_member_id AND fm.user_id = auth.uid()));
CREATE POLICY "via_member_insert" ON public.family_allergies FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.family_members fm WHERE fm.id = family_allergies.family_member_id AND fm.user_id = auth.uid()));
CREATE POLICY "via_member_update" ON public.family_allergies FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.family_members fm WHERE fm.id = family_allergies.family_member_id AND fm.user_id = auth.uid()));
CREATE POLICY "via_member_delete" ON public.family_allergies FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.family_members fm WHERE fm.id = family_allergies.family_member_id AND fm.user_id = auth.uid()));

-- family_medications (family_members join ile)
ALTER TABLE public.family_medications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "via_member_select" ON public.family_medications;
DROP POLICY IF EXISTS "via_member_insert" ON public.family_medications;
DROP POLICY IF EXISTS "via_member_update" ON public.family_medications;
DROP POLICY IF EXISTS "via_member_delete" ON public.family_medications;
CREATE POLICY "via_member_select" ON public.family_medications FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.family_members fm WHERE fm.id = family_medications.family_member_id AND fm.user_id = auth.uid()));
CREATE POLICY "via_member_insert" ON public.family_medications FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.family_members fm WHERE fm.id = family_medications.family_member_id AND fm.user_id = auth.uid()));
CREATE POLICY "via_member_update" ON public.family_medications FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.family_members fm WHERE fm.id = family_medications.family_member_id AND fm.user_id = auth.uid()));
CREATE POLICY "via_member_delete" ON public.family_medications FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.family_members fm WHERE fm.id = family_medications.family_member_id AND fm.user_id = auth.uid()));

-- linked_accounts (parent_user_id + linked_user_id)
ALTER TABLE public.linked_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "either_select" ON public.linked_accounts;
DROP POLICY IF EXISTS "parent_insert" ON public.linked_accounts;
DROP POLICY IF EXISTS "parent_update" ON public.linked_accounts;
DROP POLICY IF EXISTS "parent_delete" ON public.linked_accounts;
CREATE POLICY "either_select" ON public.linked_accounts FOR SELECT USING (auth.uid() = parent_user_id OR auth.uid() = linked_user_id);
CREATE POLICY "parent_insert" ON public.linked_accounts FOR INSERT WITH CHECK (auth.uid() = parent_user_id);
CREATE POLICY "parent_update" ON public.linked_accounts FOR UPDATE USING (auth.uid() = parent_user_id OR auth.uid() = linked_user_id) WITH CHECK (auth.uid() = parent_user_id OR auth.uid() = linked_user_id);
CREATE POLICY "parent_delete" ON public.linked_accounts FOR DELETE USING (auth.uid() = parent_user_id);

-- referral_records (doctor_id + patient_id)
ALTER TABLE public.referral_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "either_select" ON public.referral_records;
DROP POLICY IF EXISTS "system_insert" ON public.referral_records;
CREATE POLICY "either_select" ON public.referral_records FOR SELECT USING (auth.uid() = doctor_id OR auth.uid() = patient_id);
CREATE POLICY "system_insert" ON public.referral_records FOR INSERT WITH CHECK (auth.uid() = patient_id);

-- content_embeddings (public read-only)
ALTER TABLE public.content_embeddings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read" ON public.content_embeddings;
CREATE POLICY "public_read" ON public.content_embeddings FOR SELECT USING (true);

-- guest_queries (service_role only)
ALTER TABLE public.guest_queries ENABLE ROW LEVEL SECURITY;

-- sentry_errors (service_role only)
ALTER TABLE public.sentry_errors ENABLE ROW LEVEL SECURITY;


-- ═══════════════════════════════════════════════════════════════════
-- BÖLÜM 7: USER_ID INDEX'LERİ (Performans)
-- ═══════════════════════════════════════════════════════════════════

DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY[
    'active_profile_sessions', 'allergy_intolerance_records', 'allergy_reaction_log',
    'analytics_events', 'blood_tests', 'bot_messages', 'bot_subscriptions',
    'calendar_events', 'consent_records', 'contraceptive_records', 'cycle_records',
    'daily_check_ins', 'daily_logs', 'family_members', 'fhir_export_log',
    'health_metrics', 'integration_connections', 'mood_records', 'nutrition_records',
    'pain_records', 'proms_responses', 'query_history', 'rehab_daily_log',
    'rehab_programs', 'side_effect_reports', 'sleep_records', 'sos_events',
    'user_allergies', 'user_badges', 'user_medications', 'vaccination_records',
    'verification_audit_log', 'verification_documents', 'vital_records', 'water_intake'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON public.%I (user_id)', 
                   'idx_' || t || '_user_id', t);
  END LOOP;
END $$;


-- ═══════════════════════════════════════════════════════════════════
-- BÖLÜM 8: FOREIGN KEY'LER (Family ilişkileri)
-- ═══════════════════════════════════════════════════════════════════

-- family_members → user_profiles
ALTER TABLE public.family_members DROP CONSTRAINT IF EXISTS family_members_user_id_fkey;
ALTER TABLE public.family_members ADD CONSTRAINT family_members_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;

-- family_members → family_groups
ALTER TABLE public.family_members DROP CONSTRAINT IF EXISTS family_members_group_id_fkey;
ALTER TABLE public.family_members ADD CONSTRAINT family_members_group_id_fkey 
  FOREIGN KEY (group_id) REFERENCES public.family_groups(id) ON DELETE CASCADE;

-- family_allergies → family_members
ALTER TABLE public.family_allergies DROP CONSTRAINT IF EXISTS family_allergies_family_member_id_fkey;
ALTER TABLE public.family_allergies ADD CONSTRAINT family_allergies_family_member_id_fkey 
  FOREIGN KEY (family_member_id) REFERENCES public.family_members(id) ON DELETE CASCADE;

-- family_medications → family_members
ALTER TABLE public.family_medications DROP CONSTRAINT IF EXISTS family_medications_family_member_id_fkey;
ALTER TABLE public.family_medications ADD CONSTRAINT family_medications_family_member_id_fkey 
  FOREIGN KEY (family_member_id) REFERENCES public.family_members(id) ON DELETE CASCADE;


-- ═══════════════════════════════════════════════════════════════════
-- BÖLÜM 9: DUPLICATE POLICY TEMİZLİĞİ
-- ═══════════════════════════════════════════════════════════════════

-- Eski Türkçe/İngilizce isimli policy'ler (session'da duplicate'a neden olmuştu)
DO $$
DECLARE
  old_policies TEXT[] := ARRAY[
    'Users can view own profile', 'Users can insert own profile',
    'Users can update own profile', 'Users can delete own profile',
    'Users can insert own events', 'Users can insert own blood tests',
    'Users can view own blood tests', 'Users can delete own calendar events',
    'Users can insert own calendar events', 'Users can view own calendar events',
    'Users can update own calendar events', 'Users can insert own consent records',
    'Users can view own consent records', 'Users can delete own check-ins',
    'Users can insert own check-ins', 'Users can view own check-ins',
    'Users can update own check-ins', 'Users can delete own daily logs',
    'Users can insert own daily logs', 'Users can view own daily logs',
    'Users can update own daily logs', 'Doctors can insert patients',
    'Doctors can view own patients', 'Doctors can update patients',
    'Users insert own metrics', 'Users see own metrics',
    'Users can delete own pain records', 'Users can insert own pain records',
    'Users can view own pain records', 'Users can update own pain records',
    'Users can insert own queries', 'Users can view own queries',
    'Users can update own queries', 'Users can insert reports',
    'Users can view own reports', 'Users can delete own allergies',
    'Users can insert own allergies', 'Users can view own allergies',
    'Users can update own allergies', 'Users can insert own badges',
    'Users can view own badges', 'Users can delete own medications',
    'Users can insert own medications', 'Users can view own medications',
    'Users can update own medications', 'Users insert own documents',
    'Users view own documents', 'Users can delete own vital records',
    'Users can insert own vital records', 'Users can view own vital records',
    'Users can update own vital records', 'Users can delete own water intake',
    'Users can insert own water intake', 'Users can view own water intake',
    'Users can update own water intake',
    'fg_delete', 'fg_insert', 'fg_select', 'fg_update',
    'fm_admin', 'fm_owner', 'fm_pending', 'fm_self_select',
    'fm_self_update', 'fm_accept'
  ];
  p TEXT;
  tbl TEXT;
BEGIN
  -- Bu policy'ler farklı tablolarda olabilir, DROP IF EXISTS güvenli
  FOREACH p IN ARRAY old_policies LOOP
    FOR tbl IN 
      SELECT tablename FROM pg_policies 
      WHERE schemaname = 'public' AND policyname = p
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p, tbl);
    END LOOP;
  END LOOP;
END $$;


-- ═══════════════════════════════════════════════════════════════════
-- BÖLÜM 10: SCHEMA CACHE YENİLE
-- ═══════════════════════════════════════════════════════════════════

NOTIFY pgrst, 'reload schema';


-- ═══════════════════════════════════════════════════════════════════
-- DOĞRULAMA SORGULARI (Sonuçları kontrol et)
-- ═══════════════════════════════════════════════════════════════════

-- 1. Tüm tablolarda RLS açık mı?
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = false
ORDER BY tablename;
-- Beklenen: BOŞ (tüm tablolar RLS açık)

-- 2. Duplicate policy var mı?
SELECT tablename, cmd, COUNT(*) as count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename, cmd
HAVING COUNT(*) > 1
ORDER BY tablename;
-- Beklenen: BOŞ veya sadece bilinen istisnalar (family_notifications)
