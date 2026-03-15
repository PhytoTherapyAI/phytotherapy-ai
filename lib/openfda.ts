const OPENFDA_BASE = "https://api.fda.gov/drug";

interface DrugInfo {
  brandName: string;
  genericName: string;
  activeIngredients: string[];
  warnings: string[];
  interactions: string[];
}

export async function searchDrug(drugName: string): Promise<DrugInfo | null> {
  try {
    const url = `${OPENFDA_BASE}/label.json?search=(openfda.brand_name:"${encodeURIComponent(drugName)}"+openfda.generic_name:"${encodeURIComponent(drugName)}")&limit=1`;
    const res = await fetch(url);

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

export async function getActiveIngredient(
  brandName: string
): Promise<string | null> {
  const info = await searchDrug(brandName);
  return info?.genericName || null;
}
