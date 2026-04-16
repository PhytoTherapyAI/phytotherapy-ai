// © 2026 DoctoPal — All Rights Reserved
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { askClaudeJSON } from "@/lib/ai-client";
import { sanitizeInput } from "@/lib/sanitize";
import { tx } from "@/lib/translations";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`cancer:${clientIP}`, 5, 60_000);
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
    const age = parseInt(body.age) || 40;
    const gender = body.gender === "female" ? "female" : "male";
    const smokingHistory = body.smoking_history || "never";
    const familyHistory = Array.isArray(body.family_history) ? body.family_history.map((f: string) => sanitizeInput(f)) : [];

    const systemPrompt = `You are a cancer screening advisor for DoctoPal.
You create evidence-based, personalized screening schedules based on USPSTF, ACS, and NCCN guidelines.

CRITICAL RULES:
- NEVER diagnose cancer or interpret symptoms as cancer
- Always state that screening guidelines are recommendations, not diagnoses
- Emphasize that family history may warrant earlier/more frequent screening
- Include both standard and enhanced screening based on risk factors
- Skin ABCDE rule for melanoma self-checks
- Reference specific guideline organizations

Respond in ${tx("api.respondLang", lang)}.

Return ONLY valid JSON:
{
  "riskLevel": "standard" | "elevated" | "high",
  "screeningSchedule": [{ "cancer": string, "test": string, "startAge": number, "frequency": string, "applicability": string, "priority": "routine" | "important" | "critical", "notes": string }],
  "familyRiskAnalysis": [{ "cancer": string, "relativeRisk": string, "recommendation": string }],
  "selfCheckReminders": [{ "check": string, "frequency": string, "howTo": string }],
  "lifestyleReductions": [{ "factor": string, "riskReduction": string, "recommendation": string }],
  "nextSteps": [string]
}`;

    const prompt = `Create a personalized cancer screening schedule:

AGE: ${age}
GENDER: ${gender}
SMOKING HISTORY: ${smokingHistory}
FAMILY CANCER HISTORY: ${familyHistory.length > 0 ? familyHistory.join(", ") : "None reported"}

Generate:
1. Personalized screening schedule (mammography, colonoscopy, PAP, PSA, lung CT, skin checks, etc.)
2. Family history risk analysis
3. Self-check reminders (ABCDE for skin, breast self-exam, testicular exam)
4. Lifestyle risk reduction strategies
5. Recommended next steps`;

    const resultText = await askClaudeJSON(prompt, systemPrompt, { userId: user.id });
    let analysis; try { analysis = JSON.parse(resultText); } catch { return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 }); }

    return NextResponse.json({ result: analysis });
  } catch (err) {
    console.error("Cancer screening error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
