// © 2026 Phytotherapy.ai — All Rights Reserved
import { askGeminiJSON } from "@/lib/gemini";

const OPENFDA_BASE = "https://api.fda.gov/drug";

export interface DrugInfo {
  brandName: string;
  genericName: string;
  activeIngredients: string[];
  warnings: string[];
  interactions: string[];
  source: "openfda" | "gemini_fallback";
}

/**
 * Search OpenFDA for drug info. If not found (common with Turkish/non-US brands),
 * falls back to Gemini for brand→generic name resolution, then retries OpenFDA
 * with the generic name.
 */
export async function searchDrug(drugName: string): Promise<DrugInfo | null> {
  // Step 1: Try OpenFDA directly
  const fdaResult = await searchOpenFDA(drugName);
  if (fdaResult) {
    return { ...fdaResult, source: "openfda" };
  }

  // Step 2: Gemini fallback — resolve brand name to generic name
  const geminiResolved = await resolveWithGemini(drugName);
  if (!geminiResolved) return null;

  // Step 3: Retry OpenFDA with the resolved generic name
  if (geminiResolved.genericName.toLowerCase() !== drugName.toLowerCase()) {
    const fdaRetry = await searchOpenFDA(geminiResolved.genericName);
    if (fdaRetry) {
      return {
        brandName: drugName,
        genericName: fdaRetry.genericName,
        activeIngredients: fdaRetry.activeIngredients,
        warnings: fdaRetry.warnings,
        interactions: fdaRetry.interactions,
        source: "openfda",
      };
    }
  }

  // Step 4: Return Gemini-only result (no FDA data but we know the generic name)
  return {
    brandName: drugName,
    genericName: geminiResolved.genericName,
    activeIngredients: geminiResolved.activeIngredients,
    warnings: [],
    interactions: [],
    source: "gemini_fallback",
  };
}

/**
 * Direct OpenFDA API search
 */
async function searchOpenFDA(drugName: string): Promise<Omit<DrugInfo, "source"> | null> {
  try {
    const encoded = encodeURIComponent(drugName);
    const url = `${OPENFDA_BASE}/label.json?search=(openfda.brand_name:"${encoded}"+openfda.generic_name:"${encoded}"+openfda.substance_name:"${encoded}")&limit=1`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });

    if (!res.ok) return null;

    const data = await res.json();
    const result = data.results?.[0];
    if (!result) return null;

    return {
      brandName: result.openfda?.brand_name?.[0] || drugName,
      genericName: result.openfda?.generic_name?.[0] || "Unknown",
      activeIngredients: result.openfda?.substance_name || [],
      warnings: result.warnings || [],
      interactions: result.drug_interactions || [],
    };
  } catch {
    return null;
  }
}

/**
 * Use Gemini to resolve non-US/Turkish brand names to generic (INN) names.
 * Example: "Glifor" → { genericName: "Metformin", activeIngredients: ["METFORMIN HYDROCHLORIDE"] }
 */
async function resolveWithGemini(
  drugName: string
): Promise<{ genericName: string; activeIngredients: string[] } | null> {
  try {
    const prompt = `What is the generic name (INN) and active ingredient(s) of the medication "${drugName}"?
This could be a Turkish, European, or other non-US brand name.

Respond with ONLY a JSON object, no markdown, no explanation:
{"genericName": "Generic Name", "activeIngredients": ["ACTIVE INGREDIENT 1"]}

If you don't know this medication, respond with: {"genericName": null, "activeIngredients": []}`;

    const systemPrompt = `You are a pharmaceutical database. You know international drug brand names including Turkish brands (e.g., Glifor=Metformin, Coraspin=Aspirin, Euthyrox=Levothyroxine, Arveles=Dexketoprofen, Majezik=Flurbiprofen, Apranax=Naproxen, Lustral=Sertraline, Cipralex=Escitalopram, Concor=Bisoprolol, Beloc=Metoprolol, Glucobay=Acarbose, Lantus=Insulin Glargine, Augmentin=Amoxicillin/Clavulanate, Cipro=Ciprofloxacin, Lansoprol=Lansoprazole, Atoris=Atorvastatin, Glucophage=Metformin, Norvasc=Amlodipine, Xarelto=Rivaroxaban, Plavix=Clopidogrel, Nexium=Esomeprazole, Voltaren=Diclofenac, Dikloron=Diclofenac, Parol=Acetaminophen, Nurofen=Ibuprofen). Respond ONLY with raw JSON, no markdown fences.`;

    const response = await askGeminiJSON(prompt, systemPrompt);

    // With responseMimeType: "application/json", response is already clean JSON
    const parsed = JSON.parse(response);
    if (!parsed.genericName) return null;

    return {
      genericName: String(parsed.genericName),
      activeIngredients: Array.isArray(parsed.activeIngredients)
        ? parsed.activeIngredients.map(String)
        : [],
    };
  } catch (error) {
    console.error("Gemini drug resolution failed:", error);
    return null;
  }
}

export async function getActiveIngredient(
  brandName: string
): Promise<string | null> {
  const info = await searchDrug(brandName);
  return info?.genericName || null;
}
