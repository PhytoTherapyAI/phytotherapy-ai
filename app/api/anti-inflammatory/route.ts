// © 2026 DoctoPal — All Rights Reserved
import { NextRequest, NextResponse } from "next/server";
import { askGeminiJSON } from "@/lib/ai-client";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/sanitize";
import { tx } from "@/lib/translations";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`antiinflam:${clientIP}`, 10, 60_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Please wait ${rateCheck.resetInSeconds} seconds.` },
        { status: 429, headers: { "Retry-After": String(rateCheck.resetInSeconds) } }
      );
    }

    const body = await request.json();
    const diet = sanitizeInput(body.diet || "");
    const crp = body.crp || null;
    const lang = (body.lang === "tr" ? "tr" : "en") as "en" | "tr";

    if (!diet || diet.length < 10) {
      return NextResponse.json(
        { error: tx("api.antiInflam.describeDiet", lang) },
        { status: 400 }
      );
    }

    const prompt = `You are an anti-inflammatory nutrition expert. Analyze this diet for inflammatory potential.

Diet description: ${diet}
CRP level: ${crp ? crp + " mg/L" : "Not provided"}
Language: ${tx("api.respondLang", lang)}

Return JSON:

{
  "inflammationScore": 1-10 (1=highly anti-inflammatory, 10=highly inflammatory),
  "scoreLabel": "label",
  "omega6to3Ratio": "estimated ratio like 15:1",
  "optimalRatio": "2:1 to 4:1",
  "inflammatoryFoods": [
    { "food": "name", "reason": "why inflammatory", "alternative": "healthier swap" }
  ],
  "antiInflammatoryFoods": ["foods already in diet that are good"],
  "recommendations": [
    { "action": "what to do", "impact": "high/medium/low", "explanation": "why" }
  ],
  "spicesAndHerbs": [
    { "name": "turmeric etc", "benefit": "what it does", "dose": "recommended amount" }
  ],
  "crpAnalysis": "analysis of CRP level if provided, or null",
  "weeklyPlan": "brief 3-day sample anti-inflammatory meal suggestion"
}`;

    const result = await askGeminiJSON(
      `Analyze this diet for inflammatory potential: "${diet}". CRP: ${crp || "not provided"}. Respond in ${tx("api.respondLang", lang)}.`,
      prompt
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("Anti-inflammatory error:", error);
    return NextResponse.json({ error: "Failed to analyze diet" }, { status: 500 });
  }
}
