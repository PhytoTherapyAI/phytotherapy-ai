# PROGRESS.md — Phytotherapy.ai Sprint İlerleme Takibi

> Son güncelleme: 19 Mart 2026 (v10.7 — Sprint 10b tam tamamlandı)

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
| Sprint 9 — Takvim Hub | ✅ Tamamlandı | 18 Mart 2026 |
| Sprint 10a — Sağlık Skorları + Dashboard | ✅ Tamamlandı | 19 Mart 2026 |
| Sprint 10b — Takviye İyileştirmeleri | ✅ Tamamlandı | 19 Mart 2026 |
| Sprint 11 — Viral + Oyunlaştırma | 📋 Sırada | — |

**Hackathon: 11-12 Nisan 2026 — 23 gün kaldı**

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

## ✅ Sprint 9 — Takvim Hub

**Kapsam:** Merkezi sağlık takvimi — ilaç takibi, takviye, su, vital, görevler, bildirimler

### Sprint 9a — Temel Altyapı
- [x] Takvim sayfası (/calendar) — 3 tab (Bugün/Takvim/Sağlık Ölçümleri)
- [x] İlaç kutucuk sistemi (tıklanabilir, optimistic update, animasyonlu)
- [x] Takviye paneli (AI güvenlik kontrolü, profil bazlı doz, renk kodlu: yeşil/sarı/kırmızı)
- [x] Su takibi (SVG damla dolum, gradient progress bar, hedef ayarlama)
- [x] Vital takibi (tansiyon/şeker/kilo/nabız) + dialog
- [x] Etkinlik ekleme (7 tür + tekrar + hızlı ekle chip'leri)
- [x] Streak sistemi (🔥 ardışık gün takibi)
- [x] Ay takvim grid'i (renkli noktalar, gün tıklama)
- [x] Supabase migration: calendar_events, daily_logs, water_intake, vital_records
- [x] API: /api/calendar, /api/daily-log, /api/supplement-check (rate limited)

### Sprint 9b — Animasyonlar, Hatırlatıcı, Su v5, i18n Merkezileştirme
- [x] Full-page confetti (50 parçacık) tüm ilaçlar tamamlandığında
- [x] 14 kişiye özel mizahi mesaj (isimle hitap, TR/EN)
- [x] Çan hatırlatma sistemi — Dialog UI, saat seçimi, hızlı preset'ler, Onayla butonu
- [x] Hatırlatma localStorage + Supabase calendar_events'e kaydediliyor
- [x] İlaç saati geçtiğinde amber uyarı banner'ı (pulse animasyon)
- [x] Su Tüketimi v5 — bardak/ml modu toggle, slider (50ml adım, 1000ml max, yuvarlak handle)
- [x] Kişisel su limiti (boy/kilo bazlı min/max), kişisel min default hedef
- [x] Su zehirlenmesi koruması — üst limitte ekleme engeli + uyarı
- [x] 20+ esprili hedef aşımı mesajı, her seviye için 4+ çeşitli mesaj
- [x] Progress bar altında ml etiketleri, damla yanında ml gösterimi
- [x] Dark mode su damlası glow efekti
- [x] Hedef Belirle dialog (Target icon, kişisel aralık gösterimi)
- [x] Profildeki takviyeler otomatik gösterim (chip'ler)
- [x] Takviye açıklamaları İngilizce→Türkçe çeviri katmanı
- [x] Takviye API tüm alanları kullanıcı diline göre döndürüyor
- [x] Takviye ekleme sonrası dialog açık kalıyor (sıfırlanıyor)
- [x] Etkinlik silme (hover trash icon) + düzenleme (tıkla→edit dialog)
- [x] Haftalık özet kartı (MonthView'da ilaç/su tamamlama istatistiği)
- [x] Takvim günlerine emoji (✅ tamam / ⚠️ kısmen)
- [x] Telefon takvimi .ics export
- [x] Otomatik dil algılama (navigator.language)
- [x] Onboarding: doğum tarihi (otomatik yaş), erkekse gebelik atlanıyor
- [x] Med-check fix: ilk üyelik 30 gün sorunu, login tekrar sorma
- [x] Vitals: "Son Vital Kayıtları" italic font, "Ölçüm Ekle" butonu
- [x] i18n merkezileştirme — tüm inline ternary'ler tx() key'lerine taşındı
- [x] Login sayfası tam Türkçe (24+ yer), auth callback, GuestWall, SafetyBadge, SourceCard, ConversationHistory
- [x] MESSAGE_ARRAYS sistemi — txRandom()/txMessages() API
- [x] Yeni dil = sadece translations.ts düzenle
- [x] Çeviri denetimi: UI %99.5+ kapsama

### Yeni/Güncellenen Dosyalar (Sprint 9)
- `components/calendar/TodayView.tsx` — Bugün sekmesi (tam yeniden yazıldı — v5)
- `components/calendar/MonthView.tsx` — Ay takvim + haftalık özet + emoji + silme
- `components/calendar/AddEventDialog.tsx` — Etkinlik ekleme/düzenleme (edit modu)
- `components/calendar/AddSupplementDialog.tsx` — Takviye yönetimi + çeviri katmanı
- `lib/translations.ts` — ~300 key + MESSAGE_ARRAYS + txRandom/txMessages
- `lib/daily-med-check.ts` — markFirstLoginDone(), 1.5s delay
- `lib/database.types.ts` — birth_date eklendi
- `components/onboarding/steps/BasicInfoStep.tsx` — Doğum tarihi input
- `components/onboarding/OnboardingWizard.tsx` — Erkek→gebelik atlama
- `app/auth/login/page.tsx` — Tam tx() çeviri
- `app/auth/callback/page.tsx` — Tam tx() çeviri
- `components/common/GuestWall.tsx` — Tam tx() çeviri
- `components/interaction/SafetyBadge.tsx` — Tam tx() çeviri
- `components/chat/SourceCard.tsx` — Kaynaklar çevirisi
- `components/chat/ConversationHistory.tsx` — Zaman formatları çevirisi
- `app/api/supplement-check/route.ts` — Tüm alanlar kullanıcı dilinde
- `supabase/migrations/sprint9_calendar.sql` — Kod ile eşleşen kolon isimleri

---

## ✅ Sprint 10a — Sağlık Skorları + Dashboard + Takviye Döngüsü

**Kapsam:** Günlük sağlık skoru, mikro check-in, dashboard, biyolojik yaş, metabolik portföy, kalori hesaplama

### Sprint 10a — Temel Altyapı (FREE)
- [x] Günlük sağlık skoru (0-100) — 4 bileşenden hesaplama (check-in 40pt + ilaç uyumu 30pt + su 15pt + vital 15pt)
- [x] Mikro check-in dialog — 4 soru (enerji/uyku/ruh hali/sindirim), emoji seçim, günde 1 kez
- [x] Ana sayfa günlük özet kartı — skor dairesi, ilaç/su/check-in durumu, trend, streak
- [x] Kalori ihtiyacı hesaplama tool'u — Mifflin-St Jeor formülü, cinsiyet/yaş/boy/kilo/aktivite
- [x] Sabah özeti push bildirimi — localStorage tabanlı, 6-10 arası tetikleme
- [x] Dashboard sayfası (/dashboard) — tüm skor bileşenlerini birleştiren ana panel
- [x] Navbar'a Dashboard linki eklendi

### Sprint 10b — Premium Özellikler
- [x] Biyolojik yaş skoru — profil verilerinden hesaplama (egzersiz, uyku, sigara, alkol, BMI, kronik hastalık)
- [x] Metabolik portföy (4 alan: Enerji/Stres/Uyku/Bağışıklık) — check-in verilerinden görselleştirme
- [x] Washout/cycling geri sayım — supplement döngü takibi (ashwagandha, rhodiola, melatonin vb.)
- [x] Semptom pattern tespiti — 14 günlük check-in trendlerinden AI analiz (iyileşme/kötüleşme/korelasyon)
- [x] Haftalık özet kartı — 7 günlük bar chart, ortalama skor, en iyi gün, paylaş butonu
- [x] Premium kilitli gösterim — Lock ikonu + PREMIUM badge, blur overlay

### Yeni/Güncellenen Dosyalar (Sprint 10)
- `app/dashboard/page.tsx` — Sağlık paneli sayfası (8 bileşen)
- `app/api/check-in/route.ts` — Mikro check-in CRUD API (rate limited)
- `app/api/health-score/route.ts` — Sağlık skoru hesaplama API
- `app/api/biological-age/route.ts` — Biyolojik yaş hesaplama API (premium)
- `components/dashboard/MicroCheckIn.tsx` — 4 adımlı check-in dialog
- `components/dashboard/MicroCheckInWrapper.tsx` — Auth-aware wrapper + sabah bildirimi
- `components/dashboard/DailySummaryCard.tsx` — Ana sayfa özet kartı (skor + trend)
- `components/dashboard/CalorieCalculator.tsx` — Kalori hesaplama aracı
- `components/dashboard/BiologicalAgeCard.tsx` — Biyolojik yaş kartı (premium)
- `components/dashboard/MetabolicPortfolio.tsx` — 4 alan metabolik portföy (premium)
- `components/dashboard/WashoutCountdown.tsx` — Supplement döngü takibi (premium)
- `components/dashboard/WeeklySummaryCard.tsx` — Haftalık özet + bar chart (premium)
- `components/dashboard/SymptomPatternCard.tsx` — AI pattern detection (premium)
- `lib/health-score.ts` — Sağlık skoru hesaplama motoru
- `lib/notifications.ts` — Push notification helper
- `lib/database.types.ts` — DailyCheckIn type eklendi
- `lib/translations.ts` — ~80 yeni key (check-in, dashboard, calorie, bioage, metabolic, washout, weekly, pattern)
- `supabase/migrations/sprint10_health_scores.sql` — daily_check_ins tablosu + RLS

### Sprint 10a — Ek İyileştirmeler (Aynı Oturum)
- [x] Ana sayfa yeniden tasarım (auth: 2x2 grid — summary+asistan / hero yazı+görsel)
- [x] Navbar sadeleştirme (Panel ayrı buton, kısa isimler)
- [x] Check-in butonu belirginleştirme (turuncu CTA, tam genişlik)
- [x] Loading spinner (auth resolve beklerken guest→auth flash engeli)
- [x] Takviye döngüsü takvimden gerçek veri (calendar_events'ten fetch)
- [x] Profil takviyeleri otomatik ekleme (onboarding supplements → calendar_events sync)
- [x] Doz ayarlama dialog (önerilen doz, overdoz uyarı, döngü süresi seçimi, sınırsız, kaldırma)
- [x] Biyolojik yaş otomatik hesaplama + günlük cache (localStorage)
- [x] Metabolik portföy check-in verisi bağlantısı
- [x] Duplikat takviye koruması (normalize matching + client-side dedup)
- `lib/supplement-data.ts` — Takviye referans verileri (doz, max doz, döngü)
- `components/dashboard/SupplementDoseDialog.tsx` — Doz ayarlama dialog

---

## ✅ Sprint 10b — Takviye İyileştirmeleri (Tam)

**Kapsam:** Takviye sistemi tam entegrasyon — toggle, streak, hatırlatıcı, dropdown arama, doz ayar, 2-sütun layout, etkileşim butonları, kapsamlı veritabanı

### Temel Takviye Sistemi
- [x] Kaydet persist doğrulandı (RLS politikaları doğru, session akışı çalışıyor)
- [x] Takviye tıklanabilir toggle — ilaç gibi daily_logs'a kaydedilir (optimistic update + animasyon)
- [x] Takviye streak takibi (🔥 ardışık gün sayacı, ilaç streak'ten bağımsız)
- [x] Takviye confetti animasyonu — tüm takviyeler tamamlanınca patlar
- [x] Takviye kişisel mesajlar — 7 Türkçe + 7 İngilizce esprili tamamlama mesajı
- [x] Takviye çan hatırlatma — saat girince "Bildirim al" butonu çıkıyor, tek akış
- [x] Takviye overdue uyarı banner'ı — saat geçtiyse + henüz alınmadıysa pulse animasyon
- [x] Takviye-ilaç etkileşim görüntüleme — renk kodlu nokta (yeşil/sarı/kırmızı) her takviye yanında
- [x] Takviye ilerleme badge — X/Y tamamlama sayacı + ✓ hepsi tamam
- [x] Günlük ilerleme kartı güncellendi — ilaç + takviye birlikte gösterim

### Takviye Ekleme & Arama
- [x] Dropdown öneri listesi — yazarken anlık filtre (200+ takviye kataloğundan)
- [x] AI profil analizi — seçim sonrası güvenlik kontrolü (safe/caution/dangerous)
- [x] İlk eklemede doz ayarlama — input + overdoz uyarı + asistan önerisi
- [x] Otomatik birim algılama — sadece sayı girince birim eklenir (8 → "8 gram")
- [x] "Asistan önerisi" kartı — belirgin yeşil kutu, recommendedDose + frequency
- [x] Saat + bildirim birleşik akış — saat girince çan butonu çıkar, çift input yok
- [x] Takviye dialog temizlendi — dropdown yok iken hint text, autoFocus

### Kapsamlı Takviye Veritabanı
- [x] `supplements-catalog.json` — 200+ takviye, 9 kategori (NIH ODS, PubMed, WHO kaynaklı)
  - Vitaminler (18), Mineraller (21), Amino Asitler (21), Bitkisel (55)
  - Spor (33), Yağ Asitleri (13), Probiyotik (16), Antioksidanlar (16), Özel (38)
- [x] `supplement-data.ts` — 80+ takviye doz bilgisi (recommendedDose, maxDose, cycleDays, unit)
- [x] Türkçe↔İngilizce isim haritası — 60+ çift yönlü eşleşme
  - tirozin→L-Tyrosine, teanin→L-Theanine, arjinin→L-Arginine, glutamin→L-Glutamine vb.
- [x] `formatDoseWithUnit()` — otomatik birim tespiti (mg/g/IU/mcg/CFU)
- [x] Türkçe arama — "tirozin", "çörek otu", "zerdeçal" vb. doğrudan bulunur

### Takvim Layout & UX
- [x] 2-sütun yatay layout — Sol: Check-in+İlaçlar+Takviyeler | Sağ: Etkinlikler+Su
- [x] Takvim genişliği = Dashboard genişliği (max-w-6xl, gap-6)
- [x] Check-in kartı — yapıldıysa ✅ "Check-in tamamlandı", buton gizlenir
- [x] Check-in streak düzeltildi — API'den ardışık gün hesaplaması (health-score endpoint)
- [x] Takviye kaybolma sorunu fix — recurring supplement events de fetch ediliyor
- [x] Takviye doz düzenleme — ✎ ikonu tıklanabilir, dialog ile düzenleme
- [x] Sınırsız döngü fix — "0 gün" yerine "∞ Sınırsız", progress bar gizlenir

### Panel (Dashboard) Senkronizasyon
- [x] "Takviye Ekle" butonu → AddSupplementDialog açıyor (text input yerine)
- [x] SupplementDoseDialog — bell hatırlatıcı, döngü süresi düzenleme, DB'den yükleme
- [x] WashoutCountdown — bell+saat gösterimi, sınırsız döngü desteği
- [x] Navbar: "Panel" butonu diğer linklerle aynı stilde
- [x] Akşam hatırlatma — saat 20:00'den sonra alınmamış ilaç/takviye bildirimi

### Etkileşim Denetleyicisi Entegrasyonu
- [x] "Takviyelerime Ekle" butonu — güvenli/dikkatli bitki kartlarında
- [x] Tek tıkla önerilen dozla calendar_events'e kayıt
- [x] Eklendiyse ✓ gösterimi, duplicate koruması
- [x] Tehlikeli (kırmızı) kartlarda buton gizli

### Yeni/Güncellenen Dosyalar (Sprint 10b)
- `components/calendar/TodayView.tsx` — 2-sütun layout, toggle, streak, confetti, bell, overdue, checkin, dose edit (MAJOR)
- `components/calendar/AddSupplementDialog.tsx` — Dropdown arama, AI analiz, doz ayar, bildirim (REWRITE)
- `components/dashboard/WashoutCountdown.tsx` — Bell, sınırsız döngü, Türkçe isim (MAJOR)
- `components/dashboard/SupplementDoseDialog.tsx` — Bell hatırlatıcı, döngü düzenleme, DB yükleme (REWRITE)
- `components/dashboard/DailySummaryCard.tsx` — Streak fix (API'den)
- `components/interaction/InteractionResult.tsx` — "Takviyelerime ekle" butonu (MAJOR)
- `components/layout/header.tsx` — Panel butonu stili düzeltme
- `app/calendar/page.tsx` — max-w-6xl, header stili dashboard ile aynı
- `app/dashboard/page.tsx` — AddSupplementDialog entegrasyonu
- `app/api/health-score/route.ts` — Streak hesaplama eklendi
- `app/api/supplement-check/route.ts` — Daha doğal prompt (arkadaş tonu)
- `lib/supplement-data.ts` — 80+ takviye doz DB, 60+ TR↔EN map, formatDoseWithUnit() (MAJOR)
- `public/supplements-catalog.json` — 200+ takviye, 9 kategori kataloğu (NEW)

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
│   ├── dashboard/page.tsx                 # S10 — Sağlık paneli
│   └── api/
│       ├── chat/route.ts
│       ├── interaction/route.ts
│       ├── drug-search/route.ts
│       ├── pubmed/route.ts
│       ├── blood-analysis/route.ts
│       ├── generate-pdf/route.ts
│       ├── user-data/route.ts             # S8 — KVKK veri export/delete
│       ├── check-in/route.ts              # S10 — Mikro check-in API
│       ├── health-score/route.ts          # S10 — Sağlık skoru API
│       └── biological-age/route.ts        # S10 — Biyolojik yaş API
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
│   ├── dashboard/                         # S10 — Sağlık Skorları
│   │   ├── MicroCheckIn.tsx               # Check-in dialog (4 soru)
│   │   ├── MicroCheckInWrapper.tsx        # Auth wrapper + sabah bildirimi
│   │   ├── DailySummaryCard.tsx           # Günlük özet kartı
│   │   ├── CalorieCalculator.tsx          # Kalori hesaplama
│   │   ├── BiologicalAgeCard.tsx          # Biyolojik yaş (premium)
│   │   ├── MetabolicPortfolio.tsx         # 4 alan portföy (premium)
│   │   ├── WashoutCountdown.tsx           # Takviye döngü (premium)
│   │   ├── WeeklySummaryCard.tsx          # Haftalık özet (premium)
│   │   └── SymptomPatternCard.tsx         # AI pattern tespiti (premium)
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
│   ├── health-score.ts                   # S10 — Sağlık skoru hesaplama motoru
│   ├── notifications.ts                  # S10 — Push notification helper
│   └── utils.ts
├── supabase/
│   ├── schema.sql
│   └── migrations/
│       ├── sprint9_calendar.sql
│       └── sprint10_health_scores.sql    # S10 — daily_check_ins tablosu
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

*Hackathon: 11-12 Nisan 2026 — 23 gün kaldı*
*Sprint 1-10b tamamlandı. Sıradaki: Sprint 11 — Viral + Oyunlaştırma*
