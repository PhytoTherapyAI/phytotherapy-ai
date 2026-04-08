// © 2026 DoctoPal — All Rights Reserved
// ============================================
// Medical Terminology Mapping — SNOMED CT, RxNorm, LOINC, WHO-DD
// Maps doctopal.com internal terms to global medical codes
// ============================================

import { type FHIRCoding, CODING_SYSTEMS } from "./types"

// ── Herbal Product → SNOMED CT + RxNorm Mapping ──
export interface HerbalTermMapping {
  internalId: string
  nameEn: string
  nameTr: string
  latinName?: string
  snomed?: FHIRCoding
  rxnorm?: FHIRCoding
  whoAtc?: FHIRCoding
  phytoAi: FHIRCoding   // our internal code
}

export const HERBAL_TERMINOLOGY: HerbalTermMapping[] = [
  {
    internalId: "curcumin",
    nameEn: "Turmeric / Curcumin",
    nameTr: "Zerdeçal / Kurkumin",
    latinName: "Curcuma longa",
    snomed: { system: CODING_SYSTEMS.SNOMED_CT, code: "1011000175107", display: "Turmeric extract" },
    rxnorm: { system: CODING_SYSTEMS.RXNORM, code: "258513", display: "curcumin" },
    whoAtc: { system: CODING_SYSTEMS.WHO_DD, code: "A16AX", display: "Other alimentary tract products" },
    phytoAi: { system: CODING_SYSTEMS.PHYTO_AI, code: "PHYTO-001", display: "Curcumin (Turmeric)" },
  },
  {
    internalId: "ashwagandha",
    nameEn: "Ashwagandha",
    nameTr: "Ashwagandha",
    latinName: "Withania somnifera",
    snomed: { system: CODING_SYSTEMS.SNOMED_CT, code: "412170002", display: "Ashwagandha extract" },
    phytoAi: { system: CODING_SYSTEMS.PHYTO_AI, code: "PHYTO-002", display: "Ashwagandha KSM-66" },
  },
  {
    internalId: "valerian",
    nameEn: "Valerian Root",
    nameTr: "Kediotu Kökü",
    latinName: "Valeriana officinalis",
    snomed: { system: CODING_SYSTEMS.SNOMED_CT, code: "412171003", display: "Valerian root extract" },
    rxnorm: { system: CODING_SYSTEMS.RXNORM, code: "11110", display: "valerian" },
    phytoAi: { system: CODING_SYSTEMS.PHYTO_AI, code: "PHYTO-003", display: "Valerian Root" },
  },
  {
    internalId: "st_johns_wort",
    nameEn: "St. John's Wort",
    nameTr: "Sarı Kantaron",
    latinName: "Hypericum perforatum",
    snomed: { system: CODING_SYSTEMS.SNOMED_CT, code: "412383006", display: "St John's wort extract" },
    rxnorm: { system: CODING_SYSTEMS.RXNORM, code: "258400", display: "Hypericum perforatum extract" },
    whoAtc: { system: CODING_SYSTEMS.WHO_DD, code: "N06AX25", display: "Hyperici herba" },
    phytoAi: { system: CODING_SYSTEMS.PHYTO_AI, code: "PHYTO-004", display: "St. John's Wort" },
  },
  {
    internalId: "berberine",
    nameEn: "Berberine",
    nameTr: "Berberin",
    latinName: "Berberis vulgaris",
    snomed: { system: CODING_SYSTEMS.SNOMED_CT, code: "39432004", display: "Berberine" },
    rxnorm: { system: CODING_SYSTEMS.RXNORM, code: "1371", display: "berberine" },
    phytoAi: { system: CODING_SYSTEMS.PHYTO_AI, code: "PHYTO-005", display: "Berberine" },
  },
  {
    internalId: "omega3",
    nameEn: "Omega-3 Fatty Acids",
    nameTr: "Omega-3 Yağ Asitleri",
    snomed: { system: CODING_SYSTEMS.SNOMED_CT, code: "226365003", display: "Omega-3 fatty acid" },
    rxnorm: { system: CODING_SYSTEMS.RXNORM, code: "904458", display: "omega-3 acid ethyl esters" },
    whoAtc: { system: CODING_SYSTEMS.WHO_DD, code: "C10AX06", display: "Omega-3-triglycerides" },
    phytoAi: { system: CODING_SYSTEMS.PHYTO_AI, code: "PHYTO-006", display: "Omega-3 EPA/DHA" },
  },
  {
    internalId: "vitamin_d3",
    nameEn: "Vitamin D3",
    nameTr: "D3 Vitamini",
    snomed: { system: CODING_SYSTEMS.SNOMED_CT, code: "18414002", display: "Cholecalciferol" },
    rxnorm: { system: CODING_SYSTEMS.RXNORM, code: "11253", display: "cholecalciferol" },
    whoAtc: { system: CODING_SYSTEMS.WHO_DD, code: "A11CC05", display: "Colecalciferol" },
    phytoAi: { system: CODING_SYSTEMS.PHYTO_AI, code: "PHYTO-007", display: "Vitamin D3" },
  },
  {
    internalId: "magnesium",
    nameEn: "Magnesium Glycinate",
    nameTr: "Magnezyum Glisinat",
    snomed: { system: CODING_SYSTEMS.SNOMED_CT, code: "75799006", display: "Magnesium supplement" },
    rxnorm: { system: CODING_SYSTEMS.RXNORM, code: "6617", display: "magnesium" },
    whoAtc: { system: CODING_SYSTEMS.WHO_DD, code: "A12CC", display: "Magnesium" },
    phytoAi: { system: CODING_SYSTEMS.PHYTO_AI, code: "PHYTO-008", display: "Magnesium Glycinate" },
  },
  {
    internalId: "melatonin",
    nameEn: "Melatonin",
    nameTr: "Melatonin",
    snomed: { system: CODING_SYSTEMS.SNOMED_CT, code: "41199001", display: "Melatonin" },
    rxnorm: { system: CODING_SYSTEMS.RXNORM, code: "6809", display: "melatonin" },
    whoAtc: { system: CODING_SYSTEMS.WHO_DD, code: "N05CH01", display: "Melatonin" },
    phytoAi: { system: CODING_SYSTEMS.PHYTO_AI, code: "PHYTO-009", display: "Melatonin" },
  },
  {
    internalId: "ginger",
    nameEn: "Ginger Extract",
    nameTr: "Zencefil Ekstresi",
    latinName: "Zingiber officinale",
    snomed: { system: CODING_SYSTEMS.SNOMED_CT, code: "412172005", display: "Ginger extract" },
    rxnorm: { system: CODING_SYSTEMS.RXNORM, code: "258089", display: "ginger root extract" },
    phytoAi: { system: CODING_SYSTEMS.PHYTO_AI, code: "PHYTO-010", display: "Ginger Extract" },
  },
]

// ── LOINC Codes for Lab Results ──
export const LOINC_CODES: Record<string, FHIRCoding> = {
  hba1c: { system: CODING_SYSTEMS.LOINC, code: "4548-4", display: "Hemoglobin A1c/Hemoglobin.total in Blood" },
  fasting_glucose: { system: CODING_SYSTEMS.LOINC, code: "1558-6", display: "Fasting glucose [Mass/volume] in Serum or Plasma" },
  total_cholesterol: { system: CODING_SYSTEMS.LOINC, code: "2093-3", display: "Cholesterol [Mass/volume] in Serum or Plasma" },
  ldl: { system: CODING_SYSTEMS.LOINC, code: "2089-1", display: "LDL Cholesterol" },
  hdl: { system: CODING_SYSTEMS.LOINC, code: "2085-9", display: "HDL Cholesterol" },
  triglycerides: { system: CODING_SYSTEMS.LOINC, code: "2571-8", display: "Triglycerides" },
  vitamin_d: { system: CODING_SYSTEMS.LOINC, code: "1989-3", display: "25-hydroxyvitamin D3" },
  vitamin_b12: { system: CODING_SYSTEMS.LOINC, code: "2132-9", display: "Cobalamin (Vitamin B12)" },
  ferritin: { system: CODING_SYSTEMS.LOINC, code: "2276-4", display: "Ferritin [Mass/volume] in Serum or Plasma" },
  tsh: { system: CODING_SYSTEMS.LOINC, code: "3016-3", display: "Thyrotropin [Units/volume] in Serum or Plasma" },
  crp: { system: CODING_SYSTEMS.LOINC, code: "1988-5", display: "C reactive protein [Mass/volume] in Serum or Plasma" },
  hemoglobin: { system: CODING_SYSTEMS.LOINC, code: "718-7", display: "Hemoglobin [Mass/volume] in Blood" },
  creatinine: { system: CODING_SYSTEMS.LOINC, code: "2160-0", display: "Creatinine [Mass/volume] in Serum or Plasma" },
  alt: { system: CODING_SYSTEMS.LOINC, code: "1742-6", display: "ALT [Enzymatic activity/volume] in Serum or Plasma" },
  ast: { system: CODING_SYSTEMS.LOINC, code: "1920-8", display: "AST [Enzymatic activity/volume] in Serum or Plasma" },
  heart_rate: { system: CODING_SYSTEMS.LOINC, code: "8867-4", display: "Heart rate" },
  blood_pressure_systolic: { system: CODING_SYSTEMS.LOINC, code: "8480-6", display: "Systolic blood pressure" },
  blood_pressure_diastolic: { system: CODING_SYSTEMS.LOINC, code: "8462-4", display: "Diastolic blood pressure" },
  body_weight: { system: CODING_SYSTEMS.LOINC, code: "29463-7", display: "Body weight" },
  bmi: { system: CODING_SYSTEMS.LOINC, code: "39156-5", display: "Body mass index" },
}

// ── SNOMED CT for Conditions ──
export const SNOMED_CONDITIONS: Record<string, FHIRCoding> = {
  type2_diabetes: { system: CODING_SYSTEMS.SNOMED_CT, code: "44054006", display: "Type 2 diabetes mellitus" },
  hypertension: { system: CODING_SYSTEMS.SNOMED_CT, code: "38341003", display: "Hypertensive disorder" },
  hyperlipidemia: { system: CODING_SYSTEMS.SNOMED_CT, code: "55822004", display: "Hyperlipidemia" },
  hypothyroidism: { system: CODING_SYSTEMS.SNOMED_CT, code: "40930008", display: "Hypothyroidism" },
  insomnia: { system: CODING_SYSTEMS.SNOMED_CT, code: "193462001", display: "Insomnia" },
  anxiety: { system: CODING_SYSTEMS.SNOMED_CT, code: "197480006", display: "Anxiety disorder" },
  depression: { system: CODING_SYSTEMS.SNOMED_CT, code: "35489007", display: "Depressive disorder" },
  migraine: { system: CODING_SYSTEMS.SNOMED_CT, code: "37796009", display: "Migraine" },
  ibs: { system: CODING_SYSTEMS.SNOMED_CT, code: "10743008", display: "Irritable bowel syndrome" },
  gerd: { system: CODING_SYSTEMS.SNOMED_CT, code: "235595009", display: "Gastroesophageal reflux disease" },
  asthma: { system: CODING_SYSTEMS.SNOMED_CT, code: "195967001", display: "Asthma" },
  pcos: { system: CODING_SYSTEMS.SNOMED_CT, code: "69878008", display: "Polycystic ovarian syndrome" },
}

// ── Lookup Functions ──
export function findHerbalByName(name: string): HerbalTermMapping | null {
  const q = name.toLowerCase()
  return HERBAL_TERMINOLOGY.find(h =>
    h.nameEn.toLowerCase().includes(q) ||
    h.nameTr.toLowerCase().includes(q) ||
    h.internalId.includes(q) ||
    h.latinName?.toLowerCase().includes(q)
  ) || null
}

export function getHerbalFHIRCodings(internalId: string): FHIRCoding[] {
  const herb = HERBAL_TERMINOLOGY.find(h => h.internalId === internalId)
  if (!herb) return []
  return [herb.phytoAi, herb.snomed, herb.rxnorm, herb.whoAtc].filter(Boolean) as FHIRCoding[]
}
