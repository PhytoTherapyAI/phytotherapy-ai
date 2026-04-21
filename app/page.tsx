// © 2026 DoctoPal — All Rights Reserved
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Search, Activity, Sparkles, Moon, Pill, Flame, MessageCircle, Send,
  ShieldCheck, Microscope, Leaf, Brain, UtensilsCrossed, Dumbbell,
  HeartPulse, Users, BarChart3, Stethoscope, Globe, Clock, Trophy,
  Scissors, ChevronDown, AlertCircle,
} from "lucide-react";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import { useAuth } from "@/lib/auth-context";
import { useFamily } from "@/lib/family-context";
import { useActiveProfile } from "@/lib/use-active-profile";
import { useWater, WaterIntakeProvider } from "@/lib/water-context";
import { createBrowserClient } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { AddSupplementDialog } from "@/components/calendar/AddSupplementDialog";
import { AydinlatmaPopup } from "@/components/legal/AydinlatmaPopup";
import { DashboardTour } from "@/components/layout/DashboardTour";
import { LocalizedTitle } from "@/components/layout/LocalizedTitle";
import { PremiumFomoBanner } from "@/components/dashboard/PremiumFomoBanner";
import { TOOL_CATEGORIES } from "@/lib/tools-hierarchy";
import { parseMedDoses, buildMedItemId, buildMedLabel } from "@/lib/med-dose-utils";
import { getSupplementDisplayName } from "@/lib/supplement-data";
import { getVaccineRecommendations, isFluSeason, type VaccineEntry } from "@/lib/vaccine-data";
import { LandingPage } from "@/components/landing/LandingPage";
import { CONSENT_VERSIONS } from "@/lib/consent-versions";

// ── Dynamic Imports (Dashboard) ──
const DailyCareCard = dynamic(
  () => import("@/components/dashboard/DailyCareCard").then((m) => ({ default: m.DailyCareCard })),
  { loading: () => <Skeleton className="h-64 w-full rounded-xl" /> }
);
const BiologicalAgeCard = dynamic(
  () => import("@/components/dashboard/BiologicalAgeCard").then((m) => ({ default: m.BiologicalAgeCard })),
  { loading: () => <Skeleton className="h-48 w-full rounded-xl" /> }
);
const MetabolicPortfolio = dynamic(
  () => import("@/components/dashboard/MetabolicPortfolio").then((m) => ({ default: m.MetabolicPortfolio })),
  { loading: () => <Skeleton className="h-48 w-full rounded-xl" /> }
);
const WashoutCountdown = dynamic(
  () => import("@/components/dashboard/WashoutCountdown").then((m) => ({ default: m.WashoutCountdown })),
  { loading: () => <Skeleton className="h-48 w-full rounded-xl" /> }
);
const WeeklySummaryCard = dynamic(
  () => import("@/components/dashboard/WeeklySummaryCard").then((m) => ({ default: m.WeeklySummaryCard })),
  { loading: () => <Skeleton className="h-48 w-full rounded-xl" /> }
);
const BossFightCard = dynamic(
  () => import("@/components/dashboard/BossFightCard").then((m) => ({ default: m.BossFightCard })),
  { loading: () => <Skeleton className="h-48 w-full rounded-xl" /> }
);
const SeasonalCard = dynamic(
  () => import("@/components/dashboard/SeasonalCard").then((m) => ({ default: m.SeasonalCard })),
  { loading: () => <Skeleton className="h-48 w-full rounded-xl" /> }
);
const DailySynergyCard = dynamic(
  () => import("@/components/dashboard/DailySynergyCard").then((m) => ({ default: m.DailySynergyCard })),
  { loading: () => <Skeleton className="h-56 w-full rounded-xl" /> }
);

// ── Quick Action Chips (defined early to avoid TDZ) ──
const QUICK_CHIPS = [
  { emoji: "💊", labelKey: "lp.chipInteraction", href: "/interaction-checker" },
  { emoji: "🩸", labelKey: "lp.chipBloodTest",   href: "/blood-test" },
  { emoji: "🌿", labelKey: "lp.chipHerbOfDay",   href: "/health-assistant" },
  { emoji: "😴", labelKey: "lp.chipSleep",       href: "/sleep-analysis" },
  { emoji: "💪", labelKey: "lp.chipSports",      href: "/sports-performance" },
];

// ── Dashboard Constants ──
const CATEGORY_EMOJI: Record<string, string> = {
  "medical-analysis": "🔬", "medications": "💊", "supplements": "🌿", "mental-health": "🧠",
  "nutrition": "🥗", "sleep": "🌙", "fitness": "💪", "organ-health": "❤️",
  "gender-health": "👫", "tracking": "📊", "prevention": "🛡️", "medical-tools": "🩺",
  "life-stages": "👶", "community": "💬", "advanced": "🔬", "settings": "⚙️", "doctor-tools": "👨‍⚕️",
};

const QUICK_LINKS = [
  { href: "/history",    icon: Clock,       labelKey: "nav.history" },
  { href: "/badges",     icon: Trophy,      labelKey: "badges.title" },
  { href: "/analytics",  icon: BarChart3,   labelKey: "analytics.title" },
  { href: "/operations", icon: Scissors,    labelKey: "operations.title" },
  { href: "/wrapped",    icon: Sparkles,    labelKey: "wrapped.title" },
  { href: "/doctor",     icon: Stethoscope, labelKey: "doctor.title" },
];

const stagger = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.4, ease: "easeOut" as const } },
};

// ── Vaccine Recommendation Banner ──
function VaccineBanner({ lang, chronicConditions, vaccines }: { lang: string; chronicConditions: string[]; vaccines: VaccineEntry[] }) {
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    const dismissedAt = localStorage.getItem("vaccine_banner_dismissed");
    if (dismissedAt && Date.now() - Number(dismissedAt) < 7 * 24 * 60 * 60 * 1000) setDismissed(true);
  }, []);

  if (dismissed) return null;
  const recs = getVaccineRecommendations(chronicConditions, vaccines);
  // In flu season, prioritize influenza
  const fluSeason = isFluSeason();
  const sorted = fluSeason ? [...recs].sort((a, b) => (a.vaccine.id === "influenza" ? -1 : b.vaccine.id === "influenza" ? 1 : 0)) : recs;
  const top = sorted[0];
  if (!top) return null;

  const dismiss = () => { setDismissed(true); localStorage.setItem("vaccine_banner_dismissed", String(Date.now())); };
  const msg = lang === "tr" ? top.reminder.messageTr : top.reminder.messageEn;
  const vaccineName = lang === "tr" ? top.vaccine.nameTr : top.vaccine.nameEn;

  return (
    <div className="bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-teal-500/10 border-b border-blue-200/30 dark:border-blue-800/30">
      <div className="mx-auto max-w-7xl px-4 py-2.5 flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2 flex-1 min-w-0">
          <span className="shrink-0">💉</span>
          <span className="truncate">
            {lang === "tr" ? `${vaccineName} öneriliyor` : `${vaccineName} recommended`} — {msg}
          </span>
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/profile#vaccines" className="text-[10px] bg-blue-500/10 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full font-medium hover:bg-blue-500/20 transition-colors whitespace-nowrap">
            {tx("vaccine.bannerCta", lang as "en" | "tr")}
          </Link>
          <button onClick={dismiss} className="text-muted-foreground hover:text-foreground text-xs px-1">✕</button>
        </div>
      </div>
    </div>
  );
}

// ── Circular Progress Ring ──
function CircularProgress({ value, size = 100, strokeWidth = 8 }: { value: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={strokeWidth}
        fill="none" className="text-stone-200 dark:text-stone-700" />
      <motion.circle cx={size / 2} cy={size / 2} r={radius} stroke="url(#scoreGradient)" strokeWidth={strokeWidth}
        fill="none" strokeLinecap="round" strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: "easeOut" as const }} />
      <defs>
        <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3c7a52" />
          <stop offset="100%" stopColor="#6B8F71" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ── Task Item with strike-through animation ──
function TaskItem({ emoji, label, done, duration, onClick, onDismiss }: {
  emoji: string; label: string; done: boolean; duration?: string | null; onClick: () => void; onDismiss?: () => void
}) {
  return (
    <motion.div className="flex items-center gap-2 py-1.5 group w-full" whileTap={{ scale: 0.97 }}>
      <button onClick={onClick} className="flex items-center gap-2 flex-1 text-left">
        <motion.div
          className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors flex-shrink-0 ${done ? "bg-primary border-primary" : "border-stone-300 dark:border-stone-600"}`}
          animate={done ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 0.3 }}>
          {done && (
            <motion.svg initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3 }}
              className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
              <motion.path d="M5 13l4 4L19 7" />
            </motion.svg>
          )}
        </motion.div>
        <span className="text-xs">{emoji}</span>
        <span className={`text-sm transition-all ${done ? "line-through text-muted-foreground/70" : "text-foreground"}`}>{label}</span>
        {duration && <span className="text-[10px] text-muted-foreground ml-1">({duration})</span>}
      </button>
      {done && (
        <motion.span initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
          className="text-xs flex-shrink-0">✨</motion.span>
      )}
      {!done && onDismiss && (
        <button onClick={onDismiss} aria-label="Dismiss task" className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/70 hover:text-muted-foreground flex-shrink-0 p-0.5">
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      )}
    </motion.div>
  );
}

// ── Water-aware TaskItem (uses WaterIntakeProvider context) ──
// Session 42 F-D-008: clicking the water row now advances the glass
// count via WaterIntakeProvider (optimistic — addGlass/removeGlass
// update local state before DB acks) in addition to the parent's task
// toggle. Before, the checkmark animated but the "X/8" counter didn't
// move until the user opened /calendar and tapped "Drank water" — two
// sources of truth, confusing feedback.
function WaterTaskItem({ emoji, label, done, onClick, onDismiss }: {
  emoji: string; label: string; done: boolean; onClick: () => void; onDismiss?: () => void
}) {
  const { glasses, target, addGlass, removeGlass } = useWater();
  const handleClick = () => {
    // Mirror the parent-owned task toggle with an optimistic water log.
    // done=true → user is un-checking, decrement (if any glasses logged).
    // done=false → user is checking, increment.
    if (done) {
      if (glasses > 0) void removeGlass();
    } else {
      void addGlass();
    }
    onClick();
  };
  return (
    <TaskItem emoji={emoji} label={`${label} ${glasses}/${target}`} done={done}
      onClick={handleClick} onDismiss={onDismiss} />
  );
}

// ── Static dashboard tasks (non-med/sup) ──
const STATIC_DASHBOARD_TASKS = [
  { id: "water",      emoji: "💧", labelEn: "Water",            labelTr: "Su",                  duration: null },
  { id: "walk",       emoji: "🚶", labelEn: "Walk",             labelTr: "Yürüyüş",            duration: "10 dk" },
  { id: "meditate",   emoji: "🧘", labelEn: "Meditation",       labelTr: "Meditasyon",          duration: "5 dk" },
  { id: "vitals",     emoji: "📊", labelEn: "Log vitals",       labelTr: "Vital kaydet",        duration: "1 dk" },
  { id: "sleep",      emoji: "😴", labelEn: "Sleep log",        labelTr: "Uyku kaydı",          duration: "1 dk" },
  { id: "meal",       emoji: "🥗", labelEn: "Healthy meal",     labelTr: "Sağlıklı öğün",      duration: null },
] as const;

interface DashboardTask {
  id: string
  emoji: string
  labelEn: string
  labelTr: string
  duration: string | null
  isMed?: boolean
  isSup?: boolean
}

const DEFAULT_STATIC_IDS = ["water", "walk"];
const DURATION_OPTS = ["1 dk", "5 dk", "10 dk", "15 dk", "30 dk"];

/** Local date YYYY-MM-DD (not UTC) */
function getLocalDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface TaskPrefs {
  enabledIds: string[];
  durationOverrides: Record<string, string>;
}

function loadTaskPrefs(userId: string): TaskPrefs {
  try {
    const raw = localStorage.getItem(`dash-task-prefs-${userId}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { enabledIds: [...DEFAULT_STATIC_IDS], durationOverrides: {} };
}

function saveTaskPrefs(userId: string, p: TaskPrefs) {
  localStorage.setItem(`dash-task-prefs-${userId}`, JSON.stringify(p));
}

function loadCompletedTasks(date: string): Set<string> {
  try {
    const raw = localStorage.getItem(`dash-tasks-done-${date}`);
    if (raw) return new Set(JSON.parse(raw));
  } catch {}
  return new Set();
}

function saveCompletedTasks(date: string, s: Set<string>) {
  localStorage.setItem(`dash-tasks-done-${date}`, JSON.stringify([...s]));
}

function loadDismissedTasks(date: string): Set<string> {
  try {
    const raw = localStorage.getItem(`dash-tasks-hide-${date}`);
    if (raw) return new Set(JSON.parse(raw));
  } catch {}
  return new Set();
}

// ── Time-based greeting emoji ──
// ── Main Page ──
export default function Home() {
  const router = useRouter();
  const { lang } = useLang();
  const { user, isAuthenticated, isLoading, profile: authProfile, premiumStatus, needsAydinlatmaUpdate, refreshProfile } = useAuth();
  const { familyGroup, familyMembers, activeProfileId, loading: familyLoading } = useFamily();
  const { activeUserId, isOwnProfile, canEdit } = useActiveProfile();

  // When viewing a family member's profile, fetch *their* display data from user_profiles.
  // RLS cross-user SELECT policy (Session 31 FAZ 3) permits this.
  // authProfile stays the login user — used for gates (onboarding_complete, consent, premium).
  interface ViewedProfile {
    full_name: string | null;
    birth_date: string | null;
    age: number | null;
    chronic_conditions: string[] | null;
    vaccines: unknown;
    supplements: string[] | null;
  }
  const [viewedProfile, setViewedProfile] = useState<ViewedProfile | null>(null);

  useEffect(() => {
    if (isOwnProfile || !activeUserId) {
      setViewedProfile(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const supabase = createBrowserClient();
        const { data } = await supabase
          .from("user_profiles")
          .select("full_name, birth_date, age, chronic_conditions, vaccines, supplements")
          .eq("id", activeUserId)
          .maybeSingle();
        if (!cancelled) setViewedProfile(data as ViewedProfile | null);
      } catch {
        if (!cancelled) setViewedProfile(null);
      }
    })();
    return () => { cancelled = true; };
  }, [isOwnProfile, activeUserId]);

  // Display profile: source of truth for dashboard content shown to the user.
  // Gate-style fields (onboarding_complete, consent) still read from authProfile.
  // Typed as `any`-compatible via the common fields the UI actually reads.
  const displayProfile = (isOwnProfile ? authProfile : viewedProfile) as (ViewedProfile & Record<string, unknown>) | null;

  // Family profile selection — fallback redirect if user lands on / directly.
  // Login/callback should redirect to /select-profile via getPostAuthRedirect helper.
  // Only redirect if the family has 2+ accepted members; single-member groups skip profile picker.
  // sessionStorage flag persists across page reloads WITHIN the tab; a fresh tab / new
  // browser session forces the profile picker again (by design).
  useEffect(() => {
    if (!isLoading && !familyLoading && isAuthenticated && familyGroup && user) {
      const acceptedCount = familyMembers.length // familyMembers is already filtered to accepted-only
      if (acceptedCount < 2) return // solo family → no profile picker needed
      const key = `family_profile_selected_${user.id}`
      const hasSelected = typeof window !== "undefined" && sessionStorage.getItem(key)
      if (!hasSelected) {
        router.push('/select-profile')
      }
    }
  }, [isLoading, familyLoading, isAuthenticated, familyGroup, familyMembers, user, router]);

  // Guest state
  // Session 40 BUG-003: timeEmoji derived from hour state instead of a
  // separate useState + effect. This removes one render pass; `hour === null`
  // during SSR / first render yields the stable "👋" default (same emoji on
  // server and client), then the existing hour effect below promotes it.

  // Dashboard state
  const [checkInData, setCheckInData]   = useState<{ energy_level: number | null; sleep_quality: number | null; mood: number | null; bloating: number | null } | null>(null);
  const [addSupOpen, setAddSupOpen]     = useState(false);
  const [supRefreshKey, setSupRefreshKey] = useState(0);
  const [expandedCat, setExpandedCat]  = useState<string | null>(null);
  const [medications, setMedications]  = useState<{ medication_name: string }[]>([]);
  const [hour, setHour]                = useState<number | null>(null);
  const [query, setQuery]              = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [aydinlatmaOpen, setAydinlatmaOpen] = useState(false);

  // ── Task system with persistence ──
  const [taskPrefs, setTaskPrefs] = useState<TaskPrefs>({ enabledIds: [...DEFAULT_STATIC_IDS], durationOverrides: {} });
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());
  const [dismissedTaskIds, setDismissedTaskIds] = useState<Set<string>>(new Set());
  const [taskCustomizeMode, setTaskCustomizeMode] = useState(false);
  const [streak, setStreak] = useState(0);
  // Dynamic med/sup tasks from Supabase
  const [dynamicTasks, setDynamicTasks] = useState<DashboardTask[]>([]);
  const todayStr = getLocalDate();

  // Build the full task list: dynamic med/sup tasks + static tasks
  const allDashboardTasks: DashboardTask[] = [...dynamicTasks, ...STATIC_DASHBOARD_TASKS.map(t => ({ ...t, duration: t.duration as string | null }))];

  // Fetch real streak from Supabase
  useEffect(() => {
    if (!activeUserId) return;
    const fetchStreak = async () => {
      try {
        const supabase = createBrowserClient();
        const now = new Date();
        const ninetyAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90);
        const ninetyAgoStr = `${ninetyAgo.getFullYear()}-${String(ninetyAgo.getMonth()+1).padStart(2,"0")}-${String(ninetyAgo.getDate()).padStart(2,"0")}`;
        const [checkInsRes, logsRes] = await Promise.all([
          supabase.from("daily_check_ins").select("check_date").eq("user_id", activeUserId)
            .gte("check_date", ninetyAgoStr),
          supabase.from("daily_logs").select("log_date").eq("user_id", activeUserId).eq("completed", true)
            .gte("log_date", ninetyAgoStr),
        ]);
        const activeDates = new Set<string>();
        checkInsRes.data?.forEach((c: { check_date: string }) => activeDates.add(c.check_date));
        logsRes.data?.forEach((l: { log_date: string }) => activeDates.add(l.log_date));
        let s = 0;
        for (let i = 0; i < 90; i++) {
          const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
          const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
          if (activeDates.has(ds)) s++; else break;
        }
        setStreak(s);
      } catch (err) {
        if (process.env.NODE_ENV === "development") console.error("[Dashboard] Streak fetch error:", err);
      }
    };
    fetchStreak();
  }, [activeUserId]);

  // Fetch individual med/sup tasks + completion state from Supabase (single source of truth)
  const fetchDashboardTasks = useCallback(async () => {
    if (!activeUserId) return;
    try {
      const supabase = createBrowserClient();
      const [medsRes, supsRes, logsRes] = await Promise.all([
        supabase.from("user_medications").select("id, brand_name, generic_name, dosage, frequency").eq("user_id", activeUserId).eq("is_active", true),
        supabase.from("calendar_events").select("id, title").eq("user_id", activeUserId).eq("event_type", "supplement").eq("recurrence", "daily"),
        supabase.from("daily_logs").select("item_id, item_type, completed").eq("user_id", activeUserId).eq("log_date", todayStr).eq("completed", true),
        // water_intake artık WaterIntakeContext'ten geliyor
      ]);

      // Build dynamic task list
      const tasks: DashboardTask[] = [];
      medsRes.data?.forEach((m: { id: string; brand_name: string | null; generic_name: string | null; dosage: string | null; frequency: string | null }) => {
        const medName = m.brand_name || m.generic_name || "Med";
        const doses = parseMedDoses(m.frequency || "", lang as "en" | "tr");
        for (const dose of doses) {
          const itemId = buildMedItemId(m.id, dose);
          const label = buildMedLabel(medName, dose);
          tasks.push({ id: itemId, emoji: "💊", labelEn: label, labelTr: label, duration: null, isMed: true });
        }
      });
      supsRes.data?.forEach((s: { id: string; title: string | null }) => {
        // Skip meta: entries that leaked into calendar_events
        if (s.title?.startsWith("meta:")) return;
        const supName = getSupplementDisplayName(s.title || "", lang as "en" | "tr");
        tasks.push({ id: s.id, emoji: "🌿", labelEn: supName, labelTr: supName, duration: null, isSup: true });
      });
      setDynamicTasks(tasks);

      // Completion from daily_logs (med/sup) + localStorage (static tasks)
      const doneIds = new Set<string>();
      logsRes.data?.forEach((l: { item_id: string; item_type: string; completed: boolean }) => { if (l.completed) doneIds.add(l.item_id); });
      const staticDone = loadCompletedTasks(todayStr);
      STATIC_DASHBOARD_TASKS.forEach(t => { if (staticDone.has(t.id)) doneIds.add(t.id); });
      setCompletedTaskIds(doneIds);
    } catch {}
  }, [activeUserId, todayStr, lang]);

  useEffect(() => { fetchDashboardTasks(); }, [fetchDashboardTasks]);

  // Listen for cross-view sync events
  useEffect(() => {
    const handler = () => { fetchDashboardTasks(); };
    window.addEventListener("daily-log-changed", handler);
    window.addEventListener("water-intake-changed", handler);
    return () => {
      window.removeEventListener("daily-log-changed", handler);
      window.removeEventListener("water-intake-changed", handler);
    };
  }, [fetchDashboardTasks]);

  // Load task prefs + dismissals on mount (static tasks only)
  useEffect(() => {
    if (!user) return;
    setTaskPrefs(loadTaskPrefs(user.id));
    setDismissedTaskIds(loadDismissedTasks(todayStr));
  }, [user, todayStr]);

  // Visible tasks: dynamic (always visible) + static (enabled + not dismissed)
  const visibleTasks = [
    ...dynamicTasks,
    ...STATIC_DASHBOARD_TASKS.filter(
      (t) => taskPrefs.enabledIds.includes(t.id) && !dismissedTaskIds.has(t.id)
    ).map(t => ({ ...t, duration: t.duration as string | null })),
  ];

  const toggleTask = async (id: string) => {
    const next = new Set(completedTaskIds);
    const wasCompleted = next.has(id);
    if (wasCompleted) next.delete(id); else next.add(id);
    setCompletedTaskIds(next);

    const task = allDashboardTasks.find(t => t.id === id);
    const isMedOrSup = task?.isMed || task?.isSup;

    if (isMedOrSup && activeUserId) {
      // Guard: writing to a family member's daily_logs requires canEdit (hasManageRole + Premium).
      // RLS would block server-side too, but we short-circuit so the optimistic UI can revert cleanly.
      if (!isOwnProfile && !canEdit) {
        // Revert the optimistic toggle we applied above
        setCompletedTaskIds(new Set(completedTaskIds));
        if (process.env.NODE_ENV === "development") console.warn("[dashboard] toggle blocked — no edit permission for active profile");
        return;
      }
      // Write to daily_logs Supabase (single source of truth) — targets the active profile's user_id,
      // not the authenticated caller, so family members' completions show up on their own dashboard.
      try {
        const supabase = createBrowserClient();
        const itemType = task?.isMed ? "medication" : "supplement";
        const itemName = task?.labelEn || id;
        if (wasCompleted) {
          // Un-complete: delete the daily_log entry
          await supabase.from("daily_logs").delete()
            .eq("user_id", activeUserId).eq("log_date", todayStr).eq("item_type", itemType).eq("item_id", id);
        } else {
          // Complete: insert daily_log entry
          const { error } = await supabase.from("daily_logs").insert({
            user_id: activeUserId, log_date: todayStr, item_type: itemType, item_id: id, item_name: itemName, completed: true,
          });
          if (error) {
            await supabase.from("daily_logs").update({ completed: true })
              .eq("user_id", activeUserId).eq("log_date", todayStr).eq("item_type", itemType).eq("item_id", id);
          }
        }
        // Notify other views
        window.dispatchEvent(new Event("daily-log-changed"));
      } catch {}
    } else {
      // Static tasks — save to localStorage
      saveCompletedTasks(todayStr, next);
    }
  };

  const dismissTask = (id: string) => {
    // Only allow dismissing static tasks, not med/sup
    const task = allDashboardTasks.find(t => t.id === id);
    if (task?.isMed || task?.isSup) return;
    const next = new Set(dismissedTaskIds);
    next.add(id);
    setDismissedTaskIds(next);
    localStorage.setItem(`dash-tasks-hide-${todayStr}`, JSON.stringify([...next]));
  };

  const toggleTaskPref = (id: string) => {
    const enabled = new Set(taskPrefs.enabledIds);
    if (enabled.has(id)) { if (enabled.size <= 1) return; enabled.delete(id); }
    else enabled.add(id);
    const next = { ...taskPrefs, enabledIds: [...enabled] };
    setTaskPrefs(next);
    if (user) saveTaskPrefs(user.id, next);
  };

  const changeTaskDuration = (id: string, dur: string) => {
    const next = { ...taskPrefs, durationOverrides: { ...taskPrefs.durationOverrides, [id]: dur } };
    setTaskPrefs(next);
    if (user) saveTaskPrefs(user.id, next);
  };

  const completedCount = visibleTasks.filter((t) => completedTaskIds.has(t.id)).length;
  const scorePercent   = visibleTasks.length > 0 ? Math.round((completedCount / visibleTasks.length) * 100) : 0;

  const fetchCheckIn = useCallback(async () => {
    if (!activeUserId) return;
    try {
      const supabase = createBrowserClient();
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("daily_check_ins")
        .select("energy_level, sleep_quality, mood, bloating")
        .eq("user_id", activeUserId).eq("check_date", today).maybeSingle();
      if (data) setCheckInData(data);
    } catch { /* silent */ }
  }, [activeUserId]);

  const fetchMeds = useCallback(async () => {
    if (!activeUserId) return;
    try {
      const supabase = createBrowserClient();
      const { data } = await supabase
        .from("user_medications")
        .select("brand_name, generic_name")
        .eq("user_id", activeUserId).eq("is_active", true);
      if (data) setMedications(data.map((m: { brand_name: string | null; generic_name: string | null }) => ({ medication_name: m.generic_name || m.brand_name || "" })));
    } catch { /* silent */ }
  }, [activeUserId]);

  useEffect(() => { setHour(new Date().getHours()); }, []);
  useEffect(() => { if (activeUserId) { fetchCheckIn(); fetchMeds(); } }, [activeUserId, fetchCheckIn, fetchMeds]);
  useEffect(() => {
    const handler = () => fetchCheckIn();
    window.addEventListener("checkin-complete", handler);
    return () => window.removeEventListener("checkin-complete", handler);
  }, [fetchCheckIn]);

  const handleAskAI = () => {
    if (query.trim()) router.push(`/health-assistant?q=${encodeURIComponent(query.trim())}`);
  };

  // Gate on login user's onboarding (viewing a family member doesn't change whether the
  // caller has finished their own onboarding).
  const showDashboard = isAuthenticated && user && authProfile?.onboarding_complete;
  const isTr = lang === "tr";
  // Display fields read from active profile (self or family member being viewed).
  const firstName = displayProfile?.full_name?.split(" ")[0] || "";
  const isPremium = premiumStatus?.isPremium ?? false;
  const chronologicalAge = displayProfile?.birth_date
    ? Math.floor((Date.now() - new Date(displayProfile.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : displayProfile?.age;
  const greetingKey = hour === null ? "dashboard.morning" : hour < 12 ? "dashboard.morning" : hour < 18 ? "dashboard.afternoon" : "dashboard.evening";
  const timeEmoji: string = hour === null
    ? "👋"
    : hour < 6 ? "🌙"
    : hour < 12 ? "☀️"
    : hour < 17 ? "🌤️"
    : hour < 21 ? "🌅"
    : "🌙";

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-72 md:col-span-2 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      </div>
    );
  }

  // ─── AUTHENTICATED — Full Dashboard ───
  if (showDashboard) {
    return (
      <WaterIntakeProvider>
      <div className="min-h-screen bg-stone-50 dark:bg-background">
        <LocalizedTitle tr="Panel" en="Dashboard" />
        {/* Dashboard Tour (first visit only) */}
        <DashboardTour />
        {/* Vaccine Recommendation Banner */}
        <VaccineBanner lang={lang} chronicConditions={displayProfile?.chronic_conditions || []} vaccines={Array.isArray(displayProfile?.vaccines) ? (displayProfile.vaccines as VaccineEntry[]) : []} />

        {/* KVKK Aydınlatma Version Update Banner */}
        {needsAydinlatmaUpdate && (
          <div className="sticky top-0 z-40 bg-amber-50 dark:bg-amber-950/30 border-b-2 border-amber-400 px-4 py-3">
            <div className="flex items-center justify-between gap-3 max-w-6xl mx-auto">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                <span className="text-sm text-amber-900 dark:text-amber-100">
                  {isTr
                    ? `Aydınlatma metnimiz güncellendi (${CONSENT_VERSIONS.aydinlatma}). Lütfen okuyunuz.`
                    : `Our privacy notice has been updated (${CONSENT_VERSIONS.aydinlatma}). Please review.`}
                </span>
              </div>
              <button
                onClick={() => setAydinlatmaOpen(true)}
                className="text-sm font-medium text-amber-800 dark:text-amber-200 underline whitespace-nowrap"
              >
                {isTr ? "Güncellenen metni oku →" : "Read updated notice →"}
              </button>
            </div>
          </div>
        )}

        <motion.div variants={stagger} initial="hidden" animate="show"
          className="mx-auto max-w-7xl px-4 py-6 md:px-8 lg:px-12 space-y-6">

          {/* Free-tier nudge — hides itself on Premium / Family Premium. */}
          <PremiumFomoBanner />

          {/* ═══ BENTO HERO: Command Card + AI Copilot ═══ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* ── LEFT: Daily Command Card (2 cols) ── */}
            <motion.div variants={fadeUp}
              className="md:col-span-2 relative overflow-hidden rounded-2xl bg-white dark:bg-card border border-stone-200/60 dark:border-stone-800 shadow-lg p-6">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full" />
              <div className="relative flex flex-col sm:flex-row gap-6">
                {/* Score Ring */}
                <div className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <CircularProgress value={scorePercent} size={120} strokeWidth={10} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <motion.span key={scorePercent} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="text-2xl font-bold text-foreground">{scorePercent}</motion.span>
                      <span className="text-[10px] text-muted-foreground font-medium">/100</span>
                    </div>
                  </div>
                  <motion.div whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 px-3 py-1 border border-amber-200 dark:border-amber-800">
                    <Flame className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400">{streak} {tx("dashboard.dayStreak", lang)}</span>
                  </motion.div>
                </div>

                {/* Greeting + Tasks */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-xl md:text-2xl font-semibold text-foreground">
                      {tx(greetingKey, lang).replace("{name}", firstName)} 👋
                    </h1>
                    <InfoTooltip title={tx("dashboard.healthHub", lang)} description={tx("dashboard.healthHubDesc", lang)} />
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs text-muted-foreground">
                      {tx("dashboard.tasksSubtitle", lang)}
                    </p>
                    <button onClick={() => setTaskCustomizeMode(!taskCustomizeMode)}
                      className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
                      title={tx("dashboard.customize", lang)}>
                      {taskCustomizeMode
                        ? <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M5 13l4 4L19 7"/></svg>
                        : <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                      }
                    </button>
                  </div>

                  {/* Session 43 F-OB-005: first-time medication hint.
                      Renders only while the user has no active medications
                      (dynamicTasks comes from user_medications +
                      user_supplements). The hint auto-disappears the moment
                      the first medication is saved — no dismiss logic
                      required. Routes the user straight to the medication
                      form inside Profile. */}
                  {dynamicTasks.length === 0 && (
                    <Link
                      href="/profile?tab=medications"
                      className="mb-2 flex items-center gap-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/20 px-3 py-2.5 text-xs text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                    >
                      <span className="text-base">💊</span>
                      <span className="flex-1">
                        {isTr
                          ? "İlk ilacını ekle — etkileşim uyarılarını anında gör"
                          : "Add your first medication — see interaction alerts instantly"}
                      </span>
                      <span aria-hidden className="text-emerald-600 dark:text-emerald-400">→</span>
                    </Link>
                  )}
                  {/* ── Normal Task List — always visible (Session 41 F-D-003) ──
                      Previously the customize panel swapped with the task
                      list, so clicking the gear hid the user's day to let
                      them pick which static tasks to show. That created a
                      context-switch friction: "I just want to toggle one
                      thing — why is my list gone?". The list now stays
                      visible, and the customize panel expands beneath it. */}
                  <div className="space-y-0.5">
                    {visibleTasks.map((t) => {
                      const dur = taskPrefs.durationOverrides[t.id] || t.duration;
                      const label: string = isTr ? t.labelTr : t.labelEn;
                      const isWater = t.id === "water";
                      const displayLabel = isWater
                        ? label
                        : dur ? `${label} (${dur})` : label;
                      const tWithFlags = t as DashboardTask;
                      const onDismissFn = tWithFlags.isMed || tWithFlags.isSup ? undefined : () => dismissTask(t.id);
                      if (isWater) {
                        return (
                          <WaterTaskItem key={t.id} emoji={t.emoji} label={displayLabel}
                            done={completedTaskIds.has(t.id)}
                            onClick={() => toggleTask(t.id)}
                            onDismiss={onDismissFn} />
                        );
                      }
                      return (
                        <TaskItem key={t.id} emoji={t.emoji} label={displayLabel}
                          done={completedTaskIds.has(t.id)}
                          onClick={() => toggleTask(t.id)}
                          onDismiss={onDismissFn} />
                      );
                    })}
                  </div>

                  {/* ── Customize panel (expands under the list, static tasks only) ── */}
                  {taskCustomizeMode && (
                    <div className="mt-3 pt-3 border-t border-dashed border-border space-y-1.5">
                      <p className="text-[10px] text-muted-foreground mb-2">
                        {tx("dashboard.toggleExtra", lang)}
                      </p>
                      {STATIC_DASHBOARD_TASKS.map((t) => {
                        const isOn = taskPrefs.enabledIds.includes(t.id);
                        const dur = taskPrefs.durationOverrides[t.id] || t.duration;
                        return (
                          <div key={t.id} className={`flex items-center gap-2 py-1 px-2 rounded-lg transition-colors ${isOn ? "bg-primary/5" : "opacity-50"}`}>
                            <button onClick={() => toggleTaskPref(t.id)}
                              className={`relative h-5 w-9 flex-shrink-0 rounded-full transition-colors ${isOn ? "bg-primary" : "bg-muted-foreground/30"}`}>
                              <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${isOn ? "translate-x-4" : "translate-x-0"}`} />
                            </button>
                            <span className="text-xs">{t.emoji}</span>
                            <span className="text-sm flex-1">{isTr ? t.labelTr : t.labelEn}</span>
                            {isOn && t.duration && (
                              <div className="flex gap-0.5">
                                {DURATION_OPTS.map((d) => (
                                  <button key={d} onClick={() => changeTaskDuration(t.id, d)}
                                    className={`rounded px-1 py-0.5 text-[8px] font-medium transition-colors ${
                                      (dur || "") === d ? "bg-primary text-white" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                                    }`}>{d}</button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="mt-3 h-2 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                    <motion.div className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
                      initial={{ width: 0 }} animate={{ width: `${scorePercent}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" as const }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {completedCount}/{visibleTasks.length} {tx("dashboard.completed", lang)}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-[10px] text-muted-foreground">
                <span className="rounded-full bg-primary/10 px-2 py-0.5 font-semibold text-primary">BETA</span>
                <span>{tx("dashboard.betaTagline", lang)}</span>
              </div>
            </motion.div>

            {/* ── RIGHT: AI Copilot ── */}
            <motion.div variants={fadeUp}
              className="relative overflow-hidden rounded-2xl bg-slate-900 dark:bg-slate-950 text-white shadow-2xl p-6 flex flex-col">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-sage/20 rounded-full blur-2xl" />
              <div className="relative flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-sm font-semibold">{tx("dashboard.healthAssistant", lang)}</h2>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-emerald-300">Online</span>
                  </div>
                </div>
                <p className="text-xs text-stone-400 mb-4 leading-relaxed">
                  {tx("dashboard.assistantDesc", lang)}
                </p>
                <div className="mt-auto">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
                    <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAskAI()}
                      placeholder={tx("dashboard.assistantPlaceholder", lang)}
                      className="w-full rounded-xl bg-white/10 backdrop-blur border border-white/10 pl-10 pr-10 py-3 text-sm text-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                    <button onClick={handleAskAI} aria-label="Send"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 flex items-center justify-center rounded-lg bg-primary hover:bg-primary/80 transition-colors">
                      <Send className="h-3.5 w-3.5 text-white" />
                    </button>
                  </div>
                  {/* Session 42 F-D-010: 2-column grid on mobile so chip
                      text never overflows its parent and both chips stay
                      tappable side-by-side. sm: restores flex-wrap for
                      future chip expansion (3+ chips layout naturally). */}
                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5 mt-3">
                    {[
                      { emoji: "💊", text: tx("dashboard.chipDrugInteraction", lang), query: tx("dashboard.chipDrugInteractionQuery", lang) },
                      { emoji: "🩸", text: tx("dashboard.chipAnalyzeBlood", lang), query: tx("dashboard.chipAnalyzeBloodQuery", lang) },
                    ].map((chip, i) => (
                      <button key={i} onClick={() => router.push(`/health-assistant?q=${encodeURIComponent(chip.query)}`)}
                        className="flex items-center gap-1 rounded-lg bg-white/5 border border-white/10 px-2.5 py-1.5 text-[10px] text-stone-400 hover:bg-white/10 hover:text-white transition-colors min-w-0">
                        <span className="shrink-0">{chip.emoji}</span>
                        <span className="truncate">{chip.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ═══ QUICK ACTIONS ═══ */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { href: "/interaction-checker", icon: ShieldCheck, emoji: "🛡️", labelEn: "Interaction Check", labelTr: "Etkileşim Kontrolü", gradient: "from-emerald-500/10 to-green-500/5" },
              { href: "/blood-test",          icon: Microscope,  emoji: "🩸", labelEn: "Upload Test",        labelTr: "Tahlil Yükle",       gradient: "from-rose-500/10 to-pink-500/5" },
              { href: "/calendar",            icon: Pill,        emoji: "📅", labelEn: "Calendar",           labelTr: "Takvim",             gradient: "from-blue-500/10 to-indigo-500/5" },
              { href: "/sleep-analysis",      icon: Moon,        emoji: "😴", labelEn: "Sleep Analysis",     labelTr: "Uyku Analizi",       gradient: "from-indigo-500/10 to-violet-500/5" },
            ].map((action, i) => (
              <motion.div key={i} whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }} whileTap={{ scale: 0.97 }}>
                <Link href={action.href}
                  className={`flex items-center gap-3 rounded-xl bg-gradient-to-br ${action.gradient} border border-stone-200/60 dark:border-stone-800 p-4 transition-all`}>
                  <span className="text-lg">{action.emoji}</span>
                  <span className="text-xs font-semibold text-foreground">{isTr ? action.labelTr : action.labelEn}</span>
                  <ArrowRight className="h-3 w-3 ml-auto text-muted-foreground" />
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* ═══ FAMILY JOIN CTA — only if user has no family group ═══ */}
          {!familyGroup && (
            <motion.div variants={fadeUp}>
              <Link
                href="/family/join"
                className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 p-4 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15">
                    <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {tx("family.joinCtaTitle", lang)}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {tx("family.joinWithCode", lang)}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              </Link>
            </motion.div>
          )}

          {/* ═══ DAILY CARE + SYNERGY ═══ */}
          <motion.div variants={fadeUp} className="grid gap-6 md:grid-cols-2">
            <DailyCareCard />
            <DailySynergyCard />
          </motion.div>

          {/* ═══ HEALTH INSIGHTS GRID ═══ */}
          <motion.div variants={fadeUp} className="grid gap-6 md:grid-cols-2">
            <div className="space-y-6">
              <SeasonalCard lang={lang} userConditions={displayProfile?.chronic_conditions || []} />
              <WeeklySummaryCard userId={activeUserId} lang={lang} isPremium={isPremium} />
              <WashoutCountdown key={supRefreshKey} userId={activeUserId} lang={lang} isPremium={isPremium}
                profileSupplements={(displayProfile?.supplements || []).filter((s: string) => !s.startsWith("meta:"))} onAddSupplement={() => setAddSupOpen(true)} />
            </div>
            <div className="space-y-6">
              <BiologicalAgeCard userId={activeUserId} lang={lang} isPremium={isPremium}
                chronologicalAge={chronologicalAge} userName={displayProfile?.full_name ?? undefined} />
              <MetabolicPortfolio lang={lang} isPremium={isPremium} checkInData={checkInData} />
              <BossFightCard userId={activeUserId} lang={lang} isPremium={isPremium} />
            </div>
          </motion.div>

          {/* ═══ TOOL CATEGORIES ═══ */}
          <motion.div variants={fadeUp}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-semibold">{tx("dashboard.tools", lang)}</h2>
              <Link href="/tools" className="text-xs text-primary hover:underline flex items-center gap-1">
                {tx("dash.allTools", lang)} <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {TOOL_CATEGORIES.map((cat) => {
                const emoji = CATEGORY_EMOJI[cat.id] || "📋";
                const isExpanded = expandedCat === cat.id;
                return (
                  <div key={cat.id} className={`rounded-xl overflow-hidden transition-all duration-300 ${
                    isExpanded ? "col-span-2 sm:col-span-3 lg:col-span-4 shadow-lg ring-1 ring-black/5 dark:ring-white/5" : "hover:shadow-md hover:-translate-y-0.5"
                  }`}>
                    <button onClick={() => setExpandedCat(isExpanded ? null : cat.id)}
                      className="w-full text-left transition-all"
                      style={{ background: `linear-gradient(135deg, ${cat.color}08 0%, ${cat.color}15 100%)`, borderLeft: `3px solid ${cat.color}` }}>
                      <div className="flex items-center gap-3 p-3.5">
                        <span className="text-lg">{emoji}</span>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-semibold text-foreground block">{cat.title[lang]}</span>
                          <span className="text-[10px] text-muted-foreground">{cat.modules.filter(m => !m.hidden).length} {tx("common.tools", lang)}</span>
                        </div>
                        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                      </div>
                    </button>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
                          className="border-t border-border/50 px-2 pb-2 pt-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-0.5 overflow-hidden"
                          style={{ background: `linear-gradient(180deg, ${cat.color}05 0%, transparent 100%)` }}>
                          {cat.modules.filter(m => !m.hidden).map((mod) => (
                            <Link key={mod.id} href={mod.href}
                              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-white/60 dark:hover:bg-white/5 transition-colors">
                              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                              {mod.title[lang]}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Quick Links */}
            <div className="mt-4 flex flex-wrap gap-2">
              {QUICK_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <Link key={link.href} href={link.href}
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors">
                    <Icon className="h-3 w-3" />
                    {tx(link.labelKey, lang)}
                  </Link>
                );
              })}
            </div>
          </motion.div>

          <AddSupplementDialog userId={activeUserId} lang={lang} open={addSupOpen}
            onOpenChange={setAddSupOpen} onSaved={() => setSupRefreshKey((k) => k + 1)} />

          {/* KVKK Aydınlatma Update Popup */}
          {needsAydinlatmaUpdate && (
            <AydinlatmaPopup
              open={aydinlatmaOpen}
              forceAcknowledge={needsAydinlatmaUpdate}
              onAcknowledge={async () => {
                // Session 36 C7: Close popup first (UX — prevent "not closing" bug),
                // then persist acknowledge to backend + refresh profile so
                // `needsAydinlatmaUpdate` flag resolves to false on next render.
                setAydinlatmaOpen(false);
                try {
                  const supabase = createBrowserClient();
                  const { data: { session: s } } = await supabase.auth.getSession();
                  if (!s?.access_token) {
                    if (process.env.NODE_ENV === "development") console.warn("[aydinlatma] no session, skip persist");
                    return;
                  }
                  const res = await fetch("/api/privacy-settings", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${s.access_token}` },
                    body: JSON.stringify({ action: "acknowledge_aydinlatma", version: CONSENT_VERSIONS.aydinlatma }),
                  });
                  if (!res.ok) {
                    if (process.env.NODE_ENV === "development") console.error("[aydinlatma] persist failed", res.status, await res.text().catch(() => ""));
                  }
                } catch (err) {
                  if (process.env.NODE_ENV === "development") console.error("[aydinlatma] acknowledge error", err);
                }
                // Await refresh so needsAydinlatmaUpdate resolves before next render
                await refreshProfile();
              }}
              onClose={() => setAydinlatmaOpen(false)}
            />
          )}
        </motion.div>
      </div>
      </WaterIntakeProvider>
    );
  }

  // ─── GUEST LANDING PAGE ───
  return <LandingPage />;
}
