import { NextRequest, NextResponse } from "next/server";
import { askGeminiJSON } from "@/lib/gemini";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { tx } from "@/lib/translations";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`kidney-dashboard:${clientIP}`, 10, 60_000);
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

    // Validate lab values
    const creatinine = Number(body.creatinine) || 0;
    const bun = Number(body.bun) || 0;
    const egfr = Number(body.egfr) || 0;
    const potassium = Number(body.potassium) || 0;
    const phosphorus = Number(body.phosphorus) || 0;
    const sodium = Number(body.sodium) || 0;

    if (creatinine <= 0 && egfr <= 0) {
      return NextResponse.json(
        { error: tx("api.kidneyDashboard.creatinineOrEgfr", lang) },
        { status: 400 }
      );
    }

    const [medsResult, profileResult] = await Promise.all([
      supabase
        .from("user_medications")
        .select("brand_name, generic_name, dosage, frequency")
        .eq("user_id", user.id),
      supabase
        .from("user_profiles")
        .select("age, gender, chronic_conditions, kidney_disease")
        .eq("id", user.id)
        .single(),
    ]);

    const medications = medsResult.data || [];
    const profile = profileResult.data;

    const medicationList = medications.length > 0
      ? medications.map((m) => `${(m.generic_name || m.brand_name)}${m.generic_name ? ` (${m.generic_name})` : ""}`).join(", ")
      : "None reported";

    const profileInfo = profile
      ? `Age: ${profile.age || "unknown"}, Gender: ${profile.gender || "unknown"}, Chronic conditions: ${profile.chronic_conditions?.join(", ") || "none"}, Known kidney disease: ${profile.kidney_disease || false}`
      : "No profile data";

    const systemPrompt = `You are a nephrology-informed health analyst for Phytotherapy.ai. Analyze kidney lab values and provide evidence-based kidney health guidance.

RULES:
- Classify CKD stage based on eGFR: Stage 1 (>=90), Stage 2 (60-89), Stage 3a (45-59), Stage 3b (30-44), Stage 4 (15-29), Stage 5 (<15)
- Check CRITICAL medication safety: metformin contraindicated if eGFR<30, dose reduction if eGFR 30-45; NSAIDs avoid in CKD; ACE inhibitors/ARBs monitor potassium; aminoglycosides nephrotoxic
- Provide dietary restrictions based on CKD stage (potassium, phosphorus, sodium, protein)
- Flag dangerous potassium levels (>5.5 = urgent, >6.0 = emergency)
- Recommend fluid intake based on stage
- Use PubMed-backed evidence
- Respond in ${tx("api.respondLang", lang)}
- Never diagnose — suggest when to see a nephrologist

OUTPUT FORMAT (strict JSON):
{
  "kidneyStage": "<string: CKD stage description>",
  "stageNumber": <number 1-5>,
  "eGFR": <number>,
  "stageColor": "<green | yellow | orange | red | darkred>",
  "labInterpretation": {
    "creatinine": "<string: interpretation>",
    "bun": "<string: interpretation>",
    "potassium": "<string: interpretation>",
    "phosphorus": "<string: interpretation>"
  },
  "medicationAlerts": [
    {
      "medication": "<drug name>",
      "alert": "<safety concern>",
      "action": "<what to do>",
      "urgency": "<routine | important | urgent>"
    }
  ],
  "dietaryRestrictions": [
    {
      "nutrient": "<K/P/Na/Protein>",
      "limit": "<daily limit>",
      "foods_to_limit": [<string>],
      "foods_to_prefer": [<string>]
    }
  ],
  "fluidRecommendation": "<string: daily fluid intake advice>",
  "supplements": [
    {
      "name": "<supplement name>",
      "dosage": "<dosage>",
      "note": "<why or caution>",
      "safety": "<safe | caution | avoid>"
    }
  ],
  "alertLevel": "<green | yellow | red>",
  "alertMessage": "<string: critical alert or empty>",
  "whenToSeeDoctor": [<string: warning signs>],
  "sources": [{"title": "<string>", "url": "<PubMed URL>"}]
}`;

    const prompt = `Analyze these kidney lab values:

CREATININE: ${creatinine || "not provided"} mg/dL
BUN: ${bun || "not provided"} mg/dL
eGFR: ${egfr || "not provided"} mL/min/1.73m2
POTASSIUM: ${potassium || "not provided"} mEq/L
PHOSPHORUS: ${phosphorus || "not provided"} mg/dL
SODIUM: ${sodium || "not provided"} mEq/L

USER PROFILE: ${profileInfo}
USER MEDICATIONS: ${medicationList}

Provide a comprehensive kidney health analysis as JSON.`;

    const result = await askGeminiJSON(prompt, systemPrompt);
    const analysis = JSON.parse(result);

    try {
      await supabase.from("query_history").insert({
        user_id: user.id,
        query_text: `Kidney dashboard: eGFR ${egfr}, Cr ${creatinine}`,
        response_text: `Stage: ${analysis.kidneyStage}, eGFR: ${analysis.eGFR}`,
        query_type: "general",
      });
    } catch { /* Non-critical */ }

    return NextResponse.json({ analysis });
  } catch (err) {
    console.error("Kidney dashboard error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
