import { NextRequest, NextResponse } from "next/server";
import { askGeminiJSON } from "@/lib/gemini";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";

export const maxDuration = 60;

const UNITS_PER_DRINK: Record<string, number> = {
  beer: 1.5,
  wine: 2.1,
  spirits: 1.0,
  cocktail: 2.0,
};

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`alcohol:${clientIP}`, 10, 60_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Please wait ${rateCheck.resetInSeconds} seconds.` },
        { status: 429, headers: { "Retry-After": String(rateCheck.resetInSeconds) } }
      );
    }

    const body = await request.json();
    const lang = body.lang || "en";
    const drinks: Record<string, number> = body.drinks || {};

    let totalUnits = 0;
    const drinkBreakdown: Array<{ drink: string; quantity: number; units: number }> = [];
    for (const [drink, qty] of Object.entries(drinks)) {
      const q = Number(qty) || 0;
      if (q > 0 && UNITS_PER_DRINK[drink]) {
        const units = q * UNITS_PER_DRINK[drink];
        totalUnits += units;
        drinkBreakdown.push({ drink, quantity: q, units: Math.round(units * 10) / 10 });
      }
    }

    if (drinkBreakdown.length === 0) {
      return NextResponse.json(
        { error: lang === "tr" ? "En az bir içecek ekleyin" : "Add at least one drink" },
        { status: 400 }
      );
    }

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
            query_text: `Alcohol: ${totalUnits.toFixed(1)} units | ${drinkBreakdown.map(d => `${d.drink}x${d.quantity}`).join(", ")}`,
            query_type: "alcohol_tracker" as string,
          });
        }
      } catch {
        // Continue as guest
      }
    }

    const systemPrompt = `You are an alcohol-health interaction specialist at Phytotherapy.ai.

${profileContext ? `PATIENT: ${profileContext}` : ""}
${medications.length ? `MEDICATIONS: ${medications.join(", ")}` : ""}

Respond in ${lang === "tr" ? "Turkish" : "English"} with this exact JSON:
{
  "weeklyUnits": ${Math.round(totalUnits * 10) / 10},
  "WHOLimit": { "male": 14, "female": 7 },
  "riskLevel": "low" | "moderate" | "high" | "very_high",
  "medicationAlerts": [
    {
      "medication": "name",
      "severity": "safe" | "caution" | "dangerous",
      "interaction": "what happens",
      "mechanism": "pharmacological mechanism",
      "recommendation": "what to do"
    }
  ],
  "liverEnzymeCorrelation": "string — how this level affects liver enzymes",
  "liverHealthTips": ["string array"],
  "recommendations": ["string array of tips"],
  "disclaimer": "string"
}

RULES:
1. Critical alcohol-medication interactions: metformin (lactic acidosis), paracetamol/acetaminophen (hepatotoxicity), benzodiazepines (respiratory depression), warfarin (bleeding risk), SSRIs (increased sedation), NSAIDs (GI bleeding), opioids (CNS depression), antibiotics (disulfiram reaction with metronidazole)
2. WHO limits: 14 units/week male, 7 units/week female
3. >35 units/week is very high risk
4. Pregnancy: ZERO alcohol is safe
5. Liver disease: strongly advise against ANY alcohol`;

    const result = await askGeminiJSON(
      `Analyze weekly alcohol intake: ${totalUnits.toFixed(1)} units from: ${drinkBreakdown.map(d => `${d.quantity}x ${d.drink} (${d.units} units)`).join(", ")}`,
      systemPrompt
    );

    let parsed;
    try {
      parsed = typeof result === "string" ? JSON.parse(result) : result;
    } catch {
      return NextResponse.json(
        { error: lang === "tr" ? "Analiz başarısız oldu" : "Analysis failed" },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Alcohol tracker API error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
