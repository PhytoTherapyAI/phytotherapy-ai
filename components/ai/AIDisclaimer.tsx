// © 2026 DoctoPal — All Rights Reserved
// MADDE 8 (TCK Md.90) + MADDE 10 (KVKK Md.11/1-g) + MADDE 13 (AI label)
// Mandatory disclaimer + right-to-object UI attached to every AI response.
"use client";

import { useState } from "react";
import { AlertCircle, MessageSquareWarning, ChevronDown } from "lucide-react";
import { useLang } from "@/components/layout/language-toggle";
import { AIObjectionForm } from "./AIObjectionForm";

interface AIDisclaimerProps {
  /** Unique id of the AI response (used for objection tracking). Optional. */
  responseId?: string;
  /** Compact mode for chat bubbles. Default: false (full page mode). */
  compact?: boolean;
}

export function AIDisclaimer({ responseId, compact = false }: AIDisclaimerProps) {
  const { lang } = useLang();
  const tr = lang === "tr";
  const [showObjection, setShowObjection] = useState(false);

  return (
    <div className={`${compact ? "mt-2 pt-2" : "mt-3 pt-3"} border-t border-muted/40`}>
      {/* AI label + disclaimer */}
      <div className="flex items-start gap-1.5 text-[11px] leading-snug text-muted-foreground">
        <AlertCircle className="h-3 w-3 shrink-0 mt-0.5" />
        <span>
          {tr
            ? "Bu bilgi yapay zeka tarafından üretilmiştir ve tıbbi tavsiye niteliği taşımaz. Sağlık kararı almadan önce doktorunuza danışın."
            : "This information is AI-generated and does not constitute medical advice. Consult your doctor before making health decisions."}
        </span>
      </div>

      {/* Right to object (KVKK Art.11/1-g) */}
      <button
        type="button"
        onClick={() => setShowObjection((v) => !v)}
        className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-primary/70 hover:text-primary transition-colors"
        aria-expanded={showObjection}
      >
        <MessageSquareWarning className="h-3 w-3" />
        <span className="underline underline-offset-2">
          {tr ? "Bu değerlendirmeye itiraz et" : "Object to this assessment"}
        </span>
        <ChevronDown className={`h-3 w-3 transition-transform ${showObjection ? "rotate-180" : ""}`} />
      </button>

      {showObjection && (
        <AIObjectionForm
          responseId={responseId}
          onClose={() => setShowObjection(false)}
        />
      )}
    </div>
  );
}

/** Small pill-style badge — shown at the top of AI chat surfaces to signal AI-generated content */
export function AIGeneratedBadge() {
  const { lang } = useLang();
  const tr = lang === "tr";
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
      <span aria-hidden="true">🤖</span>
      <span>{tr ? "Yapay Zeka Yanıtı" : "AI Response"}</span>
    </div>
  );
}
