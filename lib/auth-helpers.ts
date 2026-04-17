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
 * Kullanıcının ait olduğu aile grubundaki toplam kabul edilmiş üye sayısını döner.
 * Aile grubu yoksa 0 döner.
 */
export async function getFamilyMemberCount(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  try {
    // Önce kullanıcının group_id'sini bul (owner veya accepted member olarak)
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

    const groupId = ownerGroup?.id ?? membership?.group_id
    if (!groupId) return 0

    const { count } = await supabase
      .from("family_members")
      .select("*", { count: "exact", head: true })
      .eq("group_id", groupId)
      .eq("invite_status", "accepted")

    return count ?? 0
  } catch (err) {
    console.warn("[auth-helpers] getFamilyMemberCount error:", err)
    return 0
  }
}

/**
 * Login/callback sonrası nereye yönlendirileceğini döner.
 * - Onboarding tamamlanmamış → /onboarding
 * - Aile grubu var VE 2+ kabul edilmiş üye → /select-profile (Netflix ekranı)
 * - Aile grubu var ama tek kişi → fallback (profil seçimine gerek yok)
 * - Aile grubu yok → fallback (genelde "/" veya redirect URL)
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

    const memberCount = await getFamilyMemberCount(supabase, userId)
    return memberCount >= 2 ? "/select-profile" : fallback
  } catch (err) {
    console.warn("[auth-helpers] getPostAuthRedirect error:", err)
    return fallback
  }
}
