// © 2026 DoctoPal — All Rights Reserved
//
// F-SAFETY-001: interaction-check trigger helper, designed for 4 planned
// call-sites even though only the profile add flow consumes it in this
// commit.
//
// Call-sites (today + future):
//   ✅ app/profile/page.tsx — LegacyProfilePage.addMedication (this commit)
//   ⏳ components/profile-v2/tabs/MedicationsTab (F-PROFILE-001 Commit 2)
//   ⏳ components/scanner/MedicationScanner — post photo-scan insert
//   ⏳ components/layout/medication-update-dialog — after 15-day confirm
//   ⏳ components/onboarding/steps/MedicationsStep — onboarding final check
//
// Shape (`checkInteractionsAfterAdd`) is deliberately callback-based so
// each site can hook into its own loading / result / error state without
// leaking React concerns into this pure function.
//
// Behaviour summary (Session 45 plan):
//   - 429 rate-limit → silent retry once after 60 s, plus a soft toast
//     at the call-site (caller decides copy)
//   - 400 "need ≥ 2 meds" → silent skip (expected when the user just
//     added their first med)
//   - Other non-2xx → onError
//   - 2xx → filter edges into dangerous / caution / safe, call onResult
//   - Telemetry: every transition emits a breadcrumb (Sentry when
//     available) + dev console for local iteration. TODO: wire real
//     analytics provider when that layer lands.
"use client"

import { createBrowserClient } from "@/lib/supabase"

export interface EdgeItem {
  source: string
  target: string
  severity: "safe" | "caution" | "dangerous"
  description: string
  mechanism: string
}

export interface InteractionCheckResult {
  dangerous: EdgeItem[]
  caution: EdgeItem[]
  summary: string
  checkedAt: string
}

interface CheckParams {
  userId: string
  lang: "tr" | "en"
  onLoadingStart?: () => void
  onResult: (result: InteractionCheckResult) => void
  onError?: (err: Error) => void
  /** "rate_limited" is fired ONCE when the first 429 arrives so the caller
   *  can show a soft "şu an yoğun, tekrar denenecek" toast. A silent
   *  retry in 60 s is scheduled internally; the retry re-enters this
   *  function and will call onResult on success. */
  onRateLimited?: () => void
  /** Internal — retry counter; never set by call-sites. */
  _retryCount?: number
}

const MAX_RETRY = 1
const RETRY_DELAY_MS = 60_000

function track(event: string, data?: Record<string, unknown>): void {
  if (process.env.NODE_ENV === "development") {
    // TODO (F-SAFETY-002+): replace with real analytics provider
    // (PostHog / Mixpanel) when that layer lands.
    console.log(`[safety-telemetry] ${event}`, data ?? {})
  }
  try {
    const w = window as unknown as { Sentry?: { addBreadcrumb?: (b: unknown) => void } }
    w.Sentry?.addBreadcrumb?.({
      category: "safety",
      message: event,
      level: "info",
      data,
    })
  } catch { /* no-op */ }
}

/**
 * F-SAFETY-002 rename — the helper now handles supplement updates and
 * batch onboarding inserts as well as single-medication adds, so the
 * "AfterAdd" name was misleading. Backwards-compat alias is exported
 * below so the F-SAFETY-001 profile/page.tsx call-site keeps working
 * until Session 46's deprecation pass.
 */
export async function checkInteractionsAfterChange(params: CheckParams): Promise<void> {
  const { userId, lang, onLoadingStart, onResult, onError, onRateLimited } = params
  const retryCount = params._retryCount ?? 0

  track("safety.interaction_check.triggered", { userId, retryCount })
  if (retryCount === 0) onLoadingStart?.()

  try {
    const supabase = createBrowserClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      throw new Error("no_session")
    }

    const res = await fetch("/api/interaction-map", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ lang }),
    })

    // ── Rate-limit: silent retry once after 60 s ───────────────────
    if (res.status === 429) {
      track("safety.interaction_check.result", { kind: "rate_limited", retryCount })
      if (retryCount === 0) onRateLimited?.()
      if (retryCount < MAX_RETRY) {
        setTimeout(() => {
          void checkInteractionsAfterChange({ ...params, _retryCount: retryCount + 1 })
        }, RETRY_DELAY_MS)
      } else {
        // Persistent 429 — not normal; elevate to breadcrumb at warn level.
        track("safety.interaction_check.error", { kind: "rate_limit_persistent", retryCount })
      }
      return
    }

    // ── < 2 meds → endpoint returns 400; normal, not an error ──────
    if (res.status === 400) {
      track("safety.interaction_check.result", { kind: "too_few_meds", retryCount })
      return
    }

    if (!res.ok) {
      throw new Error(`http_${res.status}`)
    }

    const data = await res.json()
    const edges = Array.isArray(data.edges) ? (data.edges as EdgeItem[]) : []
    const dangerous = edges.filter((e) => e.severity === "dangerous")
    const caution = edges.filter((e) => e.severity === "caution")

    track("safety.interaction_check.result", {
      kind: dangerous.length > 0 ? "dangerous" : caution.length > 0 ? "caution" : "safe",
      dangerous: dangerous.length,
      caution: caution.length,
    })

    onResult({
      dangerous,
      caution,
      summary: typeof data.summary === "string" ? data.summary : "",
      checkedAt: new Date().toISOString(),
    })
  } catch (err) {
    track("safety.interaction_check.error", {
      message: err instanceof Error ? err.message : "unknown",
    })
    onError?.(err instanceof Error ? err : new Error(String(err)))
  }
}

/**
 * Backwards-compat alias from F-SAFETY-001. Existing call-sites
 * (app/profile/page.tsx LegacyProfilePage.addMedication) continue to
 * work without an edit. To be removed in Session 46 cleanup once
 * every consumer has migrated to the new name.
 *
 * @deprecated use checkInteractionsAfterChange instead
 */
export const checkInteractionsAfterAdd = checkInteractionsAfterChange
