// © 2026 DoctoPal — All Rights Reserved
// Sprint 19 Commit 1 — kan tahlili history listesi.
// Bearer auth + resolveTargetUser (Sprint 17 SBAR pattern parite, family member gating).
// Pagination: skip/take + take+1 trick for hasMore.
// Composite index (user_id, created_at DESC) Sprint 18'de eklendi → optimize.
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { resolveTargetUser } from "@/lib/family-permissions";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Rate limit — 30 list req/min per IP (UI pagination cheap)
  const ip = getClientIP(req);
  const rl = checkRateLimit(`blood-list:${ip}`, 30, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Too many requests. Please wait ${rl.resetInSeconds}s.` },
      { status: 429 }
    );
  }

  const authHeader = req.headers.get("authorization");
  const supabase = createServerClient();
  const url = new URL(req.url);
  const requestedTargetUserId = url.searchParams.get("targetUserId") || null;

  const resolution = await resolveTargetUser(supabase, authHeader, requestedTargetUserId);
  if (!resolution.ok) {
    return NextResponse.json({ error: resolution.error }, { status: resolution.status });
  }
  const { targetUserId } = resolution;

  const skip = Math.max(0, parseInt(url.searchParams.get("skip") ?? "0", 10) || 0);
  const take = Math.max(1, Math.min(50, parseInt(url.searchParams.get("take") ?? "10", 10) || 10));

  // take+1 trick → hasMore detection without separate count query
  const { data, error } = await supabase
    .from("blood_tests")
    .select("id, created_at, summary, overall_urgency, analysis_json")
    .eq("user_id", targetUserId)
    .order("created_at", { ascending: false })
    .range(skip, skip + take); // inclusive: take+1 rows

  if (error) {
    console.error("[blood-tests/list] query error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = data ?? [];
  const hasMore = rows.length > take;
  const slice = hasMore ? rows.slice(0, take) : rows;

  // analysis_json'dan abnormal_count + supplement_count derive et (full body göndermeyiz)
  const items = slice.map((row) => {
    const aj = (row.analysis_json ?? {}) as Record<string, unknown>;
    const abnormalArr = aj.abnormalFindings;
    const supplementArr = aj.supplementRecommendations;
    return {
      id: row.id as string,
      created_at: row.created_at as string,
      summary: (row.summary as string | null) ?? null,
      overall_urgency: (row.overall_urgency as string | null) ?? null,
      abnormal_count: Array.isArray(abnormalArr) ? abnormalArr.length : 0,
      supplement_count: Array.isArray(supplementArr) ? supplementArr.length : 0,
    };
  });

  return NextResponse.json({ items, hasMore });
}
