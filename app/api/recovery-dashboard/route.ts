// © 2026 DoctoPal — All Rights Reserved
// ============================================
// Recovery Dashboard BFF — /api/recovery-dashboard
// Single endpoint for the Smart Recovery Hub
// Aggregates: sleep sessions, circadian phase, jet lag,
// shift mode, dream analysis, daily context
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { fetchDailyHealthLog, buildPromptContext } from "@/lib/daily-health-log";
import { askClaudeJSON } from "@/lib/ai-client";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";

export const maxDuration = 30;

export async function GET(request: NextRequest) {
  const clientIP = getClientIP(request);
  const rateCheck = checkRateLimit(`recovery:${clientIP}`, 10, 60_000);
  if (!rateCheck.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.replace("Bearer ", "");
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId: string = user.id;

  const lang = (request.nextUrl.searchParams.get("lang") === "tr" ? "tr" : "en") as "en" | "tr";

  try {
    // Fetch unified daily context
    const dailyLog = await fetchDailyHealthLog(supabase, user.id);

    // Build token-efficient prompt context
    const promptContext = buildPromptContext(dailyLog);

    // Generate AI recovery insight (if enough data)
    let aiInsight = null;
    if (dailyLog.sleepSessions.length > 0 || dailyLog.checkIn) {
      try {
        const isShift = dailyLog.contextTags.includes("on_call");
        const isTraveling = dailyLog.contextTags.includes("traveling");

        const systemPrompt = `You are a sleep scientist and recovery coach for DoctoPal.
Analyze today's recovery data and provide personalized guidance.
${isShift ? "IMPORTANT: User is on shift/on-call. Do NOT penalize daytime sleep. Provide shift-specific recovery advice." : ""}
${isTraveling ? "IMPORTANT: User is traveling. Provide jet lag management tips with melatonin timing." : ""}

Rules:
- Reference specific data (hours, quality scores, medications)
- Suggest evidence-based phytotherapy for recovery
- Consider circadian phase: ${dailyLog.circadianPhase}
- Respond in ${lang === "tr" ? "Turkish" : "English"}
- Be warm and personal, not clinical

${dailyLog.dreamLog?.content ? `DREAM ANALYSIS: Analyze the dream in context of medications (${dailyLog.dreamLog.medicationTags.join(", ") || "none"}) and sleep quality. Focus on cortisol, REM, and stress — not mysticism.` : ""}

DATA: ${promptContext}

Return JSON:
{
  "recoveryScore": 0-100,
  "insight": "2-3 sentence personalized recovery analysis",
  "circadianAdvice": "What to do RIGHT NOW based on current circadian phase",
  ${dailyLog.dreamLog?.content ? '"dreamAnalysis": "Clinical dream interpretation linked to medications/sleep",' : ""}
  ${isShift ? '"shiftRecovery": "Specific post-shift recovery protocol",' : ""}
  ${isTraveling ? '"jetLagPlan": "Melatonin timing + light exposure schedule",' : ""}
  "herbPick": { "name": "Herb", "dose": "Dose", "reason": "Why now", "evidence": "A|B|C" }
}`;

        const result = await askClaudeJSON(
          `Analyze today's recovery data and give personalized guidance.`,
          systemPrompt,
          { userId }
        );
        aiInsight = typeof result === "string" ? JSON.parse(result) : result;
      } catch { /* AI optional */ }
    }

    return NextResponse.json({
      dailyLog: {
        date: dailyLog.date,
        totalSleepHours: dailyLog.totalSleepHours,
        sleepSessions: dailyLog.sleepSessions,
        contextTags: dailyLog.contextTags,
        grogginess: dailyLog.grogginess,
        circadianPhase: dailyLog.circadianPhase,
        medications: dailyLog.medications.length,
        supplements: {
          total: dailyLog.supplements.length,
          taken: dailyLog.supplements.filter(s => s.takenToday).length,
        },
      },
      aiInsight,
      promptContext, // for debugging/transparency
    }, {
      headers: { "Cache-Control": "private, max-age=900" }, // 15 min cache
    });
  } catch (error) {
    console.error("Recovery dashboard error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
