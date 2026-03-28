import { NextRequest, NextResponse } from "next/server";
import { askGeminiJSON } from "@/lib/gemini";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/sanitize";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`label:${clientIP}`, 10, 60_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Please wait ${rateCheck.resetInSeconds} seconds.` },
        { status: 429, headers: { "Retry-After": String(rateCheck.resetInSeconds) } }
      );
    }

    const body = await request.json();
    const productName = sanitizeInput(body.productName || "");
    const ingredients = sanitizeInput(body.ingredients || "");
    const lang = body.lang || "en";

    if (!ingredients || ingredients.length < 5) {
      return NextResponse.json(
        { error: lang === "tr" ? "Lutfen icerik listesini giriniz" : "Please enter the ingredients list" },
        { status: 400 }
      );
    }

    const prompt = `You are a food label analysis expert. Analyze this food product label.

Product name: ${productName || "Unknown"}
Ingredients: ${ingredients}
Language: ${lang === "tr" ? "Turkish" : "English"}

Analyze and return JSON:

{
  "overallScore": 1-10 (10=healthiest),
  "scoreLabel": "Excellent/Good/Fair/Poor",
  "hiddenSugars": ["list of sugar aliases found (dextrose, corn syrup, etc.)"],
  "sodiumWarning": "warning if high sodium indicators found, or null",
  "allergens": ["identified allergens"],
  "additives": [
    { "name": "additive name", "code": "E-number if applicable", "concern": "low/moderate/high", "note": "brief explanation" }
  ],
  "dietCompatibility": {
    "glutenFree": true/false,
    "dairyFree": true/false,
    "veganFriendly": true/false,
    "ketoFriendly": true/false,
    "fodmapSafe": true/false
  },
  "positives": ["good things about this product"],
  "concerns": ["health concerns"],
  "recommendations": "brief recommendation"
}`;

    const result = await askGeminiJSON(
      `Analyze this food label. Product: ${productName || "Unknown"}. Ingredients: ${ingredients}. Respond in ${lang === "tr" ? "Turkish" : "English"}.`,
      prompt
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("Label reader error:", error);
    return NextResponse.json({ error: "Failed to analyze label" }, { status: 500 });
  }
}
