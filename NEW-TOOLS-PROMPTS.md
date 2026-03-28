# Yeni Tool Implementasyon Rehberi — Final v2

> Bu dosya diğer Claude Code session'ına verilecek. Her tool için: API route, Supabase tablo, AI prompt, sayfa yapısı ve çeviri key'leri tanımlanmış.

## Mevcut Mimari (Referans)

```
AI Engine:    lib/gemini.ts → askGemini, askGeminiJSON, askGeminiStream, askGeminiStreamMultimodal
Prompts:      lib/prompts.ts → SYSTEM_PROMPT, INTERACTION_PROMPT, BLOOD_TEST_PROMPT, RADIOLOGY_ANALYSIS_PROMPT
Rate Limit:   lib/rate-limit.ts → createRateLimiter(maxRequests, windowMs)
Auth:         Supabase Auth → getUser() her route'ta
Translations: lib/translations.ts → tx(key, lang) merkezi çeviri
Styling:      Tailwind CSS + shadcn/ui + CSS variables (dark/light)
```

### Her API Route'ta Zorunlu Pattern:
```typescript
import { createRateLimiter } from '@/lib/rate-limit';
import { createClient } from '@/lib/supabase-server';

const limiter = createRateLimiter(10, 60000); // 10 req/min

export async function POST(req: Request) {
  // 1. Rate limit
  const { allowed } = await limiter(req);
  if (!allowed) return NextResponse.json({ error: 'Rate limit' }, { status: 429 });

  // 2. Auth
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // 3. Input validation
  const body = await req.json();
  // validate...

  // 4. Fetch user profile (medications, allergies, conditions)
  // 5. Call AI with profile context
  // 6. Return response
}
```

---

## TOOL 1: Uyku Kalitesi Analizi (`/sleep-analysis`)

### Açıklama
Günlük uyku kaydı + AI haftalık analiz. Uyku hijyeni skoru, ilaçların uyku etkisi, kronobiyolojik öneriler.

### API Route: `/api/sleep-analysis/route.ts`
- POST: Uyku kaydı kaydet
- GET: Haftalık/aylık analiz getir
- POST /analyze: AI analiz tetikle (7+ kayıt gerekli)

### Supabase Tablo:
```sql
CREATE TABLE sleep_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  bedtime TIME,
  wake_time TIME,
  sleep_duration DECIMAL,
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 5),
  wake_count INTEGER DEFAULT 0,
  dreams BOOLEAN DEFAULT FALSE,
  factors TEXT[],  -- ['caffeine', 'screen', 'exercise', 'stress', 'alcohol', 'heavy_meal', 'medication_change']
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);
CREATE INDEX idx_sleep_user_date ON sleep_records(user_id, date DESC);
```

### AI Prompt:
```typescript
export const SLEEP_ANALYSIS_PROMPT = `You are a sleep quality analyst for Phytotherapy.ai.

INPUT: 7-30 days of sleep records (bedtime, wake time, duration, quality 1-5, wake count, factors).

ANALYSIS:
1. Average sleep metrics (duration, quality, consistency)
2. Pattern detection: which factors correlate with poor/good sleep
3. Medication sleep effects: check user's meds for sleep-disrupting drugs
   - SSRIs (insomnia/vivid dreams), beta-blockers (nightmares), corticosteroids (insomnia)
   - Stimulants, decongestants, thyroid meds, diuretics (nocturia)
4. Chronotype assessment (early bird / intermediate / night owl)
5. Sleep hygiene score (0-100):
   - Consistency ±30min (25pts), Duration 7-9h (25pts), Wake count 0-1 (25pts), No negative factors (25pts)

RESPONSE FORMAT (JSON):
{
  "sleepHygieneScore": number,
  "averageDuration": string,
  "averageQuality": number,
  "consistency": "good" | "moderate" | "poor",
  "chronotype": "early_bird" | "intermediate" | "night_owl",
  "patterns": [{ "finding": string, "impact": "positive" | "negative", "confidence": "high" | "medium" }],
  "medicationEffects": [{ "medication": string, "effect": string, "recommendation": string }],
  "recommendations": [
    { "category": "timing" | "environment" | "habits" | "supplements", "suggestion": string, "evidence": "A" | "B" | "C", "source": string }
  ],
  "weekOverWeekChange": string,
  "alertLevel": "green" | "yellow" | "red"
}

RULES:
- Duration consistently <5h or >10h → red alert, suggest medical evaluation
- Supplement suggestions ONLY if no medication conflicts
- Melatonin: check for autoimmune meds, blood thinners, diabetes meds
- Valerian: check for CNS depressants, liver-metabolized drugs
- Magnesium: check for antibiotics, bisphosphonates
- Match user's language (TR/EN)`;
```

### Sayfa: `/app/sleep-analysis/page.tsx`
- Uyku kaydı formu: bedtime/wake time picker, quality slider (1-5 yıldız), faktörler checkbox grid, notlar
- Haftalık bar chart (süre + kalite overlay)
- Uyku hijyen skoru gauge (0-100)
- Kronobiyoloji kartı (kuş/baykuş ikonu)
- AI analiz paneli (collapsible)
- Son 30 gün trend çizgisi
- Takvim entegrasyonu (uyku ikonu göster)

### Çeviri Key'leri:
```
sleep_analysis, sleep_tracker, bedtime, wake_time, sleep_duration, sleep_quality,
wake_count, dreams, sleep_factors, caffeine_before_bed, screen_time, exercise_today,
stress_level, alcohol, heavy_meal, medication_change, sleep_hygiene_score, chronotype,
early_bird, night_owl, intermediate, sleep_recommendations, sleep_alert, log_sleep,
weekly_analysis, monthly_trend, sleep_consistency, sleep_score_description,
sleep_duration_warning, sleep_medication_warning
```

---

## TOOL 2: İlaç Prospektüs Okuyucu (`/profile` sayfasında mevcut tarayıcıya ek)

### Açıklama
Mevcut scan-medication route'una `mode: "prospectus"` ekle. Aynı kamera/upload UI, farklı prompt.

### API Güncelleme: `/api/scan-medication/route.ts`
```typescript
// Mevcut route'a mode parametresi ekle
const { image, mode = "box" } = await req.json();
// mode === "box" → mevcut ilaç kutusu tanıma
// mode === "prospectus" → yeni prospektüs okuma
```

### AI Prompt:
```typescript
export const PROSPECTUS_READER_PROMPT = `You are analyzing a medication package insert (prospectus/leaflet) image.

TASK: Extract and simplify medical information for a patient.

EXTRACT:
1. Drug name (brand + active ingredient)
2. Indications (plain language)
3. Dosage instructions (simplified)
4. Common side effects (top 5, with frequency)
5. Serious side effects / red flag warnings
6. Drug interactions listed
7. Contraindications
8. Storage instructions

CROSS-CHECK with user's profile:
- Compare interactions with user's current medications
- Flag conflicts with user's allergies
- Note pregnancy/kidney/liver warnings if relevant

RESPONSE FORMAT (JSON):
{
  "drugName": string,
  "activeIngredient": string,
  "indication": string,
  "dosageSimplified": string,
  "commonSideEffects": [{ "effect": string, "frequency": string }],
  "seriousWarnings": [string],
  "interactions": [{ "drug": string, "severity": "high" | "moderate" | "low", "description": string }],
  "profileConflicts": [{ "type": "medication" | "allergy" | "condition", "detail": string, "severity": "red" | "yellow" }],
  "contraindications": [string],
  "storage": string,
  "plainLanguageSummary": string
}

RULES:
- Plain language, no medical jargon
- If image blurry/unreadable, specify which parts
- Always add "consult your doctor/pharmacist"
- Match user's language (TR/EN)`;
```

### UI: Profil sayfasındaki ilaç tarayıcıya tab ekle: "İlaç Kutusu" | "Prospektüs Oku"

---

## TOOL 3: Stres & Mental Wellness Takibi (`/mental-wellness`)

### Açıklama
Günlük ruh hali + stres kaydı. AI haftalık örüntü tespiti, ilaç etki analizi, takviye önerileri.

### API Route: `/api/mental-wellness/route.ts`

### Supabase Tablo:
```sql
CREATE TABLE mood_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  mood INTEGER CHECK (mood BETWEEN 1 AND 5),
  energy INTEGER CHECK (energy BETWEEN 1 AND 5),
  stress INTEGER CHECK (stress BETWEEN 1 AND 5),
  anxiety INTEGER CHECK (anxiety BETWEEN 1 AND 5),
  focus INTEGER CHECK (focus BETWEEN 1 AND 5),
  triggers TEXT[],
  coping_methods TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);
CREATE INDEX idx_mood_user_date ON mood_records(user_id, date DESC);
```

### AI Prompt:
```typescript
export const MENTAL_WELLNESS_PROMPT = `You are analyzing mood and mental wellness data for Phytotherapy.ai.

INPUT: 7-30 days of mood records (mood, energy, stress, anxiety, focus scores 1-5 + triggers + coping methods).

ANALYSIS:
1. Average scores and trends (improving/declining/stable)
2. Trigger-mood correlations
3. Coping effectiveness ranking
4. Medication mood effects (SSRIs, benzodiazepines, beta-blockers, corticosteroids, isotretinoin, hormonal contraceptives)
5. Evidence-based supplement opportunities:
   - Ashwagandha for stress (Grade B)
   - L-theanine for anxiety (Grade B)
   - Omega-3 for mood (Grade B)
   - Magnesium for stress (Grade B)
   - Rhodiola for fatigue (Grade B)
   - Saffron for mild depression (Grade B)

RESPONSE FORMAT (JSON):
{
  "overallTrend": "improving" | "stable" | "declining",
  "averageScores": { "mood": number, "energy": number, "stress": number, "anxiety": number, "focus": number },
  "topTriggers": [{ "trigger": string, "impactScore": number, "frequency": number }],
  "effectiveCoping": [{ "method": string, "effectiveness": number }],
  "medicationNotes": [{ "medication": string, "possibleEffect": string }],
  "patterns": [{ "pattern": string, "significance": "high" | "medium" }],
  "recommendations": [{ "type": "lifestyle" | "supplement" | "professional", "suggestion": string, "evidence": "A" | "B" | "C" }],
  "alertLevel": "green" | "yellow" | "red",
  "professionalReferral": boolean
}

CRITICAL:
- anxiety/stress consistently 4-5 AND declining → yellow + professional referral
- ANY mention of suicidal thoughts → IMMEDIATE red alert, 112/crisis line, NO supplements
- Never replace therapy or psychiatry
- Supplement suggestions ONLY if no medication conflicts
- Match user's language`;
```

### Sayfa:
- Günlük check-in: emoji slider (😫😟😐🙂😄)
- Haftalık radar chart (5 metrik)
- Trigger bar chart
- AI insight kartı
- "Bugün için öneri" widget
- Uyku verileriyle çapraz korelasyon (TOOL 1 sinerji)

---

## TOOL 4: Doktor Randevu Hazırlığı (`/appointment-prep`)

### Açıklama
Randevu öncesi AI otomatik özet. Tüm sağlık verilerini toplar, klinik dilde yapılandırılmış rapor üretir, PDF export.

### API Route: `/api/appointment-prep/route.ts`
- Supabase'den tüm kullanıcı verisini çek (ilaçlar, tahliller, vitaller, semptomlar, mood, uyku)
- AI'a gönder → yapılandırılmış klinik özet
- PDF export (mevcut @react-pdf/renderer altyapısı)

### AI Prompt:
```typescript
export const APPOINTMENT_PREP_PROMPT = `You are preparing a pre-appointment clinical summary for a patient's doctor visit.

INPUT: Complete patient profile — medications, recent labs, vital records, symptom logs, mood/sleep data, supplements.

GENERATE:
1. PATIENT OVERVIEW: age, gender, conditions, current medications with doses
2. RECENT CHANGES (last 30 days): new/changed/stopped medications
3. LAB HIGHLIGHTS: most recent abnormal values, flagged with severity
4. VITAL TRENDS: BP, glucose, weight (30-day direction)
5. SYMPTOM LOG: reported symptoms with frequency and severity
6. SUPPLEMENT USE: current supplements, duration, noted interactions
7. AI-GENERATED QUESTIONS FOR DOCTOR:
   - Based on data patterns (e.g., "HbA1c rose 6.2→6.8, discuss adjustment?")
   - Based on symptom-medication correlations
   - Based on supplement-drug considerations
8. PATIENT CONCERNS: user-added notes

RESPONSE FORMAT (JSON):
{
  "patientOverview": { "age": number, "gender": string, "conditions": [string], "medications": [{ "name": string, "dose": string }] },
  "recentChanges": [{ "type": "added" | "changed" | "stopped", "item": string, "date": string }],
  "labHighlights": [{ "marker": string, "value": string, "status": "normal" | "high" | "low" | "critical", "trend": string }],
  "vitalTrends": [{ "vital": string, "current": string, "trend": "improving" | "stable" | "worsening" }],
  "symptoms": [{ "symptom": string, "frequency": string, "severity": string }],
  "supplements": [{ "name": string, "dose": string, "duration": string }],
  "suggestedQuestions": [string],
  "concerns": [string]
}

RULES:
- Clinical language (this is for the doctor, not the patient)
- Flag critical values prominently
- Include medication-lab correlations (e.g., metformin → B12 monitoring)
- PDF: clean, printable, professional layout`;
```

### Sayfa:
- Tek buton: "Randevu Özeti Oluştur"
- Oluşturulan özetin preview'ı
- "Notlarım" metin alanı (ek endişeler)
- PDF indir butonu
- Doktora e-posta gönder butonu (mevcut doctor-summary altyapısı)

---

## TOOL 5: Aşı Takvimi & Hatırlatıcı (`/vaccination`)

### Açıklama
Yaşa ve profile göre aşı takvimi. Eksik aşılar, hatırlatıcılar, aile geneli takip.

### Supabase Tablo:
```sql
CREATE TABLE vaccination_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  family_member_id UUID,
  vaccine_name TEXT NOT NULL,
  vaccine_type TEXT,  -- 'flu', 'covid', 'hepatitis_b', 'tetanus', 'hpv', 'pneumococcal', 'zona'
  dose_number INTEGER DEFAULT 1,
  date_administered DATE,
  next_due_date DATE,
  provider TEXT,
  batch_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_vacc_user ON vaccination_records(user_id, next_due_date);
```

### Implementasyon
Çoğunlukla statik veri + tarih hesaplaması. AI sadece profil bazlı özel durumlar:
- İmmünosupresif ilaç → canlı aşı kontrendikasyonu uyarısı
- Gebelik → aşı güvenlik filtresi
- Kronik hastalık (diyabet, KOAH, KBY) → ek aşı önerileri
- Yaş 65+ → pnömokok, zona önerisi

### Sayfa:
- Türkiye Sağlık Bakanlığı yetişkin aşı takvimi (statik veri)
- Kişisel aşı geçmişi girişi
- Eksik/yaklaşan aşılar listesi (renkli badge)
- Aile geneli aşı grid'i
- Hatırlatıcı (takvime entegre, .ics export)
- Seyahat aşıları bölümü (ülke seçimi)

---

## TOOL 6: Kronik Hastalık Yönetim Paneli (`/chronic-care`)

### Açıklama
Diyabet, hipertansiyon, tiroid, astım, KOAH — hastalığa özel dashboard. Hedef değerler, trend grafikleri, ilaç uyumu.

### API Route: `/api/chronic-care/route.ts`

### AI Prompt:
```typescript
export const CHRONIC_CARE_PROMPT = `You are a chronic disease management assistant for Phytotherapy.ai.

SUPPORTED: Type 2 Diabetes, Hypertension, Hypothyroidism, Hyperthyroidism, Asthma, COPD, Heart Failure, CKD, PCOS, Endometriosis

INPUT: condition, medications, recent labs, vital trends, lifestyle data.

FOR EACH CONDITION:
1. Control status (well-controlled / borderline / uncontrolled)
2. Key metrics:
   - Diabetes: HbA1c, fasting glucose, post-meal glucose
   - Hypertension: systolic/diastolic, heart rate
   - Thyroid: TSH, T3, T4
   - PCOS: testosterone, DHEA-S, insulin, AMH
3. Medication adherence assessment
4. Evidence-based lifestyle modifications
5. Safe supplement considerations (check all drug interactions)
6. Urgent warning signs (when to see doctor immediately)
7. Personalized targets (age, comorbidities, pregnancy status)

RESPONSE FORMAT (JSON):
{
  "condition": string,
  "controlStatus": "well_controlled" | "borderline" | "uncontrolled",
  "keyMetrics": [{ "name": string, "current": string, "target": string, "status": "on_target" | "above" | "below" | "critical" }],
  "adherenceScore": number,
  "lifestyle": [{ "recommendation": string, "priority": "high" | "medium", "evidence": string }],
  "supplements": [{ "name": string, "rationale": string, "safetyCheck": "safe" | "caution" | "avoid", "interaction": string }],
  "urgentSigns": [string],
  "nextSteps": [string]
}

RULES:
- NEVER adjust medication doses — always defer to doctor
- If metrics critically out of range → red alert + immediate doctor visit
- Match user's language`;
```

### Sayfa:
- Profildeki kronik hastalıklardan otomatik liste
- Hastalık seçince özel dashboard açılır
- Metrik kartlar + trend grafikler (recharts)
- İlaç uyum takibi (takvimden veri)
- AI haftalık değerlendirme
- Hedef değer paneli (doktor belirlemiş hedefler)

---

## TOOL 7: Beslenme Günlüğü & Analiz (`/nutrition`)

### Açıklama
Günlük besin kaydı (fotoğraf veya metin). Makro/mikro analiz, ilaç-besin çakışma uyarısı.

### API Route: `/api/nutrition-log/route.ts`
- Fotoğraf: `askGeminiStreamMultimodal` ile yemek tanıma
- Metin: kullanıcı yazıyor "öğle: tavuk pilav, salata"

### Supabase Tablo:
```sql
CREATE TABLE nutrition_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  description TEXT,
  calories INTEGER,
  protein DECIMAL,
  carbs DECIMAL,
  fat DECIMAL,
  fiber DECIMAL,
  key_nutrients JSONB,
  food_drug_alerts TEXT[],
  image_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_nutrition_user_date ON nutrition_records(user_id, date DESC);
```

### AI Prompt:
```typescript
export const NUTRITION_ANALYSIS_PROMPT = `You are a nutrition analyst for Phytotherapy.ai.

TASK: Analyze the user's meal (from photo or text description).

EXTRACT:
1. Foods identified with portions
2. Estimated calories (realistic range, not false precision)
3. Macros: protein, carbs, fat, fiber (grams)
4. Key micronutrients present
5. Food-drug interactions with user's medications:
   - Grapefruit → statins, calcium channel blockers, cyclosporine
   - Leafy greens (vitamin K) → warfarin
   - Dairy → tetracycline, fluoroquinolones, levothyroxine
   - Caffeine → lithium, theophylline, certain antibiotics
   - Tyramine foods → MAOIs
   - High-potassium foods → ACE inhibitors, potassium-sparing diuretics
   - Alcohol → metformin, methotrexate, acetaminophen
6. Nutritional gaps vs user's goals

RESPONSE FORMAT (JSON):
{
  "foods": [{ "name": string, "portion": string }],
  "calories": { "min": number, "max": number },
  "macros": { "protein": number, "carbs": number, "fat": number, "fiber": number },
  "micronutrients": [{ "nutrient": string, "amount": string, "dailyPercent": number }],
  "foodDrugAlerts": [{ "food": string, "medication": string, "severity": "red" | "yellow", "explanation": string }],
  "suggestions": [string],
  "dailyTotals": { "calories": number, "protein": number, "carbs": number, "fat": number }
}

RULES:
- Turkish food knowledge required (döner ~400-600kcal, lahmacun ~280kcal, ayran ~60kcal, simit ~280kcal, menemen ~250kcal)
- Realistic estimates, not overly precise
- If photo unclear, ask for clarification
- ALWAYS check against medication profile`;
```

### Sayfa:
- Öğün seçimi (kahvaltı/öğle/akşam/atıştırmalık)
- Fotoğraf çek veya metin yaz
- Günlük makro özeti (progress bar'lar)
- Besin-ilaç uyarı kartları (kırmızı/sarı)
- Haftalık kalori trend grafiği
- Eksik besin uyarıları

---

## TOOL 8: Mevsimsel Sağlık Rehberi (`/seasonal-health`)

### Açıklama
Mevsime göre otomatik sağlık içeriği + profil bazlı kişiselleştirme.

### Implementasyon
Çoğunlukla statik içerik. Ayrı API route gerekmez — mevcut chat + profil verisi yeterli.

### Sayfa: `/app/seasonal-health/page.tsx`

```typescript
const SEASONAL_CONTENT = {
  winter: {
    title: { en: "Winter Wellness", tr: "Kış Sağlığı" },
    focus: ['vitamin_d', 'immunity', 'cold_prevention', 'seasonal_depression'],
    supplements: [
      { name: 'Vitamin D3', dose: '2000-4000 IU/day', evidence: 'A' },
      { name: 'Vitamin C', dose: '500-1000mg/day', evidence: 'A' },
      { name: 'Zinc', dose: '15-30mg/day', evidence: 'B' },
      { name: 'Elderberry', dose: '600-900mg/day', evidence: 'B' }
    ],
    lifestyle: ['light_therapy', 'indoor_exercise', 'warm_hydration', 'sleep_hygiene']
  },
  spring: {
    title: { en: "Spring Preparation", tr: "Bahar Hazırlığı" },
    focus: ['allergy_prep', 'outdoor_activity', 'pollen_management'],
    supplements: [
      { name: 'Quercetin', dose: '500mg 2x/day', evidence: 'B' },
      { name: 'Nettle Leaf', dose: '300-600mg/day', evidence: 'B' },
      { name: 'Probiotics', dose: '10B CFU/day', evidence: 'B' },
      { name: 'Vitamin C', dose: '500-1000mg/day', evidence: 'A' }
    ],
    lifestyle: ['gradual_outdoor', 'air_purifier', 'nasal_rinse', 'pollen_tracking']
  },
  summer: {
    title: { en: "Summer Health", tr: "Yaz Sağlığı" },
    focus: ['hydration', 'sun_protection', 'heat_management'],
    supplements: [
      { name: 'Electrolytes', dose: 'as needed', evidence: 'A' },
      { name: 'Vitamin C', dose: '500mg/day', evidence: 'A' },
      { name: 'Aloe Vera', dose: 'topical', evidence: 'B' },
      { name: 'Probiotics', dose: '10B CFU/day', evidence: 'B' }
    ],
    lifestyle: ['hydration_tracking', 'uv_awareness', 'cool_exercise', 'light_meals']
  },
  autumn: {
    title: { en: "Autumn Immunity", tr: "Sonbahar Bağışıklığı" },
    focus: ['immunity_boost', 'flu_prep', 'vitamin_d_start', 'sleep_adjustment'],
    supplements: [
      { name: 'Vitamin D3', dose: '2000-4000 IU/day', evidence: 'A' },
      { name: 'Echinacea', dose: '300mg 3x/day (max 10 days)', evidence: 'B' },
      { name: 'Zinc', dose: '15-30mg/day', evidence: 'B' },
      { name: 'Probiotics', dose: '10B CFU/day', evidence: 'B' }
    ],
    lifestyle: ['flu_vaccination', 'sleep_schedule', 'warm_nutrition', 'hand_hygiene']
  }
};
```

- Mevcut mevsimi otomatik algıla
- Profil bazlı kişisel uyarılar (antihistaminik → bahar, immünosupresif → kış bağışıklık)
- Takviye önerileri (ilaç etkileşim kontrolü ile!)
- Checklist (gamification ile)
- Mevcut Boss Fight sistemiyle köprü (mevsimsel boss'lar)

---

## TOOL 9: Kadın Sağlığı Takibi (`/womens-health`)

### Açıklama
Menstrüel döngü, PMS semptom kaydı, döngü bazlı takviye önerileri, kontraseptif kullanım takibi + yıllık uyarı sistemi, menopoz takibi, gebelik planlama modu.

### API Route: `/api/womens-health/route.ts`

### Supabase Tabloları:
```sql
-- Menstrüel döngü kaydı
CREATE TABLE cycle_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE,
  flow_intensity TEXT CHECK (flow_intensity IN ('light', 'moderate', 'heavy', 'spotting')),
  symptoms TEXT[],  -- ['cramps', 'headache', 'bloating', 'mood_swings', 'breast_tenderness', 'fatigue', 'acne', 'back_pain', 'nausea']
  mood TEXT CHECK (mood IN ('great', 'good', 'neutral', 'low', 'very_low')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_cycle_user ON cycle_records(user_id, period_start DESC);

-- Kontraseptif kullanım takibi
CREATE TABLE contraceptive_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contraceptive_type TEXT NOT NULL,
  -- 'combined_pill', 'progestin_pill', 'patch', 'ring', 'injection', 'implant', 'iud_hormonal', 'iud_copper', 'emergency'
  brand_name TEXT,
  active_ingredient TEXT,
  start_date DATE NOT NULL,
  end_date DATE,               -- NULL = hala kullanıyor
  is_active BOOLEAN DEFAULT TRUE,
  daily_reminder BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_contra_user ON contraceptive_records(user_id, is_active);

-- Kontraseptif yıllık uyarı sistemi
-- Uygulama tarafında: start_date + 11 ay = sarı uyarı, start_date + 12 ay = kırmızı uyarı
-- "1 yıldır aynı kontraseptifi kullanıyorsunuz. Doktorunuzla yıllık kontrolünüzü planlayın."
```

### AI Prompt:
```typescript
export const WOMENS_HEALTH_PROMPT = `You are a women's health analyst for Phytotherapy.ai.

INPUT: Menstrual cycle records, PMS symptoms, contraceptive use, user profile (age, medications, conditions).

ANALYSIS:
1. Cycle regularity assessment (regular: 21-35 day cycles, ±7 day variation)
2. PMS symptom patterns (which symptoms, when in cycle, severity trend)
3. Cycle phase awareness:
   - Menstrual (days 1-5): iron-rich foods, gentle exercise, magnesium
   - Follicular (days 6-13): energy building, strength training
   - Ovulatory (days 14-16): peak energy, social activity
   - Luteal (days 17-28): PMS management, calming supplements, rest
4. Contraceptive monitoring:
   - Duration tracking with annual review alert
   - Side effect correlation (mood, weight, skin, libido changes)
   - Nutrient depletion check: combined pill depletes B6, B12, folate, magnesium, zinc, vitamin C
   - Drug interactions with contraceptives (rifampin, anticonvulsants, St. John's Wort, some antibiotics)
5. Supplement recommendations by cycle phase:
   - Menstrual: Iron bisglycinate 18-27mg (if heavy flow), Magnesium glycinate 200-400mg
   - PMS/Luteal: Vitex (chasteberry) 20-40mg, Calcium 1000mg, Vitamin B6 50-100mg
   - General: Evening Primrose Oil 500-1000mg (breast tenderness), Omega-3 1-2g
6. PCOS detection hints: irregular cycles >35 days, acne, hirsutism → suggest endocrinologist

CONTRACEPTIVE ALERTS:
- 11 months on same contraceptive → YELLOW: "Yıllık doktor kontrolünüz yaklaşıyor"
- 12+ months → RED: "1 yılı aştınız. Lütfen yıllık jinekolojik kontrolünüzü yaptırın."
- Emergency contraceptive used → "Bu bir düzenli yöntem değildir. Doktorunuzla uzun vadeli kontrasepsiyon planlayın."
- Combined pill + smoking + age >35 → RED: VTE riski uyarısı
- Pill + antibiotics (rifampin/rifabutin) → RED: Etkinlik azalması uyarısı
- Pill + St. John's Wort → RED: Etkinlik azalması uyarısı

RESPONSE FORMAT (JSON):
{
  "cycleRegularity": "regular" | "irregular" | "insufficient_data",
  "averageCycleLength": number,
  "currentPhase": "menstrual" | "follicular" | "ovulatory" | "luteal" | "unknown",
  "pmsPatterns": [{ "symptom": string, "frequency": string, "severity": "mild" | "moderate" | "severe" }],
  "contraceptiveStatus": {
    "type": string,
    "durationMonths": number,
    "annualReviewDue": boolean,
    "sideEffectCorrelations": [string],
    "nutrientDepletions": [{ "nutrient": string, "recommendation": string }],
    "drugInteractions": [{ "drug": string, "severity": "red" | "yellow", "explanation": string }]
  },
  "phaseRecommendations": [{ "phase": string, "supplements": [string], "lifestyle": [string] }],
  "alerts": [{ "level": "red" | "yellow" | "info", "message": string }],
  "referralNeeded": boolean,
  "referralReason": string
}

CRITICAL RULES:
- NEVER provide fertility/contraception advice without "consult your gynecologist"
- Emergency contraceptive → always recommend doctor follow-up
- Irregular cycles + acne + weight gain → suggest PCOS screening
- Heavy bleeding (changing pad/tampon every 1-2 hours) → urgent gynecologist referral
- Missed period + sexually active → pregnancy test suggestion, not diagnosis
- Contraceptive pill + migraine with aura → RED: stroke risk, immediate doctor
- Match user's language (TR/EN)
- This tool ONLY available if user profile gender = female or user enables it manually`;
```

### Sayfa:
- Döngü takvimi (renk kodlu günler: kırmızı=menstrüel, mavi=foliküler, yeşil=ovulatuar, mor=luteal)
- PMS semptom kaydı (günlük quick-add butonları)
- Kontraseptif panel:
  - Aktif kontraseptif kartı (isim, başlangıç tarihi, gün sayacı)
  - Yıllık kontrol countdown badge (11 ay → sarı, 12+ ay → kırmızı)
  - Besin tükenme uyarısı (pill kullananlar için: B6, B12, folat, Mg, Zn)
  - İlaç etkileşim uyarısı kartları
- Döngü fazı widget ("Bugün: Foliküler faz — Enerji günü!")
- AI haftalık analiz (semptom + döngü + kontraseptif bütünleşik)
- Takvim entegrasyonu
- Gebelik planlama modu toggle (aktifleşince: folik asit hatırlatıcı, ovulasyon tahmin, kontraseptif bırakma planı)

### Çeviri Key'leri:
```
womens_health, menstrual_cycle, period_start, period_end, flow_intensity,
light_flow, moderate_flow, heavy_flow, spotting, cycle_day, cycle_phase,
menstrual_phase, follicular_phase, ovulatory_phase, luteal_phase,
pms_symptoms, cramps, bloating, mood_swings, breast_tenderness, headache,
contraceptive, contraceptive_type, combined_pill, progestin_pill, patch,
ring, injection, implant, iud_hormonal, iud_copper, emergency_contraceptive,
contraceptive_start, contraceptive_duration, annual_review_due,
annual_review_warning, annual_review_overdue, nutrient_depletion,
drug_interaction_warning, pregnancy_planning, ovulation_estimate,
cycle_regularity, irregular_cycle_warning, heavy_bleeding_warning,
gynecologist_referral, contraceptive_reminder
```

---

## TOOL 10: Seyahat Sağlık Danışmanı (`/travel-health`)

### Açıklama
Gideceğin ülkeyi seç → profiline göre: gerekli aşılar, ilaç saati ayarı (jet lag), su güvenliği, bölgesel hastalık riskleri.

### API Route: `/api/travel-health/route.ts`

### AI Prompt:
```typescript
export const TRAVEL_HEALTH_PROMPT = `You are a travel health advisor for Phytotherapy.ai.

INPUT: destination country, travel dates, user profile (medications, conditions, vaccinations, age).

PROVIDE:
1. Required/recommended vaccinations for destination
   - Cross-check with user's existing vaccination records
   - Flag contraindicated vaccines (immunosuppressed, pregnant)
2. Medication considerations:
   - Timezone adjustment plan (especially insulin, thyroid meds, oral contraceptives)
   - Medication storage needs (refrigeration for insulin, heat sensitivity)
   - Controlled substance regulations in destination country
3. Regional health risks:
   - Malaria zones, dengue, traveler's diarrhea, altitude sickness
   - Food/water safety recommendations
4. Travel pharmacy checklist (profile-customized)
5. Jet lag management (melatonin timing, light exposure, sleep schedule shift)
6. Insurance reminder + emergency numbers for destination

RESPONSE FORMAT (JSON):
{
  "destination": string,
  "vaccinations": { "required": [string], "recommended": [string], "contraindicated": [string], "alreadyHave": [string] },
  "medicationPlan": [{ "medication": string, "adjustment": string, "storage": string }],
  "regionalRisks": [{ "risk": string, "severity": "high" | "moderate" | "low", "prevention": string }],
  "travelPharmacy": [string],
  "jetLagPlan": { "melatoninTiming": string, "lightExposure": string, "sleepSchedule": string },
  "emergencyNumbers": { "ambulance": string, "police": string, "embassy": string },
  "alerts": [{ "level": "red" | "yellow" | "info", "message": string }]
}

RULES:
- If immunosuppressed → warn about live vaccines
- If on blood thinners → DVT prevention for long flights
- If diabetic → detailed insulin timezone plan
- Always recommend travel health consultation 4-6 weeks before trip
- Match user's language`;
```

### Sayfa:
- Ülke seçimi (autocomplete search)
- Tarih seçimi
- Profil bazlı otomatik analiz
- Aşı durumu checklist
- İlaç saat ayarı takvimi
- Seyahat eczanesi checklist (printable)
- PDF export

---

## TOOL 11: Alerji & İntölerans Haritası (`/allergy-map`)

### Açıklama
Besin alerjileri + intöleransları (laktoz, gluten, histamin). Profildeki ilaçlarla çapraz kontrol, semptom kaydı.

### Supabase Tablo:
```sql
CREATE TABLE allergy_intolerance_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('allergy', 'intolerance', 'sensitivity')),
  trigger_name TEXT NOT NULL,
  category TEXT,  -- 'food', 'medication', 'environmental', 'chemical'
  severity TEXT CHECK (severity IN ('mild', 'moderate', 'severe', 'anaphylaxis')),
  symptoms TEXT[],
  diagnosed_by_doctor BOOLEAN DEFAULT FALSE,
  diagnosis_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE allergy_reaction_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  allergy_id UUID REFERENCES allergy_intolerance_records(id),
  reaction_date TIMESTAMPTZ DEFAULT NOW(),
  severity TEXT,
  symptoms TEXT[],
  trigger_food TEXT,
  treatment_used TEXT,
  notes TEXT
);
```

### Sayfa:
- Alerji/intölerans listesi (ekleme, düzenleme)
- Reaksiyon günlüğü (ne zaman, ne yedi, ne oldu)
- AI çapraz kontrol: alerjiler + ilaçlar + takviyeler
- Histamin intöleransı modu (yüksek histaminli besin listesi)
- Laktoz/gluten intöleransı özel rehberler
- Acil durum kartı (paylaşılabilir — restoran/garson için)
- Takviye uyarıları (ör: arı ürünleri alerjisi → propolis kontrendike)

---

## TOOL 12: Rehabilitasyon Takip Modülü (`/rehabilitation`)

### Açıklama
Ameliyat sonrası iyileşme planı, fizik tedavi egzersiz takibi, ağrı skalası kaydı, iyileşme milestone'ları.

### Supabase Tablo:
```sql
CREATE TABLE rehab_programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  surgery_type TEXT,
  surgery_date DATE,
  condition TEXT,
  phase TEXT CHECK (phase IN ('acute', 'subacute', 'recovery', 'maintenance')),
  exercises JSONB,  -- [{ name, sets, reps, frequency, video_url }]
  restrictions TEXT[],
  start_date DATE,
  target_end_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE rehab_daily_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id UUID REFERENCES rehab_programs(id),
  date DATE NOT NULL,
  pain_level INTEGER CHECK (pain_level BETWEEN 0 AND 10),
  exercises_completed JSONB,
  mobility_score INTEGER CHECK (mobility_score BETWEEN 1 AND 10),
  swelling TEXT CHECK (swelling IN ('none', 'mild', 'moderate', 'severe')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Sayfa:
- Program oluşturma (ameliyat türü, tarih, doktor notları)
- Günlük log: ağrı skalası (0-10 slider), egzersiz checklist, şişlik kaydı
- İyileşme grafiği (ağrı + mobilite trend)
- Faz ilerleme bar'ı (akut → subakut → iyileşme → bakım)
- Milestone kutlamaları (gamification)
- İlaç-iyileşme notları (NSAİD + kemik iyileşmesi dikkat, antikoagülan + kanama riski)
- Doktora rapor (PDF)

---

---

# BÖLÜM 2: İleri Seviye Modüller (TOOL 13-20)

> Bu tool'lar TOOL 1-12 tamamlandıktan sonra sırayla implement edilecek. Her biri deterministik hesaplama ağırlıklı, AI sadece bileşik yorum yapıyor.

---

## TOOL 13: Bağırsak Sağlığı & Mikrobiyom Paneli (`/gut-health`)

### Açıklama
Sindirim semptom takibi, probiyotik suş eşleştirme (kanıta dayalı lookup table), FODMAP diyet rehberi, ilaç-bağırsak etkisi, bağırsak-beyin ekseni korelasyonu (mood verileriyle çapraz).

### API Route: `/api/gut-health/route.ts`
- POST: Semptom kaydı kaydet
- GET: Haftalık/aylık analiz
- POST /analyze: AI analiz tetikle

### Supabase Tablo:
```sql
CREATE TABLE gut_health_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  symptoms TEXT[] NOT NULL,  -- ['bloating', 'gas', 'constipation', 'diarrhea', 'reflux', 'nausea', 'abdominal_pain', 'heartburn']
  severity INTEGER CHECK (severity BETWEEN 1 AND 5),
  bowel_type INTEGER CHECK (bowel_type BETWEEN 1 AND 7),  -- Bristol Stool Scale
  trigger_foods TEXT[],
  probiotics_taken TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);
CREATE INDEX idx_gut_user_date ON gut_health_records(user_id, date DESC);
```

### Probiyotik Suş Veritabanı (Statik — lib/probiotic-database.ts):
```typescript
export const PROBIOTIC_STRAINS = {
  'Lactobacillus_rhamnosus_GG': {
    indications: ['antibiotic_diarrhea', 'travelers_diarrhea', 'pediatric_diarrhea'],
    evidence: 'A',
    dose: '10-20 billion CFU/day',
    duration: 'During antibiotics + 1 week after',
    contraindications: ['immunocompromised', 'central_venous_catheter'],
    drug_interactions: ['immunosuppressants']
  },
  'Saccharomyces_boulardii': {
    indications: ['antibiotic_diarrhea', 'c_difficile_prevention', 'travelers_diarrhea'],
    evidence: 'A',
    dose: '250-500mg twice daily',
    duration: 'During antibiotics + 2 weeks after',
    contraindications: ['immunocompromised', 'fungemia_risk'],
    drug_interactions: ['antifungals']  // antifungals kill it
  },
  'Bifidobacterium_infantis_35624': {
    indications: ['IBS_bloating', 'IBS_pain', 'IBS_general'],
    evidence: 'B',
    dose: '1 billion CFU/day',
    duration: '4-8 weeks trial',
    contraindications: ['immunocompromised'],
    drug_interactions: []
  },
  'Lactobacillus_plantarum_299v': {
    indications: ['IBS_bloating', 'IBS_gas', 'iron_absorption'],
    evidence: 'B',
    dose: '10 billion CFU/day',
    duration: '4 weeks trial',
    contraindications: [],
    drug_interactions: []
  },
  'VSL_3_mixture': {
    indications: ['ulcerative_colitis_maintenance', 'pouchitis'],
    evidence: 'A',
    dose: '450-900 billion CFU/day',
    duration: 'Long-term with gastro supervision',
    contraindications: ['immunocompromised'],
    drug_interactions: []
  },
  'Lactobacillus_acidophilus_NCFM': {
    indications: ['lactose_intolerance', 'general_gut_health'],
    evidence: 'B',
    dose: '1-10 billion CFU/day',
    duration: 'Ongoing',
    contraindications: [],
    drug_interactions: []
  }
};

export const DRUG_GUT_EFFECTS = {
  'PPI': { effects: ['B12_malabsorption', 'magnesium_depletion', 'calcium_malabsorption', 'microbiome_disruption', 'C_difficile_risk'], alert: 'yellow' },
  'metformin': { effects: ['diarrhea', 'nausea', 'bloating', 'B12_malabsorption'], alert: 'yellow', tip: 'Take with food, consider B12 supplement' },
  'NSAID': { effects: ['gastric_erosion', 'ulcer_risk', 'intestinal_permeability'], alert: 'red', tip: 'Always take with food, consider misoprostol if chronic' },
  'antibiotics': { effects: ['flora_disruption', 'diarrhea', 'C_difficile_risk', 'yeast_overgrowth'], alert: 'yellow', tip: 'Take probiotics 2h apart from antibiotic' },
  'SSRI': { effects: ['nausea_initial', 'diarrhea_initial', 'appetite_change'], alert: 'yellow', tip: 'GI effects usually subside in 2-4 weeks' },
  'iron_supplements': { effects: ['constipation', 'nausea', 'dark_stool'], alert: 'yellow', tip: 'Take with vitamin C, consider bisglycinate form' },
  'opioids': { effects: ['severe_constipation', 'nausea'], alert: 'red', tip: 'Prophylactic laxative often needed' }
};

export const FODMAP_CATEGORIES = {
  high: ['garlic', 'onion', 'wheat', 'apple', 'pear', 'watermelon', 'mushroom', 'cauliflower', 'honey', 'milk', 'yogurt', 'beans', 'lentils', 'chickpeas'],
  moderate: ['avocado_half', 'sweet_potato', 'broccoli_small', 'corn', 'celery'],
  low: ['rice', 'potato', 'carrot', 'cucumber', 'tomato', 'banana_firm', 'blueberry', 'strawberry', 'spinach', 'zucchini', 'chicken', 'fish', 'eggs', 'lactose_free_dairy']
};
```

### AI Prompt:
```typescript
export const GUT_HEALTH_PROMPT = `You are a gut health analyst for Phytotherapy.ai.

INPUT: 7-30 days of digestive symptom records (symptoms, severity, Bristol scale, trigger foods, probiotics taken) + user profile (medications, conditions).

ANALYSIS:
1. Symptom pattern detection (which symptoms cluster, when they spike)
2. Bristol Stool Scale trend (1-2 = constipation, 3-4 = normal, 5-7 = diarrhea trend)
3. Trigger food identification (correlation between food intake and symptom spike)
4. Medication-gut impact: check all medications against DRUG_GUT_EFFECTS database
5. Probiotic recommendation: match symptoms to PROBIOTIC_STRAINS database
   - ONLY recommend strains with evidence grade A or B
   - ALWAYS check drug interactions (antifungals kill S. boulardii, immunosuppressants + any probiotic = caution)
6. FODMAP assessment: if IBS pattern detected, suggest low-FODMAP trial
7. Gut-brain axis: if mood_records exist, correlate gut symptom days with mood score days

RESPONSE FORMAT (JSON):
{
  "overallStatus": "healthy" | "mild_issues" | "needs_attention" | "see_gastro",
  "bristolAverage": number,
  "bristolTrend": "improving" | "stable" | "worsening",
  "symptomPatterns": [{ "symptom": string, "frequency": string, "severity": number, "possibleCause": string }],
  "triggerFoods": [{ "food": string, "correlation": "strong" | "moderate" | "weak", "symptomsCaused": [string] }],
  "medicationGutEffects": [{ "medication": string, "effects": [string], "recommendation": string }],
  "probioticRecommendation": [{ "strain": string, "indication": string, "dose": string, "duration": string, "evidence": "A" | "B", "drugInteractions": [string] }],
  "fodmapSuggestion": boolean,
  "gutBrainCorrelation": { "found": boolean, "description": string },
  "alerts": [{ "level": "red" | "yellow" | "info", "message": string }],
  "referralNeeded": boolean
}

CRITICAL RULES:
- Blood in stool, unintended weight loss, persistent vomiting → RED ALERT, gastro referral
- Probiotic recommendations ONLY from the verified strain database, never invent strains
- Immunocompromised patients → NO probiotics without gastro approval
- If on antibiotics → always recommend strain-specific probiotic taken 2h apart
- FODMAP diet → only suggest as 4-6 week trial, not permanent
- Match user's language (TR/EN)`;
```

### Sayfa: `/app/gut-health/page.tsx`
- Günlük kayıt: semptom checkbox grid + Bristol Scale görsel seçici (7 resimli) + tetikleyici besin + şiddet slider
- Haftalık semptom heat map
- Bristol Scale trend grafik
- Probiyotik eşleştirme kartı (suş adı + doz + kanıt düzeyi + ilaç uyarı)
- FODMAP rehber tab'ı (yüksek/orta/düşük besin listesi, görsel)
- İlaç-bağırsak etki paneli (profildeki ilaçlardan otomatik)
- Bağırsak-beyin korelasyon widget (mood verisiyle çapraz, çizgi grafik)
- Gastroenteroloji yönlendirme uyarı kartı

### Çeviri Key'leri:
```
gut_health, digestive_tracker, bloating, gas, constipation, diarrhea, reflux,
nausea, abdominal_pain, heartburn, bristol_scale, bristol_type_1, bristol_type_2,
bristol_type_3, bristol_type_4, bristol_type_5, bristol_type_6, bristol_type_7,
trigger_foods, probiotic_recommendation, probiotic_strain, probiotic_dose,
probiotic_evidence, fodmap_guide, high_fodmap, low_fodmap, medication_gut_effect,
gut_brain_connection, see_gastroenterologist, bowel_movement, stool_consistency
```

---

## TOOL 14: Cilt Sağlığı Analizi (`/skin-health`)

### Açıklama
Cilt fotoğraf takibi (haftalık karşılaştırma), ilaçların cilt yan etkileri, döngü-cilt korelasyonu, kanıta dayalı topikal + oral takviye önerileri. TEŞHİS KOYMAZ — bilgilendirir ve trende bakar.

### API Route: `/api/skin-health/route.ts`
- POST: Cilt kaydı + fotoğraf kaydet
- POST /analyze: AI trend analizi (2+ kayıt gerekli)
- GET: Geçmiş kayıtlar + fotoğraf galerisi

### Supabase Tablo:
```sql
CREATE TABLE skin_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  area TEXT NOT NULL,  -- 'face', 'back', 'chest', 'arms', 'legs', 'scalp', 'hands'
  concern TEXT NOT NULL,  -- 'acne', 'dryness', 'redness', 'rash', 'pigmentation', 'eczema_like', 'itching', 'oiliness'
  severity INTEGER CHECK (severity BETWEEN 1 AND 5),
  photo_url TEXT,  -- Supabase Storage
  possible_triggers TEXT[],  -- ['stress', 'food', 'new_product', 'weather', 'medication_change', 'menstrual']
  products_used TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_skin_user_date ON skin_records(user_id, date DESC);
```

### İlaç-Cilt Etki Veritabanı (Statik — lib/skin-drug-effects.ts):
```typescript
export const DRUG_SKIN_EFFECTS = {
  'isotretinoin': {
    effects: ['severe_dryness', 'lip_cracking', 'sun_sensitivity', 'nosebleeds', 'eczema_flare'],
    severity: 'high',
    management: ['Heavy moisturizer', 'SPF 50+', 'Lip balm with lanolin', 'Avoid waxing'],
    supplements: [
      { name: 'Omega-3', dose: '2g/day', reason: 'Reduce dryness', evidence: 'B', safe: true },
      { name: 'Vitamin E', dose: 'AVOID oral high-dose', reason: 'May increase isotretinoin toxicity', evidence: 'C', safe: false }
    ],
    monitoring: ['Liver enzymes monthly', 'Lipid panel monthly', 'Pregnancy test monthly']
  },
  'corticosteroids_topical': {
    effects: ['skin_thinning', 'striae', 'telangiectasia', 'perioral_dermatitis', 'rebound_flare'],
    severity: 'medium',
    management: ['Do not use on face >2 weeks', 'Taper gradually', 'Use weakest effective potency'],
    supplements: [],
    monitoring: ['Skin thickness assessment if chronic use']
  },
  'antibiotics_tetracycline': {
    effects: ['photosensitivity', 'yeast_infection'],
    severity: 'medium',
    management: ['SPF 50+', 'Avoid direct sun 10am-4pm'],
    supplements: [{ name: 'Probiotics', dose: '10B CFU/day', reason: 'Prevent yeast', evidence: 'B', safe: true }],
    monitoring: []
  },
  'lithium': {
    effects: ['acne_worsening', 'psoriasis_trigger', 'hair_changes'],
    severity: 'medium',
    management: ['Gentle non-comedogenic skincare', 'Dermatology referral if severe'],
    supplements: [{ name: 'Zinc', dose: '30mg/day', reason: 'May help lithium acne', evidence: 'C', safe: true }],
    monitoring: []
  },
  'hormonal_contraceptives': {
    effects: ['melasma', 'acne_improvement_or_worsening', 'hair_texture_change'],
    severity: 'low',
    management: ['SPF for melasma prevention', 'Track changes over 3 cycles'],
    supplements: [],
    monitoring: []
  },
  'SSRI': {
    effects: ['excessive_sweating', 'bruising_easier', 'dry_skin'],
    severity: 'low',
    management: ['Moisturize', 'Antiperspirant for hyperhidrosis'],
    supplements: [],
    monitoring: []
  }
};

export const SKIN_SUPPLEMENT_EVIDENCE = {
  'zinc_oral': { indication: 'acne', dose: '30mg/day elemental zinc', evidence: 'B', notes: 'Take with food to avoid nausea, check copper levels long-term' },
  'niacinamide_topical': { indication: 'acne_redness_pigmentation', dose: '4-5% serum', evidence: 'A', notes: 'Well tolerated, can combine with most actives' },
  'omega_3': { indication: 'dry_skin_inflammation', dose: '1-2g EPA+DHA/day', evidence: 'B', notes: 'Check with blood thinners' },
  'evening_primrose_oil': { indication: 'eczema', dose: '500mg-1g/day', evidence: 'B', notes: 'May take 8-12 weeks, check with anticoagulants' },
  'vitamin_d': { indication: 'psoriasis_eczema', dose: '2000-4000 IU/day', evidence: 'B', notes: 'Check baseline levels' },
  'collagen_peptides': { indication: 'skin_hydration_aging', dose: '5-10g/day', evidence: 'B', notes: 'Results in 8-12 weeks' },
  'aloe_vera_topical': { indication: 'sunburn_mild_irritation', dose: 'Pure gel as needed', evidence: 'B', notes: 'Patch test first' }
};
```

### AI Prompt:
```typescript
export const SKIN_HEALTH_PROMPT = `You are a skin health tracker for Phytotherapy.ai. You do NOT diagnose. You track, correlate, and inform.

INPUT: Skin records (area, concern, severity, photos if available, triggers, products) + user profile (medications, conditions, menstrual cycle data if available).

ANALYSIS:
1. Severity trend: is the concern improving, stable, or worsening over entries?
2. Photo comparison: if multiple photos of same area exist, note visible changes (do NOT diagnose — describe changes objectively: "redness appears reduced", "affected area appears smaller")
3. Medication-skin correlation: check all medications against DRUG_SKIN_EFFECTS database
4. Trigger pattern: which factors correlate with flare-ups
5. Menstrual cycle correlation: if cycle data exists, correlate skin flares with cycle phases
6. Supplement suggestions: ONLY from SKIN_SUPPLEMENT_EVIDENCE database, ONLY if no drug conflicts

RESPONSE FORMAT (JSON):
{
  "trend": "improving" | "stable" | "worsening" | "insufficient_data",
  "photoComparison": string,
  "medicationEffects": [{ "medication": string, "skinEffect": string, "management": string }],
  "triggerPatterns": [{ "trigger": string, "correlation": "strong" | "moderate", "description": string }],
  "cycleCorrelation": { "found": boolean, "phase": string, "description": string },
  "supplementSuggestions": [{ "name": string, "dose": string, "indication": string, "evidence": "A" | "B", "safeWithMeds": boolean, "warning": string }],
  "alerts": [{ "level": "red" | "yellow" | "info", "message": string }],
  "dermatologistReferral": boolean,
  "referralReason": string
}

CRITICAL RULES:
- NEVER say "this is [disease name]" — say "this pattern is consistent with what is commonly seen in [condition], but only a dermatologist can diagnose"
- Rapidly spreading rash + fever → RED ALERT, emergency
- Changing mole (asymmetry, border, color, diameter, evolving) → URGENT dermatologist
- Severe drug reactions (widespread blistering, mucosal involvement) → RED ALERT, emergency
- Isotretinoin users: always check mood data for depression correlation
- Photo data is supplementary — never diagnose from photos alone
- Match user's language (TR/EN)`;
```

### Sayfa:
- Fotoğraf çekim arayüzü (kamera + galeri) bölge seçimi ile
- Haftalık karşılaştırma slider (before/after)
- Semptom kaydı: bölge, endişe, şiddet, tetikleyiciler
- İlaç-cilt etki paneli (profildeki ilaçlardan otomatik)
- Döngü-cilt korelasyon grafik (kadın sağlığı modülüyle çapraz)
- Takviye öneri kartları (kanıt düzeyli)
- Dermatolog yönlendirme kartı
- Ürün takibi (ne kullanıyor, ne zaman değiştirdi)

---

## TOOL 15: Farmakogenetik Profil Analizi (`/pharmacogenomics`)

### Açıklama
Genetik test raw data yükle (23andMe, AncestryDNA, MyHeritage) → AI ilaç metabolizma genlerini analiz → profildeki ilaçlar ve takviyelerle çapraz kontrol. Deterministik lookup — AI yaratıcılığı sıfır.

### API Route: `/api/pharmacogenomics/route.ts`
- POST /upload: Raw data dosyası yükle + parse et
- GET: Analiz sonuçları getir

### Supabase Tablo:
```sql
CREATE TABLE pharmacogenomic_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL,  -- '23andme', 'ancestrydna', 'myheritage', 'other'
  upload_date TIMESTAMPTZ DEFAULT NOW(),
  gene_results JSONB NOT NULL,
  -- { "CYP2D6": { "rsids": { "rs1065852": "AG" }, "phenotype": "intermediate_metabolizer", "activity_score": 1.0 },
  --   "CYP2C19": { "rsids": { "rs4244285": "GG" }, "phenotype": "normal_metabolizer" },
  --   "CYP3A4": { ... }, "CYP1A2": { ... }, "CYP3A5": { ... }, "CYP2C9": { ... } }
  raw_file_hash TEXT,  -- For deduplication, never store raw data
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)  -- One genetic profile per user
);
```

### SNP → Phenotype Lookup (Statik — lib/pharmacogenomics-db.ts):
```typescript
export const PGX_GENE_SNPS = {
  CYP2D6: {
    snps: {
      'rs1065852': { AA: 'poor', AG: 'intermediate', GG: 'normal' },
      'rs3892097': { AA: 'poor', AG: 'intermediate', GG: 'normal' }
    },
    affected_drugs: ['codeine', 'tramadol', 'tamoxifen', 'fluoxetine', 'paroxetine', 'metoprolol', 'dextromethorphan'],
    affected_herbs: ['St_Johns_Wort_metabolism'],
    clinical_impact: {
      poor: 'These drugs may be ineffective or have altered effects. Your doctor may need alternative medications.',
      ultrarapid: 'These drugs may be converted too quickly, causing side effects or toxicity at normal doses.',
      intermediate: 'These drugs may work differently than expected. Dose adjustments might be needed.',
      normal: 'Standard drug metabolism expected.'
    }
  },
  CYP2C19: {
    snps: {
      'rs4244285': { AA: 'poor', AG: 'intermediate', GG: 'normal' },
      'rs12248560': { TT: 'ultrarapid', CT: 'rapid', CC: 'normal' }
    },
    affected_drugs: ['clopidogrel', 'omeprazole', 'esomeprazole', 'diazepam', 'citalopram', 'escitalopram', 'voriconazole'],
    affected_herbs: [],
    clinical_impact: {
      poor: 'Clopidogrel may be ineffective (critical for stent patients). PPIs may be overly effective. Discuss alternatives with doctor.',
      ultrarapid: 'PPIs may be less effective. May need higher PPI doses.',
      intermediate: 'Moderate changes in drug metabolism possible.',
      normal: 'Standard metabolism.'
    }
  },
  CYP3A4: {
    snps: {
      'rs2740574': { AA: 'reduced', AG: 'intermediate', GG: 'normal' }
    },
    affected_drugs: ['atorvastatin', 'simvastatin', 'cyclosporine', 'tacrolimus', 'midazolam', 'nifedipine', 'amlodipine'],
    affected_herbs: ['St_Johns_Wort_inducer', 'grapefruit_inhibitor', 'echinacea_inhibitor'],
    clinical_impact: {
      reduced: 'Statins and calcium channel blockers may have stronger effects. Grapefruit interaction risk is amplified.',
      normal: 'Standard metabolism.'
    }
  },
  CYP1A2: {
    snps: {
      'rs762551': { AA: 'fast', AC: 'intermediate', CC: 'slow' }
    },
    affected_drugs: ['caffeine', 'theophylline', 'clozapine', 'melatonin', 'tizanidine'],
    affected_herbs: ['caffeine_sensitivity', 'green_tea_catechins'],
    clinical_impact: {
      slow: 'Caffeine affects you strongly — limit to 1 cup/day. Melatonin may last longer. Theophylline doses may need reduction.',
      fast: 'Caffeine clears quickly — you may need more for effect. Melatonin may clear faster.',
      intermediate: 'Moderate caffeine sensitivity.'
    }
  },
  CYP2C9: {
    snps: {
      'rs1799853': { TT: 'poor', CT: 'intermediate', CC: 'normal' },
      'rs1057910': { CC: 'poor', AC: 'intermediate', AA: 'normal' }
    },
    affected_drugs: ['warfarin', 'phenytoin', 'losartan', 'ibuprofen', 'celecoxib'],
    affected_herbs: [],
    clinical_impact: {
      poor: 'Warfarin doses may need significant reduction. NSAID metabolism slower — increased GI risk.',
      intermediate: 'Moderate dose adjustments may be needed.',
      normal: 'Standard metabolism.'
    }
  }
};
```

### Raw Data Parser (lib/pgx-parser.ts):
```typescript
// 23andMe format: rsid \t chromosome \t position \t genotype
// AncestryDNA format: rsid \t chromosome \t position \t allele1 \t allele2
// Parse both, extract relevant SNPs from PGX_GENE_SNPS

export function parseRawDNA(fileContent: string, source: string): GeneResults {
  const lines = fileContent.split('\n').filter(l => !l.startsWith('#'));
  const results: GeneResults = {};

  const relevantSnps = new Set<string>();
  for (const gene of Object.values(PGX_GENE_SNPS)) {
    for (const rsid of Object.keys(gene.snps)) {
      relevantSnps.add(rsid);
    }
  }

  for (const line of lines) {
    const parts = line.split('\t');
    const rsid = parts[0];
    if (!relevantSnps.has(rsid)) continue;

    let genotype: string;
    if (source === '23andme') {
      genotype = parts[3]; // e.g., "AG"
    } else {
      genotype = parts[3] + parts[4]; // allele1 + allele2
    }

    // Map to phenotype using lookup table
    for (const [geneName, geneData] of Object.entries(PGX_GENE_SNPS)) {
      if (geneData.snps[rsid]) {
        const phenotype = geneData.snps[rsid][genotype] || 'unknown';
        results[geneName] = { rsid, genotype, phenotype };
      }
    }
  }

  return results;
}
```

### AI Prompt (minimal — mostly deterministic):
```typescript
export const PHARMACOGENOMICS_PROMPT = `You are explaining pharmacogenomic results for a Phytotherapy.ai user.

INPUT: Gene phenotype results (deterministic — already calculated), user's medication list, user's supplement list.

YOUR ROLE: Explain results in plain language and cross-reference with user's current medications and supplements.

DO NOT calculate phenotypes — they are provided. DO NOT interpret raw SNPs — they are already interpreted.

FOR EACH GENE RESULT:
1. Explain what the gene does in simple terms
2. What the user's phenotype means practically
3. Which of the user's CURRENT medications are affected
4. Which of the user's CURRENT supplements are affected
5. What to discuss with their doctor

RESPONSE FORMAT (JSON):
{
  "summary": string,
  "geneResults": [{
    "gene": string,
    "phenotype": string,
    "explanation": string,
    "affectedCurrentMeds": [{ "medication": string, "impact": string, "action": string }],
    "affectedCurrentSupplements": [{ "supplement": string, "impact": string }],
    "doctorDiscussionPoints": [string]
  }],
  "overallInsights": [string],
  "importantDisclaimer": string
}

CRITICAL RULES:
- This is INFORMATIONAL, not clinical pharmacogenomic testing
- Always say "discuss with your doctor before making any medication changes"
- Never suggest stopping or changing medication doses
- Consumer genetic tests have limitations — clinical PGx testing is more comprehensive
- Match user's language (TR/EN)`;
```

### Sayfa:
- Raw data upload (drag & drop, .txt dosyası)
- Kaynak seçimi (23andMe / AncestryDNA / MyHeritage)
- Gen sonuçları kartları (CYP2D6, CYP2C19, CYP3A4, CYP1A2, CYP2C9)
- Her gen için: fenotip badge (yeşil=normal, sarı=intermediate, kırmızı=poor/ultrarapid)
- Profildeki ilaçlarla çapraz kontrol paneli (etkilenen ilaçlar kırmızı vurgulu)
- Profildeki takviyelerle çapraz kontrol
- "Doktorunuza gösterin" PDF export
- Disclaimer: "Bu bilgilendirme amaçlıdır, klinik PGx testi yerine geçmez"

---

## TOOL 16: Ağrı Yönetim Günlüğü (`/pain-journal`)

### Açıklama
Vücut haritası üzerinde ağrı noktası işaretle, ağrı tipi/şiddet/süre/tetikleyici kaydet, ilaç etkinlik takibi, doktora hazır trend raporu.

### API Route: `/api/pain-journal/route.ts`

### Supabase Tablo:
```sql
CREATE TABLE pain_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date TIMESTAMPTZ DEFAULT NOW(),
  body_location TEXT NOT NULL,  -- 'head', 'neck', 'right_shoulder', 'left_shoulder', 'upper_back', 'lower_back', 'chest', 'abdomen', 'right_hip', 'left_hip', 'right_knee', 'left_knee', 'right_ankle', 'left_ankle', 'right_wrist', 'left_wrist'
  pain_type TEXT,  -- 'throbbing', 'stabbing', 'burning', 'dull', 'shooting', 'cramping', 'tingling'
  severity INTEGER CHECK (severity BETWEEN 0 AND 10),  -- VAS scale
  duration TEXT,  -- 'minutes', 'hours', 'constant', 'intermittent'
  triggers TEXT[],  -- ['movement', 'sitting', 'weather', 'stress', 'sleep_position', 'food', 'exercise']
  relief_methods TEXT[],  -- ['medication', 'rest', 'ice', 'heat', 'stretching', 'massage', 'nothing']
  medication_taken TEXT,
  medication_effectiveness INTEGER CHECK (medication_effectiveness BETWEEN 0 AND 10),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_pain_user_date ON pain_records(user_id, date DESC);
```

### AI Prompt:
```typescript
export const PAIN_JOURNAL_PROMPT = `You are a pain pattern analyst for Phytotherapy.ai. You do NOT diagnose causes of pain.

INPUT: 7-30 days of pain records (location, type, severity VAS 0-10, duration, triggers, relief methods, medication effectiveness) + user profile.

ANALYSIS:
1. Pain pattern: location consistency, severity trend, time-of-day patterns
2. Trigger identification: which factors most correlate with pain spikes
3. Medication effectiveness: is the current pain medication working? (average VAS with med vs without)
4. NSAID overuse detection: if taking NSAIDs >15 days/month → medication overuse headache risk warning
5. Drug-pain correlation: check if any medication could be CAUSING pain
   - Statins → muscle pain (myalgia) in 5-10% of users
   - Fluoroquinolone antibiotics → tendon pain
   - Aromatase inhibitors → joint pain
   - ACE inhibitors → muscle cramps
   - Bisphosphonates → bone/joint pain
6. Supplement considerations: ONLY evidence-based
   - Turmeric/curcumin for joint inflammation (Grade B)
   - Omega-3 for inflammatory pain (Grade B)
   - Magnesium for muscle cramps (Grade B)
   - Boswellia for osteoarthritis (Grade B)
   - Capsaicin topical for neuropathic pain (Grade A)

RESPONSE FORMAT (JSON):
{
  "averagePainScore": number,
  "trend": "improving" | "stable" | "worsening",
  "painPattern": { "primaryLocation": string, "primaryType": string, "timePattern": string },
  "triggers": [{ "trigger": string, "correlation": "strong" | "moderate", "frequency": number }],
  "medicationEffectiveness": { "withMedication": number, "withoutMedication": number, "reduction": string },
  "overuseWarning": { "atRisk": boolean, "daysUsed": number, "message": string },
  "drugPainCorrelation": [{ "medication": string, "possiblePainEffect": string, "recommendation": string }],
  "supplements": [{ "name": string, "dose": string, "indication": string, "evidence": "A" | "B", "safeWithMeds": boolean }],
  "alerts": [{ "level": "red" | "yellow" | "info", "message": string }],
  "doctorReportReady": boolean
}

CRITICAL RULES:
- Sudden severe headache ("worst of my life") → RED ALERT, emergency
- Chest pain → RED ALERT, emergency (hand off to red code filter)
- Pain with numbness/weakness → URGENT referral
- Never suggest pain is "just" psychological
- NSAID >15 days/month → medication overuse headache warning
- Opioid use tracking → flag if escalating, never recommend dose changes
- Match user's language`;
```

### Sayfa:
- İnteraktif vücut haritası (SVG front + back view, tıklanabilir bölgeler, seçilen bölge kırmızıya döner)
- Ağrı detay formu: tip, şiddet VAS slider (0-10, yüz emojileri), süre, tetikleyiciler, ne iyi geldi
- İlaç etkinlik takibi (ilaç aldın mı? ağrı sonrası kaç oldu?)
- 30 günlük ağrı haritası (body map heat overlay — sık ağrıyan bölgeler koyulaşır)
- Trend grafik (günlük VAS skoru çizgi grafik)
- İlaç karşılaştırma (A ilacı ortalama 4.2'ye düşürüyor, B ilacı 5.8'e → A daha etkili)
- Doktor raporu PDF (vücut haritası + trend + ilaç etkinlik + tetikleyiciler — tek sayfada)

---

## TOOL 17: Yaşlı Bakım Modu (Aile Profili Entegrasyonu — mevcut `/profile` + `/family`)

### Açıklama
Yeni sayfa OLUŞTURMA. Mevcut aile profili sistemi + mevcut tüm tool'lar yaşa göre otomatik adapte olur. 65+ profil açıldığında otomatik aktive olan özel katman.

### Implementasyon:
```typescript
// lib/age-adaptive.ts — Tüm sayfalarda import edilen yardımcı
export function getProfileMode(birthDate: string): 'pediatric' | 'adolescent' | 'adult' | 'elderly' {
  const age = calculateAge(birthDate);
  if (age < 13) return 'pediatric';
  if (age < 18) return 'adolescent';
  if (age >= 65) return 'elderly';
  return 'adult';
}

export const ELDERLY_CONFIG = {
  fontSize: 'large',  // CSS class: text-lg → text-xl globally
  polypharmacyThreshold: 5,  // 5+ meds → warning
  fallRiskDrugs: ['benzodiazepine', 'opioid', 'antihypertensive', 'antidepressant_tricyclic', 'antihistamine_first_gen', 'alpha_blocker', 'muscle_relaxant'],
  fallRiskFactors: ['orthostatic_hypotension', 'dizziness', 'sedation', 'blurred_vision', 'cognitive_impairment'],
  renalDoseAdjustment: true,
  anticholinergicBurden: true,  // Sum anticholinergic scores of all meds
};

// Fall risk scoring (deterministic)
export function calculateFallRisk(medications: string[]): { score: number, level: 'low' | 'moderate' | 'high', factors: string[] } {
  let score = 0;
  const factors: string[] = [];
  for (const med of medications) {
    const category = getDrugCategory(med);
    if (ELDERLY_CONFIG.fallRiskDrugs.includes(category)) {
      score += FALL_RISK_SCORES[category];
      factors.push(`${med} (${category}): ${FALL_RISK_EFFECTS[category]}`);
    }
  }
  return {
    score,
    level: score >= 6 ? 'high' : score >= 3 ? 'moderate' : 'low',
    factors
  };
}

// Anticholinergic burden (deterministic)
export function calculateAnticholinergicBurden(medications: string[]): { score: number, level: string, risks: string[] } {
  // Score 1-3 per drug, total ≥3 = cognitive risk in elderly
  // ACB (Anticholinergic Cognitive Burden) scale
}
```

### Dashboard Widget (elderly profillerde otomatik görünür):
- Polifarmasi uyarı kartı ("8 ilaç, 28 potansiyel etkileşim kontrol edildi, 3'ü dikkat gerektiriyor")
- Düşme riski skoru (yeşil/sarı/kırmızı badge)
- Antikolinerjik yük skoru (kognitif etki riski)
- Büyük font toggle (profil ayarında)
- Bakıcı/evlat bildirim tercihleri
- İlaç alarm saatleri (sesli + büyük buton)

---

## TOOL 18: Çocuk Sağlığı Modu (Aile Profili Entegrasyonu — mevcut `/family`)

### Açıklama
Yeni sayfa OLUŞTURMA. Mevcut aile profili + 0-12 yaş profili açıldığında otomatik aktive. Kiloya göre doz, gelişim takibi, çocuk kontrendike listesi.

### Implementasyon:
```typescript
// lib/pediatric.ts
export const PEDIATRIC_DOSING = {
  'paracetamol': { mgPerKg: { min: 10, max: 15 }, maxDailyDoses: 5, interval: '4-6 hours', formulations: ['120mg/5ml syrup', '250mg/5ml syrup', '500mg tablet'] },
  'ibuprofen': { mgPerKg: { min: 5, max: 10 }, maxDailyDoses: 3, interval: '6-8 hours', formulations: ['100mg/5ml syrup'], minAge: 6 },  // months
  'amoxicillin': { mgPerKg: { min: 25, max: 50 }, maxDailyDoses: 3, interval: '8 hours', formulations: ['125mg/5ml', '250mg/5ml'] },
};

export function calculatePediatricDose(drug: string, weightKg: number, age: number): DoseResult {
  const info = PEDIATRIC_DOSING[drug];
  if (!info) return { available: false };
  if (info.minAge && age < info.minAge) return { contraindicated: true, reason: `Not recommended under ${info.minAge} months` };

  const minDose = weightKg * info.mgPerKg.min;
  const maxDose = weightKg * info.mgPerKg.max;

  return {
    available: true,
    doseRange: `${minDose.toFixed(0)}-${maxDose.toFixed(0)} mg`,
    frequency: `Every ${info.interval}, max ${info.maxDailyDoses} doses/day`,
    formulations: info.formulations.map(f => {
      const [mg, ml] = parseFormulation(f);
      const minMl = (minDose / mg) * ml;
      const maxMl = (maxDose / mg) * ml;
      return `${f}: ${minMl.toFixed(1)}-${maxMl.toFixed(1)} ml`;
    })
  };
}

export const PEDIATRIC_CONTRAINDICATED_HERBS = {
  'honey': { maxAge: 12, unit: 'months', reason: 'Botulism risk (Clostridium botulinum spores)' },
  'any_herbal_tea': { maxAge: 6, unit: 'months', reason: 'No herbal products under 6 months' },
  'valerian': { maxAge: 3, unit: 'years', reason: 'Insufficient safety data under 3' },
  'melatonin': { maxAge: 12, unit: 'years', reason: 'Controversial, may affect hormonal development — only with pediatrician approval' },
  'echinacea': { maxAge: 12, unit: 'years', reason: 'Allergic reaction risk, especially with atopic history' },
  'st_johns_wort': { maxAge: 12, unit: 'years', reason: 'Drug interactions, photosensitivity, not studied in children' },
  'kava': { maxAge: 18, unit: 'years', reason: 'Hepatotoxicity risk, banned in some countries for children' },
  'ephedra': { maxAge: 18, unit: 'years', reason: 'Cardiovascular risk, banned in many formulations' }
};

export const DEVELOPMENTAL_MILESTONES_WHO = {
  // months → expected milestones
  2: ['social_smile', 'follows_objects', 'coos'],
  4: ['holds_head_steady', 'reaches_for_toys', 'laughs'],
  6: ['sits_with_support', 'transfers_objects', 'babbles'],
  9: ['sits_without_support', 'stands_holding', 'says_mama_dada'],
  12: ['walks_with_help', 'uses_2_words', 'drinks_from_cup'],
  18: ['walks_alone', 'uses_10_words', 'scribbles'],
  24: ['runs', 'uses_2_word_phrases', 'kicks_ball'],
  36: ['climbs_stairs', 'uses_sentences', 'plays_with_others']
};
```

### Sayfa bileşenleri (aile profilinde çocuk seçilince görünür):
- Doz hesaplayıcı: ilaç seç + kilo gir → ml/mg hesabı
- Kontrendike bitki uyarı listesi
- Gelişim milestone checklist (WHO)
- Aşı takvimi (çocuk versiyonu — Sağlık Bakanlığı)
- Ateş yönetim rehberi (ne zaman doktor, ne zaman acil)

---

## TOOL 19: Spor Performans & Toparlanma (mevcut `/body-analysis` sayfasına entegre)

### Açıklama
Mevcut body-analysis sayfasına tab eklenir: "Vücut Kompozisyonu" | "Beslenme" | "Antrenman & Toparlanma"

### Supabase Tablo:
```sql
CREATE TABLE workout_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  workout_type TEXT NOT NULL,  -- 'strength', 'cardio', 'hiit', 'yoga', 'swimming', 'cycling', 'running', 'walking', 'sports', 'flexibility'
  duration INTEGER,  -- minutes
  intensity INTEGER CHECK (intensity BETWEEN 1 AND 10),  -- RPE
  muscle_groups TEXT[],  -- ['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'full_body']
  supplements_pre TEXT[],  -- pre-workout supplements taken
  supplements_post TEXT[],  -- post-workout supplements taken
  soreness_level INTEGER CHECK (soreness_level BETWEEN 0 AND 10),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_workout_user_date ON workout_records(user_id, date DESC);
```

### Spor Takviye Veritabanı (Statik):
```typescript
export const SPORT_SUPPLEMENTS = {
  'creatine': {
    timing: 'any_time_daily', dose: '3-5g/day', evidence: 'A',
    benefits: ['strength', 'power', 'muscle_mass', 'recovery'],
    contraindications: ['kidney_disease'],
    drug_interactions: ['nephrotoxic_drugs', 'NSAIDs_chronic'],
    notes: 'Loading phase optional. Take with water. Safe long-term.'
  },
  'caffeine': {
    timing: 'pre_workout_30_60min', dose: '3-6mg/kg bodyweight', evidence: 'A',
    benefits: ['endurance', 'power', 'focus', 'fat_oxidation'],
    contraindications: ['anxiety_disorder', 'arrhythmia', 'pregnancy', 'CYP1A2_slow_metabolizer'],
    drug_interactions: ['MAOIs', 'lithium', 'theophylline', 'adenosine', 'quinolone_antibiotics'],
    notes: 'Avoid after 2pm for sleep. Build tolerance over time.'
  },
  'beta_alanine': {
    timing: 'daily_split_doses', dose: '3.2-6.4g/day', evidence: 'A',
    benefits: ['endurance_60_240sec', 'buffer_capacity'],
    contraindications: [],
    drug_interactions: [],
    notes: 'Tingling (paresthesia) is harmless. Split doses to reduce.'
  },
  'protein_whey': {
    timing: 'post_workout_2h_or_any', dose: '20-40g per serving', evidence: 'A',
    benefits: ['muscle_synthesis', 'recovery', 'satiety'],
    contraindications: ['milk_allergy', 'severe_kidney_disease'],
    drug_interactions: ['levodopa_absorption'],
    notes: 'Total daily protein matters more than timing window.'
  },
  'BCAA': {
    timing: 'pre_or_during_workout', dose: '5-10g', evidence: 'B_if_protein_insufficient',
    benefits: ['reduce_soreness_maybe'],
    contraindications: [],
    drug_interactions: [],
    notes: 'UNNECESSARY if daily protein intake is adequate (>1.6g/kg). Save your money for whole protein sources.'
  },
  'omega_3': {
    timing: 'with_meals', dose: '1-3g EPA+DHA/day', evidence: 'A',
    benefits: ['anti_inflammation', 'joint_health', 'recovery', 'cardiovascular'],
    contraindications: [],
    drug_interactions: ['blood_thinners_high_dose'],
    notes: 'Best long-term supplement for athletes.'
  },
  'ashwagandha': {
    timing: 'morning_or_evening', dose: '300-600mg KSM-66', evidence: 'B',
    benefits: ['stress_reduction', 'testosterone_support', 'recovery', 'sleep'],
    contraindications: ['thyroid_overactive', 'autoimmune'],
    drug_interactions: ['thyroid_medications', 'immunosuppressants', 'sedatives', 'diabetes_medications'],
    notes: 'Adaptogen. 8-week cycle recommended with 2-week break.'
  }
};
```

### AI Prompt:
```typescript
export const FITNESS_RECOVERY_PROMPT = `You are a fitness and recovery optimizer for Phytotherapy.ai.

INPUT: Workout records (type, duration, intensity, muscle groups) + sleep data + nutrition data + pain data + mood data + user profile (medications, supplements).

ANALYSIS:
1. Training load: weekly volume and intensity trend
2. Recovery score (0-100) based on:
   - Sleep quality (from sleep module): 30 points
   - Nutrition adequacy (from nutrition module): 25 points
   - Soreness/pain trend (from pain module): 25 points
   - Mood/energy (from mental wellness module): 20 points
3. Overtraining detection:
   - 7-day declining sleep quality + increasing soreness + declining mood = WARNING
   - Performance plateau + elevated resting HR + irritability = ALERT
4. Supplement timing optimization:
   - Cross-check ALL sport supplements against user's MEDICATIONS
   - Pre-workout caffeine + blood pressure meds → warning
   - Creatine + kidney disease → contraindicated
   - Ashwagandha + thyroid meds → interaction
   - BCAA waste detection: "Your protein is 130g/day, that's enough — BCAA is unnecessary"
5. Recovery recommendations based on available cross-module data

RESPONSE FORMAT (JSON):
{
  "weeklyVolume": { "sessions": number, "totalMinutes": number, "averageIntensity": number },
  "recoveryScore": { "total": number, "sleep": number, "nutrition": number, "pain": number, "mood": number },
  "trainingLoadTrend": "increasing" | "stable" | "decreasing" | "excessive",
  "overtrainingRisk": "low" | "moderate" | "high",
  "overtrainingSignals": [string],
  "supplementReview": [{
    "supplement": string,
    "currentUse": string,
    "assessment": "optimal" | "adjust_timing" | "unnecessary" | "contraindicated",
    "reason": string,
    "drugInteraction": string
  }],
  "todayRecommendation": { "activity": string, "reason": string },
  "weeklyPlan": [{ "day": string, "suggestion": string }]
}

CRITICAL RULES:
- NEVER suggest performance-enhancing drugs or prohormones
- If on blood pressure medications → flag pre-workout stimulants
- If on blood thinners → flag high-dose omega-3 and vitamin E
- If diabetic → flag exercise hypoglycemia risk, carb timing
- Recovery score uses EXISTING data from other modules — don't ask user to enter separately
- Match user's language`;
```

---

## TOOL 20: Ses ile Sağlık Günlüğü (Platform geneli — `/voice-journal` + tüm sayfalara mic butonu)

### Açıklama
Web Speech API ile sesli kayıt → AI metin çıkarma → yapılandırılmış veri kartları → kullanıcı onayı → ilgili modüllere kayıt. Çifte güvenlik: metin onay + veri onay.

### API Route: `/api/voice-journal/route.ts`
- POST: Transkript gönder → AI yapılandırılmış veri çıkar → JSON kartlar dön

### Client-side Speech (lib/voice-input.ts):
```typescript
export function createVoiceRecorder(lang: 'tr-TR' | 'en-US') {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    return null;  // Fallback: normal form kullan
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = lang;

  return {
    start: () => recognition.start(),
    stop: () => recognition.stop(),
    onResult: (callback: (transcript: string, isFinal: boolean) => void) => {
      recognition.onresult = (event) => {
        const result = event.results[event.results.length - 1];
        callback(result[0].transcript, result.isFinal);
      };
    },
    onError: (callback: (error: string) => void) => {
      recognition.onerror = (event) => callback(event.error);
    }
  };
}
```

### AI Prompt:
```typescript
export const VOICE_JOURNAL_PROMPT = `You are parsing a health journal voice entry for Phytotherapy.ai.

INPUT: Transcribed text from user's voice recording.

TASK: Extract ALL health-related data points and categorize them.

EXTRACT THESE CATEGORIES:
1. MEDICATION: drug name, time taken, dose if mentioned
2. SUPPLEMENT: supplement name, time, dose
3. SYMPTOM: what hurts/bothers, severity if mentioned, body location
4. MEAL: what they ate, meal time/type
5. EXERCISE: activity type, duration, intensity
6. MOOD: how they feel emotionally
7. SLEEP: bedtime, wake time, quality
8. VITAL: blood pressure, glucose, weight, temperature
9. WATER: glasses/liters consumed
10. OTHER: any health-relevant note that doesn't fit above

RESPONSE FORMAT (JSON):
{
  "transcriptConfirmed": string,
  "dataPoints": [
    {
      "category": "medication" | "supplement" | "symptom" | "meal" | "exercise" | "mood" | "sleep" | "vital" | "water" | "other",
      "icon": string,
      "summary": string,
      "details": {
        // Category-specific fields
        // medication: { name, dose, time }
        // symptom: { description, severity, location }
        // meal: { description, mealType, estimatedCalories }
        // exercise: { type, duration, intensity }
        // mood: { level, notes }
        // etc.
      },
      "targetModule": string,  // Which module this data should be saved to
      "confidence": "high" | "medium" | "low"
    }
  ],
  "unrecognized": string  // Parts that couldn't be categorized
}

EXAMPLES:
Input: "Bugün sabah 8'de metforminimi aldım, öğlen tavuk pilav yedim, öğleden sonra sağ dizim ağrıdı 6 civarı, akşam 40 dakika yürüdüm"
Output: 4 data points — medication(metformin, 08:00), meal(tavuk pilav, lunch), symptom(right knee pain, 6/10), exercise(walking, 40min)

Input: "Dün gece 11'de yattım 7'de kalktım ama 2 kere uyandım, bugün enerjim düşük, biraz da gerginim"
Output: 3 data points — sleep(23:00-07:00, 2 wakes), mood(low energy), mood(tense/anxious)

RULES:
- Turkish drug brand names: Glifor=metformin, Coversyl=perindopril, Euthyrox=levothyroxine etc.
- If severity mentioned as words (hafif/orta/şiddetli), convert to 1-10 scale
- If time not mentioned, use "unspecified"
- If uncertain about extraction, set confidence="low"
- NEVER auto-save — all data points require user confirmation
- Match detected language of transcript`;
```

### UI Akışı:
1. Mic butonu basılı tut → kayıt başlar (kırmızı pulse animasyonu)
2. Bırak → transkript gösterilir, kullanıcı düzeltebilir
3. "Onayla" → API'ye gider, veri kartları döner
4. Her kart: ikon + özet + onay/düzelt/sil butonları
5. Onaylanan kartlar ilgili modüllere kaydedilir
6. Kayıt özeti: "3 veri kaydedildi: İlaç ✓, Semptom ✓, Egzersiz ✓"

### Tüm sayfalarda:
- Her sayfanın sağ alt köşesine küçük mic FAB butonu (floating action button)
- O sayfanın modülüne özel kayıt: uyku sayfasında mic basarsan sadece uyku verisini çıkarır
- Ana voice-journal sayfasında ise tüm kategorileri çıkarır

---

# GÜNCELLENMIŞ SAYFA YAPISI (20 Tool)

```
app/
├── sleep-analysis/page.tsx         (TOOL 1)
├── mental-wellness/page.tsx        (TOOL 3)
├── appointment-prep/page.tsx       (TOOL 4)
├── vaccination/page.tsx            (TOOL 5)
├── chronic-care/page.tsx           (TOOL 6)
├── nutrition/page.tsx              (TOOL 7)
├── seasonal-health/page.tsx        (TOOL 8)
├── womens-health/page.tsx          (TOOL 9)
├── travel-health/page.tsx          (TOOL 10)
├── allergy-map/page.tsx            (TOOL 11)
├── rehabilitation/page.tsx         (TOOL 12)
├── gut-health/page.tsx             (TOOL 13)
├── skin-health/page.tsx            (TOOL 14)
├── pharmacogenomics/page.tsx       (TOOL 15)
├── pain-journal/page.tsx           (TOOL 16)
├── voice-journal/page.tsx          (TOOL 20)
├── body-analysis/page.tsx          (TOOL 19 — mevcut sayfaya tab ekle)
├── profile/                        (TOOL 2 prospektüs + TOOL 17 yaşlı + TOOL 18 çocuk)
├── family/                         (TOOL 17+18 yaş bazlı otomatik mod)

app/api/
├── gut-health/route.ts
├── skin-health/route.ts
├── pharmacogenomics/route.ts
├── pain-journal/route.ts
├── voice-journal/route.ts
├── (mevcut: sleep, mental-wellness, appointment-prep, chronic-care, nutrition-log, womens-health, travel-health, allergy-map, rehabilitation)
├── (güncelle: body-analysis → fitness tab ekle, scan-medication → prospektüs modu, family → yaş adaptif)
```

# FİNAL ÖNCELİK SIRASI (20 Tool)

| # | Tool | Entegrasyon | Karmaşıklık | Etki |
|---|------|-------------|-------------|------|
| 1 | Uyku Kalitesi | Yeni sayfa | Orta | Yüksek |
| 2 | Prospektüs Okuyucu | Mevcut tarayıcıya ek | Düşük | Orta |
| 3 | Kadın Sağlığı + Kontraseptif | Yeni sayfa | Yüksek | Çok Yüksek |
| 4 | Mental Wellness | Yeni sayfa | Orta | Yüksek |
| 5 | Beslenme Günlüğü | Yeni sayfa | Orta | Yüksek |
| 6 | Kronik Hastalık Paneli | Yeni sayfa | Yüksek | Çok Yüksek |
| 7 | Bağırsak Sağlığı | Yeni sayfa | Orta | Çok Yüksek |
| 8 | Cilt Sağlığı | Yeni sayfa | Orta | Yüksek |
| 9 | Ağrı Yönetim Günlüğü | Yeni sayfa | Orta | Çok Yüksek |
| 10 | Farmakogenetik | Yeni sayfa | Orta (deterministik) | Devrim |
| 11 | Spor & Toparlanma | Mevcut body-analysis'e tab | Orta | Yüksek |
| 12 | Yaşlı Bakım Modu | Mevcut profil/aile adaptasyonu | Orta | Çok Yüksek |
| 13 | Çocuk Sağlığı Modu | Mevcut profil/aile adaptasyonu | Orta | Yüksek |
| 14 | Ses ile Sağlık Günlüğü | Platform geneli + yeni sayfa | Yüksek | Devrim |
| 15 | Alerji Haritası | Yeni sayfa | Orta | Orta |
| 16 | Doktor Randevu Hazırlığı | Yeni sayfa | Orta | Yüksek |
| 17 | Seyahat Sağlık | Yeni sayfa | Orta | Orta |
| 18 | Aşı Takvimi | Yeni sayfa (çoğu statik) | Düşük | Orta |
| 19 | Rehabilitasyon | Yeni sayfa | Orta | Niş |
| 20 | Mevsimsel Rehber | Yeni sayfa (çoğu statik) | Düşük | Orta |

# NAVBAR GÜNCELLEMESİ

20 tool navbar'a sığmaz. Yapı:
- Ana navbar: Dashboard, Asistan, Takvim, Profil, **Araçlar**
- "Araçlar" → `/tools` sayfası: kategorili grid
  - **Günlük Takip**: Uyku, Mood, Beslenme, Ağrı, Su
  - **Tıbbi Analiz**: Laboratuvar, Radyoloji, Semptom, Kronik Hastalık
  - **Etkileşim & Güvenlik**: İlaç-Bitki, Besin-İlaç, Etkileşim Haritası, Farmakogenetik
  - **Vücut & Performans**: Vücut Analizi, Spor, Cilt, Bağırsak
  - **Yaşam & Planlama**: Kadın Sağlığı, Aşı, Seyahat, Mevsimsel, Doktor Hazırlık
  - **Özel**: Ses Günlüğü, Prospektüs, Alerji, Rehabilitasyon

# SUPABASE MİGRASYON

Tüm yeni tabloları sırayla:
```
supabase/migrations/
├── 20260329_tools_phase1.sql    (sleep, mood, gut, skin, pain, workout)
├── 20260329_tools_phase2.sql    (pharmacogenomics, allergy, vaccination, rehab, nutrition, cycle, contraceptive)
```

# DİĞER SESSION İÇİN TALİMAT

Bu dosyayı aç ve TOOL 1'den başlayarak sırayla implement et. Her tool için:
1. Supabase migration SQL'ini çalıştır
2. API route oluştur (rate limiting + auth + profil fetch + AI çağrısı)
3. AI prompt'u lib/prompts.ts'e ekle
4. Statik veritabanlarını lib/ altına ekle
5. Sayfa oluştur (mobile-first, dark/light, TR/EN çeviri)
6. Çeviri key'lerini lib/translations.ts'e ekle
7. Navbar/tools sayfasına ekle
8. Test et

Her 4 tool'dan sonra commit + push yap.
Son olarak tüm tool'lar bitince: navbar güncellemesi + tools sayfası + final commit + push.
