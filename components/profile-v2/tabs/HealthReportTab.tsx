// © 2026 DoctoPal — All Rights Reserved
//
// F-PROFILE-001 Commit 5: Health Report tab.
//
// Mirrors the legacy profile hero block (app/profile/page.tsx:1037-1154)
// but scoped to a single tab in ShellV2. Four sections top-to-bottom:
//   1. Vitality Score hero — ring + ECG decoration + streak chip
//   2. Stat cards (4 cells — meds / supplements / allergies / labs)
//   3. Achievement badges preview (6 tiles with BadgeIcon)
//   4. SBAR PDF card (reuses PDFDownloadButton with its baked-in
//      Premium gate + email modal)
//
// TODO: Session 46 enrichment — scope-creep guard (see plan file):
//   - Digital Twin hero polish (body silhouette / organ map)
//   - Recent Activity multi-source feed (last 5 meds + 3 alerts + 1 lab)
//   - Missing section nudges (cross-tab navigation via setTab prop drilling)
//
// Family-view gating: early return with FamilyProfileGuard when viewing
// another profile. Matches /badges route precedent (KVKK safety +
// sidesteps the legacy SBAR caller-identity leak until Commit 6).
"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Flame, Trophy, FileText } from "lucide-react"
import { tx, txObj } from "@/lib/translations"
import { evaluateBadges, type UserStats } from "@/lib/badges"
import BadgeIcon from "@/components/badges/BadgeIcon"
import { PDFDownloadButton } from "@/components/pdf/PDFDownloadButton"
import {
  calculateProfilePower,
  type ProfilePowerInput,
} from "@/components/profile/ProfileGamification"
import { FamilyProfileGuard } from "@/components/family/FamilyProfileGuard"
import { Card } from "@/components/ui/card"
import { computeVitalityScore } from "@/lib/vitality"
import type { UserMedication } from "@/lib/database.types"
import type { UserAllergyRow } from "@/components/profile-v2/hooks/useProfileData"

interface HealthReportTabProps {
  lang: "tr" | "en"
  userId: string
  isOwnProfile: boolean
  /** Structural shape — pulled from authProfile in the shell. */
  profile: {
    full_name?: string | null
    age?: number | null
    gender?: string | null
    country?: string | null
    city?: string | null
    phone?: string | null
    height_cm?: number | null
    weight_kg?: number | null
    exercise_frequency?: string | null
    sleep_quality?: string | null
    chronic_conditions?: string[] | null
    supplements?: string[] | null
    vaccines?: unknown
  } | null
  medications: UserMedication[]
  allergies: UserAllergyRow[]
  labTestCount: number
  streakDays: number
  familyMemberCount: number
}

export function HealthReportTab({
  lang,
  userId,
  isOwnProfile,
  profile,
  medications,
  allergies,
  labTestCount,
  streakDays,
  familyMemberCount,
}: HealthReportTabProps) {
  const tr = lang === "tr"

  // Family-view early return — hooks above this point are safe because
  // there are none yet. If we add hooks later, they MUST run before
  // this gate (React rules of hooks). See FamilyProfileGuard docs.
  if (!isOwnProfile) {
    return (
      <FamilyProfileGuard
        pageTitleTr="Sağlık Raporu"
        pageTitleEn="Health Report"
      />
    )
  }

  // ── Profile power (drives vitality's profile-weight input) ──
  // Same signature as legacy 830-844; kept inline for Commit 5 — extract
  // to a helper in Commit 6 when legacy goes away.
  const supplementsArr = Array.isArray(profile?.supplements) ? profile!.supplements! : []
  const chronicArr = Array.isArray(profile?.chronic_conditions) ? profile!.chronic_conditions! : []
  const vaccinesArr = Array.isArray(profile?.vaccines)
    ? (profile!.vaccines as { status?: string }[])
    : []
  const activeSupplementCount = supplementsArr.filter((s) => !s.startsWith("meta:")).length
  const doneVaccineCount = vaccinesArr.filter((v) => v.status === "done").length

  const powerInput: ProfilePowerInput = {
    hasBasicInfo: !!(profile?.full_name && profile?.age && profile?.gender),
    medicationCount: medications.length,
    supplementCount: activeSupplementCount,
    hasAllergies: allergies.length > 0,
    hasChronicConditions: chronicArr.filter((c) => !c.startsWith("family:")).length > 0,
    hasFamilyHistory: chronicArr.some((c) => c.startsWith("family:")),
    vaccineCount: doneVaccineCount,
    hasContactInfo: !!(profile?.country || profile?.city || profile?.phone),
    hasLifestyle: !!(
      profile?.height_cm ||
      profile?.weight_kg ||
      profile?.exercise_frequency ||
      profile?.sleep_quality
    ),
  }
  const power = calculateProfilePower(powerInput)

  // ── Vitality score — centralised helper (lib/vitality.ts) ──
  // F-PROFILE-001 Commit 6.1: extracted from the inline formula and
  // legacy duplicate so both tab + legacy feed from one source.
  const vitality = computeVitalityScore({
    profileCompletionPct: power.percentage,
    streakDays,
    hasMedications: medications.length > 0,
    hasAllergiesOrChronic:
      allergies.length > 0 ||
      chronicArr.filter((c) => !c.startsWith("family:")).length > 0,
  })
  const vitalityScore = vitality.score
  const scoreColor = vitality.hexColor
  const scoreLabelKey = `profile.healthReport.${vitality.labelKey}`

  // ── Badges — UserStats mapped from what we have in hand ──
  const badgeStats: UserStats = {
    totalQueries: 0,
    totalCheckIns: streakDays,
    streakDays,
    bloodTestCount: labTestCount,
    supplementsTracked: activeSupplementCount,
    waterGoalHits: 0,
    interactionChecks: 0,
    daysActive: streakDays,
    familyMembers: familyMemberCount,
    pdfReports: 0,
    vaccinesTracked: doneVaccineCount,
  }
  const { earned, locked } = evaluateBadges(badgeStats)
  const badgeTiles = [
    ...earned.slice(0, 6).map((b) => ({ badge: b, earned: true })),
    ...locked.slice(0, Math.max(0, 6 - earned.length)).map((b) => ({ badge: b, earned: false })),
  ]

  return (
    <section className="space-y-6">
      {/* Header */}
      <header>
        <h2 className="font-heading text-xl font-bold text-foreground">
          {tx("profile.healthReport.title", lang)}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {tx("profile.healthReport.subtitle", lang)}
        </p>
      </header>

      {/* ── Section 1: Vitality Hero ── */}
      <Card className="p-5 sm:p-6 bg-gradient-to-br from-emerald-50 via-white to-sky-50 dark:from-emerald-950/20 dark:via-card dark:to-sky-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          {/* Ring + ECG */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative flex h-24 w-24 items-center justify-center">
              <svg className="h-24 w-24 -rotate-90" viewBox="0 0 36 36" aria-hidden>
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="text-muted/30"
                />
                <motion.circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke={scoreColor}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0 100" }}
                  animate={{ strokeDasharray: `${vitalityScore} 100` }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-bold leading-none text-foreground">
                  {vitalityScore}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium mt-0.5">/100</span>
              </div>
            </div>
            <svg
              width="80"
              height="28"
              viewBox="0 0 80 24"
              className="hidden sm:block overflow-hidden"
              style={{ filter: `drop-shadow(0 0 6px ${scoreColor}99)` }}
              aria-hidden
            >
              <path
                d="M0 12 L10 12 L15 4 L20 20 L25 8 L30 16 L35 12 L45 12 L50 4 L55 20 L60 8 L65 16 L70 12 L80 12"
                fill="none"
                stroke={scoreColor}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ opacity: 0.7 }}
              />
            </svg>
          </div>

          {/* Label + streak chip */}
          <div className="flex-1 min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              {tx("profile.healthReport.vitalityScore", lang)}
            </p>
            <p className="mt-0.5 text-lg font-semibold text-foreground">
              {tx(scoreLabelKey, lang)}
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-400">
              <Flame className="h-3 w-3" />
              {tx("profile.healthReport.streakDaysLabel", lang).replace(
                "{n}",
                String(streakDays),
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* ── Section 2: Stat Cards (4 cells) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          emoji="💊"
          value={medications.length}
          label={tx("profile.healthReport.statMeds", lang)}
          accent="text-primary"
        />
        <StatCard
          emoji="🌿"
          value={activeSupplementCount}
          label={tx("profile.healthReport.statSupplements", lang)}
          accent="text-emerald-600"
        />
        <StatCard
          emoji="⚠️"
          value={allergies.length}
          label={tx("profile.healthReport.statAllergies", lang)}
          accent="text-amber-600"
        />
        <StatCard
          emoji="🩸"
          value={labTestCount}
          label={tx("profile.healthReport.statLabs", lang)}
          accent="text-rose-600"
        />
      </div>

      {/* ── Section 3: Badges Preview ── */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
            <Trophy className="h-4 w-4 text-amber-500" />
            {tx("profile.healthReport.achievementBadges", lang)}
          </h3>
          <Link
            href="/badges"
            className="text-xs font-medium text-primary hover:underline"
          >
            {tx("profile.healthReport.viewAllBadges", lang)}
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {badgeTiles.map(({ badge, earned }, i) => {
            const label = txObj(badge, lang)
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: i * 0.06,
                  type: "spring",
                  stiffness: 320,
                  damping: 22,
                }}
                className="flex flex-col items-center gap-1.5 text-center"
              >
                <BadgeIcon
                  badgeId={badge.id}
                  locked={!earned}
                  size={48}
                  showAnimation={earned}
                  fallbackEmoji={badge.icon}
                />
                <span
                  className={`text-[10px] leading-tight line-clamp-2 ${
                    earned
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
              </motion.div>
            )
          })}
        </div>
      </Card>

      {/* ── Section 4: SBAR PDF Card ── */}
      <Card className="p-5 border-primary/20 bg-gradient-to-r from-primary/5 to-emerald-500/5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <FileText className="h-4 w-4 text-primary" />
              {tx("profile.healthReport.sbarCardTitle", lang)}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              {tx("profile.healthReport.sbarCardHint", lang)}
            </p>
          </div>
          <div className="shrink-0">
            <PDFDownloadButton lang={lang} targetUserId={userId} />
          </div>
        </div>
      </Card>

      {/* Small footer — makes it clear this is a subset. Keeps the
          Session 46 roadmap visible to the user without committing copy. */}
      <p className="text-[11px] text-muted-foreground text-center pt-2">
        {tr
          ? "Daha fazla detay için diğer sekmelere göz at."
          : "See the other tabs for deeper details."}
      </p>
    </section>
  )
}

// ─── Small presentational helpers ───
// Extracted only to keep the main render readable — not a public surface.

function StatCard({
  emoji,
  value,
  label,
  accent,
}: {
  emoji: string
  value: number
  label: string
  accent: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-4 text-center shadow-sm">
      <p className="text-[18px] leading-none" aria-hidden>
        {emoji}
      </p>
      <p className={`mt-2 text-xl font-bold ${accent}`}>{value}</p>
      <p className="mt-1 text-[10px] text-muted-foreground leading-tight">{label}</p>
    </div>
  )
}
