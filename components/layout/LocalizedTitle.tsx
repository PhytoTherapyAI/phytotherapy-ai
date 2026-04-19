// © 2026 DoctoPal — All Rights Reserved
// Client-side document.title updater. Static `metadata.title` exports in
// layout.tsx files are server-rendered and can't reflect the user's language
// toggle (which is persisted client-side). This component reads useLang and
// rewrites document.title on mount + when language changes.
"use client"

import { useEffect } from "react"
import { useLang } from "@/components/layout/language-toggle"

interface Props {
  /** Turkish title — appended " — DoctoPal" unless the caller disables it */
  tr: string
  /** English title — appended " — DoctoPal" unless the caller disables it */
  en: string
  /** Skip the " — DoctoPal" brand suffix. Default false. */
  noBrandSuffix?: boolean
}

export function LocalizedTitle({ tr, en, noBrandSuffix = false }: Props) {
  const { lang } = useLang()

  useEffect(() => {
    if (typeof document === "undefined") return
    const base = lang === "tr" ? tr : en
    document.title = noBrandSuffix ? base : `${base} — DoctoPal`
  }, [lang, tr, en, noBrandSuffix])

  return null
}
