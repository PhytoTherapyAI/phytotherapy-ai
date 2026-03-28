"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Plus, Check, Flame, Trophy, ArrowRight, Target, Timer, Loader2 } from "lucide-react"

interface MicroHabit {
  id: string
  title: { en: string; tr: string }
  category: string
  currentLevel: number
  maxLevel: number
  levels: { en: string; tr: string }[]
  streak: number
  completedToday: boolean
}

const HABIT_TEMPLATES = [
  {
    category: "water", emoji: "💧",
    title: { en: "Drink More Water", tr: "Daha Fazla Su İç" },
    levels: [
      { en: "Drink 1 extra glass of water today", tr: "Bugün 1 ekstra bardak su iç" },
      { en: "Drink 2 extra glasses daily", tr: "Günde 2 ekstra bardak iç" },
      { en: "Drink 6 glasses daily", tr: "Günde 6 bardak iç" },
      { en: "Drink 8 glasses daily", tr: "Günde 8 bardak iç" },
    ],
  },
  {
    category: "exercise", emoji: "🏃",
    title: { en: "Move More", tr: "Daha Fazla Hareket Et" },
    levels: [
      { en: "Stand up and stretch for 2 minutes", tr: "Ayağa kalk ve 2 dakika esne" },
      { en: "Walk 5 minutes after lunch", tr: "Öğle yemeğinden sonra 5 dk yürü" },
      { en: "Walk 15 minutes daily", tr: "Günde 15 dk yürü" },
      { en: "Exercise 30 minutes daily", tr: "Günde 30 dk egzersiz yap" },
    ],
  },
  {
    category: "sleep", emoji: "😴",
    title: { en: "Better Sleep", tr: "Daha İyi Uyku" },
    levels: [
      { en: "Put phone away 15 min before bed", tr: "Yatmadan 15 dk önce telefonu bırak" },
      { en: "No screens 30 min before bed", tr: "Yatmadan 30 dk önce ekran yok" },
      { en: "Fixed bedtime ±30 min", tr: "Sabit yatma saati ±30 dk" },
      { en: "Full sleep routine (no screens, dim lights, cool room)", tr: "Tam uyku rutini (ekran yok, loş ışık, serin oda)" },
    ],
  },
  {
    category: "meditation", emoji: "🧘",
    title: { en: "Mindfulness", tr: "Farkındalık" },
    levels: [
      { en: "Take 3 deep breaths right now", tr: "Şimdi 3 derin nefes al" },
      { en: "2 minutes of focused breathing daily", tr: "Günde 2 dk odaklanmış nefes" },
      { en: "5 minutes meditation daily", tr: "Günde 5 dk meditasyon" },
      { en: "10 minutes mindfulness daily", tr: "Günde 10 dk farkındalık" },
    ],
  },
  {
    category: "nutrition", emoji: "🥗",
    title: { en: "Eat Better", tr: "Daha İyi Beslen" },
    levels: [
      { en: "Add 1 serving of vegetables to any meal", tr: "Herhangi bir öğüne 1 porsiyon sebze ekle" },
      { en: "Eat fruit as snack instead of processed food", tr: "Atıştırmalık olarak işlenmiş gıda yerine meyve ye" },
      { en: "5 servings of fruits/vegetables daily", tr: "Günde 5 porsiyon meyve/sebze" },
      { en: "Balanced meals with protein, fiber, healthy fats", tr: "Protein, lif, sağlıklı yağ dengeli öğünler" },
    ],
  },
  {
    category: "supplements", emoji: "💊",
    title: { en: "Supplement Consistency", tr: "Takviye Tutarlılığı" },
    levels: [
      { en: "Take your supplements right after brushing teeth", tr: "Dişlerini fırçaladıktan hemen sonra takviyelerini al" },
      { en: "Set a daily alarm for supplements", tr: "Takviyeler için günlük alarm kur" },
      { en: "Track supplement intake in the app", tr: "Takviye alımını uygulamada takip et" },
      { en: "7-day perfect streak", tr: "7 gün mükemmel seri" },
    ],
  },
]

export default function MicroHabitsPage() {
  const { user } = useAuth()
  const { lang } = useLang()
  const [habits, setHabits] = useState<MicroHabit[]>([])
  const [showTemplates, setShowTemplates] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(`micro_habits_${user?.id || "guest"}`)
    if (saved) {
      const parsed = JSON.parse(saved)
      // Reset completedToday if not today
      const today = new Date().toDateString()
      const lastDate = localStorage.getItem(`habit_date_${user?.id || "guest"}`)
      if (lastDate !== today) {
        parsed.forEach((h: MicroHabit) => { h.completedToday = false })
        localStorage.setItem(`habit_date_${user?.id || "guest"}`, today)
      }
      setHabits(parsed)
    }
  }, [user])

  const saveHabits = (h: MicroHabit[]) => {
    setHabits(h)
    localStorage.setItem(`micro_habits_${user?.id || "guest"}`, JSON.stringify(h))
  }

  const addHabit = (templateIdx: number) => {
    const tmpl = HABIT_TEMPLATES[templateIdx]
    const habit: MicroHabit = {
      id: Date.now().toString(),
      title: tmpl.title,
      category: tmpl.category,
      currentLevel: 0,
      maxLevel: tmpl.levels.length - 1,
      levels: tmpl.levels,
      streak: 0,
      completedToday: false,
    }
    saveHabits([...habits, habit])
    setShowTemplates(false)
  }

  const completeHabit = (id: string) => {
    saveHabits(habits.map(h => {
      if (h.id !== id || h.completedToday) return h
      const newStreak = h.streak + 1
      const shouldLevelUp = newStreak > 0 && newStreak % 7 === 0 && h.currentLevel < h.maxLevel
      return {
        ...h,
        completedToday: true,
        streak: newStreak,
        currentLevel: shouldLevelUp ? h.currentLevel + 1 : h.currentLevel,
      }
    }))
  }

  const removeHabit = (id: string) => saveHabits(habits.filter(h => h.id !== id))

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">{lang === "tr" ? "Mikro-Alışkanlık Oluşturucu" : "Micro-Habit Builder"}</h1>
          <p className="text-muted-foreground mt-1">{lang === "tr" ? "Küçük adımlar, büyük değişimler — Atomic Habits yöntemi" : "Small steps, big changes — the Atomic Habits method"}</p>
        </div>

        <Card className="p-4 mb-6 bg-primary/5 border-primary/30">
          <p className="text-sm text-center">
            {lang === "tr"
              ? "🎯 2 Dakika Kuralı: Her alışkanlığı 2 dakikadan kısa tut. 7 günde ustalaş, sonra seviye atla."
              : "🎯 2-Minute Rule: Keep each habit under 2 minutes. Master in 7 days, then level up."}
          </p>
        </Card>

        {/* Active habits */}
        {habits.length > 0 && (
          <div className="space-y-3 mb-6">
            {habits.map(habit => (
              <Card key={habit.id} className={`p-4 ${habit.completedToday ? "border-green-500/30 bg-green-500/5" : ""}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{HABIT_TEMPLATES.find(t => t.category === habit.category)?.emoji}</span>
                      <h3 className="font-semibold text-sm">{habit.title[lang]}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {lang === "tr" ? "Seviye" : "Level"} {habit.currentLevel + 1}: {habit.levels[habit.currentLevel][lang]}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge variant="outline" className="text-xs">
                        <Flame className="w-3 h-3 mr-1 text-orange-500" />{habit.streak} {tx("common.days", lang)}
                      </Badge>
                      <div className="flex gap-0.5">
                        {Array.from({ length: habit.maxLevel + 1 }).map((_, i) => (
                          <div key={i} className={`w-2 h-2 rounded-full ${i <= habit.currentLevel ? "bg-primary" : "bg-muted"}`} />
                        ))}
                      </div>
                      {habit.currentLevel < habit.maxLevel && (
                        <span className="text-xs text-muted-foreground">
                          {7 - (habit.streak % 7)} {lang === "tr" ? "gün sonra seviye atlama" : "days to level up"}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button size="sm" variant={habit.completedToday ? "outline" : "default"} disabled={habit.completedToday} onClick={() => completeHabit(habit.id)}>
                    {habit.completedToday ? <Check className="w-4 h-4 text-green-500" /> : <Check className="w-4 h-4" />}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Button onClick={() => setShowTemplates(!showTemplates)} className="w-full mb-6" variant={showTemplates ? "outline" : "default"}>
          <Plus className="w-4 h-4 mr-2" />{lang === "tr" ? "Alışkanlık Ekle" : "Add Habit"}
        </Button>

        {showTemplates && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {HABIT_TEMPLATES.map((tmpl, i) => {
              const alreadyAdded = habits.some(h => h.category === tmpl.category)
              return (
                <button key={i} disabled={alreadyAdded} onClick={() => addHabit(i)}
                  className={`p-4 rounded-lg border text-left transition-all ${alreadyAdded ? "opacity-50" : "hover:border-primary/50 hover:bg-primary/5"}`}>
                  <span className="text-2xl">{tmpl.emoji}</span>
                  <p className="text-sm font-medium mt-2">{tmpl.title[lang]}</p>
                  <p className="text-xs text-muted-foreground mt-1">{tmpl.levels[0][lang]}</p>
                </button>
              )
            })}
          </div>
        )}

        {habits.length === 0 && !showTemplates && (
          <Card className="p-8 text-center">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">{lang === "tr" ? "Henüz alışkanlık eklemedin. Küçük başla!" : "No habits yet. Start small!"}</p>
          </Card>
        )}
      </div>
    </div>
  )
}
