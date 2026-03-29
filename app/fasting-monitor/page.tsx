"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { createBrowserClient } from "@/lib/supabase"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Moon, Sun, Droplets, Pill, AlertTriangle, Clock, Utensils, Check, Timer, Loader2 } from "lucide-react"

interface FastingDay {
  date: string
  fasted: boolean
  suhoorMeds: string[]
  iftarMeds: string[]
  waterIntake: number
  bloodSugar?: { suhoor: number; iftar: number; night: number }
  symptoms: string[]
  notes: string
}

const FASTING_RISK_DRUGS = [
  { drug: "insulin", risk: "high", en: "Insulin requires dose adjustment during fasting — MUST consult doctor", tr: "İnsülin oruçta doz ayarlaması gerektirir — MUTLAKA doktora danışın" },
  { drug: "metformin", risk: "medium", en: "Take with iftar meal. Skip suhoor dose if single daily dose.", tr: "İftar yemeğiyle al. Tek günlük dozsa sahur dozunu atla." },
  { drug: "sulfonylurea", risk: "high", en: "High hypoglycemia risk — doctor must adjust dose or switch", tr: "Yüksek hipoglisemi riski — doktor dozu ayarlamalı veya değiştirmeli" },
  { drug: "levothyroxine", risk: "medium", en: "Take at suhoor, 30min before eating. Consistency is key.", tr: "Sahurda al, yemekten 30dk önce. Tutarlılık önemli." },
  { drug: "antihypertensive", risk: "low", en: "Most can be taken at iftar. Monitor blood pressure.", tr: "Çoğu iftarda alınabilir. Tansiyonu takip edin." },
  { drug: "statin", risk: "low", en: "Take at iftar or before bed. No timing issue.", tr: "İftarda veya yatmadan önce al. Zamanlama sorunu yok." },
  { drug: "aspirin", risk: "low", en: "Take with iftar meal to protect stomach.", tr: "Mideyi korumak için iftar yemeğiyle al." },
  { drug: "anticoagulant", risk: "medium", en: "Regular monitoring essential. Dehydration increases clot risk.", tr: "Düzenli takip şart. Dehidratasyon pıhtı riskini artırır." },
  { drug: "diuretic", risk: "high", en: "Dehydration risk very high. May need dose reduction or timing change.", tr: "Dehidratasyon riski çok yüksek. Doz azaltma veya zamanlama değişikliği gerekebilir." },
  { drug: "nsaid", risk: "medium", en: "Take only with iftar, never on empty stomach.", tr: "Sadece iftarla al, asla boş karnına." },
]

const BREAK_FAST_CRITERIA = [
  { en: "Blood sugar below 70 mg/dL (hypoglycemia)", tr: "Kan şekeri 70 mg/dL altına düşerse (hipoglisemi)" },
  { en: "Blood sugar above 300 mg/dL", tr: "Kan şekeri 300 mg/dL üstüne çıkarsa" },
  { en: "Severe dehydration symptoms (dark urine, dizziness, confusion)", tr: "Ağır dehidratasyon belirtileri (koyu idrar, baş dönmesi, bilinç bulanıklığı)" },
  { en: "Chest pain or heart palpitations", tr: "Göğüs ağrısı veya çarpıntı" },
  { en: "Severe headache or fever", tr: "Şiddetli baş ağrısı veya ateş" },
  { en: "Fainting or near-fainting", tr: "Bayılma veya bayılma hissi" },
]

export default function FastingMonitorPage() {
  const { user } = useAuth()
  const { lang } = useLang()
  const [userMeds, setUserMeds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"guide" | "tracker" | "timing">("guide")
  const [days, setDays] = useState<FastingDay[]>([])

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    if (!user) { setLoading(false); return }
    try {
      const supabase = createBrowserClient()
      const { data } = await supabase.from("user_medications").select("brand_name, generic_name").eq("user_id", user.id)
      if (data) setUserMeds(data.map((d: any) => (d.generic_name || d.brand_name)))
    } catch (e) { console.error(e) }
    const saved = localStorage.getItem(`fasting_${user?.id || "guest"}`)
    if (saved) setDays(JSON.parse(saved))
    setLoading(false)
  }

  const getUserDrugRisks = () => {
    return FASTING_RISK_DRUGS.filter(rule =>
      userMeds.some(m => m.toLowerCase().includes(rule.drug))
    )
  }

  const risks = getUserDrugRisks()
  const highRiskCount = risks.filter(r => r.risk === "high").length

  const RISK_COLORS = { high: "bg-red-500/10 text-red-600 border-red-500/30", medium: "bg-amber-500/10 text-amber-600 border-amber-500/30", low: "bg-green-500/10 text-green-600 border-green-500/30" }

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Moon className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{tx("fasting.title", lang)}</h1>
          <p className="text-muted-foreground mt-1">{tx("fasting.subtitle", lang)}</p>
        </div>

        {/* Risk alert */}
        {highRiskCount > 0 && (
          <Card className="p-4 mb-6 border-red-500/30 bg-red-500/5">
            <div className="flex gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-600">
                  {lang === "tr"
                    ? `${highRiskCount} yüksek riskli ilacınız var. Oruç tutmadan MUTLAKA doktorunuza danışın.`
                    : `You have ${highRiskCount} high-risk medication(s). MUST consult doctor before fasting.`}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(["guide", "timing", "tracker"] as const).map(tab => (
            <Button key={tab} size="sm" variant={activeTab === tab ? "default" : "outline"} onClick={() => setActiveTab(tab)}>
              {tab === "guide" ? tx("fasting.tabGuide", lang) :
               tab === "timing" ? tx("fasting.tabTiming", lang) :
               tx("fasting.tabTracker", lang)}
            </Button>
          ))}
        </div>

        {activeTab === "guide" && (
          <div className="space-y-4">
            {/* Break fast criteria */}
            <Card className="p-5">
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                {tx("fasting.breakCriteria", lang)}
              </h3>
              <ul className="space-y-2">
                {BREAK_FAST_CRITERIA.map((c, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center text-xs shrink-0 mt-0.5">!</span>
                    {c[lang]}
                  </li>
                ))}
              </ul>
            </Card>

            {/* Hydration guide */}
            <Card className="p-5">
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <Droplets className="w-5 h-5 text-blue-500" />
                {tx("fasting.hydrationGuide", lang)}
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>{tx("fasting.hydration1", lang)}</p>
                <p>{tx("fasting.hydration2", lang)}</p>
                <p>{tx("fasting.hydration3", lang)}</p>
                <p>{tx("fasting.hydration4", lang)}</p>
              </div>
            </Card>

            {/* Suhoor/Iftar nutrition */}
            <Card className="p-5">
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <Utensils className="w-5 h-5 text-green-500" />
                {tx("fasting.nutritionTitle", lang)}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Badge className="mb-2 bg-indigo-500/10 text-indigo-600">{tx("fasting.suhoor", lang)}</Badge>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• {tx("fasting.suhoor1", lang)}</li>
                    <li>• {tx("fasting.suhoor2", lang)}</li>
                    <li>• {tx("fasting.suhoor3", lang)}</li>
                    <li>• {tx("fasting.suhoor4", lang)}</li>
                  </ul>
                </div>
                <div>
                  <Badge className="mb-2 bg-amber-500/10 text-amber-600">{tx("fasting.iftar", lang)}</Badge>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• {tx("fasting.iftar1", lang)}</li>
                    <li>• {tx("fasting.iftar2", lang)}</li>
                    <li>• {tx("fasting.iftar3", lang)}</li>
                    <li>• {tx("fasting.iftar4", lang)}</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "timing" && (
          <div className="space-y-3">
            {userMeds.length === 0 ? (
              <Card className="p-8 text-center">
                <Pill className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">{tx("fasting.noMeds", lang)}</p>
              </Card>
            ) : (
              <>
                <Card className="p-4 bg-primary/5 border-primary/30">
                  <p className="text-sm text-center">
                    {tx("fasting.consultDoctor", lang)}
                  </p>
                </Card>
                {userMeds.map(med => {
                  const rule = FASTING_RISK_DRUGS.find(r => med.toLowerCase().includes(r.drug))
                  return (
                    <Card key={med} className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium flex items-center gap-2">
                            <Pill className="w-4 h-4 text-primary" />{med}
                          </h4>
                          {rule ? (
                            <div className="mt-2">
                              <Badge className={RISK_COLORS[rule.risk as keyof typeof RISK_COLORS]}>
                                {rule.risk === "high" ? "⚠️" : rule.risk === "medium" ? "⚡" : "✓"} {rule.risk.toUpperCase()}
                              </Badge>
                              <p className="text-sm text-muted-foreground mt-2">{rule[lang]}</p>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground mt-1">
                              {tx("fasting.generalRule", lang)}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </>
            )}
          </div>
        )}

        {activeTab === "tracker" && (
          <div className="space-y-4">
            <Card className="p-5 text-center">
              <Timer className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="font-semibold">{tx("fasting.dailyTracker", lang)}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {tx("fasting.dailyTrackerDesc", lang)}
              </p>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <Button variant="outline" className="h-16 flex-col">
                  <Check className="w-5 h-5 mb-1 text-green-500" />
                  <span className="text-xs">{tx("fasting.fastedToday", lang)}</span>
                </Button>
                <Button variant="outline" className="h-16 flex-col">
                  <Droplets className="w-5 h-5 mb-1 text-blue-500" />
                  <span className="text-xs">{tx("fasting.waterTracking", lang)}</span>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                {lang === "tr" ? `${days.length} gün kaydedildi` : `${days.length} days recorded`}
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
