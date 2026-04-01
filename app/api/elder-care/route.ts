// © 2026 Doctopal — All Rights Reserved
import { NextRequest, NextResponse } from "next/server";
import { askGeminiJSON } from "@/lib/ai-client";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { tx } from "@/lib/translations";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`elder:${clientIP}`, 10, 60_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Please wait ${rateCheck.resetInSeconds} seconds.` },
        { status: 429, headers: { "Retry-After": String(rateCheck.resetInSeconds) } }
      );
    }

    const body = await request.json();
    const lang = (body.lang === "tr" ? "tr" : "en") as "en" | "tr";

    // Fetch user profile — required for personalized elder care
    let profileContext = "";
    let userAge = 0;
    let medCount = 0;
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const supabase = createServerClient();
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user) {
          const { data: profile } = await supabase
            .from("user_profiles")
            .select("age, gender, is_pregnant, is_breastfeeding, kidney_disease, liver_disease, chronic_conditions")
            .eq("id", user.id)
            .single();

          const { data: meds } = await supabase
            .from("user_medications")
            .select("brand_name, generic_name")
            .eq("user_id", user.id)
            .eq("is_active", true);

          const { data: allergies } = await supabase
            .from("user_allergies")
            .select("allergen")
            .eq("user_id", user.id);

          if (profile) {
            userAge = profile.age || 0;
            medCount = meds?.length || 0;
            const parts: string[] = [];
            if (profile.age) parts.push(`Age: ${profile.age}`);
            if (profile.gender) parts.push(`Gender: ${profile.gender}`);
            if (profile.kidney_disease) parts.push("Kidney disease");
            if (profile.liver_disease) parts.push("Liver disease");
            if (profile.chronic_conditions?.length) parts.push(`Conditions: ${profile.chronic_conditions.join(", ")}`);
            if (meds?.length) parts.push(`Medications (${meds.length} total): ${meds.map((m: { brand_name: string | null; generic_name: string | null }) => m.generic_name || m.brand_name).join(", ")}`);
            if (allergies?.length) parts.push(`Allergies: ${allergies.map((a: { allergen: string }) => a.allergen).join(", ")}`);
            profileContext = parts.join(". ");
          }

          // Save to query history
          await supabase.from("query_history").insert({
            user_id: user.id,
            query_text: "Elder Care Dashboard Review",
            query_type: "elder_care" as const,
          });
        }
      } catch {
        // Continue as guest
      }
    }

    const systemPrompt = `You are Doctopal's elder care health advisor, specialized in geriatric health guidance for adults 65+.

RULES:
1. Focus on evidence-based geriatric health guidance
2. Consider polypharmacy risks when 5+ medications are present
3. Provide practical, actionable fall prevention advice
4. Include cognitive health maintenance activities
5. Focus on senior-specific nutrition (protein, calcium, vitamin D, B12)
6. Suggest medication timing optimization if multiple medications exist
7. Address social isolation and mental wellbeing
8. Respond in ${tx("api.respondLang", lang)}
9. Never diagnose or prescribe — only guide and recommend consulting a geriatric specialist

${profileContext ? `USER PROFILE: ${profileContext}` : "No user profile available — provide general elder care advice."}

Respond in this exact JSON format:
{
  "polypharmacy": {
    "riskLevel": "low" | "moderate" | "high",
    "medicationCount": number,
    "concerns": ["potential interaction or risk 1", "concern 2"],
    "recommendations": ["recommendation 1", "recommendation 2"],
    "timingOptimization": ["take X in morning", "take Y with food"]
  },
  "fallPrevention": {
    "riskLevel": "low" | "moderate" | "high",
    "checklist": [
      { "item": "Safety measure", "description": "Why and how", "priority": "high" | "medium" | "low" }
    ]
  },
  "cognitiveHealth": {
    "activities": [
      { "activity": "Activity name", "frequency": "How often", "benefit": "Why it helps" }
    ],
    "warningSignsToWatch": ["sign 1", "sign 2"]
  },
  "nutrition": {
    "keyNutrients": [
      { "nutrient": "Name", "dailyGoal": "Amount", "sources": "Food sources", "note": "Important consideration" }
    ],
    "mealTips": ["tip 1", "tip 2"],
    "hydrationGoal": "Daily water goal"
  },
  "socialWellbeing": {
    "riskFactors": ["factor 1", "factor 2"],
    "suggestions": ["suggestion 1", "suggestion 2"],
    "resources": ["resource 1", "resource 2"]
  },
  "exercise": {
    "recommendations": [
      { "type": "Exercise type", "frequency": "How often", "duration": "How long", "safetyNote": "Precaution" }
    ]
  },
  "summary": "2-3 sentence personalized health summary for the elderly user"
}

IMPORTANT:
- polypharmacy.riskLevel: "low" if 0-3 meds, "moderate" if 4-5, "high" if 6+
- Always include at least 5 fall prevention checklist items
- Include at least 4 key nutrients for seniors
- Be warm, respectful, and encouraging in tone`;

    const result = await askGeminiJSON(
      `Generate a comprehensive elder care health review.${userAge > 0 ? ` The user is ${userAge} years old.` : ""} They take ${medCount} medication(s). Provide personalized geriatric health guidance.`,
      systemPrompt
    );

    let parsed;
    try {
      parsed = typeof result === "string" ? JSON.parse(result) : result;
    } catch {
      return NextResponse.json(
        { error: tx("api.elderCare.analysisFailed", lang) },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Elder care API error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
