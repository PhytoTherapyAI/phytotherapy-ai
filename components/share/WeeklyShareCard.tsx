// © 2026 DoctoPal — All Rights Reserved
"use client"

import { ShareCardBase } from "./ShareCardBase"
import { tx, type Lang } from "@/lib/translations"

interface WeeklyShareCardProps {
  lang: Lang
  avgScore: number
  bestScore: number
  totalCheckIns: number
  days: Array<{ dayName: string; score: number | null }>
  userName?: string
}

export function WeeklyShareCard({
  lang,
  avgScore,
  bestScore,
  totalCheckIns,
  days,
  userName,
}: WeeklyShareCardProps) {
  const maxScore = Math.max(...days.map(d => d.score ?? 0), 1)
  const shareTextMap: Record<"en" | "tr", string> = {
    en: `My average health score this week is ${avgScore}/100! 🌿`,
    tr: `Bu hafta ortalama sağlık skorum ${avgScore}/100! 🌿`,
  }

  return (
    <ShareCardBase
      lang={lang}
      fileName={`weekly-summary-${Date.now()}.png`}
      shareTitle={tx("weekly.title", lang)}
      shareText={shareTextMap[lang]}
    >
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{
          width: "360px",
          minHeight: "420px",
          background: "linear-gradient(135deg, #0ea5e9 0%, #38bdf8 30%, #7dd3fc 60%, #bae6fd 100%)",
          fontFamily: '"DM Sans", system-ui, sans-serif',
        }}
      >
        {/* Decorative circles */}
        <div
          className="absolute -right-12 -top-12 rounded-full opacity-10"
          style={{ width: "180px", height: "180px", background: "white" }}
        />

        <div className="relative z-10 flex h-full flex-col p-6 text-white">
          {/* Header */}
          <div className="mb-2 flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            <span className="text-sm font-semibold tracking-wide opacity-90">
              DoctoPal
            </span>
          </div>

          {userName && (
            <p className="mb-3 text-sm opacity-80">{userName}</p>
          )}

          <h2 className="mb-5 text-lg font-bold opacity-90">
            {tx("weekly.title", lang)}
          </h2>

          {/* Stats row */}
          <div className="mb-5 grid grid-cols-3 gap-2">
            <div
              className="rounded-xl p-3 text-center"
              style={{ background: "rgba(255,255,255,0.2)" }}
            >
              <p className="text-2xl font-extrabold">{avgScore}</p>
              <p className="text-[10px] opacity-80">{tx("weekly.avgScore", lang)}</p>
            </div>
            <div
              className="rounded-xl p-3 text-center"
              style={{ background: "rgba(255,255,255,0.15)" }}
            >
              <p className="text-2xl font-extrabold">{bestScore}</p>
              <p className="text-[10px] opacity-80">{tx("weekly.bestDay", lang)}</p>
            </div>
            <div
              className="rounded-xl p-3 text-center"
              style={{ background: "rgba(255,255,255,0.1)" }}
            >
              <p className="text-2xl font-extrabold">{totalCheckIns}/7</p>
              <p className="text-[10px] opacity-80">{tx("summary.checkin", lang)}</p>
            </div>
          </div>

          {/* Bar chart */}
          <div
            className="mb-5 rounded-xl p-4"
            style={{ background: "rgba(255,255,255,0.1)" }}
          >
            <div className="flex items-end justify-between gap-2" style={{ height: "80px" }}>
              {days.map((day, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-sm"
                    style={{
                      height: `${Math.max((day.score ?? 0) / maxScore * 100, 8)}%`,
                      background: (day.score ?? 0) >= 60
                        ? "rgba(255,255,255,0.8)"
                        : "rgba(255,255,255,0.3)",
                    }}
                  />
                  <span className="text-[9px] opacity-70">{day.dayName}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Score label */}
          <div className="mb-4 flex justify-center">
            <div
              className="rounded-full px-4 py-1.5 text-sm font-bold"
              style={{ background: "rgba(255,255,255,0.25)" }}
            >
              {avgScore >= 80
                ? `🌟 ${tx("share.weekly.great", lang)}`
                : avgScore >= 60
                  ? `👍 ${tx("share.weekly.keepGoing", lang)}`
                  : `💪 ${tx("share.weekly.roomToGrow", lang)}`
              }
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto flex items-center justify-between border-t border-white/20 pt-3">
            <span className="text-[10px] opacity-60">doctopal.com</span>
            <span className="text-[10px] opacity-60">
              {new Date().toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US")}
            </span>
          </div>
        </div>
      </div>
    </ShareCardBase>
  )
}
