// © 2026 Doctopal — All Rights Reserved
// Centralized frequency labels for medications & supplements

export interface FrequencyOption {
  value: string
  labelEn: string
  labelTr: string
}

export const MED_FREQUENCY_OPTIONS: FrequencyOption[] = [
  { value: "1x daily", labelEn: "Once daily", labelTr: "Günde 1 kez" },
  { value: "2x daily", labelEn: "Twice daily", labelTr: "Günde 2 kez" },
  { value: "3x daily", labelEn: "Three times daily", labelTr: "Günde 3 kez" },
  { value: "4x daily", labelEn: "Four times daily", labelTr: "Günde 4 kez" },
  { value: "weekly", labelEn: "Weekly", labelTr: "Haftalık" },
  { value: "as needed", labelEn: "As needed", labelTr: "Gerektiğinde" },
  { value: "morning", labelEn: "Morning", labelTr: "Sabah" },
  { value: "evening", labelEn: "Evening", labelTr: "Akşam" },
  { value: "night", labelEn: "At night (before bed)", labelTr: "Gece (yatmadan önce)" },
]

const LABEL_MAP_TR: Record<string, string> = {
  "daily": "Günlük",
  "1x daily": "Günde 1 kez",
  "2x daily": "Günde 2 kez",
  "3x daily": "Günde 3 kez",
  "4x daily": "Günde 4 kez",
  "once daily": "Günde 1 kez",
  "twice daily": "Günde 2 kez",
  "every other day": "Günaşırı",
  "weekly": "Haftalık",
  "twice weekly": "Haftada 2 kez",
  "weekly_2_3": "Haftada 2-3 kez",
  "monthly": "Aylık",
  "as needed": "Gerektiğinde",
  "as_needed": "Gerektiğinde",
  "morning": "Sabah",
  "evening": "Akşam",
  "night": "Gece",
  "with food": "Yemekle birlikte",
  "before food": "Aç karna",
  "after food": "Tok karna",
  "irregular": "Düzensiz / Bazen",
  "bid": "Günde 2 kez",
  "tid": "Günde 3 kez",
  "qid": "Günde 4 kez",
  "prn": "Gerektiğinde",
  "qd": "Günlük",
}

const LABEL_MAP_EN: Record<string, string> = {
  "daily": "Daily",
  "1x daily": "Once daily",
  "2x daily": "Twice daily",
  "3x daily": "Three times daily",
  "4x daily": "Four times daily",
  "weekly": "Weekly",
  "weekly_2_3": "2-3 times/week",
  "monthly": "Monthly",
  "as needed": "As needed",
  "as_needed": "As needed",
  "morning": "Morning",
  "evening": "Evening",
  "night": "At night",
  "irregular": "Irregular / Sometimes",
}

export function getFrequencyLabel(value: string, lang: "en" | "tr" = "tr"): string {
  const map = lang === "tr" ? LABEL_MAP_TR : LABEL_MAP_EN
  const lower = value.toLowerCase().trim()
  return map[lower] ?? value
}
