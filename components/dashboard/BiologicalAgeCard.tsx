// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Lock, RefreshCw, Share2 } from "lucide-react"
import { tx, type Lang } from "@/lib/translations"
import { InfoTooltip } from "@/components/ui/InfoTooltip"
import { createBrowserClient } from "@/lib/supabase"
import { BioAgeShareCard } from "@/components/share/BioAgeShareCard"
import { ShareModal } from "@/components/share/ShareModal"

interface BiologicalAgeCardProps {
  userId: string
  lang: Lang
  isPremium?: boolean
  chronologicalAge?: number | null
  userName?: string
}

export interface BioAgeResult {
  biologicalAge: number
  chronologicalAge: number
  difference: number
  factors: { label: string; impact: string }[]
}

const CACHE_KEY = "bioage-cache"

const FACTOR_TR: Record<string, string> = {
  "Regular exercise": "Düzenli egzersiz",
  "Moderate exercise": "Orta düzey egzersiz",
  "Low physical activity": "Düşük fiziksel aktivite",
  "Good sleep quality": "İyi uyku kalitesi",
  "Poor sleep quality": "Kötü uyku kalitesi",
  "Active smoking": "Aktif sigara kullanımı",
  "Former smoker": "Eski sigara kullanıcısı",
  "Heavy alcohol use": "Yoğun alkol kullanımı",
  "No alcohol": "Alkol kullanmıyor",
  "Active supplement use": "Aktif takviye kullanımı",
  "High energy levels": "Yüksek enerji seviyesi",
  "Healthy BMI": "Sağlıklı VKİ",
  "High BMI": "Yüksek VKİ",
  "Underweight BMI": "Düşük VKİ",
}

function translateFactor(label: string, lang: Lang): string {
  if (lang === "tr") {
    // Handle dynamic labels like "2 chronic condition(s)"
    const match = label.match(/^(\d+) chronic condition\(s\)$/)
    if (match) return `${match[1]} kronik hastalık`
    return FACTOR_TR[label] || label
  }
  return label
}

export function BiologicalAgeCard({
  userId,
  lang,
  isPremium = false,
  chronologicalAge,
  userName,
}: BiologicalAgeCardProps) {
  const [result, setResult] = useState<BioAgeResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [showShareCard, setShowShareCard] = useState(false)

  const calculate = useCallback(async () => {
    if (!isPremium || !chronologicalAge) { setLoading(false); return }

    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (parsed.date === new Date().toISOString().split("T")[0] && parsed.userId === userId) {
          setResult(parsed.result)
          setLoading(false)
          return
        }
      }
    } catch { /* ignore */ }

    setLoading(true)
    try {
      const supabase = createBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) { setLoading(false); return }

      const res = await fetch("/api/biological-age", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ chronologicalAge }),
      })

      if (res.ok) {
        const data = await res.json()
        setResult(data)
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          date: new Date().toISOString().split("T")[0],
          userId,
          result: data,
        }))
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [isPremium, chronologicalAge, userId])

  useEffect(() => {
    calculate()
  }, [calculate])

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
            <Sparkles className="h-4 w-4 text-amber-500" />
            {tx("bioage.title", lang)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <span className="text-5xl font-bold text-muted">??</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-amber-500" />
            {tx("bioage.title", lang)}
            <InfoTooltip title={lang === "tr" ? "Biyolojik Yaş Nedir?" : "What is Biological Age?"} description={lang === "tr" ? "Biyolojik yaşınız, vücut fonksiyonlarınızın gerçek yaşınıza kıyasla ne kadar genç veya yaşlı olduğunu gösterir. Uyku, beslenme, egzersiz ve stres seviyenize göre hesaplanır. Düşük biyolojik yaş, sağlıklı yaşam alışkanlıklarınızın bir yansımasıdır." : "Your biological age shows how young or old your body functions are compared to your actual age. It is calculated based on your sleep, nutrition, exercise, and stress levels."} />
            <Badge variant="secondary" className="ml-auto text-[10px]">PREMIUM</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <RefreshCw className="h-5 w-5 animate-spin text-amber-500" />
            </div>
          ) : result ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-6 py-1">
                <div className="text-center">
                  <span className="text-[10px] text-muted-foreground">{tx("bioage.actual", lang)}</span>
                  <div className="text-2xl font-bold">{result.chronologicalAge}</div>
                </div>
                <div className="text-2xl text-muted-foreground">→</div>
                <div className="text-center">
                  <span className="text-[10px] text-muted-foreground">{tx("bioage.biological", lang)}</span>
                  <div className={`text-3xl font-bold ${
                    result.difference <= 0 ? "text-green-500" : "text-red-500"
                  }`}>
                    {result.biologicalAge}
                  </div>
                </div>
              </div>
              <p className={`text-center text-xs font-medium ${
                result.difference <= 0 ? "text-green-600" : "text-amber-600"
              }`}>
                {result.difference <= 0
                  ? tx("bioage.younger", lang).replace("{n}", String(Math.abs(result.difference)))
                  : tx("bioage.older", lang).replace("{n}", String(result.difference))
                }
              </p>
              {result.factors.length > 0 && (
                <div className="space-y-1">
                  {result.factors.map((f, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">{translateFactor(f.label, lang)}</span>
                      <span className={f.impact === "positive" ? "text-green-500" : "text-amber-500"}>
                        {f.impact === "positive" ? "↓" : "↑"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {/* Action buttons — bigger & more prominent */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => { localStorage.removeItem(CACHE_KEY); calculate() }}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-muted-foreground/20 px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all active:scale-95"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  {tx("bioage.recalculate", lang)}
                </button>
                <button
                  onClick={() => setShowShareCard(true)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/10 transition-all active:scale-95"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  {tx("share.bioage.btn", lang)}
                </button>
              </div>
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">
              {tx("bioage.description", lang)}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Share modal — portal-based, escapes Card stacking context */}
      <ShareModal open={showShareCard && !!result} onClose={() => setShowShareCard(false)}>
        {result && (
          <BioAgeShareCard
            lang={lang}
            biologicalAge={result.biologicalAge}
            chronologicalAge={result.chronologicalAge}
            difference={result.difference}
            factors={result.factors}
            userName={userName}
          />
        )}
      </ShareModal>
    </>
  )
}
