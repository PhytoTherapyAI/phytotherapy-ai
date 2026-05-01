// © 2026 DoctoPal — All Rights Reserved
//
// F-SCAN-TR-001 (Sprint 10 Commit 2): Türk piyasasındaki sık karşılaşılan
// ilaç markaları → uluslararası jenerik (INN) eşleşme tablosu.
//
// Kullanım:
//   - `app/api/scan-medication/route.ts` systemPrompt'una `buildTurkishBrandContext()`
//     ile top-40 sample inject. Claude Vision Türk kutu fotoğraflarında brand
//     name'i okuduğunda generic_name field'ına Latince/INN karşılığı yazsın.
//   - `getTurkishGeneric(brandName)` post-processing helper — AI cevabından
//     sonra brand'ı tabloda match edip generic_name'i correct etmek için.
//
// Veri kaynağı: TİTCK ruhsatlı ilaç listesi top OTC + sık reçete edilenler.
// Sprint 11+ scope'unda 3000+ brand full TİTCK augment edilebilir; bu pass
// pragmatik 60 entry — token maliyeti ~500 (input prompt'a +%5).

export const TR_BRAND_TO_GENERIC: Record<string, string> = {
  // Analjezik / Antipiretik
  "Parol": "Paracetamol",
  "Minoset": "Paracetamol",
  "Tamol": "Paracetamol",
  "Gripin": "Aspirin + Caffeine",
  "Nuprin": "Ibuprofen",
  "Brufen": "Ibuprofen",
  "Nurofen": "Ibuprofen",
  "Majezik": "Flurbiprofen",
  "Voltaren": "Diclofenac",
  "Arveles": "Dexketoprofen",
  // Antibiyotik
  "Augmentin": "Amoxicillin/Clavulanic acid",
  "Klamoks": "Amoxicillin/Clavulanic acid",
  "Amoksiklav": "Amoxicillin/Clavulanic acid",
  "Klarit": "Clarithromycin",
  "Klacid": "Clarithromycin",
  "Zinnat": "Cefuroxime",
  "Cefaks": "Cephalexin",
  "Ciflogyl": "Ciprofloxacin",
  "Cipro": "Ciprofloxacin",
  "Doksiciklin": "Doxycycline",
  // Kardiyovasküler
  "Concor": "Bisoprolol",
  "Coraspin": "Acetylsalicylic acid (low-dose)",
  "Egilok": "Metoprolol",
  "Beloc": "Metoprolol",
  "Norvasc": "Amlodipine",
  "Amlodipin": "Amlodipine",
  "Diovan": "Valsartan",
  "Cozaar": "Losartan",
  "Micardis": "Telmisartan",
  "Tritace": "Ramipril",
  // Diyabet
  "Glifor": "Metformin",
  "Glucophage": "Metformin",
  "Diaformin": "Metformin",
  "Januvia": "Sitagliptin",
  "Ozempic": "Semaglutide",
  "Humalog": "Insulin Lispro",
  "Lantus": "Insulin Glargine",
  // Lipid
  "Crestor": "Rosuvastatin",
  "Lipitor": "Atorvastatin",
  "Zocor": "Simvastatin",
  "Tricor": "Fenofibrate",
  // GI / Mide
  "Nexium": "Esomeprazole",
  "Losec": "Omeprazole",
  "Controloc": "Pantoprazole",
  "Lansor": "Lansoprazole",
  "Motilium": "Domperidone",
  "Zantac": "Ranitidine",
  // Tiroid
  "Levotiron": "Levothyroxine",
  "Euthyrox": "Levothyroxine",
  // Dermatoloji / Vitamin
  "Zoretanin": "Isotretinoin",
  "Roaccutane": "Isotretinoin",
  "Aknenormin": "Isotretinoin",
  "Depo-Medrol": "Methylprednisolone",
  // Solunum / Alerji
  "Aerius": "Desloratadine",
  "Claritine": "Loratadine",
  "Zyrtec": "Cetirizine",
  "Flixotide": "Fluticasone",
  "Ventolin": "Salbutamol",
  "Singulair": "Montelukast",
  // Nöroloji / Psikiyatri
  "Xanax": "Alprazolam",
  "Rivotril": "Clonazepam",
  "Prozac": "Fluoxetine",
  "Lustral": "Sertraline",
  "Cipralex": "Escitalopram",
  "Lyrica": "Pregabalin",
  // Antikoagülan
  "Warfarin": "Warfarin",
  "Coumadin": "Warfarin",
  "Fragmin": "Dalteparin",
  "Clexane": "Enoxaparin",
}

/**
 * Post-processing helper: Türk marka adından INN (jenerik) karşılığını döner.
 * Case-insensitive fallback ikinci pass — caller AI cevabından gelen brand'ı
 * normalize etmeden direkt geçirebilir.
 *
 * @param brandName - AI'dan dönen marka adı (örn. "Parol", "PAROL", "parol")
 * @returns INN eşleşme varsa string, yoksa undefined (caller fallback yapar)
 */
export function getTurkishGeneric(brandName: string): string | undefined {
  const normalized = brandName.trim()
  const direct = TR_BRAND_TO_GENERIC[normalized]
  if (direct) return direct

  const ciKey = Object.keys(TR_BRAND_TO_GENERIC).find(
    (k) => k.toLowerCase() === normalized.toLowerCase(),
  )
  return ciKey ? TR_BRAND_TO_GENERIC[ciKey] : undefined
}

/**
 * SystemPrompt context builder: top-40 brand sample'ını "Brand (Generic)"
 * formatında stringify eder. Claude Vision OCR'ında Türk markalarını
 * tanıması için anchor sample.
 *
 * Token bütçesi: ~500 token (40 × ~12 token avg). Claude Haiku-4.5 input
 * ≈ $0.25/M token → +$0.000125/scan. Sıfır kaygı.
 */
export function buildTurkishBrandContext(): string {
  const samples = Object.entries(TR_BRAND_TO_GENERIC)
    .slice(0, 40)
    .map(([brand, generic]) => `${brand} (${generic})`)
    .join(", ")
  return `Common Turkish brand names include: ${samples}. When you see these brands, use the generic name in parentheses as the generic_name field.`
}
