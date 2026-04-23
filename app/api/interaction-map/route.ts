// © 2026 DoctoPal — All Rights Reserved
//
// F-SAFETY-002 Commit 2: extended from drug-drug only to a full five-way
// safety matrix so the banner that fires on medication insert can flag
// drug-chronic, drug-supplement, drug-allergy, and drug-condition risks
// alongside the original drug-drug checks.
//
// Fetch shape:
//   - user_medications (active)
//   - user_profiles (chronic_conditions ARRAY, supplements ARRAY, and
//     critical flags: is_pregnant, is_breastfeeding, kidney_disease,
//     liver_disease)
//   - user_allergies (allergen + severity)
//
// Guard:
//   - meds.length < 1 → 400 (no drugs, nothing to evaluate)
//   - meds.length === 1 AND zero other items → 400 (nothing to cross-check)
//   - otherwise → Claude analyses the matrix
//
// Output schema (backwards-compat superset):
//   edges[i] now carries an OPTIONAL `category` field:
//     "drug-drug" | "drug-chronic" | "drug-supplement" | "drug-allergy" | "drug-condition"
//   Existing consumers (interaction-checker UI + legacy cache rows)
//   treat a missing category as "drug-drug" and render unchanged.
//
// Upstream severity classification + tie-break rule inherited from
// F-SAFETY-001 — Claude STILL errs toward "dangerous" on any pair that
// could plausibly be caution OR dangerous.
import { NextRequest, NextResponse } from "next/server";
import { askClaudeJSON } from "@/lib/ai-client";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { tx } from "@/lib/translations";

export const maxDuration = 60;

interface ProfileForSafety {
  chronic_conditions?: string[] | null;
  supplements?: string[] | null;
  is_pregnant?: boolean | null;
  is_breastfeeding?: boolean | null;
  kidney_disease?: boolean | null;
  liver_disease?: boolean | null;
}

interface MedRow { brand_name: string | null; generic_name: string | null; dosage: string | null }
interface AllergyRow { allergen: string; severity: string | null }

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

    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: tx("api.authRequired", lang) }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Parallel fetch — five tables / fields in one round trip
    const [medsRes, profileRes, allergiesRes] = await Promise.all([
      supabase
        .from("user_medications")
        .select("brand_name, generic_name, dosage")
        .eq("user_id", user.id)
        .eq("is_active", true),
      supabase
        .from("user_profiles")
        .select("chronic_conditions, supplements, is_pregnant, is_breastfeeding, kidney_disease, liver_disease")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("user_allergies")
        .select("allergen, severity")
        .eq("user_id", user.id),
    ]);

    const meds: MedRow[] = (medsRes.data as MedRow[] | null) ?? [];
    const profile: ProfileForSafety = (profileRes.data as ProfileForSafety | null) ?? {};
    const allergies: AllergyRow[] = (allergiesRes.data as AllergyRow[] | null) ?? [];

    // ── Normalise inputs ─────────────────────────────────────────────
    const medications = meds
      .map((m) => m.generic_name || m.brand_name || "")
      .filter(Boolean);

    // Chronic conditions use `surgery:` / `family:` prefixes for other
    // categories stored in the same column — strip those, only current
    // conditions go into the matrix. Critical boolean flags layer on top.
    const chronicConditions = (profile.chronic_conditions ?? [])
      .filter((c) => typeof c === "string" && !c.startsWith("surgery:") && !c.startsWith("family:"));
    const criticalFlags: string[] = [];
    if (profile.is_pregnant) criticalFlags.push(lang === "tr" ? "Hamilelik" : "Pregnancy");
    if (profile.is_breastfeeding) criticalFlags.push(lang === "tr" ? "Emzirme" : "Breastfeeding");
    if (profile.kidney_disease) criticalFlags.push(lang === "tr" ? "Böbrek yetmezliği" : "Kidney disease");
    if (profile.liver_disease) criticalFlags.push(lang === "tr" ? "Karaciğer yetmezliği" : "Liver disease");

    // Supplements column hosts `meta:` prefixed profile entries (city,
    // insurance, etc.). Only real supplements enter the safety matrix.
    const supplements = (profile.supplements ?? [])
      .filter((s) => typeof s === "string" && !s.startsWith("meta:"));

    const allergenList = allergies
      .map((a) => a.severity ? `${a.allergen} (${a.severity})` : a.allergen)
      .filter(Boolean);

    // ── Guard — need at least one drug + one other thing to cross-check
    const otherItems = chronicConditions.length + supplements.length + allergenList.length + criticalFlags.length;
    if (medications.length === 0 || (medications.length === 1 && otherItems === 0)) {
      return NextResponse.json(
        { error: tx("api.interactionMap.min2Meds", lang) },
        { status: 400 }
      );
    }

    // ── Build Claude prompt ─────────────────────────────────────────
    const systemPrompt = `You are a drug-safety specialist. Analyse FIVE categories of interactions across the patient's regimen and flag every risk.

Respond in ${tx("api.respondLang", lang)} with this exact JSON:
{
  "nodes": [
    { "id": "item_name", "label": "Display Name", "dosage": "dosage if known" }
  ],
  "edges": [
    {
      "source": "source_item",
      "target": "target_item",
      "severity": "safe" | "caution" | "dangerous",
      "category": "drug-drug" | "drug-chronic" | "drug-supplement" | "drug-allergy" | "drug-condition",
      "description": "Brief clinical description",
      "mechanism": "Biochemical / pharmacological mechanism"
    }
  ],
  "summary": "Overall safety summary of this combination"
}

INPUT CATEGORIES
  MEDICATIONS: ${medications.join(", ")}
  CHRONIC CONDITIONS: ${chronicConditions.length ? chronicConditions.join(", ") : "none"}
  CRITICAL FLAGS: ${criticalFlags.length ? criticalFlags.join(", ") : "none"}
  SUPPLEMENTS: ${supplements.length ? supplements.join(", ") : "none"}
  ALLERGIES: ${allergenList.length ? allergenList.join(", ") : "none"}

EDGE CATEGORIES (use exactly these strings in the "category" field)
  "drug-drug"        — medication × medication (pairwise)
  "drug-chronic"     — medication × chronic condition (e.g. NSAID + kidney disease)
  "drug-supplement"  — medication × supplement (e.g. St John's Wort + SSRI)
  "drug-allergy"     — medication × allergen / cross-reactive drug class
  "drug-condition"   — medication × critical flag (pregnancy, breastfeeding, kidney, liver)

NODE ENCODING
  - Every medication, chronic condition, supplement, allergen, and
    critical flag that actually participates in an edge MUST appear as
    a node. Nodes that don't appear in any edge can be omitted.

SEVERITY CLASSIFICATION (STRICT — FDA drug-interaction severity levels)
  "dangerous" = FDA contraindicated OR major interaction OR life-
    threatening risk. The app ALWAYS errs toward dangerous on ambiguous
    pairs. Reference examples per category below; treat these as
    baseline, not exhaustive.
  "caution" = moderate, requires monitoring or dose adjustment.
  "safe" = minor OR no clinically significant interaction.

CANONICAL DANGEROUS EXAMPLES
  drug-drug:
    - Warfarin + NSAIDs / SSRIs / aspirin → bleeding
    - Warfarin + isotretinoin / tetracyclines → intracranial hypertension + bleeding
    - MAOIs + SSRIs / SNRIs / tramadol → serotonin syndrome
    - Nitrates + sildenafil / tadalafil → severe hypotension
    - QT-prolonging combos (amiodarone + fluoroquinolones) → torsades
    - Statins + strong CYP3A4 inhibitors → rhabdomyolysis
  drug-chronic:
    - NSAIDs + kidney disease → AKI, nephrotoxicity
    - ACE inhibitors + kidney disease → hyperkalemia, AKI
    - Metformin + severe kidney disease (eGFR < 30) → lactic acidosis
    - Non-selective beta-blockers + asthma → bronchospasm
    - Warfarin + liver disease → unpredictable INR
    - NSAIDs + hypertension → BP elevation
    - Corticosteroids + diabetes → hyperglycemia
  drug-supplement:
    - St John's Wort + SSRIs → serotonin syndrome
    - St John's Wort + warfarin / hormonal contraceptives → CYP3A4 induction, reduced efficacy
    - Ginkgo / garlic / ginger / ginseng + anticoagulants → bleeding
    - Grapefruit + statins / calcium-channel blockers → raised drug levels
    - High-dose vitamin E + anticoagulants → bleeding
  drug-allergy:
    - Penicillin allergy + amoxicillin / ampicillin / other beta-lactams → cross-reactivity
    - Cephalosporins + penicillin allergy → 5–10% cross-reactivity
    - Sulfa allergy + sulfonamide antibiotics / diuretics → Stevens-Johnson / severe rash
    - NSAID allergy + aspirin → exacerbation
    - Aspirin-sensitive asthma + any NSAID → bronchospasm
  drug-condition:
    - Warfarin / isotretinoin / ACE inhibitors / statins + pregnancy → teratogenic / CONTRAINDICATED
    - NSAIDs + third-trimester pregnancy → premature ductus closure
    - Tetracyclines + pregnancy → tooth discoloration, bone growth impairment
    - Sedatives / benzodiazepines + breastfeeding → infant sedation
    - Sedatives + liver disease → prolonged effect
    - Renally-cleared drugs + kidney disease → accumulation / toxicity

OUTPUT RULES
  1. Include an edge for every relevant pair; skip obviously-safe pairs
     unless they share a category worth acknowledging.
  2. category MUST be one of the five exact strings above.
  3. For drug-condition edges, use the critical-flag phrase as the
     target (e.g. "Pregnancy", "Kidney disease").
  4. For drug-chronic edges, use the condition label as the target.
  5. For drug-allergy edges, use the allergen + severity as the target.
  6. Be specific about mechanism — CYP isoform, pharmacodynamic class,
     receptor, etc.
  7. TIE-BREAK: when a pair could plausibly be "caution" OR "dangerous",
     ALWAYS choose "dangerous". Over-warning is clinically safer.`;

    const result = await askClaudeJSON(
      `Run the safety matrix across the inputs above.`,
      systemPrompt,
      { userId: user.id }
    );

    let parsed;
    try {
      parsed = typeof result === "string" ? JSON.parse(result) : result;
    } catch {
      return NextResponse.json({ error: tx("api.analysisFailed", lang) }, { status: 500 });
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Interaction map API error:", error);
    return NextResponse.json({ error: "An error occurred. Please try again." }, { status: 500 });
  }
}
