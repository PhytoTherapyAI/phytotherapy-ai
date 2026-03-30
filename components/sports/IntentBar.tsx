// © 2026 Phytotherapy.ai — All Rights Reserved
"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { tx } from "@/lib/translations";

interface IntentBarProps {
  lang: "en" | "tr";
  isLoading: boolean;
  onSubmit: (input: string) => void;
}

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSubmit(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-6">
      {/* Main intent input */}
      <div className="relative">
        <div className="absolute left-4 top-4">
          <Sparkles className="h-5 w-5 text-indigo-500" />
        </div>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tx("sports.intentPlaceholder", lang)}
          maxLength={500}
          rows={3}
          disabled={isLoading}
          className="w-full resize-none rounded-xl border-2 border-indigo-200 bg-background pl-12 pr-14 pt-4 pb-4 text-sm leading-relaxed placeholder:text-muted-foreground/60 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 dark:border-indigo-800 dark:focus:border-indigo-400"
        />
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || isLoading}
          className="absolute right-3 bottom-3 flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white transition-all hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Example prompts */}
      {!isLoading && !input && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground/70 text-center">
            {lang === "tr" ? "Örneğin:" : "For example:"}
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {EXAMPLE_PROMPTS[lang].map((prompt, i) => (
              <button
                key={i}
                onClick={() => { setInput(prompt); textareaRef.current?.focus(); }}
                className="rounded-lg border border-dashed border-indigo-200 px-3 py-2 text-left text-xs text-muted-foreground transition-all hover:border-indigo-400 hover:bg-indigo-50/50 hover:text-foreground dark:border-indigo-800 dark:hover:border-indigo-600 dark:hover:bg-indigo-950/30"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                &ldquo;{prompt}&rdquo;
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
