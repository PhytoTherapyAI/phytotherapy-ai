// © 2026 Doctopal — All Rights Reserved
// Sentry Webhook Receiver — stores error data for Claude Code auto-fix pipeline
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(req: NextRequest) {
  try {
    // Verify Sentry webhook secret (optional but recommended)
    const sentrySecret = process.env.SENTRY_WEBHOOK_SECRET
    if (sentrySecret) {
      const sig = req.headers.get("sentry-hook-signature")
      // Basic check — for production use HMAC verification
      if (!sig) {
        return NextResponse.json({ error: "Missing signature" }, { status: 401 })
      }
    }

    const payload = await req.json()

    // Sentry sends different event types
    const action = payload.action || "created"
    const data = payload.data || {}
    const issue = data.issue || data.event || {}

    // Extract useful info
    const errorData = {
      sentry_issue_id: issue.id?.toString() || `unknown-${Date.now()}`,
      title: issue.title || issue.message || "Unknown error",
      culprit: issue.culprit || issue.transaction || null,
      level: issue.level || "error",
      platform: issue.platform || "javascript",
      first_seen: issue.firstSeen || new Date().toISOString(),
      last_seen: issue.lastSeen || new Date().toISOString(),
      count: issue.count || 1,
      // Stack trace — most important for auto-fix
      stacktrace: extractStackTrace(issue),
      // URL where error occurred
      url: issue.metadata?.url || issue.tags?.find((t: any) => t.key === "url")?.value || null,
      // Browser info
      browser: issue.tags?.find((t: any) => t.key === "browser")?.value || null,
      // Raw payload for debugging
      raw_payload: JSON.stringify(payload).slice(0, 5000),
      // Status
      status: "new", // new → fixing → fixed → ignored
      auto_fix_attempts: 0,
      created_at: new Date().toISOString(),
    }

    // Store in Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if this issue already exists
    const { data: existing } = await supabase
      .from("sentry_errors")
      .select("id, count, status")
      .eq("sentry_issue_id", errorData.sentry_issue_id)
      .single()

    if (existing) {
      // Update count and last_seen
      await supabase
        .from("sentry_errors")
        .update({
          count: (existing.count || 0) + 1,
          last_seen: errorData.last_seen,
          stacktrace: errorData.stacktrace, // update with latest stack
          status: existing.status === "fixed" ? "reopened" : existing.status,
        })
        .eq("id", existing.id)
    } else {
      // Insert new
      await supabase.from("sentry_errors").insert(errorData)
    }

    return NextResponse.json({ ok: true, action, issue_id: errorData.sentry_issue_id })
  } catch (err: any) {
    console.error("[Sentry Webhook] Error:", err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// Extract stack trace from Sentry payload
function extractStackTrace(issue: any): string | null {
  try {
    // From event data
    const entries = issue.entries || []
    for (const entry of entries) {
      if (entry.type === "exception") {
        const values = entry.data?.values || []
        const frames = values[0]?.stacktrace?.frames || []
        return frames
          .filter((f: any) => f.filename && !f.filename.includes("node_modules"))
          .map((f: any) => `${f.filename}:${f.lineNo}:${f.colNo} in ${f.function || "anonymous"}`)
          .reverse()
          .join("\n")
      }
    }

    // From metadata
    if (issue.metadata?.value) return issue.metadata.value
    if (issue.culprit) return issue.culprit

    return null
  } catch {
    return null
  }
}

// Also support GET for health check
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "sentry-webhook",
    message: "Sentry webhook receiver is active. POST errors here.",
  })
}
