// © 2026 Doctopal — All Rights Reserved
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
import { createBrowserClient } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { AddSupplementDialog } from "@/components/calendar/AddSupplementDialog";
import { TOOL_CATEGORIES } from "@/lib/tools-hierarchy";

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
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
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
function TaskItem({ emoji, label, done, onClick }: { emoji: string; label: string; done: boolean; onClick: () => void }) {
  return (
    <motion.button onClick={onClick} className="flex items-center gap-2 py-1.5 group w-full text-left"
      whileTap={{ scale: 0.97 }}>
      <motion.div
        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${done ? "bg-primary border-primary" : "border-stone-300 dark:border-stone-600"}`}
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
      <span className={`text-sm transition-all ${done ? "line-through text-muted-foreground/50" : "text-foreground"}`}>{label}</span>
      {done && (
        <motion.span initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
          className="ml-auto text-xs">✨</motion.span>
      )}
    </motion.button>
  );
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

  const [tasks, setTasks] = useState([
    { id: "med",   emoji: "💊", labelEn: "Medications 0/1",   labelTr: "İlaçlar 0/1",     done: false },
    { id: "water", emoji: "💧", labelEn: "Water 0/8 glasses", labelTr: "Su 0/8 bardak",   done: false },
    { id: "sup",   emoji: "🌿", labelEn: "Supplements",       labelTr: "Takviyeler",       done: false },
    { id: "walk",  emoji: "🚶", labelEn: "10 min walk",       labelTr: "10 dk yürüyüş",   done: false },
  ]);
  const [streak] = useState(3);

  const toggleTask = (id: string) => setTasks((prev) => prev.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  const completedCount = tasks.filter((t) => t.done).length;
  const scorePercent   = Math.round((completedCount / tasks.length) * 100);

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
    if (query.trim()) router.push(`/chat?q=${encodeURIComponent(query.trim())}`);
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
        {/* Hackathon Demo Banner */}
        <DemoBanner lang={lang} />

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
                    <InfoTooltip title="Your Health Hub" description="Ask anything via the search bar. Your daily snapshot shows key health metrics at a glance." />
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    {isTr ? "Günlük görevlerini tamamla, skorunu yükselt!" : "Complete your daily tasks, boost your score!"}
                  </p>
                  <div className="space-y-0.5">
                    {tasks.map((t) => (
                      <TaskItem key={t.id} emoji={t.emoji} label={isTr ? t.labelTr : t.labelEn}
                        done={t.done} onClick={() => toggleTask(t.id)} />
                    ))}
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                    <motion.div className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
                      initial={{ width: 0 }} animate={{ width: `${scorePercent}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" as const }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {completedCount}/{tasks.length} {isTr ? "tamamlandı" : "completed"}
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
                    <button onClick={handleAskAI}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 flex items-center justify-center rounded-lg bg-primary hover:bg-primary/80 transition-colors">
                      <Send className="h-3.5 w-3.5 text-white" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {[
                      { emoji: "💊", text: isTr ? "İlaç etkileşimi" : "Drug interaction" },
                      { emoji: "🩸", text: isTr ? "Tahlil yorumla" : "Analyze blood test" },
                    ].map((chip, i) => (
                      <button key={i} onClick={() => { setQuery(chip.text); inputRef.current?.focus(); }}
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
              <BossFightCard userId={user.id} lang={lang} isPremium={isPremium} />
            </div>
            <div className="space-y-6">
              <BiologicalAgeCard userId={user.id} lang={lang} isPremium={isPremium}
                chronologicalAge={chronologicalAge} userName={profile.full_name ?? undefined} />
              <MetabolicPortfolio lang={lang} isPremium={isPremium} checkInData={checkInData} />
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
                          <span className="text-[10px] text-muted-foreground">{cat.modules.length} {tx("common.tools", lang)}</span>
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
                          {cat.modules.map((mod) => (
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
                  <>Kanıt Doğayla Buluşur.<br /><span style={{ color: "var(--brand)" }}>Yapay Zeka Seninle.</span></>
                ) : (
                  <>Evidence Meets Nature.<br /><span style={{ color: "var(--brand)" }}>AI Meets You.</span></>
                )}
              </h1>
              <p className="mt-3 max-w-lg text-xs text-muted-foreground sm:text-sm md:text-base">
                {isTr
                  ? "DoctoPal, modern tıp ile doğal iyileşmeyi birleştirir — ilaç etkileşimleri, fitoterapi protokolleri ve kişiselleştirilmiş sağlık bilgileri, bilim tarafından doğrulanmış."
                  : "DoctoPal bridges modern medicine and natural healing — drug interactions, phytotherapy protocols, and personalized health insights, all verified by science."}
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
                  <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
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

        {/* Stats */}
        <div className="mt-10 flex justify-center gap-8 sm:gap-12 flex-wrap">
          {[
            { num: "166+", label: isTr ? "Sağlık Aracı" : "Health Tools" },
            { num: "330+", label: isTr ? "Sayfa" : "Pages" },
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

      <p className="text-center text-[10px] text-muted-foreground/40 px-4 pb-4">
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
