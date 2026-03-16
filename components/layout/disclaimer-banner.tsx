'use client'

import { useLang } from "@/components/layout/language-toggle"

export function DisclaimerBanner() {
  const { lang } = useLang()
  const text = lang === 'en'
    ? 'This application does not replace medical advice. Always consult your healthcare provider.'
    : 'Bu uygulama tıbbi tavsiye niteliği taşımaz. Her zaman sağlık profesyonelinize danışın.'

  return (
    <div className="disclaimer-banner bg-primary px-4 py-2 text-center text-xs text-primary-foreground">
      {text}
    </div>
  );
}
