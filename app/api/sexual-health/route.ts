// © 2026 Doctopal — All Rights Reserved
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { askGeminiJSON } from "@/lib/ai-client";
import { tx } from "@/lib/translations";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`sexual-health:${clientIP}`, 5, 60_000);
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
      concerns = [],
      age = 30,
      gender = "not_specified",
    } = body;

    // Fetch user medications — check ALL for sexual side effects
    const { data: medications } = await supabase
      .from("user_medications")
      .select("brand_name, generic_name, dosage")
      .eq("user_id", user.id);

    const medicationList = medications && medications.length > 0
      ? medications.map((m) => `${(m.generic_name || m.brand_name)}${m.generic_name ? ` (${m.generic_name})` : ""}`).join(", ")
      : "None reported";

    // Comprehensive list of medications with sexual side effects
    const sexualEffectDatabase: Record<string, { effect: string; prevalence: string }> = {
      sertraline: { effect: "decreased libido, delayed orgasm, erectile dysfunction", prevalence: "40-65%" },
      fluoxetine: { effect: "decreased libido, anorgasmia", prevalence: "40-70%" },
      paroxetine: { effect: "decreased libido, delayed orgasm (highest SSRI rate)", prevalence: "50-70%" },
      citalopram: { effect: "decreased libido, delayed orgasm", prevalence: "35-50%" },
      escitalopram: { effect: "decreased libido, delayed orgasm", prevalence: "35-50%" },
      venlafaxine: { effect: "decreased libido, delayed orgasm", prevalence: "30-50%" },
      duloxetine: { effect: "decreased libido, erectile dysfunction", prevalence: "20-40%" },
      finasteride: { effect: "erectile dysfunction, decreased libido, ejaculatory disorder", prevalence: "5-15%" },
      dutasteride: { effect: "erectile dysfunction, decreased libido", prevalence: "5-15%" },
      propranolol: { effect: "erectile dysfunction, decreased libido", prevalence: "10-20%" },
      atenolol: { effect: "erectile dysfunction", prevalence: "10-15%" },
      metoprolol: { effect: "erectile dysfunction", prevalence: "10-15%" },
      spironolactone: { effect: "decreased libido, gynecomastia, menstrual irregularity", prevalence: "10-30%" },
      gabapentin: { effect: "decreased libido, anorgasmia", prevalence: "10-20%" },
      pregabalin: { effect: "decreased libido, erectile dysfunction", prevalence: "5-15%" },
      isotretinoin: { effect: "decreased libido (rare, debated)", prevalence: "1-5%" },
      oxycodone: { effect: "hypogonadism, decreased libido, erectile dysfunction", prevalence: "50-80%" },
      tramadol: { effect: "decreased libido, delayed ejaculation", prevalence: "20-40%" },
    };

    // Match user medications to known sexual effects
    const matchedEffects: Array<{ medication: string; effect: string; prevalence: string }> = [];
    if (medications) {
      for (const med of medications) {
        const name = (med.generic_name || med.brand_name || "").toLowerCase();
        const ingredient = (med.generic_name || "").toLowerCase();
        for (const [drug, info] of Object.entries(sexualEffectDatabase)) {
          if (name.includes(drug) || ingredient.includes(drug)) {
            matchedEffects.push({
              medication: med.generic_name || med.brand_name,
              ...info,
            });
          }
        }
      }
    }

    const systemPrompt = `You are a sexual health assistant for Doctopal.
You provide clinical, evidence-based sexual health guidance in a professional, non-judgmental tone.

CRITICAL SAFETY RULES:
- Maintain clinical, respectful, professional tone throughout
- NEVER replace a doctor consultation — always recommend discussing with healthcare provider
- NEVER suggest stopping medications for sexual side effects without doctor approval
- STI screening recommendations based on CDC/WHO guidelines
- Age-appropriate screening reminders
- If user reports pain during intercourse, recommend seeing a doctor
- If user reports any non-consensual experience, provide crisis resources
- Keep all information medical and factual

Respond in ${tx("api.respondLang", lang)}.

Return ONLY valid JSON:
{
  "medicationSexualEffects": [{ "medication": string, "effects": string, "prevalence": string, "alternatives": string, "action": string }],
  "screeningSchedule": [{ "test": string, "frequency": string, "ageGroup": string, "note": string }],
  "concernAddressed": [{ "concern": string, "information": string, "recommendation": string }],
  "safetyInfo": [string],
  "recommendations": [string],
  "supplementSuggestions": [{ "name": string, "evidence": string, "safetyNote": string }],
  "professionalReferral": boolean
}`;

    const prompt = `Analyze this sexual health assessment:

AGE: ${age}
GENDER: ${gender}
CONCERNS: ${concerns.length > 0 ? concerns.join(", ") : "General sexual health check"}
USER MEDICATIONS: ${medicationList}
PRE-MATCHED MEDICATION EFFECTS: ${matchedEffects.length > 0 ? JSON.stringify(matchedEffects) : "None found"}

Provide:
1. Complete medication sexual side effect analysis (confirm/expand pre-matched data)
2. Age-appropriate STI screening schedule (CDC guidelines)
3. Address each listed concern with medical information
4. General sexual health recommendations
5. Evidence-based supplement suggestions only if safe with their medications
6. Professional referral recommendation

Maintain clinical, professional tone throughout.`;

    const resultText = await askGeminiJSON(prompt, systemPrompt);
    let analysis; try { analysis = JSON.parse(resultText); } catch { return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 }); }

    return NextResponse.json({
      result: {
        ...analysis,
        age,
        gender,
        preMatchedEffects: matchedEffects,
      },
    });
  } catch (err) {
    console.error("Sexual health error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
