// © 2026 Doctopal — All Rights Reserved
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { askGeminiJSON } from "@/lib/ai-client";
import { tx } from "@/lib/translations";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`meddict:${clientIP}`, 10, 60_000);
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
    const { term } = body;
    const lang = (body.lang === "tr" ? "tr" : "en") as "en" | "tr";

    if (!term || typeof term !== "string" || term.trim().length < 2) {
      return NextResponse.json({ error: "Please provide a valid medical term." }, { status: 400 });
    }

    const systemPrompt = `You are a medical dictionary assistant. Your job is to explain medical terms in simple, easy-to-understand language for patients. Always be accurate and evidence-based.

Respond in ${tx("api.respondLang", lang)}.

Return JSON with this exact structure:
{
  "plainLanguage": "Simple explanation a 12-year-old could understand",
  "medicalDefinition": "Formal medical definition",
  "etymology": "Word origin (Latin/Greek roots)",
  "category": "Category like Cardiology, Neurology, etc.",
  "relatedTerms": ["term1", "term2", "term3"],
  "commonUsage": "How doctors typically use this term",
  "whenToWorry": "When this term in a diagnosis might be concerning"
}`;

    const prompt = `Explain the medical term: "${term.trim()}"`;

    const rawResponse = await askGeminiJSON(prompt, systemPrompt);
    const result = JSON.parse(rawResponse);

    return NextResponse.json({ result });
  } catch (error) {
    console.error("[medical-dictionary] Error:", error);
    return NextResponse.json(
      { error: "Failed to process request. Please try again." },
      { status: 500 }
    );
  }
}
