// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useRef, useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname, useRouter } from "next/navigation"
import {
  Heart, Baby, BookOpen, Shield, Droplets,
  Puzzle, Dna, Plane, Sun, Activity,
  Stethoscope, Sparkles,
} from "lucide-react"

interface TabItem {
  id: string
  href: string
  label: string
  labelTr: string
  icon: React.ReactNode
  emoji: string
}

const TABS: TabItem[] = [
  { id: "chronic", href: "/chronic-care", label: "Chronic Care", labelTr: "Kronik Bakım", icon: <Activity className="h-4 w-4" />, emoji: "🩺" },
  { id: "travel", href: "/travel-health", label: "Travel", labelTr: "Seyahat", icon: <Plane className="h-4 w-4" />, emoji: "✈️" },
  { id: "seasonal", href: "/seasonal-health", label: "Seasonal", labelTr: "Mevsimsel", icon: <Sun className="h-4 w-4" />, emoji: "🌸" },
]

interface LifeStagesShellProps {
  children: React.ReactNode
  lang: string
}

export function LifeStagesShell({ children, lang }: LifeStagesShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIdx, setActiveIdx] = useState(0)

  // Sync active tab with pathname
  useEffect(() => {
    const idx = TABS.findIndex(t => pathname.startsWith(t.href))
    if (idx >= 0) setActiveIdx(idx)
  }, [pathname])

  // Scroll active tab into view
  useEffect(() => {
    if (!scrollRef.current) return
    const activeBtn = scrollRef.current.children[activeIdx] as HTMLElement
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
    }
  }, [activeIdx])

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-background">
      {/* Sticky scrollable tab bar */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-background/80 backdrop-blur-xl border-b border-stone-200/50 dark:border-stone-800">
        <div ref={scrollRef}
          className="flex gap-1 overflow-x-auto scrollbar-hide px-4 py-2 max-w-4xl mx-auto">
          {TABS.map((tab, i) => {
            const isActive = i === activeIdx
            return (
              <motion.button key={tab.id}
                whileTap={{ scale: 0.93 }}
                onClick={() => { setActiveIdx(i); router.push(tab.href) }}
                className={`relative shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? "text-white"
                    : "text-muted-foreground hover:bg-stone-100 dark:hover:bg-stone-800"
                }`}>
                {isActive && (
                  <motion.div layoutId="lifeStagesTab"
                    className="absolute inset-0 bg-primary rounded-full shadow-sm"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                )}
                <span className="relative z-10">{tab.emoji}</span>
                <span className="relative z-10 whitespace-nowrap">
                  {lang === "tr" ? tab.labelTr : tab.label}
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Content with crossfade */}
      <AnimatePresence mode="wait">
        <motion.div key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}>
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
