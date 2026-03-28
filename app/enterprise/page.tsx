"use client"

import { useState } from "react"
import { useLang } from "@/components/layout/language-toggle"
import {
  Building2,
  TrendingUp,
  Shield,
  BarChart3,
  Users,
  Briefcase,
  Globe,
  ArrowUpRight,
  Sparkles,
  LineChart,
  Database,
  Zap,
  CheckCircle2,
  Mail,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  Leaf,
  DollarSign,
  Target,
  PieChart,
  Activity,
} from "lucide-react"

// ─── Mock Market Intelligence Data ───
const MARKET_TRENDS = [
  { name: "Curcumin (BCM-95)", data: [2.1, 2.4, 2.8, 3.1, 3.6, 4.2, 4.9, 5.3], growth: "+156%", marketCap: "$5.3B", trend: "up" as const },
  { name: "Ashwagandha (KSM-66)", data: [1.8, 2.0, 2.5, 3.0, 3.4, 3.9, 4.5, 5.1], growth: "+183%", marketCap: "$5.1B", trend: "up" as const },
  { name: "Berberine", data: [0.8, 0.9, 1.1, 1.4, 1.7, 2.1, 2.6, 3.2], growth: "+300%", marketCap: "$3.2B", trend: "up" as const },
  { name: "Elderberry", data: [1.2, 1.5, 2.0, 2.4, 2.2, 2.1, 2.3, 2.5], growth: "+108%", marketCap: "$2.5B", trend: "stable" as const },
  { name: "CBD Extract", data: [4.5, 5.2, 5.8, 5.5, 5.0, 4.8, 5.1, 5.4], growth: "+20%", marketCap: "$5.4B", trend: "stable" as const },
  { name: "Lion's Mane", data: [0.3, 0.4, 0.6, 0.9, 1.3, 1.8, 2.4, 3.0], growth: "+900%", marketCap: "$3.0B", trend: "up" as const },
]

const COMPANIES = [
  { name: "Indena S.p.A.", country: "Italy", focus: "Standardized Extracts", marketCap: "$2.1B", growth: "+18%", stage: "Public", patents: 340 },
  { name: "Sabinsa Corporation", country: "USA/India", focus: "Curcumin, Bioperine", marketCap: "$890M", growth: "+24%", stage: "Private", patents: 220 },
  { name: "Ixoreal Biomed (KSM-66)", country: "India", focus: "Ashwagandha", marketCap: "$450M", growth: "+42%", stage: "Private", patents: 45 },
  { name: "Naturex (Givaudan)", country: "France", focus: "Botanical Extracts", marketCap: "$1.8B", growth: "+12%", stage: "Acquired", patents: 180 },
  { name: "Layn Natural", country: "China/USA", focus: "Monk Fruit, Stevia", marketCap: "$620M", growth: "+31%", stage: "Pre-IPO", patents: 95 },
  { name: "Verdure Sciences", country: "USA", focus: "Longvida Curcumin", marketCap: "$180M", growth: "+28%", stage: "Private", patents: 38 },
  { name: "PLT Health Solutions", country: "USA", focus: "Adaptogen Blends", marketCap: "$340M", growth: "+22%", stage: "Private", patents: 52 },
  { name: "Euromed", country: "Spain", focus: "Mediterranean Extracts", marketCap: "$290M", growth: "+15%", stage: "Private", patents: 75 },
]

const AI_INSIGHTS = [
  {
    type: "trend" as const,
    icon: TrendingUp,
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-950/30",
  },
  {
    type: "bottleneck" as const,
    icon: Target,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30",
  },
  {
    type: "opportunity" as const,
    icon: Sparkles,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    type: "risk" as const,
    icon: Shield,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/30",
  },
]

const ENTERPRISE_PLANS = [
  {
    id: "insurance",
    icon: Shield,
    color: "from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30",
    border: "border-blue-200 dark:border-blue-800",
  },
  {
    id: "pharma",
    icon: FlaskConical,
    color: "from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30",
    border: "border-purple-200 dark:border-purple-800",
  },
  {
    id: "clinic",
    icon: Building2,
    color: "from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30",
    border: "border-green-200 dark:border-green-800",
  },
  {
    id: "research",
    icon: Database,
    color: "from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30",
    border: "border-amber-200 dark:border-amber-800",
  },
]

const YEARS = ["2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026*"]

export default function EnterprisePage() {
  const { lang } = useLang()
  const isTr = lang === "tr"
  const [activeTab, setActiveTab] = useState<"overview" | "market" | "companies">("overview")
  const [expandedInsight, setExpandedInsight] = useState<number | null>(null)

  const insightTexts = [
    {
      title: isTr ? "Adaptogen Pazarı Patlaması" : "Adaptogen Market Explosion",
      summary: isTr
        ? "Ashwagandha ve Lion's Mane küresel arama hacmi 2023-2026 arasında 3x arttı. Nootropik + adaptogen kesişimi en hızlı büyüyen segment."
        : "Ashwagandha and Lion's Mane global search volume tripled 2023-2026. Nootropic + adaptogen crossover is the fastest growing segment.",
      detail: isTr
        ? "KSM-66 patentli Ashwagandha'nın klinik çalışma sayısı 2024'te 35'e ulaştı (2019: 8). Lion's Mane NGF (Sinir Büyüme Faktörü) üzerindeki etkileri nedeniyle nörobilim alanında dikkat çekiyor."
        : "KSM-66 patented Ashwagandha clinical studies reached 35 in 2024 (2019: 8). Lion's Mane is attracting neuroscience attention due to NGF effects.",
    },
    {
      title: isTr ? "Hammadde Arz Darboğazı" : "Raw Material Supply Bottleneck",
      summary: isTr
        ? "Berberine hammadde fiyatları %40 arttı — Çin'deki tarım alanı kısıtlamaları ve artan talep. Alternatif kaynak arayışı hızlandı."
        : "Berberine raw material prices increased 40% — Chinese farmland restrictions and rising demand. Alternative sourcing accelerated.",
      detail: isTr
        ? "Berberine ana kaynağı Coptis chinensis (Huanglian) yetiştiriciliği Sichuan'da %30 azaldı. Hindistan ve Vietnam alternatifleri 2-3 yıl içinde üretime hazır."
        : "Berberine main source Coptis chinensis (Huanglian) cultivation decreased 30% in Sichuan. India and Vietnam alternatives ready in 2-3 years.",
    },
    {
      title: isTr ? "Personalized Supplement Fırsatı" : "Personalized Supplement Opportunity",
      summary: isTr
        ? "Farmakogenetik tabanlı kişiselleştirilmiş takviye pazarı 2026'da $4.2B'a ulaşacak. CYP450 genotipleme maliyeti $50'ın altına düştü."
        : "Pharmacogenomics-based personalized supplement market to reach $4.2B by 2026. CYP450 genotyping cost dropped below $50.",
      detail: isTr
        ? "23andMe, AncestryDNA verileriyle entegre takviye önerisi yapan platform sayısı 2'den 12'ye çıktı. Phytotherapy.ai bu alanda ilk fitoterapi odaklı çözüm."
        : "Platforms integrating with 23andMe/AncestryDNA data for supplement recommendations grew from 2 to 12. Phytotherapy.ai is the first phytotherapy-focused solution.",
    },
    {
      title: isTr ? "Regülasyon Riski: EU Novel Food" : "Regulatory Risk: EU Novel Food",
      summary: isTr
        ? "AB Novel Food düzenlemesi 2025'te sıkılaştı. CBD, kratom ve bazı adaptogenler yeniden değerlendiriliyor. Pazar belirsizliği %15 büyüme kaybına neden oldu."
        : "EU Novel Food regulation tightened in 2025. CBD, kratom and some adaptogens under re-evaluation. Market uncertainty caused 15% growth loss.",
      detail: isTr
        ? "Ashwagandha AB'de şu an serbest ama Danimarka ve İtalya kısıtlama önerdi. Şirketler için AB pazar erişimi risk altında."
        : "Ashwagandha currently unrestricted in EU but Denmark and Italy proposed restrictions. EU market access at risk for companies.",
    },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      {/* Hero */}
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
          <Building2 className="h-7 w-7 text-primary" />
        </div>
        <h1 className="font-heading text-3xl font-bold md:text-4xl">
          {isTr ? "Kurumsal Çözümler & Pazar İstihbaratı" : "Enterprise Solutions & Market Intelligence"}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          {isTr
            ? "Sigorta şirketleri, ilaç firmaları, klinikler ve yatırımcılar için veri odaklı sağlık çözümleri. Biyoteknoloji pazar trendleri, hammadde analizi ve AI destekli içgörüler."
            : "Data-driven health solutions for insurance companies, pharma, clinics and investors. Biotech market trends, raw material analysis and AI-powered insights."}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8 flex justify-center">
        <div className="inline-flex rounded-xl bg-muted p-1">
          {[
            { id: "overview" as const, label: isTr ? "Kurumsal Planlar" : "Enterprise Plans", icon: Briefcase },
            { id: "market" as const, label: isTr ? "Pazar Trendleri" : "Market Trends", icon: LineChart },
            { id: "companies" as const, label: isTr ? "Şirket Radarı" : "Company Radar", icon: Globe },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── TAB 1: Enterprise Plans ─── */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Enterprise Plan Cards */}
          <div className="grid gap-5 md:grid-cols-2">
            {ENTERPRISE_PLANS.map((plan) => {
              const Icon = plan.icon
              const titles: Record<string, { tr: string; en: string }> = {
                insurance: { tr: "Sigorta Şirketleri", en: "Insurance Companies" },
                pharma: { tr: "İlaç & Biyoteknoloji", en: "Pharma & Biotech" },
                clinic: { tr: "Klinikler & Hastaneler", en: "Clinics & Hospitals" },
                research: { tr: "Araştırma Kuruluşları", en: "Research Institutions" },
              }
              const descs: Record<string, { tr: string; en: string }> = {
                insurance: {
                  tr: "Wellbeing programı entegrasyonu, popülasyon sağlık verileri, ilaç uyum skorları, maliyet tasarruf analitiği. Anonim ve KVKK uyumlu.",
                  en: "Wellbeing program integration, population health data, medication adherence scores, cost savings analytics. Anonymous and GDPR compliant.",
                },
                pharma: {
                  tr: "Gerçek dünya kanıt verileri (RWE), yan etki erken sinyal sistemi, ilaç-bitki etkileşim veritabanı API erişimi, klinik araştırma desteği.",
                  en: "Real-world evidence data (RWE), adverse event early signal system, drug-herb interaction database API, clinical research support.",
                },
                clinic: {
                  tr: "Doktor paneli, hasta takip sistemi, AI ziyaret özeti, çoklu hesap yönetimi, klinik faturalandırma desteği.",
                  en: "Doctor panel, patient tracking system, AI visit summaries, multi-account management, clinical billing support.",
                },
                research: {
                  tr: "Anonim sağlık veri seti erişimi, popülasyon trend analizi, fitoterapi etkinlik verileri, akademik API.",
                  en: "Anonymous health dataset access, population trend analysis, phytotherapy efficacy data, academic API.",
                },
              }
              const features: Record<string, string[]> = {
                insurance: [
                  isTr ? "Anonim popülasyon analitiği" : "Anonymous population analytics",
                  isTr ? "İlaç uyum skoru takibi" : "Medication adherence scoring",
                  isTr ? "Wellbeing ROI hesaplama" : "Wellbeing ROI calculation",
                  isTr ? "Özel API entegrasyonu" : "Custom API integration",
                ],
                pharma: [
                  isTr ? "Yan etki sinyal tespiti" : "Adverse event signal detection",
                  isTr ? "İlaç-bitki etkileşim DB" : "Drug-herb interaction DB",
                  isTr ? "Gerçek dünya kanıt verisi" : "Real-world evidence data",
                  isTr ? "Farmakovijilans desteği" : "Pharmacovigilance support",
                ],
                clinic: [
                  isTr ? "Sınırsız hasta profili" : "Unlimited patient profiles",
                  isTr ? "AI klinik özet raporları" : "AI clinical summary reports",
                  isTr ? "Doktor arası yönlendirme" : "Inter-doctor referral",
                  isTr ? "EHR entegrasyonu (FHIR)" : "EHR integration (FHIR)",
                ],
                research: [
                  isTr ? "Anonim veri seti erişimi" : "Anonymous dataset access",
                  isTr ? "Trend analiz API" : "Trend analysis API",
                  isTr ? "Kohort oluşturma araçları" : "Cohort building tools",
                  isTr ? "Akademik yayın desteği" : "Academic publication support",
                ],
              }

              return (
                <div key={plan.id} className={`rounded-xl border bg-gradient-to-br ${plan.color} ${plan.border} p-6`}>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background/80">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{isTr ? titles[plan.id]?.tr : titles[plan.id]?.en}</h3>
                    </div>
                  </div>
                  <p className="mb-4 text-sm text-muted-foreground">
                    {isTr ? descs[plan.id]?.tr : descs[plan.id]?.en}
                  </p>
                  <ul className="mb-5 space-y-2">
                    {features[plan.id]?.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-primary" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="text-sm font-semibold text-muted-foreground">
                    {isTr ? "Özel fiyatlandırma" : "Custom pricing"}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Contact CTA */}
          <div className="rounded-xl border bg-gradient-to-br from-primary/5 to-primary/10 p-8 text-center">
            <h3 className="mb-2 text-xl font-bold">
              {isTr ? "Kurumsal Demo Talep Edin" : "Request Enterprise Demo"}
            </h3>
            <p className="mb-5 text-sm text-muted-foreground">
              {isTr
                ? "Şirketinize özel çözüm için ekibimizle iletişime geçin."
                : "Contact our team for a solution tailored to your organization."}
            </p>
            <a
              href="mailto:enterprise@phytotherapy.ai"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary/90 hover:shadow-lg"
            >
              <Mail className="h-4 w-4" />
              enterprise@phytotherapy.ai
            </a>
          </div>
        </div>
      )}

      {/* ─── TAB 2: Market Trends ─── */}
      {activeTab === "market" && (
        <div className="space-y-6">
          {/* AI Insights */}
          <div className="grid gap-4 md:grid-cols-2">
            {AI_INSIGHTS.map((insight, i) => {
              const Icon = insight.icon
              const text = insightTexts[i]
              const isExpanded = expandedInsight === i
              return (
                <div key={i} className={`rounded-xl border ${insight.bg} p-5`}>
                  <div className="mb-2 flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${insight.color}`} />
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {isTr
                        ? ["Yükselen Trend", "Arz Darboğazı", "Fırsat", "Risk"][i]
                        : ["Rising Trend", "Supply Bottleneck", "Opportunity", "Risk"][i]}
                    </span>
                  </div>
                  <h4 className="mb-1 text-sm font-bold">{text.title}</h4>
                  <p className="text-xs text-muted-foreground">{text.summary}</p>
                  {isExpanded && (
                    <p className="mt-2 text-xs text-muted-foreground/80 border-t pt-2">{text.detail}</p>
                  )}
                  <button
                    onClick={() => setExpandedInsight(isExpanded ? null : i)}
                    className="mt-2 flex items-center gap-1 text-xs font-medium text-primary"
                  >
                    {isExpanded ? (isTr ? "Kapat" : "Less") : (isTr ? "Detay" : "More")}
                    {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>
                </div>
              )
            })}
          </div>

          {/* Market Trend Cards (Simplified chart with CSS bars) */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <LineChart className="h-5 w-5 text-primary" />
              {isTr ? "Hammadde Pazar Büyüklüğü (Milyar $)" : "Raw Material Market Size (Billion $)"}
            </h3>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {MARKET_TRENDS.map((item) => {
                const max = Math.max(...item.data)
                return (
                  <div key={item.name} className="rounded-xl border bg-card p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-bold">{item.name}</span>
                      <span className={`text-xs font-bold ${item.trend === "up" ? "text-green-600" : "text-amber-600"}`}>
                        {item.growth}
                      </span>
                    </div>
                    {/* Mini bar chart */}
                    <div className="mb-2 flex items-end gap-[3px]" style={{ height: 48 }}>
                      {item.data.map((val, j) => (
                        <div
                          key={j}
                          className={`flex-1 rounded-t-sm transition-all ${
                            j === item.data.length - 1
                              ? "bg-primary"
                              : "bg-primary/30"
                          }`}
                          style={{ height: `${(val / max) * 100}%` }}
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>2019</span>
                      <span className="font-bold text-foreground">{item.marketCap}</span>
                      <span>2026</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: Company Radar ─── */}
      {activeTab === "companies" && (
        <div>
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <Globe className="h-5 w-5 text-primary" />
            {isTr ? "Biyoteknoloji & Fitoterapi Şirket Radarı" : "Biotech & Phytotherapy Company Radar"}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left">
                  <th className="px-4 py-3 font-semibold">{isTr ? "Şirket" : "Company"}</th>
                  <th className="px-4 py-3 font-semibold">{isTr ? "Ülke" : "Country"}</th>
                  <th className="px-4 py-3 font-semibold">{isTr ? "Odak Alanı" : "Focus Area"}</th>
                  <th className="px-4 py-3 font-semibold text-right">{isTr ? "Pazar Değeri" : "Market Cap"}</th>
                  <th className="px-4 py-3 font-semibold text-right">{isTr ? "Büyüme" : "Growth"}</th>
                  <th className="px-4 py-3 font-semibold text-right">{isTr ? "Patent" : "Patents"}</th>
                  <th className="px-4 py-3 font-semibold">{isTr ? "Durum" : "Stage"}</th>
                </tr>
              </thead>
              <tbody>
                {COMPANIES.map((company, i) => (
                  <tr key={i} className="border-b transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3 font-semibold">{company.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{company.country}</td>
                    <td className="px-4 py-3 text-muted-foreground">{company.focus}</td>
                    <td className="px-4 py-3 text-right font-mono font-semibold">{company.marketCap}</td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-green-600">{company.growth}</td>
                    <td className="px-4 py-3 text-right font-mono">{company.patents}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        company.stage === "Public" ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
                        : company.stage === "Pre-IPO" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
                        : company.stage === "Acquired" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      }`}>
                        {company.stage}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Market Stats */}
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: isTr ? "Global Fitoterapi Pazarı" : "Global Phytotherapy Market", value: "$42.6B", sub: "2026", icon: Leaf },
              { label: isTr ? "Yıllık Büyüme (CAGR)" : "Annual Growth (CAGR)", value: "8.7%", sub: "2021-2026", icon: TrendingUp },
              { label: isTr ? "Aktif Patent" : "Active Patents", value: "12,400+", sub: isTr ? "Dünya geneli" : "Worldwide", icon: FlaskConical },
              { label: isTr ? "Klinik Çalışma" : "Clinical Trials", value: "3,200+", sub: "ClinicalTrials.gov", icon: Activity },
            ].map((stat, i) => (
              <div key={i} className="rounded-xl border bg-card p-4 text-center">
                <stat.icon className="mx-auto mb-2 h-5 w-5 text-primary" />
                <div className="text-xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
                <div className="text-[10px] text-muted-foreground/60">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-10 rounded-xl border bg-muted/30 p-5 text-center text-xs text-muted-foreground">
        {isTr
          ? "Bu sayfadaki pazar verileri ve şirket bilgileri kamuya açık kaynaklardan derlenmiş tahmini değerlerdir. Yatırım tavsiyesi niteliği taşımaz. Yatırım kararlarınızda profesyonel danışmanlık alınız."
          : "Market data and company information on this page are estimates compiled from public sources. This does not constitute investment advice. Seek professional guidance for investment decisions."}
      </div>
    </div>
  )
}
