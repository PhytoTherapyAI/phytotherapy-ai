// © 2026 Phytotherapy.ai — All Rights Reserved
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Loader2, Dumbbell, Zap, Shield } from "lucide-react";
import { tx } from "@/lib/translations";

interface IntentBarProps {
  lang: "en" | "tr";
  isLoading: boolean;
  onSubmit: (input: string) => void;
}

// Zero-Typing Bento Selectors
const FOCUS_OPTIONS = [
  { id: "strength", emoji: "🏋️‍♂️", en: "Strength / Hypertrophy", tr: "Ağırlık / Hipertrofi" },
  { id: "cardio", emoji: "🏃‍♂️", en: "Cardio / Endurance", tr: "Kardiyo / Dayanıklılık" },
  { id: "mobility", emoji: "🧘‍♂️", en: "Mobility / Flexibility", tr: "Mobilite / Esneklik" },
];

const NEED_OPTIONS = [
  { id: "power", emoji: "⚡", en: "Explosive Power", tr: "Patlayıcı Güç" },
  { id: "recovery", emoji: "🔋", en: "Fast Recovery (DOMS)", tr: "Hızlı Toparlanma (DOMS)" },
  { id: "joint", emoji: "🛡️", en: "Joint Protection", tr: "Eklem Koruma" },
];

const EXAMPLE_PROMPTS = {
  en: [
    "I do CrossFit and want to improve shoulder mobility",
    "I'm a bodybuilder in a cutting phase, training 5 days/week",
    "I run half-marathons and need better recovery",
    "I do martial arts and want explosive power",
  ],
  tr: [
    "CrossFit yapıyorum ve omuz hareketliliğimi artırmak istiyorum",
    "Vücut geliştirme yapıyorum, definasyon dönemindeyim, haftada 5 gün",
    "Yarı maraton koşuyorum ve toparlanmamı iyileştirmek istiyorum",
    "Dövüş sanatları yapıyorum ve patlayıcı güç istiyorum",
  ],
};

export function IntentBar({ lang, isLoading, onSubmit }: IntentBarProps) {
  const [input, setInput] = useState("");
  const [selectedFocus, setSelectedFocus] = useState<string | null>(null);
  const [selectedNeed, setSelectedNeed] = useState<string | null>(null);
  const [mode, setMode] = useState<"chips" | "text">("chips");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isTr = lang === "tr";

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSubmit(trimmed);
  };

  const handleChipSubmit = () => {
    if (!selectedFocus || !selectedNeed) return;
    const focus = FOCUS_OPTIONS.find(f => f.id === selectedFocus);
    const need = NEED_OPTIONS.find(n => n.id === selectedNeed);
    if (!focus || !need) return;
    const text = isTr
      ? `Bugünkü odağım: ${focus.tr}. İhtiyacım: ${need.tr}. Fitoterapi önerileri ver.`
      : `Today's focus: ${focus.en}. Need: ${need.en}. Give me phytotherapy recommendations.`;
    onSubmit(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

  return (
    <div className="space-y-5">
      {/* Mode toggle */}
      <div className="flex gap-2 bg-white dark:bg-card rounded-xl border p-1">
        <button onClick={() => setMode("chips")}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
            mode === "chips" ? "bg-primary text-white shadow" : "text-muted-foreground hover:bg-stone-50 dark:hover:bg-stone-900"
          }`}>
          {isTr ? "🎯 Hızlı Seçim" : "🎯 Quick Select"}
        </button>
        <button onClick={() => { setMode("text"); setTimeout(() => textareaRef.current?.focus(), 100) }}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
            mode === "text" ? "bg-primary text-white shadow" : "text-muted-foreground hover:bg-stone-50 dark:hover:bg-stone-900"
          }`}>
          {isTr ? "✍️ Serbest Yaz" : "✍️ Free Text"}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {mode === "chips" ? (
          <motion.div key="chips" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }} className="space-y-4">

            {/* Step 1: Focus */}
            <div>
              <p className="text-xs font-bold text-muted-foreground mb-2">
                {isTr ? "1. Bugünkü Odak:" : "1. Today's Focus:"}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {FOCUS_OPTIONS.map((opt) => (
                  <motion.button key={opt.id} whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedFocus(opt.id)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all ${
                      selectedFocus === opt.id
                        ? "border-primary bg-primary/10 ring-2 ring-primary/20 shadow-md"
                        : "bg-white dark:bg-card hover:border-primary/30 hover:shadow-sm"
                    }`}>
                    <span className="text-2xl">{opt.emoji}</span>
                    <span className="text-[10px] font-medium leading-tight">{isTr ? opt.tr : opt.en}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Step 2: Need */}
            <AnimatePresence>
              {selectedFocus && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <p className="text-xs font-bold text-muted-foreground mb-2">
                    {isTr ? "2. Şu Anki İhtiyaç:" : "2. Current Need:"}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {NEED_OPTIONS.map((opt) => (
                      <motion.button key={opt.id} whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedNeed(opt.id)}
                        className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all ${
                          selectedNeed === opt.id
                            ? "border-primary bg-primary/10 ring-2 ring-primary/20 shadow-md"
                            : "bg-white dark:bg-card hover:border-primary/30 hover:shadow-sm"
                        }`}>
                        <span className="text-2xl">{opt.emoji}</span>
                        <span className="text-[10px] font-medium leading-tight">{isTr ? opt.tr : opt.en}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* CTA */}
            <AnimatePresence>
              {selectedFocus && selectedNeed && (
                <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={handleChipSubmit} disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-40 transition-all">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {isTr ? "✨ Akıllı Toparlanma Protokolü Oluştur" : "✨ Create Smart Recovery Protocol"}
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div key="text" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-4">
            {/* Text input */}
            <div className="relative">
              <div className="absolute left-4 top-4">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <textarea ref={textareaRef} value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={tx("sports.intentPlaceholder", lang)}
                maxLength={500} rows={3} disabled={isLoading}
                className="w-full resize-none rounded-xl border-2 border-primary/20 bg-white dark:bg-card pl-12 pr-14 pt-4 pb-4 text-sm leading-relaxed placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50" />
              <motion.button onClick={handleSubmit} disabled={!input.trim() || isLoading}
                whileTap={{ scale: 0.9 }}
                className="absolute right-3 bottom-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white transition-all hover:bg-primary/90 disabled:opacity-40">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </motion.button>
            </div>

            {/* Example prompts */}
            {!isLoading && !input && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground/70 text-center">
                  {isTr ? "Örneğin:" : "For example:"}
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {EXAMPLE_PROMPTS[lang].map((prompt, i) => (
                    <motion.button key={i} whileHover={{ x: 4 }}
                      onClick={() => { setInput(prompt); textareaRef.current?.focus(); }}
                      className="rounded-lg border border-dashed border-primary/20 px-3 py-2 text-left text-xs text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-foreground">
                      &ldquo;{prompt}&rdquo;
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
