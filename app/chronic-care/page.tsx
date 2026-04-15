// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Heart, Brain, Droplets, Bone, Shield, Activity,
  Pill, Leaf, TrendingUp, Check, ChevronRight,
  Sparkles, Stethoscope, LogIn, ArrowRight,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { useRouter } from "next/navigation"

// ── Condition types ──
interface ChronicCondition {
  id: string
  label: string
  labelTr: string
  emoji: string
  icon: React.ReactNode
  color: string
  bgColor: string
  description: string
  descriptionTr: string
  metrics: string[]
  metricsTr: string[]
}

const CONDITIONS: ChronicCondition[] = [
  {
    id: "diabetes", label: "Diabetes", labelTr: "Diyabet",
    emoji: "🩸", icon: <Droplets className="h-5 w-5" />,
    color: "#ef4444", bgColor: "bg-red-50 dark:bg-red-900/20",
    description: "Blood sugar monitoring, HbA1c tracking, insulin management",
    descriptionTr: "Kan şekeri takibi, HbA1c izleme, insülin yönetimi",
    metrics: ["HbA1c", "Fasting Glucose", "Post-meal Glucose", "Weight"],
    metricsTr: ["HbA1c", "Açlık Şekeri", "Tokluk Şekeri", "Kilo"],
  },
  {
    id: "hypertension", label: "Hypertension", labelTr: "Hipertansiyon",
    emoji: "❤️", icon: <Heart className="h-5 w-5" />,
    color: "#dc2626", bgColor: "bg-rose-50 dark:bg-rose-900/20",
    description: "Blood pressure monitoring, sodium tracking, medication adherence",
    descriptionTr: "Tansiyon takibi, sodyum izleme, ilaç uyumu",
    metrics: ["Systolic", "Diastolic", "Heart Rate", "Sodium Intake"],
    metricsTr: ["Sistolik", "Diyastolik", "Nabız", "Sodyum Alımı"],
  },
  {
    id: "thyroid", label: "Thyroid", labelTr: "Tiroid",
    emoji: "🦋", icon: <Activity className="h-5 w-5" />,
    color: "#8b5cf6", bgColor: "bg-violet-50 dark:bg-violet-900/20",
    description: "TSH & T4 levels, energy tracking, weight management",
    descriptionTr: "TSH & T4 seviyeleri, enerji takibi, kilo yönetimi",
    metrics: ["TSH", "Free T4", "Energy Level", "Weight"],
    metricsTr: ["TSH", "Serbest T4", "Enerji Seviyesi", "Kilo"],
  },
  {
    id: "asthma", label: "Asthma / COPD", labelTr: "Astım / KOAH",
    emoji: "🫁", icon: <Shield className="h-5 w-5" />,
    color: "#06b6d4", bgColor: "bg-cyan-50 dark:bg-cyan-900/20",
    description: "Peak flow monitoring, inhaler tracking, trigger avoidance",
    descriptionTr: "Tepe akım izleme, inhaler takibi, tetikleyici kaçınma",
    metrics: ["Peak Flow", "SpO2", "Inhaler Uses", "Symptoms"],
    metricsTr: ["Tepe Akım", "SpO2", "İnhaler Kullanımı", "Semptomlar"],
  },
  {
    id: "arthritis", label: "Arthritis", labelTr: "Romatizma",
    emoji: "🦴", icon: <Bone className="h-5 w-5" />,
    color: "#f59e0b", bgColor: "bg-amber-50 dark:bg-amber-900/20",
    description: "Joint pain tracking, mobility, anti-inflammatory supplements",
    descriptionTr: "Eklem ağrısı takibi, hareketlilik, anti-inflamatuar takviyeler",
    metrics: ["Pain Score", "Mobility", "CRP Level", "Steps"],
    metricsTr: ["Ağrı Skoru", "Hareketlilik", "CRP Seviyesi", "Adımlar"],
  },
  {
    id: "mental", label: "Anxiety / Depression", labelTr: "Anksiyete / Depresyon",
    emoji: "🧠", icon: <Brain className="h-5 w-5" />,
    color: "#3c7a52", bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
    description: "Mood tracking, sleep quality, therapy progress",
    descriptionTr: "Ruh hali takibi, uyku kalitesi, terapi ilerlemesi",
    metrics: ["Mood Score", "Sleep Quality", "PHQ-9", "GAD-7"],
    metricsTr: ["Ruh Hali Skoru", "Uyku Kalitesi", "PHQ-9", "GAD-7"],
  },
]

// ── Dashboard view for selected condition ──
function ConditionDashboard({ condition, lang }: { condition: ChronicCondition; lang: "en" | "tr" }) {
  const metrics = lang === "tr" ? condition.metricsTr : condition.metrics

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {/* Active condition banner */}
      <div className="rounded-2xl p-4 border-2 flex items-center gap-4"
        style={{ borderColor: condition.color, backgroundColor: `${condition.color}08` }}>
        <div className="h-14 w-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
          style={{ backgroundColor: `${condition.color}15` }}>
          {condition.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold" style={{ color: condition.color }}>
            {lang === "tr" ? condition.labelTr : condition.label}
          </h3>
          <p className="text-xs text-muted-foreground">
            {lang === "tr" ? condition.descriptionTr : condition.description}
          </p>
        </div>
        <Badge className="shrink-0 text-[10px]" style={{ backgroundColor: `${condition.color}15`, color: condition.color }}>
          {tx("chronicCare.active", lang)}
        </Badge>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric, i) => (
          <motion.div key={metric}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}>
            <Card className="rounded-2xl hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">{metric}</p>
                <p className="text-xl font-bold text-foreground">--</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {tx("chronicCare.addData", lang)}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* AI Suggestion */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        className="rounded-2xl bg-primary/5 dark:bg-primary/10 border border-primary/10 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold text-primary">
            {tx("chronicCare.aiSuggestions", lang)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {tx("chronicCare.aiSuggestionBody", lang)}
        </p>
        <Button size="sm" className="mt-3 rounded-xl text-xs h-9">
          <TrendingUp className="h-3.5 w-3.5 mr-1" />
          {tx("chronicCare.startTracking", lang)}
        </Button>
      </motion.div>

      {/* Supportive supplements */}
      <div className="rounded-2xl border bg-white dark:bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Leaf className="h-4 w-4 text-primary" />
          <span className="text-sm font-bold">
            {tx("chronicCare.supportivePhyto", lang)}
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {["Omega-3", "Curcumin", "Magnesium", "CoQ10"].map(s => (
            <span key={s} className="shrink-0 px-3 py-1.5 rounded-full bg-primary/5 text-xs font-medium text-primary border border-primary/10">
              {s}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default function ChronicCarePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading, profile } = useAuth()
  const { lang } = useLang()
  const [selected, setSelected] = useState<string[]>([])
  const [showDashboard, setShowDashboard] = useState(false)
  const [activeCondition, setActiveCondition] = useState<string | null>(null)

  if (isLoading) return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <Card><CardContent className="py-12 space-y-4">
          <Stethoscope className="h-12 w-12 text-muted-foreground/40 mx-auto" />
          <h2 className="text-xl font-bold">{tx("chronicCare.title", lang)}</h2>
          <p className="text-sm text-muted-foreground">{tx("chronicCare.signInPrompt", lang)}</p>
          <Button onClick={() => router.push("/auth/login")}><LogIn className="h-4 w-4 mr-2" />{tx("cal.signIn", lang)}</Button>
        </CardContent></Card>
      </div>
    )
  }

  const toggleCondition = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id])
  }

  const activeDashboardCondition = CONDITIONS.find(c => c.id === activeCondition)

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-background">
      <div className="mx-auto max-w-2xl px-4 md:px-8 py-6 space-y-6">

        <AnimatePresence mode="wait">
          {!showDashboard ? (
            <motion.div key="selector" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-6">
              {/* ═══ EMPATHETIC HERO ═══ */}
              <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
                className="text-center py-6 space-y-3">
                <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}>
                  <Stethoscope className="h-12 w-12 text-primary mx-auto" />
                </motion.div>
                <h1 className="text-2xl font-bold text-foreground">
                  {tx("chronicCare.heroTitle", lang)}
                </h1>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  {tx("chronicCare.heroSubtitle", lang)}
                </p>
              </motion.div>

              {/* ═══ BENTO BOX SELECTORS ═══ */}
              <div className="grid grid-cols-2 gap-3">
                {CONDITIONS.map((c, i) => {
                  const isActive = selected.includes(c.id)
                  return (
                    <motion.button key={c.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ y: -2 }}
                      onClick={() => toggleCondition(c.id)}
                      className={`relative rounded-2xl p-4 text-left transition-all ${
                        isActive
                          ? "ring-2 shadow-md"
                          : `${c.bgColor} hover:shadow-sm`
                      }`}
                      style={isActive ? {
                        boxShadow: `0 0 0 2px ${c.color}, 0 4px 16px ${c.color}20`,
                        backgroundColor: `${c.color}12`,
                      } : undefined}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-2xl">{c.emoji}</span>
                        {isActive && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className="h-5 w-5 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: c.color }}>
                            <Check className="h-3 w-3 text-white" />
                          </motion.div>
                        )}
                      </div>
                      <h3 className={`text-sm font-bold mb-0.5 ${isActive ? "" : "text-foreground"}`}
                        style={isActive ? { color: c.color } : undefined}>
                        {lang === "tr" ? c.labelTr : c.label}
                      </h3>
                      <p className="text-[10px] text-muted-foreground line-clamp-2">
                        {lang === "tr" ? c.descriptionTr : c.description}
                      </p>
                    </motion.button>
                  )
                })}
              </div>

              {/* ═══ CTA ═══ */}
              <AnimatePresence>
                {selected.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}>
                    <Button onClick={() => { setShowDashboard(true); setActiveCondition(selected[0]) }}
                      className="w-full h-12 rounded-2xl text-sm font-semibold shadow-lg shadow-primary/20">
                      {lang === "tr"
                        ? `${selected.length} durum seçildi — Panoya Git`
                        : `${selected.length} selected — Go to Dashboard`}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div key="dashboard" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="space-y-4">
              {/* Back + condition tabs */}
              <div className="flex items-center gap-2 mb-2">
                <Button variant="ghost" size="sm" onClick={() => setShowDashboard(false)}
                  className="rounded-xl text-xs">
                  {tx("chronicCare.back", lang)}
                </Button>
              </div>

              {/* Condition chips */}
              {selected.length > 1 && (
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                  {selected.map(id => {
                    const c = CONDITIONS.find(x => x.id === id)
                    if (!c) return null
                    return (
                      <motion.button key={id} whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveCondition(id)}
                        className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all ${
                          activeCondition === id
                            ? "text-white shadow-md"
                            : "bg-stone-100 dark:bg-stone-800 text-muted-foreground"
                        }`}
                        style={activeCondition === id ? { backgroundColor: c.color } : undefined}>
                        <span>{c.emoji}</span>
                        {lang === "tr" ? c.labelTr : c.label}
                      </motion.button>
                    )
                  })}
                </div>
              )}

              {/* Dashboard content */}
              <AnimatePresence mode="wait">
                {activeDashboardCondition && (
                  <ConditionDashboard key={activeCondition} condition={activeDashboardCondition} lang={lang} />
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
