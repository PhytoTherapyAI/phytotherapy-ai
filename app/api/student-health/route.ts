// © 2026 DoctoPal — All Rights Reserved
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { askClaudeJSON } from "@/lib/ai-client";
import { sanitizeInput } from "@/lib/sanitize";
import { tx } from "@/lib/translations";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`student:${clientIP}`, 5, 60_000);
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
    const concern = sanitizeInput(body.concern || "exam stress");

    const systemPrompt = `You are a student health advisor for DoctoPal.
You provide evidence-based advice for common student health concerns.

RULES:
- Focus on practical, budget-friendly solutions
- Consider that students have limited time and money
- Evidence-based only — no pseudoscience
- Include safe supplement suggestions when relevant (with safety codes)
- Never prescribe medication
- Be warm, relatable, non-judgmental

Respond in ${tx("api.respondLang", lang)}.

Return ONLY valid JSON:
{
  "concern": string,
  "quickTips": [string],
  "supplements": [{ "name": string, "dose": string, "evidence": string, "safety": "green" | "yellow", "budgetFriendly": boolean }],
  "lifestyleChanges": [{ "change": string, "impact": string, "difficulty": "easy" | "moderate" | "hard" }],
  "warnings": [string],
  "seekHelpIf": [string]
}`;

    const prompt = `A student needs help with: ${concern}

Provide practical, budget-friendly health advice including:
1. Quick actionable tips
2. Evidence-based supplement suggestions (if relevant)
3. Lifestyle changes ranked by difficulty
4. Warning signs to watch for
5. When to seek professional help`;

    const resultText = await askClaudeJSON(prompt, systemPrompt, { userId: user.id });
    let analysis; try { analysis = JSON.parse(resultText); } catch { return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 }); }

    return NextResponse.json({ result: analysis });
  } catch (err) {
    console.error("Student health error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
