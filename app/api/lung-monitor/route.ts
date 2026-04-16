// © 2026 DoctoPal — All Rights Reserved
import { NextRequest, NextResponse } from "next/server";
import { askClaudeJSON } from "@/lib/ai-client";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { tx } from "@/lib/translations";

export const maxDuration = 60;

const VALID_SYMPTOMS = ["wheezing", "shortness_of_breath", "cough", "phlegm", "chest_tightness", "night_cough"];
const VALID_TRIGGERS = ["dust", "pollen", "cold_air", "exercise", "smoke", "pets", "mold", "perfume", "stress"];

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`lung-monitor:${clientIP}`, 10, 60_000);
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
    const lang = (body.lang === "tr" ? "tr" : "en") as "en" | "tr";

    const symptoms = Array.isArray(body.symptoms)
      ? body.symptoms.filter((s: string) => VALID_SYMPTOMS.includes(s))
      : [];

    const triggers = Array.isArray(body.triggers)
      ? body.triggers.filter((t: string) => VALID_TRIGGERS.includes(t))
      : [];

    if (symptoms.length === 0) {
      return NextResponse.json(
        { error: tx("api.selectSymptom", lang) },
        { status: 400 }
      );
    }

    const peakFlow = Number(body.peak_flow) || 0;
    const conditionType = body.condition_type === "copd" ? "copd" : body.condition_type === "asthma" ? "asthma" : "general";

    // ACT questions (1-5 scale each, 5 questions)
    const actScores = Array.isArray(body.act_scores)
      ? body.act_scores.map((s: number) => Math.min(5, Math.max(1, Number(s) || 3))).slice(0, 5)
      : [];

    // CAT questions (0-5 scale each, 8 questions)
    const catScores = Array.isArray(body.cat_scores)
      ? body.cat_scores.map((s: number) => Math.min(5, Math.max(0, Number(s) || 0))).slice(0, 8)
      : [];

    const [medsResult, profileResult] = await Promise.all([
      supabase
        .from("user_medications")
        .select("brand_name, generic_name, dosage, frequency")
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
      ? medications.map((m) => `${(m.generic_name || m.brand_name)}${m.generic_name ? ` (${m.generic_name})` : ""}`).join(", ")
      : "None reported";

    const profileInfo = profile
      ? `Age: ${profile.age || "unknown"}, Gender: ${profile.gender || "unknown"}, Chronic conditions: ${profile.chronic_conditions?.join(", ") || "none"}`
      : "No profile data";

    const actTotal = actScores.length === 5 ? actScores.reduce((a: number, b: number) => a + b, 0) : null;
    const catTotal = catScores.length === 8 ? catScores.reduce((a: number, b: number) => a + b, 0) : null;

    const systemPrompt = `You are a pulmonology-informed health analyst for DoctoPal. Analyze respiratory symptoms and provide evidence-based lung health guidance.

RULES:
- For asthma: Interpret ACT score (25=well controlled, 20-24=not well controlled, <20=very poorly controlled)
- For COPD: Interpret CAT score (<10=low impact, 10-20=medium, 21-30=high, >30=very high)
- Check beta-blocker use in asthma (contraindicated: propranolol, timolol; safer: bisoprolol, metoprolol)
- Check ACE inhibitors (can cause chronic cough)
- Assess peak flow if provided (% of predicted based on age/gender/height)
- Provide inhaler technique tips
- Trigger management advice
- Use PubMed-backed evidence
- Respond in ${tx("api.respondLang", lang)}
- Never diagnose — suggest when to see a pulmonologist

OUTPUT FORMAT (strict JSON):
{
  "lungHealthAssessment": "<string: overall assessment>",
  "actScore": ${actTotal !== null ? `{ "total": ${actTotal}, "interpretation": "<string>", "controlLevel": "<well_controlled | not_well_controlled | poorly_controlled>" }` : "null"},
  "catScore": ${catTotal !== null ? `{ "total": ${catTotal}, "interpretation": "<string>", "impactLevel": "<low | medium | high | very_high>" }` : "null"},
  "peakFlowAssessment": "<string: peak flow interpretation or not provided>",
  "medicationAlerts": [
    {
      "medication": "<drug name>",
      "concern": "<respiratory concern>",
      "riskLevel": "<low | moderate | high>",
      "recommendation": "<what to do>"
    }
  ],
  "triggerAnalysis": [
    {
      "trigger": "<trigger name>",
      "avoidanceStrategy": "<how to avoid/manage>"
    }
  ],
  "inhalerTips": [<string: inhaler technique tips, max 5>],
  "breathingExercises": [
    {
      "name": "<exercise name>",
      "description": "<how to do it>",
      "benefit": "<why helpful>"
    }
  ],
  "supplements": [
    {
      "name": "<supplement name>",
      "dosage": "<dosage>",
      "benefit": "<lung benefit>",
      "safety": "<safe | caution | avoid>",
      "interactionNote": "<drug interaction or empty string>"
    }
  ],
  "alertLevel": "<green | yellow | red>",
  "whenToSeeDoctor": [<string: warning signs>],
  "sources": [{"title": "<string>", "url": "<PubMed URL>"}]
}`;

    const prompt = `Analyze these respiratory concerns:

CONDITION TYPE: ${conditionType}
SYMPTOMS: ${symptoms.join(", ")}
TRIGGERS: ${triggers.length > 0 ? triggers.join(", ") : "none specified"}
PEAK FLOW: ${peakFlow || "not provided"} L/min
${actTotal !== null ? `ACT SCORE: ${actTotal}/25` : ""}
${catTotal !== null ? `CAT SCORE: ${catTotal}/40` : ""}

USER PROFILE: ${profileInfo}
USER MEDICATIONS: ${medicationList}

Provide a comprehensive lung health analysis as JSON.`;

    const result = await askClaudeJSON(prompt, systemPrompt, { userId: user.id });
    let analysis; try { analysis = JSON.parse(result); } catch { return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 }); }

    try {
      await supabase.from("query_history").insert({
        user_id: user.id,
        query_text: `Lung monitor: ${conditionType}, ${symptoms.join(", ")}`,
        response_text: `Assessment: ${analysis.lungHealthAssessment?.slice(0, 100)}`,
        query_type: "general",
      });
    } catch { /* Non-critical */ }

    return NextResponse.json({ analysis });
  } catch (err) {
    console.error("Lung monitor error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
