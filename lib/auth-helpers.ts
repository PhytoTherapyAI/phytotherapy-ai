// © 2026 DoctoPal — All Rights Reserved
import type { SupabaseClient } from "@supabase/supabase-js"

/**
 * Kullanıcının aile grubu var mı kontrol eder.
 * Owner olarak family_groups VEYA accepted member olarak family_members.
 */
export async function checkHasFamily(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  try {
    const [{ data: ownerGroup }, { data: membership }] = await Promise.all([
      supabase
        .from("family_groups")
        .select("id")
        .eq("owner_id", userId)
        .maybeSingle(),
      supabase
        .from("family_members")
        .select("group_id")
        .eq("user_id", userId)
        .eq("invite_status", "accepted")
        .maybeSingle(),
    ])
    return !!(ownerGroup || membership)
  } catch (err) {
    console.warn("[auth-helpers] checkHasFamily error:", err)
    return false
  }
}

/**
 * Login/callback sonrası nereye yönlendirileceğini döner.
 * - Onboarding tamamlanmamış → /onboarding
 * - Aile grubu var → /select-profile (Netflix ekranı)
 * - Aksi halde → fallback (genelde "/" veya redirect URL)
 */
export async function getPostAuthRedirect(
  supabase: SupabaseClient,
  userId: string,
  fallback: string = "/"
): Promise<string> {
  try {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("onboarding_complete")
      .eq("id", userId)
      .maybeSingle()
    if (!profile?.onboarding_complete) return "/onboarding"

    const hasFamily = await checkHasFamily(supabase, userId)
    return hasFamily ? "/select-profile" : fallback
  } catch (err) {
    console.warn("[auth-helpers] getPostAuthRedirect error:", err)
    return fallback
  }
}
