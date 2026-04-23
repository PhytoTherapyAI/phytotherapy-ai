// © 2026 DoctoPal — All Rights Reserved
//
// Free chat quota — 20 questions per day, calendar-day reset (00:00 user
// local? no — UTC midnight to keep it cheap and predictable; the difference
// for an Istanbul user is at most 3 hours and the spec already calls this
// "günde 20 soru" without a timezone clause).
//
// Source of truth: query_history rows authored by this user since UTC
// midnight. We don't keep a separate counter table because:
//   - query_history is already the canonical chat ledger
//   - a counter table would drift if the API ever fails to insert and we'd
//     have to reconcile under load
//   - 20-row scan with the existing idx_query_history_user_id index is
//     trivial; we add a (user_id, created_at) usage in the query plan
//
// Premium users skip this check entirely — server does
// getUserEffectivePremium() FIRST and only invokes this helper if the user
// is on the free plan.

import type { SupabaseClient } from "@supabase/supabase-js"
import { FREE_LIMITS } from "@/lib/premium"

export interface ChatQuotaStatus {
  /** Daily allotment — 20 for free users today. */
  limit: number
  /** Messages already sent today (UTC). */
  used: number
  /** max(0, limit - used). */
  remaining: number
  /** ISO timestamp of the next UTC midnight, when the counter resets. */
  resetsAt: string
}

export const FREE_CHAT_DAILY_LIMIT = FREE_LIMITS.queriesPerDay

/** Compute today's quota usage without enforcing it. Useful for UI counters. */
export async function getChatQuotaStatus(
  userId: string,
  supabase: SupabaseClient
): Promise<ChatQuotaStatus> {
  const limit = FREE_CHAT_DAILY_LIMIT
  if (!userId) {
    return { limit, used: 0, remaining: limit, resetsAt: nextUtcMidnightIso() }
  }

  const sinceIso = todayUtcMidnightIso()
  let used = 0
  try {
    const { count, error } = await supabase
      .from("query_history")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", sinceIso)
    if (error) {
      // Fail-open on count failure: we'd rather risk one over-quota request
      // than block a paying-flow user because of a transient DB issue. The
      // API layer logs this and Sentry breadcrumbs the failure.
      used = 0
    } else {
      used = typeof count === "number" ? count : 0
    }
  } catch {
    used = 0
  }
  return {
    limit,
    used,
    remaining: Math.max(0, limit - used),
    resetsAt: nextUtcMidnightIso(),
  }
}

/**
 * Check + return whether the user has exceeded today's free quota.
 * Caller should only invoke this after confirming the user is NOT premium.
 */
export async function enforceFreeChatQuota(
  userId: string,
  supabase: SupabaseClient
): Promise<{ exceeded: boolean } & ChatQuotaStatus> {
  const status = await getChatQuotaStatus(userId, supabase)
  return { exceeded: status.used >= status.limit, ...status }
}

// ─────────────────────────────────────────────
// Helpers — UTC day boundaries
// ─────────────────────────────────────────────

function todayUtcMidnightIso(): string {
  const d = new Date()
  d.setUTCHours(0, 0, 0, 0)
  return d.toISOString()
}

function nextUtcMidnightIso(): string {
  const d = new Date()
  d.setUTCHours(24, 0, 0, 0)
  return d.toISOString()
}
