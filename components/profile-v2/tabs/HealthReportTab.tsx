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
// Sprint 9 Commit 1/2/3 enrichment — DONE:
//   - Digital Twin (BodySilhouette + DigitalTwinLegend, line ~335 + 599-710)
//   - Recent Activity feed (active alerts + last lab + recent meds, line ~458)
//   - Missing Nudges (nudgeCandidates + setTab navigation, line ~207 + 533)
// Sprint 28 Commit 2 — minor polish: alert cap (3) + meds slice (5) + chronic nudge.
//
// Family-view gating: early return with FamilyProfileGuard when viewing
// another profile. Matches /badges route precedent (KVKK safety +
// sidesteps the legacy SBAR caller-identity leak until Commit 6).
"use client"

import { useMemo } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Flame, Trophy, FileText, ChevronRight } from "lucide-react"
import { tx, txObj, type Lang } from "@/lib/translations"
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
import {
  computeOrganStates,
  ORGAN_POSITIONS,
  SEVERITY_COLOR,
  type OrganId,
  type Severity,
} from "@/lib/health-conditions-map"
import type { UserMedication } from "@/lib/database.types"
import type {
  UserAllergyRow,
  RecentMedRow,
  ActiveAlertRow,
  LastLabTestRow,
} from "@/components/profile-v2/hooks/useProfileData"
import type { ProfileTabId } from "@/components/profile-v2/useProfileTab"

// Sprint 9 Commit 2: inline relative-time helper (Bugün / Dün / N gün önce).
// We avoid date-fns to keep the bundle slim — this hook is the only consumer
// for now. Negative diffs (server clock drift) collapse to "Bugün/Today".
function relativeTime(iso: string, lang: "tr" | "en"): string {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86400000)
  if (days <= 0) return lang === "tr" ? "Bugün" : "Today"
  if (days === 1) return lang === "tr" ? "Dün" : "Yesterday"
  return lang === "tr" ? `${days} gün önce` : `${days} days ago`
}

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
  /** Sprint 9 Commit 1: cross-tab navigation for missing-section nudges. */
  setTab: (id: ProfileTabId) => void
  /** Sprint 9 Commit 2: Recent Activity feed (3 sources, conditional). */
  recentMeds: RecentMedRow[]
  activeAlerts: ActiveAlertRow[]
  lastLabTest: LastLabTestRow | null
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
  setTab,
  recentMeds,
  activeAlerts,
  lastLabTest,
}: HealthReportTabProps) {
  const tr = lang === "tr"

  // Sprint 28 Commit 1 — chronicArr + organStates hoisted ABOVE the early
  // return so React rules-of-hooks are satisfied (useMemo must run on every
  // render, never conditionally after an early return). chronicArr wrapped
  // in useMemo so its identity is stable across renders — was inline ternary
  // creating a fresh [] every render, breaking organStates' useMemo cache.
  const chronicArr = useMemo<string[]>(
    () => (Array.isArray(profile?.chronic_conditions) ? profile!.chronic_conditions! : []),
    [profile],
  )
  // ── Digital Twin organ states (Sprint 9 Commit 3) ──
  // computeOrganStates filters family:/surgery: prefix internally — no extra
  // filter needed at call site.
  const organStates = useMemo(() => computeOrganStates(chronicArr), [chronicArr])

  // Family-view early return — ALL hooks above this point. New hooks must
  // also be declared above this gate (React rules of hooks).
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
  // chronicArr hoisted above (line ~120) for rules-of-hooks compliance.
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

  // organStates hoisted above early return (Sprint 28 Commit 1, rules-of-hooks).
  const hasOrganHighlights = Object.keys(organStates).length > 0

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

  // ── Missing section nudges (Sprint 9 Commit 1) ──
  // Priority order (basicInfo → meds → allergies → vaccines → lifestyle →
  // familyHistory) keeps the most consequential gaps at the top. Capped at
  // 3 with .slice() further down to avoid nudge fatigue when the profile is
  // mostly empty. powerInput is already computed above; reuse — do NOT
  // duplicate the flag logic.
  const nudgeCandidates: Array<{ tabId: ProfileTabId; emoji: string; label: string } | false> = [
    !powerInput.hasBasicInfo && {
      tabId: "genel" as ProfileTabId,
      emoji: "👤",
      label: tx("profile.healthReport.nudges.basicInfo", lang),
    },
    powerInput.medicationCount === 0 && {
      tabId: "ilaclar" as ProfileTabId,
      emoji: "💊",
      label: tx("profile.healthReport.nudges.medications", lang),
    },
    !powerInput.hasAllergies && {
      tabId: "alerjiler" as ProfileTabId,
      emoji: "⚠️",
      label: tx("profile.healthReport.nudges.allergies", lang),
    },
    powerInput.vaccineCount === 0 && {
      tabId: "asilar" as ProfileTabId,
      emoji: "💉",
      label: tx("profile.healthReport.nudges.vaccines", lang),
    },
    !powerInput.hasLifestyle && {
      tabId: "vucut-yasam" as ProfileTabId,
      emoji: "🏃",
      label: tx("profile.healthReport.nudges.lifestyle", lang),
    },
    // Sprint 28 Commit 2 — chronic conditions nudge (spec parite).
    !powerInput.hasChronicConditions && {
      tabId: "tibbi-gecmis" as ProfileTabId,
      emoji: "🩺",
      label: tx("profile.healthReport.nudges.chronicConditions", lang),
    },
    !powerInput.hasFamilyHistory && {
      tabId: "aile-oykusu" as ProfileTabId,
      emoji: "👨‍👩‍👧",
      label: tx("profile.healthReport.nudges.familyHistory", lang),
    },
  ]
  const nudges = nudgeCandidates.filter(
    (n): n is { tabId: ProfileTabId; emoji: string; label: string } => n !== false,
  )

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

        {/* ── Digital Twin organ map (Sprint 9 Commit 3) ── */}
        {/* Hero Card içinde alt-section. Gender-aware silhouette + organ */}
        {/* dots (severity-colored) + legend chips (deduped label).      */}
        <div className="pt-4 mt-4 border-t border-border/50">
          <p className="text-xs font-medium text-muted-foreground mb-3">
            {tx("profile.healthReport.digitalTwin.title", lang)}
          </p>
          <div className="flex items-start gap-4">
            <BodySilhouette
              gender={profile?.gender ?? null}
              organStates={organStates}
            />
            <div className="flex-1 min-w-0">
              {!hasOrganHighlights ? (
                <p className="text-xs text-muted-foreground">
                  {tx("profile.healthReport.digitalTwin.allHealthy", lang)}
                </p>
              ) : (
                <DigitalTwinLegend organStates={organStates} lang={lang} />
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

      {/* ── Section 5: Recent Activity (Sprint 9 Commit 2) ── */}
      {/* 3 kaynak: aktif etkileşim uyarıları (kırmızı border, üstte) */}
      {/* + son lab testi + son eklenen 3 ilaç. Üç array de boşsa render */}
      {/* hiç yapılmaz. relativeTime helper inline (date-fns bağımsız). */}
      {(activeAlerts.length > 0 || lastLabTest || recentMeds.length > 0) && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            {tx("profile.healthReport.recentActivity.title", lang)}
          </p>

          {/* Aktif uyarılar üstte (kritik) — kırmızı border. Sprint 28 Commit 2: max 3 (spec parite). */}
          {activeAlerts.slice(0, 3).map((alert) => (
            <div
              key={alert.id}
              className="flex items-start gap-3 p-3 rounded-lg border border-destructive/30 bg-destructive/5"
            >
              <span className="text-base shrink-0" aria-hidden>
                ⚠️
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground line-clamp-2">
                  {alert.summary ||
                    tx("profile.healthReport.recentActivity.alertGeneric", lang)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {relativeTime(alert.created_at, lang)}
                </p>
              </div>
            </div>
          ))}

          {/* Son lab testi */}
          {lastLabTest && (
            <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card">
              <span className="text-base shrink-0" aria-hidden>
                🩸
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">
                  {tx("profile.healthReport.recentActivity.labResult", lang)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {relativeTime(lastLabTest.created_at, lang)}
                </p>
              </div>
            </div>
          )}

          {/* Son eklenen ilaçlar. Sprint 28 Commit 2: 3 → 5 (spec parite, useProfileData zaten 5 fetch ediyor). */}
          {recentMeds.slice(0, 5).map((med) => {
            const display =
              med.brand_name ||
              med.generic_name ||
              tx("profile.healthReport.recentActivity.unknownMed", lang)
            return (
              <div
                key={med.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card"
              >
                <span className="text-base shrink-0" aria-hidden>
                  💊
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{display}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {tx("profile.healthReport.recentActivity.medAdded", lang)} ·{" "}
                    {relativeTime(med.added_at, lang)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Section 6: Missing Section Nudges (Sprint 9 Commit 1) ── */}
      {/* Sadece eksik bölümler için cross-tab navigation. Tüm profil dolu */}
      {/* iken render olmaz (nudges.length === 0). Max 3 nudge gösterir. */}
      {nudges.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            {tx("profile.healthReport.nudges.title", lang)}
          </p>
          {nudges.slice(0, 3).map((nudge) => (
            <button
              key={nudge.tabId}
              onClick={() => setTab(nudge.tabId)}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-left"
            >
              <span className="text-lg" aria-hidden>
                {nudge.emoji}
              </span>
              <span className="text-sm text-foreground flex-1 min-w-0">{nudge.label}</span>
              <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground shrink-0" aria-hidden />
            </button>
          ))}
        </div>
      )}

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

// Sprint 9 Commit 3 — Digital Twin body silhouette.
// Pure presentational SVG. viewBox 60×120; ORGAN_POSITIONS aynı koordinat
// sisteminde tanımlı, dot'lar overlay olarak çizilir. Gender-aware:
// female → daha dar omuz + daha geniş kalça, male → ters; null → neutral.
// Outline currentColor ile çizilir, parent muted-foreground/40 verir;
// organ dot rengi severity'den gelir.
function BodySilhouette({
  gender,
  organStates,
}: {
  gender: string | null
  organStates: Partial<Record<OrganId, Severity>>
}) {
  const isFemale = gender === "female"
  const isMale = gender === "male"
  const shoulderW = isFemale ? 20 : isMale ? 22 : 21
  const hipW = isFemale ? 20 : isMale ? 18 : 19

  return (
    <svg
      viewBox="0 0 60 120"
      width="60"
      height="120"
      aria-hidden
      className="shrink-0 text-muted-foreground/40"
    >
      {/* Head */}
      <circle
        cx="30"
        cy="14"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      {/* Torso outline (symmetric path, gender-aware shoulder/hip width) */}
      <path
        d={[
          `M${30 - shoulderW / 2} 26`,
          `L${30 - shoulderW / 2 - 1} 50`,
          `L${30 - hipW / 2} 78`,
          `L${30 - hipW / 2 + 1} 108`,
          `L${30 + hipW / 2 - 1} 108`,
          `L${30 + hipW / 2} 78`,
          `L${30 + shoulderW / 2 + 1} 50`,
          `L${30 + shoulderW / 2} 26`,
          "Z",
        ].join(" ")}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Organ dots — severity-driven fill */}
      {ORGAN_POSITIONS.map(({ id, x, y }) => {
        const severity = organStates[id] ?? "healthy"
        return (
          <circle
            key={id}
            cx={x}
            cy={y}
            r="2.5"
            fill={SEVERITY_COLOR[severity]}
            style={{ transition: "fill 500ms" }}
          />
        )
      })}
    </svg>
  )
}

// Sprint 9 Commit 3 — Legend chips for the Digital Twin map.
// Dedupe-by-label: lungLeft + lungRight aynı "Lungs" label'ına döner; sadece
// ilki chip olarak render edilir (severity en yüksek olanı korunur). Aynı
// pattern kidneyLeft + kidneyRight için de geçerli. Mevcut tüm 11 organ id'si
// için i18n key var; bilinmeyen organ skip edilir (defensive).
function DigitalTwinLegend({
  organStates,
  lang,
}: {
  organStates: Partial<Record<OrganId, Severity>>
  lang: Lang
}) {
  // Dedupe pass: aynı label varsa en yüksek severity'yi tut (concern > watch).
  const labelToSeverity = new Map<string, Severity>()
  for (const { id } of ORGAN_POSITIONS) {
    const s = organStates[id]
    if (!s) continue
    const label = tx(`profile.healthReport.digitalTwin.organ.${id}`, lang)
    const existing = labelToSeverity.get(label)
    if (existing === "concern") continue // concern locked
    if (s === "concern" || !existing) labelToSeverity.set(label, s)
  }

  const chips = Array.from(labelToSeverity.entries())

  return (
    <div className="flex flex-wrap gap-1.5">
      {chips.map(([label, severity]) => (
        <span
          key={label}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
          style={{
            background: SEVERITY_COLOR[severity] + "20",
            color: SEVERITY_COLOR[severity],
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ background: SEVERITY_COLOR[severity] }}
            aria-hidden
          />
          {label}
        </span>
      ))}
    </div>
  )
}
