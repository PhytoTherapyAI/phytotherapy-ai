// © 2026 Doctopal — All Rights Reserved
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import type { Badge } from "@/lib/badges";
import { BADGE_POINTS } from "@/lib/badges";
import BadgeIcon from "@/components/badges/BadgeIcon";

interface CelebrationItem {
  badge: Badge;
  points: number;
  totalPoints: number;
}

// Global celebration queue
let celebrationQueue: CelebrationItem[] = [];
let notifyListener: (() => void) | null = null;

export function triggerCelebration(badge: Badge, totalPoints: number) {
  const points = BADGE_POINTS[badge.id] ?? 0;
  celebrationQueue.push({ badge, points, totalPoints });
  notifyListener?.();
}

export function BadgeCelebrationModal() {
  const { lang } = useLang();
  const [current, setCurrent] = useState<CelebrationItem | null>(null);
  const [displayedPoints, setDisplayedPoints] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const showNext = useCallback(() => {
    if (celebrationQueue.length > 0) {
      const item = celebrationQueue.shift()!;
      setCurrent(item);
      setDisplayedPoints(0);

      // Auto-close after 4s
      timerRef.current = setTimeout(() => {
        setCurrent(null);
        // Show next in queue after brief pause
        setTimeout(showNext, 300);
      }, 4000);
    }
  }, []);

  useEffect(() => {
    notifyListener = showNext;
    // Check if there's already something in queue
    if (celebrationQueue.length > 0 && !current) showNext();
    return () => { notifyListener = null; };
  }, [showNext, current]);

  // Points counter animation
  useEffect(() => {
    if (!current) return;
    const target = current.points;
    if (target === 0) { setDisplayedPoints(0); return; }

    const duration = 700;
    const steps = 20;
    const increment = target / steps;
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setDisplayedPoints(Math.min(Math.round(increment * count), target));
      if (count >= steps) clearInterval(interval);
    }, duration / steps);

    return () => clearInterval(interval);
  }, [current]);

  const handleDismiss = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCurrent(null);
    setTimeout(showNext, 300);
  };

  // Fire confetti
  useEffect(() => {
    if (!current || prefersReducedMotion.current) return;
    const fireConfetti = async () => {
      try {
        const confetti = (await import("canvas-confetti")).default;
        const lowEnd = typeof navigator !== "undefined" && (navigator.hardwareConcurrency ?? 8) <= 4;
        setTimeout(() => {
          confetti({
            particleCount: lowEnd ? 40 : 80,
            spread: 70,
            origin: { y: 0.5 },
            colors: ["#3c7a52", "#b8965a", "#6b8e5b", "#f5f0e8", "#4a9d6e"],
          });
        }, 400);
      } catch { /* confetti not critical */ }
    };
    fireConfetti();
  }, [current]);

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={handleDismiss}
        >
          <motion.div
            initial={prefersReducedMotion.current ? { opacity: 0 } : { scale: 0.5, opacity: 0 }}
            animate={prefersReducedMotion.current ? { opacity: 1 } : { scale: 1, opacity: 1 }}
            exit={prefersReducedMotion.current ? { opacity: 0 } : { scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, duration: 0.3 }}
            className="mx-4 w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-6 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Badge icon — SVG or emoji fallback */}
            <motion.div
              initial={prefersReducedMotion.current ? {} : { scale: 0.5 }}
              animate={prefersReducedMotion.current ? {} : { scale: [0.5, 1.2, 1] }}
              transition={{ duration: 0.5, times: [0, 0.6, 1] }}
              className="mx-auto mb-3 flex h-24 w-24 items-center justify-center"
            >
              <BadgeIcon badgeId={current.badge.id} size={96} showAnimation fallbackEmoji={current.badge.icon} />
            </motion.div>

            {/* Title */}
            <p className="text-sm font-medium text-muted-foreground">
              {tx("badge.earned", lang)}
            </p>

            {/* Badge name */}
            <h2 className="mt-1 text-xl font-bold">
              {lang === "tr" ? current.badge.nameTr : current.badge.nameEn}
            </h2>

            {/* Description */}
            <p className="mt-1 text-sm text-muted-foreground">
              {lang === "tr" ? current.badge.descTr : current.badge.descEn}
            </p>

            {/* Points */}
            {current.points > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className="mt-4 space-y-1"
              >
                <p className="text-2xl font-bold text-primary">
                  +{displayedPoints} {tx("badge.points", lang)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {tx("badge.total", lang)}: {current.totalPoints} {tx("badge.points", lang)}
                </p>
              </motion.div>
            )}

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.3 }}
              className="mt-5"
            >
              <Button onClick={handleDismiss} className="w-full bg-primary hover:bg-primary/90">
                {tx("badge.awesome", lang)}
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
