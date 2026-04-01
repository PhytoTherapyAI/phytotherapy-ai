// © 2026 Doctopal — All Rights Reserved
"use client"

import { useRef, useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname, useRouter } from "next/navigation"

const TABS = [
  { id: "blood", href: "/blood-test", label: "Blood Test", emoji: "🩸" },
  { id: "radiology", href: "/radiology", label: "Radiology", emoji: "🩻" },
  { id: "body", href: "/body-analysis", label: "Body Analysis", emoji: "⚖️" },
  { id: "symptom", href: "/symptom-checker", label: "Symptom Check", emoji: "🩺" },
  { id: "scan", href: "/scan-medication", label: "Doc Scanner", emoji: "📸" },
  { id: "report", href: "/health-report-card", label: "Health Report", emoji: "📊" },
]

export default function MedicalHubLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIdx, setActiveIdx] = useState(0)

  useEffect(() => {
    const idx = TABS.findIndex(t => pathname.startsWith(t.href))
    if (idx >= 0) setActiveIdx(idx)
  }, [pathname])

  useEffect(() => {
    if (!scrollRef.current) return
    const el = scrollRef.current.children[activeIdx] as HTMLElement
    if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
  }, [activeIdx])

  return (
    <div>
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-background/80 backdrop-blur-xl border-b border-stone-200/50 dark:border-stone-800">
        <div ref={scrollRef} className="flex gap-1 overflow-x-auto scrollbar-hide px-4 py-2 max-w-4xl mx-auto">
          {TABS.map((tab, i) => {
            const isActive = i === activeIdx
            return (
              <motion.button key={tab.id} whileTap={{ scale: 0.93 }}
                onClick={() => { setActiveIdx(i); router.push(tab.href) }}
                className={`relative shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all ${
                  isActive ? "text-white" : "text-muted-foreground hover:bg-stone-100 dark:hover:bg-stone-800"
                }`}>
                {isActive && (
                  <motion.div layoutId="medHubTab" className="absolute inset-0 bg-indigo-600 rounded-full shadow-sm"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                )}
                <span className="relative z-10">{tab.emoji}</span>
                <span className="relative z-10 whitespace-nowrap">{tab.label}</span>
              </motion.button>
            )
          })}
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={pathname} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
