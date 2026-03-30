// © 2026 Phytotherapy.ai — All Rights Reserved
// Doctor Workspace Shell — persistent tab bar + glassmorphism + Framer Motion

"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { LayoutDashboard, Pill, MessageCircle, BarChart3 } from "lucide-react";
import { useLang } from "@/components/layout/language-toggle";

const DOCTOR_TABS = [
  { href: "/doctor", icon: LayoutDashboard, labelEn: "Panel", labelTr: "Panel", emoji: "🏠" },
  { href: "/drug-info", icon: Pill, labelEn: "Rx", labelTr: "Reçete", emoji: "💊" },
  { href: "/doctor-messages", icon: MessageCircle, labelEn: "Messages", labelTr: "Mesajlar", emoji: "💬" },
  { href: "/health-analytics", icon: BarChart3, labelEn: "Analytics", labelTr: "Analitik", emoji: "📊" },
];

interface DoctorShellProps {
  children: React.ReactNode;
}

export function DoctorShell({ children }: DoctorShellProps) {
  const pathname = usePathname();
  const { lang } = useLang();
  const isTr = lang === "tr";

  return (
    <div className="min-h-screen pb-20 lg:pb-0 lg:flex">
      {/* ── Desktop Sidebar (lg+) ── */}
      <aside className="hidden lg:flex lg:w-20 lg:flex-col lg:items-center lg:gap-1 lg:border-r lg:py-6 lg:bg-white/80 lg:dark:bg-card/80 lg:backdrop-blur-md lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)]">
        {DOCTOR_TABS.map(({ href, icon: Icon, labelEn, labelTr }) => {
          const isActive = pathname === href || (href !== "/doctor" && pathname.startsWith(href));
          return (
            <Link key={href} href={href}
              className={`group relative flex flex-col items-center gap-1 rounded-xl px-3 py-2.5 transition-all ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-stone-100 dark:hover:bg-stone-800"
              }`}
              title={isTr ? labelTr : labelEn}
            >
              {isActive && (
                <motion.div layoutId="doctor-tab-bg"
                  className="absolute inset-0 rounded-xl bg-primary/10"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }} />
              )}
              <Icon className={`relative h-5 w-5 transition-transform ${isActive ? "scale-110" : "group-hover:scale-105"}`} />
              <span className="relative text-[9px] font-medium">{isTr ? labelTr : labelEn}</span>
            </Link>
          );
        })}
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 min-w-0">
        <motion.div key={pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
          {children}
        </motion.div>
      </main>

      {/* ── Mobile Bottom Tab Bar ── */}
      <nav className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white/80 dark:bg-card/80 backdrop-blur-xl border-t safe-area-pb">
        <div className="flex items-center justify-around py-2">
          {DOCTOR_TABS.map(({ href, icon: Icon, labelEn, labelTr }) => {
            const isActive = pathname === href || (href !== "/doctor" && pathname.startsWith(href));
            return (
              <Link key={href} href={href}
                className={`relative flex flex-col items-center gap-0.5 rounded-xl px-4 py-1.5 min-w-[60px] transition-all ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {isActive && (
                  <motion.div layoutId="doctor-mobile-tab"
                    className="absolute inset-0 rounded-xl bg-primary/10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                )}
                <div className={`relative flex h-7 w-7 items-center justify-center rounded-full transition-all ${
                  isActive ? "scale-110" : ""
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className={`relative text-[10px] font-medium ${isActive ? "text-primary" : ""}`}>
                  {isTr ? labelTr : labelEn}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
