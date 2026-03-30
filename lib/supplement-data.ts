// © 2026 Phytotherapy.ai — All Rights Reserved
// ============================================
// Supplement Reference Data — Sprint 10b+
// ============================================
// Cycling rules, recommended doses, max doses, units

export interface SupplementInfo {
  cycleDays: number
  breakDays: number
  recommendedDose: string
  maxDose: string
  maxDoseValue: number  // in mg for comparison (or IU/CFU as-is)
  unit: string
}

export const SUPPLEMENT_DB: Record<string, SupplementInfo> = {
  // ── Herbs & Adaptogens ──
  "ashwagandha": { cycleDays: 60, breakDays: 14, recommendedDose: "300-600mg", maxDose: "1200mg", maxDoseValue: 1200, unit: "mg" },
  "rhodiola": { cycleDays: 42, breakDays: 14, recommendedDose: "200-400mg", maxDose: "600mg", maxDoseValue: 600, unit: "mg" },
  "lion's mane": { cycleDays: 60, breakDays: 14, recommendedDose: "500-1000mg", maxDose: "3000mg", maxDoseValue: 3000, unit: "mg" },
  "turmeric": { cycleDays: 60, breakDays: 14, recommendedDose: "500-1000mg", maxDose: "3000mg", maxDoseValue: 3000, unit: "mg" },
  "ginseng": { cycleDays: 60, breakDays: 14, recommendedDose: "200-400mg", maxDose: "600mg", maxDoseValue: 600, unit: "mg" },
  "maca": { cycleDays: 90, breakDays: 14, recommendedDose: "1.5-3g", maxDose: "5g", maxDoseValue: 5000, unit: "mg" },
  "bacopa": { cycleDays: 90, breakDays: 14, recommendedDose: "300-600mg", maxDose: "900mg", maxDoseValue: 900, unit: "mg" },
  "ginkgo": { cycleDays: 90, breakDays: 14, recommendedDose: "120-240mg", maxDose: "360mg", maxDoseValue: 360, unit: "mg" },
  "echinacea": { cycleDays: 14, breakDays: 14, recommendedDose: "300-500mg", maxDose: "1000mg", maxDoseValue: 1000, unit: "mg" },
  "elderberry": { cycleDays: 30, breakDays: 7, recommendedDose: "500-1000mg", maxDose: "2000mg", maxDoseValue: 2000, unit: "mg" },
  "milk thistle": { cycleDays: 90, breakDays: 14, recommendedDose: "200-400mg", maxDose: "600mg", maxDoseValue: 600, unit: "mg" },
  "valerian": { cycleDays: 30, breakDays: 7, recommendedDose: "300-600mg", maxDose: "900mg", maxDoseValue: 900, unit: "mg" },
  "st. john's wort": { cycleDays: 60, breakDays: 14, recommendedDose: "300-600mg", maxDose: "1200mg", maxDoseValue: 1200, unit: "mg" },
  "berberine": { cycleDays: 60, breakDays: 14, recommendedDose: "500-1500mg", maxDose: "2000mg", maxDoseValue: 2000, unit: "mg" },
  "boswellia": { cycleDays: 90, breakDays: 14, recommendedDose: "300-500mg", maxDose: "1200mg", maxDoseValue: 1200, unit: "mg" },
  "tongkat ali": { cycleDays: 60, breakDays: 14, recommendedDose: "200-400mg", maxDose: "600mg", maxDoseValue: 600, unit: "mg" },
  "mucuna": { cycleDays: 60, breakDays: 14, recommendedDose: "300-500mg", maxDose: "1000mg", maxDoseValue: 1000, unit: "mg" },
  "moringa": { cycleDays: 90, breakDays: 14, recommendedDose: "500-2000mg", maxDose: "3000mg", maxDoseValue: 3000, unit: "mg" },
  "psyllium": { cycleDays: 0, breakDays: 0, recommendedDose: "5-10g", maxDose: "30g", maxDoseValue: 30000, unit: "g" },
  "black seed oil": { cycleDays: 90, breakDays: 14, recommendedDose: "1-3g", maxDose: "5g", maxDoseValue: 5000, unit: "mg" },
  "oregano oil": { cycleDays: 14, breakDays: 14, recommendedDose: "100-250mg", maxDose: "600mg", maxDoseValue: 600, unit: "mg" },
  "garlic": { cycleDays: 90, breakDays: 14, recommendedDose: "600-1200mg", maxDose: "2400mg", maxDoseValue: 2400, unit: "mg" },
  "green tea extract": { cycleDays: 90, breakDays: 14, recommendedDose: "250-500mg", maxDose: "800mg", maxDoseValue: 800, unit: "mg" },
  "saw palmetto": { cycleDays: 90, breakDays: 14, recommendedDose: "160-320mg", maxDose: "640mg", maxDoseValue: 640, unit: "mg" },
  "fenugreek": { cycleDays: 60, breakDays: 14, recommendedDose: "500-600mg", maxDose: "1200mg", maxDoseValue: 1200, unit: "mg" },
  "holy basil": { cycleDays: 60, breakDays: 14, recommendedDose: "300-600mg", maxDose: "1200mg", maxDoseValue: 1200, unit: "mg" },

  // ── Vitamins ──
  "vitamin d": { cycleDays: 90, breakDays: 14, recommendedDose: "1000-4000 IU", maxDose: "10000 IU", maxDoseValue: 10000, unit: "IU" },
  "d vitamini": { cycleDays: 90, breakDays: 14, recommendedDose: "1000-4000 IU", maxDose: "10000 IU", maxDoseValue: 10000, unit: "IU" },
  "vitamin c": { cycleDays: 0, breakDays: 0, recommendedDose: "500-1000mg", maxDose: "2000mg", maxDoseValue: 2000, unit: "mg" },
  "vitamin e": { cycleDays: 90, breakDays: 14, recommendedDose: "200-400 IU", maxDose: "1000 IU", maxDoseValue: 1000, unit: "IU" },
  "vitamin a": { cycleDays: 90, breakDays: 14, recommendedDose: "3000-5000 IU", maxDose: "10000 IU", maxDoseValue: 10000, unit: "IU" },
  "vitamin k2": { cycleDays: 0, breakDays: 0, recommendedDose: "100-200mcg", maxDose: "500mcg", maxDoseValue: 500, unit: "mcg" },
  "b12": { cycleDays: 90, breakDays: 14, recommendedDose: "500-1000mcg", maxDose: "5000mcg", maxDoseValue: 5000, unit: "mcg" },
  "folic acid": { cycleDays: 0, breakDays: 0, recommendedDose: "400-800mcg", maxDose: "1000mcg", maxDoseValue: 1000, unit: "mcg" },
  "biotin": { cycleDays: 0, breakDays: 0, recommendedDose: "2500-5000mcg", maxDose: "10000mcg", maxDoseValue: 10000, unit: "mcg" },

  // ── Minerals ──
  "magnesium": { cycleDays: 90, breakDays: 14, recommendedDose: "200-400mg", maxDose: "800mg", maxDoseValue: 800, unit: "mg" },
  "zinc": { cycleDays: 60, breakDays: 14, recommendedDose: "15-30mg", maxDose: "40mg", maxDoseValue: 40, unit: "mg" },
  "iron": { cycleDays: 60, breakDays: 14, recommendedDose: "18-27mg", maxDose: "45mg", maxDoseValue: 45, unit: "mg" },
  "calcium": { cycleDays: 0, breakDays: 0, recommendedDose: "500-1000mg", maxDose: "2500mg", maxDoseValue: 2500, unit: "mg" },
  "selenium": { cycleDays: 90, breakDays: 14, recommendedDose: "100-200mcg", maxDose: "400mcg", maxDoseValue: 400, unit: "mcg" },
  "chromium": { cycleDays: 90, breakDays: 14, recommendedDose: "200-1000mcg", maxDose: "1000mcg", maxDoseValue: 1000, unit: "mcg" },
  "potassium": { cycleDays: 0, breakDays: 0, recommendedDose: "200-400mg", maxDose: "600mg", maxDoseValue: 600, unit: "mg" },
  "iodine": { cycleDays: 0, breakDays: 0, recommendedDose: "150-300mcg", maxDose: "1100mcg", maxDoseValue: 1100, unit: "mcg" },
  "boron": { cycleDays: 90, breakDays: 14, recommendedDose: "3-6mg", maxDose: "20mg", maxDoseValue: 20, unit: "mg" },

  // ── Amino Acids ──
  "l-arginine": { cycleDays: 90, breakDays: 14, recommendedDose: "3-6g", maxDose: "9g", maxDoseValue: 9000, unit: "g" },
  "l-glutamine": { cycleDays: 90, breakDays: 14, recommendedDose: "5-10g", maxDose: "20g", maxDoseValue: 20000, unit: "g" },
  "glutamine": { cycleDays: 90, breakDays: 14, recommendedDose: "5-10g", maxDose: "20g", maxDoseValue: 20000, unit: "g" },
  "l-theanine": { cycleDays: 0, breakDays: 0, recommendedDose: "100-200mg", maxDose: "400mg", maxDoseValue: 400, unit: "mg" },
  "l-tyrosine": { cycleDays: 60, breakDays: 14, recommendedDose: "500-2000mg", maxDose: "3000mg", maxDoseValue: 3000, unit: "mg" },
  "l-carnitine": { cycleDays: 90, breakDays: 14, recommendedDose: "500-2000mg", maxDose: "3000mg", maxDoseValue: 3000, unit: "mg" },
  "taurine": { cycleDays: 0, breakDays: 0, recommendedDose: "500-2000mg", maxDose: "3000mg", maxDoseValue: 3000, unit: "mg" },
  "glycine": { cycleDays: 0, breakDays: 0, recommendedDose: "3-5g", maxDose: "10g", maxDoseValue: 10000, unit: "g" },
  "nac": { cycleDays: 90, breakDays: 14, recommendedDose: "600-1200mg", maxDose: "1800mg", maxDoseValue: 1800, unit: "mg" },
  "bcaa": { cycleDays: 0, breakDays: 0, recommendedDose: "5-10g", maxDose: "20g", maxDoseValue: 20000, unit: "g" },
  "eaa": { cycleDays: 0, breakDays: 0, recommendedDose: "10-15g", maxDose: "25g", maxDoseValue: 25000, unit: "g" },
  "hmb": { cycleDays: 90, breakDays: 14, recommendedDose: "1.5-3g", maxDose: "6g", maxDoseValue: 6000, unit: "g" },
  "5-htp": { cycleDays: 60, breakDays: 14, recommendedDose: "50-200mg", maxDose: "400mg", maxDoseValue: 400, unit: "mg" },
  "gaba": { cycleDays: 60, breakDays: 14, recommendedDose: "250-750mg", maxDose: "1500mg", maxDoseValue: 1500, unit: "mg" },
  "l-tryptophan": { cycleDays: 60, breakDays: 14, recommendedDose: "500-1000mg", maxDose: "2000mg", maxDoseValue: 2000, unit: "mg" },

  // ── Sports ──
  "creatine": { cycleDays: 90, breakDays: 30, recommendedDose: "3-5g", maxDose: "10g", maxDoseValue: 10000, unit: "g" },
  "caffeine": { cycleDays: 30, breakDays: 7, recommendedDose: "100-200mg", maxDose: "400mg", maxDoseValue: 400, unit: "mg" },
  "citrulline malate": { cycleDays: 90, breakDays: 14, recommendedDose: "6-8g", maxDose: "15g", maxDoseValue: 15000, unit: "g" },
  "sitrülin malat": { cycleDays: 90, breakDays: 14, recommendedDose: "6-8g", maxDose: "15g", maxDoseValue: 15000, unit: "g" },
  "beta alanine": { cycleDays: 90, breakDays: 14, recommendedDose: "3.2-6.4g", maxDose: "10g", maxDoseValue: 10000, unit: "g" },
  "beta alanin": { cycleDays: 90, breakDays: 14, recommendedDose: "3.2-6.4g", maxDose: "10g", maxDoseValue: 10000, unit: "g" },
  "betaine": { cycleDays: 90, breakDays: 14, recommendedDose: "1.25-2.5g", maxDose: "6g", maxDoseValue: 6000, unit: "g" },
  "betain": { cycleDays: 90, breakDays: 14, recommendedDose: "1.25-2.5g", maxDose: "6g", maxDoseValue: 6000, unit: "g" },

  // ── Fatty Acids ──
  "omega-3": { cycleDays: 90, breakDays: 14, recommendedDose: "1-2g EPA+DHA", maxDose: "5g", maxDoseValue: 5000, unit: "g" },
  "fish oil": { cycleDays: 0, breakDays: 0, recommendedDose: "1-3g", maxDose: "5g", maxDoseValue: 5000, unit: "g" },
  "krill oil": { cycleDays: 0, breakDays: 0, recommendedDose: "500-1000mg", maxDose: "2000mg", maxDoseValue: 2000, unit: "mg" },
  "mct oil": { cycleDays: 0, breakDays: 0, recommendedDose: "1-2 yemek kaşığı", maxDose: "4 yemek kaşığı", maxDoseValue: 0, unit: "tbsp" },

  // ── Antioxidants ──
  "coq10": { cycleDays: 90, breakDays: 14, recommendedDose: "100-200mg", maxDose: "600mg", maxDoseValue: 600, unit: "mg" },
  "coenzyme q10": { cycleDays: 90, breakDays: 14, recommendedDose: "100-200mg", maxDose: "600mg", maxDoseValue: 600, unit: "mg" },
  "alpha lipoic acid": { cycleDays: 90, breakDays: 14, recommendedDose: "300-600mg", maxDose: "1200mg", maxDoseValue: 1200, unit: "mg" },
  "resveratrol": { cycleDays: 90, breakDays: 14, recommendedDose: "150-500mg", maxDose: "1000mg", maxDoseValue: 1000, unit: "mg" },
  "quercetin": { cycleDays: 60, breakDays: 14, recommendedDose: "500-1000mg", maxDose: "1500mg", maxDoseValue: 1500, unit: "mg" },
  "astaxanthin": { cycleDays: 90, breakDays: 14, recommendedDose: "4-12mg", maxDose: "24mg", maxDoseValue: 24, unit: "mg" },
  "glutathione": { cycleDays: 90, breakDays: 14, recommendedDose: "250-500mg", maxDose: "1000mg", maxDoseValue: 1000, unit: "mg" },
  "pqq": { cycleDays: 90, breakDays: 14, recommendedDose: "10-20mg", maxDose: "40mg", maxDoseValue: 40, unit: "mg" },

  // ── Specialty ──
  "melatonin": { cycleDays: 60, breakDays: 7, recommendedDose: "0.5-3mg", maxDose: "10mg", maxDoseValue: 10, unit: "mg" },
  "collagen": { cycleDays: 0, breakDays: 0, recommendedDose: "5-15g", maxDose: "30g", maxDoseValue: 30000, unit: "g" },
  "probiotics": { cycleDays: 60, breakDays: 7, recommendedDose: "10-50 billion CFU", maxDose: "100 billion CFU", maxDoseValue: 100, unit: "billion CFU" },
  "glucosamine": { cycleDays: 90, breakDays: 14, recommendedDose: "1500mg", maxDose: "3000mg", maxDoseValue: 3000, unit: "mg" },
  "msm": { cycleDays: 90, breakDays: 14, recommendedDose: "1000-3000mg", maxDose: "6000mg", maxDoseValue: 6000, unit: "mg" },
  "hyaluronic acid": { cycleDays: 90, breakDays: 14, recommendedDose: "100-200mg", maxDose: "400mg", maxDoseValue: 400, unit: "mg" },
  "dhea": { cycleDays: 60, breakDays: 14, recommendedDose: "25-50mg", maxDose: "100mg", maxDoseValue: 100, unit: "mg" },
  "spirulina": { cycleDays: 0, breakDays: 0, recommendedDose: "1-3g", maxDose: "10g", maxDoseValue: 10000, unit: "g" },
  "chlorella": { cycleDays: 0, breakDays: 0, recommendedDose: "2-5g", maxDose: "10g", maxDoseValue: 10000, unit: "g" },
  "nmn": { cycleDays: 90, breakDays: 14, recommendedDose: "250-500mg", maxDose: "1000mg", maxDoseValue: 1000, unit: "mg" },
  "sam-e": { cycleDays: 60, breakDays: 14, recommendedDose: "400-800mg", maxDose: "1600mg", maxDoseValue: 1600, unit: "mg" },
}

export const DEFAULT_SUPPLEMENT: SupplementInfo = {
  cycleDays: 90, breakDays: 14,
  recommendedDose: "-", maxDose: "-", maxDoseValue: 0, unit: "mg"
}

// ── Turkish ↔ English supplement name mapping (expanded) ──
export const SUPPLEMENT_NAME_MAP: Record<string, string> = {
  "d vitamini": "Vitamin D", "c vitamini": "Vitamin C", "a vitamini": "Vitamin A",
  "e vitamini": "Vitamin E", "k2 vitamini": "Vitamin K2",
  "b12 vitamini": "Vitamin B12", "b6 vitamini": "Vitamin B6", "b1 vitamini": "Vitamin B1",
  "b2 vitamini": "Vitamin B2", "b3 vitamini": "Vitamin B3", "b5 vitamini": "Vitamin B5",
  "folik asit": "Folic Acid", "biyotin": "Biotin",
  "demir": "Iron", "çinko": "Zinc", "magnezyum": "Magnesium", "kalsiyum": "Calcium",
  "selenyum": "Selenium", "krom": "Chromium", "potasyum": "Potassium",
  "iyot": "Iodine", "bor": "Boron", "bakır": "Copper", "manganez": "Manganese",
  "probiyotik": "Probiotics", "probiyotikler": "Probiotics", "prebiyotik": "Prebiotic Fiber",
  "zerdeçal": "Turmeric", "kurkumin": "Turmeric", "zencefil": "Ginger",
  "sarımsak": "Garlic", "tarçın": "Cinnamon", "kediotu": "Valerian Root",
  "ekinezya": "Echinacea", "deve dikeni": "Milk Thistle", "sarı kantaron": "St. John's Wort",
  "ginkgo biloba": "Ginkgo Biloba",
  "balık yağı": "Fish Oil", "kolajen": "Collagen",
  "kreatin": "Creatine", "kafein": "Caffeine",
  "sitrülin malat": "Citrulline Malate", "sitrülin": "L-Citrulline",
  "beta alanin": "Beta Alanine", "betain": "Betaine",
  "aslan yelesi mantarı": "Lion's Mane", "aslan yelesi": "Lion's Mane",
  "kordiseps": "Cordyceps", "reyşi": "Reishi", "çaga": "Chaga",
  "melatonin": "Melatonin", "ashwagandha": "Ashwagandha",
  "rodiola": "Rhodiola", "omega-3": "Omega-3",
  "koenzim q10": "CoQ10",
  "tirozin": "L-Tyrosine", "l-tirozin": "L-Tyrosine",
  "teanin": "L-Theanine", "l-teanin": "L-Theanine",
  "triptofan": "L-Tryptophan", "l-triptofan": "L-Tryptophan",
  "arjinin": "L-Arginine", "l-arjinin": "L-Arginine",
  "glutamin": "L-Glutamine", "l-glutamin": "L-Glutamine",
  "karnitin": "L-Carnitine", "l-karnitin": "L-Carnitine",
  "taurin": "Taurine", "glisin": "Glycine", "lisin": "L-Lysine",
  "berberin": "Berberine", "resveratrol": "Resveratrol", "kersetin": "Quercetin",
  "glukozamin": "Glucosamine", "kondroitin": "Chondroitin",
  "hyalüronik asit": "Hyaluronic Acid",
  "spirulina": "Spirulina", "klorella": "Chlorella",
  "maka": "Maca", "bakopa": "Bacopa Monnieri",
  "alfa lipoik asit": "Alpha Lipoic Acid",
  "çörek otu yağı": "Black Seed Oil", "çörek otu": "Black Seed Oil",
  "kekik yağı": "Oregano Oil",
  "yeşil çay ekstresi": "Green Tea Extract",
  "psyllium": "Psyllium Husk", "karnıyarık otu": "Psyllium Husk",
  "mürdümük": "Psyllium Husk",
}

// Reverse map (EN → TR)
export const SUPPLEMENT_NAME_TR: Record<string, string> = {
  "vitamin d": "D Vitamini", "vitamin d3": "D3 Vitamini", "vitamin d2": "D2 Vitamini",
  "vitamin c": "C Vitamini", "vitamin a": "A Vitamini",
  "vitamin e": "E Vitamini", "vitamin k2": "K2 Vitamini", "vitamin k1": "K1 Vitamini",
  "vitamin b12": "B12 Vitamini", "b12": "B12 Vitamini",
  "vitamin b6": "B6 Vitamini", "vitamin b1": "B1 Vitamini",
  "vitamin b2": "B2 Vitamini", "vitamin b3": "B3 Vitamini",
  "folic acid": "Folik Asit", "biotin": "Biyotin",
  "iron": "Demir", "zinc": "Çinko", "magnesium": "Magnezyum",
  "calcium": "Kalsiyum", "selenium": "Selenyum", "chromium": "Krom",
  "potassium": "Potasyum", "iodine": "İyot", "boron": "Bor",
  "copper": "Bakır", "manganese": "Manganez",
  "probiotics": "Probiyotik", "turmeric": "Zerdeçal", "curcumin": "Kurkumin",
  "ginger": "Zencefil", "garlic": "Sarımsak", "cinnamon": "Tarçın",
  "fish oil": "Balık Yağı", "collagen": "Kolajen",
  "creatine": "Kreatin", "caffeine": "Kafein",
  "citrulline malate": "Sitrülin Malat", "l-citrulline": "L-Sitrülin",
  "beta alanine": "Beta Alanin", "betaine": "Betain",
  "lion's mane": "Aslan Yelesi Mantarı", "reishi": "Reyşi Mantarı",
  "cordyceps": "Kordiseps Mantarı", "chaga": "Çaga Mantarı",
  "melatonin": "Melatonin", "ashwagandha": "Ashwagandha",
  "rhodiola": "Rodiola", "omega-3": "Omega-3",
  "coq10": "Koenzim Q10", "coenzyme q10": "Koenzim Q10",
  "l-tyrosine": "L-Tirozin", "l-theanine": "L-Teanin",
  "l-tryptophan": "L-Triptofan", "l-arginine": "L-Arjinin",
  "l-glutamine": "L-Glutamin", "glutamine": "Glutamin",
  "l-carnitine": "L-Karnitin", "taurine": "Taurin", "glycine": "Glisin",
  "l-lysine": "L-Lisin", "nac": "NAC (N-Asetil Sistein)",
  "bcaa": "BCAA", "eaa": "EAA", "hmb": "HMB",
  "5-htp": "5-HTP", "gaba": "GABA", "dhea": "DHEA",
  "berberine": "Berberin", "resveratrol": "Resveratrol", "quercetin": "Kersetin",
  "glucosamine": "Glukozamin", "chondroitin": "Kondroitin", "msm": "MSM",
  "hyaluronic acid": "Hyalüronik Asit",
  "spirulina": "Spirulina", "chlorella": "Klorella",
  "maca": "Maka", "bacopa monnieri": "Bakopa",
  "echinacea": "Ekinezya", "elderberry": "Mürver",
  "milk thistle": "Deve Dikeni", "valerian root": "Kediotu",
  "st. john's wort": "Sarı Kantaron", "ginkgo biloba": "Ginkgo Biloba",
  "ginseng": "Ginseng", "holy basil": "Kutsal Fesleğen",
  "saw palmetto": "Testere Palmiyesi", "fenugreek": "Çemen Otu",
  "alpha lipoic acid": "Alfa Lipoik Asit",
  "black seed oil": "Çörek Otu Yağı", "oregano oil": "Kekik Yağı",
  "green tea extract": "Yeşil Çay Ekstresi",
  "psyllium husk": "Psyllium (Karnıyarık Otu)",
  "boswellia": "Boswellia (Akgünlük)",
  "tongkat ali": "Tongkat Ali",
  "astaxanthin": "Astaksantin", "pqq": "PQQ",
  "nmn": "NMN", "sam-e": "SAMe",
  "collagen peptides": "Kolajen Peptidler",
  "krill oil": "Kril Yağı", "mct oil": "MCT Yağı",
  "evening primrose oil": "Çuha Çiçeği Yağı",
}

/** Get display name in user's language */
export function getSupplementDisplayName(name: string, lang: "tr" | "en"): string {
  const lower = name.toLowerCase().trim()
  if (lang === "tr") {
    const trName = Object.entries(SUPPLEMENT_NAME_TR).find(([key]) => lower.includes(key))
    return trName ? trName[1] : name
  }
  const enName = Object.entries(SUPPLEMENT_NAME_MAP).find(([key]) => lower.includes(key))
  return enName ? enName[1] : name
}

export function findSupplementInfo(name: string): SupplementInfo {
  const lower = name.toLowerCase()
  // Direct match first
  const match = Object.entries(SUPPLEMENT_DB).find(([key]) => lower.includes(key))
  if (match) return match[1]
  // Try canonical English name via TR map
  const enName = Object.entries(SUPPLEMENT_NAME_MAP).find(([key]) => lower.includes(key))
  if (enName) {
    const enMatch = Object.entries(SUPPLEMENT_DB).find(([key]) => enName[1].toLowerCase().includes(key))
    if (enMatch) return enMatch[1]
  }
  return DEFAULT_SUPPLEMENT
}

// Parse a dose string like "500mg", "2g", "1000 IU" to numeric mg value
export function parseDoseToMg(doseStr: string): number {
  const cleaned = doseStr.toLowerCase().replace(/[,\s]/g, "")
  const numMatch = cleaned.match(/^([\d.]+)/)
  if (!numMatch) return 0
  const num = parseFloat(numMatch[1])
  if (cleaned.includes("g") && !cleaned.includes("mg") && !cleaned.includes("mcg")) {
    return num * 1000
  }
  if (cleaned.includes("mcg")) return num
  return num
}

/** Auto-format a raw dose number with the supplement's unit */
export function formatDoseWithUnit(rawDose: string, supplementName: string): string {
  const trimmed = rawDose.trim()
  // Already has a unit? Return as-is
  if (/[a-zA-Z]/.test(trimmed)) return trimmed

  // Pure number — add the supplement's default unit
  const num = parseFloat(trimmed)
  if (isNaN(num)) return trimmed

  const info = findSupplementInfo(supplementName)
  // Determine appropriate unit based on supplement info
  if (info.unit === "g" || info.recommendedDose.includes("g") && !info.recommendedDose.includes("mg") && !info.recommendedDose.includes("mcg")) {
    return `${trimmed} gram`
  }
  if (info.unit === "IU" || info.recommendedDose.includes("IU")) {
    return `${trimmed} IU`
  }
  if (info.unit === "mcg" || info.recommendedDose.includes("mcg")) {
    return `${trimmed} mcg`
  }
  if (info.unit === "billion CFU") {
    return `${trimmed} milyar CFU`
  }
  return `${trimmed} mg`
}
