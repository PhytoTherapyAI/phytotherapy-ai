// © 2026 DoctoPal — All Rights Reserved
// Sprint 25 Commit 5 — blood_tests delete endpoint.
// Pattern: F-CHAT-SIDEBAR-001 conversations delete + Sprint 19 list endpoint mirror.
// Auth: Bearer + resolveTargetUser (family caregiver gating, allows_management gate).
// Hard delete — blood_tests standalone table, no FK references.
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { resolveTargetUser } from "@/lib/family-permissions";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Rate limit — 30 delete req/min per IP
  const ip = getClientIP(req);
  const rl = checkRateLimit(`blood-delete:${ip}`, 30, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Too many requests. Please wait ${rl.resetInSeconds}s.` },
      { status: 429 }
    );
  }

  // UUID smell test
  const { id } = await params;
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }

  // Auth + family/caregiver permission
  const authHeader = req.headers.get("authorization");
  const supabase = createServerClient();
  const url = new URL(req.url);
  const requestedTargetUserId = url.searchParams.get("targetUserId") || null;

  const resolution = await resolveTargetUser(supabase, authHeader, requestedTargetUserId);
  if (!resolution.ok) {
    return NextResponse.json({ error: resolution.error }, { status: resolution.status });
  }
  const { targetUserId } = resolution;

  // Ownership verify (404-as-RLS-block: missing OR not owned → 404)
  const { data: existing, error: selectError } = await supabase
    .from("blood_tests")
    .select("id")
    .eq("id", id)
    .eq("user_id", targetUserId)
    .maybeSingle();

  if (selectError) {
    console.error("[blood-tests/delete] select error:", selectError.message);
    return NextResponse.json({ error: selectError.message }, { status: 500 });
  }
  if (!existing) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // Hard delete (no FK references — blood_tests standalone)
  const { error: deleteError } = await supabase
    .from("blood_tests")
    .delete()
    .eq("id", id)
    .eq("user_id", targetUserId);

  if (deleteError) {
    console.error("[blood-tests/delete] delete error:", deleteError.message);
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
