// © 2026 DoctoPal — All Rights Reserved
//
// Sprint 13 Commit 1: per-conversation read + meta update + delete.
//
// Async params (Next.js 15+ pattern, ref: app/api/query-history/[id]/route.ts:39):
//   context: { params: Promise<{ id: string }> }
//   const { id } = await context.params
//
// Auth + service-client pattern aynen /api/conversations/route.ts ile —
// belt-and-suspenders ownership .eq("user_id", user.id) RLS bypass'a karşı.

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}

async function authenticate(req: Request) {
  const auth = req.headers.get("authorization") ?? ""
  if (!auth.startsWith("Bearer ")) return null
  const token = auth.replace("Bearer ", "")
  const supabase = getServiceClient()
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return null
  return { supabase, user }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * GET /api/conversations/[id]
 * Returns all messages of the conversation, ascending by created_at.
 *
 * Ownership double-check: önce conversation row'unu user_id ile fetch
 * et, yoksa 404. Sonra messages SELECT (RLS + .eq guard). 404'ün leak
 * etmemesi için "conversation yok" ve "başka kullanıcı'nın" tek error
 * mesajına eşleniyor.
 */
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 })
  }

  const auth = await authenticate(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { supabase, user } = auth

  const { data: conv } = await supabase
    .from("chat_conversations")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle()
  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const { data: messages, error } = await supabase
    .from("chat_messages")
    .select("id, role, content, attachments, created_at")
    .eq("conversation_id", id)
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ messages: messages ?? [] })
}

/**
 * PATCH /api/conversations/[id]
 * Body whitelist: { title?, is_pinned?, archived? }
 *
 * - title: string (100 char cap, trim, empty→null) veya null
 * - is_pinned: boolean (true → pinned_at = NOW(), false → pinned_at = null)
 * - archived: boolean (true → archived_at = NOW(), false → null)
 *
 * Body'de hiç whitelist field'ı yoksa 400. Diğer alanlar (user_id,
 * target_user_id, created_at, updated_at, content) ignored — defense
 * in-depth field-level gating.
 */
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 })
  }

  const auth = await authenticate(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { supabase, user } = auth

  const body = (await req.json().catch(() => ({}))) as {
    title?: string | null
    is_pinned?: boolean
    archived?: boolean
  }
  const updates: Record<string, unknown> = {}

  if ("title" in body) {
    // 100-char cap (F-CHAT-SIDEBAR-002 parity) + trim + empty→null
    const t = typeof body.title === "string" ? body.title.trim().slice(0, 100) : null
    updates.title = t && t.length > 0 ? t : null
  }
  if ("is_pinned" in body) {
    updates.is_pinned = !!body.is_pinned
    updates.pinned_at = body.is_pinned ? new Date().toISOString() : null
  }
  if ("archived" in body) {
    updates.archived_at = body.archived ? new Date().toISOString() : null
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 })
  }

  const { error } = await supabase
    .from("chat_conversations")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

/**
 * DELETE /api/conversations/[id]
 * Cascade delete (chat_messages CASCADE FK siler).
 *
 * Soft delete (archived_at) PATCH ile yapılır; bu endpoint hard delete.
 * RLS + .eq("user_id", user.id) guard — başka kullanıcının silmesi
 * imkansız.
 */
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 })
  }

  const auth = await authenticate(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { supabase, user } = auth

  const { error } = await supabase
    .from("chat_conversations")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
