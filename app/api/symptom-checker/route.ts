// © 2026 Doctopal — All Rights Reserved
import { NextRequest, NextResponse } from "next/server";
import { checkRedFlags, getEmergencyMessage } from "@/lib/safety-filter";
import { askGeminiJSON } from "@/lib/ai-client";
import { searchPubMed } from "@/lib/pubmed";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/sanitize";
import { tx } from "@/lib/translations";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`symptom:${clientIP}`, 10, 60_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Please wait ${rateCheck.resetInSeconds} seconds.` },
        { status: 429, headers: { "Retry-After": String(rateCheck.resetInSeconds) } }
      );
    }

    const body = await request.json();
    const symptoms = sanitizeInput(body.symptoms || "");
    const lang = (body.lang === "tr" ? "tr" : "en") as "en" | "tr";

    if (!symptoms || symptoms.length < 3) {
      return NextResponse.json(
        { error: tx("api.symptomChecker.describeSymptoms", lang) },
        { status: 400 }
      );
    }

    if (symptoms.length > 2000) {
      return NextResponse.json(
        { error: "Input too long (max 2000 characters)" },
        { status: 400 }
      );
    }

    // Red flag check FIRST — only block red code
    const redFlagResult = checkRedFlags(symptoms);
    if (redFlagResult.type === "red_code") {
      return NextResponse.json({
        triage: "emergency",
        message: getEmergencyMessage(redFlagResult.language),
        matchedFlags: redFlagResult.matchedFlags,
      });
    }

    // Fetch user profile if authenticated
    let profileContext = "";
    const authHeader = request.headers.get("authorization");
    // Start PubMed immediately (parallel with profile fetch)
    const pubmedPromise = searchPubMed(symptoms, 3).catch(() => []);

    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const supabase = createServerClient();
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user) {
          const [{ data: profile }, { data: meds }, { data: allergies }] = await Promise.all([
            supabase.from("user_profiles").select("age, gender, is_pregnant, is_breastfeeding, kidney_disease, liver_disease, chronic_conditions").eq("id", user.id).single(),
            supabase.from("user_medications").select("brand_name, generic_name").eq("user_id", user.id).eq("is_active", true),
            supabase.from("user_allergies").select("allergen").eq("user_id", user.id),
          ]);

          if (profile) {
            const parts: string[] = [];
            if (profile.age) parts.push(`Age: ${profile.age}`);
            if (profile.gender) parts.push(`Gender: ${profile.gender}`);
            if (profile.is_pregnant) parts.push("Pregnant");
            if (profile.is_breastfeeding) parts.push("Breastfeeding");
            if (profile.kidney_disease) parts.push("Kidney disease");
            if (profile.liver_disease) parts.push("Liver disease");
            if (profile.chronic_conditions?.length) parts.push(`Conditions: ${profile.chronic_conditions.join(", ")}`);
            if (meds?.length) parts.push(`Medications: ${meds.map((m: { brand_name: string | null; generic_name: string | null }) => m.generic_name || m.brand_name).join(", ")}`);
            if (allergies?.length) parts.push(`Allergies: ${allergies.map((a: { allergen: string }) => a.allergen).join(", ")}`);
            profileContext = parts.join(". ");
          }

          supabase.from("query_history").insert({ user_id: user.id, query_text: `Symptom Check: ${symptoms}`, query_type: "symptom" as const }).then(() => {});
        }
      } catch {
        // Continue as guest
      }
    }

    // Await PubMed (already running in parallel)
    let pubmedContext = "";
    const articles = await pubmedPromise;
    if (articles.length > 0) {
      pubmedContext = articles
        .map((a: { title: string; abstract?: string }) => `- ${a.title}: ${(a.abstract || "").slice(0, 200)}`)
        .join("\n");
    }
    {
      // PubMed context ready
    }

    const systemPrompt = `You are DoctoPal's symptom assessment assistant. You are NOT a doctor and cannot diagnose.
Your job is to help the user understand their symptoms and guide them on urgency.

RULES:
1. NEVER diagnose. Use phrases like "this could suggest", "possible causes include"
2. Always recommend seeing a doctor for persistent or concerning symptoms
3. Consider the user's profile (medications, conditions) when assessing
4. Be empathetic but evidence-based
5. Respond in ${tx("api.respondLang", lang)}

${profileContext ? `USER PROFILE: ${profileContext}` : "No user profile available."}

${pubmedContext ? `RELEVANT RESEARCH:\n${pubmedContext}` : ""}

Respond in this exact JSON format:
{
  "triage": "doctor" | "home",
  "urgencyScore": 1-10,
  "title": "Brief title of assessment",
  "summary": "2-3 sentence empathetic summary of what these symptoms might indicate",
  "possibleCauses": [
    { "cause": "Name", "likelihood": "high" | "moderate" | "low", "explanation": "Brief explanation" }
  ],
  "recommendations": [
    { "action": "What to do", "priority": "high" | "medium" | "low" }
  ],
  "whenToSeeDoctor": ["specific warning sign 1", "specific warning sign 2"],
  "selfCare": ["home remedy or self-care tip 1", "tip 2"],
  "medicationNotes": "Any notes about how user's current medications might relate to these symptoms, or empty string",
  "sources": [{ "title": "Source title", "url": "https://pubmed.ncbi.nlm.nih.gov/..." }]
}

IMPORTANT:
- "triage" must be "doctor" if urgencyScore >= 6, otherwise "home"
- If medications could be causing these symptoms as side effects, mention that prominently
- Always include at least 2 "whenToSeeDoctor" items`;

    const result = await askGeminiJSON(
      `Patient describes these symptoms: "${symptoms}"

Assess the symptoms, provide possible causes, and recommend next steps.`,
      systemPrompt
    );

    // Parse and validate
    let parsed;
    try {
      parsed = typeof result === "string" ? JSON.parse(result) : result;
    } catch {
      return NextResponse.json(
        { error: tx("api.symptomChecker.analysisFailed", lang) },
        { status: 500 }
      );
    }

    // Ensure triage consistency
    if (parsed.urgencyScore >= 6) parsed.triage = "doctor";

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Symptom checker API error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
