# PROGRESS.md — Phytotherapy.ai Sprint İlerleme Takibi

> Son güncelleme: 19 Mart 2026 (v9.0)

---

## Genel Durum

| Sprint | Durum | Tarih |
|--------|-------|-------|
| Sprint 1 — Altyapı | ✅ Tamamlandı | Mart 2026 |
| Sprint 2 — Auth + Onboarding | ✅ Tamamlandı | Mart 2026 |
| Sprint 3 — İlaç Etkileşim Motoru | ✅ Tamamlandı | Mart 2026 |
| Sprint 4 — Sağlık Asistanı RAG | ✅ Tamamlandı | Mart 2026 |
| Sprint 5 — Kan Tahlili + PDF | ✅ Tamamlandı | 16 Mart 2026 |
| Sprint 6 — Mimari Birleştirme | ✅ Tamamlandı | 16 Mart 2026 |
| Sprint 7 — Tasarım v2 | ✅ Tamamlandı | 16 Mart 2026 |
| Sprint 7.5 — 3 Katmanlı İlaç Kontrolü + TR/EN | ✅ Tamamlandı | 17 Mart 2026 |
| Sprint 8 — Güvenlik + Yasal + Asistan v2 | ✅ Tamamlandı | 19 Mart 2026 |
| Sprint 9 — Takvim Hub | 📋 Sırada | — |

**Hackathon: 11-12 Nisan 2026 — 24 gün kaldı**

---

## ✅ Sprint 1 — Altyapı

**Kapsam:** Proje iskeleti, deploy, domain bağlantısı

- [x] Next.js 14 + App Router + TypeScript
- [x] Tailwind CSS + shadcn/ui (16 bileşen kurulu)
- [x] GitHub repo: github.com/PhytoTherapyAI/phytotherapy-ai
- [x] Vercel deploy + phytotherapy.ai domain bağlantısı
- [x] Temel lib dosyaları: gemini.ts, pubmed.ts, openfda.ts, safety-filter.ts
- [x] Landing page iskeleti + header + footer + disclaimer
- [x] .env.local yapılandırması

**Dosyalar:** layout.tsx, page.tsx, globals.css, lib/*.ts

---

## ✅ Sprint 2 — Auth + Onboarding

**Kapsam:** Kullanıcı kimlik doğrulama, profil, onboarding wizard

- [x] Supabase tabloları: user_profiles, user_medications, user_allergies, query_history, blood_tests, consent_records, guest_queries
- [x] RLS politikaları + trigger'lar
- [x] Email auth (Supabase Auth)
- [x] Login/Signup sayfası (/auth/login) — email + Google OAuth butonu
- [x] OAuth callback (/auth/callback)
- [x] AuthProvider context (lib/auth-context.tsx)
- [x] Onboarding wizard (7 adım): kişisel bilgi → ilaçlar → alerjiler → gebelik → alkol/sigara → hastalıklar → dijital imza
- [x] Misafir modu: localStorage ile 5 sorgu limiti
- [x] Kişisel sorgu tespiti (isPersonalQuery)
- [x] Profil sayfası iskeleti

**Dosyalar:** supabase/schema.sql, lib/database.types.ts, lib/supabase.ts, lib/auth-context.tsx, lib/guest-limit.ts, app/auth/*, app/onboarding/page.tsx, app/profile/page.tsx

---

## ✅ Sprint 3 — İlaç Etkileşim Motoru

**Kapsam:** OpenFDA + Gemini hybrid ilaç analizi

- [x] OpenFDA API entegrasyonu (lib/openfda.ts)
  - Marka → etken madde çevirisi
  - Gemini fallback: Türkçe ilaç adları (Glifor → Metformin)
  - 3 aşamalı çözüm: OpenFDA → Gemini çözümleme → OpenFDA tekrar
- [x] Etkileşim motoru (lib/interaction-engine.ts)
  - 8 adımlı pipeline: RedFlag → OpenFDA → Profil ilaçları → Profil uyarıları → PubMed → Gemini → Parse → Sonuç
  - Gemini JSON mode (responseMimeType: "application/json")
  - 4 katmanlı JSON parser (strip → direct → balanced brace → auto-repair)
- [x] /api/interaction endpoint
- [x] DrugInput bileşeni (tag tabanlı ilaç girişi)
- [x] InteractionResult bileşeni (emergency, medications, herb cards)
- [x] SafetyBadge bileşeni (Safe / Caution / Dangerous)
- [x] Interaction checker sayfası (/interaction-checker)
- [x] Kırmızı kod: real-time client-side tespit (useMemo + checkRedFlags)
- [x] Statik acil durum banner'ı

**Dosyalar:** lib/openfda.ts, lib/interaction-engine.ts, lib/prompts.ts, app/api/interaction/route.ts, components/interaction/*, app/interaction-checker/page.tsx

---

## ✅ Sprint 4 — Sağlık Asistanı RAG

**Kapsam:** PubMed canlı sorgu + Gemini streaming chat

- [x] /api/chat endpoint (Gemini streaming + profil context + PubMed RAG)
- [x] ChatInterface bileşeni (streaming, auto-scroll, red flag filtresi)
- [x] MessageBubble bileşeni (markdown rendering, streaming cursor)
- [x] SourceCard bileşeni (PubMed referans kartları)
- [x] Health assistant sayfası (/health-assistant)
- [x] Doz güvenlik kuralı: profilde ilaç yoksa doz tavsiyesi verilmez

**Dosyalar:** app/api/chat/route.ts, app/api/pubmed/route.ts, components/chat/*, app/health-assistant/page.tsx

---

## ✅ Sprint 5 — Kan Tahlili + PDF

**Kapsam:** Kan tahlili analizi, yaşam koçluğu, doktor raporu PDF

- [x] blood-reference.ts: 30 markör, 9 kategori (cinsiyet bazlı referans aralıkları)
- [x] /api/blood-analysis endpoint (referans + Gemini analiz)
- [x] /api/generate-pdf endpoint (@react-pdf/renderer)
- [x] DoctorReport PDF bileşeni (A4 profesyonel layout)
- [x] BloodTestForm bileşeni (9 kategori, demo veri, sayısal doğrulama)
- [x] ResultDashboard bileşeni (4 sekme: Results/Supplements/Lifestyle/Doctor)
- [x] Blood test sayfası (/blood-test)
- [x] Chat kutusuna dosya/fotoğraf yükleme + OCR

**Dosyalar:** lib/blood-reference.ts, app/api/blood-analysis/route.ts, app/api/generate-pdf/route.ts, components/pdf/DoctorReport.tsx, components/blood-test/*, app/blood-test/page.tsx

---

## ✅ Sprint 6 — Mimari Birleştirme + Auth Fix

**Kapsam:** Auth akışı, hata yönetimi, Gemini API stabilizasyonu, onboarding düzeltmeleri

- [x] Login → onboarding_complete kontrolü → /onboarding yönlendirmesi
- [x] Sign in / Sign out tam düzeltme (local signout, session propagation)
- [x] OAuth callback onboarding kontrolü
- [x] Sağlık dışı mesajlara nazik yönlendirme (off-topic handling)
- [x] Konuşma geçmişi yan panel — ConversationHistory bileşeni (son 20 konuşma)
- [x] Gemini retry + exponential backoff + model fallback (2.0-flash → 2.5-flash)
- [x] TR→EN PubMed sözlük (70+ Türkçe sağlık terimi → İngilizce)
- [x] PubMed timeout (8s) + error handling (boş döner, crash etmez)
- [x] Chat API streaming error handling (JSON 500 yerine streaming text mesajı)
- [x] Onboarding medication/allergy kayıt hatası düzeltildi
- [x] fetchProfile RLS fix — getUser() ile token doğrulama
- [x] Corrupted localStorage temizleme (cleanCorruptLocalStorage)

### Bugfix Kaydı (Sprint 6)
| Bug | Sebep | Çözüm |
|-----|-------|-------|
| Tüm chat mesajları "Something went wrong" | gemini-2.5-flash free tier 20 req/day, 429 sonrası JSON 500 | gemini-2.0-flash primary (1500/gün) + streaming error response |
| gemini-2.0-flash da tükendi | Free tier tüm modeller tükendi | Retry + fallback chain + QUOTA_EXHAUSTED mesajı |
| Türkçe sağlık soruları başarısız | PubMed Türkçe keyword bulamıyor + timeout crash | TR→EN sözlük + 8s timeout + try/catch |
| Login sonrası onboarding atlanıyor | Session propagation race condition | Retry getUser() 3x + window.location.href |
| Medication/allergy kaydedilmiyor | Profil onboarding_complete=true ÖNCE güncelleniyor | Save sırası: meds → allergies → consent → profile (LAST) |
| fetchProfile timeout | getSession() RLS token set etmiyor | getUser() ile token validate + sonra getSession() |
| Unexpected end of input | Corrupted localStorage from aggressive clearing | cleanCorruptLocalStorage() + scope: "local" signout |

---

## ✅ Sprint 7 — Tasarım v2

**Kapsam:** phytotherapy_v2.png referansıyla tam UI overhaul + dark mode + dil toggle + renk göçü

- [x] Font sistemi: Cormorant Garamond (başlıklar, serif italic) + DM Sans (body) + DM Mono (mono)
- [x] CSS variables ile renk sistemi — light (#faf9f6 warm cream) + dark (#141a16 dark forest)
- [x] Dark/Light mode toggle — navbar sağında (Moon/Sun ikonu, localStorage persist)
- [x] ThemeProvider bileşeni (prefers-color-scheme fallback, smooth transition, SSR-safe)
- [x] Hero bölümü: Sol metin + arama kutusu + quick tags / Sağ botanik SVG
- [x] BotanicalHero SVG: bitki + yapraklar + altın çiçek + EKG çizgisi + molekül noktaları + tıbbi artı
- [x] Eyebrow badges kaldırıldı (Science/Species/Wiki → gereksiz)
- [x] Trust strip (5 madde, yeşil checkmark)
- [x] Feature kartları (01/02/03/04 numaralı, Cormorant başlık, hover efektleri)
- [x] Navbar: logo (Cormorant) sol, linkler orta, auth + lang toggle + theme toggle sağ
- [x] "Get Started" CTA butonu (sign in yönlendirme)
- [x] Footer: disclaimer + brand renkleri
- [x] Disclaimer banner: CSS variable renkleri
- [x] Responsive mobile-first (flex-col-reverse hero, mobile hamburger + theme toggle)
- [x] Debug console.log'lar kaldırıldı (header)
- [x] Dil toggle (🇺🇸 EN / 🇹🇷 TR) — mounted guard ile hydration-safe, localStorage persist
- [x] Dark mode softened: background #141a16, cards #1c2420, text #dde8de, muted #8aab8e, borders rgba(90,172,116,0.15)
- [x] Logo renkleri: Phyto=foreground, therapy=#b8965a gold, .ai=#3c7a52 light / #5aac74 dark
- [x] Botanik SVG: --brand fallback #5aac74 parlak yeşile güncellendi
- [x] Emerald→Primary CSS variable göçü (25+ dosya: chat, interaction, blood-test, onboarding, auth, profile, common)

### Renk Paleti (Kesinleşmiş)
| Token | Light | Dark |
|-------|-------|------|
| background | #faf9f6 | #141a16 |
| foreground | #141a15 | #dde8de |
| primary | #3c7a52 | #5aac74 |
| gold | #b8965a | #c9a86c |
| muted-foreground | #5a6b5c | #8aab8e |
| card | #ffffff | #1c2420 |
| border | rgba(60,122,82,0.15) | rgba(90,172,116,0.15) |

### Font Sistemi
| Kullanım | Font | CSS Variable |
|----------|------|-------------|
| Başlıklar | Cormorant Garamond | --font-heading |
| Body text | DM Sans | --font-sans |
| Monospace | DM Mono | --font-mono |

### Bugfix Kaydı (Sprint 7)
| Bug | Sebep | Çözüm |
|-----|-------|-------|
| useTheme SSR crash | Static prerender ThemeProvider dışında | useTheme() safe defaults döndürür (throw yok) |
| Auth avatar kaybolma | initAuth + onAuthStateChange race condition | INITIAL_SESSION skip + initialDone flag |
| Language toggle "TR TR" | SSR/client hydration mismatch | mounted guard + return null until client |
| Dark mode too harsh | #1a211c hala koyu | User specs: #141a16 bg, #1c2420 cards, #dde8de text |
| Font overrides bozuldu | CSS @import + !important conflicts | Reverted — Next.js font system yeterli |

**Dosyalar:** app/layout.tsx, app/globals.css, app/page.tsx, components/layout/header.tsx, components/layout/footer.tsx, components/layout/theme-provider.tsx, components/layout/theme-toggle.tsx, components/layout/language-toggle.tsx, components/layout/disclaimer-banner.tsx, components/illustrations/botanical-hero.tsx + 25 emerald→primary göç dosyası

---

## ✅ Sprint 7.5 — 3 Katmanlı İlaç Kontrolü + TR/EN + Profil Düzenleme

**Kapsam:** İlaç/profil güncelleme sistemi, tam çeviri, profil sayfası düzenleme

- [x] 3 katmanlı ilaç kontrol sistemi (günlük + 15 gün + 30 gün)
  - Günlük: localStorage, hafif "İlaçlarınız güncel mi?" dialogu, X ile kapatılabilir
  - 15 gün: Supabase `last_medication_update`, tam ilaç formu (ekleme/silme/autocomplete), zorunlu
  - 30 gün: localStorage, mini onboarding (ilaçlar + sağlık durumu), 2 adımlı, zorunlu
- [x] lib/translations.ts — TR/EN çeviri sistemi (~100 key)
- [x] lib/daily-med-check.ts — localStorage günlük/30 günlük kontrol utility
- [x] lib/turkish-drugs.ts + public/drugs-tr.json — Türkçe ilaç veritabanı
- [x] /api/drug-search — OpenFDA + Türkçe ilaç autocomplete endpoint
- [x] Profil sayfası tam sağlık profili düzenleme (alerjiler, gebelik, madde kullanımı, tıbbi geçmiş, yaşam tarzı)
- [x] Select dropdown Türkçe gösterim düzeltmesi (base-ui custom span rendering)
- [x] Onboarding wizard tam TR/EN desteği
- [x] Tüm sayfalar bilingual: landing, chat, interaction, blood-test, onboarding, profile
- [x] Statik acil durum banner'ları kaldırıldı (sadece keyword-triggered emergency modal kaldı)
- [x] Interaction checker tam TR/EN + Türkçe ilaç arama
- [x] i18n refactored: SUPPORTED_LANGUAGES + Lang type + tx() tek dosyada (lib/translations.ts) — yeni dil eklemek = 1 config satırı + çeviriler

### Bugfix Kaydı (Sprint 7.5)
| Bug | Sebep | Çözüm |
|-----|-------|-------|
| Select dropdown İngilizce gösteriyor | base-ui SelectValue internal value render | Custom `<span>` + display map pattern |
| 15 gün dialogu tetiklenmiyor | test endpoint `user_id` vs `id` kolon hatası | `.eq("id", userId)` düzeltmesi |
| TypeScript spread type error | `string \| null` from base-ui onValueChange | `v &&` guard + explicit HealthFormState interface |
| Sign out sonrası günlük tekrar soruyor | `clearDailyMedCheck()` on sign out | Tasarıma uygun — yeni oturumda tekrar sorulmalı |

**Dosyalar:** lib/daily-med-check.ts (NEW), lib/translations.ts (NEW), lib/turkish-drugs.ts (NEW), public/drugs-tr.json (NEW), app/api/drug-search/route.ts (NEW), components/layout/medication-update-dialog.tsx (REWRITE), app/profile/page.tsx (MAJOR), components/onboarding/steps/*.tsx (ALL), app/*.tsx (ALL)

---

## ✅ Sprint 8 — Güvenlik + Yasal + Asistan v2

**Kapsam:** Rate limiting, input sanitization, yasal sayfalar, sistem promptu v2, collapsible kaynaklar, renk kodlu supplement

- [x] Rate limiting — 7/7 API route (chat, interaction, blood, drug-search, pubmed, pdf, user-data)
- [x] Input sanitization — XSS/injection koruması (lib/sanitize.ts)
- [x] Privacy Policy sayfası — /privacy (TR+EN, 10 bölüm, KVKK/GDPR uyumlu)
- [x] Terms of Service sayfası — /terms (TR+EN, 12 bölüm, sorumluluk sınırlaması, garanti reddi)
- [x] Verilerimi indir — /api/user-data GET (JSON export, tüm tablolar)
- [x] Hesabımı sil — /api/user-data DELETE (tüm veri + auth user silme)
- [x] Profil sayfası fonksiyonel export/delete butonları
- [x] Sistem promptu v2 — arkadaş tonu, conversation/knowledge/mixed modlar, profil farkındalığı
- [x] Collapsible kaynak paneli — SourceCard varsayılan kapalı, tıkla aç
- [x] SafetyBadge evidence grade — A/B/C kanıt düzeyi gösterimi
- [x] Cookie consent banner — KVKK/GDPR zorunlu, localStorage hatırlama
- [x] Onboarding consent'e Terms + Privacy linkleri + güncellenmiş kabul metni
- [x] Footer'a Privacy Policy + Terms of Service linkleri

### Yeni Dosyalar (Sprint 8)
- `lib/rate-limit.ts` — In-memory sliding window rate limiter
- `lib/sanitize.ts` — XSS/injection sanitization
- `app/privacy/page.tsx` — Gizlilik Politikası (TR+EN)
- `app/terms/page.tsx` — Kullanım Koşulları (TR+EN)
- `app/api/user-data/route.ts` — KVKK veri export/delete API
- `components/layout/cookie-consent.tsx` — Cookie consent banner

---

## 🔄 Sprint 9 — Takvim Hub (DEVAM EDİYOR)

**Kapsam:** Merkezi sağlık takvimi — ilaç takibi, takviye, su, vital, görevler, bildirimler

### ✅ Tamamlanan (Sprint 9a)
- [x] Takvim sayfası (/calendar) — 3 tab (Bugün/Takvim/Sağlık Ölçümleri)
- [x] İlaç kutucuk sistemi (tıklanabilir, optimistic update, animasyonlu)
- [x] Takviye paneli (AI güvenlik kontrolü, profil bazlı doz, renk kodlu: yeşil/sarı/kırmızı)
- [x] Su takibi (SVG damla dolum, gradient progress bar, hedef ayarlama, esprili mesajlar)
- [x] Vital takibi (tansiyon/şeker/kilo/nabız) + dialog
- [x] Etkinlik ekleme (7 tür + tekrar + hızlı ekle chip'leri)
- [x] Streak sistemi (🔥 ardışık gün takibi)
- [x] İlaç tamamlama animasyonu + motivasyon mesajları
- [x] Çan ikonu (tıklanabilir tooltip — "yakında")
- [x] Ay takvim grid'i (renkli noktalar, gün tıklama)
- [x] Supabase migration: calendar_events, daily_logs, water_intake, vital_records
- [x] Navbar'a Calendar linki
- [x] ~90 çeviri key'i (cal.*)
- [x] API: /api/calendar, /api/daily-log, /api/supplement-check (rate limited)
- [x] Login "Oturumu açık tut" checkbox
- [x] Tüm sayfa başlıkları italic Cormorant tutarlılığı

### 📋 Yapılacak (Sprint 9b — Sonraki Oturum)

**İlaç Animasyonu v2:**
- [ ] Tam ekran confetti/ripple efekti (ilaç tamamlandığında)
- [ ] Kişiye özel mesajlar (isimle hitap: "Harika Taha! 💊")
- [ ] Mesajlar daha çeşitli ve yaratıcı

**Çan Bildirimi (Gerçek):**
- [ ] Çan tıklanınca saat seçim paneli açılsın
- [ ] Seçilen saati localStorage + Supabase'de sakla
- [ ] "Zoretanin — 09:00" formatında gösterim

**Su Tüketimi v3:**
- [ ] Boy/kilo bazlı kişisel alt-üst limit (su zehirlenmesi koruması)
- [ ] Üst limitte su ekleme engelleme + uyarı mesajı
- [ ] Bardak sayı barını geri getir (yatay uzun barı kaldır)
- [ ] Su damlası SVG'yi +/- butonları arasına taşı
- [ ] Her su eklemede mini sayfa animasyonları (confetti/ripple)
- [ ] Daha çeşitli motivasyon mesajları (her seferinde farklı)
- [ ] Barem aşıldığında esprili mesaj çeşitliliği artırılacak

**Otomatik Dil Algılama:**
- [ ] navigator.language ile sistem dilini algıla
- [ ] İlk ziyarette otomatik TR/EN seçimi

**Ek Özellikler:**
- [ ] Haftalık özet kartı (kaç gün ilaç/su hedefi karşılandı)
- [ ] Takvim tab'ında günlere emoji (✅ tamam / ⚠️ eksik)
- [ ] Etkinlik silme/düzenleme
- [ ] Telefon takvimi .ics export
- [ ] Dark mode su damlası glow efekti
- [ ] İlaç saati geçtiğinde uyarı banner'ı

### Yeni Dosyalar (Sprint 9a)
- `app/calendar/page.tsx` — Takvim Hub sayfası (3 tab)
- `components/calendar/TodayView.tsx` — Bugün sekmesi (ilaç+takviye+etkinlik+su)
- `components/calendar/MonthView.tsx` — Ay takvim grid'i
- `components/calendar/AddEventDialog.tsx` — Etkinlik ekleme
- `components/calendar/AddVitalDialog.tsx` — Vital kayıt
- `components/calendar/AddSupplementDialog.tsx` — Takviye yönetimi (AI kontrolü)
- `components/calendar/WaterTracker.tsx` — Su takip bileşeni
- `app/api/calendar/route.ts` — Calendar events API
- `app/api/daily-log/route.ts` — Daily log API
- `app/api/supplement-check/route.ts` — AI takviye güvenlik kontrolü
- `supabase/migrations/sprint9_calendar.sql` — 4 yeni tablo + RLS

---

## Dosya Yapısı (Güncel)

```
phytotherapy-ai/
├── app/
│   ├── layout.tsx                       # Cormorant + DM Sans + ThemeProvider
│   ├── page.tsx                         # Landing page v2 (hero + trust + features)
│   ├── globals.css                      # v2 color system (light/dark CSS vars)
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── callback/page.tsx
│   ├── onboarding/page.tsx
│   ├── profile/page.tsx
│   ├── interaction-checker/page.tsx
│   ├── health-assistant/page.tsx
│   ├── blood-test/page.tsx
│   ├── privacy/page.tsx                   # S8 — Gizlilik Politikası (TR+EN)
│   ├── terms/page.tsx                     # S8 — Kullanım Koşulları (TR+EN)
│   └── api/
│       ├── chat/route.ts
│       ├── interaction/route.ts
│       ├── drug-search/route.ts
│       ├── pubmed/route.ts
│       ├── blood-analysis/route.ts
│       ├── generate-pdf/route.ts
│       └── user-data/route.ts             # S8 — KVKK veri export/delete
├── components/
│   ├── ui/                              # shadcn/ui (16 components)
│   ├── illustrations/
│   │   └── botanical-hero.tsx           # NEW — SVG (plant + EKG + molecules)
│   ├── chat/
│   │   ├── ChatInterface.tsx
│   │   ├── ConversationHistory.tsx
│   │   ├── MessageBubble.tsx
│   │   └── SourceCard.tsx
│   ├── interaction/
│   │   ├── DrugInput.tsx
│   │   ├── InteractionResult.tsx
│   │   └── SafetyBadge.tsx
│   ├── blood-test/
│   │   ├── BloodTestForm.tsx
│   │   └── ResultDashboard.tsx
│   ├── onboarding/
│   │   ├── OnboardingWizard.tsx
│   │   └── steps/
│   ├── pdf/
│   │   └── DoctorReport.tsx
│   └── layout/
│       ├── header.tsx                   # UPDATED — ThemeToggle, v2 logo, brand colors
│       ├── footer.tsx                   # UPDATED — brand colors, Cormorant
│       ├── disclaimer-banner.tsx        # UPDATED — CSS variable colors
│       ├── theme-provider.tsx           # NEW — dark/light mode context
│       ├── theme-toggle.tsx             # NEW — Moon/Sun toggle button
│       ├── language-toggle.tsx          # NEW — 🇺🇸 EN / 🇹🇷 TR toggle
│       ├── medication-update-dialog.tsx
│       └── cookie-consent.tsx          # S8 — Cookie consent banner
├── lib/
│   ├── gemini.ts
│   ├── pubmed.ts
│   ├── openfda.ts
│   ├── safety-filter.ts
│   ├── interaction-engine.ts
│   ├── blood-reference.ts
│   ├── prompts.ts
│   ├── auth-context.tsx
│   ├── supabase.ts
│   ├── daily-med-check.ts                 # NEW — localStorage daily/30-day check
│   ├── translations.ts                    # NEW — TR/EN translation system
│   ├── turkish-drugs.ts                   # NEW — Turkish drug database
│   ├── rate-limit.ts                     # S8 — Sliding window rate limiter
│   ├── sanitize.ts                       # S8 — XSS/injection sanitization
│   ├── guest-limit.ts
│   ├── database.types.ts
│   └── utils.ts
├── supabase/
│   └── schema.sql
├── public/
│   ├── phytotherapy_v2.png
│   └── drugs-tr.json                      # NEW — Turkish drug names database
├── .env.local
├── CLAUDE.md
├── PROGRESS.md
├── package.json
├── tsconfig.json
└── next.config.js
```

---

## Git Commit Geçmişi (Son)

| Commit | Mesaj |
|--------|-------|
| `c478ade` | Sprint 8: security, legal pages, assistant v2, collapsible sources, cookie consent |
| `63e407f` | Refactor i18n: single-file language system with SUPPORTED_LANGUAGES config |
| `7d72385` | Update CLAUDE.md v8.0 and PROGRESS.md — Sprint 7.5 complete |
| `b839070` | Sprint 8: 3-tier medication verification, TR/EN translations, profile editing, UI improvements |
| `28a24a9` | Sprint 7: design v2, dark mode, language toggle, logo font, translations |
| `4e4bcdd` | Replace language toggle with mounted guard to fix TR TR duplication |
| `27373dc` | Fix language toggle hydration — single text node with suppressHydrationWarning |
| `2f85054` | Revert font overrides, fix language toggle duplicate, keep dark mode |
| `0fca268` | Fix fonts, dark mode, and language toggle — complete rewrite |
| `00a67a4` | Fix heading fonts with !important + card titles, add lang toggle debug logs |
| `01f55d3` | Fix language toggle, global heading fonts, logo leaf, dark mode refinement |
| `3b61581` | Design fixes: softer dark mode, language toggle, SVG color, remove badges |
| `ea440eb` | Fix design consistency: logo colors, dark mode contrast, fonts, auth avatar |
| `4af1224` | Sprint 7: Design v2 — new brand identity, dark/light mode, botanical hero |
| `ece56a8` | Fix fetchProfile RLS failure — use getUser() instead of getSession() |
| `e37d064` | Update CLAUDE.md to v6.0 and refresh PROGRESS.md |
| `7ea9b25` | Fix medications and allergies not saving during onboarding |

---

*Hackathon: 11-12 Nisan 2026 — 24 gün kaldı*
*Sprint 1-8 tamamlandı. Sıradaki: Sprint 9 — Takvim Hub*
