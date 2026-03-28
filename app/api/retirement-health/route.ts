import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { askGeminiJSON } from "@/lib/gemini";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`retirement:${clientIP}`, 5, 60_000);
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
    const age = parseInt(body.age) || 60;
    const gender = body.gender === "female" ? "female" : "male";

    // Fetch user medications for context
    const { data: medications } = await supabase
      .from("user_medications")
      .select("medication_name, active_ingredient")
      .eq("user_id", user.id);

    const medicationList = medications && medications.length > 0
      ? medications.map((m) => `${m.medication_name}${m.active_ingredient ? ` (${m.active_ingredient})` : ""}`).join(", ")
      : "None reported";

    const systemPrompt = `You are a retirement health planning assistant for Phytotherapy.ai.
You create evidence-based health plans for adults 55+.

RULES:
- Base recommendations on current medical guidelines (USPSTF, WHO)
- Consider age, gender, and medications
- Include cognitive health activities based on latest research
- Be warm, supportive, and encouraging
- Never diagnose — recommend screenings and doctor visits

Respond in ${lang === "tr" ? "Turkish" : "English"}.

Return ONLY valid JSON:
{
  "checkupPlan": [{ "test": string, "frequency": string, "urgency": "routine" | "important" | "critical", "notes": string }],
  "cognitiveBaseline": { "activities": [{ "name": string, "frequency": string, "benefit": string }], "warningSignsToWatch": [string] },
  "boneDensity": { "recommendation": string, "frequency": string, "riskFactors": [string] },
  "socialActivityPlan": [{ "activity": string, "frequency": string, "benefit": string }],
  "exerciseRecommendations": [{ "type": string, "frequency": string, "duration": string, "notes": string }],
  "medicationNotes": string
}`;

    const prompt = `Create a personalized retirement health plan for:
AGE: ${age}
GENDER: ${gender}
CURRENT MEDICATIONS: ${medicationList}

Include:
1. Age-appropriate screening/check-up plan
2. Cognitive baseline activities and warning signs
3. Bone density assessment recommendations
4. Social activity plan for mental wellbeing
5. Exercise recommendations safe for this age group
6. Any medication-related notes for this age group`;

    const resultText = await askGeminiJSON(prompt, systemPrompt);
    const analysis = JSON.parse(resultText);

    return NextResponse.json({ result: analysis });
  } catch (err) {
    console.error("Retirement health error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
