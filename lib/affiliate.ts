// © 2026 Doctopal — All Rights Reserved
// ============================================
// Affiliate Supplement Links — Sprint 16
// ============================================
// Transparent affiliate system — never influences recommendations
// Links only appear AFTER recommendation is made
// Disclaimer always visible

export interface AffiliateLink {
  supplement: string
  pharmacy: string
  url: string
  price?: string
  note?: string
}

// Placeholder affiliate links — will be replaced with real partner links
// Currently links to search results, not specific products
const AFFILIATE_LINKS: Record<string, AffiliateLink[]> = {
  "omega-3": [
    { supplement: "Omega-3", pharmacy: "Trendyol", url: "https://www.trendyol.com/sr?q=omega+3+takviye", note: "EPA+DHA eczane kalitesi arayın" },
    { supplement: "Omega-3", pharmacy: "Hepsiburada", url: "https://www.hepsiburada.com/ara?q=omega+3+supplement", note: "Standardize form tercih edin" },
  ],
  "vitamin-d": [
    { supplement: "Vitamin D3", pharmacy: "Trendyol", url: "https://www.trendyol.com/sr?q=d3+vitamini", note: "K2 ile birlikte alın" },
  ],
  "magnesium": [
    { supplement: "Magnesium", pharmacy: "Trendyol", url: "https://www.trendyol.com/sr?q=magnezyum+takviye", note: "Bisglisinat veya sitrat formu" },
  ],
  "valerian": [
    { supplement: "Valerian Root", pharmacy: "Trendyol", url: "https://www.trendyol.com/sr?q=kediotu+takviye", note: "Standardize ekstre tercih edin" },
  ],
  "ashwagandha": [
    { supplement: "Ashwagandha", pharmacy: "Trendyol", url: "https://www.trendyol.com/sr?q=ashwagandha", note: "KSM-66 veya Sensoril patentli form" },
  ],
}

export function getAffiliateLinks(supplementName: string): AffiliateLink[] {
  const key = supplementName.toLowerCase().replace(/\s+/g, "-")
  return AFFILIATE_LINKS[key] || []
}

export function hasAffiliateLinks(supplementName: string): boolean {
  return getAffiliateLinks(supplementName).length > 0
}

// Disclaimer text
export const AFFILIATE_DISCLAIMER = {
  en: "These links are for convenience only. Product suggestions never influence our health recommendations. We may earn a small commission at no extra cost to you.",
  tr: "Bu linkler kolaylık amaçlıdır. Ürün önerileri sağlık tavsiyelerimizi asla etkilemez. Size ekstra maliyet olmadan küçük bir komisyon kazanabiliriz.",
}
