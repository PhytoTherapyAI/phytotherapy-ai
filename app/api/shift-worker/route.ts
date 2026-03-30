import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { askGeminiJSON } from "@/lib/gemini";
import { sanitizeInput } from "@/lib/sanitize";
import { tx } from "@/lib/translations";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`shift:${clientIP}`, 5, 60_000);
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
    const shiftPattern = sanitizeInput(body.shift_pattern || "night");
    const shiftHours = sanitizeInput(body.shift_hours || "22:00-06:00");

    const { data: medications } = await supabase
      .from("user_medications")
      .select("brand_name, generic_name, dosage")
      .eq("user_id", user.id);

    const medicationList = medications && medications.length > 0
      ? medications.map((m) => `${(m.generic_name || m.brand_name)}${m.generic_name ? ` (${m.generic_name})` : ""}`).join(", ")
      : "None reported";

    const systemPrompt = `You are a shift work health coach for Phytotherapy.ai.
You create evidence-based circadian rhythm management plans for shift workers.

RULES:
- Base on circadian science and occupational health guidelines
- Consider medication timing (time-sensitive meds: insulin, thyroid, blood pressure)
- Melatonin timing based on shift schedule
- Caffeine cutoff strategy
- Practical, actionable advice
- Be supportive — shift work is hard

Respond in ${tx("api.respondLang", lang)}.

Return ONLY valid JSON:
{
  "circadianPlan": { "sleepWindow": string, "darkPeriod": string, "lightExposure": string, "notes": string },
  "sleepSchedule": { "mainSleep": string, "napWindow": string, "tips": [string] },
  "mealTiming": [{ "meal": string, "timing": string, "recommendation": string }],
  "caffeinePlan": { "lastCaffeine": string, "maxDaily": string, "strategy": string },
  "supplementSuggestions": [{ "name": string, "timing": string, "dose": string, "reason": string, "safety": "green" | "yellow" }],
  "medicationTiming": [{ "medication": string, "adjustedTiming": string, "notes": string }],
  "exerciseRecommendations": { "bestTime": string, "avoid": string, "types": [string] },
  "warningSignsOfBurnout": [string],
  "generalTips": [string]
}`;

    const prompt = `Create a circadian management plan for a shift worker:

SHIFT PATTERN: ${shiftPattern}
SHIFT HOURS: ${shiftHours}
USER MEDICATIONS: ${medicationList}

Generate comprehensive plan covering:
1. Circadian rhythm management (light/dark manipulation)
2. Optimal sleep schedule including nap strategy
3. Meal timing to minimize metabolic disruption
4. Caffeine strategy (when to use, when to stop)
5. Supplement suggestions (melatonin timing, vitamin D, etc.)
6. Medication timing adjustments
7. Exercise recommendations
8. Burnout warning signs`;

    const resultText = await askGeminiJSON(prompt, systemPrompt);
    const analysis = JSON.parse(resultText);

    return NextResponse.json({ result: analysis });
  } catch (err) {
    console.error("Shift worker error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
