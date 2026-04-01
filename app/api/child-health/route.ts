// © 2026 Doctopal — All Rights Reserved
import { NextRequest, NextResponse } from "next/server";
import { askGeminiJSON } from "@/lib/ai-client";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/sanitize";
import { tx } from "@/lib/translations";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`child:${clientIP}`, 10, 60_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Please wait ${rateCheck.resetInSeconds} seconds.` },
        { status: 429, headers: { "Retry-After": String(rateCheck.resetInSeconds) } }
      );
    }

    const body = await request.json();
    const childAge = Number(body.child_age) || 0;
    const ageUnit = body.age_unit || "years";
    const concern = sanitizeInput(body.concern || "");
    const notes = sanitizeInput(body.notes || "");
    const lang = (body.lang === "tr" ? "tr" : "en") as "en" | "tr";

    if (!concern) {
      return NextResponse.json(
        { error: tx("api.child.selectConcern", lang) },
        { status: 400 }
      );
    }

    if (childAge <= 0) {
      return NextResponse.json(
        { error: tx("api.child.enterAge", lang) },
        { status: 400 }
      );
    }

    if (notes.length > 2000) {
      return NextResponse.json(
        { error: "Input too long (max 2000 characters)" },
        { status: 400 }
      );
    }

    // Save to query history if authenticated
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const supabase = createServerClient();
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user) {
          await supabase.from("query_history").insert({
            user_id: user.id,
            query_text: `Child Health: ${concern} (age ${childAge} ${ageUnit})`,
            query_type: "child_health" as const,
          });
        }
      } catch {
        // Continue
      }
    }

    const ageDescription = ageUnit === "months"
      ? `${childAge} months old`
      : `${childAge} years old`;

    const systemPrompt = `You are Doctopal's pediatric health guide for parents. You provide evidence-based guidance for common childhood health concerns.

STRICT RULES:
1. NEVER provide specific medication dosages for children — ALWAYS refer to pediatrician
2. NEVER diagnose — only describe possible explanations and guide parents
3. Always recommend consulting a pediatrician for persistent or concerning symptoms
4. Be age-appropriate in all recommendations (a 3-month-old vs a 10-year-old need very different advice)
5. Include clear "when to seek immediate help" guidance
6. Respond in ${tx("api.respondLang", lang)}
7. Be warm, reassuring, but never dismissive of parental concerns
8. For fever in infants under 3 months, ALWAYS recommend immediate medical attention

Child: ${ageDescription}
Concern: ${concern}
${notes ? `Parent's notes: ${notes}` : ""}

Respond in this exact JSON format:
{
  "triage": "urgent" | "doctor" | "home",
  "title": "Brief title of the guidance",
  "summary": "2-3 sentence reassuring summary for the parent",
  "ageGroup": "newborn" | "infant" | "toddler" | "preschool" | "school_age" | "adolescent",
  "possibleExplanations": [
    { "cause": "Name", "likelihood": "common" | "less_common" | "rare", "description": "Brief explanation appropriate for parents" }
  ],
  "homeCare": [
    { "tip": "What to do at home", "detail": "How to do it safely" }
  ],
  "whenToWorry": ["Sign that needs immediate attention 1", "Sign 2"],
  "whenToSeeDoctor": ["Reason to schedule a visit 1", "Reason 2"],
  "developmentalInfo": "Age-appropriate developmental context if relevant, or empty string",
  "preventionTips": ["Prevention tip 1", "tip 2"],
  "safeOTCNote": "General note about OTC medications for this age group — NEVER specific doses, always 'consult pediatrician for dosing'",
  "sources": [{ "title": "Source title", "url": "https://pubmed.ncbi.nlm.nih.gov/..." }]
}

IMPORTANT:
- triage "urgent" if: fever in infant <3mo, difficulty breathing, dehydration signs, seizure, severe allergic reaction
- triage "doctor" if: persistent symptoms >3 days, recurring issues, parent is worried
- triage "home" if: mild symptoms, common childhood illness with clear home management
- NEVER give specific drug doses for children
- Always include at least 3 "whenToWorry" items
- Be reassuring but never minimize legitimate concerns`;

    const result = await askGeminiJSON(
      `A parent is concerned about their ${ageDescription} child. The concern is: "${concern}".${notes ? ` Additional notes: "${notes}"` : ""} Provide age-appropriate pediatric guidance.`,
      systemPrompt
    );

    let parsed;
    try {
      parsed = typeof result === "string" ? JSON.parse(result) : result;
    } catch {
      return NextResponse.json(
        { error: tx("api.child.analysisFailed", lang) },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Child health API error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
