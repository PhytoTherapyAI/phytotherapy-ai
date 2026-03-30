import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { askGeminiJSON } from "@/lib/gemini";
import { tx } from "@/lib/translations";

export const maxDuration = 60;

const PREECLAMPSIA_SYMPTOMS = [
  "severe headache", "vision changes", "blurred vision", "upper abdominal pain",
  "sudden swelling", "rapid weight gain", "difficulty breathing",
  "şiddetli bas ağrısi", "gorme değişiklikleri", "bulanık gorme",
  "ust karin ağrısi", "ani sisman", "nefes darlığı",
];

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`pregnancy:${clientIP}`, 5, 60_000);
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
    const {
      gestational_week = 12,
      symptoms = [],
      concerns = "",
    } = body;

    // Validate gestational week
    if (gestational_week < 1 || gestational_week > 42) {
      return NextResponse.json({ error: "Gestational week must be 1-42" }, { status: 400 });
    }

    // CRITICAL: Check for preeclampsia symptoms → RED ALERT
    const symptomsLower = symptoms.map((s: string) => s.toLowerCase());
    const concernsLower = (concerns || "").toLowerCase();
    const hasPreeclampsiaSymptom = PREECLAMPSIA_SYMPTOMS.some(
      (ps) => symptomsLower.some((s: string) => s.includes(ps)) || concernsLower.includes(ps)
    );

    if (hasPreeclampsiaSymptom) {
      return NextResponse.json({
        result: {
          alertLevel: "red",
          emergencyAlert: true,
          emergencyMessage: tx("api.pregnancy.emergencyMessage", lang),
          gestationalWeek: gestational_week,
          weekInfo: null,
          fetalDevelopment: null,
          safeSupplements: [],
          unsafeMeds: [],
          nutritionPlan: [],
          warningSignals: [],
        },
      });
    }

    // Fetch user medications — check ALL for pregnancy safety
    const { data: medications } = await supabase
      .from("user_medications")
      .select("brand_name, generic_name, dosage")
      .eq("user_id", user.id);

    const medicationList = medications && medications.length > 0
      ? medications.map((m) => `${(m.generic_name || m.brand_name)}${m.generic_name ? ` (${m.generic_name})` : ""}`).join(", ")
      : "None reported";

    // Determine trimester
    let trimester: string;
    if (gestational_week <= 12) trimester = "first";
    else if (gestational_week <= 27) trimester = "second";
    else trimester = "third";

    const systemPrompt = `You are a pregnancy health assistant for Phytotherapy.ai.
You provide evidence-based pregnancy guidance with strict safety focus.

CRITICAL SAFETY RULES:
- CHECK EVERY medication for FDA pregnancy categories (A/B/C/D/X)
- Category X drugs: IMMEDIATE red alert + "Contact doctor before next dose"
- Category D drugs: Yellow alert + "Discuss with doctor urgently"
- NEVER recommend herbal supplements without checking pregnancy safety
- UNSAFE herbs in pregnancy: St. John's Wort, Black Cohosh, Blue Cohosh, Pennyroyal, Dong Quai, Mugwort, Tansy
- SAFE supplements: prenatal vitamin, folic acid (400-800mcg), iron, DHA (200mg), vitamin D
- No essential oils internally during pregnancy
- Always recommend discussing with OB/GYN
- Be warm, reassuring, informative

Respond in ${tx("api.respondLang", lang)}.

Return ONLY valid JSON:
{
  "weekInfo": string,
  "fetalDevelopment": { "size": string, "weight": string, "developments": [string] },
  "safeSupplements": [{ "name": string, "dose": string, "benefit": string, "trimesterSafe": [string] }],
  "unsafeMeds": [{ "medication": string, "category": string, "risk": string, "action": string }],
  "safeMeds": [{ "medication": string, "category": string, "note": string }],
  "nutritionPlan": [{ "nutrient": string, "amount": string, "sources": string, "why": string }],
  "exerciseGuidelines": [string],
  "warningSignals": [{ "signal": string, "action": string }],
  "weekSpecificTips": [string],
  "alertLevel": "green" | "yellow" | "red"
}`;

    const prompt = `Analyze this pregnancy assessment:

GESTATIONAL WEEK: ${gestational_week} (Trimester: ${trimester})
SYMPTOMS: ${symptoms.length > 0 ? symptoms.join(", ") : "None reported"}
CONCERNS: ${concerns || "None"}
USER MEDICATIONS: ${medicationList}

Provide:
1. Week-by-week fetal development info
2. Check ALL listed medications for pregnancy safety (FDA categories)
3. Safe supplement recommendations for this trimester
4. Nutrition plan with specific amounts (folic acid, iron, DHA, calcium)
5. Warning signs to watch for at this gestational week
6. Exercise guidelines appropriate for this week

If ANY medication is Category X, set alertLevel to "red".
If ANY medication is Category D, set alertLevel to at least "yellow".`;

    const resultText = await askGeminiJSON(prompt, systemPrompt);
    const analysis = JSON.parse(resultText);

    return NextResponse.json({
      result: {
        ...analysis,
        gestationalWeek: gestational_week,
        trimester,
        emergencyAlert: false,
      },
    });
  } catch (err) {
    console.error("Pregnancy tracker error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
