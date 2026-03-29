"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { createBrowserClient } from "@/lib/supabase"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, AlertTriangle, ArrowRight, Pill, Coffee, Sun, Moon, Utensils, Loader2 } from "lucide-react"

interface DrugTiming {
  name: string
  stomach: "empty" | "with_food" | "any"
  bestTime: "morning" | "evening" | "with_meals" | "bedtime" | "any"
  hoursApart: Record<string, number>
  notes: { en: string; tr: string }
}

const DRUG_TIMING_DB: DrugTiming[] = [
  { name: "Levothyroxine", stomach: "empty", bestTime: "morning", hoursApart: { Calcium: 4, Iron: 4, PPI: 4, Antacids: 4, Soy: 4 }, notes: { en: "Take 30-60min before breakfast. Most absorption-sensitive drug.", tr: "Kahvaltıdan 30-60dk önce al. Emilimi en çok etkilenen ilaç." } },
  { name: "Metformin", stomach: "with_food", bestTime: "with_meals", hoursApart: {}, notes: { en: "Take with meals to reduce GI side effects.", tr: "Mide yan etkilerini azaltmak için yemekle al." } },
  { name: "Omeprazole", stomach: "empty", bestTime: "morning", hoursApart: { Clopidogrel: 12 }, notes: { en: "Take 30min before first meal of the day.", tr: "Günün ilk yemeğinden 30dk önce al." } },
  { name: "Atorvastatin", stomach: "any", bestTime: "evening", hoursApart: {}, notes: { en: "Evening dosing is slightly better due to cholesterol synthesis.", tr: "Kolesterol sentezi nedeniyle akşam almak biraz daha iyi." } },
  { name: "Amlodipine", stomach: "any", bestTime: "evening", hoursApart: {}, notes: { en: "Consistent timing matters more than specific time.", tr: "Belirli saatten çok, tutarlı zamanlama önemli." } },
  { name: "Lisinopril", stomach: "any", bestTime: "morning", hoursApart: { Potassium: 0, NSAIDs: 0 }, notes: { en: "Monitor potassium levels. Avoid NSAIDs if possible.", tr: "Potasyum seviyelerini izle. Mümkünse NSAİİ'lerden kaçın." } },
  { name: "Aspirin", stomach: "with_food", bestTime: "morning", hoursApart: { Ibuprofen: 2 }, notes: { en: "Take with food to protect stomach.", tr: "Mideyi korumak için yemekle al." } },
  { name: "Iron", stomach: "empty", bestTime: "morning", hoursApart: { Calcium: 2, Levothyroxine: 4, Antacids: 2, Tetracycline: 2 }, notes: { en: "Take with vitamin C for better absorption. Avoid tea/coffee 1h.", tr: "Daha iyi emilim için C vitaminiyle al. Çay/kahve 1 saat kaçın." } },
  { name: "Calcium", stomach: "with_food", bestTime: "any", hoursApart: { Iron: 2, Levothyroxine: 4, Bisphosphonates: 2 }, notes: { en: "Max 500mg per dose. Split if taking more.", tr: "Doz başına maks 500mg. Daha fazla alıyorsan böl." } },
  { name: "Vitamin D", stomach: "with_food", bestTime: "morning", hoursApart: {}, notes: { en: "Take with a fat-containing meal for best absorption.", tr: "En iyi emilim için yağlı yemekle al." } },
  { name: "Magnesium", stomach: "any", bestTime: "evening", hoursApart: { Antibiotics: 2, Bisphosphonates: 2 }, notes: { en: "Glycinate form best for sleep. Can cause loose stool.", tr: "Uyku için glisinit formu en iyi. İshal yapabilir." } },
  { name: "Warfarin", stomach: "any", bestTime: "evening", hoursApart: {}, notes: { en: "Consistent timing daily. Avoid sudden vitamin K changes.", tr: "Her gün aynı saatte al. Ani K vitamini değişimlerinden kaçın." } },
  { name: "Methotrexate", stomach: "any", bestTime: "any", hoursApart: { NSAIDs: 24, Folate: 24 }, notes: { en: "Weekly dosing. Take folic acid on OTHER days.", tr: "Haftalık dozlama. Folik asidi DİĞER günlerde al." } },
  { name: "Bisphosphonates", stomach: "empty", bestTime: "morning", hoursApart: { Calcium: 2, Iron: 2, Food: 0.5 }, notes: { en: "Take first thing, stay upright 30min, wait 30min before food.", tr: "Sabah ilk iş al, 30dk dik dur, yemekten 30dk önce." } },
  { name: "Probiotic", stomach: "empty", bestTime: "morning", hoursApart: { Antibiotics: 2 }, notes: { en: "Take before breakfast. Keep 2h apart from antibiotics.", tr: "Kahvaltıdan önce al. Antibiyotiklerle 2 saat ara bırak." } },
]

export default function DrugTimingPage() {
  const { user } = useAuth()
  const { lang } = useLang()
  const [userMeds, setUserMeds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMed, setSelectedMed] = useState<string | null>(null)

  useEffect(() => {
    loadMedications()
  }, [user])

  const loadMedications = async () => {
    if (!user) { setLoading(false); return }
    try {
      const supabase = createBrowserClient()
      const { data } = await supabase.from("user_medications").select("brand_name, generic_name").eq("user_id", user.id)
      if (data) setUserMeds(data.map((d: any) => (d.generic_name || d.brand_name)))
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const getTimingInfo = (medName: string): DrugTiming | null => {
    return DRUG_TIMING_DB.find(d => medName.toLowerCase().includes(d.name.toLowerCase())) || null
  }

  const getConflicts = () => {
    const conflicts: { med1: string; med2: string; hours: number }[] = []
    const matched = userMeds.map(m => ({ name: m, timing: getTimingInfo(m) })).filter(m => m.timing)
    for (let i = 0; i < matched.length; i++) {
      for (let j = i + 1; j < matched.length; j++) {
        const t1 = matched[i].timing!
        const t2 = matched[j].timing!
        const hours = t1.hoursApart[t2.name] || t2.hoursApart[t1.name]
        if (hours) conflicts.push({ med1: matched[i].name, med2: matched[j].name, hours })
      }
    }
    return conflicts
  }

  const StomachBadge = ({ type }: { type: string }) => {
    const colors: Record<string, string> = {
      empty: "bg-amber-500/10 text-amber-600 border-amber-500/30",
      with_food: "bg-green-500/10 text-green-600 border-green-500/30",
      any: "bg-blue-500/10 text-blue-600 border-blue-500/30",
    }
    const labels: Record<string, Record<string, string>> = {
      empty: { en: "Empty stomach", tr: "Aç karnına" },
      with_food: { en: "With food", tr: "Yemekle" },
      any: { en: "Any time", tr: "Her zaman" },
    }
    return <Badge className={colors[type]}>{labels[type]?.[lang]}</Badge>
  }

  const TimeBadge = ({ time }: { time: string }) => {
    const icons: Record<string, any> = { morning: Sun, evening: Moon, with_meals: Utensils, bedtime: Moon, any: Clock }
    const labels: Record<string, Record<string, string>> = {
      morning: { en: "Morning", tr: "Sabah" },
      evening: { en: "Evening", tr: "Akşam" },
      with_meals: { en: "With meals", tr: "Yemeklerle" },
      bedtime: { en: "Bedtime", tr: "Yatmadan önce" },
      any: { en: "Any time", tr: "Herhangi" },
    }
    const Icon = icons[time] || Clock
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Icon className="w-3 h-3" />{labels[time]?.[lang]}
      </span>
    )
  }

  const conflicts = getConflicts()


  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Clock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{tx("drugTiming.title", lang)}</h1>
          <p className="text-muted-foreground mt-1">{tx("drugTiming.subtitle", lang)}</p>
        </div>

        {/* Conflicts */}
        {conflicts.length > 0 && (
          <Card className="p-5 mb-6 border-amber-500/30 bg-amber-500/5">
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              {tx("drugTiming.conflicts", lang)}
            </h3>
            <div className="space-y-2">
              {conflicts.map((c, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <Badge variant="outline">{c.med1}</Badge>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-amber-600">{c.hours} {tx("drugTiming.hoursApart", lang)}</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <Badge variant="outline">{c.med2}</Badge>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* User's medications timing */}
        {userMeds.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">{tx("drugTiming.yourMeds", lang)}</h2>
            <div className="space-y-3">
              {userMeds.map(med => {
                const timing = getTimingInfo(med)
                return (
                  <Card key={med} className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium flex items-center gap-2">
                          <Pill className="w-4 h-4 text-primary" />{med}
                        </h4>
                        {timing ? (
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center gap-2">
                              <StomachBadge type={timing.stomach} />
                              <TimeBadge time={timing.bestTime} />
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{timing.notes[lang]}</p>
                            {Object.keys(timing.hoursApart).length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {Object.entries(timing.hoursApart).map(([drug, hrs]) => (
                                  <Badge key={drug} variant="outline" className="text-xs">
                                    {drug}: {hrs}h
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground mt-1">
                            {tx("drugTiming.noTimingInfo", lang)}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {userMeds.length === 0 && (
          <Card className="p-8 text-center mb-8">
            <Pill className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">{tx("drugTiming.noMeds", lang)}</p>
            <Button className="mt-4" onClick={() => window.location.href = "/profile"}>
              {tx("drugTiming.goToProfile", lang)}
            </Button>
          </Card>
        )}

        {/* Full timing guide */}
        <h2 className="text-lg font-semibold mb-4">{tx("drugTiming.timingGuide", lang)}</h2>
        <div className="space-y-3">
          {DRUG_TIMING_DB.map(drug => (
            <Card key={drug.name} className="p-4 cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => setSelectedMed(selectedMed === drug.name ? null : drug.name)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Pill className="w-4 h-4 text-primary" />
                  <span className="font-medium">{drug.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <StomachBadge type={drug.stomach} />
                  <TimeBadge time={drug.bestTime} />
                </div>
              </div>
              {selectedMed === drug.name && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-sm text-muted-foreground">{drug.notes[lang]}</p>
                  {Object.keys(drug.hoursApart).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {Object.entries(drug.hoursApart).map(([d, hrs]) => (
                        <Badge key={d} variant="outline" className="text-xs">
                          ↔ {d}: {hrs}h
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
