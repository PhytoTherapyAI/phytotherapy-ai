// © 2026 DoctoPal — All Rights Reserved
// Server-side helper for resolving "whose profile is this API call acting on?"
//
// Used by /api/chat, /api/sbar-pdf, /api/sbar-email, /api/daily-care-plan etc.
// Rules:
//   - If no targetUserId given → caller acts on own profile
//   - If targetUserId == caller → OK
//   - If targetUserId != caller → must share an accepted family_group
//     (checked via get_family_member_user_ids() RPC from the FAZ 3 migration)
//   - Premium required when target != caller (family member context costs)
//
// Returns a discriminated union so routes can branch on { ok, reason }.

import type { SupabaseClient } from "@supabase/supabase-js"
import { getPremiumStatus } from "@/lib/premium"

export type TargetResolution =
  | { ok: true; callerId: string; targetUserId: string; isOwnProfile: boolean }
  | { ok: false; status: 401 | 402 | 403; error: string }

export async function resolveTargetUser(
  supabase: SupabaseClient,
  authHeader: string | null,
  requestedTargetUserId: string | null | undefined
): Promise<TargetResolution> {
  if (!authHeader?.startsWith("Bearer ")) {
    return { ok: false, status: 401, error: "Unauthorized" }
  }

  const token = authHeader.replace("Bearer ", "")
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return { ok: false, status: 401, error: "Unauthorized" }
  }

  const callerId = user.id
  const requested = requestedTargetUserId?.trim()
  const targetUserId = requested && requested.length > 0 ? requested : callerId
  const isOwnProfile = targetUserId === callerId

  // Own profile → no extra checks
  if (isOwnProfile) {
    return { ok: true, callerId, targetUserId, isOwnProfile: true }
  }

  // Cross-user: require caller+target to share an accepted family group
  const { data: familyUserIds, error: rpcErr } = await supabase.rpc(
    "get_family_member_user_ids"
  )

  if (rpcErr) {
    console.error("[family-permissions] RPC error:", rpcErr.message)
    return { ok: false, status: 403, error: "Permission check failed" }
  }

  const allowedIds = new Set(
    (Array.isArray(familyUserIds) ? familyUserIds : []).map((r: unknown) =>
      typeof r === "string" ? r : (r as { get_family_member_user_ids?: string })?.get_family_member_user_ids
    ).filter((v): v is string => typeof v === "string")
  )

  if (!allowedIds.has(targetUserId)) {
    return { ok: false, status: 403, error: "Not a family member" }
  }

  // Cross-user actions are Premium-only
  const { data: callerProfile } = await supabase
    .from("user_profiles")
    .select("plan, trial_started_at, created_at")
    .eq("id", callerId)
    .maybeSingle()

  const premium = getPremiumStatus(callerProfile || {})
  if (!premium.isPremium) {
    return {
      ok: false,
      status: 402,
      error: "Premium subscription required to act on behalf of family members",
    }
  }

  return { ok: true, callerId, targetUserId, isOwnProfile: false }
}
