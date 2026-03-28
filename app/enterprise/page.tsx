"use client"

import { useState, useEffect, useCallback } from "react"
import { useLang } from "@/components/layout/language-toggle"
import {
  Building2,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Globe,
  ArrowUpRight,
  Sparkles,
  LineChart,
  Zap,
  Shield,
  FileText,
  FlaskConical,
  Leaf,
  Activity,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Scale,
  Beaker,
  Search,
  ChevronRight,
} from "lucide-react"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import type {
  PhytoCompany,
  BotanicalTrend,
  PatentFiling,
  RegulatoryUpdate,
  SectorEvent,
  MarketKPI,
  CorrelationData,
} from "@/lib/market-intelligence-data"

// ─── Constants ──────────────────────────────

const CHART_COLORS = [
  "#10b981", "#3b82f6", "#8b5cf6", "#f59e0b",
  "#ef4444", "#06b6d4", "#ec4899", "#84cc16",
]

type TabId = "overview" | "trends" | "companies" | "patents" | "ai"

interface AIAnalysis {
  earlySignals: {
    signal: string
    signalTr?: string
    confidence: "high" | "medium" | "low"
    botanical: string
  }[]
  sectorOutlook: {
    summary: string
    summaryTr?: string
    bullishFactors: string[]
    bullishFactorsTr?: string[]
    bearishFactors: string[]
    bearishFactorsTr?: string[]
  }
  riskAlerts: {
    risk: string
    riskTr?: string
    severity: "high" | "medium" | "low"
    sector: string
  }[]
}

// ─── Page Component ─────────────────────────

export default function EnterprisePage() {
  const { lang } = useLang()
  const isTr = lang === "tr"

  const [activeTab, setActiveTab] = useState<TabId>("overview")

  // Data states
  const [kpis, setKpis] = useState<MarketKPI[]>([])
  const [events, setEvents] = useState<SectorEvent[]>([])
  const [botanicals, setBotanicals] = useState<BotanicalTrend[]>([])
  const [companies, setCompanies] = useState<PhytoCompany[]>([])
  const [correlation, setCorrelation] = useState<CorrelationData[]>([])
  const [patents, setPatents] = useState<PatentFiling[]>([])
  const [regulatory, setRegulatory] = useState<RegulatoryUpdate[]>([])
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null)

  // Loading states
  const [loadingOverview, setLoadingOverview] = useState(true)
  const [loadingTrends, setLoadingTrends] = useState(true)
  const [loadingCompanies, setLoadingCompanies] = useState(false)
  const [loadingPatents, setLoadingPatents] = useState(false)
  const [loadingAI, setLoadingAI] = useState(false)

  const [selectedCorrelation, setSelectedCorrelation] = useState(0)

  // ─── Data Fetching ──────────────────────────

  const fetchSection = useCallback(async (section: string) => {
    try {
      const res = await fetch(`/api/market-intelligence?section=${section}`)
      if (!res.ok) return null
      return await res.json()
    } catch {
      return null
    }
  }, [])

  // Load overview + trends on mount
  useEffect(() => {
    async function loadInitial() {
      const [overviewData, trendsData] = await Promise.all([
        fetchSection("overview"),
        fetchSection("trends"),
      ])
      if (overviewData) {
        setKpis(overviewData.kpis || [])
        setEvents(overviewData.events || [])
      }
      if (trendsData) {
        setBotanicals(trendsData.botanicals || [])
      }
      setLoadingOverview(false)
      setLoadingTrends(false)
    }
    loadInitial()
  }, [fetchSection])

  // Lazy load on tab switch
  useEffect(() => {
    if (activeTab === "companies" && companies.length === 0 && !loadingCompanies) {
      setLoadingCompanies(true)
      fetchSection("companies").then((data) => {
        if (data) {
          setCompanies(data.companies || [])
          setCorrelation(data.correlation || [])
        }
        setLoadingCompanies(false)
      })
    }
    if (activeTab === "patents" && patents.length === 0 && !loadingPatents) {
      setLoadingPatents(true)
      fetchSection("patents").then((data) => {
        if (data) {
          setPatents(data.patents || [])
          setRegulatory(data.regulatory || [])
        }
        setLoadingPatents(false)
      })
    }
  }, [activeTab, companies.length, patents.length, loadingCompanies, loadingPatents, fetchSection])

  const runAIAnalysis = async () => {
    setLoadingAI(true)
    try {
      const res = await fetch("/api/market-intelligence/analyze", { method: "POST" })
      if (res.ok) {
        const data = await res.json()
        setAiAnalysis(data)
      }
    } catch {
      // silent
    }
    setLoadingAI(false)
  }

  // ─── Tab Config ─────────────────────────────

  const TABS: { id: TabId; label: string; labelTr: string; icon: typeof BarChart3 }[] = [
    { id: "overview", label: "Market Overview", labelTr: "Pazar Genel Bakış", icon: BarChart3 },
    { id: "trends", label: "Trending Botanicals", labelTr: "Trend Bitkiler", icon: TrendingUp },
    { id: "companies", label: "Company Tracker", labelTr: "Şirket Takibi", icon: Globe },
    { id: "patents", label: "Patent & Regulation", labelTr: "Patent & Regulasyon", icon: Scale },
    { id: "ai", label: "AI Analysis", labelTr: "AI Analiz", icon: Sparkles },
  ]

  // ─── Helpers ────────────────────────────────

  const eventTypeColor = (type: string) => {
    switch (type) {
      case "IPO": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
      case "M&A": return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
      case "Funding": return "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
      case "Partnership": return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const impactColor = (level: string) => {
    switch (level) {
      case "high": return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
      case "medium": return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
      case "low": return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  const confidenceColor = (c: string) => {
    switch (c) {
      case "high": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
      case "medium": return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
      case "low": return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case "Granted": case "Approved":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
      case "Filed": case "Pending":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
      case "Under Review":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const jurisdictionBadge = (j: string) => {
    switch (j) {
      case "USPTO": return "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
      case "EPO": return "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400"
      case "WIPO": return "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400"
      default: return "bg-gray-50 text-gray-600"
    }
  }

  // ─── Sector performance data for bar chart ──

  const sectorPerformanceData = [
    { sector: isTr ? "Takviyeler" : "Supplements", growth: 12.4, revenue: 18.2 },
    { sector: isTr ? "Bitkisel İlaç" : "Herbal Pharma", growth: 9.8, revenue: 8.6 },
    { sector: isTr ? "Fonksiyonel Gida" : "Functional Food", growth: 11.2, revenue: 10.4 },
    { sector: isTr ? "Kozmetik" : "Cosmeceuticals", growth: 7.5, revenue: 5.9 },
  ]

  // Public companies for the pie chart
  const pieData = companies
    .filter((c) => c.marketCapBillions > 0)
    .map((c) => ({ name: c.symbol || c.name.split(" ")[0], value: c.marketCapBillions }))

  // ─── Render ─────────────────────────────────

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      {/* Hero Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
          <Building2 className="h-7 w-7 text-primary" />
        </div>
        <h1 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
          {isTr ? "Pazar İstihbarat Merkezi" : "Market Intelligence Hub"}
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
          {isTr
            ? "Fitoterapi ve biyoteknoloji sektorunde yatirim odakli pazar verileri, trend analizi ve AI destekli içerikler."
            : "Investment-focused market data, trend analysis and AI-powered insights for the phytotherapy & biotech sector."}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8 flex justify-center overflow-x-auto">
        <div className="inline-flex rounded-xl bg-muted p-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-all sm:px-4 sm:text-sm ${
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {isTr ? tab.labelTr : tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════
          TAB 1: MARKET OVERVIEW
          ═══════════════════════════════════════ */}
      {activeTab === "overview" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {loadingOverview ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                {kpis.map((kpi, i) => {
                  const icons = [Leaf, TrendingUp, Beaker, FileText, Shield]
                  const Icon = icons[i] || Activity
                  return (
                    <div
                      key={i}
                      className="group rounded-xl border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span
                          className={`flex items-center gap-0.5 text-xs font-semibold ${
                            kpi.changeDirection === "up"
                              ? "text-emerald-600 dark:text-emerald-400"
                              : kpi.changeDirection === "down"
                              ? "text-red-500"
                              : "text-muted-foreground"
                          }`}
                        >
                          {kpi.changeDirection === "up" && <TrendingUp className="h-3 w-3" />}
                          {kpi.changeDirection === "down" && <TrendingDown className="h-3 w-3" />}
                          {kpi.change}
                        </span>
                      </div>
                      <div className="font-mono text-xl font-bold tracking-tight md:text-2xl">
                        {kpi.value}
                      </div>
                      <div className="mt-1 text-[11px] leading-tight text-muted-foreground">
                        {isTr ? kpi.labelTr : kpi.label}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Sector Performance Bar Chart */}
              <div className="rounded-xl border bg-card p-6">
                <h3 className="mb-4 flex items-center gap-2 font-semibold">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  {isTr ? "Sektor Performansi" : "Sector Performance"}
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sectorPerformanceData} barGap={8}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="sector" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar
                        dataKey="growth"
                        name={isTr ? "Büyüme (%)" : "Growth (%)"}
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="revenue"
                        name={isTr ? "Gelir ($B)" : "Revenue ($B)"}
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Sector Events Timeline */}
              <div className="rounded-xl border bg-card p-6">
                <h3 className="mb-5 flex items-center gap-2 font-semibold">
                  <Clock className="h-5 w-5 text-primary" />
                  {isTr ? "Sektör Olayları" : "Sector Events"}
                </h3>
                <div className="relative space-y-0">
                  {/* Vertical line */}
                  <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-border" />
                  {events.map((event, i) => (
                    <div key={i} className="relative flex gap-4 pb-5 last:pb-0">
                      {/* Dot */}
                      <div className="relative z-10 mt-1.5 h-[15px] w-[15px] flex-shrink-0 rounded-full border-2 border-primary bg-background" />
                      <div className="flex-1 rounded-lg border bg-background/50 p-3 transition-colors hover:bg-muted/30">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${eventTypeColor(event.type)}`}>
                            {event.type}
                          </span>
                          <span className="text-[11px] text-muted-foreground">{event.date}</span>
                          {event.valueBillions && (
                            <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                              ${event.valueBillions >= 1
                                ? `${event.valueBillions}B`
                                : `${Math.round(event.valueBillions * 1000)}M`}
                            </span>
                          )}
                        </div>
                        <div className="text-sm font-semibold">{event.company}</div>
                        <div className="text-xs text-muted-foreground">
                          {isTr ? event.detailTr : event.detail}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════
          TAB 2: TRENDING PHYTOCHEMICALS
          ═══════════════════════════════════════ */}
      {activeTab === "trends" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {loadingTrends ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Main Area Chart */}
              <div className="rounded-xl border bg-card p-6">
                <h3 className="mb-4 flex items-center gap-2 font-semibold">
                  <LineChart className="h-5 w-5 text-primary" />
                  {isTr ? "PubMed Yayın Trendi (12 Ay)" : "PubMed Publication Trends (12 Months)"}
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="month"
                        allowDuplicatedCategory={false}
                        tick={{ fontSize: 11 }}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      {botanicals.map((b, i) => (
                        <Area
                          key={b.name}
                          data={b.monthlyData}
                          type="monotone"
                          dataKey="publications"
                          name={b.name}
                          stroke={CHART_COLORS[i]}
                          fill={CHART_COLORS[i]}
                          fillOpacity={0.08}
                          strokeWidth={2}
                        />
                      ))}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Botanical Cards Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {botanicals.map((b, i) => {
                  const isEarlySignal = b.growthPercent > 100
                  return (
                    <div
                      key={b.name}
                      className={`group relative rounded-xl border bg-card p-4 transition-all hover:shadow-md ${
                        isEarlySignal ? "border-amber-300 dark:border-amber-700" : ""
                      }`}
                    >
                      {isEarlySignal && (
                        <div className="absolute -top-2.5 right-3 flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white shadow">
                          <Zap className="h-3 w-3" />
                          {isTr ? "Erken Sinyal" : "Early Signal"}
                        </div>
                      )}
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-bold">{b.name}</span>
                        <span
                          className={`font-mono text-sm font-bold ${
                            b.trendDirection === "up"
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-muted-foreground"
                          }`}
                        >
                          +{b.growthPercent}%
                        </span>
                      </div>
                      {/* Mini Sparkline */}
                      <div className="mb-3 h-12">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsLineChart data={b.monthlyData}>
                            <Line
                              type="monotone"
                              dataKey="publications"
                              stroke={CHART_COLORS[i]}
                              strokeWidth={2}
                              dot={false}
                            />
                          </RechartsLineChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>
                          {isTr ? "Yayın:" : "Pubs:"}{" "}
                          <span className="font-mono font-semibold text-foreground">
                            {b.pubmedCountCurrent.toLocaleString()}
                          </span>
                        </span>
                        <span>
                          {isTr ? "Pazar:" : "Market:"}{" "}
                          <span className="font-mono font-semibold text-foreground">
                            ${b.marketSizeBillions}B
                          </span>
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════
          TAB 3: COMPANY TRACKER
          ═══════════════════════════════════════ */}
      {activeTab === "companies" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {loadingCompanies ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Company Table */}
              <div className="rounded-xl border bg-card">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50 text-left">
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {isTr ? "Şirket" : "Company"}
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {isTr ? "Fiyat" : "Price"}
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {isTr ? "Değişim" : "Change"}
                        </th>
                        <th className="hidden px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">
                          {isTr ? "Pazar Deg." : "Mkt Cap"}
                        </th>
                        <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:table-cell">
                          {isTr ? "52H Aralık" : "52W Range"}
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {isTr ? "Durum" : "Status"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {companies.map((c, i) => {
                        const rangePercent =
                          c.week52High > 0
                            ? ((c.currentPrice - c.week52Low) / (c.week52High - c.week52Low)) * 100
                            : 0
                        return (
                          <tr key={i} className="border-b transition-colors hover:bg-muted/30">
                            <td className="px-4 py-3">
                              <div className="font-semibold">{c.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {c.symbol} {c.exchange !== "N/A" ? `| ${c.exchange}` : ""}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-semibold">
                              {c.currentPrice > 0 ? `$${c.currentPrice.toFixed(2)}` : "---"}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {c.currentPrice > 0 ? (
                                <span
                                  className={`font-mono font-semibold ${
                                    c.dailyChangePercent >= 0
                                      ? "text-emerald-600 dark:text-emerald-400"
                                      : "text-red-500"
                                  }`}
                                >
                                  {c.dailyChangePercent >= 0 ? "+" : ""}
                                  {c.dailyChangePercent.toFixed(2)}%
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">N/A</span>
                              )}
                            </td>
                            <td className="hidden px-4 py-3 text-right font-mono font-semibold md:table-cell">
                              ${c.marketCapBillions >= 1
                                ? `${c.marketCapBillions}B`
                                : `${Math.round(c.marketCapBillions * 1000)}M`}
                            </td>
                            <td className="hidden px-4 py-3 lg:table-cell">
                              {c.week52High > 0 ? (
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-[10px] text-muted-foreground">
                                    ${c.week52Low.toFixed(0)}
                                  </span>
                                  <div className="relative h-2 w-20 overflow-hidden rounded-full bg-muted">
                                    <div
                                      className="absolute left-0 top-0 h-full rounded-full bg-primary"
                                      style={{ width: `${Math.min(rangePercent, 100)}%` }}
                                    />
                                  </div>
                                  <span className="font-mono text-[10px] text-muted-foreground">
                                    ${c.week52High.toFixed(0)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">---</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                  c.ipoStatus === "Public"
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                                    : c.ipoStatus === "Pre-IPO"
                                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                                }`}
                              >
                                {c.ipoStatus}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Charts Row: Pie + Correlation */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Market Cap Distribution Pie */}
                <div className="rounded-xl border bg-card p-6">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
                    <Activity className="h-4 w-4 text-primary" />
                    {isTr ? "Pazar Değeri Dağılımı" : "Market Cap Distribution"}
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          innerRadius={45}
                          paddingAngle={2}
                          label={({ name, value }) => `${name} $${value}B`}
                          labelLine={{ strokeWidth: 1 }}
                        >
                          {pieData.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: 8,
                            fontSize: 12,
                          }}
                          formatter={(value) => [`$${value}B`, isTr ? "Pazar Değeri" : "Market Cap"] as [string, string]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Correlation Chart */}
                <div className="rounded-xl border bg-card p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-sm font-semibold">
                      <Search className="h-4 w-4 text-primary" />
                      {isTr ? "Arama Hacmi vs Hisse Fiyati" : "Search Volume vs Stock Price"}
                    </h3>
                    {correlation.length > 0 && (
                      <div className="flex gap-1">
                        {correlation.map((c, i) => (
                          <button
                            key={c.symbol}
                            onClick={() => setSelectedCorrelation(i)}
                            className={`rounded px-2 py-0.5 text-[10px] font-bold transition-all ${
                              selectedCorrelation === i
                                ? "bg-primary text-white"
                                : "bg-muted text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {c.symbol}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {correlation.length > 0 && (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={correlation[selectedCorrelation].data}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                          <YAxis
                            yAxisId="left"
                            tick={{ fontSize: 11 }}
                            stroke="hsl(var(--muted-foreground))"
                            label={{ value: isTr ? "Arama" : "Search", angle: -90, position: "insideLeft", fontSize: 10 }}
                          />
                          <YAxis
                            yAxisId="right"
                            orientation="right"
                            tick={{ fontSize: 11 }}
                            stroke="hsl(var(--muted-foreground))"
                            label={{ value: isTr ? "Fiyat ($)" : "Price ($)", angle: 90, position: "insideRight", fontSize: 10 }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: 8,
                              fontSize: 12,
                            }}
                          />
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                          <Bar
                            yAxisId="left"
                            dataKey="searchVolume"
                            name={isTr ? "Google Trends" : "Google Trends"}
                            fill="#8b5cf6"
                            fillOpacity={0.6}
                            radius={[2, 2, 0, 0]}
                          />
                          <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="stockPrice"
                            name={isTr ? "Hisse Fiyati" : "Stock Price"}
                            stroke="#10b981"
                            strokeWidth={2.5}
                            dot={{ fill: "#10b981", r: 3 }}
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════
          TAB 4: PATENT & REGULATION
          ═══════════════════════════════════════ */}
      {activeTab === "patents" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {loadingPatents ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Summary Stat Cards */}
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  {
                    label: isTr ? "Toplam Patent" : "Total Patents",
                    value: patents.length.toString(),
                    icon: FileText,
                    color: "text-blue-500",
                  },
                  {
                    label: isTr ? "Onaylanan" : "Granted",
                    value: patents.filter((p) => p.status === "Granted").length.toString(),
                    icon: CheckCircle2,
                    color: "text-emerald-500",
                  },
                  {
                    label: isTr ? "Inceleme Altinda" : "Under Review",
                    value: patents.filter((p) => p.status === "Under Review").length.toString(),
                    icon: Clock,
                    color: "text-amber-500",
                  },
                  {
                    label: isTr ? "Regülasyon Güncelleme" : "Regulatory Updates",
                    value: regulatory.length.toString(),
                    icon: Scale,
                    color: "text-violet-500",
                  },
                ].map((stat, i) => (
                  <div key={i} className="rounded-xl border bg-card p-4">
                    <stat.icon className={`mb-2 h-5 w-5 ${stat.color}`} />
                    <div className="font-mono text-2xl font-bold">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Patent List */}
              <div className="rounded-xl border bg-card">
                <div className="border-b px-5 py-3">
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <FileText className="h-4 w-4 text-primary" />
                    {isTr ? "Son Patent Başvurulari" : "Recent Patent Filings"}
                  </h3>
                </div>
                <div className="divide-y">
                  {patents.map((p) => (
                    <div key={p.id} className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-muted/30">
                      <ChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold leading-snug">
                          {isTr ? p.titleTr : p.title}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          <span className="text-xs text-muted-foreground">{p.company}</span>
                          <span className="text-muted-foreground">|</span>
                          <span className="text-xs text-muted-foreground">{p.filingDate}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${jurisdictionBadge(p.jurisdiction)}`}>
                            {p.jurisdiction}
                          </span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusBadge(p.status)}`}>
                            {p.status}
                          </span>
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                            {p.botanical}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Regulatory Updates */}
              <div>
                <h3 className="mb-4 flex items-center gap-2 font-semibold">
                  <Shield className="h-5 w-5 text-primary" />
                  {isTr ? "Regülasyon Güncellemeleri" : "Regulatory Updates"}
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {regulatory.map((r) => (
                    <div key={r.id} className="rounded-xl border bg-card p-4 transition-all hover:shadow-md">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                          {r.agency}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${impactColor(r.impactLevel)}`}>
                          {r.impactLevel === "high"
                            ? (isTr ? "Yüksek Etki" : "High Impact")
                            : r.impactLevel === "medium"
                            ? (isTr ? "Orta Etki" : "Medium Impact")
                            : (isTr ? "Düşük Etki" : "Low Impact")}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusBadge(r.status)}`}>
                          {r.status}
                        </span>
                      </div>
                      <h4 className="mb-1 text-sm font-semibold">{isTr ? r.titleTr : r.title}</h4>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {isTr ? r.summaryTr : r.summary}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span>{r.type}</span>
                        <span>|</span>
                        <span>{r.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════
          TAB 5: AI ANALYSIS
          ═══════════════════════════════════════ */}
      {activeTab === "ai" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {!aiAnalysis && !loadingAI && (
            <div className="rounded-xl border bg-gradient-to-br from-primary/5 to-violet-500/5 p-10 text-center">
              <Sparkles className="mx-auto mb-4 h-12 w-12 text-primary opacity-80" />
              <h3 className="mb-2 text-xl font-bold">
                {isTr ? "AI Pazar Analizi" : "AI Market Analysis"}
              </h3>
              <p className="mx-auto mb-6 max-w-lg text-sm text-muted-foreground">
                {isTr
                  ? "Gemini AI, en son botanik yayin trendlerini, sirket verilerini ve regulasyon değişikliklerini analiz ederek yatirim sinyalleri uretir."
                  : "Gemini AI analyzes the latest botanical publication trends, company data and regulatory changes to generate investment-relevant signals."}
              </p>
              <button
                onClick={runAIAnalysis}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-primary/90 hover:shadow-lg active:scale-[0.98]"
              >
                <Zap className="h-4 w-4" />
                {isTr ? "Analiz Oluştur" : "Generate Analysis"}
              </button>
            </div>
          )}

          {loadingAI && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                {isTr ? "AI analiz ediliyor..." : "AI analyzing market data..."}
              </p>
            </div>
          )}

          {aiAnalysis && !loadingAI && (
            <>
              {/* Early Signals */}
              <div>
                <h3 className="mb-4 flex items-center gap-2 font-semibold">
                  <Zap className="h-5 w-5 text-amber-500" />
                  {isTr ? "Erken Sinyaller" : "Early Signals"}
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {aiAnalysis.earlySignals.map((s, i) => (
                    <div key={i} className="rounded-xl border bg-card p-4 transition-all hover:shadow-md">
                      <div className="mb-2 flex items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${confidenceColor(s.confidence)}`}>
                          {s.confidence === "high"
                            ? (isTr ? "Yüksek Guven" : "High Confidence")
                            : s.confidence === "medium"
                            ? (isTr ? "Orta Guven" : "Medium Confidence")
                            : (isTr ? "Düşük Guven" : "Low Confidence")}
                        </span>
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                          {s.botanical}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">
                        {isTr ? (s.signalTr || s.signal) : s.signal}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sector Outlook — Bullish/Bearish Split */}
              <div className="rounded-xl border bg-card p-6">
                <h3 className="mb-3 flex items-center gap-2 font-semibold">
                  <ArrowUpRight className="h-5 w-5 text-primary" />
                  {isTr ? "Sektor Gorunumu" : "Sector Outlook"}
                </h3>
                <p className="mb-5 text-sm text-muted-foreground">
                  {isTr
                    ? (aiAnalysis.sectorOutlook.summaryTr || aiAnalysis.sectorOutlook.summary)
                    : aiAnalysis.sectorOutlook.summary}
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Bullish */}
                  <div className="rounded-lg bg-emerald-50 p-4 dark:bg-emerald-950/20">
                    <h4 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-emerald-700 dark:text-emerald-400">
                      <TrendingUp className="h-4 w-4" />
                      {isTr ? "Yukselis Faktorleri" : "Bullish Factors"}
                    </h4>
                    <ul className="space-y-1.5">
                      {(isTr
                        ? (aiAnalysis.sectorOutlook.bullishFactorsTr || aiAnalysis.sectorOutlook.bullishFactors)
                        : aiAnalysis.sectorOutlook.bullishFactors
                      ).map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs">
                          <CheckCircle2 className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-600" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Bearish */}
                  <div className="rounded-lg bg-red-50 p-4 dark:bg-red-950/20">
                    <h4 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-red-700 dark:text-red-400">
                      <TrendingDown className="h-4 w-4" />
                      {isTr ? "Dusus Faktorleri" : "Bearish Factors"}
                    </h4>
                    <ul className="space-y-1.5">
                      {(isTr
                        ? (aiAnalysis.sectorOutlook.bearishFactorsTr || aiAnalysis.sectorOutlook.bearishFactors)
                        : aiAnalysis.sectorOutlook.bearishFactors
                      ).map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs">
                          <AlertTriangle className="mt-0.5 h-3 w-3 flex-shrink-0 text-red-500" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Risk Alerts */}
              <div>
                <h3 className="mb-4 flex items-center gap-2 font-semibold">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  {isTr ? "Risk Uyarılari" : "Risk Alerts"}
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {aiAnalysis.riskAlerts.map((r, i) => (
                    <div
                      key={i}
                      className={`rounded-xl border-l-4 bg-card p-4 ${
                        r.severity === "high"
                          ? "border-l-red-500"
                          : r.severity === "medium"
                          ? "border-l-amber-500"
                          : "border-l-gray-400"
                      }`}
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${impactColor(r.severity)}`}>
                          {r.severity}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{r.sector}</span>
                      </div>
                      <p className="text-sm leading-relaxed">
                        {isTr ? (r.riskTr || r.risk) : r.risk}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Re-run Button */}
              <div className="text-center">
                <button
                  onClick={runAIAnalysis}
                  className="inline-flex items-center gap-2 rounded-lg border px-5 py-2 text-xs font-medium text-muted-foreground transition-all hover:border-primary hover:text-primary"
                >
                  <FlaskConical className="h-3.5 w-3.5" />
                  {isTr ? "Yeniden Analiz Et" : "Re-run Analysis"}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-10 rounded-xl border bg-muted/30 p-5 text-center text-xs text-muted-foreground">
        {isTr
          ? "Bu sayfadaki pazar verileri ve sirket bilgileri kamuya acik kaynaklardan derlenmis tahmini degerlerdir. Yatirim tavsiyesi niteliginde degildir. Yatirim kararlarinizda profesyonel danışmanlık aliniz."
          : "Market data and company information on this page are estimates compiled from public sources. This does not constitute investment advice. Seek professional guidance for investment decisions."}
      </div>
    </div>
  )
}
