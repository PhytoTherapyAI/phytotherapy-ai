// © 2026 DoctoPal — All Rights Reserved
//
// F-CHAT-SIDEBAR-001: per-conversation DELETE.
//
// The Health Assistant sidebar's Trash2 button hits this route. We
// scope the delete by id alone — RLS does the actual ownership check
// (policy: `auth.uid() = user_id`, applied 2026-04-24). The route's
// only jobs are:
//
//   1. Validate the bearer token + UUID shape (cheap fail-fast — saves
//      a Supabase round trip on garbage requests).
//   2. Run the delete under the caller's session token so RLS enforces
//      ownership. A wrong-id request returns 0 deleted rows; a
//      cross-user request returns 0 deleted rows for the same reason
//      (RLS quietly filters). We treat both as 404.
//   3. Surface a soft 502 if Supabase itself returns an error string.
//
// We intentionally do NOT use the service role key here — the user-
// scoped path is simpler and means a runtime regression of the RLS
// policy fails closed rather than open.

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// RFC 4122 UUID — accepts v4 and the variants Supabase emits. Cheap
// regex; we don't need a full parser, just a smell test.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// F-CHAT-SIDEBAR-002: max number of conversations a user can pin at
// once. ChatGPT goes with 3; we land at 5 since the sidebar already
// caps at 30 rows so a slightly bigger active set is comfortable.
const PIN_LIMIT = 5

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return NextResponse.json(
      { error: "Server misconfiguration" },
      { status: 500 },
    )
  }

  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await context.params
  if (!id || !UUID_RE.test(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 })
  }

  // User-scoped client. The Authorization header forwards the caller's
  // JWT into PostgREST, which then evaluates the DELETE policy with
  // auth.uid() == caller. A row whose user_id != caller is invisible
  // here — the delete returns 0 rows.
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  })

  const { data, error } = await supabase
    .from("query_history")
    .delete()
    .eq("id", id)
    .select("id")

  if (error) {
    // Surface the supabase code for client-side categorisation but
    // never echo the full message — error.message can carry pgcode-
    // level detail we don't want exposed.
    console.error("[query-history DELETE]", error.code, error.message)
    return NextResponse.json(
      { error: "Delete failed", code: error.code ?? null },
      { status: 502 },
    )
  }

  if (!data || data.length === 0) {
    // Either the row doesn't exist or it belongs to someone else (RLS
    // hides it). Same surface response — clients shouldn't be able to
    // probe for which.
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json({ ok: true, deletedId: id })
}

// F-CHAT-SIDEBAR-002: per-conversation PATCH for pin + rename.
//
// Field whitelist: { is_pinned?: boolean, custom_title?: string | null }.
// Anything else in the body is silently ignored — we never trust the
// client to choose which columns to update. RLS still gates ownership
// (existing UPDATE policy: auth.uid() = user_id) and we add a runtime
// .eq(user_id) for defense-in-depth.
//
// Pin semantics:
//   - is_pinned: true  → pinned_at = NOW()  (LIFO ordering at the top)
//   - is_pinned: false → pinned_at = NULL   (drop back to temporal group)
//
// Pin limit: counted server-side BEFORE the update. We exclude the row
// being patched so re-pinning an already-pinned row is a no-op (just
// refreshes pinned_at to "now") and never trips the limit. Unpin is
// always allowed.
//
// As with DELETE, we deliberately use the user-scoped client (anon key
// + caller's bearer token) — service role would bypass RLS and turn a
// future policy regression into a silent open door.
interface PatchBody {
  is_pinned?: boolean
  custom_title?: string | null
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return NextResponse.json(
      { error: "Server misconfiguration" },
      { status: 500 },
    )
  }

  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await context.params
  if (!id || !UUID_RE.test(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 })
  }

  let body: PatchBody
  try {
    body = (await request.json()) as PatchBody
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  // Build the patch payload from whitelisted fields only.
  const patch: Record<string, unknown> = {}
  if (typeof body.is_pinned === "boolean") {
    patch.is_pinned = body.is_pinned
    // pinned_at follows is_pinned — NOW() on pin, NULL on unpin.
    patch.pinned_at = body.is_pinned ? new Date().toISOString() : null
  }
  if ("custom_title" in body) {
    const raw = typeof body.custom_title === "string" ? body.custom_title.trim() : null
    if (raw && raw.length > 100) {
      return NextResponse.json({ error: "Title too long (max 100)" }, { status: 400 })
    }
    // Empty string collapses to null — null is the "use query_text"
    // signal in the UI.
    patch.custom_title = raw && raw.length > 0 ? raw : null
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  })

  // Pin-limit pre-check. Only when transitioning to is_pinned=true do
  // we care; unpin is unconstrained. Excluding the current id means a
  // re-pin (already pinned) doesn't double-count itself.
  if (body.is_pinned === true) {
    const { count, error: countErr } = await supabase
      .from("query_history")
      .select("id", { count: "exact", head: true })
      .eq("is_pinned", true)
      .neq("id", id)
    if (countErr) {
      console.error("[query-history PATCH count]", countErr.code, countErr.message)
      return NextResponse.json(
        { error: "Pin check failed", code: countErr.code ?? null },
        { status: 502 },
      )
    }
    if ((count ?? 0) >= PIN_LIMIT) {
      return NextResponse.json(
        {
          error: "PIN_LIMIT_REACHED",
          message: `Max ${PIN_LIMIT} conversations can be pinned`,
          limit: PIN_LIMIT,
        },
        { status: 409 },
      )
    }
  }

  const { data, error } = await supabase
    .from("query_history")
    .update(patch)
    .eq("id", id)
    .select("id, is_pinned, custom_title, pinned_at")

  if (error) {
    console.error("[query-history PATCH]", error.code, error.message)
    return NextResponse.json(
      { error: "Update failed", code: error.code ?? null },
      { status: 502 },
    )
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json({ ok: true, ...data[0] })
}
