// © 2026 Phytotherapy.ai — All Rights Reserved
import { NextRequest, NextResponse } from "next/server";
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
    const rateCheck = checkRateLimit(`sports:${clientIP}`, 10, 60_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Please wait ${rateCheck.resetInSeconds} seconds.` },
        { status: 429, headers: { "Retry-After": String(rateCheck.resetInSeconds) } }
      );
    }

    const body = await request.json();
    const rawInput = sanitizeInput(body.raw_input || "");
    // Fallback: accept structured fields for backward compatibility
    let sportType = sanitizeInput(body.sport_type || "");
    let goal = sanitizeInput(body.goal || "");
    const trainingFrequency = Number(body.training_frequency) || 3;
    const currentSupplements = sanitizeInput(body.current_supplements || "");
    const lang = (body.lang === "tr" ? "tr" : "en") as "en" | "tr";

    // If raw_input provided, extract intent via Gemini
    let extractedIntent = null;
    if (rawInput) {
      const extractPrompt = `Extract sports/fitness information from this input. Return JSON:
{
  "sportType": "the sport or activity (e.g., CrossFit, swimming, bodybuilding)",
  "goal": "primary goal (e.g., shoulder mobility, endurance, weight loss, muscle gain)",
  "specificFocus": "any specific body part or technique focus mentioned",
  "experienceLevel": "beginner/intermediate/advanced (infer from context, default intermediate)",
  "frequency": number of training days per week (default 3),
  "currentSupplements": "any supplements mentioned"
}
Input: "${rawInput}"`;

      try {
        const intentResult = await askGeminiJSON(extractPrompt, "You extract structured data from fitness descriptions. Return only valid JSON.");
        extractedIntent = typeof intentResult === "string" ? JSON.parse(intentResult) : intentResult;
        // Use extracted values
        sportType = extractedIntent.sportType || sportType;
        goal = extractedIntent.goal || goal;
      } catch {
        // If intent extraction fails, require structured fields
      }
    }

    if (!sportType && !rawInput) {
      return NextResponse.json(
        { error: tx("api.sports.selectSport", lang) },
        { status: 400 }
      );
    }

    // Fetch user profile for medication interaction check
    let profileContext = "";
    let userName = "";
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const supabase = createServerClient();
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user) {
          const { data: profile } = await supabase
            .from("user_profiles")
            .select("full_name, age, gender, kidney_disease, liver_disease, chronic_conditions")
            .eq("id", user.id)
            .single();

          const { data: meds } = await supabase
            .from("user_medications")
            .select("brand_name, generic_name")
            .eq("user_id", user.id)
            .eq("is_active", true);

          const { data: allergies } = await supabase
            .from("user_allergies")
            .select("allergen")
            .eq("user_id", user.id);

          if (profile) {
            userName = profile.full_name || "";
            const parts: string[] = [];
            if (profile.age) parts.push(`Age: ${profile.age}`);
            if (profile.gender) parts.push(`Gender: ${profile.gender}`);
            if (profile.kidney_disease) parts.push("Kidney disease");
            if (profile.liver_disease) parts.push("Liver disease");
            if (profile.chronic_conditions?.length) parts.push(`Conditions: ${profile.chronic_conditions.join(", ")}`);
            if (meds?.length) parts.push(`Medications: ${meds.map((m: { brand_name: string | null; generic_name: string | null }) => m.generic_name || m.brand_name).join(", ")}`);
            if (allergies?.length) parts.push(`Allergies: ${allergies.map((a: { allergen: string }) => a.allergen).join(", ")}`);
            profileContext = parts.join(". ");
          }

          await supabase.from("query_history").insert({
            user_id: user.id,
            query_text: `Sports Performance: ${rawInput || `${sportType} - ${goal}`}`,
            query_type: "sports" as const,
          });
        }
      } catch {
        // Continue as guest
      }
    }

    // PubMed search
    let pubmedContext = "";
    try {
      const query = `${sportType} ${goal} supplement performance`;
      const articles = await searchPubMed(query, 3);
      if (articles.length > 0) {
        pubmedContext = articles
          .map((a: { title: string; abstract?: string }) => `- ${a.title}: ${(a.abstract || "").slice(0, 200)}`)
          .join("\n");
      }
    } catch {
      // Continue without PubMed
    }

    const specificFocus = extractedIntent?.specificFocus || "";
    const experienceLevel = extractedIntent?.experienceLevel || "intermediate";
    const freq = extractedIntent?.frequency || trainingFrequency;

    const systemPrompt = `You are Phytotherapy.ai's elite sports performance coach. You give hyper-personalized, evidence-based guidance.

CRITICAL RULES:
1. NEVER give generic advice. Every sentence must reference the user's specific sport, goal, and situation.
2. Instead of "Creatine improves strength", say "For your ${sportType} training${specificFocus ? `, especially the ${specificFocus} work` : ""}, creatine monohydrate at 5g/day will..."
3. Always check supplements against user medications for interactions
4. Use evidence grades: A (strong RCT), B (moderate), C (traditional/limited)
5. Be sport-specific in ALL recommendations
6. Respond in ${lang === "tr" ? "Turkish" : "English"}
7. Never diagnose — recommend consulting a sports medicine doctor for medical concerns
${userName ? `8. Address the user as ${userName} when natural` : ""}

${profileContext ? `USER PROFILE: ${profileContext}` : "No profile — provide general guidance and note medication check requires login."}
${currentSupplements ? `CURRENT SUPPLEMENTS: ${currentSupplements}` : ""}
${pubmedContext ? `RELEVANT RESEARCH:\n${pubmedContext}` : ""}

The user is ${experienceLevel === "advanced" ? "an advanced" : experienceLevel === "beginner" ? "a beginner" : "an intermediate"} ${sportType} athlete${specificFocus ? ` focusing on ${specificFocus}` : ""}.
Primary goal: ${goal}. Training ${freq} days/week.

Respond in this exact JSON format:
{
  "todayFocus": {
    "title": "Single most important recommendation for today",
    "description": "2-3 sentences explaining why, personalized to their sport/goal",
    "keyAction": "One concrete thing to do TODAY",
    "evidenceGrade": "A" | "B" | "C"
  },
  "supplementPlan": [
    {
      "name": "Supplement name",
      "dose": "Specific dose",
      "timing": "When relative to training",
      "evidenceGrade": "A" | "B" | "C",
      "benefit": "Sport-specific benefit (personalized!)",
      "safety": "safe" | "caution" | "avoid",
      "safetyNote": "Interaction note if any",
      "duration": "How long"
    }
  ],
  "safetyWarnings": [
    {
      "supplement": "Name",
      "medication": "Drug name if relevant",
      "severity": "avoid" | "caution" | "monitor",
      "why": "One clear sentence explaining the risk",
      "whatToDo": "One clear action step"
    }
  ],
  "nutritionTiming": {
    "preWorkout": { "timing": "When", "foods": ["food 1"], "macros": "Breakdown" },
    "duringWorkout": { "timing": "When", "foods": ["item"], "notes": "Guidance" },
    "postWorkout": { "timing": "When", "foods": ["food 1"], "macros": "Breakdown" },
    "generalTips": ["tip 1"]
  },
  "recoveryProtocol": [
    { "method": "Method", "frequency": "How often", "duration": "How long", "benefit": "Sport-specific benefit" }
  ],
  "injuryPrevention": [
    { "area": "Area", "exercise": "Exercise", "frequency": "How often" }
  ],
  "overtrainingWarnings": ["warning 1"],
  "weeklyStructure": "Sport-specific weekly plan for ${freq} days",
  "interactionWarnings": ["Any drug-supplement warnings"],
  "sources": [{ "title": "Title", "url": "https://pubmed.ncbi.nlm.nih.gov/..." }]
}

Include at least 3 supplements, 3 recovery methods. Every recommendation must be sport-specific.`;

    const result = await askGeminiJSON(
      rawInput
        ? `Based on the user's input: "${rawInput}". Create a comprehensive, hyper-personalized sports performance plan.`
        : `Provide a sports performance plan for a ${sportType} athlete with ${goal} as goal, training ${freq} days/week.${currentSupplements ? ` Currently taking: ${currentSupplements}.` : ""}`,
      systemPrompt
    );

    let parsed;
    try {
      parsed = typeof result === "string" ? JSON.parse(result) : result;
    } catch {
      return NextResponse.json(
        { error: tx("api.sports.analysisFailed", lang) },
        { status: 500 }
      );
    }

    // Attach extracted intent to response
    if (extractedIntent) {
      parsed.extractedIntent = extractedIntent;
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Sports performance API error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
