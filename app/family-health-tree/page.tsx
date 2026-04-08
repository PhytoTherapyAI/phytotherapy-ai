// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, Sparkles, X, Plus } from "lucide-react"
import { useRouter } from "next/navigation"

interface FamilyMember {
  id: string
  label: string
  emoji: string
  conditions: string[]
  y: number
}

const conditionChips = [
  { emoji: "🩸", label: "Type 2 Diabetes" },
  { emoji: "🫀", label: "Heart Disease" },
  { emoji: "🧠", label: "Alzheimer's" },
  { emoji: "🦋", label: "Thyroid" },
  { emoji: "🫁", label: "Lung Disease" },
  { emoji: "🧬", label: "Cancer" },
  { emoji: "⚖️", label: "Obesity" },
  { emoji: "🩺", label: "Hypertension" },
  { emoji: "🦴", label: "Osteoporosis" },
  { emoji: "🧪", label: "Autoimmune" },
]

const familyTemplate: FamilyMember[] = [
  { id: "grandmother_m", label: "Grandmother (M)", emoji: "👵", conditions: [], y: 0 },
  { id: "grandfather_m", label: "Grandfather (M)", emoji: "👴", conditions: [], y: 0 },
  { id: "grandmother_f", label: "Grandmother (F)", emoji: "👵", conditions: [], y: 0 },
  { id: "grandfather_f", label: "Grandfather (F)", emoji: "👴", conditions: [], y: 0 },
  { id: "mother", label: "Mother", emoji: "👩", conditions: [], y: 1 },
  { id: "father", label: "Father", emoji: "👨", conditions: [], y: 1 },
  { id: "you", label: "You", emoji: "🧬", conditions: [], y: 2 },
]

export default function FamilyHealthTreePage() {
  const router = useRouter()
  const [members, setMembers] = useState(familyTemplate)
  const [activeMember, setActiveMember] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const activeData = members.find(m => m.id === activeMember)

  const addCondition = (memberId: string, condition: string) => {
    setMembers(prev => prev.map(m =>
      m.id === memberId
        ? { ...m, conditions: m.conditions.includes(condition) ? m.conditions.filter(c => c !== condition) : [...m.conditions, condition] }
        : m
    ))
    if (memberId !== "you") {
      setFeedback(`Genetic heritage updated. Your ${members.find(m => m.id === memberId)?.label}'s health data strengthens your personalized shield.`)
      setTimeout(() => setFeedback(null), 3000)
    }
  }

  const totalConditions = members.reduce((acc, m) => acc + m.conditions.length, 0)

  const rows = [
    { y: 0, members: members.filter(m => m.y === 0) },
    { y: 1, members: members.filter(m => m.y === 1) },
    { y: 2, members: members.filter(m => m.y === 2) },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 via-stone-50 to-sage-50/20">
      <div className="max-w-lg mx-auto px-4 py-6 pb-32">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-xl hover:bg-white/60">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="text-center">
            <h1 className="text-lg font-bold text-slate-800">Genetic Constellation</h1>
            <p className="text-xs text-slate-400">Map your family health heritage</p>
          </div>
          <div className="w-9" />
        </motion.div>

        {/* Feedback Toast */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-4 flex items-start gap-2"
            >
              <Sparkles className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-700">{feedback}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Family Tree */}
        <div className="space-y-6 mb-8">
          {rows.map((row, ri) => (
            <motion.div
              key={ri}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: ri * 0.15 }}
            >
              <p className="text-[10px] text-slate-400 uppercase tracking-wider text-center mb-2">
                {ri === 0 ? "Grandparents" : ri === 1 ? "Parents" : "You"}
              </p>
              <div className={`flex justify-center gap-3 ${row.members.length > 2 ? "flex-wrap" : ""}`}>
                {row.members.map(member => {
                  const hasConditions = member.conditions.length > 0
                  const isYou = member.id === "you"
                  return (
                    <motion.button
                      key={member.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveMember(member.id)}
                      className={`relative flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all min-w-[80px] ${
                        isYou
                          ? "border-emerald-400 bg-emerald-50 shadow-lg shadow-emerald-100"
                          : hasConditions
                            ? "border-amber-300 bg-amber-50"
                            : "border-dashed border-slate-200 bg-white"
                      }`}
                    >
                      {isYou && (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400"
                        />
                      )}
                      <span className="text-2xl">{member.emoji}</span>
                      <span className="text-[10px] font-medium text-slate-600 whitespace-nowrap">{member.label}</span>
                      {hasConditions ? (
                        <span className="text-[9px] text-amber-600 font-medium">{member.conditions.length} condition{member.conditions.length > 1 ? "s" : ""}</span>
                      ) : !isYou ? (
                        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }}>
                          <Plus className="w-3.5 h-3.5 text-slate-300" />
                        </motion.div>
                      ) : null}
                    </motion.button>
                  )
                })}
              </div>
              {/* Connection lines */}
              {ri < 2 && (
                <div className="flex justify-center mt-2">
                  <div className="w-px h-4 bg-slate-200" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-slate-100 text-center"
        >
          <p className="text-sm text-slate-500">
            {totalConditions === 0
              ? "Tap family members to add their health conditions"
              : `${totalConditions} condition${totalConditions > 1 ? "s" : ""} mapped across your family tree`
            }
          </p>
        </motion.div>

        {/* Bottom Sheet */}
        <AnimatePresence>
          {activeMember && activeData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm flex items-end justify-center"
              onClick={() => setActiveMember(null)}
            >
              <motion.div
                initial={{ y: 300 }}
                animate={{ y: 0 }}
                exit={{ y: 300 }}
                transition={{ type: "spring", damping: 25 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-t-3xl p-6 w-full max-w-lg shadow-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{activeData.emoji}</span>
                    <h3 className="text-lg font-semibold text-slate-800">{activeData.label}</h3>
                  </div>
                  <button onClick={() => setActiveMember(null)} className="p-2 rounded-full hover:bg-slate-100">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <p className="text-sm text-slate-500 mb-4">Select known health conditions:</p>
                <div className="flex flex-wrap gap-2">
                  {conditionChips.map(chip => {
                    const isActive = activeData.conditions.includes(chip.label)
                    return (
                      <motion.button
                        key={chip.label}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => addCondition(activeData.id, chip.label)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm border-2 transition-all ${
                          isActive ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-100 bg-slate-50 text-slate-600"
                        }`}
                      >
                        <span>{chip.emoji}</span>
                        <span>{chip.label}</span>
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
