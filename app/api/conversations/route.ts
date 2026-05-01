// © 2026 DoctoPal — All Rights Reserved
//
// Sprint 13 Commit 1: chat_conversations CRUD endpoint.
//
// Auth pattern (proje convention, app/api/family/recover/route.ts ile aynı):
// Bearer token + getServiceClient + auth.getUser(token). Service role RLS
// bypass eder ama defense-in-depth her query'de .eq("user_id", user.id).
//
// Sprint 13 Commit 1 yalnız read/create/list — chat_messages INSERT için
// /api/chat v2 (Commit 2) kullanılacak. Bu endpoint tek başına manuel
// conversation oluşturmak için (örn. "Yeni sohbet" butonu) ve sidebar
// listesi için yeterli.

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

interface RawConversation {
  id: string
  title: string | null
  is_pinned: boolean
  pinned_at: string | null
  created_at: string
  updated_at: string
  target_user_id: string
  chat_messages?: Array<{ content: string; role: string; created_at: string }>
}

/**
 * GET /api/conversations[?targetUserId=<uuid>]
 *
 * Returns user's active (non-archived) conversations with last-message
 * preview. Default targetUserId = caller (own profile). Aile üyesi
 * modunda caller targetUserId query param ile filter eder; cross-user
 * leak yok — RLS user_id = caller, target_user_id sadece filter.
 *
 * Sort: pinned first (pinned_at DESC), then updated_at DESC. Limit 50.
 */
export async function GET(req: Request) {
  const auth = await authenticate(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { supabase, user } = auth

  const url = new URL(req.url)
  const targetUserId = url.searchParams.get("targetUserId") || user.id

  const { data, error } = await supabase
    .from("chat_conversations")
    .select(`
      id, title, is_pinned, pinned_at, created_at, updated_at, target_user_id,
      chat_messages(content, role, created_at)
    `)
    .eq("user_id", user.id)
    .eq("target_user_id", targetUserId)
    .is("archived_at", null)
    .order("is_pinned", { ascending: false })
    .order("pinned_at", { ascending: false, nullsFirst: false })
    .order("updated_at", { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Last message preview (most recent message per conversation)
  const conversations = (data as RawConversation[]).map((conv) => {
    const msgs = conv.chat_messages || []
    const lastMsg = [...msgs].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )[0]
    return {
      id: conv.id,
      title: conv.title,
      is_pinned: conv.is_pinned,
      pinned_at: conv.pinned_at,
      created_at: conv.created_at,
      updated_at: conv.updated_at,
      target_user_id: conv.target_user_id,
      last_message: lastMsg?.content?.slice(0, 80) ?? null,
      last_message_role: lastMsg?.role ?? null,
    }
  })

  return NextResponse.json({ conversations })
}

/**
 * POST /api/conversations
 * Body: { targetUserId?: string }
 *
 * Creates an empty conversation. target_user_id defaults to caller.id.
 * Returned id used by client to navigate to /health-assistant?cid=<id>.
 *
 * Note: Commit 2'de /api/chat v2 caller conversation_id parametresi
 * vermezse on-the-fly create edecek; bu endpoint manuel "yeni sohbet"
 * butonu için ek surface. ChatInterface refactor sırasında parite
 * kontrol edilir.
 */
export async function POST(req: Request) {
  const auth = await authenticate(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { supabase, user } = auth

  const body = (await req.json().catch(() => ({}))) as { targetUserId?: string }

  const { data, error } = await supabase
    .from("chat_conversations")
    .insert({
      user_id: user.id,
      target_user_id: body.targetUserId || user.id,
    })
    .select("id")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: data.id })
}
