// © 2026 Phytotherapy.ai — All Rights Reserved
import { NextRequest, NextResponse } from "next/server";
import { askGeminiJSON } from "@/lib/gemini";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/sanitize";
import { tx } from "@/lib/translations";

export const maxDuration = 60;

const SUPPORTED_CONDITIONS = [
  "Type 2 Diabetes",
  "Hypertension",
  "Hypothyroidism",
  "Asthma",
  "COPD",
  "PCOS",
];

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`chronic:${clientIP}`, 10, 60_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Please wait ${rateCheck.resetInSeconds} seconds.` },
        { status: 429, headers: { "Retry-After": String(rateCheck.resetInSeconds) } }
      );
    }

    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const condition = sanitizeInput(body.condition || "");
    const lang = (body.lang === "tr" ? "tr" : "en") as "en" | "tr";

    if (!condition) {
      return NextResponse.json(
        { error: tx("api.chronicCare.selectCondition", lang) },
        { status: 400 }
      );
    }

    // Validate condition is in supported list (case-insensitive)
    const matched = SUPPORTED_CONDITIONS.find(
      (c) => c.toLowerCase() === condition.toLowerCase()
    );
    if (!matched) {
      return NextResponse.json(
        { error: tx("api.chronicCare.unsupported", lang) },
        { status: 400 }
      );
    }

    // Fetch all relevant user data
    const [profileResult, medsResult, allergiesResult, bloodResult, vitalsResult] = await Promise.all([
      supabase
        .from("user_profiles")
        .select("age, gender, is_pregnant, is_breastfeeding, kidney_disease, liver_disease, chronic_conditions, smoking_use, alcohol_use, exercise_frequency")
        .eq("id", user.id)
        .single(),
      supabase
        .from("user_medications")
        .select("brand_name, generic_name, dosage, frequency")
        .eq("user_id", user.id)
        .eq("is_active", true),
      supabase
        .from("user_allergies")
        .select("allergen, severity")
        .eq("user_id", user.id),
      supabase
        .from("blood_tests")
        .select("test_data, analysis_result, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3),
      supabase
        .from("vital_records")
        .select("vital_type, value, systolic, diastolic, recorded_at")
        .eq("user_id", user.id)
        .order("recorded_at", { ascending: false })
        .limit(20),
    ]);

    const profile = profileResult.data;
    const medications = medsResult.data || [];
    const allergies = allergiesResult.data || [];
    const bloodTests = bloodResult.data || [];
    const vitals = vitalsResult.data || [];

    // Build context
    const profileContext: string[] = [];
    if (profile) {
      if (profile.age) profileContext.push(`Age: ${profile.age}`);
      if (profile.gender) profileContext.push(`Gender: ${profile.gender}`);
      if (profile.is_pregnant) profileContext.push("Pregnant");
      if (profile.is_breastfeeding) profileContext.push("Breastfeeding");
      if (profile.kidney_disease) profileContext.push("Kidney disease");
      if (profile.liver_disease) profileContext.push("Liver disease");
      if (profile.smoking_use) profileContext.push(`Smoking: ${profile.smoking_use}`);
      if (profile.alcohol_use) profileContext.push(`Alcohol: ${profile.alcohol_use}`);
      if (profile.exercise_frequency) profileContext.push(`Exercise: ${profile.exercise_frequency}`);
      if (profile.chronic_conditions?.length) profileContext.push(`Other conditions: ${profile.chronic_conditions.join(", ")}`);
    }

    const medsContext = medications.length > 0
      ? medications.map((m: { generic_name: string | null; brand_name: string | null; dosage: string | null; frequency: string | null }) =>
          `${m.generic_name || m.brand_name}${m.dosage ? ` ${m.dosage}` : ""}${m.frequency ? ` (${m.frequency})` : ""}`
        ).join(", ")
      : "None reported";

    const allergiesContext = allergies.length > 0
      ? allergies.map((a: { allergen: string; severity: string | null }) => `${a.allergen}${a.severity ? ` (${a.severity})` : ""}`).join(", ")
      : "None reported";

    const bloodContext = bloodTests.length > 0
      ? bloodTests.map((bt: { test_data: Record<string, { value: number; unit: string }> | null; created_at: string }) => {
          if (!bt.test_data) return "";
          const entries = Object.entries(bt.test_data)
            .map(([key, val]) => `${key}: ${val.value} ${val.unit}`)
            .join(", ");
          return `[${new Date(bt.created_at).toLocaleDateString()}] ${entries}`;
        }).filter(Boolean).join("\n")
      : "No recent blood tests";

    const vitalsContext = vitals.length > 0
      ? vitals.map((v: { vital_type: string; value: number | null; systolic: number | null; diastolic: number | null; recorded_at: string }) => {
          if (v.vital_type === "blood_pressure" && v.systolic && v.diastolic) {
            return `BP: ${v.systolic}/${v.diastolic} (${new Date(v.recorded_at).toLocaleDateString()})`;
          }
          return `${v.vital_type}: ${v.value} (${new Date(v.recorded_at).toLocaleDateString()})`;
        }).join(", ")
      : "No recent vitals";

    const systemPrompt = `You are Phytotherapy.ai's chronic disease management assistant.
Analyze the user's data for "${matched}" and provide a comprehensive disease management assessment.

PATIENT PROFILE: ${profileContext.join(". ")}
MEDICATIONS: ${medsContext}
ALLERGIES: ${allergiesContext}
RECENT BLOOD TESTS:
${bloodContext}
RECENT VITALS: ${vitalsContext}

Respond in ${tx("api.respondLang", lang)} with this exact JSON:
{
  "controlStatus": "well_controlled" | "borderline" | "uncontrolled",
  "controlSummary": "1-2 sentence summary of control status",
  "keyMetrics": [
    { "name": "Metric name (e.g. HbA1c, Blood Pressure)", "currentValue": "value or 'Not available'", "targetRange": "ideal range", "status": "good" | "warning" | "critical" }
  ],
  "adherenceScore": 0-100,
  "adherenceNotes": "Brief note about medication adherence",
  "lifestyle": [
    { "area": "Diet" | "Exercise" | "Sleep" | "Stress" | "Other", "recommendation": "Specific actionable advice", "priority": "high" | "medium" | "low" }
  ],
  "supplements": [
    { "name": "Supplement name", "dosage": "Specific dosage", "duration": "How long", "safety": "safe" | "caution" | "avoid", "reason": "Why recommended or avoided", "interactionNote": "Any drug interaction concern or empty string" }
  ],
  "urgentSigns": ["Warning sign that needs immediate medical attention"],
  "nextSteps": ["Concrete next step 1", "Concrete next step 2"],
  "sources": [{ "title": "Source title", "url": "https://pubmed.ncbi.nlm.nih.gov/..." }]
}

RULES:
1. Be specific based on ACTUAL patient data, not generic
2. Cross-check supplements against patient's medications for interactions
3. Cross-check supplements against patient's allergies
4. If blood test data is missing, note which tests are needed
5. controlStatus: use blood tests + vitals to determine
6. adherenceScore: estimate from medication list completeness + vital trends
7. urgentSigns: condition-specific red flags that warrant ER visit
8. Always include PubMed sources for supplement recommendations
9. Never recommend supplements that conflict with current medications`;

    const result = await askGeminiJSON(
      `Assess chronic disease management for: ${matched}`,
      systemPrompt
    );

    let parsed;
    try {
      parsed = typeof result === "string" ? JSON.parse(result) : result;
    } catch {
      return NextResponse.json(
        { error: tx("api.chronicCare.analysisFailed", lang) },
        { status: 500 }
      );
    }

    // Save to history
    await supabase.from("query_history").insert({
      user_id: user.id,
      query_text: `Chronic Care: ${matched}`,
      query_type: "chronic_care" as const,
    });

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Chronic care API error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
