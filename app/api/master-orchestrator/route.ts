// © 2026 DoctoPal — All Rights Reserved
// ============================================
// Master AI Orchestrator — /api/master-orchestrator
// Cross-module intelligence: aggregates all health data,
// runs rule engine, then generates a unified daily synergy plan
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { aggregateHealthContext } from "@/lib/health-context";
import { runCrossModuleRules } from "@/lib/cross-module-engine";
import { askClaudeJSON } from "@/lib/ai-client";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { resolveTargetUser } from "@/lib/family-permissions";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`orchestrator:${clientIP}`, 5, 60_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: { "Retry-After": String(rateCheck.resetInSeconds) } }
      );
    }

    // Family-aware auth — resolves caller's identity AND validates that they may view
    // the requested target profile (must share an accepted family_group, Premium required
    // for cross-user). Falls back to the caller's own profile when no targetUserId given.
    const authHeader = request.headers.get("authorization");
    const supabase = createServerClient();
    const body = await request.json().catch(() => ({}));
    const lang = (body.lang === "tr" ? "tr" : "en") as "en" | "tr";
    const requestedTargetUserId = (body.targetUserId as string | undefined) || null;

    const resolution = await resolveTargetUser(supabase, authHeader, requestedTargetUserId);
    if (!resolution.ok) {
      return NextResponse.json({ error: resolution.error }, { status: resolution.status });
    }

    // targetUserId drives data aggregation (whose dashboard we're building the synergy for);
    // callerId identifies the authenticated user for AI consent gate + audit.
    const targetUserId = resolution.targetUserId;
    const userId: string = resolution.callerId;

    // Step 1: Aggregate all module data for the target profile
    const healthContext = await aggregateHealthContext(supabase, targetUserId);

    // Step 2: Run deterministic rule engine
    const ruleAlerts = runCrossModuleRules(healthContext);

    // Step 3: Generate AI synergy insight
    let aiInsight = null;
    try {
      const systemPrompt = `You are the Master Health Orchestrator of DoctoPal.
You analyze a user's COMPLETE health profile across ALL modules (sleep, fitness, nutrition, supplements, vitals, medications) and generate a holistic daily synergy plan.

CRITICAL RULES:
1. NEVER give generic advice. Every sentence must connect at least 2 modules.
2. Reference the user by name (${healthContext.user.name || "friend"}).
3. Start with the most impactful cross-module insight.
4. Suggest evidence-based phytotherapy where relevant.
5. Keep it personal — "For YOUR ${healthContext.fitness.sportType || "training"} goals..."
6. Respond in ${lang === "tr" ? "Turkish" : "English"}.
7. Be a warm, knowledgeable health coach — not a clinical report.

RULE ENGINE ALERTS (already detected — reference these):
${ruleAlerts.map(a => `- [${a.severity}] ${a.title[lang]}: ${a.message[lang]}`).join("\n") || "None detected."}

USER HEALTH CONTEXT:
${JSON.stringify(healthContext, null, 2)}

Return JSON:
{
  "dailySynergy": "2-3 sentence holistic insight connecting sleep + fitness + nutrition",
  "topPriority": "The single most important thing to focus on today",
  "actions": [
    { "icon": "moon|dumbbell|leaf|utensils|pill|brain", "text": "Specific action", "module": "sleep|fitness|nutrition|supplements" }
  ],
  "phytotherapyPick": {
    "herb": "Herb name",
    "dose": "Specific dose",
    "reason": "Why this herb for THIS user TODAY",
    "evidence": "A|B|C"
  },
  "synergyScore": 0-100 (how well their modules are aligned today)
}`;

      const result = await askClaudeJSON(
        `Generate today's holistic health synergy plan for ${healthContext.user.name || "this user"}.`,
        systemPrompt,
        { userId }
      );

      aiInsight = typeof result === "string" ? JSON.parse(result) : result;
    } catch {
      // AI optional — rule alerts still work
    }

    // Cache for 30 minutes
    return NextResponse.json({
      context: {
        sleep: healthContext.sleep,
        fitness: healthContext.fitness,
        supplements: {
          total: healthContext.supplements.length,
          takenToday: healthContext.supplements.filter(s => s.takenToday).length,
        },
        streaks: healthContext.streaks,
      },
      alerts: ruleAlerts.map(a => ({
        id: a.id,
        severity: a.severity,
        title: a.title[lang],
        message: a.message[lang],
        modules: a.modules,
        action: a.action?.[lang],
        herb: a.herb?.[lang],
      })),
      aiInsight,
      timestamp: new Date().toISOString(),
    }, {
      headers: {
        "Cache-Control": "private, max-age=1800",
      },
    });
  } catch (error) {
    console.error("Master orchestrator error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
