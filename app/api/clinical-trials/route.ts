// © 2026 Phytotherapy.ai — All Rights Reserved
import { NextRequest, NextResponse } from "next/server";
import { askGeminiJSON } from "@/lib/ai-client";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/sanitize";
import { tx } from "@/lib/translations";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`trials:${clientIP}`, 10, 60_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Please wait ${rateCheck.resetInSeconds} seconds.` },
        { status: 429, headers: { "Retry-After": String(rateCheck.resetInSeconds) } }
      );
    }

    const body = await request.json();
    const condition = sanitizeInput(body.condition || "");
    const location = sanitizeInput(body.location || "");
    const lang = (body.lang === "tr" ? "tr" : "en") as "en" | "tr";

    if (!condition || condition.length < 2) {
      return NextResponse.json(
        { error: tx("api.clinicalTrials.enterCondition", lang) },
        { status: 400 }
      );
    }

    const prompt = `You are a clinical trials information specialist. The user is searching for clinical trials.

Condition: ${condition}
Location: ${location || "Any"}
Language: ${tx("api.respondLang", lang)}

Based on your knowledge of ClinicalTrials.gov and ongoing research, provide relevant clinical trial information. Return JSON:

{
  "trials": [
    {
      "title": "Trial title",
      "phase": "Phase I/II/III/IV",
      "status": "Recruiting/Active/Completed",
      "sponsor": "Organization name",
      "summary": "Brief description (2-3 sentences)",
      "eligibility": "Key eligibility criteria",
      "estimatedCompletion": "Estimated date",
      "clinicalTrialsGovId": "NCT number if known, otherwise null"
    }
  ],
  "searchTips": "Tips for finding more trials on ClinicalTrials.gov",
  "relatedConditions": ["Related conditions to also search for"]
}

Provide 3-5 relevant trials. Be informative but note these are AI-generated summaries, not live data.`;

    const result = await askGeminiJSON(
      `Search for clinical trials for: ${condition}, location: ${location || "Any"}. Respond in ${tx("api.respondLang", lang)}.`,
      prompt
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Clinical trials error:", error);
    return NextResponse.json(
      { error: "Failed to search clinical trials" },
      { status: 500 }
    );
  }
}
