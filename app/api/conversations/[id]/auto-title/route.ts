// © 2026 DoctoPal — All Rights Reserved
//
// Sprint 23 Commit 2 — chat_conversations modeli için auto-title endpoint.
// /api/query-history/[id]/auto-title (Session 47, F-CHAT-SIDEBAR-003) paterni
// mirror — sadece tablo + field adları farklı:
//   query_history → chat_conversations
//   query_text/response_text → chat_messages.content (role filter)
//   custom_title → title
//
// Trigger: ChatInterface stream-end sonrası fire-and-forget POST. /api/chat
// X-Chat-Conversation-Id header'ında chat_conversations row id döndürür;
// client buraya iletir. Idempotent: title zaten set ise early-return.
// Race-safe: UPDATE .is("title", null) filter — manual rename kazanır.
//
// Same-conversation context (user already consented via /api/chat) →
// askClaudeJSON skipConsent: true. Haiku (MODEL_DEFAULT) ~<2s response.
//
// Defansif guards:
//   - User-scoped 30/min rate limit
//   - Global 100/min circuit breaker (5 min penalty box)
//   - LLM çıktısı asla raw log'lanmaz — sadece length + success/fail

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { askClaudeJSON } from "@/lib/ai-client";
import { checkRateLimit } from "@/lib/rate-limit";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const USER_RATE_LIMIT = 30; // per minute per user
const GLOBAL_RATE_LIMIT = 100; // per minute per Vercel instance
const CIRCUIT_OPEN_MS = 5 * 60_000; // 5 min penalty after global breach

const MAX_TITLE_CHARS = 100; // chat_conversations PATCH endpoint cap (route.ts:110)

let circuitOpenUntil = 0;

export const maxDuration = 20;

type Stage =
  | "triggered"
  | "circuit-open"
  | "rate-limited"
  | "auth-failed"
  | "uuid-invalid"
  | "row-not-found"
  | "skipped-already-titled"
  | "no-messages"
  | "llm-call-start"
  | "llm-call-success"
  | "llm-call-failed"
  | "db-update-success"
  | "db-update-failed";

function breadcrumb(stage: Stage, level: "info" | "warning" | "error", data?: Record<string, unknown>): void {
  console.log(`[conv-auto-title] ${stage}`, data ?? {});
  void import("@sentry/nextjs")
    .then((Sentry) => {
      Sentry.addBreadcrumb({
        category: "conv-auto-title",
        message: `conv-auto-title:${stage}`,
        level,
        data,
      });
    })
    .catch(() => {});
}

function captureFailure(stage: Stage, err: unknown, extras?: Record<string, unknown>): void {
  const detail = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
  console.error(`[conv-auto-title] ${stage} failed`, detail, extras ?? {});
  void import("@sentry/nextjs")
    .then((Sentry) => {
      if (err instanceof Error) {
        Sentry.captureException(err, { tags: { endpoint: "conv-auto-title", stage }, extra: extras });
      } else {
        Sentry.captureMessage(`conv-auto-title ${stage} failed`, {
          level: "error",
          tags: { endpoint: "conv-auto-title", stage },
          extra: { detail, ...extras },
        });
      }
    })
    .catch(() => {});
}

const SYSTEM_PROMPT =
  'You generate a short conversation title (3-4 words max) for a chat between a user and a health AI assistant. Match the user\'s language exactly: a Turkish question gets a Turkish title, an English question gets an English title. Be concise — capture the topic, not the conversation. No punctuation other than commas, no emojis, no quotes around the title, no leading article. Output valid JSON ONLY: {"title":"..."}';

interface TitlePayload {
  title?: string;
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  // Circuit breaker
  if (Date.now() < circuitOpenUntil) {
    breadcrumb("circuit-open", "warning", { remainingMs: circuitOpenUntil - Date.now() });
    return NextResponse.json({ error: "Service temporarily unavailable" }, { status: 503, headers: { "Retry-After": "300" } });
  }

  // Auth
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    breadcrumb("auth-failed", "warning", { reason: "missing-bearer" });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id || !UUID_RE.test(id)) {
    breadcrumb("uuid-invalid", "warning", { id: id?.slice(0, 8) ?? null });
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  // User-scoped Supabase client (RLS evaluates with auth.uid() == caller)
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userInfo, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userInfo?.user?.id) {
    breadcrumb("auth-failed", "warning", { reason: userErr?.message ?? "no-user" });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = userInfo.user.id;

  // Rate limits
  const userCheck = checkRateLimit(`conv-auto-title:${userId}`, USER_RATE_LIMIT, 60_000);
  if (!userCheck.allowed) {
    breadcrumb("rate-limited", "warning", { scope: "user", resetIn: userCheck.resetInSeconds });
    return NextResponse.json({ error: "Rate limited", resetInSeconds: userCheck.resetInSeconds }, {
      status: 429,
      headers: { "Retry-After": String(userCheck.resetInSeconds) },
    });
  }

  const globalCheck = checkRateLimit("conv-auto-title:_global", GLOBAL_RATE_LIMIT, 60_000);
  if (!globalCheck.allowed) {
    circuitOpenUntil = Date.now() + CIRCUIT_OPEN_MS;
    breadcrumb("circuit-open", "error", { reason: "global-rate-exceeded", cooldownMs: CIRCUIT_OPEN_MS });
    return NextResponse.json({ error: "Service temporarily unavailable" }, { status: 503, headers: { "Retry-After": "300" } });
  }

  breadcrumb("triggered", "info", { conversationId: id });

  // Idempotency: fetch chat_conversations row + early-return if titled
  const { data: row, error: fetchErr } = await supabase
    .from("chat_conversations")
    .select("id, title")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr) {
    captureFailure("row-not-found", fetchErr, { conversationId: id });
    return NextResponse.json({ error: "Lookup failed", code: fetchErr.code ?? null }, { status: 502 });
  }
  if (!row) {
    breadcrumb("row-not-found", "warning", { conversationId: id });
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Manual rename / prior auto-title wins
  if (row.title && String(row.title).trim().length > 0) {
    breadcrumb("skipped-already-titled", "info", { conversationId: id });
    return NextResponse.json({ ok: true, skipped: true, reason: "already_titled" });
  }

  // Fetch first user + first assistant messages from chat_messages (ordered by created_at ASC)
  const { data: messages, error: msgErr } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true })
    .limit(4); // ilk 2 mesaj çifti yeterli (user + assistant + opsiyonel takip)

  if (msgErr) {
    captureFailure("row-not-found", msgErr, { conversationId: id, scope: "messages" });
    return NextResponse.json({ error: "Messages lookup failed", code: msgErr.code ?? null }, { status: 502 });
  }

  const userMsg = messages?.find((m) => m.role === "user");
  const assistantMsg = messages?.find((m) => m.role === "assistant");

  if (!userMsg) {
    breadcrumb("no-messages", "info", { conversationId: id });
    return NextResponse.json({ ok: true, skipped: true, reason: "no_user_message" });
  }

  const queryText = String(userMsg.content ?? "").slice(0, 1000);
  const responseText = String(assistantMsg?.content ?? "").slice(0, 1500);

  if (!queryText) {
    breadcrumb("no-messages", "info", { conversationId: id, reason: "empty-query" });
    return NextResponse.json({ ok: true, skipped: true, reason: "empty_query" });
  }

  // LLM call
  const userPrompt = `User message:\n${queryText}\n\nAssistant response:\n${responseText}\n\nGenerate a 3-4 word title in the user's language. JSON only.`;

  breadcrumb("llm-call-start", "info", { conversationId: id });

  let title = "";
  try {
    const raw = await askClaudeJSON(userPrompt, SYSTEM_PROMPT, { skipConsent: true });
    const parsed = JSON.parse(raw) as TitlePayload;
    title = String(parsed?.title ?? "").trim();
    if (title.length > MAX_TITLE_CHARS) {
      title = title.slice(0, MAX_TITLE_CHARS).trim();
    }
    if (!title) {
      breadcrumb("llm-call-failed", "warning", { conversationId: id, reason: "empty-title-from-llm" });
      return NextResponse.json({ error: "Empty title from LLM" }, { status: 502 });
    }
    breadcrumb("llm-call-success", "info", { conversationId: id, titleLength: title.length });
  } catch (err) {
    captureFailure("llm-call-failed", err, { conversationId: id });
    return NextResponse.json({ error: "Title generation failed" }, { status: 502 });
  }

  // Race-safe DB update (title hâlâ null ise yaz)
  const { data: updated, error: updateErr } = await supabase
    .from("chat_conversations")
    .update({ title })
    .eq("id", id)
    .is("title", null)
    .select("id, title");

  if (updateErr) {
    captureFailure("db-update-failed", updateErr, { conversationId: id });
    return NextResponse.json({ error: "Update failed", code: updateErr.code ?? null }, { status: 502 });
  }
  if (!updated || updated.length === 0) {
    breadcrumb("skipped-already-titled", "info", { conversationId: id, reason: "race-lost" });
    return NextResponse.json({ ok: true, skipped: true, reason: "race_lost" });
  }

  breadcrumb("db-update-success", "info", { conversationId: id });
  return NextResponse.json({ ok: true, title });
}
