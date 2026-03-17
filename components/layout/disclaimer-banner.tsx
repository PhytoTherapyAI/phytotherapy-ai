'use client'

import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"

export function DisclaimerBanner() {
  const { lang } = useLang()

  return (
    <div className="disclaimer-banner bg-primary px-4 py-2 text-center text-xs text-primary-foreground">
      {tx('disclaimer.banner', lang)}
    </div>
  );
}
