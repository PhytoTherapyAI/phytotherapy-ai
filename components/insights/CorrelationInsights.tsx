// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useState } from "react"
import { motion } from "framer-motion"

interface Correlation {
  id: string; factor: string; factorEmoji: string; factorType: string
  outcome: string; outcomeEmoji: string
  direction: "positive" | "negative" | "negative_bad"
  percentage: number; confidence: "high" | "medium" | "low"
  dataPoints: number; insight: string; suggestion: string
}

const MOCK_EN: Correlation[] = [
  { id: "mag-headache", factor: "Magnesium Bisglycinate", factorEmoji: "🌿", factorType: "supplement", outcome: "Headache severity", outcomeEmoji: "🤕", direction: "negative", percentage: 42, confidence: "high", dataPoints: 28, insight: "On days you took Magnesium, your headache severity was 42% lower on average.", suggestion: "Consider taking Magnesium daily — your data strongly supports its benefit for you." },
  { id: "sleep-energy", factor: "7+ hours sleep", factorEmoji: "😴", factorType: "habit", outcome: "Energy level", outcomeEmoji: "⚡", direction: "positive", percentage: 65, confidence: "high", dataPoints: 35, insight: "Nights with 7+ hours of sleep correlated with 65% higher energy the next day.", suggestion: "Prioritize 7+ hours — it's your single biggest energy lever." },
  { id: "coffee-sleep", factor: "Caffeine after 3 PM", factorEmoji: "☕", factorType: "habit", outcome: "Sleep quality", outcomeEmoji: "🌙", direction: "negative_bad", percentage: 38, confidence: "medium", dataPoints: 14, insight: "Caffeine consumed after 3 PM correlated with 38% worse sleep quality.", suggestion: "Try switching to herbal tea after 3 PM — your sleep data will thank you." },
  { id: "exercise-mood", factor: "30+ min exercise", factorEmoji: "🏃", factorType: "habit", outcome: "Mood score", outcomeEmoji: "☀️", direction: "positive", percentage: 55, confidence: "high", dataPoints: 22, insight: "Days with 30+ minutes of exercise showed 55% better mood scores.", suggestion: "Even a 30-minute walk makes a measurable difference in your mood." },
  { id: "turmeric-inflammation", factor: "Turmeric/Curcumin", factorEmoji: "🌿", factorType: "supplement", outcome: "Joint pain", outcomeEmoji: "🦴", direction: "negative", percentage: 31, confidence: "medium", dataPoints: 18, insight: "On days you took Turmeric, joint pain was 31% lower.", suggestion: "Continue Turmeric daily — pair with black pepper for better absorption." },
]

const MOCK_TR: Correlation[] = [
  { id: "mag-headache", factor: "Magnezyum Bisglisinat", factorEmoji: "🌿", factorType: "supplement", outcome: "Baş ağrısı şiddeti", outcomeEmoji: "🤕", direction: "negative", percentage: 42, confidence: "high", dataPoints: 28, insight: "Magnezyum aldığınız günlerde baş ağrısı şiddetiniz ortalama %42 daha düşüktü.", suggestion: "Magnezyumu günlük almayı düşünün — verileriniz faydasını güçlü şekilde destekliyor." },
  { id: "sleep-energy", factor: "7+ saat uyku", factorEmoji: "😴", factorType: "habit", outcome: "Enerji seviyesi", outcomeEmoji: "⚡", direction: "positive", percentage: 65, confidence: "high", dataPoints: 35, insight: "7+ saat uyunan gecelerden sonra enerji %65 daha yüksekti.", suggestion: "7+ saat uykuyu önceliğiniz yapın — enerji için en büyük faktör." },
  { id: "coffee-sleep", factor: "15:00 sonrası kafein", factorEmoji: "☕", factorType: "habit", outcome: "Uyku kalitesi", outcomeEmoji: "🌙", direction: "negative_bad", percentage: 38, confidence: "medium", dataPoints: 14, insight: "15:00 sonrası kafein tüketimi uyku kalitesinde %38 düşüşle ilişkilendirildi.", suggestion: "15:00'ten sonra bitki çayına geçin — uyku veriniz size teşekkür edecek." },
  { id: "exercise-mood", factor: "30+ dk egzersiz", factorEmoji: "🏃", factorType: "habit", outcome: "Ruh hali skoru", outcomeEmoji: "☀️", direction: "positive", percentage: 55, confidence: "high", dataPoints: 22, insight: "30+ dakika egzersiz yapılan günlerde ruh hali %55 daha iyiydi.", suggestion: "30 dakikalık bir yürüyüş bile ruh halinizde ölçülebilir fark yaratıyor." },
  { id: "turmeric-inflammation", factor: "Zerdeçal/Kurkumin", factorEmoji: "🌿", factorType: "supplement", outcome: "Eklem ağrısı", outcomeEmoji: "🦴", direction: "negative", percentage: 31, confidence: "medium", dataPoints: 18, insight: "Zerdeçal aldığınız günlerde eklem ağrısı %31 daha düşüktü.", suggestion: "Zerdeçalı günlük almaya devam edin — emilim için karabiber ile birlikte alın." },
]

const confidenceDots = (c: string) => c === "high" ? "●●●" : c === "medium" ? "●●○" : "●○○"
const confidenceColor = (c: string) => c === "high" ? "text-emerald-500" : c === "medium" ? "text-amber-500" : "text-muted-foreground"

interface Props { lang: "en" | "tr"; compact?: boolean; maxItems?: number }

export function CorrelationInsights({ lang, compact = false, maxItems }: Props) {
  const data = lang === "tr" ? MOCK_TR : MOCK_EN
  const items = maxItems ? data.slice(0, maxItems) : data

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      {items.map((c, i) => {
        const isGood = c.direction === "positive" || c.direction === "negative"
        const arrow = c.direction === "positive" ? "↑" : "↓"
        const label = c.direction === "positive"
          ? (lang === "tr" ? "daha yüksek" : "higher")
          : c.direction === "negative"
          ? (lang === "tr" ? "daha düşük" : "lower")
          : (lang === "tr" ? "daha kötü" : "worse")
        const barColor = isGood ? "from-emerald-400 to-emerald-600" : "from-amber-400 to-orange-500"
        const borderColor = isGood ? "border-emerald-200 dark:border-emerald-800" : "border-amber-200 dark:border-amber-800"

        if (compact) {
          return (
            <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}
              className={`flex items-center gap-3 rounded-xl border ${borderColor} bg-white dark:bg-card p-3`}>
              <span className="text-lg">{c.factorEmoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{c.factor} → {c.outcomeEmoji} {c.outcome}</p>
                <p className={`text-[10px] font-bold ${isGood ? "text-emerald-600" : "text-amber-600"}`}>{arrow} {c.percentage}% {label}</p>
              </div>
            </motion.div>
          )
        }

        return (
          <motion.div key={c.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }}
            className={`rounded-2xl border ${borderColor} bg-white dark:bg-card p-4 shadow-sm hover:shadow-md transition-shadow`}>
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{c.factorEmoji}</span>
              <span className="text-xs font-bold text-foreground">{c.factor}</span>
              <span className="text-muted-foreground">→</span>
              <span className="text-lg">{c.outcomeEmoji}</span>
              <span className="text-xs font-bold text-foreground">{c.outcome}</span>
            </div>
            {/* Bar */}
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-sm font-bold ${isGood ? "text-emerald-600" : "text-amber-600"}`}>{arrow} {c.percentage}%</span>
              <div className="flex-1 h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${c.percentage}%` }}
                  transition={{ duration: 0.8, delay: i * 0.2, ease: "easeOut" }}
                  className={`h-full rounded-full bg-gradient-to-r ${barColor}`} />
              </div>
              <span className="text-[10px] text-muted-foreground">{c.percentage}%</span>
            </div>
            {/* Insight */}
            <p className="text-xs text-muted-foreground mb-2">{c.insight}</p>
            {/* Footer */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">
                📊 {lang === "tr" ? `${c.dataPoints} veri noktasına dayalı` : `Based on ${c.dataPoints} data points`} · <span className={confidenceColor(c.confidence)}>{confidenceDots(c.confidence)}</span>
              </span>
            </div>
            {/* Suggestion */}
            <div className="mt-2 rounded-lg bg-primary/5 border border-primary/10 px-3 py-2">
              <p className="text-[11px] text-primary font-medium">💡 {c.suggestion}</p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export function CorrelationEmptyState({ lang, daysLogged = 3 }: { lang: string; daysLogged?: number }) {
  return (
    <div className="rounded-2xl border bg-white dark:bg-card p-6 text-center">
      <p className="text-3xl mb-2">📊</p>
      <p className="text-sm font-semibold mb-1">
        {lang === "tr" ? `İlk içgörüleriniz için ${7 - daysLogged} gün daha kayıt yapın` : `Keep logging for ${7 - daysLogged} more days to unlock your first correlation insights`}
      </p>
      <p className="text-xs text-muted-foreground mb-3">
        {lang === "tr" ? "Her giriş sağlık haritanızı daha akıllı yapıyor." : "Every entry makes your health map smarter."}
      </p>
      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden max-w-xs mx-auto">
        <motion.div initial={{ width: 0 }} animate={{ width: `${(daysLogged / 7) * 100}%` }}
          transition={{ duration: 1 }} className="h-full rounded-full bg-primary" />
      </div>
      <p className="text-[10px] text-muted-foreground mt-1">{daysLogged}/7 {lang === "tr" ? "gün kaydedildi" : "days logged"}</p>
    </div>
  )
}
