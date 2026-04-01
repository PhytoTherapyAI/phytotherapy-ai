// © 2026 Doctopal — All Rights Reserved
// ============================================
// Email Sending Utility — Resend Integration
// ============================================
//
// Setup: Add RESEND_API_KEY to .env.local
// Get API key from: https://resend.com/api-keys
// Free tier: 100 emails/day, 3000/month
// ============================================

import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder")

const FROM_EMAIL = "Doctopal <noreply@doctopal.com>"
// Note: Until custom domain is verified in Resend,
// use: "Doctopal <onboarding@resend.dev>" for testing

interface SendEmailResult {
  success: boolean
  messageId?: string
  error?: string
}

export async function sendVerificationEmail(
  to: string,
  subject: string,
  htmlContent: string
): Promise<SendEmailResult> {
  // Skip sending if no API key configured (development mode)
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re_placeholder") {
    return { success: true, messageId: `dev-${Date.now()}` }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject,
      html: htmlContent,
      tags: [{ name: "category", value: "verification" }],
    })

    if (error) {
      console.error("[EMAIL-ERROR]", error)
      return { success: false, error: error.message }
    }

    return { success: true, messageId: data?.id }
  } catch (err) {
    console.error("[EMAIL-EXCEPTION]", err)
    return { success: false, error: String(err) }
  }
}
