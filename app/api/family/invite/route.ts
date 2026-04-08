// © 2026 DoctoPal — All Rights Reserved
import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
}

export async function POST(req: NextRequest) {
  console.log("=== FAMILY INVITE API CALLED ===")
  console.log("RESEND_API_KEY exists:", !!process.env.RESEND_API_KEY)
  console.log("SERVICE_ROLE_KEY exists:", !!process.env.SUPABASE_SERVICE_ROLE_KEY)
  console.log("APP_URL:", process.env.NEXT_PUBLIC_APP_URL)

  try {
    const auth = req.headers.get("authorization")
    if (!auth?.startsWith("Bearer ")) {
      console.error("[INVITE] No auth header")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = auth.replace("Bearer ", "")
    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      console.error("[INVITE] Auth failed:", authError?.message)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.log("[INVITE] User authenticated:", user.id, user.email)

    let body: { groupId?: string; email?: string; nickname?: string; inviterName?: string }
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    const { groupId, email, nickname, inviterName } = body
    console.log("[INVITE] Request body:", { groupId, email, nickname })

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
      console.error("[INVITE] Group not found:", groupErr?.message, groupErr?.details)
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }
    console.log("[INVITE] Group found:", group.name)

    // Owner kontrolü
    if (group.owner_id !== user.id) {
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
      .select("id, invite_status, invite_token")
      .eq("group_id", groupId)
      .eq("invite_email", email)
      .maybeSingle()

    if (existing?.invite_status === "accepted") {
      return NextResponse.json({ error: "Already a member" }, { status: 409 })
    }

    let inviteToken: string | null = null

    if (existing) {
      console.log("[INVITE] Existing pending invite found, reusing token")
      inviteToken = existing.invite_token
    } else {
      console.log("[INVITE] Creating new invite record...")
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
        console.error("[INVITE] Insert error:", insertErr?.message, insertErr?.details, insertErr?.hint)
        return NextResponse.json({
          error: `Failed to create invite: ${insertErr?.message || "Unknown"}`,
          details: insertErr?.details,
          hint: insertErr?.hint
        }, { status: 500 })
      }
      inviteToken = newMember.invite_token
      console.log("[INVITE] Invite record created, token:", inviteToken?.substring(0, 8))
    }

    if (!inviteToken) {
      return NextResponse.json({ error: "Could not generate invite token" }, { status: 500 })
    }

    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/family/accept?token=${inviteToken}`
    const safeSender = escapeHtml(inviterName || "Birisi")
    const safeGroup = escapeHtml(group.name)

    // Email gönder — Resend ile (onboarding@resend.dev test domain'i)
    let emailSent = false

    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "re_placeholder") {
      console.log("[INVITE] Sending email via Resend...")
      try {
        const { Resend } = await import("resend")
        const resend = new Resend(process.env.RESEND_API_KEY)

        const { data: emailData, error: emailErr } = await resend.emails.send({
          from: "DoctoPal <onboarding@resend.dev>",
          to: [email],
          subject: `${inviterName || "Birisi"} sizi DoctoPal aile grubuna davet etti`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 500px; margin: 0 auto; padding: 32px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="color: #16a34a; font-size: 24px; margin: 0;">DoctoPal</h1>
                <p style="color: #6b7280; font-size: 14px; margin: 4px 0 0;">Aile Daveti</p>
              </div>
              <p style="color: #374151; font-size: 16px;">Merhaba,</p>
              <p style="color: #374151; font-size: 16px;">
                <strong>${safeSender}</strong> sizi DoctoPal'daki
                <strong>${safeGroup}</strong> aile grubuna davet etti.
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
        })

        if (emailErr) {
          console.error("[INVITE] Resend error:", emailErr)
        } else {
          console.log("[INVITE] Resend success! ID:", emailData?.id)
          emailSent = true
        }
      } catch (resendErr) {
        console.error("[INVITE] Resend exception:", resendErr)
      }
    } else {
      console.log("[INVITE] No RESEND_API_KEY — skipping email")
    }

    // Fallback: Supabase admin invite
    if (!emailSent && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log("[INVITE] Trying Supabase admin invite as fallback...")
      try {
        const { error: adminErr } = await supabase.auth.admin.inviteUserByEmail(email, {
          redirectTo: inviteUrl,
          data: { invite_token: inviteToken, group_id: groupId }
        })
        if (adminErr) {
          console.error("[INVITE] Supabase admin invite failed:", adminErr.message)
        } else {
          console.log("[INVITE] Supabase admin invite sent!")
          emailSent = true
        }
      } catch (adminEx) {
        console.error("[INVITE] Supabase admin exception:", adminEx)
      }
    }

    console.log("[INVITE] === DONE ===", { emailSent, inviteUrl })

    return NextResponse.json({
      success: true,
      emailSent,
      inviteUrl,
      message: emailSent
        ? "Davet e-postası gönderildi"
        : "Davet oluşturuldu — linki manuel paylaşın"
    })
  } catch (err) {
    console.error("[INVITE] Unhandled error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
