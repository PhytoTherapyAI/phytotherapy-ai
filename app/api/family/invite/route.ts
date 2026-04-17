// © 2026 DoctoPal — All Rights Reserved
import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { checkRateLimit, getClientIP } from "@/lib/rate-limit"

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
}

type Lang = "en" | "tr"

function buildEmailSubject(inviterName: string, lang: Lang): string {
  if (lang === "en") return `${inviterName} invited you to their DoctoPal family group`
  return `${inviterName} sizi DoctoPal aile grubuna davet etti`
}

function buildEmailHtml(args: {
  inviterName: string
  groupName: string
  inviteUrl: string
  lang: Lang
}): string {
  const { inviterName, groupName, inviteUrl, lang } = args
  const safeSender = escapeHtml(inviterName)
  const safeGroup = escapeHtml(groupName)
  const safeUrl = escapeHtml(inviteUrl)

  const strings =
    lang === "en"
      ? {
          heading: "Family Invite",
          greeting: "Hello,",
          body: `<strong>${safeSender}</strong> has invited you to the <strong>${safeGroup}</strong> family group on DoctoPal.`,
          cta: "Accept Invite",
          warn: "If this invite is not for you, please ignore this email.",
          footer: "DoctoPal — Evidence-based health assistant",
        }
      : {
          heading: "Aile Daveti",
          greeting: "Merhaba,",
          body: `<strong>${safeSender}</strong> sizi DoctoPal'daki <strong>${safeGroup}</strong> aile grubuna davet etti.`,
          cta: "Daveti Kabul Et",
          warn: "Bu davet size ait değilse bu e-postayı görmezden gelin.",
          footer: "DoctoPal — Kanıta dayalı sağlık asistanı",
        }

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 500px; margin: 0 auto; padding: 32px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #16a34a; font-size: 24px; margin: 0;">DoctoPal</h1>
        <p style="color: #6b7280; font-size: 14px; margin: 4px 0 0;">${strings.heading}</p>
      </div>
      <p style="color: #374151; font-size: 16px;">${strings.greeting}</p>
      <p style="color: #374151; font-size: 16px;">${strings.body}</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${safeUrl}"
           style="background: #16a34a; color: white;
                  padding: 14px 32px; border-radius: 12px;
                  text-decoration: none; display: inline-block;
                  font-weight: 600; font-size: 16px;">
          ${strings.cta}
        </a>
      </div>
      <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 12px; margin: 24px 0;">
        <p style="color: #92400e; font-size: 13px; margin: 0;">${strings.warn}</p>
      </div>
      <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 32px;">
        ${strings.footer}
      </p>
    </div>
  `
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 5 invites/min per IP
    const clientIP = getClientIP(req)
    const rate = checkRateLimit(`family-invite:${clientIP}`, 5, 60_000)
    if (!rate.allowed) {
      return NextResponse.json(
        { error: `Too many invite attempts. Retry in ${rate.resetInSeconds}s.` },
        { status: 429, headers: { "Retry-After": String(rate.resetInSeconds) } }
      )
    }

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

    let body: { groupId?: string; email?: string; nickname?: string; inviterName?: string; lang?: string }
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    const { groupId, email, nickname, inviterName } = body
    const lang: Lang = body.lang === "en" ? "en" : "tr"

    if (!groupId || !email) {
      return NextResponse.json({ error: "groupId and email required" }, { status: 400 })
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
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

    // Owner / admin kontrolü
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
      .select("id, invite_status, invite_token, expires_at")
      .eq("group_id", groupId)
      .eq("invite_email", email)
      .maybeSingle()

    if (existing?.invite_status === "accepted") {
      return NextResponse.json({ error: "Already a member" }, { status: 409 })
    }

    let inviteToken: string | null = null

    if (existing) {
      const isExpired = existing.expires_at && new Date(existing.expires_at).getTime() < Date.now()
      if (isExpired) {
        // Expired → delete and create fresh invite
        await supabase.from("family_members").delete().eq("id", existing.id)
        const { data: newMember, error: insertErr } = await supabase
          .from("family_members")
          .insert({
            group_id: groupId,
            invite_email: email,
            nickname: nickname || null,
            role: "member",
            invite_status: "pending",
          })
          .select("invite_token")
          .single()

        if (insertErr || !newMember) {
          console.error("[INVITE] Insert-after-expire error:", insertErr?.message)
          return NextResponse.json({ error: `Failed to refresh invite: ${insertErr?.message || "Unknown"}` }, { status: 500 })
        }
        inviteToken = newMember.invite_token
      } else {
        // Still valid → reuse existing token
        inviteToken = existing.invite_token
      }
    } else {
      const { data: newMember, error: insertErr } = await supabase
        .from("family_members")
        .insert({
          group_id: groupId,
          invite_email: email,
          nickname: nickname || null,
          role: "member",
          invite_status: "pending",
        })
        .select("invite_token")
        .single()

      if (insertErr || !newMember) {
        console.error("[INVITE] Insert error:", insertErr?.message, insertErr?.details, insertErr?.hint)
        return NextResponse.json(
          {
            error: `Failed to create invite: ${insertErr?.message || "Unknown"}`,
            details: insertErr?.details,
            hint: insertErr?.hint,
          },
          { status: 500 }
        )
      }
      inviteToken = newMember.invite_token
    }

    if (!inviteToken) {
      return NextResponse.json({ error: "Could not generate invite token" }, { status: 500 })
    }

    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/family/accept?token=${inviteToken}`
    const senderName = inviterName || (lang === "en" ? "Someone" : "Birisi")

    // Email gönder — Resend (onboarding@resend.dev test domain)
    let emailSent = false

    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "re_placeholder") {
      try {
        const { Resend } = await import("resend")
        const resend = new Resend(process.env.RESEND_API_KEY)

        const { data: emailData, error: emailErr } = await resend.emails.send({
          from: "DoctoPal <onboarding@resend.dev>",
          to: [email],
          subject: buildEmailSubject(senderName, lang),
          html: buildEmailHtml({ inviterName: senderName, groupName: group.name, inviteUrl, lang }),
        })

        if (emailErr) {
          console.error("[INVITE] Resend error:", emailErr)
        } else if (emailData?.id) {
          emailSent = true
        }
      } catch (resendErr) {
        console.error("[INVITE] Resend exception:", resendErr)
      }
    } else {
      console.warn("[INVITE] No RESEND_API_KEY, skipping email")
    }

    // Fallback: Supabase admin invite
    if (!emailSent && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { error: adminErr } = await supabase.auth.admin.inviteUserByEmail(email, {
          redirectTo: inviteUrl,
          data: { invite_token: inviteToken, group_id: groupId },
        })
        if (adminErr) {
          console.error("[INVITE] Supabase admin invite failed:", adminErr.message)
        } else {
          emailSent = true
        }
      } catch (adminEx) {
        console.error("[INVITE] Supabase admin exception:", adminEx)
      }
    }

    return NextResponse.json({
      success: true,
      emailSent,
      inviteUrl,
      message: emailSent
        ? lang === "en" ? "Invitation email sent" : "Davet e-postası gönderildi"
        : lang === "en" ? "Invite created — share the link manually" : "Davet oluşturuldu — linki manuel paylaşın",
    })
  } catch (err) {
    console.error("[INVITE] Unhandled error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
