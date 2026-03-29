import { NextRequest, NextResponse } from "next/server";
import { askGeminiJSON } from "@/lib/gemini";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/sanitize";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`secondop:${clientIP}`, 10, 60_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Please wait ${rateCheck.resetInSeconds} seconds.` },
        { status: 429, headers: { "Retry-After": String(rateCheck.resetInSeconds) } }
      );
    }

    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const concern = sanitizeInput(body.concern || "");
    const lang = body.lang || "en";

    if (!concern || concern.length < 5) {
      return NextResponse.json(
        { error: lang === "tr" ? "Lutfen endiselerinizi yaziiniz" : "Please describe your concern" },
        { status: 400 }
      );
    }

    // Fetch user data
    const [profileResult, medsResult, allergiesResult, bloodResult] = await Promise.all([
      supabase.from("user_profiles").select("*").eq("id", user.id).single(),
      supabase.from("user_medications").select("brand_name, generic_name, dosage, frequency").eq("user_id", user.id).eq("is_active", true),
      supabase.from("user_allergies").select("allergen, severity").eq("user_id", user.id),
      supabase.from("blood_tests").select("test_data, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
    ]);

    const profile = profileResult.data;
    const medications = medsResult.data || [];
    const allergies = allergiesResult.data || [];
    const bloodTests = bloodResult.data || [];

    const prompt = `You are a medical preparation specialist helping a patient prepare for a second opinion consultation.

PATIENT PROFILE:
- Age: ${profile?.birth_date ? Math.floor((Date.now() - new Date(profile.birth_date).getTime()) / 31557600000) : "Unknown"}
- Gender: ${profile?.gender || "Unknown"}
- Conditions: ${profile?.chronic_conditions || "None reported"}
- Kidney disease: ${profile?.kidney_disease ? "Yes" : "No"}
- Liver disease: ${profile?.liver_disease ? "Yes" : "No"}

MEDICATIONS: ${medications.length > 0 ? medications.map(m => `${m.brand_name || m.generic_name} ${m.dosage || ""}`).join(", ") : "None"}
ALLERGIES: ${allergies.length > 0 ? allergies.map(a => a.allergen).join(", ") : "None"}
RECENT BLOOD TESTS: ${bloodTests.length > 0 ? bloodTests.slice(0, 10).map(b => `${b.test_name}: ${b.value} ${b.unit} (${b.status})`).join("; ") : "None"}

CONCERN: ${concern}
Language: ${lang === "tr" ? "Turkish" : "English"}

Create a structured second opinion preparation package. Return JSON:

{
  "recommendedSpecialist": "Which type of specialist to see",
  "urgency": "routine/soon/urgent",
  "whatToBring": ["List of documents and items to bring"],
  "keyQuestions": ["Specific questions to ask the specialist"],
  "medicalSummary": "Brief summary of relevant medical history for the specialist",
  "relevantTests": ["Additional tests that might be helpful before the visit"],
  "redFlags": ["Any concerning signs that need immediate attention, or empty array"],
  "tips": "General tips for getting the most from a second opinion"
}`;

    const result = await askGeminiJSON(
      `Prepare a second opinion package for this concern: "${concern}". Respond in ${lang === "tr" ? "Turkish" : "English"}.`,
      prompt
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Second opinion error:", error);
    return NextResponse.json(
      { error: "Failed to prepare second opinion package" },
      { status: 500 }
    );
  }
}
