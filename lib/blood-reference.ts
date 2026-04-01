// © 2026 Doctopal — All Rights Reserved
// ============================================
// Blood Test Reference Ranges & Types
// ============================================

export interface BloodTestMarker {
  id: string;
  name: string;
  unit: string;
  category: BloodTestCategory;
  ranges: {
    low?: number;       // Below this = low
    optimal_low: number;
    optimal_high: number;
    high?: number;      // Above this = high
  };
  genderSpecific?: {
    male: { optimal_low: number; optimal_high: number };
    female: { optimal_low: number; optimal_high: number };
  };
  description: string;
}

export type BloodTestCategory =
  | "lipid"
  | "vitamin"
  | "mineral"
  | "metabolic"
  | "thyroid"
  | "inflammation"
  | "liver"
  | "kidney"
  | "blood_count";

export interface BloodTestValue {
  markerId: string;
  value: number;
}

export type ResultStatus = "low" | "optimal" | "borderline_low" | "borderline_high" | "high" | "critical";

export interface BloodTestResult {
  marker: BloodTestMarker;
  value: number;
  status: ResultStatus;
  statusLabel: string;
  statusColor: string;
}

// ============================================
// Reference Data
// ============================================

export const BLOOD_TEST_MARKERS: BloodTestMarker[] = [
  // === LIPID PANEL ===
  {
    id: "total_cholesterol",
    name: "Total Cholesterol",
    unit: "mg/dL",
    category: "lipid",
    ranges: { optimal_low: 0, optimal_high: 200, high: 240 },
    description: "Total blood cholesterol level",
  },
  {
    id: "ldl",
    name: "LDL Cholesterol",
    unit: "mg/dL",
    category: "lipid",
    ranges: { optimal_low: 0, optimal_high: 100, high: 160 },
    description: "Low-density lipoprotein (bad cholesterol)",
  },
  {
    id: "hdl",
    name: "HDL Cholesterol",
    unit: "mg/dL",
    category: "lipid",
    ranges: { low: 40, optimal_low: 60, optimal_high: 100 },
    description: "High-density lipoprotein (good cholesterol)",
  },
  {
    id: "triglycerides",
    name: "Triglycerides",
    unit: "mg/dL",
    category: "lipid",
    ranges: { optimal_low: 0, optimal_high: 150, high: 200 },
    description: "Blood fat level",
  },

  // === VITAMINS ===
  {
    id: "vitamin_d",
    name: "Vitamin D (25-OH)",
    unit: "ng/mL",
    category: "vitamin",
    ranges: { low: 20, optimal_low: 30, optimal_high: 100 },
    description: "25-hydroxyvitamin D level",
  },
  {
    id: "vitamin_b12",
    name: "Vitamin B12",
    unit: "pg/mL",
    category: "vitamin",
    ranges: { low: 200, optimal_low: 300, optimal_high: 900 },
    description: "Cobalamin level",
  },
  {
    id: "folate",
    name: "Folate (Folic Acid)",
    unit: "ng/mL",
    category: "vitamin",
    ranges: { low: 3, optimal_low: 5, optimal_high: 20 },
    description: "Vitamin B9 level",
  },

  // === MINERALS ===
  {
    id: "ferritin",
    name: "Ferritin",
    unit: "ng/mL",
    category: "mineral",
    ranges: { low: 12, optimal_low: 30, optimal_high: 150 },
    genderSpecific: {
      male: { optimal_low: 30, optimal_high: 300 },
      female: { optimal_low: 20, optimal_high: 150 },
    },
    description: "Iron stores in the body",
  },
  {
    id: "iron",
    name: "Iron (Serum)",
    unit: "µg/dL",
    category: "mineral",
    ranges: { low: 60, optimal_low: 60, optimal_high: 170 },
    description: "Serum iron level",
  },
  {
    id: "magnesium",
    name: "Magnesium",
    unit: "mg/dL",
    category: "mineral",
    ranges: { low: 1.7, optimal_low: 1.7, optimal_high: 2.2 },
    description: "Blood magnesium level",
  },
  {
    id: "calcium",
    name: "Calcium",
    unit: "mg/dL",
    category: "mineral",
    ranges: { low: 8.5, optimal_low: 8.5, optimal_high: 10.5 },
    description: "Blood calcium level",
  },
  {
    id: "zinc",
    name: "Zinc",
    unit: "µg/dL",
    category: "mineral",
    ranges: { low: 60, optimal_low: 70, optimal_high: 120 },
    description: "Blood zinc level",
  },

  // === METABOLIC ===
  {
    id: "hba1c",
    name: "HbA1c",
    unit: "%",
    category: "metabolic",
    ranges: { optimal_low: 0, optimal_high: 5.7, high: 6.5 },
    description: "Average blood sugar over 3 months",
  },
  {
    id: "fasting_glucose",
    name: "Fasting Glucose",
    unit: "mg/dL",
    category: "metabolic",
    ranges: { low: 70, optimal_low: 70, optimal_high: 100, high: 126 },
    description: "Blood sugar after fasting",
  },
  {
    id: "insulin",
    name: "Fasting Insulin",
    unit: "µIU/mL",
    category: "metabolic",
    ranges: { optimal_low: 2.6, optimal_high: 11.1, high: 25 },
    description: "Fasting insulin level",
  },
  {
    id: "uric_acid",
    name: "Uric Acid",
    unit: "mg/dL",
    category: "metabolic",
    ranges: { optimal_low: 2.5, optimal_high: 7.0, high: 8.0 },
    genderSpecific: {
      male: { optimal_low: 3.0, optimal_high: 7.0 },
      female: { optimal_low: 2.5, optimal_high: 6.0 },
    },
    description: "Waste product from purine metabolism",
  },

  // === THYROID ===
  {
    id: "tsh",
    name: "TSH",
    unit: "mIU/L",
    category: "thyroid",
    ranges: { low: 0.4, optimal_low: 0.4, optimal_high: 4.0, high: 10 },
    description: "Thyroid-stimulating hormone",
  },
  {
    id: "free_t4",
    name: "Free T4",
    unit: "ng/dL",
    category: "thyroid",
    ranges: { low: 0.8, optimal_low: 0.9, optimal_high: 1.7 },
    description: "Free thyroxine hormone",
  },
  {
    id: "free_t3",
    name: "Free T3",
    unit: "pg/mL",
    category: "thyroid",
    ranges: { low: 2.0, optimal_low: 2.3, optimal_high: 4.2 },
    description: "Free triiodothyronine hormone",
  },

  // === INFLAMMATION ===
  {
    id: "crp",
    name: "CRP (C-Reactive Protein)",
    unit: "mg/L",
    category: "inflammation",
    ranges: { optimal_low: 0, optimal_high: 3.0, high: 10 },
    description: "General inflammation marker",
  },
  {
    id: "esr",
    name: "ESR (Sed Rate)",
    unit: "mm/hr",
    category: "inflammation",
    ranges: { optimal_low: 0, optimal_high: 20, high: 40 },
    genderSpecific: {
      male: { optimal_low: 0, optimal_high: 15 },
      female: { optimal_low: 0, optimal_high: 20 },
    },
    description: "Erythrocyte sedimentation rate",
  },

  // === LIVER ===
  {
    id: "alt",
    name: "ALT (SGPT)",
    unit: "U/L",
    category: "liver",
    ranges: { optimal_low: 7, optimal_high: 35, high: 56 },
    description: "Alanine aminotransferase (liver enzyme)",
  },
  {
    id: "ast",
    name: "AST (SGOT)",
    unit: "U/L",
    category: "liver",
    ranges: { optimal_low: 8, optimal_high: 33, high: 50 },
    description: "Aspartate aminotransferase (liver enzyme)",
  },
  {
    id: "ggt",
    name: "GGT",
    unit: "U/L",
    category: "liver",
    ranges: { optimal_low: 0, optimal_high: 40, high: 60 },
    description: "Gamma-glutamyl transferase",
  },

  // === KIDNEY ===
  {
    id: "creatinine",
    name: "Creatinine",
    unit: "mg/dL",
    category: "kidney",
    ranges: { optimal_low: 0.6, optimal_high: 1.2 },
    genderSpecific: {
      male: { optimal_low: 0.7, optimal_high: 1.3 },
      female: { optimal_low: 0.6, optimal_high: 1.1 },
    },
    description: "Kidney function marker",
  },
  {
    id: "bun",
    name: "BUN (Blood Urea Nitrogen)",
    unit: "mg/dL",
    category: "kidney",
    ranges: { optimal_low: 7, optimal_high: 20 },
    description: "Kidney function and protein metabolism marker",
  },

  // === BLOOD COUNT ===
  {
    id: "hemoglobin",
    name: "Hemoglobin",
    unit: "g/dL",
    category: "blood_count",
    ranges: { low: 12, optimal_low: 12, optimal_high: 17 },
    genderSpecific: {
      male: { optimal_low: 13.5, optimal_high: 17.5 },
      female: { optimal_low: 12.0, optimal_high: 15.5 },
    },
    description: "Oxygen-carrying protein in red blood cells",
  },
  {
    id: "wbc",
    name: "WBC (White Blood Cells)",
    unit: "x10³/µL",
    category: "blood_count",
    ranges: { low: 4.5, optimal_low: 4.5, optimal_high: 11.0, high: 15 },
    description: "White blood cell count (immune system)",
  },
  {
    id: "platelets",
    name: "Platelets",
    unit: "x10³/µL",
    category: "blood_count",
    ranges: { low: 150, optimal_low: 150, optimal_high: 400 },
    description: "Blood clotting cells",
  },
];

// ============================================
// Category Labels & Colors
// ============================================

export const CATEGORY_INFO: Record<BloodTestCategory, { label: string; color: string; icon: string }> = {
  lipid: { label: "Lipid Panel", color: "amber", icon: "Heart" },
  vitamin: { label: "Vitamins", color: "orange", icon: "Sun" },
  mineral: { label: "Minerals", color: "cyan", icon: "Gem" },
  metabolic: { label: "Metabolic", color: "blue", icon: "Activity" },
  thyroid: { label: "Thyroid", color: "purple", icon: "Zap" },
  inflammation: { label: "Inflammation", color: "red", icon: "Flame" },
  liver: { label: "Liver", color: "green", icon: "Bean" },
  kidney: { label: "Kidney", color: "teal", icon: "Droplet" },
  blood_count: { label: "Blood Count", color: "rose", icon: "Droplets" },
};

// ============================================
// Analysis Helpers
// ============================================

export function analyzeValue(
  marker: BloodTestMarker,
  value: number,
  gender?: "male" | "female" | null
): BloodTestResult {
  const ranges = (gender && marker.genderSpecific?.[gender]) || {
    optimal_low: marker.ranges.optimal_low,
    optimal_high: marker.ranges.optimal_high,
  };
  const low = marker.ranges.low;
  const high = marker.ranges.high;

  let status: ResultStatus;
  let statusLabel: string;
  let statusColor: string;

  if (low !== undefined && value < low) {
    status = "low";
    statusLabel = "Low";
    statusColor = "text-red-600";
  } else if (value < ranges.optimal_low) {
    status = "borderline_low";
    statusLabel = "Borderline Low";
    statusColor = "text-amber-600";
  } else if (value <= ranges.optimal_high) {
    status = "optimal";
    statusLabel = "Optimal";
    statusColor = "text-emerald-600";
  } else if (high !== undefined && value >= high) {
    status = "high";
    statusLabel = "High";
    statusColor = "text-red-600";
  } else {
    status = "borderline_high";
    statusLabel = "Borderline High";
    statusColor = "text-amber-600";
  }

  return { marker, value, status, statusLabel, statusColor };
}

export function getMarkerById(id: string): BloodTestMarker | undefined {
  return BLOOD_TEST_MARKERS.find((m) => m.id === id);
}

export function getMarkersByCategory(category: BloodTestCategory): BloodTestMarker[] {
  return BLOOD_TEST_MARKERS.filter((m) => m.category === category);
}
