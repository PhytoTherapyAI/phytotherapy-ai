// © 2026 DoctoPal — All Rights Reserved
// ═══════════════════════════════════════════════════════════════
// 1219 s.K. Uyum — 4 Katmanlı AI Output Güvenlik Filtresi (MADDE 9)
// AI yanıtı kullanıcıya gösterilmeden ÖNCE çalışır.
// - Teşhis ifadelerini bilgilendirmeye dönüştürür
// - Reçete formatını araştırma referansına dönüştürür
// - Bitkisel tavsiyeyi güvenli formata dönüştürür
// - Acil durum tespiti → 112 yönlendirmesi
// ═══════════════════════════════════════════════════════════════

export interface FilterResult {
  text: string;
  modifications: string[];
  emergencyDetected: boolean;
  originalText: string;
}

// ═══════════════════════════════════════════════
// LAYER 1: Diagnosis statements → informational
// ═══════════════════════════════════════════════

const DIAGNOSIS_PATTERNS: Array<{ pattern: RegExp; replacement: string }> = [
  // TR: "Sizde X var" / "X var" (after "sizde/sende")
  {
    pattern: /(?:sizde|sende)\s+(.+?)\s+(?:var|bulunmaktadır|mevcut|tespit\s+edildi|saptandı)/gi,
    replacement: "belirttiğiniz semptomlar $1 ile uyumlu olabilir. Kesin tanı için bir uzmana başvurmanızı öneririz",
  },
  // TR: "X hastalığınız var"
  {
    pattern: /(.+?)\s+hastalığınız\s+(?:var|bulunmaktadır|mevcut)/gi,
    replacement: "belirtileriniz $1 ile uyumlu olabilir. Kesin tanı için doktorunuza danışın",
  },
  // TR: "Tanınız X"
  {
    pattern: /tanınız\s+(.+?)(?:\.|,|;|\s+olarak)/gi,
    replacement: "belirtileriniz $1 ile uyumlu olabilir",
  },
  // TR: "kesin olarak X teşhis/tanı"
  {
    pattern: /kesin\s+olarak\s+(.+?)\s+(?:teşhis|tanı)/gi,
    replacement: "belirtileriniz $1 yönünde değerlendirilebilir",
  },
  // EN: "You have been diagnosed with X" / "You are diagnosed with X" — STRICT to avoid false positives
  // (Generic "You have X" is NOT matched — would trigger on "You have three options")
  {
    pattern: /you\s+(?:have\s+been\s+|are\s+)diagnosed\s+with\s+([^.,;:\n]+?)(?=[.,;:\n])/gi,
    replacement: "your symptoms may be consistent with $1. Please consult your doctor for a definitive diagnosis",
  },
  // EN: "I diagnose you with X" / "The diagnosis is X"
  {
    pattern: /(?:i\s+diagnose\s+you\s+with|the\s+diagnosis\s+is)\s+([^.,;:\n]+?)(?=[.,;:\n])/gi,
    replacement: "your symptoms may be consistent with $1. A healthcare professional should confirm this",
  },
  // EN: "Your diagnosis is X"
  {
    pattern: /your\s+diagnosis\s+is\s+([^.,;:\n]+?)(?=[.,;:\n])/gi,
    replacement: "your symptoms may suggest $1. A healthcare professional should confirm this",
  },
  // EN: "You are suffering from X"
  {
    pattern: /you\s+(?:are\s+)?suffering\s+from\s+([^.,;:\n]+?)(?=[.,;:\n])/gi,
    replacement: "your symptoms may be related to $1. Please consult a specialist",
  },
];

function filterDiagnosis(text: string): { text: string; mods: string[] } {
  let filtered = text;
  const mods: string[] = [];
  for (const { pattern, replacement } of DIAGNOSIS_PATTERNS) {
    const before = filtered;
    filtered = filtered.replace(pattern, replacement);
    if (filtered !== before) {
      mods.push("[KATMAN-1] Teşhis ifadesi bilgilendirmeye dönüştürüldü");
    }
  }
  return { text: filtered, mods };
}

// ═══════════════════════════════════════════════
// LAYER 2: Prescription format → research reference
// ═══════════════════════════════════════════════

const PRESCRIPTION_PATTERNS: Array<{
  pattern: RegExp;
  replaceFn: (match: string, ...groups: string[]) => string;
}> = [
  // TR: "500mg Metformin günde 2 kez alın"
  {
    pattern: /(\d+)\s*(?:mg|mcg|µg|ml|IU|iu)\s+(.+?)\s+(?:günde|haftada|ayda)\s+(\d+)\s*(?:kez|defa|tablet|kapsül|damla)\s*(?:alın|kullanın|için|alınız|kullanınız|al|kullan)/gi,
    replaceFn: (_m, dose, drug) =>
      `araştırmalarda ${drug.trim()} ${dose}mg ve üzeri dozlarda çalışılmıştır. Doktorunuzun belirlediği dozu takip edin`,
  },
  // TR: "Metformin ilacını 500 mg dozunda alın"
  {
    pattern: /(.+?)\s+(?:ilacını|ilacı|tablet|kapsül)\s+(\d+)\s*(?:mg|mcg|µg|ml|IU)\s+(?:dozunda|dozda)\s*(?:alın|kullanın|al|kullan)/gi,
    replaceFn: (_m, drug, dose) =>
      `araştırmalarda ${drug.trim()} ${dose}mg aralığında çalışılmıştır. Dozaj için doktorunuza danışın`,
  },
  // TR: "Günde 2 kez 500 mg Metformin alın"
  {
    pattern: /günde\s+(\d+)\s*(?:kez|defa)\s+(\d+)\s*(?:mg|mcg|µg|ml|IU)\s+(.+?)\s*(?:alın|kullanın|al|kullan)/gi,
    replaceFn: (_m, _freq, dose, drug) =>
      `araştırmalarda ${drug.trim()} günlük ${dose}mg dozlarında çalışılmıştır. Doktorunuzun önerisini takip edin`,
  },
  // EN: "Take 500 mg of Metformin twice daily"
  {
    pattern: /take\s+(\d+)\s*(?:mg|mcg|µg|ml|IU)\s+(?:of\s+)?([a-zA-Z][\w\s-]{2,30}?)\s+(\d+|once|twice|three\s+times)\s*(?:times?\s+)?(?:daily|a\s+day|per\s+day)/gi,
    replaceFn: (_m, dose, drug) =>
      `research has studied ${drug.trim()} at doses around ${dose}mg. Follow your doctor's prescribed dosage`,
  },
  // EN: "Metformin 500mg twice daily"
  {
    pattern: /([a-zA-Z][\w\s-]{2,30}?)\s+(\d+)\s*(?:mg|mcg|µg|ml|IU)\s+(?:once|twice|three\s+times)\s+(?:daily|a\s+day)/gi,
    replaceFn: (_m, drug, dose) =>
      `research has studied ${drug.trim()} at ${dose}mg doses. Consult your doctor for proper dosing`,
  },
];

// Simple catch-all patterns (run after detailed ones)
const SIMPLE_DOSE_PATTERNS: Array<{ pattern: RegExp; replacement: string }> = [
  { pattern: /(\d+)\s*(?:mg|mcg|µg|ml)\s*(?:alın|kullanın|alınız|kullanınız|al\b)/gi, replacement: "Dozaj için doktorunuza danışın" },
  { pattern: /take\s+(\d+)\s*(?:mg|mcg|µg|ml)\b(?!.*?(?:research|studied))/gi, replacement: "Consult your doctor for proper dosage" },
];

function filterPrescription(text: string): { text: string; mods: string[] } {
  let filtered = text;
  const mods: string[] = [];
  for (const { pattern, replaceFn } of PRESCRIPTION_PATTERNS) {
    const before = filtered;
    filtered = filtered.replace(pattern, replaceFn);
    if (filtered !== before) {
      mods.push("[KATMAN-2] Reçete formatı araştırma referansına dönüştürüldü");
    }
  }
  for (const { pattern, replacement } of SIMPLE_DOSE_PATTERNS) {
    const before = filtered;
    filtered = filtered.replace(pattern, replacement);
    if (filtered !== before) {
      mods.push("[KATMAN-2] Basit dozaj ifadesi dönüştürüldü");
    }
  }
  return { text: filtered, mods };
}

// ═══════════════════════════════════════════════
// LAYER 3: GETAT / Herbal safe format
// ═══════════════════════════════════════════════

const HERBAL_ADVICE_PATTERNS: Array<{ pattern: RegExp; replacement: string }> = [
  // TR: "X için Y kullanın/deneyin/alın/iyidir" — ama "araştırmalarda" veya "çalışılmıştır" varsa atla
  {
    pattern: /(?<!araştırmalarda\s)([^.,\n]+?)\s+için\s+([^.,\n]+?)\s+(?:kullanın|deneyin|alın|kullanabilirsiniz|deneyebilirsiniz|önerilir|tavsiye\s+edilir|faydalıdır|iyidir)(?!\s*araştır)/gi,
    replacement: "araştırmalarda $2, $1 açısından çalışılmıştır. Kullanmadan önce doktorunuza danışın",
  },
  // TR: "Y bitkisi X'e iyi gelir / faydalıdır / tedavi eder"
  {
    pattern: /([^.,\n]+?)\s+(?:bitkisi|otu|çayı|yağı|özütü)\s+([^.,\n]+?)\s*(?:iyi\s+gelir|faydalıdır|etkilidir|yardımcıdır|tedavi\s+eder)/gi,
    replacement: "$1 bitkisi, $2 konusunda araştırmalara konu olmuştur. Kullanmadan önce doktorunuza danışın",
  },
  // EN: "Use/Try/Take X for Y" — skip if already "has been studied"
  {
    pattern: /(?<!has\s+been\s+studied\s+)(?:use|try|take)\s+([^.,;:\n]+?)\s+for\s+([^.,;:\n]+?)(?=[.,;:\n])/gi,
    replacement: "research has studied $1 for $2. Consult your healthcare provider before use",
  },
  // EN: "X is good for Y / helps with Y / treats Y / cures Y"
  {
    pattern: /([a-zA-Z][\w\s-]{2,40})\s+(?:is\s+good\s+for|helps?\s+with|treats?|cures?)\s+([^.,;:\n]+?)(?=[.,;:\n])/gi,
    replacement: "$1 has been studied in research regarding $2. Consult your doctor before use",
  },
];

function filterHerbalAdvice(text: string): { text: string; mods: string[] } {
  let filtered = text;
  const mods: string[] = [];
  for (const { pattern, replacement } of HERBAL_ADVICE_PATTERNS) {
    const before = filtered;
    filtered = filtered.replace(pattern, replacement);
    if (filtered !== before) {
      mods.push("[KATMAN-3] Bitkisel tavsiye güvenli formata dönüştürüldü");
    }
  }
  return { text: filtered, mods };
}

// ═══════════════════════════════════════════════
// LAYER 4: Emergency override
// ═══════════════════════════════════════════════

const EMERGENCY_KEYWORDS = {
  tr: [
    "göğüs ağrısı", "kalp krizi", "nefes darlığı", "nefes alamıyorum",
    "bilinç kaybı", "bayılma", "felç", "inme", "şiddetli kanama",
    "zehirlenme", "doz aşımı", "intihar", "kendime zarar",
    "anafilaksi", "boğaz şişmesi", "nöbet", "sara krizi",
  ],
  en: [
    "chest pain", "heart attack", "can't breathe", "cant breathe",
    "shortness of breath", "loss of consciousness", "stroke",
    "severe bleeding", "poisoning", "overdose", "suicidal", "self harm",
    "anaphylaxis", "throat swelling", "seizure",
  ],
};

const EMERGENCY_PREPEND = {
  tr: "⚠️ **ACİL DURUM**: Belirttiğiniz semptomlar acil tıbbi müdahale gerektirebilir. Lütfen hemen **112**'yi arayın veya en yakın acil servise başvurun. Aşağıdaki bilgiler yalnızca genel bilgilendirme amaçlıdır ve acil tıbbi yardımın yerini almaz.\n\n",
  en: "⚠️ **EMERGENCY**: Your symptoms may require immediate medical attention. Please call **112** (or your local emergency number) immediately. The information below is for general informational purposes only and does not replace emergency medical care.\n\n",
};

function checkEmergency(text: string, userQuery?: string): { isEmergency: boolean; lang: "tr" | "en" } {
  const combined = `${userQuery || ""} ${text}`.toLowerCase();
  for (const keyword of EMERGENCY_KEYWORDS.tr) {
    if (combined.includes(keyword)) return { isEmergency: true, lang: "tr" };
  }
  for (const keyword of EMERGENCY_KEYWORDS.en) {
    if (combined.includes(keyword)) return { isEmergency: true, lang: "en" };
  }
  return { isEmergency: false, lang: "tr" };
}

// ═══════════════════════════════════════════════
// MAIN FILTER FUNCTION
// ═══════════════════════════════════════════════

export function filterAIOutput(
  aiResponse: string,
  options?: {
    userQuery?: string;
    lang?: "tr" | "en";
    /** Skip emergency layer if already handled upstream (e.g., triage) */
    skipEmergency?: boolean;
  }
): FilterResult {
  const modifications: string[] = [];
  let text = aiResponse;
  let emergencyDetected = false;

  // LAYER 4: Emergency detection (runs first to prepend warning)
  if (!options?.skipEmergency) {
    const emergency = checkEmergency(text, options?.userQuery);
    if (emergency.isEmergency) {
      emergencyDetected = true;
      // Don't double-prepend if AI already said "⚠️"
      if (!text.trimStart().startsWith("⚠️")) {
        text = EMERGENCY_PREPEND[emergency.lang] + text;
        modifications.push("[KATMAN-4] Acil durum tespit edildi — 112 yönlendirmesi eklendi");
      } else {
        modifications.push("[KATMAN-4] Acil durum tespit edildi (AI zaten uyarı vermiş)");
      }
    }
  }

  // LAYER 1: Diagnosis statements
  const diag = filterDiagnosis(text);
  text = diag.text;
  modifications.push(...diag.mods);

  // LAYER 2: Prescription format
  const presc = filterPrescription(text);
  text = presc.text;
  modifications.push(...presc.mods);

  // LAYER 3: Herbal advice
  const herbal = filterHerbalAdvice(text);
  text = herbal.text;
  modifications.push(...herbal.mods);

  // Audit log
  if (modifications.length > 0) {
    // eslint-disable-next-line no-console
    console.log("[KVKK-OUTPUT-FILTER]", JSON.stringify({
      timestamp: new Date().toISOString(),
      modifications,
      emergencyDetected,
    }));
  }

  return { text, modifications, emergencyDetected, originalText: aiResponse };
}
