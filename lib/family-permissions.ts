// © 2026 DoctoPal — All Rights Reserved
// Server-side helper for resolving "whose profile is this API call acting on?"
//
// Used by /api/chat, /api/sbar-pdf, /api/sbar-email, /api/daily-care-plan etc.
// Rules:
//   - If no targetUserId given → caller acts on own profile
//   - If targetUserId == caller → OK
//   - If targetUserId != caller → must share an accepted family_group
//   - Premium required when target != caller (family member context costs)
//
// IMPORTANT: routes call this with a service-role Supabase client
// (createServerClient). Service role has no auth.uid() context, so we CANNOT
// rely on RPCs that use auth.uid() internally (e.g. get_family_member_user_ids).
// Instead we do direct SELECTs against family_members and filter by callerId
// / targetUserId in Node.
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

  // Cross-user: caller and target must share an accepted family_group.
  // Direct-query approach (doesn't rely on auth.uid() inside an RPC, which
  // returns NULL when the client is service-role).
  const { data: callerGroups, error: callerErr } = await supabase
    .from("family_members")
    .select("group_id")
    .eq("user_id", callerId)
    .eq("invite_status", "accepted")

  if (callerErr) {
    console.error("[family-permissions] caller groups query error:", callerErr.message)
    return { ok: false, status: 403, error: "Permission check failed" }
  }

  const callerGroupIds = (callerGroups ?? [])
    .map(g => (g as { group_id: string }).group_id)
    .filter((v): v is string => typeof v === "string")

  if (callerGroupIds.length === 0) {
    console.warn(
      `[family-permissions] 403 caller has no accepted family groups — caller=${callerId} target=${targetUserId}`
    )
    return { ok: false, status: 403, error: "Not a family member" }
  }

  const { data: targetMembership, error: targetErr } = await supabase
    .from("family_members")
    .select("id, allows_management")
    .eq("user_id", targetUserId)
    .eq("invite_status", "accepted")
    .in("group_id", callerGroupIds)
    .maybeSingle()

  if (targetErr) {
    console.error("[family-permissions] target membership query error:", targetErr.message)
    return { ok: false, status: 403, error: "Permission check failed" }
  }

  if (!targetMembership) {
    console.warn(
      `[family-permissions] 403 Not a family member — caller=${callerId} target=${targetUserId} callerGroups=${callerGroupIds.length}`
    )
    return { ok: false, status: 403, error: "Not a family member" }
  }

  // ── Consent gate: target user must have explicitly granted management
  // permission (allows_management=true on THEIR family_members row) before
  // any caller — even an owner/admin with Premium — can act on their behalf.
  // This is orthogonal to AI consent (which the target must also grant on
  // their own profile); this check is specifically about caregiver access.
  if (!targetMembership.allows_management) {
    console.warn(
      `[family-permissions] 403 management not granted — caller=${callerId} target=${targetUserId}`
    )
    return {
      ok: false,
      status: 403,
      error: "management_not_granted",
    }
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
