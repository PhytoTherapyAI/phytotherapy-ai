// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Shield } from "lucide-react"

const tools = [
  { emoji: "🩺", label: "Check-up Planner", desc: "Longevity shield & annual planning", href: "/checkup-planner", color: "from-blue-50 to-sky-50 border-blue-100" },
  { emoji: "🔬", label: "Cancer Screening", desc: "Early detection & cell protection", href: "/cancer-screening", color: "from-teal-50 to-emerald-50 border-teal-100" },
  { emoji: "🌳", label: "Family Health Tree", desc: "Genetic constellation mapping", href: "/family-health-tree", color: "from-emerald-50 to-green-50 border-emerald-100" },
  { emoji: "🧬", label: "Genetic Risk Profile", desc: "Epigenetic control center", href: "/genetic-risk", color: "from-slate-100 to-purple-50 border-slate-200" },
  { emoji: "🛑", label: "Allergy & Intolerance Map", desc: "Immunological shield", href: "/allergy-map", color: "from-amber-50 to-orange-50 border-amber-100" },
  { emoji: "🛡️", label: "Vaccine Tracker", desc: "Biological armor upgrades", href: "/vaccine-tracker", color: "from-cyan-50 to-blue-50 border-cyan-100" },
]

export default function PreventionHubPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-lg mx-auto px-4 py-8 pb-32">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <Shield className="w-8 h-8 text-teal-500 mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-slate-800">Prevention & Screening Hub</h1>
          <p className="text-sm text-slate-500 mt-1">Proactive health protection</p>
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
