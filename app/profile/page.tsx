// © 2026 DoctoPal — All Rights Reserved
//
// F-PROFILE-001 Commit 6.2: ShellV2 is now the canonical profile UI.
// The 2193-line legacy monolith retired after Commit 5 proved 11/11 tabs
// stable and Commit 6.1 extracted the vitality helper.
//
// `?legacy=true` bookmarks still exist in the wild — we strip the param
// silently and render ShellV2 either way. Other query params (tab,
// section, new) and hash fragments (#medications etc.) are preserved;
// ShellV2's Commit 4 hash→tab backward-compat picks up the hash.
//
// URL policy:
//   /profile?legacy=true              → /profile
//   /profile?legacy=true&tab=ilaclar  → /profile?tab=ilaclar
//   /profile?legacy=true#medications  → /profile#medications
//                                       (ShellV2 rewrites hash → ?tab=ilaclar)
"use client"

import { useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { ProfileShellV2 } from "@/components/profile-v2/ProfileShellV2"

export default function ProfilePage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get("legacy") !== "true") return
    const cleaned = new URLSearchParams(searchParams.toString())
    cleaned.delete("legacy")
    const query = cleaned.toString()
    const hash = typeof window !== "undefined" ? window.location.hash : ""
    router.replace(
      (query ? `${pathname}?${query}` : pathname) + hash,
      { scroll: false },
    )
  }, [pathname, router, searchParams])

  return <ProfileShellV2 />
}
