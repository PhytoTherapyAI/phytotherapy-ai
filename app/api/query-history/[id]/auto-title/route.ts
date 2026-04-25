// © 2026 DoctoPal — All Rights Reserved
//
// F-CHAT-SIDEBAR-003: auto-generate a 3-4 word conversation title
// from the user's first message + the AI's response.
//
// Triggered fire-and-forget by ChatInterface after the chat stream
// completes (X-Conversation-Id header from /api/chat tells the client
// which row to title). Idempotent: if custom_title is already set
// (manual rename from F-CHAT-SIDEBAR-002 or a prior auto-title call),
// early-returns without invoking the LLM.
//
// Same-conversation context — the user already consented when the
// message was originally sent through /api/chat — so we pass
// `skipConsent: true` to ai-client. The LLM call is to haiku
// (MODEL_DEFAULT) which is also the default for askClaudeJSON.
//
// Defensive guards (defaults discussed in plan):
//   - User-scoped 30/min rate limit — well above realistic new-chat
//     cadence (a runaway loop trips here quickly).
//   - Global circuit breaker 100/min per Vercel instance — if breached,
//     the endpoint returns 503 for the next 5 min so a runaway bug
//     doesn't burn through tokens.
//
// LLM response is never logged raw — only length + success/fail. Same
// discipline as F-SCANNER-001's captureScannerFailure helper.

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { askClaudeJSON } from "@/lib/ai-client"
import { checkRateLimit } from "@/lib/rate-limit"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const USER_RATE_LIMIT = 30 // per minute per user
const GLOBAL_RATE_LIMIT = 100 // per minute per Vercel instance
const CIRCUIT_OPEN_MS = 5 * 60_000 // 5 min penalty after global breach

const MAX_TITLE_CHARS = 60 // matches sidebar truncate (renderRow line ~263)

// Module-level circuit breaker state. Per-Vercel-instance — not a
// distributed throttle, just abuse containment. If one instance trips,
// requests routed elsewhere still flow until that instance also trips.
let circuitOpenUntil = 0

export const maxDuration = 20 // haiku titles complete in <2s; 20s buffer

type Stage =
  | "triggered"
  | "circuit-open"
  | "rate-limited"
  | "auth-failed"
  | "uuid-invalid"
  | "row-not-found"
  | "skipped-already-titled"
  | "llm-call-start"
  | "llm-call-success"
  | "llm-call-failed"
  | "db-update-success"
  | "db-update-failed"

function breadcrumb(
  stage: Stage,
  level: "info" | "warning" | "error",
  data?: Record<string, unknown>,
): void {
  console.log(`[auto-title] ${stage}`, data ?? {})
  void import("@sentry/nextjs")
    .then((Sentry) => {
      Sentry.addBreadcrumb({
        category: "auto-title",
        message: `auto-title:${stage}`,
        level,
        data,
      })
    })
    .catch(() => {
      // Sentry unavailable — server log already captured.
    })
}

function captureFailure(
  stage: Stage,
  err: unknown,
  extras?: Record<string, unknown>,
): void {
  const detail =
    err instanceof Error ? `${err.name}: ${err.message}` : String(err)
  console.error(`[auto-title] ${stage} failed`, detail, extras ?? {})
  void import("@sentry/nextjs")
    .then((Sentry) => {
      if (err instanceof Error) {
        Sentry.captureException(err, {
          tags: { endpoint: "auto-title", stage },
          extra: extras,
        })
      } else {
        Sentry.captureMessage(`auto-title ${stage} failed`, {
          level: "error",
          tags: { endpoint: "auto-title", stage },
          extra: { detail, ...extras },
        })
      }
    })
    .catch(() => {})
}

const SYSTEM_PROMPT =
  "You generate a short conversation title (3-4 words max) for a chat between a user and a health AI assistant. Match the user's language exactly: a Turkish question gets a Turkish title, an English question gets an English title. Be concise — capture the topic, not the conversation. No punctuation other than commas, no emojis, no quotes around the title, no leading article. Output valid JSON ONLY: {\"title\":\"...\"}"

interface TitlePayload {
  title?: string
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return NextResponse.json(
      { error: "Server misconfiguration" },
      { status: 500 },
    )
  }

  // ── Circuit breaker: bail before any work if we're in the penalty box ──
  if (Date.now() < circuitOpenUntil) {
    breadcrumb("circuit-open", "warning", {
      remainingMs: circuitOpenUntil - Date.now(),
    })
    return NextResponse.json(
      { error: "Service temporarily unavailable" },
      { status: 503, headers: { "Retry-After": "300" } },
    )
  }

  // ── Auth (Bearer required) ──
  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    breadcrumb("auth-failed", "warning", { reason: "missing-bearer" })
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await context.params
  if (!id || !UUID_RE.test(id)) {
    breadcrumb("uuid-invalid", "warning", { id: id?.slice(0, 8) ?? null })
    return NextResponse.json({ error: "Invalid id" }, { status: 400 })
  }

  // User-scoped Supabase client. RLS evaluates SELECT/UPDATE policies
  // with auth.uid() == caller, so cross-user access is invisible.
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  })

  // Resolve the caller for per-user rate limiting. We don't trust any
  // client-side user_id claim — getUser() validates the JWT against
  // Supabase auth.
  const { data: userInfo, error: userErr } = await supabase.auth.getUser()
  if (userErr || !userInfo?.user?.id) {
    breadcrumb("auth-failed", "warning", { reason: userErr?.message ?? "no-user" })
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const userId = userInfo.user.id

  // ── Rate limits (user first, then global) ──
  const userCheck = checkRateLimit(`auto-title:${userId}`, USER_RATE_LIMIT, 60_000)
  if (!userCheck.allowed) {
    breadcrumb("rate-limited", "warning", {
      scope: "user",
      resetIn: userCheck.resetInSeconds,
    })
    return NextResponse.json(
      { error: "Rate limited", resetInSeconds: userCheck.resetInSeconds },
      { status: 429, headers: { "Retry-After": String(userCheck.resetInSeconds) } },
    )
  }

  const globalCheck = checkRateLimit(
    "auto-title:_global",
    GLOBAL_RATE_LIMIT,
    60_000,
  )
  if (!globalCheck.allowed) {
    // Trip the breaker for 5 minutes on this instance. Subsequent
    // requests short-circuit at the circuit-open guard above.
    circuitOpenUntil = Date.now() + CIRCUIT_OPEN_MS
    breadcrumb("circuit-open", "error", {
      reason: "global-rate-exceeded",
      cooldownMs: CIRCUIT_OPEN_MS,
    })
    return NextResponse.json(
      { error: "Service temporarily unavailable" },
      { status: 503, headers: { "Retry-After": "300" } },
    )
  }

  breadcrumb("triggered", "info", { conversationId: id })

  // ── Idempotency: fetch the row + early-return if already titled ──
  const { data: row, error: fetchErr } = await supabase
    .from("query_history")
    .select("id, query_text, response_text, custom_title")
    .eq("id", id)
    .maybeSingle()

  if (fetchErr) {
    captureFailure("row-not-found", fetchErr, { conversationId: id })
    return NextResponse.json(
      { error: "Lookup failed", code: fetchErr.code ?? null },
      { status: 502 },
    )
  }
  if (!row) {
    // Row doesn't exist OR RLS hides it (different user). Same surface
    // response — clients shouldn't be able to probe ownership.
    breadcrumb("row-not-found", "warning", { conversationId: id })
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  // Manual rename (F-CHAT-SIDEBAR-002) wins over auto-title. Also
  // catches the second invocation if ChatInterface fires twice.
  if (row.custom_title && String(row.custom_title).trim().length > 0) {
    breadcrumb("skipped-already-titled", "info", { conversationId: id })
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "already_titled",
    })
  }

  const queryText = String(row.query_text ?? "").slice(0, 1000)
  const responseText = String(row.response_text ?? "").slice(0, 1500)

  // Empty-query guard — pre-stream INSERT (chat route) writes the row
  // before the AI streams. If the response field stayed empty (stream
  // bailed) the title would be misleading, so skip.
  if (!queryText) {
    breadcrumb("skipped-already-titled", "info", {
      conversationId: id,
      reason: "empty-query",
    })
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "empty_query",
    })
  }

  // ── LLM call ──
  const userPrompt = `User message:\n${queryText}\n\nAssistant response:\n${responseText}\n\nGenerate a 3-4 word title in the user's language. JSON only.`

  breadcrumb("llm-call-start", "info", { conversationId: id })

  let title = ""
  try {
    const raw = await askClaudeJSON(userPrompt, SYSTEM_PROMPT, {
      // Same conversation context already consented via /api/chat.
      // Re-asking would be redundant friction.
      skipConsent: true,
    })
    const parsed = JSON.parse(raw) as TitlePayload
    title = String(parsed?.title ?? "").trim()
    if (title.length > MAX_TITLE_CHARS) {
      title = title.slice(0, MAX_TITLE_CHARS).trim()
    }
    if (!title) {
      breadcrumb("llm-call-failed", "warning", {
        conversationId: id,
        reason: "empty-title-from-llm",
      })
      return NextResponse.json(
        { error: "Empty title from LLM" },
        { status: 502 },
      )
    }
    breadcrumb("llm-call-success", "info", {
      conversationId: id,
      titleLength: title.length, // length only — never the title text
    })
  } catch (err) {
    captureFailure("llm-call-failed", err, { conversationId: id })
    return NextResponse.json(
      { error: "Title generation failed" },
      { status: 502 },
    )
  }

  // ── DB update — race-safe: only write if custom_title is still null.
  // If a manual rename landed in the gap, .is() filter skips the update
  // and the empty result tells us the user already chose their title.
  const { data: updated, error: updateErr } = await supabase
    .from("query_history")
    .update({ custom_title: title })
    .eq("id", id)
    .is("custom_title", null)
    .select("id, custom_title")

  if (updateErr) {
    captureFailure("db-update-failed", updateErr, { conversationId: id })
    return NextResponse.json(
      { error: "Update failed", code: updateErr.code ?? null },
      { status: 502 },
    )
  }
  if (!updated || updated.length === 0) {
    // Race: someone wrote custom_title between our SELECT and UPDATE.
    // Treat as success (their title wins, ours dropped).
    breadcrumb("skipped-already-titled", "info", {
      conversationId: id,
      reason: "race-lost",
    })
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "race_lost",
    })
  }

  breadcrumb("db-update-success", "info", { conversationId: id })
  return NextResponse.json({ ok: true, title })
}
