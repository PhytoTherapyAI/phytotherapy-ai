// © 2026 Doctopal — All Rights Reserved
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import {
  MessageCircle,
  BookOpen,
  Headphones,
  Award,
  Brain,
  CheckCircle,
  Search,
  TrendingUp,
  Users,
  Sparkles,
} from "lucide-react"

const heroCards = [
  {
    title: "Healing Circle",
    desc: "340 new messages today",
    emoji: "🌿",
    color: "from-emerald-100 to-green-50 border-emerald-200",
    textColor: "text-emerald-800",
    icon: Users,
  },
  {
    title: "Health Forum",
    desc: "Ask the community anything",
    emoji: "💬",
    color: "from-blue-100 to-sky-50 border-blue-200",
    textColor: "text-blue-800",
    icon: MessageCircle,
  },
]

const mediaCards = [
  { title: "Sleep Science", author: "Dr. Sarah Chen", type: "Podcast", emoji: "🎧", duration: "28 min", color: "bg-purple-50" },
  { title: "Gut-Brain Connection", author: "Doctopal Academy", type: "Course", emoji: "📚", duration: "6 lessons", color: "bg-amber-50" },
  { title: "Anti-Inflammatory Kitchen", author: "Chef Maria", type: "Expert", emoji: "🍳", duration: "12 articles", color: "bg-orange-50" },
  { title: "Mindful Movement", author: "Yoga Lab", type: "Course", emoji: "🧘", duration: "8 sessions", color: "bg-teal-50" },
]

const quickPills = [
  { emoji: "🧠", label: "Health Quiz", icon: Brain },
  { emoji: "✓", label: "Fact Check", icon: CheckCircle },
  { emoji: "📖", label: "Medical Dictionary", icon: BookOpen },
  { emoji: "📈", label: "Trending Topics", icon: TrendingUp },
  { emoji: "🏆", label: "Leaderboard", icon: Award },
  { emoji: "🎧", label: "Podcasts", icon: Headphones },
]

export default function DiscoverPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-orange-50/20 to-stone-50">
      <div className="max-w-lg mx-auto px-4 py-6 pb-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-slate-800">Discover</h1>
          <p className="text-sm text-slate-500 mt-0.5">Learn, connect, grow together</p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative mb-6"
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topics, courses, community..."
            className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-primary shadow-sm"
          />
        </motion.div>

        {/* Hero Cards — Bento Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {heroCards.map((card, i) => (
            <motion.button
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              whileTap={{ scale: 0.97 }}
              className={`p-5 rounded-2xl bg-gradient-to-br ${card.color} border text-left shadow-sm`}
            >
              <span className="text-3xl block mb-3">{card.emoji}</span>
              <h3 className={`text-sm font-bold ${card.textColor}`}>{card.title}</h3>
              <p className="text-xs text-slate-500 mt-1">{card.desc}</p>
            </motion.button>
          ))}
        </div>

        {/* Media Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-sm font-semibold text-slate-700">Trending Content</h3>
            <button className="text-xs text-primary font-medium">See all</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {mediaCards.map((card, i) => (
              <motion.button
                key={card.title}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.05 }}
                whileTap={{ scale: 0.96 }}
                className={`flex-shrink-0 w-44 ${card.color} rounded-2xl p-4 text-left border border-white/50 shadow-sm`}
              >
                <span className="text-2xl block mb-2">{card.emoji}</span>
                <h4 className="text-sm font-semibold text-slate-700 leading-tight">{card.title}</h4>
                <p className="text-[10px] text-slate-500 mt-1">{card.author}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[9px] text-slate-400 bg-white/60 px-2 py-0.5 rounded-full">{card.type}</span>
                  <span className="text-[9px] text-slate-400">{card.duration}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* AI Insight Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-5 mb-6 border border-emerald-100"
        >
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-emerald-700">Did You Know?</h3>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                Turmeric combined with black pepper increases curcumin absorption by 2000%.
                This is why traditional Indian medicine always pairs them together.
              </p>
              <button className="text-xs text-emerald-600 font-medium mt-2">Learn more →</button>
            </div>
          </div>
        </motion.div>

        {/* Quick Access Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <h3 className="text-sm font-semibold text-slate-700 mb-3 px-1">Quick Access</h3>
          <div className="flex flex-wrap gap-2">
            {quickPills.map((pill, i) => (
              <motion.button
                key={pill.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.04 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-slate-200 text-sm text-slate-600 shadow-sm hover:shadow-md transition-shadow"
              >
                <span>{pill.emoji}</span>
                <span>{pill.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Coming Soon Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-xs text-slate-400">
            Community features launching soon. Stay tuned!
          </p>
        </motion.div>
      </div>
    </div>
  )
}
