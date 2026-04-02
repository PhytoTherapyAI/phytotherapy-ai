// © 2026 Doctopal — All Rights Reserved
"use client"
import { useState } from "react"
import { MessageSquarePlus, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const EMOJIS = ["☹️", "😐", "🙂", "😃", "🤩"]

export function FeedbackButton() {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)
  const [text, setText] = useState("")
  const [sent, setSent] = useState(false)

  const handleSend = () => {
    setSent(true)
    setTimeout(() => { setOpen(false); setSent(false); setSelected(null); setText("") }, 2000)
  }

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-20 right-6 z-50 md:bottom-6 w-12 h-12 rounded-full bg-primary text-white shadow-lg flex items-center justify-center"
        aria-label="Feedback"
      >
        <MessageSquarePlus className="w-5 h-5" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center bg-black/40 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              className="w-full max-w-sm rounded-2xl bg-card border shadow-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-base">Share Your Feedback 💬</h3>
                <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground p-1" aria-label="Close">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <AnimatePresence mode="wait">
                {sent ? (
                  <motion.div key="sent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6">
                    <p className="text-2xl mb-2">💚</p>
                    <p className="font-medium">Thank you for your feedback!</p>
                    <p className="text-xs text-muted-foreground mt-1">We read every message.</p>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="flex justify-center gap-3 mb-4">
                      {EMOJIS.map((emoji, i) => (
                        <button key={i} onClick={() => setSelected(i)}
                          aria-label={["Very bad", "Bad", "Okay", "Good", "Great"][i]}
                          className={`text-2xl transition-all p-1 min-w-[44px] min-h-[44px] ${selected === i ? "scale-125" : "opacity-60 hover:opacity-90"}`}>
                          {emoji}
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={text} onChange={e => setText(e.target.value)}
                      placeholder="Tell us more... (optional)"
                      maxLength={500}
                      className="w-full h-24 resize-none rounded-xl border bg-muted/50 p-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <button onClick={handleSend} disabled={selected === null}
                      className="mt-3 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-40 transition-opacity">
                      Send Feedback
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
