// © 2026 Phytotherapy.ai — All Rights Reserved
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/sanitize";

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`rehab-get:${clientIP}`, 20, 60_000);
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

    // Fetch programs
    const { data: programs, error: progError } = await supabase
      .from("rehab_programs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (progError) {
      console.error("Rehab programs fetch error:", progError);
      return NextResponse.json({ error: "Failed to fetch programs" }, { status: 500 });
    }

    // Fetch daily logs for all programs
    const programIds = (programs || []).map((p: { id: string }) => p.id);
    let logs: Record<string, unknown>[] = [];
    if (programIds.length > 0) {
      const { data: logData, error: logError } = await supabase
        .from("rehab_daily_log")
        .select("*")
        .in("program_id", programIds)
        .order("date", { ascending: true });

      if (logError) {
        console.error("Rehab logs fetch error:", logError);
      } else {
        logs = logData || [];
      }
    }

    return NextResponse.json({ programs: programs || [], logs });
  } catch (error) {
    console.error("Rehabilitation GET error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`rehab-post:${clientIP}`, 10, 60_000);
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
    const action = body.action;

    if (action === "create_program") {
      const surgeryType = sanitizeInput(body.surgery_type || "");
      const surgeryDate = sanitizeInput(body.surgery_date || "");
      const condition = sanitizeInput(body.condition || "");
      const startDate = sanitizeInput(body.start_date || "");
      const targetEndDate = sanitizeInput(body.target_end_date || "");
      const notes = sanitizeInput(body.notes || "");

      if (!surgeryType && !condition) {
        return NextResponse.json({ error: "Surgery type or condition is required" }, { status: 400 });
      }

      if (!startDate) {
        return NextResponse.json({ error: "Start date is required" }, { status: 400 });
      }

      const { data, error } = await supabase
        .from("rehab_programs")
        .insert({
          user_id: user.id,
          surgery_type: surgeryType || null,
          surgery_date: surgeryDate || null,
          condition: condition || null,
          start_date: startDate,
          target_end_date: targetEndDate || null,
          notes: notes || null,
          phase: "acute",
        })
        .select()
        .single();

      if (error) {
        console.error("Rehab program insert error:", error);
        return NextResponse.json({ error: "Failed to create program" }, { status: 500 });
      }

      return NextResponse.json({ success: true, program: data });
    }

    if (action === "daily_log") {
      const programId = body.program_id;
      const painLevel = Math.min(10, Math.max(0, parseInt(body.pain_level) || 0));
      const mobilityScore = Math.min(10, Math.max(1, parseInt(body.mobility_score) || 5));
      const exercisesCompleted = body.exercises_completed || "";
      const swelling = sanitizeInput(body.swelling || "none");
      const notes = sanitizeInput(body.notes || "");
      const logDate = sanitizeInput(body.log_date || new Date().toISOString().split("T")[0]);

      if (!programId) {
        return NextResponse.json({ error: "Program ID is required" }, { status: 400 });
      }

      // Verify program belongs to user
      const { data: program } = await supabase
        .from("rehab_programs")
        .select("id")
        .eq("id", programId)
        .eq("user_id", user.id)
        .single();

      if (!program) {
        return NextResponse.json({ error: "Program not found" }, { status: 404 });
      }

      const { data, error } = await supabase
        .from("rehab_daily_log")
        .insert({
          program_id: programId,
          user_id: user.id,
          date: logDate,
          pain_level: painLevel,
          mobility_score: mobilityScore,
          exercises_completed: exercisesCompleted ? [exercisesCompleted] : [],
          swelling,
          notes: notes || null,
        })
        .select()
        .single();

      if (error) {
        console.error("Rehab daily log insert error:", error);
        return NextResponse.json({ error: "Failed to save daily log" }, { status: 500 });
      }

      return NextResponse.json({ success: true, log: data });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Rehabilitation POST error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
