// © 2026 DoctoPal — All Rights Reserved
"use client"

import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

const tabs = [
  { emoji: "🌸", label: "Women's Health", href: "/womens-health" },
  { emoji: "🤰", label: "Pregnancy", href: "/pregnancy-tracker" },
  { emoji: "👶", label: "Postpartum", href: "/postpartum-support" },
  { emoji: "🍂", label: "Menopause", href: "/menopause-panel" },
  { emoji: "⚡", label: "Men's Health", href: "/mens-health" },
  { emoji: "🔒", label: "Sexual Health", href: "/sexual-health" },
]

export default function HormonalHealthHubLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <div className="min-h-screen">
      {/* Tab Bar */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-lg mx-auto px-2">
          <div className="flex overflow-x-auto scrollbar-hide gap-1 py-2">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href
              return (
                <button
                  key={tab.href}
                  onClick={() => router.push(tab.href)}
                  className={`relative flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-fuchsia-100 text-fuchsia-800"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="hormonal-tab-bg"
                      className="absolute inset-0 bg-fuchsia-100 rounded-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{tab.emoji}</span>
                  <span className="relative z-10">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
