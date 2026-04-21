// © 2026 DoctoPal — All Rights Reserved
"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import type { Badge } from "@/lib/badges";

interface Props {
  badges: Badge[];
  totalPoints: number;
  /** Session 43 F-OB-001: when 0, the finale surfaces a "Add your first
   * medication" primary CTA so users finishing onboarding without meds get
   * a clear path to the aha moment (add med → see interactions). When >0
   * the classic "Explore" CTA stays primary. */
  medicationsCount?: number;
}

export function OnboardingFinale({ badges, totalPoints, medicationsCount = 0 }: Props) {
  const router = useRouter();
  const { lang } = useLang();
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // Fire grand confetti
  useEffect(() => {
    if (prefersReducedMotion.current) return;
    const fire = async () => {
      try {
        const confetti = (await import("canvas-confetti")).default;
        const lowEnd = typeof navigator !== "undefined" && (navigator.hardwareConcurrency ?? 8) <= 4;
        const count = lowEnd ? 25 : 50;
        const shoot = () => {
          confetti({ particleCount: count, angle: 60, spread: 55, origin: { x: 0 }, colors: ["#3c7a52", "#b8965a", "#6b8e5b"] });
          confetti({ particleCount: count, angle: 120, spread: 55, origin: { x: 1 }, colors: ["#3c7a52", "#b8965a", "#6b8e5b"] });
        };
        shoot();
        setTimeout(shoot, 300);
        setTimeout(shoot, 600);
      } catch { /* not critical */ }
    };
    fire();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4"
    >
      {/* Rocket emoji */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.3, 1] }}
        transition={{ duration: 0.6, times: [0, 0.6, 1] }}
        className="text-6xl mb-4"
      >
        🚀
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-3xl font-bold"
      >
        {tx("badge.finaleTitle", lang)}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-2 text-muted-foreground"
      >
        {tx("badge.finaleSubtitle", lang)}
      </motion.p>

      {/* Points summary */}
      {totalPoints > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 rounded-xl bg-primary/10 px-6 py-3"
        >
          <p className="text-3xl font-bold text-primary">{totalPoints}</p>
          <p className="text-xs text-muted-foreground">{tx("badge.finalePoints", lang)}</p>
        </motion.div>
      )}

      {/* Badge grid */}
      {badges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-6 w-full max-w-xs"
        >
          <p className="text-xs font-medium text-muted-foreground mb-3">{tx("badge.finaleBadges", lang)}</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {badges.map((badge) => (
              <div key={badge.id} className="flex flex-col items-center gap-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-2xl">
                  {badge.icon}
                </div>
                <span className="text-[10px] text-muted-foreground max-w-[60px] truncate">
                  {lang === "tr" ? badge.nameTr : badge.nameEn}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* CTA — Session 43 F-OB-001: when the user finished onboarding
          without adding any medications, promote "Add your first
          medication" as the primary CTA (aha moment path) and keep
          "Explore" as a secondary option. When meds are already present,
          revert to the single "Explore" CTA as before. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-8 flex flex-col sm:flex-row items-center gap-3"
      >
        {medicationsCount === 0 ? (
          <>
            <Button
              size="lg"
              onClick={() => router.push("/profile?tab=medications")}
              className="bg-primary hover:bg-primary/90 px-8"
            >
              {lang === "tr" ? "İlk ilacını ekle →" : "Add your first medication →"}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push("/")}
              className="px-8"
            >
              {tx("badge.exploreCta", lang)}
            </Button>
          </>
        ) : (
          <Button
            size="lg"
            onClick={() => router.push("/")}
            className="bg-primary hover:bg-primary/90 px-8"
          >
            {tx("badge.exploreCta", lang)}
          </Button>
        )}
      </motion.div>
    </motion.div>
  );
}
