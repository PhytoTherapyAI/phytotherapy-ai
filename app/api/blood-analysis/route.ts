// © 2026 DoctoPal — All Rights Reserved
import { NextRequest } from "next/server";
import { askStreamJSON } from "@/lib/ai-client";
import { BLOOD_TEST_PROMPT } from "@/lib/prompts";
import { createServerClient } from "@/lib/supabase";
import {
  BLOOD_TEST_MARKERS,
  analyzeValue,
  type BloodTestResult,
  type BloodTestCategory,
} from "@/lib/blood-reference";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { tx } from "@/lib/translations";

export const maxDuration = 60;

// ============================================
// Types
// ============================================

interface BloodTestInput {
  values: Record<string, number>; // markerId -> value
  gender?: "male" | "female" | null;
  testDate?: string | null; // ISO date string or approximate period
  testDateApprox?: "last3months" | "last6months" | "lastYear" | "olderThanYear" | null;
}

interface GeminiAnalysis {
  summary: string;
  abnormalFindings: Array<{
    marker: string;
    value: string;
    status: string;
    explanation: string;
    concern: string;
  }>;
  supplementRecommendations: Array<{
    supplement: string;
    reason: string;
    dosage: string;
    duration: string;
    evidenceGrade: "A" | "B" | "C";
    sources: Array<{ title: string; url: string; year: string }>;
  }>;
  lifestyleAdvice: Array<{
    category: string;
    advice: string;
    reason: string;
  }>;
  doctorDiscussion: string[];
  disclaimer: string;
  triage?: {
    timeWarning?: {
      testAge: "recent" | "months_old" | "year_old" | "very_old";
      message: string;
      messageTr: string;
    };
    specialtyRecommendations: Array<{
      specialty: string;
      specialtyTr: string;
      probability: number;
      reason: string;
      reasonTr: string;
      urgency: "routine" | "soon" | "urgent";
      keyMarkers: string[];
    }>;
    overallUrgency: "routine" | "soon" | "urgent" | "emergency";
  };
}

// ============================================
// POST Handler
// ============================================

export async function POST(request: NextRequest) {
  try {
    // Rate limiting — 10 requests per minute per IP
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`blood:${clientIP}`, 10, 60_000);
    if (!rateCheck.allowed) {
      return new Response(
        JSON.stringify({ error: `Too many requests. Please wait ${rateCheck.resetInSeconds} seconds.` }),
        { status: 429, headers: { "Content-Type": "application/json", "Retry-After": String(rateCheck.resetInSeconds) } }
      );
    }

    const body = await request.json();
    const { values, gender, lang, testDate, testDateApprox } = body as BloodTestInput & { lang?: string };

    if (!values || typeof values !== "object" || Object.keys(values).length === 0) {
      return new Response(
        JSON.stringify({ error: "At least one blood test value is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Step 1: Analyze values against reference ranges
    const results: BloodTestResult[] = [];
    for (const [markerId, value] of Object.entries(values)) {
      const marker = BLOOD_TEST_MARKERS.find((m) => m.id === markerId);
      if (!marker) continue;
      if (typeof value !== "number" || isNaN(value)) continue;
      results.push(analyzeValue(marker, value, gender));
    }

    if (results.length === 0) {
      return new Response(
        JSON.stringify({ error: "No valid blood test values provided" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Step 2: Get user profile if authenticated
    let profileContext = "";
    let hasMedications = false;
    const authHeader = request.headers.get("authorization");
    let userId: string | null = null;

    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const supabase = createServerClient();
        const { data: { user } } = await supabase.auth.getUser(token);

        if (user) {
          userId = user.id;
          const [{ data: profile }, { data: meds }] = await Promise.all([
            supabase.from("user_profiles").select("*").eq("id", user.id).single(),
            supabase.from("user_medications").select("brand_name, generic_name, dosage").eq("user_id", user.id).eq("is_active", true),
          ]);

          hasMedications = !!(meds && meds.length > 0);

          if (profile) {
            profileContext = "\n\nUSER PROFILE:";
            if (profile.age) profileContext += `\n- Age: ${profile.age}`;
            if (profile.gender) profileContext += `\n- Gender: ${profile.gender}`;
            if (profile.is_pregnant) profileContext += "\n- ⚠️ PREGNANT";
            if (profile.is_breastfeeding) profileContext += "\n- ⚠️ BREASTFEEDING";
            if (profile.kidney_disease) profileContext += "\n- ⚠️ KIDNEY DISEASE";
            if (profile.liver_disease) profileContext += "\n- ⚠️ LIVER DISEASE";
            if (hasMedications) {
              profileContext += `\n- Medications: ${meds!.map((m: { generic_name: string | null; brand_name: string | null }) => m.generic_name || m.brand_name).join(", ")}`;
            }
          }
        }
      } catch (authError) {
        console.error("Auth error (continuing without profile):", authError);
      }
    }

    // Step 3: Build Gemini prompt
    const abnormal = results.filter((r) => r.status !== "optimal");
    const prompt = buildAnalysisPrompt(results, abnormal, profileContext, hasMedications, testDate, testDateApprox);

    // Step 4: Get Gemini analysis
    const userLang = tx("api.respondLang", lang === "tr" ? "tr" : "en");
    const systemPrompt = BLOOD_TEST_PROMPT + `\n\nIMPORTANT: Respond entirely in ${userLang}.` + (hasMedications
      ? "\n\nThe user has medications on file. Cross-check all supplement recommendations against their medications."
      : "\n\nIMPORTANT: The user has NO medications on file. For supplement dosages, add a note: 'Please add your medications to your profile for personalized safety checks.'");

    // Use streaming JSON to avoid Vercel timeout (stream keeps connection alive)
    let geminiResponse: string;
    try {
      geminiResponse = await askStreamJSON(prompt, systemPrompt, { premium: true, userId: userId || undefined });
    } catch (aiErr) {
      console.error("Blood test AI error:", aiErr);
      return new Response(
        JSON.stringify({ error: lang === "tr" ? "AI analiz yapılamadı. Lütfen tekrar deneyin." : "AI analysis failed. Please try again." }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }
    const analysis = parseGeminiBloodAnalysis(geminiResponse);

    // Step 5: Save to query history if authenticated
    if (userId) {
      try {
        const supabase = createServerClient();
        await supabase.from("query_history").insert({
          user_id: userId,
          query_text: `Blood test analysis: ${results.map((r) => `${r.marker.name}=${r.value}`).join(", ")}`,
          query_type: "blood_test" as const,
        });
      } catch {
        // Non-critical
      }
    }

    // Step 6: Return combined result
    const categorized = categorizeResults(results);

    return new Response(
      JSON.stringify({
        success: true,
        results: categorized,
        analysis,
        triage: analysis.triage,
        totalMarkers: results.length,
        abnormalCount: abnormal.length,
        optimalCount: results.length - abnormal.length,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Blood analysis API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to analyze blood test. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// ============================================
// Helpers
// ============================================

function buildAnalysisPrompt(
  results: BloodTestResult[],
  abnormal: BloodTestResult[],
  profileContext: string,
  hasMedications: boolean,
  testDate?: string | null,
  testDateApprox?: string | null
): string {
  let prompt = "## BLOOD TEST RESULTS\n\n";

  // Add test date context
  if (testDate) {
    prompt += `TEST DATE: ${testDate}\n`;
  } else if (testDateApprox) {
    const approxMap: Record<string, string> = {
      last3months: "Within the last 3 months",
      last6months: "Within the last 6 months",
      lastYear: "Within the last year",
      olderThanYear: "More than 1 year old",
    };
    prompt += `TEST DATE (approximate): ${approxMap[testDateApprox] || "Unknown"}\n`;
  }
  prompt += "\n";

  for (const r of results) {
    const emoji = r.status === "optimal" ? "✅" : r.status === "high" || r.status === "low" ? "🔴" : "🟡";
    prompt += `${emoji} **${r.marker.name}**: ${r.value} ${r.marker.unit} — ${r.statusLabel}\n`;
    prompt += `   (Optimal range: ${r.marker.ranges.optimal_low}-${r.marker.ranges.optimal_high} ${r.marker.unit})\n`;
  }

  if (abnormal.length > 0) {
    prompt += `\n## ABNORMAL VALUES (${abnormal.length} of ${results.length})\n`;
    for (const r of abnormal) {
      prompt += `- ${r.marker.name}: ${r.value} ${r.marker.unit} [${r.statusLabel}]\n`;
    }
  }

  prompt += profileContext;

  prompt += `\n\n## INSTRUCTIONS
Analyze these blood test results and provide evidence-based recommendations.

CRITICAL: Return ONLY a raw JSON object matching this schema:
{
  "summary": "Brief 2-3 sentence overview of overall health picture",
  "abnormalFindings": [
    {
      "marker": "Marker name",
      "value": "X unit",
      "status": "high/low/borderline",
      "explanation": "What this means for health",
      "concern": "low/moderate/high"
    }
  ],
  "supplementRecommendations": [
    {
      "supplement": "Supplement name",
      "reason": "Why recommended based on test results",
      "dosage": "${hasMedications ? "Specific dosage" : "Add your medications to profile for safe personalized dosage"}",
      "duration": "Recommended duration",
      "evidenceGrade": "A/B/C",
      "sources": [{"title": "Article title", "url": "https://pubmed.ncbi.nlm.nih.gov/PMID/", "year": "2024"}]
    }
  ],
  "lifestyleAdvice": [
    {
      "category": "Diet/Exercise/Sleep/Stress",
      "advice": "Specific actionable advice",
      "reason": "Why this helps based on results"
    }
  ],
  "doctorDiscussion": ["Point 1 to discuss with doctor", "Point 2..."],
  "disclaimer": "Standard medical disclaimer",
  "triage": {
    "timeWarning": {
      "testAge": "recent | months_old | year_old | very_old",
      "message": "Compassionate message about test date relevance (English)",
      "messageTr": "Turkish version of the message"
    },
    "specialtyRecommendations": [
      {
        "specialty": "Endocrinology",
        "specialtyTr": "Endokrinoloji",
        "probability": 75,
        "reason": "Why this specialty (English)",
        "reasonTr": "Turkish reason",
        "urgency": "routine | soon | urgent",
        "keyMarkers": ["TSH", "Free T4"]
      }
    ],
    "overallUrgency": "routine | soon | urgent | emergency"
  }
}

TRIAGE RULES:
- Always recommend at least 1 specialty, max 4
- Probabilities must sum to approximately 100%
- If test date is >6 months old, add timeWarning recommending fresh tests
- If test date is >1 year old, emphasize trend value over diagnostic value
- If no test date provided, set timeWarning.testAge to "recent" and skip the warning message
- Consider user's existing conditions and medications when recommending specialties
- Common mappings: abnormal TSH/T4 → Endocrinology, low iron/B12/ferritin → Hematology, high HbA1c/glucose → Endocrinology+Diabetology, abnormal liver enzymes → Gastroenterology, abnormal kidney markers → Nephrology, abnormal lipids → Cardiology+Internal Medicine
- "urgency" based on how far values deviate from normal ranges`;

  return prompt;
}

function parseGeminiBloodAnalysis(response: string): GeminiAnalysis {
  try {
    const data = JSON.parse(response);
    return {
      summary: String(data.summary || ""),
      abnormalFindings: Array.isArray(data.abnormalFindings)
        ? data.abnormalFindings.map((f: Record<string, unknown>) => ({
            marker: String(f.marker || ""),
            value: String(f.value || ""),
            status: String(f.status || ""),
            explanation: String(f.explanation || ""),
            concern: String(f.concern || "moderate"),
          }))
        : [],
      supplementRecommendations: Array.isArray(data.supplementRecommendations)
        ? data.supplementRecommendations.map((s: Record<string, unknown>) => ({
            supplement: String(s.supplement || ""),
            reason: String(s.reason || ""),
            dosage: String(s.dosage || ""),
            duration: String(s.duration || ""),
            evidenceGrade: (["A", "B", "C"].includes(String(s.evidenceGrade)) ? s.evidenceGrade : "C") as "A" | "B" | "C",
            sources: Array.isArray(s.sources)
              ? (s.sources as Array<Record<string, unknown>>).map((src) => ({
                  title: String(src.title || ""),
                  url: String(src.url || ""),
                  year: String(src.year || ""),
                }))
              : [],
          }))
        : [],
      lifestyleAdvice: Array.isArray(data.lifestyleAdvice)
        ? data.lifestyleAdvice.map((l: Record<string, unknown>) => ({
            category: String(l.category || ""),
            advice: String(l.advice || ""),
            reason: String(l.reason || ""),
          }))
        : [],
      doctorDiscussion: Array.isArray(data.doctorDiscussion)
        ? data.doctorDiscussion.map(String)
        : [],
      disclaimer: String(
        data.disclaimer ||
          "This analysis is for educational purposes only. Consult your healthcare provider before making any changes to your treatment."
      ),
      triage: data.triage
        ? {
            timeWarning: data.triage.timeWarning
              ? {
                  testAge: String(data.triage.timeWarning.testAge || "recent") as "recent" | "months_old" | "year_old" | "very_old",
                  message: String(data.triage.timeWarning.message || ""),
                  messageTr: String(data.triage.timeWarning.messageTr || ""),
                }
              : undefined,
            specialtyRecommendations: Array.isArray(data.triage.specialtyRecommendations)
              ? data.triage.specialtyRecommendations.map((s: Record<string, unknown>) => ({
                  specialty: String(s.specialty || ""),
                  specialtyTr: String(s.specialtyTr || ""),
                  probability: Number(s.probability || 0),
                  reason: String(s.reason || ""),
                  reasonTr: String(s.reasonTr || ""),
                  urgency: (["routine", "soon", "urgent"].includes(String(s.urgency)) ? s.urgency : "routine") as "routine" | "soon" | "urgent",
                  keyMarkers: Array.isArray(s.keyMarkers) ? s.keyMarkers.map(String) : [],
                }))
              : [],
            overallUrgency: (["routine", "soon", "urgent", "emergency"].includes(String(data.triage?.overallUrgency))
              ? data.triage.overallUrgency
              : "routine") as "routine" | "soon" | "urgent" | "emergency",
          }
        : undefined,
    };
  } catch (error) {
    console.error("Failed to parse blood analysis:", error);
    return {
      summary: "Unable to generate analysis. Please try again.",
      abnormalFindings: [],
      supplementRecommendations: [],
      lifestyleAdvice: [],
      doctorDiscussion: [],
      disclaimer: "This analysis is for educational purposes only.",
    };
  }
}

function categorizeResults(
  results: BloodTestResult[]
): Record<BloodTestCategory, BloodTestResult[]> {
  const categories: Record<string, BloodTestResult[]> = {};
  for (const r of results) {
    if (!categories[r.marker.category]) {
      categories[r.marker.category] = [];
    }
    categories[r.marker.category].push(r);
  }
  return categories as Record<BloodTestCategory, BloodTestResult[]>;
}
