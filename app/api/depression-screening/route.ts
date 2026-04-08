// © 2026 DoctoPal — All Rights Reserved
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { askGeminiJSON } from "@/lib/ai-client";
import { tx } from "@/lib/translations";

export const maxDuration = 60;

const PHQ9_QUESTIONS_EN = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself — or that you are a failure",
  "Trouble concentrating on things",
  "Moving or speaking slowly, or being fidgety/restless",
  "Thoughts that you would be better off dead, or of hurting yourself",
];

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`depression:${clientIP}`, 5, 60_000);
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
    const { phq9_answers } = body;

    if (!phq9_answers || !Array.isArray(phq9_answers) || phq9_answers.length !== 9) {
      return NextResponse.json({ error: "PHQ-9 requires exactly 9 answers (0-3 each)" }, { status: 400 });
    }

    // Validate each answer is 0-3
    for (const answer of phq9_answers) {
      if (typeof answer !== "number" || answer < 0 || answer > 3) {
        return NextResponse.json({ error: "Each PHQ-9 answer must be 0-3" }, { status: 400 });
      }
    }

    const phq9Score = phq9_answers.reduce((sum: number, val: number) => sum + val, 0);
    const q9Score = phq9_answers[8]; // Question 9: suicidal ideation

    // Determine severity
    let severity: string;
    if (phq9Score <= 4) severity = "minimal";
    else if (phq9Score <= 9) severity = "mild";
    else if (phq9Score <= 14) severity = "moderate";
    else if (phq9Score <= 19) severity = "moderately_severe";
    else severity = "severe";

    // CRITICAL: Question 9 (suicidal thoughts) > 0 → IMMEDIATE RED ALERT
    if (q9Score > 0) {
      return NextResponse.json({
        result: {
          phq9Score,
          severity,
          alertLevel: "red",
          professionalReferral: true,
          crisisAlert: true,
          crisisMessage: tx("api.depression.crisisMessage", lang),
          crisisLines: [tx("api.depression.crisisLine1", lang), tx("api.depression.crisisLine2", lang)],
          recommendations: [
            tx("api.depression.seeSpecialist", lang),
            tx("api.depression.tellSomeone", lang),
          ],
          questionBreakdown: PHQ9_QUESTIONS_EN.map((q, i) => ({
            question: q,
            score: phq9_answers[i],
          })),
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

    const systemPrompt = `You are a depression screening assistant for Doctopal.
You analyze PHQ-9 scores and provide supportive, evidence-based guidance.

CRITICAL SAFETY RULES:
- NEVER diagnose depression — only screen and recommend professional evaluation
- PHQ-9 >= 10 ALWAYS requires professional referral
- PHQ-9 >= 15 = alertLevel "red" + immediate professional referral
- NEVER suggest stopping or changing medications
- Check if user medications may contribute to depressive symptoms (beta-blockers, corticosteroids, isotretinoin, etc.)
- Be warm, empathetic, non-judgmental, hopeful

Respond in ${tx("api.respondLang", lang)}.

Return ONLY valid JSON:
{
  "recommendations": [string, max 5],
  "lifestyleChanges": [string, max 4],
  "medicationNotes": string,
  "positiveActions": [string, max 3],
  "followUpSuggestion": string
}`;

    const prompt = `Analyze this PHQ-9 depression screening:

PHQ-9 SCORE: ${phq9Score}/27 (${severity})
QUESTION BREAKDOWN:
${PHQ9_QUESTIONS_EN.map((q, i) => `  Q${i + 1}: ${q} = ${phq9_answers[i]}/3`).join("\n")}

USER MEDICATIONS: ${medicationList}

Provide supportive recommendations based on the PHQ-9 score and severity level.
Note any medications that may contribute to mood changes.`;

    const resultText = await askGeminiJSON(prompt, systemPrompt);
    let analysis; try { analysis = JSON.parse(resultText); } catch { return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 }); }

    // Determine alert level
    let alertLevel = "green";
    let professionalReferral = false;

    if (phq9Score >= 20) {
      alertLevel = "red";
      professionalReferral = true;
    } else if (phq9Score >= 15) {
      alertLevel = "red";
      professionalReferral = true;
    } else if (phq9Score >= 10) {
      alertLevel = "yellow";
      professionalReferral = true;
    } else if (phq9Score >= 5) {
      alertLevel = "yellow";
    }

    return NextResponse.json({
      result: {
        phq9Score,
        severity,
        alertLevel,
        professionalReferral,
        crisisAlert: false,
        ...analysis,
        questionBreakdown: PHQ9_QUESTIONS_EN.map((q, i) => ({
          question: q,
          score: phq9_answers[i],
        })),
        crisisLines: [tx("api.depression.crisisLine1", lang), tx("api.depression.crisisLine2", lang)],
      },
    });
  } catch (err) {
    console.error("Depression screening error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
