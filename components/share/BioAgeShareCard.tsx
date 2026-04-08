// © 2026 DoctoPal — All Rights Reserved
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

  const shareTextYounger: Record<"en" | "tr", string> = {
    en: `My biological age is ${absDiff} years younger than my real age! 🌿`,
    tr: `Biyolojik yaşım gerçek yaşımdan ${absDiff} yıl genç! 🌿`,
  }
  const shareTextOlder: Record<"en" | "tr", string> = {
    en: `I just learned my biological age — time to improve! 💪`,
    tr: `Biyolojik yaşımı öğrendim — iyileştirme zamanı! 💪`,
  }

  return (
    <ShareCardBase
      lang={lang}
      fileName={`bioage-${biologicalAge}.png`}
      shareTitle={tx("share.bioage.title", lang)}
      shareText={isYounger ? shareTextYounger[lang] : shareTextOlder[lang]}
    >
      {/* Card visual — Instagram post compatible (1:1 aspect ratio scaled down) */}
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{
          width: "360px",
          minHeight: "420px",
          background: isYounger
            ? "linear-gradient(160deg, #ffffff 0%, #f0fdf4 30%, #dcfce7 60%, #bbf7d0 100%)"
            : "linear-gradient(160deg, #ffffff 0%, #fefce8 30%, #fef3c7 60%, #fde68a 100%)",
          fontFamily: '"DM Sans", system-ui, sans-serif',
        }}
      >
        {/* Decorative circles */}
        <div
          className="absolute -right-10 -top-10 rounded-full"
          style={{ width: "200px", height: "200px", background: isYounger ? "rgba(16,185,129,0.08)" : "rgba(245,158,11,0.08)" }}
        />
        <div
          className="absolute -bottom-8 -left-8 rounded-full"
          style={{ width: "150px", height: "150px", background: isYounger ? "rgba(16,185,129,0.06)" : "rgba(245,158,11,0.06)" }}
        />

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col p-6">
          {/* Header */}
          <div className="mb-1 flex items-center gap-2">
            <span className="text-xl">🌿</span>
            <span className="text-sm font-bold tracking-wide text-emerald-700">
              DoctoPal
            </span>
          </div>

          {userName && (
            <p className="mb-3 text-xs text-slate-500">
              {userName}
            </p>
          )}

          {/* Title */}
          <h2 className="mb-5 text-base font-bold text-slate-700">
            {tx("share.bioage.title", lang)}
          </h2>

          {/* Age comparison — hero section */}
          <div className="mb-4 flex items-end justify-center gap-5">
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">
                {tx("bioage.actual", lang)}
              </p>
              <p className="text-2xl font-bold text-slate-400">{chronologicalAge}</p>
            </div>
            <div className="flex flex-col items-center pb-1">
              <span className="text-2xl text-slate-300">→</span>
            </div>
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: isYounger ? "#059669" : "#d97706" }}>
                {tx("bioage.biological", lang)}
              </p>
              <p className="text-6xl font-extrabold" style={{ color: isYounger ? "#059669" : "#d97706" }}>
                {biologicalAge}
              </p>
            </div>
          </div>

          {/* Difference badge — centered and prominent */}
          <div className="mb-5 flex justify-center">
            <div
              className="rounded-full px-5 py-2 text-sm font-bold text-white shadow-sm"
              style={{ background: isYounger ? "#10b981" : "#f59e0b" }}
            >
              {isYounger
                ? `🎉 ${absDiff} ${tx("share.bioage.yearsYounger", lang)}`
                : `💪 ${absDiff} ${tx("share.bioage.yearsOlder", lang)}`
              }
            </div>
          </div>

          {/* Factors — clean short format */}
          {factors.length > 0 && (
            <div className="mb-4 space-y-1.5">
              {factors.slice(0, 4).map((f, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg px-3 py-1.5 text-xs"
                  style={{ background: isYounger ? "rgba(16,185,129,0.08)" : "rgba(245,158,11,0.08)" }}
                >
                  <span className="text-slate-600">{f.label}</span>
                  <span className="font-bold" style={{ color: f.impact === "positive" ? "#059669" : "#d97706" }}>
                    {f.impact === "positive" ? "✓" : "↑"}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Footer — DoctoPal branding */}
          <div className="mt-auto flex items-center justify-between border-t border-slate-200 pt-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs">🌿</span>
              <span className="text-[10px] font-semibold text-slate-400">doctopal.com</span>
            </div>
            <span className="text-[10px] text-slate-400">
              {new Date().toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US")}
            </span>
          </div>
        </div>
      </div>
    </ShareCardBase>
  )
}
