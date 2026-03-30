import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { askGeminiJSON } from "@/lib/gemini";
import { tx } from "@/lib/translations";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`grief:${clientIP}`, 5, 60_000);
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
    const { stage, mood_score } = body;
    const lang = (body.lang === "tr" ? "tr" : "en") as "en" | "tr";

    const validStages = ["denial", "anger", "bargaining", "depression", "acceptance"];
    if (!stage || !validStages.includes(stage)) {
      return NextResponse.json({ error: "Please select a valid grief stage." }, { status: 400 });
    }

    const moodValue = typeof mood_score === "number" ? Math.min(10, Math.max(1, mood_score)) : 5;

    const systemPrompt = `You are a compassionate grief support counselor. Provide warm, empathetic, evidence-based support for people going through grief. Never minimize their feelings. Always recommend professional help when appropriate.

Respond in ${tx("api.respondLang", lang)}.

Return JSON with this exact structure:
{
  "stageName": "Name of the grief stage",
  "stageDescription": "What this stage typically feels like",
  "validation": "A warm, empathetic message validating their current feelings",
  "copingStrategies": ["Strategy 1", "Strategy 2", "Strategy 3", "Strategy 4"],
  "selfCareActions": ["Action 1", "Action 2", "Action 3"],
  "journalPrompts": ["Prompt 1", "Prompt 2"],
  "whenToSeekHelp": ["Sign 1 that professional help is needed", "Sign 2", "Sign 3"],
  "helplineInfo": "Crisis helpline numbers (182 for TR, 988 for US)",
  "bookRecommendation": "One helpful book title about grief",
  "affirmation": "A gentle, comforting affirmation for today"
}`;

    const prompt = `I am in the ${stage} stage of grief. My current mood is ${moodValue}/10. Please provide stage-appropriate support and coping resources.`;

    const rawResponse = await askGeminiJSON(prompt, systemPrompt);
    const result = JSON.parse(rawResponse);

    return NextResponse.json({ result });
  } catch (error) {
    console.error("[grief-support] Error:", error);
    return NextResponse.json(
      { error: "Failed to process request. Please try again." },
      { status: 500 }
    );
  }
}
