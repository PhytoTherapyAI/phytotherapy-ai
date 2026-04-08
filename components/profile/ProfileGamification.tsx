'use client'

import { motion, useReducedMotion } from 'framer-motion'

// ─── XP Calculation ───
export interface ProfileXPInput {
  hasBasicInfo: boolean     // name, age, gender filled
  medicationCount: number
  supplementCount: number
  hasAllergies: boolean
  hasChronicConditions: boolean
  hasFamilyHistory: boolean
  vaccineCount: number
  hasContactInfo: boolean   // country or city or phone filled
  streakDays: number
}

export interface XPBreakdown {
  basicInfo: number
  medications: number
  supplements: number
  allergies: number
  chronicConditions: number
  familyHistory: number
  vaccines: number
  contactInfo: number
  total: number
  maxPossible: number
  percentage: number
}

export function calculateProfileXP(input: ProfileXPInput): XPBreakdown {
  const basicInfo = input.hasBasicInfo ? 100 : 0
  const medications = Math.min(input.medicationCount * 50, 250)
  const supplements = Math.min(input.supplementCount * 30, 150)
  const allergies = input.hasAllergies ? 75 : 0
  const chronicConditions = input.hasChronicConditions ? 75 : 0
  const familyHistory = input.hasFamilyHistory ? 100 : 0
  const vaccines = Math.min(input.vaccineCount * 20, 260)
  const contactInfo = input.hasContactInfo ? 25 : 0

  const total = basicInfo + medications + supplements + allergies + chronicConditions + familyHistory + vaccines + contactInfo
  const maxPossible = 100 + 250 + 150 + 75 + 75 + 100 + 260 + 25 // 1035

  return {
    basicInfo,
    medications,
    supplements,
    allergies,
    chronicConditions,
    familyHistory,
    vaccines,
    contactInfo,
    total,
    maxPossible,
    percentage: Math.round((total / maxPossible) * 100),
  }
}

// ─── XP Header Strip ───
interface XPHeaderProps {
  streakDays: number
  xp: XPBreakdown
  lang: 'en' | 'tr'
}

export function ProfileXPHeader({ streakDays, xp, lang }: XPHeaderProps) {
  const tr = lang === 'tr'
  const reducedMotion = useReducedMotion()

  return (
    <div className="mb-4 flex items-center gap-3 rounded-xl border bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 px-4 py-3">
      {streakDays > 0 && (
        <div className="flex items-center gap-1.5 text-sm font-bold text-orange-600 dark:text-orange-400">
          <span>{"\u{1F525}"}</span>
          <span>{streakDays} {tr ? 'gün' : 'day'}</span>
        </div>
      )}
      <div className="flex items-center gap-1.5 text-sm font-bold text-amber-600 dark:text-amber-400">
        <span>{"\u{1F3C6}"}</span>
        <span>{xp.total} XP</span>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{"\u{1F4CA}"} {tr ? 'Profil' : 'Profile'}</span>
        <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500"
            initial={reducedMotion ? { width: `${xp.percentage}%` } : { width: 0 }}
            animate={{ width: `${xp.percentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <span className="text-xs font-semibold text-primary">%{xp.percentage}</span>
      </div>
    </div>
  )
}

// ─── Section Motivation Card ───
interface MotivationCardProps {
  icon: string
  message: string
  xpReward: string
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'teal' | 'orange'
}

const colorMap = {
  blue: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
  green: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
  yellow: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300',
  purple: 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300',
  teal: 'bg-teal-50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300',
  orange: 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300',
}

export function MotivationCard({ icon, message, xpReward, color }: MotivationCardProps) {
  return (
    <div className={`rounded-lg border p-3 text-sm flex items-start gap-2.5 ${colorMap[color]}`}>
      <span className="text-base shrink-0 mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="leading-snug">{message}</p>
      </div>
      <span className="shrink-0 text-xs font-bold opacity-70 bg-white/50 dark:bg-black/20 rounded-full px-2 py-0.5">
        {xpReward}
      </span>
    </div>
  )
}

// ─── Section XP Badge (right of section title) ───
interface SectionXPBadgeProps {
  earned: number
  potential: number
  completed: boolean
}

export function SectionXPBadge({ earned, potential, completed }: SectionXPBadgeProps) {
  if (completed) {
    return (
      <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 rounded-full px-2.5 py-0.5">
        {"\u2713"} +{earned} XP
      </span>
    )
  }
  return (
    <span className="text-xs font-medium text-muted-foreground bg-muted rounded-full px-2.5 py-0.5">
      +{potential} XP
    </span>
  )
}

// ─── Empty State CTA ───
interface EmptyCTAProps {
  icon: string
  title: string
  description: string
  buttonText: string
  xpReward: string
  onClick: () => void
}

export function EmptyStateCTA({ icon, title, description, buttonText, xpReward, onClick }: EmptyCTAProps) {
  return (
    <div className="rounded-xl border-2 border-dashed border-primary/20 bg-primary/5 p-6 text-center space-y-3">
      <div className="text-4xl">{icon}</div>
      <p className="text-base font-semibold">{title}</p>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">{description}</p>
      <button
        onClick={onClick}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        {buttonText}
        <span className="text-xs opacity-80 bg-white/20 rounded-full px-2 py-0.5">{xpReward}</span>
      </button>
    </div>
  )
}
