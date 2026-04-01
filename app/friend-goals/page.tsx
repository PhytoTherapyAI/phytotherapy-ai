// © 2026 Doctopal — All Rights Reserved
"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Users, Target, Trophy, Plus, Copy, Check, Share2, Loader2, UserPlus, TrendingUp, Flame } from "lucide-react"

interface SharedGoal {
  id: string
  title: string
  targetDays: number
  currentDay: number
  partnerName: string
  partnerProgress: number
  startDate: string
  category: "water" | "exercise" | "sugar_free" | "sleep" | "meditation" | "steps" | "custom"
}

const GOAL_TEMPLATES = [
  { category: "water" as const, title: { en: "Drink 8 glasses of water daily", tr: "Günde 8 bardak su iç" }, days: 30, icon: "💧" },
  { category: "sugar_free" as const, title: { en: "30 days sugar-free", tr: "30 gün şekersiz" }, days: 30, icon: "🚫" },
  { category: "exercise" as const, title: { en: "Exercise 30min daily", tr: "Günde 30dk egzersiz" }, days: 21, icon: "🏃" },
  { category: "steps" as const, title: { en: "10,000 steps daily", tr: "Günde 10.000 adım" }, days: 30, icon: "👟" },
  { category: "sleep" as const, title: { en: "Sleep before 23:00", tr: "23:00'den önce uyu" }, days: 21, icon: "😴" },
  { category: "meditation" as const, title: { en: "5 minutes meditation daily", tr: "Günde 5dk meditasyon" }, days: 21, icon: "🧘" },
]

export default function FriendGoalsPage() {
  const { user } = useAuth()
  const { lang } = useLang()
  const [goals, setGoals] = useState<SharedGoal[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [inviteCode, setInviteCode] = useState("")
  const [joinCode, setJoinCode] = useState("")
  const [copied, setCopied] = useState(false)
  const [customTitle, setCustomTitle] = useState("")
  const [customDays, setCustomDays] = useState(30)
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem(`friend_goals_${user?.id || "guest"}`)
    if (saved) setGoals(JSON.parse(saved))
  }, [user])

  const saveGoals = (newGoals: SharedGoal[]) => {
    setGoals(newGoals)
    localStorage.setItem(`friend_goals_${user?.id || "guest"}`, JSON.stringify(newGoals))
  }

  const createGoal = () => {
    const template = selectedTemplate !== null ? GOAL_TEMPLATES[selectedTemplate] : null
    const goal: SharedGoal = {
      id: Date.now().toString(),
      title: template ? template.title[lang] : customTitle,
      targetDays: template ? template.days : customDays,
      currentDay: 0,
      partnerName: "",
      partnerProgress: 0,
      startDate: new Date().toISOString().split("T")[0],
      category: template?.category || "custom",
    }
    const code = `PH-${goal.id.slice(-6)}`
    setInviteCode(code)
    saveGoals([...goals, goal])
    setShowCreate(false)
    setSelectedTemplate(null)
    setCustomTitle("")
  }

  const incrementDay = (goalId: string) => {
    saveGoals(goals.map(g => g.id === goalId ? { ...g, currentDay: Math.min(g.currentDay + 1, g.targetDays) } : g))
  }

  const deleteGoal = (goalId: string) => {
    saveGoals(goals.filter(g => g.id !== goalId))
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      title: { en: "Friend Health Goals", tr: "Arkadaşlarla Sağlık Hedefleri" },
      subtitle: { en: "Set health goals and track together with friends", tr: "Sağlık hedefi belirle, arkadaşlarınla birlikte takip et" },
      create: { en: "Create Goal", tr: "Hedef Oluştur" },
      join: { en: "Join Goal", tr: "Hedefe Katıl" },
      templates: { en: "Goal Templates", tr: "Hedef Şablonları" },
      custom: { en: "Custom Goal", tr: "Özel Hedef" },
      goalTitle: { en: "Goal title", tr: "Hedef başlığı" },
      days: { en: "days", tr: "gün" },
      day: { en: "Day", tr: "Gün" },
      share_code: { en: "Share this code with your friend", tr: "Bu kodu arkadaşınla paylaş" },
      enter_code: { en: "Enter invite code", tr: "Davet kodunu gir" },
      check_in: { en: "Check In Today", tr: "Bugün Tamamla" },
      completed: { en: "Completed!", tr: "Tamamlandı!" },
      progress: { en: "Progress", tr: "İlerleme" },
      no_goals: { en: "No goals yet. Create one and invite a friend!", tr: "Henüz hedef yok. Bir hedef oluştur ve arkadaşını davet et!" },
      delete: { en: "Delete", tr: "Sil" },
      start: { en: "Start Goal", tr: "Hedefi Başlat" },
      or: { en: "or", tr: "veya" },
    }
    return translations[key]?.[lang] || key
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
        </div>

        <div className="flex gap-3 mb-6">
          <Button onClick={() => setShowCreate(true)} className="flex-1">
            <Plus className="w-4 h-4 mr-2" />{t("create")}
          </Button>
          <div className="flex-1 flex gap-2">
            <Input placeholder={t("enter_code")} value={joinCode} onChange={e => setJoinCode(e.target.value)} />
            <Button variant="outline" onClick={() => setJoinCode("")}>
              <UserPlus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {inviteCode && (
          <Card className="p-4 mb-6 border-primary/30 bg-primary/5">
            <p className="text-sm text-muted-foreground mb-2">{t("share_code")}</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-background px-3 py-2 rounded text-lg font-mono text-center">{inviteCode}</code>
              <Button variant="outline" size="sm" onClick={() => copyCode(inviteCode)}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
              <Button variant="outline" size="sm" onClick={() => { if (navigator.share) navigator.share({ text: inviteCode }) }}>
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        )}

        {showCreate && (
          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">{t("templates")}</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {GOAL_TEMPLATES.map((tmpl, i) => (
                <button key={i} onClick={() => setSelectedTemplate(i)}
                  className={`p-3 rounded-lg border text-left transition-all ${selectedTemplate === i ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}>
                  <span className="text-2xl">{tmpl.icon}</span>
                  <p className="text-sm font-medium mt-1">{tmpl.title[lang]}</p>
                  <p className="text-xs text-muted-foreground">{tmpl.days} {t("days")}</p>
                </button>
              ))}
            </div>
            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground mb-2">{t("or")} {t("custom")}:</p>
              <div className="flex gap-2 mb-3">
                <Input placeholder={t("goalTitle")} value={customTitle} onChange={e => setCustomTitle(e.target.value)} className="flex-1" />
                <Input type="number" value={customDays} onChange={e => setCustomDays(Number(e.target.value))} className="w-20" min={7} max={365} />
                <span className="self-center text-sm text-muted-foreground">{t("days")}</span>
              </div>
            </div>
            <Button onClick={createGoal} disabled={selectedTemplate === null && !customTitle} className="w-full mt-2">
              {t("start")}
            </Button>
          </Card>
        )}

        {goals.length === 0 && !showCreate && (
          <Card className="p-8 text-center">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">{t("no_goals")}</p>
          </Card>
        )}

        <div className="space-y-4">
          {goals.map(goal => {
            const progress = Math.round((goal.currentDay / goal.targetDays) * 100)
            const isComplete = goal.currentDay >= goal.targetDays
            return (
              <Card key={goal.id} className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{goal.title}</h3>
                    <p className="text-sm text-muted-foreground">{t("day")} {goal.currentDay}/{goal.targetDays}</p>
                  </div>
                  {isComplete ? (
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/30">
                      <Trophy className="w-3 h-3 mr-1" />{t("completed")}
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <Flame className="w-3 h-3 mr-1" />{progress}%
                    </Badge>
                  )}
                </div>
                <div className="w-full bg-muted rounded-full h-3 mb-3">
                  <div className={`h-3 rounded-full transition-all ${isComplete ? "bg-green-500" : "bg-primary"}`}
                    style={{ width: `${progress}%` }} />
                </div>
                <div className="flex gap-2">
                  {!isComplete && (
                    <Button size="sm" onClick={() => incrementDay(goal.id)}>
                      <Check className="w-4 h-4 mr-1" />{t("check_in")}
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteGoal(goal.id)}>
                    {t("delete")}
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
