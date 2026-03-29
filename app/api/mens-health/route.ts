import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { askGeminiJSON } from "@/lib/gemini";

export const maxDuration = 60;

const ADAM_QUESTIONS_EN = [
  "Do you have a decrease in libido (sex drive)?",
  "Do you have a lack of energy?",
  "Do you have a decrease in strength and/or endurance?",
  "Have you lost height?",
  "Have you noticed a decreased enjoyment of life?",
  "Are you sad and/or grumpy?",
  "Are your erections less strong?",
  "Have you noticed a recent deterioration in your ability to play sports?",
  "Are you falling asleep after dinner?",
  "Has there been a recent deterioration in your work performance?",
];

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`mens-health:${clientIP}`, 5, 60_000);
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
    const {
      adam_answers = [],
      symptoms = [],
      age = 40,
    } = body;

    // Calculate ADAM score
    let adamScore: number | null = null;
    let adamPositive = false;
    if (adam_answers.length === 10) {
      const score = adam_answers.filter((a: boolean) => a === true).length;
      adamScore = score;
      // ADAM is positive if Q1 or Q7 is yes, OR any 3+ other questions are yes
      adamPositive = adam_answers[0] === true || adam_answers[6] === true || score >= 3;
    }

    // Fetch user medications — check for sexual side effects
    const { data: medications } = await supabase
      .from("user_medications")
      .select("brand_name, generic_name, dosage")
      .eq("user_id", user.id);

    const medicationList = medications && medications.length > 0
      ? medications.map((m) => `${(m.generic_name || m.brand_name)}${m.generic_name ? ` (${m.generic_name})` : ""}`).join(", ")
      : "None reported";

    // Check for medications with known sexual/testosterone effects
    const sexualEffectMeds = [
      "ssri", "sertraline", "fluoxetine", "paroxetine", "citalopram", "escitalopram",
      "finasteride", "dutasteride", "propecia", "avodart",
      "spironolactone", "beta-blocker", "atenolol", "metoprolol", "propranolol",
      "opioid", "tramadol", "morphine", "hydrocodone", "oxycodone",
      "statin", "atorvastatin", "rosuvastatin",
    ];
    const hasSexualEffectMed = medications?.some((m) =>
      sexualEffectMeds.some((kw) =>
        ((m.generic_name || m.brand_name)?.toLowerCase() || "").includes(kw) ||
        (m.generic_name?.toLowerCase() || "").includes(kw)
      )
    );

    const systemPrompt = `You are a men's health assistant for Phytotherapy.ai.
You provide evidence-based guidance on testosterone, prostate health, and medication effects.

CRITICAL SAFETY RULES:
- NEVER diagnose low testosterone — recommend blood test (total T, free T, LH, FSH)
- SSRIs cause sexual dysfunction in 40-70% of users — always mention if user takes SSRIs
- Finasteride/dutasteride: can cause persistent sexual side effects — inform but don't alarm
- Beta-blockers: 10-20% erectile dysfunction rate
- NEVER recommend testosterone supplements without doctor consultation
- Zinc: 15-30mg/day, Grade B evidence for mild T support
- Ashwagandha KSM-66: 600mg/day, Grade B evidence for T and stress
- D-aspartic acid, tribulus: insufficient evidence — be honest
- PSA screening: discuss with doctor based on age and family history
- Be direct, practical, non-sensational

Respond in ${lang === "tr" ? "Turkish" : "English"}.

Return ONLY valid JSON:
{
  "adamScore": number | null,
  "adamPositive": boolean,
  "testosteroneSymptomAssessment": string,
  "medicationEffects": [{ "medication": string, "effect": string, "prevalence": string, "action": string }],
  "supplementSuggestions": [{ "name": string, "dose": string, "evidence": string, "safetyNote": string }],
  "prostateHealth": { "screeningRecommendation": string, "tips": [string] },
  "lifestyleRecommendations": [string],
  "labTestsRecommended": [string],
  "alertLevel": "green" | "yellow"
}`;

    const prompt = `Analyze this men's health assessment:

AGE: ${age}
ADAM QUESTIONNAIRE: ${adamScore !== null ? `Score: ${adamScore}/10, Positive: ${adamPositive}` : "Not completed"}
${adamScore !== null ? `ADAM ANSWERS:\n${ADAM_QUESTIONS_EN.map((q, i) => `  Q${i + 1}: ${q} = ${adam_answers[i] ? "Yes" : "No"}`).join("\n")}` : ""}
SYMPTOMS: ${symptoms.length > 0 ? symptoms.join(", ") : "None selected"}
USER MEDICATIONS: ${medicationList}
HAS SEXUAL SIDE EFFECT MEDS: ${hasSexualEffectMed ? "YES" : "NO"}

Provide:
1. ADAM questionnaire interpretation
2. Check ALL medications for sexual/hormonal side effects with prevalence %
3. Evidence-based supplement suggestions safe with their medications
4. Prostate health guidance based on age
5. Recommended lab tests
6. Lifestyle recommendations (exercise, sleep, stress)`;

    const resultText = await askGeminiJSON(prompt, systemPrompt);
    const analysis = JSON.parse(resultText);

    return NextResponse.json({
      result: {
        ...analysis,
        adamScore,
        adamPositive,
        age,
        hasSexualEffectMed,
      },
    });
  } catch (err) {
    console.error("Men's health error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
