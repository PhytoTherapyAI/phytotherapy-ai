// © 2026 DoctoPal — All Rights Reserved
import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { SBARReport, type SBARData } from "@/components/pdf/SBARReport";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { logApiAccess } from "@/lib/security-audit";
import type { VaccineEntry } from "@/lib/vaccine-data";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`sbar:${clientIP}`, 5, 60_000);
    if (!rateCheck.allowed) {
      return new Response(JSON.stringify({ error: "Too many requests" }), { status: 429, headers: { "Content-Type": "application/json" } });
    }

    // Auth required
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401, headers: { "Content-Type": "application/json" } });
    }

    const token = authHeader.replace("Bearer ", "");
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401, headers: { "Content-Type": "application/json" } });
    }

    let body: Record<string, unknown>;
    try { body = await request.json(); } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
    const lang = (body.lang === "tr" ? "tr" : "en") as "en" | "tr";

    // KVKK Consent Gate: SBAR report requires explicit consent
    const { data: consentRow } = await supabase
      .from("user_profiles")
      .select("consent_sbar_report")
      .eq("id", user.id)
      .maybeSingle();

    if (!consentRow?.consent_sbar_report) {
      logApiAccess({
        endpoint: "/api/sbar-pdf",
        userId: user.id,
        action: "sbar_blocked_no_consent",
        ip: clientIP,
        outcome: "denied",
      });
      const msg = lang === "tr"
        ? "SBAR raporu oluşturabilmek için Profil → Gizlilik Ayarları sayfasından 'SBAR Raporu Açık Rızası' vermeniz gerekmektedir."
        : "To generate an SBAR report, please grant 'SBAR Report Explicit Consent' in Profile → Privacy Settings.";
      return new Response(
        JSON.stringify({ error: msg, code: "CONSENT_REQUIRED" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    logApiAccess({
      endpoint: "/api/sbar-pdf",
      userId: user.id,
      action: "generate_health_summary_pdf",
      ip: clientIP,
      outcome: "success",
    });

    // Fetch all profile data — explicit columns to avoid 400 errors
    console.log("[SBAR-PDF] Fetching data for user:", user.id);

    const profileRes = await supabase
      .from("user_profiles")
      .select("full_name, age, gender, blood_group, height_cm, weight_kg, is_pregnant, is_breastfeeding, kidney_disease, liver_disease, chronic_conditions, smoking_use, alcohol_use, supplements, vaccines")
      .eq("id", user.id)
      .maybeSingle();

    const medsRes = await supabase
      .from("user_medications")
      .select("brand_name, generic_name, dosage, frequency")
      .eq("user_id", user.id)
      .eq("is_active", true);

    const allergiesRes = await supabase
      .from("user_allergies")
      .select("allergen, severity")
      .eq("user_id", user.id);

    if (profileRes.error) console.error("[SBAR-PDF] profile error:", profileRes.error.message, profileRes.error.details, profileRes.error.hint);
    if (medsRes.error) console.error("[SBAR-PDF] meds error:", medsRes.error.message, medsRes.error.details);
    if (allergiesRes.error) console.error("[SBAR-PDF] allergies error:", allergiesRes.error.message, allergiesRes.error.details);

    const profile = profileRes.data;
    const meds = medsRes.data || [];
    const allergies = allergiesRes.data || [];

    console.log("[SBAR-PDF] Profile:", profile?.full_name, "| meds:", meds.length, "| allergies:", allergies.length);

    if (!profile) {
      return new Response(JSON.stringify({ error: "Profile not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
    }

    // Build SBAR data
    const vaccines = Array.isArray(profile.vaccines) ? (profile.vaccines as VaccineEntry[]) : [];
    const chronicConditions: string[] = Array.isArray(profile.chronic_conditions) ? profile.chronic_conditions : [];
    const bmi = profile.height_cm && profile.weight_kg
      ? Number(profile.weight_kg) / ((Number(profile.height_cm) / 100) ** 2)
      : null;

    const sbarData: SBARData = {
      lang,
      fullName: profile.full_name || "",
      age: profile.age,
      gender: profile.gender,
      bloodGroup: profile.blood_group,
      bmi,
      isPregnant: profile.is_pregnant || false,
      isBreastfeeding: profile.is_breastfeeding || false,
      kidneyDisease: profile.kidney_disease || false,
      liverDisease: profile.liver_disease || false,
      chronicConditions,
      familyHistory: chronicConditions.filter(c => c.startsWith("family:")).map(c => c.replace("family:", "")),
      smokingUse: (profile.smoking_use || "none").split("|")[0],
      alcoholUse: (profile.alcohol_use || "none").split("|")[0],
      allergies: allergies.map((a: { allergen: string; severity: string }) => ({ allergen: a.allergen, severity: a.severity })),
      medications: meds.map((m: { generic_name: string | null; brand_name: string | null; dosage: string | null; frequency: string | null }) => ({
        name: m.generic_name || m.brand_name || "—",
        dosage: m.dosage || "—",
        frequency: m.frequency || "—",
      })),
      supplements: (profile.supplements || []).filter((s: string) => !s.startsWith("meta:")),
      vaccines: vaccines.filter(v => v.status === "done").map(v => ({
        name: v.name,
        status: v.status,
        lastDate: v.last_date,
      })),
      generatedAt: new Date().toLocaleString(lang === "tr" ? "tr-TR" : "en-US", { dateStyle: "medium", timeStyle: "short" }),
    };

    // Render PDF using renderToBuffer (simpler, no stream handling)
    let pdfBuffer: Buffer;
    try {
      const element = SBARReport({ data: sbarData });
      // any: @react-pdf/renderer renderToBuffer type mismatch with React component return
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pdfBuffer = await renderToBuffer(element as any);
    } catch (renderErr) {
      console.error("PDF render error:", renderErr);
      return new Response(JSON.stringify({ error: "PDF render failed", detail: String(renderErr) }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="DoctoPal-SBAR-${new Date().toISOString().split("T")[0]}.pdf"`,
      },
    });
  } catch (error) {
    console.error("SBAR PDF error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate PDF" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
