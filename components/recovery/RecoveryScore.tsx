// © 2026 Doctopal — All Rights Reserved
"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"

const SLEEP_OPTS = [
  { score: 1, emoji: "😫", en: "Terrible", tr: "Berbat" },
  { score: 2, emoji: "😕", en: "Poor", tr: "Kötü" },
  { score: 3, emoji: "😐", en: "OK", tr: "İdare" },
  { score: 4, emoji: "😊", en: "Good", tr: "İyi" },
  { score: 5, emoji: "🤩", en: "Amazing", tr: "Harika" },
]
const ENERGY_OPTS = [
  { score: 1, emoji: "🔋", en: "Depleted", tr: "Tükenmiş" },
  { score: 2, emoji: "🪫", en: "Low", tr: "Düşük" },
  { score: 3, emoji: "⚡", en: "Normal", tr: "Normal" },
  { score: 4, emoji: "🔥", en: "High", tr: "Yüksek" },
  { score: 5, emoji: "💥", en: "Peak", tr: "Zirve" },
]
const MOOD_OPTS = [
  { score: 1, emoji: "🌧️", en: "Stormy", tr: "Fırtınalı" },
  { score: 2, emoji: "🌥️", en: "Cloudy", tr: "Bulutlu" },
  { score: 3, emoji: "⛅", en: "Mixed", tr: "Karışık" },
  { score: 4, emoji: "☀️", en: "Sunny", tr: "Güneşli" },
  { score: 5, emoji: "🌈", en: "Radiant", tr: "Parlak" },
]
const BODY_OPTS = [
  { score: 1, emoji: "😣", en: "Very Sore", tr: "Çok Ağrılı" },
  { score: 2, emoji: "😬", en: "Sore", tr: "Ağrılı" },
  { score: 3, emoji: "😐", en: "Neutral", tr: "Nötr" },
  { score: 4, emoji: "💪", en: "Good", tr: "İyi" },
  { score: 5, emoji: "🏆", en: "Fresh", tr: "Dinç" },
]

function getRecoveryLabel(score: number, isTr: boolean) {
  if (score >= 85) return { emoji: "💚", color: "text-emerald-600", bg: "bg-emerald-500", label: isTr ? "Tam Toparlanmış — Harekete geç!" : "Fully Recovered — Go crush it!" }
  if (score >= 70) return { emoji: "💙", color: "text-teal-600", bg: "bg-teal-500", label: isTr ? "İyi — Normal aktivite uygun" : "Good — Normal activity is fine" }
  if (score >= 50) return { emoji: "💛", color: "text-amber-600", bg: "bg-amber-500", label: isTr ? "Orta — Bugün sakin olun" : "Moderate — Take it easy today" }
  if (score >= 30) return { emoji: "🧡", color: "text-orange-600", bg: "bg-orange-500", label: isTr ? "Düşük — Dinlenmeyi öncelik yapın" : "Low — Prioritize rest and recovery" }
  return { emoji: "❤️", color: "text-red-600", bg: "bg-red-500", label: isTr ? "Çok Düşük — Dinlenme günü önerilir" : "Very Low — Rest day recommended" }
}

const MOCK_7DAY = [68, 72, 81, 75, 89, 72, 0]

interface Props { lang: "en" | "tr"; compact?: boolean }

export function RecoveryScore({ lang, compact = false }: Props) {
  const isTr = lang === "tr"
  const [sleep, setSleep] = useState(0)
  const [energy, setEnergy] = useState(0)
  const [mood, setMood] = useState(0)
  const [body, setBody] = useState(0)
  const [calculated, setCalculated] = useState(false)

  const score = useMemo(() => {
    if (!sleep || !energy || !mood || !body) return 0
    return Math.round(((sleep + energy + mood + body) / 20) * 100)
  }, [sleep, energy, mood, body])

  const info = getRecoveryLabel(score, isTr)
  const allFilled = sleep > 0 && energy > 0 && mood > 0 && body > 0

  if (calculated && score > 0) {
    return (
      <div className="rounded-2xl border bg-white dark:bg-card p-5 shadow-sm">
        {/* Score Gauge */}
        <div className="flex flex-col items-center mb-4">
          <div className="relative w-28 h-28">
            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
              <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-800" />
              <motion.circle cx="60" cy="60" r="52" fill="none" strokeWidth="8"
                strokeLinecap="round" className={info.bg.replace("bg-", "text-")}
                strokeDasharray={`${2 * Math.PI * 52}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - score / 100) }}
                transition={{ duration: 1.5, ease: "easeOut" }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`text-2xl font-bold ${info.color}`}>{score}%</motion.span>
              <span className="text-[9px] text-muted-foreground">{isTr ? "Toparlanma" : "Recovery"}</span>
            </div>
          </div>
          <p className="text-xs font-medium mt-2">{info.emoji} {info.label}</p>
        </div>

        {/* 7-day trend */}
        <div className="flex items-end justify-center gap-1 h-10 mb-2">
          {MOCK_7DAY.map((v, i) => (
            <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${(v || score) / 2.5}%` }}
              transition={{ delay: i * 0.1 }}
              className={`w-5 rounded-t ${i === 6 ? info.bg : "bg-slate-200 dark:bg-slate-700"}`} />
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground text-center mb-3">
          {isTr ? "Son 7 gün" : "Last 7 days"} · {isTr ? "Ortalama" : "Avg"}: {Math.round([...MOCK_7DAY.slice(0, 6), score].reduce((a, b) => a + b, 0) / 7)}
        </p>

        <button onClick={() => setCalculated(false)}
          className="w-full rounded-xl border p-2 text-xs text-muted-foreground hover:bg-muted transition-colors">
          {isTr ? "Tekrar Hesapla" : "Recalculate"}
        </button>
      </div>
    )
  }

  // Check-in form
  return (
    <div className="rounded-2xl border bg-white dark:bg-card p-5 shadow-sm">
      <h3 className="text-sm font-bold mb-1">{isTr ? "Günaydın! 👋 Hızlı toparlanma kontrolü" : "Good morning! 👋 Quick recovery check"}</h3>
      <p className="text-[10px] text-muted-foreground mb-4">{isTr ? "(30 saniye)" : "(30 seconds)"}</p>

      {[
        { label: isTr ? "😴 Uyku Kalitesi" : "😴 Sleep Quality", opts: SLEEP_OPTS, val: sleep, set: setSleep },
        { label: isTr ? "⚡ Enerji" : "⚡ Energy Level", opts: ENERGY_OPTS, val: energy, set: setEnergy },
        { label: isTr ? "😊 Ruh Hali" : "😊 Mood", opts: MOOD_OPTS, val: mood, set: setMood },
        { label: isTr ? "🦴 Beden Hissi" : "🦴 Body Feeling", opts: BODY_OPTS, val: body, set: setBody },
      ].map(({ label, opts, val, set }) => (
        <div key={label} className="mb-3">
          <p className="text-xs font-medium mb-1.5">{label}</p>
          <div className="flex gap-1.5">
            {opts.map(o => (
              <button key={o.score} onClick={() => set(o.score)}
                className={`flex-1 rounded-lg border py-2 text-center transition-all ${
                  val === o.score ? "border-primary bg-primary/10 shadow-sm" : "hover:border-primary/30"
                }`}>
                <span className="text-base block">{o.emoji}</span>
                <span className="text-[9px] text-muted-foreground">{isTr ? o.tr : o.en}</span>
              </button>
            ))}
          </div>
        </div>
      ))}

      <button onClick={() => setCalculated(true)} disabled={!allFilled}
        className="w-full rounded-xl bg-primary text-white py-3 text-sm font-semibold disabled:opacity-40 transition-opacity">
        ✨ {isTr ? "Toparlanma Skorumu Hesapla" : "Calculate My Recovery Score"}
      </button>
    </div>
  )
}
