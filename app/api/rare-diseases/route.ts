import { NextRequest, NextResponse } from "next/server";
import { askGeminiJSON } from "@/lib/gemini";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/sanitize";
import { tx } from "@/lib/translations";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`raredisease:${clientIP}`, 10, 60_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Please wait ${rateCheck.resetInSeconds} seconds.` },
        { status: 429, headers: { "Retry-After": String(rateCheck.resetInSeconds) } }
      );
    }

    const body = await request.json();
    const disease = sanitizeInput(body.disease || "");
    const lang = (body.lang === "tr" ? "tr" : "en") as "en" | "tr";

    if (!disease || disease.length < 2) {
      return NextResponse.json(
        { error: tx("api.rareDiseases.enterName", lang) },
        { status: 400 }
      );
    }

    const prompt = `You are a rare disease information specialist. Provide comprehensive information about this rare disease.

Disease: ${disease}
Language: ${tx("api.respondLang", lang)}

Return JSON:

{
  "name": "Official disease name",
  "alternateNames": ["other names / aliases"],
  "prevalence": "How common/rare it is",
  "inheritance": "Autosomal dominant/recessive/X-linked/sporadic/etc",
  "summary": "Brief description (3-4 sentences)",
  "symptoms": ["Key symptoms"],
  "diagnosis": ["Diagnostic methods"],
  "treatment": "Current treatment approaches",
  "prognosis": "General prognosis information",
  "specialists": ["Which type of specialists to consult"],
  "patientAssociations": [
    { "name": "Association name", "url": "website if known", "country": "country" }
  ],
  "clinicalTrials": "Brief note about available clinical trials",
  "orphanetCode": "ORPHA code if known, or null",
  "omimCode": "OMIM code if known, or null",
  "resources": [
    { "name": "Resource name", "url": "URL", "description": "Brief description" }
  ]
}

Be factual and evidence-based. If information is limited, say so.`;

    const result = await askGeminiJSON(
      `Provide information about this rare disease: "${disease}". Respond in ${tx("api.respondLang", lang)}.`,
      prompt
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("Rare diseases error:", error);
    return NextResponse.json({ error: "Failed to search rare diseases" }, { status: 500 });
  }
}
