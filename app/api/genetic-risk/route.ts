// © 2026 Phytotherapy.ai — All Rights Reserved
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { askGeminiJSON } from "@/lib/ai-client";
import { sanitizeInput } from "@/lib/sanitize";
import { tx } from "@/lib/translations";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`genetic:${clientIP}`, 5, 60_000);
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
    const familyHistory = Array.isArray(body.family_history)
      ? body.family_history.map((f: string) => sanitizeInput(f))
      : [];
    const personalFactors = Array.isArray(body.personal_factors)
      ? body.personal_factors.map((f: string) => sanitizeInput(f))
      : [];
    const age = parseInt(body.age) || 35;
    const gender = body.gender === "female" ? "female" : "male";

    const systemPrompt = `You are a genetic risk assessment assistant for Phytotherapy.ai.
You estimate disease risk scores based on family history and personal factors.

CRITICAL RULES:
- These are RISK ESTIMATES, not diagnoses
- Base on published epidemiological data (relative risk, odds ratios)
- Always clarify that genetic testing is needed for definitive risk assessment
- Include both risk scores and actionable reduction strategies
- Be empathetic — genetic risk can cause anxiety
- Risk score 1.0 = average population risk
- Never state absolute risk — only relative to population average

Respond in ${tx("api.respondLang", lang)}.

Return ONLY valid JSON:
{
  "riskScores": [{ "disease": string, "riskScore": number, "populationRisk": string, "yourEstimatedRisk": string, "confidence": "low" | "moderate" | "high", "keyFactors": [string], "reductionStrategies": [{ "strategy": string, "potentialReduction": string }] }],
  "overallProfile": string,
  "highPriorityActions": [string],
  "geneticTestsRecommended": [{ "test": string, "reason": string, "urgency": "routine" | "recommended" | "important" }],
  "disclaimer": string
}`;

    const prompt = `Estimate genetic disease risk scores:

AGE: ${age}
GENDER: ${gender}
FAMILY HISTORY: ${familyHistory.length > 0 ? familyHistory.join(", ") : "None reported"}
PERSONAL FACTORS: ${personalFactors.length > 0 ? personalFactors.join(", ") : "None reported"}

Generate risk scores for major diseases:
1. Type 2 Diabetes
2. Cardiovascular disease
3. Cancer (breast/colon/lung based on gender and history)
4. Alzheimer's / Dementia
5. Stroke
6. Osteoporosis
7. Autoimmune disorders (if family history present)

Include:
- Risk score relative to population (1.0 = average)
- Confidence level based on available data
- Specific reduction strategies for each high-risk area
- Recommended genetic tests`;

    const resultText = await askGeminiJSON(prompt, systemPrompt);
    const analysis = JSON.parse(resultText);

    return NextResponse.json({ result: analysis });
  } catch (err) {
    console.error("Genetic risk error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
