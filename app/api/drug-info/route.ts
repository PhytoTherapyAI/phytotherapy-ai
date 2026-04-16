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
    const rateCheck = checkRateLimit(`druginfo:${clientIP}`, 5, 60_000);
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
    const { drug_name } = body;
    const lang = (body.lang === "tr" ? "tr" : "en") as "en" | "tr";

    if (!drug_name || typeof drug_name !== "string" || drug_name.trim().length < 2) {
      return NextResponse.json({ error: "Please provide a valid drug name." }, { status: 400 });
    }

    const systemPrompt = `You are a drug information specialist. Provide comprehensive, evidence-based drug information in simple language patients can understand. Always recommend consulting a doctor.

Respond in ${tx("api.respondLang", lang)}.

Return JSON with this exact structure:
{
  "drugName": "Generic name",
  "brandNames": ["Brand1", "Brand2"],
  "activeIngredient": "Active ingredient name",
  "drugClass": "Drug class/category",
  "whatItDoes": "Simple explanation of what the drug does and why it's prescribed",
  "howToTake": "How to take it (with food, time of day, etc.)",
  "commonDoses": "Common dosage ranges",
  "sideEffects": {
    "common": ["effect1", "effect2"],
    "serious": ["effect1", "effect2"],
    "rare": ["effect1", "effect2"]
  },
  "interactions": ["Drug/food interaction 1", "Drug/food interaction 2"],
  "whenToStop": "When to stop or see a doctor immediately",
  "genericVsOriginal": "Explanation of generic vs brand-name differences",
  "storageInfo": "How to store the medication",
  "pregnancyCategory": "Safety category for pregnancy",
  "disclaimer": "Always consult your doctor"
}`;

    const prompt = `Provide comprehensive information about the drug: "${drug_name.trim()}"`;

    const rawResponse = await askClaudeJSON(prompt, systemPrompt, { userId });
    const result = JSON.parse(rawResponse);

    return NextResponse.json({ result });
  } catch (error) {
    console.error("[drug-info] Error:", error);
    return NextResponse.json(
      { error: "Failed to process request. Please try again." },
      { status: 500 }
    );
  }
}
