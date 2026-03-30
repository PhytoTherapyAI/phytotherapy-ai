// © 2026 Phytotherapy.ai — All Rights Reserved
// Behavioral Feedback Widget — IKEA Effect + Variable Reward
"use client"

import { useState, useMemo, useEffect } from "react"
import { usePathname } from "next/navigation"
import { useLang } from "@/components/layout/language-toggle"
import { MessageSquarePlus, X, Send, Check, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

const HIDDEN_PATHS = ["/health-assistant", "/interaction-checker", "/blood-test"]

type FeedbackCategory = "idea" | "love" | "bug"

const CATEGORIES: Array<{
  key: FeedbackCategory
  emoji: string
  label: { en: string; tr: string }
  color: string
}> = [
  { key: "idea", emoji: "💡", label: { en: "I Have a Great Idea!", tr: "Harika Bir Fikrim Var!" }, color: "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-300" },
  { key: "love", emoji: "❤️", label: { en: "I Love This!", tr: "Bunu Çok Sevdim!" }, color: "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-700 dark:bg-rose-950/30 dark:text-rose-300" },
  { key: "bug", emoji: "🐛", label: { en: "Small Hiccup", tr: "Ufak Bir Pürüz Var" }, color: "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950/30 dark:text-blue-300" },
]

export function FeedbackWidget() {
  const pathname = usePathname()
  const { lang } = useLang()
  const { profile } = useAuth()
  const isTr = lang === "tr"
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<"chips" | "form" | "sending" | "done">("chips")
  const [category, setCategory] = useState<FeedbackCategory | null>(null)
  const [message, setMessage] = useState("")
  const [showConfetti, setShowConfetti] = useState(false)

  if (HIDDEN_PATHS.includes(pathname)) return null

  const handleSelectCategory = (cat: FeedbackCategory) => {
    setCategory(cat)
    setStep("form")
  }

  const handleSubmit = async () => {
    if (!message.trim() && !category) return
    setStep("sending")

    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page: pathname,
          category,
          message: message.trim(),
          user_id: profile?.id || null,
          lang,
        }),
      })
    } catch { /* still show success */ }

    setStep("done")
    setShowConfetti(true)
  }

  const reset = () => {
    setOpen(false)
    setStep("chips")
    setCategory(null)
    setMessage("")
    setShowConfetti(false)
  }

  // Confetti pieces
  const confettiPieces = useMemo(() => Array.from({ length: 30 }, (_, i) => ({
    left: ((i * 7919) % 1000) / 10,
    size: 4 + ((i * 6271) % 1000) / 100 * 6,
    dur: 1.2 + ((i * 4817) % 1000) / 1000 * 1,
    delay: ((i * 1327) % 1000) / 1000 * 0.4,
    color: ["#5aac74", "#b8965a", "#60a5fa", "#f472b6", "#facc15", "#a78bfa"][i % 6],
    isCircle: ((i * 3541) % 1000) > 500,
  })), [])

  useEffect(() => {
    if (showConfetti) {
      const t = setTimeout(() => setShowConfetti(false), 2500)
      return () => clearTimeout(t)
    }
  }, [showConfetti])

  return (
    <>
      {/* FAB */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-emerald-700 text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:shadow-xl active:scale-95"
          aria-label="Feedback"
        >
          <MessageSquarePlus className="h-5 w-5" />
        </button>
      )}

      {/* Popover */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-80 rounded-2xl border bg-card shadow-2xl shadow-black/10 overflow-hidden">
          {/* Confetti overlay */}
          {showConfetti && (
            <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
              {confettiPieces.map((p, i) => (
                <div key={i} style={{
                  position: "absolute", left: `${p.left}%`, top: "-8px",
                  width: `${p.size}px`, height: `${p.size}px`,
                  backgroundColor: p.color,
                  borderRadius: p.isCircle ? "50%" : "2px",
                  animation: `fb-confetti ${p.dur}s ${p.delay}s cubic-bezier(0.37,0,0.63,1) forwards`,
                }} />
              ))}
              <style jsx>{`
                @keyframes fb-confetti {
                  0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
                  100% { transform: translateY(300px) rotate(720deg) scale(0.2); opacity: 0; }
                }
              `}</style>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <span className="text-sm font-bold">
              {isTr ? "phytotherapy.ai'yi birlikte geliştiriyoruz!" : "Let's build phytotherapy.ai together!"}
            </span>
            <button onClick={reset} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-4 relative">
            {/* Step 1: Category chips */}
            {step === "chips" && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  {isTr ? "Nasıl katkı sağlamak istersin?" : "How would you like to contribute?"}
                </p>
                <div className="space-y-2">
                  {CATEGORIES.map(({ key, emoji, label, color }) => (
                    <button
                      key={key}
                      onClick={() => handleSelectCategory(key)}
                      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] ${color}`}
                    >
                      <span className="text-lg">{emoji}</span>
                      {label[lang]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Message form */}
            {step === "form" && (
              <div className="space-y-3">
                {/* Selected category badge */}
                <div className="flex items-center gap-2">
                  <span className="text-lg">{CATEGORIES.find(c => c.key === category)?.emoji}</span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {CATEGORIES.find(c => c.key === category)?.label[lang]}
                  </span>
                  <button onClick={() => setStep("chips")} className="ml-auto text-[10px] text-muted-foreground hover:text-foreground">
                    {isTr ? "Değiştir" : "Change"}
                  </button>
                </div>

                <div>
                  <label className="text-xs font-medium mb-1.5 block text-muted-foreground">
                    {isTr ? "Sihirli asistanını nasıl daha iyi yapabiliriz?" : "How can we make your magic assistant better?"}
                  </label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={isTr ? "Düşüncelerini paylaş..." : "Share your thoughts..."}
                    maxLength={1000}
                    className="w-full resize-none rounded-xl border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:border-lavender focus:outline-none focus:ring-1 focus:ring-lavender/30"
                    autoFocus
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!message.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-lavender to-purple-600 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
                >
                  <Send className="h-3.5 w-3.5" />
                  {isTr ? "Gönder" : "Send"}
                </button>
              </div>
            )}

            {/* Step 3: Sending */}
            {step === "sending" && (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-lavender" />
              </div>
            )}

            {/* Step 4: Success */}
            {step === "done" && (
              <div className="text-center py-6 relative z-20">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                  <Check className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-sm font-bold">
                  {isTr ? "İçgörün ekibimize ulaştı!" : "Your insight reached our team!"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isTr ? "Büyümemize katkı sağladığın için teşekkürler." : "Thank you for helping us grow."}
                </p>
                <button
                  onClick={reset}
                  className="mt-4 rounded-lg border px-4 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
                >
                  {isTr ? "Kapat" : "Close"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
