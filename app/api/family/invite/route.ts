// © 2026 DoctoPal — All Rights Reserved
import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { sendVerificationEmail } from "@/lib/emails/send"

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
}

export async function POST(req: NextRequest) {
  try {
    // Debug: env kontrol
    console.log("[FAMILY-INVITE] ENV check:", {
      hasResendKey: !!process.env.RESEND_API_KEY,
      resendKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 6) || "NONE",
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
    })

    const auth = req.headers.get("authorization")
    if (!auth?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = auth.replace("Bearer ", "")
    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      console.error("[FAMILY-INVITE] Auth failed:", authError?.message)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let body: { groupId?: string; email?: string; nickname?: string; inviterName?: string }
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    const { groupId, email, nickname, inviterName } = body
    console.log("[FAMILY-INVITE] Request:", { groupId, email, nickname, inviterName: inviterName?.substring(0, 20) })

    if (!groupId || !email) {
      return NextResponse.json({ error: "groupId and email required" }, { status: 400 })
    }

    // Grubu doğrula
    const { data: group, error: groupErr } = await supabase
      .from("family_groups")
      .select("id, name, owner_id")
      .eq("id", groupId)
      .single()

    if (groupErr || !group) {
      console.error("[FAMILY-INVITE] Group not found:", groupErr?.message)
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    // Owner mı kontrol et
    const isOwner = group.owner_id === user.id
    if (!isOwner) {
      const { data: adminCheck } = await supabase
        .from("family_members")
        .select("role")
        .eq("group_id", groupId)
        .eq("user_id", user.id)
        .eq("role", "admin")
        .eq("invite_status", "accepted")
        .maybeSingle()

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
      .maybeSingle()

    if (existing?.invite_status === "accepted") {
      return NextResponse.json({ error: "Already a member" }, { status: 409 })
    }

    let inviteToken: string | null = null

    if (existing) {
      const { data: memberData } = await supabase
        .from("family_members")
        .select("invite_token")
        .eq("id", existing.id)
        .single()
      inviteToken = memberData?.invite_token ?? null
    } else {
      const { data: newMember, error: insertErr } = await supabase
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

      if (insertErr || !newMember) {
        console.error("[FAMILY-INVITE] Insert error:", insertErr?.message)
        return NextResponse.json({ error: "Failed to create invite" }, { status: 500 })
      }
      inviteToken = newMember.invite_token
    }

    if (!inviteToken) {
      return NextResponse.json({ error: "Could not generate invite token" }, { status: 500 })
    }

    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/family/accept?token=${inviteToken}`
    const senderName = escapeHtml(inviterName || "Birisi")
    const safeGroupName = escapeHtml(group.name)

    console.log("[FAMILY-INVITE] Sending email to:", email, "inviteUrl:", inviteUrl)

    // Email gönderme stratejisi:
    // 1. Resend (RESEND_API_KEY varsa ve placeholder değilse)
    // 2. Supabase admin invite (fallback)
    // 3. Hiçbiri çalışmazsa — inviteUrl'i response'ta döndür

    let emailSent = false

    // Strateji 1: Resend
    const hasRealResendKey = process.env.RESEND_API_KEY &&
      process.env.RESEND_API_KEY !== "re_placeholder" &&
      process.env.RESEND_API_KEY.startsWith("re_")

    if (hasRealResendKey) {
      console.log("[FAMILY-INVITE] Trying Resend...")
      const result = await sendVerificationEmail(
        email,
        `${inviterName || "Birisi"} sizi DoctoPal aile grubuna davet etti`,
        buildEmailHtml(senderName, safeGroupName, inviteUrl)
      )
      console.log("[FAMILY-INVITE] Resend result:", { success: result.success, error: result.error })
      emailSent = result.success
    } else {
      console.log("[FAMILY-INVITE] No real Resend key, skipping Resend")
    }

    // Strateji 2: Supabase admin invite
    if (!emailSent) {
      console.log("[FAMILY-INVITE] Trying Supabase admin invite...")
      try {
        const { error: adminErr } = await supabase.auth.admin.inviteUserByEmail(email, {
          redirectTo: inviteUrl,
          data: {
            invited_by: inviterName || "DoctoPal",
            group_id: groupId,
            invite_token: inviteToken
          }
        })
        if (adminErr) {
          console.error("[FAMILY-INVITE] Supabase admin invite failed:", adminErr.message)
        } else {
          console.log("[FAMILY-INVITE] Supabase admin invite sent successfully")
          emailSent = true
        }
      } catch (fallbackErr) {
        console.error("[FAMILY-INVITE] Supabase admin fallback error:", fallbackErr)
      }
    }

    console.log("[FAMILY-INVITE] Final status:", { emailSent, inviteToken: inviteToken?.substring(0, 8) })

    // Her durumda success dön — invite kaydı oluşturuldu, link paylaşılabilir
    return NextResponse.json({
      success: true,
      emailSent,
      inviteToken,
      inviteUrl,
      message: emailSent
        ? "Davet e-postası gönderildi"
        : "E-posta gönderilemedi ama davet linki oluşturuldu. Linki manuel paylaşabilirsiniz."
    })
  } catch (err) {
    console.error("[FAMILY-INVITE] Unhandled error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function buildEmailHtml(senderName: string, groupName: string, inviteUrl: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #16a34a; font-size: 24px; margin: 0;">DoctoPal</h1>
        <p style="color: #6b7280; font-size: 14px; margin: 4px 0 0;">Aile Daveti</p>
      </div>
      <p style="color: #374151; font-size: 16px;">Merhaba,</p>
      <p style="color: #374151; font-size: 16px;">
        <strong>${senderName}</strong> sizi DoctoPal'daki
        <strong>${groupName}</strong> aile grubuna davet etti.
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
}
