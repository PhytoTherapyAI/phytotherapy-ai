// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { createBrowserClient } from "@/lib/supabase"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Pill, Sun, Sunset, Moon, Coffee, Utensils, Loader2, Sparkles, AlertTriangle, Check } from "lucide-react"

interface ScheduleSlot {
  time: string
  label: { en: string; tr: string }
  icon: any
  meds: { name: string; instruction: string; instructionTr: string }[]
}

const TIMING_RULES: Record<string, { stomach: string; bestSlot: string; notes: { en: string; tr: string } }> = {
  levothyroxine: { stomach: "empty", bestSlot: "wake", notes: { en: "30-60min before breakfast", tr: "Kahvaltıdan 30-60dk önce" } },
  metformin: { stomach: "food", bestSlot: "breakfast,dinner", notes: { en: "With meals", tr: "Yemekle birlikte" } },
  omeprazole: { stomach: "empty", bestSlot: "wake", notes: { en: "30min before first meal", tr: "İlk yemekten 30dk önce" } },
  pantoprazole: { stomach: "empty", bestSlot: "wake", notes: { en: "30min before first meal", tr: "İlk yemekten 30dk önce" } },
  atorvastatin: { stomach: "any", bestSlot: "bedtime", notes: { en: "Evening is slightly better", tr: "Akşam biraz daha iyi" } },
  simvastatin: { stomach: "any", bestSlot: "bedtime", notes: { en: "Take in the evening", tr: "Akşam al" } },
  lisinopril: { stomach: "any", bestSlot: "morning", notes: { en: "Morning, consistent time", tr: "Sabah, tutarlı saat" } },
  amlodipine: { stomach: "any", bestSlot: "evening", notes: { en: "Evening preferred", tr: "Akşam tercih edilir" } },
  aspirin: { stomach: "food", bestSlot: "breakfast", notes: { en: "With food to protect stomach", tr: "Mideyi korumak için yemekle" } },
  warfarin: { stomach: "any", bestSlot: "evening", notes: { en: "Same time daily, evening", tr: "Her gün aynı saat, akşam" } },
  iron: { stomach: "empty", bestSlot: "mid_morning", notes: { en: "With vitamin C, avoid tea/coffee", tr: "C vitaminiyle, çay/kahve kaçın" } },
  calcium: { stomach: "food", bestSlot: "lunch", notes: { en: "Max 500mg/dose, with food", tr: "Doz başına maks 500mg, yemekle" } },
  vitamin_d: { stomach: "food", bestSlot: "breakfast", notes: { en: "With fat-containing meal", tr: "Yağlı yemekle" } },
  magnesium: { stomach: "any", bestSlot: "bedtime", notes: { en: "Bedtime for better sleep", tr: "Uyku için yatmadan önce" } },
  probiotic: { stomach: "empty", bestSlot: "wake", notes: { en: "Before breakfast", tr: "Kahvaltıdan önce" } },
  melatonin: { stomach: "any", bestSlot: "bedtime", notes: { en: "30min before sleep", tr: "Uykudan 30dk önce" } },
}

const TIME_SLOTS = [
  { id: "wake", time: "07:00", label: { en: "Wake Up", tr: "Uyanış" }, icon: Sun },
  { id: "breakfast", time: "08:00", label: { en: "Breakfast", tr: "Kahvaltı" }, icon: Coffee },
  { id: "mid_morning", time: "10:00", label: { en: "Mid-Morning", tr: "Kuşluk" }, icon: Sun },
  { id: "lunch", time: "12:30", label: { en: "Lunch", tr: "Öğle Yemeği" }, icon: Utensils },
  { id: "afternoon", time: "15:00", label: { en: "Afternoon", tr: "Öğleden Sonra" }, icon: Sun },
  { id: "dinner", time: "19:00", label: { en: "Dinner", tr: "Akşam Yemeği" }, icon: Utensils },
  { id: "evening", time: "21:00", label: { en: "Evening", tr: "Akşam" }, icon: Sunset },
  { id: "bedtime", time: "23:00", label: { en: "Bedtime", tr: "Yatış" }, icon: Moon },
]

export default function MedicationSchedulePage() {
  const { user } = useAuth()
  const { lang } = useLang()
  const [userMeds, setUserMeds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [generated, setGenerated] = useState(false)

  useEffect(() => {
    loadMeds()
  }, [user])

  const loadMeds = async () => {
    if (!user) { setLoading(false); return }
    try {
      const supabase = createBrowserClient()
      const { data } = await supabase.from("user_medications").select("brand_name, generic_name").eq("user_id", user.id)
      if (data) setUserMeds(data.map((d: any) => (d.generic_name || d.brand_name)))
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const matchRule = (medName: string) => {
    const lower = medName.toLowerCase()
    for (const [key, rule] of Object.entries(TIMING_RULES)) {
      if (lower.includes(key)) return { key, ...rule }
    }
    return null
  }

  const generateSchedule = (): ScheduleSlot[] => {
    const schedule: Record<string, { name: string; instruction: string; instructionTr: string }[]> = {}
    TIME_SLOTS.forEach(s => { schedule[s.id] = [] })

    userMeds.forEach(med => {
      const rule = matchRule(med)
      if (rule) {
        const slots = rule.bestSlot.split(",")
        slots.forEach(slot => {
          if (schedule[slot]) {
            schedule[slot].push({ name: med, instruction: rule.notes.en, instructionTr: rule.notes.tr })
          }
        })
      } else {
        schedule["morning"] = schedule["morning"] || []
        schedule["breakfast"]?.push({ name: med, instruction: "Take as directed", instructionTr: "Doktorun söylediği gibi al" })
      }
    })

    return TIME_SLOTS.map(slot => ({
      time: slot.time,
      label: slot.label,
      icon: slot.icon,
      meds: schedule[slot.id] || [],
    })).filter(s => s.meds.length > 0)
  }

  const schedule = generateSchedule()

  const t = (key: string) => {
    const map: Record<string, Record<string, string>> = {
      title: { en: "Auto Medication Schedule", tr: "Otomatik İlaç Saat Planı" },
      subtitle: { en: "AI-optimized timing for all your medications", tr: "Tüm ilaçların için AI-optimize zamanlama" },
      generate: { en: "Generate Optimal Schedule", tr: "Optimal Planı Oluştur" },
      no_meds: { en: "Add medications to your profile first.", tr: "Önce profiline ilaç ekle." },
      warnings: { en: "Important Notes", tr: "Önemli Notlar" },
      add_calendar: { en: "Add to Calendar", tr: "Takvime Ekle" },
      disclaimer: { en: "This schedule is a suggestion. Always follow your doctor's instructions.", tr: "Bu plan bir önerdir. Her zaman doktorunuzun talimatlarını izleyin." },
    }
    return map[key]?.[lang] || key
  }

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
        </div>

        {userMeds.length === 0 ? (
          <Card className="p-8 text-center">
            <Pill className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">{t("no_meds")}</p>
            <Button className="mt-4" onClick={() => window.location.href = "/profile"}>
              {tx("medSchedule.goToProfile", lang)}
            </Button>
          </Card>
        ) : (
          <>
            {!generated ? (
              <div className="text-center">
                <Card className="p-6 mb-4">
                  <p className="text-sm text-muted-foreground mb-2">{tx("medSchedule.yourMeds", lang)}:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {userMeds.map(m => <Badge key={m} variant="outline"><Pill className="w-3 h-3 mr-1" />{m}</Badge>)}
                  </div>
                </Card>
                <Button size="lg" onClick={() => setGenerated(true)}>
                  <Sparkles className="w-5 h-5 mr-2" />{t("generate")}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Timeline */}
                <div className="relative">
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
                  {schedule.map((slot, i) => {
                    const Icon = slot.icon
                    return (
                      <div key={i} className="relative pl-16 pb-6">
                        <div className="absolute left-3 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center border-2 border-background z-10">
                          <Icon className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <div className="text-xs text-muted-foreground mb-1 font-mono">{slot.time}</div>
                        <Card className="p-4">
                          <h4 className="font-medium text-sm text-foreground mb-2">{slot.label[lang]}</h4>
                          <div className="space-y-2">
                            {slot.meds.map((med, j) => (
                              <div key={j} className="flex items-start gap-2">
                                <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                <div>
                                  <span className="font-medium text-sm">{med.name}</span>
                                  <p className="text-xs text-muted-foreground">
                                    {med[lang === "tr" ? "instructionTr" : "instruction"]}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </Card>
                      </div>
                    )
                  })}
                </div>

                <Card className="p-4 border-amber-500/30 bg-amber-500/5">
                  <div className="flex gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                    <p className="text-sm text-muted-foreground">{t("disclaimer")}</p>
                  </div>
                </Card>

                <Button className="w-full" variant="outline" onClick={() => window.location.href = "/calendar"}>
                  {t("add_calendar")}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
