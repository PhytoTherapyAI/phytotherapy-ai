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

/**
 * F-SAFETY-002 Commit 2: `category` marks which matrix an edge came
 * from — drug-drug (original), drug-chronic, drug-supplement,
 * drug-allergy, drug-condition (pregnancy / breastfeeding / kidney /
 * liver). Backwards-compat optional: edges from the old schema (and
 * any caller that doesn't pass category) fall back to "drug-drug" at
 * the display site.
 */
export type EdgeCategory =
  | "drug-drug"
  | "drug-chronic"
  | "drug-supplement"
  | "drug-allergy"
  | "drug-condition"

export interface EdgeItem {
  source: string
  target: string
  severity: "safe" | "caution" | "dangerous"
  category?: EdgeCategory
  description: string
  mechanism: string
}

export interface InteractionCheckResult {
  dangerous: EdgeItem[]
  caution: EdgeItem[]
  summary: string
  checkedAt: string
  /**
   * F-SAFETY-002.2: Supabase row id from medication_interaction_alerts
   * for the persistent banner. Present whenever the helper successfully
   * insert'ed the alert. Absent (undefined) when:
   *   - user not authenticated (no session)
   *   - DB insert failed (graceful degrade: banner still shows for the
   *     session, but dismiss / resolve buttons won't work)
   *   - result had zero dangerous + caution edges (nothing to persist)
   */
  alertId?: string
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

    // Kept for backwards compat — old dashboards / breadcrumb parsers
    // read this event; legacy fields (dangerous, caution counts).
    track("safety.interaction_check.result", {
      kind: dangerous.length > 0 ? "dangerous" : caution.length > 0 ? "caution" : "safe",
      dangerous: dangerous.length,
      caution: caution.length,
    })

    // F-SAFETY-002 category breakdown. Edges without an explicit
    // category coerce to "drug-drug" (the original single-matrix
    // output). Shape mirrors the one discussed in the Session 45 plan:
    // safety.result.drug_{drug,chronic,supplement,allergy,condition}.{dangerous,caution,safe}
    const CATEGORIES: EdgeCategory[] = [
      "drug-drug", "drug-chronic", "drug-supplement", "drug-allergy", "drug-condition",
    ]
    const byCategory = Object.fromEntries(
      CATEGORIES.map((cat) => {
        const slice = edges.filter((e) => (e.category ?? "drug-drug") === cat)
        return [
          cat.replace("-", "_"),
          {
            dangerous: slice.filter((e) => e.severity === "dangerous").length,
            caution: slice.filter((e) => e.severity === "caution").length,
            safe: slice.filter((e) => e.severity === "safe").length,
          },
        ]
      }),
    )
    track("safety.interaction_check.result.by_category", byCategory)

    const summaryText = typeof data.summary === "string" ? data.summary : ""

    // F-SAFETY-002.2: persist the alert so it survives refresh / tab
    // close. Only dangerous + caution rows are stored — safe alerts
    // never render UI. Failure here is graceful: the banner still
    // renders for this session (dismissed on F5) with alertId=undefined;
    // dismiss / resolve buttons degrade to visual-only.
    let alertId: string | undefined
    if (dangerous.length > 0 || caution.length > 0) {
      const severity: "dangerous" | "caution" = dangerous.length > 0 ? "dangerous" : "caution"
      const persistedEdges = [...dangerous, ...caution]
      try {
        const { data: inserted, error: insertErr } = await supabase
          .from("medication_interaction_alerts")
          .insert({
            user_id: userId,
            edges: persistedEdges,
            summary: summaryText || null,
            severity,
            // trigger_medication optional — caller doesn't know which
            // med was the trigger unless we thread it through. Left
            // null for now; future: pass params.triggerMedication.
            trigger_medication: null,
          })
          .select("id")
          .single()
        if (insertErr) {
          track("safety.alert.persist_failed", { code: insertErr.code, message: insertErr.message })
        } else if (inserted) {
          alertId = (inserted as { id: string }).id
          track("safety.alert.persisted", {
            severity,
            edgeCount: persistedEdges.length,
            categories: Array.from(new Set(persistedEdges.map((e) => e.category ?? "drug-drug"))),
          })
        }
      } catch (err) {
        track("safety.alert.persist_failed", {
          message: err instanceof Error ? err.message : "unknown",
        })
      }
    }

    onResult({
      dangerous,
      caution,
      summary: summaryText,
      checkedAt: new Date().toISOString(),
      alertId,
    })
  } catch (err) {
    track("safety.interaction_check.error", {
      message: err instanceof Error ? err.message : "unknown",
    })
    onError?.(err instanceof Error ? err : new Error(String(err)))
  }
}

/**
 * F-SAFETY-002.2: load the user's most recent still-visible interaction
 * alert (unresolved AND undismissed). Used by the profile page mount-
 * effect so a refresh doesn't wipe the banner. Returns null when no
 * active alert exists OR when the table isn't migrated yet — the
 * caller should fall back to the default "Doğrulandı!" badge.
 */
export async function fetchActiveInteractionAlert(
  userId: string,
): Promise<(InteractionCheckResult & { alertId: string }) | null> {
  if (!userId) return null
  try {
    const supabase = createBrowserClient()
    const { data, error } = await supabase
      .from("medication_interaction_alerts")
      .select("id, edges, summary, severity, created_at")
      .eq("user_id", userId)
      .is("resolved_at", null)
      .is("dismissed_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error || !data) return null
    const row = data as {
      id: string
      edges: EdgeItem[]
      summary: string | null
      severity: "dangerous" | "caution"
      created_at: string
    }
    const edges = Array.isArray(row.edges) ? row.edges : []
    return {
      alertId: row.id,
      dangerous: edges.filter((e) => e.severity === "dangerous"),
      caution: edges.filter((e) => e.severity === "caution"),
      summary: row.summary ?? "",
      checkedAt: row.created_at,
    }
  } catch {
    return null
  }
}

/**
 * F-SAFETY-002.2: session-level dismiss. Hides the banner until the
 * next trigger (new med insert that produces dangerous / caution edges).
 */
export async function dismissInteractionAlert(alertId: string): Promise<void> {
  if (!alertId) return
  track("safety.alert.dismissed_session", { alertId })
  try {
    const supabase = createBrowserClient()
    await supabase
      .from("medication_interaction_alerts")
      .update({ dismissed_at: new Date().toISOString() })
      .eq("id", alertId)
  } catch { /* soft fail — UI already hid */ }
}

/**
 * F-SAFETY-002.2: permanent resolution. "Doktor onayladı" / clinician-
 * acknowledged. Banner never returns for this alert row.
 */
export async function resolveInteractionAlert(alertId: string, note?: string): Promise<void> {
  if (!alertId) return
  track("safety.alert.resolved_permanent", { alertId })
  try {
    const supabase = createBrowserClient()
    await supabase
      .from("medication_interaction_alerts")
      .update({
        resolved_at: new Date().toISOString(),
        resolution_note: note ?? null,
      })
      .eq("id", alertId)
  } catch { /* soft fail */ }
}

/**
 * F-SAFETY-002.2: auto-resolve any active alert whose edges reference
 * the medication the user just deleted. Called from the deletion flow
 * so removing Amoxicillin automatically clears the penicillin+amoxicillin
 * alert (no stale banner requiring manual dismissal).
 *
 * Matching is case-insensitive on source OR target. Per row, we update
 * resolved_at = now() once any edge matches.
 */
export async function autoResolveAlertsForMedication(
  userId: string,
  medName: string,
): Promise<void> {
  if (!userId || !medName) return
  const needle = medName.trim().toLowerCase()
  if (!needle) return
  try {
    const supabase = createBrowserClient()
    const { data: rows } = await supabase
      .from("medication_interaction_alerts")
      .select("id, edges")
      .eq("user_id", userId)
      .is("resolved_at", null)
    if (!rows || rows.length === 0) return
    const matchIds: string[] = []
    for (const row of rows as Array<{ id: string; edges: EdgeItem[] }>) {
      const edges = Array.isArray(row.edges) ? row.edges : []
      const hit = edges.some((e) =>
        (e.source?.toLowerCase() ?? "").includes(needle)
        || (e.target?.toLowerCase() ?? "").includes(needle),
      )
      if (hit) matchIds.push(row.id)
    }
    if (matchIds.length === 0) return
    await supabase
      .from("medication_interaction_alerts")
      .update({
        resolved_at: new Date().toISOString(),
        resolution_note: `auto-resolved: ${medName} removed`,
      })
      .in("id", matchIds)
    track("safety.alert.auto_resolved_on_med_delete", {
      medName,
      resolvedCount: matchIds.length,
    })
  } catch { /* soft fail */ }
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
