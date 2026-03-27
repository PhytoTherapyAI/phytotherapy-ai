"use client"

import { ShareCardBase } from "./ShareCardBase"
import { type Lang } from "@/lib/translations"
import { CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react"

interface BloodTestShareCardProps {
  lang: Lang
  totalMarkers: number
  abnormalCount: number
  optimalCount: number
  topFindings?: { marker: string; status: string }[]
  userName?: string
}

export function BloodTestShareCard({
  lang,
  totalMarkers,
  abnormalCount,
  optimalCount,
  topFindings = [],
  userName,
}: BloodTestShareCardProps) {
  const tr = lang === "tr"
  const normalCount = totalMarkers - abnormalCount
  const healthPercent = totalMarkers > 0 ? Math.round((optimalCount / totalMarkers) * 100) : 0

  return (
    <ShareCardBase
      lang={lang}
      fileName="blood-test-results.png"
      shareTitle={tr ? "Kan Tahlili Sonuçlarım" : "My Blood Test Results"}
      shareText={
        tr
          ? `${totalMarkers} markörden ${optimalCount} tanesi optimal aralıkta! 🩸`
          : `${optimalCount} out of ${totalMarkers} markers are in optimal range! 🩸`
      }
    >
      <div className="rounded-2xl bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 p-6 dark:from-red-950/40 dark:via-rose-950/30 dark:to-pink-950/30">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Phytotherapy.ai
            </p>
            <h3 className="text-lg font-bold">
              {tr ? "Kan Tahlili Özeti" : "Blood Test Summary"}
            </h3>
            {userName && (
              <p className="text-xs text-muted-foreground">{userName}</p>
            )}
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/80 dark:bg-white/10">
            <span className="text-2xl">🩸</span>
          </div>
        </div>

        {/* Health Score Circle */}
        <div className="mb-5 flex items-center justify-center">
          <div className="relative flex h-24 w-24 items-center justify-center">
            <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
              <circle
                cx="50" cy="50" r="42" fill="none" strokeWidth="8"
                strokeDasharray={`${healthPercent * 2.64} ${264 - healthPercent * 2.64}`}
                strokeLinecap="round"
                className={healthPercent >= 70 ? "text-green-500" : healthPercent >= 40 ? "text-amber-500" : "text-red-500"}
                stroke="currentColor"
              />
            </svg>
            <div className="text-center">
              <p className="text-2xl font-bold">{healthPercent}%</p>
              <p className="text-[9px] text-muted-foreground">
                {tr ? "optimal" : "optimal"}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mb-4 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-white/60 p-3 text-center dark:bg-white/5">
            <div className="mx-auto mb-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
              <TrendingUp className="h-3 w-3 text-blue-600" />
            </div>
            <p className="text-lg font-bold">{totalMarkers}</p>
            <p className="text-[9px] text-muted-foreground">
              {tr ? "Toplam" : "Total"}
            </p>
          </div>
          <div className="rounded-xl bg-white/60 p-3 text-center dark:bg-white/5">
            <div className="mx-auto mb-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="h-3 w-3 text-green-600" />
            </div>
            <p className="text-lg font-bold text-green-600">{optimalCount}</p>
            <p className="text-[9px] text-muted-foreground">
              {tr ? "Optimal" : "Optimal"}
            </p>
          </div>
          <div className="rounded-xl bg-white/60 p-3 text-center dark:bg-white/5">
            <div className="mx-auto mb-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <AlertTriangle className="h-3 w-3 text-amber-600" />
            </div>
            <p className="text-lg font-bold text-amber-600">{abnormalCount}</p>
            <p className="text-[9px] text-muted-foreground">
              {tr ? "Anormal" : "Abnormal"}
            </p>
          </div>
        </div>

        {/* Top Findings */}
        {topFindings.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {tr ? "Öne Çıkanlar" : "Key Findings"}
            </p>
            {topFindings.slice(0, 3).map((f, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg bg-white/50 px-3 py-1.5 text-xs dark:bg-white/5">
                <span className={`h-1.5 w-1.5 rounded-full ${
                  f.status === "optimal" ? "bg-green-500" :
                  f.status === "high" || f.status === "low" ? "bg-amber-500" : "bg-red-500"
                }`} />
                <span className="font-medium">{f.marker}</span>
                <span className="ml-auto text-[10px] text-muted-foreground capitalize">{f.status}</span>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between">
          <p className="text-[9px] text-muted-foreground">
            {new Date().toLocaleDateString(tr ? "tr-TR" : "en-US", { year: "numeric", month: "short", day: "numeric" })}
          </p>
          <p className="text-[9px] font-medium text-primary">phytotherapy.ai</p>
        </div>
      </div>
    </ShareCardBase>
  )
}
