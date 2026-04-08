'use client'

import { useState, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
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
}

const SECTION_CHECKS: { key: string; labelTr: string; labelEn: string; scrollId: string; check: (i: ProfilePowerInput) => boolean }[] = [
  { key: 'basic', labelTr: 'Temel Bilgiler', labelEn: 'Basic Info', scrollId: 'personal-info', check: i => i.hasBasicInfo },
  { key: 'meds', labelTr: 'İlaçlar', labelEn: 'Medications', scrollId: 'medications', check: i => i.medicationCount > 0 },
  { key: 'supplements', labelTr: 'Takviyeler', labelEn: 'Supplements', scrollId: 'edit-health', check: i => i.supplementCount > 0 },
  { key: 'allergies', labelTr: 'Alerjiler', labelEn: 'Allergies', scrollId: 'allergy-card', check: i => i.hasAllergies },
  { key: 'chronic', labelTr: 'Kronik Hastalıklar', labelEn: 'Chronic Conditions', scrollId: 'edit-health', check: i => i.hasChronicConditions },
  { key: 'family', labelTr: 'Soygeçmiş', labelEn: 'Family History', scrollId: 'edit-health', check: i => i.hasFamilyHistory },
  { key: 'vaccines', labelTr: 'Aşılar', labelEn: 'Vaccines', scrollId: 'vaccines', check: i => i.vaccineCount > 0 },
  { key: 'contact', labelTr: 'İletişim', labelEn: 'Contact', scrollId: 'edit-health', check: i => i.hasContactInfo },
  { key: 'lifestyle', labelTr: 'Yaşam Tarzı', labelEn: 'Lifestyle', scrollId: 'edit-health', check: i => i.hasLifestyle },
]

export function calculateProfilePower(input: ProfilePowerInput): ProfilePower {
  const completed = SECTION_CHECKS.filter(s => s.check(input))
  const missing = SECTION_CHECKS.filter(s => !s.check(input))
  const percentage = Math.round((completed.length / SECTION_CHECKS.length) * 100)

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
  }
}

// ─── Level Display Config ───
const LEVEL_CONFIG: Record<ProfileLevel, { labelTr: string; labelEn: string; emoji: string; color: string; gradient: string }> = {
  beginner: { labelTr: 'Başlangıç', labelEn: 'Beginner', emoji: '\u{1F331}', color: 'text-gray-500', gradient: 'from-gray-400 to-gray-500' },
  developing: { labelTr: 'Gelişiyor', labelEn: 'Developing', emoji: '\u{1F33F}', color: 'text-blue-500', gradient: 'from-blue-400 to-blue-600' },
  strong: { labelTr: 'Güçlü', labelEn: 'Strong', emoji: '\u{1F4AA}', color: 'text-emerald-500', gradient: 'from-emerald-400 to-emerald-600' },
  expert: { labelTr: 'Uzman', labelEn: 'Expert', emoji: '\u{1F525}', color: 'text-amber-500', gradient: 'from-amber-400 to-amber-600' },
  full: { labelTr: 'Tam Koruma', labelEn: 'Full Protection', emoji: '\u{1F6E1}\u{FE0F}', color: 'text-primary', gradient: 'from-primary to-emerald-500' },
}

// ─── Profile Power Header ───
interface ProfilePowerHeaderProps {
  power: ProfilePower
  input: ProfilePowerInput
  lang: 'en' | 'tr'
}

export function ProfilePowerHeader({ power, input, lang }: ProfilePowerHeaderProps) {
  const tr = lang === 'tr'
  const reducedMotion = useReducedMotion()
  const cfg = LEVEL_CONFIG[power.level]

  const nextLevel = power.level === 'beginner' ? 'developing' : power.level === 'developing' ? 'strong' : power.level === 'strong' ? 'expert' : power.level === 'expert' ? 'full' : null

  return (
    <div className="mb-4 rounded-xl border bg-gradient-to-r from-primary/5 via-emerald-500/5 to-teal-500/5 p-4">
      {/* Level + Progress */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{cfg.emoji}</span>
        <span className="text-sm font-bold">{tr ? 'Profil Gücü:' : 'Profile Power:'}</span>
        <span className={`text-sm font-bold ${cfg.color}`}>{tr ? cfg.labelTr : cfg.labelEn}</span>
        <span className="ml-auto text-xs font-bold text-muted-foreground">%{power.percentage}</span>
      </div>
      <div className="h-2.5 rounded-full bg-muted overflow-hidden mb-3">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${cfg.gradient}`}
          initial={reducedMotion ? { width: `${power.percentage}%` } : { width: 0 }}
          animate={{ width: `${power.percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      {/* Section completion list */}
      <div className="space-y-1">
        {SECTION_CHECKS.map(s => {
          const done = s.check(input)
          return (
            <div key={s.key}
              className={`flex items-center gap-2 text-xs ${!done ? 'cursor-pointer hover:text-primary transition-colors' : ''}`}
              title={!done ? (tr ? 'Ekle ve profil g\u00fcc\u00fcn\u00fc art\u0131r!' : 'Add to boost your profile power!') : undefined}
              onClick={!done ? () => document.getElementById(s.scrollId)?.scrollIntoView({ behavior: 'smooth', block: 'center' }) : undefined}>
              {done
                ? <span className="text-green-600 dark:text-green-400">{"\u2705"}</span>
                : <span className="text-muted-foreground/50">{"\u2B55"}</span>}
              <span className={done ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                {tr ? s.labelTr : s.labelEn}
              </span>
            </div>
          )
        })}
      </div>

      {/* Next level hint */}
      {nextLevel && (
        <p className="mt-2 text-xs text-muted-foreground">
          {tr ? `Sonraki seviye: ${LEVEL_CONFIG[nextLevel].emoji} ${LEVEL_CONFIG[nextLevel].labelTr}` : `Next: ${LEVEL_CONFIG[nextLevel].emoji} ${LEVEL_CONFIG[nextLevel].labelEn}`}
        </p>
      )}
      {power.level === 'full' && (
        <p className="mt-2 text-xs font-semibold text-primary">
          {"\u{1F389}"} {tr ? 'Tebrikler! Tam Koruma seviyesindesin.' : 'Congratulations! Full Protection achieved.'}
        </p>
      )}
    </div>
  )
}

// ─── Section Status Badge (replaces SectionXPBadge) ───
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

// ─── Empty State CTA ───
interface EmptyCTAProps {
  icon: string
  title: string
  description: string
  buttonText: string
  xpReward?: string
  onClick: () => void
}

export function EmptyStateCTA({ icon, title, description, buttonText, onClick }: EmptyCTAProps) {
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
      </button>
    </div>
  )
}
