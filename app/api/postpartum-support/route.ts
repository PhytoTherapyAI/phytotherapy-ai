import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { askGeminiJSON } from "@/lib/gemini";
import { tx } from "@/lib/translations";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`postpartum:${clientIP}`, 5, 60_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Please wait ${rateCheck.resetInSeconds} seconds.` },
        { status: 429, headers: { "Retry-After": String(rateCheck.resetInSeconds) } }
      );
    }

    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const supabase = createServerClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const lang = (body.lang === "tr" ? "tr" : "en") as "en" | "tr";
    const {
      weeks_postpartum = 4,
      breastfeeding = false,
      mood_score = 3,
      sleep_hours = 4,
      concerns = [],
      epds_answers = [],
    } = body;

    // Calculate EPDS score if answers provided (10 questions, 0-3 each)
    let epdsScore: number | null = null;
    let epdsRisk: string | null = null;
    if (epds_answers.length === 10) {
      const score = epds_answers.reduce((sum: number, val: number) => sum + val, 0);
      epdsScore = score;
      if (score <= 8) epdsRisk = "low";
      else if (score <= 12) epdsRisk = "moderate";
      else epdsRisk = "high";
    }

    // CRITICAL: EPDS Question 10 (self-harm thoughts) > 0 → RED ALERT
    const q10Score = epds_answers.length === 10 ? epds_answers[9] : 0;
    if (q10Score > 0) {
      return NextResponse.json({
        result: {
          alertLevel: "red",
          crisisAlert: true,
          epdsScore,
          epdsRisk: "crisis",
          crisisMessage: tx("api.postpartum.crisisMessage", lang),
          crisisLines: [tx("api.postpartum.crisisLine1", lang), tx("api.postpartum.crisisLine2", lang)],
          breastfeedingSafeMeds: [],
          recoveryTips: [],
          mentalHealthCheck: null,
        },
      });
    }

    // Fetch user medications — check breastfeeding safety
    const { data: medications } = await supabase
      .from("user_medications")
      .select("brand_name, generic_name, dosage")
      .eq("user_id", user.id);

    const medicationList = medications && medications.length > 0
      ? medications.map((m) => `${(m.generic_name || m.brand_name)}${m.generic_name ? ` (${m.generic_name})` : ""}`).join(", ")
      : "None reported";

    const systemPrompt = `You are a postpartum support assistant for Phytotherapy.ai.
You provide evidence-based postpartum care guidance with special focus on mental health and breastfeeding safety.

CRITICAL SAFETY RULES:
- EPDS >= 13: alertLevel "red" + immediate professional referral
- EPDS >= 9: alertLevel "yellow" + professional referral recommended
- If breastfeeding, check ALL medications for LactMed safety (L1-L5)
- L4-L5 medications: warn immediately, suggest contacting doctor
- Postpartum psychosis symptoms (hallucinations, delusions, extreme confusion): RED ALERT + emergency
- Be compassionate — postpartum is an incredibly vulnerable time
- Normalize the difficulty, reduce guilt
- NEVER suggest "just sleep when baby sleeps" without practical context

Respond in ${tx("api.respondLang", lang)}.

Return ONLY valid JSON:
{
  "mentalHealthCheck": { "status": string, "recommendations": [string] },
  "breastfeedingSafeMeds": [{ "medication": string, "lactmedCategory": string, "safe": boolean, "note": string }],
  "recoveryTips": [{ "area": string, "tip": string, "when": string }],
  "nutritionNeeds": [{ "nutrient": string, "amount": string, "why": string }],
  "sleepStrategies": [string],
  "selfCarePlan": [string],
  "warningSignsToWatch": [string],
  "alertLevel": "green" | "yellow" | "red",
  "professionalReferral": boolean
}`;

    const prompt = `Analyze this postpartum support assessment:

WEEKS POSTPARTUM: ${weeks_postpartum}
BREASTFEEDING: ${breastfeeding ? "Yes" : "No"}
MOOD SCORE: ${mood_score}/5
SLEEP HOURS: ${sleep_hours}
CONCERNS: ${concerns.length > 0 ? concerns.join(", ") : "None specified"}
EPDS SCORE: ${epdsScore !== null ? `${epdsScore}/30 (Risk: ${epdsRisk})` : "Not completed"}
USER MEDICATIONS: ${medicationList}

Provide postpartum support including:
1. Mental health assessment based on mood and EPDS
2. If breastfeeding, check ALL medications for lactation safety (LactMed)
3. Recovery tips appropriate for ${weeks_postpartum} weeks postpartum
4. Nutrition needs (especially if breastfeeding: +500 cal, iron, calcium, DHA)
5. Sleep strategies realistic for new parents
6. Warning signs to watch for at this stage

If EPDS >= 13 or mood_score <= 1, set alertLevel to "red" and professionalReferral to true.`;

    const resultText = await askGeminiJSON(prompt, systemPrompt);
    const analysis = JSON.parse(resultText);

    // Enforce safety
    if (epdsScore !== null && epdsScore >= 13) {
      analysis.alertLevel = "red";
      analysis.professionalReferral = true;
    } else if (epdsScore !== null && epdsScore >= 9) {
      if (analysis.alertLevel === "green") analysis.alertLevel = "yellow";
      analysis.professionalReferral = true;
    }
    if (mood_score <= 1) {
      analysis.alertLevel = "red";
      analysis.professionalReferral = true;
    }

    return NextResponse.json({
      result: {
        ...analysis,
        epdsScore,
        epdsRisk,
        weeksPostpartum: weeks_postpartum,
        breastfeeding,
        crisisAlert: false,
        crisisLines: [tx("api.postpartum.crisisLine1", lang), tx("api.postpartum.crisisLine2", lang)],
      },
    });
  } catch (err) {
    console.error("Postpartum support error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
