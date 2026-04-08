// © 2026 DoctoPal — All Rights Reserved
// Shared medication dose parsing utility — used by Dashboard, Calendar, and TodayView

export interface MedDose {
  timeBlock: "morning" | "noon" | "evening"
  suffix: string       // e.g., "Sabah", "Akşam", "Morning", "Evening"
  itemIdSuffix: string // e.g., "-morning", "-evening", "" (for single dose)
}

/**
 * Parse a medication frequency string and return individual dose entries.
 * 2x/day meds → 2 tasks (morning + evening)
 * 3x/day meds → 3 tasks (morning + noon + evening)
 * Single dose → placed in appropriate time block based on frequency text
 */
export function parseMedDoses(frequency: string, lang: "en" | "tr" = "en"): MedDose[] {
  const f = (frequency || "").toLowerCase().trim()
  const isTr = lang === "tr"

  // 3x per day — handles "3", "3x", "3 kez", "üç", "three times", etc.
  if (
    f === "3" || f.includes("3x") || f.includes("3 kez") || f.includes("üç") ||
    f.includes("three") || f.includes("3 times") || f.includes("tid") ||
    f.includes("günde 3")
  ) {
    return [
      { timeBlock: "morning", suffix: isTr ? "Sabah" : "Morning", itemIdSuffix: "-morning" },
      { timeBlock: "noon", suffix: isTr ? "Öğle" : "Noon", itemIdSuffix: "-noon" },
      { timeBlock: "evening", suffix: isTr ? "Akşam" : "Evening", itemIdSuffix: "-evening" },
    ]
  }

  // 2x per day — handles "2", "2x", "twice", "iki kez", "günde 2", etc.
  if (
    f === "2" || f.includes("2x") || f.includes("2 kez") || f.includes("iki kez") ||
    f.includes("iki defa") || f.includes("twice") || f.includes("2 times") ||
    f.includes("bid") || f.includes("günde 2") ||
    (f.includes("sabah") && f.includes("akşam")) ||
    (f.includes("morning") && f.includes("evening"))
  ) {
    return [
      { timeBlock: "morning", suffix: isTr ? "Sabah" : "Morning", itemIdSuffix: "-morning" },
      { timeBlock: "evening", suffix: isTr ? "Akşam" : "Evening", itemIdSuffix: "-evening" },
    ]
  }

  // Single dose — evening
  if (f.includes("akşam") || f.includes("night") || f.includes("evening") || f.includes("gece") || f.includes("yatmadan")) {
    return [{ timeBlock: "evening", suffix: "", itemIdSuffix: "" }]
  }

  // Single dose — noon
  if (f.includes("öğle") || f.includes("noon") || f.includes("afternoon")) {
    return [{ timeBlock: "noon", suffix: "", itemIdSuffix: "" }]
  }

  // Default: single dose — morning
  return [{ timeBlock: "morning", suffix: "", itemIdSuffix: "" }]
}

/**
 * Build the daily_logs item_id for a medication dose.
 * Single dose: raw UUID (backward compatible with existing daily_logs)
 * Multi-dose: "{uuid}-morning", "{uuid}-evening", "{uuid}-noon"
 */
export function buildMedItemId(medId: string, dose: MedDose): string {
  return `${medId}${dose.itemIdSuffix}`
}

/**
 * Build a display label for a medication dose.
 * e.g., "Glifor (Sabah)" or just "Cipralex" for single dose
 */
export function buildMedLabel(medName: string, dose: MedDose): string {
  return dose.suffix ? `${medName} (${dose.suffix})` : medName
}
