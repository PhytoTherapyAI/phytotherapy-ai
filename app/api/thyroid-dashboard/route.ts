// © 2026 DoctoPal — All Rights Reserved
import { NextRequest, NextResponse } from "next/server";
import { askGeminiJSON } from "@/lib/ai-client";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { tx } from "@/lib/translations";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`thyroid-dashboard:${clientIP}`, 10, 60_000);
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

    const tsh = Number(body.tsh) || 0;
    const t3 = Number(body.t3) || 0;
    const t4 = Number(body.t4) || 0;
    const antiTPO = Number(body.anti_tpo) || 0;

    if (tsh <= 0) {
      return NextResponse.json(
        { error: tx("api.thyroid.tshRequired", lang) },
        { status: 400 }
      );
    }

    const [medsResult, profileResult] = await Promise.all([
      supabase
        .from("user_medications")
        .select("brand_name, generic_name, dosage, frequency")
        .eq("user_id", user.id),
      supabase
        .from("user_profiles")
        .select("age, gender, chronic_conditions, is_pregnant, is_breastfeeding")
        .eq("id", user.id)
        .single(),
    ]);

    const medications = medsResult.data || [];
    const profile = profileResult.data;

    const medicationList = medications.length > 0
      ? medications.map((m) => `${(m.generic_name || m.brand_name)}${m.generic_name ? ` (${m.generic_name})` : ""}`).join(", ")
      : "None reported";

    const profileInfo = profile
      ? `Age: ${profile.age || "unknown"}, Gender: ${profile.gender || "unknown"}, Pregnant: ${profile.is_pregnant || false}, Breastfeeding: ${profile.is_breastfeeding || false}, Chronic conditions: ${profile.chronic_conditions?.join(", ") || "none"}`
      : "No profile data";

    const systemPrompt = `You are an endocrinology-informed health analyst for DoctoPal. Analyze thyroid lab values and provide evidence-based thyroid health guidance.

RULES:
- Classify thyroid status: Normal TSH (0.4-4.0), Subclinical hypothyroidism (4.0-10.0 with normal T4), Hypothyroidism (>10 or low T4), Hyperthyroidism (<0.4 with high T3/T4)
- CRITICAL: Levothyroxine absorption blockers — must take 30-60min before food and 4h apart from: calcium supplements, iron supplements, PPIs (omeprazole), cholestyramine, antacids (aluminum hydroxide), soy products, coffee
- Check medications affecting thyroid: lithium→hypothyroidism, amiodarone→hypo/hyperthyroidism, interferon alpha→thyroiditis, iodine excess
- Anti-TPO positive → Hashimoto's risk, selenium supplementation evidence
- Pregnancy thyroid: TSH targets different in pregnancy (trimester-specific)
- Use PubMed-backed evidence
- Respond in ${tx("api.respondLang", lang)}
- Never diagnose — suggest when to see an endocrinologist

OUTPUT FORMAT (strict JSON):
{
  "thyroidStatus": "<Normal | Subclinical Hypothyroidism | Hypothyroidism | Hyperthyroidism | Subclinical Hyperthyroidism>",
  "statusColor": "<green | yellow | orange | red>",
  "labInterpretation": {
    "tsh": "<string: interpretation>",
    "t3": "<string: interpretation or not provided>",
    "t4": "<string: interpretation or not provided>",
    "antiTPO": "<string: interpretation or not provided>"
  },
  "medicationTimingOptimization": [
    {
      "medication": "<med name>",
      "currentIssue": "<what might be wrong>",
      "optimalTiming": "<when to take>",
      "separateFrom": "<what to separate from and by how long>"
    }
  ],
  "timingTimeline": [
    {
      "time": "<e.g. 6:00 AM>",
      "action": "<what to take/do>",
      "note": "<why>"
    }
  ],
  "supplements": [
    {
      "name": "<supplement name>",
      "dosage": "<dosage>",
      "benefit": "<thyroid benefit>",
      "safety": "<safe | caution | avoid>",
      "timingNote": "<when to take relative to thyroid medication>"
    }
  ],
  "pregnancyNote": "<string: pregnancy-specific thyroid info or empty>",
  "alertLevel": "<green | yellow | red>",
  "whenToSeeDoctor": [<string: warning signs>],
  "sources": [{"title": "<string>", "url": "<PubMed URL>"}]
}`;

    const prompt = `Analyze these thyroid lab values:

TSH: ${tsh} mIU/L
T3: ${t3 || "not provided"} pg/mL
T4: ${t4 || "not provided"} ng/dL
Anti-TPO: ${antiTPO || "not provided"} IU/mL

USER PROFILE: ${profileInfo}
USER MEDICATIONS: ${medicationList}

Provide a comprehensive thyroid health analysis as JSON.`;

    const result = await askGeminiJSON(prompt, systemPrompt, { userId: user.id });
    let analysis; try { analysis = JSON.parse(result); } catch { return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 }); }

    try {
      await supabase.from("query_history").insert({
        user_id: user.id,
        query_text: `Thyroid dashboard: TSH ${tsh}`,
        response_text: `Status: ${analysis.thyroidStatus}`,
        query_type: "general",
      });
    } catch { /* Non-critical */ }

    return NextResponse.json({ analysis });
  } catch (err) {
    console.error("Thyroid dashboard error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
