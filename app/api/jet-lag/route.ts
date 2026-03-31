// © 2026 Phytotherapy.ai — All Rights Reserved
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { askGeminiJSON } from "@/lib/ai-client";
import { sanitizeInput } from "@/lib/sanitize";
import { tx } from "@/lib/translations";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`jetlag:${clientIP}`, 5, 60_000);
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
    const originTimezone = sanitizeInput(body.origin_timezone || "UTC");
    const destinationTimezone = sanitizeInput(body.destination_timezone || "UTC");
    const travelDate = sanitizeInput(body.travel_date || new Date().toISOString().split("T")[0]);

    // Fetch user medications for timing adjustments
    const { data: medications } = await supabase
      .from("user_medications")
      .select("brand_name, generic_name, dosage")
      .eq("user_id", user.id);

    const medicationList = medications && medications.length > 0
      ? medications.map((m) => `${(m.generic_name || m.brand_name)}${m.generic_name ? ` (${m.generic_name})` : ""}${m.dosage ? ` ${m.dosage}` : ""}`).join(", ")
      : "None reported";

    const systemPrompt = `You are a jet lag optimization assistant for Phytotherapy.ai.
You create evidence-based timezone adjustment plans.

RULES:
- Base melatonin timing on published chronobiology research
- Consider medication timing adjustments (insulin, thyroid meds, contraceptives are time-critical)
- Light exposure recommendations based on circadian science
- Meal timing based on chrono-nutrition research
- Be practical and specific with hours
- Never prescribe — recommend and suggest consulting doctor

Respond in ${tx("api.respondLang", lang)}.

Return ONLY valid JSON:
{
  "timeDifference": number,
  "direction": "east" | "west",
  "adjustmentDays": number,
  "melatoninPlan": { "preTravelDays": number, "timing": string, "dose": string, "notes": string },
  "lightExposureSchedule": [{ "day": string, "seekLight": string, "avoidLight": string }],
  "mealTimingPlan": [{ "day": string, "breakfast": string, "lunch": string, "dinner": string }],
  "medicationAdjustments": [{ "medication": string, "currentTiming": string, "newTiming": string, "transitionMethod": string, "warning": string }],
  "hourByHourPlan": [{ "time": string, "action": string, "reason": string }],
  "generalTips": [string]
}`;

    const prompt = `Create a jet lag optimization plan:

ORIGIN TIMEZONE: ${originTimezone}
DESTINATION TIMEZONE: ${destinationTimezone}
TRAVEL DATE: ${travelDate}
USER MEDICATIONS: ${medicationList}

Generate:
1. Melatonin timing plan (pre-travel and during)
2. Light exposure schedule (when to seek and avoid light)
3. Meal timing adjustments
4. Medication timing transitions (especially insulin, thyroid, birth control)
5. Hour-by-hour plan for first 2-3 days at destination
6. General tips for faster adjustment`;

    const resultText = await askGeminiJSON(prompt, systemPrompt);
    const analysis = JSON.parse(resultText);

    return NextResponse.json({ result: analysis });
  } catch (err) {
    console.error("Jet lag error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
