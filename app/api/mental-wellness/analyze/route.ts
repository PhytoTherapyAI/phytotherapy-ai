// © 2026 DoctoPal — All Rights Reserved
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { askClaudeJSON } from "@/lib/ai-client";
import { tx } from "@/lib/translations";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`mw-analyze:${clientIP}`, 5, 60_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Please wait ${rateCheck.resetInSeconds} seconds.` },
        { status: 429, headers: { "Retry-After": String(rateCheck.resetInSeconds) } }
      );
    }

    let userId: string | undefined;
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

    // Fetch mood records (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: records, error: recordsError } = await supabase
      .from("mood_records")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", thirtyDaysAgo.toISOString().split("T")[0])
      .order("date", { ascending: true });

    if (recordsError) {
      console.error("Mood records fetch error:", recordsError);
      return NextResponse.json({ error: "Failed to fetch records" }, { status: 500 });
    }

    if (!records || records.length < 7) {
      return NextResponse.json(
        { error: tx("api.mentalWellness.minDays", lang) },
        { status: 400 }
      );
    }

    // Fetch user medications
    const { data: medications } = await supabase
      .from("user_medications")
      .select("brand_name, generic_name, dosage")
      .eq("user_id", user.id);

    // Check for critical patterns BEFORE AI — immediate red alert
    const recentRecords = records.slice(-7);
    const highAnxietyStress = recentRecords.filter(
      (r) => (r.anxiety >= 4 || r.stress >= 4)
    );
    const decliningMood = recentRecords.length >= 3 &&
      recentRecords.slice(-3).every((r) => r.mood <= 2);

    // Check notes for suicidal ideation keywords
    const suicidalKeywords = [
      "suicide", "suicidal", "kill myself", "end my life", "want to die",
      "intihar", "kendimi oldur", "yasamak istemiyorum", "olmek istiyorum",
    ];
    const hasSuicidalContent = records.some((r) =>
      r.notes && suicidalKeywords.some((kw) =>
        r.notes.toLowerCase().includes(kw)
      )
    );

    if (hasSuicidalContent) {
      return NextResponse.json({
        analysis: {
          overallTrend: "critical",
          averageScores: calculateAverages(records),
          topTriggers: [],
          effectiveCoping: [],
          medicationNotes: "",
          patterns: [],
          recommendations: [],
          alertLevel: "red",
          professionalReferral: true,
          crisisMessage: tx("api.mentalWellness.crisisMessage", lang),
        },
      });
    }

    const systemPrompt = `You are a mental wellness analysis assistant for DoctoPal.
Analyze mood tracking data and provide supportive, evidence-informed insights.

CRITICAL SAFETY RULES:
- If anxiety/stress scores are consistently 4-5 AND mood is declining, set alertLevel to "yellow" and professionalReferral to true
- NEVER suggest supplements or herbs for mental health crises
- Always recommend professional help for persistent high stress/anxiety patterns
- You are NOT a therapist — provide pattern observations, not diagnoses
- Be warm, supportive, non-judgmental

Respond in ${tx("api.respondLang", lang)}.

Return ONLY valid JSON with this structure:
{
  "overallTrend": "improving" | "stable" | "declining" | "fluctuating",
  "averageScores": { "mood": number, "energy": number, "stress": number, "anxiety": number, "focus": number },
  "topTriggers": [{ "trigger": string, "frequency": number, "avgMoodImpact": number }],
  "effectiveCoping": [{ "method": string, "effectiveness": string }],
  "medicationNotes": string,
  "patterns": [string],
  "recommendations": [string],
  "alertLevel": "green" | "yellow" | "red",
  "professionalReferral": boolean
}`;

    const prompt = `Analyze this mental wellness data:

MOOD RECORDS (last ${records.length} days):
${JSON.stringify(records.map((r) => ({
  date: r.date,
  mood: r.mood,
  energy: r.energy,
  stress: r.stress,
  anxiety: r.anxiety,
  focus: r.focus,
  triggers: r.triggers,
  coping_methods: r.coping_methods,
  notes: r.notes ? r.notes.slice(0, 100) : null,
})), null, 2)}

USER MEDICATIONS: ${medications && medications.length > 0
  ? JSON.stringify(medications)
  : "None reported"}

SAFETY FLAG: ${highAnxietyStress.length >= 5 ? "HIGH — anxiety/stress consistently elevated" : "normal"}
DECLINING MOOD: ${decliningMood ? "YES — mood <= 2 for last 3+ days" : "no"}

Provide a supportive, actionable analysis. If alertLevel is yellow or red, professionalReferral MUST be true.`;

    const resultText = await askClaudeJSON(prompt, systemPrompt, { userId });
    let analysis; try { analysis = JSON.parse(resultText); } catch { return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 }); }

    // Enforce safety: override if patterns are concerning
    if (highAnxietyStress.length >= 5 && decliningMood) {
      analysis.alertLevel = analysis.alertLevel === "red" ? "red" : "yellow";
      analysis.professionalReferral = true;
    }

    return NextResponse.json({ analysis });
  } catch (err) {
    console.error("Mental wellness analyze error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function calculateAverages(records: Array<{
  mood: number;
  energy: number;
  stress: number;
  anxiety: number;
  focus: number;
}>) {
  const len = records.length;
  if (len === 0) return { mood: 0, energy: 0, stress: 0, anxiety: 0, focus: 0 };

  const sums = records.reduce(
    (acc, r) => ({
      mood: acc.mood + (r.mood || 0),
      energy: acc.energy + (r.energy || 0),
      stress: acc.stress + (r.stress || 0),
      anxiety: acc.anxiety + (r.anxiety || 0),
      focus: acc.focus + (r.focus || 0),
    }),
    { mood: 0, energy: 0, stress: 0, anxiety: 0, focus: 0 }
  );

  return {
    mood: Math.round((sums.mood / len) * 10) / 10,
    energy: Math.round((sums.energy / len) * 10) / 10,
    stress: Math.round((sums.stress / len) * 10) / 10,
    anxiety: Math.round((sums.anxiety / len) * 10) / 10,
    focus: Math.round((sums.focus / len) * 10) / 10,
  };
}
