// © 2026 DoctoPal — All Rights Reserved
// ============================================
// Family Notification Email Sender
// ============================================
//
// Fires after a family_notifications row is inserted, so the recipient
// gets a real push to their inbox (SOS, management-permission requests,
// medication/check-in/water reminders).
//
// Best-effort: failures are logged but do not block the notification
// insert. The in-app bell still shows the unread notification.
// ============================================

import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder")

const FROM_EMAIL = "DoctoPal <noreply@doctopal.com>"
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://doctopal.com"

export type FamilyNotificationType =
  | "emergency"
  | "custom"
  | "reminder_meds"
  | "reminder_checkin"
  | "reminder_water"

interface SendParams {
  toEmail: string
  toName: string
  fromName: string
  type: FamilyNotificationType
  message: string
  lang: "tr" | "en"
}

interface SendResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Send a family notification email. Subject + HTML template are chosen per
 * type + language. Returns { success: true } as a dev no-op when
 * RESEND_API_KEY isn't configured, matching the pattern in
 * lib/emails/send.ts so local dev doesn't spam Resend.
 */
export async function sendFamilyNotificationEmail(
  params: SendParams
): Promise<SendResult> {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re_placeholder") {
    return { success: true, messageId: `dev-${Date.now()}` }
  }

  const tr = params.lang === "tr"
  const { subject, html } = buildTemplate(params, tr)

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [params.toEmail],
      subject,
      html,
      tags: [
        { name: "category", value: "family_notification" },
        { name: "type", value: params.type },
      ],
    })

    if (error) {
      console.error("[family-email] send failed:", error)
      return { success: false, error: error.message }
    }
    return { success: true, messageId: data?.id }
  } catch (err) {
    console.error("[family-email] exception:", err)
    return { success: false, error: String(err) }
  }
}

// ============================================
// Per-type subject + HTML templates
// ============================================

function buildTemplate(
  p: SendParams,
  tr: boolean
): { subject: string; html: string } {
  switch (p.type) {
    case "emergency":
      return emergencyTemplate(p, tr)
    case "custom":
      // "custom" is currently used for management-permission requests.
      return managementRequestTemplate(p, tr)
    case "reminder_meds":
      return reminderTemplate(p, tr, "meds")
    case "reminder_checkin":
      return reminderTemplate(p, tr, "checkin")
    case "reminder_water":
      return reminderTemplate(p, tr, "water")
  }
}

function shell(body: string, footerNote: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f6f7f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
    <div style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,.04);">
      ${body}
    </div>
    <p style="font-size:11px;color:#8a8f98;text-align:center;margin:16px 8px 0;">
      ${footerNote}
    </p>
  </div>
</body>
</html>`
}

function emergencyTemplate(p: SendParams, tr: boolean) {
  const subject = tr
    ? `🚨 ACİL DURUM — ${p.fromName} acil durum bildirimi gönderdi`
    : `🚨 EMERGENCY — ${p.fromName} sent an urgent alert`

  const body = `
    <div style="background:linear-gradient(135deg,#dc2626,#ef4444);padding:28px 24px;">
      <div style="display:inline-block;background:rgba(255,255,255,.2);padding:6px 12px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:.5px;color:#fff;">
        ${tr ? "ACİL DURUM" : "EMERGENCY"}
      </div>
      <h1 style="margin:14px 0 0;color:#fff;font-size:22px;font-weight:800;line-height:1.3;">
        ${tr
          ? `${escapeHtml(p.fromName)} acil durum bildirimi gönderdi`
          : `${escapeHtml(p.fromName)} sent an urgent alert`}
      </h1>
    </div>
    <div style="padding:24px;">
      <p style="margin:0 0 12px;font-size:15px;line-height:1.5;">
        ${tr ? `Merhaba ${escapeHtml(p.toName)},` : `Hi ${escapeHtml(p.toName)},`}
      </p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.55;">
        ${escapeHtml(p.message)}
      </p>
      <p style="margin:0 0 20px;font-size:14px;color:#991b1b;font-weight:600;">
        ${tr
          ? "Lütfen hemen kontrol edin. Hayati tehlike varsa 112'yi arayın."
          : "Please check in immediately. If life-threatening, call 112."}
      </p>
      <a href="${APP_URL}" style="display:inline-block;background:#dc2626;color:#fff;padding:12px 22px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;">
        ${tr ? "DoctoPal'ı Aç" : "Open DoctoPal"}
      </a>
    </div>`
  const footer = tr
    ? "Bu e-posta acil bir aile bildirimidir. DoctoPal — Kanıta Dayalı Sağlık Asistanı."
    : "This is an urgent family alert email. DoctoPal — Evidence-Based Health Assistant."
  return { subject, html: shell(body, footer) }
}

function managementRequestTemplate(p: SendParams, tr: boolean) {
  const subject = tr
    ? `${p.fromName} sizden yöneticilik izni talep ediyor`
    : `${p.fromName} is requesting management permission`

  const body = `
    <div style="background:linear-gradient(135deg,#f59e0b,#fbbf24);padding:28px 24px;">
      <div style="display:inline-block;background:rgba(255,255,255,.25);padding:6px 12px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:.5px;color:#78350f;">
        ${tr ? "YÖNETİCİLİK TALEBİ" : "MANAGEMENT REQUEST"}
      </div>
      <h1 style="margin:14px 0 0;color:#1a1a1a;font-size:22px;font-weight:800;line-height:1.3;">
        ${tr
          ? `${escapeHtml(p.fromName)} sizden yetki istiyor`
          : `${escapeHtml(p.fromName)} is requesting access`}
      </h1>
    </div>
    <div style="padding:24px;">
      <p style="margin:0 0 12px;font-size:15px;line-height:1.5;">
        ${tr ? `Merhaba ${escapeHtml(p.toName)},` : `Hi ${escapeHtml(p.toName)},`}
      </p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.55;">
        ${escapeHtml(p.message)}
      </p>
      <p style="margin:0 0 20px;font-size:13px;color:#4b5563;line-height:1.5;">
        ${tr
          ? "Bu izin verildiğinde, ilgili kişi profiliniz üzerinden AI asistanını, SBAR raporunu ve benzeri aksiyonları kullanabilir. Kararı istediğiniz zaman geri alabilirsiniz."
          : "When you grant this, they will be able to use the AI assistant, SBAR reports and similar actions on your profile. You can revoke it at any time."}
      </p>
      <a href="${APP_URL}/family" style="display:inline-block;background:#f59e0b;color:#1a1a1a;padding:12px 22px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;">
        ${tr ? "Paylaşım Ayarları'nı Aç" : "Open Sharing Preferences"}
      </a>
    </div>`
  const footer = tr
    ? "Bu e-posta bir aile izin talebidir. Dilerseniz yok sayabilirsiniz — herhangi bir işlem yapılmayacaktır."
    : "This is a family permission request email. You may ignore it — no action will be taken on your behalf."
  return { subject, html: shell(body, footer) }
}

function reminderTemplate(
  p: SendParams,
  tr: boolean,
  kind: "meds" | "checkin" | "water"
) {
  const kindLabel = {
    meds: { tr: "İlaç Hatırlatma", en: "Medication Reminder" },
    checkin: { tr: "Günlük Check-in", en: "Daily Check-in" },
    water: { tr: "Su İçme Hatırlatması", en: "Water Reminder" },
  }[kind]

  const subject = tr
    ? `${kindLabel.tr} — ${p.fromName}'dan hatırlatma`
    : `${kindLabel.en} — a nudge from ${p.fromName}`

  const body = `
    <div style="background:linear-gradient(135deg,#059669,#10b981);padding:28px 24px;">
      <div style="display:inline-block;background:rgba(255,255,255,.25);padding:6px 12px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:.5px;color:#064e3b;">
        ${tr ? kindLabel.tr.toUpperCase() : kindLabel.en.toUpperCase()}
      </div>
      <h1 style="margin:14px 0 0;color:#fff;font-size:22px;font-weight:800;line-height:1.3;">
        ${tr
          ? `${escapeHtml(p.fromName)} bir hatırlatma gönderdi`
          : `${escapeHtml(p.fromName)} sent you a reminder`}
      </h1>
    </div>
    <div style="padding:24px;">
      <p style="margin:0 0 12px;font-size:15px;line-height:1.5;">
        ${tr ? `Merhaba ${escapeHtml(p.toName)},` : `Hi ${escapeHtml(p.toName)},`}
      </p>
      <p style="margin:0 0 20px;font-size:15px;line-height:1.55;">
        ${escapeHtml(p.message)}
      </p>
      <a href="${APP_URL}" style="display:inline-block;background:#059669;color:#fff;padding:12px 22px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;">
        ${tr ? "DoctoPal'ı Aç" : "Open DoctoPal"}
      </a>
    </div>`
  const footer = tr
    ? "Bu e-posta aile üyenizden gelen bir hatırlatmadır. Bildirim ayarlarını DoctoPal'dan yönetebilirsiniz."
    : "This is a reminder from a family member. You can manage notification settings in DoctoPal."
  return { subject, html: shell(body, footer) }
}

// Tiny HTML escape — message content comes from user input, never trust raw.
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}
