// © 2026 DoctoPal — Shared condition name translations (EN ↔ TR)

export const CONDITION_TRANSLATIONS: Record<string, string> = {
  // Cardiovascular
  "Hypertension": "Hipertansiyon",
  "Arrhythmia": "Aritmi",
  "Heart Failure": "Kalp Yetmezliği",
  // Endocrine
  "Diabetes": "Diyabet",
  "Diabetes (Type 1)": "Diyabet (Tip 1)",
  "Diabetes (Type 2)": "Diyabet (Tip 2)",
  "Thyroid": "Tiroid",
  "Thyroid Disorder": "Tiroid Bozukluğu",
  // Neurological
  "Depression/Anxiety": "Depresyon/Anksiyete",
  "Depression": "Depresyon",
  "Anxiety": "Anksiyete",
  "Epilepsy": "Epilepsi",
  // Respiratory
  "Asthma": "Astım",
  "COPD": "KOAH",
  // Critical
  "Bleeding Disorder": "Kanama Bozukluğu",
  "Immune Suppressed": "Bağışıklık Baskılanması",
  // Surgical
  "Bariatric Surgery": "Bariatrik Cerrahi",
  "Stent Placement": "Stent Yerleştirme",
  "Bypass Surgery": "Bypass Ameliyatı",
  "Appendectomy": "Apandisit Ameliyatı",
  "Gastric Surgery": "Mide Ameliyatı",
  "Bowel Surgery": "Bağırsak Ameliyatı",
  // Family history
  "Early Heart Attack": "Erken Kalp Krizi",
  "Family Diabetes": "Ailede Diyabet",
  "Family Cancer": "Ailede Kanser",
  "Family Cancer (Breast/Colon/Prostate)": "Ailede Kanser (Meme/Kolon/Prostat)",
  "Alzheimer": "Alzheimer",
  "Bipolar/Schizophrenia": "Bipolar/Şizofreni",
};

/**
 * Translate a condition name. If lang is "tr", returns Turkish name.
 * Handles surgery: and family: prefixes automatically.
 */
export function translateCondition(name: string, lang: string): string {
  if (lang !== "tr") {
    // For English, just strip prefixes
    if (name.startsWith("surgery:")) return name.replace("surgery:", "");
    if (name.startsWith("family:")) return name.replace("family:", "");
    return name;
  }

  // Strip prefix for lookup
  let cleanName = name;
  let prefix = "";
  if (name.startsWith("surgery:")) {
    cleanName = name.replace("surgery:", "");
    prefix = "";
  } else if (name.startsWith("family:")) {
    cleanName = name.replace("family:", "");
    prefix = "";
  }

  return CONDITION_TRANSLATIONS[cleanName] || cleanName;
}

/**
 * Check if a condition has a surgery: prefix
 */
export function isSurgery(condition: string): boolean {
  return condition.startsWith("surgery:");
}

/**
 * Strip surgery: or family: prefix from a condition name
 */
export function stripPrefix(condition: string): string {
  if (condition.startsWith("surgery:")) return condition.replace("surgery:", "");
  if (condition.startsWith("family:")) return condition.replace("family:", "");
  return condition;
}
