// © 2026 DoctoPal — All Rights Reserved
//
// F-PROFILE-001 Sprint 9 Commit 3 — Digital Twin organ map.
//
// Purpose: HealthReportTab'ın Vitality Hero kartında body silhouette +
// organ status overlay rendering için condition (DISEASE_DB id) →
// affected organs + severity mapping'i.
//
// Source of truth for DISEASE_DB id'leri: components/profile/
// ChronicConditionsEditor.tsx L11-40+. Casing exact-match (örn
// "Diabetes", "Heart Failure"), bilinmeyen condition graceful skip.
//
// Severity hierarchy: concern > watch > healthy. computeOrganStates
// aynı organ için en yüksek severity'yi tutar (concern bir kez
// set edildiyse watch'la override edilmez).
//
// `family:` ve `surgery:` prefix'li satırlar atlanır — bu prefix'ler
// chronic_conditions array'inde aile öyküsü ve cerrahi geçmiş için
// kullanılıyor (ChronicConditionsEditor convention).

export type OrganId =
  | "brain"
  | "thyroid"
  | "heart"
  | "lungLeft"
  | "lungRight"
  | "liver"
  | "pancreas"
  | "kidneyLeft"
  | "kidneyRight"
  | "stomach"
  | "reproductive"

export type Severity = "healthy" | "watch" | "concern"

// Organ pozisyonları — viewBox 60×120 (BodySilhouette ile aynı koordinat sistemi).
// Basit symmetric anatomi referansı — pixel-perfect değil, semantic indikatör.
export const ORGAN_POSITIONS: Array<{ id: OrganId; x: number; y: number }> = [
  { id: "brain", x: 30, y: 14 },
  { id: "thyroid", x: 30, y: 24 },
  { id: "heart", x: 27, y: 38 },
  { id: "lungLeft", x: 22, y: 36 },
  { id: "lungRight", x: 38, y: 36 },
  { id: "liver", x: 25, y: 52 },
  { id: "pancreas", x: 32, y: 55 },
  { id: "kidneyLeft", x: 23, y: 60 },
  { id: "kidneyRight", x: 37, y: 60 },
  { id: "stomach", x: 30, y: 58 },
  { id: "reproductive", x: 30, y: 70 },
]

// Condition (DISEASE_DB id, exact case) → affected organs + severity.
// Watch: standart kronik durum (medication-managed)
// Concern: organ failure / kritik (klinik takip yoğun)
const CONDITION_MAP: Record<string, { organs: OrganId[]; severity: Severity }> = {
  // Endokrin
  "Diabetes": { organs: ["pancreas"], severity: "watch" },
  "Type 1 Diabetes": { organs: ["pancreas"], severity: "watch" },
  "Type 2 Diabetes": { organs: ["pancreas"], severity: "watch" },
  "Hypothyroidism": { organs: ["thyroid"], severity: "watch" },
  "Hyperthyroidism": { organs: ["thyroid"], severity: "watch" },
  "Thyroid Disorder": { organs: ["thyroid"], severity: "watch" },
  // Kardiyovasküler
  "Hypertension": { organs: ["heart"], severity: "watch" },
  "Heart Failure": { organs: ["heart"], severity: "concern" },
  "Coronary Artery Disease": { organs: ["heart"], severity: "concern" },
  "Arrhythmia": { organs: ["heart"], severity: "watch" },
  // Solunum
  "Asthma": { organs: ["lungLeft", "lungRight"], severity: "watch" },
  "COPD": { organs: ["lungLeft", "lungRight"], severity: "watch" },
  // Böbrek/Karaciğer
  "Kidney Failure": { organs: ["kidneyLeft", "kidneyRight"], severity: "concern" },
  "Kidney Stones": { organs: ["kidneyLeft", "kidneyRight"], severity: "watch" },
  "Liver Failure": { organs: ["liver"], severity: "concern" },
  // Nörolojik
  "Migraine": { organs: ["brain"], severity: "watch" },
  "Epilepsy": { organs: ["brain"], severity: "watch" },
  "Depression/Anxiety": { organs: ["brain"], severity: "watch" },
  "Multiple Sclerosis": { organs: ["brain"], severity: "concern" },
  // GI
  "Crohn's Disease": { organs: ["stomach"], severity: "watch" },
  "Ulcerative Colitis": { organs: ["stomach"], severity: "watch" },
  // Kadın sağlığı
  "PCOS": { organs: ["reproductive"], severity: "watch" },
  // Kan (kalp yükü olarak haritalanır — anemia long-term cardiac strain)
  "Anemia": { organs: ["heart"], severity: "watch" },
}

// CSS variable yerine hex literal — design.md emerald/amber/rose
// palette ile bit-perfect (Stat Cards da aynı tonları kullanıyor).
export const SEVERITY_COLOR: Record<Severity, string> = {
  healthy: "#16a34a", // emerald-600
  watch: "#d97706", // amber-600
  concern: "#dc2626", // rose-600
}

/**
 * Computes organ-level severity from raw chronic_conditions array.
 *
 * @param conditions - Raw `profile.chronic_conditions` (DISEASE_DB ids,
 *   may include `family:` / `surgery:` prefixed entries which are
 *   filtered out)
 * @returns Partial map of organ → severity. Organs not present in the
 *   result are healthy by default (caller should fallback to
 *   `SEVERITY_COLOR.healthy` for missing keys).
 *
 * Severity precedence: concern > watch > healthy. If two conditions
 * affect the same organ at different levels, the higher one wins.
 */
export function computeOrganStates(
  conditions: string[],
): Partial<Record<OrganId, Severity>> {
  const states: Partial<Record<OrganId, Severity>> = {}
  for (const c of conditions) {
    if (c.startsWith("family:") || c.startsWith("surgery:")) continue
    const map = CONDITION_MAP[c]
    if (!map) continue
    for (const o of map.organs) {
      // concern locked — diğer condition watch ekleyemez
      if (states[o] === "concern") continue
      states[o] = map.severity
    }
  }
  return states
}
