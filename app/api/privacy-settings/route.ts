// © 2026 DoctoPal — All Rights Reserved
// KVKK 2026/347 — Onboarding consent management (grant / withdraw)
// Handles the 3 explicit consents stored in user_profiles:
//   - consent_ai_processing
//   - consent_data_transfer
//   - consent_sbar_report
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { logApiAccess } from "@/lib/security-audit";

export const runtime = "nodejs";
export const maxDuration = 10;

const VALID_CONSENT_TYPES = new Set([
  "consent_ai_processing",
  "consent_data_transfer",
  "consent_sbar_report",
]);

/** GET — return current onboarding consent status */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const token = authHeader.replace("Bearer ", "");
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { data, error } = await supabase
      .from("user_profiles")
      .select("aydinlatma_acknowledged, aydinlatma_version, aydinlatma_timestamp, consent_ai_processing, consent_data_transfer, consent_sbar_report, consent_timestamp")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      aydinlatma_acknowledged: data?.aydinlatma_acknowledged ?? false,
      aydinlatma_version: data?.aydinlatma_version ?? null,
      aydinlatma_timestamp: data?.aydinlatma_timestamp ?? null,
      consent_ai_processing: data?.consent_ai_processing ?? false,
      consent_data_transfer: data?.consent_data_transfer ?? false,
      consent_sbar_report: data?.consent_sbar_report ?? false,
      consent_timestamp: data?.consent_timestamp ?? null,
    });
  } catch (err) {
    console.error("[PrivacySettings] GET error:", err);
    return NextResponse.json({ error: "Failed to fetch consent status" }, { status: 500 });
  }
}

/** PATCH — grant or withdraw a specific consent flag */
export async function PATCH(req: NextRequest) {
  try {
    const clientIP = getClientIP(req);
    const rateCheck = checkRateLimit(`privacy-settings:${clientIP}`, 30, 3_600_000);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const token = authHeader.replace("Bearer ", "");
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    let body: Record<string, unknown>;
    try { body = await req.json(); } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const consentType = typeof body.consent_type === "string" ? body.consent_type : "";
    const granted = body.granted === true;

    if (!VALID_CONSENT_TYPES.has(consentType)) {
      return NextResponse.json({ error: "Invalid consent type" }, { status: 400 });
    }

    const update: Record<string, unknown> = {
      [consentType]: granted,
      consent_timestamp: new Date().toISOString(),
    };

    const { error: updateError } = await supabase
      .from("user_profiles")
      .update(update)
      .eq("id", user.id);

    if (updateError) {
      console.error("[PrivacySettings] update error:", updateError.message);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Audit log
    try {
      await supabase.from("consent_log").insert({
        user_id: user.id,
        consent_type: consentType.replace("consent_", ""),
        granted,
        version: "2026-04-v1",
        ip_address: clientIP,
        user_agent: req.headers.get("user-agent")?.slice(0, 500) || null,
      });
    } catch {
      console.log("[KVKK-CONSENT-LOG]", JSON.stringify({
        user_id: user.id,
        consent_type: consentType,
        granted,
        timestamp: new Date().toISOString(),
        ip: clientIP,
      }));
    }

    logApiAccess({
      endpoint: "/api/privacy-settings",
      userId: user.id,
      action: granted ? "grant_consent" : "withdraw_consent",
      ip: clientIP,
      outcome: "success",
      metadata: { consent_type: consentType },
    });

    return NextResponse.json({ success: true, consent_type: consentType, granted });
  } catch (err) {
    console.error("[PrivacySettings] PATCH error:", err);
    return NextResponse.json({ error: "Failed to update consent" }, { status: 500 });
  }
}
