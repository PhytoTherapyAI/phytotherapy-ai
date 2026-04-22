# CLAUDE.md — DoctoPal Proje Anayasası v52.2 (Post-Hackathon)

## Hızlı Bağlam

**DoctoPal** — kanıta dayalı fitoterapi + modern tıp köprüsü kuran AI sağlık asistanı.
- **Ekip:** 3 tıp öğrencisi, teknik bilgi yok — Claude tüm kodu yazıyor
- **Hackathon:** Harvard "Building High-Value Health Systems" (11-12 Nisan 2026) — **TAMAMLANDI**
- **IGNITE 26 kazanıldı** — core tool'lar + aile profili jüri önceliği
- **Domain:** doctopal.com (Vercel) | **GitHub:** github.com/PhytoTherapyAI/phytotherapy-ai
- **Sunum dili:** İngilizce | **Arayüz:** TR/EN toggle
- **Deploy:** Vercel + Supabase (email auth + Google/Facebook OAuth)
- **AI Motor:** Anthropic Claude API (claude-haiku-4-5) + Embedding: Gemini text-embedding-004
- **Post-hackathon modu:** Premium gate'ler aktif. Ücretsiz plan core özellikleri, premium sınırlı özellikleri açar.
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

## HARVARD HACKATHON ROADMAP (7-11 Nisan 2026)

> IGNITE 26'da jüri kararı: **Core tool'lar + Aile Profili** öncelikli. Diğer tool'lar hackathon sonrasına.

### 1. Sağlık Asistanı (Core) ✅ TAMAMLANDI (Session 32)
- [x] Acil durum database verisi iyileştir (40+ yeni red keyword: pediatrik, mental-health eşik, anaphylaxis pattern, stroke FAST/cardiac atypical + safe-context severity escalation)
- [x] Daha gerçekçi ve kişiselleştirilmiş cevaplar (SYSTEM_PROMPT overhaul + 4 few-shot örnek + profil context enrichment: diet_type, exercise_frequency, sleep_quality 7-gün avg)
- [x] Daha net, anlaşılır cevaplar (prompt çelişkisi çözüldü, adaptif format/uzunluk, KVKK uyumlu "sen" hitabı, yellow code UI card)

### 2. Etkileşim Deneyleyici (Core)
- [ ] İlaç girmeden de kullanılabilsin (uyarı mesajı ile: "İlaçlarınızı girmeden önerileri kullanmayın")
- [ ] Asistan gibi panel'e al (etkileşimi panelde göster)

### 3. Takvim & Panel
- [ ] Genel kontrol ve düzeltme

### 4. Kan Testi & Radyoloji ✅ TAMAMLANDI (Session 32)
- [x] Kan testi PDF çalıştır (Claude Vision multimodal extraction zaten çalışıyordu; Session 32'de trend analizi + BLOOD_TEST_PROMPT yaş/cinsiyet bazlı ref + strict JSON schema + interaction check eklendi)
- [x] Radyoloji cevaplarını iyileştir (RadiologyReport PDF Türkçe karakter fix NotoSans + radiology_reports DB tablosu structured storage + PROSPECTUS_PROMPT lib/prompts.ts'e taşındı + interaction rules zenginleştirildi)

### 5. Onboarding Revizyon (BÜYÜK)

**Genel:**
- [ ] İlk sayfaya rahatlatıcı cümle: "Her şeyi sonradan düzenleyebilirsiniz"
- [ ] Her sayfaya başlık uyumlu disclaimer: neden sorulduğu + işine yarayacağı
- [ ] Logo/isim DoctoPal olacak, "Ne kadar çok bilgi = o kadar iyi cevap" mesajı
- [ ] Çıkış yapılırsa girilmiş verileri kaydetsin

**Adım 1 — Kişisel Bilgiler:**
- [ ] Ad Soyad / Rumuz / "Sana nasıl hitap edelim"
- [ ] Doğum tarihi UX iyileştirme (daha güzel, kolay)
- [ ] Cinsiyet seçtikten sonra İngilizce çeviri fix

**Adım 2 — İlaçlar:**
- [ ] İlaç seçilince doz + kullanım sıklığı prospektüse göre otomatik atasın
- [ ] Özel doz varsa hasta girsin + "Dozunuzu doğru girdiğinizden emin olun" disclaimer

**Adım 3 — Alerjiler:**
- [ ] Autocomplete + dropdown menü
- [ ] Zorunluluk kalkacak (opsiyonel)
- [ ] "Şiddet" → "Reaksiyon Tipi" olacak:
  - Anafilaksi (Nefes Darlığı/Şok) — mutlak kontrendikasyon
  - Kurdeşen / Yaygın Döküntü — yüksek riskli blokaj
  - Hafif Kaşıntı / Lokal Kızarıklık — "doktoruna danış" seviyesi
  - Mide Bulantısı / İshal (İntolerans) — yan etki, alerji değil
  - Bilmiyorum / Hatırlamıyorum — kaçış seçeneği

**Adım 5 — Bağımlılık (Sigara/Alkol):**
- [ ] 3 ana buton: Hiç İçmedim (geç) / Eski İçici / Aktif İçici
- [ ] Dinamik sorular (chip/dropdown, klavye yok):
  - Günde ne kadar? (10 dal / 1 paket / 1.5+)
  - Kaç yıl? (1-5 / 5-15 / 15+)
  - (Eski içici) Ne zaman bıraktı? (Son 1 yıl / 1-5 yıl / 5+ yıl)
- [ ] Alkol için de aynı mantık

**Adım 6 — Özgeçmiş (Kronik Hastalıklar):**
- [ ] Temiz kağıdı butonu: "Bilinen kronik hastalığım yok" (seçerse geç)
- [ ] Kritik durumlar: Kanama Bozukluğu, Hamilelik/Emzirme, Bağışıklık Baskılanması, İleri Böbrek/KC Yetmezliği
- [ ] Sistemlere göre çipler:
  - Kardiyovasküler: Hipertansiyon, Aritmi, Kalp Yetmezliği
  - Endokrin: Diyabet (Tip 1/2), Tiroid
  - Nörolojik: Depresyon/Anksiyete, Epilepsi
  - Solunum: Astım, KOAH
- [ ] Cerrahi: Mide/Bağırsak ameliyatı (bariatrik vb.)

**Yeni — Soygeçmiş Adımı:**
- [ ] Temiz kağıdı: "Akrabalarımda genetik/kronik hastalık yok"
- [ ] Majör genetik çipler: Erken kalp krizi (<55), Diyabet, Tiroid, Ailevi Kanser (Meme/Kolon/Prostat), Alzheimer, Bipolar/Şizofreni
- [ ] "Neden Soruyoruz?" bilgilendirme metni

**Adım 7 — Onay Sayfası:**
- [ ] Tıbbi Sorumluluk Reddi: "Acil durumlarda kullanılamaz — 112" cümlesi eklenmeli
- [ ] KVKK Açık Rıza: "Özel Nitelikli Kişisel Veri" + "açık rıza" ifadesi zorunlu
- [ ] Bold ile kritik kelimeler vurgulu
- [ ] Onay kutusu: "...DoctoPal'ın profesyonel doktor yerine geçmediğini anlıyor; KVKK kapsamında açık rıza gösteriyorum"

### 6. Profil Güçlendirme Sayfası (Yeni)
- [ ] Progressive Disclosure: zorunlu değil, "Profilini Güçlendir" başlığı
- [ ] Sosyodemografik: Yaşadığı şehir/bölge, Medeni hal (Yalnız/Evli/Ailesiyle), Sigorta (SGK/Özel/Tamamlayıcı/Yok)
- [ ] Beslenme: Standart / Vegan / Aralıklı Oruç / Karnivor
- [ ] Fiziksel Aktivite: Hareketsiz / Düzenli Spor / Ağır Antrenman
- [ ] Çalışma Düzeni: Gündüz-Masa Başı / Vardiyalı-Gece
- [ ] Boy/Kilo (BMI hesaplama)
- [ ] Akıllı cihaz kullanımı (switch)

### 7. Aile Profili (Netflix Tarzı) ✅ TAMAMLANDI
- [x] Netflix profil sekmesi şeklinde profil ekleme (/select-profile)
- [x] Üye ekleme = davet ile (/api/family/invite + Resend email)
- [x] Eklenen kişiye güvenlik bildirimi (/family/accept güvenlik uyarısı)
- [x] Eklenen kişi düzenlenebilirlik tercihi seçebilsin (FamilyManagementSettings toggle)
- [x] "Hangi profili görüntülemek istiyorsunuz?" sorulsun (select-profile redirect)
- [x] Not ekleme: "babam", "eşim" gibi nickname'ler (davet formunda)
- [x] Aktif profil banner (header'da yeşil banner)
- [x] Profil/Dashboard başkasının verisini gösterir (useActiveProfile hook)
- [x] 24 bug fix (XSS, RLS recursion, hydration, unicode, tema)
- [ ] Premium alan kişi: kendi + 2 kişinin profilini yönetebilir (premium gate)
- [ ] Aile paketi: eklenen herkes premium (premium propagation)

### 7.1 Hane Sayfası v2 (Session 25-26) ✅ TAMAMLANDI
**Stage 1 — Üye grid kartları:** /family üyeleri grid (1/2/3 col) — avatar+ring, isim+nickname, rol/Sen badge, paylaşım-aware sağlık skoru slot, "Katıldı: X gün önce", click→profil, owner remove (confirm). Kurucu her zaman ilk kartta (RLS race fallback: synth member). Synth row'ların DB butonları gizli.

**Stage 2 — Bekleyen davetler:** Yeni `pendingInvites` context array — `family_members.invite_status='pending'` rowları. Per-row "Link kopyala" + "İptal" butonları. Migration `expires_at` kolonu ekledi (default 7 gün); UI "X gün kaldı" / "Süresi doldu" badge gösteriyor.

**Stage 3 — Per-member sharing prefs:** Migration: `shares_health_score`, `shares_medications`, `shares_allergies`, `shares_emergency` BOOLEAN kolonları (emergency default TRUE). RLS `fm_self_update` zaten yazımı kullanıcıya kısıtlıyor. Self üye kartından "Paylaşım" butonu → bottom-sheet modal, 4 toggle.

**Stage 4 — Dashboard summary:** Sayfa üstünde 4-cell grid (Üye/Bekleyen/Ort. Skor/Hatırlatma). Sharing açılana kadar aggregate cell'ler "—" + fallback hint metin.

**Stage 5 — Notifications:** Yeni `family_notifications` tablosu (group_id, from/to_user_id, type, message, read). Tip whitelist: `reminder_meds | reminder_checkin | reminder_water | emergency | custom`. RLS `fn_sender_insert` policy DB seviyesinde sender VE recipient'ın aynı group_id accepted üyeleri olmasını zorunlu kılıyor → cross-household leak imkansız. API `/api/family/notifications` GET/POST/PATCH (Bearer auth, 60/20/60 req-min rate-limit, anon-key + RLS, service-role yok). Header'a global `<NotificationBell />` (60sn polling, badge, dropdown, mark-read). Üye kartında "Hatırlat" butonu → bottom-sheet 3 preset (meds/check-in/water).

**Hane düzenleme + UX:** Hane ismi inline edit (pencil → updateGroupName, RLS fg_update). 5 emoji icon picker (🏠❤️🌳🏡🌟, localStorage). Boş state motivasyon kartı (sadece kurucu varsa: 3 mini benefit — Heart/Bell/Siren). Davet form helper text + 7-gün notu. Roller & izinler accordion (Owner/Admin/Member). Gradient header, ring avatar, mobile responsive.

**Henüz yapılmadı (Session 27+ için):**
- [ ] Realtime (Supabase realtime) — şu an 60sn polling
- [ ] Anomaly-driven notifications (sağlık skoru ani düşüş → owner ping)
- [ ] Emergency SOS sistemine bağlama (`emergency` type schema'da rezerve, trigger yok)
- [ ] Premium gate'ler (aile paketi limitleri)

### 8. Toolları Gizle
- [ ] Sadece core tool'lar görünsün (asistan, etkileşim, takvim, kan testi, profil, aile)
- [ ] Geri kalan tool'lar hidden: true
- [ ] Ayarlar ve Hesap da gizlenecekler listesinde

### 9. Veri Gizliliği
- [ ] Genel optimizasyon

### 10. Mobil Port
- [ ] Genel kontrol ve düzeltme

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

## Demo Senaryoları (Harvard Hackathon)

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

## POST-HACKATHON: Chat API Context Enrichment ✅ TAMAMLANDI (Session 32)

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
*IGNITE 26 kazanıldı — Harvard Hackathon tamamlandı (11-12 Nisan 2026).*
*Session 18-20: Aile profili + SBAR PDF redesign + condition translations + bug fixes.*
*Session 21: YASAL UYUM — 10/14 madde kod implementasyonu tamamlandı (MADDE 1,2,3,5,6,7,8,9,10,11,12,13). MADDE 4 ve 14 hukuki/idari işlem.*
*Session 22-24: Post-hackathon cleanup — 62/77 AI endpoint'te consent gate aktif → translations.ts split (7060→272 satır, 11 namespace) → lib/ `any` cleanup (6 dosya strict typed) → hackathon modu kapatıldı (premium gates aktif) → yasal uyum bug fixes (PromptInjectionError 500 fix, regex medical-term whitelist, null consent bypass, fail-closed filter) → edge-case audit (ageToRange NaN, anonymize null input, 16 yeni emergency keyword, 57 TR medical term).*
*Session 25: Profil tamamlama tutarsızlığı düzeltildi (single source of truth) → Hackathon demo banner kaldırıldı → Güvenlik sayfası içerik genişletme + AI Safety kartı → /api/auth/change-password auth bypass kapatıldı (body.userId artık ignore, identity Bearer token'dan) + rate limit + service-role kullanımı kaldırıldı → `any` type cleanup (34 dosya) + apiHandler refactor (daily-log, health-score) → /family page redesign (kurucu kartı, isim/icon edit, motivasyon empty state, roller accordion).*
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

### Session 43 — Onboarding Flow Audit + Fix (22 Nisan 2026) — Tamamlandı

**Ana iş:** Yeni kullanıcı funnel'i (landing → signup → email confirm → 11-step wizard → finale → first-login → first medication → aha moment) statik audit + M variant fix sprint.

**Faz 1 (commit `d3a7e9f`):** 2 paralel Explore agent + manuel verify (~%30 false positive filtrelendi). 16 gerçek finding (1 P0 + 7 P1 + 8 P2) + 4 a11y/mobile edge. Funnel haritası + abandonment risk + aha moment analizi.

**Faz 2 (commit zinciri `5fccaf5..65edc06`):** M variant (P0 + 7 P1 + 2 P2 = 10 fix). 9 fix FIXED + 1 CLEAN (F-OB-008 agent false positive — `ageWarning` zaten mevcut).

**9 fix commit:**

- `65edc06` **F-OB-001 (P0)** — OnboardingFinale `medicationsCount` prop eklendi; wizard'dan `data.medications.length` geçirildi. Count 0 ise primary CTA "İlk ilacını ekle →" → `/profile?tab=medications` + secondary "Panele git"; count >0 ise mevcut "Explore" davranışı korundu. Aha moment path'in baş kapısı.
- `de33829` **F-OB-002 (P1)** — Signup password proactive requirement hints. Length ≥8 / uppercase / number dot-indicator chip'leri `signupPassword.length > 0` iken real-time render (emerald ok, muted yet). Try-fail-retry cycle eliminated.
- `182b43b` **F-OB-003 (P1)** — Onboarding draft atomic. `DRAFT_KEYS.onboardingWizard` eklendi `lib/ui/draft-persist.ts`'e (Session 42 F-D-006 lib 3. consumer). `OnboardingDraftShape = { data, step }` tek atomik value → race condition eliminated. İki ayrı `doctopal_onboarding_draft` + `doctopal_onboarding_step` write'ları birleştirildi.
- `f0cdc82` **F-OB-004 (P1)** — Email callback error state expired-link açıklaması. Generic "sign-in'e dön" butonunun üstüne recovery explanation text (TR/EN inline). Kullanıcı expired link gördüğünde ne yapması gerektiğini bilir.
- `5fccaf5` **F-OB-007 (P1)** — Notification permission timing. `addMedication` success path'indeki `setTimeout(() => setShowNotifPermission(true), 500)` kaldırıldı + açıklayıcı yorum. PermissionBottomSheet mount kaldı (calendar reminder / scheduled-task flow'ları trigger edebilir). Just-in-time permission pattern.
- `d5de2da` **F-OB-005 (P1)** — Dashboard empty-medications emerald banner. `dynamicTasks.length === 0` iken task listenin üzerinde Link → `/profile?tab=medications`. İlk ilaç eklendiğinde banner otomatik kaybolur (dynamicTasks > 0). Dismiss gerek yok.
- `b4a336d` **F-OB-006 (P1)** — First-medication post-save prompt. `wasFirstMed = medications.length === 0` (insert öncesi) flag → post-save 12s auto-hide card (fixed top-32, emerald border). İki CTA chip: "Etkileşim kontrolü yap" (Link → `/interaction-checker`) + "Başka ilaç ekle" (setIsAddingMed(true)) + dismiss ×.
- `9881456` **F-OB-010 (P2)** — BasicInfoStep name field'ının altında Google auto-fill indicator. `isGoogleUser && user?.user_metadata?.full_name && data.full_name === user.user_metadata.full_name` koşulunda blue dot + "Google hesabından dolduruldu — düzenleyebilirsin".
- `0432cf7` **F-OB-016 (P2)** — Landing HeroSection H2 altına concrete feature triad satırı: "İlaç-bitki etkileşimi · Kan tahlili yorumu · Aile profili yönetimi" (TR/EN inline, text-sm text-slate-500). Emotional H2 framing korundu, "bu uygulama ne yapar?" sorusu bir bakışta cevaplanıyor.

**Aha Moment Ölçümü (yapısal analiz):**
- **Pre-fix:** ~25-35 dk (signup ~2 + email ~2 + 11-step wizard ~20 + finale + menü keşif + med add + manuel interaction-checker nav)
- **Post-fix:** ~18-25 dk (net ~2-4 dk ortalama user tasarruf, edge case'lerde 10+ dk draft recovery)
- **Hedef:** 10 dk altı — **ULAŞILMADI.** Kök neden: 11-step wizard yapısal. 11 × 1.5 dk optimistic = 16.5 dk zaten matematiksel taban.

**Yeni Backlog — Strategic Decision:**
- **Wizard 5-step refactor** post-launch architectural iş. Session 44+ aha moment ölçümü Faz 2 sonrası 10 dk üstündeyse öncelikli olur, altındaysa Session 50+'a kadar bekleyebilir. Basic info + medications + allergies + KVKK (aydinlatma + consent combined) + critical chronic conditions hedefi. Supplements/vaccines/family history/lifestyle şimdi profile'a taşınıyor (post-onboarding).

**Sonuç:**
- 9/10 FIXED, 1 CLEAN (F-OB-008 `ageWarning` mevcut)
- Build 241 sayfa, 0 error, 0 warning (Session 42 ile bit-perfect)
- `lib/ui/draft-persist.ts` üçüncü consumer aldı, DRAFT_KEYS namespace olgunlaşıyor (familyHistory + profileMedicationAdd + onboardingWizard)
- Regression yok: Session 41 F-S-002 scroll gate + Session 39 FamilyHistorySection draft + Session 32 AuthContext cache + Session 36-38 AI prompts + tüm önceki fix'ler korundu

**Detay:** [docs/sessions/SESSION_43_ONBOARDING_AUDIT.md](docs/sessions/SESSION_43_ONBOARDING_AUDIT.md) — Faz 1 funnel + 16 finding + Faz 2 FIXED işaretleri + aha moment pre/post karşılaştırması + commit mapping.

**Session 44'e devir:**
- **Wizard 5-step refactor** (architectural, post-launch decision — aha moment 10 dk hedefine ulaşmak için zorunlu)
- ESLint 127 library error sprint (semantic care, dedicated)
- Kalan 6 P2 + 4 a11y/mobile edge (Session 45 polish)
- Drug-pair expansion (interaction engine refactor)
- Landing full redesign (marketing paralel), parental consent (hukuki), OAuth extended pull, bulk med import, mid-onboarding aha feature
- Iyzico şirket tescili bekleyişi devam

---

### 🚨 Post-Session-43 Production Incident (22 Nisan 2026, gece)

**Semptom:** Production'da kullanıcı giriş yaptıktan sonra dashboard skeleton'da takılı kalıyor, sayfa yüklenmiyor.

**Console kanıtları:**
- `[Auth] Profile fetch timed out after 15s (source=authEvent:SIGNED_IN)` × 2 tekrar
- `@supabase/gotrue-js: Lock "lock:sb-...-auth-token" was not released within 5000ms` × 2 tekrar

**Timeline:**
- Session 43 Faz 2 commit zinciri `5fccaf5..9861fa2` push edildi (`d3a7e9f..9861fa2`)
- İpek canlı deploy sonrası skeleton bug'u yakaladı
- Bug öncesi son stabil commit: `823feae` (Session 42 sonu, P2 kozmetik + FP-D)

**Olası kök neden hipotezleri (Session 44 investigation'ı için):**

1. **F-OB-003 atomic draft refactor** (`182b43b`, OnboardingWizard.tsx): `useState` initializer içinde `readDraft` çağrısı sync blocking olabilir; Supabase client init ile yarış durumu (auth lock acquisition sırasında localStorage JSON.parse tetiklenmesi).
2. **F-OB-001 Finale prop** (`65edc06`): ilgisiz görünüyor — Finale yalnızca wizard finalize edildiğinde mount oluyor, SIGNED_IN event path'inde değil.
3. **AuthContext timeout** — 15s yetersiz olabilir yeni kullanıcılar için (RLS profile select uzuyorsa).
4. **RLS policy** — `profiles` tablosu INSERT own_insert + SELECT own_select new user için çalışmıyor olabilir; lock release fail Supabase gotrue-js tarafından tetikleniyor.
5. **Supabase gotrue-js lock** — 5s auth token lock timeout yetersiz; F-OB-003 localStorage yazma + okuma pattern auth event path'inden ayrı thread'de blocking olabilir.

**Rollback opsiyonu (Session 44 başında değerlendirilecek):**
```bash
git revert --no-commit 9861fa2..HEAD
git commit -m "revert: Session 43 Faz 2 (production incident — investigating)"
git push origin master
```
→ Session 42 stabiline (`823feae`) döner, 10 commit geri alınır, skeleton bug çözülür. Session 43 fix'leri local branch'te debug edilir.

**Status:** **Session 44 ilk işi** — incident response + root cause + fix-forward veya rollback kararı.
