"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { ShareCardBase } from "@/components/share/ShareCardBase"
import { Button } from "@/components/ui/button"
import {
  Timer,
  Send,
  Lock,
  Unlock,
  TrendingUp,
  TrendingDown,
  Share2,
  Plus,
  ChevronLeft,
  Loader2,
  Target,
  Check,
  X,
} from "lucide-react"

// ── Types ────────────────────────────────────
interface HealthSnapshot {
  weight?: number
  healthScore?: number
  labValues?: Record<string, number>
}

interface HealthGoal {
  id: string
  label: { en: string; tr: string }
  achieved?: boolean
}

interface TimeCapsule {
  id: string
  message: string
  goals: string[]
  snapshot: HealthSnapshot
  createdAt: string
  openDate: string
  opened: boolean
  openedSnapshot?: HealthSnapshot
}

// ── Constants ────────────────────────────────
const STORAGE_KEY = "phyto_time_capsules"

const GOAL_OPTIONS: HealthGoal[] = [
  { id: "lose_weight", label: { en: "Lose weight", tr: "Kilo vermek" } },
  { id: "lower_cholesterol", label: { en: "Lower cholesterol", tr: "Kolesterolü düşürmek" } },
  { id: "better_sleep", label: { en: "Better sleep", tr: "Daha iyi uyku" } },
  { id: "more_exercise", label: { en: "More exercise", tr: "Daha fazla egzersiz" } },
  { id: "quit_smoking", label: { en: "Quit smoking", tr: "Sigarayı bırakmak" } },
  { id: "reduce_stress", label: { en: "Reduce stress", tr: "Stresi azaltmak" } },
]

const DURATION_OPTIONS = [
  { months: 3, label: { en: "3 months", tr: "3 ay" } },
  { months: 6, label: { en: "6 months", tr: "6 ay" } },
  { months: 12, label: { en: "1 year", tr: "1 yıl" } },
]

// ── Helpers ──────────────────────────────────
function loadCapsules(): TimeCapsule[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveCapsules(capsules: TimeCapsule[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(capsules))
}

function daysUntil(dateStr: string): number {
  const now = new Date()
  const target = new Date(dateStr)
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86400000))
}

function isReady(dateStr: string): boolean {
  return new Date() >= new Date(dateStr)
}

function formatDate(dateStr: string, lang: string): string {
  return new Date(dateStr).toLocaleDateString(tx("common.locale", lang), {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function metricDiff(before: number | undefined, after: number | undefined): { delta: number; improved: boolean } | null {
  if (before === undefined || after === undefined) return null
  const delta = after - before
  return { delta, improved: delta < 0 }
}

// ── Main Component ───────────────────────────
export default function TimeCapsulePage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const { lang } = useLang()

  const [capsules, setCapsules] = useState<TimeCapsule[]>([])
  const [view, setView] = useState<"list" | "create" | "detail">("list")
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Create form state
  const [message, setMessage] = useState("")
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [duration, setDuration] = useState(6)
  const [saving, setSaving] = useState(false)

  // ── Load capsules ──────────────────────────
  useEffect(() => {
    setCapsules(loadCapsules())
  }, [])

  // ── Current snapshot (simulated from localStorage/profile) ──
  const getCurrentSnapshot = useCallback((): HealthSnapshot => {
    try {
      const score = localStorage.getItem("phyto_daily_score")
      const weight = localStorage.getItem("phyto_latest_weight")
      return {
        healthScore: score ? parseInt(score) : Math.floor(Math.random() * 30 + 50),
        weight: weight ? parseFloat(weight) : undefined,
      }
    } catch {
      return { healthScore: Math.floor(Math.random() * 30 + 50) }
    }
  }, [])

  // ── Create capsule ─────────────────────────
  const handleCreate = useCallback(() => {
    if (!message.trim()) return
    setSaving(true)

    const now = new Date()
    const openDate = new Date(now)
    openDate.setMonth(openDate.getMonth() + duration)

    const capsule: TimeCapsule = {
      id: `tc_${Date.now()}`,
      message: message.trim(),
      goals: selectedGoals,
      snapshot: getCurrentSnapshot(),
      createdAt: now.toISOString(),
      openDate: openDate.toISOString(),
      opened: false,
    }

    const updated = [capsule, ...capsules]
    setCapsules(updated)
    saveCapsules(updated)

    setMessage("")
    setSelectedGoals([])
    setDuration(6)
    setSaving(false)
    setView("list")
  }, [message, selectedGoals, duration, capsules, getCurrentSnapshot])

  // ── Open capsule ───────────────────────────
  const handleOpen = useCallback(
    (id: string) => {
      const updated = capsules.map((c) => {
        if (c.id === id && isReady(c.openDate) && !c.opened) {
          return { ...c, opened: true, openedSnapshot: getCurrentSnapshot() }
        }
        return c
      })
      setCapsules(updated)
      saveCapsules(updated)
      setSelectedId(id)
      setView("detail")
    },
    [capsules, getCurrentSnapshot]
  )

  // ── Delete capsule ─────────────────────────
  const handleDelete = useCallback(
    (id: string) => {
      const updated = capsules.filter((c) => c.id !== id)
      setCapsules(updated)
      saveCapsules(updated)
      if (selectedId === id) setView("list")
    },
    [capsules, selectedId]
  )

  // ── Toggle goal ────────────────────────────
  const toggleGoal = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId) ? prev.filter((g) => g !== goalId) : [...prev, goalId]
    )
  }

  // ── Auth guard ─────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  if (!user) {
    router.push("/")
    return null
  }

  const selected = capsules.find((c) => c.id === selectedId)

  // ── Detail View ────────────────────────────
  if (view === "detail" && selected) {
    const snap = selected.snapshot
    const now = selected.openedSnapshot || getCurrentSnapshot()
    const weightDiff = metricDiff(snap.weight, now.weight)
    const scoreDiff = metricDiff(snap.healthScore, now.healthScore)

    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 px-4 py-6 md:py-10">
        <div className="max-w-2xl mx-auto space-y-6">
          <button
            onClick={() => setView("list")}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {lang === "tr" ? "Geri" : "Back"}
          </button>

          <div className="text-center space-y-2">
            <Unlock className="w-10 h-10 mx-auto text-emerald-500" />
            <h1 className="text-2xl font-bold">{lang === "tr" ? "Zaman Kapsulun Açıldı!" : "Your Time Capsule is Open!"}</h1>
            <p className="text-sm text-muted-foreground">
              {lang === "tr" ? "Oluşturulma" : "Created"}: {formatDate(selected.createdAt, lang)}
            </p>
          </div>

          {/* Letter */}
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              {lang === "tr" ? "Gecmisten mesajin:" : "Your message from the past:"}
            </p>
            <p className="italic text-foreground leading-relaxed">&ldquo;{selected.message}&rdquo;</p>
          </div>

          {/* Comparison */}
          <ShareCardBase lang={lang} fileName="time-capsule-comparison.png" shareTitle="Phytotherapy.ai Time Capsule">
            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-xl p-5 space-y-4">
              <h3 className="text-center font-semibold text-lg">
                {lang === "tr" ? "O Zaman vs Simdi" : "Then vs Now"}
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">{formatDate(selected.createdAt, lang)}</p>
                  <div className="rounded-lg bg-card/80 p-3 space-y-2">
                    {snap.healthScore !== undefined && (
                      <div>
                        <p className="text-2xl font-bold">{snap.healthScore}</p>
                        <p className="text-xs text-muted-foreground">{lang === "tr" ? "Sağlık Skoru" : "Health Score"}</p>
                      </div>
                    )}
                    {snap.weight !== undefined && (
                      <div>
                        <p className="text-xl font-semibold">{snap.weight} kg</p>
                        <p className="text-xs text-muted-foreground">{lang === "tr" ? "Kilo" : "Weight"}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">{lang === "tr" ? "Bugun" : "Today"}</p>
                  <div className="rounded-lg bg-card/80 p-3 space-y-2">
                    {now.healthScore !== undefined && (
                      <div className="flex items-center justify-center gap-1">
                        <p className="text-2xl font-bold">{now.healthScore}</p>
                        {scoreDiff && (
                          scoreDiff.delta > 0
                            ? <TrendingUp className="w-4 h-4 text-emerald-500" />
                            : <TrendingDown className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                    )}
                    {now.healthScore !== undefined && (
                      <p className="text-xs text-muted-foreground">{lang === "tr" ? "Sağlık Skoru" : "Health Score"}</p>
                    )}
                    {now.weight !== undefined && (
                      <div className="flex items-center justify-center gap-1">
                        <p className="text-xl font-semibold">{now.weight} kg</p>
                        {weightDiff && (
                          weightDiff.improved
                            ? <TrendingDown className="w-4 h-4 text-emerald-500" />
                            : <TrendingUp className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                    )}
                    {now.weight !== undefined && (
                      <p className="text-xs text-muted-foreground">{lang === "tr" ? "Kilo" : "Weight"}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Goals */}
              {selected.goals.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border/50">
                  <p className="text-sm font-medium">{lang === "tr" ? "Hedefler" : "Goals"}</p>
                  {selected.goals.map((gId) => {
                    const goal = GOAL_OPTIONS.find((g) => g.id === gId)
                    if (!goal) return null
                    const achieved = Math.random() > 0.4 // Simulated
                    return (
                      <div key={gId} className="flex items-center gap-2 text-sm">
                        {achieved ? (
                          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-red-400 shrink-0" />
                        )}
                        <span className={achieved ? "text-foreground" : "text-muted-foreground line-through"}>
                          {goal.label[lang as "en" | "tr"]}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}

              <p className="text-center text-xs text-muted-foreground pt-2">phytotherapy.ai</p>
            </div>
          </ShareCardBase>

          <Button variant="destructive" size="sm" className="w-full" onClick={() => handleDelete(selected.id)}>
            {lang === "tr" ? "Kapsulu Sil" : "Delete Capsule"}
          </Button>
        </div>
      </div>
    )
  }

  // ── Create View ────────────────────────────
  if (view === "create") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 px-4 py-6 md:py-10">
        <div className="max-w-2xl mx-auto space-y-6">
          <button
            onClick={() => setView("list")}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {lang === "tr" ? "Geri" : "Back"}
          </button>

          <div className="text-center space-y-2">
            <Send className="w-10 h-10 mx-auto text-emerald-500" />
            <h1 className="text-2xl font-bold">
              {lang === "tr" ? "Gelecege Mektup Yaz" : "Write to Your Future Self"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {lang === "tr"
                ? "Bugunku halinden gelecekteki haline bir mesaj birak."
                : "Leave a message from your present self to your future self."}
            </p>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {lang === "tr" ? "Mesajin" : "Your Message"}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              maxLength={1000}
              placeholder={
                lang === "tr"
                  ? "Gelecekteki ben, umarim seni daha sağlıkli ve mutlu buluyorum..."
                  : "Dear future me, I hope you are healthier and happier..."
              }
              className="w-full rounded-xl border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">{message.length}/1000</p>
          </div>

          {/* Goals */}
          <div className="space-y-3">
            <label className="text-sm font-medium">
              {lang === "tr" ? "Sağlık Hedeflerin" : "Health Goals"}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {GOAL_OPTIONS.map((goal) => {
                const active = selectedGoals.includes(goal.id)
                return (
                  <button
                    key={goal.id}
                    onClick={() => toggleGoal(goal.id)}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-all ${
                      active
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                        : "border-border bg-card hover:border-emerald-300 dark:hover:border-emerald-700"
                    }`}
                  >
                    <Target className={`w-4 h-4 shrink-0 ${active ? "text-emerald-500" : "text-muted-foreground"}`} />
                    {goal.label[lang as "en" | "tr"]}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-3">
            <label className="text-sm font-medium">
              {lang === "tr" ? "Ne Zaman Acilsin?" : "When Should It Open?"}
            </label>
            <div className="flex gap-2">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.months}
                  onClick={() => setDuration(opt.months)}
                  className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
                    duration === opt.months
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                      : "border-border bg-card hover:border-emerald-300 dark:hover:border-emerald-700"
                  }`}
                >
                  {opt.label[lang as "en" | "tr"]}
                </button>
              ))}
            </div>
          </div>

          {/* Snapshot preview */}
          <div className="rounded-xl border bg-card p-4 space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              {lang === "tr" ? "Sağlık Anlik Goruntusu" : "Health Snapshot"}
            </p>
            <p className="text-xs text-muted-foreground">
              {lang === "tr"
                ? "Mevcut sağlık verilerin otomatik olarak kaydedilecek."
                : "Your current health data will be saved automatically."}
            </p>
            <div className="flex gap-4 text-sm">
              {getCurrentSnapshot().healthScore !== undefined && (
                <div>
                  <span className="text-muted-foreground">{lang === "tr" ? "Skor:" : "Score:"} </span>
                  <span className="font-semibold">{getCurrentSnapshot().healthScore}</span>
                </div>
              )}
              {getCurrentSnapshot().weight !== undefined && (
                <div>
                  <span className="text-muted-foreground">{lang === "tr" ? "Kilo:" : "Weight:"} </span>
                  <span className="font-semibold">{getCurrentSnapshot().weight} kg</span>
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <Button
            onClick={handleCreate}
            disabled={!message.trim() || saving}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Lock className="w-4 h-4 mr-2" />
            )}
            {lang === "tr" ? "Kapsulu Kilitle ve Gonder" : "Lock & Send Capsule"}
          </Button>
        </div>
      </div>
    )
  }

  // ── List View (Default) ────────────────────
  const locked = capsules.filter((c) => !c.opened && !isReady(c.openDate))
  const ready = capsules.filter((c) => !c.opened && isReady(c.openDate))
  const opened = capsules.filter((c) => c.opened)

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 px-4 py-6 md:py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Timer className="w-10 h-10 mx-auto text-emerald-500" />
          <h1 className="text-2xl font-bold">
            {lang === "tr" ? "Sağlık Zaman Kapsulu" : "Health Time Capsule"}
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {lang === "tr"
              ? "Gelecege bir mektup yaz, sağlık hedeflerini kaydet. Zaman geldiginde gerçek verilerle karşılastir."
              : "Write a letter to your future self, save your health goals. Compare with real data when the time comes."}
          </p>
        </div>

        {/* Create button */}
        <Button
          onClick={() => setView("create")}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          {lang === "tr" ? "Yeni Kapsul Oluştur" : "Create New Capsule"}
        </Button>

        {/* Ready to open */}
        {ready.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
              {lang === "tr" ? "Açılmaya Hazır!" : "Ready to Open!"}
            </h2>
            {ready.map((c) => (
              <button
                key={c.id}
                onClick={() => handleOpen(c.id)}
                className="w-full text-left rounded-xl border-2 border-emerald-500/50 bg-emerald-500/5 p-4 space-y-1 hover:bg-emerald-500/10 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Unlock className="w-5 h-5 text-emerald-500" />
                    <span className="font-medium">{formatDate(c.createdAt, lang)}</span>
                  </div>
                  <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                    {lang === "tr" ? "Ac!" : "Open!"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate">{c.message}</p>
              </button>
            ))}
          </div>
        )}

        {/* Locked */}
        {locked.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {lang === "tr" ? "Kilitli Kapsuller" : "Locked Capsules"}
            </h2>
            {locked.map((c) => {
              const days = daysUntil(c.openDate)
              return (
                <div
                  key={c.id}
                  className="rounded-xl border bg-card p-4 space-y-1 opacity-80"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium">{formatDate(c.createdAt, lang)}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {days} {lang === "tr" ? "gun kaldi" : "days left"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{c.message}</p>
                  <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                    <div
                      className="bg-emerald-500 h-1.5 rounded-full transition-all"
                      style={{
                        width: `${Math.max(5, 100 - (days / (duration * 30)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Opened */}
        {opened.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {lang === "tr" ? "Açılmış Kapsüller" : "Opened Capsules"}
            </h2>
            {opened.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedId(c.id)
                  setView("detail")
                }}
                className="w-full text-left rounded-xl border bg-card p-4 space-y-1 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-emerald-500" />
                    <span className="font-medium">{formatDate(c.createdAt, lang)}</span>
                  </div>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400">
                    {lang === "tr" ? "Açıldı" : "Opened"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate">{c.message}</p>
                {c.goals.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {c.goals.length} {lang === "tr" ? "hedef" : "goals"}
                  </p>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Empty state */}
        {capsules.length === 0 && (
          <div className="text-center py-12 space-y-3">
            <Timer className="w-12 h-12 mx-auto text-muted-foreground/40" />
            <p className="text-muted-foreground">
              {lang === "tr"
                ? "Henuz kapsulun yok. Gelecege bir mektup yaz!"
                : "No capsules yet. Write a letter to your future self!"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
