// © 2026 DoctoPal — All Rights Reserved
"use client"

import { ShareCardBase } from "./ShareCardBase"
import { tx, type Lang } from "@/lib/translations"

interface ProtocolShareCardProps {
  lang: Lang
  supplementName: string
  cycleDays: number
  streakDays?: number
  userName?: string
}

export function ProtocolShareCard({
  lang,
  supplementName,
  cycleDays,
  streakDays,
  userName,
}: ProtocolShareCardProps) {
  const shareTextMap: Record<"en" | "tr", string> = {
    en: `I completed my ${cycleDays}-day ${supplementName} protocol! 🏆`,
    tr: `${cycleDays} günlük ${supplementName} protokolümü tamamladım! 🏆`,
  }

  return (
    <ShareCardBase
      lang={lang}
      fileName={`protocol-${supplementName.toLowerCase().replace(/\s+/g, "-")}.png`}
      shareTitle={tx("share.protocol.title", lang)}
      shareText={shareTextMap[lang]}
    >
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{
          width: "360px",
          minHeight: "420px",
          background: "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 25%, #a78bfa 55%, #c4b5fd 100%)",
          fontFamily: '"DM Sans", system-ui, sans-serif',
        }}
      >
        {/* Decorative trophy */}
        <div
          className="absolute right-4 top-16 opacity-10"
          style={{ fontSize: "140px", lineHeight: 1 }}
        >
          🏆
        </div>

        <div className="relative z-10 flex h-full flex-col p-6 text-white">
          {/* Header */}
          <div className="mb-2 flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            <span className="text-sm font-semibold tracking-wide opacity-90">
              DoctoPal
            </span>
          </div>

          {userName && (
            <p className="mb-4 text-sm opacity-80">{userName}</p>
          )}

          {/* Title */}
          <h2 className="mb-2 text-2xl font-extrabold">
            {tx("share.protocol.title", lang)}
          </h2>

          {/* Supplement name */}
          <div
            className="mb-6 rounded-xl px-5 py-4 text-center"
            style={{ background: "rgba(255,255,255,0.2)" }}
          >
            <p className="text-2xl font-extrabold">{supplementName}</p>
            <p className="mt-1 text-sm opacity-80">
              {cycleDays} {tx("share.protocol.days", lang)} {tx("share.protocol.subtitle", lang)}
            </p>
          </div>

          {/* Achievement badge */}
          <div className="mb-6 flex justify-center">
            <div
              className="flex items-center gap-3 rounded-full px-6 py-3"
              style={{ background: "rgba(255,255,255,0.25)" }}
            >
              <span className="text-3xl">🏆</span>
              <div>
                <p className="text-lg font-extrabold">
                  {tx("share.protocol.complete", lang)}
                </p>
                <p className="text-xs opacity-80">
                  {cycleDays}/{cycleDays} {tx("share.protocol.days", lang)}
                </p>
              </div>
            </div>
          </div>

          {/* Streak */}
          {streakDays && streakDays > 1 && (
            <div
              className="mb-4 rounded-xl px-4 py-3 text-center"
              style={{ background: "rgba(255,255,255,0.15)" }}
            >
              <p className="text-sm opacity-70">🔥 {streakDays} {tx("share.protocol.streak", lang)}</p>
            </div>
          )}

          {/* Motivational */}
          <p className="mb-4 text-center text-sm italic opacity-70">
            {tx("share.protocol.motivational", lang)}
          </p>

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
