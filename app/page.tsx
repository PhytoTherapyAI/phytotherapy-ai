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
  Scissors, ChevronDown,
} from "lucide-react";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import { useAuth } from "@/lib/auth-context";
import { useFamily } from "@/lib/family-context";
import { createBrowserClient } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { AddSupplementDialog } from "@/components/calendar/AddSupplementDialog";
import { DashboardTour } from "@/components/layout/DashboardTour";
import { TOOL_CATEGORIES } from "@/lib/tools-hierarchy";
import { parseMedDoses, buildMedItemId, buildMedLabel } from "@/lib/med-dose-utils";
import { getSupplementDisplayName } from "@/lib/supplement-data";
import { getVaccineRecommendations, isFluSeason, type VaccineEntry } from "@/lib/vaccine-data";

// ── Dynamic Imports (Dashboard) ──
const BotanicalHero = dynamic(
  () => import("@/components/illustrations/botanical-hero").then((m) => m.BotanicalHero),
  { ssr: false, loading: () => <div className="h-64 w-full rounded-lg bg-stone-100 dark:bg-stone-800 animate-pulse" /> }
);
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

// ── Guest Landing FAQ ──
const FAQ_ITEMS = [
  {
    questionTr: "Fitoterapi nedir?",
    questionEn: "What is phytotherapy?",
    answerTr: "Fitoterapi, bilimsel olarak kanıtlanmış bitkisel tedavilerin kullanılmasıdır. Doctopal, modern tıp ile kanıta dayalı bitkisel tıbbı birleştirerek güvenli ve kişiselleştirilmiş öneriler sunar.",
    answerEn: "Phytotherapy is the use of scientifically proven herbal treatments. Doctopal bridges modern medicine and evidence-based herbal medicine to provide safe, personalized recommendations.",
  },
  {
    questionTr: "İlaçlarla bitkisel takviye kullanmak güvenli mi?",
    questionEn: "Is it safe to use herbal supplements with medications?",
    answerTr: "Bazı bitkisel takviyeler ilaçlarla etkileşime girebilir. Doctopal'ın ilaç etkileşim kontrolü, güvenli ve riskli kombinasyonları bilimsel kaynaklarla gösterir.",
    answerEn: "Some herbal supplements can interact with medications. Doctopal's drug interaction checker shows safe and risky combinations with scientific sources.",
  },
  {
    questionTr: "Kan tahlilimi nasıl yorumlarım?",
    questionEn: "How can I interpret my blood test results?",
    answerTr: "Kan tahlili değerlerinizi girerek yapay zeka destekli detaylı analiz alabilirsiniz. 30'dan fazla biyomarkör değerlendirilir.",
    answerEn: "Enter your blood test values for AI-powered detailed analysis. 30+ biomarkers are evaluated.",
  },
  {
    questionTr: "Doctopal ücretsiz mi?",
    questionEn: "Is Doctopal free?",
    answerTr: "Evet, temel özellikleri ücretsizdir. Sağlık asistanı, ilaç etkileşim kontrolü ve kan tahlili analizi ücretsiz kullanılabilir.",
    answerEn: "Yes, core features are free. The health assistant, drug interaction checker, and blood test analysis are available at no cost.",
  },
];

// ── Demo Banner ──
function DemoBanner({ lang }: { lang: string }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div className="bg-gradient-to-r from-primary/10 via-emerald-500/10 to-teal-500/10 border-b border-primary/10">
      <div className="mx-auto max-w-7xl px-4 py-2.5 flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-primary flex items-center gap-2">
          <span>🎓</span>
          Harvard HVHS Hackathon Demo Mode — All premium features unlocked
        </p>
        <div className="flex items-center gap-2">
          <Link href="/interaction-checker" className="text-[10px] bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium hover:bg-primary/20 transition-colors">
            Quick Demo
          </Link>
          <button onClick={() => setDismissed(true)} className="text-muted-foreground hover:text-foreground text-xs px-1">✕</button>
        </div>
      </div>
    </div>
  );
}

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
function getTimeEmoji(): string {
  const h = new Date().getHours();
  if (h < 6)  return "🌙";
  if (h < 12) return "☀️";
  if (h < 17) return "🌤️";
  if (h < 21) return "🌅";
  return "🌙";
}

// ── Main Page ──
export default function Home() {
  const router = useRouter();
  const { lang } = useLang();
  const { user, isAuthenticated, isLoading, profile } = useAuth();
  const { familyGroup, activeProfileId, loading: familyLoading } = useFamily();

  // Family profile selection — redirect if group exists but no profile selected yet
  useEffect(() => {
    if (!isLoading && !familyLoading && isAuthenticated && familyGroup) {
      // Check if user has been to select-profile this session
      const hasSelected = sessionStorage.getItem('family_profile_selected');
      if (!hasSelected) {
        sessionStorage.setItem('family_profile_selected', 'true');
        router.push('/select-profile');
      }
    }
  }, [isLoading, familyLoading, isAuthenticated, familyGroup, router]);

  // Guest state
  const [searchQuery, setSearchQuery] = useState("");
  const [timeEmoji, setTimeEmoji] = useState("👋");

  // Dashboard state
  const [checkInData, setCheckInData]   = useState<any>(null);
  const [addSupOpen, setAddSupOpen]     = useState(false);
  const [supRefreshKey, setSupRefreshKey] = useState(0);
  const [expandedCat, setExpandedCat]  = useState<string | null>(null);
  const [medications, setMedications]  = useState<any[]>([]);
  const [hour, setHour]                = useState<number | null>(null);
  const [query, setQuery]              = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Task system with persistence ──
  const [taskPrefs, setTaskPrefs] = useState<TaskPrefs>({ enabledIds: [...DEFAULT_STATIC_IDS], durationOverrides: {} });
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());
  const [dismissedTaskIds, setDismissedTaskIds] = useState<Set<string>>(new Set());
  const [taskCustomizeMode, setTaskCustomizeMode] = useState(false);
  const [streak, setStreak] = useState(0);
  // Dynamic med/sup tasks from Supabase
  const [dynamicTasks, setDynamicTasks] = useState<DashboardTask[]>([]);
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [waterTarget, setWaterTarget] = useState(8);
  const todayStr = getLocalDate();

  // Build the full task list: dynamic med/sup tasks + static tasks
  const allDashboardTasks: DashboardTask[] = [...dynamicTasks, ...STATIC_DASHBOARD_TASKS.map(t => ({ ...t, duration: t.duration as string | null }))];

  // Fetch real streak from Supabase
  useEffect(() => {
    if (!user?.id) return;
    const fetchStreak = async () => {
      try {
        const supabase = createBrowserClient();
        const now = new Date();
        const ninetyAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90);
        const ninetyAgoStr = `${ninetyAgo.getFullYear()}-${String(ninetyAgo.getMonth()+1).padStart(2,"0")}-${String(ninetyAgo.getDate()).padStart(2,"0")}`;
        const [checkInsRes, logsRes] = await Promise.all([
          supabase.from("daily_check_ins").select("check_date").eq("user_id", user.id)
            .gte("check_date", ninetyAgoStr),
          supabase.from("daily_logs").select("log_date").eq("user_id", user.id).eq("completed", true)
            .gte("log_date", ninetyAgoStr),
        ]);
        const activeDates = new Set<string>();
        checkInsRes.data?.forEach((c: any) => activeDates.add(c.check_date));
        logsRes.data?.forEach((l: any) => activeDates.add(l.log_date));
        let s = 0;
        for (let i = 0; i < 90; i++) {
          const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
          const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
          if (activeDates.has(ds)) s++; else break;
        }
        setStreak(s);
      } catch (err) {
        console.error("[Dashboard] Streak fetch error:", err);
      }
    };
    fetchStreak();
  }, [user?.id]);

  // Fetch individual med/sup tasks + completion state from Supabase (single source of truth)
  const fetchDashboardTasks = useCallback(async () => {
    if (!user?.id) return;
    try {
      const supabase = createBrowserClient();
      const [medsRes, supsRes, logsRes, waterRes] = await Promise.all([
        supabase.from("user_medications").select("id, brand_name, generic_name, dosage, frequency").eq("user_id", user.id).eq("is_active", true),
        supabase.from("calendar_events").select("id, title").eq("user_id", user.id).eq("event_type", "supplement").eq("recurrence", "daily"),
        supabase.from("daily_logs").select("item_id, item_type, completed").eq("user_id", user.id).eq("log_date", todayStr).eq("completed", true),
        supabase.from("water_intake").select("glasses, target_glasses").eq("user_id", user.id).eq("intake_date", todayStr).single(),
      ]);

      // Build dynamic task list
      const tasks: DashboardTask[] = [];
      medsRes.data?.forEach((m: any) => {
        const medName = m.brand_name || m.generic_name || "Med";
        const doses = parseMedDoses(m.frequency || "", lang as "en" | "tr");
        for (const dose of doses) {
          const itemId = buildMedItemId(m.id, dose);
          const label = buildMedLabel(medName, dose);
          tasks.push({ id: itemId, emoji: "💊", labelEn: label, labelTr: label, duration: null, isMed: true });
        }
      });
      supsRes.data?.forEach((s: any) => {
        const supName = getSupplementDisplayName(s.title, lang as "en" | "tr");
        tasks.push({ id: s.id, emoji: "🌿", labelEn: supName, labelTr: supName, duration: null, isSup: true });
      });
      setDynamicTasks(tasks);

      // Completion from daily_logs (med/sup) + localStorage (static tasks)
      const doneIds = new Set<string>();
      logsRes.data?.forEach((l: any) => { if (l.completed) doneIds.add(l.item_id); });
      const staticDone = loadCompletedTasks(todayStr);
      STATIC_DASHBOARD_TASKS.forEach(t => { if (staticDone.has(t.id)) doneIds.add(t.id); });
      setCompletedTaskIds(doneIds);

      // Water
      if (waterRes.data) {
        setWaterGlasses(waterRes.data.glasses ?? 0);
        if (waterRes.data.target_glasses) setWaterTarget(waterRes.data.target_glasses);
      }
    } catch {}
  }, [user?.id, todayStr, lang]);

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

    if (isMedOrSup && user?.id) {
      // Write to daily_logs Supabase (single source of truth)
      try {
        const supabase = createBrowserClient();
        const itemType = task?.isMed ? "medication" : "supplement";
        const itemName = task?.labelEn || id;
        if (wasCompleted) {
          // Un-complete: delete the daily_log entry
          await supabase.from("daily_logs").delete()
            .eq("user_id", user.id).eq("log_date", todayStr).eq("item_type", itemType).eq("item_id", id);
        } else {
          // Complete: insert daily_log entry
          const { error } = await supabase.from("daily_logs").insert({
            user_id: user.id, log_date: todayStr, item_type: itemType, item_id: id, item_name: itemName, completed: true,
          });
          if (error) {
            await supabase.from("daily_logs").update({ completed: true })
              .eq("user_id", user.id).eq("log_date", todayStr).eq("item_type", itemType).eq("item_id", id);
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
    if (!user) return;
    try {
      const supabase = createBrowserClient();
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("daily_check_ins")
        .select("energy_level, sleep_quality, mood, bloating")
        .eq("user_id", user.id).eq("check_date", today).single();
      if (data) setCheckInData(data);
    } catch { /* silent */ }
  }, [user]);

  const fetchMeds = useCallback(async () => {
    if (!user) return;
    try {
      const supabase = createBrowserClient();
      const { data } = await supabase
        .from("user_medications")
        .select("brand_name, generic_name")
        .eq("user_id", user.id).eq("is_active", true);
      if (data) setMedications(data.map((m: any) => ({ medication_name: m.generic_name || m.brand_name })));
    } catch { /* silent */ }
  }, [user]);

  useEffect(() => { setTimeEmoji(getTimeEmoji()); }, []);
  useEffect(() => { setHour(new Date().getHours()); }, []);
  useEffect(() => { if (user) { fetchCheckIn(); fetchMeds(); } }, [user, fetchCheckIn, fetchMeds]);
  useEffect(() => {
    const handler = () => fetchCheckIn();
    window.addEventListener("checkin-complete", handler);
    return () => window.removeEventListener("checkin-complete", handler);
  }, [fetchCheckIn]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/health-assistant?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleAskAI = () => {
    if (query.trim()) router.push(`/health-assistant?q=${encodeURIComponent(query.trim())}`);
  };

  const showDashboard = isAuthenticated && user && profile?.onboarding_complete;
  const isTr = lang === "tr";
  const firstName = profile?.full_name?.split(" ")[0] || "";
  const isPremium = true;
  const chronologicalAge = profile?.birth_date
    ? Math.floor((Date.now() - new Date(profile.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : profile?.age;
  const greetingKey = hour === null ? "dashboard.morning" : hour < 12 ? "dashboard.morning" : hour < 18 ? "dashboard.afternoon" : "dashboard.evening";

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
      <div className="min-h-screen bg-stone-50 dark:bg-background">
        {/* Dashboard Tour (first visit only) */}
        <DashboardTour />
        {/* Hackathon Demo Banner */}
        <DemoBanner lang={lang} />
        {/* Vaccine Recommendation Banner */}
        <VaccineBanner lang={lang} chronicConditions={profile?.chronic_conditions || []} vaccines={Array.isArray(profile?.vaccines) ? (profile.vaccines as VaccineEntry[]) : []} />

        <motion.div variants={stagger} initial="hidden" animate="show"
          className="mx-auto max-w-7xl px-4 py-6 md:px-8 lg:px-12 space-y-6">

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
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400">{streak} {isTr ? "gün seri" : "day streak"}</span>
                  </motion.div>
                </div>

                {/* Greeting + Tasks */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-xl md:text-2xl font-semibold text-foreground">
                      {tx(greetingKey, lang).replace("{name}", firstName)} 👋
                    </h1>
                    <InfoTooltip title={isTr ? "Sağlık Merkezin" : "Your Health Hub"} description={isTr ? "Arama çubuğundan her şeyi sorabilirsin. Günlük özetin temel sağlık metriklerini bir bakışta gösterir." : "Ask anything via the search bar. Your daily snapshot shows key health metrics at a glance."} />
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs text-muted-foreground">
                      {isTr ? "Günlük görevlerini tamamla, skorunu yükselt!" : "Complete your daily tasks, boost your score!"}
                    </p>
                    <button onClick={() => setTaskCustomizeMode(!taskCustomizeMode)}
                      className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
                      title={isTr ? "Kişiselleştir" : "Customize"}>
                      {taskCustomizeMode
                        ? <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M5 13l4 4L19 7"/></svg>
                        : <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                      }
                    </button>
                  </div>

                  {/* ── Customize Mode (static tasks only) ── */}
                  {taskCustomizeMode ? (
                    <div className="space-y-1.5 mb-3">
                      <p className="text-[10px] text-muted-foreground mb-2">
                        {isTr ? "Ek görevleri aç/kapat:" : "Toggle extra tasks:"}
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
                  ) : (
                    /* ── Normal Task List ── */
                    <div className="space-y-0.5">
                      {visibleTasks.map((t) => {
                        const dur = taskPrefs.durationOverrides[t.id] || t.duration;
                        const label: string = isTr ? t.labelTr : t.labelEn;
                        // Water: show glasses count
                        const displayLabel = t.id === "water"
                          ? `${label} ${waterGlasses}/${waterTarget}`
                          : dur ? `${label} (${dur})` : label;
                        return (
                          <TaskItem key={t.id} emoji={t.emoji} label={displayLabel}
                            done={completedTaskIds.has(t.id)}
                            onClick={() => toggleTask(t.id)}
                            onDismiss={(t as any).isMed || (t as any).isSup ? undefined : () => dismissTask(t.id)} />
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
                    {completedCount}/{visibleTasks.length} {isTr ? "tamamlandı" : "completed"}
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
                    <h2 className="text-sm font-semibold">{isTr ? "Sağlık Asistanı" : "Health Assistant"}</h2>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-emerald-300">Online</span>
                  </div>
                </div>
                <p className="text-xs text-stone-400 mb-4 leading-relaxed">
                  {isTr
                    ? "İlaç etkileşimleri, takviye önerileri, kan tahlili yorumlama... Her konuda yanınızdayım."
                    : "Drug interactions, supplement advice, blood test analysis... I'm here for everything."}
                </p>
                <div className="mt-auto">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
                    <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAskAI()}
                      placeholder={isTr ? "Bugün sağlığınız için ne araştıralım?" : "What should we research for your health today?"}
                      className="w-full rounded-xl bg-white/10 backdrop-blur border border-white/10 pl-10 pr-10 py-3 text-sm text-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                    <button onClick={handleAskAI} aria-label="Send"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 flex items-center justify-center rounded-lg bg-primary hover:bg-primary/80 transition-colors">
                      <Send className="h-3.5 w-3.5 text-white" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {[
                      { emoji: "💊", text: isTr ? "İlaç etkileşimi" : "Drug interaction", query: isTr ? "İlaç etkileşimi hakkında bilgi" : "Drug interaction help" },
                      { emoji: "🩸", text: isTr ? "Tahlil yorumla" : "Analyze blood test", query: isTr ? "Kan tahlilimi yorumla" : "Analyze my blood test" },
                    ].map((chip, i) => (
                      <button key={i} onClick={() => router.push(`/health-assistant?q=${encodeURIComponent(chip.query)}`)}
                        className="flex items-center gap-1 rounded-lg bg-white/5 border border-white/10 px-2.5 py-1.5 text-[10px] text-stone-400 hover:bg-white/10 hover:text-white transition-colors">
                        <span>{chip.emoji}</span> {chip.text}
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

          {/* ═══ DAILY CARE + SYNERGY ═══ */}
          <motion.div variants={fadeUp} className="grid gap-6 md:grid-cols-2">
            <DailyCareCard />
            <DailySynergyCard />
          </motion.div>

          {/* ═══ HEALTH INSIGHTS GRID ═══ */}
          <motion.div variants={fadeUp} className="grid gap-6 md:grid-cols-2">
            <div className="space-y-6">
              <SeasonalCard lang={lang} userConditions={profile.chronic_conditions || []} />
              <WeeklySummaryCard userId={user.id} lang={lang} isPremium={isPremium} />
              <WashoutCountdown key={supRefreshKey} userId={user.id} lang={lang} isPremium={isPremium}
                profileSupplements={profile.supplements || []} onAddSupplement={() => setAddSupOpen(true)} />
            </div>
            <div className="space-y-6">
              <BiologicalAgeCard userId={user.id} lang={lang} isPremium={isPremium}
                chronologicalAge={chronologicalAge} userName={profile.full_name ?? undefined} />
              <MetabolicPortfolio lang={lang} isPremium={isPremium} checkInData={checkInData} />
              <BossFightCard userId={user.id} lang={lang} isPremium={isPremium} />
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

          <AddSupplementDialog userId={user.id} lang={lang} open={addSupOpen}
            onOpenChange={setAddSupOpen} onSaved={() => setSupRefreshKey((k) => k + 1)} />
        </motion.div>
      </div>
    );
  }

  // ─── GUEST LANDING PAGE ───
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 pt-8 pb-4 md:pt-16 md:pb-8">
          <div className="flex flex-col items-center gap-6 md:flex-row md:gap-12">
            <div className="flex-1 text-center md:text-left stagger-children">
              {/* Badge */}
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
                <Activity className="h-3.5 w-3.5" />
                {tx("lp.heroBadge", lang)}
              </div>

              <h1 className="font-heading text-2xl font-semibold leading-tight tracking-tight sm:text-3xl md:text-5xl">
                {isTr ? (
                  <>Tahmin Değil,<br /><span style={{ color: "var(--brand)" }}>Kanıta Dayalı Analiz.</span></>
                ) : (
                  <>Not Guesswork,<br /><span style={{ color: "var(--brand)" }}>Evidence-Based Analysis.</span></>
                )}
              </h1>
              <p className="mt-3 max-w-lg text-xs text-muted-foreground sm:text-sm md:text-base">
                {isTr
                  ? "DoctoPal semptomlarınızı dinler, ilaç etkileşimlerini analiz eder ve doktorunuz için profesyonel bir SBAR ön raporu hazırlar."
                  : "DoctoPal listens to your symptoms, analyzes drug interactions, and prepares a professional SBAR preliminary report for your doctor."}
              </p>

              {/* Spotlight search */}
              <form onSubmit={handleSearch} className="mt-5 md:mt-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isTr ? "Bir bitki veya sağlık sorusu sor..." : "Ask about any herb or health question..."}
                    className="w-full rounded-2xl border bg-card py-3.5 pl-11 pr-14 text-sm shadow-soft-md outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <button type="submit" aria-label="Search" className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                    <Sparkles className="h-4 w-4" />
                  </button>
                </div>
              </form>

              {/* Quick action chips */}
              <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide justify-center md:justify-start">
                {QUICK_CHIPS.map(({ emoji, labelKey, href }) => (
                  <Link key={href} href={href}
                    className="flex shrink-0 items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-all hover:border-primary/30 hover:text-primary active:scale-95">
                    <span>{emoji}</span>
                    {tx(labelKey, lang) || (isTr ? "Araç" : "Tool")}
                  </Link>
                ))}
              </div>

              {/* CTA */}
              <div className="mt-5 flex flex-col gap-2 sm:flex-row md:mt-6">
                <Link href="/auth/login"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors">
                  {tx("nav.getStarted", lang)} <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/health-assistant"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border px-6 py-3 text-sm font-medium hover:bg-muted">
                  <MessageCircle className="h-4 w-4" /> {tx("lp.tryAssistant", lang)}
                </Link>
              </div>
            </div>

            {/* Illustration */}
            <div className="hidden w-56 shrink-0 sm:block sm:w-72 md:w-80 animate-gentle-sway">
              <BotanicalHero className="h-auto w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="border-y bg-primary/5">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-4 gap-y-3 px-4 py-5 sm:gap-x-8">
          {[
            { icon: "🔬", label: "PubMed Verified" },
            { icon: "🏥", label: "FHIR Compatible" },
            { icon: "🔒", label: "HIPAA & KVKK Compliant" },
            { icon: "🤖", label: "Powered by Claude AI" },
            { icon: "📱", label: "166+ Health Tools" },
          ].map((t) => (
            <div key={t.label} className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
              <span>{t.icon}</span> {t.label}
            </div>
          ))}
        </div>
      </section>

      {/* Feature Showcase */}
      <section className="mx-auto max-w-5xl px-4 py-10 md:py-16">
        <h2 className="font-heading text-xl font-semibold text-center mb-2 sm:text-2xl">
          {isTr ? "Neler Yapabilirsin?" : "What Can You Do?"}
        </h2>
        <p className="text-center text-sm text-muted-foreground mb-8 max-w-lg mx-auto">
          {isTr ? "Sağlığını bilimle yönet" : "Manage your health with science"}
        </p>

        {/* Core Features — Highlighted */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
          {[
            { icon: <Stethoscope className="h-7 w-7 text-primary" />, title: isTr ? "AI Semptom Triyajı" : "AI Symptom Triage", desc: isTr ? "Şikayetlerinizi yapılandırılmış bir klinik tabloya dönüştürür ve aciliyet seviyesini belirler." : "Converts your complaints into a structured clinical picture and determines urgency level.", href: "/health-assistant", gradient: "from-primary/5 to-emerald-50 dark:from-primary/10 dark:to-emerald-950/20", border: "border-primary/20 dark:border-primary/30" },
            { icon: <Pill className="h-7 w-7 text-red-500" />, title: isTr ? "İlaç Etkileşim Kontrolü" : "Drug Interaction Check", desc: isTr ? "Reçeteli ilaçlar ve takviyeler arasındaki riskli kombinasyonları anında tespit eder." : "Instantly detects risky combinations between prescription drugs and supplements.", href: "/interaction-checker", gradient: "from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20", border: "border-red-100 dark:border-red-900/30" },
            { icon: <Leaf className="h-7 w-7 text-emerald-500" />, title: isTr ? "Fitoterapi AI" : "Phytotherapy AI", desc: isTr ? "Bitkisel destekleri modern tıp veritabanlarıyla çapraz kontrol ederek güvenli öneriler sunar." : "Cross-checks herbal supplements with modern medical databases to provide safe recommendations.", href: "/health-assistant", gradient: "from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20", border: "border-emerald-100 dark:border-emerald-900/30" },
            { icon: <Microscope className="h-7 w-7 text-blue-500" />, title: isTr ? "Laboratuvar Analizi" : "Lab Analysis", desc: isTr ? "Kan tahlili sonuçlarınızı yapay zeka ile yorumlar ve anlaşılır içgörülere dönüştürür." : "Interprets your blood test results with AI and turns them into understandable insights.", href: "/blood-test", gradient: "from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20", border: "border-blue-100 dark:border-blue-900/30" },
          ].map((f) => (
            <Link key={f.href + f.title} href={f.href}
              className={`group rounded-2xl border-2 ${f.border} bg-gradient-to-br ${f.gradient} p-7 transition-all hover:shadow-soft-lg hover:-translate-y-0.5`}>
              <span className="block mb-3">{f.icon}</span>
              <h3 className="font-bold text-base mb-1.5">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </Link>
          ))}
        </div>

        {/* Other Features */}
        <h3 className="text-center text-sm font-semibold text-muted-foreground mb-4">
          {isTr ? "Daha Fazlası" : "And More"}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { emoji: "💊", title: isTr ? "İlaç Etkileşim Kalkanı" : "Drug Interaction Shield", desc: isTr ? "50.000+ ilaç-bitki etkileşimini saniyeler içinde kontrol et" : "Check 50,000+ drug-herb interactions in seconds", href: "/interaction-checker", gradient: "from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20", border: "border-red-100 dark:border-red-900/30" },
            { emoji: "🩸", title: isTr ? "AI Laboratuvar Analizi" : "AI Lab Analysis", desc: isTr ? "Kan tahlili PDF'ini yükle, anında görsel sağlık haritası al" : "Upload your blood test PDF, get instant visual health map", href: "/blood-test", gradient: "from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20", border: "border-rose-100 dark:border-rose-900/30" },
            { emoji: "🌿", title: isTr ? "Fitoterapi Protokolleri" : "Phytotherapy Protocols", desc: isTr ? "PubMed alıntılı kanıta dayalı bitkisel tıp" : "Evidence-based herbal medicine with PubMed citations", href: "/health-assistant", gradient: "from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20", border: "border-emerald-100 dark:border-emerald-900/30" },
            { emoji: "👨‍⚕️", title: isTr ? "Doktor Klinik Yardımcısı" : "Doctor's Clinical Copilot", desc: isTr ? "AI destekli triyaj, reçete asistanı ve hasta analitiği" : "AI-powered triage, prescribing assistant, and patient analytics", href: "/doctor-panel", gradient: "from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20", border: "border-blue-100 dark:border-blue-900/30" },
          ].map((f) => (
            <Link key={f.href} href={f.href}
              className={`group rounded-2xl border ${f.border} bg-gradient-to-br ${f.gradient} p-6 transition-all hover:shadow-soft-lg hover:-translate-y-0.5`}>
              <span className="text-3xl block mb-3">{f.emoji}</span>
              <h3 className="font-bold text-sm mb-1">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </Link>
          ))}
        </div>

        {/* Competitive Advantage — "Why DoctoPal?" */}
        <div className="mt-12 rounded-2xl border bg-gradient-to-br from-stone-50 to-primary/5 dark:from-stone-900 dark:to-primary/10 p-6 md:p-8">
          <h3 className="text-lg font-bold text-center mb-1">
            {isTr ? "Neden DoctoPal?" : "Why DoctoPal?"}
          </h3>
          <p className="text-sm font-medium text-primary text-center mb-2">
            {isTr ? "5 katmanlı güvenlik altyapımız her AI yanıtını klinik kurallara göre denetler." : "Our 5-layer safety infrastructure audits every AI response against clinical rules."}
          </p>
          <p className="text-xs text-muted-foreground text-center mb-6 max-w-lg mx-auto">
            {isTr
              ? "Türkiye'nin ilk ilaç-bitki etkileşim veritabanıyla desteklenmektedir. İlaç takibi, alerji yönetimi ve BMI analizi — hepsi yapay zeka ile güçlendirilmiş."
              : "Powered by Turkey's first drug-herb interaction database. Medication tracking, allergy management, and BMI analysis — all enhanced with AI."}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { feature: isTr ? "AI Semptom Triyajı" : "AI Symptom Triage", isNew: false },
              { feature: isTr ? "İlaç Etkileşimi" : "Drug Interaction Shield", isNew: true },
              { feature: isTr ? "Fitoterapi AI" : "Phytotherapy AI", isNew: true },
              { feature: isTr ? "Tahmini Etkinlik" : "Predictive Effectiveness", isNew: true },
              { feature: isTr ? "Laboratuvar Analizi" : "Lab Report Analysis", isNew: true },
              { feature: isTr ? "Doktor Hazırlık Raporu" : "Doctor Pre-Visit Report", isNew: false },
              { feature: isTr ? "Günlük Sağlık Takibi" : "Daily Health Tracking", isNew: true },
              { feature: isTr ? "Alışkanlık Serisi" : "Habit Streaks & Heat Maps", isNew: true },
              { feature: isTr ? "İlaç Takibi" : "Medication Tracker", isNew: false },
              { feature: isTr ? "Alerji Takibi" : "Allergy Tracker", isNew: false },
              { feature: isTr ? "Aile Profilleri" : "Family Profiles", isNew: true },
              { feature: isTr ? "Toparlanma Skoru" : "Recovery Score (Free)", isNew: true },
              { feature: isTr ? "Biyolojik Bütçe" : "Biological Budget", isNew: true },
              { feature: isTr ? "AI Korelasyon" : "AI Health Correlations", isNew: true },
              { feature: isTr ? "Kişisel Deneyler" : "Personal A/B Experiments", isNew: true },
              { feature: isTr ? "BMI & Vücut Analizi" : "BMI & Body Analysis", isNew: false },
              { feature: isTr ? "Donanım Gerekmez" : "No Hardware Required", isNew: false },
            ].map((item) => (
              <div key={item.feature} className={`flex items-center gap-1.5 rounded-lg bg-white/80 dark:bg-card/80 px-2.5 py-2 text-[11px] font-medium border shadow-sm ${item.isNew ? "ring-1 ring-emerald-200 dark:ring-emerald-800" : ""}`}>
                <span className="text-emerald-500 shrink-0">✅</span>
                <span className="truncate">{item.feature}</span>
                {item.isNew && <span className="text-[8px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 rounded px-1 font-bold shrink-0">NEW</span>}
              </div>
            ))}
          </div>
          <p className="text-[9px] text-muted-foreground text-center mt-3">
            {isTr ? "* Tüm AI yanıtları 5 katmanlı güvenlik altyapısından geçer" : "* All AI responses pass through a 5-layer clinical safety pipeline"}
          </p>
        </div>

        {/* Stats */}
        <div className="mt-10 flex justify-center gap-8 sm:gap-12 flex-wrap">
          {[
            { num: "166+", label: isTr ? "Sağlık Aracı" : "Health Tools" },
            { num: "348+", label: isTr ? "Sayfa" : "Pages" },
            { num: "75+",  label: isTr ? "AI Destekli Rota" : "AI-Powered Routes" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-bold text-primary sm:text-3xl">{s.num}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-4 mb-10 rounded-2xl bg-gradient-to-r from-primary/10 to-teal-500/10 p-8 text-center border border-primary/10 md:mx-auto md:max-w-4xl">
        <h2 className="font-heading text-xl font-semibold sm:text-2xl">
          {isTr ? "Sağlık Yolculuğuna Bugün Başla" : "Start Your Health Journey Today"}
        </h2>
        <p className="text-sm text-muted-foreground mt-2 mb-5 max-w-md mx-auto">
          {isTr ? "Ücretsiz kaydol, kredi kartı gerekmez." : "Sign up free — no credit card required."}
        </p>
        <Link href="/auth/login"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
          {isTr ? "Ücretsiz Başla" : "Get Started Free"} <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-4xl px-4 py-10">
        <h2 className="font-heading text-2xl font-semibold text-center mb-6">{tx("common.faqTitle", lang)}</h2>
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <details key={i} className="group rounded-xl border bg-card p-4">
              <summary className="cursor-pointer font-medium text-sm list-none flex items-center justify-between">
                {isTr ? item.questionTr : item.questionEn}
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {isTr ? item.answerTr : item.answerEn}
              </p>
            </details>
          ))}
        </div>
      </section>

      <p className="text-center text-[10px] text-muted-foreground/70 px-4 pb-4">
        {tx("disclaimer.banner", lang)}
      </p>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "WebApplication",
        name: "DoctoPal", url: "https://doctopal.com",
        description: "AI-powered evidence-based integrative medicine assistant.",
        applicationCategory: "HealthApplication", operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "FAQPage",
        mainEntity: FAQ_ITEMS.map((item) => ({
          "@type": "Question", name: item.questionEn,
          acceptedAnswer: { "@type": "Answer", text: item.answerEn },
        })),
      }) }} />
    </div>
  );
}
