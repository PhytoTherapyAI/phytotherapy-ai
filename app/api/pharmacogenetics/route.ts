// © 2026 Phytotherapy.ai — All Rights Reserved
import { NextRequest, NextResponse } from "next/server";
import { askGeminiJSON } from "@/lib/ai-client";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { tx } from "@/lib/translations";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`pharmacogenetics:${clientIP}`, 10, 60_000);
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

    // Fetch user medications
    const { data: medications } = await supabase
      .from("user_medications")
      .select("brand_name, generic_name, dosage, frequency")
      .eq("user_id", user.id);

    if (!medications || medications.length === 0) {
      return NextResponse.json(
        { error: tx("api.pharmacogenetics.noMeds", lang) },
        { status: 400 }
      );
    }

    const medicationList = medications
      .map((m) => `${(m.generic_name || m.brand_name)}${m.generic_name ? ` (${m.generic_name})` : ""} — ${m.dosage || "dose not specified"}, ${m.frequency || "frequency not specified"}`)
      .join("\n");

    // Fetch profile for context
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("age, gender, chronic_conditions")
      .eq("id", user.id)
      .single();

    const profileInfo = profile
      ? `Age: ${profile.age || "unknown"}, Gender: ${profile.gender || "unknown"}, Chronic conditions: ${profile.chronic_conditions?.join(", ") || "none"}`
      : "No profile data";

    const systemPrompt = `You are a pharmacogenetics specialist for Phytotherapy.ai. Explain how genetic variations affect drug metabolism in simple, patient-friendly language.

RULES:
- Focus on CYP450 enzymes: CYP2D6, CYP2C19, CYP3A4, CYP2C9, CYP1A2
- Explain why the same dose works differently for different people
- Identify which of the user's medications are affected by genetic polymorphisms
- Recommend pharmacogenetic testing only when clinically relevant
- Use plain language — explain enzymes like "your body's drug processing factory"
- Use PubMed-backed evidence
- Respond in ${tx("api.respondLang", lang)}
- Never say the user IS a poor/rapid metabolizer — say they MIGHT be

OUTPUT FORMAT (strict JSON):
{
  "summary": "<string: 2-3 sentence overview of pharmacogenetics relevance to this medication list>",
  "affectedMedications": [
    {
      "medication": "<drug name>",
      "enzyme": "<CYP enzyme>",
      "impact": "<high | moderate | low>",
      "explanation": "<how genetics might affect this drug's effectiveness/side effects>",
      "signs": [<string: signs that genetics might be affecting this drug, max 3>]
    }
  ],
  "geneticFactors": [
    {
      "enzyme": "<CYP enzyme name>",
      "simpleExplanation": "<what this enzyme does in plain language>",
      "commonVariations": "<ultra-rapid, extensive, intermediate, poor metabolizer explained simply>",
      "drugsAffected": [<string: which of user's drugs this enzyme processes>],
      "prevalence": "<how common variations are>"
    }
  ],
  "testingRecommendation": {
    "recommended": <boolean>,
    "urgency": "<recommended | optional | not_needed>",
    "reason": "<why testing is or isn't recommended>",
    "testName": "<e.g. Pharmacogenomic Panel, CYP2D6 genotyping>",
    "whatToExpect": "<what the test involves>"
  },
  "personalizedNotes": [<string: personalized insights based on medication combination, max 4>],
  "sources": [{"title": "<string>", "url": "<PubMed URL>"}]
}`;

    const prompt = `Analyze these medications for pharmacogenetic relevance:

USER MEDICATIONS:
${medicationList}

USER PROFILE: ${profileInfo}

Provide a comprehensive pharmacogenetics guide as JSON.`;

    const result = await askGeminiJSON(prompt, systemPrompt);
    const analysis = JSON.parse(result);

    // Save to query history
    try {
      await supabase.from("query_history").insert({
        user_id: user.id,
        query_text: `Pharmacogenetics analysis: ${medications.map((m) => (m.generic_name || m.brand_name)).join(", ")}`,
        response_text: `${(analysis.affectedMedications || []).length} medications affected, Testing: ${analysis.testingRecommendation?.urgency || "unknown"}`,
        query_type: "general",
      });
    } catch {
      // Non-critical
    }

    return NextResponse.json({ analysis });
  } catch (err) {
    console.error("Pharmacogenetics analysis error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
