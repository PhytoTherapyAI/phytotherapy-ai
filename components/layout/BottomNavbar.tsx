// © 2026 DoctoPal — All Rights Reserved
"use client"

import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Home, Wrench, Users, User } from "lucide-react"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { useFamily } from "@/lib/family-context"

// F-FAMILY-NAV-UX-001: every tab used to hardcode an English label,
// which made the bottom nav (especially the "Family" tab) read as
// foreign on Turkish UI and led to "I couldn't find Aile" feedback.
// Labels are now translation keys; tx() resolves them at render
// time. Tour ids stay stable string literals — the previous
// implementation derived them from the English label
// (`tour-nav-${label.toLowerCase().replace(/\s+/g, "-")}`), which
// would have produced `tour-nav-nav.home`-style nonsense once the
// label became a key. Hard-coding the ids keeps the onboarding
// tour hooks intact.
const tabs = [
  { id: "tour-nav-home", href: "/", labelKey: "nav.home", icon: Home },
  { id: "tour-nav-tools", href: "/tools", labelKey: "nav.tools", icon: Wrench },
  { id: "tour-nav-family", href: "/family", labelKey: "nav.family", icon: Users },
  { id: "tour-nav-profile", href: "/profile", labelKey: "nav.profile", icon: User },
]

export function BottomNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { lang } = useLang()
  // F-FAMILY-BADGE-001: pendingInvites is already managed by the
  // FamilyProvider that wraps the layout root (app/layout.tsx:143-
  // 190). Anonymous tabs see an empty array (the provider's
  // user-not-signed-in branch resets state to []), so the badge
  // below disappears for free without an explicit auth check here.
  const { pendingInvites } = useFamily()

  // Hide on certain paths
  const hiddenPaths = ["/login", "/register", "/onboarding"]
  if (hiddenPaths.some(p => pathname.startsWith(p))) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-md border-t border-border safe-area-pb md:hidden">
      <div className="flex items-center justify-around px-2 py-1.5">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== "/" && pathname.startsWith(tab.href))
          const Icon = tab.icon
          const label = tx(tab.labelKey, lang)

          // F-FAMILY-BADGE-001: badge only fires on the Family tab
          // and only when at least one invite is pending. Cap shown
          // at "9+" defensively — the family group max is 6 members
          // (premium plan), so practical pending count caps around 5;
          // the cap is just future-proofing if the cap ever grows.
          const showBadge = tab.href === "/family" && pendingInvites.length > 0
          const badgeCount = pendingInvites.length
          const displayCount = badgeCount > 9 ? "9+" : String(badgeCount)
          const ariaLabel = showBadge
            ? `${label}, ${badgeCount} ${tx("nav.familyPendingInvites", lang)}`
            : label

          return (
            <button
              key={tab.href}
              id={tab.id}
              onClick={() => router.push(tab.href)}
              aria-label={ariaLabel}
              aria-current={isActive ? "page" : undefined}
              className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 min-w-[64px] min-h-11"
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-pill"
                  className="absolute -top-1 w-8 h-1 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className={`w-5 h-5 transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-[10px] font-medium transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                {label}
              </span>
              {showBadge && (
                // aria-hidden because the count is already woven
                // into the parent button's aria-label via the
                // tx("nav.familyPendingInvites") suffix above —
                // exposing both would double-announce on screen
                // readers. -top-0.5 right-2 sits the badge in the
                // tab button's top-right corner; the active-state
                // pill is at -top-1 horizontally centred so the
                // two never visually collide.
                <span
                  aria-hidden="true"
                  className="absolute -top-0.5 right-2 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white"
                >
                  {displayCount}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
