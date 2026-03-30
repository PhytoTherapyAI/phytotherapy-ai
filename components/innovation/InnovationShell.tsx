// © 2026 Phytotherapy.ai — All Rights Reserved
// Innovation Hub Shell — persistent scrollable tab bar for research/advanced tools

"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
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
      {/* Sticky scrollable tab bar */}
      <div className="sticky top-[60px] z-30 glass-card border-b">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide py-2">
            {INNOVATION_TABS.map(({ href, labelEn, labelTr, emoji }) => {
              const isActive = pathname === href;
              return (
                <Link key={href} href={href}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs transition-all ${
                    isActive
                      ? "bg-primary/10 text-primary font-medium shadow-soft"
                      : "text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  <span className="text-sm">{emoji}</span>
                  <span>{isTr ? labelTr : labelEn}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="min-w-0">
        {children}
      </main>
    </div>
  );
}
