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
// Sprint 10 Commit 2: 60-entry pragmatik baseline.
// Sprint 11 Commit 2 (this): +149 entry klinik pratik augmentation
// (OB-GYN, onkoloji temel, kardiyoloji/diyabet genişletilmiş, anestezi/YBÜ,
// üroloji, hematoloji, vitamin, göz/KBB) — toplam 209 entry.
// Sprint 12+ scope'unda 3000+ brand full TİTCK augment edilebilir;
// `buildTurkishBrandContext` slice(0, 40) sabit — token bütçesi 60→209'da
// etkilenmedi, sadece `getTurkishGeneric` post-processing lookup'ı zenginleşti.

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
  // ─────────────────────────────────────────────────────────
  // Sprint 11 Commit 2 — v2 expansion (149 yeni entry)
  // Klinik pratikte sık görülen: OB-GYN, onkoloji temel, kardiyo/diyabet
  // genişletilmiş, anestezi/YBÜ, üroloji, hematoloji, vitamin, göz/KBB.
  // ─────────────────────────────────────────────────────────
  // Kas-iskelet / Romatoloji
  "Voltaren Emulgel": "Diclofenac",
  "Dikloron": "Diclofenac",
  "Naprosyn": "Naproxen",
  "Apranax": "Naproxen",
  "Flexiban": "Cyclobenzaprine",
  "Muscoril": "Thiocolchicoside",
  "Colchicine": "Colchicine",
  "Colchicum Dispert": "Colchicine",
  "Plaquenil": "Hydroxychloroquine",
  "Methotrexate": "Methotrexate",
  // Ağrı / Opioid
  "Tradolan": "Tramadol",
  "Contramal": "Tramadol",
  "Perfalgan": "Paracetamol IV",
  "Dexdor": "Dexmedetomidine",
  "Ultiva": "Remifentanil",
  // Kardiyoloji genişletilmiş
  "Aldactone": "Spironolactone",
  "Lasix": "Furosemide",
  "Furosemid": "Furosemide",
  "Digoxin": "Digoxin",
  "Lanoxin": "Digoxin",
  "Plavix": "Clopidogrel",
  "Efient": "Prasugrel",
  "Brilinta": "Ticagrelor",
  "Xarelto": "Rivaroxaban",
  "Eliquis": "Apixaban",
  "Pradaxa": "Dabigatran",
  "Isordil": "Isosorbide Dinitrate",
  "Monoket": "Isosorbide Mononitrate",
  "Imdur": "Isosorbide Mononitrate",
  "Nitrolingual": "Nitroglycerin",
  "Dobutamine": "Dobutamine",
  "Dopamine": "Dopamine",
  "Adrenalin": "Epinephrine",
  "Noradrenalin": "Norepinephrine",
  // Diyabet genişletilmiş (yeni jenerasyon GLP-1/SGLT2 + insülinler)
  "Jardiance": "Empagliflozin",
  "Forxiga": "Dapagliflozin",
  "Victoza": "Liraglutide",
  "Trulicity": "Dulaglutide",
  "Trajenta": "Linagliptin",
  "Galvus": "Vildagliptin",
  "Actos": "Pioglitazone",
  "NovoRapid": "Insulin Aspart",
  "Novorapid": "Insulin Aspart",
  "Apidra": "Insulin Glulisine",
  "Levemir": "Insulin Detemir",
  "Tresiba": "Insulin Degludec",
  "Toujeo": "Insulin Glargine 300U",
  "Humulin": "Human Insulin",
  "Mixtard": "Biphasic Human Insulin",
  // Psikiyatri / Nöroloji genişletilmiş
  "Risperdal": "Risperidone",
  "Zyprexa": "Olanzapine",
  "Seroquel": "Quetiapine",
  "Abilify": "Aripiprazole",
  "Haldol": "Haloperidol",
  "Largactil": "Chlorpromazine",
  "Valium": "Diazepam",
  "Temesta": "Lorazepam",
  "Dormicum": "Midazolam",
  "Tegretol": "Carbamazepine",
  "Depakin": "Valproic Acid",
  "Lamictal": "Lamotrigine",
  "Keppra": "Levetiracetam",
  "Topamax": "Topiramate",
  "Neurontin": "Gabapentin",
  "Aricept": "Donepezil",
  "Exelon": "Rivastigmine",
  "Ritalin": "Methylphenidate",
  "Concerta": "Methylphenidate ER",
  // Enfeksiyon / Antibiyotik genişletilmiş
  "Tavanic": "Levofloxacin",
  "Avelox": "Moxifloxacin",
  "Vancomycin": "Vancomycin",
  "Tienam": "Imipenem/Cilastatin",
  "Meronem": "Meropenem",
  "Piperacillin": "Piperacillin/Tazobactam",
  "Zosyn": "Piperacillin/Tazobactam",
  "Diflucan": "Fluconazole",
  "Sporanox": "Itraconazole",
  "Cancidas": "Caspofungin",
  "Tamiflu": "Oseltamivir",
  "Valtrex": "Valacyclovir",
  "Zovirax": "Acyclovir",
  "Bactrim": "Trimethoprim/Sulfamethoxazole",
  // OB-GYN
  "Duphaston": "Dydrogesterone",
  "Utrogestan": "Progesterone",
  "Provera": "Medroxyprogesterone",
  "Clomid": "Clomiphene",
  "Puregon": "Follitropin Beta",
  "Gonal-F": "Follitropin Alfa",
  "Ovitrelle": "Choriogonadotropin Alfa",
  "Decapeptyl": "Triptorelin",
  "Lucrin": "Leuprolide",
  "Zoladex": "Goserelin",
  "Femara": "Letrozole",
  "Aromasin": "Exemestane",
  "Nolvadex": "Tamoxifen",
  "Oxytocin": "Oxytocin",
  "Syntocinon": "Oxytocin",
  "Cytotec": "Misoprostol",
  "Methergine": "Methylergonovine",
  "Cyclogest": "Progesterone",
  "Estrofem": "Estradiol",
  "Femoston": "Estradiol/Dydrogesterone",
  "Premarin": "Conjugated Estrogens",
  // Onkoloji (temel)
  "Taxol": "Paclitaxel",
  "Taxotere": "Docetaxel",
  "Herceptin": "Trastuzumab",
  "Avastin": "Bevacizumab",
  "Mabthera": "Rituximab",
  "Gleevec": "Imatinib",
  "Xeloda": "Capecitabine",
  "Gemzar": "Gemcitabine",
  "Cisplatin": "Cisplatin",
  "Carboplatin": "Carboplatin",
  "Oxaliplatin": "Oxaliplatin",
  // Solunum genişletilmiş
  "Spiriva": "Tiotropium",
  "Symbicort": "Budesonide/Formoterol",
  "Seretide": "Fluticasone/Salmeterol",
  "Relvar": "Fluticasone/Vilanterol",
  "Atrovent": "Ipratropium",
  "Pulmicort": "Budesonide",
  "Rhinocort": "Budesonide nasal",
  "Nasonex": "Mometasone",
  // GI genişletilmiş (Zantac mevcut listede zaten var, eklenmedi)
  "Gaviscon": "Alginate/Antacid",
  "Maalox": "Aluminum/Magnesium",
  "Smecta": "Diosmectite",
  "Imodium": "Loperamide",
  "Duphalac": "Lactulose",
  "Normix": "Rifaximin",
  "Flagyl": "Metronidazole",
  "Ornidazol": "Ornidazole",
  // Üroloji / Nefroloji
  "Tamsulosin": "Tamsulosin",
  "Flomax": "Tamsulosin",
  "Avodart": "Dutasteride",
  "Proscar": "Finasteride",
  "Vesicare": "Solifenacin",
  "Detrusitol": "Tolterodine",
  "Cialis": "Tadalafil",
  "Viagra": "Sildenafil",
  "Levitra": "Vardenafil",
  // Hematoloji / Demir
  "Ferrum Hausmann": "Iron Hydroxide",
  "Tardyferon": "Ferrous Sulfate",
  "Venofer": "Iron Sucrose IV",
  "Ferinject": "Ferric Carboxymaltose",
  "Neupogen": "Filgrastim",
  "Aranesp": "Darbepoetin Alfa",
  "Eprex": "Epoetin Alfa",
  // Vitamin / Destek
  "Devit": "Vitamin D3",
  "D-Cure": "Vitamin D3",
  "Vigantol": "Vitamin D3",
  "Osteocare": "Calcium/Vitamin D",
  "Foltab": "Folic Acid",
  "Folik Asit": "Folic Acid",
  "B12 Ankermann": "Cyanocobalamin",
  "Neurobion": "B-Complex",
  "Magnesium": "Magnesium",
  "Magne-B6": "Magnesium/B6",
  "Zinc": "Zinc",
  // Göz / KBB
  "Tobradex": "Tobramycin/Dexamethasone",
  "Vigamox": "Moxifloxacin eye",
  "Combigan": "Brimonidine/Timolol",
  "Xalatan": "Latanoprost",
  "Otrivine": "Xylometazoline",
  "Afrin": "Oxymetazoline",
  "Augmentin BD": "Amoxicillin/Clavulanic acid BD",
  // Anestezi / Yoğun bakım
  "Propofol": "Propofol",
  "Ketalar": "Ketamine",
  "Tracrium": "Atracurium",
  "Norcuron": "Vecuronium",
  "Esmeron": "Rocuronium",
  "Bridion": "Sugammadex",
  "Anexate": "Flumazenil",
  "Narcan": "Naloxone",
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
