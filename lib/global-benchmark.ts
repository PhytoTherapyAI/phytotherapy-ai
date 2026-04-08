// © 2026 DoctoPal — All Rights Reserved
// ============================================
// Global Health Benchmarking — Harvard HVHS
// G20+ country data + cross-learning + simulation
// ============================================

// ── HVHS 10 Components (standardized 1-3 scoring) ──
export const HVHS_COMPONENTS = [
  { id: "cost", label: { en: "Cost Efficiency", tr: "Maliyet Verimliliği" }, short: { en: "Cost", tr: "Maliyet" } },
  { id: "outcomes", label: { en: "Health Outcomes", tr: "Sağlık Sonuçları" }, short: { en: "Outcomes", tr: "Sonuçlar" } },
  { id: "analytics", label: { en: "Data & Analytics", tr: "Veri & Analitik" }, short: { en: "Analytics", tr: "Analitik" } },
  { id: "integration", label: { en: "Care Integration", tr: "Bakım Entegrasyonu" }, short: { en: "Integration", tr: "Entegrasyon" } },
  { id: "prevention", label: { en: "Prevention", tr: "Önleme" }, short: { en: "Prevention", tr: "Önleme" } },
  { id: "access", label: { en: "Access & Equity", tr: "Erişim & Eşitlik" }, short: { en: "Access", tr: "Erişim" } },
  { id: "digital", label: { en: "Digital Health", tr: "Dijital Sağlık" }, short: { en: "Digital", tr: "Dijital" } },
  { id: "patient_voice", label: { en: "Patient Voice", tr: "Hasta Sesi" }, short: { en: "Patient", tr: "Hasta" } },
  { id: "workforce", label: { en: "Workforce", tr: "İş Gücü" }, short: { en: "Workforce", tr: "İş Gücü" } },
  { id: "innovation", label: { en: "Innovation", tr: "İnovasyon" }, short: { en: "Innovation", tr: "İnovasyon" } },
] as const

export type HVHSComponentId = typeof HVHS_COMPONENTS[number]["id"]

// ── Country Health Profiles ──
export interface CountryProfile {
  code: string
  name: { en: string; tr: string }
  flag: string
  region: string
  scores: Record<HVHSComponentId, number>  // 1.0-3.0
  overallScore: number
  strengths: { en: string; tr: string }[]
  caseStudy?: {
    title: { en: string; tr: string }
    description: { en: string; tr: string }
    impact: { en: string; tr: string }
    condition?: string
  }
}

export const COUNTRIES: CountryProfile[] = [
  {
    code: "SG", name: { en: "Singapore", tr: "Singapur" }, flag: "🇸🇬", region: "Asia-Pacific",
    scores: { cost: 2.8, outcomes: 2.9, analytics: 2.7, integration: 2.8, prevention: 2.9, access: 2.6, digital: 2.9, patient_voice: 2.3, workforce: 2.5, innovation: 2.7 },
    overallScore: 2.71,
    strengths: [{ en: "Healthier SG: preventive care integration", tr: "Healthier SG: koruyucu bakım entegrasyonu" }, { en: "World's lowest diabetes complication rate", tr: "Dünyanın en düşük diyabet komplikasyon oranı" }],
    caseStudy: { title: { en: "Healthier SG Programme", tr: "Healthier SG Programı" }, description: { en: "Every citizen assigned a family doctor. Preventive care incentivized. Chronic disease management integrated with community health.", tr: "Her vatandaşa bir aile hekimi atanır. Koruyucu bakım teşvik edilir. Kronik hastalık yönetimi toplum sağlığıyla entegre." }, impact: { en: "30% reduction in preventable hospitalizations", tr: "Önlenebilir hastane yatışlarında %30 azalma" }, condition: "diabetes" },
  },
  {
    code: "NL", name: { en: "Netherlands", tr: "Hollanda" }, flag: "🇳🇱", region: "Europe",
    scores: { cost: 2.2, outcomes: 2.6, analytics: 2.5, integration: 2.7, prevention: 2.4, access: 2.8, digital: 2.6, patient_voice: 2.7, workforce: 2.4, innovation: 2.5 },
    overallScore: 2.54,
    strengths: [{ en: "Diabeter: specialized pediatric diabetes network", tr: "Diabeter: uzmanlaşmış pediatrik diyabet ağı" }, { en: "Strong patient participation in care design", tr: "Bakım tasarımında güçlü hasta katılımı" }],
    caseStudy: { title: { en: "Diabeter Network", tr: "Diabeter Ağı" }, description: { en: "Specialized centers for Type 1 diabetes in children. Telemedicine + continuous glucose monitoring + peer support.", tr: "Çocuklarda Tip 1 diyabet için uzmanlaşmış merkezler. Telemedisin + sürekli şeker takibi + akran desteği." }, impact: { en: "HbA1c average 7.1% (vs 8.2% national)", tr: "HbA1c ortalaması %7.1 (ulusal %8.2'ye karşı)" }, condition: "diabetes" },
  },
  {
    code: "AU", name: { en: "Australia", tr: "Avustralya" }, flag: "🇦🇺", region: "Asia-Pacific",
    scores: { cost: 2.1, outcomes: 2.5, analytics: 2.4, integration: 2.3, prevention: 2.6, access: 2.4, digital: 2.5, patient_voice: 2.6, workforce: 2.3, innovation: 2.4 },
    overallScore: 2.41,
    strengths: [{ en: "My Health Record: national digital health infrastructure", tr: "My Health Record: ulusal dijital sağlık altyapısı" }],
  },
  {
    code: "FR", name: { en: "France", tr: "Fransa" }, flag: "🇫🇷", region: "Europe",
    scores: { cost: 2.0, outcomes: 2.7, analytics: 2.2, integration: 2.4, prevention: 2.3, access: 2.9, digital: 2.1, patient_voice: 2.2, workforce: 2.6, innovation: 2.3 },
    overallScore: 2.37,
    strengths: [{ en: "Universal access with low out-of-pocket costs", tr: "Düşük cepten harcamayla evrensel erişim" }],
  },
  {
    code: "IT", name: { en: "Italy", tr: "İtalya" }, flag: "🇮🇹", region: "Europe",
    scores: { cost: 2.3, outcomes: 2.6, analytics: 2.0, integration: 2.2, prevention: 2.5, access: 2.5, digital: 1.9, patient_voice: 2.1, workforce: 2.2, innovation: 2.1 },
    overallScore: 2.24,
    strengths: [{ en: "Mediterranean diet integration in public health", tr: "Halk sağlığında Akdeniz diyeti entegrasyonu" }, { en: "CV mortality lowest in Europe", tr: "Avrupa'nın en düşük KV mortalitesi" }],
    caseStudy: { title: { en: "Mediterranean CV Prevention", tr: "Akdeniz KV Önleme" }, description: { en: "National dietary guidelines promoting olive oil, fish, whole grains. Integrated into school meals and hospital food.", tr: "Zeytinyağı, balık, tam tahıl teşvik eden ulusal beslenme kılavuzları. Okul yemekleri ve hastane yemeğine entegre." }, impact: { en: "40% lower cardiovascular events vs Northern Europe", tr: "Kuzey Avrupa'ya göre %40 daha az kardiyovasküler olay" }, condition: "cardiovascular" },
  },
  {
    code: "JP", name: { en: "Japan", tr: "Japonya" }, flag: "🇯🇵", region: "Asia-Pacific",
    scores: { cost: 2.4, outcomes: 2.8, analytics: 2.3, integration: 2.5, prevention: 2.7, access: 2.7, digital: 2.2, patient_voice: 2.0, workforce: 2.3, innovation: 2.6 },
    overallScore: 2.45,
    strengths: [{ en: "Highest life expectancy globally", tr: "Küresel en yüksek yaşam beklentisi" }, { en: "Kampo: integrated traditional medicine", tr: "Kampo: entegre geleneksel tıp" }],
    caseStudy: { title: { en: "Kampo Integration", tr: "Kampo Entegrasyonu" }, description: { en: "Traditional herbal medicine (Kampo) covered by national insurance. 148 standardized formulas prescribed by MDs.", tr: "Geleneksel bitkisel tıp (Kampo) ulusal sigorta kapsamında. 148 standartlaştırılmış formül doktorlar tarafından reçete edilir." }, impact: { en: "70% of physicians prescribe Kampo alongside modern medicine", tr: "Doktorların %70'i modern tıpla birlikte Kampo reçete eder" }, condition: "integrative" },
  },
  {
    code: "TR", name: { en: "Turkey", tr: "Türkiye" }, flag: "🇹🇷", region: "Europe/MENA",
    scores: { cost: 2.0, outcomes: 2.1, analytics: 1.8, integration: 1.7, prevention: 1.9, access: 2.3, digital: 2.0, patient_voice: 1.6, workforce: 2.0, innovation: 1.8 },
    overallScore: 1.92,
    strengths: [{ en: "e-Nabız: comprehensive national health record", tr: "e-Nabız: kapsamlı ulusal sağlık kaydı" }, { en: "Rapid digital health transformation", tr: "Hızlı dijital sağlık dönüşümü" }],
  },
  {
    code: "DE", name: { en: "Germany", tr: "Almanya" }, flag: "🇩🇪", region: "Europe",
    scores: { cost: 1.9, outcomes: 2.4, analytics: 2.3, integration: 2.1, prevention: 2.2, access: 2.7, digital: 2.3, patient_voice: 2.4, workforce: 2.5, innovation: 2.6 },
    overallScore: 2.34,
    strengths: [{ en: "Commission E: evidence-based herbal medicine monographs", tr: "Komisyon E: kanıta dayalı bitkisel tıp monografları" }],
  },
  {
    code: "KR", name: { en: "South Korea", tr: "Güney Kore" }, flag: "🇰🇷", region: "Asia-Pacific",
    scores: { cost: 2.5, outcomes: 2.5, analytics: 2.6, integration: 2.3, prevention: 2.4, access: 2.6, digital: 2.8, patient_voice: 2.1, workforce: 2.2, innovation: 2.7 },
    overallScore: 2.47,
    strengths: [{ en: "Digital health pioneer, AI diagnostics leader", tr: "Dijital sağlık öncüsü, AI tanılama lideri" }],
  },
]

// ── Global averages ──
export function calculateGlobalAverage(): Record<HVHSComponentId, number> {
  const avg: Record<string, number> = {}
  HVHS_COMPONENTS.forEach(c => {
    const sum = COUNTRIES.reduce((s, country) => s + country.scores[c.id], 0)
    avg[c.id] = parseFloat((sum / COUNTRIES.length).toFixed(2))
  })
  return avg as Record<HVHSComponentId, number>
}

// ── Simulation Engine ──
export interface SimulationResult {
  countryModel: string
  currentScore: number
  projectedScore: number
  improvement: number
  improvementPercent: number
  timeframe: string
  recommendations: { en: string; tr: string }[]
}

export function simulateImprovement(userScores: Record<HVHSComponentId, number>, targetCountryCode: string): SimulationResult | null {
  const target = COUNTRIES.find(c => c.code === targetCountryCode)
  if (!target) return null

  const userOverall = Object.values(userScores).reduce((s, v) => s + v, 0) / 10
  const gapComponents = HVHS_COMPONENTS
    .map(c => ({ id: c.id, gap: target.scores[c.id] - userScores[c.id] }))
    .filter(g => g.gap > 0.3)
    .sort((a, b) => b.gap - a.gap)

  const potentialImprovement = gapComponents.slice(0, 3).reduce((s, g) => s + g.gap * 0.4, 0) / 10
  const projected = Math.min(3.0, userOverall + potentialImprovement)

  return {
    countryModel: targetCountryCode,
    currentScore: parseFloat(userOverall.toFixed(2)),
    projectedScore: parseFloat(projected.toFixed(2)),
    improvement: parseFloat(potentialImprovement.toFixed(2)),
    improvementPercent: Math.round((potentialImprovement / userOverall) * 100),
    timeframe: "6 months",
    recommendations: gapComponents.slice(0, 3).map(g => {
      const comp = HVHS_COMPONENTS.find(c => c.id === g.id)!
      return {
        en: `Improve ${comp.label.en} (gap: ${g.gap.toFixed(1)} points) — follow ${target.name.en} model`,
        tr: `${comp.label.tr} iyileştir (fark: ${g.gap.toFixed(1)} puan) — ${target.name.tr} modelini takip et`,
      }
    }),
  }
}

// ── Cross-Learning: find best practices for user's weak areas ──
export function findCrossLearning(userScores: Record<HVHSComponentId, number>): { component: string; bestCountry: CountryProfile; gap: number }[] {
  return HVHS_COMPONENTS
    .map(comp => {
      const best = COUNTRIES.reduce((prev, curr) => curr.scores[comp.id] > prev.scores[comp.id] ? curr : prev)
      return { component: comp.id, bestCountry: best, gap: best.scores[comp.id] - userScores[comp.id] }
    })
    .filter(r => r.gap > 0.3)
    .sort((a, b) => b.gap - a.gap)
}
