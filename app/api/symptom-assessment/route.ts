// © 2026 Doctopal — All Rights Reserved
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { askGeminiJSON } from "@/lib/ai-client";
import type {
  AssessmentRequest,
  AssessmentResponse,
  ConversationStep,
} from "@/lib/types/symptom-assessment";

const SYSTEM_PROMPT = `You are DoctoPal's adaptive symptom assessment engine. You work like a skilled doctor taking a patient history — asking ONE focused question at a time, each question informed by previous answers.

RULES:
1. You receive the conversation history (all previous Q&A pairs).
2. Based on the history, generate the SINGLE MOST IMPORTANT next question to narrow down the diagnosis.
3. Each question must have 2-5 answer options (chips) that the user can tap. Include an "Other" option when appropriate.
4. After each answer, update your list of possible conditions with confidence percentages.
5. Ask MINIMUM questions needed. Target: 4-8 questions total, NEVER more than 12.
6. If the user's profile includes medications, silently check if symptoms could be drug side effects.
7. When you have enough confidence (top condition >60% or after 8+ questions), set isComplete=true.

RESPONSE FORMAT (strict JSON):
{
  "nextQuestion": {
    "text": "How long have you had this headache?",
    "subtext": "This helps us determine if it's acute or chronic",
    "type": "single_select",
    "options": [
      { "id": "hours", "label": "A few hours", "emoji": "⏰" },
      { "id": "days", "label": "1-3 days", "emoji": "📅" },
      { "id": "week", "label": "More than a week", "emoji": "🗓️" },
      { "id": "chronic", "label": "Weeks/months (recurring)", "emoji": "🔄" }
    ]
  },
  "possibleConditions": [
    { "name": "Tension Headache", "confidence": 45, "severity": "low" },
    { "name": "Migraine", "confidence": 30, "severity": "medium" },
    { "name": "Sinusitis", "confidence": 15, "severity": "low" }
  ],
  "progress": 35,
  "isComplete": false,
  "urgency": "monitor",
  "reasoning": "Duration will help differentiate between acute and chronic causes"
}

URGENCY LEVELS: "emergency" | "see_doctor_today" | "see_doctor_soon" | "monitor" | "self_care"

If at ANY point symptoms suggest emergency (chest pain + shortness of breath, sudden severe headache + vision loss, signs of stroke/anaphylaxis):
IMMEDIATELY set isComplete=true, urgency="emergency", and include a message to call 112/911 immediately.

MEDICATION AWARENESS:
If user takes SSRIs and reports fatigue/sexual dysfunction — note "This may be a medication side effect"
If user takes NSAIDs and reports stomach pain — flag interaction
If user takes blood thinners and reports unusual bleeding — urgency escalation
Always weave medication context naturally, never ignore it.

PHYTOTHERAPY INTEGRATION:
In the final assessment (isComplete=true), include a "phytotherapySuggestions" array:
[{ "name": "Feverfew", "evidence": "A", "description": "Shown to reduce migraine frequency in multiple RCTs", "caution": "Avoid if taking blood thinners" }]

When isComplete=true, also include "finalSummary" — a warm, conversational 2-3 sentence summary for the user.

LANGUAGE: Respond in the same language as indicated by the lang parameter. If lang=tr, all text (question, options, conditions, summary) MUST be in Turkish.`;

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const { allowed } = checkRateLimit(`symptom:${ip}`, 5, 30000);
  if (!allowed) {
    return NextResponse.json({ error: "Rate limit — please wait a moment" }, { status: 429 });
  }

  try {
    const body: AssessmentRequest = await req.json();
    const { step, history, userProfile, assessmentFor, childAge, otherAge, otherGender, lang, initialCategory } = body;

    // Build context prompt
    let contextParts: string[] = [];

    // Assessment target
    if (assessmentFor === "child" && childAge) {
      contextParts.push(`ASSESSMENT TARGET: This is for a child aged ${childAge}. Adjust questions and conditions for pediatric context. Apply pediatric red flags.`);
    } else if (assessmentFor === "other" && otherAge) {
      contextParts.push(`ASSESSMENT TARGET: This is for someone else — age ${otherAge}, gender: ${otherGender || "unknown"}.`);
    }

    // User profile
    if (userProfile) {
      const parts: string[] = [];
      if (userProfile.age) parts.push(`Age: ${userProfile.age}`);
      if (userProfile.gender) parts.push(`Gender: ${userProfile.gender}`);
      if (userProfile.medications?.length) parts.push(`Current medications: ${userProfile.medications.join(", ")}`);
      if (userProfile.allergies?.length) parts.push(`Allergies: ${userProfile.allergies.join(", ")}`);
      if (userProfile.conditions?.length) parts.push(`Known conditions: ${userProfile.conditions.join(", ")}`);
      if (userProfile.pregnancyStatus && userProfile.pregnancyStatus !== "no") parts.push(`Pregnancy status: ${userProfile.pregnancyStatus}`);
      if (userProfile.kidneyStatus && userProfile.kidneyStatus !== "normal") parts.push(`Kidney: ${userProfile.kidneyStatus}`);
      if (userProfile.liverStatus && userProfile.liverStatus !== "normal") parts.push(`Liver: ${userProfile.liverStatus}`);
      if (parts.length > 0) contextParts.push(`USER PROFILE:\n${parts.join("\n")}`);
    }

    // Language
    contextParts.push(`LANGUAGE: ${lang === "tr" ? "Turkish (respond in Turkish)" : "English (respond in English)"}`);

    // Initial category
    if (initialCategory && step === 1) {
      contextParts.push(`INITIAL COMPLAINT AREA: ${initialCategory}`);
    }

    // Conversation history
    if (history.length > 0) {
      const historyStr = history.map((h, i) =>
        `Q${i + 1}: ${h.questionText}\nA${i + 1}: ${h.selectedOptionLabel}`
      ).join("\n\n");
      contextParts.push(`CONVERSATION HISTORY (${history.length} questions so far):\n${historyStr}`);
    }

    contextParts.push(`CURRENT STEP: ${step} of estimated 4-8.`);
    contextParts.push(`Generate the next adaptive question. Remember: strict JSON response only.`);

    const prompt = contextParts.join("\n\n");
    const resultStr = await askGeminiJSON(prompt, SYSTEM_PROMPT);

    let parsed: AssessmentResponse;
    try {
      parsed = JSON.parse(resultStr);
    } catch {
      // Fallback question if AI response can't be parsed
      parsed = {
        nextQuestion: {
          text: lang === "tr" ? "Semptomlarınızı biraz daha anlatır mısınız?" : "Can you tell us more about how you're feeling?",
          subtext: lang === "tr" ? "Bu bize daha iyi yardımcı olmamızı sağlar" : "This helps us understand your situation better",
          type: "single_select",
          options: [
            { id: "worse", label: lang === "tr" ? "Kötüleşiyor" : "Getting worse", emoji: "📈" },
            { id: "same", label: lang === "tr" ? "Aynı kalıyor" : "Staying the same", emoji: "➡️" },
            { id: "better", label: lang === "tr" ? "İyileşiyor" : "Getting better", emoji: "📉" },
            { id: "varies", label: lang === "tr" ? "Değişiyor" : "It varies", emoji: "🔄" },
          ],
        },
        possibleConditions: [],
        progress: Math.min(step * 12, 90),
        isComplete: false,
        urgency: "monitor",
        reasoning: "Fallback question — AI response was unclear",
      };
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("[Symptom Assessment] Error:", error);
    return NextResponse.json(
      { error: "Failed to process assessment step" },
      { status: 500 }
    );
  }
}
