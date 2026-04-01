// © 2026 Doctopal — All Rights Reserved
// Smart Follow-up Chips — keeps conversation alive after AI response

"use client";

import { useState } from "react";
import { Sparkles, ArrowRight, HelpCircle, Leaf, AlertTriangle } from "lucide-react";

interface SmartSuggestionsProps {
  suggestions: string[];
  onSelect: (text: string) => void;
}

const CHIP_ICONS = [Sparkles, Leaf, HelpCircle, AlertTriangle, ArrowRight];

export function SmartSuggestions({ suggestions, onSelect }: SmartSuggestionsProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !suggestions?.length) return null;

  return (
    <div className="flex gap-2 overflow-x-auto py-2 scrollbar-hide">
      {suggestions.slice(0, 3).map((text, i) => {
        const Icon = CHIP_ICONS[i % CHIP_ICONS.length];
        return (
          <button
            key={i}
            onClick={() => { setDismissed(true); onSelect(text); }}
            className="group flex shrink-0 items-center gap-1.5 rounded-full border border-sage/20 bg-sage/5 px-3.5 py-2 text-xs font-medium text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-lavender/30 hover:bg-lavender/10 hover:text-foreground hover:shadow-soft active:scale-95 dark:border-sage/30 dark:bg-sage/10 dark:hover:border-lavender/40 dark:hover:bg-lavender/15 min-h-[44px]"
            style={{
              animation: `chipSlideIn 0.4s ease-out ${i * 150}ms both`,
            }}
          >
            <Icon className="h-3.5 w-3.5 shrink-0 text-sage group-hover:text-lavender transition-colors" />
            <span className="whitespace-nowrap">{text}</span>
          </button>
        );
      })}

      <style jsx>{`
        @keyframes chipSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
