// © 2026 Doctopal — All Rights Reserved
"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronLeft, Sparkles, ChevronDown, Flame, BookOpen,
  PenLine, Clock,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useLang } from "@/components/layout/language-toggle"
import { CorrelationInsights } from "@/components/insights/CorrelationInsights"
import { YearInPixels } from "@/components/insights/YearInPixels"

// ── Types ──
type EnergyLevel = "low" | "normal" | "peak" | null
type MoodLevel = "stormy" | "cloudy" | "sunny" | null
type BodyLevel = "pain" | "bloated" | "light" | null

interface DiaryEntry {
  id: string
  date: string
  energy: EnergyLevel
  mood: MoodLevel
  body: BodyLevel
  note: string
}

// ── Mock data: past entries for heat map ──
const MOCK_ENTRIES: DiaryEntry[] = [
  { id: "1", date: "2026-04-01", energy: "peak", mood: "sunny", body: "light", note: "Great workout day" },
  { id: "2", date: "2026-03-31", energy: "normal", mood: "cloudy", body: "bloated", note: "" },
  { id: "3", date: "2026-03-30", energy: "low", mood: "stormy", body: "pain", note: "Migraine all day" },
  { id: "4", date: "2026-03-29", energy: "peak", mood: "sunny", body: "light", note: "" },
  { id: "5", date: "2026-03-28", energy: "normal", mood: "sunny", body: "light", note: "Slept 8 hours" },
  { id: "6", date: "2026-03-27", energy: "normal", mood: "cloudy", body: "bloated", note: "" },
  { id: "7", date: "2026-03-26", energy: "peak", mood: "sunny", body: "light", note: "" },
  { id: "8", date: "2026-03-25", energy: "low", mood: "stormy", body: "pain", note: "Stress" },
  { id: "9", date: "2026-03-24", energy: "normal", mood: "sunny", body: "light", note: "" },
  { id: "10", date: "2026-03-22", energy: "peak", mood: "sunny", body: "light", note: "" },
  { id: "11", date: "2026-03-20", energy: "normal", mood: "cloudy", body: "bloated", note: "" },
  { id: "12", date: "2026-03-18", energy: "low", mood: "stormy", body: "pain", note: "" },
]

// ── Heat map helpers ──
function generateHeatMapData() {
  const days: { date: string; intensity: number }[] = []
  const entryDates = new Set(MOCK_ENTRIES.map(e => e.date))
  const today = new Date()
  for (let i = 83; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split("T")[0]
    const entry = MOCK_ENTRIES.find(e => e.date === dateStr)
    let intensity = 0
    if (entry) {
      intensity = entry.energy === "peak" ? 3 : entry.energy === "normal" ? 2 : 1
    }
    days.push({ date: dateStr, intensity })
  }
  return days
}

const HEAT_COLORS = ["bg-slate-100 dark:bg-slate-800", "bg-emerald-200", "bg-emerald-400", "bg-emerald-600"]

// ── AI Companion messages ──
function getAIMessage(energy: EnergyLevel, mood: MoodLevel, body: BodyLevel): { message: string; source: string } {
  if (energy === "low") return {
    message: "Your energy seems low today. Consider Magnesium Bisglycinate (200mg) for cellular energy production, and a 15-minute power nap if possible.",
    source: "PubMed: PMID 31691121 — Magnesium & Energy Metabolism"
  }
  if (mood === "stormy") return {
    message: "Rough day? Ashwagandha KSM-66 (300mg) and a 10-minute box breathing exercise might help restore your balance. Be gentle with yourself.",
    source: "PubMed: PMID 32021735 — Ashwagandha & Stress Reduction"
  }
  if (body === "pain") return {
    message: "Body aches noted. Curcumin with black pepper extract (500mg + 5mg piperine) is your anti-inflammatory ally. Gentle stretching helps too.",
    source: "PubMed: PMID 29065496 — Curcumin Bioavailability"
  }
  if (body === "bloated") return {
    message: "Feeling bloated? Peppermint oil capsules (0.2ml enteric-coated) can relax intestinal smooth muscle. Avoid carbonated drinks today.",
    source: "PubMed: PMID 30654773 — Peppermint Oil & GI Symptoms"
  }
  if (energy === "peak" && mood === "sunny") return {
    message: "You're on fire today! Great time for a challenging workout. Consider Rhodiola Rosea (200mg) to sustain peak performance throughout the day.",
    source: "PubMed: PMID 22228617 — Rhodiola & Physical Performance"
  }
  if (mood === "sunny") return {
    message: "Glad you're feeling good! Maintain the momentum with Omega-3 (1g EPA+DHA) — it supports both cognitive clarity and mood stability long-term.",
    source: "PubMed: PMID 31905352 — Omega-3 & Cognitive Health"
  }
  return {
    message: "How are you feeling today? Select your energy, mood, and body status above, and I'll provide personalized evidence-based suggestions.",
    source: ""
  }
}

// ── Chip Component ──
function StatusChip({ emoji, label, isActive, onClick }: {
  emoji: string; label: string; isActive: boolean; onClick: () => void
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 text-sm font-medium transition-all ${
        isActive
          ? "border-emerald-400 bg-emerald-50 text-emerald-700 shadow-sm dark:bg-emerald-950/40 dark:border-emerald-600 dark:text-emerald-300"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
      }`}
    >
      <motion.span
        animate={isActive ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.3 }}
        className="text-lg"
      >
        {emoji}
      </motion.span>
      {label}
    </motion.button>
  )
}

// ── Confetti Burst ──
function ConfettiBurst({ show }: { show: boolean }) {
  if (!show) return null
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i / 24) * 360
        const distance = 80 + Math.random() * 120
        const x = Math.cos((angle * Math.PI) / 180) * distance
        const y = Math.sin((angle * Math.PI) / 180) * distance
        const colors = ["bg-emerald-400", "bg-amber-400", "bg-rose-400", "bg-blue-400", "bg-purple-400"]
        return (
          <motion.div
            key={i}
            initial={{ x: "50vw", y: "50vh", opacity: 1, scale: 1 }}
            animate={{ x: `calc(50vw + ${x}px)`, y: `calc(50vh + ${y}px)`, opacity: 0, scale: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`absolute w-2 h-2 rounded-full ${colors[i % colors.length]}`}
          />
        )
      })}
    </div>
  )
}

// ── Heat Map ──
function HabitHeatMap({ data }: { data: { date: string; intensity: number }[] }) {
  const weeks: { date: string; intensity: number }[][] = []
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7))
  }
  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"]

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-1 mr-1">
          {dayLabels.map((d, i) => (
            <div key={i} className="h-[14px] text-[9px] text-slate-400 flex items-center justify-end pr-1 w-4">
              {i % 2 === 0 ? d : ""}
            </div>
          ))}
        </div>
        {/* Weeks */}
        {weeks.map((week, wi) => (
          <motion.div
            key={wi}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: wi * 0.03 }}
            className="flex flex-col gap-1"
          >
            {week.map((day, di) => (
              <motion.div
                key={di}
                whileHover={{ scale: 1.4 }}
                className={`w-[14px] h-[14px] rounded-[3px] ${HEAT_COLORS[day.intensity]} transition-colors cursor-default`}
                title={`${day.date} — ${day.intensity === 0 ? "No entry" : `Intensity ${day.intensity}`}`}
              />
            ))}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ── Entry Card ──
function EntryCard({ entry }: { entry: DiaryEntry }) {
  const energyEmoji = entry.energy === "peak" ? "🔥" : entry.energy === "normal" ? "⚡" : "🔋"
  const moodEmoji = entry.mood === "sunny" ? "☀️" : entry.mood === "cloudy" ? "⛅" : "🌧️"
  const bodyEmoji = entry.body === "light" ? "🪶" : entry.body === "bloated" ? "🎈" : "😣"
  const d = new Date(entry.date)
  const dayStr = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-xl p-3.5 border border-slate-100 dark:border-slate-700"
    >
      <div className="text-xs text-slate-400 w-16 flex-shrink-0">
        <Clock className="w-3 h-3 inline mr-1" />{dayStr}
      </div>
      <div className="flex items-center gap-2 text-lg">
        <span title="Energy">{energyEmoji}</span>
        <span title="Mood">{moodEmoji}</span>
        <span title="Body">{bodyEmoji}</span>
      </div>
      {entry.note && <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex-1">{entry.note}</p>}
    </motion.div>
  )
}

// ═══ MAIN PAGE ═══
export default function HealthDiaryPage() {
  const router = useRouter()
  const { lang } = useLang()
  const [energy, setEnergy] = useState<EnergyLevel>(null)
  const [mood, setMood] = useState<MoodLevel>(null)
  const [body, setBody] = useState<BodyLevel>(null)
  const [note, setNote] = useState("")
  const [noteOpen, setNoteOpen] = useState(false)
  const [entries, setEntries] = useState<DiaryEntry[]>(MOCK_ENTRIES)
  const [showConfetti, setShowConfetti] = useState(false)
  const [sourcesOpen, setSourcesOpen] = useState(false)

  const heatMapData = useMemo(() => generateHeatMapData(), [])
  const streak = 12 // mock
  const aiResponse = getAIMessage(energy, mood, body)
  const hasSelection = energy || mood || body

  const handleLog = () => {
    if (!hasSelection) return
    const newEntry: DiaryEntry = {
      id: String(Date.now()),
      date: new Date().toISOString().split("T")[0],
      energy, mood, body, note,
    }
    setEntries(prev => [newEntry, ...prev])
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 1000)
    setEnergy(null); setMood(null); setBody(null); setNote(""); setNoteOpen(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background">
      <ConfettiBurst show={showConfetti} />

      <div className="max-w-7xl mx-auto px-4 py-6 md:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 -ml-2 rounded-xl hover:bg-white dark:hover:bg-slate-800">
              <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-500" />
                Biometric Logbook
              </h1>
              <p className="text-xs text-slate-400">Map your biological journey</p>
            </div>
          </div>
          {/* Streak */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800 rounded-full px-3.5 py-1.5"
          >
            <Flame className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400">{streak} Day Streak</span>
          </motion.div>
        </motion.div>

        {/* ── DESKTOP 2-COLUMN / MOBILE 1-COLUMN ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ═══ LEFT: Main Content (2/3) ═══ */}
          <div className="lg:col-span-2 space-y-6">

            {/* Quick Status Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 dark:bg-card backdrop-blur rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800 shadow-sm"
            >
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
                <PenLine className="w-4 h-4" /> How are you feeling right now?
              </p>

              {/* Energy */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Energy</p>
                <div className="flex gap-2 flex-wrap">
                  <StatusChip emoji="🔋" label="Low" isActive={energy === "low"} onClick={() => setEnergy(energy === "low" ? null : "low")} />
                  <StatusChip emoji="⚡" label="Normal" isActive={energy === "normal"} onClick={() => setEnergy(energy === "normal" ? null : "normal")} />
                  <StatusChip emoji="🔥" label="Peak" isActive={energy === "peak"} onClick={() => setEnergy(energy === "peak" ? null : "peak")} />
                </div>
              </div>

              {/* Mood */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Mood</p>
                <div className="flex gap-2 flex-wrap">
                  <StatusChip emoji="🌧️" label="Stormy" isActive={mood === "stormy"} onClick={() => setMood(mood === "stormy" ? null : "stormy")} />
                  <StatusChip emoji="⛅" label="Cloudy" isActive={mood === "cloudy"} onClick={() => setMood(mood === "cloudy" ? null : "cloudy")} />
                  <StatusChip emoji="☀️" label="Sunny" isActive={mood === "sunny"} onClick={() => setMood(mood === "sunny" ? null : "sunny")} />
                </div>
              </div>

              {/* Body */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Body</p>
                <div className="flex gap-2 flex-wrap">
                  <StatusChip emoji="😣" label="Pain" isActive={body === "pain"} onClick={() => setBody(body === "pain" ? null : "pain")} />
                  <StatusChip emoji="🎈" label="Bloated" isActive={body === "bloated"} onClick={() => setBody(body === "bloated" ? null : "bloated")} />
                  <StatusChip emoji="🪶" label="Light" isActive={body === "light"} onClick={() => setBody(body === "light" ? null : "light")} />
                </div>
              </div>

              {/* Optional Note */}
              <button
                onClick={() => setNoteOpen(!noteOpen)}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 mb-3"
              >
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${noteOpen ? "rotate-180" : ""}`} />
                Add a note (optional)
              </button>
              <AnimatePresence>
                {noteOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="How was your day? Any symptoms, wins, or thoughts..."
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm resize-none h-20 focus:outline-none focus:border-emerald-300"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Log Button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleLog}
                disabled={!hasSelection}
                className={`w-full mt-4 py-3.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                  hasSelection
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                Log Today&apos;s Status
              </motion.button>
            </motion.div>

            {/* Habit Heat Map */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white/80 dark:bg-card backdrop-blur rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Activity Map — Last 12 Weeks</h3>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] text-slate-400">Less</span>
                  {HEAT_COLORS.map((c, i) => (
                    <div key={i} className={`w-[10px] h-[10px] rounded-[2px] ${c}`} />
                  ))}
                  <span className="text-[9px] text-slate-400">More</span>
                </div>
              </div>
              <HabitHeatMap data={heatMapData} />
            </motion.div>

            {/* Recent Entries */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 px-1">Recent Entries</h3>
              {entries.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white/80 dark:bg-card backdrop-blur rounded-2xl p-10 border border-slate-200/60 dark:border-slate-800 text-center"
                >
                  <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                    Listen to what your body told you today. Start mapping your biological journey by creating your first entry.
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-2">
                  {entries.slice(0, 7).map(entry => (
                    <EntryCard key={entry.id} entry={entry} />
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* ═══ RIGHT: AI Companion Panel (1/3, sticky on desktop) ═══ */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:sticky lg:top-24 lg:self-start"
          >
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-900/30 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center"
                >
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                </motion.div>
                <div>
                  <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Daily AI Companion</h3>
                  <p className="text-[10px] text-emerald-600/60 dark:text-emerald-400/60">Evidence-based insights</p>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={`${energy}-${mood}-${body}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {aiResponse.message}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Sources */}
              {aiResponse.source && (
                <div className="mt-4">
                  <button
                    onClick={() => setSourcesOpen(!sourcesOpen)}
                    className="flex items-center gap-1 text-[10px] text-emerald-600/70 dark:text-emerald-400/70 hover:text-emerald-700"
                  >
                    <ChevronDown className={`w-3 h-3 transition-transform ${sourcesOpen ? "rotate-180" : ""}`} />
                    Sources
                  </button>
                  <AnimatePresence>
                    {sourcesOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 bg-white/50 dark:bg-slate-800/50 rounded-lg px-3 py-2">
                          {aiResponse.source}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Quick Tips */}
              <div className="mt-5 pt-4 border-t border-emerald-200/50 dark:border-emerald-800/30">
                <p className="text-[10px] text-emerald-600/60 dark:text-emerald-400/60 uppercase tracking-wider mb-2">Quick Tips</p>
                <div className="space-y-2">
                  {[
                    "Log at the same time daily for best pattern detection",
                    "The more data points, the smarter your AI companion gets",
                    "Your data is end-to-end encrypted and never shared",
                  ].map((tip, i) => (
                    <p key={i} className="text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
                      <span className="text-emerald-400 mt-0.5">•</span> {tip}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Health Correlations ── */}
        <div className="mt-8">
          <h2 className="text-base font-bold mb-1 flex items-center gap-2">
            🔬 {lang === "tr" ? "Sağlık Korelasyonlarınız" : "Your Health Correlations"}
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            {lang === "tr" ? "DoctoPal AI son 30 gününüzü analiz etti ve şu örüntüleri buldu:" : "DoctoPal AI analyzed your last 30 days and found these patterns:"}
          </p>
          <CorrelationInsights lang={lang} />
        </div>

        {/* ── Year in Pixels ── */}
        <div className="mt-8">
          <YearInPixels lang={lang} />
        </div>
      </div>
    </div>
  )
}
