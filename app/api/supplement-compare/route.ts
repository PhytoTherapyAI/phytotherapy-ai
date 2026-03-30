// © 2026 Phytotherapy.ai — All Rights Reserved
import { NextRequest, NextResponse } from "next/server";
import { askGeminiJSON } from "@/lib/gemini";
import { searchPubMed } from "@/lib/pubmed";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/sanitize";
import { tx } from "@/lib/translations";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`supcompare:${clientIP}`, 10, 60_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Please wait ${rateCheck.resetInSeconds} seconds.` },
        { status: 429, headers: { "Retry-After": String(rateCheck.resetInSeconds) } }
      );
    }

    const body = await request.json();
    const supplement1 = sanitizeInput(body.supplement1 || "");
    const supplement2 = sanitizeInput(body.supplement2 || "");
    const lang = (body.lang === "tr" ? "tr" : "en") as "en" | "tr";

    if (!supplement1 || !supplement2) {
      return NextResponse.json(
        { error: tx("api.supplementCompare.selectTwo", lang) },
        { status: 400 }
      );
    }

    // Get user profile for personalization
    let profileContext = "";
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const supabase = createServerClient();
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user) {
          const { data: profile } = await supabase
            .from("user_profiles")
            .select("age, gender, is_pregnant, kidney_disease, liver_disease, health_goals")
            .eq("id", user.id)
            .single();

          const { data: meds } = await supabase
            .from("user_medications")
            .select("generic_name, brand_name")
            .eq("user_id", user.id)
            .eq("is_active", true);

          if (profile) {
            const parts: string[] = [];
            if (profile.age) parts.push(`Age: ${profile.age}`);
            if (profile.gender) parts.push(`Gender: ${profile.gender}`);
            if (profile.is_pregnant) parts.push("Pregnant");
            if (profile.kidney_disease) parts.push("Kidney disease");
            if (profile.liver_disease) parts.push("Liver disease");
            if (profile.health_goals?.length) parts.push(`Goals: ${profile.health_goals.join(", ")}`);
            if (meds?.length) parts.push(`Medications: ${meds.map((m: { generic_name: string | null; brand_name: string | null }) => m.generic_name || m.brand_name).join(", ")}`);
            profileContext = parts.join(". ");
          }
        }
      } catch {
        // Continue without profile
      }
    }

    // PubMed search
    let pubmedContext = "";
    try {
      const articles = await searchPubMed(`${supplement1} vs ${supplement2} comparison efficacy`, 4);
      if (articles.length > 0) {
        pubmedContext = articles
          .map((a: { title: string; abstract?: string }) => `- ${a.title}: ${(a.abstract || "").slice(0, 200)}`)
          .join("\n");
      }
    } catch {
      // Continue
    }

    const systemPrompt = `You are a supplement comparison expert at Phytotherapy.ai.
Compare two supplements side by side with evidence-based analysis.

${profileContext ? `USER PROFILE: ${profileContext}` : ""}
${pubmedContext ? `RESEARCH:\n${pubmedContext}` : ""}

Respond in ${tx("api.respondLang", lang)} with this exact JSON:
{
  "supplement1": {
    "name": "${supplement1}",
    "evidenceGrade": "A" | "B" | "C",
    "primaryBenefits": ["benefit 1", "benefit 2"],
    "dosage": "Recommended dosage",
    "absorption": "Absorption characteristics",
    "sideEffects": ["side effect 1"],
    "cost": "Relative cost (low/medium/high)",
    "bestFor": "Who benefits most"
  },
  "supplement2": {
    "name": "${supplement2}",
    "evidenceGrade": "A" | "B" | "C",
    "primaryBenefits": ["benefit 1", "benefit 2"],
    "dosage": "Recommended dosage",
    "absorption": "Absorption characteristics",
    "sideEffects": ["side effect 1"],
    "cost": "Relative cost (low/medium/high)",
    "bestFor": "Who benefits most"
  },
  "comparison": {
    "winner": "name of better option or 'tie'",
    "winnerReason": "Why this one is better for this user",
    "keyDifferences": ["difference 1", "difference 2"],
    "canCombine": true | false,
    "combineNotes": "Notes on combining if applicable"
  },
  "personalRecommendation": "Personalized recommendation based on user profile, or general advice if no profile",
  "sources": [{ "title": "Source", "url": "https://pubmed.ncbi.nlm.nih.gov/..." }]
}

RULES:
1. Evidence grades: A = strong RCTs, B = limited evidence, C = traditional use only
2. Be honest about lack of evidence
3. Consider user's medications for interaction risks
4. Cost is relative (low/medium/high)`;

    const result = await askGeminiJSON(
      `Compare these supplements: "${supplement1}" vs "${supplement2}"`,
      systemPrompt
    );

    let parsed;
    try {
      parsed = typeof result === "string" ? JSON.parse(result) : result;
    } catch {
      return NextResponse.json(
        { error: tx("api.supplementCompare.failed", lang) },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Supplement compare API error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
