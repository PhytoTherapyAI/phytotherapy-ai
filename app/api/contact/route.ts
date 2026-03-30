// © 2026 Phytotherapy.ai — All Rights Reserved
import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const RATE_LIMIT = new Map<string, number[]>()

function checkRateLimit(ip: string, max = 3, windowMs = 60_000): boolean {
  const now = Date.now()
  const timestamps = RATE_LIMIT.get(ip)?.filter((t) => now - t < windowMs) || []
  if (timestamps.length >= max) return false
  timestamps.push(now)
  RATE_LIMIT.set(ip, timestamps)
  return true
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown"
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      )
    }

    const { name, email, subject, message } = await req.json()

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    if (message.length > 5000) {
      return NextResponse.json(
        { error: "Message too long" },
        { status: 400 }
      )
    }

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">New Contact Form Submission</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; font-weight: bold;">Name:</td><td style="padding: 8px;">${escapeHtml(name)}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Email:</td><td style="padding: 8px;">${escapeHtml(email)}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Subject:</td><td style="padding: 8px;">${escapeHtml(subject)}</td></tr>
        </table>
        <div style="margin-top: 16px; padding: 16px; background: #f3f4f6; border-radius: 8px;">
          <p style="margin: 0; white-space: pre-wrap;">${escapeHtml(message)}</p>
        </div>
        <p style="margin-top: 16px; font-size: 12px; color: #6b7280;">
          Sent from phytotherapy.ai contact form at ${new Date().toISOString()}
        </p>
      </div>
    `

    if (!resend) {
      console.log("[CONTACT] No RESEND_API_KEY, logging message:", { name, email, subject })
      return NextResponse.json({ success: true })
    }

    const { error } = await resend.emails.send({
      from: "Phytotherapy.ai <noreply@phytotherapy.ai>",
      to: ["hello@phytotherapy.ai"],
      replyTo: email,
      subject: `[Contact] ${subject}`,
      html: htmlContent,
      tags: [{ name: "category", value: "contact" }],
    })

    if (error) {
      console.error("[CONTACT-ERROR]", error)
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[CONTACT-EXCEPTION]", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}
