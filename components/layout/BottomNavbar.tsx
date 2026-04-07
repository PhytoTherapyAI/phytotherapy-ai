// © 2026 Doctopal — All Rights Reserved
"use client"

import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Home, Wrench, Globe, User } from "lucide-react"

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/tools", label: "Medical Tools", icon: Wrench },
  { href: "/discover", label: "Community", icon: Globe },
  { href: "/profile", label: "Profile", icon: User },
]

export function BottomNavbar() {
  const pathname = usePathname()
  const router = useRouter()

  // Hide on certain paths
  const hiddenPaths = ["/login", "/register", "/onboarding"]
  if (hiddenPaths.some(p => pathname.startsWith(p))) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-md border-t border-border safe-area-pb md:hidden">
      <div className="flex items-center justify-around px-2 py-1.5">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== "/" && pathname.startsWith(tab.href))
          const Icon = tab.icon

          return (
            <button
              key={tab.href}
              id={`tour-nav-${tab.label.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={() => router.push(tab.href)}
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
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
