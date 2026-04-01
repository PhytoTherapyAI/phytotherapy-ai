// © 2026 Doctopal — All Rights Reserved
"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search, Sparkles, Leaf, ShieldCheck, ArrowRight, Filter,
  ChevronRight, Star, TrendingUp, BookOpen,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { CategoryBento } from "@/components/supplements/CategoryBento"
import { SupplementCard } from "@/components/supplements/SupplementCard"

// ── Mock Data ──
interface Supplement {
  id: string
  name: string
  latinName: string
  trustScore: number
  category: string
  benefits: string[]
  benefitsTr: string[]
  evidenceGrade: "A" | "B" | "C"
  pubmedCount: number
  color: string
  emoji: string
  interaction?: {
    drug: string
    severity: "high" | "moderate"
    alternative: { name: string; emoji: string }
  }
}

const SUPPLEMENTS: Supplement[] = [
  {
    id: "ashwagandha", name: "Ashwagandha", latinName: "Withania somnifera",
    trustScore: 89, category: "energy", benefits: ["Stress", "Energy", "Sleep"],
    benefitsTr: ["Stres", "Enerji", "Uyku"], evidenceGrade: "A", pubmedCount: 1247,
    color: "#f59e0b", emoji: "🌿",
  },
  {
    id: "valerian", name: "Valerian Root", latinName: "Valeriana officinalis",
    trustScore: 85, category: "sleep", benefits: ["Sleep", "Anxiety", "Relaxation"],
    benefitsTr: ["Uyku", "Anksiyete", "Rahatlama"], evidenceGrade: "A", pubmedCount: 892,
    color: "#6366f1", emoji: "🌙",
  },
  {
    id: "turmeric", name: "Turmeric", latinName: "Curcuma longa",
    trustScore: 92, category: "immunity", benefits: ["Anti-inflammatory", "Joints", "Immunity"],
    benefitsTr: ["Anti-inflamatuar", "Eklemler", "Bağışıklık"], evidenceGrade: "A", pubmedCount: 3456,
    color: "#f97316", emoji: "🟡",
  },
  {
    id: "stjohnswort", name: "St. John's Wort", latinName: "Hypericum perforatum",
    trustScore: 78, category: "focus", benefits: ["Mood", "Depression", "Anxiety"],
    benefitsTr: ["Ruh hali", "Depresyon", "Anksiyete"], evidenceGrade: "B", pubmedCount: 2100,
    color: "#eab308", emoji: "☀️",
    interaction: {
      drug: "SSRI (Sertraline)",
      severity: "high",
      alternative: { name: "Valerian Root", emoji: "🌙" },
    },
  },
  {
    id: "echinacea", name: "Echinacea", latinName: "Echinacea purpurea",
    trustScore: 82, category: "immunity", benefits: ["Cold", "Immunity", "Upper Respiratory"],
    benefitsTr: ["Soğuk algınlığı", "Bağışıklık", "Üst solunum"], evidenceGrade: "B", pubmedCount: 1567,
    color: "#3c7a52", emoji: "🌸",
  },
  {
    id: "ginger", name: "Ginger", latinName: "Zingiber officinale",
    trustScore: 91, category: "digestion", benefits: ["Nausea", "Digestion", "Anti-inflammatory"],
    benefitsTr: ["Mide bulantısı", "Sindirim", "Anti-inflamatuar"], evidenceGrade: "A", pubmedCount: 2890,
    color: "#16a34a", emoji: "🫚",
  },
  {
    id: "rhodiola", name: "Rhodiola Rosea", latinName: "Rhodiola rosea",
    trustScore: 84, category: "energy", benefits: ["Fatigue", "Cognitive", "Endurance"],
    benefitsTr: ["Yorgunluk", "Bilişsel", "Dayanıklılık"], evidenceGrade: "B", pubmedCount: 645,
    color: "#ec4899", emoji: "🏔️",
  },
  {
    id: "omega3", name: "Omega-3", latinName: "EPA + DHA",
    trustScore: 96, category: "heart", benefits: ["Heart", "Brain", "Triglycerides"],
    benefitsTr: ["Kalp", "Beyin", "Trigliserid"], evidenceGrade: "A", pubmedCount: 8900,
    color: "#3b82f6", emoji: "🐟",
  },
  {
    id: "magnesium", name: "Magnesium", latinName: "Mg Bisglycinate",
    trustScore: 94, category: "sleep", benefits: ["Sleep", "Muscle", "Stress"],
    benefitsTr: ["Uyku", "Kas", "Stres"], evidenceGrade: "A", pubmedCount: 4200,
    color: "#8b5cf6", emoji: "💜",
  },
  {
    id: "probiotics", name: "Probiotics", latinName: "Lactobacillus + Bifidobacterium",
    trustScore: 90, category: "digestion", benefits: ["Gut Health", "Immunity", "Mood"],
    benefitsTr: ["Bağırsak Sağlığı", "Bağışıklık", "Ruh hali"], evidenceGrade: "A", pubmedCount: 5600,
    color: "#22c55e", emoji: "🦠",
  },
  {
    id: "bacopa", name: "Bacopa Monnieri", latinName: "Bacopa monnieri",
    trustScore: 80, category: "focus", benefits: ["Memory", "Focus", "Learning"],
    benefitsTr: ["Hafıza", "Odak", "Öğrenme"], evidenceGrade: "B", pubmedCount: 520,
    color: "#06b6d4", emoji: "🧠",
  },
  {
    id: "coq10", name: "CoQ10", latinName: "Coenzyme Q10",
    trustScore: 88, category: "heart", benefits: ["Heart", "Energy", "Antioxidant"],
    benefitsTr: ["Kalp", "Enerji", "Antioksidan"], evidenceGrade: "A", pubmedCount: 3100,
    color: "#ef4444", emoji: "❤️",
  },
]

// ── Personalized picks (mock AI-selected) ──
const PERSONALIZED_IDS = ["ashwagandha", "magnesium", "omega3", "turmeric"]

export default function SupplementHubPage() {
  const { lang } = useLang()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredSupplements = useMemo(() => {
    let list = SUPPLEMENTS
    if (selectedCategory) {
      list = list.filter(s => s.category === selectedCategory)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.latinName.toLowerCase().includes(q) ||
        s.benefits.some(b => b.toLowerCase().includes(q)) ||
        s.benefitsTr.some(b => b.toLowerCase().includes(q))
      )
    }
    return list
  }, [selectedCategory, searchQuery])

  const personalizedPicks = useMemo(
    () => SUPPLEMENTS.filter(s => PERSONALIZED_IDS.includes(s.id)),
    []
  )

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-background">
      <div className="mx-auto max-w-4xl px-4 md:px-8 py-6 space-y-6">

        {/* ═══ HERO ═══ */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2 py-4">
          <div className="flex justify-center">
            <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}>
              <Leaf className="h-10 w-10 text-primary" />
            </motion.div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {lang === "tr" ? "Şifa Merkezi" : "Healing Center"}
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {lang === "tr"
              ? "Kanıta dayalı bitkisel takviyeler — profilinize göre güvenlik kontrolü ile"
              : "Evidence-based herbal supplements — with safety checks based on your profile"}
          </p>
        </motion.div>

        {/* ═══ SEARCH ═══ */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={lang === "tr" ? "Takviye ara... (ör. Ashwagandha, uyku)" : "Search supplements... (e.g. Ashwagandha, sleep)"}
            className="w-full rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-card pl-11 pr-4 py-3.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
          />
        </motion.div>

        {/* ═══ CATEGORY BENTO BOX ═══ */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          <CategoryBento selected={selectedCategory} onSelect={(id) => setSelectedCategory(id || null)} lang={lang} />
        </motion.div>

        {/* ═══ PERSONALIZED PICKS CAROUSEL ═══ */}
        {!selectedCategory && !searchQuery && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground">
                {lang === "tr" ? "Sizin İçin Seçilenler" : "Picked For You"}
              </h2>
              <Badge variant="secondary" className="text-[9px] bg-primary/10 text-primary">AI</Badge>
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
              {personalizedPicks.map((s, i) => (
                <motion.div key={s.id}
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.08 }}
                  className="min-w-[200px] max-w-[200px] shrink-0">
                  <div className="rounded-2xl p-4 border border-stone-200/60 dark:border-stone-800 bg-white dark:bg-card hover:shadow-md transition-shadow cursor-pointer group"
                    style={{ borderLeftWidth: 3, borderLeftColor: s.color }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{s.emoji}</span>
                      <div>
                        <p className="text-sm font-semibold group-hover:text-primary transition-colors">{s.name}</p>
                        <p className="text-[9px] text-muted-foreground italic">{s.latinName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-[10px] font-bold" style={{ color: s.color }}>
                        <ShieldCheck className="h-3 w-3" />
                        {s.trustScore}%
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {lang === "tr" ? "Bilimsel Güven" : "Science Trust"}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ═══ SUPPLEMENT GRID ═══ */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-foreground">
              {selectedCategory
                ? (lang === "tr" ? "Filtrelenmiş Sonuçlar" : "Filtered Results")
                : (lang === "tr" ? "Tüm Takviyeler" : "All Supplements")}
            </h2>
            <span className="text-xs text-muted-foreground">
              {filteredSupplements.length} {lang === "tr" ? "sonuç" : "results"}
            </span>
          </div>

          <AnimatePresence mode="popLayout">
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSupplements.map((s, i) => (
                <motion.div key={s.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.04 }}>
                  <SupplementCard
                    name={s.name}
                    latinName={s.latinName}
                    trustScore={s.trustScore}
                    category={s.category}
                    benefits={lang === "tr" ? s.benefitsTr : s.benefits}
                    evidenceGrade={s.evidenceGrade}
                    pubmedCount={s.pubmedCount}
                    color={s.color}
                    emoji={s.emoji}
                    interaction={s.interaction}
                    lang={lang}
                    onAdd={() => { /* mock add */ }}
                  />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {filteredSupplements.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-16">
              <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {lang === "tr" ? "Bu kategoride takviye bulunamadı." : "No supplements found in this category."}
              </p>
            </motion.div>
          )}
        </div>

        {/* ═══ TRUST FOOTER ═══ */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="rounded-2xl bg-primary/5 dark:bg-primary/10 border border-primary/10 p-4 text-center space-y-1">
          <div className="flex items-center justify-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold text-primary">
              {lang === "tr" ? "AI Doğrulanmış Güvenlik" : "AI-Verified Safety"}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground max-w-sm mx-auto">
            {lang === "tr"
              ? "Tüm takviyeler PubMed & Cochrane veritabanlarından doğrulanmıştır. Doktorunuza danışmadan kullanmayın."
              : "All supplements are verified against PubMed & Cochrane databases. Always consult your doctor before use."}
          </p>
        </motion.div>
      </div>
    </div>
  )
}
