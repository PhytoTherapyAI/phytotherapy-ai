// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const SPENT_ITEMS = [
  { emoji: "🏋️", en: "Gym session", tr: "Spor salonu", cost: -20 },
  { emoji: "☕", en: "2x Coffee", tr: "2x Kahve", cost: -5 },
  { emoji: "😰", en: "Work stress", tr: "İş stresi", cost: -10 },
]

const BOOST_ITEMS = [
  { emoji: "🧘", en: "10-min meditation", tr: "10 dk meditasyon", points: 5 },
  { emoji: "🌿", en: "Ashwagandha 300mg", tr: "Ashwagandha 300mg", points: 3, extra: { en: "+ better sleep tonight", tr: "+ bu gece daha iyi uyku" } },
  { emoji: "😴", en: "Nap 20 min", tr: "20 dk şekerleme", points: 10 },
  { emoji: "🚶", en: "30-min nature walk", tr: "30 dk doğa yürüyüşü", points: 5, extra: { en: "(net: walk -5, nature +10)", tr: "(net: yürüyüş -5, doğa +10)" } },
]

interface Props { lang: "en" | "tr"; recoveryScore?: number }

export function BiologicalBudget({ lang, recoveryScore = 72 }: Props) {
  const isTr = lang === "tr"
  const [showBoosts, setShowBoosts] = useState(false)

  const totalSpent = SPENT_ITEMS.reduce((a, b) => a + b.cost, 0) // negative number
  const remaining = Math.max(0, recoveryScore + totalSpent)
  const pct = Math.round((remaining / recoveryScore) * 100)

  const barColor = pct >= 70 ? "from-emerald-400 to-emerald-600" :
    pct >= 40 ? "from-amber-400 to-amber-600" : "from-red-400 to-orange-500"

  return (
    <div className="rounded-2xl border bg-white dark:bg-card p-5 shadow-sm">
      <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
        🔋 {isTr ? "Bugünkü Biyolojik Bütçe" : "Today's Biological Budget"}
      </h3>

      {/* Budget bar */}
      <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-2">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full bg-gradient-to-r ${barColor}`} />
      </div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold">{pct}% {isTr ? "kalan" : "remaining"}</span>
        {pct < 40 && <span className="text-[10px] text-red-500 font-medium">⚠️ {isTr ? "Bütçe kritik düşük" : "Budget critically low"}</span>}
      </div>

      {/* Recovery → Budget */}
      <div className="text-xs text-muted-foreground mb-2">
        {isTr ? "Toparlanma" : "Recovery"}: {recoveryScore}% → {isTr ? "Başlangıç Bütçesi" : "Starting Budget"}: {recoveryScore} pts
      </div>

      {/* Spent */}
      <div className="space-y-1 mb-3">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase">{isTr ? "Bugün harcanan:" : "Spent today:"}</p>
        {SPENT_ITEMS.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <span>{item.emoji} {isTr ? item.tr : item.en}</span>
            <span className="text-red-500 font-medium">{item.cost}</span>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-primary/5 border border-primary/10 p-3 text-[11px] text-muted-foreground mb-3">
        💡 {isTr
          ? `${remaining} puan kaldı. Hafif bir akşam yürüyüşü (🚶) ve erken uyku (😴 22:30 öncesi) yarınki toparlanmanızı optimize eder.`
          : `${remaining} points remaining. A light evening walk (🚶) and early sleep (😴 before 22:30) would optimize tomorrow's recovery.`}
      </div>

      {/* Boost suggestions */}
      <button onClick={() => setShowBoosts(!showBoosts)}
        className="w-full text-xs font-medium text-primary hover:underline text-left">
        💡 {isTr ? "Bütçemi ne artırır?" : "See what would boost my budget"} {showBoosts ? "▲" : "▼"}
      </button>
      <AnimatePresence>
        {showBoosts && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-2 space-y-1.5">
            {BOOST_ITEMS.map((item, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-emerald-50 dark:bg-emerald-950/20 px-3 py-2 text-xs">
                <span>{item.emoji} {isTr ? item.tr : item.en} {item.extra ? <span className="text-muted-foreground text-[10px]">{isTr ? item.extra.tr : item.extra.en}</span> : null}</span>
                <span className="text-emerald-600 font-bold">+{item.points}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
