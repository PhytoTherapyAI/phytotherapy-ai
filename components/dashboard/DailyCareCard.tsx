// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useAuth } from "@/lib/auth-context"
import { useActiveProfile } from "@/lib/use-active-profile"
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
  Loader2,
  RefreshCw,
  Lightbulb,
  SlidersHorizontal,
  X,
} from "lucide-react"

interface CareCard {
  id: string
  category: string
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

const ALL_CATEGORIES = [
  "nutrition", "lifestyle", "tracking", "wellness",
  "fitness", "hydration", "social", "mindfulness",
] as const

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
  fitness: {
    bg: "from-orange-50/80 to-red-50/60 dark:from-orange-950/20 dark:to-red-950/10",
    border: "border-orange-200/60 dark:border-orange-800/40",
    iconBg: "bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300",
    badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/60 dark:text-orange-300",
  },
  hydration: {
    bg: "from-sky-50/80 to-blue-50/60 dark:from-sky-950/20 dark:to-blue-950/10",
    border: "border-sky-200/60 dark:border-sky-800/40",
    iconBg: "bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300",
    badge: "bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300",
  },
  social: {
    bg: "from-pink-50/80 to-rose-50/60 dark:from-pink-950/20 dark:to-rose-950/10",
    border: "border-pink-200/60 dark:border-pink-800/40",
    iconBg: "bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300",
    badge: "bg-pink-100 text-pink-700 dark:bg-pink-900/60 dark:text-pink-300",
  },
  mindfulness: {
    bg: "from-indigo-50/80 to-violet-50/60 dark:from-indigo-950/20 dark:to-violet-950/10",
    border: "border-indigo-200/60 dark:border-indigo-800/40",
    iconBg: "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300",
    badge: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300",
  },
}

// Preferences stored per user
interface CardPrefs {
  enabledCategories: string[]
  durationOverrides: Record<string, string>
}

const DEFAULT_ENABLED = ["nutrition", "lifestyle", "tracking", "wellness"]
const DURATION_OPTIONS = ["1 min", "5 min", "10 min", "15 min", "30 min"]
const CACHE_VERSION = "v2" // bump to invalidate old caches

/** Local date string YYYY-MM-DD (NOT UTC) */
function getLocalDateStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function getPrefsKey(userId: string) {
  return `care-plan-prefs-${userId}`
}

function loadPrefs(userId: string): CardPrefs {
  try {
    const raw = localStorage.getItem(getPrefsKey(userId))
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return { enabledCategories: [...DEFAULT_ENABLED], durationOverrides: {} }
}

function savePrefs(userId: string, prefs: CardPrefs) {
  localStorage.setItem(getPrefsKey(userId), JSON.stringify(prefs))
}

export function DailyCareCard() {
  const { user } = useAuth()
  const { activeUserId } = useActiveProfile()
  const { lang } = useLang()
  // Effective id for all reads/caches — pivots on active profile when set.
  const effectiveId = activeUserId || user?.id || ""
  const [plan, setPlan] = useState<CarePlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [completedCards, setCompletedCards] = useState<Set<string>>(new Set())
  const [animatingCard, setAnimatingCard] = useState<string | null>(null)
  const [customizeMode, setCustomizeMode] = useState(false)
  const [prefs, setPrefs] = useState<CardPrefs>({ enabledCategories: [...DEFAULT_ENABLED], durationOverrides: {} })
  const [dismissedToday, setDismissedToday] = useState<Set<string>>(new Set())

  const today = getLocalDateStr()

  // Load prefs + completions + dismissals from localStorage
  useEffect(() => {
    if (!user) return
    setPrefs(loadPrefs(effectiveId))

    const savedCompleted = localStorage.getItem(`care-completed-${today}`)
    if (savedCompleted) {
      try { setCompletedCards(new Set(JSON.parse(savedCompleted))) } catch { /* ignore */ }
    }

    const savedDismissed = localStorage.getItem(`care-dismissed-${today}`)
    if (savedDismissed) {
      try { setDismissedToday(new Set(JSON.parse(savedDismissed))) } catch { /* ignore */ }
    }
  }, [user, effectiveId, today])

  const fetchPlan = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      // Versioned cache key — old caches automatically ignored
      const cacheKey = `care-plan-${CACHE_VERSION}-${today}-${lang}`
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

      const res = await fetch(`/api/daily-care-plan?userId=${effectiveId}&lang=${lang}`)
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setPlan(data)
      localStorage.setItem(cacheKey, JSON.stringify(data))
    } catch (err) {
      console.error("[DailyCare] Fetch error:", err)
    } finally {
      setLoading(false)
    }
  }, [user, effectiveId, lang, today])

  useEffect(() => {
    fetchPlan()
  }, [fetchPlan])

  // Visible cards: enabled + not dismissed
  const visibleCards = useMemo(() => {
    if (!plan?.cards) return []
    return plan.cards.filter(
      (c) => prefs.enabledCategories.includes(c.category) && !dismissedToday.has(c.id)
    )
  }, [plan, prefs.enabledCategories, dismissedToday])

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
      localStorage.setItem(`care-completed-${today}`, JSON.stringify([...newCompleted]))

      if (visibleCards.length > 0 && newCompleted.size >= visibleCards.length) {
        window.dispatchEvent(new CustomEvent("confetti-burst"))
      }
    }, 300)
  }

  const handleDismiss = (e: React.MouseEvent, cardId: string) => {
    e.stopPropagation()
    const newDismissed = new Set(dismissedToday)
    newDismissed.add(cardId)
    setDismissedToday(newDismissed)
    localStorage.setItem(`care-dismissed-${today}`, JSON.stringify([...newDismissed]))
  }

  const toggleCategory = (cat: string) => {
    const enabled = new Set(prefs.enabledCategories)
    if (enabled.has(cat)) {
      if (enabled.size <= 2) return
      enabled.delete(cat)
    } else {
      enabled.add(cat)
    }
    const newPrefs = { ...prefs, enabledCategories: [...enabled] }
    setPrefs(newPrefs)
    if (user) savePrefs(effectiveId, newPrefs)
  }

  const changeDuration = (category: string, duration: string) => {
    const newPrefs = {
      ...prefs,
      durationOverrides: { ...prefs.durationOverrides, [category]: duration },
    }
    setPrefs(newPrefs)
    if (user) savePrefs(effectiveId, newPrefs)
  }

  const handleRefresh = () => {
    // Clear versioned cache + old caches
    const cacheKey = `care-plan-${CACHE_VERSION}-${today}-${lang}`
    localStorage.removeItem(cacheKey)
    // Also clear any old-format caches
    localStorage.removeItem(`care-plan-${today}-${lang}`)
    localStorage.removeItem(`care-plan-${today}-tr`)
    localStorage.removeItem(`care-plan-${today}-en`)
    fetchPlan()
  }

  const completedCount = visibleCards.filter(c => completedCards.has(c.id)).length
  const completionPercent = visibleCards.length > 0
    ? Math.round((completedCount / visibleCards.length) * 100)
    : 0

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

  // ─── Customize Mode ───
  if (customizeMode) {
    return (
      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold">{tx("dailyCare.customize", lang)}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{tx("dailyCare.customizeDesc", lang)}</p>
            </div>
            <button
              onClick={() => setCustomizeMode(false)}
              className="rounded-lg bg-primary px-3 py-1.5 text-[11px] font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {tx("dailyCare.done", lang)}
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">{tx("dailyCare.selectCards", lang)}</p>
        </div>

        <div className="px-5 pb-5 space-y-2">
          {ALL_CATEGORIES.map((cat) => {
            const card = plan.cards.find(c => c.category === cat)
            const isEnabled = prefs.enabledCategories.includes(cat)
            const style = CATEGORY_STYLES[cat] || CATEGORY_STYLES.wellness
            const currentDuration = prefs.durationOverrides[cat] || card?.duration || null

            return (
              <div
                key={cat}
                className={`rounded-xl border p-3 transition-all ${
                  isEnabled ? `bg-gradient-to-r ${style.bg} ${style.border}` : "bg-muted/30 border-muted opacity-60"
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Toggle */}
                  <button
                    onClick={() => toggleCategory(cat)}
                    className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
                      isEnabled ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                  >
                    <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      isEnabled ? "translate-x-5" : "translate-x-0"
                    }`} />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${style.badge}`}>
                        {tx(`dailyCare.cat.${cat}`, lang)}
                      </span>
                    </div>
                    {card && (
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{card.title}</p>
                    )}
                  </div>

                  {/* Duration selector */}
                  {isEnabled && currentDuration && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {DURATION_OPTIONS.map((d) => (
                        <button
                          key={d}
                          onClick={() => changeDuration(cat, d)}
                          className={`rounded-md px-1.5 py-0.5 text-[9px] font-medium transition-colors ${
                            currentDuration === d
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted/50 text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          {d.replace(" min", "m")}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ─── Normal Mode ───
  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      {/* Header */}
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
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => setCustomizeMode(true)}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title={tx("dailyCare.customize", lang)}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleRefresh}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title={tx("dailyCare.refresh", lang)}
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
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
            {completedCount}/{visibleCards.length}
          </span>
        </div>
      </div>

      {/* Action Cards Grid */}
      <div className="px-5 pb-4 grid gap-2.5 sm:grid-cols-2">
        {visibleCards.map((card) => {
          const style = CATEGORY_STYLES[card.category] || CATEGORY_STYLES.wellness
          const IconComponent = ICON_MAP[card.icon] || Heart
          const isCompleted = completedCards.has(card.id)
          const isAnimating = animatingCard === card.id
          const displayDuration = prefs.durationOverrides[card.category] || card.duration

          return (
            <button
              key={card.id}
              onClick={() => handleComplete(card.id)}
              className={`group relative text-left rounded-xl border p-3.5 transition-all duration-300 w-full ${
                isCompleted
                  ? "bg-primary/5 border-primary/20 dark:bg-primary/10"
                  : `bg-gradient-to-br ${style.bg} ${style.border} hover:shadow-md hover:-translate-y-0.5`
              } ${isAnimating ? "scale-95" : "scale-100"}`}
            >
              {/* Category badge + duration */}
              <div className="flex items-center gap-2 mb-2 pr-12">
                <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                  isCompleted ? "bg-primary/10 text-primary" : style.badge
                }`}>
                  <IconComponent className="h-2.5 w-2.5" />
                  {tx(`dailyCare.cat.${card.category}`, lang)}
                </span>
                {displayDuration && (
                  <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
                    <Clock className="h-2.5 w-2.5" />
                    {displayDuration}
                  </span>
                )}
              </div>

              {/* Title */}
              <h4 className={`text-[13px] font-bold leading-snug mb-1 pr-6 ${
                isCompleted ? "line-through text-muted-foreground" : ""
              }`}>
                {card.title}
              </h4>

              {/* Description */}
              <p className={`text-[11px] leading-relaxed line-clamp-2 ${
                isCompleted ? "text-muted-foreground/60 line-through" : "text-muted-foreground"
              }`}>
                {card.description}
              </p>

              {/* Top-right: dismiss + completion indicator */}
              <div className="absolute top-3 right-3 flex items-center gap-1">
                {/* Dismiss (X) */}
                {!isCompleted && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => handleDismiss(e, card.id)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleDismiss(e as unknown as React.MouseEvent, card.id) }}
                    className="flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/80 transition-colors z-10"
                    title={tx("dailyCare.dismiss", lang)}
                  >
                    <X className="h-3 w-3" />
                  </span>
                )}

                {/* Completion circle */}
                <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${
                  isCompleted
                    ? "border-primary bg-primary text-white scale-110"
                    : "border-muted-foreground/30 group-hover:border-primary/50"
                }`}>
                  {isCompleted && <Check className="h-3 w-3" strokeWidth={3} />}
                </span>
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
      {visibleCards.length > 0 && completionPercent === 100 && (
        <div className="mx-5 mb-4 rounded-lg bg-primary/10 px-3 py-2.5 text-center">
          <p className="text-xs font-bold text-primary">
            {"🎉 " + tx("dailyCare.allCompleted", lang)}
          </p>
        </div>
      )}
    </div>
  )
}
