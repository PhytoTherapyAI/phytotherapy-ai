import { NextRequest, NextResponse } from "next/server";
import { askGeminiJSON } from "@/lib/gemini";
import { searchPubMed } from "@/lib/pubmed";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/sanitize";

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
    const sportType = sanitizeInput(body.sport_type || "");
    const goal = sanitizeInput(body.goal || "");
    const trainingFrequency = Number(body.training_frequency) || 3;
    const currentSupplements = sanitizeInput(body.current_supplements || "");
    const lang = body.lang || "en";

    if (!sportType) {
      return NextResponse.json(
        { error: lang === "tr" ? "Lutfen bir spor turu secin" : "Please select a sport type" },
        { status: 400 }
      );
    }

    if (!goal) {
      return NextResponse.json(
        { error: lang === "tr" ? "Lutfen bir hedef secin" : "Please select a goal" },
        { status: 400 }
      );
    }

    // Fetch user profile for medication interaction check
    let profileContext = "";
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const supabase = createServerClient();
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user) {
          const { data: profile } = await supabase
            .from("user_profiles")
            .select("age, gender, kidney_disease, liver_disease, chronic_conditions")
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

          // Save to query history
          await supabase.from("query_history").insert({
            user_id: user.id,
            query_text: `Sports Performance: ${sportType} - ${goal}`,
            query_type: "sports" as const,
          });
        }
      } catch {
        // Continue as guest
      }
    }

    // PubMed search for sports supplement evidence
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

    const systemPrompt = `You are Phytotherapy.ai's sports performance advisor. You provide evidence-based supplement, nutrition, and recovery guidance for athletes.

RULES:
1. Always check supplement recommendations against user's medications for interactions
2. Use evidence grades: A (strong RCT evidence), B (moderate evidence), C (traditional/limited)
3. Include specific dosing protocols with timing relative to training
4. Flag any supplement-medication interactions clearly
5. Be sport-specific in recommendations
6. Respond in ${lang === "tr" ? "Turkish" : "English"}
7. Never prescribe — recommend consulting a sports medicine doctor for medical concerns

${profileContext ? `USER PROFILE: ${profileContext}` : "No user profile available — provide general guidance and note that medication interaction check requires a profile."}

${currentSupplements ? `CURRENT SUPPLEMENTS: ${currentSupplements}` : ""}

${pubmedContext ? `RELEVANT RESEARCH:\n${pubmedContext}` : ""}

Sport: ${sportType}
Goal: ${goal}
Training frequency: ${trainingFrequency} days/week

Respond in this exact JSON format:
{
  "supplementPlan": [
    {
      "name": "Supplement name",
      "dose": "Specific dose",
      "timing": "When to take relative to training",
      "evidenceGrade": "A" | "B" | "C",
      "benefit": "What it does for this sport/goal",
      "safety": "safe" | "caution" | "avoid",
      "safetyNote": "Interaction warning or safety note if any",
      "duration": "How long to take"
    }
  ],
  "nutritionTiming": {
    "preWorkout": { "timing": "When", "foods": ["food 1", "food 2"], "macros": "Macro breakdown" },
    "duringWorkout": { "timing": "When applicable", "foods": ["food/drink"], "notes": "Guidance" },
    "postWorkout": { "timing": "When", "foods": ["food 1", "food 2"], "macros": "Macro breakdown" },
    "generalTips": ["tip 1", "tip 2"]
  },
  "recoveryProtocol": [
    { "method": "Recovery method", "frequency": "How often", "duration": "How long", "benefit": "Why it helps" }
  ],
  "injuryPrevention": [
    { "area": "Body area or type", "exercise": "Preventive exercise", "frequency": "How often" }
  ],
  "overtrainingWarnings": ["warning sign 1", "sign 2"],
  "weeklyStructure": "Brief suggested weekly training structure for ${trainingFrequency} days",
  "interactionWarnings": ["Any medication-supplement interaction warnings"],
  "sources": [{ "title": "Source title", "url": "https://pubmed.ncbi.nlm.nih.gov/..." }]
}

IMPORTANT:
- If user takes medications, CHECK every supplement against them
- Mark "avoid" safety for any supplement that interacts with their medications
- Include at least 3 supplements with evidence grades
- Include at least 3 recovery methods
- Be specific to the sport type`;

    const result = await askGeminiJSON(
      `Provide a comprehensive sports performance plan for a ${sportType} athlete with ${goal} as their goal, training ${trainingFrequency} days per week.${currentSupplements ? ` Currently taking: ${currentSupplements}.` : ""}`,
      systemPrompt
    );

    let parsed;
    try {
      parsed = typeof result === "string" ? JSON.parse(result) : result;
    } catch {
      return NextResponse.json(
        { error: lang === "tr" ? "Analiz başarısiz oldu, tekrar deneyin" : "Analysis failed, please try again" },
        { status: 500 }
      );
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
