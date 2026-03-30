// © 2026 Phytotherapy.ai — All Rights Reserved
import { NextRequest, NextResponse } from "next/server";
import { askGeminiJSON } from "@/lib/gemini";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/sanitize";
import { tx } from "@/lib/translations";

export const maxDuration = 60;

const CAFFEINE_MG: Record<string, number> = {
  coffee: 95,
  tea: 47,
  cola: 34,
  energy_drink: 160,
  pre_workout: 200,
  chocolate: 23,
};

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`caffeine:${clientIP}`, 10, 60_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Please wait ${rateCheck.resetInSeconds} seconds.` },
        { status: 429, headers: { "Retry-After": String(rateCheck.resetInSeconds) } }
      );
    }

    const body = await request.json();
    const lang = (body.lang === "tr" ? "tr" : "en") as "en" | "tr";
    const drinks: Record<string, number> = body.drinks || {};

    // Calculate total caffeine
    let totalCaffeine = 0;
    const drinkBreakdown: Array<{ drink: string; quantity: number; mg: number }> = [];
    for (const [drink, qty] of Object.entries(drinks)) {
      const q = Number(qty) || 0;
      if (q > 0 && CAFFEINE_MG[drink]) {
        const mg = q * CAFFEINE_MG[drink];
        totalCaffeine += mg;
        drinkBreakdown.push({ drink, quantity: q, mg });
      }
    }

    if (drinkBreakdown.length === 0) {
      return NextResponse.json(
        { error: tx("api.caffeine.addDrink", lang) },
        { status: 400 }
      );
    }

    // Fetch user medications
    let medications: string[] = [];
    let profileContext = "";
    const authHeader = request.headers.get("authorization");

    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const supabase = createServerClient();
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user) {
          const { data: meds } = await supabase
            .from("user_medications")
            .select("brand_name, generic_name")
            .eq("user_id", user.id)
            .eq("is_active", true);

          const { data: profile } = await supabase
            .from("user_profiles")
            .select("age, gender, is_pregnant, kidney_disease, liver_disease")
            .eq("id", user.id)
            .single();

          if (meds?.length) {
            medications = meds.map((m: { generic_name: string | null; brand_name: string | null }) =>
              m.generic_name || m.brand_name || ""
            ).filter(Boolean);
          }

          if (profile) {
            const parts: string[] = [];
            if (profile.age) parts.push(`Age: ${profile.age}`);
            if (profile.gender) parts.push(`Gender: ${profile.gender}`);
            if (profile.is_pregnant) parts.push("Pregnant");
            if (profile.kidney_disease) parts.push("Kidney disease");
            if (profile.liver_disease) parts.push("Liver disease");
            profileContext = parts.join(". ");
          }

          await supabase.from("query_history").insert({
            user_id: user.id,
            query_text: `Caffeine: ${totalCaffeine}mg | ${drinkBreakdown.map(d => `${d.drink}x${d.quantity}`).join(", ")}`,
            query_type: "caffeine_tracker" as string,
          });
        }
      } catch {
        // Continue as guest
      }
    }

    const systemPrompt = `You are a caffeine and medication interaction specialist at Phytotherapy.ai.

${profileContext ? `PATIENT: ${profileContext}` : ""}
${medications.length ? `MEDICATIONS: ${medications.join(", ")}` : ""}

Respond in ${tx("api.respondLang", lang)} with this exact JSON:
{
  "dailyTotal": ${totalCaffeine},
  "safeLimit": 400,
  "riskLevel": "safe" | "moderate" | "high",
  "halfLifeEstimate": "string — how long caffeine stays in system",
  "sleepImpact": "string — impact on sleep quality",
  "medicationAlerts": [
    {
      "medication": "name",
      "severity": "safe" | "caution" | "dangerous",
      "interaction": "what happens",
      "recommendation": "what to do"
    }
  ],
  "recommendations": ["string array of tips"],
  "breakdown": ${JSON.stringify(drinkBreakdown)}
}

RULES:
1. Key caffeine-medication interactions: lithium (toxicity), theophylline (increased levels), quinolone antibiotics (reduced clearance), SSRIs (anxiety), MAOIs (hypertension), adenosine (blocks effect), clozapine (increased levels), oral contraceptives (slower metabolism)
2. >400mg/day is high risk. 200-400mg is moderate. <200mg is safe.
3. Caffeine half-life is ~5 hours, longer in pregnancy and with certain medications
4. If pregnant, limit to <200mg/day
5. Sleep impact: caffeine consumed after 2pm affects sleep quality`;

    const result = await askGeminiJSON(
      `Analyze caffeine intake: Total ${totalCaffeine}mg from: ${drinkBreakdown.map(d => `${d.quantity}x ${d.drink} (${d.mg}mg)`).join(", ")}`,
      systemPrompt
    );

    let parsed;
    try {
      parsed = typeof result === "string" ? JSON.parse(result) : result;
    } catch {
      return NextResponse.json(
        { error: tx("api.caffeine.analysisFailed", lang) },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Caffeine tracker API error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
