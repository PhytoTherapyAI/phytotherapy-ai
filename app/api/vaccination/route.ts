// © 2026 DoctoPal — All Rights Reserved
import { NextRequest, NextResponse } from "next/server";
import { askGeminiJSON } from "@/lib/ai-client";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/sanitize";
import { tx } from "@/lib/translations";

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`vacc-get:${clientIP}`, 20, 60_000);
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
    const userId: string = user.id;

    const { data: vaccinations, error } = await supabase
      .from("vaccination_records")
      .select("*")
      .eq("user_id", user.id)
      .order("date_administered", { ascending: false });

    if (error) {
      console.error("Vaccination fetch error:", error);
      return NextResponse.json({ error: "Failed to fetch vaccinations" }, { status: 500 });
    }

    return NextResponse.json({ vaccinations: vaccinations || [] });
  } catch (error) {
    console.error("Vaccination GET error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`vacc-post:${clientIP}`, 10, 60_000);
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
    const action = body.action || "save";

    if (action === "recommendations") {
      // AI recommendations based on profile
      const lang = (body.lang === "tr" ? "tr" : "en") as "en" | "tr";

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("age, gender, chronic_conditions")
        .eq("id", user.id)
        .single();

      const { data: existingVaccines } = await supabase
        .from("vaccination_records")
        .select("vaccine_name, vaccine_type, dose_number, date_administered")
        .eq("user_id", user.id);

      const profileInfo = profile
        ? `Age: ${profile.age || "unknown"}, Gender: ${profile.gender || "unknown"}, Conditions: ${profile.chronic_conditions?.join(", ") || "none"}`
        : "No profile available";

      const existingInfo = existingVaccines?.length
        ? existingVaccines.map((v: { vaccine_name: string; dose_number: number; date_administered: string }) =>
            `${v.vaccine_name} (dose ${v.dose_number}, ${v.date_administered})`
          ).join(", ")
        : "No vaccinations recorded";

      const systemPrompt = `You are a vaccination advisor. Based on the user's profile and existing vaccinations, recommend vaccinations they may need.

USER PROFILE: ${profileInfo}
EXISTING VACCINATIONS: ${existingInfo}

Respond in ${tx("api.respondLang", lang)}.

Respond in this exact JSON format:
{
  "recommendations": [
    {
      "vaccine": "Vaccine name",
      "reason": "Why recommended",
      "priority": "high" | "medium" | "low",
      "schedule": "Recommended schedule"
    }
  ],
  "notes": "Any general notes about their vaccination status"
}

RULES:
- Consider age-appropriate vaccinations
- Check for missing boosters based on existing records
- Consider chronic conditions
- Never diagnose — only recommend consulting with their doctor
- Include standard adult vaccinations if missing (flu, tetanus boosters, etc.)`;

      const result = await askGeminiJSON(
        "Analyze vaccination needs and provide recommendations.",
        systemPrompt,
        { userId: user.id }
      );

      let parsed;
      try {
        parsed = typeof result === "string" ? JSON.parse(result) : result;
      } catch {
        return NextResponse.json(
          { error: tx("api.vaccination.analysisFailed", lang) },
          { status: 500 }
        );
      }

      return NextResponse.json(parsed);
    }

    // Default: save vaccination record
    const vaccineName = sanitizeInput(body.vaccine_name || "");
    const vaccineType = sanitizeInput(body.vaccine_type || "");
    const doseNumber = parseInt(body.dose_number) || 1;
    const dateAdministered = sanitizeInput(body.date_administered || "");
    const nextDueDate = sanitizeInput(body.next_due_date || "");
    const provider = sanitizeInput(body.provider || "");
    const notes = sanitizeInput(body.notes || "");

    if (!vaccineName) {
      return NextResponse.json({ error: "Vaccine name is required" }, { status: 400 });
    }

    if (!dateAdministered) {
      return NextResponse.json({ error: "Date administered is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("vaccination_records")
      .insert({
        user_id: user.id,
        vaccine_name: vaccineName,
        vaccine_type: vaccineType,
        dose_number: doseNumber,
        date_administered: dateAdministered,
        next_due_date: nextDueDate || null,
        provider: provider || null,
        notes: notes || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Vaccination insert error:", error);
      return NextResponse.json({ error: "Failed to save vaccination" }, { status: 500 });
    }

    return NextResponse.json({ success: true, vaccination: data });
  } catch (error) {
    console.error("Vaccination POST error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`vacc-del:${clientIP}`, 10, 60_000);
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Vaccination ID required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("vaccination_records")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Vaccination delete error:", error);
      return NextResponse.json({ error: "Failed to delete vaccination" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Vaccination DELETE error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
