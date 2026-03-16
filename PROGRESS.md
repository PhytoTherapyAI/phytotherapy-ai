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
| Sprint 6 — Mimari Birleştirme | 🔄 Sırada | — |
| Sprint 7 — Tasarım v2 | 📋 Planlandı | — |
| Sprint 8 — Güvenlik + Yasal | 📋 Planlandı | — |
| Sprint 9 — Hackathon Hazırlık | 📋 Planlandı | — |

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

**Bugfix'ler:**
- Gemini JSON parse hatası → responseMimeType: "application/json" + maxOutputTokens: 8192
- Türkçe ilaç adı tanınmama → Gemini fallback cascade
- Kırmızı kod sadece butona basınca → useMemo ile real-time tespit

---

## ✅ Sprint 4 — Sağlık Asistanı RAG

**Kapsam:** PubMed canlı sorgu + Gemini streaming chat

- [x] /api/chat endpoint (Gemini streaming + profil context + PubMed RAG)
  - Red flag check → profil çekme → PubMed arama → Gemini stream
  - Konuşma geçmişi (son 6 mesaj) context olarak gönderilir
  - hasMedications flag: ilaç profili yoksa doz tavsiyesi verilmez
- [x] /api/pubmed endpoint (doğrudan PubMed arama)
- [x] ChatInterface bileşeni
  - Streaming response gösterimi
  - Auto-scroll, auto-resize textarea
  - Client-side kırmızı kod filtresi
  - Misafir modu: kişisel sorgu engelleme + 5 sorgu limiti
  - Clear chat butonu
- [x] MessageBubble bileşeni (markdown rendering, streaming cursor)
- [x] SourceCard bileşeni (PubMed referans kartları)
- [x] Health assistant sayfası (/health-assistant) — örnek sorularla
- [x] Doz güvenlik kuralı: profilde ilaç yoksa veya misafirse doz tavsiyesi verilmez

**Dosyalar:** app/api/chat/route.ts, app/api/pubmed/route.ts, components/chat/*, app/health-assistant/page.tsx

**Ek düzeltmeler:**
- Login race condition: 300ms delay + router.refresh()
- Email confirmation handling: signup sonrası session kontrolü
- "Already registered" daha anlaşılır hata mesajı
- Misafir limiti 2 → 5 (test kolaylığı)

---

## ✅ Sprint 5 — Kan Tahlili + PDF

**Kapsam:** Kan tahlili analizi, yaşam koçluğu, doktor raporu PDF

- [x] blood-reference.ts: 30 markör, 9 kategori
  - Lipid Panel: Total Cholesterol, LDL, HDL, Triglycerides
  - Vitaminler: D, B12, Folate
  - Mineraller: Ferritin, Iron, Magnesium, Calcium, Zinc
  - Metabolik: HbA1c, Fasting Glucose, Insulin, Uric Acid
  - Tiroid: TSH, Free T4, Free T3
  - İnflamasyon: CRP, ESR
  - Karaciğer: ALT, AST, GGT
  - Böbrek: Creatinine, BUN
  - Kan Sayımı: Hemoglobin, WBC, Platelets
  - Cinsiyet bazlı referans aralıkları
  - analyzeValue() helper: optimal/borderline/low/high status
- [x] /api/blood-analysis endpoint
  - Referans aralığı kontrolü + Gemini JSON analiz
  - Supplement önerileri + yaşam koçluğu + doktor tartışma noktaları
  - İlaç profili farkındalığı (doz güvenliği)
- [x] /api/generate-pdf endpoint (@react-pdf/renderer)
- [x] DoctorReport PDF bileşeni
  - A4 profesyonel layout
  - Hasta bilgisi, sonuç tablosu, supplement önerileri, yaşam tavsiyeleri
  - PubMed kaynakları, disclaimer, footer
- [x] BloodTestForm bileşeni
  - 9 kategori, genişletilebilir paneller
  - Cinsiyet seçimi (referans aralıkları için)
  - Demo veri doldurma butonu
  - Sayısal doğrulama
- [x] ResultDashboard bileşeni
  - 4 sekmeli panel: Results / Supplements / Lifestyle / For Your Doctor
  - Skor kartları (optimal, attention, recommendations)
  - Status badge'leri (✅ Optimal, 🟡 Borderline, 🔴 High/Low)
  - Evidence grade badge'leri (A/B/C)
  - PDF indirme butonu
- [x] Blood test sayfası (/blood-test) — tam UI + emergency banner

**Dosyalar:** lib/blood-reference.ts, app/api/blood-analysis/route.ts, app/api/generate-pdf/route.ts, components/pdf/DoctorReport.tsx, components/blood-test/BloodTestForm.tsx, components/blood-test/ResultDashboard.tsx, app/blood-test/page.tsx

---

## 🔄 Sprint 6 — Mimari Birleştirme + Auth Fix (Sırada)

**Planlanan kapsam:**
- [ ] Onboarding wizard → login sonrası otomatik tetikleme
- [ ] Tek chat router — intent detection
- [ ] Konuşma geçmişi Supabase'e kayıt + yükleme
- [ ] İlaç profili → chat context'ine otomatik ekleme
- [ ] Profil sayfası tam çalışır
- [ ] Her girişte "İlaç listeniz aynı mı?" dialog'u

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
│   │   └── callback/route.ts           # OAuth callback
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
│   │   ├── MessageBubble.tsx
│   │   └── SourceCard.tsx
│   ├── interaction/
│   │   ├── DrugInput.tsx
│   │   ├── InteractionResult.tsx
│   │   └── SafetyBadge.tsx
│   ├── blood-test/
│   │   ├── BloodTestForm.tsx
│   │   └── ResultDashboard.tsx
│   ├── pdf/
│   │   └── DoctorReport.tsx
│   └── layout/                          # Header, Footer
├── lib/
│   ├── gemini.ts                        # Gemini API (ask, askJSON, askStream)
│   ├── pubmed.ts                        # PubMed E-utilities
│   ├── openfda.ts                       # OpenFDA + Gemini fallback
│   ├── safety-filter.ts                 # Red flag detection (EN + TR)
│   ├── interaction-engine.ts            # 8-step interaction pipeline
│   ├── blood-reference.ts              # 30 markers, 9 categories
│   ├── prompts.ts                       # System prompts
│   ├── auth-context.tsx                 # Auth provider
│   ├── supabase.ts                      # Browser + Server clients
│   ├── guest-limit.ts                   # Guest query tracking
│   ├── database.types.ts                # Supabase types
│   └── utils.ts
├── supabase/
│   └── schema.sql                       # 7 tables + RLS + triggers
├── public/
├── .env.local
├── CLAUDE.md                            # v5.0 — proje anayasası
├── PROGRESS.md                          # Bu dosya
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

---

## Git Commit Geçmişi

| Commit | Mesaj |
|--------|-------|
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
