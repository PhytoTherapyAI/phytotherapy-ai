import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { askGeminiJSON } from "@/lib/gemini";
import { sanitizeInput } from "@/lib/sanitize";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`checkup:${clientIP}`, 5, 60_000);
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
    const age = parseInt(body.age) || 35;
    const gender = body.gender === "female" ? "female" : "male";
    const riskFactors = Array.isArray(body.risk_factors) ? body.risk_factors.map((f: string) => sanitizeInput(f)) : [];

    // Fetch user profile data
    const { data: medications } = await supabase
      .from("user_medications")
      .select("brand_name, generic_name")
      .eq("user_id", user.id);

    const medicationList = medications && medications.length > 0
      ? medications.map((m) => `${(m.generic_name || m.brand_name)}${m.generic_name ? ` (${m.generic_name})` : ""}`).join(", ")
      : "None reported";

    const systemPrompt = `You are a check-up planning assistant for Phytotherapy.ai.
You create personalized annual health check-up plans based on USPSTF and WHO guidelines.

RULES:
- Age and gender-appropriate screenings
- Consider risk factors for enhanced screening
- Include specialist referrals when appropriate
- Group tests by priority: essential, recommended, optional
- Practical scheduling advice
- Never diagnose

Respond in ${lang === "tr" ? "Turkish" : "English"}.

Return ONLY valid JSON:
{
  "annualPlan": [{ "test": string, "specialist": string, "frequency": string, "priority": "essential" | "recommended" | "optional", "reason": string, "preparation": string }],
  "bloodWorkPanel": [{ "test": string, "reason": string, "fasting": boolean }],
  "specialistVisits": [{ "specialist": string, "frequency": string, "reason": string }],
  "vaccinations": [{ "vaccine": string, "dueDate": string, "notes": string }],
  "schedulingSuggestion": string,
  "costSavingTips": [string]
}`;

    const prompt = `Create a personalized annual check-up plan:

AGE: ${age}
GENDER: ${gender}
RISK FACTORS: ${riskFactors.length > 0 ? riskFactors.join(", ") : "None reported"}
CURRENT MEDICATIONS: ${medicationList}

Generate comprehensive check-up plan with:
1. Annual test schedule (which tests, how often, which doctor)
2. Blood work panel recommendations
3. Specialist visit schedule
4. Vaccination due dates
5. Scheduling suggestions (how to combine visits)
6. Cost-saving tips`;

    const resultText = await askGeminiJSON(prompt, systemPrompt);
    const analysis = JSON.parse(resultText);

    return NextResponse.json({ result: analysis });
  } catch (err) {
    console.error("Checkup planner error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
