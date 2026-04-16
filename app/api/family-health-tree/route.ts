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
    const rateCheck = checkRateLimit(`familytree:${clientIP}`, 5, 60_000);
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
    const familyMembers = Array.isArray(body.family_members) ? body.family_members.map((m: { relation: string; conditions: string[] }) => ({
      relation: sanitizeInput(m.relation || ""),
      conditions: Array.isArray(m.conditions) ? m.conditions.map((c: string) => sanitizeInput(c)) : [],
    })) : [];

    if (familyMembers.length === 0) {
      return NextResponse.json({ error: "At least one family member is required" }, { status: 400 });
    }

    const systemPrompt = `You are a hereditary risk analysis assistant for DoctoPal.
You analyze family health history to identify genetic risk patterns.

RULES:
- Base on established genetic epidemiology (BRCA, Lynch syndrome, familial hypercholesterolemia, etc.)
- Multiple affected relatives = higher risk multiplier
- First-degree relatives (parent, sibling) carry more weight than second-degree
- NEVER diagnose — identify risk patterns and recommend genetic counseling
- Include actionable screening recommendations
- Be empathetic — family health history can be emotional

Respond in ${tx("api.respondLang", lang)}.

Return ONLY valid JSON:
{
  "overallRiskAssessment": string,
  "hereditaryPatterns": [{ "condition": string, "affectedRelatives": [string], "inheritancePattern": string, "yourRiskMultiplier": string, "geneticTestRecommended": boolean, "specificTest": string }],
  "screeningRecommendations": [{ "condition": string, "startAge": string, "frequency": string, "test": string, "reason": string }],
  "geneticCounselingAdvice": string,
  "protectiveFactors": [{ "factor": string, "benefit": string }],
  "keyInsights": [string]
}`;

    const familySummary = familyMembers.map((m: { relation: string; conditions: string[] }) =>
      `${m.relation}: ${m.conditions.join(", ")}`
    ).join("\n");

    const prompt = `Analyze this family health history for hereditary risk patterns:

FAMILY MEMBERS:
${familySummary}

Identify:
1. Hereditary disease patterns (e.g., BRCA if mother+aunt have breast cancer)
2. Risk multipliers compared to general population
3. Specific genetic tests that should be considered
4. Modified screening recommendations based on family history
5. Protective lifestyle factors`;

    const resultText = await askClaudeJSON(prompt, systemPrompt, { userId: user.id });
    let analysis; try { analysis = JSON.parse(resultText); } catch { return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 }); }

    return NextResponse.json({ result: analysis });
  } catch (err) {
    console.error("Family health tree error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
