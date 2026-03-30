// © 2026 Phytotherapy.ai — All Rights Reserved
"use client"

import { ShareCardBase } from "./ShareCardBase"
import { tx, type Lang } from "@/lib/translations"

interface HealthScoreShareCardProps {
  lang: Lang
  healthScore: number
  streak: number
  biologicalAge?: number
  complianceRate?: number
  userName?: string
}

export function HealthScoreShareCard({
  lang,
  healthScore,
  streak,
  biologicalAge,
  complianceRate,
  userName,
}: HealthScoreShareCardProps) {
  const tr = lang === "tr"

  // Gradient based on score
  const gradient =
    healthScore >= 80
      ? "linear-gradient(135deg, #059669 0%, #10b981 30%, #34d399 60%, #6ee7b7 100%)"
      : healthScore >= 60
        ? "linear-gradient(135deg, #d97706 0%, #f59e0b 30%, #fbbf24 60%, #fde68a 100%)"
        : "linear-gradient(135deg, #dc2626 0%, #ef4444 30%, #f87171 60%, #fca5a5 100%)"

  const scoreLabel =
    healthScore >= 80
      ? tx("healthScore.excellent", lang)
      : healthScore >= 60
        ? tx("healthScore.keepGoing", lang)
        : tx("healthScore.timeToImprove", lang)

  const scoreEmoji = healthScore >= 80 ? "🌟" : healthScore >= 60 ? "💪" : "🔥"

  const shareText = tr
    ? `Sağlık skorum ${healthScore}/100! ${streak} gunluk seri devam ediyor 🌿`
    : `My health score is ${healthScore}/100! ${streak}-day streak going strong 🌿`

  return (
    <ShareCardBase
      lang={lang}
      fileName={`health-score-${healthScore}.png`}
      shareTitle="Phytotherapy.ai"
      shareText={shareText}
    >
      {/* Card — standard share size */}
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{
          width: "360px",
          minHeight: "480px",
          background: gradient,
          fontFamily: '"DM Sans", system-ui, sans-serif',
        }}
      >
        {/* Decorative elements */}
        <div
          className="absolute -right-12 -top-12 rounded-full opacity-10"
          style={{ width: "200px", height: "200px", background: "white" }}
        />
        <div
          className="absolute -bottom-8 -left-8 rounded-full opacity-10"
          style={{ width: "160px", height: "160px", background: "white" }}
        />
        <div
          className="absolute right-8 bottom-24 rounded-full opacity-5"
          style={{ width: "100px", height: "100px", background: "white" }}
        />

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col p-6 text-white">
          {/* Header branding */}
          <div className="mb-2 flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            <span className="text-sm font-semibold tracking-wide opacity-90">
              Phytotherapy.ai
            </span>
          </div>

          {userName && (
            <p className="mb-4 text-sm opacity-80">{userName}</p>
          )}

          {/* Title */}
          <h2 className="mb-6 text-lg font-bold opacity-90">
            {tx("healthScore.title", lang)}
          </h2>

          {/* Big score circle */}
          <div className="mb-6 flex justify-center">
            <div
              className="flex flex-col items-center justify-center rounded-full"
              style={{
                width: "160px",
                height: "160px",
                background: "rgba(255,255,255,0.2)",
                border: "4px solid rgba(255,255,255,0.4)",
              }}
            >
              <p className="text-6xl font-extrabold leading-none">{healthScore}</p>
              <p className="text-sm font-medium opacity-80">/100</p>
            </div>
          </div>

          {/* Score label badge */}
          <div className="mb-6 flex justify-center">
            <div
              className="rounded-full px-5 py-1.5 text-sm font-bold"
              style={{ background: "rgba(255,255,255,0.25)" }}
            >
              {scoreEmoji} {scoreLabel}
            </div>
          </div>

          {/* Stats row */}
          <div className="mb-4 grid grid-cols-3 gap-2">
            {/* Streak */}
            <div
              className="rounded-xl p-3 text-center"
              style={{ background: "rgba(255,255,255,0.15)" }}
            >
              <p className="text-xl font-extrabold">{streak}</p>
              <p className="text-[10px] opacity-80">
                {tx("healthScore.dayStreak", lang)}
              </p>
            </div>

            {/* Compliance */}
            {complianceRate != null && (
              <div
                className="rounded-xl p-3 text-center"
                style={{ background: "rgba(255,255,255,0.15)" }}
              >
                <p className="text-xl font-extrabold">{complianceRate}%</p>
                <p className="text-[10px] opacity-80">
                  {tx("healthScore.compliance", lang)}
                </p>
              </div>
            )}

            {/* Biological age diff */}
            {biologicalAge != null && (
              <div
                className="rounded-xl p-3 text-center"
                style={{ background: "rgba(255,255,255,0.15)" }}
              >
                <p className="text-xl font-extrabold">{biologicalAge}</p>
                <p className="text-[10px] opacity-80">
                  {tx("healthScore.bioAge", lang)}
                </p>
              </div>
            )}

            {/* Fill remaining slot if only one optional provided */}
            {complianceRate == null && biologicalAge == null && (
              <>
                <div
                  className="rounded-xl p-3 text-center"
                  style={{ background: "rgba(255,255,255,0.15)" }}
                >
                  <p className="text-xl font-extrabold">{scoreEmoji}</p>
                  <p className="text-[10px] opacity-80">
                    {tx("healthScore.goal", lang)}
                  </p>
                </div>
                <div
                  className="rounded-xl p-3 text-center"
                  style={{ background: "rgba(255,255,255,0.15)" }}
                >
                  <p className="text-xl font-extrabold">7</p>
                  <p className="text-[10px] opacity-80">
                    {tx("healthScore.daysActive", lang)}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="mt-auto flex items-center justify-between border-t border-white/20 pt-3">
            <span className="text-[10px] opacity-60">phytotherapy.ai</span>
            <span className="text-[10px] opacity-60">
              {new Date().toLocaleDateString(tr ? "tr-TR" : "en-US")}
            </span>
          </div>
        </div>
      </div>
    </ShareCardBase>
  )
}
