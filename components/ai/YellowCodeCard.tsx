// © 2026 DoctoPal — All Rights Reserved
// Yellow-code (Seviye 2) UI card — displayed above AI message when triage detects
// potential emergency symptoms that warrant medical attention within 24h.
// Session 39 H1: 3 concrete action chips + richer guidance (İpek Test 38.7 feedback).
"use client";

import { AlertTriangle, Phone, Armchair, Users, Pill } from "lucide-react";
import { useLang } from "@/components/layout/language-toggle";

export function YellowCodeCard() {
  const { lang } = useLang();
  const tr = lang === "tr";

  return (
    <div
      role="alert"
      className="mb-2 flex items-start gap-3 rounded-lg border border-amber-400/40 bg-amber-50/90 dark:bg-amber-950/20 p-3"
    >
      <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
      <div className="flex-1 space-y-2">
        <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
          {tr ? "Bu belirtiler ciddi olabilir" : "These symptoms may be serious"}
        </p>
        <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-300/90">
          {tr
            ? "Belirttiğin şikayetler doğrudan acil olmayabilir ama ciddi bir altta yatan durumu işaret edebilir. Kötüleşirse bekleme."
            : "Your symptoms may not be immediately emergent but could signal a serious underlying condition. If it worsens, don't wait."}
        </p>
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 text-[11px] font-medium text-amber-900 dark:text-amber-200">
            <Armchair className="h-3 w-3" />
            {tr ? "Otur veya uzan" : "Sit or lie down"}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 text-[11px] font-medium text-amber-900 dark:text-amber-200">
            <Users className="h-3 w-3" />
            {tr ? "Yalnız kalma" : "Don't stay alone"}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 text-[11px] font-medium text-amber-900 dark:text-amber-200">
            <Pill className="h-3 w-3" />
            {tr ? "İlaç/takviye alma" : "No self-medication"}
          </span>
        </div>
        <a
          href="tel:112"
          className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-300 hover:underline"
        >
          <Phone className="h-3 w-3" />
          {tr ? "Kötüleşirse hemen 112'yi ara" : "If worsening, call 112 immediately"}
        </a>
      </div>
    </div>
  );
}
