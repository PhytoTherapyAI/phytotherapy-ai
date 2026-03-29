import { NextRequest, NextResponse } from "next/server";
import { askGeminiJSON } from "@/lib/gemini";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";

export const maxDuration = 60;

const VALID_CONCERNS = ["hair_loss", "thinning", "brittle_nails", "nail_discoloration", "slow_growth", "dandruff", "dry_hair", "split_ends"];
const VALID_DURATIONS = ["less_than_1_month", "1_3_months", "3_6_months", "6_12_months", "over_1_year"];

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`hair-nail:${clientIP}`, 10, 60_000);
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

    const concerns = Array.isArray(body.concerns)
      ? body.concerns.filter((c: string) => VALID_CONCERNS.includes(c))
      : [];

    if (concerns.length === 0) {
      return NextResponse.json(
        { error: lang === "tr" ? "En az bir sorun seçin" : "Select at least one concern" },
        { status: 400 }
      );
    }

    const duration = VALID_DURATIONS.includes(body.duration) ? body.duration : "less_than_1_month";

    const [medsResult, profileResult] = await Promise.all([
      supabase
        .from("user_medications")
        .select("brand_name, generic_name, dosage, frequency")
        .eq("user_id", user.id),
      supabase
        .from("user_profiles")
        .select("age, gender, chronic_conditions, is_pregnant, is_breastfeeding")
        .eq("id", user.id)
        .single(),
    ]);

    const medications = medsResult.data || [];
    const profile = profileResult.data;

    const medicationList = medications.length > 0
      ? medications.map((m) => `${(m.generic_name || m.brand_name)}${m.generic_name ? ` (${m.generic_name})` : ""}`).join(", ")
      : "None reported";

    const profileInfo = profile
      ? `Age: ${profile.age || "unknown"}, Gender: ${profile.gender || "unknown"}, Pregnant: ${profile.is_pregnant || false}, Breastfeeding: ${profile.is_breastfeeding || false}, Chronic conditions: ${profile.chronic_conditions?.join(", ") || "none"}`
      : "No profile data";

    const systemPrompt = `You are a dermatology/trichology-informed health analyst for Phytotherapy.ai. Analyze hair and nail concerns and provide evidence-based guidance.

RULES:
- Check medication effects: chemotherapy→alopecia, isotretinoin→hair thinning/dry, valproic acid→hair loss, lithium→hair changes, methotrexate→alopecia, beta-blockers→hair loss, ACE inhibitors→hair loss, anticoagulants→hair loss, retinoids→nail brittleness
- Check nutritional deficiency links: iron/ferritin (hair loss), zinc (hair+nails), biotin (nails), thyroid dysfunction (hair), vitamin D (hair loss), selenium (nail health)
- Recommend labs to check based on symptoms
- Recommend evidence-based supplements with drug interaction checks
- Use PubMed-backed evidence
- Respond in ${lang === "tr" ? "Turkish" : "English"}
- Never diagnose — suggest when to see a dermatologist

OUTPUT FORMAT (strict JSON):
{
  "overallAssessment": "<string: overall assessment>",
  "medicationEffects": [
    {
      "medication": "<drug name>",
      "effect": "<how it affects hair/nails>",
      "riskLevel": "<low | moderate | high>",
      "recommendation": "<what to do>"
    }
  ],
  "nutritionalDeficiencies": [
    {
      "nutrient": "<nutrient name>",
      "likelihood": "<possible | likely | unlikely>",
      "symptoms": "<related symptoms>",
      "labTest": "<recommended lab test>"
    }
  ],
  "recommendedLabs": [
    {
      "test": "<lab test name>",
      "reason": "<why needed>"
    }
  ],
  "supplements": [
    {
      "name": "<supplement name>",
      "dosage": "<dosage>",
      "duration": "<duration>",
      "benefit": "<hair/nail benefit>",
      "safety": "<safe | caution | avoid>",
      "interactionNote": "<drug interaction or empty string>"
    }
  ],
  "lifestyleTips": [<string: practical tips, max 5>],
  "alertLevel": "<green | yellow | red>",
  "whenToSeeDoctor": [<string: warning signs>],
  "sources": [{"title": "<string>", "url": "<PubMed URL>"}]
}`;

    const prompt = `Analyze these hair and nail concerns:

CONCERNS: ${concerns.join(", ")}
DURATION: ${duration.replace(/_/g, " ")}

USER PROFILE: ${profileInfo}
USER MEDICATIONS: ${medicationList}

Provide a comprehensive hair and nail health analysis as JSON.`;

    const result = await askGeminiJSON(prompt, systemPrompt);
    const analysis = JSON.parse(result);

    try {
      await supabase.from("query_history").insert({
        user_id: user.id,
        query_text: `Hair & nail analysis: ${concerns.join(", ")}`,
        response_text: `Assessment: ${analysis.overallAssessment?.slice(0, 100)}`,
        query_type: "general",
      });
    } catch { /* Non-critical */ }

    return NextResponse.json({ analysis });
  } catch (err) {
    console.error("Hair nail health analysis error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
