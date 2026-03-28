import { NextRequest, NextResponse } from "next/server";
import { askGeminiJSON } from "@/lib/gemini";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/sanitize";

export const maxDuration = 60;

const VALID_CONCERNS = ["acne", "eczema", "psoriasis", "rosacea", "dryness", "aging"];
const VALID_AREAS = [
  "face", "forehead", "cheeks", "chin", "nose",
  "neck", "chest", "back", "arms", "legs", "hands", "scalp",
];

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`skin-health:${clientIP}`, 10, 60_000);
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

    // Validate concern
    const concern = VALID_CONCERNS.includes(body.concern) ? body.concern : null;
    if (!concern) {
      return NextResponse.json(
        { error: lang === "tr" ? "Geçerli bir cilt sorunu seçin" : "Select a valid skin concern" },
        { status: 400 }
      );
    }

    // Validate severity 1-5
    const severity = Math.min(5, Math.max(1, Number(body.severity) || 3));

    // Validate affected areas
    const affectedAreas = Array.isArray(body.affected_areas)
      ? body.affected_areas.filter((a: string) => VALID_AREAS.includes(a))
      : [];

    const currentSkincare = body.current_skincare
      ? sanitizeInput(String(body.current_skincare)).slice(0, 1000)
      : "Not specified";

    // Fetch user medications and profile
    const [medsResult, profileResult, allergiesResult] = await Promise.all([
      supabase
        .from("user_medications")
        .select("medication_name, active_ingredient, dosage, frequency")
        .eq("user_id", user.id),
      supabase
        .from("user_profiles")
        .select("age, gender, chronic_conditions, is_pregnant, is_breastfeeding")
        .eq("id", user.id)
        .single(),
      supabase
        .from("user_allergies")
        .select("allergen, severity")
        .eq("user_id", user.id),
    ]);

    const medications = medsResult.data || [];
    const profile = profileResult.data;
    const allergies = allergiesResult.data || [];

    const medicationList = medications.length > 0
      ? medications.map((m) => `${m.medication_name}${m.active_ingredient ? ` (${m.active_ingredient})` : ""}`).join(", ")
      : "None reported";

    const allergyList = allergies.length > 0
      ? allergies.map((a) => `${a.allergen} (${a.severity})`).join(", ")
      : "None reported";

    const profileInfo = profile
      ? `Age: ${profile.age || "unknown"}, Gender: ${profile.gender || "unknown"}, Pregnant: ${profile.is_pregnant || false}, Breastfeeding: ${profile.is_breastfeeding || false}, Chronic conditions: ${profile.chronic_conditions?.join(", ") || "none"}`
      : "No profile data";

    const systemPrompt = `You are a dermatology-informed health analyst for Phytotherapy.ai. Analyze skin concerns and provide evidence-based skincare guidance.

RULES:
- Check medication effects on skin (isotretinoin dryness, corticosteroid thinning, photosensitizing drugs like doxycycline/NSAIDs)
- Recommend evidence-based supplements (zinc, omega-3, vitamin A, vitamin D, collagen) with drug interaction checks
- Provide a practical skincare routine (cleanser, moisturizer, treatment, sunscreen)
- Consider pregnancy/breastfeeding safety for all recommendations
- Use PubMed-backed evidence
- Respond in ${lang === "tr" ? "Turkish" : "English"}
- Never diagnose — suggest when to see a dermatologist

OUTPUT FORMAT (strict JSON):
{
  "skinHealthScore": <number 0-100>,
  "concernAnalysis": "<string: analysis of the specific concern>",
  "medicationEffects": [
    {
      "medication": "<drug name>",
      "skinEffect": "<how it affects skin>",
      "recommendation": "<what to do about it>"
    }
  ],
  "skincareRoutine": {
    "morning": [
      {"step": "<step name>", "product": "<product type>", "note": "<why>"}
    ],
    "evening": [
      {"step": "<step name>", "product": "<product type>", "note": "<why>"}
    ],
    "weekly": [
      {"step": "<step name>", "product": "<product type>", "note": "<why>"}
    ]
  },
  "supplements": [
    {
      "name": "<supplement name>",
      "dosage": "<dosage>",
      "duration": "<duration>",
      "benefit": "<skin benefit>",
      "safety": "<safe | caution | avoid>",
      "interactionNote": "<drug interaction or empty string>"
    }
  ],
  "lifestyleFactors": [<string: lifestyle tips for skin health, max 4>],
  "alertLevel": "<green | yellow | red>",
  "whenToSeeDoctor": [<string: warning signs>],
  "sources": [{"title": "<string>", "url": "<PubMed URL>"}]
}`;

    const prompt = `Analyze this skin concern and provide skincare guidance:

CONCERN: ${concern}
SEVERITY: ${severity}/5
AFFECTED AREAS: ${affectedAreas.length > 0 ? affectedAreas.join(", ") : "Not specified"}
CURRENT SKINCARE: ${currentSkincare}

USER PROFILE: ${profileInfo}
USER MEDICATIONS: ${medicationList}
USER ALLERGIES: ${allergyList}

Provide a comprehensive skin health analysis as JSON.`;

    const result = await askGeminiJSON(prompt, systemPrompt);
    const analysis = JSON.parse(result);

    // Save to query history
    try {
      await supabase.from("query_history").insert({
        user_id: user.id,
        query_text: `Skin health analysis: ${concern}, severity ${severity}/5`,
        response_text: `Score: ${analysis.skinHealthScore}/100`,
        query_type: "general",
      });
    } catch {
      // Non-critical
    }

    return NextResponse.json({ analysis });
  } catch (err) {
    console.error("Skin health analysis error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
