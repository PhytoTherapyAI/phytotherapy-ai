// © 2026 DoctoPal — All Rights Reserved
// Owner-only endpoint — promote/demote a member to/from admin role.
// Rule (Gemini-approved): admin role requires target to have effective
// Premium (individual OR via family_premium group). This is what keeps the
// family_premium value prop clean — upgrading the group doesn't silently
// grant admin to everyone; owner still consciously promotes.
//
// Body: { memberId: string, role: "admin" | "member" }
import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { getUserEffectivePremium } from "@/lib/premium"

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization")
    if (!auth?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = auth.replace("Bearer ", "")
    const admin = createServerClient() // service role — RLS bypass intentional
    const { data: { user }, error: authErr } = await admin.auth.getUser(token)
    if (authErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = (await req.json().catch(() => null)) as {
      memberId?: string
      role?: "admin" | "member"
    } | null
    if (!body?.memberId || (body.role !== "admin" && body.role !== "member")) {
      return NextResponse.json({ error: "memberId + role required" }, { status: 400 })
    }

    // Fetch target member row (need group_id, user_id)
    const { data: target, error: targetErr } = await admin
      .from("family_members")
      .select("id, group_id, user_id, role, invite_status")
      .eq("id", body.memberId)
      .maybeSingle()

    if (targetErr) return NextResponse.json({ error: targetErr.message }, { status: 400 })
    if (!target) return NextResponse.json({ error: "Member not found" }, { status: 404 })
    if (target.invite_status !== "accepted") {
      return NextResponse.json({ error: "Member has not accepted yet" }, { status: 400 })
    }

    // Caller must be the owner of this group.
    const { data: group, error: groupErr } = await admin
      .from("family_groups")
      .select("owner_id")
      .eq("id", target.group_id)
      .maybeSingle()
    if (groupErr) return NextResponse.json({ error: groupErr.message }, { status: 400 })
    if (!group || group.owner_id !== user.id) {
      return NextResponse.json({ error: "Only the owner can change admin role" }, { status: 403 })
    }

    // Never allow demoting the owner's own self-row via this endpoint.
    if (target.user_id === group.owner_id) {
      return NextResponse.json({ error: "Cannot change owner's own role" }, { status: 400 })
    }

    // Promotion path — require target's effective Premium.
    if (body.role === "admin") {
      if (!target.user_id) {
        return NextResponse.json(
          { error: "Member has no linked user account (pending)" },
          { status: 400 }
        )
      }
      const eff = await getUserEffectivePremium(target.user_id, admin)
      if (!eff.isPremium) {
        return NextResponse.json({
          error: "premium_required",
          detail: "Target must have an active individual or family Premium plan to become admin.",
        }, { status: 402 })
      }
    }

    // Apply the role change.
    const { error: updErr } = await admin
      .from("family_members")
      .update({ role: body.role })
      .eq("id", body.memberId)
    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 })

    return NextResponse.json({ success: true, memberId: body.memberId, role: body.role })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
