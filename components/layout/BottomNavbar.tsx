// © 2026 DoctoPal — All Rights Reserved
"use client"

import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Home, Wrench, Users, User } from "lucide-react"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"

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

          return (
            <button
              key={tab.href}
              id={tab.id}
              onClick={() => router.push(tab.href)}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
              className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 min-w-[64px]"
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
            </button>
          )
        })}
      </div>
    </nav>
  )
}
