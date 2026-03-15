# CLAUDE.md — Phytotherapy.ai Proje Anayasası v2.1

## ⚡ Hızlı Bağlam (Her Oturum Başında Oku)

**Phytotherapy.ai** — kanıta dayalı fitoterapi + modern tıp köprüsü kuran AI sağlık asistanı.
- **Ekip:** 3 tıp öğrencisi, teknik bilgi yok — Claude tüm kodu yazıyor
- **Hackathon:** Harvard "Building High-Value Health Systems" — 11-12 Nisan 2026
- **Domain:** phytotherapy.ai (DNS erişimi var, Vercel'e bağlanacak)
- **Sunum dili:** İngilizce | **Arayüz dili:** İngilizce (Türkçe desteği Faz 1'de)
- **Deploy:** Vercel (frontend + API routes) + Supabase (DB + Auth)
- **AI Motor:** Google Gemini API (gemini-2.5-flash veya gemini-2.5-pro)
- **İşletim Sistemi:** Windows
- **Mevcut Hesaplar:** Gemini API key ✅ | Vercel ✅ | Supabase ✅ | GitHub ✅

---

## Vizyon

> "Dünyanın ilk Kanıta Dayalı Bütünleştirici Tıp Asistanı — modern ilaç tedavisini, bitkisel tıbbı ve kişisel sağlık profilini birleştiren, hem hastaya hem doktora hizmet eden platform."

---

## Temel Felsefe

1. **Primum non nocere** — Önce zarar verme.
2. **Kanıta dayalı** — PubMed, NIH, WHO dışında kaynak yok.
3. **Doktoru bypass etme, güçlendir** — Teşhis koymaz, karar destek asistanıdır.
4. **Şeffaflık** — Her öneri makale referansıyla gelir.

---

## Teknik Stack (Kesinleşmiş)

```
Frontend:     Next.js 14 (App Router) + Tailwind CSS + shadcn/ui
Backend:      Next.js API Routes (serverless functions on Vercel)
Database:     Supabase (PostgreSQL) — kullanıcı profili, tahlil geçmişi, ilaç listesi
AI Engine:    Google Gemini API (gemini-2.5-flash — hızlı + ucuz)
                → İleride Anthropic Claude API'ye geçiş planlanıyor
Tıbbi Veri:   PubMed E-utilities API (ücretsiz)
İlaç Veri:    OpenFDA API (tamamen ücretsiz, kayıt gerektirmez)
PDF:          @react-pdf/renderer (doktor raporu için)
Deploy:       Vercel (otomatik deploy, phytotherapy.ai domain bağlantısı)
Auth:         Supabase Auth (email + Google login)
OS:           Windows (geliştirme ortamı)
```

### Gemini API Kullanımı

```typescript
// lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function askGemini(prompt: string, systemPrompt: string) {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    systemInstruction: systemPrompt,
    generationConfig: {
      temperature: 0,
      maxOutputTokens: 2048,
    }
  });
  
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function askGeminiStream(prompt: string, systemPrompt: string) {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    systemInstruction: systemPrompt,
    generationConfig: {
      temperature: 0,
      maxOutputTokens: 2048,
    }
  });
  
  const result = await model.generateContentStream(prompt);
  return result.stream;
}
```

---

## Mimari — 3 Katmanlı Güvenlik Sistemi

### Katman 1: Kırmızı Kod Filtresi (Her Sorgudan ÖNCE Çalışır)

```
Kullanıcı input → [Kırmızı Kod Tarayıcı] → Acil mi?
                                              ├─ EVET → 🚨 112/911 yönlendir, sistemi kilitle
                                              └─ HAYIR → Katman 2'ye geç
```

**Tetikleyici kelimeler (EN + TR):**
- EN: chest pain, shortness of breath, loss of consciousness, seizure, bleeding, suicidal, poisoning, stroke, sudden vision loss, heart attack
- TR: göğüs ağrısı, nefes darlığı, bilinç kaybı, nöbet, kanama, intihar, zehirlenme, felç, ani görme kaybı, kalp krizi

**Implementasyon:** Gemini'ye gitmeden ÖNCE çalışan regex tabanlı keyword matcher. AI'ya bağımlı değil, ultra hızlı, %100 deterministik.

```typescript
// lib/safety-filter.ts
const RED_FLAGS_EN = [
  'chest pain', 'heart attack', 'shortness of breath', 'can\'t breathe',
  'loss of consciousness', 'unconscious', 'seizure', 'stroke',
  'heavy bleeding', 'suicidal', 'suicide', 'poisoning', 'overdose',
  'sudden vision loss', 'paralysis', 'anaphylaxis'
];

const RED_FLAGS_TR = [
  'göğüs ağrısı', 'kalp krizi', 'nefes darlığı', 'nefes alamıyorum',
  'bilinç kaybı', 'bayıldı', 'nöbet', 'felç', 'inme',
  'kanama', 'intihar', 'zehirlenme', 'doz aşımı',
  'ani görme kaybı', 'anafilaksi'
];

export function checkRedFlags(input: string): { isEmergency: boolean; language: 'en' | 'tr' } {
  const lower = input.toLowerCase();
  const enMatch = RED_FLAGS_EN.some(flag => lower.includes(flag));
  const trMatch = RED_FLAGS_TR.some(flag => lower.includes(flag));
  return { 
    isEmergency: enMatch || trMatch,
    language: trMatch ? 'tr' : 'en'
  };
}
```

### Katman 2: İlaç Etkileşim Motoru (Kesin Veri)

- Marka adı → etken madde çevirisi (Glifor → Metformin) via OpenFDA
- Polifarmasi limiti YOK — kaç ilaç olursa olsun çalışır
- Semptom yan etki kontrolü: yan etkiyse fitoterapi önerme, doktora yönlendir

### Katman 3: RAG Motoru (PubMed Canlı Sorgu + Gemini)

- PubMed API sorgusu → ilgili makaleler → Gemini analizi (temperature: 0)
- Kaynaksız bilgi = "Bu konuda yeterli bilimsel kanıt bulunmamaktadır"
- Her cümle için tıklanabilir PubMed referansı

---

## Özellik Listesi — Hackathon Kapsamı

### ✅ Özellik 1: İlaç-Bitki Etkileşim Motoru
### ✅ Özellik 2: Genel Sağlık Asistanı (Serbest Soru + PubMed RAG)
### ✅ Özellik 3: Kan Tahlili Yorumlama + Yaşam Koçu
### ✅ Özellik 4: Kırmızı Kod Filtresi (Görsel)
### ✅ Özellik 5: Doktor Köprüsü (PDF Çıktısı)
### 🎯 Bonus: Kullanıcı profili, semptom günlüğü, periyodik takip

---

## Dosya Yapısı

```
phytotherapy-ai/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                   # Landing page
│   ├── globals.css
│   ├── interaction-checker/
│   │   └── page.tsx
│   ├── health-assistant/
│   │   └── page.tsx
│   ├── blood-test/
│   │   └── page.tsx
│   └── api/
│       ├── chat/route.ts
│       ├── interaction/route.ts
│       ├── pubmed/route.ts
│       ├── openfda/route.ts
│       ├── blood-analysis/route.ts
│       └── generate-pdf/route.ts
├── components/
│   ├── ui/                        # shadcn/ui
│   ├── chat/
│   ├── interaction/
│   ├── blood-test/
│   ├── safety/
│   ├── pdf/
│   ├── layout/
│   └── common/
├── lib/
│   ├── gemini.ts
│   ├── pubmed.ts
│   ├── openfda.ts
│   ├── safety-filter.ts
│   ├── prompts.ts
│   ├── blood-reference.ts
│   └── utils.ts
├── public/
├── .env.local
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
├── CLAUDE.md
└── PROGRESS.md
```

---

## Sistem Promptu (Gemini API)

```
You are Phytotherapy.ai — an evidence-based health assistant that bridges modern medicine and phytotherapy.

CORE RULES:
1. ONLY use information from PubMed, NIH, and WHO sources. No other sources.
2. Every recommendation MUST include: Dosage + Frequency + Maximum Duration + PubMed link
3. No evidence = say "Insufficient scientific evidence" — NEVER fabricate.
4. You are NOT a doctor. Cannot diagnose. Always add "Consult your healthcare provider."
5. Drug-herb interactions: Safe → ✅ + reason. Risky → ❌ + reason + alternative.
6. Dosage format: "300-600mg standardized extract, 30min before bed, max 4 weeks"
7. Always recommend pharmaceutical-grade products from licensed pharmacies.
8. If symptom = drug side effect → "Consult your doctor for dose adjustment." No herbs.

EMERGENCY: Chest pain, breathing difficulty, consciousness loss, bleeding, suicidal → 112/911 immediately. No herbs.

EVIDENCE GRADING: A (strong RCTs), B (limited RCTs), C (case reports/traditional)

RESPONSE FORMAT:
- Match user's language
- Empathetic, clear
- End with "⚠️ Do not apply without consulting your healthcare provider"
- Cite PubMed with links
- Structure: Assessment → Recommendations → Safety Notes → Sources
```

---

## Environment Variables (.env.local)

```env
GEMINI_API_KEY=your_key_here
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PUBMED_API_KEY=your_key_here
NEXT_PUBLIC_APP_URL=https://phytotherapy.ai
```

---

## Sprint Planı (26 Gün)

### Sprint 1 — Altyapı (Gün 1-3)
- [ ] Node.js kurulumunu doğrula
- [ ] Next.js projesi oluştur
- [ ] Tailwind + shadcn/ui kur
- [ ] GitHub repo + Vercel bağla
- [ ] phytotherapy.ai DNS ayarları
- [ ] .env.local oluştur
- [ ] Supabase bağlantı testi
- [ ] Landing page iskeleti
- [ ] Layout + header + footer + disclaimer

### Sprint 2 — İlaç Etkileşim Motoru (Gün 4-8)
- [ ] safety-filter.ts
- [ ] openfda.ts + pubmed.ts + gemini.ts
- [ ] /api/interaction endpoint
- [ ] DrugInput + InteractionResult + SafetyBadge
- [ ] interaction-checker sayfası
- [ ] Test senaryoları

### Sprint 3 — Sağlık Asistanı RAG (Gün 9-13)
- [ ] /api/chat (streaming)
- [ ] /api/pubmed
- [ ] ChatInterface + MessageBubble + SourceCard
- [ ] health-assistant sayfası
- [ ] Test senaryoları

### Sprint 4 — Kan Tahlili (Gün 14-18)
- [ ] blood-reference.ts
- [ ] /api/blood-analysis + /api/generate-pdf
- [ ] BloodTestForm + ResultDashboard + LifestyleAdvice
- [ ] DoctorReport PDF
- [ ] blood-test sayfası
- [ ] Test senaryoları

### Sprint 5 — Polish (Gün 19-22)
- [ ] Profesyonel tasarım
- [ ] Responsive + loading + error handling
- [ ] SEO + legal + performans

### Sprint 6 — Hackathon Hazırlık (Gün 23-26)
- [ ] 3 demo prova
- [ ] Pitch deck
- [ ] Yedek planlar
- [ ] Final kontrol

---

## Demo Senaryoları

### Demo 1 — İlaç Etkileşimi
User: "I take Metformin and Lisinopril. I have trouble sleeping."
→ ❌ St. John's Wort (CYP3A4 interaction) → ✅ Valerian Root (safe, 300-600mg)

### Demo 2 — Serbest Soru
User: "Does omega-3 actually work?"
→ Triglycerides: Grade A | Cardio: Grade B | Depression: Grade B | Dose: 1-2g EPA+DHA/day

### Demo 3 — Kan Tahlili
User: Cholesterol 240, Vitamin D 14, Ferritin 8, HbA1c 6.8
→ Detailed analysis + lifestyle coaching + PDF for doctor

---

## Windows Komutları

```powershell
# Proje oluştur
npx create-next-app@latest phytotherapy-ai --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"

cd phytotherapy-ai

# Paketler
npx shadcn@latest init
npm install @google/generative-ai
npm install @supabase/supabase-js
npm install @react-pdf/renderer

# Çalıştır
npm run dev

# Deploy
npm install -g vercel
vercel login
vercel
```

---

## Geliştirme Kuralları (Claude Code)

1. Güvenlik katmanları her özellikten önce kontrol edilir
2. Tıbbi öneri kaynaksız gösterilmez
3. Mobile-first tasarım
4. API anahtarları sadece .env.local + server-side
5. TypeScript strict — `any` yasak
6. Her API endpoint'te error handling
7. Windows path separator'lere dikkat
8. Git commit mesajları İngilizce
9. Her sprint sonunda PROGRESS.md güncelle

---

*Son güncelleme: Mart 2026 v2.1 — Gemini API + Windows. Bu dosya projenin tek gerçek kaynağıdır.*
