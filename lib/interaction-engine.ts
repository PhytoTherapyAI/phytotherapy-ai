// © 2026 Doctopal — All Rights Reserved
import { searchDrug } from "@/lib/openfda";
import { searchPubMed } from "@/lib/pubmed";
import { askGeminiJSON } from "@/lib/ai-client";
import { INTERACTION_PROMPT } from "@/lib/prompts";
import { checkRedFlags, getEmergencyMessage } from "@/lib/safety-filter";
import { tx } from "@/lib/translations";

// ============================================
// Types
// ============================================

export interface UserMedication {
  brand_name: string | null;
  generic_name: string | null;
  dosage: string | null;
}

export interface UserProfileForInteraction {
  age: number | null;
  gender: string | null;
  is_pregnant: boolean;
  is_breastfeeding: boolean;
  kidney_disease: boolean;
  liver_disease: boolean;
  allergies: string[];
  medications: UserMedication[];
}

export interface HerbRecommendation {
  herb: string;
  safety: "safe" | "caution" | "dangerous";
  reason: string;
  mechanism: string;
  dosage: string | null;
  duration: string | null;
  interactions: string[];
  sources: Array<{
    title: string;
    url: string;
    year: string;
  }>;
}

export interface InteractionResult {
  success: boolean;
  isEmergency?: boolean;
  emergencyMessage?: string;
  medicationsAnalyzed: Array<{
    brandName: string;
    genericName: string;
    verified: boolean;
  }>;
  concern: string;
  recommendations: HerbRecommendation[];
  profileWarnings: string[];
  generalAdvice: string;
  disclaimer: string;
}

// ============================================
// Main Engine
// ============================================

export async function analyzeInteraction(
  medications: string[],
  concern: string,
  profile: UserProfileForInteraction | null,
  lang: string = "en"
): Promise<InteractionResult> {
  // Step 1: Red flag check — BEFORE anything else
  const redFlagCheck = checkRedFlags(concern);
  if (redFlagCheck.isEmergency) {
    return {
      success: true,
      isEmergency: true,
      emergencyMessage: getEmergencyMessage(redFlagCheck.language),
      medicationsAnalyzed: [],
      concern,
      recommendations: [],
      profileWarnings: [],
      generalAdvice: "",
      disclaimer: "",
    };
  }

  // Step 2: Resolve all medications via OpenFDA (with Gemini fallback for Turkish brands)
  const resolvedMeds = await Promise.all(
    medications.map(async (med) => {
      const drugInfo = await searchDrug(med.trim());
      return {
        brandName: drugInfo?.brandName || med.trim(),
        genericName: drugInfo?.genericName || med.trim(),
        activeIngredients: drugInfo?.activeIngredients || [],
        warnings: drugInfo?.warnings || [],
        fdaInteractions: drugInfo?.interactions || [],
        verified: !!drugInfo,
        source: drugInfo?.source || "unknown",
      };
    })
  );

  // Step 3: Also include profile medications if available
  const profileMeds: string[] = [];
  if (profile?.medications) {
    for (const med of profile.medications) {
      const name = med.generic_name || med.brand_name;
      if (name && !medications.some((m) => m.toLowerCase() === name.toLowerCase())) {
        profileMeds.push(name);
      }
    }
  }

  // Resolve profile meds too
  const resolvedProfileMeds = await Promise.all(
    profileMeds.map(async (med) => {
      const drugInfo = await searchDrug(med);
      return {
        brandName: drugInfo?.brandName || med,
        genericName: drugInfo?.genericName || med,
        activeIngredients: drugInfo?.activeIngredients || [],
        warnings: drugInfo?.warnings || [],
        fdaInteractions: drugInfo?.interactions || [],
        verified: !!drugInfo,
        source: drugInfo?.source || "unknown",
      };
    })
  );

  const allMeds = [...resolvedMeds, ...resolvedProfileMeds];

  // Step 4: Build profile warnings
  const profileWarnings = buildProfileWarnings(profile, lang);

  // Step 5: Search PubMed for relevant research
  const allGenericNames = allMeds
    .map((m) => m.genericName)
    .filter((n) => n !== "Unknown");

  const pubmedQuery = buildPubMedQuery(allGenericNames, concern);
  const pubmedArticles = await searchPubMed(pubmedQuery, 8);

  // Step 6: Build comprehensive Gemini prompt
  const geminiPrompt = buildGeminiPrompt(
    allMeds,
    concern,
    profile,
    profileWarnings,
    pubmedArticles.map((a) => ({
      title: a.title,
      abstract: a.abstract,
      url: a.url,
      year: a.year,
    })),
    lang
  );

  // Step 7: Get Gemini analysis (JSON mode — guaranteed valid JSON)
  const geminiResponse = await askGeminiJSON(geminiPrompt, INTERACTION_PROMPT);

  // Step 8: Parse response
  const parsed = parseGeminiResponse(geminiResponse);

  return {
    success: true,
    isEmergency: false,
    medicationsAnalyzed: allMeds.map((m) => ({
      brandName: m.brandName,
      genericName: m.genericName,
      verified: m.verified,
    })),
    concern,
    recommendations: parsed.recommendations,
    profileWarnings,
    generalAdvice: parsed.generalAdvice,
    disclaimer: "⚠️ " + tx("interactionEngine.disclaimer", lang as "en" | "tr"),
  };
}

// ============================================
// Helper Functions
// ============================================

function buildProfileWarnings(profile: UserProfileForInteraction | null, lang: string = "en"): string[] {
  const warnings: string[] = [];
  const l = lang as "en" | "tr";
  if (!profile) {
    warnings.push(tx("interactionEngine.noProfile", l));
    return warnings;
  }

  if (profile.is_pregnant) {
    warnings.push("🤰 " + tx("interactionEngine.pregnant", l));
  }
  if (profile.is_breastfeeding) {
    warnings.push("🤱 " + tx("interactionEngine.breastfeeding", l));
  }
  if (profile.kidney_disease) {
    warnings.push("🫘 " + tx("interactionEngine.kidneyDisease", l));
  }
  if (profile.liver_disease) {
    warnings.push("🫁 " + tx("interactionEngine.liverDisease", l));
  }
  if (profile.age && profile.age >= 65) {
    warnings.push("👴 " + tx("interactionEngine.elderly", l));
  }
  if (profile.age && profile.age < 18) {
    warnings.push("👶 " + tx("interactionEngine.pediatric", l));
  }
  if (profile.allergies && profile.allergies.length > 0) {
    warnings.push(l === "tr"
      ? `⚠️ Bilinen alerjiler: ${profile.allergies.join(", ")}. Çapraz reaktivite kontrol edildi.`
      : `⚠️ Known allergies: ${profile.allergies.join(", ")}. Cross-reactivity checked.`
    );
  }

  return warnings;
}

function buildPubMedQuery(genericNames: string[], concern: string): string {
  const drugPart = genericNames.slice(0, 3).join(" OR ");
  const herbPart = "herbal interaction OR phytotherapy OR herb-drug interaction";
  return `(${drugPart}) AND (${herbPart}) AND (${concern})`;
}

function buildGeminiPrompt(
  medications: Array<{
    brandName: string;
    genericName: string;
    activeIngredients: string[];
    warnings: string[];
    fdaInteractions: string[];
    verified: boolean;
    source: string;
  }>,
  concern: string,
  profile: UserProfileForInteraction | null,
  profileWarnings: string[],
  pubmedArticles: Array<{
    title: string;
    abstract: string;
    url: string;
    year: string;
  }>,
  lang: string = "en"
): string {
  const topLangRule = lang === "tr"
    ? "KRİTİK KURAL: Tüm yanıtları Türkçe ver. Bitki isimleri, açıklamalar, mekanizmalar, etkileşimler, dozaj bilgisi dahil her şey Türkçe olmalı. Latince bitki isimleri parantez içinde kalabilir.\n\n"
    : "Respond in English.\n\n";

  let prompt = topLangRule + `## USER'S MEDICATIONS\n`;
  for (const med of medications) {
    prompt += `- ${med.brandName} (${med.genericName})`;
    if (med.activeIngredients.length > 0) {
      prompt += ` [Active: ${med.activeIngredients.join(", ")}]`;
    }
    if (med.source === "gemini_fallback") {
      prompt += ` [Resolved via AI — not in FDA database]`;
    } else if (!med.verified) {
      prompt += ` [⚠️ Not found in any database — use your knowledge carefully]`;
    }
    prompt += `\n`;
    if (med.fdaInteractions.length > 0) {
      prompt += `  FDA interactions: ${med.fdaInteractions[0].substring(0, 500)}...\n`;
    }
  }

  prompt += `\n## USER'S CONCERN\n${concern}\n`;

  if (profile) {
    prompt += `\n## USER PROFILE\n`;
    if (profile.age) prompt += `- Age: ${profile.age}\n`;
    if (profile.gender) prompt += `- Gender: ${profile.gender}\n`;
    if (profile.is_pregnant) prompt += `- ⚠️ PREGNANT\n`;
    if (profile.is_breastfeeding) prompt += `- ⚠️ BREASTFEEDING\n`;
    if (profile.kidney_disease) prompt += `- ⚠️ KIDNEY DISEASE\n`;
    if (profile.liver_disease) prompt += `- ⚠️ LIVER DISEASE\n`;
    if (profile.allergies.length > 0) {
      prompt += `- Allergies: ${profile.allergies.join(", ")}\n`;
    }
  }

  if (profileWarnings.length > 0) {
    prompt += `\n## SAFETY WARNINGS\n`;
    for (const w of profileWarnings) {
      prompt += `- ${w}\n`;
    }
  }

  if (pubmedArticles.length > 0) {
    prompt += `\n## PUBMED RESEARCH (Use these as sources)\n`;
    for (const article of pubmedArticles) {
      prompt += `### ${article.title} (${article.year})\n`;
      prompt += `URL: ${article.url}\n`;
      prompt += `Abstract: ${article.abstract.substring(0, 400)}\n\n`;
    }
  }

  const langInstruction = lang === "tr"
    ? "IMPORTANT: You MUST respond in TURKISH (Türkçe). All text values in the JSON — reason, mechanism, dosage, duration, interactions, generalAdvice — must be written in Turkish. Only herb names and source titles/URLs can remain in English/Latin."
    : "IMPORTANT: You MUST respond in ENGLISH. All text values in the JSON must be written in English.";

  prompt += `\n## INSTRUCTIONS
Analyze the drug-herb interactions and provide recommendations.
- For EACH herb considered, check against ALL medications listed above
- Provide at least 2 SAFE alternatives and flag any DANGEROUS ones
- Include specific dosage, duration, and mechanism
- Use the PubMed articles provided as sources — include their URLs
- If the user's concern might be a SIDE EFFECT of their medication, say so
- Consider the user's profile (pregnancy, kidney, liver, age, allergies)

${langInstruction}

CRITICAL: Return ONLY a raw JSON object. No markdown, no code fences, no text before or after.
The JSON must match this schema exactly:
{"recommendations":[{"herb":"Herb Name","safety":"safe","reason":"Brief explanation","mechanism":"Pharmacological mechanism","dosage":"Specific dosage if safe, null if dangerous","duration":"Max duration if safe, null if dangerous","interactions":["Interaction with Drug X via CYP3A4"],"sources":[{"title":"Article title","url":"https://pubmed.ncbi.nlm.nih.gov/PMID/","year":"2024"}]}],"generalAdvice":"Overall safety advice"}`;

  return prompt;
}

function parseGeminiResponse(response: string): {
  recommendations: HerbRecommendation[];
  generalAdvice: string;
} {
  const fail = (reason: string, detail: string) => {
    console.error(`[parseGeminiResponse] ${reason}:`, detail);
    return {
      recommendations: [],
      generalAdvice: "Analiz tamamlanamadı. Lütfen tekrar deneyin. / Unable to parse analysis. Please try again.",
    };
  };

  try {
    // With responseMimeType: "application/json", Gemini returns pure JSON.
    // But we still add fallback layers for safety.

    // Layer 1: Strip any accidental markdown fences or surrounding text
    let cleaned = response
      .replace(/^[\s\S]*?(?=\{)/m, "")  // everything before first {
      .replace(/```/g, "")
      .trim();

    if (!cleaned.startsWith("{")) {
      return fail("No JSON object start", response.substring(0, 300));
    }

    // Layer 2: Try direct parse
    let data: Record<string, unknown> | null = null;
    try {
      data = JSON.parse(cleaned);
    } catch (e1) {
      // Layer 3: Find balanced JSON — string-aware brace matching
      let depth = 0;
      let inString = false;
      let escape = false;
      let endIdx = -1;

      for (let i = 0; i < cleaned.length; i++) {
        const ch = cleaned[i];
        if (escape) { escape = false; continue; }
        if (ch === "\\") { escape = true; continue; }
        if (ch === '"') { inString = !inString; continue; }
        if (inString) continue;
        if (ch === "{") depth++;
        else if (ch === "}") {
          depth--;
          if (depth === 0) { endIdx = i; break; }
        }
      }

      if (endIdx > 0) {
        try {
          data = JSON.parse(cleaned.substring(0, endIdx + 1));
        } catch (e2) {
          return fail("Balanced extraction failed", `${e2} | ${cleaned.substring(0, 300)}`);
        }
      } else {
        // Layer 4: Truncated JSON — try auto-closing
        cleaned = cleaned.replace(/,\s*$/, "");
        // Remove last incomplete key-value if it ends mid-string
        cleaned = cleaned.replace(/,\s*"[^"]*"?\s*:?\s*"?[^"]*$/, "");
        const missingBrackets = Math.max(0, (cleaned.match(/\[/g) || []).length - (cleaned.match(/]/g) || []).length);
        const missingBraces = Math.max(0, (cleaned.match(/\{/g) || []).length - (cleaned.match(/\}/g) || []).length);
        cleaned += '"'.repeat(0); // don't add quotes, just close structures
        cleaned += "]".repeat(missingBrackets);
        cleaned += "}".repeat(missingBraces);

        try {
          data = JSON.parse(cleaned);
        } catch (e3) {
          return fail("Auto-close failed", `${e3} | first=${e1} | len=${response.length}`);
        }
      }
    }

    if (!data || typeof data !== "object") {
      return fail("Parsed value is not an object", typeof data);
    }

    // Extract recommendations array
    const recs = Array.isArray(data.recommendations) ? data.recommendations : [];

    const recommendations: HerbRecommendation[] = recs.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (rec: any) => ({
        herb: String(rec.herb || "Unknown"),
        safety: validateSafety(String(rec.safety || "caution")),
        reason: String(rec.reason || ""),
        mechanism: String(rec.mechanism || ""),
        dosage: rec.dosage != null ? String(rec.dosage) : null,
        duration: rec.duration != null ? String(rec.duration) : null,
        interactions: Array.isArray(rec.interactions)
          ? rec.interactions.map(String)
          : [],
        sources: Array.isArray(rec.sources)
          ? rec.sources.map(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (s: any) =>
                typeof s === "string"
                  ? { title: "", url: s, year: "" }
                  : {
                      title: String(s.title || ""),
                      url: String(s.url || s.link || ""),
                      year: String(s.year || s.date || ""),
                    }
            )
          : [],
      })
    );

    // Sort: dangerous first, then caution, then safe
    const order = { dangerous: 0, caution: 1, safe: 2 };
    recommendations.sort((a, b) => order[a.safety] - order[b.safety]);

    return {
      recommendations,
      generalAdvice: String(
        data.generalAdvice || data.general_advice || data.generalNote || ""
      ),
    };
  } catch (error) {
    return fail("Unexpected error", String(error));
  }
}

function validateSafety(safety: string): "safe" | "caution" | "dangerous" {
  if (safety === "safe" || safety === "caution" || safety === "dangerous") {
    return safety;
  }
  return "caution";
}
