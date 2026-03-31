// © 2026 Phytotherapy.ai — All Rights Reserved
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { askGeminiJSON } from "@/lib/ai-client";
import { tx } from "@/lib/translations";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`doctorcomm:${clientIP}`, 5, 60_000);
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
    const { symptoms_description } = body;
    const lang = (body.lang === "tr" ? "tr" : "en") as "en" | "tr";

    if (!symptoms_description || typeof symptoms_description !== "string" || symptoms_description.trim().length < 5) {
      return NextResponse.json({ error: "Please describe your symptoms in more detail." }, { status: 400 });
    }

    const systemPrompt = `You are a doctor communication coach. Your job is to help patients describe their symptoms effectively to their doctor. Organize their description into a clear, structured format that will help the doctor understand the situation quickly.

Respond in ${tx("api.respondLang", lang)}.

Return JSON with this exact structure:
{
  "structuredDescription": {
    "mainComplaint": "The primary symptom in clear medical terms",
    "onset": "When it started",
    "location": "Where exactly (if applicable)",
    "duration": "How long it lasts",
    "character": "What it feels like (sharp, dull, burning, etc.)",
    "aggravating": "What makes it worse",
    "relieving": "What makes it better",
    "severity": "Scale suggestion (1-10)",
    "associated": "Other symptoms that come with it",
    "timeline": "Pattern or progression"
  },
  "questionsToAsk": ["Question 1 to ask your doctor", "Question 2", "Question 3", "Question 4", "Question 5"],
  "tipsForVisit": ["Tip 1 for the appointment", "Tip 2", "Tip 3"],
  "whatToBring": ["Item 1 to bring to appointment", "Item 2"],
  "redFlags": "Any concerning symptoms that need urgent attention (or null if none)"
}`;

    const prompt = `Help me describe these symptoms to my doctor: "${symptoms_description.trim()}"`;

    const rawResponse = await askGeminiJSON(prompt, systemPrompt);
    const result = JSON.parse(rawResponse);

    return NextResponse.json({ result });
  } catch (error) {
    console.error("[doctor-communication] Error:", error);
    return NextResponse.json(
      { error: "Failed to process request. Please try again." },
      { status: 500 }
    );
  }
}
