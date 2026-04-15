// © 2026 DoctoPal — All Rights Reserved
import { NextRequest, NextResponse } from "next/server";
import { askGeminiJSON } from "@/lib/ai-client";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { tx } from "@/lib/translations";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`liver-monitor:${clientIP}`, 10, 60_000);
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

    const alt = Number(body.alt) || 0;
    const ast = Number(body.ast) || 0;
    const ggt = Number(body.ggt) || 0;
    const bilirubin = Number(body.bilirubin) || 0;
    const albumin = Number(body.albumin) || 0;
    const bmi = Number(body.bmi) || 0;
    const waistCircumference = Number(body.waist_circumference) || 0;

    if (alt <= 0 && ast <= 0) {
      return NextResponse.json(
        { error: tx("api.liverMonitor.altOrAst", lang) },
        { status: 400 }
      );
    }

    const [medsResult, profileResult] = await Promise.all([
      supabase
        .from("user_medications")
        .select("brand_name, generic_name, dosage, frequency")
        .eq("user_id", user.id),
      supabase
        .from("user_profiles")
        .select("age, gender, chronic_conditions, liver_disease")
        .eq("id", user.id)
        .single(),
    ]);

    const medications = medsResult.data || [];
    const profile = profileResult.data;

    const medicationList = medications.length > 0
      ? medications.map((m) => `${(m.generic_name || m.brand_name)}${m.generic_name ? ` (${m.generic_name})` : ""}`).join(", ")
      : "None reported";

    const profileInfo = profile
      ? `Age: ${profile.age || "unknown"}, Gender: ${profile.gender || "unknown"}, Chronic conditions: ${profile.chronic_conditions?.join(", ") || "none"}, Known liver disease: ${profile.liver_disease || false}`
      : "No profile data";

    const systemPrompt = `You are a hepatology-informed health analyst for DoctoPal. Analyze liver lab values and provide evidence-based liver health guidance.

RULES:
- Identify hepatotoxic medications: paracetamol/acetaminophen (chronic >4g/day), statins (monitor LFTs), methotrexate (hepatotoxic cumulative), isoniazid, valproate, amiodarone, phenytoin, ketoconazole
- Calculate Fatty Liver Index (FLI) if BMI and waist circumference available: FLI = (e^(0.953*ln(triglycerides) + 0.139*BMI + 0.718*ln(GGT) + 0.053*waist - 15.745)) / (1 + e^(...)) * 100. If not enough data, estimate risk qualitatively.
- AST/ALT ratio interpretation: >2 suggests alcoholic liver disease, <1 suggests NAFLD
- Flag dangerously elevated values (ALT/AST >10x ULN = urgent)
- Use PubMed-backed evidence
- Respond in ${tx("api.respondLang", lang)}
- Never diagnose — suggest when to see a hepatologist/gastroenterologist

OUTPUT FORMAT (strict JSON):
{
  "liverHealthScore": <number 0-100>,
  "labInterpretation": {
    "alt": "<string: interpretation>",
    "ast": "<string: interpretation>",
    "ggt": "<string: interpretation>",
    "bilirubin": "<string: interpretation>",
    "albumin": "<string: interpretation>",
    "astAltRatio": "<string: ratio interpretation>"
  },
  "hepatotoxicMeds": [
    {
      "medication": "<drug name>",
      "liverRisk": "<how it affects liver>",
      "riskLevel": "<low | moderate | high>",
      "monitoring": "<what monitoring is needed>"
    }
  ],
  "fattyLiverIndex": {
    "score": <number or null>,
    "category": "<low | intermediate | high | insufficient_data>",
    "interpretation": "<string>"
  },
  "recommendations": [
    {
      "category": "<e.g. Diet, Exercise, Alcohol, Supplements>",
      "advice": "<specific advice>",
      "priority": "<high | medium | low>"
    }
  ],
  "supplements": [
    {
      "name": "<supplement name>",
      "dosage": "<dosage>",
      "benefit": "<liver benefit>",
      "safety": "<safe | caution | avoid>",
      "interactionNote": "<drug interaction or empty string>"
    }
  ],
  "alertLevel": "<green | yellow | red>",
  "alertMessage": "<string: critical alert or empty>",
  "whenToSeeDoctor": [<string: warning signs>],
  "sources": [{"title": "<string>", "url": "<PubMed URL>"}]
}`;

    const prompt = `Analyze these liver lab values:

ALT: ${alt || "not provided"} U/L
AST: ${ast || "not provided"} U/L
GGT: ${ggt || "not provided"} U/L
BILIRUBIN: ${bilirubin || "not provided"} mg/dL
ALBUMIN: ${albumin || "not provided"} g/dL
BMI: ${bmi || "not provided"}
WAIST CIRCUMFERENCE: ${waistCircumference || "not provided"} cm

USER PROFILE: ${profileInfo}
USER MEDICATIONS: ${medicationList}

Provide a comprehensive liver health analysis as JSON.`;

    const result = await askGeminiJSON(prompt, systemPrompt, { userId: user.id });
    let analysis; try { analysis = JSON.parse(result); } catch { return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 }); }

    try {
      await supabase.from("query_history").insert({
        user_id: user.id,
        query_text: `Liver monitor: ALT ${alt}, AST ${ast}`,
        response_text: `Score: ${analysis.liverHealthScore}/100`,
        query_type: "general",
      });
    } catch { /* Non-critical */ }

    return NextResponse.json({ analysis });
  } catch (err) {
    console.error("Liver monitor error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
