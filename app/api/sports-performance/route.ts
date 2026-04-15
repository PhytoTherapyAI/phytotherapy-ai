// © 2026 DoctoPal — All Rights Reserved
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

    // Fetch profile + PubMed IN PARALLEL for speed
    let profileContext = "";
    let userName = "";
    const pubmedQuery = `${sportType} ${goal} supplement performance`;

    // Start PubMed search immediately (don't wait for auth)
    const pubmedPromise = searchPubMed(pubmedQuery, 3).catch(() => []);

    let userId: string | undefined;
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const supabase = createServerClient();
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user) {
          userId = user.id;
          const [{ data: profile }, { data: meds }, { data: allergies }] = await Promise.all([
            supabase.from("user_profiles").select("full_name, age, gender, kidney_disease, liver_disease, chronic_conditions").eq("id", user.id).single(),
            supabase.from("user_medications").select("brand_name, generic_name").eq("user_id", user.id).eq("is_active", true),
            supabase.from("user_allergies").select("allergen").eq("user_id", user.id),
          ]);

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

          supabase.from("query_history").insert({
            user_id: user.id,
            query_text: `Sports Performance: ${rawInput || `${sportType} - ${goal}`}`,
            query_type: "sports" as const,
          }).then(() => {});
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

    const specificFocus = extractedIntent?.specificFocus || "";
    const experienceLevel = extractedIntent?.experienceLevel || "intermediate";
    const freq = extractedIntent?.frequency || trainingFrequency;

    const systemPrompt = `Sports performance coach. Evidence-based, sport-specific. Respond in ${lang === "tr" ? "Turkish" : "English"}.
${profileContext ? `PROFILE: ${profileContext}` : ""}
${currentSupplements ? `SUPPLEMENTS: ${currentSupplements}` : ""}
${pubmedContext ? `RESEARCH:\n${pubmedContext}` : ""}
User: ${experienceLevel} ${sportType} athlete${specificFocus ? `, focus: ${specificFocus}` : ""}. Goal: ${goal}. ${freq}x/week.
${userName ? `Name: ${userName}` : ""}

Return JSON: {"todayFocus":{"title":"","description":"","keyAction":"","evidenceGrade":"A|B|C"},"supplementPlan":[{"name":"","dose":"","timing":"","evidenceGrade":"","benefit":"","safety":"safe|caution|avoid","safetyNote":"","duration":""}],"safetyWarnings":[{"supplement":"","medication":"","severity":"avoid|caution|monitor","why":"","whatToDo":""}],"nutritionTiming":{"preWorkout":{"timing":"","foods":[],"macros":""},"postWorkout":{"timing":"","foods":[],"macros":""},"generalTips":[]},"recoveryProtocol":[{"method":"","frequency":"","duration":"","benefit":""}],"weeklyStructure":"","sources":[{"title":"","url":""}]}
3 supplements, 3 recovery methods minimum. Be concise.`;

    const result = await askGeminiJSON(
      rawInput
        ? `Based on the user's input: "${rawInput}". Create a comprehensive, hyper-personalized sports performance plan.`
        : `Provide a sports performance plan for a ${sportType} athlete with ${goal} as goal, training ${freq} days/week.${currentSupplements ? ` Currently taking: ${currentSupplements}.` : ""}`,
      systemPrompt,
      { userId }
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
    console.error("Sports performance API error:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
