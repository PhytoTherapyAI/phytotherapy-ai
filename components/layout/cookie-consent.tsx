"use client"

import { useState, useEffect } from "react"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { Cookie } from "lucide-react"

const COOKIE_KEY = "phyto-cookie-consent"

export function CookieConsent() {
  const { lang } = useLang()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Only show if user hasn't accepted yet
    const accepted = localStorage.getItem(COOKIE_KEY)
    if (!accepted) {
      // Small delay so it doesn't flash on load
      const timer = setTimeout(() => setVisible(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  if (!visible) return null

  const accept = () => {
    localStorage.setItem(COOKIE_KEY, "accepted")
    setVisible(false)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 px-4 py-4 sm:flex-row sm:gap-4">
        <Cookie className="hidden h-5 w-5 shrink-0 text-primary sm:block" />
        <p className="text-center text-xs text-muted-foreground sm:text-left">
          {tx("cookie.text", lang)}{" "}
          <a href="/privacy" className="underline transition-colors hover:text-foreground">
            {tx("footer.privacy", lang)}
          </a>
        </p>
        <button
          onClick={accept}
          className="shrink-0 rounded-md bg-primary px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary/90"
        >
          {tx("cookie.accept", lang)}
        </button>
      </div>
    </div>
  )
}
