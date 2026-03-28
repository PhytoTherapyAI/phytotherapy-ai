import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { askGeminiJSON } from "@/lib/gemini";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`anxiety:${clientIP}`, 5, 60_000);
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
      anxiety_level = 5,
      panic_attack = false,
      symptoms = [],
      avoidance_behaviors = [],
      gad7_answers = [],
    } = body;

    // CRITICAL: panic attack → immediate grounding, no AI needed
    if (panic_attack) {
      return NextResponse.json({
        result: {
          anxietyLevel: anxiety_level,
          panicProtocol: true,
          gad7Score: null,
          gad7Severity: null,
          techniques: [
            {
              name: lang === "tr" ? "5-4-3-2-1 Topraklama" : "5-4-3-2-1 Grounding",
              steps: lang === "tr"
                ? [
                    "5 gorebildiginiz sey sayın",
                    "4 dokunabildiginiz sey sayın",
                    "3 duyabildiginiz sey sayın",
                    "2 koklayabildiginiz sey sayın",
                    "1 tadabildiginiz sey sayın",
                  ]
                : [
                    "Name 5 things you can SEE",
                    "Name 4 things you can TOUCH",
                    "Name 3 things you can HEAR",
                    "Name 2 things you can SMELL",
                    "Name 1 thing you can TASTE",
                  ],
            },
            {
              name: lang === "tr" ? "Kare Nefes (4-4-4-4)" : "Box Breathing (4-4-4-4)",
              steps: lang === "tr"
                ? ["4 saniye nefes alın", "4 saniye tutun", "4 saniye verin", "4 saniye bekleyin", "5 kez tekrarlayın"]
                : ["Breathe in for 4 seconds", "Hold for 4 seconds", "Breathe out for 4 seconds", "Hold for 4 seconds", "Repeat 5 times"],
            },
          ],
          cognitiveDistortions: [],
          recommendations: [
            lang === "tr"
              ? "Panik atak tehlikeli degildir ve gecicidir. Simdi guvendesiniz."
              : "A panic attack is not dangerous and will pass. You are safe right now.",
            lang === "tr"
              ? "Topraklama egzersizini yapin ve nefes almaya odaklanin."
              : "Focus on the grounding exercise and controlled breathing.",
            lang === "tr"
              ? "Panik ataklar tekrarliyorsa bir ruh sağlığı uzmaniyla gorusmek önemlidir."
              : "If panic attacks recur, it is important to see a mental health professional.",
          ],
          alertLevel: "yellow",
          professionalReferral: true,
          crisisLine: lang === "tr" ? "Kriz hattı: 182" : "Crisis line: 988",
        },
      });
    }

    // Calculate GAD-7 score if answers provided
    let gad7Score: number | null = null;
    let gad7Severity: string | null = null;
    if (gad7_answers.length === 7) {
      const score = gad7_answers.reduce((sum: number, val: number) => sum + val, 0);
      gad7Score = score;
      if (score <= 4) gad7Severity = "minimal";
      else if (score <= 9) gad7Severity = "mild";
      else if (score <= 14) gad7Severity = "moderate";
      else gad7Severity = "severe";
    }

    // Fetch user medications
    const { data: medications } = await supabase
      .from("user_medications")
      .select("medication_name, active_ingredient, dosage")
      .eq("user_id", user.id);

    const medicationList = medications && medications.length > 0
      ? medications.map((m) => `${m.medication_name}${m.active_ingredient ? ` (${m.active_ingredient})` : ""}`).join(", ")
      : "None reported";

    const systemPrompt = `You are an anxiety assessment assistant for Phytotherapy.ai.
You provide evidence-based anxiety management guidance.

CRITICAL SAFETY RULES:
- NEVER prescribe medication
- NEVER suggest supplements during active panic
- Always recommend professional help for GAD-7 >= 10 (moderate+)
- You are NOT a therapist — provide psychoeducation and coping strategies
- Check medications for anxiety-related interactions (caffeine + stimulants, etc.)
- Be warm, supportive, validating

Respond in ${lang === "tr" ? "Turkish" : "English"}.

Return ONLY valid JSON:
{
  "anxietyLevel": <number 1-10>,
  "techniques": [{ "name": string, "steps": [string] }],
  "cognitiveDistortions": [{ "distortion": string, "description": string, "reframe": string }],
  "recommendations": [string, max 5],
  "medicationNotes": string,
  "alertLevel": "green" | "yellow" | "red",
  "professionalReferral": boolean,
  "breathingExercise": { "name": string, "pattern": string, "duration": string }
}`;

    const prompt = `Analyze this anxiety assessment:

ANXIETY LEVEL: ${anxiety_level}/10
PANIC ATTACK: ${panic_attack}
GAD-7 SCORE: ${gad7Score !== null ? `${gad7Score}/21 (${gad7Severity})` : "Not completed"}
SYMPTOMS: ${symptoms.length > 0 ? symptoms.join(", ") : "None selected"}
AVOIDANCE BEHAVIORS: ${avoidance_behaviors.length > 0 ? avoidance_behaviors.join(", ") : "None selected"}
USER MEDICATIONS: ${medicationList}

Provide a supportive anxiety assessment with coping techniques, cognitive distortion identification, and recommendations.
If GAD-7 >= 10 or anxiety_level >= 8, set professionalReferral to true and alertLevel to at least "yellow".
If GAD-7 >= 15 or anxiety_level >= 9, set alertLevel to "red".`;

    const resultText = await askGeminiJSON(prompt, systemPrompt);
    const analysis = JSON.parse(resultText);

    // Enforce safety overrides
    if (gad7Score !== null && gad7Score >= 15) {
      analysis.alertLevel = "red";
      analysis.professionalReferral = true;
    } else if (gad7Score !== null && gad7Score >= 10) {
      if (analysis.alertLevel === "green") analysis.alertLevel = "yellow";
      analysis.professionalReferral = true;
    }
    if (anxiety_level >= 9) {
      analysis.alertLevel = "red";
      analysis.professionalReferral = true;
    }

    return NextResponse.json({
      result: {
        ...analysis,
        panicProtocol: false,
        gad7Score,
        gad7Severity,
        crisisLine: lang === "tr" ? "Kriz hattı: 182" : "Crisis line: 988",
      },
    });
  } catch (err) {
    console.error("Anxiety toolkit error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
