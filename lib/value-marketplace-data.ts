// © 2026 Doctopal — All Rights Reserved
// ============================================
// Value-Based Payment & Marketplace — Data Layer
// ============================================

export interface SupplementProduct {
  id: string;
  name: string;
  nameTr: string;
  brand: string;
  category: string;
  categoryTr: string;
  // Value Score Components
  clinicalEfficacy: number;       // 0-100 from RCT data
  safetyProfile: number;          // 0-100 (fewer side effects = higher)
  patientOutcomeScore: number;    // 0-100 from PROMs data
  costPerQALY: number;            // cost per quality-adjusted life year (lower=better)
  valueScore: number;             // computed composite
  // Pricing
  standardPrice: number;          // regular price (TRY)
  valuePricingDiscount: number;   // % discount from value-based negotiation
  outcomeBasedPrice: number;      // price with outcome guarantee
  // Clinical Data
  evidenceGrade: "A" | "B" | "C";
  rctCount: number;
  successRate: number;            // % of users who achieved target outcome
  avgImprovementPercent: number;
  timeToEffect: string;           // e.g. "2-4 weeks"
  timeToEffectTr: string;
  // Outcome Guarantee
  guaranteeAvailable: boolean;
  guaranteeCriteria: string;
  guaranteeCriteriaTr: string;
  refundPercent: number;          // % refunded if no improvement
  escrowPeriod: number;           // days
  // Risk/Reward
  providerBonus: number;          // % bonus to provider if patient improves
  doctorCredit: number;           // credits to referring doctor on success
  // Display
  icon: string;                   // emoji
}

export interface EscrowAccount {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  productNameTr: string;
  totalAmount: number;
  heldAmount: number;
  releasedAmount: number;
  refundedAmount: number;
  status: "active" | "completed" | "refunded" | "partial_refund";
  startDate: string;
  evaluationDate: string;
  kpiTargets: Array<{
    metric: string;
    metricTr: string;
    baseline: number;
    target: number;
    actual?: number;
    met?: boolean;
    unit: string;
  }>;
  smartContractHash?: string;
}

export interface ValueScoreBreakdown {
  product: string;
  productTr: string;
  efficacy: number;
  safety: number;
  outcomes: number;
  costEfficiency: number;
  evidence: number;
  totalScore: number;
}

export interface RiskRewardTier {
  minSuccess: number;
  maxSuccess: number;
  bonusPercent: number;
  label: string;
  labelTr: string;
  badge?: string;
  color: string;
}

export interface ProviderLeaderboard {
  id: string;
  name: string;
  specialty: string;
  specialtyTr: string;
  successRate: number;
  patientsServed: number;
  bonusTier: string;
  badge?: string;
}

// ── Helper: compute value score ──────────────────
export function computeValueScore(
  efficacy: number,
  safety: number,
  outcomes: number,
  costPerQALY: number
): number {
  // Normalize cost: lower cost = higher score. Range ~500-5000 TRY/QALY
  const costNorm = Math.max(0, 100 - (costPerQALY / 50));
  const raw = efficacy * 0.4 + safety * 0.3 + outcomes * 0.2 + costNorm * 0.1;
  return Math.round(Math.min(100, Math.max(0, raw)));
}

// ── Mock Products ────────────────────────────────
export const SUPPLEMENT_PRODUCTS: SupplementProduct[] = [
  {
    id: "curcumin-bcm95",
    name: "Curcumin BCM-95",
    nameTr: "Kurkumin BCM-95",
    brand: "DolCas Biotech",
    category: "Anti-inflammatory",
    categoryTr: "Anti-inflamatuar",
    clinicalEfficacy: 82,
    safetyProfile: 90,
    patientOutcomeScore: 78,
    costPerQALY: 1200,
    valueScore: 0,
    standardPrice: 349,
    valuePricingDiscount: 18,
    outcomeBasedPrice: 299,
    evidenceGrade: "A",
    rctCount: 47,
    successRate: 76,
    avgImprovementPercent: 34,
    timeToEffect: "4-8 weeks",
    timeToEffectTr: "4-8 hafta",
    guaranteeAvailable: true,
    guaranteeCriteria: "CRP levels decrease by ≥20% within 8 weeks",
    guaranteeCriteriaTr: "CRP seviyeleri 8 hafta icinde ≥%20 azalma",
    refundPercent: 80,
    escrowPeriod: 60,
    providerBonus: 10,
    doctorCredit: 50,
    icon: "🟡",
  },
  {
    id: "ashwagandha-ksm66",
    name: "Ashwagandha KSM-66",
    nameTr: "Ashwagandha KSM-66",
    brand: "Ixoreal Biomed",
    category: "Adaptogen / Stress",
    categoryTr: "Adaptogen / Stres",
    clinicalEfficacy: 85,
    safetyProfile: 88,
    patientOutcomeScore: 82,
    costPerQALY: 900,
    valueScore: 0,
    standardPrice: 279,
    valuePricingDiscount: 22,
    outcomeBasedPrice: 239,
    evidenceGrade: "A",
    rctCount: 38,
    successRate: 81,
    avgImprovementPercent: 41,
    timeToEffect: "4-6 weeks",
    timeToEffectTr: "4-6 hafta",
    guaranteeAvailable: true,
    guaranteeCriteria: "Perceived stress score (PSS) decrease ≥30% in 6 weeks",
    guaranteeCriteriaTr: "Algilanan stres skoru (PSS) 6 haftada ≥%30 azalma",
    refundPercent: 85,
    escrowPeriod: 45,
    providerBonus: 12,
    doctorCredit: 60,
    icon: "🌿",
  },
  {
    id: "berberine-hcl",
    name: "Berberine HCl",
    nameTr: "Berberin HCl",
    brand: "Thorne Research",
    category: "Metabolic / Blood Sugar",
    categoryTr: "Metabolik / Kan Sekeri",
    clinicalEfficacy: 88,
    safetyProfile: 82,
    patientOutcomeScore: 84,
    costPerQALY: 800,
    valueScore: 0,
    standardPrice: 399,
    valuePricingDiscount: 20,
    outcomeBasedPrice: 339,
    evidenceGrade: "A",
    rctCount: 52,
    successRate: 79,
    avgImprovementPercent: 28,
    timeToEffect: "8-12 weeks",
    timeToEffectTr: "8-12 hafta",
    guaranteeAvailable: true,
    guaranteeCriteria: "Fasting blood glucose decrease ≥15% within 12 weeks",
    guaranteeCriteriaTr: "Aclik kan sekeri 12 haftada ≥%15 azalma",
    refundPercent: 75,
    escrowPeriod: 90,
    providerBonus: 12,
    doctorCredit: 70,
    icon: "🔴",
  },
  {
    id: "omega3-epa-dha",
    name: "Omega-3 EPA/DHA",
    nameTr: "Omega-3 EPA/DHA",
    brand: "Nordic Naturals",
    category: "Cardiovascular",
    categoryTr: "Kardiyovaskuler",
    clinicalEfficacy: 90,
    safetyProfile: 95,
    patientOutcomeScore: 86,
    costPerQALY: 700,
    valueScore: 0,
    standardPrice: 449,
    valuePricingDiscount: 15,
    outcomeBasedPrice: 399,
    evidenceGrade: "A",
    rctCount: 124,
    successRate: 83,
    avgImprovementPercent: 31,
    timeToEffect: "8-12 weeks",
    timeToEffectTr: "8-12 hafta",
    guaranteeAvailable: true,
    guaranteeCriteria: "Triglycerides decrease ≥25% within 12 weeks",
    guaranteeCriteriaTr: "Trigliseritler 12 haftada ≥%25 azalma",
    refundPercent: 80,
    escrowPeriod: 90,
    providerBonus: 10,
    doctorCredit: 55,
    icon: "🐟",
  },
  {
    id: "magnesium-glycinate",
    name: "Magnesium Glycinate",
    nameTr: "Magnezyum Glisinat",
    brand: "Pure Encapsulations",
    category: "Sleep / Muscle",
    categoryTr: "Uyku / Kas",
    clinicalEfficacy: 78,
    safetyProfile: 96,
    patientOutcomeScore: 80,
    costPerQALY: 600,
    valueScore: 0,
    standardPrice: 229,
    valuePricingDiscount: 12,
    outcomeBasedPrice: 209,
    evidenceGrade: "A",
    rctCount: 31,
    successRate: 77,
    avgImprovementPercent: 26,
    timeToEffect: "2-4 weeks",
    timeToEffectTr: "2-4 hafta",
    guaranteeAvailable: true,
    guaranteeCriteria: "Sleep quality score (PSQI) improves ≥3 points in 4 weeks",
    guaranteeCriteriaTr: "Uyku kalitesi skoru (PSQI) 4 haftada ≥3 puan iyilesme",
    refundPercent: 85,
    escrowPeriod: 30,
    providerBonus: 8,
    doctorCredit: 40,
    icon: "💊",
  },
  {
    id: "vitamin-d3-k2",
    name: "Vitamin D3 + K2",
    nameTr: "D3 Vitamini + K2",
    brand: "Sports Research",
    category: "Bone / Immune",
    categoryTr: "Kemik / Bagisiklik",
    clinicalEfficacy: 86,
    safetyProfile: 94,
    patientOutcomeScore: 81,
    costPerQALY: 500,
    valueScore: 0,
    standardPrice: 199,
    valuePricingDiscount: 10,
    outcomeBasedPrice: 179,
    evidenceGrade: "A",
    rctCount: 89,
    successRate: 85,
    avgImprovementPercent: 45,
    timeToEffect: "4-8 weeks",
    timeToEffectTr: "4-8 hafta",
    guaranteeAvailable: true,
    guaranteeCriteria: "25-OH Vitamin D level reaches ≥30 ng/mL within 8 weeks",
    guaranteeCriteriaTr: "25-OH D Vitamini seviyesi 8 haftada ≥30 ng/mL'ye ulasmasi",
    refundPercent: 90,
    escrowPeriod: 60,
    providerBonus: 8,
    doctorCredit: 45,
    icon: "☀️",
  },
  {
    id: "probiotics-50b",
    name: "Probiotics 50B CFU",
    nameTr: "Probiyotikler 50B CFU",
    brand: "Culturelle",
    category: "Gut Health",
    categoryTr: "Bagirsak Sagligi",
    clinicalEfficacy: 74,
    safetyProfile: 92,
    patientOutcomeScore: 76,
    costPerQALY: 1400,
    valueScore: 0,
    standardPrice: 319,
    valuePricingDiscount: 15,
    outcomeBasedPrice: 279,
    evidenceGrade: "B",
    rctCount: 28,
    successRate: 72,
    avgImprovementPercent: 29,
    timeToEffect: "2-4 weeks",
    timeToEffectTr: "2-4 hafta",
    guaranteeAvailable: true,
    guaranteeCriteria: "GI symptom score improves ≥40% within 4 weeks",
    guaranteeCriteriaTr: "GI semptom skoru 4 haftada ≥%40 iyilesme",
    refundPercent: 75,
    escrowPeriod: 30,
    providerBonus: 8,
    doctorCredit: 35,
    icon: "🦠",
  },
  {
    id: "quercetin-phytosome",
    name: "Quercetin Phytosome",
    nameTr: "Kuersetin Fitozom",
    brand: "Thorne Research",
    category: "Allergy / Immune",
    categoryTr: "Alerji / Bagisiklik",
    clinicalEfficacy: 72,
    safetyProfile: 91,
    patientOutcomeScore: 70,
    costPerQALY: 1600,
    valueScore: 0,
    standardPrice: 289,
    valuePricingDiscount: 14,
    outcomeBasedPrice: 259,
    evidenceGrade: "B",
    rctCount: 19,
    successRate: 68,
    avgImprovementPercent: 24,
    timeToEffect: "2-4 weeks",
    timeToEffectTr: "2-4 hafta",
    guaranteeAvailable: false,
    guaranteeCriteria: "Allergy symptom frequency reduced by ≥30%",
    guaranteeCriteriaTr: "Alerji semptom sikligi ≥%30 azalma",
    refundPercent: 0,
    escrowPeriod: 0,
    providerBonus: 6,
    doctorCredit: 30,
    icon: "🌸",
  },
  {
    id: "lions-mane",
    name: "Lion's Mane Extract",
    nameTr: "Aslan Yelesi Ekstresi",
    brand: "Real Mushrooms",
    category: "Cognitive / Neuro",
    categoryTr: "Bilissel / Norolojik",
    clinicalEfficacy: 70,
    safetyProfile: 93,
    patientOutcomeScore: 72,
    costPerQALY: 1800,
    valueScore: 0,
    standardPrice: 359,
    valuePricingDiscount: 16,
    outcomeBasedPrice: 319,
    evidenceGrade: "B",
    rctCount: 14,
    successRate: 65,
    avgImprovementPercent: 22,
    timeToEffect: "4-8 weeks",
    timeToEffectTr: "4-8 hafta",
    guaranteeAvailable: false,
    guaranteeCriteria: "Cognitive assessment score improves ≥15%",
    guaranteeCriteriaTr: "Bilissel değerlendirme skoru ≥%15 iyilesme",
    refundPercent: 0,
    escrowPeriod: 0,
    providerBonus: 6,
    doctorCredit: 30,
    icon: "🍄",
  },
  {
    id: "rhodiola-shr5",
    name: "Rhodiola Rosea SHR-5",
    nameTr: "Rhodiola Rosea SHR-5",
    brand: "Integrative Therapeutics",
    category: "Energy / Adaptogen",
    categoryTr: "Enerji / Adaptogen",
    clinicalEfficacy: 76,
    safetyProfile: 89,
    patientOutcomeScore: 74,
    costPerQALY: 1100,
    valueScore: 0,
    standardPrice: 269,
    valuePricingDiscount: 18,
    outcomeBasedPrice: 229,
    evidenceGrade: "B",
    rctCount: 22,
    successRate: 71,
    avgImprovementPercent: 27,
    timeToEffect: "1-3 weeks",
    timeToEffectTr: "1-3 hafta",
    guaranteeAvailable: true,
    guaranteeCriteria: "Fatigue severity scale reduces ≥25% in 4 weeks",
    guaranteeCriteriaTr: "Yorgunluk siddet olcegi 4 haftada ≥%25 azalma",
    refundPercent: 70,
    escrowPeriod: 30,
    providerBonus: 8,
    doctorCredit: 40,
    icon: "⚡",
  },
  {
    id: "coq10-ubiquinol",
    name: "Coenzyme Q10 Ubiquinol",
    nameTr: "Koenzim Q10 Ubiquinol",
    brand: "Jarrow Formulas",
    category: "Heart / Energy",
    categoryTr: "Kalp / Enerji",
    clinicalEfficacy: 80,
    safetyProfile: 94,
    patientOutcomeScore: 77,
    costPerQALY: 1300,
    valueScore: 0,
    standardPrice: 429,
    valuePricingDiscount: 14,
    outcomeBasedPrice: 379,
    evidenceGrade: "A",
    rctCount: 35,
    successRate: 74,
    avgImprovementPercent: 20,
    timeToEffect: "4-12 weeks",
    timeToEffectTr: "4-12 hafta",
    guaranteeAvailable: true,
    guaranteeCriteria: "Exercise tolerance improves by ≥20% in 12 weeks",
    guaranteeCriteriaTr: "Egzersiz toleransi 12 haftada ≥%20 iyilesme",
    refundPercent: 75,
    escrowPeriod: 90,
    providerBonus: 10,
    doctorCredit: 50,
    icon: "❤️",
  },
  {
    id: "milk-thistle-silymarin",
    name: "Milk Thistle Silymarin",
    nameTr: "Deve Dikeni Silimarin",
    brand: "Nature's Way",
    category: "Liver Support",
    categoryTr: "Karaciger Destegi",
    clinicalEfficacy: 75,
    safetyProfile: 91,
    patientOutcomeScore: 73,
    costPerQALY: 1000,
    valueScore: 0,
    standardPrice: 219,
    valuePricingDiscount: 12,
    outcomeBasedPrice: 199,
    evidenceGrade: "B",
    rctCount: 26,
    successRate: 70,
    avgImprovementPercent: 25,
    timeToEffect: "4-8 weeks",
    timeToEffectTr: "4-8 hafta",
    guaranteeAvailable: true,
    guaranteeCriteria: "ALT/AST levels improve ≥20% within 8 weeks",
    guaranteeCriteriaTr: "ALT/AST seviyeleri 8 haftada ≥%20 iyilesme",
    refundPercent: 70,
    escrowPeriod: 60,
    providerBonus: 8,
    doctorCredit: 40,
    icon: "🌱",
  },
];

// Compute value scores
SUPPLEMENT_PRODUCTS.forEach((p) => {
  p.valueScore = computeValueScore(
    p.clinicalEfficacy,
    p.safetyProfile,
    p.patientOutcomeScore,
    p.costPerQALY
  );
});

// ── Sample Escrow Accounts ───────────────────────
export const SAMPLE_ESCROW: EscrowAccount[] = [
  {
    id: "esc-001",
    userId: "user-demo",
    productId: "omega3-epa-dha",
    productName: "Omega-3 EPA/DHA",
    productNameTr: "Omega-3 EPA/DHA",
    totalAmount: 399,
    heldAmount: 399,
    releasedAmount: 0,
    refundedAmount: 0,
    status: "active",
    startDate: "2026-02-15",
    evaluationDate: "2026-05-15",
    kpiTargets: [
      { metric: "Triglycerides", metricTr: "Trigliseritler", baseline: 220, target: 165, unit: "mg/dL" },
      { metric: "HDL Cholesterol", metricTr: "HDL Kolesterol", baseline: 42, target: 50, unit: "mg/dL" },
    ],
    smartContractHash: "0x7a3f...b9c2e1d8",
  },
  {
    id: "esc-002",
    userId: "user-demo",
    productId: "ashwagandha-ksm66",
    productName: "Ashwagandha KSM-66",
    productNameTr: "Ashwagandha KSM-66",
    totalAmount: 239,
    heldAmount: 0,
    releasedAmount: 239,
    refundedAmount: 0,
    status: "completed",
    startDate: "2025-12-01",
    evaluationDate: "2026-01-15",
    kpiTargets: [
      { metric: "Perceived Stress Score", metricTr: "Algilanan Stres Skoru", baseline: 28, target: 19, actual: 16, met: true, unit: "pts" },
      { metric: "Cortisol (morning)", metricTr: "Kortizol (sabah)", baseline: 24, target: 18, actual: 17, met: true, unit: "mcg/dL" },
    ],
    smartContractHash: "0x3e8d...a1f5c742",
  },
  {
    id: "esc-003",
    userId: "user-demo",
    productId: "berberine-hcl",
    productName: "Berberine HCl",
    productNameTr: "Berberin HCl",
    totalAmount: 339,
    heldAmount: 0,
    releasedAmount: 170,
    refundedAmount: 169,
    status: "partial_refund",
    startDate: "2025-11-01",
    evaluationDate: "2026-01-30",
    kpiTargets: [
      { metric: "Fasting Glucose", metricTr: "Aclik Glukoz", baseline: 130, target: 110, actual: 118, met: false, unit: "mg/dL" },
      { metric: "HbA1c", metricTr: "HbA1c", baseline: 6.8, target: 6.2, actual: 6.3, met: false, unit: "%" },
    ],
    smartContractHash: "0x9b1c...d4e7f083",
  },
];

// ── Value Score Rankings (pre-computed) ──────────
export const VALUE_SCORE_RANKINGS: ValueScoreBreakdown[] = SUPPLEMENT_PRODUCTS
  .map((p) => ({
    product: p.name,
    productTr: p.nameTr,
    efficacy: p.clinicalEfficacy,
    safety: p.safetyProfile,
    outcomes: p.patientOutcomeScore,
    costEfficiency: Math.round(100 - p.costPerQALY / 50),
    evidence: p.evidenceGrade === "A" ? 95 : p.evidenceGrade === "B" ? 70 : 45,
    totalScore: p.valueScore,
  }))
  .sort((a, b) => b.totalScore - a.totalScore);

// ── Risk/Reward Tiers ────────────────────────────
export const RISK_REWARD_TIERS: RiskRewardTier[] = [
  { minSuccess: 0, maxSuccess: 70, bonusPercent: 0, label: "Standard", labelTr: "Standart", color: "#6b7280" },
  { minSuccess: 70, maxSuccess: 80, bonusPercent: 5, label: "Bronze Provider", labelTr: "Bronz Saglayici", color: "#cd7f32" },
  { minSuccess: 80, maxSuccess: 90, bonusPercent: 10, label: "Silver Provider", labelTr: "Gumus Saglayici", color: "#94a3b8", badge: "🥈" },
  { minSuccess: 90, maxSuccess: 100, bonusPercent: 15, label: "Gold Provider", labelTr: "Altin Saglayici", color: "#eab308", badge: "🏆" },
];

// ── Provider Leaderboard ─────────────────────────
// Provider leaderboard — will be populated from real provider data in production
export const PROVIDER_LEADERBOARD: ProviderLeaderboard[] = [];
