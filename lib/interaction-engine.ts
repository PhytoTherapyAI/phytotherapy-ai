import { searchDrug } from "@/lib/openfda";
import { searchPubMed } from "@/lib/pubmed";
import { askGemini } from "@/lib/gemini";
import { INTERACTION_PROMPT } from "@/lib/prompts";
import { checkRedFlags, getEmergencyMessage } from "@/lib/safety-filter";

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
  profile: UserProfileForInteraction | null
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
  const profileWarnings = buildProfileWarnings(profile);

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
    }))
  );

  // Step 7: Get Gemini analysis
  const geminiResponse = await askGemini(geminiPrompt, INTERACTION_PROMPT);

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
    disclaimer:
      "⚠️ This information is for educational purposes only and does not replace professional medical advice. Always consult your healthcare provider before using any herbal supplements, especially alongside prescription medications.",
  };
}

// ============================================
// Helper Functions
// ============================================

function buildProfileWarnings(profile: UserProfileForInteraction | null): string[] {
  const warnings: string[] = [];
  if (!profile) {
    warnings.push(
      "Your health profile is not available. Recommendations are limited — complete your profile for personalized safety checks."
    );
    return warnings;
  }

  if (profile.is_pregnant) {
    warnings.push(
      "🤰 You are pregnant. Many herbs are contraindicated during pregnancy. Extra caution applied."
    );
  }
  if (profile.is_breastfeeding) {
    warnings.push(
      "🤱 You are breastfeeding. Herbs can pass into breast milk. Extra caution applied."
    );
  }
  if (profile.kidney_disease) {
    warnings.push(
      "🫘 Kidney disease detected. Some herbs are nephrotoxic or alter drug clearance. Doses may need adjustment."
    );
  }
  if (profile.liver_disease) {
    warnings.push(
      "🫁 Liver disease detected. Many herbs are hepatotoxic or affect drug metabolism. Extra caution applied."
    );
  }
  if (profile.age && profile.age >= 65) {
    warnings.push(
      "👴 Age 65+. Drug metabolism slows with age — lower doses may be appropriate."
    );
  }
  if (profile.age && profile.age < 18) {
    warnings.push(
      "👶 Under 18. Pediatric dosing is different — consult a pediatrician before any herbal use."
    );
  }
  if (profile.allergies && profile.allergies.length > 0) {
    warnings.push(
      `⚠️ Known allergies: ${profile.allergies.join(", ")}. Cross-reactivity checked.`
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
  }>
): string {
  let prompt = `## USER'S MEDICATIONS\n`;
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

  prompt += `\n## INSTRUCTIONS
Analyze the drug-herb interactions and provide recommendations.
- For EACH herb considered, check against ALL medications listed above
- Provide at least 2 SAFE alternatives and flag any DANGEROUS ones
- Include specific dosage, duration, and mechanism
- Use the PubMed articles provided as sources — include their URLs
- If the user's concern might be a SIDE EFFECT of their medication, say so
- Consider the user's profile (pregnancy, kidney, liver, age, allergies)

CRITICAL: Return ONLY a raw JSON object. No markdown, no code fences, no text before or after.
The JSON must match this schema exactly:
{"recommendations":[{"herb":"Herb Name","safety":"safe","reason":"Brief explanation","mechanism":"Pharmacological mechanism","dosage":"Specific dosage if safe, null if dangerous","duration":"Max duration if safe, null if dangerous","interactions":["Interaction with Drug X via CYP3A4"],"sources":[{"title":"Article title","url":"https://pubmed.ncbi.nlm.nih.gov/PMID/","year":"2024"}]}],"generalAdvice":"Overall safety advice"}`;

  return prompt;
}

function parseGeminiResponse(response: string): {
  recommendations: HerbRecommendation[];
  generalAdvice: string;
} {
  try {
    // Step 1: Strip markdown code fences if present
    let cleaned = response
      .replace(/^```(?:json)?\s*\n?/gim, "")
      .replace(/\n?```\s*$/gim, "")
      .trim();

    // Step 2: Try parsing the whole thing as JSON first
    let parsed: Record<string, unknown> | null = null;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // Step 3: Extract JSON object with balanced brace matching
      const startIdx = cleaned.indexOf("{");
      if (startIdx === -1) {
        console.error("No JSON object found in response:", cleaned.substring(0, 200));
        return { recommendations: [], generalAdvice: "Unable to parse analysis. Please try again." };
      }

      let depth = 0;
      let endIdx = -1;
      for (let i = startIdx; i < cleaned.length; i++) {
        if (cleaned[i] === "{") depth++;
        else if (cleaned[i] === "}") {
          depth--;
          if (depth === 0) {
            endIdx = i;
            break;
          }
        }
      }

      if (endIdx === -1) {
        // Try to fix truncated JSON by closing open structures
        cleaned = cleaned.substring(startIdx);
        cleaned = cleaned.replace(/,\s*$/, ""); // remove trailing comma
        const openBraces = (cleaned.match(/{/g) || []).length;
        const closeBraces = (cleaned.match(/}/g) || []).length;
        const openBrackets = (cleaned.match(/\[/g) || []).length;
        const closeBrackets = (cleaned.match(/]/g) || []).length;
        cleaned += "]".repeat(Math.max(0, openBrackets - closeBrackets));
        cleaned += "}".repeat(Math.max(0, openBraces - closeBraces));

        try {
          parsed = JSON.parse(cleaned);
        } catch {
          console.error("Failed to fix truncated JSON:", cleaned.substring(0, 300));
          return { recommendations: [], generalAdvice: "Unable to parse analysis. Please try again." };
        }
      } else {
        try {
          parsed = JSON.parse(cleaned.substring(startIdx, endIdx + 1));
        } catch {
          console.error("Extracted JSON is invalid:", cleaned.substring(startIdx, Math.min(startIdx + 300, endIdx + 1)));
          return { recommendations: [], generalAdvice: "Unable to parse analysis. Please try again." };
        }
      }
    }

    if (!parsed) {
      return { recommendations: [], generalAdvice: "Unable to parse analysis. Please try again." };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = parsed as any;

    const recommendations: HerbRecommendation[] = (data.recommendations || []).map(
      (rec: Record<string, unknown>) => ({
        herb: String(rec.herb || "Unknown"),
        safety: validateSafety(String(rec.safety || "caution")),
        reason: String(rec.reason || ""),
        mechanism: String(rec.mechanism || ""),
        dosage: rec.dosage ? String(rec.dosage) : null,
        duration: rec.duration ? String(rec.duration) : null,
        interactions: Array.isArray(rec.interactions)
          ? rec.interactions.map(String)
          : [],
        sources: Array.isArray(rec.sources)
          ? rec.sources.map((s: Record<string, unknown>) => ({
              title: String(s.title || ""),
              url: String(s.url || ""),
              year: String(s.year || ""),
            }))
          : [],
      })
    );

    // Sort: dangerous first, then caution, then safe
    const order = { dangerous: 0, caution: 1, safe: 2 };
    recommendations.sort((a, b) => order[a.safety] - order[b.safety]);

    return {
      recommendations,
      generalAdvice: String(data.generalAdvice || data.general_advice || ""),
    };
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    return {
      recommendations: [],
      generalAdvice: "Analysis completed but results could not be formatted. Please try again.",
    };
  }
}

function validateSafety(safety: string): "safe" | "caution" | "dangerous" {
  if (safety === "safe" || safety === "caution" || safety === "dangerous") {
    return safety;
  }
  return "caution";
}
