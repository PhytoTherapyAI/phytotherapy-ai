// © 2026 DoctoPal — All Rights Reserved
import { NextRequest, NextResponse } from "next/server";
import { askGeminiJSON } from "@/lib/ai-client";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/sanitize";
import { tx } from "@/lib/translations";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`apptprep:${clientIP}`, 10, 60_000);
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
    const concerns = sanitizeInput(body.concerns || "");
    const lang = (body.lang === "tr" ? "tr" : "en") as "en" | "tr";

    // Fetch ALL user data
    const [
      profileResult,
      medsResult,
      allergiesResult,
      bloodResult,
      vitalsResult,
      queryResult,
      checkInsResult,
    ] = await Promise.all([
      supabase
        .from("user_profiles")
        .select("*")
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
        .limit(5),
      supabase
        .from("vital_records")
        .select("vital_type, value, systolic, diastolic, recorded_at")
        .eq("user_id", user.id)
        .order("recorded_at", { ascending: false })
        .limit(30),
      supabase
        .from("query_history")
        .select("query_text, query_type, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("daily_check_ins")
        .select("energy_level, sleep_quality, mood, bloating, check_date")
        .eq("user_id", user.id)
        .order("check_date", { ascending: false })
        .limit(14),
    ]);

    const profile = profileResult.data;
    const medications = medsResult.data || [];
    const allergies = allergiesResult.data || [];
    const bloodTests = bloodResult.data || [];
    const vitals = vitalsResult.data || [];
    const queries = queryResult.data || [];
    const checkIns = checkInsResult.data || [];

    // Build profile context
    const profileParts: string[] = [];
    if (profile) {
      if (profile.full_name) profileParts.push(`Name: ${profile.full_name}`);
      if (profile.age) profileParts.push(`Age: ${profile.age}`);
      if (profile.gender) profileParts.push(`Gender: ${profile.gender}`);
      if (profile.is_pregnant) profileParts.push("Currently pregnant");
      if (profile.is_breastfeeding) profileParts.push("Currently breastfeeding");
      if (profile.kidney_disease) profileParts.push("Kidney disease");
      if (profile.liver_disease) profileParts.push("Liver disease");
      if (profile.chronic_conditions?.length) profileParts.push(`Chronic conditions: ${profile.chronic_conditions.join(", ")}`);
      if (profile.smoking_use) profileParts.push(`Smoking: ${profile.smoking_use}`);
      if (profile.alcohol_use) profileParts.push(`Alcohol: ${profile.alcohol_use}`);
      if (profile.exercise_frequency) profileParts.push(`Exercise: ${profile.exercise_frequency}`);
      if (profile.past_surgeries) profileParts.push(`Past surgeries: ${profile.past_surgeries}`);
    }

    const medsText = medications.length > 0
      ? medications.map((m: { generic_name: string | null; brand_name: string | null; dosage: string | null; frequency: string | null }) =>
          `${m.generic_name || m.brand_name}${m.dosage ? ` ${m.dosage}` : ""}${m.frequency ? ` (${m.frequency})` : ""}`
        ).join("; ")
      : "None reported";

    const allergiesText = allergies.length > 0
      ? allergies.map((a: { allergen: string; severity: string | null }) => `${a.allergen}${a.severity ? ` (${a.severity})` : ""}`).join(", ")
      : "None reported";

    const bloodText = bloodTests.length > 0
      ? bloodTests.map((bt: { test_data: Record<string, { value: number; unit: string }> | null; analysis_result: string | null; created_at: string }) => {
          const date = new Date(bt.created_at).toLocaleDateString();
          if (!bt.test_data) return `[${date}] No data`;
          const entries = Object.entries(bt.test_data)
            .map(([key, val]) => `${key}: ${val.value} ${val.unit}`)
            .join(", ");
          return `[${date}] ${entries}${bt.analysis_result ? `\nAnalysis: ${bt.analysis_result.slice(0, 300)}` : ""}`;
        }).join("\n\n")
      : "No recent blood tests";

    const vitalsText = vitals.length > 0
      ? vitals.map((v: { vital_type: string; value: number | null; systolic: number | null; diastolic: number | null; recorded_at: string }) => {
          const date = new Date(v.recorded_at).toLocaleDateString();
          if (v.vital_type === "blood_pressure" && v.systolic && v.diastolic) {
            return `BP: ${v.systolic}/${v.diastolic} (${date})`;
          }
          return `${v.vital_type}: ${v.value} (${date})`;
        }).join("; ")
      : "No recent vitals";

    const queriesText = queries.length > 0
      ? queries.map((q: { query_text: string; query_type: string; created_at: string }) =>
          `[${new Date(q.created_at).toLocaleDateString()}] ${q.query_type}: ${q.query_text.slice(0, 100)}`
        ).join("\n")
      : "No recent queries";

    const checkInsText = checkIns.length > 0
      ? checkIns.map((c: { check_date: string; energy_level: number | null; sleep_quality: number | null; mood: number | null; bloating: number | null }) =>
          `[${c.check_date}] Energy:${c.energy_level || "?"}/5 Sleep:${c.sleep_quality || "?"}/5 Mood:${c.mood || "?"}/5${c.bloating ? ` Bloating:${c.bloating}/5` : ""}`
        ).join("; ")
      : "No recent check-ins";

    const systemPrompt = `You are DoctoPal's appointment preparation assistant.
Generate a comprehensive clinical summary for the patient to bring to their doctor visit.
This should be professional, concise, and formatted for a healthcare provider to quickly review.

PATIENT PROFILE: ${profileParts.join(". ")}
MEDICATIONS: ${medsText}
ALLERGIES: ${allergiesText}

BLOOD TESTS:
${bloodText}

VITAL RECORDS: ${vitalsText}

RECENT HEALTH QUERIES:
${queriesText}

DAILY CHECK-INS (last 2 weeks): ${checkInsText}

${concerns ? `PATIENT CONCERNS: ${concerns}` : ""}

Respond in ${tx("api.respondLang", lang)} with this exact JSON:
{
  "patientOverview": "2-3 sentence summary of patient's current health status",
  "currentMedications": [
    { "name": "medication name", "dosage": "dosage", "purpose": "brief purpose note" }
  ],
  "recentChanges": ["Notable recent change 1", "Change 2"],
  "labHighlights": [
    { "test": "Test name", "value": "value with unit", "status": "normal" | "borderline" | "abnormal", "note": "brief clinical note" }
  ],
  "vitalTrends": [
    { "vital": "Vital name", "trend": "stable" | "improving" | "worsening", "latestValue": "value", "note": "brief note" }
  ],
  "symptomSummary": "Summary of reported symptoms from check-ins and queries",
  "supplementsInUse": ["supplement 1", "supplement 2"],
  "suggestedQuestions": ["Question the patient should ask their doctor 1", "Question 2"],
  "concerns": "Patient's own concerns reformulated clearly for the doctor",
  "clinicalNotes": "Any additional notes the doctor should be aware of (drug interactions, allergy cross-sensitivities, etc.)"
}

RULES:
1. Be clinical and professional in tone
2. Highlight abnormal lab values prominently
3. Note any potential drug interactions
4. Include relevant allergy cross-sensitivity warnings
5. If data is insufficient, note what tests or information would be helpful
6. suggestedQuestions should be specific to THIS patient's situation
7. Format all values with proper medical units`;

    const result = await askGeminiJSON(
      `Generate a clinical summary for this patient's upcoming doctor appointment.${concerns ? ` Patient's concerns: "${concerns}"` : ""}`,
      systemPrompt
    );

    let parsed;
    try {
      parsed = typeof result === "string" ? JSON.parse(result) : result;
    } catch {
      return NextResponse.json(
        { error: tx("api.apptPrep.generateFailed", lang) },
        { status: 500 }
      );
    }

    // Save to history
    await supabase.from("query_history").insert({
      user_id: user.id,
      query_text: `Appointment Prep${concerns ? `: ${concerns.slice(0, 100)}` : ""}`,
      query_type: "appointment_prep" as const,
    });

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Appointment prep API error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
