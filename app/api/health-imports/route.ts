// © 2026 DoctoPal — All Rights Reserved
// Health import lifecycle: create → mark complete/failed → list → delete.
// All routes auth via Bearer token + per-request anon-key client.
// RLS (hi_*) on health_imports enforces row-owner scope.

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { checkRateLimit, getClientIP } from "@/lib/rate-limit"

function userClient(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { autoRefreshToken: false, persistSession: false },
    }
  )
}

async function authenticate(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) return null
  const token = authHeader.slice("Bearer ".length).trim()
  if (!token) return null
  const supabase = userClient(token)
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return null
  return { user, supabase }
}

// GET — list past imports for the caller (most recent first)
export async function GET(req: NextRequest) {
  const ip = getClientIP(req)
  const rl = checkRateLimit(`himports-get:${ip}`, 30, 60_000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(rl.resetInSeconds) } }
    )
  }
  const auth = await authenticate(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data, error } = await auth.supabase
    .from("health_imports")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ imports: data || [] })
}

// POST — create a new import row before client-side parsing starts
//   body: { source, fileName, dateRangeStart?, dateRangeEnd?, recordsImported? }
export async function POST(req: NextRequest) {
  const ip = getClientIP(req)
  const rl = checkRateLimit(`himports-post:${ip}`, 5, 60_000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(rl.resetInSeconds) } }
    )
  }
  const auth = await authenticate(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json().catch(() => null) as {
    source?: string
    fileName?: string
    dateRangeStart?: string
    dateRangeEnd?: string
    recordsImported?: number
  } | null
  if (!body?.source || !["apple_health", "google_fit"].includes(body.source)) {
    return NextResponse.json({ error: "Invalid source" }, { status: 400 })
  }
  if (!body.fileName || typeof body.fileName !== "string" || body.fileName.length > 255) {
    return NextResponse.json({ error: "Invalid fileName" }, { status: 400 })
  }

  const { data, error } = await auth.supabase
    .from("health_imports")
    .insert({
      user_id: auth.user.id,
      source: body.source,
      file_name: body.fileName,
      status: "processing",
      records_imported: body.recordsImported ?? 0,
      date_range_start: body.dateRangeStart || null,
      date_range_end: body.dateRangeEnd || null,
    })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ import: data })
}

// PATCH — update an import (typically: status + final records_imported)
//   body: { id, status, recordsImported?, errorMessage?, dateRangeStart?, dateRangeEnd? }
export async function PATCH(req: NextRequest) {
  const ip = getClientIP(req)
  const rl = checkRateLimit(`himports-patch:${ip}`, 30, 60_000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(rl.resetInSeconds) } }
    )
  }
  const auth = await authenticate(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json().catch(() => null) as {
    id?: string
    status?: "processing" | "completed" | "failed"
    recordsImported?: number
    errorMessage?: string
    dateRangeStart?: string
    dateRangeEnd?: string
  } | null
  if (!body?.id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
  if (body.status && !["processing", "completed", "failed"].includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}
  if (body.status) updates.status = body.status
  if (typeof body.recordsImported === "number") updates.records_imported = body.recordsImported
  if (body.errorMessage !== undefined) updates.error_message = body.errorMessage
  if (body.dateRangeStart) updates.date_range_start = body.dateRangeStart
  if (body.dateRangeEnd) updates.date_range_end = body.dateRangeEnd

  const { error } = await auth.supabase
    .from("health_imports")
    .update(updates)
    .eq("id", body.id)
    .eq("user_id", auth.user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}

// DELETE — remove an import row (and cascade-delete its metrics)
//   ?id=<uuid>
export async function DELETE(req: NextRequest) {
  const ip = getClientIP(req)
  const rl = checkRateLimit(`himports-delete:${ip}`, 10, 60_000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(rl.resetInSeconds) } }
    )
  }
  const auth = await authenticate(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  const { error } = await auth.supabase
    .from("health_imports")
    .delete()
    .eq("id", id)
    .eq("user_id", auth.user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
