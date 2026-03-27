"use client"

import { ShareCardBase } from "./ShareCardBase"
import { tx, type Lang } from "@/lib/translations"

interface BioAgeShareCardProps {
  lang: Lang
  biologicalAge: number
  chronologicalAge: number
  difference: number
  factors: { label: string; impact: string }[]
  userName?: string
}

export function BioAgeShareCard({
  lang,
  biologicalAge,
  chronologicalAge,
  difference,
  factors,
  userName,
}: BioAgeShareCardProps) {
  const isYounger = difference <= 0
  const absDiff = Math.abs(difference)
  const tr = lang === "tr"

  return (
    <ShareCardBase
      lang={lang}
      fileName={`bioage-${biologicalAge}.png`}
      shareTitle={tx("share.bioage.title", lang)}
      shareText={
        isYounger
          ? (tr
              ? `Biyolojik yaşım gerçek yaşımdan ${absDiff} yıl genç! 🌿`
              : `My biological age is ${absDiff} years younger than my real age! 🌿`)
          : (tr
              ? `Biyolojik yaşımı öğrendim — iyileştirme zamanı! 💪`
              : `I just learned my biological age — time to improve! 💪`)
      }
    >
      {/* Card visual — fixed size for consistent sharing */}
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{
          width: "360px",
          minHeight: "420px",
          background: isYounger
            ? "linear-gradient(135deg, #059669 0%, #10b981 30%, #34d399 60%, #6ee7b7 100%)"
            : "linear-gradient(135deg, #d97706 0%, #f59e0b 30%, #fbbf24 60%, #fde68a 100%)",
          fontFamily: '"DM Sans", system-ui, sans-serif',
        }}
      >
        {/* Decorative circles */}
        <div
          className="absolute -right-10 -top-10 rounded-full opacity-10"
          style={{ width: "200px", height: "200px", background: "white" }}
        />
        <div
          className="absolute -bottom-8 -left-8 rounded-full opacity-10"
          style={{ width: "150px", height: "150px", background: "white" }}
        />

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col p-6 text-white">
          {/* Header */}
          <div className="mb-2 flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            <span className="text-sm font-semibold tracking-wide opacity-90">
              Phytotherapy.ai
            </span>
          </div>

          {userName && (
            <p className="mb-4 text-sm opacity-80">
              {userName}
            </p>
          )}

          {/* Title */}
          <h2 className="mb-6 text-lg font-bold opacity-90">
            {tx("share.bioage.title", lang)}
          </h2>

          {/* Age comparison */}
          <div className="mb-6 flex items-center justify-center gap-6">
            <div className="text-center">
              <p className="text-xs uppercase tracking-wide opacity-70">
                {tx("bioage.actual", lang)}
              </p>
              <p className="text-4xl font-bold">{chronologicalAge}</p>
            </div>
            <div className="text-3xl opacity-60">→</div>
            <div className="text-center">
              <p className="text-xs uppercase tracking-wide opacity-70">
                {tx("bioage.biological", lang)}
              </p>
              <p className="text-5xl font-extrabold">{biologicalAge}</p>
            </div>
          </div>

          {/* Difference badge */}
          <div className="mb-6 flex justify-center">
            <div
              className="rounded-full px-4 py-1.5 text-sm font-bold"
              style={{ background: "rgba(255,255,255,0.25)" }}
            >
              {isYounger
                ? `🎉 ${absDiff} ${tx("share.bioage.yearsYounger", lang)}`
                : `💪 ${absDiff} ${tx("share.bioage.yearsOlder", lang)}`
              }
            </div>
          </div>

          {/* Top factors */}
          {factors.length > 0 && (
            <div className="mb-4 space-y-1.5">
              {factors.slice(0, 4).map((f, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg px-3 py-1.5 text-xs"
                  style={{ background: "rgba(255,255,255,0.15)" }}
                >
                  <span className="opacity-90">{f.label}</span>
                  <span className="font-bold">
                    {f.impact === "positive"
                      ? `↓ ${tx("share.bioage.younger", lang)}`
                      : `↑ ${tx("share.bioage.older", lang)}`
                    }
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="mt-auto flex items-center justify-between border-t border-white/20 pt-3">
            <span className="text-[10px] opacity-60">phytotherapy.ai</span>
            <span className="text-[10px] opacity-60">
              {new Date().toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US")}
            </span>
          </div>
        </div>
      </div>
    </ShareCardBase>
  )
}
