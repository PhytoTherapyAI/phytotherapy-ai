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
    const rateCheck = checkRateLimit(`smoking:${clientIP}`, 10, 60_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Please wait ${rateCheck.resetInSeconds} seconds.` },
        { status: 429, headers: { "Retry-After": String(rateCheck.resetInSeconds) } }
      );
    }

    const body = await request.json();
    const lang = (body.lang === "tr" ? "tr" : "en") as "en" | "tr";
    const quitDate = sanitizeInput(body.quit_date || "");
    const dailyCigs = Number(body.daily_cigarettes_before) || 20;
    const currentStatus = sanitizeInput(body.current_status || "planning");
    const nicotineTherapy = sanitizeInput(body.nicotine_therapy || "none");

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
            query_text: `Smoking: ${dailyCigs} cigs/day, status=${currentStatus}, NRT=${nicotineTherapy}`,
            query_type: "smoking_cessation" as string,
          });
        }
      } catch {
        // Continue as guest
      }
    }

    // Calculate days since quit
    let daysSinceQuit = 0;
    if (quitDate) {
      const qd = new Date(quitDate);
      const now = new Date();
      daysSinceQuit = Math.max(0, Math.floor((now.getTime() - qd.getTime()) / (1000 * 60 * 60 * 24)));
    }

    const systemPrompt = `You are a smoking cessation coach at Doctopal.

${profileContext ? `PATIENT: ${profileContext}` : ""}
${medications.length ? `MEDICATIONS: ${medications.join(", ")}` : ""}

Respond in ${tx("api.respondLang", lang)} with this exact JSON:
{
  "daysSinceQuit": ${daysSinceQuit},
  "healthRecoveryTimeline": [
    { "time": "20 minutes", "benefit": "Blood pressure and heart rate normalize", "achieved": true/false },
    { "time": "24 hours", "benefit": "Carbon monoxide levels return to normal", "achieved": true/false },
    { "time": "48 hours", "benefit": "Nerve endings begin to regrow, taste and smell improve", "achieved": true/false },
    { "time": "2 weeks", "benefit": "Circulation improves, lung function increases up to 30%", "achieved": true/false },
    { "time": "1 month", "benefit": "Coughing and shortness of breath decrease", "achieved": true/false },
    { "time": "1 year", "benefit": "Heart disease risk drops to half of a smoker's", "achieved": true/false },
    { "time": "5 years", "benefit": "Stroke risk equals a non-smoker's", "achieved": true/false },
    { "time": "10 years", "benefit": "Lung cancer risk drops to half", "achieved": true/false }
  ],
  "savingsEstimate": {
    "dailySavings": number,
    "monthlySavings": number,
    "yearlySavings": number,
    "currency": "${tx("api.smoking.currency", lang)}",
    "totalSaved": number
  },
  "cravingManagementTips": ["array of 5-6 practical tips"],
  "medicationNotes": [
    {
      "medication": "name",
      "note": "how quitting smoking affects this medication",
      "action": "what patient should discuss with doctor"
    }
  ],
  "nrtAdvice": "string — advice about their chosen NRT method",
  "motivationalMessage": "string — personalized encouragement",
  "disclaimer": "string"
}

RULES:
1. Mark timeline items as achieved based on daysSinceQuit
2. Savings: use average pack price (${tx("api.smoking.avgPackPrice", lang)})
3. Key medication interactions with quitting: CYP1A2 substrates (theophylline, clozapine, olanzapine) — doses may need REDUCTION after quitting. Bupropion+SSRI caution. Insulin sensitivity changes.
4. Smoking induces CYP1A2 — quitting means drug levels may INCREASE
5. NRT guidance based on their chosen method
6. If status is "planning", be encouraging and focus on preparation
7. If "reducing", acknowledge progress and suggest gradual reduction plan`;

    const result = await askGeminiJSON(
      `Smoking cessation plan: ${dailyCigs} cigarettes/day, status: ${currentStatus}, quit date: ${quitDate || "not set"}, NRT: ${nicotineTherapy}, days smoke-free: ${daysSinceQuit}`,
      systemPrompt
    );

    let parsed;
    try {
      parsed = typeof result === "string" ? JSON.parse(result) : result;
    } catch {
      return NextResponse.json(
        { error: tx("api.smoking.analysisFailed", lang) },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Smoking cessation API error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
