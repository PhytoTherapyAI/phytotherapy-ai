// © 2026 Doctopal — All Rights Reserved
"use client"

import { ShareCardBase } from "./ShareCardBase"
import { tx, type Lang } from "@/lib/translations"

interface InteractionShareCardProps {
  lang: Lang
  medications: string[]
  dangerousCount: number
  cautionCount: number
  safeCount: number
  topDangerousHerb?: string
  concern: string
}

export function InteractionShareCard({
  lang,
  medications,
  dangerousCount,
  cautionCount,
  safeCount,
  topDangerousHerb,
  concern,
}: InteractionShareCardProps) {
  const totalInteractions = dangerousCount + cautionCount
  const shareTextMap: Record<"en" | "tr", string> = {
    en: `Doctopal detected ${totalInteractions} drug-herb interactions! 🛡️`,
    tr: `Doctopal ${totalInteractions} ilaç-bitki etkileşimi tespit etti! 🛡️`,
  }

  return (
    <ShareCardBase
      lang={lang}
      fileName={`interaction-alert-${Date.now()}.png`}
      shareTitle={tx("share.interaction.title", lang)}
      shareText={shareTextMap[lang]}
    >
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{
          width: "360px",
          minHeight: "420px",
          background: "linear-gradient(135deg, #dc2626 0%, #ef4444 25%, #f97316 60%, #fbbf24 100%)",
          fontFamily: '"DM Sans", system-ui, sans-serif',
        }}
      >
        {/* Decorative shield */}
        <div
          className="absolute right-4 top-4 opacity-10"
          style={{ fontSize: "120px", lineHeight: 1 }}
        >
          🛡️
        </div>

        <div className="relative z-10 flex h-full flex-col p-6 text-white">
          {/* Header */}
          <div className="mb-2 flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            <span className="text-sm font-semibold tracking-wide opacity-90">
              Doctopal
            </span>
          </div>

          {/* Alert title */}
          <h2 className="mb-2 text-xl font-extrabold">
            {tx("share.interaction.title", lang)}
          </h2>
          <p className="mb-6 text-sm opacity-80">
            {tx("share.interaction.subtitle", lang)}
          </p>

          {/* Medications checked */}
          <div
            className="mb-4 rounded-xl px-4 py-3"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            <p className="mb-1 text-[10px] uppercase tracking-wider opacity-70">
              {tx("share.interaction.medsChecked", lang)}
            </p>
            <p className="text-sm font-bold">
              {medications.slice(0, 3).join(", ")}
              {medications.length > 3 && ` +${medications.length - 3}`}
            </p>
          </div>

          {/* Stats row */}
          <div className="mb-4 grid grid-cols-3 gap-2">
            <div
              className="rounded-xl p-3 text-center"
              style={{ background: "rgba(255,255,255,0.2)" }}
            >
              <p className="text-2xl font-extrabold">{dangerousCount}</p>
              <p className="text-[10px] opacity-80">
                {tx("share.interaction.dangerous", lang)}
              </p>
            </div>
            <div
              className="rounded-xl p-3 text-center"
              style={{ background: "rgba(255,255,255,0.15)" }}
            >
              <p className="text-2xl font-extrabold">{cautionCount}</p>
              <p className="text-[10px] opacity-80">
                {tx("share.interaction.caution", lang)}
              </p>
            </div>
            <div
              className="rounded-xl p-3 text-center"
              style={{ background: "rgba(255,255,255,0.1)" }}
            >
              <p className="text-2xl font-extrabold text-green-200">{safeCount}</p>
              <p className="text-[10px] opacity-80">
                {tx("share.interaction.safe", lang)}
              </p>
            </div>
          </div>

          {/* Key finding */}
          {topDangerousHerb && (
            <div
              className="mb-4 rounded-xl border border-white/20 px-4 py-3"
              style={{ background: "rgba(0,0,0,0.15)" }}
            >
              <p className="text-[10px] uppercase tracking-wider opacity-60">
                {tx("share.interaction.criticalFinding", lang)}
              </p>
              <p className="text-sm font-bold">
                ❌ {topDangerousHerb}
              </p>
            </div>
          )}

          {/* Concern snippet */}
          {concern && (
            <p className="mb-4 text-xs italic opacity-70 line-clamp-2">
              &ldquo;{concern.length > 100 ? concern.slice(0, 100) + "..." : concern}&rdquo;
            </p>
          )}

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
