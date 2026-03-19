// ============================================
// Health Score Calculator — Sprint 10
// ============================================
// Daily health score (0-100) based on:
// - Micro check-in (energy, sleep, mood, bloating) — 40 points
// - Medication adherence — 30 points
// - Water intake — 15 points
// - Vital records — 15 points (bonus)

interface CheckInData {
  energy_level: number | null   // 1-5
  sleep_quality: number | null  // 1-5
  mood: number | null           // 1-5
  bloating: number | null       // 1-5 (1=bad, 5=great)
}

interface AdherenceData {
  totalMeds: number
  takenMeds: number
}

interface WaterData {
  glasses: number
  target: number
}

interface VitalData {
  hasRecordToday: boolean
}

export interface HealthScoreBreakdown {
  total: number
  checkin: number      // max 40
  adherence: number    // max 30
  water: number        // max 15
  vitals: number       // max 15
  label: string
  emoji: string
}

export function calculateHealthScore(
  checkIn: CheckInData | null,
  adherence: AdherenceData,
  water: WaterData,
  vitals: VitalData
): HealthScoreBreakdown {
  let checkinScore = 0
  let adherenceScore = 0
  let waterScore = 0
  let vitalsScore = 0

  // 1. Check-in score (40 points max)
  if (checkIn) {
    const fields = [checkIn.energy_level, checkIn.sleep_quality, checkIn.mood, checkIn.bloating]
    const validFields = fields.filter((f): f is number => f !== null && f !== undefined)
    if (validFields.length > 0) {
      // Each field is 1-5, normalize to 0-10 per field, max 40
      const avg = validFields.reduce((a, b) => a + b, 0) / validFields.length
      checkinScore = Math.round((avg / 5) * 40)
    }
  }

  // 2. Medication adherence (30 points max)
  if (adherence.totalMeds > 0) {
    const ratio = adherence.takenMeds / adherence.totalMeds
    adherenceScore = Math.round(ratio * 30)
  } else {
    // No medications = full score (not penalized for not having meds)
    adherenceScore = 30
  }

  // 3. Water intake (15 points max)
  if (water.target > 0) {
    const ratio = Math.min(water.glasses / water.target, 1)
    waterScore = Math.round(ratio * 15)
  }

  // 4. Vitals (15 points — bonus for recording)
  if (vitals.hasRecordToday) {
    vitalsScore = 15
  }

  const total = Math.min(checkinScore + adherenceScore + waterScore + vitalsScore, 100)

  return {
    total,
    checkin: checkinScore,
    adherence: adherenceScore,
    water: waterScore,
    vitals: vitalsScore,
    label: getScoreLabel(total),
    emoji: getScoreEmoji(total),
  }
}

function getScoreLabel(score: number): string {
  if (score >= 90) return "excellent"
  if (score >= 75) return "great"
  if (score >= 60) return "good"
  if (score >= 40) return "fair"
  return "needsWork"
}

function getScoreEmoji(score: number): string {
  if (score >= 90) return "🌟"
  if (score >= 75) return "😊"
  if (score >= 60) return "👍"
  if (score >= 40) return "🤔"
  return "💪"
}
