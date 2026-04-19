// © 2026 DoctoPal — All Rights Reserved
import { NextRequest, NextResponse } from "next/server";
import { askClaudeJSONMultimodal } from "@/lib/ai-client";
import { buildProspectusSystemPrompt } from "@/lib/prompts";
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

    // Get user medications for cross-check
    const userId: string = user.id;
    let userMedications: string[] = [];
    let userAllergies: string[] = [];

    try {
      const { data: meds } = await supabase
        .from("user_medications")
        .select("generic_name, brand_name")
        .eq("user_id", user.id)
        .eq("is_active", true);

      const { data: allergies } = await supabase
        .from("user_allergies")
        .select("allergen")
        .eq("user_id", user.id);

      if (meds?.length) {
        userMedications = meds.map((m: { generic_name: string | null; brand_name: string | null }) =>
          m.generic_name || m.brand_name || ""
        ).filter(Boolean);
      }

      if (allergies?.length) {
        userAllergies = allergies.map((a: { allergen: string }) => a.allergen);
      }
    } catch {
      // Profile fetch failed — continue without cross-check data
    }

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    const userLang = tx("api.respondLang", lang);

    // Single source of truth — lib/prompts.ts builds the system prompt with
    // per-user medication and allergy context injected for interaction checks.
    const systemPrompt = buildProspectusSystemPrompt({
      userMedications,
      userAllergies,
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
