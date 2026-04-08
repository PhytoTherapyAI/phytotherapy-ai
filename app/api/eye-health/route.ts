// © 2026 DoctoPal — All Rights Reserved
import { NextRequest, NextResponse } from "next/server";
import { askGeminiJSON } from "@/lib/ai-client";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { tx } from "@/lib/translations";

export const maxDuration = 60;

const VALID_SYMPTOMS = ["dryness", "strain", "floaters", "redness", "blurry_vision", "light_sensitivity", "itching", "tearing"];

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`eye-health:${clientIP}`, 10, 60_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Please wait ${rateCheck.resetInSeconds} seconds.` },
        { status: 429, headers: { "Retry-After": String(rateCheck.resetInSeconds) } }
      );
    }

    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const lang = (body.lang === "tr" ? "tr" : "en") as "en" | "tr";

    const symptoms = Array.isArray(body.symptoms)
      ? body.symptoms.filter((s: string) => VALID_SYMPTOMS.includes(s))
      : [];

    if (symptoms.length === 0) {
      return NextResponse.json(
        { error: tx("api.selectSymptom", lang) },
        { status: 400 }
      );
    }

    const screenHours = Math.min(24, Math.max(0, Number(body.screen_hours) || 0));

    const [medsResult, profileResult] = await Promise.all([
      supabase
        .from("user_medications")
        .select("brand_name, generic_name, dosage, frequency")
        .eq("user_id", user.id),
      supabase
        .from("user_profiles")
        .select("age, gender, chronic_conditions, is_pregnant, is_breastfeeding")
        .eq("id", user.id)
        .single(),
    ]);

    const medications = medsResult.data || [];
    const profile = profileResult.data;

    const medicationList = medications.length > 0
      ? medications.map((m) => `${(m.generic_name || m.brand_name)}${m.generic_name ? ` (${m.generic_name})` : ""}`).join(", ")
      : "None reported";

    const profileInfo = profile
      ? `Age: ${profile.age || "unknown"}, Gender: ${profile.gender || "unknown"}, Chronic conditions: ${profile.chronic_conditions?.join(", ") || "none"}`
      : "No profile data";

    const systemPrompt = `You are an ophthalmology-informed health analyst for Doctopal. Analyze eye symptoms and provide evidence-based eye health guidance.

RULES:
- Check medication effects on eyes: hydroxychloroquine→retinal toxicity, isotretinoin→night blindness/dry eyes, corticosteroids→glaucoma/cataracts, tamoxifen→retinal deposits, ethambutol→optic neuritis, sildenafil→blue vision, amiodarone→corneal deposits
- Consider screen time effects (digital eye strain / computer vision syndrome)
- Recommend evidence-based supplements (lutein, zeaxanthin, omega-3, vitamin A) with drug interaction checks
- Provide age-appropriate screening schedule
- Use PubMed-backed evidence
- Respond in ${tx("api.respondLang", lang)}
- Never diagnose — suggest when to see an ophthalmologist

OUTPUT FORMAT (strict JSON):
{
  "eyeHealthScore": <number 0-100>,
  "symptomAnalysis": "<string: analysis of reported symptoms>",
  "medicationRisks": [
    {
      "medication": "<drug name>",
      "eyeRisk": "<how it affects eyes>",
      "riskLevel": "<low | moderate | high>",
      "recommendation": "<what to do>"
    }
  ],
  "screenTimeImpact": "<string: assessment of screen time effects>",
  "recommendations": [
    {
      "category": "<e.g. 20-20-20 rule, Blue light, Hydration, Supplements>",
      "advice": "<specific actionable advice>",
      "priority": "<high | medium | low>"
    }
  ],
  "supplements": [
    {
      "name": "<supplement name>",
      "dosage": "<dosage>",
      "benefit": "<eye health benefit>",
      "safety": "<safe | caution | avoid>",
      "interactionNote": "<drug interaction or empty string>"
    }
  ],
  "screeningSchedule": [
    {
      "test": "<test name>",
      "frequency": "<how often>",
      "reason": "<why needed>"
    }
  ],
  "alertLevel": "<green | yellow | red>",
  "whenToSeeDoctor": [<string: urgent warning signs>],
  "sources": [{"title": "<string>", "url": "<PubMed URL>"}]
}`;

    const prompt = `Analyze these eye health concerns:

SYMPTOMS: ${symptoms.join(", ")}
DAILY SCREEN HOURS: ${screenHours}

USER PROFILE: ${profileInfo}
USER MEDICATIONS: ${medicationList}

Provide a comprehensive eye health analysis as JSON.`;

    const result = await askGeminiJSON(prompt, systemPrompt);
    let analysis; try { analysis = JSON.parse(result); } catch { return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 }); }

    try {
      await supabase.from("query_history").insert({
        user_id: user.id,
        query_text: `Eye health analysis: ${symptoms.join(", ")}, screen ${screenHours}h`,
        response_text: `Score: ${analysis.eyeHealthScore}/100`,
        query_type: "general",
      });
    } catch { /* Non-critical */ }

    return NextResponse.json({ analysis });
  } catch (err) {
    console.error("Eye health analysis error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
