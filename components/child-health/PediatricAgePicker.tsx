// © 2026 Doctopal — All Rights Reserved
"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle } from "lucide-react"

interface PediatricAgePickerProps {
  onSelect: (years: number, months: number) => void
  lang: string
}

const YEARS = Array.from({ length: 19 }, (_, i) => i) // 0-18
const MONTHS = Array.from({ length: 12 }, (_, i) => i) // 0-11

function DrumRoller({ items, selected, onSelect, label, suffix }: {
  items: number[]; selected: number; onSelect: (v: number) => void; label: string; suffix: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const ITEM_H = 44

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = selected * ITEM_H
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return
    const idx = Math.round(containerRef.current.scrollTop / ITEM_H)
    const clamped = Math.max(0, Math.min(idx, items.length - 1))
    if (clamped !== selected) onSelect(clamped)
  }, [items.length, selected, onSelect])

  return (
    <div className="flex-1 flex flex-col items-center">
      <span className="text-[10px] font-medium text-muted-foreground mb-2 uppercase tracking-wider">{label}</span>
      <div className="relative h-[132px] overflow-hidden rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/30 dark:border-white/10">
        {/* Selection highlight */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[44px] bg-primary/10 border-y border-primary/20 z-10 pointer-events-none rounded-lg mx-1" />

        <div ref={containerRef} onScroll={handleScroll}
          className="h-full overflow-y-auto scrollbar-hide snap-y snap-mandatory"
          style={{ scrollSnapType: "y mandatory" }}>
          {/* Padding items for centering */}
          <div style={{ height: ITEM_H }} />
          {items.map(val => {
            const isSelected = val === selected
            return (
              <div key={val}
                className="snap-center flex items-center justify-center cursor-pointer transition-all duration-200"
                style={{ height: ITEM_H }}
                onClick={() => onSelect(val)}>
                <span className={`text-center transition-all duration-200 ${
                  isSelected
                    ? "text-xl font-bold text-primary scale-110"
                    : "text-base text-muted-foreground/50"
                }`}>
                  {val} {suffix}
                </span>
              </div>
            )
          })}
          <div style={{ height: ITEM_H }} />
        </div>

        {/* Fade edges */}
        <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white/80 dark:from-background/80 to-transparent pointer-events-none z-20" />
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white/80 dark:from-background/80 to-transparent pointer-events-none z-20" />
      </div>
    </div>
  )
}

export function PediatricAgePicker({ onSelect, lang }: PediatricAgePickerProps) {
  const [years, setYears] = useState(1)
  const [months, setMonths] = useState(0)
  const isNewborn = years === 0 && months <= 2

  useEffect(() => {
    onSelect(years, months)
  }, [years, months, onSelect])

  return (
    <div className="space-y-4">
      {/* Dual drum roller */}
      <div className="flex gap-4 px-4">
        <DrumRoller
          items={YEARS} selected={years} onSelect={setYears}
          label={lang === "tr" ? "Yıl" : "Year"}
          suffix={lang === "tr" ? "yıl" : "yr"}
        />
        <DrumRoller
          items={MONTHS} selected={months} onSelect={setMonths}
          label={lang === "tr" ? "Ay" : "Month"}
          suffix={lang === "tr" ? "ay" : "mo"}
        />
      </div>

      {/* Selected display */}
      <div className="text-center">
        <span className="text-sm text-muted-foreground">
          {lang === "tr" ? "Seçilen yaş: " : "Selected age: "}
        </span>
        <span className="text-sm font-bold text-foreground">
          {years > 0 ? `${years} ${lang === "tr" ? "yıl" : "year"}${years > 1 && lang === "en" ? "s" : ""} ` : ""}
          {months > 0 || years === 0 ? `${months} ${lang === "tr" ? "ay" : "month"}${months > 1 && lang === "en" ? "s" : ""}` : ""}
        </span>
      </div>

      {/* Newborn warning */}
      <AnimatePresence>
        {isNewborn && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            className="overflow-hidden">
            <div className="rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200/50 p-4 flex gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                  {lang === "tr" ? "Yenidoğan Uyarısı" : "Newborn Alert"}
                </p>
                <p className="text-xs text-amber-600/80 dark:text-amber-300/80 mt-1">
                  {lang === "tr"
                    ? "0-2 aylık bebekler için tüm sağlık sorunlarında mutlaka bir pediatriste danışın. Bu yaş grubunda bitkisel takviye önerilmez."
                    : "For babies aged 0-2 months, always consult a pediatrician for all health concerns. Herbal supplements are not recommended for this age group."}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
