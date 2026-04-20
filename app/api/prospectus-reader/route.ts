// © 2026 DoctoPal — All Rights Reserved
import { NextRequest, NextResponse } from "next/server";
import { askClaudeJSONMultimodal } from "@/lib/ai-client";
import { buildMedicationHubSystemPrompt } from "@/lib/prompts";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { tx } from "@/lib/translations";
import { getUserEffectivePremium } from "@/lib/premium";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);
  const rl = checkRateLimit(`prospectus:${ip}`, 5, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Too many requests. Please wait ${rl.resetInSeconds} seconds.` },
      { status: 429, headers: { "Retry-After": String(rl.resetInSeconds) } }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const lang = ((formData.get("lang") as string) === "tr" ? "tr" : "en") as "en" | "tr";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: tx("api.prospectus.unsupportedFile", lang) },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    // Auth required — prospectus analysis is Premium (Session 34 Commit A).
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const token = authHeader.replace("Bearer ", "");
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Premium gate
    const premium = await getUserEffectivePremium(user.id, supabase);
    if (!premium.isPremium) {
      const msg = lang === "tr"
        ? "Prospektüs analizi Premium bir özelliktir. Lütfen planınızı yükseltin."
        : "Prospectus analysis is a Premium feature. Please upgrade your plan.";
      return NextResponse.json({ error: msg, code: "PREMIUM_REQUIRED" }, { status: 402 });
    }

    // Get user context for medication-hub cross-check (Session 37 G3 genişletildi):
    // meds + allergies + supplements + chronic conditions + critical flags.
    const userId: string = user.id;
    let userMedications: string[] = [];
    let userAllergies: string[] = [];
    let userSupplements: string[] = [];
    let userChronicConditions: string[] = [];
    let isPregnant = false;
    let isBreastfeeding = false;
    let kidneyDisease = false;
    let liverDisease = false;

    try {
      // chat/route.ts:146-151 pattern — parallel fetch with Promise.all
      const [medsRes, allergiesRes, profileRes] = await Promise.all([
        supabase
          .from("user_medications")
          .select("generic_name, brand_name")
          .eq("user_id", user.id)
          .eq("is_active", true),
        supabase
          .from("user_allergies")
          .select("allergen")
          .eq("user_id", user.id),
        supabase
          .from("user_profiles")
          .select("supplements, chronic_conditions, is_pregnant, is_breastfeeding, kidney_disease, liver_disease")
          .eq("id", user.id)
          .maybeSingle(),
      ]);

      if (medsRes.data?.length) {
        userMedications = medsRes.data.map((m: { generic_name: string | null; brand_name: string | null }) =>
          m.generic_name || m.brand_name || ""
        ).filter(Boolean);
      }

      if (allergiesRes.data?.length) {
        userAllergies = allergiesRes.data.map((a: { allergen: string }) => a.allergen);
      }

      const profile = profileRes.data as {
        supplements?: string[] | null;
        chronic_conditions?: string[] | null;
        is_pregnant?: boolean | null;
        is_breastfeeding?: boolean | null;
        kidney_disease?: boolean | null;
        liver_disease?: boolean | null;
      } | null;

      if (profile) {
        // chat/route.ts:293-307 pattern — "meta:" prefix filtresi + "|" parse
        const rawSupps = Array.isArray(profile.supplements) ? profile.supplements : [];
        userSupplements = rawSupps
          .filter((s: string) => !s.startsWith("meta:"))
          .map((s: string) => s.split("|")[0])
          .filter(Boolean);

        // chat/route.ts:229-232 pattern — "surgery:"/"family:" prefix filter
        const rawChronic = Array.isArray(profile.chronic_conditions) ? profile.chronic_conditions : [];
        userChronicConditions = rawChronic.filter(
          (c: string) => !c.startsWith("surgery:") && !c.startsWith("family:")
        );

        isPregnant = !!profile.is_pregnant;
        isBreastfeeding = !!profile.is_breastfeeding;
        kidneyDisease = !!profile.kidney_disease;
        liverDisease = !!profile.liver_disease;
      }
    } catch {
      // Profile fetch failed — continue without cross-check data
    }

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    const userLang = tx("api.respondLang", lang);

    // Single source of truth — lib/prompts.ts builds the system prompt with
    // per-user meds/allergies/supplements/chronic conditions/critical flags
    // injected for the expanded interaction safety rules (Session 37 G3).
    const systemPrompt = buildMedicationHubSystemPrompt({
      userMedications,
      userAllergies,
      userSupplements,
      userChronicConditions,
      isPregnant,
      isBreastfeeding,
      kidneyDisease,
      liverDisease,
      replyLanguage: userLang,
    });

    const prompt = `Read this medication prospectus/leaflet/packaging image and extract all key information. Explain everything in simple ${userLang} that anyone can understand.`;

    const result = await askClaudeJSONMultimodal(prompt, systemPrompt, [
      { mimeType: file.type, base64 },
    ], { userId });

    let parsed;
    try {
      parsed = typeof result === "string" ? JSON.parse(result) : result;
    } catch {
      return NextResponse.json(
        { error: tx("api.prospectus.readFailed", lang) },
        { status: 500 }
      );
    }

    // Save structured scan to prospectus_scans (FAZ 2: dedicated table, replaces generic query_history insert)
    if (userId) {
      try {
        const supabase = createServerClient();
        await supabase.from("prospectus_scans").insert({
          user_id: userId,
          medication_name: parsed?.medicationName || null,
          file_name: file.name || null,
          scan_data: parsed,
          profile_alerts: Array.isArray(parsed?.profileAlerts) ? parsed.profileAlerts : null,
        });
      } catch (dbError) {
        // Non-critical — scan still returned to user
        console.warn("[prospectus] Failed to persist scan:", dbError);
      }
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Prospectus reader API error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
