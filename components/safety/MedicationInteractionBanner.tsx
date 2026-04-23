// © 2026 DoctoPal — All Rights Reserved
//
// F-SAFETY-001 banner — renders above the profile content after a new
// medication insert when /api/interaction-map surfaces dangerous or
// caution-level edges. Session 45 plan rules:
//   - Danger (≥ 1 dangerous edge) → red chrome
//   - Caution (≥ 1 caution edge, 0 dangerous) → amber chrome
//   - No dismissal timer (autoclose was explicitly rejected — 10 s
//     autoclose on a clinical warning is a risky UX). Manual X only.
//   - Two CTAs: "Detaylı Analiz" → /interaction-checker,
//     "Doktoruma Sor" → parent opens the existing SBAR email dialog
//     (no prefill; interaction-aware templates wait for a future sprint)
//   - Telemetry breadcrumbs at shown / detailed-analysis / doctor-ask /
//     dismissed per the plan
"use client"

import Link from "next/link"
import { useEffect, useRef } from "react"
import { AlertTriangle, Info, X, ArrowRight, Stethoscope } from "lucide-react"
import type { EdgeItem, EdgeCategory } from "@/lib/safety/check-med-interactions"
import { buildDoctorMailtoUrl } from "@/lib/safety/sbar-interaction-template"

// F-SAFETY-002 Commit 2 — category labels shown above each grouped
// edge block. Legacy edges (no category field) coerce to "drug-drug"
// at render time so older cached API responses still display correctly.
const CATEGORY_LABELS: Record<EdgeCategory, { tr: string; en: string; emoji: string }> = {
  "drug-drug":       { tr: "İlaç + İlaç",         en: "Drug + Drug",           emoji: "💊" },
  "drug-chronic":    { tr: "İlaç + Hastalık",     en: "Drug + Condition",      emoji: "🩺" },
  "drug-supplement": { tr: "İlaç + Takviye",      en: "Drug + Supplement",     emoji: "🌿" },
  "drug-allergy":    { tr: "İlaç + Alerji",       en: "Drug + Allergy",        emoji: "⚠️" },
  "drug-condition":  { tr: "İlaç + Kritik Durum", en: "Drug + Critical Flag",  emoji: "🚨" },
}

// Stable category order — drug-condition first (pregnancy / kidney /
// liver carry the highest clinical weight), then drug-allergy, then
// drug-drug, chronic, supplement.
const CATEGORY_ORDER: EdgeCategory[] = [
  "drug-condition",
  "drug-allergy",
  "drug-drug",
  "drug-chronic",
  "drug-supplement",
]

/**
 * Title-case a medication name for display.
 *
 *  - Normalises underscores and hyphens to spaces so "warfarin_sodium"
 *    or "acetyl-salicylic-acid" don't render with the slug separator
 *    visible. Multiple consecutive separators collapse to one space.
 *  - Locale-aware uppercase via toLocaleUpperCase("tr-TR") so
 *    "isotretinoin" becomes "İzotretinoin" (dotted İ, not ASCII I).
 *    Turkish readers would notice the wrong glyph on the first letter
 *    immediately.
 *
 * Examples:
 *   "isotretinoin"             → "İzotretinoin"
 *   "warfarin_sodium"          → "Warfarin Sodium"
 *   "acetyl-salicylic-acid"    → "Acetyl Salicylic Acid"
 *   "  __metformin  "          → "Metformin"
 */
function titleCaseMed(name: string): string {
  if (!name) return name
  const normalised = name.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim()
  return normalised.replace(/\b([\p{L}])/gu, (_, ch: string) => ch.toLocaleUpperCase("tr-TR"))
}

interface Props {
  dangerous: EdgeItem[]
  caution: EdgeItem[]
  summary: string
  lang: "tr" | "en"
  onDismiss: () => void
  /**
   * Optional override. Default (F-SAFETY-002 Commit 3): the banner
   * opens the user's mail client with a pre-filled subject + body
   * built by lib/safety/sbar-interaction-template. Pass a callback
   * only if a specific surface needs alternative routing (e.g. a
   * custom SBAR dialog) — the profile page no longer does.
   */
  onAskDoctor?: () => void
  /** Patient name used in the mailto closing line. Falls back to a
   *  neutral "Hasta" / "Patient" when absent. */
  patientName?: string | null
}

function track(event: string, data?: Record<string, unknown>): void {
  if (process.env.NODE_ENV === "development") console.log(`[safety-telemetry] ${event}`, data ?? {})
  try {
    const w = window as unknown as { Sentry?: { addBreadcrumb?: (b: unknown) => void } }
    w.Sentry?.addBreadcrumb?.({ category: "safety", message: event, level: "info", data })
  } catch { /* no-op */ }
}

export function MedicationInteractionBanner({
  dangerous,
  caution,
  summary,
  lang,
  onDismiss,
  onAskDoctor,
  patientName,
}: Props) {
  const tr = lang === "tr"
  const isDanger = dangerous.length > 0
  const edges = isDanger ? dangerous : caution
  const severity: "dangerous" | "caution" | null = isDanger
    ? "dangerous"
    : caution.length > 0
      ? "caution"
      : null

  // Fire a single "shown" breadcrumb per banner mount. Deps include the
  // first-edge identity so a fresh check that replaces the old result
  // re-fires the event without spamming on every render.
  const firstEdgeKey = edges[0] ? `${edges[0].source}|${edges[0].target}` : "none"
  useEffect(() => {
    if (!severity) return
    track("safety.banner.shown", {
      severity,
      dangerousCount: dangerous.length,
      cautionCount: caution.length,
      firstEdge: firstEdgeKey,
    })
  }, [severity, dangerous.length, caution.length, firstEdgeKey])

  if (!severity) return null

  const chrome = isDanger
    ? {
        wrap: "border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/30",
        accent: "text-red-700 dark:text-red-300",
        pill: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
        Icon: AlertTriangle,
        label: tr ? "⚠️ ÖNEMLİ UYARI — Ciddi Etkileşim" : "⚠️ IMPORTANT WARNING — Serious Interaction",
        glowRing: "ring-4 ring-red-500/40",
      }
    : {
        wrap: "border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30",
        accent: "text-amber-800 dark:text-amber-300",
        pill: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
        Icon: Info,
        label: tr ? "Dikkat — İzlem Gerektiren Etkileşim" : "Caution — Monitor This Interaction",
        glowRing: "ring-4 ring-amber-500/40",
      }
  const { Icon } = chrome

  // Post-mount: smooth-scroll to the banner (user is usually scrolled
  // down at the medications card when they hit Save) + short glow pulse
  // to draw the eye. Retriggers whenever the first edge changes, i.e.
  // a follow-up insert produced a new interaction alert.
  const rootRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    // Give the caller one frame to commit any sibling re-renders
    // (medications list update, etc.) before we start scrolling.
    const scrollT = window.setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth", block: "center" })
      el.classList.add(...chrome.glowRing.split(" "), "animate-pulse")
    }, 50)
    const removeT = window.setTimeout(() => {
      el.classList.remove(...chrome.glowRing.split(" "), "animate-pulse")
    }, 3050)
    return () => {
      window.clearTimeout(scrollT)
      window.clearTimeout(removeT)
    }
  }, [firstEdgeKey, chrome.glowRing])

  return (
    <section
      ref={rootRef}
      role="alert"
      aria-live="polite"
      className={`mb-6 rounded-2xl border ${chrome.wrap} p-4 sm:p-5 transition-shadow scroll-mt-24`}
    >
      <div className="flex items-start gap-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${chrome.pill}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className={`text-[11px] font-bold uppercase tracking-wider ${chrome.accent}`}>
                {chrome.label}
              </p>
              <h3 className="mt-0.5 text-base sm:text-lg font-bold text-foreground">
                {edges.length === 1
                  ? `${titleCaseMed(edges[0].source)} + ${titleCaseMed(edges[0].target)}`
                  : tr
                    ? `${edges.length} etkileşim tespit edildi`
                    : `${edges.length} interactions detected`}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => {
                track("safety.banner.dismissed", { severity })
                onDismiss()
              }}
              aria-label={tr ? "Uyarıyı kapat" : "Dismiss warning"}
              className="shrink-0 h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Edge breakdown — grouped by category (F-SAFETY-002 Commit 2).
              Each category renders its own mini header + up to 2 edges
              + "+N more" overflow. Old single-matrix banners read the
              same UI with one auto-coerced "drug-drug" group. */}
          <div className="mt-3 space-y-3">
            {CATEGORY_ORDER.map((cat) => {
              const items = edges.filter((e) => (e.category ?? "drug-drug") === cat)
              if (items.length === 0) return null
              const catMeta = CATEGORY_LABELS[cat]
              return (
                <div key={cat} className="space-y-1.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/90">
                    <span className="mr-1">{catMeta.emoji}</span>
                    {catMeta[lang]}
                  </p>
                  <ul className="space-y-2">
                    {items.slice(0, 2).map((e, i) => (
                      <li key={i} className="rounded-lg border border-border/60 bg-background/70 p-3">
                        <p className="text-sm font-semibold">
                          {titleCaseMed(e.source)} + {titleCaseMed(e.target)}
                        </p>
                        {e.description && (
                          <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                            {e.description}
                          </p>
                        )}
                        {e.mechanism && (
                          <p className="mt-0.5 text-[11px] text-muted-foreground/80 italic leading-relaxed">
                            {tr ? "Mekanizma: " : "Mechanism: "}
                            {e.mechanism}
                          </p>
                        )}
                      </li>
                    ))}
                    {items.length > 2 && (
                      <li className="text-xs text-muted-foreground pl-1">
                        {tr
                          ? `+ ${items.length - 2} ${catMeta.tr.toLowerCase()} daha`
                          : `+ ${items.length - 2} more ${catMeta.en.toLowerCase()}`}
                      </li>
                    )}
                  </ul>
                </div>
              )
            })}
          </div>

          {/* Summary (optional) */}
          {summary && (
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed border-t border-border/40 pt-2">
              {summary}
            </p>
          )}

          {/* CTAs */}
          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <Link
              href="/interaction-checker"
              onClick={() => track("safety.banner.cta.detailed_analysis", { severity })}
              className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90 ${
                isDanger
                  ? "bg-red-600 text-white"
                  : "bg-amber-600 text-white"
              }`}
            >
              {tr ? "Detaylı Analiz" : "Detailed Analysis"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <button
              type="button"
              onClick={() => {
                // Allow callers to override with a custom dialog
                // (legacy SBAR flow, etc). Default path: build a
                // mailto: URL so the user's mail client opens with
                // the interaction brief pre-filled. Recipient is
                // blank — the user pastes in their physician's
                // address. Works on every platform without a round
                // trip to the server.
                track("safety.banner.cta.doctor_ask", { severity })
                if (onAskDoctor) {
                  onAskDoctor()
                  return
                }
                const url = buildDoctorMailtoUrl({
                  edges,
                  summary,
                  patientName: patientName ?? null,
                  lang,
                })
                track("safety.banner.cta.doctor_mailto_opened", {
                  severity,
                  edgeCount: edges.length,
                })
                if (typeof window !== "undefined") {
                  window.location.href = url
                }
              }}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-muted/60 transition-colors"
            >
              <Stethoscope className="h-3.5 w-3.5" />
              {tr ? "Doktoruma Sor" : "Ask My Doctor"}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
