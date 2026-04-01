// © 2026 Doctopal — All Rights Reserved
"use client"

import { useEffect, useRef, useCallback } from "react"

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: Record<string, unknown>) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
    }
    onTurnstileLoad?: () => void
  }
}

interface TurnstileWidgetProps {
  onVerify: (token: string) => void
  onExpire?: () => void
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA" // test key

export function TurnstileWidget({ onVerify, onExpire }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile) return
    if (widgetIdRef.current) {
      window.turnstile.remove(widgetIdRef.current)
    }
    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: SITE_KEY,
      callback: onVerify,
      "expired-callback": onExpire,
      theme: "auto",
      size: "normal",
    })
  }, [onVerify, onExpire])

  useEffect(() => {
    if (window.turnstile) {
      renderWidget()
      return
    }

    window.onTurnstileLoad = renderWidget

    if (!document.querySelector('script[src*="turnstile"]')) {
      const script = document.createElement("script")
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad"
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
      }
    }
  }, [renderWidget])

  return <div ref={containerRef} className="flex justify-center my-3" />
}
