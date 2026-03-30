// © 2026 Phytotherapy.ai — All Rights Reserved
import { NextRequest, NextResponse } from "next/server";
import { askGeminiJSON } from "@/lib/gemini";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/sanitize";
import { tx } from "@/lib/translations";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`goals:${clientIP}`, 10, 60_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Please wait ${rateCheck.resetInSeconds} seconds.` },
        { status: 429, headers: { "Retry-After": String(rateCheck.resetInSeconds) } }
      );
    }

    const body = await request.json();
    const goal = sanitizeInput(body.goal || "");
    const timeframe = sanitizeInput(body.timeframe || "3 months");
    const lang = (body.lang === "tr" ? "tr" : "en") as "en" | "tr";

    if (!goal || goal.length < 5) {
      return NextResponse.json(
        { error: tx("api.healthGoals.describeGoal", lang) },
        { status: 400 }
      );
    }

    // Fetch user profile
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
            .select("age, gender, weight_kg, height_cm, is_pregnant, kidney_disease, liver_disease, chronic_conditions, health_goals, supplements")
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
            if (profile.weight_kg) parts.push(`Weight: ${profile.weight_kg}kg`);
            if (profile.height_cm) parts.push(`Height: ${profile.height_cm}cm`);
            if (profile.is_pregnant) parts.push("Pregnant");
            if (profile.kidney_disease) parts.push("Kidney disease");
            if (profile.liver_disease) parts.push("Liver disease");
            if (profile.chronic_conditions?.length) parts.push(`Conditions: ${profile.chronic_conditions.join(", ")}`);
            if (profile.supplements?.length) parts.push(`Current supplements: ${profile.supplements.join(", ")}`);
            if (meds?.length) parts.push(`Medications: ${meds.map((m: { generic_name: string | null; brand_name: string | null }) => m.generic_name || m.brand_name).join(", ")}`);
            profileContext = parts.join(". ");
          }
        }
      } catch {
        // Continue without profile
      }
    }

    const systemPrompt = `You are a health goal coach at Phytotherapy.ai.
Create a personalized weekly action plan to achieve a health goal.

${profileContext ? `USER PROFILE: ${profileContext}` : "No profile available — give general advice."}

Respond in ${tx("api.respondLang", lang)} with this exact JSON:
{
  "goalTitle": "Clear, measurable version of the goal",
  "timeframe": "${timeframe}",
  "milestones": [
    { "week": 1, "target": "What to achieve by week 1", "metric": "How to measure" },
    { "week": 4, "target": "Month 1 milestone", "metric": "How to measure" },
    { "week": 8, "target": "Month 2 milestone", "metric": "How to measure" },
    { "week": 12, "target": "Month 3 milestone", "metric": "How to measure" }
  ],
  "weeklyPlan": {
    "nutrition": ["Daily nutrition action 1", "action 2"],
    "exercise": ["Exercise action 1", "action 2"],
    "supplements": [
      { "name": "Supplement name", "dosage": "Dosage", "reason": "Why", "safetyNote": "Any interaction warning" }
    ],
    "lifestyle": ["Sleep/stress action 1", "action 2"],
    "tracking": ["What to track daily"]
  },
  "warnings": ["Important safety warnings considering user's profile"],
  "motivationalNote": "Encouraging message about this goal"
}

RULES:
1. Be specific and actionable — no vague advice
2. Consider user's medications when recommending supplements
3. Consider chronic conditions and limitations
4. Milestones must be measurable
5. Include safety warnings for relevant conditions`;

    const result = await askGeminiJSON(
      `Health goal: "${goal}"\nTimeframe: ${timeframe}\nCreate a personalized weekly plan.`,
      systemPrompt
    );

    let parsed;
    try {
      parsed = typeof result === "string" ? JSON.parse(result) : result;
    } catch {
      return NextResponse.json(
        { error: tx("api.healthGoals.planFailed", lang) },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Health goals API error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
