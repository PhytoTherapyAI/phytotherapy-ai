// © 2026 DoctoPal — All Rights Reserved
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lock, Zap, Brain, Moon, Shield } from "lucide-react"
import { tx, type Lang } from "@/lib/translations"

interface MetabolicPortfolioProps {
  lang: Lang
  isPremium?: boolean
  checkInData?: {
    energy_level: number | null
    sleep_quality: number | null
    mood: number | null
    bloating: number | null
  } | null
}

const DOMAINS = [
  { key: "energy", icon: Zap, color: "text-amber-500", bgColor: "bg-amber-500/10", field: "energy_level" as const },
  { key: "stress", icon: Brain, color: "text-purple-500", bgColor: "bg-purple-500/10", field: "mood" as const },
  { key: "sleep", icon: Moon, color: "text-blue-500", bgColor: "bg-blue-500/10", field: "sleep_quality" as const },
  { key: "immunity", icon: Shield, color: "text-green-500", bgColor: "bg-green-500/10", field: "bloating" as const },
]

export function MetabolicPortfolio({ lang, isPremium = false, checkInData }: MetabolicPortfolioProps) {
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
          <CardTitle className="text-base">{tx("metabolic.title", lang)}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {DOMAINS.map(d => (
              <div key={d.key} className="rounded-lg border p-3 text-center">
                <d.icon className={`mx-auto h-5 w-5 ${d.color} opacity-30`} />
                <div className="mt-1 text-lg font-bold text-muted">??</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          {tx("metabolic.title", lang)}
          <Badge variant="secondary" className="ml-auto text-[10px]">PREMIUM</Badge>
        </CardTitle>
        <p className="text-xs text-muted-foreground">{tx("metabolic.subtitle", lang)}</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {DOMAINS.map(d => {
            const value = checkInData?.[d.field] ?? 0
            const percentage = (value / 5) * 100

            return (
              <div key={d.key} className={`rounded-lg border p-3 ${d.bgColor}`}>
                <div className="flex items-center gap-2">
                  <d.icon className={`h-4 w-4 ${d.color}`} />
                  <span className="text-xs font-medium">{tx(`metabolic.${d.key}`, lang)}</span>
                </div>
                <div className="mt-2">
                  <div className="flex items-end gap-1">
                    <span className="text-xl font-bold">{value > 0 ? value : "-"}</span>
                    <span className="text-xs text-muted-foreground">/5</span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-muted/50">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        percentage >= 80 ? "bg-green-500" :
                        percentage >= 60 ? "bg-primary" :
                        percentage >= 40 ? "bg-amber-500" : "bg-red-400"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
