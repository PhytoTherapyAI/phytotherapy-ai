// © 2026 Doctopal — All Rights Reserved
"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Lock, Mountain, ChevronRight, ChevronLeft, CheckCircle2, Circle, Trophy, Share2, Pill, Salad, Dumbbell, Sun, X } from "lucide-react"
import { tx, txp, type Lang } from "@/lib/translations"
import { BOSS_FIGHTS, type BossFight } from "@/lib/boss-fights"
import { ShareCardBase } from "@/components/share/ShareCardBase"
import { ShareModal } from "@/components/share/ShareModal"

interface BossFightCardProps {
  userId: string
  lang: Lang
  isPremium?: boolean
}

interface ActiveBoss {
  bossId: string
  startDate: string
  completedTasks: Record<string, boolean[]>
}

const BOSS_STORAGE_KEY = "active-boss-fight"

const taskTypeIcon = (type: string) => {
  switch (type) {
    case "supplement": return <Pill className="h-4 w-4 text-green-500" />
    case "nutrition": return <Salad className="h-4 w-4 text-amber-500" />
    case "exercise": return <Dumbbell className="h-4 w-4 text-blue-500" />
    case "lifestyle": return <Sun className="h-4 w-4 text-purple-500" />
    default: return <Circle className="h-4 w-4" />
  }
}

type ViewMode = "idle" | "select" | "detail" | "active" | "complete"

export function BossFightCard({ userId, lang, isPremium = false }: BossFightCardProps) {
  const [activeBoss, setActiveBoss] = useState<ActiveBoss | null>(null)
  const [selectedBoss, setSelectedBoss] = useState<BossFight | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("idle")
  const [showShareCard, setShowShareCard] = useState(false)

  // Load active boss from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`${BOSS_STORAGE_KEY}-${userId}`)
      if (stored) {
        const parsed = JSON.parse(stored) as ActiveBoss
        setActiveBoss(parsed)
        const boss = BOSS_FIGHTS.find(b => b.id === parsed.bossId)
        if (boss) {
          const start = new Date(parsed.startDate)
          const daysPassed = Math.max(1, Math.floor((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1)
          if (daysPassed > boss.duration) {
            setViewMode("complete")
          } else {
            setViewMode("active")
          }
        }
      }
    } catch { /* ignore */ }
  }, [userId])

  const saveBoss = useCallback((boss: ActiveBoss | null) => {
    setActiveBoss(boss)
    if (boss) {
      localStorage.setItem(`${BOSS_STORAGE_KEY}-${userId}`, JSON.stringify(boss))
    } else {
      localStorage.removeItem(`${BOSS_STORAGE_KEY}-${userId}`)
    }
  }, [userId])

  const startBoss = (boss: BossFight) => {
    const newActiveBoss: ActiveBoss = {
      bossId: boss.id,
      startDate: new Date().toISOString().split("T")[0],
      completedTasks: {},
    }
    saveBoss(newActiveBoss)
    setSelectedBoss(null)
    setViewMode("active")
  }

  const toggleTask = (taskIndex: number) => {
    if (!activeBoss) return
    const today = new Date().toISOString().split("T")[0]
    const key = `${taskIndex}-${today}`
    const newTasks = { ...activeBoss.completedTasks }
    if (newTasks[key]) {
      delete newTasks[key]
    } else {
      newTasks[key] = [true]
    }
    saveBoss({ ...activeBoss, completedTasks: newTasks })
  }

  const abandonBoss = () => {
    saveBoss(null)
    setSelectedBoss(null)
    setViewMode("idle")
  }

  const getProgress = (boss: BossFight) => {
    if (!activeBoss) return { daysPassed: 0, todayCompleted: 0, totalTasks: boss.tasks.length, overallPercent: 0 }
    const start = new Date(activeBoss.startDate)
    const daysPassed = Math.max(1, Math.floor((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1)
    const today = new Date().toISOString().split("T")[0]
    const todayCompleted = boss.tasks.filter((_, i) => activeBoss.completedTasks[`${i}-${today}`]).length
    const totalPossible = boss.duration * boss.tasks.length
    const totalCompleted = Object.keys(activeBoss.completedTasks).length
    const overallPercent = Math.min(Math.round((totalCompleted / totalPossible) * 100), 100)
    return { daysPassed, todayCompleted, totalTasks: boss.tasks.length, overallPercent }
  }

  const currentBoss = activeBoss ? BOSS_FIGHTS.find(b => b.id === activeBoss.bossId) : null

  if (!isPremium) {
    return (
      <Card className="relative overflow-hidden opacity-75">
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <Lock className="h-6 w-6 text-muted-foreground" />
            <Badge variant="secondary" className="text-xs">PREMIUM</Badge>
          </div>
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Mountain className="h-4 w-4 text-emerald-600" />
            {tx("boss.title", lang)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-20 rounded-lg bg-muted/30" />
        </CardContent>
      </Card>
    )
  }

  // ═══════════════ ACTIVE BOSS ═══════════════
  if (viewMode === "active" && currentBoss && activeBoss) {
    const progress = getProgress(currentBoss)
    const today = new Date().toISOString().split("T")[0]
    const allDone = progress.todayCompleted === progress.totalTasks

    return (
      <Card className="border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="text-xl">{currentBoss.icon}</span>
            <span className="text-sm font-bold">{currentBoss.name[lang]}</span>
            <Badge variant="secondary" className="ml-auto text-xs font-bold">
              {txp("boss.dayCounter", lang, { daysPassed: progress.daysPassed, duration: currentBoss.duration })}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{tx("boss.overallProgress", lang)}</span>
              <span className="font-bold">{progress.overallPercent}%</span>
            </div>
            <Progress value={progress.overallPercent} className="h-2.5" />
          </div>

          {/* Today's tasks header */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">
              {tx("boss.todayTasks", lang)}
            </p>
            <Badge variant={allDone ? "default" : "secondary"} className={`text-xs ${allDone ? "bg-green-500" : ""}`}>
              {progress.todayCompleted}/{progress.totalTasks}
            </Badge>
          </div>

          {/* Task list */}
          <div className="space-y-2">
            {currentBoss.tasks.map((task, i) => {
              const isDone = !!activeBoss.completedTasks[`${i}-${today}`]
              return (
                <button
                  key={i}
                  onClick={() => toggleTask(i)}
                  className={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all duration-200 ${
                    isDone
                      ? "border-green-500/40 bg-green-500/10 scale-[0.99]"
                      : "border-transparent bg-muted/30 hover:bg-muted/50 hover:border-primary/20"
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 shrink-0 text-muted-foreground/50" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {taskTypeIcon(task.type)}
                      <span className={`text-sm font-medium ${isDone ? "line-through opacity-50" : ""}`}>
                        {task.name[lang]}
                      </span>
                    </div>
                    <p className={`mt-0.5 text-xs ${isDone ? "opacity-40" : "text-muted-foreground"}`}>
                      {task.detail[lang]}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Abandon */}
          <button
            onClick={abandonBoss}
            className="w-full text-center text-xs text-muted-foreground hover:text-red-500 transition-colors pt-1"
          >
            {tx("boss.abandon", lang)}
          </button>
        </CardContent>
      </Card>
    )
  }

  // ═══════════════ COMPLETED BOSS ═══════════════
  if (viewMode === "complete" && currentBoss) {
    return (
      <>
        <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="h-5 w-5 text-amber-500" />
              {currentBoss.name[lang]}
              <Badge className="ml-auto bg-amber-500/20 text-amber-600 border-amber-500/30 text-xs font-bold">
                {tx("boss.complete", lang)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center gap-3 py-4">
              <span className="text-5xl">{currentBoss.icon}</span>
              <span className="text-4xl">🏆</span>
            </div>
            <p className="text-center text-base font-bold">{currentBoss.rewards[lang]}</p>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1" onClick={() => setShowShareCard(true)}>
                <Share2 className="mr-1.5 h-4 w-4" />
                {tx("share.share", lang)}
              </Button>
              <Button size="sm" variant="outline" className="flex-1" onClick={() => { saveBoss(null); setViewMode("select") }}>
                {tx("boss.newBoss", lang)}
              </Button>
            </div>
          </CardContent>
        </Card>

        <ShareModal open={showShareCard} onClose={() => setShowShareCard(false)}>
          <BossFightShareCard lang={lang} boss={currentBoss} />
        </ShareModal>
      </>
    )
  }

  // ═══════════════ BOSS DETAIL ═══════════════
  if (viewMode === "detail" && selectedBoss) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <button onClick={() => { setSelectedBoss(null); setViewMode("select") }} className="hover:text-primary transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-xl">{selectedBoss.icon}</span>
            <span className="text-sm font-bold">{selectedBoss.name[lang]}</span>
            <Badge variant="secondary" className="ml-auto text-xs">
              {selectedBoss.duration} {tx("supp.days", lang)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{selectedBoss.description[lang]}</p>

          <div className="space-y-2">
            <p className="text-sm font-semibold">{tx("boss.tasksLabel", lang)}</p>
            {selectedBoss.tasks.map((task, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border bg-muted/20 px-4 py-3">
                {taskTypeIcon(task.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{task.name[lang]}</p>
                  <p className="text-xs text-muted-foreground">{task.detail[lang]}</p>
                </div>
                <Badge variant="secondary" className="text-[10px] shrink-0">{task.frequency}</Badge>
              </div>
            ))}
          </div>

          <p className="text-sm font-medium text-amber-600">
            🏆 {selectedBoss.rewards[lang]}
          </p>

          <Button className="w-full" onClick={() => startBoss(selectedBoss)}>
            <Mountain className="mr-2 h-4 w-4" />
            {tx("boss.start", lang)}
          </Button>
        </CardContent>
      </Card>
    )
  }

  // ═══════════════ BOSS SELECT ═══════════════
  if (viewMode === "select") {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Mountain className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-bold">{tx("boss.choose", lang)}</span>
            <button onClick={() => setViewMode("idle")} className="ml-auto text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </button>
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {tx("boss.intro", lang)}
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          {BOSS_FIGHTS.map((boss) => (
            <button
              key={boss.id}
              onClick={() => { setSelectedBoss(boss); setViewMode("detail") }}
              className="flex w-full items-center gap-3 rounded-xl border-2 border-transparent p-3 text-left transition-all duration-200 hover:bg-muted/40 hover:border-primary/20 active:scale-[0.98]"
            >
              <span className="text-3xl">{boss.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold">{boss.name[lang]}</p>
                <p className="text-xs text-muted-foreground">{boss.tagline[lang]}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge variant="secondary" className="text-[10px]">
                  {boss.duration} {tx("supp.days", lang)}
                </Badge>
                <span className={`text-[10px] font-medium ${
                  boss.difficulty === "easy" ? "text-green-500" :
                  boss.difficulty === "medium" ? "text-amber-500" : "text-red-500"
                }`}>
                  {boss.difficulty === "easy" ? tx("boss.easy", lang) :
                   boss.difficulty === "medium" ? tx("boss.medium", lang) :
                   tx("boss.hard", lang)}
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </CardContent>
      </Card>
    )
  }

  // ═══════════════ DEFAULT — INVITE ═══════════════
  return (
    <Card className="border-red-500/10">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Mountain className="h-4 w-4 text-emerald-600" />
          <span className="text-sm font-bold">{tx("boss.title", lang)}</span>
          <Badge variant="secondary" className="ml-auto text-[10px]">PREMIUM</Badge>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {tx("boss.intro", lang)}
        </p>
      </CardHeader>
      <CardContent>
        <Button className="w-full" onClick={() => setViewMode("select")}>
          <Mountain className="mr-2 h-4 w-4" />
          {tx("boss.choose", lang)}
        </Button>
      </CardContent>
    </Card>
  )
}

// ═══════════════ SHARE CARD ═══════════════
function BossFightShareCard({ lang, boss }: { lang: Lang; boss: BossFight }) {
  const shareTextMap: Record<"en" | "tr", string> = {
    en: `I completed the ${boss.name.en} protocol! 🏆`,
    tr: `${boss.name.tr} protokolünü tamamladım! 🏆`,
  }
  return (
    <ShareCardBase
      lang={lang}
      fileName={`boss-${boss.id}.png`}
      shareTitle={boss.name[lang]}
      shareText={shareTextMap[lang]}
    >
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{
          width: "360px",
          minHeight: "420px",
          background: `linear-gradient(135deg, ${boss.color} 0%, ${boss.colorEnd} 100%)`,
          fontFamily: '"DM Sans", system-ui, sans-serif',
        }}
      >
        <div className="absolute right-4 top-16 opacity-10" style={{ fontSize: "140px", lineHeight: 1 }}>
          {boss.icon}
        </div>
        <div className="relative z-10 flex h-full flex-col p-6 text-white">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            <span className="text-sm font-semibold tracking-wide opacity-90">Doctopal</span>
          </div>
          <h2 className="mb-1 text-sm uppercase tracking-wider opacity-70">Biological Challenge</h2>
          <h3 className="mb-2 text-2xl font-extrabold">{boss.name[lang]}</h3>
          <p className="mb-6 text-sm opacity-80">{boss.tagline[lang]}</p>
          <div className="mb-6 flex items-center justify-center gap-3 rounded-xl px-5 py-4" style={{ background: "rgba(255,255,255,0.2)" }}>
            <span className="text-4xl">🏆</span>
            <div>
              <p className="text-lg font-extrabold">{tx("boss.complete", lang)}!</p>
              <p className="text-xs opacity-80">{boss.duration} {tx("boss.days", lang)} · {boss.tasks.length} {tx("boss.tasks", lang)}</p>
            </div>
          </div>
          <div className="mb-4 rounded-xl px-4 py-3 text-center" style={{ background: "rgba(255,255,255,0.15)" }}>
            <p className="text-sm font-bold">{boss.rewards[lang]}</p>
          </div>
          <div className="mt-auto flex items-center justify-between border-t border-white/20 pt-3">
            <span className="text-[10px] opacity-60">doctopal.com</span>
            <span className="text-[10px] opacity-60">{new Date().toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US")}</span>
          </div>
        </div>
      </div>
    </ShareCardBase>
  )
}
