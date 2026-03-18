import { NextRequest, NextResponse } from "next/server";
import { analyzeInteraction, UserProfileForInteraction } from "@/lib/interaction-engine";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { sanitizeInput, sanitizeArray } from "@/lib/sanitize";

export const maxDuration = 60; // Allow up to 60s for Gemini + PubMed

export async function POST(request: NextRequest) {
  try {
    // Rate limiting — 10 requests per minute per IP
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`interaction:${clientIP}`, 10, 60_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Please wait ${rateCheck.resetInSeconds} seconds.` },
        { status: 429, headers: { "Retry-After": String(rateCheck.resetInSeconds) } }
      );
    }

    const body = await request.json();
    const medications = sanitizeArray(body.medications);
    const concern = sanitizeInput(body.concern || "");
    const { lang } = body;

    // Validate input
    if (medications.length === 0) {
      return NextResponse.json(
        { error: "At least one medication is required" },
        { status: 400 }
      );
    }

    if (!concern || concern.length === 0) {
      return NextResponse.json(
        { error: "Health concern is required" },
        { status: 400 }
      );
    }

    if (concern.length > 1000) {
      return NextResponse.json(
        { error: "Concern text too long (max 1000 characters)" },
        { status: 400 }
      );
    }

    if (medications.length > 20) {
      return NextResponse.json(
        { error: "Maximum 20 medications allowed per query" },
        { status: 400 }
      );
    }

    // Try to get user profile if authenticated
    let profile: UserProfileForInteraction | null = null;
    const authHeader = request.headers.get("authorization");

    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const supabase = createServerClient();
        const { data: { user } } = await supabase.auth.getUser(token);

        if (user) {
          // Fetch profile
          const { data: profileData } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          // Fetch medications
          const { data: medsData } = await supabase
            .from("user_medications")
            .select("brand_name, generic_name, dosage")
            .eq("user_id", user.id)
            .eq("is_active", true);

          // Fetch allergies
          const { data: allergiesData } = await supabase
            .from("user_allergies")
            .select("allergen")
            .eq("user_id", user.id);

          if (profileData) {
            profile = {
              age: profileData.age,
              gender: profileData.gender,
              is_pregnant: profileData.is_pregnant || false,
              is_breastfeeding: profileData.is_breastfeeding || false,
              kidney_disease: profileData.kidney_disease || false,
              liver_disease: profileData.liver_disease || false,
              allergies: (allergiesData || []).map((a: { allergen: string }) => a.allergen),
              medications: (medsData || []).map((m: { brand_name: string | null; generic_name: string | null; dosage: string | null }) => ({
                brand_name: m.brand_name,
                generic_name: m.generic_name,
                dosage: m.dosage,
              })),
            };
          }

          // Save query to history
          await supabase.from("query_history").insert({
            user_id: user.id,
            query_text: `Medications: ${medications.join(", ")} | Concern: ${concern}`,
            query_type: "interaction" as const,
          });
        }
      } catch (authError) {
        // Continue without profile — guest mode
        console.error("Auth error (continuing as guest):", authError);
      }
    }

    // Run the interaction engine
    const result = await analyzeInteraction(medications, concern.trim(), profile, lang || "en");

    return NextResponse.json(result);
  } catch (error) {
    console.error("Interaction API error:", error);
    return NextResponse.json(
      {
        error: "An error occurred while analyzing interactions. Please try again.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
