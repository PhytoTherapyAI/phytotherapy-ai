// © 2026 DoctoPal — All Rights Reserved
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, CalendarDays, ChevronDown, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { tx } from "@/lib/translations";
import { cn } from "@/lib/utils";

// ── Month names (same data as MonthView.tsx) ──
const MONTH_NAMES = [
  { en: "January", tr: "Ocak" },
  { en: "February", tr: "Şubat" },
  { en: "March", tr: "Mart" },
  { en: "April", tr: "Nisan" },
  { en: "May", tr: "Mayıs" },
  { en: "June", tr: "Haziran" },
  { en: "July", tr: "Temmuz" },
  { en: "August", tr: "Ağustos" },
  { en: "September", tr: "Eylül" },
  { en: "October", tr: "Ekim" },
  { en: "November", tr: "Kasım" },
  { en: "December", tr: "Aralık" },
];

const DAY_SHORT_KEYS = [
  "cal.mon", "cal.tue", "cal.wed", "cal.thu", "cal.fri", "cal.sat", "cal.sun",
] as const;

const DAY_FULL_KEYS = [
  "cal.monFull", "cal.tueFull", "cal.wedFull", "cal.thuFull", "cal.friFull", "cal.satFull", "cal.sunFull",
] as const;

// Portal wrapper for popover — renders to document.body to avoid overflow clipping
function DatePickerPortal({ children, show }: { children: React.ReactNode; show: boolean }) {
  if (!show) return null;
  return createPortal(<>{children}</>, document.body);
}

type ViewMode = "calendar" | "months" | "years";
type Lang = "en" | "tr";

interface BirthDatePickerProps {
  value: string; // YYYY-MM-DD or ""
  onChange: (value: string) => void;
  min?: string;  // YYYY-MM-DD
  max?: string;  // YYYY-MM-DD
  lang: Lang;
}

// ── Helpers ──
function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function toISO(year: number, month: number, day: number): string {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function parseISO(s: string): { year: number; month: number; day: number } | null {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return null;
  return { year: y, month: m - 1, day: d };
}

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  // 0=Sun → shift to Mon=0
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;
  return { daysInMonth, startDow };
}

function clampDate(iso: string, min?: string, max?: string): boolean {
  if (min && iso < min) return false;
  if (max && iso > max) return false;
  return true;
}

// Sprint 11 Commit 1 (ESLint Faz 5f TODO closure): handleKeyDown switch
// case'lerinden extract edilen pure date-math helper'ları. File scope —
// component dışı, mount-stable, useCallback body'sinin React Compiler
// `preserve-manual-memoization` rule'unu memnun etmesi için inline
// `let newDate` mutation kaldırıldı.

function addMonth(d: Date): Date {
  const r = new Date(d);
  r.setMonth(r.getMonth() + 1);
  return r;
}

function subMonth(d: Date): Date {
  const r = new Date(d);
  r.setMonth(r.getMonth() - 1);
  return r;
}

/**
 * Keyboard navigation helper: bilinen tuş için yeni Date döndürür, bilinmeyen
 * için null. Enter/Escape gibi popover-kontrol tuşları caller scope'ta kalır
 * (setOpen/setView setState çağrıları için).
 */
function getNewDateFromKey(key: string, current: Date): Date | null {
  switch (key) {
    case "ArrowLeft":
      return new Date(current.getTime() - 86400000);
    case "ArrowRight":
      return new Date(current.getTime() + 86400000);
    case "ArrowUp":
      return new Date(current.getTime() - 7 * 86400000);
    case "ArrowDown":
      return new Date(current.getTime() + 7 * 86400000);
    case "PageUp":
      return subMonth(current);
    case "PageDown":
      return addMonth(current);
    case "Home":
      return new Date(current.getFullYear(), current.getMonth(), 1);
    case "End":
      return new Date(current.getFullYear(), current.getMonth() + 1, 0);
    default:
      return null;
  }
}

// ── Component ──
export function BirthDatePicker({ value, onChange, min, max, lang }: BirthDatePickerProps) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<ViewMode>("calendar");

  // Calendar nav state
  const parsed = parseISO(value);
  // useState lazy init so `today` is mount-once stable (was `new Date()`
  // at render which made downstream useCallback deps unstable —
  // react-hooks/preserve-manual-memoization). User won't notice unless
  // app stays open across midnight, which is a rare edge case.
  const [today] = useState(() => new Date());
  const [navYear, setNavYear] = useState(parsed?.year ?? today.getFullYear() - 25);
  const [navMonth, setNavMonth] = useState(parsed?.month ?? today.getMonth());

  // Decade expansion for years view
  const [expandedDecade, setExpandedDecade] = useState<number | null>(null);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const yearsScrollRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
  const [mounted, setMounted] = useState(false);

  // SSR guard
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- SSR mounted guard, Next.js standard pattern
    setMounted(true);
  }, []);

  // ── Dynamic positioning: calculate popover position relative to trigger ──
  useEffect(() => {
    if (!open || !containerRef.current) return;
    const updatePos = () => {
      const rect = containerRef.current!.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const panelW = Math.min(320, vw * 0.9);
      const panelH = 420; // approx max height

      // Horizontal: center on trigger, clamp to viewport
      let left = rect.left + rect.width / 2 - panelW / 2;
      if (left + panelW > vw - 8) left = vw - panelW - 8;
      if (left < 8) left = 8;

      // Vertical: prefer below, flip above if no room
      let top = rect.bottom + 8;
      if (top + panelH > vh && rect.top - panelH - 8 > 0) {
        top = rect.top - panelH - 8;
      }

      setPopoverStyle({
        position: "fixed",
        top, left,
        width: panelW,
        zIndex: 9999,
      });
    };
    updatePos();
    window.addEventListener("resize", updatePos);
    window.addEventListener("scroll", updatePos, true);
    return () => {
      window.removeEventListener("resize", updatePos);
      window.removeEventListener("scroll", updatePos, true);
    };
  }, [open]);

  // ── Scroll lock on mobile ──
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Sync nav when value changes externally
  useEffect(() => {
    const p = parseISO(value);
    if (p) {
      /* eslint-disable react-hooks/set-state-in-effect -- Prop-driven multi-state sync (navYear + navMonth from parseISO(value)) */
      setNavYear(p.year);
      setNavMonth(p.month);
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [value]);

  // Close on outside click (check both trigger and portal popover)
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      const target = e.target as Node;
      if (
        containerRef.current && !containerRef.current.contains(target) &&
        popoverRef.current && !popoverRef.current.contains(target)
      ) {
        setOpen(false);
        setView("calendar");
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  // Auto-scroll to active year in years view
  useEffect(() => {
    if (view === "years" && yearsScrollRef.current) {
      const activeDecade = Math.floor(navYear / 10) * 10;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- View-driven derive + scrollIntoView side effect (DOM measurement)
      setExpandedDecade(activeDecade);
      setTimeout(() => {
        const el = yearsScrollRef.current?.querySelector(`[data-decade="${activeDecade}"]`);
        el?.scrollIntoView({ block: "center", behavior: "smooth" });
      }, 50);
    }
  }, [view, navYear]);

  // ── Navigation ──
  // Pure const-only callback — was `setNavYear` inside `setNavMonth`
  // updater (anti-pattern). React 18+ batches the two setState calls.
  // eslint-disable-next-line react-hooks/preserve-manual-memoization -- TODO: compiler conditional ternary + multi-setter pattern'i memoize-safe sayamıyor; sub-helper extract refactor ayrı sprint (BirthDatePicker rebuild)
  const goMonth = useCallback((delta: number) => {
    const targetMonth = navMonth + delta;
    const m = targetMonth < 0 ? 11 : targetMonth > 11 ? 0 : targetMonth;
    const y = targetMonth < 0 ? navYear - 1 : targetMonth > 11 ? navYear + 1 : navYear;
    setNavMonth(m);
    setNavYear(y);
  }, [navMonth, navYear]);

  const selectDay = useCallback((day: number) => {
    const iso = toISO(navYear, navMonth, day);
    if (!clampDate(iso, min, max)) return;
    onChange(iso);
    setOpen(false);
    setView("calendar");
  }, [navYear, navMonth, min, max, onChange]);

  // eslint-disable-next-line react-hooks/preserve-manual-memoization -- TODO: `today` useState lazy init mount-stable ama compiler `today.getFullYear/Month/Date` method call chain'ini varying olarak görüyor; sub-helper extract ayrı sprint
  const selectToday = useCallback(() => {
    const iso = toISO(today.getFullYear(), today.getMonth(), today.getDate());
    if (!clampDate(iso, min, max)) return;
    onChange(iso);
    setNavYear(today.getFullYear());
    setNavMonth(today.getMonth());
  }, [today, min, max, onChange]);

  const clearDate = useCallback(() => {
    onChange("");
  }, [onChange]);

  // ── Keyboard ──
  // Sprint 11 Commit 1 (ESLint Faz 5f TODO closure): handleKeyDown switch
  // case'leri file-scope `getNewDateFromKey` helper'ına taşındı (inline
  // `let newDate` mutation kalktı). setNavYear/setNavMonth setter call'ları
  // `applyNewDate` callback'inde isolate edildi — handleKeyDown body'si
  // artık sadece event routing + helper invocation, switch + mutation
  // pattern'i tamamen kalktı.
  //
  // eslint-disable not: applyNewDate'te setNavYear/setNavMonth call'ları
  // React Compiler tarafından "inferred dep" olarak işaretleniyor (useState
  // dispatcher stable contract'ı compiler tarafından otomatik tanınmıyor).
  // Bu sorun BirthDatePicker'a özgü değil — goMonth (L207) ve selectToday
  // (L224) de aynı pattern'i taşıyor; hepsi disable yorum + gerekçe ile
  // geçiş yapıyor. React Compiler stable release sonrası muhtemelen düzelir.
  // eslint-disable-next-line react-hooks/preserve-manual-memoization -- setNavYear/setNavMonth setter call'ları compiler "inferred dep" olarak görüyor (stable setter contract bug). Sub-helper extract refactor switch+mutation problemini çözdü; setter sorunu compiler upstream fix bekliyor (goMonth L207 + selectToday L224 ile aynı pattern).
  const applyNewDate = useCallback((newDate: Date) => {
    const iso = toISO(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
    if (clampDate(iso, min, max)) {
      onChange(iso);
      setNavYear(newDate.getFullYear());
      setNavMonth(newDate.getMonth());
    }
  }, [min, max, onChange]);

  // handleKeyDown artık eslint-disable gerektirmiyor — body switch+mutation
  // ten arındı, setNavYear/setNavMonth setter call'ları applyNewDate'e
  // taşındı. useCallback deps'i [open, view, value, applyNewDate] saf bir
  // callback chain (compiler memoization preserve edebiliyor).
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }

    if (view !== "calendar") {
      if (e.key === "Escape") {
        setView("calendar");
        e.preventDefault();
      }
      return;
    }

    // Calendar view içindeyken Enter/Escape popover'ı kapatır
    if (e.key === "Enter" || e.key === "Escape") {
      setOpen(false);
      setView("calendar");
      e.preventDefault();
      return;
    }

    const p = parseISO(value);
    if (!p) return;
    const current = new Date(p.year, p.month, p.day);
    const newDate = getNewDateFromKey(e.key, current);
    if (!newDate) return; // bilinmeyen tuş — preventDefault YAPMA (Tab/A-Z gibi)

    e.preventDefault();
    applyNewDate(newDate);
  }, [open, view, value, applyNewDate]);

  // ── Touch swipe ──
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) {
      goMonth(dx < 0 ? 1 : -1);
    }
  }, [goMonth]);

  // ── Display text ──
  const displayText = parsed
    ? `${pad(parsed.day)} ${MONTH_NAMES[parsed.month][lang]} ${parsed.year}`
    : tx("onb.selectDate", lang);

  const monthLabel = `${MONTH_NAMES[navMonth][lang]} ${navYear}`;

  // ── Calendar grid ──
  const { daysInMonth, startDow } = getMonthDays(navYear, navMonth);
  const todayISO = toISO(today.getFullYear(), today.getMonth(), today.getDate());

  // Years range
  const maxYear = max ? parseInt(max.slice(0, 4), 10) : today.getFullYear();
  const minYear = min ? parseInt(min.slice(0, 4), 10) : 1900;

  // Build decades for years view (newest first)
  const decades: number[] = [];
  for (let d = Math.floor(maxYear / 10) * 10; d >= minYear; d -= 10) {
    decades.push(d);
  }

  return (
    <div ref={containerRef} className="relative w-full" onKeyDown={handleKeyDown}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => { setOpen(!open); setView("calendar"); }}
        className={cn(
          "flex w-full items-center justify-between h-11 rounded-xl px-3 text-left text-base transition-all duration-200 border",
          "bg-muted/30 border-muted-foreground/20 hover:border-muted-foreground/40",
          "focus:outline-none focus:ring-2 focus:ring-green-400/40 focus:border-green-400 focus:bg-background",
          !parsed && "text-muted-foreground"
        )}
      >
        <span className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          {displayText}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {/* Popover — rendered via portal to avoid overflow clipping */}
      <DatePickerPortal show={mounted && open}>
        <motion.div
          ref={popoverRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          style={popoverStyle}
          className="rounded-xl border bg-background shadow-xl"
          onTouchStart={view === "calendar" ? handleTouchStart : undefined}
          onTouchEnd={view === "calendar" ? handleTouchEnd : undefined}
        >
            {/* Header */}
            <div className="flex items-center justify-between border-b px-3 py-2.5">
              {view === "calendar" && (
                <button
                  type="button"
                  onClick={() => goMonth(-1)}
                  className="rounded-lg p-1.5 hover:bg-muted transition-colors"
                  aria-label={tx("cal.prevMonth", lang)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setView(view === "calendar" ? "months" : view === "months" ? "years" : "calendar")}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold hover:bg-muted transition-colors"
              >
                {view === "years" ? `${minYear} — ${maxYear}` : monthLabel}
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", view !== "calendar" && "rotate-180")} />
              </button>

              {view === "calendar" && (
                <button
                  type="button"
                  onClick={() => goMonth(1)}
                  className="rounded-lg p-1.5 hover:bg-muted transition-colors"
                  aria-label={tx("cal.nextMonth", lang)}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* ══ Calendar View ══ */}
            {view === "calendar" && (
              <div ref={gridRef} className="p-2">
                {/* Day headers */}
                <div className="grid grid-cols-7 mb-1">
                  {DAY_SHORT_KEYS.map((key, i) => (
                    <div
                      key={key}
                      title={tx(DAY_FULL_KEYS[i], lang)}
                      className="py-1 text-center text-[11px] font-medium text-muted-foreground"
                    >
                      {tx(key, lang)}
                    </div>
                  ))}
                </div>

                {/* Day grid */}
                <div className="grid grid-cols-7 gap-px" role="grid">
                  {/* Empty cells for offset */}
                  {Array.from({ length: startDow }).map((_, i) => (
                    <div key={`e-${i}`} className="h-11" />
                  ))}

                  {/* Days */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const iso = toISO(navYear, navMonth, day);
                    const isSelected = value === iso;
                    const isToday = iso === todayISO;
                    const inRange = clampDate(iso, min, max);

                    return (
                      <button
                        key={day}
                        type="button"
                        disabled={!inRange}
                        onClick={() => selectDay(day)}
                        className={cn(
                          "flex h-11 w-full items-center justify-center rounded-lg text-sm font-medium transition-colors",
                          "min-w-[44px] min-h-[44px]",
                          isSelected
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : isToday
                              ? "ring-2 ring-primary/30 hover:bg-primary/10"
                              : inRange
                                ? "hover:bg-muted"
                                : "text-muted-foreground/30 cursor-not-allowed"
                        )}
                        aria-selected={isSelected}
                        role="gridcell"
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>

                {/* Footer: Today + Clear */}
                <div className="mt-2 flex items-center justify-between border-t pt-2">
                  <button
                    type="button"
                    onClick={selectToday}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                  >
                    {tx("cal.today", lang)}
                  </button>
                  {value && (
                    <button
                      type="button"
                      onClick={clearDate}
                      className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
                    >
                      <X className="h-3 w-3" />
                      {tx("onb.clearDate", lang)}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ══ Months View ══ */}
            {view === "months" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
                className="p-3"
              >
                <div className="grid grid-cols-3 gap-2">
                  {MONTH_NAMES.map((m, i) => {
                    const isCurrent = i === navMonth;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setNavMonth(i);
                          setView("calendar");
                        }}
                        className={cn(
                          "rounded-lg py-2.5 text-sm font-medium transition-colors",
                          isCurrent
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "hover:bg-muted text-foreground"
                        )}
                      >
                        {m[lang]}
                      </button>
                    );
                  })}
                </div>

                {/* Year nav in months view */}
                <div className="mt-3 flex items-center justify-center gap-4 border-t pt-2">
                  <button
                    type="button"
                    onClick={() => setNavYear(y => Math.max(minYear, y - 1))}
                    className="rounded-lg p-1 hover:bg-muted transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setView("years")}
                    className="text-sm font-semibold hover:text-primary transition-colors"
                  >
                    {navYear}
                  </button>
                  <button
                    type="button"
                    onClick={() => setNavYear(y => Math.min(maxYear, y + 1))}
                    className="rounded-lg p-1 hover:bg-muted transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ══ Years View ══ */}
            {view === "years" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
                ref={yearsScrollRef}
                className="max-h-64 overflow-y-auto p-3 space-y-1"
              >
                {decades.map((decade) => {
                  const isExpanded = expandedDecade === decade;
                  const decadeEnd = Math.min(decade + 9, maxYear);
                  const decadeLabel = `${decade} — ${decadeEnd}`;

                  return (
                    <div key={decade} data-decade={decade}>
                      {/* Decade header */}
                      <button
                        type="button"
                        onClick={() => setExpandedDecade(isExpanded ? null : decade)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                          isExpanded ? "bg-primary/10 text-primary" : "hover:bg-muted"
                        )}
                      >
                        {decadeLabel}
                        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", isExpanded && "rotate-180")} />
                      </button>

                      {/* Years in decade */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="grid grid-cols-5 gap-1 px-1 py-2">
                              {Array.from({ length: 10 }).map((_, i) => {
                                const yr = decade + i;
                                if (yr < minYear || yr > maxYear) return null;
                                const isActive = yr === navYear;
                                return (
                                  <button
                                    key={yr}
                                    type="button"
                                    onClick={() => {
                                      setNavYear(yr);
                                      setView("months");
                                    }}
                                    className={cn(
                                      "rounded-lg py-2 text-sm font-medium transition-colors",
                                      isActive
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "hover:bg-muted"
                                    )}
                                  >
                                    {yr}
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </motion.div>
      </DatePickerPortal>
    </div>
  );
}
