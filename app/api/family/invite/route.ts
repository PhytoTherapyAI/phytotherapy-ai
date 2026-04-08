// © 2026 DoctoPal — All Rights Reserved
import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { sendVerificationEmail } from "@/lib/emails/send"

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization")
    if (!auth?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = auth.replace("Bearer ", "")
    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { groupId, email, nickname, inviterName } = await req.json()

    if (!groupId || !email) {
      return NextResponse.json({ error: "groupId and email required" }, { status: 400 })
    }

    // Grubu doğrula — sadece owner/admin davet edebilir
    const { data: group } = await supabase
      .from("family_groups")
      .select("id, name, owner_id")
      .eq("id", groupId)
      .single()

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    // Owner mı kontrol et
    const isOwner = group.owner_id === user.id
    if (!isOwner) {
      // Admin mi kontrol et
      const { data: adminCheck } = await supabase
        .from("family_members")
        .select("role")
        .eq("group_id", groupId)
        .eq("user_id", user.id)
        .eq("role", "admin")
        .eq("invite_status", "accepted")
        .single()

      if (!adminCheck) {
        return NextResponse.json({ error: "Only owner or admin can invite" }, { status: 403 })
      }
    }

    // Zaten üye mi?
    const { data: existing } = await supabase
      .from("family_members")
      .select("id, invite_status")
      .eq("group_id", groupId)
      .eq("invite_email", email)
      .single()

    if (existing?.invite_status === "accepted") {
      return NextResponse.json({ error: "Already a member" }, { status: 409 })
    }

    let inviteToken: string

    if (existing) {
      // Pending davet varsa token'ı al
      const { data: memberData } = await supabase
        .from("family_members")
        .select("invite_token")
        .eq("id", existing.id)
        .single()
      inviteToken = memberData?.invite_token
    } else {
      // Yeni üye ekle
      const { data: newMember } = await supabase
        .from("family_members")
        .insert({
          group_id: groupId,
          invite_email: email,
          nickname: nickname || null,
          role: "member",
          invite_status: "pending"
        })
        .select("invite_token")
        .single()

      if (!newMember) {
        return NextResponse.json({ error: "Failed to create invite" }, { status: 500 })
      }
      inviteToken = newMember.invite_token
    }

    // Davet emaili gönder
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/family/accept?token=${inviteToken}`
    const senderName = inviterName || "Birisi"

    const result = await sendVerificationEmail(
      email,
      `${senderName} sizi DoctoPal aile grubuna davet etti`,
      `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #16a34a; font-size: 24px; margin: 0;">DoctoPal</h1>
          <p style="color: #6b7280; font-size: 14px; margin: 4px 0 0;">Aile Daveti</p>
        </div>
        <p style="color: #374151; font-size: 16px;">Merhaba,</p>
        <p style="color: #374151; font-size: 16px;">
          <strong>${senderName}</strong> sizi DoctoPal'daki
          <strong>${group.name}</strong> aile grubuna davet etti.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${inviteUrl}"
             style="background: #16a34a; color: white;
                    padding: 14px 32px; border-radius: 12px;
                    text-decoration: none; display: inline-block;
                    font-weight: 600; font-size: 16px;">
            Daveti Kabul Et
          </a>
        </div>
        <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 12px; margin: 24px 0;">
          <p style="color: #92400e; font-size: 13px; margin: 0;">
            Bu davet size ait değilse bu emaili görmezden gelin.
          </p>
        </div>
        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 32px;">
          DoctoPal — Kanıta dayalı sağlık asistanı
        </p>
      </div>
      `
    )

    if (!result.success) {
      return NextResponse.json({ error: "Email failed", details: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, inviteToken })
  } catch (err) {
    console.error("[FAMILY-INVITE]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
