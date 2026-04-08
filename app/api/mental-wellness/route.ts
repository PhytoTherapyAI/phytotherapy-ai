// © 2026 DoctoPal — All Rights Reserved
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`mw-get:${clientIP}`, 30, 60_000);
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

    // Last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: records, error: dbError } = await supabase
      .from("mood_records")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", thirtyDaysAgo.toISOString().split("T")[0])
      .order("date", { ascending: false });

    if (dbError) {
      console.error("Mood records GET error:", dbError);
      return NextResponse.json({ error: "Failed to fetch records" }, { status: 500 });
    }

    return NextResponse.json({ records: records || [] });
  } catch (err) {
    console.error("Mental wellness GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`mw-post:${clientIP}`, 10, 60_000);
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
    const { mood, energy, stress, anxiety, focus, triggers, coping_methods, notes } = body;

    // Validate 1-5 ranges
    const validate15 = (v: unknown): number | null => {
      if (v === null || v === undefined) return null;
      const n = Number(v);
      if (isNaN(n) || n < 1 || n > 5) return null;
      return n;
    };

    const moodVal = validate15(mood);
    const energyVal = validate15(energy);
    const stressVal = validate15(stress);
    const anxietyVal = validate15(anxiety);
    const focusVal = validate15(focus);

    if (!moodVal) {
      return NextResponse.json({ error: "Mood is required (1-5)" }, { status: 400 });
    }

    const today = new Date().toISOString().split("T")[0];

    const recordData = {
      user_id: user.id,
      date: today,
      mood: moodVal,
      energy: energyVal,
      stress: stressVal,
      anxiety: anxietyVal,
      focus: focusVal,
      triggers: Array.isArray(triggers) ? triggers.filter((t: unknown) => typeof t === "string").slice(0, 10) : [],
      coping_methods: Array.isArray(coping_methods) ? coping_methods.filter((c: unknown) => typeof c === "string").slice(0, 10) : [],
      notes: typeof notes === "string" ? notes.slice(0, 1000) : null,
    };

    // Upsert — one record per day per user
    const { data: existing } = await supabase
      .from("mood_records")
      .select("id")
      .eq("user_id", user.id)
      .eq("date", today)
      .single();

    if (existing) {
      const { data, error } = await supabase
        .from("mood_records")
        .update(recordData)
        .eq("id", existing.id)
        .select()
        .single();

      if (error) {
        console.error("Mood record update error:", error);
        return NextResponse.json({ error: "Failed to update record" }, { status: 500 });
      }
      return NextResponse.json({ record: data });
    }

    const { data, error } = await supabase
      .from("mood_records")
      .insert(recordData)
      .select()
      .single();

    if (error) {
      console.error("Mood record insert error:", error);
      return NextResponse.json({ error: "Failed to save record" }, { status: 500 });
    }

    return NextResponse.json({ record: data }, { status: 201 });
  } catch (err) {
    console.error("Mental wellness POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
