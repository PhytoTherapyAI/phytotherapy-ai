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
import { useEffect } from "react"
import { AlertTriangle, Info, X, ArrowRight, Stethoscope } from "lucide-react"
import type { EdgeItem } from "@/lib/safety/check-med-interactions"

interface Props {
  dangerous: EdgeItem[]
  caution: EdgeItem[]
  summary: string
  lang: "tr" | "en"
  onDismiss: () => void
  onAskDoctor: () => void
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
        label: tr ? "Ciddi etkileşim" : "Serious interaction",
      }
    : {
        wrap: "border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30",
        accent: "text-amber-800 dark:text-amber-300",
        pill: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
        Icon: Info,
        label: tr ? "Dikkat gerektiren etkileşim" : "Caution",
      }
  const { Icon } = chrome

  return (
    <section
      role="alert"
      aria-live="polite"
      className={`mb-6 rounded-2xl border ${chrome.wrap} p-4 sm:p-5`}
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
                  ? `${edges[0].source} + ${edges[0].target}`
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

          {/* Top-3 edge breakdown */}
          <ul className="mt-3 space-y-2">
            {edges.slice(0, 3).map((e, i) => (
              <li key={i} className="rounded-lg border border-border/60 bg-background/70 p-3">
                <p className="text-sm font-semibold">
                  {e.source} + {e.target}
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
            {edges.length > 3 && (
              <li className="text-xs text-muted-foreground pl-1">
                {tr ? `+ ${edges.length - 3} etkileşim daha` : `+ ${edges.length - 3} more interactions`}
              </li>
            )}
          </ul>

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
                track("safety.banner.cta.doctor_ask", { severity })
                onAskDoctor()
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
