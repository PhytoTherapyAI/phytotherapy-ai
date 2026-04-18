// © 2026 DoctoPal — All Rights Reserved
// Yellow-code (Seviye 2) UI card — displayed above AI message when triage detects
// potential emergency symptoms that warrant medical attention within 24h.
"use client";

import { AlertTriangle, Phone } from "lucide-react";
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
      <div className="flex-1 space-y-1">
        <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
          {tr ? "Bu belirtiler ciddi olabilir" : "These symptoms may be serious"}
        </p>
        <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-300/90">
          {tr
            ? "Belirttiğin şikayetler doğrudan acil olmasa da ciddi bir altta yatan durumu işaret edebilir. 24 saat içinde doktoruna görünmeni öneririm."
            : "Your symptoms may indicate something serious, even if not immediately life-threatening. Please see a doctor within 24 hours."}
        </p>
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
