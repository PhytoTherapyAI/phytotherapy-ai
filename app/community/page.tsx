// © 2026 Doctopal — All Rights Reserved
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Heart, MessageCircle, Sparkles, TrendingUp,
  Plus, Award, ChevronRight, Share2, Bookmark,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLang } from "@/components/layout/language-toggle"

// ── Tribes/Circles ──
const TRIBES = [
  { id: "all", label: "All", emoji: "🌍", color: "#3c7a52" },
  { id: "sleep", label: "Sleep Warriors", emoji: "😴", color: "#6366f1" },
  { id: "immunity", label: "Immunity Boosters", emoji: "🛡️", color: "#22c55e" },
  { id: "phyto", label: "Phytotherapy Explorers", emoji: "🌿", color: "#16a34a" },
  { id: "chronic", label: "Chronic Care", emoji: "🩺", color: "#ef4444" },
  { id: "fitness", label: "Fitness Lab", emoji: "💪", color: "#f59e0b" },
]

// ── Empathy Reactions ──
const REACTIONS = [
  { id: "support", emoji: "❤️", label: "Support" },
  { id: "hug", emoji: "🤗", label: "Hug" },
  { id: "inspiring", emoji: "✨", label: "Inspiring" },
  { id: "thanks", emoji: "🙏", label: "Thank You" },
]

// ── Transformation Stories ──
const STORIES = [
  { id: "s1", user: "Ayse K.", avatar: "🧘", text: "Reversed my pre-diabetes in 4 months with turmeric + lifestyle changes.", badge: "Knowledge Sharer", reactions: 142, tribe: "chronic" },
  { id: "s2", user: "Mark T.", avatar: "🏃", text: "From chronic insomnia to 7h deep sleep — magnesium + valerian changed my life.", badge: "Empathic Supporter", reactions: 98, tribe: "sleep" },
  { id: "s3", user: "Dr. Elif", avatar: "👩‍⚕️", text: "My patients who combined omega-3 with their statin therapy showed 40% better results.", badge: "Verified Doctor", reactions: 256, tribe: "phyto" },
]

// ── Mock Posts ──
interface Post {
  id: string; user: string; avatar: string; badge: string; tribe: string
  text: string; image?: boolean; reactions: Record<string, number>; comments: number
  featured: boolean; timeAgo: string
}

const POSTS: Post[] = [
  { id: "p1", user: "Sarah M.", avatar: "🌸", badge: "New Member", tribe: "immunity",
    text: "Just started elderberry syrup this week. Anyone have experience with timing — morning or evening?",
    reactions: { support: 12, hug: 3, inspiring: 1, thanks: 0 }, comments: 8, featured: false, timeAgo: "2h" },
  { id: "p2", user: "Dr. Mehmet", avatar: "👨‍⚕️", badge: "Verified Doctor", tribe: "phyto",
    text: "New meta-analysis on berberine shows comparable effects to metformin for blood sugar control. This is huge for integrative medicine!",
    reactions: { support: 45, inspiring: 32, thanks: 18, hug: 0 }, comments: 24, featured: true, timeAgo: "5h" },
  { id: "p3", user: "Lina R.", avatar: "🌻", badge: "Knowledge Sharer", tribe: "sleep",
    text: "My 30-day sleep protocol results: Magnesium glycinate 400mg + L-theanine 200mg + no screens after 9pm = average sleep score went from 62 to 87!",
    image: true, reactions: { support: 67, inspiring: 41, hug: 8, thanks: 22 }, comments: 31, featured: true, timeAgo: "8h" },
  { id: "p4", user: "Can B.", avatar: "💪", badge: "Empathic Supporter", tribe: "fitness",
    text: "Quick question: Is creatine safe to take with ashwagandha? Getting mixed signals online.",
    reactions: { support: 5, thanks: 2, hug: 0, inspiring: 0 }, comments: 12, featured: false, timeAgo: "1d" },
  { id: "p5", user: "Emma W.", avatar: "🧬", badge: "New Member", tribe: "chronic",
    text: "6 months of anti-inflammatory diet + curcumin supplementation. My CRP dropped from 8.2 to 1.4. Doctor was amazed!",
    image: true, reactions: { support: 89, inspiring: 56, thanks: 34, hug: 12 }, comments: 42, featured: true, timeAgo: "1d" },
]

function ReactionBar({ reactions, postId }: { reactions: Record<string, number>; postId: string }) {
  const [reacted, setReacted] = useState<string | null>(null)
  const [counts, setCounts] = useState(reactions)

  const handleReact = (id: string) => {
    if (reacted === id) {
      setReacted(null)
      setCounts(prev => ({ ...prev, [id]: prev[id] - 1 }))
    } else {
      if (reacted) setCounts(prev => ({ ...prev, [reacted]: prev[reacted] - 1 }))
      setReacted(id)
      setCounts(prev => ({ ...prev, [id]: prev[id] + 1 }))
    }
  }

  return (
    <div className="flex items-center gap-1">
      {REACTIONS.map(r => {
        const count = counts[r.id] || 0
        const isActive = reacted === r.id
        return (
          <motion.button key={r.id} whileTap={{ scale: 0.85 }}
            onClick={() => handleReact(r.id)}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] transition-all ${
              isActive ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}>
            <span className={isActive ? "scale-110" : ""}>{r.emoji}</span>
            {count > 0 && <span className={`font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>{count}</span>}
          </motion.button>
        )
      })}
    </div>
  )
}

export default function CommunityPage() {
  const { lang } = useLang()
  const [activeTribe, setActiveTribe] = useState("all")

  const filtered = activeTribe === "all" ? POSTS : POSTS.filter(p => p.tribe === activeTribe)

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-background">
      <div className="mx-auto max-w-2xl px-4 md:px-8 py-6 space-y-5">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="text-center py-3 space-y-1">
          <h1 className="text-2xl font-bold">Healing Circle</h1>
          <p className="text-xs text-muted-foreground">Your tribe. Your journey. Together.</p>
        </motion.div>

        {/* Tribe chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
          {TRIBES.map((t, i) => {
            const isActive = activeTribe === t.id
            return (
              <motion.button key={t.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileTap={{ scale: 0.93 }}
                onClick={() => setActiveTribe(t.id)}
                className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium transition-all ${
                  isActive ? "text-white shadow-md" : "bg-white dark:bg-card border text-muted-foreground hover:shadow-sm"
                }`}
                style={isActive ? { backgroundColor: t.color } : undefined}>
                <span>{t.emoji}</span> {t.label}
              </motion.button>
            )
          })}
        </div>

        {/* Transformation Stories carousel */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Transformation Stories</span>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
            {STORIES.map((s, i) => (
              <motion.div key={s.id}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                className="min-w-[260px] max-w-[260px] shrink-0 rounded-2xl bg-gradient-to-br from-primary/5 to-emerald-50/50 dark:from-primary/10 dark:to-emerald-900/10 border border-primary/10 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{s.avatar}</span>
                  <div>
                    <p className="text-xs font-bold">{s.user}</p>
                    <Badge variant="secondary" className="text-[8px] px-1.5 py-0">{s.badge}</Badge>
                  </div>
                </div>
                <p className="text-xs text-foreground leading-relaxed line-clamp-3">{s.text}</p>
                <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                  <span>❤️ {s.reactions}</span>
                  <span>•</span>
                  <span className="text-primary font-medium">Read more →</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bento Feed */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((post, i) => (
              <motion.div key={post.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04 }}
                className={`rounded-2xl border bg-white dark:bg-card overflow-hidden transition-shadow hover:shadow-md ${
                  post.featured ? "border-primary/20" : "border-stone-200/60 dark:border-stone-800"
                }`}>
                {/* Featured image placeholder */}
                {post.image && post.featured && (
                  <div className="h-32 bg-gradient-to-br from-primary/10 to-emerald-100/50 dark:from-primary/20 dark:to-emerald-900/20 flex items-center justify-center">
                    <span className="text-4xl">🌿</span>
                  </div>
                )}

                <div className="p-4">
                  {/* Author */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{post.avatar}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold">{post.user}</span>
                          <Badge variant="secondary" className="text-[8px] px-1.5 py-0">{post.badge}</Badge>
                        </div>
                        <span className="text-[10px] text-muted-foreground">{post.timeAgo}</span>
                      </div>
                    </div>
                    <Bookmark className="h-4 w-4 text-muted-foreground/40 hover:text-primary cursor-pointer transition-colors" />
                  </div>

                  {/* Content */}
                  <p className="text-sm text-foreground leading-relaxed mb-3">{post.text}</p>

                  {/* Reactions + Comments */}
                  <div className="flex items-center justify-between">
                    <ReactionBar reactions={post.reactions} postId={post.id} />
                    <button className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
                      <MessageCircle className="h-3.5 w-3.5" />
                      {post.comments}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* FAB — New Post */}
        <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}
          className="fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-emerald-700 text-white shadow-xl shadow-primary/25">
          <Plus className="h-6 w-6" />
        </motion.button>
      </div>
    </div>
  )
}
