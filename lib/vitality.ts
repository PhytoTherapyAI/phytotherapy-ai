// © 2026 DoctoPal — All Rights Reserved
//
// Vitality Score — 0-100 profile-level "how robust is this user's
// health footprint" metric.
//
// NOT to be confused with lib/health-score.ts which computes the
// DAILY micro-score (check-in + adherence + water + vitals). They
// are different concepts:
//
//   lib/vitality.ts     → profile-level, updated on data changes,
//                         feeds the HealthReportTab hero ring.
//   lib/health-score.ts → daily, updated nightly, feeds the
//                         dashboard "today" streak / wrap.
//
// Formula (F-PROFILE-001 Commit 6.1 — extracted from legacy parity
// block at app/profile/page.tsx:1039-1043 + HealthReportTab Commit 5
// inline block at components/profile-v2/tabs/HealthReportTab.tsx):
//
//   40% profile completion weight (power.percentage)
//   30% streak weight (capped at 30 days)
//   30% data-presence (meds contributes 50, allergies/chronic 50)
//
// Thresholds (inclusive):
//   ≥71 → emerald / greatShape
//   41-70 → amber / improving
//   <41 → red / needsAttention

export interface VitalityInput {
  /** 0-100 — typically from calculateProfilePower(input).percentage */
  profileCompletionPct: number
  /** Current consecutive check-in streak (caps at 30 for math) */
  streakDays: number
  /** At least one active medication on file */
  hasMedications: boolean
  /** At least one allergy OR non-"family:"-prefixed chronic condition */
  hasAllergiesOrChronic: boolean
}

export type VitalityColor = "emerald" | "amber" | "red"
export type VitalityLabelKey = "greatShape" | "improving" | "needsAttention"

export interface VitalityResult {
  /** 0-100 rounded */
  score: number
  /** Semantic color bucket (for CSS classes if ever needed) */
  color: VitalityColor
  /** Raw hex for SVG stroke — legacy hero ring + heartbeat kept these. */
  hexColor: string
  /** Translation key suffix — pair with `profile.healthReport.${labelKey}` */
  labelKey: VitalityLabelKey
}

export function computeVitalityScore(input: VitalityInput): VitalityResult {
  // Guard: profileCompletionPct clamp to [0, 100] so a runaway caller
  // can't push the weight out of range. streakDays is already capped
  // inside Math.min below.
  const profilePct = Math.max(0, Math.min(100, input.profileCompletionPct))

  const profileWeight = profilePct * 0.4
  const streakWeight = (Math.min(input.streakDays, 30) / 30) * 100 * 0.3
  const dataWeight =
    (input.hasMedications ? 50 : 0) +
    (input.hasAllergiesOrChronic ? 50 : 0)

  const score = Math.round(
    Math.min(profileWeight + streakWeight + dataWeight * 0.3, 100),
  )

  if (score >= 71) {
    return { score, color: "emerald", hexColor: "#3c7a52", labelKey: "greatShape" }
  }
  if (score >= 41) {
    return { score, color: "amber", hexColor: "#f59e0b", labelKey: "improving" }
  }
  return { score, color: "red", hexColor: "#ef4444", labelKey: "needsAttention" }
}
