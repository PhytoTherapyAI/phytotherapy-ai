// © 2026 DoctoPal — All Rights Reserved
// Longevity-optimal biomarker ranges (3-tier: standard, optimal, longevity)

export interface BiomarkerRange {
  id: string; name: string; nametr: string; unit: string; emoji: string
  category: "metabolism" | "heart" | "inflammation" | "thyroid" | "liver" | "kidney" | "nutrients"
  standardRange: [number, number]
  optimalRange: [number, number]
  longevityRange: [number, number]
  improvementTips: { tip: string; tipTr: string; evidence: "A" | "B" | "C" }[]
}

export const LONGEVITY_RANGES: BiomarkerRange[] = [
  { id: "hba1c", name: "HbA1c", nametr: "HbA1c", unit: "%", emoji: "🍬", category: "metabolism",
    standardRange: [4.0, 5.7], optimalRange: [4.2, 5.2], longevityRange: [4.5, 5.0],
    improvementTips: [
      { tip: "Berberine 500mg 2x/day — shown to lower HbA1c by 0.5-1.0%", tipTr: "Berberin 500mg 2x/gün — HbA1c'yi %0.5-1.0 düşürdüğü gösterilmiş", evidence: "A" },
      { tip: "Reduce refined carbs, increase fiber intake", tipTr: "Rafine karbonhidratları azaltın, lif alımını artırın", evidence: "A" },
    ]},
  { id: "glucose", name: "Fasting Glucose", nametr: "Açlık Glukozu", unit: "mg/dL", emoji: "🩸", category: "metabolism",
    standardRange: [70, 100], optimalRange: [72, 90], longevityRange: [75, 85],
    improvementTips: [
      { tip: "Cinnamon extract 1g/day — modest glucose-lowering effect", tipTr: "Tarçın ekstresi 1g/gün — orta düzeyde glukoz düşürücü etki", evidence: "B" },
    ]},
  { id: "insulin", name: "Fasting Insulin", nametr: "Açlık İnsülini", unit: "µIU/mL", emoji: "💉", category: "metabolism",
    standardRange: [2.6, 24.9], optimalRange: [2.6, 8.0], longevityRange: [2.6, 5.0],
    improvementTips: [
      { tip: "Time-restricted eating (16:8) — reduces fasting insulin", tipTr: "Zaman kısıtlı beslenme (16:8) — açlık insülini azaltır", evidence: "A" },
    ]},
  { id: "ldl", name: "LDL Cholesterol", nametr: "LDL Kolesterol", unit: "mg/dL", emoji: "🫀", category: "heart",
    standardRange: [0, 130], optimalRange: [0, 100], longevityRange: [0, 70],
    improvementTips: [
      { tip: "Red Yeast Rice 1200mg/day — lowers LDL 15-25%", tipTr: "Kırmızı Maya Pirinci 1200mg/gün — LDL'yi %15-25 düşürür", evidence: "A" },
      { tip: "Plant sterols 2g/day with meals", tipTr: "Bitki sterolleri 2g/gün yemeklerle", evidence: "A" },
    ]},
  { id: "apob", name: "ApoB", nametr: "ApoB", unit: "mg/dL", emoji: "❤️", category: "heart",
    standardRange: [0, 130], optimalRange: [0, 90], longevityRange: [0, 60],
    improvementTips: [
      { tip: "Omega-3 2000mg EPA+DHA daily", tipTr: "Omega-3 2000mg EPA+DHA günlük", evidence: "A" },
    ]},
  { id: "triglycerides", name: "Triglycerides", nametr: "Trigliseritler", unit: "mg/dL", emoji: "🔥", category: "heart",
    standardRange: [0, 150], optimalRange: [0, 100], longevityRange: [0, 70],
    improvementTips: [
      { tip: "Omega-3 fish oil 2-4g/day — reduces triglycerides 15-30%", tipTr: "Omega-3 balık yağı 2-4g/gün — trigliseritleri %15-30 düşürür", evidence: "A" },
    ]},
  { id: "hscrp", name: "hs-CRP", nametr: "hs-CRP", unit: "mg/L", emoji: "🔥", category: "inflammation",
    standardRange: [0, 3.0], optimalRange: [0, 1.0], longevityRange: [0, 0.5],
    improvementTips: [
      { tip: "Turmeric/Curcumin 500mg 2x/day — significant CRP reduction", tipTr: "Zerdeçal/Kurkumin 500mg 2x/gün — belirgin CRP düşüşü", evidence: "A" },
    ]},
  { id: "tsh", name: "TSH", nametr: "TSH", unit: "mIU/L", emoji: "🦋", category: "thyroid",
    standardRange: [0.27, 4.2], optimalRange: [1.0, 2.5], longevityRange: [1.0, 2.0],
    improvementTips: [
      { tip: "Selenium 200mcg/day — supports thyroid function", tipTr: "Selenyum 200mcg/gün — tiroid fonksiyonunu destekler", evidence: "A" },
    ]},
  { id: "alt", name: "ALT", nametr: "ALT", unit: "U/L", emoji: "🫘", category: "liver",
    standardRange: [7, 56], optimalRange: [7, 30], longevityRange: [7, 20],
    improvementTips: [
      { tip: "Milk Thistle (Silymarin) 250mg/day — hepatoprotective", tipTr: "Deve Dikeni (Silimarin) 250mg/gün — karaciğer koruyucu", evidence: "A" },
    ]},
  { id: "creatinine", name: "Creatinine", nametr: "Kreatinin", unit: "mg/dL", emoji: "🫘", category: "kidney",
    standardRange: [0.6, 1.2], optimalRange: [0.7, 1.0], longevityRange: [0.7, 0.9],
    improvementTips: [
      { tip: "Stay well-hydrated — 2+ liters water daily", tipTr: "İyi hidrate kalın — günde 2+ litre su", evidence: "B" },
    ]},
  { id: "vitd", name: "Vitamin D", nametr: "D Vitamini", unit: "ng/mL", emoji: "☀️", category: "nutrients",
    standardRange: [20, 100], optimalRange: [40, 70], longevityRange: [50, 70],
    improvementTips: [
      { tip: "D3+K2 5000IU/day — optimal for most adults", tipTr: "D3+K2 5000IU/gün — çoğu yetişkin için optimal", evidence: "A" },
    ]},
  { id: "ferritin", name: "Ferritin", nametr: "Ferritin", unit: "ng/mL", emoji: "🩸", category: "nutrients",
    standardRange: [12, 300], optimalRange: [40, 150], longevityRange: [50, 100],
    improvementTips: [
      { tip: "Iron-rich foods with Vitamin C for absorption", tipTr: "Emilim için C vitamini ile demir açısından zengin gıdalar", evidence: "A" },
    ]},
]

export const ORGAN_SYSTEMS = [
  { id: "heart", emoji: "🫀", en: "Heart & Vascular", tr: "Kalp & Damar", color: "#ef4444", markers: ["ldl", "apob", "triglycerides"] },
  { id: "metabolism", emoji: "🔥", en: "Metabolism", tr: "Metabolizma", color: "#f59e0b", markers: ["hba1c", "glucose", "insulin"] },
  { id: "thyroid", emoji: "🦋", en: "Thyroid", tr: "Tiroid", color: "#8b5cf6", markers: ["tsh"] },
  { id: "inflammation", emoji: "🔥", en: "Inflammation", tr: "İnflamasyon", color: "#f97316", markers: ["hscrp"] },
  { id: "liver_kidney", emoji: "🫘", en: "Liver & Kidney", tr: "Karaciğer & Böbrek", color: "#06b6d4", markers: ["alt", "creatinine"] },
  { id: "nutrients", emoji: "🍊", en: "Nutrients", tr: "Besinler", color: "#22c55e", markers: ["vitd", "ferritin"] },
]
