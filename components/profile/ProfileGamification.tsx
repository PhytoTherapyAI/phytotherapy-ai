'use client'

// F-PROFILE-001 Commit 6.2: orphan cleanup after legacy page deletion.
// Removed exports (only the legacy monolith consumed them):
//   - ProfilePowerHeader (+ ProfilePowerHeaderProps, LEVEL_CONFIG)
//   - EmptyStateCTA (+ EmptyCTAProps)
//   - getCompletionMessage
// Kept exports:
//   - calculateProfilePower + types (ProfilePowerInput, ProfileLevel,
//     ProfilePower) — HealthReportTab ShellV2 consumes these
//   - SectionXPBadge — AllergiesSection consumes
//   - MotivationCard (+ MotivationCardProps) — AllergiesSection and
//     LifestyleSection consume

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

// ─── Profile Power Calculation ───
export interface ProfilePowerInput {
  hasBasicInfo: boolean
  medicationCount: number
  supplementCount: number
  hasAllergies: boolean
  hasChronicConditions: boolean
  hasFamilyHistory: boolean
  vaccineCount: number
  hasContactInfo: boolean
  hasLifestyle: boolean // height/weight/exercise/sleep
}

export type ProfileLevel = 'beginner' | 'developing' | 'strong' | 'expert' | 'full'

export interface ProfilePower {
  percentage: number
  level: ProfileLevel
  completedSections: number
  totalSections: number
  missingSections: string[]
  requiredCompleted: number
  requiredTotal: number
  optionalCompleted: number
  optionalTotal: number
  allRequiredDone: boolean
}

// `required: true` = klinik güvenlik için kritik (etkileşim/kontrendikasyon kontrolü)
// `required: false` = kişiselleştirme için faydalı, opsiyonel
const SECTION_CHECKS: { key: string; labelTr: string; labelEn: string; scrollId: string; required: boolean; check: (i: ProfilePowerInput) => boolean }[] = [
  { key: 'basic', labelTr: 'Temel Bilgiler', labelEn: 'Basic Info', scrollId: 'personal-info', required: true, check: i => i.hasBasicInfo },
  { key: 'meds', labelTr: 'İlaçlar', labelEn: 'Medications', scrollId: 'medications', required: true, check: i => i.medicationCount > 0 },
  { key: 'allergies', labelTr: 'Alerjiler', labelEn: 'Allergies', scrollId: 'allergy-card', required: true, check: i => i.hasAllergies },
  { key: 'chronic', labelTr: 'Kronik Hastalıklar', labelEn: 'Chronic Conditions', scrollId: 'edit-health', required: true, check: i => i.hasChronicConditions },
  { key: 'supplements', labelTr: 'Takviyeler', labelEn: 'Supplements', scrollId: 'edit-health', required: false, check: i => i.supplementCount > 0 },
  { key: 'family', labelTr: 'Soygeçmiş', labelEn: 'Family History', scrollId: 'edit-health', required: false, check: i => i.hasFamilyHistory },
  { key: 'vaccines', labelTr: 'Aşılar', labelEn: 'Vaccines', scrollId: 'vaccines', required: false, check: i => i.vaccineCount > 0 },
  { key: 'contact', labelTr: 'İletişim', labelEn: 'Contact', scrollId: 'edit-health', required: false, check: i => i.hasContactInfo },
  { key: 'lifestyle', labelTr: 'Yaşam Tarzı', labelEn: 'Lifestyle', scrollId: 'edit-health', required: false, check: i => i.hasLifestyle },
]

export function calculateProfilePower(input: ProfilePowerInput): ProfilePower {
  const completed = SECTION_CHECKS.filter(s => s.check(input))
  const missing = SECTION_CHECKS.filter(s => !s.check(input))
  const percentage = Math.round((completed.length / SECTION_CHECKS.length) * 100)

  const requiredAll = SECTION_CHECKS.filter(s => s.required)
  const optionalAll = SECTION_CHECKS.filter(s => !s.required)
  const requiredDone = requiredAll.filter(s => s.check(input)).length
  const optionalDone = optionalAll.filter(s => s.check(input)).length

  let level: ProfileLevel = 'beginner'
  if (percentage >= 100) level = 'full'
  else if (percentage >= 76) level = 'expert'
  else if (percentage >= 51) level = 'strong'
  else if (percentage >= 26) level = 'developing'

  return {
    percentage,
    level,
    completedSections: completed.length,
    totalSections: SECTION_CHECKS.length,
    missingSections: missing.map(s => s.key),
    requiredCompleted: requiredDone,
    requiredTotal: requiredAll.length,
    optionalCompleted: optionalDone,
    optionalTotal: optionalAll.length,
    allRequiredDone: requiredDone === requiredAll.length,
  }
}

// ─── Section Status Badge (inline green tick when a section is done) ───
export function SectionXPBadge({ completed }: { earned?: number; potential?: number; completed: boolean }) {
  if (completed) {
    return (
      <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 rounded-full px-2.5 py-0.5">
        {"\u2713"}
      </span>
    )
  }
  return null
}

// ─── Dismissable Motivation Card ───
interface MotivationCardProps {
  id: string // unique key for localStorage dismiss
  icon: string
  title: string
  message: string
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'teal' | 'orange'
  xpReward?: string // kept for backward compat but unused
}

const colorMap = {
  blue: 'bg-blue-50 dark:bg-blue-950/20 border-l-blue-500 text-blue-800 dark:text-blue-200',
  green: 'bg-emerald-50 dark:bg-emerald-950/20 border-l-emerald-500 text-emerald-800 dark:text-emerald-200',
  yellow: 'bg-amber-50 dark:bg-amber-950/20 border-l-amber-500 text-amber-800 dark:text-amber-200',
  purple: 'bg-purple-50 dark:bg-purple-950/20 border-l-purple-500 text-purple-800 dark:text-purple-200',
  teal: 'bg-teal-50 dark:bg-teal-950/20 border-l-teal-500 text-teal-800 dark:text-teal-200',
  orange: 'bg-orange-50 dark:bg-orange-950/20 border-l-orange-500 text-orange-800 dark:text-orange-200',
}

export function MotivationCard({ id, icon, title, message, color }: MotivationCardProps) {
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem(`motiv_dismiss_${id}`) === '1') setDismissed(true)
    } catch { /* noop */ }
  }, [id])

  if (dismissed) return null

  const dismiss = () => {
    setDismissed(true)
    try { localStorage.setItem(`motiv_dismiss_${id}`, '1') } catch { /* noop */ }
  }

  return (
    <div className={`rounded-lg border-l-4 p-3 text-sm relative ${colorMap[color]}`}>
      <button
        onClick={dismiss}
        className="absolute top-2 right-2 text-current opacity-40 hover:opacity-70 transition-opacity"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      <p className="font-semibold text-xs uppercase tracking-wide opacity-70 mb-1">
        {icon} {title}
      </p>
      <p className="leading-relaxed pr-4">{message}</p>
    </div>
  )
}
