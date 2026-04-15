// © 2026 DoctoPal — All Rights Reserved
// KVKK Md.11/1-g — AI objection endpoint
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { logApiAccess } from "@/lib/security-audit";
import { sanitizeInput } from "@/lib/sanitize";

export const runtime = "nodejs";
export const maxDuration = 10;

const VALID_CATEGORIES = new Set([
  "incorrect", "incomplete", "harmful", "diagnosis", "prescription", "other",
]);

export async function POST(req: NextRequest) {
  try {
    const clientIP = getClientIP(req);

    // Rate limit: 20 objections per hour per IP (generous — users should feel free to object)
    const rateCheck = checkRateLimit(`objection:${clientIP}`, 20, 3_600_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many objections. Please try again later." },
        { status: 429 }
      );
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const responseId = typeof body.responseId === "string" ? body.responseId.slice(0, 128) : null;
    const category = typeof body.category === "string" ? body.category : "";
    const text = typeof body.text === "string" ? sanitizeInput(body.text).slice(0, 2000) : "";
    const lang = body.lang === "tr" ? "tr" : "en";

    if (!VALID_CATEGORIES.has(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    // Try to authenticate — optional (anonymous objections allowed)
    let userId: string | null = null;
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const supabase = createServerClient();
        const { data: { user } } = await supabase.auth.getUser(token);
        userId = user?.id || null;
      } catch {
        // ignore — anonymous allowed
      }
    }

    // Audit log
    logApiAccess({
      endpoint: "/api/feedback/objection",
      userId: userId || undefined,
      action: "submit_ai_objection",
      ip: clientIP,
      outcome: "success",
      metadata: { category, hasText: text.length > 0 },
    });

    // Persist — if table exists
    const supabase = createServerClient();
    const { error } = await supabase.from("ai_objections").insert({
      user_id: userId,
      response_id: responseId,
      category,
      objection_text: text || null,
      language: lang,
      status: "pending",
    });

    if (error) {
      // Table may not exist yet — log for manual review
      console.log("[KVKK-OBJECTION]", JSON.stringify({
        userId, responseId, category, text, lang,
        timestamp: new Date().toISOString(),
        dbError: error.message,
      }));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Objection] endpoint error:", error);
    return NextResponse.json({ error: "Failed to submit objection" }, { status: 500 });
  }
}
