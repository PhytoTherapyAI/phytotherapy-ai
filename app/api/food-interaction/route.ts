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
    const rateCheck = checkRateLimit(`food:${clientIP}`, 10, 60_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Please wait ${rateCheck.resetInSeconds} seconds.` },
        { status: 429, headers: { "Retry-After": String(rateCheck.resetInSeconds) } }
      );
    }

    const body = await request.json();
    const foods = (body.foods || []).map((f: string) => sanitizeInput(f)).filter(Boolean);
    const lang = body.lang || "en";

    if (foods.length === 0) {
      return NextResponse.json(
        { error: lang === "tr" ? "En az bir besin seçin" : "Select at least one food" },
        { status: 400 }
      );
    }

    // Fetch user medications
    let medications: string[] = [];
    let profileContext = "";
    const authHeader = request.headers.get("authorization");

    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const supabase = createServerClient();
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user) {
          const { data: meds } = await supabase
            .from("user_medications")
            .select("brand_name, generic_name")
            .eq("user_id", user.id)
            .eq("is_active", true);

          const { data: profile } = await supabase
            .from("user_profiles")
            .select("age, gender, is_pregnant, kidney_disease, liver_disease")
            .eq("id", user.id)
            .single();

          if (meds?.length) {
            medications = meds.map((m: { generic_name: string | null; brand_name: string | null }) =>
              m.generic_name || m.brand_name || ""
            ).filter(Boolean);
          }

          if (profile) {
            const parts: string[] = [];
            if (profile.age) parts.push(`Age: ${profile.age}`);
            if (profile.gender) parts.push(`Gender: ${profile.gender}`);
            if (profile.is_pregnant) parts.push("Pregnant");
            if (profile.kidney_disease) parts.push("Kidney disease");
            if (profile.liver_disease) parts.push("Liver disease");
            profileContext = parts.join(". ");
          }

          await supabase.from("query_history").insert({
            user_id: user.id,
            query_text: `Food-Drug: ${foods.join(", ")} | Meds: ${medications.join(", ")}`,
            query_type: "food_interaction" as const,
          });
        }
      } catch {
        // Continue as guest
      }
    }

    // Also accept manually provided medications for guests
    if (body.medications?.length) {
      const manualMeds = (body.medications as string[]).map((m: string) => sanitizeInput(m)).filter(Boolean);
      medications = [...new Set([...medications, ...manualMeds])];
    }

    if (medications.length === 0) {
      return NextResponse.json(
        { error: lang === "tr" ? "İlaç profiliniz boş. Profil ayarlarından ilaçlarınızı ekleyin." : "No medications found. Add your medications in profile settings." },
        { status: 400 }
      );
    }

    // PubMed search
    let pubmedContext = "";
    try {
      const query = `${foods.join(" OR ")} AND ${medications.slice(0, 3).join(" OR ")} AND food drug interaction`;
      const articles = await searchPubMed(query, 3);
      if (articles.length > 0) {
        pubmedContext = articles
          .map((a: { title: string; abstract?: string }) => `- ${a.title}: ${(a.abstract || "").slice(0, 200)}`)
          .join("\n");
      }
    } catch {
      // Continue without PubMed
    }

    const systemPrompt = `You are a food-drug interaction specialist at Phytotherapy.ai.
Analyze interactions between foods/beverages and medications.

${profileContext ? `PATIENT: ${profileContext}` : ""}
${pubmedContext ? `RESEARCH:\n${pubmedContext}` : ""}

Respond in ${lang === "tr" ? "Turkish" : "English"} with this exact JSON:
{
  "interactions": [
    {
      "food": "food name",
      "medication": "medication name",
      "severity": "safe" | "caution" | "dangerous",
      "effect": "What happens when combined",
      "mechanism": "Why this interaction occurs",
      "recommendation": "What the patient should do",
      "timing": "Timing advice if relevant, or empty string",
      "sources": [{ "title": "Source", "url": "https://pubmed.ncbi.nlm.nih.gov/..." }]
    }
  ],
  "generalAdvice": "Overall dietary advice considering all medications",
  "disclaimer": "Educational disclaimer"
}

RULES:
1. Check EVERY food against EVERY medication
2. Include common interactions: grapefruit+statins, caffeine+various, alcohol+various, dairy+antibiotics, vitamin K foods+warfarin, tyramine foods+MAOIs
3. severity must be "safe", "caution", or "dangerous"
4. Be specific about mechanisms (CYP3A4 inhibition, chelation, etc.)
5. Always include timing advice when relevant`;

    const result = await askGeminiJSON(
      `Check food-drug interactions:\nFoods: ${foods.join(", ")}\nMedications: ${medications.join(", ")}`,
      systemPrompt
    );

    let parsed;
    try {
      parsed = typeof result === "string" ? JSON.parse(result) : result;
    } catch {
      return NextResponse.json(
        { error: lang === "tr" ? "Analiz başarısız oldu" : "Analysis failed" },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Food interaction API error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
