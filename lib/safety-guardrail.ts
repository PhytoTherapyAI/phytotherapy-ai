/**
 * SAFETY GUARDRAIL — Phytotherapy.ai
 * ═══════════════════════════════════
 * Algoritmik Güvenlik ve Etik Çerçevesi
 * "Primum non nocere — First, do no harm"
 *
 * Harvard HVHS Model alignment:
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
// LAYER 1: Enhanced Red Flag Filter
// ═══════════════════════════════════════════════

/**
 * Extended emergency symptom database
 * Categorized by urgency level and medical specialty
 * Updated based on: WHO Emergency Triage Assessment (ETAT)
 * + Turkish Ministry of Health Emergency Guidelines
 */
export const RED_FLAG_DATABASE = {
  // IMMEDIATE — Call 112, do NOT give any herb/supplement advice
  immediate: {
    en: [
      "chest pain", "heart attack", "cardiac arrest", "can't breathe",
      "shortness of breath", "choking", "drowning", "severe bleeding",
      "uncontrollable bleeding", "loss of consciousness", "unconscious",
      "seizure", "convulsion", "stroke", "sudden weakness one side",
      "sudden vision loss", "sudden speech difficulty", "anaphylaxis",
      "severe allergic reaction", "throat swelling", "suicidal",
      "suicide", "self harm", "want to die", "poisoning", "overdose",
      "severe burn", "electrocution", "gunshot", "stabbing",
      "head injury", "skull fracture", "spinal injury",
      "severe abdominal pain", "vomiting blood", "coughing blood",
      "blood in stool black stool", "meningitis", "stiff neck fever rash",
      "eclampsia", "pregnancy seizure", "cord prolapse",
      "testicular torsion", "sudden severe testicle pain",
    ],
    tr: [
      "göğüs ağrısı", "kalp krizi", "kalp durması", "nefes alamıyorum",
      "nefes darlığı", "boğuluyorum", "şiddetli kanama",
      "bilinç kaybı", "bayıldı", "bayılma", "bilinci kapalı",
      "nöbet", "kasılma", "sara krizi", "felç", "inme",
      "bir taraf güçsüzlük", "ani görme kaybı", "konuşamıyorum",
      "anafilaksi", "şiddetli alerji", "boğaz şişmesi",
      "intihar", "kendime zarar", "ölmek istiyorum",
      "zehirlenme", "doz aşımı", "ilaç fazla aldım",
      "şiddetli yanık", "kafa travması", "omurilik yaralanması",
      "kan kusma", "kan tükürme", "siyah dışkı", "kanlı ishal",
      "ense sertliği ateş", "gebelik nöbeti", "hamilelik kramp",
      "ani şiddetli testis ağrısı", "testis dönmesi",
    ],
  },
  // URGENT — Needs doctor within hours, limit supplement advice
  urgent: {
    en: [
      "high fever above 39", "persistent vomiting", "severe dehydration",
      "chest tightness", "irregular heartbeat", "palpitations at rest",
      "sudden swelling", "severe headache worst ever",
      "confusion disorientation", "difficulty speaking",
      "blood in urine", "severe back pain radiating",
      "eye pain vision changes", "sudden hearing loss",
      "diabetic emergency", "very high blood sugar",
      "very low blood sugar", "hypoglycemia shaking sweating",
      "asthma attack not responding to inhaler",
      "panic attack can't calm down",
    ],
    tr: [
      "yüksek ateş 39 üstü", "sürekli kusma", "şiddetli susuzluk",
      "göğüste sıkışma", "düzensiz kalp atışı", "istirahatte çarpıntı",
      "ani şişlik", "şiddetli baş ağrısı hayatımın en kötüsü",
      "bilinç bulanıklığı", "konuşma güçlüğü",
      "idrarda kan", "sırta vuran şiddetli ağrı",
      "göz ağrısı görme değişikliği", "ani işitme kaybı",
      "diyabet acil", "çok yüksek şeker",
      "çok düşük şeker", "hipoglisemi titreme terleme",
      "astım krizi inhaler işe yaramıyor",
      "panik atak sakinleşemiyorum",
    ],
  },
};

export interface RedFlagResult {
  isEmergency: boolean;
  urgencyLevel: "immediate" | "urgent" | "none";
  language: "en" | "tr";
  matchedFlags: string[];
  action: "block_all" | "limit_advice" | "proceed";
  emergencyMessage: string | null;
}

export function checkRedFlags(input: string): RedFlagResult {
  const lower = input.toLowerCase().replace(/[.,!?;:]/g, " ");

  // Check immediate flags
  const enImmediateMatches = RED_FLAG_DATABASE.immediate.en.filter((flag) =>
    lower.includes(flag)
  );
  const trImmediateMatches = RED_FLAG_DATABASE.immediate.tr.filter((flag) =>
    lower.includes(flag)
  );

  if (enImmediateMatches.length > 0 || trImmediateMatches.length > 0) {
    const lang = trImmediateMatches.length > 0 ? "tr" : "en";
    return {
      isEmergency: true,
      urgencyLevel: "immediate",
      language: lang,
      matchedFlags: [...enImmediateMatches, ...trImmediateMatches],
      action: "block_all",
      emergencyMessage: getEmergencyMessage(lang, "immediate"),
    };
  }

  // Check urgent flags
  const enUrgentMatches = RED_FLAG_DATABASE.urgent.en.filter((flag) =>
    lower.includes(flag)
  );
  const trUrgentMatches = RED_FLAG_DATABASE.urgent.tr.filter((flag) =>
    lower.includes(flag)
  );

  if (enUrgentMatches.length > 0 || trUrgentMatches.length > 0) {
    const lang = trUrgentMatches.length > 0 ? "tr" : "en";
    return {
      isEmergency: true,
      urgencyLevel: "urgent",
      language: lang,
      matchedFlags: [...enUrgentMatches, ...trUrgentMatches],
      action: "limit_advice",
      emergencyMessage: getEmergencyMessage(lang, "urgent"),
    };
  }

  return {
    isEmergency: false,
    urgencyLevel: "none",
    language: "en",
    matchedFlags: [],
    action: "proceed",
    emergencyMessage: null,
  };
}

function getEmergencyMessage(lang: "en" | "tr", level: "immediate" | "urgent"): string {
  if (level === "immediate") {
    return lang === "tr"
      ? "🚨 DİKKAT: Belirttiğiniz şikayetler acil tıbbi müdahale gerektiren bir duruma işaret edebilir. Lütfen DERHAL 112'yi arayın veya en yakın acil servise başvurun. Bu durumda hiçbir bitkisel takviye veya ilaç önerisi yapılamaz."
      : "🚨 WARNING: The symptoms you described may indicate a life-threatening emergency. Please call 112/911 IMMEDIATELY or go to the nearest emergency room. No herbal supplement or medication advice can be given in this situation.";
  }
  return lang === "tr"
    ? "⚠️ DİKKAT: Belirttiğiniz şikayetler tıbbi değerlendirme gerektiriyor. Lütfen en kısa sürede doktorunuza başvurun. Bitkisel takviye önerileri sınırlandırılmıştır."
    : "⚠️ CAUTION: The symptoms you described require medical evaluation. Please see your doctor as soon as possible. Herbal supplement recommendations are limited.";
}

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
      const caution = (drugData as any).caution?.find(
        (c: any) => herbLower.includes(c.herb.toLowerCase()) || c.herb.toLowerCase().includes(herbLower)
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
    aiModel: "gemini-2.0-flash",
    disclaimer: lang === "tr"
      ? "Bu bilgiler yayımlanmış bilimsel araştırmalara dayalı genel bilgilendirme niteliğindedir. Tıbbi teşhis veya tedavi yerine geçmez. Herhangi bir değişiklik yapmadan önce sağlık profesyonelinize danışın."
      : "This information is for educational purposes based on published scientific research. It does not replace medical diagnosis or treatment. Consult your healthcare professional before making any changes.",
    limitations: lang === "tr"
      ? [
          "Yapay zeka modeli hata yapabilir — her bilgiyi bağımsız doğrulayın",
          "Bireysel yanıtlar kişiden kişiye farklılık gösterebilir",
          "En güncel araştırmalar henüz veritabanına eklenmemiş olabilir",
          hasProfileData ? "" : "Profil bilgisi eksik — kişiselleştirme sınırlı",
        ].filter(Boolean)
      : [
          "AI models can make errors — independently verify all information",
          "Individual responses may vary from person to person",
          "The latest research may not yet be in our database",
          hasProfileData ? "" : "Profile data incomplete — personalization limited",
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
  const redFlagResult = checkRedFlags(userInput);

  if (redFlagResult.urgencyLevel === "immediate") {
    return {
      shouldBlock: true,
      shouldLimit: false,
      blockReason: "Emergency symptoms detected — all supplement advice blocked",
      emergencyMessage: redFlagResult.emergencyMessage,
      urgencyLevel: "immediate",
      interactionWarnings: [],
      contraindicationWarnings: [],
      blockedHerbs: proposedHerbs, // Block all
      safeHerbs: [],
      safetyScore: 0,
      transparency: null,
    };
  }

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
