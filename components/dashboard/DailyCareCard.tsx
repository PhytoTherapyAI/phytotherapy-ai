// © 2026 Doctopal — All Rights Reserved
"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import {
  Leaf,
  Footprints,
  ClipboardCheck,
  Heart,
  Droplets,
  Sun,
  Moon,
  Dumbbell,
  Brain,
  Eye,
  Check,
  Sparkles,
  Clock,
  ChevronRight,
  Loader2,
  RefreshCw,
  Lightbulb,
} from "lucide-react"

interface CareCard {
  id: string
  category: "nutrition" | "lifestyle" | "tracking" | "wellness"
  icon: string
  title: string
  description: string
  duration: string | null
  evidence: string | null
  priority: "high" | "medium" | "low"
}

interface CarePlan {
  greeting: string
  cards: CareCard[]
  dailyTip: string
}

const ICON_MAP: Record<string, any> = {
  leaf: Leaf,
  footprints: Footprints,
  clipboard: ClipboardCheck,
  heart: Heart,
  droplets: Droplets,
  sun: Sun,
  moon: Moon,
  dumbbell: Dumbbell,
  brain: Brain,
  eye: Eye,
}

const CATEGORY_STYLES: Record<string, { bg: string; border: string; iconBg: string; badge: string }> = {
  nutrition: {
    bg: "from-green-50/80 to-emerald-50/60 dark:from-green-950/20 dark:to-emerald-950/10",
    border: "border-green-200/60 dark:border-green-800/40",
    iconBg: "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300",
    badge: "bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-300",
  },
  lifestyle: {
    bg: "from-blue-50/80 to-cyan-50/60 dark:from-blue-950/20 dark:to-cyan-950/10",
    border: "border-blue-200/60 dark:border-blue-800/40",
    iconBg: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300",
  },
  tracking: {
    bg: "from-amber-50/80 to-yellow-50/60 dark:from-amber-950/20 dark:to-yellow-950/10",
    border: "border-amber-200/60 dark:border-amber-800/40",
    iconBg: "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300",
  },
  wellness: {
    bg: "from-purple-50/80 to-violet-50/60 dark:from-purple-950/20 dark:to-violet-950/10",
    border: "border-purple-200/60 dark:border-purple-800/40",
    iconBg: "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300",
    badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300",
  },
}

const CATEGORY_LABELS: Record<string, { tr: string; en: string }> = {
  nutrition: { tr: "Beslenme", en: "Nutrition" },
  lifestyle: { tr: "Yaşam Tarzı", en: "Lifestyle" },
  tracking: { tr: "Takip", en: "Tracking" },
  wellness: { tr: "Kendine İyi Bak", en: "Wellness" },
}

export function DailyCareCard() {
  const { user } = useAuth()
  const { lang } = useLang()
  const isTr = lang === "tr"
  const [plan, setPlan] = useState<CarePlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [completedCards, setCompletedCards] = useState<Set<string>>(new Set())
  const [animatingCard, setAnimatingCard] = useState<string | null>(null)

  // Load completed cards from localStorage
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]
    const saved = localStorage.getItem(`care-plan-completed-${today}`)
    if (saved) {
      try {
        setCompletedCards(new Set(JSON.parse(saved)))
      } catch { /* ignore */ }
    }
  }, [])

  const fetchPlan = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      // Check cache first (30 min)
      const today = new Date().toISOString().split("T")[0]
      const cacheKey = `care-plan-${today}-${lang}`
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          if (parsed.cards?.length > 0) {
            setPlan(parsed)
            setLoading(false)
            return
          }
        } catch { /* continue to fetch */ }
      }

      const res = await fetch(`/api/daily-care-plan?userId=${user.id}&lang=${lang}`)
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setPlan(data)
      localStorage.setItem(cacheKey, JSON.stringify(data))
    } catch (err) {
      console.error("[DailyCare] Fetch error:", err)
    } finally {
      setLoading(false)
    }
  }, [user, lang])

  useEffect(() => {
    fetchPlan()
  }, [fetchPlan])

  const handleComplete = (cardId: string) => {
    setAnimatingCard(cardId)
    setTimeout(() => {
      const newCompleted = new Set(completedCards)
      if (newCompleted.has(cardId)) {
        newCompleted.delete(cardId)
      } else {
        newCompleted.add(cardId)
      }
      setCompletedCards(newCompleted)
      setAnimatingCard(null)

      // Persist
      const today = new Date().toISOString().split("T")[0]
      localStorage.setItem(`care-plan-completed-${today}`, JSON.stringify([...newCompleted]))

      // Confetti event if all completed
      if (plan && newCompleted.size === plan.cards.length) {
        window.dispatchEvent(new CustomEvent("confetti-burst"))
      }
    }, 300)
  }

  const completionPercent = plan ? Math.round((completedCards.size / plan.cards.length) * 100) : 0

  if (loading) {
    return (
      <div className="rounded-2xl border bg-card p-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-xl bg-primary/10" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-muted/50" />
          ))}
        </div>
      </div>
    )
  }

  if (!plan) return null

  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      {/* Header with greeting + progress */}
      <div className="relative px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold leading-snug">
                {tx("dailyCare.title", lang)}
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                {plan.greeting}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem(`care-plan-${new Date().toISOString().split("T")[0]}-${lang}`)
              fetchPlan()
            }}
            className="flex-shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title={tx("dailyCare.refresh", lang)}
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">
            {completedCards.size}/{plan.cards.length}
          </span>
        </div>
      </div>

      {/* Action Cards Grid */}
      <div className="px-5 pb-4 grid gap-2.5 sm:grid-cols-2">
        {plan.cards.map((card) => {
          const style = CATEGORY_STYLES[card.category] || CATEGORY_STYLES.wellness
          const IconComponent = ICON_MAP[card.icon] || Heart
          const isCompleted = completedCards.has(card.id)
          const isAnimating = animatingCard === card.id

          return (
            <button
              key={card.id}
              onClick={() => handleComplete(card.id)}
              className={`group relative text-left rounded-xl border p-3.5 transition-all duration-300 ${
                isCompleted
                  ? "bg-primary/5 border-primary/20 dark:bg-primary/10"
                  : `bg-gradient-to-br ${style.bg} ${style.border} hover:shadow-md hover:-translate-y-0.5`
              } ${isAnimating ? "scale-95" : "scale-100"}`}
            >
              {/* Category badge + duration */}
              <div className="flex items-center justify-between mb-2">
                <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                  isCompleted ? "bg-primary/10 text-primary" : style.badge
                }`}>
                  <IconComponent className="h-2.5 w-2.5" />
                  {CATEGORY_LABELS[card.category]?.[lang]}
                </span>
                {card.duration && (
                  <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
                    <Clock className="h-2.5 w-2.5" />
                    {card.duration}
                  </span>
                )}
              </div>

              {/* Title */}
              <h4 className={`text-[13px] font-bold leading-snug mb-1 ${
                isCompleted ? "line-through text-muted-foreground" : ""
              }`}>
                {card.title}
              </h4>

              {/* Description */}
              <p className={`text-[11px] leading-relaxed ${
                isCompleted ? "text-muted-foreground/60 line-through" : "text-muted-foreground"
              }`}>
                {card.description}
              </p>

              {/* Completion indicator */}
              <div className={`absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${
                isCompleted
                  ? "border-primary bg-primary text-white scale-110"
                  : "border-muted-foreground/30 group-hover:border-primary/50"
              }`}>
                {isCompleted && <Check className="h-3 w-3" strokeWidth={3} />}
              </div>
            </button>
          )
        })}
      </div>

      {/* Daily Tip */}
      {plan.dailyTip && (
        <div className="mx-5 mb-4 flex items-start gap-2 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 px-3 py-2 border border-amber-200/40 dark:border-amber-800/30">
          <Lightbulb className="h-3.5 w-3.5 flex-shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
            {plan.dailyTip}
          </p>
        </div>
      )}

      {/* All completed celebration */}
      {completionPercent === 100 && (
        <div className="mx-5 mb-4 rounded-lg bg-primary/10 px-3 py-2.5 text-center">
          <p className="text-xs font-bold text-primary">
            {"🎉 " + tx("dailyCare.allCompleted", lang)}
          </p>
        </div>
      )}
    </div>
  )
}
