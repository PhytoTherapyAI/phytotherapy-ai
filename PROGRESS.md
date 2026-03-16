# PROGRESS.md — Phytotherapy.ai Sprint İlerleme Takibi

> Son güncelleme: 16 Mart 2026

---

## Genel Durum

| Sprint | Durum | Tarih |
|--------|-------|-------|
| Sprint 1 — Altyapı | ✅ Tamamlandı | Mart 2026 |
| Sprint 2 — Auth + Onboarding | ✅ Tamamlandı | Mart 2026 |
| Sprint 3 — İlaç Etkileşim Motoru | ✅ Tamamlandı | Mart 2026 |
| Sprint 4 — Sağlık Asistanı RAG | ✅ Tamamlandı | Mart 2026 |
| Sprint 5 — Kan Tahlili + PDF | ✅ Tamamlandı | 16 Mart 2026 |
| Sprint 6 — Mimari Birleştirme | 🔄 Devam Ediyor | 16 Mart 2026 |
| Sprint 7 — Tasarım v2 | 📋 Sırada | — |
| Sprint 8 — Güvenlik + Yasal | 📋 Planlandı | — |
| Sprint 9 — Hackathon Hazırlık | 📋 Planlandı | — |

**Hackathon: 11-12 Nisan 2026 — 26 gün kaldı**

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

## 🔄 Sprint 6 — Mimari Birleştirme + Auth Fix (DEVAM EDİYOR)

**Kapsam:** Auth akışı, hata yönetimi, Gemini API stabilizasyonu, onboarding düzeltmeleri

### Tamamlanan
- [x] Login → onboarding_complete kontrolü → /onboarding yönlendirmesi ✅
- [x] Sign in / Sign out tam düzeltme (global signout, localStorage temizleme) ✅
- [x] OAuth callback onboarding kontrolü ✅
- [x] Sağlık dışı mesajlara nazik yönlendirme (off-topic handling) ✅
- [x] Konuşma geçmişi yan panel — ConversationHistory bileşeni (son 20 konuşma) ✅
- [x] Gemini retry + exponential backoff + model fallback (2.0-flash → 2.5-flash) ✅
- [x] TR→EN PubMed sözlük (70+ Türkçe sağlık terimi → İngilizce) ✅
- [x] PubMed timeout (8s) + error handling (boş döner, crash etmez) ✅
- [x] Chat API streaming error handling (JSON 500 yerine streaming text mesajı) ✅
- [x] Onboarding medication/allergy kayıt hatası düzeltildi ✅
  - Profil artık EN SON güncellenir (meds → allergies → consent → profile)
  - Auth session doğrulaması eklendi
  - Delete-then-insert retry güvenliği

### Bekleyen
- [ ] **API quota test** — Gemini billing aktif mi? (yarın test edilecek)
- [ ] Tek chat router — intent detection
- [ ] İlaç profili → chat context otomatik ekleme
- [ ] Her girişte "İlaç listeniz hâlâ aynı mı?" dialog'u
- [ ] Profil sayfası tam çalışır

### Bugfix Kaydı (Sprint 6)
| Bug | Sebep | Çözüm |
|-----|-------|-------|
| Tüm chat mesajları "Something went wrong" | gemini-2.5-flash free tier 20 req/day, 429 sonrası JSON 500 | gemini-2.0-flash primary (1500/gün) + streaming error response |
| gemini-2.0-flash da tükendi | Free tier tüm modeller tükendi | Retry + fallback chain + QUOTA_EXHAUSTED mesajı |
| Türkçe sağlık soruları başarısız | PubMed Türkçe keyword bulamıyor + timeout crash | TR→EN sözlük + 8s timeout + try/catch |
| Login sonrası onboarding atlanıyor | Session propagation race condition | Retry getUser() 3x + window.location.href |
| Medication/allergy kaydedilmiyor | Profil onboarding_complete=true ÖNCE güncelleniyor | Save sırası: meds → allergies → consent → profile (LAST) |

---

## 📋 Sprint 7 — Tasarım v2 (SIRADA)

**Kapsam:** phytotherapy_v2.png referansıyla tam UI overhaul

- [ ] Cormorant Garamond + DM Sans + DM Mono font sistemi
- [ ] CSS variables ile renk sistemi (light/dark)
- [ ] Dark/Light mode toggle navbar sağında (ay/güneş ikonu, localStorage)
- [ ] Hero bölümü: Sol arama (⌘K) + sağ botanik SVG (EKG + molekül)
- [ ] Trust strip (5 madde, yeşil checkmark)
- [ ] Feature kartları (01/02/03/04, Cormorant başlık)
- [ ] Navbar: logo sol, linkler orta, auth+toggle sağ
- [ ] Responsive mobile-first
- [ ] Loading skeleton + error states
- [ ] Animasyonlar (subtle hover, fade-in)

---

## Dosya Yapısı (Güncel)

```
phytotherapy-ai/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                        # Landing page
│   ├── globals.css
│   ├── auth/
│   │   ├── login/page.tsx              # Login + Signup
│   │   └── callback/page.tsx           # OAuth callback
│   ├── onboarding/page.tsx             # 7-step wizard
│   ├── profile/page.tsx                # User profile
│   ├── interaction-checker/page.tsx    # Drug-herb interaction
│   ├── health-assistant/page.tsx       # AI chat + PubMed RAG
│   ├── blood-test/page.tsx             # Blood test analysis
│   └── api/
│       ├── chat/route.ts               # Gemini streaming chat
│       ├── interaction/route.ts         # Drug interaction analysis
│       ├── pubmed/route.ts              # PubMed search
│       ├── blood-analysis/route.ts      # Blood test analysis
│       └── generate-pdf/route.ts        # Doctor report PDF
├── components/
│   ├── ui/                              # shadcn/ui (16 components)
│   ├── chat/
│   │   ├── ChatInterface.tsx
│   │   ├── ConversationHistory.tsx      # NEW — yan panel geçmişi
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
│   │   ├── OnboardingWizard.tsx         # FIXED — save order
│   │   └── steps/                       # 8 step components
│   ├── pdf/
│   │   └── DoctorReport.tsx
│   └── layout/                          # Header, Footer
├── lib/
│   ├── gemini.ts                        # UPDATED — retry + fallback
│   ├── pubmed.ts                        # UPDATED — timeout + error handling
│   ├── openfda.ts                       # OpenFDA + Gemini fallback
│   ├── safety-filter.ts                 # Red flag detection (EN + TR)
│   ├── interaction-engine.ts            # 8-step interaction pipeline
│   ├── blood-reference.ts              # 30 markers, 9 categories
│   ├── prompts.ts                       # UPDATED — off-topic handling
│   ├── auth-context.tsx                 # UPDATED — global signout
│   ├── supabase.ts                      # Browser + Server clients
│   ├── guest-limit.ts                   # Guest query tracking
│   ├── database.types.ts                # Supabase types
│   └── utils.ts
├── supabase/
│   └── schema.sql                       # 7 tables + RLS + triggers
├── public/
│   └── phytotherapy_v2.png              # Tasarım referansı
├── .env.local
├── CLAUDE.md                            # v6.0 — proje anayasası
├── PROGRESS.md                          # Bu dosya
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

---

## Git Commit Geçmişi (Son)

| Commit | Mesaj |
|--------|-------|
| `7ea9b25` | Fix medications and allergies not saving during onboarding |
| — | Add retry with exponential backoff and model fallback for Gemini API |
| — | Fix Turkish health queries + PubMed error handling + streaming errors |
| — | Add conversation history sidebar + off-topic handling + onboarding redirect |
| — | Fix sign in/out + auth flow |
| `e7575e6` | Sprint 5: Blood Test Analysis with PDF doctor report |
| `a20b05a` | Safety: no dosage advice without medication profile + fix login flow |
| `b71e2c3` | Increase guest query limit from 2 to 5 for testing |
| `386f105` | Sprint 4: Health Assistant RAG with streaming chat |
| `322119d` | Red flag filter: real-time client-side detection on concern input |
| `05caaa2` | Fix: Force Gemini JSON mode + robust parser rewrite |
| `3a0f7c5` | Fix: Gemini JSON parse + Turkish drug name fallback |
| `7c9c291` | Sprint 3: Drug-Herb Interaction Engine |
| `0745d7d` | Sprint 2: Auth system + Onboarding wizard + Guest mode |
| — | Sprint 1: Initial setup + deploy |

---

*Hackathon: 11-12 Nisan 2026 — 26 gün kaldı*
*Yarın: Gemini API quota testi → Sprint 7 Tasarım v2'ye geçiş*
