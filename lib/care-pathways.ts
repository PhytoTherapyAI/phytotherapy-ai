// © 2026 Doctopal — All Rights Reserved
// ============================================
// Integrated Care Pathways — Harvard HVHS C6
// Risk Stratification + Bundled Services + Variance Analysis
// ============================================

// ══════════════════════════════════════════
// 1. Risk Stratification Engine (C6.4)
// ══════════════════════════════════════════

export type RiskTier = "wellness" | "management" | "complex"

export interface RiskAssessment {
  tier: RiskTier
  score: number           // 0-100
  factors: RiskFactor[]
  recommendedPathway: string
}

export interface RiskFactor {
  factor: string
  points: number
  detail: { en: string; tr: string }
}

export interface PatientData {
  age: number
  gender?: string
  conditions: string[]
  medicationCount: number
  allergies: string[]
  recentLabFlags: number      // count of out-of-range lab values
  symptomSeverity: number     // 0-10 self-reported
  complianceRate: number      // 0-100 medication adherence %
  hospitalizationsLastYear: number
  polypharmacy: boolean       // 5+ medications
}

/**
 * Risk Stratification Scoring Algorithm
 * Based on: age, comorbidities, medication complexity, lab stability, adherence
 */
export function calculateRiskScore(patient: PatientData): RiskAssessment {
  const factors: RiskFactor[] = []
  let score = 0

  // Age factor
  if (patient.age >= 75) { score += 15; factors.push({ factor: "age", points: 15, detail: { en: "Age 75+: higher risk for adverse events", tr: "75+ yaş: istenmeyen olay riski yüksek" } }) }
  else if (patient.age >= 65) { score += 10; factors.push({ factor: "age", points: 10, detail: { en: "Age 65-74: moderate age-related risk", tr: "65-74 yaş: orta düzey yaşa bağlı risk" } }) }
  else if (patient.age >= 50) { score += 5; factors.push({ factor: "age", points: 5, detail: { en: "Age 50-64: screening age", tr: "50-64 yaş: tarama dönemi" } }) }

  // Chronic conditions
  const condCount = patient.conditions.length
  if (condCount >= 3) { score += 20; factors.push({ factor: "multimorbidity", points: 20, detail: { en: `${condCount} chronic conditions (multimorbidity)`, tr: `${condCount} kronik hastalık (multimorbidite)` } }) }
  else if (condCount >= 1) { score += 10; factors.push({ factor: "chronic", points: 10, detail: { en: `${condCount} chronic condition(s)`, tr: `${condCount} kronik hastalık` } }) }

  // Polypharmacy
  if (patient.polypharmacy || patient.medicationCount >= 5) {
    score += 15; factors.push({ factor: "polypharmacy", points: 15, detail: { en: `${patient.medicationCount} medications (polypharmacy risk)`, tr: `${patient.medicationCount} ilaç (polifarmasi riski)` } })
  } else if (patient.medicationCount >= 3) {
    score += 8; factors.push({ factor: "medications", points: 8, detail: { en: `${patient.medicationCount} medications`, tr: `${patient.medicationCount} ilaç` } })
  }

  // Lab instability
  if (patient.recentLabFlags >= 4) { score += 15; factors.push({ factor: "labs", points: 15, detail: { en: `${patient.recentLabFlags} abnormal lab values`, tr: `${patient.recentLabFlags} anormal tahlil değeri` } }) }
  else if (patient.recentLabFlags >= 2) { score += 8; factors.push({ factor: "labs", points: 8, detail: { en: `${patient.recentLabFlags} flagged lab values`, tr: `${patient.recentLabFlags} işaretli tahlil değeri` } }) }

  // Symptom severity
  if (patient.symptomSeverity >= 7) { score += 10; factors.push({ factor: "symptoms", points: 10, detail: { en: `High symptom severity (${patient.symptomSeverity}/10)`, tr: `Yüksek semptom şiddeti (${patient.symptomSeverity}/10)` } }) }
  else if (patient.symptomSeverity >= 4) { score += 5; factors.push({ factor: "symptoms", points: 5, detail: { en: `Moderate symptoms (${patient.symptomSeverity}/10)`, tr: `Orta semptomlar (${patient.symptomSeverity}/10)` } }) }

  // Compliance
  if (patient.complianceRate < 50) { score += 10; factors.push({ factor: "compliance", points: 10, detail: { en: `Low medication adherence (${patient.complianceRate}%)`, tr: `Düşük ilaç uyumu (%${patient.complianceRate})` } }) }
  else if (patient.complianceRate < 80) { score += 5; factors.push({ factor: "compliance", points: 5, detail: { en: `Suboptimal adherence (${patient.complianceRate}%)`, tr: `Suboptimal uyum (%${patient.complianceRate})` } }) }

  // Hospitalizations
  if (patient.hospitalizationsLastYear >= 2) { score += 15; factors.push({ factor: "hospitalizations", points: 15, detail: { en: `${patient.hospitalizationsLastYear} hospitalizations last year`, tr: `Geçen yıl ${patient.hospitalizationsLastYear} hastane yatışı` } }) }
  else if (patient.hospitalizationsLastYear >= 1) { score += 8; factors.push({ factor: "hospitalizations", points: 8, detail: { en: "1 hospitalization last year", tr: "Geçen yıl 1 hastane yatışı" } }) }

  // Determine tier
  const tier: RiskTier = score >= 50 ? "complex" : score >= 25 ? "management" : "wellness"

  return {
    tier,
    score: Math.min(score, 100),
    factors: factors.sort((a, b) => b.points - a.points),
    recommendedPathway: tier === "complex" ? "intensive_monitoring" : tier === "management" ? "guided_self_management" : "preventive_wellness",
  }
}

// ══════════════════════════════════════════
// 2. Bundled Care Packages (C6.3)
// ══════════════════════════════════════════

export interface CarePackage {
  id: string
  condition: string
  title: { en: string; tr: string }
  description: { en: string; tr: string }
  tier: RiskTier
  color: string
  icon: string
  components: CareComponent[]
  weeklySchedule: WeeklyTask[]
  milestones: Milestone[]
}

export interface CareComponent {
  type: "supplement" | "nutrition" | "exercise" | "monitoring" | "ai_coaching" | "doctor_visit"
  title: { en: string; tr: string }
  frequency: string
  details: { en: string; tr: string }
  priority: "critical" | "important" | "recommended"
}

export interface WeeklyTask {
  day: number   // 0=Mon, 6=Sun
  tasks: { time: string; task: { en: string; tr: string }; type: string }[]
}

export interface Milestone {
  week: number
  target: { en: string; tr: string }
  metric?: string
  targetValue?: number
}

export const CARE_PACKAGES: CarePackage[] = [
  {
    id: "t2d_support",
    condition: "type2_diabetes",
    title: { en: "Type 2 Diabetes Support Package", tr: "Tip 2 Diyabet Destek Paketi" },
    description: { en: "Integrated blood sugar management with herbal support, nutrition, and monitoring", tr: "Bitkisel destek, beslenme ve takip ile entegre kan şekeri yönetimi" },
    tier: "management",
    color: "#F59E0B",
    icon: "Droplets",
    components: [
      { type: "supplement", title: { en: "Berberine Protocol", tr: "Berberin Protokolü" }, frequency: "3x daily with meals", details: { en: "500mg berberine with each main meal. Check interactions with metformin.", tr: "Her ana öğünle 500mg berberin. Metformin ile etkileşimi kontrol et." }, priority: "critical" },
      { type: "nutrition", title: { en: "Glycemic Index Guide", tr: "Glisemik İndeks Rehberi" }, frequency: "Every meal", details: { en: "Low-GI food choices, post-meal herbal tea (cinnamon+fenugreek)", tr: "Düşük GI gıda seçimleri, yemek sonrası bitki çayı (tarçın+çemen otu)" }, priority: "critical" },
      { type: "monitoring", title: { en: "Weekly HbA1c Trend", tr: "Haftalık HbA1c Trendi" }, frequency: "Weekly review", details: { en: "Track fasting glucose daily, HbA1c quarterly, AI trend analysis weekly", tr: "Açlık şekerini günlük, HbA1c'yi üç ayda bir, AI trend analizini haftalık takip et" }, priority: "critical" },
      { type: "exercise", title: { en: "Post-Meal Walk", tr: "Yemek Sonrası Yürüyüş" }, frequency: "After lunch & dinner", details: { en: "15-20 min walk within 30 min of eating. Reduces post-meal glucose spike by 30%.", tr: "Yemekten sonra 30 dk içinde 15-20 dk yürüyüş. Yemek sonrası şeker artışını %30 azaltır." }, priority: "important" },
      { type: "ai_coaching", title: { en: "AI Weekly Report", tr: "AI Haftalık Rapor" }, frequency: "Weekly", details: { en: "Personalized analysis: glucose patterns, supplement effectiveness, meal impact", tr: "Kişiselleştirilmiş analiz: şeker örüntüleri, takviye etkinliği, öğün etkisi" }, priority: "important" },
      { type: "doctor_visit", title: { en: "Quarterly Check-up", tr: "Üç Aylık Kontrol" }, frequency: "Every 3 months", details: { en: "HbA1c + kidney function + lipid panel. Share AI report with doctor.", tr: "HbA1c + böbrek fonksiyonu + lipit paneli. AI raporunu doktorla paylaş." }, priority: "critical" },
    ],
    weeklySchedule: [
      { day: 0, tasks: [
        { time: "08:00", task: { en: "Fasting glucose check", tr: "Açlık şekeri ölçümü" }, type: "monitoring" },
        { time: "08:30", task: { en: "Berberine + breakfast", tr: "Berberin + kahvaltı" }, type: "supplement" },
        { time: "13:00", task: { en: "Low-GI lunch + berberine", tr: "Düşük GI öğle + berberin" }, type: "nutrition" },
        { time: "13:30", task: { en: "Post-lunch walk 15min", tr: "Öğle sonrası yürüyüş 15dk" }, type: "exercise" },
        { time: "19:00", task: { en: "Dinner + berberine + cinnamon tea", tr: "Akşam yemeği + berberin + tarçın çayı" }, type: "supplement" },
      ]},
    ],
    milestones: [
      { week: 4, target: { en: "Fasting glucose < 130 mg/dL", tr: "Açlık şekeri < 130 mg/dL" }, metric: "fasting_glucose", targetValue: 130 },
      { week: 8, target: { en: "HbA1c reduction of 0.3%", tr: "HbA1c'de %0.3 düşüş" }, metric: "hba1c" },
      { week: 12, target: { en: "Stable glucose pattern, adherence > 90%", tr: "Stabil şeker örüntüsü, uyum > %90" } },
    ],
  },
  {
    id: "sleep_restoration",
    condition: "insomnia",
    title: { en: "Sleep Restoration Package", tr: "Uyku Restorasyon Paketi" },
    description: { en: "Evidence-based sleep optimization combining supplements, CBT-I techniques, and tracking", tr: "Takviyeler, BDT-I teknikleri ve takibi birleştiren kanıta dayalı uyku optimizasyonu" },
    tier: "management",
    color: "#818CF8",
    icon: "Moon",
    components: [
      { type: "supplement", title: { en: "Sleep Stack", tr: "Uyku Takviye Paketi" }, frequency: "Nightly", details: { en: "Magnesium glycinate 400mg + Valerian 300mg + Melatonin 0.5-1mg, 1h before bed", tr: "Magnezyum glisinat 400mg + Kediotu 300mg + Melatonin 0.5-1mg, yatmadan 1 saat önce" }, priority: "critical" },
      { type: "monitoring", title: { en: "Sleep Diary", tr: "Uyku Günlüğü" }, frequency: "Daily", details: { en: "Log bedtime, wake time, quality 1-5, wake count. AI analyzes weekly.", tr: "Yatış, kalkış saati, kalite 1-5, uyanma sayısı. AI haftalık analiz eder." }, priority: "critical" },
      { type: "exercise", title: { en: "Evening Wind-Down", tr: "Akşam Yavaşlama Rutini" }, frequency: "Nightly", details: { en: "No screens 1h before bed. 4-7-8 breathing. Dim lights at 21:00.", tr: "Yatmadan 1 saat önce ekran yok. 4-7-8 nefes. 21:00'da ışıkları kıs." }, priority: "important" },
      { type: "nutrition", title: { en: "Caffeine Cutoff", tr: "Kafein Kesim Saati" }, frequency: "Daily", details: { en: "No caffeine after 14:00. Replace with chamomile or rooibos tea.", tr: "14:00'dan sonra kafein yok. Papatya veya rooibos çayı ile değiştir." }, priority: "important" },
      { type: "ai_coaching", title: { en: "Weekly Sleep Analysis", tr: "Haftalık Uyku Analizi" }, frequency: "Weekly", details: { en: "Pattern detection, supplement timing optimization, CBT-I progress", tr: "Örüntü tespiti, takviye zamanlama optimizasyonu, BDT-I ilerlemesi" }, priority: "recommended" },
    ],
    weeklySchedule: [],
    milestones: [
      { week: 2, target: { en: "Sleep onset < 30 minutes", tr: "Uykuya dalma < 30 dakika" } },
      { week: 4, target: { en: "Sleep efficiency > 80%", tr: "Uyku verimliliği > %80" } },
      { week: 8, target: { en: "Consistent 7+ hours, quality ≥ 4/5", tr: "Tutarlı 7+ saat, kalite ≥ 4/5" } },
    ],
  },
  {
    id: "cv_prevention",
    condition: "cardiovascular_risk",
    title: { en: "Cardiovascular Prevention Package", tr: "Kardiyovasküler Önleme Paketi" },
    description: { en: "Heart health optimization with omega-3, anti-inflammatory diet, and vital monitoring", tr: "Omega-3, anti-inflamatuar beslenme ve yaşamsal takip ile kalp sağlığı optimizasyonu" },
    tier: "management",
    color: "#EF4444",
    icon: "Heart",
    components: [
      { type: "supplement", title: { en: "Omega-3 Protocol", tr: "Omega-3 Protokolü" }, frequency: "Daily with food", details: { en: "2g EPA+DHA with fattest meal. Check if on blood thinners.", tr: "En yağlı öğünle 2g EPA+DHA. Kan sulandırıcı kullanıyorsa kontrol et." }, priority: "critical" },
      { type: "monitoring", title: { en: "BP & Lipid Tracking", tr: "Tansiyon & Lipit Takibi" }, frequency: "BP daily, lipids quarterly", details: { en: "Morning BP before meds. Cholesterol panel every 3 months.", tr: "İlaçlardan önce sabah tansiyonu. 3 ayda bir kolesterol paneli." }, priority: "critical" },
      { type: "nutrition", title: { en: "Mediterranean Diet Guide", tr: "Akdeniz Diyeti Rehberi" }, frequency: "Every meal", details: { en: "Olive oil, fish 2x/week, nuts, whole grains. Limit sodium < 2g/day.", tr: "Zeytinyağı, haftada 2x balık, kuruyemiş, tam tahıl. Sodyum < 2g/gün." }, priority: "important" },
      { type: "exercise", title: { en: "Cardio Routine", tr: "Kardiyo Rutini" }, frequency: "5x per week", details: { en: "30 min moderate (brisk walk, cycling). Build to 150 min/week.", tr: "30 dk orta yoğunlukta (tempolu yürüyüş, bisiklet). Haftalık 150 dk'ya ulaş." }, priority: "important" },
      { type: "ai_coaching", title: { en: "CV Risk Trend", tr: "KV Risk Trendi" }, frequency: "Monthly", details: { en: "Framingham risk recalculation, supplement impact analysis", tr: "Framingham risk yeniden hesaplama, takviye etki analizi" }, priority: "recommended" },
    ],
    weeklySchedule: [],
    milestones: [
      { week: 4, target: { en: "BP consistently < 135/85", tr: "Tansiyon tutarlı < 135/85" } },
      { week: 8, target: { en: "Triglycerides reduced > 15%", tr: "Trigliserit > %15 azalma" } },
      { week: 12, target: { en: "LDL at target, exercise habit established", tr: "LDL hedefte, egzersiz alışkanlığı oturmuş" } },
    ],
  },
]

// ══════════════════════════════════════════
// 3. Clinical Variance Analysis (C6.2)
// ══════════════════════════════════════════

export type VarianceType = "supplement_missed" | "lab_spike" | "compliance_drop" | "symptom_increase" | "milestone_missed"
export type VarianceSeverity = "info" | "warning" | "critical"

export interface VarianceAlert {
  id: string
  userId: string
  type: VarianceType
  severity: VarianceSeverity
  title: { en: string; tr: string }
  description: { en: string; tr: string }
  detectedAt: string
  pathwayId: string
  suggestedAction: { en: string; tr: string }
  notifyDoctor: boolean
}

export function detectVariances(params: {
  complianceRate: number
  previousCompliance: number
  recentLabFlags: number
  previousLabFlags: number
  symptomSeverity: number
  previousSymptoms: number
  daysSinceLastSupplement: number
  pathwayId: string
  userId: string
}): VarianceAlert[] {
  const alerts: VarianceAlert[] = []
  const now = new Date().toISOString()

  // Supplement adherence drop
  if (params.daysSinceLastSupplement >= 3) {
    alerts.push({
      id: `var-${Date.now()}-supp`, userId: params.userId, type: "supplement_missed",
      severity: params.daysSinceLastSupplement >= 7 ? "critical" : "warning",
      title: { en: `${params.daysSinceLastSupplement} days without supplement`, tr: `${params.daysSinceLastSupplement} gündür takviye alınmadı` },
      description: { en: "Your care pathway includes daily supplements. Missing them may affect your progress.", tr: "Bakım yolunuz günlük takviye içeriyor. Atlamak ilerlemenizi etkileyebilir." },
      detectedAt: now, pathwayId: params.pathwayId,
      suggestedAction: { en: "Set a daily reminder or consider a simpler routine", tr: "Günlük hatırlatıcı kurun veya daha basit bir rutin düşünün" },
      notifyDoctor: params.daysSinceLastSupplement >= 7,
    })
  }

  // Lab value spike
  if (params.recentLabFlags > params.previousLabFlags + 1) {
    alerts.push({
      id: `var-${Date.now()}-lab`, userId: params.userId, type: "lab_spike",
      severity: "critical",
      title: { en: "Lab values worsening", tr: "Tahlil değerleri kötüleşiyor" },
      description: { en: `${params.recentLabFlags} abnormal values detected (was ${params.previousLabFlags}).`, tr: `${params.recentLabFlags} anormal değer tespit edildi (önceki: ${params.previousLabFlags}).` },
      detectedAt: now, pathwayId: params.pathwayId,
      suggestedAction: { en: "Schedule a doctor appointment to review changes", tr: "Değişiklikleri gözden geçirmek için doktor randevusu alın" },
      notifyDoctor: true,
    })
  }

  // Compliance drop
  if (params.complianceRate < params.previousCompliance - 20) {
    alerts.push({
      id: `var-${Date.now()}-comp`, userId: params.userId, type: "compliance_drop",
      severity: "warning",
      title: { en: "Adherence dropped significantly", tr: "Uyum önemli ölçüde düştü" },
      description: { en: `From ${params.previousCompliance}% to ${params.complianceRate}%.`, tr: `%${params.previousCompliance}'den %${params.complianceRate}'e düştü.` },
      detectedAt: now, pathwayId: params.pathwayId,
      suggestedAction: { en: "Let's identify barriers and simplify your routine", tr: "Engelleri belirleyelim ve rutininizi basitleştirelim" },
      notifyDoctor: params.complianceRate < 50,
    })
  }

  // Symptom increase
  if (params.symptomSeverity > params.previousSymptoms + 2) {
    alerts.push({
      id: `var-${Date.now()}-symp`, userId: params.userId, type: "symptom_increase",
      severity: params.symptomSeverity >= 8 ? "critical" : "warning",
      title: { en: "Symptoms worsening", tr: "Semptomlar kötüleşiyor" },
      description: { en: `Severity increased from ${params.previousSymptoms} to ${params.symptomSeverity}/10.`, tr: `Şiddet ${params.previousSymptoms}'den ${params.symptomSeverity}/10'a yükseldi.` },
      detectedAt: now, pathwayId: params.pathwayId,
      suggestedAction: { en: "Contact your doctor if symptoms persist", tr: "Semptomlar devam ederse doktorunuza başvurun" },
      notifyDoctor: params.symptomSeverity >= 8,
    })
  }

  return alerts
}

// ══════════════════════════════════════════
// Tier Configuration
// ══════════════════════════════════════════

export const TIER_CONFIG: Record<RiskTier, {
  label: { en: string; tr: string }
  color: string
  bgLight: string
  icon: string
  monitoring: { en: string; tr: string }
  checkInFrequency: string
}> = {
  wellness: {
    label: { en: "Wellness — Preventive", tr: "Wellness — Koruyucu" },
    color: "#22C55E", bgLight: "bg-green-50 dark:bg-green-950/20", icon: "Shield",
    monitoring: { en: "Quarterly check-ups, lifestyle optimization", tr: "Üç aylık kontroller, yaşam tarzı optimizasyonu" },
    checkInFrequency: "monthly",
  },
  management: {
    label: { en: "Management — Guided", tr: "Yönetim — Rehberli" },
    color: "#F59E0B", bgLight: "bg-amber-50 dark:bg-amber-950/20", icon: "Activity",
    monitoring: { en: "Monthly reviews, AI-guided self-management", tr: "Aylık gözden geçirmeler, AI rehberli öz yönetim" },
    checkInFrequency: "weekly",
  },
  complex: {
    label: { en: "Complex — Intensive", tr: "Karmaşık — Yoğun" },
    color: "#EF4444", bgLight: "bg-red-50 dark:bg-red-950/20", icon: "AlertTriangle",
    monitoring: { en: "Weekly monitoring, doctor coordination, variance alerts", tr: "Haftalık takip, doktor koordinasyonu, varyans uyarıları" },
    checkInFrequency: "daily",
  },
}
