import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { askGeminiJSON } from "@/lib/gemini";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`ptsd:${clientIP}`, 5, 60_000);
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
    const lang = body.lang === "tr" ? "tr" : "en";
    const {
      pcl5_answers = [],
      trigger_count = 0,
      flashback_count = 0,
      nightmare_count = 0,
      grounding_used = false,
      avoidance_level = 0,
    } = body;

    // Calculate PCL-5 score (5 key questions, 0-4 each)
    let pcl5Score: number | null = null;
    let severityLevel: string | null = null;
    if (pcl5_answers.length === 5) {
      const score = pcl5_answers.reduce((sum: number, val: number) => sum + val, 0);
      pcl5Score = score;
      // Mini PCL-5 (5 items): scale proportionally to full PCL-5 (20 items)
      const estimatedFull = Math.round((score / 20) * 80);
      if (estimatedFull <= 20) severityLevel = "minimal";
      else if (estimatedFull <= 40) severityLevel = "moderate";
      else if (estimatedFull <= 60) severityLevel = "significant";
      else severityLevel = "severe";
    }

    // Check for suicidal content in any text fields
    const suicidalKeywords = [
      "suicide", "suicidal", "kill myself", "end my life", "want to die",
      "intihar", "kendimi oldur", "yasamak istemiyorum", "olmek istiyorum",
    ];
    const bodyStr = JSON.stringify(body).toLowerCase();
    const hasSuicidalContent = suicidalKeywords.some((kw) => bodyStr.includes(kw));

    if (hasSuicidalContent) {
      return NextResponse.json({
        result: {
          severityLevel: "crisis",
          pcl5Score,
          alertLevel: "red",
          professionalReferral: true,
          crisisAlert: true,
          crisisMessage: lang === "tr"
            ? "Endise verici dusunceler fark ettik. Lutfen hemen bir ruh sağlığı uzmaniyla veya kriz hattı (182) ile iletisime gecin. Yalniz degilsiniz."
            : "We noticed concerning thoughts. Please reach out to a mental health professional or crisis line (988) immediately. You are not alone.",
          crisisLines: lang === "tr"
            ? ["Kriz Hattı: 182", "Sağlık Bakanlığı ALO: 184"]
            : ["Suicide & Crisis Lifeline: 988", "Crisis Text Line: Text HOME to 741741"],
          copingStrategies: [],
          groundingExercises: [],
        },
      });
    }

    // Fetch user medications
    const { data: medications } = await supabase
      .from("user_medications")
      .select("brand_name, generic_name, dosage")
      .eq("user_id", user.id);

    const medicationList = medications && medications.length > 0
      ? medications.map((m) => `${(m.generic_name || m.brand_name)}${m.generic_name ? ` (${m.generic_name})` : ""}`).join(", ")
      : "None reported";

    const systemPrompt = `You are a PTSD support assistant for Phytotherapy.ai.
You provide trauma-informed, evidence-based support and coping strategies.

CRITICAL SAFETY RULES:
- NEVER act as a therapist — always recommend professional trauma therapy (EMDR, CPT, PE)
- ALWAYS set professionalReferral to true — PTSD always needs professional care
- NEVER ask users to describe their trauma in detail
- If PCL-5 score suggests moderate+ severity, alertLevel MUST be at least "yellow"
- Be gentle, validating, trauma-informed
- Focus on safety and stabilization, not processing
- Never minimize trauma experiences

Respond in ${lang === "tr" ? "Turkish" : "English"}.

Return ONLY valid JSON:
{
  "severityLevel": "minimal" | "moderate" | "significant" | "severe",
  "copingStrategies": [{ "strategy": string, "description": string, "when": string }],
  "groundingExercises": [{ "name": string, "steps": [string], "duration": string }],
  "safetyPlan": [string],
  "medicationNotes": string,
  "recommendations": [string, max 5],
  "professionalResources": [string],
  "alertLevel": "green" | "yellow" | "red"
}`;

    const prompt = `Analyze this PTSD support assessment:

PCL-5 MINI SCORE: ${pcl5Score !== null ? `${pcl5Score}/20 (estimated severity: ${severityLevel})` : "Not completed"}
TRIGGER COUNT (this week): ${trigger_count}
FLASHBACK COUNT (this week): ${flashback_count}
NIGHTMARE COUNT (this week): ${nightmare_count}
GROUNDING TECHNIQUES USED: ${grounding_used ? "Yes" : "No"}
AVOIDANCE LEVEL: ${avoidance_level}/10
USER MEDICATIONS: ${medicationList}

Provide trauma-informed support with grounding exercises, coping strategies, and professional referral resources.
professionalReferral MUST always be true for PTSD.`;

    const resultText = await askGeminiJSON(prompt, systemPrompt);
    const analysis = JSON.parse(resultText);

    // Enforce safety: PTSD always needs professional referral
    analysis.professionalReferral = true;

    // Override alert level based on score
    if (severityLevel === "severe" || trigger_count >= 10 || flashback_count >= 5) {
      analysis.alertLevel = "red";
    } else if (severityLevel === "significant" || severityLevel === "moderate") {
      if (analysis.alertLevel === "green") analysis.alertLevel = "yellow";
    }

    return NextResponse.json({
      result: {
        ...analysis,
        pcl5Score,
        professionalReferral: true,
        crisisAlert: false,
        crisisLines: lang === "tr"
          ? ["Kriz Hattı: 182", "Sağlık Bakanlığı ALO: 184"]
          : ["Suicide & Crisis Lifeline: 988", "Crisis Text Line: Text HOME to 741741", "Veterans Crisis Line: 1-800-273-8255 Press 1"],
      },
    });
  } catch (err) {
    console.error("PTSD support error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
