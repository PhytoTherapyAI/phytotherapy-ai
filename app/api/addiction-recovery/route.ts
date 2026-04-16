// © 2026 DoctoPal — All Rights Reserved
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { askClaudeJSON } from "@/lib/ai-client";
import { tx } from "@/lib/translations";

export const maxDuration = 60;

const MILESTONES = [
  { days: 1, label: "First Day" },
  { days: 3, label: "3 Days" },
  { days: 7, label: "1 Week" },
  { days: 14, label: "2 Weeks" },
  { days: 30, label: "1 Month" },
  { days: 60, label: "2 Months" },
  { days: 90, label: "3 Months" },
  { days: 180, label: "6 Months" },
  { days: 365, label: "1 Year" },
  { days: 730, label: "2 Years" },
];

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`recovery:${clientIP}`, 5, 60_000);
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
    const lang = body.lang === "tr" ? "tr" : "en";
    const {
      substance = "alcohol",
      clean_days = 0,
      craving_level = 5,
      triggers = [],
      support_used = [],
      relapse_risk = false,
    } = body;

    // Check for suicidal content
    const suicidalKeywords = [
      "suicide", "suicidal", "kill myself", "end my life", "want to die",
      "intihar", "kendimi oldur", "yasamak istemiyorum", "olmek istiyorum",
    ];
    const bodyStr = JSON.stringify(body).toLowerCase();
    const hasSuicidalContent = suicidalKeywords.some((kw) => bodyStr.includes(kw));

    if (hasSuicidalContent) {
      return NextResponse.json({
        result: {
          alertLevel: "red",
          crisisAlert: true,
          crisisMessage: tx("api.recovery.crisisMessage", lang),
          crisisLines: [tx("api.recovery.crisisLine1", lang), tx("api.recovery.crisisLine2", lang)],
          cleanDays: clean_days,
          milestone: null,
          cravingAnalysis: null,
          copingStrategies: [],
        },
      });
    }

    // Calculate milestone
    const currentMilestone = MILESTONES.filter((m) => clean_days >= m.days).pop() || null;
    const nextMilestone = MILESTONES.find((m) => m.days > clean_days) || null;

    // Fetch user medications
    const { data: medications } = await supabase
      .from("user_medications")
      .select("brand_name, generic_name, dosage")
      .eq("user_id", user.id);

    const medicationList = medications && medications.length > 0
      ? medications.map((m) => `${(m.generic_name || m.brand_name)}${m.generic_name ? ` (${m.generic_name})` : ""}`).join(", ")
      : "None reported";

    // Check for recovery medications
    const recoveryMedKeywords = [
      "naltrexone", "vivitrol", "disulfiram", "antabuse", "acamprosate",
      "campral", "buprenorphine", "suboxone", "methadone", "varenicline",
      "chantix", "champix", "nicotine",
    ];
    const hasRecoveryMed = medications?.some((m) =>
      recoveryMedKeywords.some((kw) =>
        ((m.generic_name || m.brand_name)?.toLowerCase() || "").includes(kw) ||
        (m.generic_name?.toLowerCase() || "").includes(kw)
      )
    );

    const systemPrompt = `You are an addiction recovery support assistant for DoctoPal.
You provide compassionate, non-judgmental support for people in recovery.

CRITICAL SAFETY RULES:
- ABSOLUTELY NO judgment language — recovery is a journey, not a moral issue
- Relapse is part of recovery — never shame, always support
- If craving level >= 8, recommend immediate support contact
- NEVER suggest supplements that interact with recovery medications (naltrexone, disulfiram, etc.)
- Always mention professional support resources
- Be encouraging, celebratory for milestones, compassionate for struggles
- Validate their courage in tracking and seeking help

Respond in ${tx("api.respondLang", lang)}.

Return ONLY valid JSON:
{
  "cravingAnalysis": string,
  "copingStrategies": [{ "strategy": string, "description": string, "when": string }],
  "triggerManagement": [{ "trigger": string, "plan": string }],
  "milestoneMessage": string,
  "healthBenefits": [string],
  "medicationNotes": string,
  "supplementSuggestions": [{ "name": string, "benefit": string, "safetyNote": string }],
  "dailyAffirmation": string,
  "alertLevel": "green" | "yellow" | "red",
  "professionalReferral": boolean
}`;

    const prompt = `Analyze this recovery check-in:

SUBSTANCE: ${substance}
CLEAN DAYS: ${clean_days}
CRAVING LEVEL: ${craving_level}/10
TRIGGERS TODAY: ${triggers.length > 0 ? triggers.join(", ") : "None identified"}
SUPPORT USED: ${support_used.length > 0 ? support_used.join(", ") : "None"}
RELAPSE RISK: ${relapse_risk ? "User reports feeling at risk" : "Not reported"}
CURRENT MILESTONE: ${currentMilestone ? `${currentMilestone.label} (${currentMilestone.days} days)` : "Starting journey"}
NEXT MILESTONE: ${nextMilestone ? `${nextMilestone.label} (${nextMilestone.days - clean_days} days to go)` : "Continuing journey"}
USER MEDICATIONS: ${medicationList}
HAS RECOVERY MEDICATION: ${hasRecoveryMed ? "YES" : "NO"}

Provide compassionate recovery support. Celebrate progress, no matter how small.
If craving >= 8 or relapse risk is true, set alertLevel to at least "yellow" and professionalReferral to true.`;

    const resultText = await askClaudeJSON(prompt, systemPrompt, { userId: user.id });
    let analysis; try { analysis = JSON.parse(resultText); } catch { return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 }); }

    // Enforce safety overrides
    if (craving_level >= 9 || relapse_risk) {
      if (analysis.alertLevel === "green") analysis.alertLevel = "yellow";
      analysis.professionalReferral = true;
    }

    return NextResponse.json({
      result: {
        ...analysis,
        cleanDays: clean_days,
        milestone: currentMilestone,
        nextMilestone,
        substance,
        crisisAlert: false,
        crisisLines: [tx("api.recovery.responseCrisisLine1", lang), tx("api.recovery.responseCrisisLine2", lang), tx("api.recovery.responseCrisisLine3", lang)],
      },
    });
  } catch (err) {
    console.error("Addiction recovery error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
