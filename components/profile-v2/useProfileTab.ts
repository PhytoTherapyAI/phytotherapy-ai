// © 2026 DoctoPal — All Rights Reserved
//
// URL-state sync for the new sidebar-based profile page. Single source
// of truth: `?tab=<slug>` query param. Hash is preserved independently
// for sub-anchor scrolling inside a tab (e.g. `?tab=vucut-yasam#kan-grubu`).
//
// Default tab: `genel`. Unknown / missing values collapse to the default
// so deep links from old command-palette entries don't 404.
"use client"

import { useCallback, useEffect, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

export const PROFILE_TABS = [
  "genel",
  "vucut-yasam",
  "tibbi-gecmis",
  "ilaclar",
  "takviyeler",
  "alerjiler",
  "asilar",
  "aile-oykusu",
  "ureme",
  "saglik-raporu",
  "gizlilik",
] as const

export type ProfileTabId = (typeof PROFILE_TABS)[number]

const VALID = new Set<string>(PROFILE_TABS)
const DEFAULT: ProfileTabId = "genel"

function coerce(value: string | null): ProfileTabId {
  if (value && VALID.has(value)) return value as ProfileTabId
  return DEFAULT
}

export interface UseProfileTabResult {
  activeTab: ProfileTabId
  setTab: (next: ProfileTabId) => void
}

/**
 * Reads `?tab=…` on mount, stays in sync with back/forward nav, and
 * pushes tab changes via `router.replace` so history stays clean.
 * The hook deliberately preserves `window.location.hash` — callers
 * (tab components) read it themselves for sub-anchor scroll behaviour.
 */
export function useProfileTab(): UseProfileTabResult {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Initial read — mirrors URL if present, else default.
  const [activeTab, setActiveTab] = useState<ProfileTabId>(() =>
    coerce(searchParams.get("tab")),
  )

  // Reconcile when the URL changes (back/forward nav, palette click
  // that does a `push` or `replace` without re-mounting the page).
  useEffect(() => {
    const fromUrl = coerce(searchParams.get("tab"))
    setActiveTab((prev) => (prev === fromUrl ? prev : fromUrl))
  }, [searchParams])

  const setTab = useCallback(
    (next: ProfileTabId) => {
      if (!VALID.has(next)) return
      setActiveTab(next)
      // Preserve other params (legacy flag, sub-anchor hash, etc).
      const params = new URLSearchParams(searchParams.toString())
      params.set("tab", next)
      const hash = typeof window !== "undefined" ? window.location.hash : ""
      router.replace(`${pathname}?${params.toString()}${hash}`, { scroll: false })
    },
    [pathname, router, searchParams],
  )

  return { activeTab, setTab }
}
