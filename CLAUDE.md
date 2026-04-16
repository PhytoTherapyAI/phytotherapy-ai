# CLAUDE.md — DoctoPal Proje Anayasası v49.0 (Post-Hackathon)

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
- **Proje boyutu:** 348+ sayfa, 124 API route (77 AI-powered), 155 tool, ~1300 çeviri key

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

## HARVARD HACKATHON ROADMAP (7-11 Nisan 2026)

> IGNITE 26'da jüri kararı: **Core tool'lar + Aile Profili** öncelikli. Diğer tool'lar hackathon sonrasına.

### 1. Sağlık Asistanı (Core)
- [ ] Acil durum database verisi iyileştir
- [ ] Daha gerçekçi ve kişiselleştirilmiş cevaplar
- [ ] Daha net, anlaşılır cevaplar

### 2. Etkileşim Deneyleyici (Core)
- [ ] İlaç girmeden de kullanılabilsin (uyarı mesajı ile: "İlaçlarınızı girmeden önerileri kullanmayın")
- [ ] Asistan gibi panel'e al (etkileşimi panelde göster)

### 3. Takvim & Panel
- [ ] Genel kontrol ve düzeltme

### 4. Kan Testi & Radyoloji
- [ ] Kan testi PDF çalıştır
- [ ] Radyoloji cevaplarını iyileştir

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
Frontend:     Next.js 14 (App Router) + Tailwind CSS + shadcn/ui + Recharts + Framer Motion
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

## POST-HACKATHON: Chat API Context Enrichment

### Sorun:
Chat API route'u (/api/chat veya ilgili endpoint) kullanıcı profili context'ini AI'a gönderirken:
- ✅ İlaçlar (medications) — çekiliyor, çalışıyor
- ✅ Alerjiler (allergies) — çekiliyor, çalışıyor
- ❌ Kronik hastalıklar (chronic_conditions) — çekilMİYOR
- ❌ Cerrahi geçmiş (surgery: prefix'li entries) — çekilMİYOR
- ❌ Soygeçmiş (family: prefix'li entries) — çekilMİYOR
- ❌ Aşı durumu (vaccines JSONB) — çekilMİYOR
- ❌ Yaşam tarzı (smoking_use, alcohol_use, BMI, diet_type) — çekilMİYOR

### Yapılacak:
1. Chat API route'unda system prompt'a enjekte edilen kullanıcı verisini bul
2. Supabase'den user_profiles tablosundan şu alanları da çek:
   - chronic_conditions (surgery: prefix'li olanlar ayrı "Cerrahi Geçmiş" olarak)
   - family history (family: prefix'li entries → "Soygeçmiş")
   - smoking_use, alcohol_use
   - height_cm, weight_kg → BMI hesapla
   - diet_type, exercise_frequency, sleep_quality
   - vaccines JSONB → tamamlanan aşılar
3. Bunları system prompt'a "Patient Profile Context" bloğu olarak ekle
4. AI'ın her yanıtta tüm profil verisini cross-reference etmesini sağla
5. Kritik cross-reference senaryoları:
   - Cerrahi geçmiş: gastric sleeve → absorption warning (bazı bitkiler emilmeyebilir)
   - Soygeçmiş: family cancer → phytoestrogen warning (soya, kırmızı yonca vb.)
   - Hamilelik/emzirme → mutlak kontrendikasyon listesi
   - Böbrek yetmezliği → doz azaltma/eliminasyon uyarısı
   - İlaç-bitki CYP450 etkileşimleri + kronik hastalık kombinasyonu

### Öncelik: YÜKSEK — Bu DoctoPal'ın core differentiator'ı
> Kullanıcıyı tanımak = kişiselleştirilmiş cevap = rakiplerden ayrışma noktası

---

*Son güncelleme: 16 Nisan 2026 v51.1*
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
*— Null guard: Header.tsx .split(" ") boş string crash + profile chronic_conditions spread guard + bot-send null fallback*
*— JSON.parse try-catch: 16 dosyada unguarded JSON.parse sarıldı (connected-devices, emergency-contacts, dream-diary, diabetic-foot, dental-health, bug-report, connect-assistant, donation, fasting-monitor, health-quiz, medication-log, friend-goals, operations, health-timeline, micro-habits, walking-tracker)*
*— Diğer: OnboardingWizard render body'de setCurrentStep kaldırıldı (re-render loop) + TodayView supplement celebration >1→>0 + layout.tsx Header import case fix (Turbopack) + supplement-data operator precedence parantez + MonthlyROICard division by zero guard + parseInt radix eksik (calendar ICS, medication-hub) + QuickActions/SOSCard JSON.parse guard*
