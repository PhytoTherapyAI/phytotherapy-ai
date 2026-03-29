import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { askGeminiJSON } from "@/lib/gemini";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`adhd:${clientIP}`, 5, 60_000);
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
    const lang = body.lang === "tr" ? "tr" : "en";
    const {
      focus_score = 5,
      distractibility_events = 0,
      medication_effectiveness = 3,
      pomodoro_completed = 0,
      sleep_hours = 7,
      caffeine_intake = 0,
      exercise_today = false,
    } = body;

    // Fetch user medications
    const { data: medications } = await supabase
      .from("user_medications")
      .select("brand_name, generic_name, dosage")
      .eq("user_id", user.id);

    const medicationList = medications && medications.length > 0
      ? medications.map((m) => `${(m.generic_name || m.brand_name)}${m.generic_name ? ` (${m.generic_name})` : ""}`).join(", ")
      : "None reported";

    // Check for stimulant medications
    const stimulantKeywords = [
      "methylphenidate", "ritalin", "concerta", "adderall", "amphetamine",
      "dextroamphetamine", "vyvanse", "lisdexamfetamine", "atomoxetine",
      "strattera", "modafinil", "provigil",
    ];
    const hasStimulant = medications?.some((m) =>
      stimulantKeywords.some((kw) =>
        ((m.generic_name || m.brand_name)?.toLowerCase() || "").includes(kw) ||
        (m.generic_name?.toLowerCase() || "").includes(kw)
      )
    );

    const systemPrompt = `You are an ADHD management assistant for Phytotherapy.ai.
You provide evidence-based focus and productivity guidance for people with ADHD.

CRITICAL SAFETY RULES:
- NEVER diagnose ADHD — you help manage it, not diagnose it
- NEVER suggest changing medication dose without doctor consultation
- Check caffeine-stimulant interactions (caffeine + methylphenidate = increased heart rate, anxiety)
- Always validate the struggle — ADHD is neurobiological, not laziness
- Be encouraging, practical, understanding
- Focus on actionable, concrete tips

Respond in ${lang === "tr" ? "Turkish" : "English"}.

Return ONLY valid JSON:
{
  "focusTrend": "improving" | "stable" | "declining",
  "focusAnalysis": string,
  "medicationEffectivenessAnalysis": string,
  "caffeineInteraction": string | null,
  "productivityTips": [string, max 5],
  "environmentTips": [string, max 3],
  "supplementSuggestions": [{ "name": string, "dose": string, "evidence": string, "safetyNote": string }],
  "pomodoroFeedback": string,
  "sleepImpact": string,
  "exerciseImpact": string
}`;

    const prompt = `Analyze this ADHD management data:

FOCUS SCORE: ${focus_score}/10
DISTRACTIBILITY EVENTS TODAY: ${distractibility_events}
MEDICATION EFFECTIVENESS: ${medication_effectiveness}/5
POMODORO COMPLETED: ${pomodoro_completed}
SLEEP HOURS: ${sleep_hours}
CAFFEINE INTAKE: ${caffeine_intake} cups
EXERCISE TODAY: ${exercise_today}
USER MEDICATIONS: ${medicationList}
HAS STIMULANT MEDICATION: ${hasStimulant ? "YES" : "NO"}

Provide practical ADHD management feedback. If user has stimulant medication AND high caffeine, warn about interaction.
Suggest evidence-based supplements only if safe with their medications (omega-3, magnesium, zinc, L-theanine).`;

    const resultText = await askGeminiJSON(prompt, systemPrompt);
    const analysis = JSON.parse(resultText);

    return NextResponse.json({
      result: {
        ...analysis,
        focusScore: focus_score,
        pomodoroCompleted: pomodoro_completed,
        hasStimulant,
      },
    });
  } catch (err) {
    console.error("ADHD management error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
