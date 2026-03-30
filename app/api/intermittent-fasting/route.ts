import { NextRequest, NextResponse } from "next/server";
import { askGeminiJSON } from "@/lib/gemini";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/sanitize";
import { tx } from "@/lib/translations";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`fasting:${clientIP}`, 10, 60_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Please wait ${rateCheck.resetInSeconds} seconds.` },
        { status: 429, headers: { "Retry-After": String(rateCheck.resetInSeconds) } }
      );
    }

    const body = await request.json();
    const lang = (body.lang === "tr" ? "tr" : "en") as "en" | "tr";
    const protocol = sanitizeInput(body.protocol || "16_8");
    const eatingWindowStart = sanitizeInput(body.eating_window_start || "12:00");
    const eatingWindowEnd = sanitizeInput(body.eating_window_end || "20:00");
    const ramadanMode = body.ramadan_mode === true;

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
            .select("age, gender, is_pregnant, kidney_disease, liver_disease, has_diabetes")
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
            if (profile.has_diabetes) parts.push("Diabetes");
            profileContext = parts.join(". ");
          }

          await supabase.from("query_history").insert({
            user_id: user.id,
            query_text: `Fasting: ${protocol}, window ${eatingWindowStart}-${eatingWindowEnd}${ramadanMode ? " (Ramadan)" : ""}`,
            query_type: "intermittent_fasting" as string,
          });
        }
      } catch {
        // Continue as guest
      }
    }

    const systemPrompt = `You are an intermittent fasting and medication timing specialist at Phytotherapy.ai.

${profileContext ? `PATIENT: ${profileContext}` : ""}
${medications.length ? `MEDICATIONS: ${medications.join(", ")}` : ""}

Respond in ${tx("api.respondLang", lang)} with this exact JSON:
{
  "fastingPlan": {
    "protocol": "${protocol}",
    "eatingWindow": "${eatingWindowStart} - ${eatingWindowEnd}",
    "fastingHours": number,
    "eatingHours": number,
    "description": "string explaining this protocol"
  },
  "medicationTimingAdjustments": [
    {
      "medication": "name",
      "requirement": "empty stomach / with food / specific timing",
      "currentTiming": "how to take during this fasting window",
      "adjustment": "specific time recommendation",
      "severity": "safe" | "caution" | "critical",
      "warning": "any safety warning"
    }
  ],
  "safetyWarnings": ["array of important safety notes"],
  "ramadanNotes": ${ramadanMode ? '"string with Ramadan-specific guidance"' : 'null'},
  "hydrationPlan": "string — water/fluid intake guidance during fasting",
  "breakfastSuggestions": ["what to eat when breaking fast"],
  "disclaimer": "string"
}

RULES:
1. CRITICAL medication timing:
   - Levothyroxine: MUST be taken on empty stomach, 30-60min before food
   - Metformin: MUST be taken WITH food to prevent GI issues
   - Insulin: MUST be timed with meals — fasting requires dose adjustment by doctor
   - PPIs (omeprazole): before first meal of the day
   - Bisphosphonates: empty stomach, 30min before food
   - ACE inhibitors: consistent timing important
   - Statins: some best taken at night (simvastatin)
2. If patient takes insulin or sulfonylureas: CRITICAL warning about hypoglycemia risk
3. Pregnancy: fasting NOT recommended
4. Kidney disease: extended fasting requires medical supervision
5. Diabetes: must consult endocrinologist before fasting
6. Ramadan mode: dawn-to-sunset fasting, suhoor/iftar timing considerations`;

    const result = await askGeminiJSON(
      `Intermittent fasting plan: Protocol ${protocol}, eating window ${eatingWindowStart}-${eatingWindowEnd}${ramadanMode ? ", Ramadan mode" : ""}`,
      systemPrompt
    );

    let parsed;
    try {
      parsed = typeof result === "string" ? JSON.parse(result) : result;
    } catch {
      return NextResponse.json(
        { error: tx("api.intermittentFasting.analysisFailed", lang) },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Intermittent fasting API error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
