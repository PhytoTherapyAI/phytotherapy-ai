// © 2026 DoctoPal — All Rights Reserved
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
    const rateCheck = checkRateLimit(`travel:${clientIP}`, 10, 60_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Please wait ${rateCheck.resetInSeconds} seconds.` },
        { status: 429, headers: { "Retry-After": String(rateCheck.resetInSeconds) } }
      );
    }

    const body = await request.json();
    const destination = sanitizeInput(body.destination || "");
    const startDate = sanitizeInput(body.startDate || "");
    const endDate = sanitizeInput(body.endDate || "");
    const lang = (body.lang === "tr" ? "tr" : "en") as "en" | "tr";

    if (!destination || destination.length < 2) {
      return NextResponse.json(
        { error: tx("api.travel.enterDestination", lang) },
        { status: 400 }
      );
    }

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: tx("api.travel.selectDates", lang) },
        { status: 400 }
      );
    }

    // Fetch user profile if authenticated
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
            .select("age, gender, is_pregnant, is_breastfeeding, kidney_disease, liver_disease, chronic_conditions")
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

          // Fetch existing vaccination records
          const { data: vaccinations } = await supabase
            .from("vaccination_records")
            .select("vaccine_name, vaccine_type, dose_number, date_administered")
            .eq("user_id", user.id);

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
            if (vaccinations?.length) parts.push(`Existing vaccinations: ${vaccinations.map((v: { vaccine_name: string; dose_number: number }) => `${v.vaccine_name} (dose ${v.dose_number})`).join(", ")}`);
            profileContext = parts.join(". ");
          }

          // Save to query history
          await supabase.from("query_history").insert({
            user_id: user.id,
            query_text: `Travel Health: ${destination} (${startDate} - ${endDate})`,
            query_type: "travel" as const,
          });
        }
      } catch {
        // Continue as guest
      }
    }

    const systemPrompt = `You are DoctoPal's travel health advisor. You provide evidence-based travel health guidance.

RULES:
1. Provide accurate vaccination requirements based on destination
2. Consider the user's medications for timezone adjustment advice
3. Be specific about regional health risks
4. Include practical pharmacy checklist items
5. Provide jet lag management plans when timezone difference is significant
6. Always include local emergency numbers
7. Respond in ${tx("api.respondLang", lang)}
8. Never diagnose or prescribe — only inform and recommend consulting a travel medicine specialist

${profileContext ? `USER PROFILE: ${profileContext}` : "No user profile available — provide general advice."}

Travel details: Destination: ${destination}, Departure: ${startDate}, Return: ${endDate}

Respond in this exact JSON format:
{
  "vaccinations": {
    "required": [{ "name": "Vaccine name", "reason": "Why required", "timing": "When to get it before travel" }],
    "recommended": [{ "name": "Vaccine name", "reason": "Why recommended", "timing": "When to get it" }]
  },
  "medicationPlan": [{ "medication": "Name", "adjustment": "Timezone/schedule adjustment advice", "notes": "Important notes" }],
  "risks": [{ "risk": "Risk name", "severity": "high" | "moderate" | "low", "description": "Brief description", "prevention": "How to prevent" }],
  "pharmacyChecklist": [{ "item": "Item name", "reason": "Why to pack it" }],
  "jetLagPlan": [{ "day": "Day -2 / Day 1 / etc.", "advice": "What to do" }],
  "emergencyNumbers": [{ "service": "Service name", "number": "Phone number" }],
  "generalTips": ["Tip 1", "Tip 2"]
}

IMPORTANT:
- Only include medications in medicationPlan if the user has medications in their profile
- If no profile, medicationPlan should be empty array with a note to consult their doctor
- Be specific to the destination country
- Include at least 3 pharmacy checklist items
- Emergency numbers must be real and accurate for the destination`;

    const result = await askGeminiJSON(
      `Provide comprehensive travel health advice for traveling to ${destination} from ${startDate} to ${endDate}.`,
      systemPrompt
    );

    let parsed;
    try {
      parsed = typeof result === "string" ? JSON.parse(result) : result;
    } catch {
      return NextResponse.json(
        { error: tx("api.travel.analysisFailed", lang) },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Travel health API error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
