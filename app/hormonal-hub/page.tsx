// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

const tools = [
  { emoji: "🌸", label: "Women's Health", desc: "Cycle tracking & hormonal compass", href: "/womens-health", color: "from-rose-50 to-pink-50 border-rose-100" },
  { emoji: "🤰", label: "Pregnancy Tracker", desc: "Week-by-week bloom dashboard", href: "/pregnancy-tracker", color: "from-orange-50 to-amber-50 border-orange-100" },
]

export default function HormonalHubPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-lg mx-auto px-4 py-8 pb-32">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Hormonal Health Hub</h1>
          <p className="text-sm text-slate-500 mt-1">Navigate your hormonal wellness journey</p>
        </motion.div>

        <div className="grid grid-cols-1 gap-3">
          {tools.map((tool, i) => (
            <motion.button
              key={tool.href}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push(tool.href)}
              className={`flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r ${tool.color} border text-left shadow-sm hover:shadow-md transition-shadow`}
            >
              <span className="text-3xl">{tool.emoji}</span>
              <div>
                <p className="text-sm font-semibold text-slate-800">{tool.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{tool.desc}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
