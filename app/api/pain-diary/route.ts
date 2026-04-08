// © 2026 DoctoPal — All Rights Reserved
import { NextRequest, NextResponse } from "next/server";
import { askGeminiJSON } from "@/lib/ai-client";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/sanitize";
import { tx } from "@/lib/translations";

export const maxDuration = 60;

const VALID_LOCATIONS = [
  "head", "neck", "back", "upper_back", "lower_back",
  "chest", "abdomen", "shoulder", "elbow", "wrist", "hand",
  "hip", "knee", "ankle", "foot", "jaw", "general",
];

const VALID_PAIN_TYPES = ["sharp", "dull", "burning", "throbbing", "stabbing", "cramping", "aching"];

export async function GET(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`pain-get:${clientIP}`, 30, 60_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Please wait ${rateCheck.resetInSeconds} seconds.` },
        { status: 429, headers: { "Retry-After": String(rateCheck.resetInSeconds) } }
      );
    }

    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = Math.min(parseInt(searchParams.get("days") || "30", 10), 90);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const { data: records, error } = await supabase
      .from("pain_records")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", cutoff.toISOString().split("T")[0])
      .order("date", { ascending: false });

    if (error) {
      console.error("Pain GET error:", error);
      return NextResponse.json({ error: "Failed to fetch pain records" }, { status: 500 });
    }

    return NextResponse.json({ records: records || [] });
  } catch (err) {
    console.error("Pain GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`pain-post:${clientIP}`, 10, 60_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Please wait ${rateCheck.resetInSeconds} seconds.` },
        { status: 429, headers: { "Retry-After": String(rateCheck.resetInSeconds) } }
      );
    }

    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const action = body.action || "log";
    const lang = (body.lang === "tr" ? "tr" : "en") as "en" | "tr";

    // ─── ACTION: LOG ───────────────────────
    if (action === "log") {
      const location = VALID_LOCATIONS.includes(body.location) ? body.location : null;
      if (!location) {
        return NextResponse.json(
          { error: tx("api.painDiary.validLocation", lang) },
          { status: 400 }
        );
      }

      const intensity = Math.min(10, Math.max(1, Number(body.intensity) || 5));
      const painType = VALID_PAIN_TYPES.includes(body.pain_type) ? body.pain_type : null;
      const duration = body.duration ? sanitizeInput(String(body.duration)).slice(0, 100) : null;
      const triggers = Array.isArray(body.triggers)
        ? body.triggers.map((t: string) => sanitizeInput(String(t)).slice(0, 100)).slice(0, 10)
        : [];
      const reliefMethods = Array.isArray(body.relief_methods)
        ? body.relief_methods.map((r: string) => sanitizeInput(String(r)).slice(0, 100)).slice(0, 10)
        : [];
      const medicationsTaken = Array.isArray(body.medications_taken)
        ? body.medications_taken.map((m: string) => sanitizeInput(String(m)).slice(0, 100)).slice(0, 10)
        : [];
      const notes = body.notes ? sanitizeInput(String(body.notes)).slice(0, 500) : null;
      const recordDate = body.date || new Date().toISOString().split("T")[0];

      const painData = {
        user_id: user.id,
        date: recordDate,
        location,
        intensity,
        pain_type: painType,
        duration,
        triggers,
        relief_methods: reliefMethods,
        medications_taken: medicationsTaken,
        notes,
      };

      const { data, error } = await supabase
        .from("pain_records")
        .insert(painData)
        .select()
        .single();

      if (error) {
        console.error("Pain insert error:", error);
        return NextResponse.json({ error: "Failed to save pain record" }, { status: 500 });
      }

      return NextResponse.json({ record: data }, { status: 201 });
    }

    // ─── ACTION: ANALYZE ──────────────────
    if (action === "analyze") {
      // Fetch last 30 days of pain records
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);

      const { data: records, error: fetchError } = await supabase
        .from("pain_records")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", cutoff.toISOString().split("T")[0])
        .order("date", { ascending: true });

      if (fetchError) {
        console.error("Pain analysis fetch error:", fetchError);
        return NextResponse.json({ error: "Failed to fetch pain records" }, { status: 500 });
      }

      if (!records || records.length < 7) {
        return NextResponse.json(
          { error: tx("api.painDiary.minEntries", lang) },
          { status: 400 }
        );
      }

      // Fetch user medications
      const { data: medications } = await supabase
        .from("user_medications")
        .select("brand_name, generic_name, dosage, frequency")
        .eq("user_id", user.id);

      const medicationList = medications && medications.length > 0
        ? medications.map((m) => `${(m.generic_name || m.brand_name)}${m.generic_name ? ` (${m.generic_name})` : ""}`).join(", ")
        : "None reported";

      const painSummary = records.map((r) => ({
        date: r.date,
        location: r.location,
        intensity: r.intensity,
        type: r.pain_type,
        duration: r.duration,
        triggers: r.triggers || [],
        reliefMethods: r.relief_methods || [],
        medicationsTaken: r.medications_taken || [],
      }));

      const systemPrompt = `You are a pain management specialist for Doctopal. Analyze pain diary records and identify patterns.

RULES:
- Identify pain patterns (time of day, triggers, location correlation)
- Check if any user medications could be contributing to pain
- Provide evidence-based non-pharmacological pain management suggestions
- Flag concerning patterns (escalating intensity, new locations, chronic patterns)
- Respond in ${tx("api.respondLang", lang)}
- Never diagnose — suggest when to see a pain specialist

OUTPUT FORMAT (strict JSON):
{
  "overallPattern": "<string: summary of pain patterns observed>",
  "averageIntensity": <number 1-10>,
  "frequencyPerWeek": <number>,
  "mostCommonLocation": "<string>",
  "mostCommonType": "<string>",
  "patterns": [
    {
      "pattern": "<observed pattern description>",
      "significance": "<why this matters>",
      "suggestion": "<what to do about it>"
    }
  ],
  "triggerAnalysis": [
    {
      "trigger": "<trigger name>",
      "frequency": <number of times observed>,
      "correlation": "<how strongly correlated with pain>"
    }
  ],
  "medicationCorrelation": [<string: how medications may relate to pain patterns>],
  "reliefEffectiveness": [
    {
      "method": "<relief method>",
      "effectiveness": "<seems effective | limited effect | inconclusive>"
    }
  ],
  "recommendations": [<string: actionable pain management tips, max 5>],
  "alertLevel": "<green | yellow | red>",
  "alertMessage": "<string: alert explanation or empty>",
  "whenToSeeDoctor": [<string: warning signs>],
  "sources": [{"title": "<string>", "url": "<PubMed URL>"}]
}`;

      const prompt = `Analyze these pain diary records from the past ${records.length} days:

PAIN RECORDS:
${JSON.stringify(painSummary, null, 2)}

USER MEDICATIONS: ${medicationList}

Provide a comprehensive pain pattern analysis as JSON.`;

      const result = await askGeminiJSON(prompt, systemPrompt);
      let analysis; try { analysis = JSON.parse(result); } catch { return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 }); }

      return NextResponse.json({ analysis });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Pain diary error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
