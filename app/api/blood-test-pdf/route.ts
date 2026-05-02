// © 2026 DoctoPal — All Rights Reserved
import { NextRequest, NextResponse } from "next/server";
import { askStreamJSONMultimodal, askStreamJSON } from "@/lib/ai-client";
import { BLOOD_TEST_PROMPT } from "@/lib/prompts";
import { createServerClient } from "@/lib/supabase";
import {
  BLOOD_TEST_MARKERS,
  analyzeValue,
  type BloodTestResult,
} from "@/lib/blood-reference";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { tx } from "@/lib/translations";

export const maxDuration = 60;

const EXTRACTION_PROMPT = `You are a medical lab report parser. Extract ALL blood test values from this document.

Return a JSON object with this exact structure:
{
  "values": {
    "<marker_id>": <numeric_value>,
    ...
  },
  "gender": "male" | "female" | null,
  "unit_warnings": [
    { "marker": "<name>", "found_unit": "<unit>", "expected_unit": "<unit>", "converted_value": <number> }
  ]
}

IMPORTANT MARKER IDs (use these exact keys):
- glucose, hba1c, insulin, total_cholesterol, ldl, hdl, triglycerides
- hemoglobin, hematocrit, rbc, wbc, platelets, mcv, mch, mchc
- iron, ferritin, tibc, transferrin_sat
- vitamin_d, vitamin_b12, folate
- tsh, free_t3, free_t4
- alt, ast, alp, ggt, bilirubin_total, bilirubin_direct, albumin
- creatinine, bun, uric_acid, egfr, sodium, potassium, calcium, magnesium, phosphorus
- crp, esr, fibrinogen
- psa, testosterone, estradiol, cortisol

RULES:
1. Convert ALL values to standard units used in medical labs
2. If a value uses a different unit than expected, add it to unit_warnings with the converted value
3. Only include markers that are actually present in the document
4. Return numeric values only (no strings, no units in the value)
5. If gender is detectable from the report, include it
6. Parse both Turkish and English lab reports

EXAMPLES:

Example 1 — e-Nabız hormonal panel (multi-line referans notu, boş Referans Değeri sütunu):
Input table rows:
  14.11.2025 09:23  [timestamp group header — skip]
  ✅  Beta HCG  0  IU/L  0 – 5
  ✅  LH  3.3  IU/L  [empty]
  2.1 – 10.9 IU/L Foliküler faz 19.2 – 103 IU/L Midsiklus pik...  [multi-line ref note — skip]
  ✅  TSH  1.58  mU/L  0.35 – 5.30
  14.11.2025 09:24  [timestamp group header — skip]
  ✅  Estradiol (E2)  22  ng/L  [empty]
  23 – 115 ng/L Foliküler faz...  [multi-line ref note — skip]
  ✅  FSH  4.1  IU/L  [empty]
  3.9 – 8.8 mIU/mL Foliküler faz...  [multi-line ref note — skip]
  ✅  Prolaktin  15.5  ug/L  [empty]
  ✅  Serbest Testosteron  1.25  ng/mL  0 – 2.85
  ✅  Total Testosteron  64.06  ng/dL  10 – 75

Correct output:
{
  "values": {
    "beta_hcg": 0,
    "lh": 3.3,
    "tsh": 1.58,
    "estradiol": 22,
    "fsh": 4.1,
    "prolactin": 15.5,
    "free_testosterone": 1.25,
    "total_testosterone": 64.06
  },
  "gender": "female",
  "unit_warnings": []
}
RULES applied: timestamp rows skipped; ✅ icon ignored; multi-line ref notes (faz açıklamaları) skipped; empty Referans Değeri → extract value only, no warning.

Example 2 — Klasik biyokimya paneli (TR virgül ondalık, panel başlığı, mg/dL):
Input table rows:
  Tam Kan Sayımı  [panel header — skip]
  Glukoz  95,4  mg/dL  70 – 100
  Kolesterol Total  187  mg/dL  < 200
  LDL Kolesterol  118  mg/dL  < 130
  HDL Kolesterol  52  mg/dL  > 40
  Trigliserid  143  mg/dL  < 150
  Kreatinin  0,82  mg/dL  0.6 – 1.1
  ALT (SGPT)  23  U/L  < 40
  AST (SGOT)  19  U/L  < 40

Correct output:
{
  "values": {
    "glucose": 95.4,
    "total_cholesterol": 187,
    "ldl": 118,
    "hdl": 52,
    "triglycerides": 143,
    "creatinine": 0.82,
    "alt": 23,
    "ast": 19
  },
  "gender": null,
  "unit_warnings": []
}
RULES applied: "Tam Kan Sayımı" panel header skipped; TR comma decimal (95,4 → 95.4, 0,82 → 0.82); "< 200" referans değeri → not a result value, ignored.

Example 3 — Unit conversion (mmol/L glucose, µmol/L creatinine):
Input table rows:
  Glukoz  5,3  mmol/L  3.9 – 6.1
  Kreatinin  72  µmol/L  53 – 97
  Üre  6.2  mmol/L  2.5 – 7.5
  Hemoglobin  13,8  g/dL  12 – 16

Correct output:
{
  "values": {
    "glucose": 95.5,
    "creatinine": 0.81,
    "urea_bun": 17.4,
    "hemoglobin": 13.8
  },
  "gender": null,
  "unit_warnings": [
    "glucose: converted from mmol/L (5.3) to mg/dL (95.5)",
    "creatinine: converted from µmol/L (72) to mg/dL (0.81)",
    "urea_bun: converted from mmol/L (6.2) to mg/dL (17.4)"
  ]
}
RULES applied: mmol/L glucose × 18.016; µmol/L creatinine ÷ 88.4; mmol/L urea × 2.8; unit_warnings produced for each conversion; g/dL hemoglobin no conversion needed.`;

export async function POST(req: NextRequest) {
  // Rate limit
  const ip = getClientIP(req);
  const rl = checkRateLimit(`blood-pdf:${ip}`, 5, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const lang = (formData.get("lang") as string) || "en";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a PDF or image." },
        { status: 400 }
      );
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    // Convert to base64
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    // Extract userId upfront for consent gate
    let upfrontUserId: string | undefined;
    const upfrontAuth = req.headers.get("authorization");
    if (upfrontAuth?.startsWith("Bearer ")) {
      try {
        const token = upfrontAuth.replace("Bearer ", "");
        const supabase = createServerClient();
        const { data: { user: authUser } } = await supabase.auth.getUser(token);
        upfrontUserId = authUser?.id || undefined;
      } catch { /* anonymous OK */ }
    }

    // Step 1: Extract values from PDF/image using Claude Vision
    // For large PDFs (e-Nabız etc), limit to first pages to avoid timeout
    let extractionResult: string;
    try {
      // Use streaming JSON to avoid Vercel timeout
      extractionResult = await askStreamJSONMultimodal(
        EXTRACTION_PROMPT + "\n\nIMPORTANT: Focus on extracting numeric lab values. Ignore headers, footers, patient info. If the document has multiple pages, extract from ALL pages.",
        "You are a precise medical document parser. Extract lab values from Turkish/English lab reports accurately. Return valid JSON only.",
        [{ mimeType: file.type, base64 }],
        { premium: true, userId: upfrontUserId }
      );
    } catch (aiError) {
      console.error("PDF AI extraction failed:", aiError);
      return NextResponse.json(
        { error: lang === "tr"
          ? "PDF analiz edilemedi. Dosya çok büyük veya okunamıyor olabilir. Lütfen daha küçük bir PDF deneyin veya manuel giriş yapın."
          : "Could not analyze PDF. File may be too large or unreadable. Please try a smaller PDF or manual entry." },
        { status: 422 }
      );
    }

    let extracted: {
      values: Record<string, number>;
      gender?: string | null;
      unit_warnings?: Array<{ marker: string; found_unit: string; expected_unit: string; converted_value: number }>;
    };

    try {
      extracted = JSON.parse(extractionResult);
    } catch {
      return NextResponse.json(
        { error: "Could not parse blood test values from the document. Please try manual entry." },
        { status: 422 }
      );
    }

    if (!extracted.values || Object.keys(extracted.values).length === 0) {
      return NextResponse.json(
        { error: "No blood test values found in the document." },
        { status: 422 }
      );
    }

    // Step 2: Analyze extracted values (same as blood-analysis endpoint)
    const gender = (extracted.gender as "male" | "female" | null) || null;
    const values = extracted.values;

    // Apply unit conversions if any
    if (extracted.unit_warnings) {
      for (const warning of extracted.unit_warnings) {
        const markerId = Object.keys(values).find(
          (k) => k.toLowerCase() === warning.marker.toLowerCase()
        );
        if (markerId && warning.converted_value) {
          values[markerId] = warning.converted_value;
        }
      }
    }

    // Analyze values
    const results: Record<string, BloodTestResult[]> = {};
    let totalMarkers = 0;
    let abnormalCount = 0;
    let optimalCount = 0;

    for (const [markerId, value] of Object.entries(values)) {
      const marker = BLOOD_TEST_MARKERS.find((m) => m.id === markerId);
      if (!marker) continue;

      const analysisResult = analyzeValue(marker, value, gender);
      const category = marker.category;

      if (!results[category]) results[category] = [];
      results[category].push(analysisResult);
      totalMarkers++;

      if (analysisResult.status === "optimal") optimalCount++;
      else abnormalCount++;
    }

    if (totalMarkers === 0) {
      return NextResponse.json(
        { error: "Could not match any extracted values to known markers." },
        { status: 422 }
      );
    }

    // Step 3: Get AI analysis
    const userLang = tx("api.respondLang", lang === "tr" ? "tr" : "en");

    // Sprint 22 Commit 1 — Profil inject (manuel form ile parite, /api/blood-analysis L114-145 mirror).
    // Sprint 23 Commit 1 — D vector: allergies + chronic_conditions ek inject (manuel form parite).
    let profileContext = "";
    let hasMedications = false;
    if (upfrontUserId) {
      try {
        const supabase = createServerClient();
        const [profileRes, medsRes, allergiesRes] = await Promise.all([
          supabase.from("user_profiles").select("*").eq("id", upfrontUserId).single(),
          supabase.from("user_medications").select("brand_name, generic_name, dosage").eq("user_id", upfrontUserId).eq("is_active", true),
          supabase.from("user_allergies").select("allergen, severity").eq("user_id", upfrontUserId),
        ]);
        const profile = profileRes.data;
        const meds = medsRes.data;
        const allergies = allergiesRes.data;
        hasMedications = !!(meds && meds.length > 0);
        if (profile) {
          profileContext = "\n\nUSER PROFILE:";
          if (profile.age) profileContext += `\n- Age: ${profile.age}`;
          if (profile.gender) profileContext += `\n- Gender: ${profile.gender}`;
          if (profile.is_pregnant) profileContext += "\n- ⚠️ PREGNANT";
          if (profile.is_breastfeeding) profileContext += "\n- ⚠️ BREASTFEEDING";
          if (profile.kidney_disease) profileContext += "\n- ⚠️ KIDNEY DISEASE";
          if (profile.liver_disease) profileContext += "\n- ⚠️ LIVER DISEASE";
          // Sprint 24 Commit 2 — Postmenopausal flag (schema-light: chronic_conditions "menopause" prefix)
          const pdfConditions = Array.isArray(profile.chronic_conditions) ? (profile.chronic_conditions as string[]) : [];
          const isPdfPostmenopausal = pdfConditions.some((c) => c.toLowerCase() === "menopause");
          if (isPdfPostmenopausal) profileContext += "\n- ⚠️ POSTMENOPAUSAL — avoid phytoestrogen supplements (soy/red clover/dong quai) without cancer-history clearance";
          if (hasMedications && meds) {
            profileContext += `\n- Medications: ${meds.map((m: { generic_name: string | null; brand_name: string | null }) => m.generic_name || m.brand_name).filter(Boolean).join(", ")}`;
          }
          // Sprint 23 — Allergies + chronic conditions (manuel form parite, "menopause" critical flag'e taşındı)
          if (allergies && allergies.length > 0) {
            profileContext += `\n- Allergies: ${(allergies as { allergen: string; severity: string }[]).map((a) => `${a.allergen} (${a.severity})`).join(", ")}`;
          }
          if (pdfConditions.length > 0) {
            const chronicOnly = pdfConditions.filter(
              (c) => !c.startsWith("surgery:") && !c.startsWith("family:") && c.toLowerCase() !== "menopause",
            );
            if (chronicOnly.length > 0) {
              profileContext += `\n- Chronic conditions: ${chronicOnly.join(", ")}`;
            }
          }
        }
      } catch {
        // Anonymous OK — analiz profil context'siz devam eder
      }
    }

    const analysisPrompt = `Analyze these blood test results. Respond in ${userLang}.

Values: ${JSON.stringify(values)}
Gender: ${gender || "unknown"}

Total markers: ${totalMarkers}, Abnormal: ${abnormalCount}, Optimal: ${optimalCount}${profileContext}`;

    // Use streaming JSON to avoid Vercel timeout
    const aiResult = await askStreamJSON(analysisPrompt, BLOOD_TEST_PROMPT, { premium: true, userId: upfrontUserId });

    let analysis;
    try {
      analysis = JSON.parse(aiResult);
    } catch {
      analysis = {
        summary: tx("api.bloodPdf.analysisComplete", lang === "tr" ? "tr" : "en"),
        abnormalFindings: [],
        supplementRecommendations: [],
        lifestyleAdvice: [],
        doctorDiscussion: [],
        disclaimer: tx("api.bloodPdf.disclaimer", lang === "tr" ? "tr" : "en"),
      };
    }

    // Save to Supabase if authenticated
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const supabase = createServerClient();
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user) {
          // Sprint 18 — radiology_reports paterni: analysis_json + summary + overall_urgency.
          // analysis_result + pdf_url DEPRECATED (Sprint 19+'da DROP). source kolonu yok (silent drop noise temizliği).
          await supabase.from("blood_tests").insert({
            user_id: user.id,
            test_data: values,
            analysis_json: analysis,
            summary: (analysis as { summary?: string })?.summary ?? "",
            overall_urgency: (analysis as { overallUrgency?: string })?.overallUrgency ?? "routine",
            analysis_result: analysis, // backward compat — eski reader path'ler için
          });
        }
      } catch {
        // silently fail — saving is optional
      }
    }

    return NextResponse.json({
      success: true,
      results,
      analysis,
      totalMarkers,
      abnormalCount,
      optimalCount,
      unitWarnings: extracted.unit_warnings || [],
      extractedFrom: "pdf",
    });
  } catch (error) {
    console.error("Blood test PDF error:", error);
    return NextResponse.json(
      { error: "Failed to process blood test document" },
      { status: 500 }
    );
  }
}
