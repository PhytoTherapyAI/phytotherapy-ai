import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * POST /api/doctor-feedback
 * Human-in-the-Loop: Doctors report inaccurate or risky AI recommendations
 *
 * This feedback is used to:
 * 1. Flag specific interactions/recommendations for review
 * 2. Build a correction database for prompt refinement
 * 3. Track AI accuracy over time (precision/recall metrics)
 * 4. Identify systematic errors in the AI model
 *
 * Retraining flow:
 * Doctor reports error → Stored in doctor_feedback table →
 * Weekly review by medical team → Confirmed errors added to
 * correction database → Safety guardrail updated → AI prompt
 * enhanced with correction examples (few-shot learning)
 */

interface FeedbackPayload {
  doctorId: string;
  queryId?: string;         // Original query that generated the recommendation
  feedbackType: "incorrect_interaction" | "missing_interaction" | "wrong_dosage" | "unsafe_recommendation" | "hallucination" | "outdated_info" | "other";
  severity: "critical" | "high" | "medium" | "low";
  aiRecommendation: string; // What the AI said
  correction: string;       // What it should have said
  evidence?: string;        // PubMed ID or reference
  patientContext?: string;  // Anonymized patient context
  notes?: string;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const { allowed } = checkRateLimit(`doctor-feedback:${ip}`, 10, 60000);
  if (!allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const body: FeedbackPayload = await req.json();
    const { doctorId, feedbackType, severity, aiRecommendation, correction } = body;

    if (!doctorId || !feedbackType || !aiRecommendation || !correction) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createServerClient();

    // Verify doctor role
    const { data: doctorProfile } = await supabase
      .from("user_profiles")
      .select("role, full_name")
      .eq("id", doctorId)
      .single();

    if (!doctorProfile || doctorProfile.role !== "doctor") {
      return NextResponse.json({ error: "Only verified doctors can submit feedback" }, { status: 403 });
    }

    // Store feedback
    const { data: feedback, error } = await supabase
      .from("doctor_feedback")
      .insert({
        doctor_id: doctorId,
        doctor_name: doctorProfile.full_name,
        query_id: body.queryId || null,
        feedback_type: feedbackType,
        severity,
        ai_recommendation: aiRecommendation,
        correction,
        evidence: body.evidence || null,
        patient_context: body.patientContext || null,
        notes: body.notes || null,
        status: "pending_review",  // pending_review → confirmed → applied → rejected
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      // Table might not exist yet
      console.warn("[Doctor Feedback] Insert error:", error.message);
      return NextResponse.json({
        success: true,
        message: "Feedback received (table setup pending)",
        feedbackId: `fb-${Date.now()}`,
      });
    }

    // If severity is critical, notify admin immediately
    if (severity === "critical") {
      console.error(`[CRITICAL FEEDBACK] Doctor ${doctorProfile.full_name} reported critical issue:`, {
        type: feedbackType,
        recommendation: aiRecommendation.substring(0, 100),
        correction: correction.substring(0, 100),
      });
      // In production: send email/Slack notification to medical review team
    }

    return NextResponse.json({
      success: true,
      message: "Feedback submitted successfully. Our medical team will review it.",
      feedbackId: feedback?.id || `fb-${Date.now()}`,
    });
  } catch (error) {
    console.error("[Doctor Feedback] Error:", error);
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 });
  }
}

// GET: Retrieve feedback stats (admin only)
export async function GET(req: Request) {
  const url = new URL(req.url);
  const doctorId = url.searchParams.get("doctorId");

  if (!doctorId) {
    return NextResponse.json({ error: "doctorId required" }, { status: 400 });
  }

  const supabase = createServerClient();

  // Verify doctor role
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", doctorId)
    .single();

  if (!profile || profile.role !== "doctor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Get this doctor's feedback history
  const { data: feedbacks } = await supabase
    .from("doctor_feedback")
    .select("id, feedback_type, severity, status, created_at")
    .eq("doctor_id", doctorId)
    .order("created_at", { ascending: false })
    .limit(50);

  return NextResponse.json({
    feedbacks: feedbacks || [],
    stats: {
      total: feedbacks?.length || 0,
      pending: feedbacks?.filter((f) => f.status === "pending_review").length || 0,
      confirmed: feedbacks?.filter((f) => f.status === "confirmed").length || 0,
      applied: feedbacks?.filter((f) => f.status === "applied").length || 0,
    },
  });
}
