// © 2026 DoctoPal — All Rights Reserved
import { NextRequest, NextResponse } from "next/server";
import { askGeminiJSON } from "@/lib/ai-client";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { tx } from "@/lib/translations";

export const maxDuration = 60;

const VALID_SYMPTOMS = [
  "bloating",
  "gas",
  "constipation",
  "diarrhea",
  "acid_reflux",
  "food_sensitivity",
];

const VALID_DIET_TYPES = [
  "standard",
  "vegetarian",
  "vegan",
  "keto",
  "mediterranean",
  "gluten_free",
  "lactose_free",
];

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`gut-health:${clientIP}`, 10, 60_000);
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

    // Validate symptoms
    const symptoms = Array.isArray(body.symptoms)
      ? body.symptoms.filter((s: string) => VALID_SYMPTOMS.includes(s))
      : [];

    if (symptoms.length === 0) {
      return NextResponse.json(
        { error: tx("api.selectSymptom", lang) },
        { status: 400 }
      );
    }

    const dietType = VALID_DIET_TYPES.includes(body.diet_type) ? body.diet_type : "standard";
    const recentAntibiotics = Boolean(body.recent_antibiotics);

    // Fetch user medications and profile
    const [medsResult, profileResult] = await Promise.all([
      supabase
        .from("user_medications")
        .select("brand_name, generic_name, dosage, frequency")
        .eq("user_id", user.id),
      supabase
        .from("user_profiles")
        .select("age, gender, chronic_conditions, kidney_disease, liver_disease")
        .eq("id", user.id)
        .single(),
    ]);

    const medications = medsResult.data || [];
    const profile = profileResult.data;

    const medicationList = medications.length > 0
      ? medications.map((m) => `${(m.generic_name || m.brand_name)}${m.generic_name ? ` (${m.generic_name})` : ""}`).join(", ")
      : "None reported";

    const profileInfo = profile
      ? `Age: ${profile.age || "unknown"}, Gender: ${profile.gender || "unknown"}, Chronic conditions: ${profile.chronic_conditions?.join(", ") || "none"}, Kidney disease: ${profile.kidney_disease || false}, Liver disease: ${profile.liver_disease || false}`
      : "No profile data";

    const systemPrompt = `You are a gastroenterology-informed health analyst for DoctoPal. Analyze digestive symptoms and provide evidence-based gut health guidance.

RULES:
- Base analysis on reported symptoms and user profile
- Check probiotic strain recommendations against user medications for interactions
- Consider gut-brain axis connections
- Provide FODMAP guidance when relevant
- Use PubMed-backed evidence
- Respond in ${tx("api.respondLang", lang)}
- Never diagnose — suggest when to see a gastroenterologist

OUTPUT FORMAT (strict JSON):
{
  "gutHealthScore": <number 0-100>,
  "patterns": [<string: observed patterns/possible conditions like IBS-C, IBS-D, GERD, max 4>],
  "probioticRecs": [
    {
      "strain": "<specific strain name e.g. Lactobacillus rhamnosus GG>",
      "dosage": "<CFU and frequency>",
      "duration": "<recommended duration>",
      "benefit": "<why this strain>",
      "safety": "<safe | caution | avoid>",
      "interactionNote": "<drug interaction warning or empty string>"
    }
  ],
  "dietarySuggestions": [
    {
      "category": "<e.g. FODMAP, Fiber, Fermented Foods>",
      "recommendation": "<specific actionable advice>",
      "foods_to_add": [<string>],
      "foods_to_avoid": [<string>]
    }
  ],
  "medicationEffects": [<string: how current medications may affect gut health>],
  "gutBrainConnection": "<string: explanation of gut-brain axis relevance to symptoms>",
  "alertLevel": "<green | yellow | red>",
  "alertMessage": "<string: brief alert explanation or empty string>",
  "whenToSeeDoctor": [<string: warning signs that need medical attention>],
  "sources": [{"title": "<string>", "url": "<PubMed URL>"}]
}`;

    const prompt = `Analyze these digestive symptoms and provide gut health guidance:

SYMPTOMS: ${symptoms.join(", ")}
DIET TYPE: ${dietType}
RECENT ANTIBIOTICS: ${recentAntibiotics ? "Yes (within last 3 months)" : "No"}

USER PROFILE: ${profileInfo}
USER MEDICATIONS: ${medicationList}

Provide a comprehensive gut health analysis as JSON.`;

    const result = await askGeminiJSON(prompt, systemPrompt, { userId: user.id });
    let analysis; try { analysis = JSON.parse(result); } catch { return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 }); }

    // Save to query history
    try {
      await supabase.from("query_history").insert({
        user_id: user.id,
        query_text: `Gut health analysis: ${symptoms.join(", ")}`,
        response_text: `Score: ${analysis.gutHealthScore}/100, Patterns: ${(analysis.patterns || []).join(", ")}`,
        query_type: "general",
      });
    } catch {
      // Non-critical
    }

    return NextResponse.json({ analysis });
  } catch (err) {
    console.error("Gut health analysis error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
