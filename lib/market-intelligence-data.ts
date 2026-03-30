// © 2026 Phytotherapy.ai — All Rights Reserved
// ============================================
// Market Intelligence Hub — Data Layer
// ============================================
// Comprehensive mock data for the phytotherapy
// investor dashboard. All figures are realistic
// estimates based on public market research.

// ─── Interfaces ─────────────────────────────

export interface PhytoCompany {
  symbol: string;
  name: string;
  sector: string;
  currentPrice: number;
  dailyChangePercent: number;
  marketCapBillions: number;
  week52High: number;
  week52Low: number;
  ipoStatus: "Public" | "Private" | "Pre-IPO";
  exchange: string;
  priceHistory: { date: string; close: number }[];
}

export interface BotanicalTrend {
  name: string;
  pubmedCountCurrent: number;
  pubmedCountPrevious: number;
  growthPercent: number;
  marketSizeBillions: number;
  trendDirection: "up" | "down" | "stable";
  monthlyData: { month: string; publications: number; marketSize: number }[];
}

export interface PatentFiling {
  id: string;
  title: string;
  titleTr: string;
  company: string;
  filingDate: string;
  status: "Filed" | "Granted" | "Under Review";
  jurisdiction: "USPTO" | "EPO" | "WIPO";
  botanical: string;
}

export interface RegulatoryUpdate {
  id: string;
  title: string;
  titleTr: string;
  agency: "FDA" | "EMA" | "TGA" | "EFSA";
  type: string;
  date: string;
  status: "Approved" | "Pending" | "Under Review";
  impactLevel: "high" | "medium" | "low";
  summary: string;
  summaryTr: string;
}

export interface SectorEvent {
  date: string;
  type: "IPO" | "M&A" | "Funding" | "Partnership";
  company: string;
  detail: string;
  detailTr: string;
  valueBillions?: number;
}

export interface MarketKPI {
  label: string;
  labelTr: string;
  value: string;
  change: string;
  changeDirection: "up" | "down" | "stable";
}

export interface CorrelationPoint {
  month: string;
  searchVolume: number;
  stockPrice: number;
}

export interface CorrelationData {
  company: string;
  symbol: string;
  data: CorrelationPoint[];
}

// ─── Helper: generate 30-point price history ─

function generatePriceHistory(
  basePrice: number,
  volatility: number,
  trend: number
): { date: string; close: number }[] {
  const points: { date: string; close: number }[] = [];
  let price = basePrice * (1 - trend * 0.15);
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const change = (Math.random() - 0.45) * volatility + trend * 0.005;
    price = Math.max(price * (1 + change), basePrice * 0.4);
    points.push({
      date: d.toISOString().slice(0, 10),
      close: Math.round(price * 100) / 100,
    });
  }
  // Ensure the last point matches the target current price
  points[points.length - 1].close = basePrice;
  return points;
}

// ─── Companies ──────────────────────────────

export const PHYTO_COMPANIES: PhytoCompany[] = [
  {
    symbol: "HLF",
    name: "Herbalife Nutrition",
    sector: "Nutritional Supplements",
    currentPrice: 11.42,
    dailyChangePercent: -1.23,
    marketCapBillions: 1.8,
    week52High: 16.85,
    week52Low: 8.91,
    ipoStatus: "Public",
    exchange: "NYSE",
    priceHistory: generatePriceHistory(11.42, 0.03, 0.2),
  },
  {
    symbol: "USNA",
    name: "USANA Health Sciences",
    sector: "Health & Wellness",
    currentPrice: 48.76,
    dailyChangePercent: 0.87,
    marketCapBillions: 1.2,
    week52High: 72.14,
    week52Low: 38.05,
    ipoStatus: "Public",
    exchange: "NYSE",
    priceHistory: generatePriceHistory(48.76, 0.025, -0.1),
  },
  {
    symbol: "NATR",
    name: "Nature's Sunshine Products",
    sector: "Herbal Supplements",
    currentPrice: 18.34,
    dailyChangePercent: 2.15,
    marketCapBillions: 0.38,
    week52High: 22.50,
    week52Low: 12.10,
    ipoStatus: "Public",
    exchange: "NASDAQ",
    priceHistory: generatePriceHistory(18.34, 0.035, 0.3),
  },
  {
    symbol: "BKL",
    name: "Blackmores Limited",
    sector: "Natural Health",
    currentPrice: 68.20,
    dailyChangePercent: -0.45,
    marketCapBillions: 1.5,
    week52High: 82.30,
    week52Low: 54.60,
    ipoStatus: "Public",
    exchange: "ASX",
    priceHistory: generatePriceHistory(68.20, 0.02, 0.15),
  },
  {
    symbol: "AMWY",
    name: "Amway (Alticor Inc.)",
    sector: "Nutrilite & Botanicals",
    currentPrice: 0,
    dailyChangePercent: 0,
    marketCapBillions: 8.5,
    week52High: 0,
    week52Low: 0,
    ipoStatus: "Private",
    exchange: "N/A",
    priceHistory: [],
  },
  {
    symbol: "GNC",
    name: "GNC Holdings",
    sector: "Retail Supplements",
    currentPrice: 0,
    dailyChangePercent: 0,
    marketCapBillions: 2.1,
    week52High: 0,
    week52Low: 0,
    ipoStatus: "Private",
    exchange: "N/A",
    priceHistory: [],
  },
  {
    symbol: "NOW",
    name: "NOW Health Group",
    sector: "Natural Products",
    currentPrice: 0,
    dailyChangePercent: 0,
    marketCapBillions: 1.3,
    week52High: 0,
    week52Low: 0,
    ipoStatus: "Private",
    exchange: "N/A",
    priceHistory: [],
  },
  {
    symbol: "GAIA",
    name: "Gaia Herbs",
    sector: "Herbal Medicine",
    currentPrice: 0,
    dailyChangePercent: 0,
    marketCapBillions: 0.45,
    week52High: 0,
    week52Low: 0,
    ipoStatus: "Pre-IPO",
    exchange: "N/A",
    priceHistory: [],
  },
];

// ─── Botanical Trends ───────────────────────

const MONTHS = [
  "Apr", "May", "Jun", "Jul", "Aug", "Sep",
  "Oct", "Nov", "Dec", "Jan", "Feb", "Mar",
];

function generateMonthlyData(
  basePub: number,
  baseMarket: number,
  growthRate: number
): { month: string; publications: number; marketSize: number }[] {
  return MONTHS.map((m, i) => ({
    month: m,
    publications: Math.round(basePub * (1 + (growthRate / 100) * (i / 11)) + (Math.random() - 0.5) * basePub * 0.15),
    marketSize: Math.round((baseMarket * (1 + (growthRate / 200) * (i / 11))) * 100) / 100,
  }));
}

export const BOTANICAL_TRENDS: BotanicalTrend[] = [
  {
    name: "Nigella Sativa",
    pubmedCountCurrent: 1420,
    pubmedCountPrevious: 458,
    growthPercent: 210,
    marketSizeBillions: 1.2,
    trendDirection: "up",
    monthlyData: generateMonthlyData(38, 0.85, 210),
  },
  {
    name: "Curcumin",
    pubmedCountCurrent: 4850,
    pubmedCountPrevious: 3345,
    growthPercent: 45,
    marketSizeBillions: 5.3,
    trendDirection: "up",
    monthlyData: generateMonthlyData(404, 4.8, 45),
  },
  {
    name: "Ashwagandha",
    pubmedCountCurrent: 2180,
    pubmedCountPrevious: 1178,
    growthPercent: 85,
    marketSizeBillions: 3.8,
    trendDirection: "up",
    monthlyData: generateMonthlyData(182, 3.2, 85),
  },
  {
    name: "Berberine",
    pubmedCountCurrent: 1890,
    pubmedCountPrevious: 859,
    growthPercent: 120,
    marketSizeBillions: 2.9,
    trendDirection: "up",
    monthlyData: generateMonthlyData(158, 2.3, 120),
  },
  {
    name: "Lion's Mane",
    pubmedCountCurrent: 980,
    pubmedCountPrevious: 356,
    growthPercent: 175,
    marketSizeBillions: 1.8,
    trendDirection: "up",
    monthlyData: generateMonthlyData(82, 1.2, 175),
  },
  {
    name: "Quercetin",
    pubmedCountCurrent: 3200,
    pubmedCountPrevious: 1939,
    growthPercent: 65,
    marketSizeBillions: 2.4,
    trendDirection: "up",
    monthlyData: generateMonthlyData(267, 2.1, 65),
  },
  {
    name: "Elderberry",
    pubmedCountCurrent: 620,
    pubmedCountPrevious: 477,
    growthPercent: 30,
    marketSizeBillions: 1.6,
    trendDirection: "stable",
    monthlyData: generateMonthlyData(52, 1.5, 30),
  },
  {
    name: "Rhodiola",
    pubmedCountCurrent: 870,
    pubmedCountPrevious: 561,
    growthPercent: 55,
    marketSizeBillions: 1.1,
    trendDirection: "up",
    monthlyData: generateMonthlyData(73, 0.95, 55),
  },
];

// ─── Patent Filings ─────────────────────────

export const PATENT_FILINGS: PatentFiling[] = [
  { id: "PAT-001", title: "Enhanced Curcumin Bioavailability via Liposomal Encapsulation", titleTr: "Lipozomal Enkapsulasyon ile Arttirilmis Kurkumin Biyoyararlanimi", company: "Indena S.p.A.", filingDate: "2026-01-15", status: "Filed", jurisdiction: "USPTO", botanical: "Curcumin" },
  { id: "PAT-002", title: "KSM-66 Ashwagandha CO2 Supercritical Extraction Method", titleTr: "KSM-66 Ashwagandha CO2 Superkritik Ekstraksiyon Yontemi", company: "Ixoreal Biomed", filingDate: "2025-11-20", status: "Granted", jurisdiction: "USPTO", botanical: "Ashwagandha" },
  { id: "PAT-003", title: "Berberine-Cyclodextrin Inclusion Complex for Oral Delivery", titleTr: "Oral Uygulama için Berberin-Siklodekstrin İnklüzyon Kompleksi", company: "Sabinsa Corp.", filingDate: "2025-12-08", status: "Under Review", jurisdiction: "EPO", botanical: "Berberine" },
  { id: "PAT-004", title: "Nigella Sativa Thymoquinone Standardization Process", titleTr: "Nigella Sativa Timokinon Standardizasyon Sureci", company: "Barakat Pharma", filingDate: "2026-02-01", status: "Filed", jurisdiction: "WIPO", botanical: "Nigella Sativa" },
  { id: "PAT-005", title: "Hericenone-Enriched Lion's Mane Extract Production", titleTr: "Hericenon Zenginlestirilmis Aslan Yelesi Ekstrakt Uretimi", company: "Nammex", filingDate: "2025-09-14", status: "Granted", jurisdiction: "USPTO", botanical: "Lion's Mane" },
  { id: "PAT-006", title: "Quercetin Phytosome Complex with Phospholipids", titleTr: "Fosfolipidlerle Kuersetin Fitozom Kompleksi", company: "Indena S.p.A.", filingDate: "2025-10-22", status: "Granted", jurisdiction: "EPO", botanical: "Quercetin" },
  { id: "PAT-007", title: "Elderberry Anthocyanin Preservation During Processing", titleTr: "Isleme Sirasinda Muzver Antosiyanin Koruma Yontemi", company: "Artemis International", filingDate: "2026-01-30", status: "Under Review", jurisdiction: "USPTO", botanical: "Elderberry" },
  { id: "PAT-008", title: "Rhodiola Rosea Salidroside Fermentation Biosynthesis", titleTr: "Rhodiola Rosea Salidrosid Fermentasyon Biyosentezi", company: "Layn Natural", filingDate: "2025-08-18", status: "Granted", jurisdiction: "WIPO", botanical: "Rhodiola" },
  { id: "PAT-009", title: "Nanoparticle-Based Curcumin for Blood-Brain Barrier Penetration", titleTr: "Kan-Beyin Bariyeri Gecisi için Nanopartikul Bazli Kurkumin", company: "Verdure Sciences", filingDate: "2026-03-05", status: "Filed", jurisdiction: "USPTO", botanical: "Curcumin" },
  { id: "PAT-010", title: "Ashwagandha Withanolide Glycoside Isolation Technique", titleTr: "Ashwagandha Witanolid Glikozid Izolasyon Teknigi", company: "Natural Remedies", filingDate: "2025-07-12", status: "Granted", jurisdiction: "EPO", botanical: "Ashwagandha" },
  { id: "PAT-011", title: "Synergistic Berberine-Silymarin Formulation for Metabolic Health", titleTr: "Metabolik Sağlık için Sinerjistik Berberin-Silimarin Formulasyonu", company: "Thorne Research", filingDate: "2025-11-05", status: "Under Review", jurisdiction: "USPTO", botanical: "Berberine" },
  { id: "PAT-012", title: "Water-Soluble Quercetin Derivative Synthesis", titleTr: "Suda Cozunur Kuersetin Turevi Sentezi", company: "Sabinsa Corp.", filingDate: "2026-02-18", status: "Filed", jurisdiction: "WIPO", botanical: "Quercetin" },
  { id: "PAT-013", title: "Lion's Mane Mycelium Dual Extract Standardization", titleTr: "Aslan Yelesi Miselyum Cift Ekstrakt Standardizasyonu", company: "Host Defense", filingDate: "2025-12-20", status: "Under Review", jurisdiction: "USPTO", botanical: "Lion's Mane" },
  { id: "PAT-014", title: "Cold-Pressed Nigella Sativa Oil Microencapsulation", titleTr: "Soguk Sikim Nigella Sativa Yagi Mikrokapsulasyonu", company: "Dosist Health", filingDate: "2026-01-08", status: "Filed", jurisdiction: "EPO", botanical: "Nigella Sativa" },
  { id: "PAT-015", title: "Adaptogenic Rhodiola-Eleuthero Combination Extract", titleTr: "Adaptojenik Rhodiola-Eleutero Kombinasyon Ekstrakti", company: "Gaia Herbs", filingDate: "2025-10-30", status: "Granted", jurisdiction: "USPTO", botanical: "Rhodiola" },
];

// ─── Regulatory Updates ─────────────────────

export const REGULATORY_UPDATES: RegulatoryUpdate[] = [
  {
    id: "REG-001",
    title: "FDA Issues Draft Guidance on NAC Supplement Status",
    titleTr: "FDA NAC Takviye Statusu Hakkinda Taslak Kilavuz Yayimladi",
    agency: "FDA",
    type: "Guidance",
    date: "2026-03-15",
    status: "Pending",
    impactLevel: "high",
    summary: "FDA clarifies N-Acetyl Cysteine can be marketed as a dietary supplement, reversing previous stance. Major win for supplement industry.",
    summaryTr: "FDA, N-Asetil Sistein'in takviye olarak pazarlanabilecegini açıkladı ve onceki tutumunu değiştirdi. Takviye endüstrisi için buyuk kazanim.",
  },
  {
    id: "REG-002",
    title: "EMA Approves New Curcumin Health Claim Application",
    titleTr: "EMA Yeni Kurkumin Sağlık Beyani Basvurusunu Onayladi",
    agency: "EMA",
    type: "Health Claim",
    date: "2026-02-28",
    status: "Approved",
    impactLevel: "medium",
    summary: "European Medicines Agency approves Article 13.1 health claim for curcumin's contribution to normal joint function.",
    summaryTr: "Avrupa Ilac Ajansi, kurkuminin normal eklem fonksiyonuna katkisina iliskin Madde 13.1 sağlık beyanini onayladı.",
  },
  {
    id: "REG-003",
    title: "EFSA Re-evaluates Ashwagandha Novel Food Status",
    titleTr: "EFSA Ashwagandha Novel Food Statusunu Yeniden Değerlendiriyor",
    agency: "EFSA",
    type: "Novel Food",
    date: "2026-03-01",
    status: "Under Review",
    impactLevel: "high",
    summary: "EFSA panel reviewing safety of ashwagandha root extract at doses above 600mg/day. Denmark and Italy proposed restrictions.",
    summaryTr: "EFSA paneli, gunluk 600mg ustu dozlarda ashwagandha kok ekstraktinin güvenligini inceliyor. Danimarka ve Italya kısıtlama önerdi.",
  },
  {
    id: "REG-004",
    title: "FDA Warning Letters to 12 Supplement Companies",
    titleTr: "FDA 12 Takviye Sirketine Uyari Mektubu Gonderdi",
    agency: "FDA",
    type: "Enforcement",
    date: "2026-01-20",
    status: "Approved",
    impactLevel: "medium",
    summary: "FDA cracks down on companies making unapproved disease claims for elderberry and quercetin products during flu season.",
    summaryTr: "FDA, grip mevsiminde muzver ve kuersetin ürünleri için onaylanmamış hastalik beyanlari yapan sirketlere yaptrim uyguladi.",
  },
  {
    id: "REG-005",
    title: "TGA Updates Complementary Medicine Framework",
    titleTr: "TGA Tamamlayici Tip Cercevesini Güncelledi",
    agency: "TGA",
    type: "Framework Update",
    date: "2026-02-10",
    status: "Approved",
    impactLevel: "low",
    summary: "Australia's TGA simplifies listed medicine pathway for traditional herbal medicines with established use.",
    summaryTr: "Avustralya TGA, geleneksel bitkisel ilaclar için listelenmis ilac yolunu basitleştirdi.",
  },
  {
    id: "REG-006",
    title: "EFSA Positive Opinion on Berberine Safety Assessment",
    titleTr: "EFSA Berberin Güvenlik Değerlendirmesi Olumlu Görüş",
    agency: "EFSA",
    type: "Safety Assessment",
    date: "2025-12-15",
    status: "Approved",
    impactLevel: "medium",
    summary: "EFSA concludes berberine at 500mg/day from Berberis vulgaris is safe for adults, excluding pregnant women.",
    summaryTr: "EFSA, Berberis vulgaris'ten gunluk 500mg berberinin hamileler haric yetiskinler için güvenli olduğu sonucuna vardi.",
  },
  {
    id: "REG-007",
    title: "FDA Accepts GRAS Notification for Lion's Mane Extract",
    titleTr: "FDA Aslan Yelesi Ekstrakti için GRAS Bildirimini Kabul Etti",
    agency: "FDA",
    type: "GRAS Notice",
    date: "2026-03-10",
    status: "Approved",
    impactLevel: "medium",
    summary: "Lion's Mane (Hericium erinaceus) fruiting body extract receives FDA GRAS status for use in functional foods.",
    summaryTr: "Aslan Yelesi meyveli govde ekstrakti, fonksiyonel gidalarda kullanim için FDA GRAS statusu aldi.",
  },
  {
    id: "REG-008",
    title: "EMA Initiates Herbal Monograph Review for Rhodiola",
    titleTr: "EMA Rhodiola için Bitkisel Monograf İncelemesi Başlattı",
    agency: "EMA",
    type: "Monograph Review",
    date: "2026-01-05",
    status: "Under Review",
    impactLevel: "low",
    summary: "EMA's Committee on Herbal Medicinal Products begins updating Rhodiola rosea community herbal monograph.",
    summaryTr: "EMA Bitkisel Ilac Komitesi, Rhodiola rosea topluluk bitkisel monografini güncellemeye başladı.",
  },
  {
    id: "REG-009",
    title: "FDA Proposes Mandatory Product Listing for Supplements",
    titleTr: "FDA Takviyeler için Zorunlu Ürün Listeleme Önerisi",
    agency: "FDA",
    type: "Proposed Rule",
    date: "2026-02-20",
    status: "Pending",
    impactLevel: "high",
    summary: "Proposed rule would require all dietary supplement manufacturers to register products with FDA, increasing transparency.",
    summaryTr: "Onerilen kural, tum takviye ureticilerinin ürünlerini FDA'ya kaydetmesini zorunlu kılarak şeffafligi artıracak.",
  },
  {
    id: "REG-010",
    title: "EFSA Reviews Quercetin Bioavailability Claims",
    titleTr: "EFSA Kuersetin Biyoyararlanim Beyanlarini Inceliyor",
    agency: "EFSA",
    type: "Claim Review",
    date: "2026-03-20",
    status: "Under Review",
    impactLevel: "low",
    summary: "EFSA NDA Panel evaluates new evidence on quercetin phytosome bioavailability for Article 13.5 health claim submission.",
    summaryTr: "EFSA NDA Paneli, Madde 13.5 sağlık beyani basvurusu için kuersetin fitozom biyoyararlanimi hakkindaki yeni kanitlari değerlendiriyor.",
  },
];

// ─── Sector Events ──────────────────────────

export const SECTOR_EVENTS: SectorEvent[] = [
  { date: "2026-03-22", type: "Funding", company: "Gaia Herbs", detail: "Series C — $85M led by KKR for retail expansion", detailTr: "Seri C — perakende genişleme için KKR liderliginde 85M$", valueBillions: 0.085 },
  { date: "2026-03-15", type: "M&A", company: "Blackmores (BKL)", detail: "Acquired BioCeuticals for $210M — probiotics portfolio", detailTr: "BioCeuticals'i 210M$'a satin aldi — probiyotik portfoyu", valueBillions: 0.21 },
  { date: "2026-03-01", type: "Partnership", company: "USANA + Mayo Clinic", detail: "5-year clinical research partnership on cellular nutrition", detailTr: "Hucresel beslenme uzerine 5 yillik klinik arastirma ortakligi" },
  { date: "2026-02-18", type: "IPO", company: "Layn Natural Ingredients", detail: "NASDAQ IPO at $14/share — $420M raised for monk fruit & stevia", detailTr: "NASDAQ halka arzi 14$/hisse — keciboynuzu & stevia için420M$ toplandi", valueBillions: 0.42 },
  { date: "2026-02-05", type: "Funding", company: "Nammex", detail: "Series B — $32M for mushroom extract R&D facilities", detailTr: "Seri B — mantar ekstrakt Ar-Ge tesisleri için32M$", valueBillions: 0.032 },
  { date: "2026-01-28", type: "M&A", company: "DSM-Firmenich", detail: "Acquired PhytoGaia ($180M) — palm tocotrienol technology", detailTr: "PhytoGaia'yi satin aldi (180M$) — palm tokotrienol teknolojisi", valueBillions: 0.18 },
  { date: "2026-01-15", type: "Partnership", company: "Herbalife + Alibaba Health", detail: "Exclusive distribution deal for China market entry", detailTr: "Cin pazarina giris için ozel dagitim anlasmasi" },
  { date: "2025-12-20", type: "Funding", company: "Metagenics", detail: "Private equity — $650M from Alticor for functional medicine platform", detailTr: "Ozel sermaye — fonksiyonel tip platformu için Alticor'dan 650M$", valueBillions: 0.65 },
  { date: "2025-12-05", type: "IPO", company: "Enzymedica", detail: "Pre-IPO filing S-1 — digestive enzyme market leader", detailTr: "Halka arz oncesi S-1 basvurusu — sindirim enzimi pazar lideri" },
  { date: "2025-11-18", type: "M&A", company: "Unilever", detail: "Acquired Olly Nutrition for $1.2B — gummy vitamin segment", detailTr: "Olly Nutrition'i 1.2B$'a satin aldi — jel vitamin segmenti", valueBillions: 1.2 },
  { date: "2025-11-01", type: "Partnership", company: "Nature's Sunshine + Cleveland Clinic", detail: "Integrative medicine research collaboration", detailTr: "Butunlestirici tip arastirma isbirligi" },
  { date: "2025-10-15", type: "Funding", company: "Host Defense (Fungi Perfecti)", detail: "Series A — $28M for medicinal mushroom clinical trials", detailTr: "Seri A — tibbi mantar klinik çalışmaları için28M$", valueBillions: 0.028 },
];

// ─── Market KPIs ────────────────────────────

export const MARKET_KPIS: MarketKPI[] = [
  { label: "Global Phytotherapy Market", labelTr: "Kuresel Fitoterapi Pazari", value: "$42.6B", change: "+8.7%", changeDirection: "up" },
  { label: "CAGR (2021-2026)", labelTr: "YBBO (2021-2026)", value: "8.7%", change: "+1.2pp", changeDirection: "up" },
  { label: "Active Clinical Trials", labelTr: "Aktif Klinik Calismalar", value: "3,200+", change: "+340", changeDirection: "up" },
  { label: "Global Patents Filed", labelTr: "Kuresel Patent Basvurulari", value: "12,400+", change: "+18%", changeDirection: "up" },
  { label: "FDA GRAS Approvals (YTD)", labelTr: "FDA GRAS Onaylari (YBB)", value: "47", change: "+12", changeDirection: "up" },
];

// ─── Correlation Data ───────────────────────

export const CORRELATION_DATA: CorrelationData[] = [
  {
    company: "Herbalife",
    symbol: "HLF",
    data: [
      { month: "Apr", searchVolume: 62, stockPrice: 12.80 },
      { month: "May", searchVolume: 58, stockPrice: 12.10 },
      { month: "Jun", searchVolume: 65, stockPrice: 13.20 },
      { month: "Jul", searchVolume: 71, stockPrice: 13.80 },
      { month: "Aug", searchVolume: 68, stockPrice: 13.40 },
      { month: "Sep", searchVolume: 55, stockPrice: 11.90 },
      { month: "Oct", searchVolume: 60, stockPrice: 12.30 },
      { month: "Nov", searchVolume: 74, stockPrice: 14.10 },
      { month: "Dec", searchVolume: 82, stockPrice: 14.90 },
      { month: "Jan", searchVolume: 88, stockPrice: 15.20 },
      { month: "Feb", searchVolume: 72, stockPrice: 12.80 },
      { month: "Mar", searchVolume: 65, stockPrice: 11.42 },
    ],
  },
  {
    company: "USANA Health Sciences",
    symbol: "USNA",
    data: [
      { month: "Apr", searchVolume: 45, stockPrice: 52.30 },
      { month: "May", searchVolume: 42, stockPrice: 49.80 },
      { month: "Jun", searchVolume: 48, stockPrice: 54.10 },
      { month: "Jul", searchVolume: 52, stockPrice: 58.40 },
      { month: "Aug", searchVolume: 55, stockPrice: 61.20 },
      { month: "Sep", searchVolume: 50, stockPrice: 55.60 },
      { month: "Oct", searchVolume: 47, stockPrice: 52.90 },
      { month: "Nov", searchVolume: 58, stockPrice: 62.80 },
      { month: "Dec", searchVolume: 63, stockPrice: 68.40 },
      { month: "Jan", searchVolume: 60, stockPrice: 64.20 },
      { month: "Feb", searchVolume: 53, stockPrice: 56.10 },
      { month: "Mar", searchVolume: 48, stockPrice: 48.76 },
    ],
  },
  {
    company: "Nature's Sunshine",
    symbol: "NATR",
    data: [
      { month: "Apr", searchVolume: 28, stockPrice: 13.20 },
      { month: "May", searchVolume: 32, stockPrice: 14.10 },
      { month: "Jun", searchVolume: 35, stockPrice: 14.80 },
      { month: "Jul", searchVolume: 38, stockPrice: 15.60 },
      { month: "Aug", searchVolume: 42, stockPrice: 16.40 },
      { month: "Sep", searchVolume: 40, stockPrice: 15.90 },
      { month: "Oct", searchVolume: 45, stockPrice: 17.20 },
      { month: "Nov", searchVolume: 48, stockPrice: 17.80 },
      { month: "Dec", searchVolume: 52, stockPrice: 18.90 },
      { month: "Jan", searchVolume: 55, stockPrice: 19.60 },
      { month: "Feb", searchVolume: 50, stockPrice: 18.80 },
      { month: "Mar", searchVolume: 47, stockPrice: 18.34 },
    ],
  },
];
