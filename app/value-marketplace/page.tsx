// © 2026 DoctoPal — All Rights Reserved
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck, TrendingUp, ArrowUpDown, Star, Award, Clock,
  ChevronDown, ChevronRight, Lock, Banknote, BarChart3, Target,
  CheckCircle2, XCircle, ArrowLeft, Loader2, ShoppingCart,
  FileCheck, Users, Sparkles, BadgePercent, CircleDollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell,
} from "recharts";
import type {
  SupplementProduct, EscrowAccount, ValueScoreBreakdown,
  RiskRewardTier, ProviderLeaderboard,
} from "@/lib/value-marketplace-data";

// ── Tabs ──────────────────────────────────────────
type Tab = "marketplace" | "detail" | "escrow" | "risk";

const TABS: { key: Tab; labelKey: string; icon: React.ReactNode }[] = [
  { key: "marketplace", labelKey: "value.marketplace", icon: <ShoppingCart className="w-4 h-4" /> },
  { key: "detail", labelKey: "value.productDetail", icon: <BarChart3 className="w-4 h-4" /> },
  { key: "escrow", labelKey: "value.escrow", icon: <Lock className="w-4 h-4" /> },
  { key: "risk", labelKey: "value.riskReward", icon: <Award className="w-4 h-4" /> },
];

type SortKey = "valueScore" | "standardPrice" | "successRate" | "evidenceGrade";

// ── Value Score Gauge ─────────────────────────────
function ScoreGauge({ score, size = 72 }: { score: number; size?: number }) {
  const color = score >= 85 ? "#22c55e" : score >= 70 ? "#eab308" : "#f97316";
  const circumference = 2 * Math.PI * 28;
  const filled = (score / 100) * circumference;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
        <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4"
          className="text-gray-200 dark:text-gray-700" />
        <circle cx="32" cy="32" r="28" fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={`${filled} ${circumference}`}
          strokeLinecap="round" />
      </svg>
      <span className="absolute text-sm font-bold font-mono" style={{ color }}>{score}</span>
    </div>
  );
}

// ── Evidence Badge ────────────────────────────────
function EvidenceBadge({ grade }: { grade: "A" | "B" | "C" }) {
  const styles: Record<string, string> = {
    A: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700",
    B: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-300 dark:border-amber-700",
    C: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-300 dark:border-red-700",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${styles[grade]}`}>
      Grade {grade}
    </span>
  );
}

// ── Status Badge ──────────────────────────────────
function StatusBadge({ status, isTr }: { status: EscrowAccount["status"]; isTr: boolean }) {
  const map: Record<string, { label: string; cls: string }> = {
    active: {
      label: isTr ? "Aktif" : "Active",
      cls: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
    },
    completed: {
      label: isTr ? "Tamamlandi" : "Completed",
      cls: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    },
    refunded: {
      label: isTr ? "Iade Edildi" : "Refunded",
      cls: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
    },
    partial_refund: {
      label: isTr ? "Kismi Iade" : "Partial Refund",
      cls: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    },
  };
  const m = map[status] || map.active;
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${m.cls}`}>{m.label}</span>;
}

// ═══════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════
export default function ValueMarketplacePage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { lang } = useLang();
  const isTr = lang === "tr";

  const [tab, setTab] = useState<Tab>("marketplace");
  const [products, setProducts] = useState<SupplementProduct[]>([]);
  const [rankings, setRankings] = useState<ValueScoreBreakdown[]>([]);
  const [escrowAccounts, setEscrowAccounts] = useState<EscrowAccount[]>([]);
  const [tiers, setTiers] = useState<RiskRewardTier[]>([]);
  const [leaderboard, setLeaderboard] = useState<ProviderLeaderboard[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<SupplementProduct | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>("valueScore");
  const [loading, setLoading] = useState(true);
  const [formulaOpen, setFormulaOpen] = useState(false);
  const [purchaseToast, setPurchaseToast] = useState<string | null>(null);

  // ── Fetch Data ──────────────────────────────────
  const fetchSection = useCallback(async (section: string) => {
    try {
      const res = await fetch(`/api/value-marketplace?section=${section}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [prodData, rankData, escrowData, rrData] = await Promise.all([
        fetchSection("products"),
        fetchSection("rankings"),
        fetchSection("escrow"),
        fetchSection("risk-reward"),
      ]);
      if (cancelled) return;
      if (prodData?.products) setProducts(prodData.products);
      if (rankData?.rankings) setRankings(rankData.rankings);
      if (escrowData?.escrowAccounts) setEscrowAccounts(escrowData.escrowAccounts);
      if (rrData?.tiers) setTiers(rrData.tiers);
      if (rrData?.leaderboard) setLeaderboard(rrData.leaderboard);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [fetchSection]);

  // ── Sort Products ───────────────────────────────
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "valueScore": return b.valueScore - a.valueScore;
      case "standardPrice": return a.standardPrice - b.standardPrice;
      case "successRate": return b.successRate - a.successRate;
      case "evidenceGrade": {
        const order = { A: 0, B: 1, C: 2 };
        return order[a.evidenceGrade] - order[b.evidenceGrade];
      }
      default: return 0;
    }
  });

  // ── Purchase mock ───────────────────────────────
  function handlePurchase(product: SupplementProduct, type: string) {
    const label = isTr ? product.nameTr : product.name;
    setPurchaseToast(`${label} — ${type}`);
    setTimeout(() => setPurchaseToast(null), 3000);
  }

  // ── Auth gate ───────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <ShieldCheck className="w-16 h-16 mx-auto mb-4 text-emerald-500" />
          <h1 className="text-2xl font-bold mb-2">{tx("value.title", lang)}</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{tx("value.loginRequired", lang)}</p>
          <a href="/auth/login"><Button>{tx("nav.login", lang)}</Button></a>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Toast */}
      {purchaseToast && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-2 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium">{tx("value.success", lang)} {purchaseToast}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
              <CircleDollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {tx("value.title", lang)}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {tx("value.subtitle", lang)}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800/60 rounded-xl p-1 mb-8 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                if (t.key === "detail" && !selectedProduct) return;
                setTab(t.key);
              }}
              disabled={t.key === "detail" && !selectedProduct}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all
                ${tab === t.key
                  ? "bg-white dark:bg-gray-700 text-emerald-700 dark:text-emerald-300 shadow-sm"
                  : t.key === "detail" && !selectedProduct
                    ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
            >
              {t.icon}
              {tx(t.labelKey, lang)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : (
          <>
            {/* ════ TAB 1: MARKETPLACE ════ */}
            {tab === "marketplace" && (
              <div>
                {/* Sort Controls */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    <ArrowUpDown className="w-4 h-4 inline mr-1" />
                    {tx("value.sortBy", lang)}:
                  </span>
                  {([
                    { key: "valueScore" as SortKey, label: tx("value.sortValueScore", lang) },
                    { key: "standardPrice" as SortKey, label: tx("value.sortPrice", lang) },
                    { key: "successRate" as SortKey, label: tx("value.sortSuccessRate", lang) },
                    { key: "evidenceGrade" as SortKey, label: tx("value.sortEvidence", lang) },
                  ]).map((s) => (
                    <button
                      key={s.key}
                      onClick={() => setSortBy(s.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border
                        ${sortBy === s.key
                          ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700"
                          : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-emerald-300"
                        }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
                  {sortedProducts.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white dark:bg-gray-800/70 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-700 transition-all group"
                    >
                      <div className="flex items-start gap-4">
                        {/* Score Gauge */}
                        <ScoreGauge score={p.valueScore} />

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{p.icon}</span>
                            <h3 className="font-bold text-gray-900 dark:text-white truncate">
                              {isTr ? p.nameTr : p.name}
                            </h3>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            {p.brand} &middot; {isTr ? p.categoryTr : p.category}
                          </p>

                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <EvidenceBadge grade={p.evidenceGrade} />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {p.rctCount} RCTs
                            </span>
                            {p.guaranteeAvailable && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                <ShieldCheck className="w-3 h-3" />
                                {tx("value.guarantee", lang)}
                              </span>
                            )}
                          </div>

                          {/* Success Rate Bar */}
                          <div className="mb-3">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-500 dark:text-gray-400">{tx("value.successRate", lang)}</span>
                              <span className="font-bold text-gray-700 dark:text-gray-200">{p.successRate}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all"
                                style={{ width: `${p.successRate}%` }}
                              />
                            </div>
                          </div>

                          {/* Pricing */}
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-sm text-gray-400 line-through font-mono">
                              {p.standardPrice} TL
                            </span>
                            <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                              {p.outcomeBasedPrice > 0 ? p.outcomeBasedPrice : Math.round(p.standardPrice * (1 - p.valuePricingDiscount / 100))} TL
                            </span>
                            <span className="text-xs font-semibold bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">
                              -{p.valuePricingDiscount}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                        onClick={() => { setSelectedProduct(p); setTab("detail"); }}
                      >
                        {tx("value.viewDetails", lang)}
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Value Score Formula */}
                <div className="bg-white dark:bg-gray-800/70 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <button
                    onClick={() => setFormulaOpen(!formulaOpen)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left"
                  >
                    <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-500" />
                      {tx("value.formula", lang)}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${formulaOpen ? "rotate-180" : ""}`} />
                  </button>
                  {formulaOpen && (
                    <div className="px-6 pb-5 border-t border-gray-100 dark:border-gray-700 pt-4">
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 font-mono text-sm">
                        <p className="text-emerald-600 dark:text-emerald-400 font-bold mb-2">Value Score =</p>
                        <p className="ml-4 text-gray-700 dark:text-gray-300">
                          (Clinical Efficacy &times; <span className="text-blue-500">0.40</span>)
                        </p>
                        <p className="ml-4 text-gray-700 dark:text-gray-300">
                          + (Safety Profile &times; <span className="text-blue-500">0.30</span>)
                        </p>
                        <p className="ml-4 text-gray-700 dark:text-gray-300">
                          + (Patient Outcomes &times; <span className="text-blue-500">0.20</span>)
                        </p>
                        <p className="ml-4 text-gray-700 dark:text-gray-300">
                          + (Cost Efficiency &times; <span className="text-blue-500">0.10</span>)
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                        {tx("value.formulaDesc", lang)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ════ TAB 2: PRODUCT DETAIL ════ */}
            {tab === "detail" && selectedProduct && (
              <div>
                <button
                  onClick={() => setTab("marketplace")}
                  className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-emerald-600 mb-6 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {tx("value.backToMarketplace", lang)}
                </button>

                {/* Hero */}
                <div className="bg-white dark:bg-gray-800/70 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-4xl">{selectedProduct.icon}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {isTr ? selectedProduct.nameTr : selectedProduct.name}
                      </h2>
                      <p className="text-gray-500 dark:text-gray-400">
                        {selectedProduct.brand} &middot; {isTr ? selectedProduct.categoryTr : selectedProduct.category}
                      </p>
                    </div>
                    <div className="ml-auto">
                      <ScoreGauge score={selectedProduct.valueScore} size={96} />
                    </div>
                  </div>
                </div>

                {/* Radar Chart — Value Score Breakdown */}
                <div className="bg-white dark:bg-gray-800/70 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-emerald-500" />
                    {tx("value.scoreBreakdown", lang)}
                  </h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart
                        data={[
                          { axis: tx("value.efficacy", lang), value: selectedProduct.clinicalEfficacy, fullMark: 100 },
                          { axis: tx("value.safety", lang), value: selectedProduct.safetyProfile, fullMark: 100 },
                          { axis: tx("value.outcomes", lang), value: selectedProduct.patientOutcomeScore, fullMark: 100 },
                          { axis: tx("value.costEff", lang), value: Math.round(100 - selectedProduct.costPerQALY / 50), fullMark: 100 },
                          { axis: tx("value.evidence", lang), value: selectedProduct.evidenceGrade === "A" ? 95 : selectedProduct.evidenceGrade === "B" ? 70 : 45, fullMark: 100 },
                        ]}
                      >
                        <PolarGrid stroke="#374151" strokeOpacity={0.3} />
                        <PolarAngleAxis dataKey="axis" tick={{ fontSize: 12, fill: "#9ca3af" }} />
                        <Radar name="Score" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.25} strokeWidth={2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Clinical Evidence */}
                <div className="bg-white dark:bg-gray-800/70 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-blue-500" />
                    {tx("value.clinicalEvidence", lang)}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: tx("value.rctCount", lang), value: selectedProduct.rctCount.toString(), sub: tx("value.studies", lang) },
                      { label: tx("value.successRate", lang), value: `${selectedProduct.successRate}%`, sub: tx("value.targetOutcome", lang) },
                      { label: tx("value.avgImprovement", lang), value: `${selectedProduct.avgImprovementPercent}%`, sub: tx("value.improvement", lang) },
                      { label: tx("value.timeToEffect", lang), value: isTr ? selectedProduct.timeToEffectTr : selectedProduct.timeToEffect, sub: "" },
                    ].map((item, i) => (
                      <div key={i} className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{item.label}</p>
                        <p className="text-xl font-bold font-mono text-gray-900 dark:text-white">{item.value}</p>
                        {item.sub && <p className="text-xs text-gray-400">{item.sub}</p>}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <EvidenceBadge grade={selectedProduct.evidenceGrade} />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedProduct.evidenceGrade === "A"
                        ? tx("value.evidenceGradeA", lang)
                        : selectedProduct.evidenceGrade === "B"
                          ? tx("value.evidenceGradeB", lang)
                          : tx("value.evidenceGradeC", lang)
                      }
                    </span>
                  </div>
                </div>

                {/* Payment Options */}
                <div className="mb-6">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Banknote className="w-5 h-5 text-amber-500" />
                    {tx("value.paymentOptions", lang)}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Standard */}
                    <div className="bg-white dark:bg-gray-800/70 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 flex flex-col">
                      <h4 className="font-bold text-gray-900 dark:text-white mb-1">{tx("value.standardPrice", lang)}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                        {tx("value.noGuarantee", lang)}
                      </p>
                      <p className="text-3xl font-bold font-mono text-gray-900 dark:text-white mb-4">
                        {selectedProduct.standardPrice} <span className="text-base font-normal">TL</span>
                      </p>
                      <div className="mt-auto">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => handlePurchase(selectedProduct, tx("value.standardLabel", lang))}
                        >
                          {tx("value.buyStandard", lang)}
                        </Button>
                      </div>
                    </div>

                    {/* Value-Based */}
                    <div className="bg-white dark:bg-gray-800/70 rounded-2xl border-2 border-blue-300 dark:border-blue-700 p-5 flex flex-col relative">
                      <div className="absolute -top-3 left-4">
                        <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          -{selectedProduct.valuePricingDiscount}%
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-900 dark:text-white mb-1">{tx("value.valuePrice", lang)}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                        {tx("value.aceDiscount", lang)}
                      </p>
                      <p className="text-3xl font-bold font-mono text-blue-600 dark:text-blue-400 mb-1">
                        {Math.round(selectedProduct.standardPrice * (1 - selectedProduct.valuePricingDiscount / 100))} <span className="text-base font-normal">TL</span>
                      </p>
                      <p className="text-xs text-gray-400 line-through font-mono mb-4">{selectedProduct.standardPrice} TL</p>
                      <div className="mt-auto">
                        <Button
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                          onClick={() => handlePurchase(selectedProduct, tx("value.valuePriceLabel", lang))}
                        >
                          {tx("value.buyValue", lang)}
                        </Button>
                      </div>
                    </div>

                    {/* Outcome-Based */}
                    <div className="bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-900/20 dark:to-gray-800/70 rounded-2xl border-2 border-emerald-400 dark:border-emerald-600 p-5 flex flex-col relative shadow-lg">
                      <div className="absolute -top-3 left-4">
                        <span className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          {tx("value.guarantee", lang)}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-900 dark:text-white mb-1">{tx("value.outcomePrice", lang)}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        {tx("value.outcomeGuarantee", lang)}
                      </p>
                      <p className="text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mb-2">
                        {selectedProduct.outcomeBasedPrice} <span className="text-base font-normal">TL</span>
                      </p>

                      <div className="space-y-2 text-xs mb-4">
                        <div className="flex items-start gap-2">
                          <Target className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600 dark:text-gray-300">
                            {isTr ? selectedProduct.guaranteeCriteriaTr : selectedProduct.guaranteeCriteria}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                          <span className="text-gray-600 dark:text-gray-300">
                            {tx("value.escrowPeriod", lang)}: {selectedProduct.escrowPeriod} {tx("value.daysUnit", lang)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BadgePercent className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                          <span className="text-gray-600 dark:text-gray-300">
                            {tx("value.refundPercent", lang)}: {selectedProduct.refundPercent}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Lock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                          <span className="text-gray-600 dark:text-gray-300">
                            {tx("value.smartContract", lang)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-auto">
                        <Button
                          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg"
                          onClick={() => handlePurchase(selectedProduct, tx("value.outcomeBased", lang))}
                          disabled={!selectedProduct.guaranteeAvailable}
                        >
                          <ShieldCheck className="w-4 h-4 mr-1" />
                          {tx("value.buyOutcome", lang)}
                        </Button>
                        {!selectedProduct.guaranteeAvailable && (
                          <p className="text-xs text-gray-400 text-center mt-2">
                            {tx("value.guaranteeNotAvailable", lang)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ════ TAB 3: ESCROW ACCOUNTS ════ */}
            {tab === "escrow" && (
              <div>
                {/* How It Works */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800 p-6 mb-8">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    {tx("value.howItWorks", lang)}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    {[
                      { step: 1, icon: <ShoppingCart className="w-5 h-5" />, text: tx("value.step1", lang) },
                      { step: 2, icon: <TrendingUp className="w-5 h-5" />, text: tx("value.step2", lang) },
                      { step: 3, icon: <Sparkles className="w-5 h-5" />, text: tx("value.step3", lang) },
                      { step: 4, icon: <CheckCircle2 className="w-5 h-5" />, text: tx("value.step4", lang) },
                    ].map((s) => (
                      <div key={s.step} className="flex flex-col items-center text-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm">
                          {s.step}
                        </div>
                        <div className="text-emerald-600 dark:text-emerald-400">{s.icon}</div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{s.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Escrow List */}
                {escrowAccounts.length === 0 ? (
                  <div className="text-center py-16 text-gray-400 dark:text-gray-500">
                    <Lock className="w-12 h-12 mx-auto mb-3" />
                    <p>{tx("value.noEscrow", lang)}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {escrowAccounts.map((esc) => (
                      <div key={esc.id} className="bg-white dark:bg-gray-800/70 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                          <div>
                            <h4 className="font-bold text-gray-900 dark:text-white">
                              {isTr ? esc.productNameTr : esc.productName}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{esc.id}</p>
                          </div>
                          <StatusBadge status={esc.status} isTr={isTr} />
                        </div>

                        {/* Amount breakdown */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400">{tx("value.held", lang)}</p>
                            <p className="text-lg font-bold font-mono text-blue-600 dark:text-blue-400">{esc.heldAmount} TL</p>
                          </div>
                          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400">{tx("value.released", lang)}</p>
                            <p className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">{esc.releasedAmount} TL</p>
                          </div>
                          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400">{tx("value.refunded", lang)}</p>
                            <p className="text-lg font-bold font-mono text-red-600 dark:text-red-400">{esc.refundedAmount} TL</p>
                          </div>
                        </div>

                        {/* KPI Targets */}
                        <div className="mb-4">
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{tx("value.kpiTargets", lang)}</p>
                          <div className="space-y-3">
                            {esc.kpiTargets.map((kpi, i) => {
                              const progress = kpi.actual !== undefined
                                ? Math.min(100, Math.max(0, ((kpi.baseline - (kpi.actual ?? kpi.baseline)) / (kpi.baseline - kpi.target)) * 100))
                                : 0;
                              return (
                                <div key={i}>
                                  <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-600 dark:text-gray-400">{isTr ? kpi.metricTr : kpi.metric}</span>
                                    <span className="font-mono text-gray-500">
                                      {tx("value.baseline", lang)}: {kpi.baseline} &rarr; {tx("value.target", lang)}: {kpi.target}
                                      {kpi.actual !== undefined && (
                                        <> &rarr; <span className={kpi.met ? "text-emerald-500 font-bold" : "text-red-500 font-bold"}>
                                          {tx("value.actual", lang)}: {kpi.actual}
                                        </span></>
                                      )}
                                      {" "}{kpi.unit}
                                    </span>
                                  </div>
                                  <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all ${
                                        kpi.met === true ? "bg-emerald-500" : kpi.met === false ? "bg-red-400" : "bg-blue-400"
                                      }`}
                                      style={{ width: `${Math.max(5, progress)}%` }}
                                    />
                                  </div>
                                  {kpi.met !== undefined && (
                                    <div className="flex items-center gap-1 mt-1">
                                      {kpi.met ? (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                      ) : (
                                        <XCircle className="w-3.5 h-3.5 text-red-400" />
                                      )}
                                      <span className={`text-xs font-medium ${kpi.met ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
                                        {kpi.met ? tx("value.targetMet", lang) : tx("value.targetNotMet", lang)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Timeline + Hash */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {esc.startDate} &rarr; {esc.evaluationDate}
                          </span>
                          {esc.smartContractHash && (
                            <span className="flex items-center gap-1 font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                              <Lock className="w-3 h-3" />
                              {esc.smartContractHash}
                            </span>
                          )}
                        </div>

                        {/* Status Flow */}
                        <div className="mt-4 flex items-center gap-2 text-xs">
                          {["Purchased", "Monitoring", "Evaluated", esc.status === "completed" || esc.status === "partial_refund" || esc.status === "refunded" ? (esc.refundedAmount > 0 ? "Refunded" : "Released") : "Pending"].map((step, i, arr) => {
                            const isActive = (esc.status === "active" && i <= 1) ||
                              (esc.status !== "active" && i <= 3);
                            return (
                              <span key={i} className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full font-medium ${
                                  isActive
                                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                                    : "bg-gray-100 dark:bg-gray-700 text-gray-400"
                                }`}>
                                  {step}
                                </span>
                                {i < arr.length - 1 && <ChevronRight className="w-3 h-3 text-gray-300" />}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ════ TAB 4: RISK & REWARD ════ */}
            {tab === "risk" && (
              <div>
                {/* Risk/Reward Tiers */}
                <div className="bg-white dark:bg-gray-800/70 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    {tx("value.riskRewardTiers", lang)}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
                    {tiers.map((tier, i) => (
                      <div
                        key={i}
                        className="rounded-xl border-2 p-4 text-center transition-all hover:shadow-md"
                        style={{ borderColor: tier.color }}
                      >
                        {tier.badge && <span className="text-2xl">{tier.badge}</span>}
                        <p className="font-bold text-gray-900 dark:text-white text-sm mt-1">
                          {isTr ? tier.labelTr : tier.label}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {tier.minSuccess}% - {tier.maxSuccess}% {tx("value.success2", lang)}
                        </p>
                        <p className="text-2xl font-bold font-mono mt-2" style={{ color: tier.color }}>
                          +{tier.bonusPercent}%
                        </p>
                        <p className="text-xs text-gray-400">{isTr ? "bonus" : "bonus"}</p>
                      </div>
                    ))}
                  </div>

                  {/* Smart Contract Flow */}
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-500" />
                      {tx("value.smartContractFlow", lang)}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      {[
                        { n: 1, icon: <ShoppingCart className="w-4 h-4" />, text: tx("value.scStep1", lang) },
                        { n: 2, icon: <TrendingUp className="w-4 h-4" />, text: tx("value.scStep2", lang) },
                        { n: 3, icon: <Sparkles className="w-4 h-4" />, text: tx("value.scStep3", lang) },
                        { n: 4, icon: <CheckCircle2 className="w-4 h-4" />, text: tx("value.scStep4", lang) },
                      ].map((s) => (
                        <div key={s.n} className="flex items-start gap-2">
                          <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                            {s.n}
                          </div>
                          <div>
                            <div className="text-amber-600 dark:text-amber-400 mb-1">{s.icon}</div>
                            <p className="text-xs text-gray-600 dark:text-gray-300">{s.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Provider Leaderboard */}
                <div className="bg-white dark:bg-gray-800/70 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    {tx("value.providerLeaderboard", lang)}
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                          <th className="pb-2 pr-4">#</th>
                          <th className="pb-2 pr-4">{tx("value.provider", lang)}</th>
                          <th className="pb-2 pr-4">{tx("value.specialty", lang)}</th>
                          <th className="pb-2 pr-4 text-right">{tx("value.successRate", lang)}</th>
                          <th className="pb-2 pr-4 text-right">{tx("value.patients", lang)}</th>
                          <th className="pb-2 text-right">{tx("value.tier", lang)}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboard.map((prov, i) => (
                          <tr key={prov.id} className="border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                            <td className="py-3 pr-4 font-bold text-gray-400">{i + 1}</td>
                            <td className="py-3 pr-4 font-semibold text-gray-900 dark:text-white">
                              {prov.badge && <span className="mr-1">{prov.badge}</span>}
                              {prov.name}
                            </td>
                            <td className="py-3 pr-4 text-gray-500 dark:text-gray-400">
                              {isTr ? prov.specialtyTr : prov.specialty}
                            </td>
                            <td className="py-3 pr-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              {prov.successRate}%
                            </td>
                            <td className="py-3 pr-4 text-right font-mono text-gray-600 dark:text-gray-300">
                              {prov.patientsServed}
                            </td>
                            <td className="py-3 text-right">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                prov.bonusTier === "Gold"
                                  ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                                  : prov.bonusTier === "Silver"
                                    ? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                                    : "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
                              }`}>
                                {prov.bonusTier}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Performance BarChart */}
                <div className="bg-white dark:bg-gray-800/70 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-emerald-500" />
                    {tx("value.performanceComparison", lang)}
                  </h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={leaderboard.map((p) => ({
                          name: p.name.split(" ").slice(1).join(" "),
                          successRate: p.successRate,
                          patients: p.patientsServed,
                        }))}
                        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.2} />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                        <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(17,24,39,0.9)",
                            border: "1px solid #374151",
                            borderRadius: "12px",
                            color: "#fff",
                            fontSize: 12,
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Bar
                          dataKey="successRate"
                          name={tx("value.successRatePercent", lang)}
                          radius={[6, 6, 0, 0]}
                        >
                          {leaderboard.map((_, i) => (
                            <Cell
                              key={i}
                              fill={i === 0 ? "#eab308" : i < 3 ? "#10b981" : "#3b82f6"}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Doctor Referral Rewards */}
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-2xl border border-amber-200 dark:border-amber-800 p-6">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500" />
                    {tx("value.doctorReferral", lang)}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    {tx("value.doctorReferralDesc", lang)}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { icon: <TrendingUp className="w-5 h-5 text-emerald-500" />, title: tx("value.outcomeReward", lang), desc: tx("value.outcomeRewardDesc", lang) },
                      { icon: <Users className="w-5 h-5 text-blue-500" />, title: tx("value.volumeBonus", lang), desc: tx("value.volumeBonusDesc", lang) },
                      { icon: <Award className="w-5 h-5 text-amber-500" />, title: tx("value.goldProvider", lang), desc: tx("value.goldProviderDesc", lang) },
                    ].map((item, i) => (
                      <div key={i} className="bg-white/60 dark:bg-gray-800/40 rounded-xl p-4">
                        {item.icon}
                        <p className="font-semibold text-gray-900 dark:text-white text-sm mt-2">{item.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
