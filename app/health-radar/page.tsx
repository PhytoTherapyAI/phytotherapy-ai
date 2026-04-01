// © 2026 Doctopal — All Rights Reserved
"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import { createBrowserClient } from "@/lib/supabase"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Heart, Brain, Bone, Apple, Shield, Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react"

interface RadarAxis {
  key: string
  label: { en: string; tr: string }
  score: number
  icon: any
  color: string
  factors: { en: string; tr: string; impact: "positive" | "negative" }[]
}

export default function HealthRadarPage() {
  const { user } = useAuth()
  const { lang } = useLang()
  const [loading, setLoading] = useState(true)
  const [axes, setAxes] = useState<RadarAxis[]>([])

  useEffect(() => {
    calculateScores()
  }, [user])

  const calculateScores = async () => {
    if (!user) { setLoading(false); return }
    try {
      const supabase = createBrowserClient()
      const [medsRes, profileRes, checkinsRes] = await Promise.all([
        supabase.from("user_medications").select("brand_name, generic_name").eq("user_id", user.id),
        supabase.from("user_profiles").select("*").eq("user_id", user.id).single(),
        supabase.from("daily_check_ins").select("*").eq("user_id", user.id).order("check_date", { ascending: false }).limit(7),
      ])
      const meds = medsRes.data?.map((d: any) => (d.generic_name || d.brand_name)) || []
      const profile = profileRes.data
      const checkins = checkinsRes.data || []

      const avgMood = checkins.length ? checkins.reduce((s: number, c: any) => s + (c.mood || 3), 0) / checkins.length : 3
      const avgEnergy = checkins.length ? checkins.reduce((s: number, c: any) => s + (c.energy_level || 3), 0) / checkins.length : 3
      const avgSleep = checkins.length ? checkins.reduce((s: number, c: any) => s + (c.sleep_quality || 3), 0) / checkins.length : 3

      setAxes([
        {
          key: "cardiovascular", label: { en: "Cardiovascular", tr: "Kardiyovasküler" }, icon: Heart, color: "text-red-500",
          score: Math.min(100, Math.max(20, 70 - meds.length * 3 + (profile?.exercise_frequency === "daily" ? 20 : 0))),
          factors: [
            ...(meds.some((m: string) => m.toLowerCase().includes("statin")) ? [{ en: "Taking statins (protective)", tr: "Statin kullanımı (koruyucu)", impact: "positive" as const }] : []),
            ...(meds.some((m: string) => m.toLowerCase().includes("aspirin")) ? [{ en: "Aspirin therapy", tr: "Aspirin tedavisi", impact: "positive" as const }] : []),
          ],
        },
        {
          key: "metabolic", label: { en: "Metabolic", tr: "Metabolik" }, icon: Activity, color: "text-orange-500",
          score: Math.min(100, Math.max(20, 65 + avgEnergy * 5)),
          factors: [
            ...(meds.some((m: string) => m.toLowerCase().includes("metformin")) ? [{ en: "Metformin use (blood sugar control)", tr: "Metformin kullanımı (şeker kontrolü)", impact: "positive" as const }] : []),
            { en: `Energy level: ${avgEnergy.toFixed(1)}/5`, tr: `Enerji seviyesi: ${avgEnergy.toFixed(1)}/5`, impact: avgEnergy >= 3 ? "positive" as const : "negative" as const },
          ],
        },
        {
          key: "mental", label: { en: "Mental Health", tr: "Mental Sağlık" }, icon: Brain, color: "text-purple-500",
          score: Math.min(100, Math.max(20, 50 + avgMood * 10)),
          factors: [
            { en: `Average mood: ${avgMood.toFixed(1)}/5`, tr: `Ortalama ruh hali: ${avgMood.toFixed(1)}/5`, impact: avgMood >= 3 ? "positive" as const : "negative" as const },
            { en: `Sleep quality: ${avgSleep.toFixed(1)}/5`, tr: `Uyku kalitesi: ${avgSleep.toFixed(1)}/5`, impact: avgSleep >= 3 ? "positive" as const : "negative" as const },
          ],
        },
        {
          key: "musculoskeletal", label: { en: "Musculoskeletal", tr: "Kas-İskelet" }, icon: Bone, color: "text-yellow-600",
          score: Math.min(100, Math.max(20, 75 - (profile?.age ? Math.max(0, profile.age - 40) : 0))),
          factors: [
            ...(profile?.age && profile.age > 50 ? [{ en: "Age-related decline risk", tr: "Yaşa bağlı azalma riski", impact: "negative" as const }] : []),
          ],
        },
        {
          key: "digestive", label: { en: "Digestive", tr: "Sindirim" }, icon: Apple, color: "text-green-500",
          score: Math.min(100, Math.max(20, 70 - meds.filter((m: string) => m.toLowerCase().includes("nsaid") || m.toLowerCase().includes("aspirin")).length * 10)),
          factors: [
            ...(meds.some((m: string) => m.toLowerCase().includes("ppi") || m.toLowerCase().includes("omeprazole")) ? [{ en: "PPI use (stomach protection but nutrient impact)", tr: "PPI kullanımı (mide koruması ama besin etkisi)", impact: "negative" as const }] : []),
          ],
        },
        {
          key: "immune", label: { en: "Immunity", tr: "Bağışıklık" }, icon: Shield, color: "text-blue-500",
          score: Math.min(100, Math.max(20, 70 + avgSleep * 3)),
          factors: [
            { en: `Sleep affects immune function`, tr: `Uyku bağışıklığı etkiler`, impact: avgSleep >= 3 ? "positive" as const : "negative" as const },
          ],
        },
      ])
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const overallScore = axes.length ? Math.round(axes.reduce((s, a) => s + a.score, 0) / axes.length) : 0

  const t = (key: string) => {
    const map: Record<string, Record<string, string>> = {
      title: { en: "Health Risk Radar", tr: "Sağlık Risk Radarı" },
      subtitle: { en: "6-axis health overview at a glance", tr: "6 eksenli sağlık genel bakışı" },
      overall: { en: "Overall Score", tr: "Genel Skor" },
      loading: { en: "Analyzing your health data...", tr: "Sağlık verilerin analiz ediliyor..." },
    }
    return map[key]?.[lang] || key
  }

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center flex-col gap-2">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-muted-foreground text-sm">{t("loading")}</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Activity className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
        </div>

        {/* Overall score */}
        <Card className="p-6 mb-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">{t("overall")}</p>
          <div className="relative w-24 h-24 mx-auto mb-3">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8"
                className={overallScore >= 70 ? "text-green-500" : overallScore >= 50 ? "text-amber-500" : "text-red-500"}
                strokeDasharray={`${overallScore * 2.64} 264`} strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold">{overallScore}</span>
          </div>
        </Card>

        {/* Radar visual (CSS-based hexagon) */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-3 gap-4">
            {axes.map(axis => {
              const Icon = axis.icon
              return (
                <div key={axis.key} className="text-center">
                  <div className="relative w-16 h-16 mx-auto mb-2">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/20" />
                      <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="6"
                        className={axis.score >= 70 ? "text-green-500" : axis.score >= 50 ? "text-amber-500" : "text-red-500"}
                        strokeDasharray={`${axis.score * 2.39} 239`} strokeLinecap="round" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center">
                      <Icon className={`w-5 h-5 ${axis.color}`} />
                    </span>
                  </div>
                  <p className="text-xs font-medium">{axis.label[lang]}</p>
                  <p className={`text-lg font-bold ${axis.score >= 70 ? "text-green-600" : axis.score >= 50 ? "text-amber-600" : "text-red-600"}`}>
                    {axis.score}
                  </p>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Detailed breakdown */}
        <div className="space-y-3">
          {axes.map(axis => {
            const Icon = axis.icon
            return (
              <Card key={axis.key} className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Icon className={`w-5 h-5 ${axis.color}`} />
                  <span className="font-medium">{axis.label[lang]}</span>
                  <span className="ml-auto font-bold">{axis.score}/100</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mb-3">
                  <div className={`h-2 rounded-full ${axis.score >= 70 ? "bg-green-500" : axis.score >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                    style={{ width: `${axis.score}%` }} />
                </div>
                {axis.factors.length > 0 && (
                  <ul className="space-y-1">
                    {axis.factors.map((f, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                        {f.impact === "positive" ? <TrendingUp className="w-3 h-3 text-green-500" /> : <TrendingDown className="w-3 h-3 text-red-500" />}
                        {f[lang as "en" | "tr"]}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
