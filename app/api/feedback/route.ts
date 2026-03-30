// © 2026 Phytotherapy.ai — All Rights Reserved
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const RATE_LIMIT = new Map<string, number[]>()

function checkRateLimit(ip: string, max = 5, windowMs = 60_000): boolean {
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
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    const body = await req.json()
    const { page, page_works, broken_description, feature_request, lang } = body

    if (!page) {
      return NextResponse.json({ error: "Page is required" }, { status: 400 })
    }

    // Try to save to Supabase feedback table
    try {
      await supabase.from("feedback").insert({
        page,
        page_works: page_works ?? null,
        broken_description: broken_description || null,
        feature_request: feature_request || null,
        lang: lang || "en",
        created_at: new Date().toISOString(),
      })
    } catch (dbErr) {
      console.log("[FEEDBACK] DB save failed (table may not exist):", dbErr)
    }

    // Send email notification
    if (resend) {
      try {
        await resend.emails.send({
          from: "Phytotherapy.ai <noreply@phytotherapy.ai>",
          to: ["hello@phytotherapy.ai"],
          subject: `[Feedback] ${page} — ${page_works ? "Works" : "Broken"}`,
          html: `
            <div style="font-family: sans-serif;">
              <h3>New Feedback</h3>
              <p><strong>Page:</strong> ${page}</p>
              <p><strong>Works:</strong> ${page_works ? "Yes" : "No"}</p>
              ${broken_description ? `<p><strong>Issue:</strong> ${broken_description}</p>` : ""}
              ${feature_request ? `<p><strong>Request:</strong> ${feature_request}</p>` : ""}
              <p style="color: #666; font-size: 12px;">${new Date().toISOString()}</p>
            </div>
          `,
          tags: [{ name: "category", value: "feedback" }],
        })
      } catch (emailErr) {
        console.log("[FEEDBACK] Email failed:", emailErr)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[FEEDBACK-ERROR]", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
