// © 2026 DoctoPal — All Rights Reserved
import { NextRequest, NextResponse } from "next/server";
import { askClaudeJSON } from "@/lib/ai-client";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { tx } from "@/lib/translations";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`imap:${clientIP}`, 10, 60_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Please wait ${rateCheck.resetInSeconds} seconds.` },
        { status: 429, headers: { "Retry-After": String(rateCheck.resetInSeconds) } }
      );
    }

    const body = await request.json();
    const lang = (body.lang === "tr" ? "tr" : "en") as "en" | "tr";

    // Must be authenticated
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: tx("api.authRequired", lang) },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Fetch medications
    const { data: meds } = await supabase
      .from("user_medications")
      .select("brand_name, generic_name, dosage")
      .eq("user_id", user.id)
      .eq("is_active", true);

    if (!meds || meds.length < 2) {
      return NextResponse.json(
        { error: tx("api.interactionMap.min2Meds", lang) },
        { status: 400 }
      );
    }

    const medications = meds.map((m: { generic_name: string | null; brand_name: string | null }) =>
      m.generic_name || m.brand_name || ""
    ).filter(Boolean);

    const systemPrompt = `You are a drug interaction specialist. Analyze ALL pairwise interactions between the given medications.

Respond in ${tx("api.respondLang", lang)} with this exact JSON:
{
  "nodes": [
    { "id": "medication_name", "label": "Display Name", "dosage": "dosage if known" }
  ],
  "edges": [
    {
      "source": "medication_1",
      "target": "medication_2",
      "severity": "safe" | "caution" | "dangerous",
      "description": "Brief interaction description",
      "mechanism": "Mechanism of interaction"
    }
  ],
  "summary": "Overall safety summary of this medication combination"
}

RULES:
1. Include ALL medications as nodes
2. Check EVERY pair for interactions
3. Include edges even for "safe" pairs (severity: "safe")
4. Be specific about mechanisms
5. If no interaction exists, severity is "safe" with appropriate description

SEVERITY CLASSIFICATION (STRICT — use FDA drug-interaction severity levels):

  "dangerous" = FDA contraindicated OR major interaction OR any life-
    threatening risk. Examples that MUST be flagged dangerous:
      - Warfarin + NSAIDs / SSRIs / aspirin → bleeding
      - Warfarin + isotretinoin / tetracyclines → intracranial hypertension + bleeding
      - MAOIs + SSRIs / SNRIs / tramadol → serotonin syndrome
      - Nitrates + sildenafil / tadalafil → severe hypotension
      - QT-prolonging combos (e.g. amiodarone + fluoroquinolones) → torsades
      - Isotretinoin + tetracyclines → pseudotumor cerebri
      - Statins + strong CYP3A4 inhibitors → rhabdomyolysis
      - Any clinically major bleeding / cardiac / CNS / organ-failure risk

  "caution" = moderate interaction, requires monitoring or dose
    adjustment. Mild CYP450 competition, modest PK shifts, additive
    sedation without life-threatening risk.

  "safe" = minor OR no known clinically significant interaction.

TIE-BREAK RULE: when a pair could plausibly be "caution" OR "dangerous",
ALWAYS choose "dangerous". Over-warning is clinically safer than
under-warning — the patient's physician can downgrade, the app cannot
upgrade after the fact. This is the F-SAFETY-001 default.`;

    const result = await askClaudeJSON(
      `Analyze all pairwise drug interactions between: ${medications.join(", ")}`,
      systemPrompt,
      { userId: user.id }
    );

    let parsed;
    try {
      parsed = typeof result === "string" ? JSON.parse(result) : result;
    } catch {
      return NextResponse.json(
        { error: tx("api.analysisFailed", lang) },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Interaction map API error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
