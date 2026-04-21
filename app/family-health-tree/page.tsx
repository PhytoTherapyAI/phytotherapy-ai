// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronLeft, Sparkles, Loader2, TreePine, Users, AlertCircle,
  UserCircle, Star, Lock,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useFamily } from "@/lib/family-context"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { useEffectivePremium } from "@/lib/use-effective-premium"
import { PremiumUpgradeModal } from "@/components/premium/PremiumUpgradeModal"
import { FamilyHistorySection } from "@/components/family/FamilyHistorySection"
import { getAvatarDataUri, type AvatarStyle } from "@/lib/avatar"
import {
  buildFamilyTree,
  toApiPayload,
  type TreeGeneration,
  type FamilyTreeNode,
  type Generation,
} from "@/lib/family-tree"
import type { FamilyRelationship } from "@/types/family"

interface HereditaryPattern {
  condition: string
  affectedRelatives: string[]
  inheritancePattern: string
  yourRiskMultiplier: string
  geneticTestRecommended: boolean
  specificTest: string
}
interface ScreeningRec {
  condition: string
  startAge: string
  frequency: string
  test: string
  reason: string
}
interface ProtectiveFactor {
  factor: string
  benefit: string
}
interface AnalysisResult {
  overallRiskAssessment: string
  hereditaryPatterns: HereditaryPattern[]
  screeningRecommendations: ScreeningRec[]
  geneticCounselingAdvice: string
  protectiveFactors: ProtectiveFactor[]
  keyInsights: string[]
}

const GENERATION_STYLE: Record<Generation, { tintClass: string; labelKey: string }> = {
  grandparent: {
    tintClass: "bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60",
    labelKey: "family.generationGrandparents",
  },
  parent: {
    tintClass: "bg-blue-50/70 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/60",
    labelKey: "family.generationParents",
  },
  self: {
    tintClass: "bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60",
    labelKey: "family.generationSelf",
  },
  child: {
    tintClass: "bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60",
    labelKey: "family.generationChildren",
  },
}

const REL_EMOJI: Record<FamilyRelationship, string> = {
  self: "⭐", spouse: "💍", parent: "👨‍👩", child: "🧒",
  sibling: "🧑‍🤝‍🧑", grandparent: "👴", grandchild: "👶", other: "👤",
}

function severityClasses(severity: "critical" | "moderate" | "mild"): string {
  if (severity === "critical") return "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300 border-red-200 dark:border-red-800"
  if (severity === "moderate") return "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800"
  return "bg-stone-100 text-stone-700 dark:bg-stone-900/40 dark:text-stone-300 border-stone-200 dark:border-stone-700"
}

function TreeNodeCard({
  node,
  lang,
}: { node: FamilyTreeNode & { occurrenceCount?: number }; lang: "en" | "tr" }) {
  const tr = lang === "tr"
  const relKey = `family.rel.${node.relationship}`
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`relative rounded-2xl border-2 bg-white dark:bg-card p-3 sm:p-4 shadow-sm min-w-[150px] max-w-[220px] ${
        node.isSelf ? "ring-2 ring-emerald-400 border-emerald-300" : "border-border"
      }`}
    >
      {node.isSelf && (
        <div className="absolute -top-2 -right-2 bg-emerald-500 rounded-full px-2 py-0.5 flex items-center gap-1 text-[9px] font-bold text-white shadow">
          <Star className="h-2.5 w-2.5" /> {tr ? "Sen" : "You"}
        </div>
      )}

      <div className="flex items-start gap-2 mb-2">
        {node.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={getAvatarDataUri(node.avatar.seed, node.avatar.style as AvatarStyle)}
            alt={node.name}
            className="w-10 h-10 rounded-lg bg-muted shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-lg shrink-0">
            {REL_EMOJI[node.relationship] || "👤"}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-foreground truncate" title={node.name}>
            {node.name}
          </p>
          <p className="text-[10px] text-muted-foreground truncate">
            {REL_EMOJI[node.relationship]} {tx(relKey, lang)}
            {node.isAggregate && typeof node.occurrenceCount === "number" && (
              <span className="ml-1 text-amber-600 dark:text-amber-400 font-semibold">
                · {node.occurrenceCount}×
              </span>
            )}
          </p>
        </div>
      </div>

      {node.conditions.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {node.conditions.slice(0, 4).map((c, i) => (
            <span
              key={i}
              className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[9px] font-medium ${severityClasses(c.severity)}`}
              title={c.name}
            >
              {c.severity === "critical" && <AlertCircle className="h-2.5 w-2.5" />}
              <span className="truncate max-w-[100px]">{c.name}</span>
            </span>
          ))}
          {node.conditions.length > 4 && (
            <span className="text-[9px] text-muted-foreground">+{node.conditions.length - 4}</span>
          )}
        </div>
      ) : (
        <p className="text-[10px] text-muted-foreground italic">{tr ? "Kayıt yok" : "No records"}</p>
      )}

      {node.userId && !node.isAggregate && (
        <Link
          href="/profile"
          className="absolute inset-0 rounded-2xl"
          aria-label={tr ? `${node.name} profilini aç` : `Open ${node.name}'s profile`}
        />
      )}
    </motion.div>
  )
}

function GenerationRow({
  gen,
  lang,
}: { gen: TreeGeneration; lang: "en" | "tr" }) {
  const tr = lang === "tr"
  if (gen.members.length === 0) {
    return (
      <section
        className={`rounded-2xl border-2 border-dashed ${GENERATION_STYLE[gen.generation].tintClass} p-4`}
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
          {tx(GENERATION_STYLE[gen.generation].labelKey, lang)}
        </p>
        <p className="text-xs text-muted-foreground italic">
          {tr ? "Henüz kimse yok" : "Empty"}
        </p>
      </section>
    )
  }
  return (
    <section
      className={`rounded-2xl border-2 ${GENERATION_STYLE[gen.generation].tintClass} p-4`}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        {tx(GENERATION_STYLE[gen.generation].labelKey, lang)}
      </p>
      <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
        {gen.members.map(node => (
          <TreeNodeCard key={node.id} node={node as FamilyTreeNode & { occurrenceCount?: number }} lang={lang} />
        ))}
      </div>
    </section>
  )
}

export default function FamilyHealthTreePage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { familyGroup, familyMembers, loading: familyLoading } = useFamily()
  const { lang } = useLang()
  const tr = lang === "tr"
  const effectivePremium = useEffectivePremium()

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)
  const [showPremiumModal, setShowPremiumModal] = useState(false)

  const generations = useMemo<TreeGeneration[]>(() => {
    if (!familyMembers || familyMembers.length === 0) return []
    return buildFamilyTree(familyMembers, user?.id ?? null)
  }, [familyMembers, user?.id])

  const totalMembers = familyMembers?.length ?? 0
  const hasAnyConditions = generations.some(g => g.members.some(n => n.conditions.length > 0))

  async function runAnalysis() {
    // Premium gate — hereditary AI analysis is paid. Upgrades individual OR
    // family source via useEffectivePremium (a family member who is NOT
    // individually premium still unlocks via the group's family_premium plan).
    if (effectivePremium.loading) return
    if (!effectivePremium.isPremium) {
      setShowPremiumModal(true)
      return
    }
    setAnalyzing(true)
    setAnalyzeError(null)
    try {
      const { createBrowserClient } = await import("@/lib/supabase")
      const supabase = createBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setAnalyzeError(tr ? "Oturum bulunamadı" : "Session not found")
        return
      }

      const payload = toApiPayload(generations)
      if (payload.length === 0) {
        setAnalyzeError(tr ? "Analiz için en az bir aile üyesinde hastalık kaydı gerekli" : "Need at least one member with a recorded condition")
        return
      }

      const res = await fetch("/api/family-health-tree", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ lang, family_members: payload }),
      })
      const data = await res.json()
      if (!res.ok) {
        setAnalyzeError(
          res.status === 402
            ? (tr ? "Bu özellik Premium gerektirir" : "Premium required")
            : (data.error || (tr ? "Analiz başarısız" : "Analysis failed"))
        )
        return
      }
      setAnalysis(data.result as AnalysisResult)
    } catch {
      setAnalyzeError(tr ? "Sunucu hatası" : "Server error")
    } finally {
      setAnalyzing(false)
    }
  }

  // ───────────── Loading / unauth / empty-state ─────────────
  if (authLoading || familyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <TreePine className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
          <h1 className="text-xl font-bold mb-2">{tx("family.treeTitle", lang)}</h1>
          <p className="text-sm text-muted-foreground mb-4">
            {tr ? "Aile ağacını görmek için giriş yapın." : "Sign in to see your family tree."}
          </p>
          <Link href="/auth/login" className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-5 py-2.5 text-sm font-semibold">
            {tr ? "Giriş Yap" : "Sign In"}
          </Link>
        </div>
      </div>
    )
  }

  if (!familyGroup) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <Users className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
          <h1 className="text-xl font-bold mb-2">{tx("family.treeTitle", lang)}</h1>
          <p className="text-sm text-muted-foreground mb-4">
            {tr ? "Aile ağacını görmek için önce bir aile grubu oluşturman gerekiyor." : "You need to create a family group first."}
          </p>
          <Link href="/family" className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-5 py-2.5 text-sm font-semibold">
            {tr ? "Aile Grubu Oluştur" : "Create Family Group"}
          </Link>
        </div>
      </div>
    )
  }

  // ───────────── Main render ─────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 via-background to-background dark:from-emerald-950/10 dark:via-background dark:to-background">
      <div className="mx-auto max-w-5xl px-4 md:px-8 py-6 md:py-10">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label={tr ? "Geri" : "Back"}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <TreePine className="h-5 w-5 text-emerald-600" />
              {tx("family.treeTitle", lang)}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {tr
                ? `${totalMembers} üye · kalıtsal riskleri görselleştirir`
                : `${totalMembers} members · visualize inherited risks`}
            </p>
          </div>
        </div>

        {/* Empty state */}
        {totalMembers <= 1 && generations[0]?.members.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-border p-8 text-center">
            <Users className="h-10 w-10 text-muted-foreground/60 mx-auto mb-3" />
            <p className="text-sm font-semibold mb-1">
              {tr ? "Ağaç boş" : "Empty tree"}
            </p>
            <p className="text-xs text-muted-foreground mb-4 max-w-xs mx-auto">
              {tx("family.treeEmpty", lang)}
            </p>
            <Link
              href="/family"
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm font-semibold"
            >
              <UserCircle className="h-4 w-4" /> {tr ? "Aile sayfasına git" : "Go to Family"}
            </Link>
          </div>
        )}

        {/* Generations */}
        {(totalMembers > 1 || (generations[0]?.members.length ?? 0) > 0) && (
          <div className="space-y-4">
            {generations.map(g => (
              <GenerationRow key={g.generation} gen={g} lang={lang as "en" | "tr"} />
            ))}
          </div>
        )}

        {/* AI analysis CTA */}
        {hasAnyConditions && (
          <div className="mt-6 rounded-2xl border bg-card p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-amber-100 dark:bg-amber-950/40 p-2.5 shrink-0">
                  <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{tx("family.aiAnalyzeButton", lang)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 max-w-md">
                    {tr
                      ? "AI, kaydettiğin aile geçmişini analiz edip kalıtsal risk örüntülerini ve tarama önerilerini çıkarır."
                      : "AI analyzes your recorded family history to surface inherited risk patterns and screening advice."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={runAnalysis}
                disabled={analyzing}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 px-5 py-2.5 text-sm font-bold text-white transition-colors"
              >
                {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : (effectivePremium.isPremium ? <Sparkles className="h-4 w-4" /> : <Lock className="h-4 w-4" />)}
                {analyzing
                  ? tx("family.aiAnalyzing", lang)
                  : (effectivePremium.isPremium ? tx("family.aiAnalyzeButton", lang) : tx("family.upgradeCta", lang))}
              </button>
            </div>
            {analyzeError && (
              <p className="mt-3 text-xs text-red-600 dark:text-red-400">{analyzeError}</p>
            )}
          </div>
        )}

        {/* Analysis result panel */}
        <AnimatePresence>
          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 rounded-2xl border border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-background p-5"
            >
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-600" />
                {tr ? "Genetik Risk Analizi" : "Genetic Risk Analysis"}
              </h2>

              {analysis.overallRiskAssessment && (
                <div className="mb-4 p-3 rounded-xl bg-white/70 dark:bg-black/20 border">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1 font-semibold">
                    {tr ? "Genel Değerlendirme" : "Overall Assessment"}
                  </p>
                  <p className="text-sm">{analysis.overallRiskAssessment}</p>
                </div>
              )}

              {analysis.hereditaryPatterns?.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-semibold">
                    {tr ? "Kalıtım Örüntüleri" : "Hereditary Patterns"}
                  </p>
                  <div className="space-y-2">
                    {analysis.hereditaryPatterns.map((p, i) => (
                      <div key={i} className="rounded-xl bg-white/70 dark:bg-black/20 border p-3">
                        <p className="text-sm font-semibold">{p.condition}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {tr ? "Etkilenen" : "Affected"}: {p.affectedRelatives?.join(", ")} · {p.inheritancePattern} · {p.yourRiskMultiplier}
                        </p>
                        {p.geneticTestRecommended && p.specificTest && (
                          <p className="text-xs mt-1 text-amber-700 dark:text-amber-300">
                            🧬 {p.specificTest}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysis.screeningRecommendations?.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-semibold">
                    {tr ? "Tarama Önerileri" : "Screening Recommendations"}
                  </p>
                  <div className="space-y-2">
                    {analysis.screeningRecommendations.map((s, i) => (
                      <div key={i} className="rounded-xl bg-white/70 dark:bg-black/20 border p-3">
                        <p className="text-sm font-semibold">{s.condition} — {s.test}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {tr ? "Başlangıç" : "Start"}: {s.startAge} · {s.frequency}
                        </p>
                        <p className="text-xs mt-1">{s.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysis.keyInsights?.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-semibold">
                    {tr ? "Önemli Bulgular" : "Key Insights"}
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    {analysis.keyInsights.map((k, i) => (
                      <li key={i} className="text-sm">{k}</li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.geneticCounselingAdvice && (
                <div className="mt-4 p-3 rounded-xl bg-amber-100/60 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700">
                  <p className="text-xs font-semibold mb-1">
                    {tr ? "Genetik Danışmanlık" : "Genetic Counseling"}
                  </p>
                  <p className="text-xs text-amber-900 dark:text-amber-200">{analysis.geneticCounselingAdvice}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Session 39 C2: Family History Entries CRUD section */}
        <FamilyHistorySection />

        <p className="mt-6 text-[11px] text-muted-foreground text-center max-w-xl mx-auto">
          {tr
            ? "Bu analiz tıbbi teşhis değildir. Genetik test kararları için genetik danışman veya hekiminize başvurun."
            : "This analysis is not a medical diagnosis. Consult a genetic counselor or physician before any genetic testing decision."}
        </p>
      </div>

      <PremiumUpgradeModal
        open={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        featureName={tr ? "Aile Sağlık Ağacı AI Analizi" : "Family Health Tree AI Analysis"}
      />
    </div>
  )
}
