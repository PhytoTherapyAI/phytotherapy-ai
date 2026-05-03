// © 2026 DoctoPal — All Rights Reserved
import { NextRequest } from "next/server";
import ReactPDF from "@react-pdf/renderer";
import { SBARReport, type SBARData } from "@/components/pdf/SBARReport";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { logApiAccess } from "@/lib/security-audit";
import { resolveTargetUser } from "@/lib/family-permissions";
import { getUserEffectivePremium } from "@/lib/premium";
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

    const authHeader = request.headers.get("authorization");
    const supabase = createServerClient();

    let body: Record<string, unknown>;
    try { body = await request.json(); } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
    const lang = (body.lang === "tr" ? "tr" : "en") as "en" | "tr";
    const requestedTargetUserId = typeof body.targetUserId === "string" ? body.targetUserId : null;

    const resolution = await resolveTargetUser(supabase, authHeader, requestedTargetUserId);
    if (!resolution.ok) {
      return new Response(JSON.stringify({ error: resolution.error }), { status: resolution.status, headers: { "Content-Type": "application/json" } });
    }
    const { callerId, targetUserId, isOwnProfile } = resolution;

    // Premium gate — SBAR report is a Premium feature (Session 34 Commit A).
    // Checks caller's effective premium (individual OR via family group).
    const premium = await getUserEffectivePremium(callerId, supabase);
    if (!premium.isPremium) {
      logApiAccess({
        endpoint: "/api/sbar-pdf",
        userId: callerId,
        action: "sbar_blocked_free_plan",
        ip: clientIP,
        outcome: "denied",
      });
      const msg = lang === "tr"
        ? "SBAR raporu Premium bir özelliktir. Lütfen planınızı yükseltin."
        : "SBAR report is a Premium feature. Please upgrade your plan.";
      return new Response(
        JSON.stringify({ error: msg, code: "PREMIUM_REQUIRED" }),
        { status: 402, headers: { "Content-Type": "application/json" } }
      );
    }

    // KVKK Consent Gate: SBAR report requires caller's explicit consent
    // (caller is the one initiating the report, so their consent matters)
    const { data: consentRow } = await supabase
      .from("user_profiles")
      .select("consent_sbar_report")
      .eq("id", callerId)
      .maybeSingle();

    if (!consentRow?.consent_sbar_report) {
      logApiAccess({
        endpoint: "/api/sbar-pdf",
        userId: callerId,
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
      userId: callerId,
      action: isOwnProfile ? "generate_health_summary_pdf" : `generate_family_member_sbar:${targetUserId}`,
      ip: clientIP,
      outcome: "success",
    });

    // Fetch profile/meds/allergies for the TARGET user (FAZ 3 RLS allows family members to read)
    // Sprint 17 Commit 2 — 4 yeni tablo eklendi (family_history + check-ins + last lab + last radiology)
    const [
      profileRes,
      medsRes,
      allergiesRes,
      familyHistoryRes,
      checkInsRes,
      lastLabRes,
      lastRadRes,
    ] = await Promise.all([
      supabase
        .from("user_profiles")
        .select("full_name, age, gender, blood_group, height_cm, weight_kg, is_pregnant, is_breastfeeding, kidney_disease, liver_disease, chronic_conditions, smoking_use, alcohol_use, supplements, vaccines")
        .eq("id", targetUserId)
        .maybeSingle(),
      supabase
        .from("user_medications")
        .select("brand_name, generic_name, dosage, frequency")
        .eq("user_id", targetUserId)
        .eq("is_active", true),
      supabase
        .from("user_allergies")
        .select("allergen, severity")
        .eq("user_id", targetUserId),
      // V1 — Aile öyküsü detay (Session 36 family_history_entries; tablo apply edilmemişse graceful fallback)
      supabase
        .from("family_history_entries")
        .select("person_relation, condition_name, age_at_diagnosis, age_at_death, is_deceased")
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: false })
        .limit(10),
      // V2 — Son 7 gün vital trend (daily_check_ins: sleep_quality 1-5, mood 1-5, energy_level 1-5)
      supabase
        .from("daily_check_ins")
        .select("check_date, sleep_quality, mood, energy_level")
        .eq("user_id", targetUserId)
        .order("check_date", { ascending: false })
        .limit(7),
      // V3a — Son lab testi (Sprint 18: summary + overall_urgency. Sprint 25 Commit 4: analysis_result DROPPED)
      supabase
        .from("blood_tests")
        .select("created_at, summary, overall_urgency")
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      // V3b — Son radyoloji raporu (summary TEXT + image_type + overall_urgency)
      supabase
        .from("radiology_reports")
        .select("created_at, image_type, overall_urgency, summary")
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    if (profileRes.error) console.error("[SBAR-PDF] profile error:", profileRes.error.message, profileRes.error.details, profileRes.error.hint);
    if (medsRes.error) console.error("[SBAR-PDF] meds error:", medsRes.error.message, medsRes.error.details);
    if (allergiesRes.error) console.error("[SBAR-PDF] allergies error:", allergiesRes.error.message, allergiesRes.error.details);
    // Yeni 4 tablo: hata varsa log et + graceful fallback (boş array / null)
    if (familyHistoryRes.error) console.warn("[SBAR-PDF] family_history fetch failed (table may not be applied):", familyHistoryRes.error.message);
    if (checkInsRes.error) console.warn("[SBAR-PDF] daily_check_ins fetch failed:", checkInsRes.error.message);
    if (lastLabRes.error) console.warn("[SBAR-PDF] blood_tests fetch failed:", lastLabRes.error.message);
    if (lastRadRes.error) console.warn("[SBAR-PDF] radiology_reports fetch failed:", lastRadRes.error.message);

    const profile = profileRes.data;
    const meds = medsRes.data || [];
    const allergies = allergiesRes.data || [];
    const familyHistoryDetailed = familyHistoryRes.error ? [] : (familyHistoryRes.data || []);
    const checkIns = checkInsRes.error ? [] : (checkInsRes.data || []);
    const lastLab = lastLabRes.error ? null : lastLabRes.data;
    const lastRadiology = lastRadRes.error ? null : lastRadRes.data;

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
      // Sprint 17 Commit 2 — yeni veri inject (V1+V2+V3)
      familyHistoryDetailed: familyHistoryDetailed.map((f) => ({
        person_relation: f.person_relation,
        condition_name: f.condition_name,
        age_at_diagnosis: f.age_at_diagnosis ?? undefined,
        age_at_death: f.age_at_death ?? undefined,
        is_deceased: f.is_deceased ?? false,
      })),
      checkIns: checkIns.map((c) => ({
        check_date: c.check_date,
        sleep_quality: c.sleep_quality ?? undefined,
        mood: c.mood ?? undefined,
        energy_level: c.energy_level ?? undefined,
      })),
      lastLab: lastLab
        ? {
            created_at: lastLab.created_at,
            summary: lastLab.summary ?? null,
            overall_urgency: lastLab.overall_urgency ?? null,
          }
        : undefined,
      lastRadiology: lastRadiology
        ? {
            created_at: lastRadiology.created_at,
            image_type: lastRadiology.image_type,
            overall_urgency: lastRadiology.overall_urgency,
            summary: lastRadiology.summary,
          }
        : undefined,
      generatedAt: new Date().toLocaleString(lang === "tr" ? "tr-TR" : "en-US", { dateStyle: "medium", timeStyle: "short" }),
    };

    // Sprint 17 hotfix — renderToBuffer (named) → ReactPDF.renderToStream (default).
    // RadiologyReport / DoctorReport ile parite. Chunked stream Vercel function memory
    // ceiling'i tetiklemiyor; renderToBuffer full-buffer-in-RAM bellek baskısı yapıyordu.
    let pdfBuffer: Buffer;
    try {
      const pdfStream = await ReactPDF.renderToStream(
        SBARReport({ data: sbarData })
      );
      const chunks: Uint8Array[] = [];
      for await (const chunk of pdfStream) {
        chunks.push(typeof chunk === "string" ? new TextEncoder().encode(chunk) : chunk);
      }
      pdfBuffer = Buffer.concat(chunks);
    } catch (renderErr) {
      console.error("PDF render error:", renderErr);
      return new Response(JSON.stringify({ error: "PDF render failed", detail: String(renderErr) }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    const fileSlug = lang === "tr" ? "SBAR-Raporu" : "SBAR-Report";
    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="DoctoPal-${fileSlug}-${new Date().toISOString().split("T")[0]}.pdf"`,
      },
    });
  } catch (error) {
    console.error("SBAR PDF error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate PDF" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
