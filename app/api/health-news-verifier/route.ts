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
    const rateCheck = checkRateLimit(`newsverify:${clientIP}`, 5, 60_000);
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
    const { claim } = body;
    const lang = (body.lang === "tr" ? "tr" : "en") as "en" | "tr";

    if (!claim || typeof claim !== "string" || claim.trim().length < 10) {
      return NextResponse.json({ error: "Please provide a more detailed health claim to verify." }, { status: 400 });
    }

    const systemPrompt = `You are a health news fact-checker and scientific literacy expert. Analyze health claims critically using evidence-based medicine principles. Be honest about uncertainty.

Respond in ${tx("api.respondLang", lang)}.

Return JSON with this exact structure:
{
  "claim": "The claim being analyzed",
  "verdict": "TRUE" | "MOSTLY_TRUE" | "MIXED" | "MOSTLY_FALSE" | "FALSE" | "UNPROVEN",
  "verdictExplanation": "2-3 sentence explanation of the verdict",
  "evidenceLevel": "A (Strong RCTs)" | "B (Limited trials)" | "C (Observational)" | "D (In-vitro/Animal)" | "E (Anecdotal/None)",
  "studyType": "Type of studies this is based on (RCT, meta-analysis, observational, in-vitro, animal, none)",
  "sampleSize": "Typical sample sizes in relevant studies (or 'N/A')",
  "mediaAccuracy": "How accurately media typically reports this claim",
  "nuances": ["Important nuance 1", "Important nuance 2", "Important nuance 3"],
  "commonMisinterpretations": ["Misinterpretation 1", "Misinterpretation 2"],
  "whatWeKnow": "What science actually says about this topic",
  "bottomLine": "One-sentence takeaway for the average person"
}`;

    const prompt = `Fact-check this health claim: "${claim.trim()}"`;

    const rawResponse = await askClaudeJSON(prompt, systemPrompt, { userId });
    const result = JSON.parse(rawResponse);

    return NextResponse.json({ result });
  } catch (error) {
    console.error("[health-news-verifier] Error:", error);
    return NextResponse.json(
      { error: "Failed to process request. Please try again." },
      { status: 500 }
    );
  }
}
