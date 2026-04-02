// © 2026 Doctopal — All Rights Reserved
// Sentry Auto-Fix Status API — returns pending errors for Claude Code to fix
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// GET — list pending errors for Claude Code
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  // Auth check — only allow from cron or with secret
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get new/reopened errors (max 5 at a time)
    const { data: errors, error } = await supabase
      .from("sentry_errors")
      .select("*")
      .in("status", ["new", "reopened"])
      .order("created_at", { ascending: false })
      .limit(5)

    if (error) throw error

    return NextResponse.json({
      pending_count: errors?.length || 0,
      errors: errors || [],
      message: errors?.length
        ? `${errors.length} errors need fixing`
        : "No pending errors — all clear!",
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST — mark error as fixed/ignored by Claude Code
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { error_id, status, fix_commit_hash, fix_description } = body

    if (!error_id || !status) {
      return NextResponse.json({ error: "error_id and status required" }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { error } = await supabase
      .from("sentry_errors")
      .update({
        status,
        fix_commit_hash: fix_commit_hash || null,
        fix_description: fix_description || null,
        auto_fix_attempts: body.auto_fix_attempts || 1,
      })
      .eq("id", error_id)

    if (error) throw error

    return NextResponse.json({ ok: true, error_id, status })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
