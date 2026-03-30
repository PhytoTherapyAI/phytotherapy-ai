"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Clock, Pill, Sun, Moon, Sunrise, Sunset, Coffee, UtensilsCrossed,
  AlertTriangle, CheckCircle2, Bell, BellRing, ChevronDown, ChevronUp,
  ArrowRight, Info, Loader2, ShieldCheck, CalendarClock, Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx, type Lang } from "@/lib/translations";
import { createBrowserClient } from "@/lib/supabase";
import Link from "next/link";
import type { UserMedication } from "@/lib/database.types";

// ── Drug Timing Rules Database ──────────────────────
type StomachRule = "empty" | "with_food" | "any";
type BestTime = "morning" | "evening" | "with_meals" | "bedtime" | "any" | "morning_empty";

interface DrugTimingRule {
  stomach: StomachRule;
  bestTime: BestTime;
  hoursBeforeFood?: number;
  hoursAfterFood?: number;
  hoursAfterCalcium?: number;
  hoursAfterIron?: number;
  specialNote?: { en: string; tr: string };
  timing?: { en: string; tr: string };
  enhancedBy?: string;
  mealRelation: "before" | "with" | "after" | "independent";
  hoursApart?: Record<string, number>;
}

const DRUG_TIMING_RULES: Record<string, DrugTimingRule> = {
  levothyroxine: {
    stomach: "empty", bestTime: "morning_empty", hoursBeforeFood: 1, hoursAfterCalcium: 4, hoursAfterIron: 4,
    mealRelation: "before",
    hoursApart: { Calcium: 4, Iron: 4, PPI: 4, Antacids: 4 },
    timing: { en: "30-60 min before breakfast", tr: "Kahvaltıdan 30-60 dk önce" },
    specialNote: { en: "Take with water only. Avoid calcium/iron supplements within 4 hours.", tr: "Sadece su ile alın. Kalsiyum/demir takviyelerinden 4 saat uzak tutun." },
  },
  metformin: {
    stomach: "with_food", bestTime: "with_meals", mealRelation: "with",
    timing: { en: "With meals to reduce GI side effects", tr: "Mide yan etkilerini azaltmak için yemekle birlikte" },
    specialNote: { en: "Extended-release: take with evening meal.", tr: "Uzun salımlı: akşam yemeği ile alın." },
  },
  omeprazole: {
    stomach: "empty", bestTime: "morning", hoursBeforeFood: 0.5, mealRelation: "before",
    hoursApart: { Clopidogrel: 12 },
    timing: { en: "30 min before first meal", tr: "İlk öğünden 30 dk önce" },
  },
  pantoprazole: {
    stomach: "empty", bestTime: "morning", hoursBeforeFood: 0.5, mealRelation: "before",
    timing: { en: "30 min before breakfast", tr: "Kahvaltıdan 30 dk önce" },
  },
  lansoprazole: {
    stomach: "empty", bestTime: "morning", hoursBeforeFood: 0.5, mealRelation: "before",
    timing: { en: "30 min before breakfast", tr: "Kahvaltıdan 30 dk önce" },
  },
  amlodipine: {
    stomach: "any", bestTime: "evening", mealRelation: "independent",
    timing: { en: "Same time daily, evening preferred", tr: "Her gün aynı saatte, akşam tercih edilir" },
  },
  atorvastatin: {
    stomach: "any", bestTime: "evening", mealRelation: "independent",
    timing: { en: "Evening for optimal cholesterol synthesis inhibition", tr: "Kolesterol sentez inhibisyonu için akşam" },
  },
  rosuvastatin: {
    stomach: "any", bestTime: "any", mealRelation: "independent",
    timing: { en: "Any time of day, consistent timing", tr: "Günün herhangi bir saati, tutarlı zamanlama" },
  },
  simvastatin: {
    stomach: "any", bestTime: "evening", mealRelation: "independent",
    timing: { en: "Evening dose is important for this statin", tr: "Bu statin için akşam dozu önemlidir" },
  },
  lisinopril: {
    stomach: "any", bestTime: "morning", mealRelation: "independent",
    hoursApart: { Potassium: 0, NSAIDs: 0 },
    timing: { en: "Morning, same time daily", tr: "Sabah, her gün aynı saatte" },
  },
  ramipril: {
    stomach: "any", bestTime: "morning", mealRelation: "independent",
    timing: { en: "Morning, same time daily", tr: "Sabah, her gün aynı saatte" },
  },
  aspirin: {
    stomach: "with_food", bestTime: "morning", mealRelation: "with",
    hoursApart: { Ibuprofen: 2 },
    timing: { en: "With breakfast to reduce stomach irritation", tr: "Mide tahrişi azaltmak için kahvaltı ile" },
  },
  warfarin: {
    stomach: "any", bestTime: "evening", mealRelation: "independent",
    timing: { en: "Same time daily (evening). Consistent vitamin K intake.", tr: "Her gün aynı saatte (akşam). Tutarlı K vitamini alımı." },
    specialNote: { en: "Avoid large changes in green leafy vegetable intake.", tr: "Yeşil yapraklı sebze tüketiminde büyük değişikliklerden kaçının." },
  },
  iron: {
    stomach: "empty", bestTime: "morning", hoursAfterCalcium: 2, mealRelation: "before",
    hoursApart: { Calcium: 2, Levothyroxine: 4, Antacids: 2, Tetracycline: 2 },
    enhancedBy: "vitamin_c",
    timing: { en: "On empty stomach, 1h before meals. Take with vitamin C.", tr: "Aç karnına, yemekten 1 saat önce. C vitamini ile alın." },
    specialNote: { en: "Avoid tea/coffee/dairy within 2 hours.", tr: "2 saat içinde çay/kahve/süt ürünlerinden kaçının." },
  },
  calcium: {
    stomach: "with_food", bestTime: "with_meals", mealRelation: "with",
    hoursApart: { Iron: 2, Levothyroxine: 4, Bisphosphonates: 2 },
    timing: { en: "With meals for better absorption. Split doses if >500mg.", tr: "Daha iyi emilim için yemekle. 500mg üstüyse dozları bölün." },
  },
  vitamin_d: {
    stomach: "with_food", bestTime: "morning", mealRelation: "with",
    timing: { en: "With a meal containing fat for absorption", tr: "Emilim için yağ içeren bir öğünle birlikte" },
  },
  metoprolol: {
    stomach: "with_food", bestTime: "morning", mealRelation: "with",
    timing: { en: "With or immediately after meals", tr: "Yemekle birlikte veya hemen sonra" },
  },
  losartan: {
    stomach: "any", bestTime: "morning", mealRelation: "independent",
    timing: { en: "Morning, consistent timing", tr: "Sabah, tutarlı zamanlama" },
  },
  gabapentin: {
    stomach: "any", bestTime: "bedtime", mealRelation: "independent",
    timing: { en: "Bedtime (or evenly spaced if 3x daily)", tr: "Yatmadan önce (veya 3x ise eşit aralıkla)" },
  },
  sertraline: {
    stomach: "with_food", bestTime: "morning", mealRelation: "with",
    timing: { en: "Morning with food to reduce nausea", tr: "Bulantıyı azaltmak için sabah yemekle" },
  },
  escitalopram: {
    stomach: "any", bestTime: "morning", mealRelation: "independent",
    timing: { en: "Morning, same time daily", tr: "Sabah, her gün aynı saatte" },
  },
  magnesium: {
    stomach: "any", bestTime: "evening", mealRelation: "independent",
    hoursApart: { Antibiotics: 2, Bisphosphonates: 2 },
    timing: { en: "Evening. Glycinate form best for sleep.", tr: "Akşam. Uyku için glisinit formu en iyi." },
  },
  probiotic: {
    stomach: "empty", bestTime: "morning", mealRelation: "before",
    hoursApart: { Antibiotics: 2 },
    timing: { en: "Before breakfast. Keep 2h apart from antibiotics.", tr: "Kahvaltıdan önce. Antibiyotiklerle 2 saat ara bırakın." },
  },
};

// ── Helpers ──────────────────────────────────
function matchDrugRule(medicationName: string): { key: string; rule: DrugTimingRule } | null {
  const name = (medicationName || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const [key, rule] of Object.entries(DRUG_TIMING_RULES)) {
    if (name.includes(key.replace(/_/g, ""))) return { key, rule };
  }
  return null;
}

function getMealRelationLabel(rel: string, lang: string): string {
  const labels: Record<string, { en: string; tr: string }> = {
    before: { en: "Before food", tr: "Yemekten önce" },
    with: { en: "With food", tr: "Yemekle birlikte" },
    after: { en: "After food", tr: "Yemekten sonra" },
    independent: { en: "Any time", tr: "Herhangi bir zaman" },
  };
  return labels[rel]?.[lang as "en" | "tr"] ?? rel;
}

function getMealRelationColor(rel: string): string {
  const colors: Record<string, string> = {
    before: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    with: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    after: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    independent: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  };
  return colors[rel] ?? colors.independent;
}

function getBestTimeIcon(bestTime: BestTime) {
  switch (bestTime) {
    case "morning": case "morning_empty": return Sun;
    case "evening": return Moon;
    case "bedtime": return Moon;
    case "with_meals": return UtensilsCrossed;
    default: return Clock;
  }
}

function getBestTimeLabel(bestTime: BestTime, lang: string): string {
  const labels: Record<BestTime, { en: string; tr: string }> = {
    morning: { en: "Morning", tr: "Sabah" },
    morning_empty: { en: "Morning (empty stomach)", tr: "Sabah (aç karın)" },
    evening: { en: "Evening", tr: "Akşam" },
    bedtime: { en: "Bedtime", tr: "Yatmadan önce" },
    with_meals: { en: "With meals", tr: "Yemeklerle" },
    any: { en: "Any time", tr: "Herhangi bir zaman" },
  };
  return labels[bestTime]?.[lang as "en" | "tr"] ?? bestTime;
}

function getStomachLabel(stomach: StomachRule, lang: string): string {
  const labels: Record<StomachRule, { en: string; tr: string }> = {
    empty: { en: "Empty stomach", tr: "Aç karın" },
    with_food: { en: "With food", tr: "Yemekle" },
    any: { en: "No restriction", tr: "Kısıtlama yok" },
  };
  return labels[stomach]?.[lang as "en" | "tr"] ?? stomach;
}

interface ScheduleSlot {
  time: string;
  period: string;
  medications: Array<{
    name: string;
    rule: DrugTimingRule | null;
    ruleKey: string | null;
    dosage: string | null;
  }>;
}

function generateSchedule(
  medications: UserMedication[],
  lang: string
): { slots: ScheduleSlot[]; conflicts: string[] } {
  const conflicts: string[] = [];

  const morningEmpty: ScheduleSlot = { time: "06:30", period: tx("medtime.morningEmpty", lang as Lang), medications: [] };
  const beforeBreakfast: ScheduleSlot = { time: "07:00", period: tx("medtime.beforeBreakfast", lang as Lang), medications: [] };
  const withBreakfast: ScheduleSlot = { time: "08:00", period: tx("medtime.withBreakfast", lang as Lang), medications: [] };
  const withLunch: ScheduleSlot = { time: "12:30", period: tx("medtime.withLunch", lang as Lang), medications: [] };
  const afternoon: ScheduleSlot = { time: "15:00", period: tx("medtime.afternoon", lang as Lang), medications: [] };
  const withDinner: ScheduleSlot = { time: "19:00", period: tx("medtime.withDinner", lang as Lang), medications: [] };
  const evening: ScheduleSlot = { time: "21:00", period: tx("medtime.evening", lang as Lang), medications: [] };
  const bedtime: ScheduleSlot = { time: "22:30", period: tx("medtime.bedtime", lang as Lang), medications: [] };

  for (const med of medications) {
    const displayName = med.brand_name || med.generic_name || "Unknown";
    const matched = matchDrugRule(med.generic_name || "") || matchDrugRule(med.brand_name || "");
    const entry = { name: displayName, rule: matched?.rule ?? null, ruleKey: matched?.key ?? null, dosage: med.dosage };

    if (!matched) {
      withBreakfast.medications.push(entry);
      continue;
    }

    const { rule } = matched;
    switch (rule.bestTime) {
      case "morning_empty":
        morningEmpty.medications.push(entry);
        break;
      case "morning":
        if (rule.stomach === "empty") beforeBreakfast.medications.push(entry);
        else if (rule.stomach === "with_food") withBreakfast.medications.push(entry);
        else withBreakfast.medications.push(entry);
        break;
      case "with_meals":
        withBreakfast.medications.push(entry);
        if (med.frequency?.includes("2") || med.frequency?.includes("twice")) withDinner.medications.push(entry);
        if (med.frequency?.includes("3") || med.frequency?.includes("three")) withLunch.medications.push(entry);
        break;
      case "evening":
        if (rule.stomach === "with_food") withDinner.medications.push(entry);
        else evening.medications.push(entry);
        break;
      case "bedtime":
        bedtime.medications.push(entry);
        break;
      default:
        withBreakfast.medications.push(entry);
    }
  }

  // Conflict detection
  const hasIron = medications.some(m => matchDrugRule(m.generic_name || "")?.key === "iron" || matchDrugRule(m.brand_name || "")?.key === "iron");
  const hasLevo = medications.some(m => matchDrugRule(m.generic_name || "")?.key === "levothyroxine" || matchDrugRule(m.brand_name || "")?.key === "levothyroxine");
  const hasCalcium = medications.some(m => matchDrugRule(m.generic_name || "")?.key === "calcium" || matchDrugRule(m.brand_name || "")?.key === "calcium");

  if (hasIron && hasLevo) {
    conflicts.push(tx("medtime.ironLevoConflict", lang as Lang));
  }
  if (hasIron && hasCalcium) {
    conflicts.push(tx("medtime.ironCalciumConflict", lang as Lang));
  }

  const allSlots = [morningEmpty, beforeBreakfast, withBreakfast, withLunch, afternoon, withDinner, evening, bedtime];
  return { slots: allSlots.filter(s => s.medications.length > 0), conflicts };
}

// ── Tab type ────────────────────────────────
type TabId = "schedule" | "timing" | "reminders";

// ── Main Component ───────────────────────────
export default function MedicationHubPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();
  const [medications, setMedications] = useState<UserMedication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSlot, setExpandedSlot] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("schedule");
  const [showNotifSetup, setShowNotifSetup] = useState(false);
  const [selectedTimingDrug, setSelectedTimingDrug] = useState<string | null>(null);

  const tabs: { id: TabId; label: { en: string; tr: string }; icon: typeof Clock }[] = [
    { id: "schedule", label: { en: "Daily Schedule", tr: "Günlük Program" }, icon: CalendarClock },
    { id: "timing", label: { en: "Timing Matrix", tr: "Zamanlama Matrisi" }, icon: Clock },
    { id: "reminders", label: { en: "Reminders", tr: "Hatırlatıcılar" }, icon: Bell },
  ];

  const loadMedications = useCallback(async () => {
    if (!session?.user?.id) return;
    setIsLoading(true);
    try {
      const supabase = createBrowserClient();
      const { data, error } = await supabase
        .from("user_medications")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("is_active", true)
        .order("added_at", { ascending: true });
      if (!error && data) setMedications(data);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => { loadMedications(); }, [loadMedications]);

  const { slots, conflicts } = generateSchedule(medications, lang);

  const now = new Date();
  const currentHour = now.getHours();
  const nextSlot = slots.find(s => {
    const slotHour = parseInt(s.time.split(":")[0]);
    return slotHour >= currentHour;
  });

  // ── Not authenticated ──
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <Pill className="w-16 h-16 text-teal-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
            {tx("medHub.title", lang)}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {tx("medHub.description", lang)}
          </p>
          <Link href="/auth/login">
            <Button className="bg-teal-600 hover:bg-teal-700 text-white">
              {tx("auth.loginToUse", lang)}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-100 dark:bg-teal-900/30 mb-4">
            <Pill className="w-8 h-8 text-teal-600 dark:text-teal-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {tx("medHub.title", lang)}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            {tx("medHub.subtitle", lang)}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 p-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-xl">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-white dark:bg-gray-700 text-teal-600 dark:text-teal-400 shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label[lang as "en" | "tr"]}</span>
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
          </div>
        ) : medications.length === 0 ? (
          <div className="text-center py-16">
            <Pill className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {tx("medHub.noMeds", lang)}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
              {tx("medHub.noMedsDesc", lang)}
            </p>
            <Link href="/profile">
              <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                {tx("medHub.addInProfile", lang)}
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* ═══ TAB 1: Daily Schedule ═══ */}
            {activeTab === "schedule" && (
              <>
                {/* Next Up Card */}
                {nextSlot && (
                  <div className="mb-6 p-5 rounded-2xl border-2 border-teal-200 bg-teal-50/60 dark:border-teal-800 dark:bg-teal-950/30">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-900/50">
                        <ArrowRight className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-teal-600 dark:text-teal-400 uppercase tracking-wide mb-1">
                          {tx("medHub.nextUp", lang)}
                        </p>
                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                          {nextSlot.medications.map(m => m.name).join(", ")}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {nextSlot.period} &mdash; {nextSlot.time}
                        </p>
                        {nextSlot.medications[0]?.rule?.specialNote && (
                          <p className="text-xs text-teal-700 dark:text-teal-300 mt-2 flex items-center gap-1">
                            <Info className="w-3.5 h-3.5 flex-shrink-0" />
                            {nextSlot.medications[0].rule.specialNote[lang as "en" | "tr"]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Conflict Warnings */}
                {conflicts.length > 0 && (
                  <div className="mb-6 space-y-2">
                    {conflicts.map((c, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
                        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                        <span className="text-sm text-amber-800 dark:text-amber-300">{c}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Daily Timeline */}
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-teal-500" />
                    {tx("medHub.dailySchedule", lang)}
                  </h2>

                  <div className="relative space-y-1">
                    <div className="absolute left-[39px] top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-gray-700" />

                    {slots.map((slot, idx) => {
                      const isExpanded = expandedSlot === idx;
                      const isPast = parseInt(slot.time.split(":")[0]) < currentHour;

                      return (
                        <div key={idx} className="relative">
                          <button
                            onClick={() => setExpandedSlot(isExpanded ? null : idx)}
                            className={`w-full text-left flex items-start gap-4 p-3 rounded-xl transition-all ${
                              isPast ? "opacity-60" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                            }`}
                          >
                            <div className={`relative z-10 flex-shrink-0 w-[50px] text-center ${
                              isPast ? "text-gray-400 dark:text-gray-600" : "text-gray-700 dark:text-gray-300"
                            }`}>
                              <span className="text-sm font-mono font-semibold">{slot.time}</span>
                              {isPast && <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto mt-0.5" />}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{slot.period}</span>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {slot.medications.map((med, mIdx) => (
                                  <span key={mIdx} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                                    getMealRelationColor(med.rule?.mealRelation ?? "independent")
                                  }`}>
                                    <Pill className="w-3 h-3" />
                                    {med.name}
                                    {med.dosage && <span className="opacity-70">({med.dosage})</span>}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 mt-1 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                          </button>

                          {isExpanded && (
                            <div className="ml-[66px] mr-3 mb-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 space-y-3">
                              {slot.medications.map((med, mIdx) => {
                                const TimeIcon = med.rule ? getBestTimeIcon(med.rule.bestTime) : Clock;
                                return (
                                  <div key={mIdx} className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                      <TimeIcon className="w-4 h-4 text-teal-500" />
                                      <span className="font-medium text-gray-900 dark:text-white text-sm">{med.name}</span>
                                      {med.rule && (
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${getMealRelationColor(med.rule.mealRelation)}`}>
                                          {getMealRelationLabel(med.rule.mealRelation, lang)}
                                        </span>
                                      )}
                                    </div>
                                    {med.rule?.timing && (
                                      <p className="text-xs text-gray-600 dark:text-gray-400 ml-6">
                                        {med.rule.timing[lang as "en" | "tr"]}
                                      </p>
                                    )}
                                    {med.rule?.specialNote && (
                                      <p className="text-xs text-amber-700 dark:text-amber-400 ml-6 flex items-start gap-1">
                                        <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                        {med.rule.specialNote[lang as "en" | "tr"]}
                                      </p>
                                    )}
                                    {med.rule?.enhancedBy === "vitamin_c" && (
                                      <p className="text-xs text-green-700 dark:text-green-400 ml-6 flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" />
                                        {tx("medHub.vitCAbsorption", lang)}
                                      </p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Color Legend */}
                <div className="mb-8 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    {tx("medHub.colorLegend", lang)}
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {(["before", "with", "after", "independent"] as const).map(rel => (
                      <div key={rel} className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${getMealRelationColor(rel).split(" ")[0]}`} />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {getMealRelationLabel(rel, lang)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ═══ TAB 2: Timing Matrix ═══ */}
            {activeTab === "timing" && (
              <>
                {/* User medications with timing conflicts */}
                {conflicts.length > 0 && (
                  <div className="mb-6 space-y-2">
                    {conflicts.map((c, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
                        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                        <span className="text-sm text-amber-800 dark:text-amber-300">{c}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Your Medications Timing */}
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-teal-500" />
                    {tx("medHub.timingGuide", lang)}
                  </h2>
                  <div className="space-y-3">
                    {medications.map((med) => {
                      const matched = matchDrugRule(med.generic_name || "") || matchDrugRule(med.brand_name || "");
                      const displayName = med.brand_name || med.generic_name || "Unknown";
                      const TimeIcon = matched ? getBestTimeIcon(matched.rule.bestTime) : Clock;

                      return (
                        <div key={med.id} className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-3 mb-2">
                            <TimeIcon className="w-5 h-5 text-teal-500" />
                            <h3 className="font-semibold text-gray-900 dark:text-white">{displayName}</h3>
                            {med.dosage && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">({med.dosage})</span>
                            )}
                          </div>
                          {matched ? (
                            <div className="ml-8 space-y-1.5">
                              <div className="flex flex-wrap gap-2">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${getMealRelationColor(matched.rule.mealRelation)}`}>
                                  {getMealRelationLabel(matched.rule.mealRelation, lang)}
                                </span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
                                  {getBestTimeLabel(matched.rule.bestTime, lang)}
                                </span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                                  {getStomachLabel(matched.rule.stomach, lang)}
                                </span>
                              </div>
                              {matched.rule.timing && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {matched.rule.timing[lang as "en" | "tr"]}
                                </p>
                              )}
                              {matched.rule.hoursApart && Object.keys(matched.rule.hoursApart).length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {Object.entries(matched.rule.hoursApart).map(([drug, hours]) => (
                                    <span key={drug} className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                                      {hours > 0
                                        ? `${drug}: ${hours}${tx("medtime.hoursApart", lang)}`
                                        : `${drug}: ${tx("medtime.caution", lang)}`}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {matched.rule.specialNote && (
                                <p className="text-xs text-amber-700 dark:text-amber-400 flex items-start gap-1">
                                  <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                  {matched.rule.specialNote[lang as "en" | "tr"]}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="ml-8 text-sm text-gray-400 dark:text-gray-500 italic">
                              {tx("medHub.noTimingRule", lang)}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Full Database Reference */}
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Timer className="w-5 h-5 text-teal-500" />
                    {tx("medHub.timingDatabase", lang)}
                  </h2>
                  <div className="space-y-2">
                    {Object.entries(DRUG_TIMING_RULES).map(([key, rule]) => {
                      const isExpanded = selectedTimingDrug === key;
                      const TimeIcon = getBestTimeIcon(rule.bestTime);
                      return (
                        <div key={key} className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden">
                          <button
                            onClick={() => setSelectedTimingDrug(isExpanded ? null : key)}
                            className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors"
                          >
                            <TimeIcon className="w-4 h-4 text-teal-500" />
                            <span className="font-medium text-sm text-gray-900 dark:text-white capitalize flex-1">{key.replace(/_/g, " ")}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getMealRelationColor(rule.mealRelation)}`}>
                              {getMealRelationLabel(rule.mealRelation, lang)}
                            </span>
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                          </button>
                          {isExpanded && (
                            <div className="px-3 pb-3 ml-7 space-y-1.5 border-t border-gray-100 dark:border-gray-700 pt-2">
                              <div className="flex flex-wrap gap-2">
                                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
                                  {getBestTimeLabel(rule.bestTime, lang)}
                                </span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                                  {getStomachLabel(rule.stomach, lang)}
                                </span>
                              </div>
                              {rule.timing && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">{rule.timing[lang as "en" | "tr"]}</p>
                              )}
                              {rule.hoursApart && Object.keys(rule.hoursApart).length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {Object.entries(rule.hoursApart).map(([drug, hours]) => (
                                    <span key={drug} className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                                      {hours > 0 ? `${drug}: ${hours}h` : `${drug}: caution`}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {rule.specialNote && (
                                <p className="text-xs text-amber-700 dark:text-amber-400 flex items-start gap-1">
                                  <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                  {rule.specialNote[lang as "en" | "tr"]}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* ═══ TAB 3: Reminders ═══ */}
            {activeTab === "reminders" && (
              <>
                <div className="mb-8">
                  <button
                    onClick={() => setShowNotifSetup(!showNotifSetup)}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <BellRing className="w-5 h-5 text-teal-500" />
                      <div className="text-left">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {tx("medHub.notifSettings", lang)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {tx("medHub.notifSettingsDesc", lang)}
                        </p>
                      </div>
                    </div>
                    {showNotifSetup ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>

                  {showNotifSetup && (
                    <div className="mt-2 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 space-y-3">
                      {slots.flatMap(s => s.medications).map((med, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <Pill className="w-4 h-4 text-teal-500 flex-shrink-0" />
                            <span className="text-sm text-gray-800 dark:text-gray-200 truncate">{med.name}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <input
                              type="time"
                              defaultValue={slots.find(s => s.medications.includes(med))?.time ?? "08:00"}
                              className="px-2 py-1 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" defaultChecked className="sr-only peer" />
                              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-teal-500" />
                            </label>
                          </div>
                        </div>
                      ))}
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        {tx("medHub.pushNotifNote", lang)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Schedule Summary for Reminders */}
                <div className="mb-8 space-y-3">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-teal-500" />
                    {tx("medHub.reminderSchedule", lang)}
                  </h2>
                  {slots.map((slot, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <div className="text-center w-14 flex-shrink-0">
                        <span className="text-sm font-mono font-semibold text-gray-700 dark:text-gray-300">{slot.time}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{slot.period}</p>
                        <div className="flex flex-wrap gap-1">
                          {slot.medications.map((med, mIdx) => (
                            <span key={mIdx} className="text-xs px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
                              {med.name}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Bell className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Disclaimer (all tabs) */}
            <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {tx("medHub.disclaimer", lang)}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
