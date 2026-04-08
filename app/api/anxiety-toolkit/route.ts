// © 2026 DoctoPal — All Rights Reserved
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { askGeminiJSON } from "@/lib/ai-client";
import { tx } from "@/lib/translations";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`anxiety:${clientIP}`, 5, 60_000);
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
      anxiety_level = 5,
      panic_attack = false,
      symptoms = [],
      avoidance_behaviors = [],
      gad7_answers = [],
    } = body;

    // CRITICAL: panic attack → immediate grounding, no AI needed
    if (panic_attack) {
      return NextResponse.json({
        result: {
          anxietyLevel: anxiety_level,
          panicProtocol: true,
          gad7Score: null,
          gad7Severity: null,
          techniques: [
            {
              name: tx("api.anxiety.grounding541", lang),
              steps: [
                tx("api.anxiety.groundingSee", lang),
                tx("api.anxiety.groundingTouch", lang),
                tx("api.anxiety.groundingHear", lang),
                tx("api.anxiety.groundingSmell", lang),
                tx("api.anxiety.groundingTaste", lang),
              ],
            },
            {
              name: tx("api.anxiety.boxBreathing", lang),
              steps: [
                tx("api.anxiety.breatheIn", lang),
                tx("api.anxiety.hold1", lang),
                tx("api.anxiety.breatheOut", lang),
                tx("api.anxiety.hold2", lang),
                tx("api.anxiety.repeat5", lang),
              ],
            },
          ],
          cognitiveDistortions: [],
          recommendations: [
            tx("api.anxiety.panicSafe", lang),
            tx("api.anxiety.panicGrounding", lang),
            tx("api.anxiety.panicRecur", lang),
          ],
          alertLevel: "yellow",
          professionalReferral: true,
          crisisLine: tx("api.anxiety.crisisLine", lang),
        },
      });
    }

    // Calculate GAD-7 score if answers provided
    let gad7Score: number | null = null;
    let gad7Severity: string | null = null;
    if (gad7_answers.length === 7) {
      const score = gad7_answers.reduce((sum: number, val: number) => sum + val, 0);
      gad7Score = score;
      if (score <= 4) gad7Severity = "minimal";
      else if (score <= 9) gad7Severity = "mild";
      else if (score <= 14) gad7Severity = "moderate";
      else gad7Severity = "severe";
    }

    // Fetch user medications
    const { data: medications } = await supabase
      .from("user_medications")
      .select("brand_name, generic_name, dosage")
      .eq("user_id", user.id);

    const medicationList = medications && medications.length > 0
      ? medications.map((m) => `${(m.generic_name || m.brand_name)}${m.generic_name ? ` (${m.generic_name})` : ""}`).join(", ")
      : "None reported";

    const systemPrompt = `You are an anxiety assessment assistant for Doctopal.
You provide evidence-based anxiety management guidance.

CRITICAL SAFETY RULES:
- NEVER prescribe medication
- NEVER suggest supplements during active panic
- Always recommend professional help for GAD-7 >= 10 (moderate+)
- You are NOT a therapist — provide psychoeducation and coping strategies
- Check medications for anxiety-related interactions (caffeine + stimulants, etc.)
- Be warm, supportive, validating

Respond in ${tx("api.respondLang", lang)}.

Return ONLY valid JSON:
{
  "anxietyLevel": <number 1-10>,
  "techniques": [{ "name": string, "steps": [string] }],
  "cognitiveDistortions": [{ "distortion": string, "description": string, "reframe": string }],
  "recommendations": [string, max 5],
  "medicationNotes": string,
  "alertLevel": "green" | "yellow" | "red",
  "professionalReferral": boolean,
  "breathingExercise": { "name": string, "pattern": string, "duration": string }
}`;

    const prompt = `Analyze this anxiety assessment:

ANXIETY LEVEL: ${anxiety_level}/10
PANIC ATTACK: ${panic_attack}
GAD-7 SCORE: ${gad7Score !== null ? `${gad7Score}/21 (${gad7Severity})` : "Not completed"}
SYMPTOMS: ${symptoms.length > 0 ? symptoms.join(", ") : "None selected"}
AVOIDANCE BEHAVIORS: ${avoidance_behaviors.length > 0 ? avoidance_behaviors.join(", ") : "None selected"}
USER MEDICATIONS: ${medicationList}

Provide a supportive anxiety assessment with coping techniques, cognitive distortion identification, and recommendations.
If GAD-7 >= 10 or anxiety_level >= 8, set professionalReferral to true and alertLevel to at least "yellow".
If GAD-7 >= 15 or anxiety_level >= 9, set alertLevel to "red".`;

    const resultText = await askGeminiJSON(prompt, systemPrompt);
    let analysis; try { analysis = JSON.parse(resultText); } catch { return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 }); }

    // Enforce safety overrides
    if (gad7Score !== null && gad7Score >= 15) {
      analysis.alertLevel = "red";
      analysis.professionalReferral = true;
    } else if (gad7Score !== null && gad7Score >= 10) {
      if (analysis.alertLevel === "green") analysis.alertLevel = "yellow";
      analysis.professionalReferral = true;
    }
    if (anxiety_level >= 9) {
      analysis.alertLevel = "red";
      analysis.professionalReferral = true;
    }

    return NextResponse.json({
      result: {
        ...analysis,
        panicProtocol: false,
        gad7Score,
        gad7Severity,
        crisisLine: tx("api.anxiety.crisisLine", lang),
      },
    });
  } catch (err) {
    console.error("Anxiety toolkit error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
