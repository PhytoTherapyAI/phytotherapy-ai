// © 2026 DoctoPal — All Rights Reserved
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { askClaudeJSON } from "@/lib/ai-client";
import { tx } from "@/lib/translations";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`menopause:${clientIP}`, 5, 60_000);
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
      symptoms = {},
      age = 50,
    } = body;

    // Expected symptoms structure:
    // { hot_flashes: { frequency: 0-10, severity: 0-3 }, night_sweats: {...}, mood_changes: {...}, insomnia: {...}, vaginal_dryness: {...}, joint_pain: {...}, fatigue: {...}, brain_fog: {...} }

    // Calculate MRS (Menopause Rating Scale) approximation
    const symptomEntries = Object.entries(symptoms) as Array<[string, { frequency?: number; severity?: number }]>;
    const mrsScore = symptomEntries.reduce((sum, [, val]) => {
      return sum + ((val?.severity || 0) * (val?.frequency || 0)) / 3;
    }, 0);

    // Fetch user medications — check HRT
    const { data: medications } = await supabase
      .from("user_medications")
      .select("brand_name, generic_name, dosage")
      .eq("user_id", user.id);

    const medicationList = medications && medications.length > 0
      ? medications.map((m) => `${(m.generic_name || m.brand_name)}${m.generic_name ? ` (${m.generic_name})` : ""}`).join(", ")
      : "None reported";

    // Check for HRT medications
    const hrtKeywords = [
      "estrogen", "estradiol", "premarin", "progesterone", "medroxyprogesterone",
      "provera", "prempro", "climara", "vivelle", "divigel",
      "tibolone", "livial",
    ];
    const hasHRT = medications?.some((m) =>
      hrtKeywords.some((kw) =>
        ((m.generic_name || m.brand_name)?.toLowerCase() || "").includes(kw) ||
        (m.generic_name?.toLowerCase() || "").includes(kw)
      )
    );

    const systemPrompt = `You are a menopause health assistant for DoctoPal.
You provide evidence-based menopause management guidance.

CRITICAL SAFETY RULES:
- NEVER recommend starting or stopping HRT — that is a doctor decision
- If on HRT, check supplement interactions (phytoestrogens + HRT = discuss with doctor)
- Soy isoflavones: Grade B evidence for hot flashes, BUT discuss with doctor if on HRT or history of breast cancer
- Black cohosh: Grade B evidence, max 6 months use, liver function monitoring suggested
- St. John's Wort for mood: check ALL medication interactions (CYP3A4)
- Bone health: calcium 1200mg + vitamin D 800-1000 IU + weight-bearing exercise
- DEXA scan recommendation based on age and risk factors
- Be empathetic and validating — menopause symptoms are real and impactful

Respond in ${tx("api.respondLang", lang)}.

Return ONLY valid JSON:
{
  "symptomAnalysis": [{ "symptom": string, "severity": string, "management": string }],
  "mrsInterpretation": string,
  "supplementPlan": [{ "name": string, "dose": string, "evidence": string, "duration": string, "caution": string }],
  "boneHealthPlan": { "calciumNeeded": string, "vitaminD": string, "exercise": [string], "dexaRecommendation": string },
  "hrtNotes": string,
  "lifestyleRecommendations": [string],
  "medicationNotes": string,
  "alertLevel": "green" | "yellow"
}`;

    const prompt = `Analyze this menopause assessment:

AGE: ${age}
SYMPTOMS: ${JSON.stringify(symptoms, null, 2)}
APPROXIMATE MRS SCORE: ${Math.round(mrsScore * 10) / 10}
ON HRT: ${hasHRT ? "YES" : "NO"}
USER MEDICATIONS: ${medicationList}

Provide:
1. Symptom-by-symptom analysis with management strategies
2. Evidence-based supplement recommendations (check interactions with ALL meds)
3. Bone health plan (calcium, vitamin D, exercise, DEXA timing)
4. If on HRT, note any supplement-HRT interactions
5. Lifestyle recommendations for symptom management
6. MRS interpretation`;

    const resultText = await askClaudeJSON(prompt, systemPrompt, { userId: user.id });
    let analysis; try { analysis = JSON.parse(resultText); } catch { return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 }); }

    return NextResponse.json({
      result: {
        ...analysis,
        mrsScore: Math.round(mrsScore * 10) / 10,
        hasHRT,
        age,
      },
    });
  } catch (err) {
    console.error("Menopause panel error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
