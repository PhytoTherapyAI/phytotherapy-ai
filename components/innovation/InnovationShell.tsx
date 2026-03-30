// © 2026 Phytotherapy.ai — All Rights Reserved
// Innovation Hub Shell — persistent scrollable pill tabs + Framer Motion crossfade

"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Globe, Map, FlaskConical, Lock, PenTool } from "lucide-react";
import { useLang } from "@/components/layout/language-toggle";

const INNOVATION_TABS = [
  { href: "/global-benchmark", icon: Globe, labelEn: "Benchmark", labelTr: "Kıyaslama", emoji: "🌍" },
  { href: "/health-roadmap", icon: Map, labelEn: "Roadmap", labelTr: "Yol Haritası", emoji: "🗺️" },
  { href: "/research-hub", icon: FlaskConical, labelEn: "Research", labelTr: "Araştırma", emoji: "🔬" },
  { href: "/share-data", icon: Lock, labelEn: "FHIR", labelTr: "FHIR", emoji: "🔒" },
  { href: "/creator-studio", icon: PenTool, labelEn: "Studio", labelTr: "Stüdyo", emoji: "✍️" },
];

interface InnovationShellProps {
  children: React.ReactNode;
}

export function InnovationShell({ children }: InnovationShellProps) {
  const pathname = usePathname();
  const { lang } = useLang();
  const isTr = lang === "tr";

  return (
    <div className="min-h-screen">
      {/* Sticky scrollable pill tab bar */}
      <div className="sticky top-[60px] z-30 bg-white/80 dark:bg-card/80 backdrop-blur-xl border-b">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide py-2.5">
            {INNOVATION_TABS.map(({ href, labelEn, labelTr, emoji }) => {
              const isActive = pathname === href;
              return (
                <Link key={href} href={href}
                  className={`relative flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs transition-all ${
                    isActive
                      ? "text-primary font-medium"
                      : "text-muted-foreground/60 hover:text-muted-foreground hover:bg-stone-100 dark:hover:bg-stone-800"
                  }`}
                >
                  {isActive && (
                    <motion.div layoutId="innovation-tab-pill"
                      className="absolute inset-0 rounded-full bg-primary/10 shadow-sm"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                  )}
                  <span className="relative text-sm">{emoji}</span>
                  <span className="relative">{isTr ? labelTr : labelEn}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content with crossfade */}
      <main className="min-w-0">
        <motion.div key={pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
          {children}
        </motion.div>
      </main>
    </div>
  );
}
