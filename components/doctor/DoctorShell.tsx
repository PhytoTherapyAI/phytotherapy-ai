// © 2026 Phytotherapy.ai — All Rights Reserved
// Doctor Workspace Shell — persistent tab bar + glassmorphism navigation

"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Pill, MessageCircle, BarChart3 } from "lucide-react";
import { useLang } from "@/components/layout/language-toggle";

const DOCTOR_TABS = [
  { href: "/doctor", icon: LayoutDashboard, labelEn: "Panel", labelTr: "Panel" },
  { href: "/drug-info", icon: Pill, labelEn: "Rx", labelTr: "Reçete" },
  { href: "/doctor-communication", icon: MessageCircle, labelEn: "Messages", labelTr: "Mesajlar" },
  { href: "/health-analytics", icon: BarChart3, labelEn: "Analytics", labelTr: "Analitik" },
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
      <aside className="hidden lg:flex lg:w-16 lg:flex-col lg:items-center lg:gap-2 lg:border-r lg:py-6 lg:glass-card lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)]">
        {DOCTOR_TABS.map(({ href, icon: Icon, labelEn, labelTr }) => {
          const isActive = pathname === href || (href !== "/doctor" && pathname.startsWith(href));
          return (
            <Link key={href} href={href}
              className={`group flex flex-col items-center gap-0.5 rounded-xl px-2 py-2 transition-all ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
              title={isTr ? labelTr : labelEn}
            >
              <Icon className={`h-5 w-5 transition-transform ${isActive ? "scale-110" : "group-hover:scale-105"}`} />
              <span className="text-[9px] font-medium">{isTr ? labelTr : labelEn}</span>
            </Link>
          );
        })}
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 min-w-0">
        {children}
      </main>

      {/* ── Mobile Bottom Tab Bar ── */}
      <nav className="fixed bottom-0 inset-x-0 z-40 lg:hidden glass-card border-t safe-area-pb">
        <div className="flex items-center justify-around py-2">
          {DOCTOR_TABS.map(({ href, icon: Icon, labelEn, labelTr }) => {
            const isActive = pathname === href || (href !== "/doctor" && pathname.startsWith(href));
            return (
              <Link key={href} href={href}
                className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 min-w-[60px] transition-all ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                <div className={`flex h-7 w-7 items-center justify-center rounded-full transition-all ${
                  isActive ? "bg-primary/10 scale-110" : ""
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className={`text-[10px] font-medium ${isActive ? "text-primary" : ""}`}>
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
