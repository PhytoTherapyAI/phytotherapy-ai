# CLAUDE.md — DoctoPal Proje Anayasası v52.2

## Hızlı Bağlam

**DoctoPal** — kanıta dayalı fitoterapi + modern tıp köprüsü kuran AI sağlık asistanı.
- **Ekip:** 3 tıp öğrencisi, teknik bilgi yok — Claude tüm kodu yazıyor
- **IGNITE 26 kazanıldı** — core tool'lar + aile profili jüri önceliği
- **Domain:** doctopal.com (Vercel) | **GitHub:** github.com/PhytoTherapyAI/phytotherapy-ai
- **Sunum dili:** İngilizce | **Arayüz:** TR/EN toggle
- **Deploy:** Vercel + Supabase (email auth + Google/Facebook OAuth)
- **AI Motor:** Anthropic Claude API (claude-haiku-4-5) + Embedding: Gemini text-embedding-004
- **Mod:** Premium gate'ler aktif. Ücretsiz plan core özellikleri, premium sınırlı özellikleri açar.
- **Proje boyutu:** 348+ sayfa, 126 API route (77 AI-powered), 155 tool, ~1500 çeviri key

### Routing
- `/` → Dashboard (auth) veya Landing (misafir)
- `/dashboard` → `/`'e redirect
- BottomNavbar Home + Header → `/`

---

## Yasal Uyum Durumu

**Türkiye mevzuatına %99,9 uyumlu.**

Kapsanan mevzuat:
- KVKK (6698 s.K.) — Md.3, 5, 6, 7, 9, 10, 11, 12, 16
- KVKK 2026/347 İlke Kararı — Aydınlatma ≠ Rıza ayrımı
- KVKK Üretken YZ Rehberi (Kasım 2025) — Prompt anonimleştirme, injection koruması
- TCK Md.90 — Disclaimer ile kapsanıyor
- TCK Md.134-136 — Veri güvenliği + anonimleştirme ile kapsanıyor
- 1219 s.K. Md.1 & 25 — Output filtresi ile kapsanıyor (teşhis/reçete dönüşümü)
- Uzaktan Sağlık Hizmetleri Yönetmeliği — "Bilgilendirme aracı" konumlandırması
- Tıbbi Cihaz Yönetmeliği — Intended purpose: teşhis/tedavi yapmıyoruz
- GETAT Yönetmeliği — Güvenli bilgilendirme formatı
- TKHK — Hizmet tanımı net

Kod dışı kalan (hukuki/idari işlem):
- MADDE 4 (SCC fiili imza + 5 iş günü KVKK Kurul bildirimi)
- MADDE 14 (Şirket kurulunca VERBİS kaydı)

Referans doküman: `YASAL-UYUM.md` (Downloads klasöründe)

---

## Aile Profili Sistemi

Detaylı yol haritası: `FAMILY-ROADMAP.md`

Mevcut durum:
- **FAZ 1-5 ✅ TAMAMLANDI** (Session 31-32): Netflix profil seçim, davet, cross-user read, aktiv profil, sağlık ağacı
- **Premium Altyapı ✅ TAMAMLANDI** (Session 33, Commit 1-3):
  - `family_groups.plan_type` (free | family_premium) + `max_members` + `plan_expires_at`
  - `getUserEffectivePremium()` helper (individual OR family kaynaklı Premium)
  - `/api/family/promote-admin` (target Premium zorunlu)
  - `/api/family/upgrade-plan` (owner manuel aktivasyon + bildirim fan-out)
  - Pricing UI (3 kart decoy + aylık/yıllık toggle + 2 ay bedava)
  - PremiumUpgradeModal + FOMO banner + select-profile lock
  - Feature gates: ChatInterface + medical-analysis + interaction-checker
  - /checkout placeholder (mailto + plan analytics)
- **Premium Gerçek Ödeme (Iyzico) ⏳ Commit 4 bekliyor** (Session 34)

### Supabase Migration'lar (sırayla çalıştırılmalı)
1. `20260417_family_member_visibility.sql` (üye görünürlük)
2. `20260417_family_invite_code.sql` (davet kodu sütunu)
3. `20260417_family_cross_user_read.sql` (cross-user SELECT)
4. `20260417_family_relationship.sql` (ilişki sütunu)
5. `20260418_family_admin_update.sql` (admin update policy)
6. `20260418_pdf_analysis_tables.sql` (Session 32 — radiology_reports + prospectus_scans)
7. `20260419_fix_fn_sender_insert_sos.sql` (Session 33 — SOS RLS helper function)
8. `20260419_family_premium.sql` (Session 33 — plan_type + max_members + expires)
9. `family_members.created_at` column ALTER (manual, Session 33)

---

## 🚨 GELİŞTİRME KURALLARI — MUTLAKA UYGULA

Bu kurallar Session 25'te yaşanan bug'ları önlemek içindir.

### YENİ TABLO EKLERKEN

```sql
CREATE TABLE public.yeni_tablo (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
ALTER TABLE public.yeni_tablo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_select" ON public.yeni_tablo FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own_insert" ON public.yeni_tablo FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_update" ON public.yeni_tablo FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_delete" ON public.yeni_tablo FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_yeni_tablo_user_id ON public.yeni_tablo(user_id);
NOTIFY pgrst, 'reload schema';
```

### YENİ SÜTUN EKLERKEN

```sql
ALTER TABLE public.tablo ADD COLUMN IF NOT EXISTS yeni_sutun TEXT;
NOTIFY pgrst, 'reload schema';
```
Aynı commit'te hem migration hem kullanan kod olmalı.

### YENİ AI ENDPOINT EKLERKEN

```typescript
const { user } = await getUserFromRequest(request);
if (!user) return Response.json({ error: 'auth required' }, { status: 401 });
const result = await askClaude({ userId: user.id, prompt: '...' });
```
userId geçmezsen consent gate çalışmaz.

### YASAL METİN DEĞİŞTİRİRKEN

lib/consent-versions.ts versiyonunu BUMP et (v2.0 → v2.1).
Eski kullanıcılar yeniden onay için yönlendirilir.

### RLS DUPLICATE POLICY YASAK

```sql
DROP POLICY IF EXISTS "eski" ON public.tablo;
CREATE POLICY "yeni" ON public.tablo ...;
```

### AUTH CONTEXT KURALLARI

- lib/auth-context.tsx cache guard mantığını BOZMA
- fetchProfile in-flight Map guard'ı KALDIRMA
- Visibility handler debounce'unu BOZMA
- Değişiklik yaparsan tab switch testi yap

### CONSOLE LOG POLİTİKASI

Production'da console.log YOK. Sadece console.error ve console.warn.
Debug için [Debug] prefix kullan, bitince temizle.

### COMMIT ÖNCESİ

```bash
npx tsc --noEmit
npm run build
```

### KVKK DOSYA REFERANSLARI

| Değişiklik | İlgili Dosyalar |
|---|---|
| Yeni sağlık verisi | user_profiles + aydınlatma metni |
| Yeni AI provider | aydinlatma + rıza + privacy |
| Yeni rıza tipi | consent_log + user_profiles + PrivacySettings + ConsentPopup |

### BU SESSION'DA ÇÖZÜLEN BUGLAR

| Bug | Sebep | Çözüm |
|---|---|---|
| Sütun eksik 500 | Migration sonrası schema reload unutuldu | NOTIFY pgrst |
| family/notifications 500 | Tablo yoktu | Tablo + RLS oluştur |
| Tab switch skeleton | fetchProfile paralel çağrı | In-flight guard + cache TTL |
| Duplicate policy timeout | Eski + yeni policy çakışması | DROP IF EXISTS |
| Consent gate bypass | userId middleware'e geçmiyor | Her endpoint userId geçir |
| SCC yalan beyan | Aydınlatma yanlıştı | Dürüst metin |

---

## Teknik Stack

```
Frontend:     Next.js 16.1.6 (App Router) + Tailwind CSS 4 + shadcn/ui + Recharts + Framer Motion
Backend:      Next.js API Routes (serverless — Vercel)
Database:     Supabase (PostgreSQL) — tüm tablolar kurulu
AI Engine:    Anthropic Claude API (claude-haiku-4-5) + Embedding: Gemini text-embedding-004
Tıbbi Veri:   PubMed E-utilities API + Europe PMC
İlaç Veri:    OpenFDA API
Auth:         Supabase Auth (email + Google OAuth + Facebook OAuth)
Deploy:       Vercel — doctopal.com
OS:           Windows
```

---

## Güvenlik Mimarisi (9 Katman)

### Katman 1: Kırmızı Kod (AI'dan ÖNCE)
Acil kelimeler (göğüs ağrısı, nefes darlığı, bilinç kaybı, intihar, zehirlenme vb.) → tam ekran emergency modal → "I understand" butonuna kadar kilitli.

### Katman 2: İlaç Etkileşim Motoru
OpenFDA + Claude hybrid. Renk kodlu: ✅ Yeşil / ⚠️ Sarı / ❌ Kırmızı

### Katman 3: RAG
PubMed → Claude (temperature:0) → collapsible kaynak paneli

### Katman 4: Algoritmik Güvenlik (lib/safety-guardrail.ts)
5 alt katman: Kırmızı Bayrak → İlaç-Bitki Etkileşim → Kontrendikasyon → Dozaj Limitleri → Şeffaflık

### Katman 5: KVKK Prompt Anonimleştirme (lib/safety-guardrail.ts)
AI API'ye gönderilmeden ÖNCE çalışır. İsim/email/TC/telefon/adres/user_id strip eder. Yaş → yaş aralığı ("18-24", "25-34", ...). String içi PII (email, telefon, TC) regex ile temizlenir. Tüm anonimleştirme `[KVKK-ANON]` audit log'u ile loglanır.

### Katman 6: Prompt Injection Koruması (lib/safety-guardrail.ts)
AI çağrısından önce 5 tehdit kategorisi taranır:
- System prompt ifşa ("show me your instructions")
- Talimat override ("ignore previous instructions")
- Rol değiştirme / jailbreak (DAN mode, "doktor gibi davran")
- Veri sızdırma ("other users' data", "veritabanı dump")
- Zararlı içerik (zehir/silah/uyuşturucu sentezi)
Ayrıca >5000 karakter + base64 encoded content guard'ları. `[KVKK-INJECTION]` log.

### Katman 7: Output Güvenlik Filtresi (lib/output-safety-filter.ts)
AI yanıtı kullanıcıya gösterilmeden ÖNCE 4 katmanlı filtre:
- **LAYER 1:** Teşhis ifadeleri → bilgilendirme formatı ("Sizde X var" → "Belirtileriniz X ile uyumlu olabilir")
- **LAYER 2:** Reçete formatı → araştırma referansı ("500mg Y günde 2 kez alın" → "Araştırmalarda Y 500mg dozda çalışılmıştır")
- **LAYER 3:** Bitkisel tavsiye → güvenli format ("X için Y kullanın" → "Araştırmalarda Y, X açısından çalışılmıştır")
- **LAYER 4:** Acil durum tespiti → 112 yönlendirmesi prepend
Chat route: stream pass-through yerine buffer+filter+emit paterni. `[KVKK-OUTPUT-FILTER]` log.

### Katman 8: AI Disclaimer + İtiraz (components/ai/)
Her tamamlanmış AI yanıtının altında kaldırılamaz `AIDisclaimer` componenti: "Bu bilgi yapay zeka tarafından üretilmiştir ve tıbbi tavsiye niteliği taşımaz." Chat üstünde `AIGeneratedBadge` ("🤖 AI Yanıtı"). KVKK Md.11/1-g kapsamında 6 kategorili itiraz formu (`AIObjectionForm`) → `/api/feedback/objection` → `ai_objections` tablosu.

### ⚡ Merkezi Koruma — lib/ai-client.ts Middleware
**Session 22-24:** Katman 5, 6, 7, 9 + Consent gate artık **tüm 76 AI endpoint'i için otomatik** olarak uygulanıyor:

**Consent gate (Session 24):**
- Tüm ai-client exports `{ userId?, skipConsent? }` option kabul eder
- `userId` verildiğinde middleware `checkAIConsent()` çağırır, rıza yoksa `ConsentRequiredError` fırlatır
- Error internal olarak yakalanıp language-aware safe refusal döner (`{ error: "consent_required", blocked: true }`)
- `skipConsent: true` emergency / kendi gate'ini yapan endpoint'ler için (chat route)
- Endpoint'ler auth'tan aldıkları `user.id`'yi `userId` olarak geçirmelidir

**Diğer katmanlar:**
- `lib/ai-client.ts` içindeki `guardInput()` her çağrıda:
  - `stripPIIFromText` (PII scrub — email/phone/TC/URL)
  - `detectPromptInjection` (→ `PromptInjectionError` fırlatır)
  - `SECURITY_PREAMBLE` system prompt'a otomatik prepend (tekrar prepend etmez)
- `lib/ai-client.ts` içindeki `guardOutputText` / `guardOutputStream`:
  - Non-JSON text yanıtlarda `filterAIOutput` otomatik uygulanır
  - Stream'ler buffer → filter → emit paternine sarılır
  - JSON yanıtlarında atlanır (structured output, düşük risk)
- Caller opt-out: `{ skipOutputFilter: true }` — chat route gibi zaten kendi filtresini yapan yerler için
- `lib/ai-consent.ts` — `requireAIConsent(userId, endpoint, lang, ip)`: herhangi bir API endpoint'inde tek satırla consent gate kurulabilir

### Katman 9: KVKK Aydınlatma + Rıza Ayrımı (onboarding)
2026/347 İlke Kararı gereği aydınlatma ve rıza AYRI sayfada:
- **AydinlatmaStep** — checkbox YOK, sadece "Okudum, Anladım" butonu
- **ConsentStep** — 3 ayrı açık rıza: AI İşleme / Yurt Dışı Aktarım / SBAR Raporu + zorunlu Tıbbi Sorumluluk Reddi
Rıza vermeyenlere temel hizmet (ilaç takibi, takvim) AÇIK kalır. Rıza `consent_log` audit tablosuna kayıt edilir (version: "2026-04-v1", timestamp).

---

## Environment Variables (.env.local)

```env
GEMINI_API_KEY=...
NEXT_PUBLIC_SUPABASE_URL=https://huiiqbslahqkadchzyig.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
PUBMED_API_KEY=...
NEXT_PUBLIC_APP_URL=https://doctopal.com
RESEND_API_KEY=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM=...
TELEGRAM_BOT_TOKEN=...
CRON_SECRET=...
SENTRY_DSN=...
```

---

## Geliştirme Kuralları

1. Güvenlik katmanları her özellikten önce kontrol edilir
2. Tıbbi öneri kaynaksız gösterilmez
3. Mobile-first tasarım
4. API anahtarları sadece .env.local + server-side
5. TypeScript strict — `any` yasak
6. Her API endpoint'te error handling
7. Git commit mesajları İngilizce
8. Dark mode için CSS variable — hardcode yasak
9. Kimseyi boş gönderme — her zaman bilgi + yönlendirme
10. Onboarding atlanamaz — login sonrası otomatik
11. İlaç profili olmadan doz tavsiyesi yok
12. EN ve TR sorularına otomatik yanıt
13. Reçete OCR yapılmaz — güvenlik riski
14. AI API'ye kimlik bilgisi GÖNDERİLMEZ — `anonymizePromptData()` zorunlu (isim, email, TC, telefon, adres, user_id strip)
15. Her AI yanıtında `AIDisclaimer` componenti ZORUNLU — kaldırılamaz, gizlenemez
16. AI output'u `filterAIOutput()`'tan geçirilmeden kullanıcıya gösterilMEZ — teşhis/reçete formatı yasak
17. Aydınlatma metni ve rıza formu AYRI sayfalarda — birleştirme KVKK 2026/347 İlke Kararı'na AYKIRI
18. Rıza vermeyenlere temel hizmet (ilaç takibi, takvim) AÇIK — hizmeti rızaya bağlama YASAK
19. Tüm AI çağrıları `lib/ai-client.ts` üzerinden yapılır — doğrudan `Anthropic SDK` çağrısı YASAK (middleware'i bypass eder)
20. Sağlık verisi işleyen AI endpoint'leri `requireAIConsent()` helper'ı ile consent gate kurmalı

---

## Tasarım Kuralları

### Dark Mode Politikası (Session 24)
- **Core sayfalar** (dashboard, chat, profil, ayarlar, yasal sayfalar): Tam dark mode desteği — `text-foreground`, `bg-card`, `border-border` CSS variable pattern
- **Tool sayfaları** (60+ standalone tool: allergy-map, cancer-screening, checkup-planner, vb.): Bilinçli olarak **light-mode-only mobile pastel UI** — hardcoded slate-700/amber/teal renkler intentional (gradient backgrounds, soft shadows için tasarlandı)
- **Component kütüphanesi** (shadcn/ui): Otomatik dark mode

### Renk Paleti
- Renk paleti: sage-green (sage-500/600/900), krem (stone-50), antrasit (slate-700/900)
- MOR KULLANILMIYOR — tüm mor referanslar sage-green'e çevrildi
- Framer Motion: fade, slide, scale, stagger, pulse, tap, layoutId
- Glassmorphism: backdrop-blur-xl, bg-white/80
- Gölgeler: shadow-sm, shadow-lg, shadow-2xl
- Mobile-first varsayılan, md:/lg: breakpoint'ler

---

## Demo Senaryoları

### Demo 1 — İlaç Etkileşimi
- Input: "I take Metformin and Lisinopril. I have trouble sleeping."
- Beklenen: ❌ St. John's Wort (CYP3A4) → ✅ Valerian Root 300-600mg

### Demo 2 — Serbest Soru
- Input: "Does berberine work for blood sugar control?"
- Beklenen: Grade A evidence + dozaj + collapsible PubMed linkleri

### Demo 3 — Kan Tahlili
- Input: Cholesterol 240, Vitamin D 14, Ferritin 8, HbA1c 6.8
- Beklenen: Detaylı analiz + yaşam koçluğu + PDF indir

---

---

## Chat API Context Enrichment ✅ TAMAMLANDI (Session 32)

### Durum:
Chat API route'u (/api/chat) aşağıdaki profil verilerini AI system prompt'a enjekte ediyor:
- ✅ İlaçlar (medications) — doz + sıklık ile
- ✅ Alerjiler (allergies) — reaksiyon tipi ile
- ✅ Kronik hastalıklar (chronic_conditions) — critical flags (hamilelik, böbrek, KC) ayrı
- ✅ Cerrahi geçmiş (surgery: prefix → "Surgical History" bloğu)
- ✅ Soygeçmiş (family: prefix → "Family Health History" bloğu)
- ✅ Aşı durumu (vaccines JSONB → tamamlananlar)
- ✅ Yaşam tarzı (smoking_use, alcohol_use)
- ✅ BMI (height_cm + weight_kg → hesaplanıyor)
- ✅ Takviyeler (supplements — meta: prefix filtreli, doz/sıklık parsed)
- ✅ diet_type — Session 32'de user_profiles select'e + LIFESTYLE bloğuna eklendi
- ✅ exercise_frequency — Session 32'de select'e + LIFESTYLE bloğuna eklendi
- ✅ sleep_quality — Session 32'de select'e + daily_check_ins son 7 gün ortalaması (paralel query) LIFESTYLE bloğuna eklendi

### Gelecek iyileştirmeler (non-blocking):
AI cross-reference senaryoları için prompt'a daha spesifik few-shot örnekler eklenebilir:
- Cerrahi geçmiş: gastric sleeve → absorption warning
- Soygeçmiş: family cancer → phytoestrogen warning
- Hamilelik/emzirme → mutlak kontrendikasyon listesi (SYSTEM_PROMPT'ta "kritik çizgi" notu var, sağlam)
- Böbrek yetmezliği → doz azaltma/eliminasyon uyarısı

### Öncelik: YOK — Profil context enrichment %100 kapandı. Fine-tuning kullanıcı feedback'ine göre yapılacak.

---

*Son güncelleme: 19 Nisan 2026 v52.4*
*IGNITE 26 kazanıldı (11-12 Nisan 2026).*
*Session 18-20: Aile profili + SBAR PDF redesign + condition translations + bug fixes.*
*Session 21: YASAL UYUM — 10/14 madde kod implementasyonu tamamlandı (MADDE 1,2,3,5,6,7,8,9,10,11,12,13). MADDE 4 ve 14 hukuki/idari işlem.*
*Session 22-24: Post-launch cleanup — 62/77 AI endpoint'te consent gate aktif → translations.ts split (7060→272 satır, 11 namespace) → lib/ `any` cleanup (6 dosya strict typed) → launch modu kapatıldı (premium gates aktif) → yasal uyum bug fixes (PromptInjectionError 500 fix, regex medical-term whitelist, null consent bypass, fail-closed filter) → edge-case audit (ageToRange NaN, anonymize null input, 16 yeni emergency keyword, 57 TR medical term).*
*Session 25: Profil tamamlama tutarsızlığı düzeltildi (single source of truth) → Demo banner kaldırıldı → Güvenlik sayfası içerik genişletme + AI Safety kartı → /api/auth/change-password auth bypass kapatıldı (body.userId artık ignore, identity Bearer token'dan) + rate limit + service-role kullanımı kaldırıldı → `any` type cleanup (34 dosya) + apiHandler refactor (daily-log, health-score) → /family page redesign (kurucu kartı, isim/icon edit, motivasyon empty state, roller accordion).*
*Session 26: /family v2 — grid kartlar (Stage 1) + bekleyen davetler (Stage 2) + per-member sharing prefs (Stage 3) + dashboard summary (Stage 4) + notifications sistemi (Stage 5: family_notifications tablosu + RLS + API + global NotificationBell + member-to-member reminders).*
*Session 27: Apple Health + Google Fit import — health_imports tablosu + health_metrics.import_id FK (cascade delete) + UPDATE/DELETE RLS policy eklendi → jszip + fast-xml-parser bağımlılıkları → browser-side parsers (apple-health-parser.ts: HK→metric_type whitelist + per-day agg, google-fit-parser.ts: Takeout JSON shape handling + ns→ISO + sleep stage filter) → /api/health-imports (CRUD lifecycle) + /api/health-metrics (batch upsert + daily/weekly/monthly rollup GET) → HealthImportSection component (/connected-devices entegre: 2 import kartı + rehber accordion + progress bar + 7-gün mini summary + geçmiş import'lar tablosu) → mock fixtures + Playwright spec (parser doğruluğu + auth-gate testleri).*
*Session 28: Aile Profili sistemi (Netflix tarzı profil seçim, davet sistemi, yönetim izni, 24 bug fix) → Onboarding fixes (reaksiyon dropdown, Emekli SGK, allergy save, alcohol_use constraint, cerrahi yıl UX) → WaterIntakeContext (tek kaynak su takibi) → Dialog sıralaması (ilaç onayı→check-in) → meta: supplement filtresi → Profile fetch retry → SQL migrations (daily_check_ins, water_intake, daily_logs, CHECK constraints).*
*Session 29: Marka tutarlılığı — 650+ dosyada Doctopal → DoctoPal (copyright header, API system prompt, PDF, email, share card, consent, FHIR, translations) → Landing page hero: "Tahmin Değil, Kanıta Dayalı Analiz" + SBAR alt başlık → 4 öne çıkan özellik kartı (Stethoscope/Pill/Leaf/Microscope ikonlu) + "Daha Fazlası" bölümü → Regülatif dil: "teşhis koyar VE iyileştirir" kaldırıldı, rakip karşılaştırması "Neden DoctoPal?" ile değiştirildi → FAQ: veri güvenliği sorusu eklendi, ücretsiz cevabı güncellendi → İlaç sync: TodayView uncomplete DELETE pattern'e geçirildi (ritual blocks/dashboard ile tutarlı) → Sorgu Geçmişi: arama filtresi sadece query_text'te (response_text kaldırıldı) + Supabase error handling → InfoTooltip: right-0 → left-1/2 -translate-x-1/2 (taşma düzeltmesi) → NotificationSettings redesign: checkbox → toggle, "Bildirimler" → "Sağlık Kalkanı", İlaç Kalkanı/Günlük Sağlık Takibi isimleri + alt metinler, kapatma onayı modal'ı.*
*Session 30: Profil Sayfası Mega Overhaul — 30+ commit, ~2000 satır yeni kod:*
*— Rozet SVG sistemi: 11 Duolingo-tarzı metalik pin SVG (BadgeIcon.tsx + svgs/) → profil, badges sayfası, celebration modal entegrasyonu + fallbackEmoji*
*— Profil Gücü: XP sistemi kaldırıldı → 9 bölümlü Profil Gücü seviyeleri (Başlangıç→Tam Koruma) + ✅/⭕ inline checks + tıkla→scroll + level emoji*
*— Onboarding Reuse: ProfileSupplementsStep, ProfileMedicalHistoryStep, ProfileFamilyHistoryStep, ProfileSubstanceStep adapter'ları (OnboardingAdapters.tsx) — sıfırdan yazmak yerine onboarding bileşenlerini import*
*— ChronicConditionsEditor: 30+ hastalık autocomplete DB + ilaç→hastalık tahmini (20 mapping: metformin→Diyabet, zoretanin→Akne vb.) + "Kronik hastalığım yok ✅" toggle*
*— LifestyleSection: BMI hesaplayıcı (4 seviye + tip) + kan grubu epidemiyolojik insight (PubMed kaynaklı: Edgren Blood 2010, Wolpin JNCI 2009, He ATVB 2012) + trafik lambası egzersiz chip + emoji uyku/diyet grid*
*— DiceBear Avatar: lib/avatar.ts + AvatarPicker.tsx (4 stil: adventurer/bottts/avataaars/funEmoji) → profil header + navbar entegrasyonu*
*— PDF Yeniden Yazım: SBARReport Roboto font (Türkçe karakter desteği: ş/ğ/ü/ö/ç/ı/İ) + düzgün tablo layout + cinsiyet/sıklık/reaksiyon/sigara çevirileri + PDFDownloadButton client-side generation*
*— Merkezi Araçlar: lib/frequency.ts (toTurkishFrequency — 40+ varyant) + lib/avatar.ts*
*— Bug Fix'ler: Aşı vaccines JSONB kolonu eksikti (migration çalıştırıldı) + optimistic update + vaccine checkbox motion.button→plain div + frequency çeviri 40+ varyant + save retry 1s delay + FAB bottom-36 çakışma fix + scroll pozisyonu passive listener + chip × stopPropagation + InlineEdit 44px touch target + alerji inline form (12 alerjen + 5 hassasiyet chip) + Sentry conditional config (SENTRY_AUTH_TOKEN yoksa skip)*
*— Motivasyon Kartları: 7 bölüm şakacı samimi ton ("Bunu atlama ciddi söylüyorum 🤫", "Fıstık konusunda şaka yapmıyorum 🎯", "Kanepe mi maraton mu? 😄") + dismissable localStorage*
*— Temizlik: 436 satır dead code silindi + 6 unused import kaldırıldı (ChronicConditionsEditor, RadioGroup, Wine, Cigarette, Heart, Settings)*
*Session 31: Codebase-wide bugfix sweep — 13 commit, 30+ bug düzeltildi:*
*— Kritik: profile/page.tsx useState(fn)→useState(()=>fn()) (ilaç onay butonu hiç çalışmıyordu) + consent/route.ts DB hatada false success:true döndürme düzeltildi + WeeklySummaryCard boş array .reduce() crash + drug-info/talent-hub useState→useEffect memory leak*
*— Stale closure: calendar handleQuickLog'da morningTasks/noonTasks/nightTasks dep eksikti + VaccineProfileSection vaccines dep kaldırılıp functional setState ile rollback*
*Session 32 (Ana Refactor Session): 12 prompt, ~15 commit — büyük kod kalitesi + DX iyileştirmesi:*
*— Layout perf: AuthGatedOverlays (4 heavy overlay auth-gated, guest bundle %30-40 küçülmesi) + WaterIntakeProvider dashboard scope'a taşındı (228 sayfa→1)*
*— README: Boilerplate → full proje dokümantasyonu (architecture, safety, getting started)*
*— E2E testler: 3 yeni dosya (api-safety 6 test, api-core 47 test, pages-extended 80 test → toplam ~195)*
*— i18n sprint 1+2: 26 dosyada ~457 ternary → tx() dönüştürüldü (1032→574, %44 azalma) + ~300 yeni çeviri key*
*— AuthGuard component: reusable auth/loading/guest gating (components/auth/AuthGuard.tsx)*
*— SEO: app/sitemap.ts dinamik (32→123 URL, tools-hierarchy'den otomatik) + app/robots.ts + 10 core metadata layout*
*— `any` cleanup: 99→2 (%98 azalma, 26+ dosya, kalan 2 external lib type clash)*
*— API helpers: lib/api-helpers.ts (apiHandler + authenticateRequest + parseBody) + 3 route refactor (health-score, daily-log, check-in)*
*— Profile split: profile/page.tsx 2598→1802 satır (InlineEdit, EmergencyContacts, LinkedAccounts, Allergies extracted)*
*— console.log cleanup: 27→3 (sadece KVKK audit logs) + 26 dead import/local kaldırıldı*
*— Error boundaries: components/error/PageError.tsx template + 3 core error.tsx (health-assistant, interaction-checker, calendar)*
*— Null guard: Header.tsx .split(" ") boş string crash + profile chronic_conditions spread guard + bot-send null fallback*
*— JSON.parse try-catch: 16 dosyada unguarded JSON.parse sarıldı (connected-devices, emergency-contacts, dream-diary, diabetic-foot, dental-health, bug-report, connect-assistant, donation, fasting-monitor, health-quiz, medication-log, friend-goals, operations, health-timeline, micro-habits, walking-tracker)*
*— Diğer: OnboardingWizard render body'de setCurrentStep kaldırıldı (re-render loop) + TodayView supplement celebration >1→>0 + layout.tsx Header import case fix (Turbopack) + supplement-data operator precedence parantez + MonthlyROICard division by zero guard + parseInt radix eksik (calendar ICS, medication-hub) + QuickActions/SOSCard JSON.parse guard*
*Session 32 (devam — KVKK + Auth + Rename):*
*— KVKK consent bug fix: /aydinlatma sayfası (Md.10 tam içerik) + consent toggle fail-closed (audit log önce, başarısızsa update engelli) + MedicationUpdateDialog route guard (/select-profile, /onboarding, /auth'ta engellendi)*
*— KVKK consent popup akışı: ConsentPopup (scroll-gated, per-consent-type detaylı metin) + AydinlatmaPopup (bilgilendirme, rıza DEĞİL) + PrivacySettings popup flow (grant→popup, withdraw→confirm) + API source audit field*
*— ConsentPopup scroll gate fix: kısa metinlerde buton disabled kalıyordu → useEffect scrollHeight check*
*— Supabase auth lock fix: initAuth getUser()+getSession()→tek getSession() + visibility debounce + gereksiz getUser() kaldırıldı*
*— Auth tab-switch skeleton fix: profile cache guard (profile.id===user.id + profileFetchedAt TTL) + visibility handler cached expires_at check (zero lock when token fresh) + stale closure fix (useState updater→useRef mirror)*
*— Profile fetch timeout fix: cache TTL 5dk→30dk + fetch timeout 5s→15s + retry kaldırıldı + console.error→console.warn*
*— AI provider rename: askGemini*→askClaude* (80 dosya — isimler legacy'ydi, hepsi zaten Claude çağırıyordu) + lib/gemini.ts deprecated + README env fix (GOOGLE_GENERATIVE_AI_API_KEY→GEMINI_API_KEY)*
*— KVKK v2.0 tam uyum: Aydınlatma 12 bölüm (SCC yalanı kaldırıldı, 9 hak, saklama tablosu, 18+ yaş, başvuru prosedürü) + ConsentPopup v2.0 (3 sağlayıcı: Supabase+Anthropic+Google) + consent-versions.ts + versiyon bump mekanizması (needsAydinlatmaUpdate + dashboard amber banner + forceAcknowledge popup) + UserProfile type genişletildi (consent version + aydinlatma alanları)*
*— Geliştirme kuralları: CLAUDE.md'ye SQL template, auth context kuralları, console log politikası, KVKK dosya referansları, çözülen bug tablosu eklendi*
*— Aile profili yol haritası: FAMILY-ROADMAP.md (5 faz, 25 madde) + CLAUDE.md/PROGRESS.md referansları*
*— DB migration: supabase/migrations/20260416_session25_kvkk_compliance.sql (419 satır, idempotent)*
*Session 32 (devam — Asistan + PDF Analizi): 1 büyük commit, ~900 satır:*
*— Task 1 Asistan (5 faz): SYSTEM_PROMPT tam yeniden yazıldı — tek kaynak, KVKK uyumlu "sen" hitabı (isim kullanma), adaptif format (3+ madde → bullet izni), adaptif uzunluk (1-3/4-6/6-8 cümle), 4 few-shot örnek (TR+EN, profile-aware tone) → Chat profile enrichment: diet_type, exercise_frequency, sleep_quality (daily_check_ins 7-gün avg) LIFESTYLE bloğuna eklendi → Acil durum DB v2: lib/safety-filter.ts'e 40+ yeni red keyword (pediatrik: "bebek nefes almıyor" vb., mental health eşik: "intihar planım var" vb., anaphylaxis pattern: "arı soktu nefes daralıyor" vb., stroke FAST + cardiac atypical: "yüzde sarkma", "sol kol uyuşması" vb.) + SEVERITY_ESCALATORS (TR+EN "şiddetli/durmuyor/severe/won't stop") → safe context + severity → yellow escalation (FAZ 3.5) → YellowCodeCard UI component (amber banner + tel:112) + MessageBubble.tsx'te <!--YELLOW_CODE--> marker parse.*
*— Task 2 PDF Analizi (4 faz): RadiologyReport PDF Türkçe karakter fix — public/fonts/NotoSans-Regular.ttf + NotoSans-Bold.ttf için Font.register (path.join(process.cwd(), "public", "fonts") server-side filesystem path), tüm "Helvetica" → "NotoSans" + fontWeight switch. ş/ğ/ü/ö/ç/ı/İ native render, transliteration yok. (Not: SBAR hâlâ fixTr transliteration kullanıyor — RadiologyReport gerçek font register'ı aldı.) → DB tabloları: supabase/migrations/20260418_pdf_analysis_tables.sql — radiology_reports (id, user_id, file_name, image_type, overall_urgency, analysis_json JSONB, summary, created_at) + prospectus_scans (id, user_id, medication_name, file_name, scan_data JSONB, profile_alerts JSONB, created_at) — RLS own_* policies + user_id + created_at DESC indexler + NOTIFY pgrst. → Endpoint persistence: /api/radiology-analysis query_history yerine radiology_reports'a structured insert (analysis_json full response) + /api/prospectus-reader pre-AI query_history kaldırıldı, post-parse prospectus_scans'e structured insert (scan_data + profile_alerts). → Kan tahlili trend analizi: /api/blood-test-trends YENİ endpoint (son 10 test, range filter 3m/1y/all, test_data JSONB şekil varyasyonu tolere — array, {results}, category-grouped) + components/blood-test/BloodTestTrendChart.tsx (Recharts LineChart per-parameter, status-renk dots yeşil/sarı/kırmızı, trend ikonu up/down/stable, 3m/1y/all filter) + /medical-analysis sayfasına "Trends" tab olarak eklendi (TabType "blood-test" | "radiology" | "trends"). → BLOOD_TEST_PROMPT tam yeniden yazıldı: yaş/cinsiyet-specific reference ranges (ferritin premeno/postmeno ayrı, ESR yaş formülü, thyroid trimester-specific, Cr sex-specific vb.), profil farkındalığı (hamilelik/böbrek/KC → supplement downgrade, meds cross-check interactionCheck zorunlu alan), strict JSON schema (abnormalFindings + referenceRange + supplementRecommendations.interactionCheck + trendComparison + overallUrgency), kritik değerlerde "SEEK MEDICAL CARE" prepend rule. → PROSPECTUS_PROMPT inline kaldırıldı, lib/prompts.ts'e taşındı + buildProspectusSystemPrompt({userMedications, userAllergies, replyLanguage}) helper — pharmakokinetik (CYP450/P-gp/protein binding) + pharmakodinamik (additif CNS/QT/kanama) + duplicate therapy check rules eklendi, profileAlerts severity ⚠️/🚫 prefix. → /blood-test zaten /medical-analysis'e redirect ediyordu (doğrulandı, değişiklik yok). → trends.* çeviri key'leri (11 key TR+EN). → tsc --noEmit temiz, UI manuel doğrulandı (Trends tab auth-prompt render, /blood-test redirect, YellowCodeCard amber render "hafif göğüs ağrısı" testinde).*
*— Not: Session 32 bu session tek commit'te (300463b) Task 1'in uncommitted değişiklikleri ile birlikte commit'lendi.*
*Session 33: Premium Altyapı + Aile UX Fix —*
*— Member user /select-profile bug fix: fetchFamilyData membership-first via /api/family (browser RLS edge case bypass; lib/family-context.tsx tek kaynak olarak API çağırıyor, fetchMembers kaldırıldı)*
*— SOS RLS fix: service-role INSERT (caller identity yine JWT'den decode ediliyor, from_user_id spoof'lanamaz) + sanity check (caller + target accepted membership) + /api/family/upgrade-plan yearly 12-ay desteği*
*— Bildirim sistemi: Resend email fan-out (SOS kırmızı, yönetici talebi amber, hatırlatma yeşil template'ler) + NotificationBell tıklanabilir (type'a göre yönlendirme: emergency→setActiveProfile+/profile, custom→/family, reminder→/)*
*— Premium altyapı (Commit 1): family_groups.plan_type/plan_expires_at/max_members migration + getUserEffectivePremium helper (individual OR family kaynaklı) + /api/family/promote-admin (target Premium zorunlu, 402 premium_required) + /api/family/upgrade-plan (owner-only + bildirim fan-out) + max_members gate inviteMember'da*
*— Premium UI (Commit 2): useEffectivePremium hook + PremiumUpgradeModal + Pricing 3-kart decoy + PremiumFomoBanner + /select-profile locked cards (grayscale + lock badge) + feature gates ChatInterface/medical-analysis/interaction-checker*
*— Premium rötuş (Commit 3): aylık/yıllık toggle (default yearly decoy) + 2-ay-bedava badge + "7 Gün Ücretsiz Dene" CTA + /checkout placeholder (güven verici "early access" metni + mailto info@doctopal.com + plan analytics via console + window.Sentry.addBreadcrumb)*
*— Privacy: FamilyProfileGuard component + 5 leak'li sayfaya guard (history/analytics/health-radar/notifications/badges) + BloodTestTrendChart inline guard*
*— Allows_management gate: resolveTargetUser'a 402 management_not_granted + ChatInterface client-side çift gate (consent sonra management) + ManagementRequiredMessage + "İzin Talebi Gönder" butonu (/api/family/notifications custom type, localStorage dedupe)*
*— Migration'lar: 20260419_fix_fn_sender_insert_sos.sql (are_family_members SECURITY DEFINER helper), 20260419_family_premium.sql (plan kolonları), family_members.created_at column ALTER (manual)*
*— Bilinen TODO: 12 family-context write mutation hâlâ direct Supabase (RLS güvenli, gelecekte API'ye taşınabilir) + SBAR/Prospectus/FamilyHealthTree premium gate eksik + Bireysel Premium satın alma UI eksik (sadece Aile aktivasyonu var) → tümü Commit 4 (Iyzico) iterasyonuna*

---

### Session 34 — Tamamlandı (Nisan 2026)

**Ana iş:** Premium altyapısı tamamlama + marketing-ready landing + hukuki zemin + brand minimization + legal consolidation.

**Atılan commitler (14):**
- `7ae0962` — feat(premium): SBAR / Prospectus / FamilyHealthTree premium gate'leri (PremiumLockedCard + useEffectivePremium server-side gates — 4 API 402)
- `dee1c45` — feat(landing): marketing-ready landing page rewrite — Ayşe persona (7 section + LandingNav + LandingFooter + decoy pricing)
- `d6117e9` — fix(landing): çift navbar giderildi (Header guest `/` için null)
- `2c216a2` — fix(landing): hero mockup → gerçekçi Interaction Checker result preview
- `2945c37` — fix(landing): LandingNav'a ThemeToggle + LanguageToggle eklendi
- `feba532` — feat(about): Hakkımızda sayfası — kurucu hikayesi + ekip + başarılar + iletişim
- `d0d7693` — chore(about): Recognition & Awards bölümü kaldırıldı
- `589bc5d` — chore: Harvard HSIL hackathon referansları kaldırıldı (IGNITE'26 tek yer olarak kaldı)
- `e48ce09` — chore: brand minimization — IGNITE'26 + Koç Üniversitesi + Türkiye-spesifik iddialar kaldırıldı (global-ready)
- `086e5ff` — feat(legal): Aydınlatma Metni v2.0 → v2.1 (Iyzico aktarıcı + Finansal Veri + VUK Md.253 10-yıl + §11 Değişiklik Tarihçesi)
- `e5bc574` — fix(legal): AydinlatmaPopup versiyon dinamik bind + consent_log audit v2.1 (KVKK audit trail düzeltildi) + popup body §2/§3/§5/§6 v2.1 ile hizalandı
- `58c902f` — fix(legal): AydinlatmaPopup'a §11 Değişiklik Tarihçesi eklendi (/aydinlatma sayfası ile senkron)
- `31bac51` — feat(legal): Mesafeli Satış (13 madde) + Abonelik Sözleşmesi (17 bölüm) taslakları — hibrit strateji (URL'den erişilir, landing footer disabled)
- `1b792b2` — chore(legal): /privacy silindi + 301 redirect → /aydinlatma + 3 inbound link güncellendi + /terms legal@ → info@ + Premium cross-reference + dashboard footer overhaul

**Session 34 sonu durum:**
- Marketing-ready landing canlı (Ayşe persona, decoy pricing, interaction checker mockup)
- Hakkımızda sayfası minimal/global (kurucu ad + "Co-founder" — okul/detay kaldırıldı)
- KVKK Aydınlatma Metni **v2.1** (Iyzico + Finansal Veri + VUK Md.253 + §11 Değişiklik Tarihçesi + dashboard popup dinamik binding)
- Mesafeli Satış + Abonelik Sözleşmesi taslakları yayında (şirket tescili + hukuk danışmanı incelemesi bekliyor — footer link'leri disabled)
- Legal tutarlılık: **tek kaynak /aydinlatma**, tüm iletişim `info@doctopal.com` (eski `legal@` / `contact@` / `privacy@` kaldırıldı)
- Iyzico entegrasyonu **ERTELENDİ** (şirket kurulumu bekleniyor; Commit B atlandı — Bireysel Premium manuel aktivasyon UI'ına gerek görülmedi)
- 4 AI+sağlık güvenlik zırhı Abonelik Sözleşmesi'nde: §2a MDR Beyanı (tıbbi cihaz değil), §2b AI Halüsinasyon + Limitation of Liability, §5a Özel Nitelikli Veri Açık Rıza, §8a Aile Üyesi Bağımsız Rıza Zinciri
- /privacy konsolide edildi (/aydinlatma tek KVKK Md.10 kaynağı)
- Dashboard footer Premium aboneleri için tam donatıldı (Aydınlatma + Mesafeli + Abonelik link'leri aktif)

**Session 35'e devir:**
- Taha'nın AI cevap kalitesi iyileştirmeleri (öncelikli iş)
- Iyzico entegrasyonu (şirket kurulumu + Iyzico merchant onayı + Abonelik aktivasyonu sonrası)
- Hukuk danışmanı review (şirket tescili tamamlandıktan sonra taslaklar gözden geçirilip v1.1'e bump edilecek; footer disabled state kaldırılacak)
- Bireysel Premium backend + checkout UI (Iyzico ile birlikte)
- Gerçek ekran görüntüleri (AboutSection team avatars + ScreenshotPlaceholder yerleri için `/team/` ve `/screenshots/` asset'leri)
*— Commit 4 bekliyor (Session 34): Iyzico SDK + hosted checkout + subscription webhook + trial clock (trial_started_at + 7d < NOW()) + Mesafeli Satış Sözleşmesi + Aydınlatma v2.1 + Bireysel Premium satın alma UI*

---

### Session 35 — Tamamlandı (19 Nisan 2026) — Pushed ef5f1a0..b1eb8a2

**Ana iş:** 92 hidden tool silme + AI kalite G4/G2.

**5 commit:**
- `1124f5a` chore(cleanup): A1 — 33 hidden tool silme (Medications 6 + Supplements 2 + Mental Health hidden 6 + Nutrition 3 + Sleep 4 + Fitness 4 + Settings 4 + Advanced 4)
- `ce2d0cd` chore(cleanup): A2 — 30 hidden tool silme (Organ Health 9 + Gender Health 4 + Prevention 3 + Medical Tools 9 + Life Stages first half 5)
- `978f138` chore(cleanup): A3 — 29 hidden tool silme + final verify (Life Stages second half 5 + Community 10 + Tracking 14)
- `d4397d0` feat(ai-safety): B1 (G4) — yellow code keyword genişletme (sepsis + DKA + DVT + overdose + postpartum + appendicitis + UTI + pediatric febrile, ~38 keyword)
- `b1eb8a2` feat(ai-safety): B2 (G2) — critical patient factors reorganize (criticalLines emoji+bold+guidance + "⚠️ CRITICAL PATIENT FACTORS" blok profile'ın en başında + CRITICAL REINFORCEMENT directive AI'ya ilk cümlede zikretme zorunluluğu)

**Sonuç:**
- Registry 153 → 61 tool (hidden 93 → 1, sadece `family-health-tree` Tool 3 konsolidasyonu için rezerve)
- 92 page.tsx silindi, 21+ API route silindi, 2 hub simplified (hormonal-hub, prevention-hub), InnovationShell silindi, BottomNavbar Community → Family tab
- Build temiz (0 error, 0 warning). 30K+ satır temizlendi.

---

### Session 36 — Tamamlandı (21 Nisan 2026) — Local (push bekleniyor)

**Ana iş:** Vercel breach sonrası güvenlik sertleştirme + dashboard bug fix'ler + AI kalite iyileştirme (İpek test feedback'i) + Master Plan v1.2 yapı hazırlığı.

**13 commit (local master, push yok — İpek sabah inceleyip push yapacak):**

**Güvenlik (3 commit):**
- `3e1d510` chore(security): C1 — `scripts/run-family-migration.js` hardcoded JWT fallback kaldırıldı (breach sonrası stale token silindi, fail-fast throw)
- `3a0a1ec` chore(security): C2 — `app/api/demo/route.ts` DEMO_EMAIL/DEMO_PASSWORD fallback kaldırıldı, env yoksa 503 (demo hesabı aktif değil — İpek kararı)
- `428c0ca` chore(security): C3 — `lib/secure-storage.ts` + `lib/consent-management.ts` fallback key'ler kaldırıldı (`"default-key-change-in-production!"` ve `"consent-salt"` → function-body `getKey()` pattern + fail-fast throw)

**Bug fix'ler (3 commit):**
- `d93a673` fix(dashboard): C5 — `water_intake` 406 Not Acceptable fix. `.single()` → `.maybeSingle()` 7 çağrı noktasında (API route 2 + WaterTracker 2 + TodayView 3)
- `6d50691` fix(dashboard): C6 — `/api/daily-log` 401 Unauthorized fix. Client-side fetch'lere `Authorization: Bearer ${session.access_token}` header eklendi (app/calendar/page.tsx fetchWaterCount + handleQuickLog PATCH)
- `a92ffa4` fix(kvkk): C7 — AydinlatmaPopup "Okudum, Kapat" kapanma bug fix. Root cause: `refreshProfile()` await'siz + API response sessizce yutuluyordu. Fix: popup önce kapat (UX) + API response.ok kontrol + error log + `await refreshProfile()`

**AI Kalite (4 commit, tümü lib/prompts.ts):**
- `547e455` feat(ai-quality): C8 — SYSTEM_PROMPT SELAMLAMA bölümü + Örnek 5 (selamlama few-shot). Kural: "iyiyim" gibi duygu atfetme yasak, kısa profesyonel karşılık + hızlı sağlık konusuna geçiş
- `9bab233` feat(ai-quality): C9 — SYSTEM_PROMPT İLAÇ ÖNERİSİ KURALLARI (TCK 1219 sK Md.12) + Örnek 6. Jenerik + Türk marka parantezi (Parol/Minoset/Panadol, Brufen/Advil/Nurofen, Aspirin/Coraspin, Naprosyn/Apranax, Claritine/Zyrtec), spesifik dozaj YASAK, "prospektüsüne bak" yönlendirmesi
- `c8830f7` feat(ai-quality): C10 — SYSTEM_PROMPT FORMAT bölümü zenginleştirme (emoji paleti ⚠️💊🏥✅🔴, uzun/kısa cevap kuralları, bold kritik kelimeler)
- `1558284` feat(ai-quality): C11 — SYSTEM_PROMPT TR akıcılık rafinesi. NASIL KONUŞURSUN'a "çeviri kokan yapı yasağı" (edilgen → etken, "bulunmuştur" → "bulunuyor"). Örnek 1 ve 2 robotik ifadeler düzeltildi.

**v1.2 Yapı (2 commit):**
- `7c8f6f7` feat(family): C12 — `supabase/migrations/20260421_family_history_entries.sql` YENİ migration dosyası (repo'ya eklendi, Supabase'de çalıştırılmadı — Session 37+ UI entegrasyonu sırasında apply). Schema: user_id + person_relation + condition_name + age_at_diagnosis + age_at_death + is_deceased + notes. RLS: 4 own_* policy.
- `2270950` feat(clinical-tests): C13 — SmartWelcome component'e "🧠 Klinik Tarama Yap (PHQ-9, GAD-7, EPDS)" chip CTA eklendi, `/clinical-tests` route'una Next.js Link ile navigate. Greeting'in hemen altında.

**Atlananlar/Ertelenenler:**
- **C4:** `session25_migration.sql` duplicate silindi ama untracked'ti — git'e iz düşmedi, commit olmadı
- **C14:** Sentry DSN verification — kod değişikliği yok, İpek Vercel + Sentry dashboard manuel kontrol edecek
- **Commit 3 decrypt test:** Production data'ya local'den erişim yok → test yapılamadı. Analiz: fallback kaldırma algoritmayı değiştirmiyor (hâlâ `SERVICE_ROLE_KEY.substring(0,32)`), prod'da env her zaman set → zero-impact. Eski encrypted data rotation sorunu ayrı bir konu (Session 37+ re-encrypt migration).

**Detaylı SUMMARY + push öncesi checklist:** [docs/SESSION_36_SUMMARY.md](docs/SESSION_36_SUMMARY.md)

**Session 37'ye devir:**
- Commit 3 encrypted data migration (prod decrypt test + gerekirse re-encrypt script)
- `family_history_entries` tablosu Supabase'de apply + UI entegrasyonu (Master Plan v1.2 Tool 3 Aile Sağlık Yönetimi)
- Sentry DSN verification (İpek Vercel kontrolü)
- AI kalite test + feedback iterasyonu
- Master Plan v1.2 doküman güncellemesi (İpek Claude web ile)
- Visible tool konsolidasyon başlangıcı (Master Plan Adım 3 — İlaç Merkezi + Sağlık Günlüğü + Ayarlar)
- Chat UX rewrite (ChatGPT tarzı sidebar + threads + `chats` tablosu migration)
- Iyzico entegrasyonu (şirket kurulumu + merchant onayı sonrası)

---

### Session 37 — Tamamlandı (21 Nisan 2026, gece devam) — Pushed aafc81e..2b34b78

**Ana iş:** AI Kalite G3 + G1 (Master Plan v1.1 Bölüm 10). Session 35 (G4 + G2) ve Session 36 (C8-C11 SELAMLAMA + MEDICATION RULES + FORMAT + TR akıcılık) devamı. AI kalite iyileştirme dizisinin kapanışı.

**3 commit (local master, push yok — Session 36 testi sonrası push):**

- `c8f4aea` feat(ai-quality): C1 (G3) — `buildProspectusSystemPrompt` → `buildMedicationHubSystemPrompt` rename + signature 3→8 field (userSupplements, userChronicConditions, isPregnant, isBreastfeeding, kidneyDisease, liverDisease eklendi) + PROSPECTUS_PROMPT INTERACTION CONTROL 6 yeni kural grubu (supplement-drug cross-check, pregnancy Category D/X flag, breastfeeding excretion, renally-cleared dose adjustment, hepatotoxic flag, condition-drug). Guardrail: klinik anlamlı + kanıta dayalı. Eski ad deprecated alias olarak korundu (backwards compat).
- `bbe51db` feat(ai-quality): C2 (G3) — `app/api/prospectus-reader/route.ts` user data fetch genişletildi. 2 sequential query → 3 Promise.all. user_profiles select: supplements, chronic_conditions, is_pregnant, is_breastfeeding, kidney_disease, liver_disease. Supplement parse (meta: prefix filter + `|` split), chronic parse (surgery:/family: prefix filter). Helper çağrısı 8 field ile.
- `631bb2d` feat(ai-quality): C3 (G1) — SYSTEM_PROMPT'a 4 yeni few-shot örnek: Örnek 7 (bariatrik+D vit emilim, TR), Örnek 8 (aile meme kanseri+fitoöstrojen, TR), Örnek 9 (polypharmacy + CYP450, EN), Örnek 10 (eGFR+nefrotoksik bitki, TR). Toplam few-shot 6 → 10. Her örnek profil flag'i ilk cümlede zikreder, güvenli alternatif sunar, PubMed kaynak linki ile kapanır.

**Sonuç:**
- Prospektüs tarayıcısı (Tool: Prospectus Reader) artık supplement-drug, pregnancy-drug, breastfeeding, renal, hepatic, condition-drug etkileşimlerini flag'leyebiliyor
- AI chat asistanı 10 few-shot pattern ile profil-aware (cerrahi/aile/polypharmacy/böbrek) yanıtları daha tutarlı üretiyor
- AI Kalite dizisi (G1+G2+G3+G4 + C8-C11) tamamen bitti → Master Plan v1.1 Bölüm 10 tamam

**Detaylı SUMMARY + İpek test matrisi:** [docs/SESSION_37_SUMMARY.md](docs/SESSION_37_SUMMARY.md)

**Push yapıldı** (`aafc81e..2b34b78`). Session 36 + 37 testleri yarın sabah toplu yapılacak. Test matrisleri [docs/SESSION_36_SUMMARY.md](docs/SESSION_36_SUMMARY.md) ve [docs/SESSION_37_SUMMARY.md](docs/SESSION_37_SUMMARY.md)'de.

**Session 38'e devir (gerçekleşti):** Session 37 canlı test feedback'i → AI Kalite rafine dizisi (C1-C7).

---

### Session 38 — Tamamlandı (21 Nisan 2026, gece devam) — Push edildi

**Ana iş:** Session 37 canlı test (İpek) feedback'i sonrası AI Kalite rafine — 6 bulgu 7 commit ile kapatıldı. Roadmap değişikliği: Visible tool konsolidasyonu ve Chat UX rewrite **ertelendi** (mobile'da yeniden yapılacak). Session 39-40 DB + Legal, Session 41+ Mobile React Native.

**7 feature commit + 1 docs commit (tümü local master'da, push ediliyor):**

- `bf389d6` **C1 — DOZAJ YASAĞI geniş uygulama (TCK 1219 sıkılaştırma):** İLAÇ ÖNERİSİ KURALLARI'na madde 7-10 eklendi. Madde 7 tüm birimleri dozaj sayıyor (mg/g/mcg/IU/ng/mL/mg/kg/%/sıklık/süre/aralık/pratik ölçü). Madde 8 onay kelimeleri yasağı ("evet güvenli", "standart", "uygun/makul"). Madde 9 referans dozajı yasağı ("meta-analizde X IU" bile yasak). Madde 10 lab hedef değerleri yasağı ("25-OH D 30-60 ng/mL" yasak). Few-shot refactor: Örnek 1 (Omega-3) dozaj kaldırıldı, Örnek 7 (Bariatrik) lab hedef + emilim % kaldırıldı, Örnek 9 (Polypharmacy EN) "boswellia 300mg" → "boswellia". YENİ Örnek 11 (parol 500mg sorusu) eklendi.
- `340c448` **C2 — PROFİL VERİSİ BÜTÜNLÜĞÜ (halüsinasyon guard):** PROFİL FARKINDALIĞI bloğuna alt bölüm — profilde yazılı olmayan ilaç/durum varsayma yasağı, koşullu dil pattern'i ("eğer X kullanıyorsan ayrıca söyle"), kullanıcı ek ilaç bildirirse profile ekleme önerisi. Sessiz çıkarım ASLA.
- `b27744b` **C3 — DUYGUSAL VARSAYIM YASAĞI:** SELAMLAMA sonrası yeni blok. "Annem kanser olmuştu" ≠ "öldü" — hayatta varsay. "Üzgün oldum", "başın sağ olsun" SADECE açık ölüm ifadesinde (vefat etti, kaybettim). Nötr kabul + direkt değerlendirme pattern'i.
- `a9f69fa` **C4 — Polypharmacy few-shot (Örnek 12):** Profilde 2 ilaç + kullanıcı "5 ilaç" derse → "Profilinde X ve Y görüyorum, diğer 3 ne?" sorusuyla cevap + CYP450 + eczacı medication review + profile ekleme önerisi.
- `7f3177b` **C5 — Türkçe rafine 2. tur (Anglicism temizliği):** NASIL KONUŞURSUN bloğuna "ANGLICISM TEMİZLİĞİ" alt maddesi. 10+ somut TR/EN paralel mapping: cruciferous→turpgiller, punicalagin→nar fenolü, EGCG→yeşil çay polifenolü, red clover→kızıl yonca, isoflavone→izoflavon, phytoestrogen→fitoöstrojen, anthraquinone→antrakinon, black cohosh→karayılanotu. Yerleşik TR terimler paralel gerekmez (antioksidan/probiyotik/omega-3). Örnek 8 + Örnek 10 refactor.
- `f49a0ee` **C6 — FORMAT rafine (emoji + inline bold):** Emoji adaptif (uzun cevap 3-5, kısa 1-2). 🚨 + 🚫 emoji paleti eklendi. Bold 5 kategori (ilaç/takviye/uyarı/yönlendirme/Grade/sayısal DOZAJ HARİÇ). "Max 2-3 bold" sınırı kaldırıldı. Başlık sadeleştirildi.
- `9f9ee1b` **C7 — ACİL DURUM YANIT FORMATI:** "⚠️" → "🚨 **Bu acil — hemen 112'yi ara**" İLK SATIR. Yeni "ACİL DURUM YANIT FORMATI" bloğu (yellow code): 🚨 ilk cümle zorunlu, 2-3 aksiyon max, 2-3 ayırıcı tanı, profil kritik faktör ilk cümlede, kapanış "Detay istersen sonra konuşuruz", toplam 5-7 cümle. 5+ madde liste + sayfa boyu döküm + 10 ihtimal + bitki önerisi + uzun mekanizma YASAK.

**Sonuç:**
- AI Kalite refaktör dizisi (Session 35-38) **tamamen bitti** — prompt artık TCK 1219 uyumlu, halüsinasyon dirençli, duygu-doğru, Türkçe akıcı, format adaptif, acil durum kısa.
- Few-shot: 10 → 12 (Örnek 11 parol, Örnek 12 polypharmacy).
- `lib/prompts.ts` net ~150 satır eklendi.
- Build temiz (0 error, 0 warning, 240 sayfa prerendered).

**Bulgu:** `.env.local` içindeki `SUPABASE_SERVICE_ROLE_KEY` **legacy JWT formatında** (eyJhbGci...) ve Supabase "Legacy API keys are disabled" döndürdü. İpek'in Supabase dashboard'dan yeni format API key üretip `.env.local`'i güncellemesi gerekli (operasyonel TODO — Session 38 implementasyonunu etkilemiyor, S39+ DB işleri için gerekli).

**Detaylı SUMMARY + İpek test matrisi (7 commit için):** [docs/SESSION_38_SUMMARY.md](docs/SESSION_38_SUMMARY.md)

**Session 39'a devir:** Database finalize + Legal hazırlık (KVKK v2.2, Iyzico entegrasyon planı). Session 40 beta lansman hazırlık. Session 41+ Mobile React Native mimari kurulumu. Web'de ertelenenler (Hub konsolidasyon + Chat UX rewrite) mobile'da yeniden yapılacak.

---

### Session 39 — Tamamlandı (21 Nisan 2026, gece devam) — Push bekleniyor

**Ana iş:** Session 38 canlı test feedback hotfix + family_history_entries full stack + KVKK v2.2 + Iyzico plan dokümanı. Push YOK — İpek manuel 2 adım (migration apply + env key update) + canlı test matrisi sonrası kendi push edecek.

**4 feature commit + 1 docs commit (local master'da):**

- `0e491c7` **C1 (S39-H1) Safety template** — Session 38 Test 38.7 "göğüs ağrım var nefes alamıyorum" tetiklediğinde RED CODE template çok kısaydı. `lib/safety-filter.ts getEmergencyMessage()` TR+EN: ⚡ "Şimdi yapman gerekenler" bloğu + 3 numaralı aksiyon (otur/uzan, yalnız kalma, ilaç alma) + "Güvende olduğunda detay sorabilirsin" kapanış. `getYellowWarning()` one-liner → 3 madde kısa paket. `components/ai/YellowCodeCard.tsx` 3 aksiyon chip (Armchair/Users/Pill icon). Session 38 C7 (SYSTEM_PROMPT ACİL DURUM YANIT FORMATI) + Session 39 C1 (triyaj kart + warning) birbirini tamamlar.
- `b8ee8b9` **C2 (S39-C2) family_history_entries full stack** — Session 36 C12'de migration yazılmıştı ama apply yok. Bu commit UI+API+chat entegrasyonunu getirdi. YENİ `app/api/family-history/route.ts` (GET/POST/PATCH/DELETE, apiHandler + RLS + rate limit). YENİ `components/family/FamilyHistorySection.tsx` (liste + modal form + delete confirm + 14 yakınlık dropdown TR+EN + migration-öncesi graceful degrade). `app/family-health-tree/page.tsx` mount. `app/api/chat/route.ts` 5. Promise.all fetch + `familyHistoryFormatted` (zengin satır) + **coexist** (legacy `family:` prefix chronic_conditions + yeni tablo, backward compat). Migration apply İpek manuel.
- `c2c2c17` **C3 (S39-C4) KVKK Aydınlatma v2.1 → v2.2** — C2 ile family_history_entries ayrı sağlık verisi tablosu oldu; KVKK Md.10 gereği aydınlatma metninde explicit kategori. `lib/consent-versions.ts` v2.1→v2.2. `app/aydinlatma/page.tsx` §2-b iki alt-kategori (b1 kendi veri, **b2 Aile Sağlık Öyküsü** explicit + metadata seviyesi saklama + KVKK Md.6 açık rıza dayanağı) + §11 v2.2 entry + header/footer version. `components/legal/AydinlatmaPopup.tsx` §2 + §11 mirror. Schema migration YOK (`aydinlatma_version` TEXT kolonu mevcut). Mevcut kullanıcılar dashboard amber banner → popup → onay akışıyla v2.2 kabul eder.
- `9db93f7` **C4 (S39-C5) Iyzico plan dokümanı** — `docs/IYZICO_INTEGRATION_PLAN.md` v1.0 taslak, 12 bölüm: ön koşullar (tescil, banka, VERBİS), merchant başvurusu, sandbox entegrasyon + test kartları, Premium tarifeleri (Bireysel ₺149/₺1490 + Aile ₺349/₺3490), abonelik lifecycle (trial→active→cancel state machine), checkout UI, API endpoint tasarımı (create/webhook/cancel/status), DB şema taslakları (`subscriptions`, `transactions`, `invoices`), KVKK uyumlu ödeme, fatura otomasyonu (MVP PDF+mail, sonra GİB e-fatura), go-live 3 hafta check-list, risk/rollback. Tescil sonrası avukat/muhasebeci review ile v1.1'e bump.
- Docs commit — SESSION_39_SUMMARY.md + CLAUDE.md + PROGRESS.md

**Manuel adımlar (İpek kod değil):**
- **S39-C1:** Supabase SQL Editor → `supabase/migrations/20260421_family_history_entries.sql` apply + RLS doğrulama
- **S39-C3:** `.env.local` `SUPABASE_SERVICE_ROLE_KEY` legacy JWT → yeni `sb_secret_*` format (Supabase Dashboard → Settings → API → service_role secret)

**Sonuç:**
- Session 38 Test 38.7 bulgu kapandı (RED + YELLOW + Card).
- family_history_entries artık canlı: UI'dan ekleme/düzenleme/silme → AI chat profil bloğunda kullanılır (kalıtsal risk değerlendirmesi için).
- KVKK Aydınlatma v2.2 — aile öyküsü explicit kategori; mevcut kullanıcılar banner → popup akışıyla onaylar.
- Iyzico tescil sonrası implementation için tam rehber hazır.
- Build: 240 → 241 sayfa (yeni `/api/family-history`), 0 error, 0 warning.

**Detaylı SUMMARY + İpek test matrisi + manuel adım instruction:** [docs/SESSION_39_SUMMARY.md](docs/SESSION_39_SUMMARY.md)

**Session 40'a devir:** Beta lansman hazırlık (landing revizyonu, onboarding smoke test, Session 39 test bulgu fix'leri, Sentry monitoring). Tescil olursa Iyzico v1.1 + Mesafeli Satış aktivasyonu. Session 41+ Mobile React Native mimari başlangıç.

---

### Session 40 — Dashboard Audit & Fix (22 Nisan 2026) — Tamamlandı

**Ana iş:** Dashboard kapsamındaki 9 route + 3 destek component için statik audit + bug fix. İpek Session 39 sonrası "dashboard bug'ları var ama envanter yok" dedi; bu session önce audit + bug list çıkarıldı, sonra P0+P1 fix.

**Metodoloji:** 2 paralel Explore agent → 15 ham bulgu → manuel verify (false positive filtresi) → 7 gerçek bug. Regression kontrol (Session 32-39 fix'leri) temiz.

**5 fix commit + 1 docs commit (Session 40 sonunda):**

- `a198d3f` **BUG-001** calendar `useState(new Date())` SSR hydration → lazy-init UTC midnight + `useEffect` client-only hydrate
- `84bc5af` **BUG-002** ICS UID `Math.random()` → deterministic hash (`event_date|type|time|title`) — Google/Apple Calendar duplicate import önlendi
- `01d15e0` **BUG-003** dashboard greeting emoji flash → `timeEmoji` state+effect kaldırıldı, `hour` state'ten derive (dead `getTimeEmoji` fn silindi)
- `ac64867` **BUG-004 + BUG-007** medication-hub `const now = new Date()` at render body (SSR mismatch) → `currentHour` state + `setInterval` 60s refresh; line 470 `parseInt` radix 10 + null-safe isPast
- `44aefdc` **BUG-005 + BUG-006** dashboard/chat 7 console.log (KVKK non-audit) → `process.env.NODE_ENV === "development"` wrap; `fileToBase64` split[1] undefined → Promise reject
- docs commit — SESSION_40_AUDIT.md FIXED işaretleri + PROGRESS.md + CLAUDE.md

**Sonuç:**
- P0: 0 (kritik crash/veri kaybı yok)
- P1: 4 tümü FIXED
- P2: 3 tümü FIXED
- Build: 241 sayfa, 0 error, 0 warning (regression yok)
- Session 32 AuthContext cache + Session 36-39 tüm fix'ler korundu (audit'te ayrıca doğrulandı)

**False positive'ler (kayıt için):** 8 bulgu elendi — optional chain short-circuits, useEffect scope, typed const registry, Supabase caller-session semantics, useCallback dep chain, mevcut try/catch wrap'leri vb.

**Ertelenenler (Session 41+):**
- ESLint 127 error (library dosyaları: `lib/embeddings.ts`, `lib/translations.ts`, `lib/health-integrations.ts`, `lib/use-effective-premium.ts`, `scripts/*.js`) — ayrı temizlik sprint'i, dashboard bağlantısı yok.
- FP-D Settings password UX (aile üyesi görüntülemesinde "password değiştir" bölümünü hide/disable) — teknik bug değil, UX iyileştirmesi.

**Detay:** [docs/sessions/SESSION_40_AUDIT.md](docs/sessions/SESSION_40_AUDIT.md)

**Session 41'e devir:** ESLint library temizlik sprint'i + Settings UX fix (FP-D) + beta lansman hazırlık (Session 39 devrinden taşınan landing revizyon/onboarding smoke test/Sentry monitoring). Şirket tescili tamamlanırsa Iyzico entegrasyonuna geçiş ([docs/IYZICO_INTEGRATION_PLAN.md](docs/IYZICO_INTEGRATION_PLAN.md)).

---

### Session 41 — Interaction / UX Friction Audit + Fix (22 Nisan 2026) — Tamamlandı

**Ana iş:** Session 40 dashboard bug audit'inin interaction/UX ekseninde devamı. İki fazlı:
- **Faz 1 (commit `989ba0b`):** 2 paralel Explore agent + manuel verify → 17 ham bulgu → 15 gerçek finding (2 false positive elendi — chat history mobile drawer gerçekte var; task state dual-source bilinçli tasarım).
- **Faz 2 (commit zinciri `6924634..beb90b7`):** M varyant (P0 + 6 P1, ~6h). 7 fix, 6 commit.

**Faz 1 → 15 finding:**
- P0: 1 (F-S-002 AydınlatmaPopup scroll gate yok — KVKK compliance false audit riski)
- P1: 6 (palette scrollIntoView + Tab, chat a11y, dashboard customize, medication conflicts CTA, calendar empty state)
- P2: 8 (kozmetik — Session 42'ye ertelendi)
- CLEAN: 3 (FamilyHistorySection S39 hotfix, Settings nav, Prospectus upload)

**Faz 2 fix commit'leri:**

- `6924634` **F-S-002** AydınlatmaPopup scroll gate — Root: D (hiç uygulanmamış). Session 36 C7 aslında popup kapanma fix'iydi, scroll gate değil. ConsentPopup pattern'i (`7167423`, `0d9c7a4`) AydınlatmaPopup'a taşındı: `hasScrolledToBottom` state, `useEffect` short-text auto-enable (scrollHeight ≤ clientHeight + 5), `onScroll` eşik kontrolü (< 20), button `disabled` + amber hint + opacity-50.
- `31ffa97` **F-S-001 + F-S-003** CommandPalette keyboard nav — handleKeyDown'a Tab/Shift+Tab forward/backward (ArrowDown/Up mirror), `useEffect([selectedIndex, open])` data-attr query + scrollIntoView block:nearest. Registry/bilingual matching dokunulmadı.
- `e273535` **F-D-007** ChatInterface 5 icon button aria-label — paperclip/camera/mic/trash/send. Send butonu stream state'ine göre iki ayrı label ("Mesajı gönder" / "Yanıt hazırlanıyor"). `chat.send` translation key mevcut değil, inline TR/EN stringler (voice message pattern ile tutarlı).
- `24914c1` **F-D-005** Calendar TimeBlock empty CTA — `onAdd={() => {}}` call-site'larında no-op idi; butonun onClick'ine `setEditMode(true)` eklendi → mevcut custom-task form (line 332) açılır. onAdd prop'u korundu (future-compat).
- `792d477` **F-D-004** Medication Hub conflict banner — audit "silent" dedi ama amber banner zaten var (line 455-464); gerçek friction sadece hardcoded 2 pair. Banner'a `/interaction-checker` CTA eklendi ("Tüm ilaç-bitki etkileşimlerini kontrol et"). Pair expansion Session 42+'a ertelendi (feature addition).
- `beb90b7` **F-D-003** Dashboard customize panel — `taskCustomizeMode ? ... : ...` swap yerine `list + {mode && panel}`. Task list her zaman görünür, customize panel altına expansion (dashed top border). Mobile'da scroll akışı doğal.

**Sonuç:**
- **P0: 1/1 FIXED.** KVKK compliance audit trail riski kapatıldı — artık kullanıcı v2.x metnini sonuna kadar kaydırmadan "Okudum, Kapat" edemez.
- **P1: 6/6 FIXED.** En yüksek günlük friction noktaları (palette keyboard nav, chat a11y, calendar empty dead CTA, dashboard customize context loss, medication interaction discovery).
- **Build:** 241 sayfa, 0 error, 0 warning (Faz 1 ile bit-perfect).
- **Regression yok:** Session 32 AuthContext cache + Session 36-39 tüm fix'ler + Session 40 bug fix'ler korundu. ConsentPopup scroll gate pattern'ine dokunulmadı (F-S-002 yeni/ayrı).

**Ertelenenler (Session 42+):**
- 8 P2 finding (kozmetik sprint — profile draft utility, water optimistic, copilot chips, prospectus retry, palette avatar, header banner, settings password, etc.)
- F-D-004'ün drug-pair expansion'ı (interaction engine refactor)
- FP-D Settings password UX (Session 40 deferred)
- ESLint 127 error (library dosyaları)

**Detay:** [docs/sessions/SESSION_41_INTERACTION_AUDIT.md](docs/sessions/SESSION_41_INTERACTION_AUDIT.md) — FIXED işaretleri + root cause notları + Faz 2 commit haritası.

**Session 42'ye devir:** P2 kozmetik sprint + profile draft utility (sessionStorage pattern'ini reusable lib'e çıkarma) + onboarding flow audit (yeni user journey) + beta lansman hazırlık. Iyzico şirket tescili bekleyişi devam.

---

### Session 42 — P2 Kozmetik Sprint + FP-D Settings UX (22 Nisan 2026) — Tamamlandı

**Ana iş:** Session 41 audit'inde P2 olarak ertelenmiş 7 bulgu + Session 40'tan taşınmış FP-D Settings password UX. Kullanıcı "hepsi" + "sessionlara devam edelim" dedi → ESLint 127 library error Session 43'e ayrıldı (her biri semantic change, yanlış fix runtime bug). Bu session 8 kozmetik/edge-case fix.

**8 fix commit + 1 docs commit (`fea05d7..ddc4b26`):**

- `fea05d7` **F-S-010** Header medication reminder banner — `flex-col sm:flex-row` stack on narrow phones, action buttons full-width alt mobile, sm'den itibaren row
- `873ffe0` **F-S-009** CommandPalette doktor avatar initials — `text-[10px] sm:text-xs` + `tracking-tight` 9×9px circle'da iki harf clip olmasın
- `21397a4` **F-D-010** Dashboard copilot chips — `grid grid-cols-2 sm:flex sm:flex-wrap`, chip text `truncate` + emoji `shrink-0`
- `a309618` **F-S-005** Settings password success auto-reset — bare `setTimeout` kaldırıldı, useEffect + cleanup pattern ile idempotent (+ error clear)
- `9e98e68` **F-S-008** Prospectus reader error state — inline "Tekrar Dene" (file preserve) + "Yeni dosya" escape (`resetAll`)
- `9340c19` **F-D-008** Water task optimistic glass counter — WaterTaskItem onClick now calls `addGlass`/`removeGlass` + parent toggle; glass count updates instantly, DB reconciles via WaterIntakeProvider
- `cde0f95` **FP-D** Settings password family member view — `useActiveProfile` isOwnProfile gating; aile üyesi görüntülemesinde form yerine info card ("Aile üyesinin parolasını buradan değiştiremezsin, kendi profiline dön") — Supabase auth caller-session semantiğinin UX netleşmesi
- `ddc4b26` **F-D-006** Draft persist utility — YENİ `lib/ui/draft-persist.ts` (`readDraft<T>`, `persistDraft`, `clearDraft`, `DRAFT_KEYS` namespace). FamilyHistorySection Session 39 hotfix inline sessionStorage logic'ini yeni lib'i consume edecek şekilde refactor (davranış aynen korunur). Profile medication-add form (newBrandName/generic/dosage/frequency) isAddingMed true iken persist + open'da restore + success'te clear. Cancel'da draft kalır (Session 39 FamilyHistorySection davranış parity).

**Sonuç:**
- **7/7 P2 + FP-D FIXED** (Session 41 audit kapanışı)
- **F-D-009 CLEAN** doğrulandı ([app/calendar/page.tsx:997](app/calendar/page.tsx:997) Suspense fallback mevcut — statik audit'te false pozitifti)
- Build 241 sayfa, 0 error, 0 warning (Session 41 Faz 2 ile bit-perfect)
- Regression yok: Session 39 FamilyHistorySection draft davranışı korundu (lib extract davranış parity), Session 41 tüm fix'leri dokunulmadı, Session 32 AuthContext cache intact

**Eklenen reusable utility:** [lib/ui/draft-persist.ts](lib/ui/draft-persist.ts) — SSR-safe, quota-safe sessionStorage helpers + `DRAFT_KEYS` namespace. Gelecek form'lar (allergy-add, chronic-add, supplement-add, SBAR metadata vb.) bu lib'i consume edebilir.

**Detay:** [docs/sessions/SESSION_41_INTERACTION_AUDIT.md](docs/sessions/SESSION_41_INTERACTION_AUDIT.md) — Session 42 FIXED işaretleri + her fix için commit mapping.

**Session 43'e devir:**
- **ESLint 127 library error sprint** — `lib/embeddings.ts` (2 `any`), `lib/health-integrations.ts` (1 `any`), `lib/translations.ts` (1 `any`), `lib/use-effective-premium.ts` (1 setState-in-effect), `scripts/*.js` (5 require-import) + kalan ~117 warning/error. Her biri semantic care — dedicated sprint gerektiriyor, yanlış fix runtime bug.
- Onboarding flow audit (yeni user journey)
- Beta lansman hazırlık (landing revizyon, Sentry monitoring)
- Iyzico şirket tescili bekleyişi devam

---

### Session 44 — Daily Care Unification + DailyLogsContext (23 Nisan 2026) — Tamamlandı

**Ana iş:** Dashboard ↔ Calendar ↔ TodayView üçlüsünde tıkla-yenile-kayıp döngüsü, hardcoded supplement/movement ring'leri ve silent catch'leri tek bir context + atomic upsert + sonner toast + Sentry breadcrumb pattern'ine taşıma.

**11 commit (`3a61de0..ac4e895`):**

- `3a61de0` **C2.1 (Faz 1)** sonner install + `<AppToaster />` mount + `lib/toast/mutation-errors.ts` (`reportMutationError(err, ctx)` → toast + Sentry breadcrumb)
- `ef34ebf` **C2.2 (Faz 2)** `lib/contexts/DailyLogsContext.tsx` skeleton — `setLogCompleted(taskType, externalId, label, completed)` async API + optimistic `Set<string>` + cross-tab `daily-log-changed` event bus + provider mount layout root
- `e3a9b69` **C2.2.1** `useMemo` `completed` Set'i deps'e dahil edildi (re-render sızıntısı fix)
- `431f3d7` **C2.3** Dashboard `app/page.tsx` `toggleTask` → `setLogCompleted` (provider TaskDeckCard sarmasından root'a hoist edildi, üç tüketici de aynı state)
- `7dc60bf` **C2.4** Calendar `app/calendar/page.tsx` `toggleTask` + `handleQuickLog` + 4-ring widget (💊/🌿/💧/🚶) DailyLogsContext'e bağlandı
- `9df9f1c` **C2.5** Calendar 4-ring `totalWater` çift sayım fix — `waterCount + waterDoneFromTasks` → sadece `waterCount` (FAB + ritual checkbox aynı bardak için iki kez sayılıyordu)
- `3453d74` **Faz 3** `lib/contexts/WaterIntakeContext.tsx` sertleştirme — stale-closure double-tap (functional setState), atomic upsert against UNIQUE(user_id, intake_date), silent catch yerine `reportMutationError` toast + Sentry, optimistic rollback on error
- `dd132c3` **Faz 4** `components/dashboard/DailyCareCard.tsx` agresif refactor — `mockData = {meds: [...], supps: [...]}` 30+ satır silindi → user_profiles supplements + meds bağlandı, "2/3 ring" hardcoded değer DailyLogsContext'ten gerçek completion sayısı, "Henüz takviye eklenmemiş" boş state
- `7ddb19d` **Faz 5** `components/calendar/TodayView.tsx` — `toggleMedDose` + `toggleSupplement` `setLogCompleted`'e migrate (~25 satır kısaldı, silent catch yok), `updateWater` + `updateWaterTarget` SELECT-then-INSERT/UPDATE → atomic upsert + `reportMutationError`
- `1992962` **Faz 6** Ölü kod: `components/calendar/HabitRings.tsx` (Apple-style ring prototype, zero import) + `components/calendar/WaterTracker.tsx` (8-button glass row prototype, zero import) → 214 satır silindi
- `ac4e895` **Faz 7** Calendar 🚶 Hareket ring `current={1} total={3}` hardcoded → `MOVEMENT_EMOJIS = {🚶, 🏃, 🧘, 💪, 🤸, 🚴, 🏋️, 🥋}` Set + `moveDone` count + `totalMove = max(raw, 1)`. Future: `health_metrics.steps` (Apple Health / Google Fit) wiring.

**Sonuç:**
- 4-ring widget (💊 ilaç, 🌿 takviye, 💧 su, 🚶 hareket) tüm değerleri **canlı**. Hardcoded değer sıfır.
- Dashboard / Calendar / TodayView arasında tıklama tek event bus üzerinden senkron — 60sn polling + cross-tab `daily-log-changed` BroadcastChannel.
- Mutation hatalar Sonner toast + Sentry breadcrumb (`reportMutationError`) — sessiz yutulma kaldırıldı.
- Su sayacı stale-closure double-tap bug fix (functional setState), atomic upsert UNIQUE constraint guarantee.
- DailyCareCard'da mock supplement listesi gerçek user_profiles.supplements'a bağlandı.
- 214 satır ölü kod silindi.
- Build: 241 sayfa, 0 error, 0 warning. Regression yok (Session 32 AuthContext cache + Session 36-39 fix'ler + Session 40-42 audit fix'leri korundu).

**Bilinen TODO (Session 45+):**
- ESLint 127 library error (Session 43'ten devam)
- Premium Sprint İş 1 (Pricing rewrite + decoy)
- Premium Sprint İş 2 (Chat quota + free tier rate limit + paywall modal)
- `health_metrics.steps` integration → movement ring `totalMove=1` floor → user step target
- TodayView water update'i de WaterIntakeContext'e taşı (şimdi atomic upsert ama context bypass — uzun vade tek API)

**Session 45'e devir:** Premium Sprint (Pricing + Chat quota) + ESLint sweep + onboarding flow audit + Iyzico şirket tescili bekleyişi devam.

---

### Session 45 — Premium + Safety Engine + Profile Sidebar Refactor (Full Closure) (23 Nisan 2026) — Tamamlandı

**Ana iş:** 26 commit canlıda, 3 büyük tema — F-PROFILE-001 tam kapanışla:
1. Premium pricing redesign + landing dil yumuşatma + UI cleanup
2. F-SAFETY-001/002 — interaction check + 5-kategori cross-check + persistent banner
3. **F-PROFILE-001 ✅ CLOSED** — 2193-satır legacy monolith → 11-tab ShellV2 sidebar refactor (11/11 tab gerçek). Commit 6.1 vitality helper extract + SBAR caller-identity defense-in-depth. Commit 6.2 legacy demolished (−2450 net LOC) + `?legacy=true` silent redirect. **Profile sidebar ShellV2 tek canonical source.**

**Grup dağılımı (27 total = 26 kod + 1 docs meta):**

| Grup | Commit sayısı |
|---|---|
| Premium + UI cleanup | 5 |
| Bug fixes (Faz 2 + F-PALETTE) | 5 |
| F-SAFETY-001/002 paketi | 7 |
| F-PROFILE-001 tam paket (Commit 1-6.2) | 9 |
| docs meta (611ed2f Session 45 entry yazımı) | 1 |
| **Toplam** | **27** |

**26 commit (`15a7ac7..2fe550e`):**

#### Premium + UI cleanup (5 commit)
- `15a7ac7` **Premium İş 1** — Pricing sayfası: yıllık tasarruf rozeti (Bireysel ₺298, Aile ₺698), auth-aware checkout (guest → login → bounce-back), aile aktivasyonu sonrası `refetchFamily()`, KVKK/Iyzico/iptal trust strip, 4 soruluk FAQ
- `cfadce4` **Premium İş 2** — `lib/chat-quota.ts` (Free 20/gün, UTC midnight reset, query_history sayım) + `/api/chat` consent gate sonrası enforce + 402 Payment Required + ChatInterface preemptive premium gate kaldırıldı
- `fe0e259` **Premium redesign** — `lib/pricing.ts` merkezi config + `<PricingToggle />` + `<PricingCard />` reusable + default monthly + Bireysel emphasised + yeni fiyatlar (149/1399 + 349/3299) + checkout PLAN_LABELS config'ten build
- `eb041b4` **i18n sweep** — 28 yeni key + 16 tüketici (4 InfoTooltip + 4 error page + 4 placeholder/minor + 4 a11y); Sağlık Asistanı tooltip + tüm error sayfaları + supplement-guide/health-diary placeholder + status.online + Doctor Copy/Close TR
- `463c161` **Landing plain-language** — "GRADE evidence sistemi" → "kanıt seviyesiyle birlikte güvenilir cevaplar"; "SBAR formatında" → "Doktor standardında"; ScreenshotPlaceholder GRADE chip → "Yüksek kanıt seviyesi"

#### Bug fixes — Faz 2 hotfix + Faz 2.1 + F-PALETTE (4 commit)
- `688babe` **Faz 2 hotfix** — `app/calendar/page.tsx` TimeBlock seed routing: `dbType` field eklendi, toggleTask/deriveDone/ring counter'lar dbType-first; emoji-only routing ☀️/🌙/🍵 emoji'leri silent local-state path'e düşürüyordu (DB'ye yazma yok)
- `535e32c` **Faz 2.1** — Default ritual seed (m1 D3, m2 Probiyotik, n1 Omega-3, e1 Magnezyum, e2 Kediotu) tamamen silindi; `useEffect` race fix (`profile?.id` deps); fetchProfileMeds deterministik set; loading skeleton; empty state CTA "Henüz ilaç eklenmemiş"
- `611f690` **F-PALETTE-001** — Family History command palette routing: `FamilyHistorySection` `familyGroup` gating dışına alındı (sayfa en üstüne); palette URL `/family-health-tree?section=history&new=true` → autoOpen + scroll + `?new=true` URL'den temizleme (refresh re-fire yok); `app/family-health-tree/page.tsx` 3-state header subtitle (familyGroup-aware); inline "Aile Grubu Oluştur" CTA card
- `7eb706c` **Palette profile field deep-links** — `lib/command-palette-registry.ts` 10 yeni entry "profile-fields" kategorisi (boy/kilo/yaş/bmi → vucut-olculeri, alerji, ilaç, aşı, kan grubu, kronik, cerrahi, takviye, yaşam tarzı, üreme); section anchor id'leri (LifestyleSection BMI + Blood + 3 div); profile mount-effect smooth scroll + 2s emerald ring; CommandPalette typeMap + render group
- `c3d4025` **Palette auto-open collapsed sections** — `editingHealth` 5 hash için auto-true (vucut-olculeri/kan-grubu/yasam-tarzi/takviyelerim/ureme-sagligi); 400ms delay (vs 200ms top-level cards); `HEALTH_PROFILE_HASHES` Set; useMemo stable identity

#### F-SAFETY-001 + F-SAFETY-002 (8 commit)
- `fca3f6f` **F-SAFETY-001** — `/api/chat` quota değil, `/api/interaction-map` kullanılıyor; `lib/safety/check-med-interactions.ts` callback-based helper (onLoadingStart/onResult/onRateLimited/onError); `MedicationInteractionBanner` component (kırmızı/sarı chrome, dismiss-only, 2 CTA); `addMedication` post-insert hook; rate-limit 60s silent retry; banner mount Aktif İlaçlar üstünde
- `560410b` **F-SAFETY-001 post-launch UX** — banner pozisyon Medications card üstüne taşındı + post-mount scrollIntoView + 3s ring pulse; `/api/interaction-map` system prompt strict FDA severity classification + 10 canonical dangerous example + tie-break "always dangerous"; severity label TR/EN ton ayrımı ("⚠️ ÖNEMLİ UYARI — Ciddi Etkileşim" / "Dikkat — İzlem Gerektiren"); `titleCaseMed` TR locale ("İzotretinoin"); `NEXT_PUBLIC_SAFETY_BANNER` feature flag
- `bf7f36b` **F-SAFETY-001 underscore fix** — `titleCaseMed` `[_-]+` → space normalize ("warfarin_sodium" → "Warfarin Sodium"); `addMedication` insert öncesi `normalizeMedFields` (storage temiz)
- `7a39c4b` **F-SAFETY-002 Commit 1** — `lib/safety/normalize-med-name.ts` ortak helper; `checkInteractionsAfterChange` rename + backwards-compat alias; 3 ek insert path bağlama (MedicationScanner + 15-day dialog + onboarding wizard) — `safety:med-added` global event dispatch (300ms delay scanner/dialog close animation için); profile page listener
- `e40cc03` **F-SAFETY-002 Commit 2** — `/api/interaction-map` 5-kategori matrix: drug-drug + drug-chronic + drug-supplement + drug-allergy + drug-condition; INPUT CATEGORIES labelled section + canonical dangerous examples per category; `edges[].category` opsiyonel field (backwards compat); banner kategori-gruplu render (CATEGORY_LABELS + CATEGORY_ORDER condition→allergy→drug-drug→chronic→supplement); telemetri `safety.interaction_check.result.by_category`
- `a5f5883` **F-SAFETY-002 Commit 3** — `lib/safety/sbar-interaction-template.ts` (`buildDoctorEmailBody/Subject/MailtoUrl`); banner "Doktoruma Sor" CTA mailto fallback (default), `onAskDoctor` opsiyonel; `patientName` prop; mail body kategori-gruplu + 3 doktor sorusu + DoctoPal disclaimer; TR+EN template
- `2a601b1` **F-SAFETY-002.2 persistence** — Migration `20260423_medication_interaction_alerts.sql` (id/user_id/edges JSONB/summary/severity/dismissed_at/resolved_at/resolution_note + RLS own_* + partial index `WHERE resolved_at IS NULL`); helper'a 4 yeni fn (`fetchActiveInteractionAlert`/`dismissInteractionAlert`/`resolveInteractionAlert`/`autoResolveAlertsForMedication`); banner `alertId` + `onResolve` props + "✓ Doktor Onayladı / Çözüldü" buton + `Loader2`; profile mount-effect alert restore (`alertRestoredRef` guard); removeMedication auto-resolve sweep; **24-h confirm button 3-state** (amber "İncelemeyi bekliyor" lock / yeşil "Doğrulandı" / primary-outline)

#### F-PROFILE-001 — 9 commit (sidebar refactor + tam kapanış)
- `28572b1` **Commit 1/N** — `components/profile-v2/` shell + sidebar + URL hook + Genel tab + 9 placeholder; `app/profile/page.tsx` legacy fork (`?legacy=true` ile monolith korundu — Commit 6.2'de silindi); useProfileTab hook; ProfileSidebar (lucide icon + active emerald vurgu + mobile custom button accordion); GeneralTab (AvatarPicker + EmergencyContactsSection + LinkedAccountsSection reuse + read-only identity + "Düzenle: legacy" link)
- `bba3a2c` **Commit 2.1/N** — useProfileData hook (medications/allergies/labTestCount tek fetch); BodyLifestyleTab (LifestyleSection reuse + sigara/alkol radio ONLY here in ShellV2 + 800ms debounced auto-save + status chip); MedicalHistoryTab (Kritik Durumlar Shield + transparent copy + gender-gated pregnancy/breastfeeding + kidney/liver always; ChronicConditionsEditor reuse; Cerrahi chip yeni UI surgery: prefix filter family: gizli)
- `0b76f20` **Commit 2.2/N** — MedicationsTab (~480 satır): list + inline add form + autocomplete + DEFAULT_DOSES + drug-search debounce + scanner toggle (`onMedicationFound={refetch}` no pre-fill, no duplicate-insert risk); F-SAFETY-002.2 full integration (mount fetchActive + checkInteractionsAfterChange + autoResolve + banner + 3-state confirm); `safety:med-added` listener
- `238902f` **Commit 3/N** — 5 tab tek commit: SupplementsTab (ProfileSupplementsStep adapter wrap), AllergiesTab (AllergiesSection state container + parent CRUD callbacks), VaccinesTab (VaccineProfileSection direct mount), FamilyTab (mini preview last 3 + 2 CTA `/family-health-tree`), ReproductiveTab (pregnancy/breastfeeding minimal + male URL gate redirect to ?tab=genel + "Yakında genişletilecek" info card); `handleTabSaved` (refetch + refreshProfile parallel — cross-tab consistency)
- `e48e9c9` **Commit 4/N** — PrivacyTab (PrivacySettings reuse + Veri İndirme Merkezi Card + Danger Zone delete modal: TR-locale initials pattern "Taha Ahmet Sıbıç"→"TAS" + checkbox + 5s countdown + secondary CTA `/data-export` target=_blank); palette 9 URL migrate `#anchor` → `?tab=…` + yeni `profile:privacy` entry; ShellV2 hash backward-compat mount effect (HASH_TO_TAB + history.replaceState)
- `cf7d977` **PrivacyTab fix** — Veri İndirme Merkezi Card kopya: "Verilerimi İndir" → "Veri İndirme Merkezi"; inline blob download → `/data-export` redirect (richer page: kategori filtre + dosya boyutu); ExternalLink icon + italic subtext "Ayrı sayfada kategori seçimi gösterilir"; modal secondary CTA `target="_blank"` modal kapanmasın
- `5146b0a` **Commit 5/N — HealthReportTab** — Sağlık Raporu placeholder → gerçek tab (4 bölüm MVP): vitality ring (legacy parity formula inline) + 4 stat cards (💊 ilaç / 🌿 takviye / ⚠️ alerji / 🩸 tahlil) + 6-badge preview (`evaluateBadges` + `BadgeIcon`) + SBAR PDF card. Reuse: `PDFDownloadButton` (Premium gate içinde) + `calculateProfilePower` + `FamilyProfileGuard` full-block (engagement privacy + SBAR leak sidestep). `useProfileData` additive extension: `streakDays` (daily_check_ins consecutive count) + `familyMemberCount` (family_members.owner_id). `profile.healthReport.*` namespace 15 key TR/EN. Smoke #4 KRİTİK doğrulama (İlaç ekle → Sağlık Raporu'na dön → sayı +1 hard refresh yok) geçti — `refetch()` wiring sağlam. Digital Twin hero polish + Recent Activity multi-source feed + Missing Nudges Session 46 enrichment'a ertelendi (scope disiplini). PlaceholderTab retired.
- `d0b68d9` **Commit 6.1/N — Vitality extract + SBAR targetUserId** — `lib/vitality.ts` YENİ helper: `computeVitalityScore({ profileCompletionPct, streakDays, hasMedications, hasAllergiesOrChronic }) → { score, color, hexColor, labelKey }`. HealthReportTab + legacy aynı helper'dan besleniyor (Commit 6.2'de legacy silinirken duplicate otomatik gitti). `PDFDownloadButton` `targetUserId?:` OPTIONAL prop + iki `/api/sbar-pdf` fetch body'si (handleDownload + handleEmailSend) `targetUserId` forward ediyor. HealthReportTab + Legacy `activeUserId` geçiyor. Endpoint tarafı VERIFY-only: `/api/sbar-pdf` body.targetUserId satır 32-34'te `resolveTargetUser` helper'ına düşüyor — `lib/family-permissions.ts` accepted membership + `allows_management` + Premium kontrol ediyor. Defense-in-depth: caller eski pattern (prop/body omit) geçerli → backward-compat. Vitality parity Taha profilinde 68/100 doğrulandı.
- `2fe550e` **Commit 6.2/N — Legacy demolition + redirect** — `app/profile/page.tsx` 2193 LOC → **39 LOC wrapper**: ShellV2 render + `?legacy=true` useEffect içinde silent strip (`router.replace(pathname + cleaned search + hash, { scroll: false })`, query/hash diğer param'lar preserve). `ProfileGamification.tsx` 312 → 144 satır (3 orphan export silme: `ProfilePowerHeader` + `ProfilePowerHeaderProps` + `LEVEL_CONFIG`, `EmptyStateCTA` + `EmptyCTAProps`, `getCompletionMessage`; framer-motion + useReducedMotion importu da kaldırıldı). KORUNDU: `calculateProfilePower` + types (HealthReportTab), `SectionXPBadge` (AllergiesSection), `MotivationCard` (AllergiesSection + LifestyleSection). Plan'da "5 orphan" tahmini grep ile 3'e revize edildi — MotivationCard + SectionXPBadge canlıydı, sahte pozitif idi. `InlineEdit.tsx` silme (zero external usage). `PlaceholderTab.tsx` silme (Commit 5'te retired). **Net −2450 LOC.** 6 smoke regression test'i (`/profile`, `?legacy=true`, `?legacy=true&tab=ilaclar`, `#allergy-card`, 11/11 tab, SBAR Premium modal) hepsi geçti.

**DELETE endpoint audit (Commit 4 öncesi):** `/api/user-data` DELETE sağlam — Bearer auth isolated + service role admin privilege + 3-faz 18 tablo manuel + schema CASCADE hibrit cleanup + auth.admin.deleteUser. F-PRIVACY-001 (P2) endpoint table list güncel değil (cascade kapatıyor ama belt-and-suspenders eksik), F-PRIVACY-002 (P2) consent audit trail retention policy not edildi.

**F-PROFILE-001 ✅ CLOSED:**

| Tab | Durum |
|---|---|
| Genel / Vücut & Yaşam / Tıbbi Geçmiş / İlaçlar / Takviyeler / Alerjiler / Aşılar / Aile Öyküsü / Üreme / Gizlilik & Rıza / Sağlık Raporu | ✅ **11/11** |
| Legacy 2193-LOC monolith | ✅ **Silindi (Commit 6.2, −2450 net LOC). ShellV2 tek canonical source.** |

**F-SAFETY full coverage:**
- 4 insert path bağlandı (profile + scanner + 15-day dialog + onboarding)
- 5 kategori matrix (drug-drug + drug-chronic + drug-supplement + drug-allergy + drug-condition)
- Persistent banner DB-backed (F5 restore + dismiss/resolve/auto-resolve)
- 24-h confirm 3-state lock (alert açıkken self-certify engellendi)
- Doctor mailto template prefill

**Build:** Her commit sonrası `tsc --noEmit && npm run build` temiz (241 sayfa, 0 error/warning).

**Manuel adım (kullanıcı Supabase Studio — ✅ DONE):**
- `supabase/migrations/20260423_medication_interaction_alerts.sql` apply (F-SAFETY-002.2 persistence). Amoksilin + Penisilin F5 restore ile canlıda doğrulandı.

**Session 46 backlog (15 ticket):**

P0 — Kritik:
- F-AUTH-003 (P0) — Email doğrulama resend butonu

P1 — Yüksek:
- F-SAFETY-002.3 (P1) — Mailto fallback modal (no default mail handler edge case)
- F-SCANNER-001 (P1) — OCR "Analiz başarısız" diagnostics
- F-DRAFT-001 (P1) — Profile inline edit draft persistence
- **F-PAYMENT-001 (P1, dependency-gated — şirket kuruluşu bloklu)** — Iyzico ödeme entegrasyonu
  - **DEPENDENCY:** Şirket kuruluşu (company registration) tamamlanana kadar BLOKLU
  - **Kapsam:** Iyzico sandbox API keys + Premium subscription checkout + 3D Secure flow + webhook success/fail handling + receipt PDF + Mesafeli Satış Sözleşmesi v2 referansı
  - **Efor:** ~6-8 saat (Iyzico docs + sandbox test + canlı switch)
  - **Legal prep:** Mesafeli Satış Sözleşmesi v2.1 + Abonelik Sözleşmesi v1 hazır (Session 34 draft); legal advisor review (~₺3-5K) ödeme entegrasyonu öncesi ŞART
  - **Activation trigger:** Company registration ilerleyince Session 47+'da P0'a yükselir

P2 — Orta:
- F-SAFETY-002.1 (P2) — Onboarding dangerous override modal (wizard finale flow)
- F-SAFETY-004 (P2) — Banner lokalizasyon EN/TR mix fix
- F-PRIVACY-001 (P2) — DELETE endpoint table list güncellemesi (family_history_entries, medication_interaction_alerts, pain_records, health_imports, health_metrics, radiology_reports, prospectus_scans, verification_documents explicit ekle)
- F-PRIVACY-002 (P2) — Consent audit trail retention policy (regulatory research)
- F-SETTINGS-001 (P2) — Şifre validation buton disabled
- F-MED-DB-001 — Warfarin fuzzy match bug

P3 — Düşük:
- F-PRIVACY-003 (P3) — PrivacyTab inline quick export (ZIP+JSON Advanced mode)

Ürün enrichment:
- HealthReportTab Session 46 enrichment — Digital Twin hero polish (body silhouette / organ map) + Recent Activity multi-source feed (son 5 ilaç + 3 uyarı + 1 tahlil) + Missing Nudges (cross-tab navigation via setTab prop drilling)
- AI chat günlük 3 soru quota (freemium — şu an Free 20/gün)
- Water context 3.1 (snapshot-rollback, setTarget persist)
- Achievement card i18n (brand-style isimler)

Technical debt carry-over:
- ESLint 127 library error sweep (Session 43'ten devam)
- `health_metrics.steps` integration → movement ring user step target (Apple Health / Google Fit)
- TodayView water update WaterIntakeContext'e migrate
- `lib/vitality.ts` unit test scaffold (Jest/Vitest)

**Session 46'ya devir:** F-PROFILE-001 KAPANDI. Öncelik sırası: F-AUTH-003 (P0 resend) → F-SAFETY-002.3 (P1 mailto fallback) → F-SCANNER-001 (P1 OCR) → F-DRAFT-001 (P1 draft). Ürün tarafında HealthReportTab enrichment Taha+İpek birlikte karar verecek. Iyzico şirket tescili bekleyişi devam.

---

### Session 46 — Bug Fixes + UX Redesigns + Health Claims 6.2 (Full Closure) (24-26 Nisan 2026) — Tamamlandı

**Ana iş:** 11 commit (`ab52cf0..1533553`), 5 sprint teması — Session 45 öncelik sırasından sonra UX overhaul + health claims compliance kickoff:

1. **Bug fixes / observability** — F-AUTH-003 (email resend), F-SAFETY-002.3 (mailto fallback modal), F-SCANNER-001 (OCR observability + timeout)
2. **UX redesigns** — F-CHECKIN-UI-001 (daily check-in modal Apple Health-tarzı), F-MEDDAILY-UI-001 + 002 (medication confirmation modal yenilenme + ilaç listesi + empty state)
3. **Feature additions** — F-DRAFT-001 (medication + allergy add form draft persistence), F-CHAT-SIDEBAR-001 (conversation sidebar redesign)
4. **Health claims compliance** — F-HEALTH-CLAIMS-001 audit + master plan + 6.2 (3 AI-driven sayfaya AIDisclaimer mount) + 6.2.1 (sleep state field fix + sleep.continue i18n)
5. **Docs meta** — mid-session checkpoint + closure

**Grup dağılımı (12 total = 11 kod + 1 closure docs):**

| Grup | Commit sayısı |
|---|---|
| Bug fixes / observability | 3 |
| UX redesigns | 3 |
| Feature additions | 2 |
| Health claims compliance | 2 |
| Docs meta (mid-session faff122) | 1 |
| Closure docs (bu commit) | 1 |
| **Toplam** | **12** |

**11 commit (`ab52cf0..1533553`):**

| SHA | Ticket | Priority | Test |
|---|---|---|---|
| `ab52cf0` | F-AUTH-003 — email verification resend button + rate-limited cooldown | P0 | ✅ TESTED |
| `d17e644` | F-SAFETY-002.3 — ask-doctor mailto fallback modal | P1 | ✅ TESTED |
| `cc47420` | F-SCANNER-001 — OCR error categorization + observability + timeout | P1 | ✅ TESTED |
| `0461913` | F-DRAFT-001 — medication + allergy add form draft persistence | P1 | ✅ TESTED |
| `faff122` | docs: mid-session checkpoint | meta | — |
| `82953b5` | F-CHECKIN-UI-001 — daily check-in modal redesign (bottom sheet, hybrid auto-advance, pulse icon) | UX | ✅ TESTED |
| `d6aa0db` | F-MEDDAILY-UI-001 — daily medication confirmation modal redesign (primary CTA, warmer tone, pill icon) | UX | ✅ TESTED |
| `ee5716e` | F-MEDDAILY-UI-002 — daily mode ilaç listesi + empty state + handleGoToProfile URL fix | UX | ✅ TESTED |
| `74cdb9f` | F-CHAT-SIDEBAR-001 — conversation sidebar redesign (temporal groups, hover delete, active state) + RLS + endpoint | feat | ✅ TESTED |
| `cda78a9` | F-HEALTH-CLAIMS-001 6.2 + master plan — 3 AI-driven sayfaya AIDisclaimer mount + audit + sprint splitting | compliance | ✅ TESTED |
| `1533553` | F-HEALTH-CLAIMS-001 6.2.1 — sleep-analysis state field fix (!loggedToday) + sleep.continue i18n | compliance | ✅ TESTED |

#### F-AUTH-003 (P0) `ab52cf0` — TESTED ✅
Sign-up success sonrası "Email tekrar gönder" butonu + login'de "Email not confirmed" error detection → aynı button + email pre-fill. Already-confirmed → sign-in tab'a auto-flip + email auto-fill. 60s localStorage cooldown (tab close survive) + Supabase native 60s server cooldown = çift guardrail. `NEXT_PUBLIC_AUTH_RESEND=false` Vercel kill switch (2dk emergency disable). 9 yeni `auth.resend.*` key.

#### F-SAFETY-002.3 (P1) `d17e644` — TESTED ✅
Opera GX / PWA silent mailto fail → deterministik AskDoctorModal (her click açılır). Dialog reuse + `navigator.clipboard.writeText` + optional doktor email prepend + native mailto retry + always-visible amber hint. Banner `onAskDoctor` prop signature dokunulmadı (backward-compat). 11 yeni `safety.askDoctor.*` key.

#### F-SCANNER-001 (P1) `cc47420` — TESTED ✅ (Session 47'de smoke testi geçti)
6 stage error categorization (auth / rate-check / body-parse / image-validate / claude-call / response-parse / success-envelope) + error shape `{ error, code, stage, detail }` + Sentry captureException + breadcrumb (image base64 LOG'LANMAZ / KVKK) + parsed.error blocked-envelope detection (422 consent_blocked / ocr_failed) + `maxDuration = 50` + AbortController 55s + dev-gated console.error. 5 yeni `scan.error.*` key. **Smoke test:** Augmentin kutusu OCR happy path PASS, "Görüntü okunamadı — daha net bir fotoğraf dene" localized error confirmed.

#### F-DRAFT-001 (P1) `0461913` — TESTED ✅ (Session 47'de smoke testi geçti)
`lib/ui/draft-persist.ts` Session 42'de yazılmıştı ama ShellV2'de wire edilmemişti. Lazy `useState(() => readDraft(...))` (flash guard) + per-keystroke persist + success-path clearDraft + cancel'da draft korunur (FamilyHistorySection parity). `userId` suffix multi-user browser KVKK guard. `DRAFT_KEYS.profileAllergyAdd` eklendi. **Smoke test:** Aspirin draft Medications ↔ Takviyeler tab değişiminde restore oldu.

#### F-CHECKIN-UI-001 `82953b5` — TESTED ✅
Daily check-in modal Apple Health-tarzı redesign. Dialog primitive bırakıldı (custom div backdrop + bottom sheet pattern), 3-satır header (Geri / progress bar / büyük başlık), badge yerine progress bar, hybrid auto-advance (400ms delay + İleri immediate path), framer-motion emoji pop, animate-gentle-pulse step icon, son adım `Tamamla` (auto-save engellenir). Yeni `gentlePulse` keyframe globals.css.

#### F-MEDDAILY-UI-001 + 002 `d6aa0db` + `ee5716e` — TESTED ✅
Daily medication confirmation modal yenilenme: Pill icon emerald-50 daire container, buton renk swap (Evet primary, Güncelle outline), `rounded-3xl` (sadece daily mode override), samimi soru metni. Sonra inline ilaç listesi (emerald-50 container, "Concor 5mg" tarzı satırlar, max 200px scroll) + ilaçsız kullanıcı empty state ("Evet, kullanmıyorum" + "Bir ilaç ekle") + loading-flash mitigation. **Bonus fix:** `handleGoToProfile` URL `?tab=medications` → `?tab=ilaclar` (Session 45 Commit 4 sonrası TR-canonical tab id, daily + 30day mode'a fayda). 30day/15day mandatory mode'lara dokunulmadı.

#### F-CHAT-SIDEBAR-001 `74cdb9f` — TESTED ✅
Conversation sidebar redesign (Sağlık Asistanı): temporal groups (Bugün / Dün / Son 7 Gün / Son 30 Gün), active conversation marker (bg-emerald-100 + emerald-700 icon/text + font-semibold), hover Trash2 button (group-hover:opacity-100, e.stopPropagation), MessageSquare icon her satırda, destructive Dialog confirm + optimistic delete + rollback on 4xx/5xx + sonner toast. **Backend:** `query_history` DELETE RLS policy (migration 20260424_query_history_delete_policy.sql, user Supabase Studio'da apply etti — 4 policy satır SELECT/INSERT/UPDATE/DELETE), `app/api/query-history/[id]/route.ts` DELETE endpoint (Bearer auth + UUID smell test + user-scoped supabase client + 404-as-RLS-block, service role kullanılmadı). 8 yeni `ch.*` key. Aktif sohbet silindiyse `?q=` URL temizlenir + ChatInterface reset.

#### F-HEALTH-CLAIMS-001 6.2 + master plan `cda78a9` — TESTED ✅
Türkiye TİTCK + EFSA health claims risk audit (3 paralel Explore agent). **Audit bulguları:** 0 direkt "tedavi/şifa/kür" ✅, 2 direkt functional claim vulnerable audience'lara (cortisol/energy), 11 i18n example soru, 4 endpoint EFSA gating eksik (supplement-check 🔴 CRITICAL, anti-inflammatory 🔴 HIGH, daily-care-plan ⚠️, blood-analysis ⚠️), output filter Layer 3 "destekler+mekanizma" pattern eksik. **Master plan** (docs/plans/F-HEALTH-CLAIMS-001-master-plan.md): 4 alt-sprint (6.2 hemen / 6.1 prompt+EFSA whitelist avukat sonrası / 6.3 hardcoded string fix avukat sonrası / 6.4 query_history retention opsiyonel) + 7 hukuki soru + risk register. **6.2 implement:** 3 AI-driven sayfaya AIDisclaimer mount — `app/mental-wellness/page.tsx` (`analysis && showAnalysis`), `app/sleep-analysis/page.tsx` (`analysis || microInsight`), `app/sports-performance/page.tsx` (`state.result`). Anti-inflammatory + supplement-compare AI çağrısı yapmadığı için scope dışı (research bulgusu). `responseId = useMemo(crypto.randomUUID, [aiState])` per-analiz KVKK objection group.

#### F-HEALTH-CLAIMS-001 6.2.1 `1533553` — TESTED ✅
6.2 cut'ta sleep-analysis disclaimer conditional sadece `(analysis || microInsight)` üzerine kuruluydu — ama sayfanın en çok görülen yüzeyi MorningCard `!loggedToday` koşulunda mount ediliyor → AI guess + chip prompts disclaimer'sız. Conditional `(analysis || microInsight || !loggedToday)` ve useMemo deps `[analysis, microInsight, loggedToday]` güncellendi. **Bonus fix:** useMemo declaration sırası taşındı (TDZ guard — `loggedToday` state useMemo'dan SONRA declare ediliyordu, runtime ReferenceError riski). `sleep.continue` i18n key eklendi (commonToolKeys.ts) — MorningCard "adjust" + "factors" step CTA'da raw "sleep.continue" görünüyordu, EN inline `|| "Continue"` fallback vardı ama TR kapsanmıyordu.

**Sonuç:**
- F-HEALTH-CLAIMS-001 6.2 ✅ CLOSED — 3 AI-driven sayfada AIDisclaimer canlıda; 6.1 / 6.3 / 6.4 avukat görüşmesi sonrası
- F-CHAT-SIDEBAR-001 ✅ CLOSED — RLS DELETE policy + endpoint + redesigned sidebar canlıda
- 3 UX redesign canlıda (check-in modal + 2 med confirm + chat sidebar)
- Audit-driven hukuki uyumluluk başlatıldı (master plan: docs/plans/F-HEALTH-CLAIMS-001-master-plan.md)
- 0 revert — disiplinli plan + onay + smoke test pattern korundu
- Build her commit sonrası temiz (tsc 0 error, Next.js 0 warning, 241 sayfa prerendered)

**Manuel adım (kullanıcı Supabase Studio — ✅ DONE):**
- `supabase/migrations/20260424_query_history_delete_policy.sql` apply (F-CHAT-SIDEBAR-001 RLS DELETE). Verify `pg_policies WHERE tablename = 'query_history'` → 4 satır.

**Session 47'ye devir:** Smoke testler PASS (F-SCANNER-001 + F-DRAFT-001 her ikisi TESTED — Session 47'de Augmentin OCR + Aspirin draft restore doğrulandı). F-CHAT-SIDEBAR-002 Session 47'de tek commit'te kapatıldı (8/8 PASS, fbd3d82). Avukat sonrası F-HEALTH-CLAIMS-001 6.1/6.3/6.4 sıraya alındı. Iyzico şirket kuruluşu bekleyişi devam.

---

### Session 47 — Mini-Opening — F-CHAT-SIDEBAR-002 + 003 + Scanner Mime Fix (26-27 Nisan 2026) — AÇIK

**Durum:** Sağlık Asistanı sidebar UX'i tamamlanma sprintinin gece açılışı kapandı — pin/rename + auto-title canlıda çalışıyor, scanner OCR mime bug fix'i landed. Session 47 hâlâ AÇIK; sıradaki büyük iş **avukat görüşmesi sonrası F-HEALTH-CLAIMS-001 6.1/6.3/6.4**. Session 46'nın 11/11 commit'i artık TESTED (önceden 9/11 + 2 PENDING idi).

**3 feature commit + 1 docs commit:**

- `fbd3d82` **F-CHAT-SIDEBAR-002 (P1) — Conversation sidebar pin + rename with 5-pin limit ✅ TESTED 8/8**
  - Migration `supabase/migrations/20260426_query_history_pin_rename.sql` apply edildi (3 kolon: `is_pinned BOOLEAN DEFAULT false NOT NULL`, `custom_title TEXT NULL`, `pinned_at TIMESTAMPTZ NULL`). Mevcut UPDATE RLS policy (`auth.uid() = user_id`) yeterli — yeni policy eklenmedi, field-level gating endpoint katmanında.
  - `app/api/query-history/[id]/route.ts` — DELETE'in altına PATCH eklendi (DELETE pattern parite: manual auth + UUID smell test + user-scoped client, no service role). Body whitelist `{ is_pinned?, custom_title? }`. pinned_at follows is_pinned: NOW() on pin, NULL on unpin. Pin limit 5 server-side: HEAD-mode count `.eq("is_pinned", true).neq("id", id)` ile patch edilen satır exclude (re-pin no-op). 409 `{ error: "PIN_LIMIT_REACHED", limit: 5 }`. 100-char custom_title cap (whitespace-trim, empty → null fallback to query_text).
  - `components/chat/ConversationHistory.tsx` — 3-nokta `MoreHorizontal` trigger replaces Trash2 button → `DropdownMenu` (Pin/PinOff + Pencil + Trash2 destructive). Inline rename: title cell `<input maxLength={100}/>` (Enter save / Esc cancel / blur save — ChatGPT/Claude UX). Pinned grup en üstte ("Sabitlenenler"), LIFO sıralama (pinned_at DESC + created_at fallback). Pinned satırlarda MessageSquare → Pin icon swap. Optimistic + rollback + sonner toast for pin and rename (delete F-CHAT-SIDEBAR-001 intact). 409 → distinct toast `ch.pinLimitReached` vs generic `ch.pinError`.
  - 12 yeni `ch.*` i18n key (pinned, pin, unpin, rename, menuAria, renamePlaceholder, renamed, renameError, pinSuccess, unpinSuccess, pinError, pinLimitReached).
  - **Smoke test 8/8 PASS:** dropdown menu + 3 seçenek / Pin akışı + Sabitlenenler grubu + toast / LIFO sıralama (en son pinlenen üstte, kanıtlandı) / 5-pin limit (6. pinde toast.error "En fazla 5 sohbet sabitleyebilirsin. Önce birini kaldır." + rollback) / Rename + blur save (Enter şart değil) / ESC cancel (eski başlık geri) / maxLength 100 (154 karakter yapıştırıldı, sadece 100 aldı) / Delete regression intact (AlertDialog "Sohbeti sil? Bu işlem geri alınamaz." → toast → sidebar update).
  - Build: tsc 0 error, Next.js 0 warning, 241 sayfa, 11.9s compile.

- `63e1987` **docs: Session 47 mini-opening (önceki docs)** — F-CHAT-SIDEBAR-002 closure + Session 46 PENDING tests confirmed (cc47420 + 0461913 → TESTED).

- `406fdeb` **fix(scanner): detect actual image mime type for Claude Vision** — Kullanıcı tarafından gece eklendi (smoke test sırasında fark edilen küçük bağımsız fix). F-SCANNER-001 OCR akışında Claude Vision çağrısına gönderilen image MIME type artık magic-byte detection ile tespit ediliyor — önceden hardcoded mime gönderiliyordu, bazı PNG'ler JPEG diye etiketlenebiliyordu. Bu commit'in bizim implementasyonumuza dokunduğu yer yok, F-SCANNER-001 davranışı sertleşti.

- `5514a9b` **F-CHAT-SIDEBAR-003 (P1) — Otomatik Sohbet Başlığı ✅ TESTED**
  - Sidebar'da yeni sohbetler "selam" / "hi" / ham query_text yerine 3-4 kelimelik AI-üretimli başlıkla görünüyor. Kullanıcının manuel rename'i (F-CHAT-SIDEBAR-002) auto-title'ı her zaman trump eder.
  - Yeni endpoint `app/api/query-history/[id]/auto-title/route.ts` (POST) — alt-dizin patterning ile DELETE/PATCH endpoint'inden ayrıldı (concept separation, CRUD değil generation operation).
  - **4 defansif kural (mandatory):**
    1. **Idempotency guard:** Endpoint başında SELECT row → custom_title set ise 200 + `{ ok: true, skipped: true, reason: "already_titled" }`. Race-safe `.is("custom_title", null)` filter UPDATE'te de var (manuel rename LLM call sırasında landed olursa "race_lost" reason döner). Double-trigger no-op.
    2. **Rate limit:** User-scoped 30/min (gerçek kullanıcı kullanım profilini aşar) + global per-instance circuit breaker 100/min (aşılırsa 5dk 503 penalty box, runaway loop fatura yakmaz).
    3. **Sentry observability:** 12 stage breadcrumb (triggered / circuit-open / rate-limited / auth-failed / uuid-invalid / row-not-found / skipped-already-titled / llm-call-start / success / failed / db-update-success / failed) — F-SCANNER-001 `captureScannerFailure` pattern parite (dynamic Sentry import, Sentry-less deploy safe). LLM çıktısı asla raw log'lanmaz — sadece `titleLength` field'ı.
    4. **Cleanup discipline:** ConversationHistory ayrı useEffect window event listener — handler closure-scoped (each mount/unmount adds and removes the same reference, strict-mode safe), `fetchHistory` zaten useCallback (stable identity).
  - LLM: `askClaudeJSON` MODEL_DEFAULT (haiku) + `skipConsent: true` (same conversation context already consented via `/api/chat`). Maliyet ~$0.00003/title. SYSTEM_PROMPT: "match the user's language exactly... no punctuation other than commas, no emojis, no quotes... output JSON only".
  - `/api/chat` route refactor: pre-stream INSERT (empty response_text → conversationId capture) + post-stream UPDATE (response_text fill) + `X-Conversation-Id` response header (`Access-Control-Expose-Headers` set, cross-origin embed safe). Pre-INSERT fail olursa fallback eski single-INSERT path'ine geri döner (history visibility hiç bozulmaz).
  - ChatInterface stream-end: header oku → fire-and-forget POST → success/skipped sonrası `window.dispatchEvent("conversation-updated")`. Failures silent (toast yok) — worst case row query_text fallback'iyle görünür, kullanıcının zaten bugün gördüğü davranış.
  - ConversationHistory: ayrı useEffect listener `fetchHistory` tetikler → long-standing F5-required gap (yeni mesaj sonrası sidebar refresh olmuyordu) kapatıldı.
  - Migration GEREKMEDİ — `custom_title` kolonu zaten F-CHAT-SIDEBAR-002 migration'ından mevcut.
  - Build: 241 → 242 route (yeni dynamic `[id]/auto-title`), tsc 0 error, Next.js 0 warning, 11.4s compile.
  - **Smoke test PASS:** "uyku problemim var" yazıldı → AI cevap → ~3-5sn sonra sidebar otomatik refresh, başlık "Uyku problemi ve çözümleri" üretildi. Eski sohbetler dokunulmadı (idempotency guard çalıştı).

- `[bu commit]` **docs: Session 47 checkpoint** — 4 commit yansıtacak şekilde Session 47 entry'sine F-CHAT-SIDEBAR-003 + scanner mime fix eklendi. Session 47 hâlâ AÇIK (kapanış avukat sonrası F-HEALTH-CLAIMS-001 ile gelir).

**Sıradaki (kalan P1 — avukat-gated):**

- **F-HEALTH-CLAIMS-001 6.1** — Prompt centralize (supplement-check / anti-inflammatory / daily-care-plan inline → lib/prompts.ts) + EFSA whitelist (lib/efsa-approved-claims.ts) + output filter Layer 3 extend ("destekler+mekanizma" pattern + EFSA cross-check). Avukat soru 1 + 6 cevabı pre-condition. ~3-4h.
- **F-HEALTH-CLAIMS-001 6.3** — Hardcoded string fix (2 direct claim cortisol/energy + 8 question-format examples). Avukat soru 2 + 3 cevabı pre-condition. ~1h.
- **F-HEALTH-CLAIMS-001 6.4 (opsiyonel)** — query_history retention strategy. Avukat soru 4 + 5 cevabı pre-condition; "no-op" cevabı gelirse SKIP. ~30dk-2h.

**Avukat görüşmesi (kritik blocker):**
- 7 hukuki soru hazır (audit raporu G bölümü + master plan referansı)
- Mesafeli Satış + Abonelik Sözleşmesi v2 ile birlikte tek seansta görüşülür
- Tahmini: bu hafta veya gelecek hafta
- Avukat onayı F-HEALTH-CLAIMS-001 6.1/6.3/6.4'ü unlock eder

**P2:**
- F-PRIVACY-001 — DELETE endpoint table list (family_history_entries, medication_interaction_alerts, pain_records, health_imports, health_metrics, radiology_reports, prospectus_scans, verification_documents)
- F-PRIVACY-002 — Consent audit trail retention policy (regulatory research)
- F-SETTINGS-001 — Şifre validation buton disabled
- F-MED-DB-001 — Warfarin fuzzy match bug

**P3:**
- F-PRIVACY-003 — PrivacyTab inline quick export (ZIP+JSON Advanced)

**Ürün enrichment:**
- HealthReportTab enrichment — Digital Twin hero polish + Recent Activity multi-source feed + Missing Nudges (cross-tab setTab prop drilling) (3-4h)
- AI chat günlük 3 soru quota (freemium teaser — şu an Free 20/gün)
- Water context 3.1 (Session 44 backlog B1/B2/B3: snapshot-rollback, setTarget persist)
- Achievement card i18n (brand-style isimler)

**Tech debt carry-over:**
- ESLint 127 library error sweep (Session 43+)
- `health_metrics.steps` integration → movement ring user step target (Apple Health / Google Fit)
- TodayView water update WaterIntakeContext'e migrate
- `lib/vitality.ts` unit test scaffold (Jest/Vitest)

**Dependency-gated:**
- F-PAYMENT-001 — Iyzico ödeme entegrasyonu (şirket kuruluşu bekleniyor)
