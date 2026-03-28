"use client"

import { useState } from "react"
import { useLang } from "@/components/layout/language-toggle"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Sun, Sunset, Moon, Coffee, Apple, Utensils, AlertTriangle } from "lucide-react"

const CHRONOTYPES = [
  {
    type: "early_bird",
    label: { en: "Early Bird (Lion)", tr: "Erken Kuş (Aslan)" },
    emoji: "🦁",
    wakeTime: "06:00",
    sleepTime: "22:00",
    meals: [
      { time: "07:00", label: { en: "Breakfast (main meal)", tr: "Kahvaltı (ana öğün)" }, tip: { en: "Largest meal — your metabolism peaks in the morning", tr: "En büyük öğün — metabolizman sabah zirve yapar" } },
      { time: "12:00", label: { en: "Lunch (moderate)", tr: "Öğle (orta)" }, tip: { en: "Balanced meal, include protein", tr: "Dengeli öğün, protein ekle" } },
      { time: "18:00", label: { en: "Dinner (light)", tr: "Akşam (hafif)" }, tip: { en: "Light dinner, finish 3-4h before bed", tr: "Hafif akşam yemeği, yatmadan 3-4 saat önce bitir" } },
    ],
    caffeineStop: "14:00",
    lastMeal: "19:00",
  },
  {
    type: "intermediate",
    label: { en: "Intermediate (Bear)", tr: "Ortalama (Ayı)" },
    emoji: "🐻",
    wakeTime: "07:30",
    sleepTime: "23:00",
    meals: [
      { time: "08:30", label: { en: "Breakfast", tr: "Kahvaltı" }, tip: { en: "Good start to the day", tr: "Güne iyi bir başlangıç" } },
      { time: "12:30", label: { en: "Lunch (main meal)", tr: "Öğle (ana öğün)" }, tip: { en: "Peak digestion — your biggest meal", tr: "Sindirimin zirvesi — en büyük öğünün" } },
      { time: "19:00", label: { en: "Dinner (moderate)", tr: "Akşam (orta)" }, tip: { en: "Moderate portions, complex carbs OK", tr: "Orta porsiyon, kompleks karbonhidrat uygun" } },
    ],
    caffeineStop: "15:00",
    lastMeal: "20:00",
  },
  {
    type: "night_owl",
    label: { en: "Night Owl (Wolf)", tr: "Gece Kuşu (Kurt)" },
    emoji: "🐺",
    wakeTime: "09:00",
    sleepTime: "00:30",
    meals: [
      { time: "10:00", label: { en: "Brunch", tr: "Brunch" }, tip: { en: "Light start — your cortisol rises later", tr: "Hafif başla — kortizolün daha geç yükselir" } },
      { time: "14:00", label: { en: "Lunch (main meal)", tr: "Öğle (ana öğün)" }, tip: { en: "Your metabolic peak — eat well", tr: "Metabolik zirven — iyi ye" } },
      { time: "20:00", label: { en: "Dinner", tr: "Akşam" }, tip: { en: "No heavy carbs — protein + veggies", tr: "Ağır karbonhidrat yok — protein + sebze" } },
    ],
    caffeineStop: "16:00",
    lastMeal: "21:00",
  },
]

export default function CircadianEatingPage() {
  const { lang } = useLang()
  const [selected, setSelected] = useState<string>("intermediate")

  const chronotype = CHRONOTYPES.find(c => c.type === selected)!

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Clock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">{lang === "tr" ? "Sirkadyen Yemek Zamanlama" : "Circadian Meal Timing"}</h1>
          <p className="text-muted-foreground mt-1">{lang === "tr" ? "Ne yediğin kadar NE ZAMAN yediğin önemli" : "WHEN you eat matters as much as WHAT you eat"}</p>
        </div>

        {/* Chronotype selector */}
        <div className="flex gap-2 mb-6 justify-center">
          {CHRONOTYPES.map(c => (
            <Button key={c.type} variant={selected === c.type ? "default" : "outline"} onClick={() => setSelected(c.type)} className="flex-col h-auto py-3">
              <span className="text-2xl mb-1">{c.emoji}</span>
              <span className="text-xs">{c.label[lang]}</span>
            </Button>
          ))}
        </div>

        {/* Schedule */}
        <Card className="p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground flex items-center gap-1"><Sun className="w-4 h-4" /> {chronotype.wakeTime}</span>
            <span className="text-sm text-muted-foreground flex items-center gap-1"><Moon className="w-4 h-4" /> {chronotype.sleepTime}</span>
          </div>
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />
            {chronotype.meals.map((meal, i) => (
              <div key={i} className="relative pl-14 pb-6 last:pb-0">
                <div className="absolute left-2 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center border-2 border-background z-10">
                  {i === 0 ? <Coffee className="w-3.5 h-3.5 text-primary" /> : i === 1 ? <Utensils className="w-3.5 h-3.5 text-primary" /> : <Apple className="w-3.5 h-3.5 text-primary" />}
                </div>
                <div className="text-xs font-mono text-muted-foreground mb-1">{meal.time}</div>
                <h4 className="font-medium text-sm">{meal.label[lang]}</h4>
                <p className="text-xs text-muted-foreground mt-1">{meal.tip[lang]}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Key rules */}
        <div className="space-y-3">
          <Card className="p-4 flex items-start gap-3">
            <Coffee className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">{lang === "tr" ? "Kafein Kesim Saati" : "Caffeine Cutoff"}</p>
              <p className="text-sm text-muted-foreground">{chronotype.caffeineStop} — {lang === "tr" ? "bu saatten sonra kafein yok" : "no caffeine after this time"}</p>
            </div>
          </Card>
          <Card className="p-4 flex items-start gap-3">
            <Sunset className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">{lang === "tr" ? "Son Yemek" : "Last Meal"}</p>
              <p className="text-sm text-muted-foreground">{chronotype.lastMeal} — {lang === "tr" ? "yatmadan en az 3 saat önce" : "at least 3 hours before bed"}</p>
            </div>
          </Card>
          <Card className="p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">{lang === "tr" ? "İlaç Zamanlaması" : "Medication Timing"}</p>
              <p className="text-sm text-muted-foreground">{lang === "tr" ? "Yemek zamanlarını değiştirirsen ilaç saatlerini de gözden geçir" : "If you change meal times, review medication timing too"}</p>
            </div>
          </Card>
        </div>

        {/* Evidence */}
        <Card className="p-4 mt-6 bg-primary/5 border-primary/30">
          <p className="text-xs text-muted-foreground">
            {lang === "tr"
              ? "📚 Kanıt: Sirkadyen beslenme araştırmaları, geç saatlerde yemenin metabolik sendrom riskini %40 artırdığını gösteriyor (Cell Metabolism 2022). Kronotipin göre beslenme kilo yönetimi ve uyku kalitesini iyileştirir."
              : "📚 Evidence: Circadian nutrition research shows late-night eating increases metabolic syndrome risk by 40% (Cell Metabolism 2022). Chronotype-aligned eating improves weight management and sleep quality."}
          </p>
        </Card>
      </div>
    </div>
  )
}
