// © 2026 DoctoPal — All Rights Reserved
import { tx } from "@/lib/translations";

/**
 * SAFETY GUARDRAIL — DoctoPal
 * ═══════════════════════════════════
 * Algoritmik Güvenlik ve Etik Çerçevesi
 * "Primum non nocere — First, do no harm"
 *
 * HVHS Model alignment:
 * - C2 (Analitik): Evidence-based risk scoring
 * - C10 (Stratejik Değişim): Continuous learning from doctor feedback
 *
 * This module runs BEFORE any AI recommendation is generated.
 * It acts as a multi-layer safety net:
 *
 * Layer 1: Red Flag Filter (emergency detection)
 * Layer 2: Drug-Herb Interaction Check (lethal interactions)
 * Layer 3: Contraindication Screen (profile-based risks)
 * Layer 4: Dosage Limit Validation
 * Layer 5: Transparency & Source Verification
 */

// ═══════════════════════════════════════════════
// LAYER 1: Red Flag Filter — see lib/safety-filter.ts
// ═══════════════════════════════════════════════
// Layer 1 (red/yellow code triage + emergency templates) moved to
// lib/safety-filter.ts as the single source of truth. The old in-file
// RED_FLAG_DATABASE + checkRedFlags + local getEmergencyMessage were
// never imported outside this module and kept a stale Turkish emergency
// template pointing at safety.immediateEmergency / safety.urgentCaution
// translation keys — removed in Session 39 hotfix to prevent future
// drift from the canonical template in lib/safety-filter.ts.

// ═══════════════════════════════════════════════
// LAYER 2: Drug-Herb Interaction Safety Check
// ═══════════════════════════════════════════════

/**
 * Critical drug-herb interactions database
 * Evidence levels: A (RCT/Meta-analysis), B (Clinical studies), C (Case reports)
 * Risk levels: LETHAL, HIGH, MODERATE, LOW
 */
export const CRITICAL_INTERACTIONS = {
  // ─── LETHAL / HIGH RISK ───
  warfarin: {
    dangerous: [
      { herb: "St. John's Wort", mechanism: "CYP3A4/2C9 induction → reduced INR → clot risk", risk: "LETHAL", evidence: "A" },
      { herb: "Ginkgo biloba", mechanism: "Antiplatelet effect → bleeding risk synergy", risk: "HIGH", evidence: "A" },
      { herb: "Garlic (high dose)", mechanism: "Antiplatelet + CYP2C9 inhibition → bleeding", risk: "HIGH", evidence: "B" },
      { herb: "Dong Quai", mechanism: "Coumarin content → INR potentiation", risk: "HIGH", evidence: "B" },
      { herb: "Cranberry (large amounts)", mechanism: "CYP2C9 inhibition → INR increase", risk: "MODERATE", evidence: "B" },
      { herb: "Green tea (large amounts)", mechanism: "Vitamin K content → reduced INR", risk: "MODERATE", evidence: "B" },
    ],
    safe: ["Valerian", "Chamomile (moderate)", "Peppermint"],
  },
  digoxin: {
    dangerous: [
      { herb: "St. John's Wort", mechanism: "P-gp induction → reduced digoxin levels → heart failure", risk: "LETHAL", evidence: "A" },
      { herb: "Licorice", mechanism: "Hypokalemia → digoxin toxicity", risk: "HIGH", evidence: "B" },
      { herb: "Hawthorn", mechanism: "Additive cardiac effects → arrhythmia", risk: "HIGH", evidence: "B" },
      { herb: "Aloe vera (oral)", mechanism: "Hypokalemia → digoxin toxicity", risk: "MODERATE", evidence: "C" },
    ],
    safe: ["Chamomile", "Peppermint", "Ginger (small amounts)"],
  },
  ssri: {
    dangerous: [
      { herb: "St. John's Wort", mechanism: "Serotonin syndrome → potentially fatal", risk: "LETHAL", evidence: "A" },
      { herb: "5-HTP", mechanism: "Serotonin excess → serotonin syndrome", risk: "HIGH", evidence: "B" },
      { herb: "SAMe", mechanism: "Serotonin potentiation → serotonin syndrome", risk: "HIGH", evidence: "B" },
      { herb: "Tryptophan", mechanism: "Serotonin excess", risk: "HIGH", evidence: "B" },
    ],
    safe: ["Valerian", "Chamomile", "Lavender", "Ashwagandha (with monitoring)"],
  },
  metformin: {
    dangerous: [
      { herb: "Berberine", mechanism: "Additive hypoglycemia + lactic acidosis risk", risk: "MODERATE", evidence: "B" },
      { herb: "Bitter melon (high dose)", mechanism: "Additive hypoglycemia", risk: "MODERATE", evidence: "C" },
    ],
    caution: [
      { herb: "Fenugreek", mechanism: "May enhance hypoglycemic effect", risk: "LOW", evidence: "B" },
      { herb: "Aloe vera (oral)", mechanism: "May lower blood sugar", risk: "LOW", evidence: "C" },
    ],
    safe: ["Cinnamon (culinary)", "Turmeric", "Ginger"],
  },
  immunosuppressants: {
    dangerous: [
      { herb: "St. John's Wort", mechanism: "CYP3A4 induction → reduced drug levels → organ rejection", risk: "LETHAL", evidence: "A" },
      { herb: "Echinacea", mechanism: "Immune stimulation → counteracts immunosuppression", risk: "HIGH", evidence: "B" },
      { herb: "Astragalus", mechanism: "Immune stimulation → counteracts immunosuppression", risk: "HIGH", evidence: "C" },
      { herb: "Cat's claw", mechanism: "Immune modulation → unpredictable effects", risk: "MODERATE", evidence: "C" },
    ],
    safe: ["Ginger (small amounts)", "Peppermint"],
  },
  lithium: {
    dangerous: [
      { herb: "Caffeine withdrawal", mechanism: "Sudden caffeine stop → lithium level spike → toxicity", risk: "HIGH", evidence: "B" },
      { herb: "Herbal diuretics", mechanism: "Dehydration → lithium concentration → toxicity", risk: "HIGH", evidence: "B" },
    ],
    caution: [
      { herb: "Psyllium", mechanism: "May reduce lithium absorption", risk: "LOW", evidence: "C" },
    ],
    safe: ["Chamomile", "Lavender", "Valerian (with monitoring)"],
  },
  blood_pressure_meds: {
    dangerous: [
      { herb: "Licorice", mechanism: "Mineralocorticoid effect → raises BP → counteracts medication", risk: "HIGH", evidence: "A" },
      { herb: "Ephedra/Ma Huang", mechanism: "Sympathomimetic → severe hypertension", risk: "LETHAL", evidence: "A" },
      { herb: "Yohimbe", mechanism: "Alpha-2 antagonist → hypertensive crisis", risk: "HIGH", evidence: "B" },
    ],
    caution: [
      { herb: "Hawthorn", mechanism: "Additive hypotension → dizziness/falls", risk: "MODERATE", evidence: "B" },
      { herb: "CoQ10", mechanism: "May enhance hypotensive effect", risk: "LOW", evidence: "B" },
    ],
    safe: ["Chamomile", "Valerian", "Magnesium (with monitoring)"],
  },
};

// Drug category mapping (brand name → category)
export const DRUG_CATEGORIES: Record<string, string> = {
  // Warfarin
  coumadin: "warfarin", warfarin: "warfarin", "warfarin sodium": "warfarin",
  // Digoxin
  digoxin: "digoxin", lanoxin: "digoxin",
  // SSRIs
  sertraline: "ssri", zoloft: "ssri", lustral: "ssri",
  fluoxetine: "ssri", prozac: "ssri", depreks: "ssri",
  escitalopram: "ssri", lexapro: "ssri", cipralex: "ssri",
  paroxetine: "ssri", paxil: "ssri", seroxat: "ssri",
  citalopram: "ssri", cipramil: "ssri",
  // Metformin
  metformin: "metformin", glucophage: "metformin", glifor: "metformin",
  // Immunosuppressants
  cyclosporine: "immunosuppressants", tacrolimus: "immunosuppressants",
  mycophenolate: "immunosuppressants", azathioprine: "immunosuppressants",
  prednisone: "immunosuppressants", prednisolone: "immunosuppressants",
  // Lithium
  lithium: "lithium",
  // Blood pressure
  lisinopril: "blood_pressure_meds", enalapril: "blood_pressure_meds",
  amlodipine: "blood_pressure_meds", norvasc: "blood_pressure_meds",
  losartan: "blood_pressure_meds", valsartan: "blood_pressure_meds",
  metoprolol: "blood_pressure_meds", atenolol: "blood_pressure_meds",
  // Turkish brand names
  beloc: "blood_pressure_meds", coversyl: "blood_pressure_meds",
  diovan: "blood_pressure_meds",
};

export interface InteractionCheckResult {
  hasCriticalInteraction: boolean;
  hasModerateInteraction: boolean;
  interactions: Array<{
    drug: string;
    herb: string;
    risk: string;
    mechanism: string;
    evidence: string;
    action: "block" | "warn" | "monitor";
  }>;
  safeHerbs: string[];
  blockedHerbs: string[];
}

export function checkDrugHerbInteractions(
  medications: string[],
  proposedHerbs: string[]
): InteractionCheckResult {
  const result: InteractionCheckResult = {
    hasCriticalInteraction: false,
    hasModerateInteraction: false,
    interactions: [],
    safeHerbs: [],
    blockedHerbs: [],
  };

  for (const med of medications) {
    const medLower = med.toLowerCase().trim();
    const category = DRUG_CATEGORIES[medLower];
    if (!category || !CRITICAL_INTERACTIONS[category as keyof typeof CRITICAL_INTERACTIONS]) continue;

    const drugData = CRITICAL_INTERACTIONS[category as keyof typeof CRITICAL_INTERACTIONS];

    for (const herb of proposedHerbs) {
      const herbLower = herb.toLowerCase().trim();

      // Check dangerous interactions
      const dangerous = drugData.dangerous?.find(
        (d) => herbLower.includes(d.herb.toLowerCase()) || d.herb.toLowerCase().includes(herbLower)
      );

      if (dangerous) {
        const action = dangerous.risk === "LETHAL" || dangerous.risk === "HIGH" ? "block" : "warn";
        if (action === "block") {
          result.hasCriticalInteraction = true;
          result.blockedHerbs.push(herb);
        } else {
          result.hasModerateInteraction = true;
        }

        result.interactions.push({
          drug: med,
          herb: herb,
          risk: dangerous.risk,
          mechanism: dangerous.mechanism,
          evidence: dangerous.evidence,
          action,
        });
        continue;
      }

      // Check caution interactions
      const drugDataWithCaution = drugData as { caution?: Array<{ herb: string; risk: string; mechanism: string; evidence: string }> };
      const caution = drugDataWithCaution.caution?.find(
        (c) => herbLower.includes(c.herb.toLowerCase()) || c.herb.toLowerCase().includes(herbLower)
      );

      if (caution) {
        result.hasModerateInteraction = true;
        result.interactions.push({
          drug: med,
          herb: herb,
          risk: caution.risk,
          mechanism: caution.mechanism,
          evidence: caution.evidence,
          action: "monitor",
        });
        continue;
      }

      // Check if safe
      const isSafe = drugData.safe?.some(
        (s) => herbLower.includes(s.toLowerCase()) || s.toLowerCase().includes(herbLower)
      );
      if (isSafe) {
        result.safeHerbs.push(herb);
      }
    }
  }

  return result;
}

// ═══════════════════════════════════════════════
// LAYER 3: Contraindication Screen
// ═══════════════════════════════════════════════

export interface UserSafetyProfile {
  isPregnant: boolean;
  isBreastfeeding: boolean;
  hasKidneyDisease: boolean;
  hasLiverDisease: boolean;
  age: number | null;
  allergies: string[];
  conditions: string[];
}

export const CONTRAINDICATED_HERBS: Record<string, {
  herbs: string[];
  reason: string;
}> = {
  pregnancy: {
    herbs: [
      "St. John's Wort", "Dong Quai", "Black Cohosh", "Blue Cohosh",
      "Pennyroyal", "Mugwort", "Tansy", "Aloe vera (oral)", "Senna (long-term)",
      "Kava", "Comfrey", "Ephedra", "Licorice (high dose)", "Ginseng",
    ],
    reason: "May cause uterine contractions, hormonal disruption, or fetal harm",
  },
  breastfeeding: {
    herbs: [
      "St. John's Wort", "Kava", "Comfrey", "Ephedra", "Ginseng",
      "Valerian (high dose)", "Sage (high dose)",
    ],
    reason: "May pass into breast milk and affect infant",
  },
  kidney_disease: {
    herbs: [
      "Licorice", "Aloe vera (oral)", "Creatine", "High-dose Vitamin C",
      "Ephedra", "Aristolochia", "Cat's claw",
    ],
    reason: "May worsen kidney function or accumulate to toxic levels",
  },
  liver_disease: {
    herbs: [
      "Kava", "Comfrey", "Chaparral", "Greater Celandine", "Pennyroyal",
      "Germander", "Skullcap (certain species)", "Green tea extract (high dose)",
    ],
    reason: "Hepatotoxic — may cause further liver damage",
  },
  under_12: {
    herbs: [
      "St. John's Wort", "Kava", "Ephedra", "Valerian", "Melatonin",
      "Echinacea", "Ginseng", "Yohimbe",
    ],
    reason: "Insufficient safety data in children, potential developmental effects",
  },
  over_65: {
    herbs: [
      "Ephedra", "Yohimbe", "Kava (without liver monitoring)",
    ],
    reason: "Increased sensitivity, drug interaction risk, fall risk",
  },
};

export interface ContraindicationResult {
  hasContraindication: boolean;
  contraindications: Array<{
    herb: string;
    reason: string;
    condition: string;
    severity: "absolute" | "relative";
  }>;
}

export function checkContraindications(
  profile: UserSafetyProfile,
  proposedHerbs: string[]
): ContraindicationResult {
  const result: ContraindicationResult = {
    hasContraindication: false,
    contraindications: [],
  };

  const conditionsToCheck: string[] = [];
  if (profile.isPregnant) conditionsToCheck.push("pregnancy");
  if (profile.isBreastfeeding) conditionsToCheck.push("breastfeeding");
  if (profile.hasKidneyDisease) conditionsToCheck.push("kidney_disease");
  if (profile.hasLiverDisease) conditionsToCheck.push("liver_disease");
  if (profile.age && profile.age < 12) conditionsToCheck.push("under_12");
  if (profile.age && profile.age >= 65) conditionsToCheck.push("over_65");

  for (const condition of conditionsToCheck) {
    const data = CONTRAINDICATED_HERBS[condition];
    if (!data) continue;

    for (const herb of proposedHerbs) {
      const isContraindicated = data.herbs.some(
        (h) => herb.toLowerCase().includes(h.toLowerCase()) || h.toLowerCase().includes(herb.toLowerCase())
      );
      if (isContraindicated) {
        result.hasContraindication = true;
        result.contraindications.push({
          herb,
          reason: data.reason,
          condition,
          severity: ["pregnancy", "kidney_disease", "liver_disease"].includes(condition) ? "absolute" : "relative",
        });
      }
    }
  }

  return result;
}

// ── Allergy/Intolerance Severity Mapping ──
// Maps reaction types from onboarding to safety severity levels
export const ALLERGY_SEVERITY_MAP: Record<string, "absolute" | "high" | "moderate" | "low_intolerance" | "unknown"> = {
  anaphylaxis: "absolute",        // Never recommend — life-threatening
  urticaria: "high",              // Block recommendation, suggest doctor
  mild_skin: "moderate",          // Warn, suggest doctor consultation
  gi_intolerance: "moderate",     // Warn, side effect not allergy
  intolerance: "low_intolerance", // Inform only, no anaphylaxis risk
  unknown: "unknown",             // Default caution
};

// ═══════════════════════════════════════════════
// LAYER 4: Dosage Limit Validation
// ═══════════════════════════════════════════════

export const MAX_SAFE_DOSAGES: Record<string, {
  maxDaily: string;
  maxDuration: string;
  unit: string;
  notes: string;
}> = {
  "valerian": { maxDaily: "900", maxDuration: "4 weeks", unit: "mg", notes: "Taper off, don't stop suddenly" },
  "st. john's wort": { maxDaily: "900", maxDuration: "8 weeks", unit: "mg", notes: "MANY drug interactions" },
  "turmeric/curcumin": { maxDaily: "2000", maxDuration: "12 weeks", unit: "mg curcumin", notes: "Take with black pepper for absorption" },
  "ashwagandha": { maxDaily: "600", maxDuration: "8 weeks then 2 week break", unit: "mg KSM-66", notes: "Cycling recommended" },
  "melatonin": { maxDaily: "5", maxDuration: "2 weeks without doctor", unit: "mg", notes: "Start with 0.5mg" },
  "omega-3": { maxDaily: "3000", maxDuration: "ongoing", unit: "mg EPA+DHA", notes: "High dose may thin blood" },
  "zinc": { maxDaily: "40", maxDuration: "ongoing", unit: "mg elemental", notes: "Long-term may deplete copper" },
  "vitamin d": { maxDaily: "4000", maxDuration: "ongoing", unit: "IU", notes: "Check blood levels, toxicity risk above 10000 IU" },
  "magnesium": { maxDaily: "400", maxDuration: "ongoing", unit: "mg elemental", notes: "Glycinate/citrate better absorbed than oxide" },
  "iron": { maxDaily: "45", maxDuration: "as directed by doctor", unit: "mg elemental", notes: "Only if deficient, can be toxic" },
};

// ═══════════════════════════════════════════════
// LAYER 5: Transparency & Source Verification
// ═══════════════════════════════════════════════

export interface TransparencyData {
  sources: Array<{
    title: string;
    url: string;
    type: "pubmed" | "who" | "nih" | "cochrane" | "clinical_guideline";
    year: number;
    evidenceLevel: "A" | "B" | "C";
  }>;
  confidenceScore: number; // 0-100
  aiModel: string;
  disclaimer: string;
  limitations: string[];
}

export function generateTransparencyData(
  lang: "en" | "tr",
  sources: Array<{ title: string; url: string; year: number }>,
  hasProfileData: boolean
): TransparencyData {
  return {
    sources: sources.map((s) => ({
      ...s,
      type: s.url.includes("pubmed") ? "pubmed" as const
        : s.url.includes("who") ? "who" as const
        : s.url.includes("nih") ? "nih" as const
        : s.url.includes("cochrane") ? "cochrane" as const
        : "clinical_guideline" as const,
      evidenceLevel: "B" as const, // Default, AI should specify
    })),
    confidenceScore: sources.length >= 3 ? 80 : sources.length >= 1 ? 60 : 30,
    aiModel: "claude-sonnet-4-6",
    disclaimer: tx("safety.disclaimer", lang),
    limitations: [
      tx("safety.aiCanError", lang),
      tx("safety.individualVary", lang),
      tx("safety.latestResearch", lang),
      hasProfileData ? "" : tx("safety.profileIncomplete", lang),
    ].filter(Boolean),
  };
}

// ═══════════════════════════════════════════════
// MASTER SAFETY GUARDRAIL FUNCTION
// ═══════════════════════════════════════════════

/**
 * runSafetyGuardrail — Runs ALL safety checks before any AI recommendation
 *
 * Call this BEFORE sending any query to the AI model.
 * If it returns shouldBlock = true, do NOT generate a recommendation.
 *
 * @param userInput - The user's message/query
 * @param userMedications - List of user's current medications
 * @param proposedHerbs - Herbs that might be recommended (can be empty for initial check)
 * @param userProfile - User's safety-relevant profile data
 * @param lang - Language for messages
 * @returns SafetyGuardrailResult
 */
export interface SafetyGuardrailResult {
  shouldBlock: boolean;
  shouldLimit: boolean;
  blockReason: string | null;
  emergencyMessage: string | null;
  urgencyLevel: "immediate" | "urgent" | "none";
  interactionWarnings: Array<{
    drug: string;
    herb: string;
    risk: string;
    mechanism: string;
    action: "block" | "warn" | "monitor";
  }>;
  contraindicationWarnings: Array<{
    herb: string;
    reason: string;
    condition: string;
  }>;
  blockedHerbs: string[];
  safeHerbs: string[];
  safetyScore: number; // 0-100, higher = safer
  transparency: TransparencyData | null;
}

export function runSafetyGuardrail(
  userInput: string,
  userMedications: string[],
  proposedHerbs: string[],
  userProfile: UserSafetyProfile,
  lang: "en" | "tr" = "en"
): SafetyGuardrailResult {
  // ── LAYER 1: Red Flag Check ──
  // Session 39 hotfix: Layer 1 moved to lib/safety-filter.ts (single
  // source of truth). Callers that need emergency triage should invoke
  // checkRedFlags() from safety-filter first and short-circuit BEFORE
  // calling runSafetyGuardrail. We keep a stub here so the downstream
  // safety-score and shouldLimit logic still type-checks; urgencyLevel
  // "none" makes this path a pass-through.
  const redFlagResult = {
    urgencyLevel: "none" as "none" | "immediate" | "urgent",
    emergencyMessage: null as string | null,
  };
  void userInput;

  // ── LAYER 2: Drug-Herb Interaction Check ──
  const interactionResult = checkDrugHerbInteractions(userMedications, proposedHerbs);

  // ── LAYER 3: Contraindication Check ──
  const contraindicationResult = checkContraindications(userProfile, proposedHerbs);

  // ── Calculate safety score ──
  let safetyScore = 100;
  if (redFlagResult.urgencyLevel === "urgent") safetyScore -= 30;
  if (interactionResult.hasCriticalInteraction) safetyScore -= 50;
  if (interactionResult.hasModerateInteraction) safetyScore -= 20;
  if (contraindicationResult.hasContraindication) safetyScore -= 25;
  safetyScore = Math.max(0, safetyScore);

  // ── Determine block/limit ──
  const shouldBlock = interactionResult.hasCriticalInteraction;
  const shouldLimit = redFlagResult.urgencyLevel === "urgent" ||
    interactionResult.hasModerateInteraction ||
    contraindicationResult.hasContraindication;

  return {
    shouldBlock,
    shouldLimit,
    blockReason: shouldBlock
      ? `Critical drug-herb interaction detected: ${interactionResult.interactions.filter(i => i.action === "block").map(i => `${i.drug} + ${i.herb}`).join(", ")}`
      : null,
    emergencyMessage: redFlagResult.emergencyMessage,
    urgencyLevel: redFlagResult.urgencyLevel,
    interactionWarnings: interactionResult.interactions,
    contraindicationWarnings: contraindicationResult.contraindications.map((c) => ({
      herb: c.herb,
      reason: c.reason,
      condition: c.condition,
    })),
    blockedHerbs: interactionResult.blockedHerbs,
    safeHerbs: interactionResult.safeHerbs,
    safetyScore,
    transparency: generateTransparencyData(lang, [], !!userProfile.age),
  };
}

// ═══════════════════════════════════════════════════════════════
// LAYER 6: KVKK Prompt Anonymization Filter
// Required by KVKK Üretken YZ Rehberi (November 2025)
// Strips PII before any data is sent to AI APIs (Anthropic, Gemini, etc.)
// ═══════════════════════════════════════════════════════════════

export interface AnonymizationLog {
  timestamp: string;
  fieldsStripped: string[];
  ageConverted: boolean;
  originalAgeRange?: string;
  hash: string; // audit hash for compliance logging
}

export interface UserDataForAI {
  // Identity fields — WILL BE STRIPPED
  name?: string;
  full_name?: string;
  firstName?: string;
  lastName?: string;
  surname?: string;
  fullName?: string;
  username?: string;
  display_name?: string;
  email?: string;
  tc_no?: string;
  phone?: string;
  address?: string;
  user_id?: string;
  userId?: string;
  id?: string;
  city?: string;
  ip_address?: string;
  ipAddress?: string;
  avatar_url?: string;
  profile_image?: string;
  birth_date?: string;
  birthDate?: string;

  // Medical fields — WILL BE KEPT (anonymized where needed)
  age?: number;
  gender?: string;
  medications?: unknown;
  allergies?: unknown;
  chronic_conditions?: unknown;
  chronicConditions?: unknown;
  supplements?: unknown;
  symptoms?: string;
  blood_type?: string;
  blood_group?: string;
  bloodGroup?: string;
  pregnancy_status?: string;
  is_pregnant?: boolean;
  is_breastfeeding?: boolean;
  smoking_status?: string;
  smoking_use?: string;
  alcohol_status?: string;
  alcohol_use?: string;
  bmi?: number;
  height_cm?: number;
  weight_kg?: number;
  family_history?: unknown;
  familyHistory?: unknown;
  surgical_history?: unknown;
  surgicalHistory?: unknown;
  vaccines?: unknown;
  diet_type?: string;
  exercise_frequency?: string;
  sleep_quality?: string;

  [key: string]: unknown;
}

const IDENTITY_FIELDS = new Set([
  "name", "full_name", "firstName", "lastName", "surname", "fullName",
  "username", "display_name", "email", "tc_no", "phone", "address",
  "user_id", "userId", "id", "city", "ip_address", "ipAddress",
  "avatar_url", "profile_image", "birth_date", "birthDate",
]);

/** Convert exact age to a privacy-preserving age range. Handles NaN/Infinity/negative defensively. */
export function ageToRange(age: number): string {
  if (!Number.isFinite(age) || age < 0) return "unknown";
  if (age > 120) return "65+"; // cap at reasonable upper bound
  if (age < 18) return "0-17";
  if (age <= 24) return "18-24";
  if (age <= 34) return "25-34";
  if (age <= 44) return "35-44";
  if (age <= 54) return "45-54";
  if (age <= 64) return "55-64";
  return "65+";
}

/**
 * Strip PII patterns (email, Turkish phone, TC no) from free-text strings.
 * Used for symptom descriptions, notes, or other user-entered text.
 */
export function stripPIIFromText(text: string): string {
  if (!text || typeof text !== "string") return text;
  let cleaned = text;

  // Email addresses
  cleaned = cleaned.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[email-removed]");

  // Turkish mobile: +90 5XX XXX XX XX or 05XX XXX XX XX variants
  cleaned = cleaned.replace(/(\+90|0)[\s-]?5\d{2}[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}/g, "[phone-removed]");

  // TC Kimlik No: 11-digit number starting with non-zero
  cleaned = cleaned.replace(/\b[1-9]\d{10}\b/g, "[tc-removed]");

  // Generic URL containing potential PII
  cleaned = cleaned.replace(/https?:\/\/\S+/g, "[url-removed]");

  return cleaned;
}

/** Generate a short non-cryptographic hash for audit log correlation (no PII) */
function generateAuditHash(fields: string[], timestamp: string): string {
  const data = JSON.stringify({ fields, timestamp });
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, "0");
}

/**
 * Anonymize user data before sending to AI APIs.
 * - Strips identity fields (name, email, user_id, phone, address, etc.)
 * - Converts exact age to age range (18-24, 25-34, etc.)
 * - Scans string fields for embedded PII patterns
 * - Returns audit log for KVKK compliance records
 *
 * USAGE:
 *   const { anonymized, log } = anonymizePromptData(userProfile);
 *   console.log('[KVKK-ANON]', JSON.stringify(log));
 *   const promptContext = JSON.stringify(anonymized);
 *   // Now safe to send to AI API
 */
export function anonymizePromptData(userData: UserDataForAI): {
  anonymized: Record<string, unknown>;
  log: AnonymizationLog;
} {
  const fieldsStripped: string[] = [];
  const anonymized: Record<string, unknown> = {};
  let ageConverted = false;
  let ageRange: string | undefined;

  // Defensive: accept undefined/null/primitive and return empty anonymized object
  if (!userData || typeof userData !== "object" || Array.isArray(userData)) {
    const timestamp = new Date().toISOString();
    return {
      anonymized: {},
      log: {
        timestamp,
        fieldsStripped: [],
        ageConverted: false,
        hash: generateAuditHash([], timestamp),
      },
    };
  }

  for (const [key, value] of Object.entries(userData)) {
    if (value === undefined || value === null) continue;

    // Identity → strip
    if (IDENTITY_FIELDS.has(key)) {
      fieldsStripped.push(key);
      continue;
    }

    // Exact age → age range (handles NaN via ageToRange guard)
    if (key === "age" && typeof value === "number") {
      const range = ageToRange(value);
      anonymized["age_range"] = range;
      ageConverted = true;
      ageRange = range;
      continue;
    }

    // Birth date → strip (could be re-identifying)
    // Match only exact "birth*" or "dob" keys to avoid false positives like "birthrate"
    const lowerKey = key.toLowerCase();
    if (
      lowerKey === "dob" ||
      lowerKey.startsWith("birth_") ||
      lowerKey.startsWith("birthdate") ||
      lowerKey.startsWith("birthday") ||
      lowerKey === "dateofbirth" ||
      lowerKey === "dateofbirthday"
    ) {
      fieldsStripped.push(key);
      continue;
    }

    // String fields → scan for PII patterns
    if (typeof value === "string") {
      anonymized[key] = stripPIIFromText(value);
      continue;
    }

    // Arrays of strings → scan each element
    if (Array.isArray(value)) {
      anonymized[key] = value.map(item =>
        typeof item === "string" ? stripPIIFromText(item) : item
      );
      continue;
    }

    // Primitives / other objects → pass through
    anonymized[key] = value;
  }

  const timestamp = new Date().toISOString();
  const log: AnonymizationLog = {
    timestamp,
    fieldsStripped,
    ageConverted,
    originalAgeRange: ageRange,
    hash: generateAuditHash(fieldsStripped, timestamp),
  };

  return { anonymized, log };
}

/** Convenience wrapper: anonymize + auto-log (fire-and-forget) */
export function anonymizeForAI(userData: UserDataForAI): Record<string, unknown> {
  const { anonymized, log } = anonymizePromptData(userData);
  // eslint-disable-next-line no-console
  console.log("[KVKK-ANON]", JSON.stringify(log));
  return anonymized;
}

// ═══════════════════════════════════════════════════════════════
// LAYER 7: KVKK Prompt Injection Protection
// Required by KVKK Üretken YZ Rehberi (Kasım 2025):
// "İstem enjeksiyonuna karşı teknik kontrollerin uygulanması tavsiye edilir."
// ═══════════════════════════════════════════════════════════════

export interface InjectionDetectionResult {
  isSafe: boolean;
  threatType: string | null;
  threatLevel: "none" | "low" | "medium" | "high";
  userMessage: { en: string; tr: string } | null;
}

interface InjectionPatternConfig {
  patterns: RegExp[];
  level: "low" | "medium" | "high";
  message: { en: string; tr: string };
}

const INJECTION_PATTERNS: Record<string, InjectionPatternConfig> = {
  // System prompt leak attempts
  system_prompt_leak: {
    patterns: [
      /system\s*prompt/i,
      /system\s*message/i,
      /system\s*instruction/i,
      /initial\s*prompt/i,
      /original\s*instruction/i,
      /what\s*are\s*your\s*(instructions|rules|guidelines)/i,
      /show\s*(me\s*)?(your|the)\s*(prompt|instructions|rules)/i,
      /repeat\s*(your|the)\s*(system|initial|original)/i,
      /print\s*(your|the)\s*(system|initial|original)/i,
      /sistem\s*promptu/i,
      /talimatlar[ıi]n[ıi]\s*(göster|yaz|tekrarla|söyle)/i,
      /kurallar[ıi]n[ıi]\s*(göster|yaz)/i,
      /ilk\s*talimat/i,
    ],
    level: "high",
    message: {
      en: "I can't share my system instructions. How can I help you with health information?",
      tr: "Sistem talimatlarımı paylaşamam. Sağlık bilgilendirmesi konusunda nasıl yardımcı olabilirim?",
    },
  },

  // Instruction override attempts
  instruction_override: {
    patterns: [
      /ignore\s*(all\s*)?(previous|prior|above|earlier)\s*(instructions|prompts|rules)/i,
      /forget\s*(all\s*)?(previous|prior|your)\s*(instructions|rules)/i,
      /disregard\s*(all\s*)?(previous|prior|your)/i,
      /override\s*(your|the|all)\s*(rules|instructions|safety)/i,
      /bypass\s*(your|the|all)\s*(rules|safety|filter)/i,
      /önceki\s*talimatları\s*(unut|yoksay|geç)/i,
      /kuralları\s*(unut|yoksay|geç|atla)/i,
      /güvenlik\s*(filtre|kural|sistem)\w*\s*(kapat|devre\s*dışı|atla)/i,
      /tüm\s*kısıtlamaları\s*(kaldır|kapat)/i,
    ],
    level: "high",
    message: {
      en: "I always follow my safety guidelines. How can I help you with health information?",
      tr: "Güvenlik kurallarıma her zaman uyarım. Sağlık bilgilendirmesi konusunda nasıl yardımcı olabilirim?",
    },
  },

  // Role change / jailbreak
  role_change: {
    patterns: [
      /pretend\s*(you\s*are|to\s*be|you're)/i,
      /act\s*as\s*(if|a|an|though)/i,
      /you\s*are\s*now\s*(a|an|no\s*longer)/i,
      /roleplay\s*as/i,
      /\bDAN\s*mode\b/i,
      /developer\s*mode/i,
      /jailbreak/i,
      /do\s*anything\s*now/i,
      /rol\s*yap/i,
      /şimdi\s*sen\s*(bir|artık)/i,
      /gibi\s*davran/i,
      /doktor\s*gibi\s*(cevap|yanıt)\s*ver/i,
    ],
    level: "medium",
    message: {
      en: "I'm DoctoPal, a health information assistant. I can't take on other roles. How can I help?",
      tr: "Ben DoctoPal sağlık bilgilendirme asistanıyım. Başka roller üstlenemem. Nasıl yardımcı olabilirim?",
    },
  },

  // Other user data requests
  data_exfiltration: {
    patterns: [
      /other\s*user/i,
      /another\s*patient/i,
      /someone\s*else'?s\s*(data|profile|record)/i,
      /all\s*users/i,
      /database\s*(dump|export|query)/i,
      /show\s*me\s*(all|every)\s*(patient|user|record)/i,
      /başka\s*(kullanıcı|hasta)/i,
      /diğer\s*(kullanıcı|hasta)/i,
      /tüm\s*(kullanıcı|hasta|kayıt)/i,
      /veritabanı\s*(dump|kopya|export)/i,
    ],
    level: "high",
    message: {
      en: "I can only access your own health data. I cannot show other users' information.",
      tr: "Sadece kendi sağlık verilerinize erişebilirim. Başka kullanıcıların bilgilerini gösteremem.",
    },
  },

  // Harmful content generation
  harmful_content: {
    patterns: [
      /how\s*to\s*(make|create|synthesize)\s*(poison|drug|bomb|weapon)/i,
      /zehir\s*(yap|hazırla|üret)/i,
      /uyuşturucu\s*(yap|hazırla|üret)/i,
      /kendine\s*zarar\s*(verme|verebilir)/i,
      /nasıl\s*(intihar\s*ed|öl[üe])/i,
    ],
    level: "high",
    message: {
      en: "I can't help with that request. If you're in crisis, please call 112 or reach out to a mental health professional.",
      tr: "Bu talepte yardımcı olamam. Zor bir dönemdeyseniz lütfen 112'yi arayın veya bir ruh sağlığı uzmanına başvurun.",
    },
  },
};

/**
 * Detect prompt injection attempts in user input.
 * Runs BEFORE the input is sent to any AI API.
 * Returns threat classification + safe user-facing message if blocked.
 */
export function detectPromptInjection(userInput: string): InjectionDetectionResult {
  if (!userInput || typeof userInput !== "string") {
    return { isSafe: true, threatType: null, threatLevel: "none", userMessage: null };
  }

  const input = userInput.trim();

  // Excessive length (potential token injection)
  if (input.length > 5000) {
    return {
      isSafe: false,
      threatType: "excessive_length",
      threatLevel: "medium",
      userMessage: {
        en: "Your message is too long. Please keep it under 5000 characters.",
        tr: "Mesajınız çok uzun. Lütfen 5000 karakterin altında tutun.",
      },
    };
  }

  // Base64-encoded content (potential hidden commands)
  const base64Candidate = input.replace(/\s/g, "");
  if (base64Candidate.length >= 50 && /^[A-Za-z0-9+/=]+$/.test(base64Candidate)) {
    return {
      isSafe: false,
      threatType: "encoded_content",
      threatLevel: "medium",
      userMessage: {
        en: "Please write your question in plain text.",
        tr: "Lütfen sorunuzu düz metin olarak yazın.",
      },
    };
  }

  // Pattern-based detection
  for (const [threatType, config] of Object.entries(INJECTION_PATTERNS)) {
    for (const pattern of config.patterns) {
      if (pattern.test(input)) {
        // eslint-disable-next-line no-console
        console.warn(`[KVKK-INJECTION] Detected: ${threatType} | Input: ${input.substring(0, 100)}`);
        return {
          isSafe: false,
          threatType,
          threatLevel: config.level,
          userMessage: config.message,
        };
      }
    }
  }

  return { isSafe: true, threatType: null, threatLevel: "none", userMessage: null };
}
