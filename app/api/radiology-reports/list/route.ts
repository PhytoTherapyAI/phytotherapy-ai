// © 2026 DoctoPal — All Rights Reserved
// Sprint 19 Commit 1 — radyoloji raporu history listesi.
// Bearer auth + resolveTargetUser (Sprint 17 SBAR pattern parite).
// Pagination: skip/take + take+1 trick for hasMore.
// Index Session 32'de eklendi: idx_radiology_reports_created_at(user_id, created_at DESC)
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { resolveTargetUser } from "@/lib/family-permissions";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const ip = getClientIP(req);
  const rl = checkRateLimit(`rad-list:${ip}`, 30, 60_000);
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

  const { data, error } = await supabase
    .from("radiology_reports")
    .select("id, created_at, image_type, summary, overall_urgency, analysis_json")
    .eq("user_id", targetUserId)
    .order("created_at", { ascending: false })
    .range(skip, skip + take);

  if (error) {
    console.error("[radiology-reports/list] query error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = data ?? [];
  const hasMore = rows.length > take;
  const slice = hasMore ? rows.slice(0, take) : rows;

  const items = slice.map((row) => {
    const aj = (row.analysis_json ?? {}) as Record<string, unknown>;
    const findingsArr = aj.findings;
    return {
      id: row.id as string,
      created_at: row.created_at as string,
      image_type: (row.image_type as string | null) ?? null,
      summary: (row.summary as string | null) ?? null,
      overall_urgency: (row.overall_urgency as string | null) ?? null,
      finding_count: Array.isArray(findingsArr) ? findingsArr.length : 0,
    };
  });

  return NextResponse.json({ items, hasMore });
}
