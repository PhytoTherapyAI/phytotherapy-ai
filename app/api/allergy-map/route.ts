// © 2026 DoctoPal — All Rights Reserved
import { NextRequest, NextResponse } from "next/server";
import { askGeminiJSON } from "@/lib/ai-client";
import { createServerClient } from "@/lib/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/sanitize";
import { tx } from "@/lib/translations";

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`allergyGet:${clientIP}`, 20, 60_000);
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

    // Fetch allergy records
    const { data: records, error: dbError } = await supabase
      .from("allergy_intolerance_records")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (dbError) {
      // If table doesn't exist yet, fall back to user_allergies
      const { data: basicAllergies } = await supabase
        .from("user_allergies")
        .select("*")
        .eq("user_id", user.id);

      return NextResponse.json({
        records: (basicAllergies || []).map((a: { id: string; allergen: string; severity: string | null; created_at: string }) => ({
          id: a.id,
          type: "allergy",
          trigger_name: a.allergen,
          category: "unknown",
          severity: a.severity || "unknown",
          symptoms: [],
          diagnosed_by_doctor: false,
          notes: "",
          created_at: a.created_at,
        })),
      });
    }

    return NextResponse.json({ records: records || [] });
  } catch (error) {
    console.error("Allergy map GET error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`allergyPost:${clientIP}`, 10, 60_000);
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
    const lang = (body.lang === "tr" ? "tr" : "en") as "en" | "tr";

    // If action is "cross-check", do AI cross-check
    if (body.action === "cross-check") {
      return await handleCrossCheck(supabase, user.id, lang);
    }

    // Otherwise, save a new allergy record
    const triggerName = sanitizeInput(body.trigger_name || "");
    if (!triggerName) {
      return NextResponse.json(
        { error: tx("api.allergy.triggerRequired", lang) },
        { status: 400 }
      );
    }

    const type = body.type || "allergy";
    const category = sanitizeInput(body.category || "");
    const severity = body.severity || "mild";
    const symptoms = Array.isArray(body.symptoms)
      ? body.symptoms.map((s: string) => sanitizeInput(s)).filter(Boolean)
      : [];
    const diagnosedByDoctor = body.diagnosed_by_doctor === true;
    const notes = sanitizeInput(body.notes || "");

    // Try to insert into allergy_intolerance_records
    const { data: inserted, error: insertError } = await supabase
      .from("allergy_intolerance_records")
      .insert({
        user_id: user.id,
        type,
        trigger_name: triggerName,
        category,
        severity,
        symptoms,
        diagnosed_by_doctor: diagnosedByDoctor,
        notes,
      })
      .select()
      .single();

    if (insertError) {
      // Fallback: insert into user_allergies
      const { data: fallbackInserted, error: fallbackError } = await supabase
        .from("user_allergies")
        .insert({
          user_id: user.id,
          allergen: triggerName,
          severity,
        })
        .select()
        .single();

      if (fallbackError) {
        return NextResponse.json(
          { error: tx("api.allergy.saveFailed", lang) },
          { status: 500 }
        );
      }

      return NextResponse.json({ record: fallbackInserted, fallback: true });
    }

    return NextResponse.json({ record: inserted });
  } catch (error) {
    console.error("Allergy map POST error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}

async function handleCrossCheck(supabase: SupabaseClient, userId: string, lang: "en" | "tr") {
  // Fetch allergies, medications, and supplements
  const [allergiesResult, medsResult, basicAllergiesResult] = await Promise.all([
    supabase
      .from("allergy_intolerance_records")
      .select("trigger_name, type, category, severity")
      .eq("user_id", userId),
    supabase
      .from("user_medications")
      .select("brand_name, generic_name, dosage")
      .eq("user_id", userId)
      .eq("is_active", true),
    supabase
      .from("user_allergies")
      .select("allergen, severity")
      .eq("user_id", userId),
  ]);

  // Combine allergy sources
  const allergyRecords = allergiesResult.data || [];
  const basicAllergies = basicAllergiesResult.data || [];
  const allAllergies = [
    ...allergyRecords.map((a: { trigger_name: string; type: string; severity: string }) => ({
      name: a.trigger_name,
      type: a.type,
      severity: a.severity,
    })),
    ...basicAllergies.map((a: { allergen: string; severity: string | null }) => ({
      name: a.allergen,
      type: "allergy",
      severity: a.severity || "unknown",
    })),
  ];

  const medications = medsResult.data || [];

  if (allAllergies.length === 0) {
    return NextResponse.json({
      crossCheck: {
        conflicts: [],
        warnings: [],
        summary: tx("api.allergy.noAllergies", lang),
      },
    });
  }

  const allergiesText = allAllergies
    .map((a: { name: string; type: string; severity: string }) => `${a.name} (${a.type}, ${a.severity})`)
    .join(", ");
  const medsText = medications.length > 0
    ? medications.map((m: { generic_name: string | null; brand_name: string | null }) => m.generic_name || m.brand_name).join(", ")
    : "None";

  const systemPrompt = `You are DoctoPal's allergy safety specialist.
Cross-check the patient's allergies/intolerances against their medications and supplements.

ALLERGIES: ${allergiesText}
MEDICATIONS: ${medsText}

Respond in ${tx("api.respondLang", lang)} with this exact JSON:
{
  "conflicts": [
    { "allergy": "allergy name", "conflictsWith": "medication/supplement name", "risk": "high" | "moderate" | "low", "explanation": "Why this is a concern" }
  ],
  "warnings": [
    { "message": "General warning or cross-sensitivity note" }
  ],
  "summary": "1-2 sentence overall safety summary"
}

RULES:
1. Check for direct conflicts (e.g., penicillin allergy + amoxicillin)
2. Check for cross-sensitivities (e.g., sulfa allergy + certain diuretics)
3. Check for excipient risks (e.g., lactose intolerance + lactose-containing medications)
4. Be thorough but avoid false alarms
5. If no conflicts found, return empty conflicts array with reassuring summary`;

  const result = await askGeminiJSON(
    `Cross-check allergies vs medications for safety.`,
    systemPrompt,
    { userId }
  );

  let parsed;
  try {
    parsed = typeof result === "string" ? JSON.parse(result) : result;
  } catch {
    return NextResponse.json(
      { error: tx("api.allergy.analysisFailed", lang) },
      { status: 500 }
    );
  }

  return NextResponse.json({ crossCheck: parsed });
}
