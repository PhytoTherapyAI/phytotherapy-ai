import { NextRequest, NextResponse } from "next/server";
import { askGeminiJSON } from "@/lib/gemini";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";

export const maxDuration = 60;

const VALID_SYMPTOMS = ["tinnitus", "hearing_loss", "vertigo", "ear_pain", "ear_fullness", "discharge", "itching"];

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`ear-health:${clientIP}`, 10, 60_000);
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
    const lang = body.lang === "tr" ? "tr" : "en";

    const symptoms = Array.isArray(body.symptoms)
      ? body.symptoms.filter((s: string) => VALID_SYMPTOMS.includes(s))
      : [];

    if (symptoms.length === 0) {
      return NextResponse.json(
        { error: lang === "tr" ? "En az bir semptom seçin" : "Select at least one symptom" },
        { status: 400 }
      );
    }

    const noiseExposureHours = Math.min(24, Math.max(0, Number(body.noise_exposure_hours) || 0));

    const [medsResult, profileResult] = await Promise.all([
      supabase
        .from("user_medications")
        .select("medication_name, active_ingredient, dosage, frequency")
        .eq("user_id", user.id),
      supabase
        .from("user_profiles")
        .select("age, gender, chronic_conditions")
        .eq("id", user.id)
        .single(),
    ]);

    const medications = medsResult.data || [];
    const profile = profileResult.data;

    const medicationList = medications.length > 0
      ? medications.map((m) => `${m.medication_name}${m.active_ingredient ? ` (${m.active_ingredient})` : ""}`).join(", ")
      : "None reported";

    const profileInfo = profile
      ? `Age: ${profile.age || "unknown"}, Gender: ${profile.gender || "unknown"}, Chronic conditions: ${profile.chronic_conditions?.join(", ") || "none"}`
      : "No profile data";

    const systemPrompt = `You are an ENT/audiology-informed health analyst for Phytotherapy.ai. Analyze hearing and ear symptoms and provide evidence-based guidance.

RULES:
- Identify ototoxic medications: aminoglycosides (gentamicin, tobramycin), high-dose aspirin (>4g/day), cisplatin, carboplatin, furosemide, vancomycin, quinine, erythromycin IV
- Assess noise exposure risk (>85 dB threshold)
- Consider age-related hearing loss (presbycusis)
- Recommend evidence-based supplements (magnesium for noise-induced, NAC for ototoxicity prevention, CoQ10)
- Use PubMed-backed evidence
- Respond in ${lang === "tr" ? "Turkish" : "English"}
- Never diagnose — suggest when to see an ENT specialist

OUTPUT FORMAT (strict JSON):
{
  "hearingRiskScore": <number 0-100, lower = more risk>,
  "symptomAnalysis": "<string: analysis of reported symptoms>",
  "ototoxicMeds": [
    {
      "medication": "<drug name>",
      "ototoxicRisk": "<how it affects hearing>",
      "riskLevel": "<low | moderate | high>",
      "monitoringNeeded": "<what monitoring is recommended>"
    }
  ],
  "noiseExposureRisk": "<string: assessment of noise exposure>",
  "recommendations": [
    {
      "category": "<e.g. Hearing Protection, Tinnitus Management, Lifestyle>",
      "advice": "<specific actionable advice>",
      "priority": "<high | medium | low>"
    }
  ],
  "supplements": [
    {
      "name": "<supplement name>",
      "dosage": "<dosage>",
      "benefit": "<hearing health benefit>",
      "safety": "<safe | caution | avoid>",
      "interactionNote": "<drug interaction or empty string>"
    }
  ],
  "hearingTestSchedule": "<string: when to get hearing tested>",
  "alertLevel": "<green | yellow | red>",
  "whenToSeeDoctor": [<string: urgent warning signs>],
  "sources": [{"title": "<string>", "url": "<PubMed URL>"}]
}`;

    const prompt = `Analyze these ear and hearing concerns:

SYMPTOMS: ${symptoms.join(", ")}
DAILY NOISE EXPOSURE: ${noiseExposureHours} hours

USER PROFILE: ${profileInfo}
USER MEDICATIONS: ${medicationList}

Provide a comprehensive hearing health analysis as JSON.`;

    const result = await askGeminiJSON(prompt, systemPrompt);
    const analysis = JSON.parse(result);

    try {
      await supabase.from("query_history").insert({
        user_id: user.id,
        query_text: `Ear health analysis: ${symptoms.join(", ")}`,
        response_text: `Score: ${analysis.hearingRiskScore}/100`,
        query_type: "general",
      });
    } catch { /* Non-critical */ }

    return NextResponse.json({ analysis });
  } catch (err) {
    console.error("Ear health analysis error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
