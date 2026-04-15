// © 2026 DoctoPal — All Rights Reserved
// Batch metric ingest + read endpoint backing the Apple Health / Google Fit
// import flow. POST takes 1000-record chunks; GET filters by metric type and
// date window with optional aggregation granularity.

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { checkRateLimit, getClientIP } from "@/lib/rate-limit"

const VALID_METRIC_TYPES = new Set([
  "steps",
  "heart_rate",
  "sleep_duration",
  "weight",
  "blood_pressure_systolic",
  "blood_pressure_diastolic",
  "blood_oxygen",
  "body_temperature",
  "calories_burned",
])

const VALID_SOURCES = new Set(["apple_health", "google_fit", "manual"])

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

interface MetricInputRow {
  metricType?: unknown
  value?: unknown
  unit?: unknown
  measuredAt?: unknown
  sourceId?: unknown
}

// POST — bulk insert metrics
//   body: { importId, source, metrics: [{ metricType, value, unit, measuredAt, sourceId? }] }
//   The client should chunk to <= 1000 per request. We cap at 1000 server-side.
export async function POST(req: NextRequest) {
  const ip = getClientIP(req)
  // Allow 60/min — the client streams many chunks per import.
  const rl = checkRateLimit(`hmetrics-post:${ip}`, 60, 60_000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(rl.resetInSeconds) } }
    )
  }
  const auth = await authenticate(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json().catch(() => null) as {
    importId?: string
    source?: string
    metrics?: MetricInputRow[]
  } | null
  if (!body?.source || !VALID_SOURCES.has(body.source)) {
    return NextResponse.json({ error: "Invalid source" }, { status: 400 })
  }
  if (!Array.isArray(body.metrics) || body.metrics.length === 0) {
    return NextResponse.json({ error: "metrics array required" }, { status: 400 })
  }
  if (body.metrics.length > 1000) {
    return NextResponse.json({ error: "max 1000 metrics per request" }, { status: 400 })
  }

  // Sanitize / validate each row
  const rows: Array<{
    user_id: string
    source: string
    source_id: string | null
    metric_type: string
    value: number
    unit: string
    measured_at: string
    import_id: string | null
  }> = []
  for (const m of body.metrics) {
    if (typeof m.metricType !== "string" || !VALID_METRIC_TYPES.has(m.metricType)) continue
    const v = typeof m.value === "number" ? m.value : Number(m.value)
    if (!Number.isFinite(v)) continue
    if (typeof m.unit !== "string" || !m.unit) continue
    if (typeof m.measuredAt !== "string") continue
    const t = Date.parse(m.measuredAt)
    if (Number.isNaN(t)) continue
    rows.push({
      user_id: auth.user.id,
      source: body.source,
      source_id: typeof m.sourceId === "string" ? m.sourceId : null,
      metric_type: m.metricType,
      value: v,
      unit: m.unit,
      measured_at: new Date(t).toISOString(),
      import_id: body.importId || null,
    })
  }

  if (rows.length === 0) {
    return NextResponse.json({ inserted: 0, skipped: body.metrics.length })
  }

  // health_metrics has UNIQUE(user_id, source, metric_type, measured_at).
  // Use upsert so re-importing the same export does NOT explode rows.
  const { error, count } = await auth.supabase
    .from("health_metrics")
    .upsert(rows, {
      onConflict: "user_id,source,metric_type,measured_at",
      ignoreDuplicates: true,
      count: "exact",
    })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({
    inserted: count ?? rows.length,
    skipped: body.metrics.length - rows.length,
  })
}

// GET — fetch metrics with filter + optional rollup
//   ?type=steps&from=2024-01-01&to=2024-12-31&granularity=daily|weekly|monthly|raw
export async function GET(req: NextRequest) {
  const ip = getClientIP(req)
  const rl = checkRateLimit(`hmetrics-get:${ip}`, 60, 60_000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(rl.resetInSeconds) } }
    )
  }
  const auth = await authenticate(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type") || undefined
  const from = searchParams.get("from") || undefined
  const to = searchParams.get("to") || undefined
  const granularity = (searchParams.get("granularity") || "raw") as "raw" | "daily" | "weekly" | "monthly"

  if (type && !VALID_METRIC_TYPES.has(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 })
  }

  let q = auth.supabase
    .from("health_metrics")
    .select("metric_type,value,unit,measured_at,source")
    .eq("user_id", auth.user.id)
    .order("measured_at", { ascending: true })
    .limit(5000)
  if (type) q = q.eq("metric_type", type)
  if (from) q = q.gte("measured_at", from)
  if (to)   q = q.lte("measured_at", to)

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (granularity === "raw" || !data) {
    return NextResponse.json({ metrics: data || [] })
  }

  // Roll up server-side so the client doesn't fetch 5000 rows for a chart.
  const buckets = new Map<string, { sum: number; count: number; metric_type: string; unit: string }>()
  for (const row of data) {
    const d = new Date(row.measured_at)
    let key: string
    if (granularity === "daily") {
      key = row.measured_at.slice(0, 10)
    } else if (granularity === "weekly") {
      // ISO-week-anchored Monday as YYYY-MM-DD
      const day = d.getUTCDay()
      const diff = (day + 6) % 7
      const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - diff))
      key = monday.toISOString().slice(0, 10)
    } else {
      key = row.measured_at.slice(0, 7) // YYYY-MM
    }
    const composite = `${row.metric_type}|${key}`
    let b = buckets.get(composite)
    if (!b) {
      b = { sum: 0, count: 0, metric_type: row.metric_type, unit: row.unit }
      buckets.set(composite, b)
    }
    b.sum += Number(row.value)
    b.count++
  }

  const aggregated = Array.from(buckets.entries()).map(([k, b]) => {
    const [, period] = k.split("|")
    // Sum-natured metrics stay summed; rate-style metrics are averaged.
    const isSum = b.metric_type === "steps" || b.metric_type === "calories_burned" || b.metric_type === "sleep_duration"
    return {
      metric_type: b.metric_type,
      period,
      value: isSum ? Math.round(b.sum * 100) / 100 : Math.round((b.sum / b.count) * 100) / 100,
      unit: b.unit,
      sample_count: b.count,
    }
  })

  return NextResponse.json({ metrics: aggregated, granularity })
}
