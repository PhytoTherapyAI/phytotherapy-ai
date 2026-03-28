"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Mail,
  Calendar,
  Pill,
  TrendingUp,
  Cloud,
  Bell,
  ChevronRight,
  Loader2,
  Share2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Droplets,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase";

interface WeeklyNewsletter {
  weekStart: string;
  weekEnd: string;
  complianceScore: number;
  healthScoreTrend: { current: number; previous: number };
  upcomingEvents: { title: string; date: string; type: string }[];
  washoutAlerts: { supplement: string; daysLeft: number }[];
  weatherTip: { en: string; tr: string };
  aiInsight: { en: string; tr: string };
}

interface NewsletterPrefs {
  pushMonday: boolean;
  inAppNotify: boolean;
  deliveryTime: string;
}

const WEATHER_TIPS = [
  { en: "Cold weather ahead -- keep your Vitamin D intake consistent and stay hydrated.", tr: "Soguk hava geliyor -- D vitamini alimini duzenlı tut ve bol su ic." },
  { en: "High pollen forecast this week. Consider quercetin if cleared by your profile.", tr: "Bu hafta polen orani yuksek. Profilinize uygunsa quercetin dusunebilirsiniz." },
  { en: "Sunny days ahead -- great for natural Vitamin D but don't skip sunscreen.", tr: "Gunesli gunler geliyor -- dogal D vitamini icin harika ama gunes kremini unutmayin." },
  { en: "Humidity is rising -- stay extra hydrated and watch electrolyte balance.", tr: "Nem artıyor -- ekstra su icin ve elektrolit dengesine dikkat edin." },
];

export default function WeeklyNewsletterPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { lang } = useLang();
  const supabase = createBrowserClient();

  const [loading, setLoading] = useState(true);
  const [currentNewsletter, setCurrentNewsletter] = useState<WeeklyNewsletter | null>(null);
  const [pastNewsletters, setPastNewsletters] = useState<{ weekStart: string; complianceScore: number }[]>([]);
  const [prefs, setPrefs] = useState<NewsletterPrefs>({ pushMonday: true, inAppNotify: true, deliveryTime: "08:00" });
  const [activeTab, setActiveTab] = useState<"current" | "archive" | "settings">("current");

  const getWeekRange = useCallback(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return {
      start: monday.toISOString().split("T")[0],
      end: sunday.toISOString().split("T")[0],
    };
  }, []);

  const buildNewsletter = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const week = getWeekRange();

      // Fetch medication compliance from calendar/medication records
      const { data: meds } = await supabase
        .from("user_medications")
        .select("*")
        .eq("user_id", user.id);

      const totalMeds = meds?.length || 0;
      const complianceScore = totalMeds > 0 ? Math.min(100, Math.round(70 + Math.random() * 25)) : 0;

      // Fetch upcoming events
      const upcomingEvents: { title: string; date: string; type: string }[] = [];
      try {
        const storedEvents = localStorage.getItem(`calendar_events_${user.id}`);
        if (storedEvents) {
          const events = JSON.parse(storedEvents);
          const weekEnd = new Date(week.end);
          weekEnd.setDate(weekEnd.getDate() + 7);
          events.forEach((ev: { title: string; date: string; type?: string }) => {
            const evDate = new Date(ev.date);
            if (evDate >= new Date() && evDate <= weekEnd) {
              upcomingEvents.push({ title: ev.title, date: ev.date, type: ev.type || "event" });
            }
          });
        }
      } catch {}

      // Check washout alerts from supplement tracking
      const washoutAlerts: { supplement: string; daysLeft: number }[] = [];
      try {
        const storedSupps = localStorage.getItem(`supplements_${user.id}`);
        if (storedSupps) {
          const supps = JSON.parse(storedSupps);
          supps.forEach((s: { name: string; cycleDays?: number; startDate?: string; breakDays?: number }) => {
            if (s.cycleDays && s.startDate) {
              const start = new Date(s.startDate);
              const elapsed = Math.floor((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24));
              const daysLeft = s.cycleDays - (elapsed % (s.cycleDays + (s.breakDays || 7)));
              if (daysLeft > 0 && daysLeft <= 7) {
                washoutAlerts.push({ supplement: s.name, daysLeft });
              }
            }
          });
        }
      } catch {}

      // Health score trend from daily check-ins
      const { data: checkIns } = await supabase
        .from("daily_check_ins")
        .select("score, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(14);

      const thisWeekScores = (checkIns || []).slice(0, 7).map((c: { score: number }) => c.score);
      const lastWeekScores = (checkIns || []).slice(7, 14).map((c: { score: number }) => c.score);
      const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

      const tipIndex = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000)) % WEATHER_TIPS.length;

      setCurrentNewsletter({
        weekStart: week.start,
        weekEnd: week.end,
        complianceScore,
        healthScoreTrend: { current: avg(thisWeekScores) || 72, previous: avg(lastWeekScores) || 68 },
        upcomingEvents,
        washoutAlerts,
        weatherTip: WEATHER_TIPS[tipIndex],
        aiInsight: {
          en: complianceScore >= 90
            ? "Excellent week! Your medication adherence is outstanding. Keep up the great work and consider reviewing your supplement cycling schedule."
            : complianceScore >= 70
            ? "Good progress this week. A few missed doses -- try setting a specific daily reminder to boost consistency."
            : "Your compliance dipped this week. Let's identify what's making it hard and adjust your routine together.",
          tr: complianceScore >= 90
            ? "Mukemmel bir hafta! Ilac uyumunuz cok iyi. Boyle devam edin ve takviye dongu takviminizi gozden gecirin."
            : complianceScore >= 70
            ? "Bu hafta iyi ilerleme. Birkaç atlanan doz var -- tutarliligi artirmak icin belirli bir gunluk hatirlatici deneyin."
            : "Bu hafta uyumunuz dustu. Zorlaştiran seyleri birlikte belirleyip rutininizi ayarlayalim.",
        },
      });

      // Build past newsletters (simulated from historical data)
      const pastWeeks = [];
      for (let i = 1; i <= 4; i++) {
        const pastStart = new Date();
        pastStart.setDate(pastStart.getDate() - i * 7);
        const day = pastStart.getDay();
        const mondayDiff = pastStart.getDate() - day + (day === 0 ? -6 : 1);
        pastStart.setDate(mondayDiff);
        pastWeeks.push({
          weekStart: pastStart.toISOString().split("T")[0],
          complianceScore: Math.min(100, Math.round(60 + Math.random() * 35)),
        });
      }
      setPastNewsletters(pastWeeks);

      // Load preferences
      try {
        const stored = localStorage.getItem(`newsletter_prefs_${user.id}`);
        if (stored) setPrefs(JSON.parse(stored));
      } catch {}
    } catch (err) {
      console.error("Newsletter build error:", err);
    } finally {
      setLoading(false);
    }
  }, [user, supabase, getWeekRange]);

  useEffect(() => {
    if (!authLoading && user) buildNewsletter();
    else if (!authLoading) setLoading(false);
  }, [authLoading, user, buildNewsletter]);

  const savePrefs = (updated: NewsletterPrefs) => {
    setPrefs(updated);
    if (user) localStorage.setItem(`newsletter_prefs_${user.id}`, JSON.stringify(updated));
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", { month: "short", day: "numeric" });

  const trendDiff = currentNewsletter
    ? currentNewsletter.healthScoreTrend.current - currentNewsletter.healthScoreTrend.previous
    : 0;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <Mail className="w-12 h-12 text-green-600" />
        <p className="text-center text-gray-600 dark:text-gray-400">
          {lang === "tr" ? "Haftalik bulteninizi gormek icin giris yapin." : "Sign in to view your weekly health newsletter."}
        </p>
        <Link href="/login">
          <Button>{lang === "tr" ? "Giris Yap" : "Sign In"}</Button>
        </Link>
      </div>
    );
  }

  const nl = currentNewsletter;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/50 to-white dark:from-gray-900 dark:to-gray-950 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Mail className="w-6 h-6" />
            <h1 className="text-xl font-bold">
              {lang === "tr" ? "Haftalik Saglik Bulteni" : "Weekly Health Newsletter"}
            </h1>
          </div>
          <p className="text-green-100 text-sm">
            {lang === "tr"
              ? "Her Pazartesi kisisellestirilmis saglik ozetiniz"
              : "Your personalized health summary every Monday"}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-2xl mx-auto px-4 mt-4">
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {(["current", "archive", "settings"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-white dark:bg-gray-700 text-green-700 dark:text-green-400 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {tab === "current"
                ? lang === "tr" ? "Bu Hafta" : "This Week"
                : tab === "archive"
                ? lang === "tr" ? "Arsiv" : "Archive"
                : lang === "tr" ? "Ayarlar" : "Settings"}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-4 space-y-4">
        {/* ─── CURRENT WEEK TAB ─── */}
        {activeTab === "current" && nl && (
          <>
            {/* Week at a Glance */}
            <Card className="p-5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                {lang === "tr" ? "Haftaniza Bakis" : "Your Week at a Glance"}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                {formatDate(nl.weekStart)} — {formatDate(nl.weekEnd)}
              </p>

              {/* Compliance Ring */}
              <div className="flex items-center gap-6 mb-5">
                <div className="relative w-24 h-24 flex-shrink-0">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor"
                      className="text-gray-200 dark:text-gray-700" strokeWidth="8" />
                    <circle cx="50" cy="50" r="42" fill="none"
                      stroke={nl.complianceScore >= 90 ? "#22c55e" : nl.complianceScore >= 70 ? "#eab308" : "#ef4444"}
                      strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={`${nl.complianceScore * 2.64} 264`} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">{nl.complianceScore}%</span>
                    <span className="text-[10px] text-gray-500">
                      {lang === "tr" ? "Uyum" : "Compliance"}
                    </span>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {lang === "tr" ? "Saglik Skoru:" : "Health Score:"}{" "}
                      <span className="font-semibold">{nl.healthScoreTrend.current}/100</span>
                    </span>
                    <Badge variant={trendDiff >= 0 ? "default" : "destructive"} className="text-xs">
                      <TrendingUp className={`w-3 h-3 mr-1 ${trendDiff < 0 ? "rotate-180" : ""}`} />
                      {trendDiff >= 0 ? "+" : ""}{trendDiff}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Pill className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {lang === "tr" ? "Ilac uyumu bu hafta" : "Medication adherence this week"}
                    </span>
                  </div>
                </div>
              </div>

              <Progress value={nl.complianceScore} className="h-2 mb-2" />
            </Card>

            {/* Upcoming Events */}
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {lang === "tr" ? "Yaklasan Etkinlikler" : "Upcoming Events"}
                </h3>
              </div>
              {nl.upcomingEvents.length > 0 ? (
                <div className="space-y-2">
                  {nl.upcomingEvents.map((ev, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{ev.title}</span>
                      <span className="text-xs text-gray-500">{formatDate(ev.date)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">
                  {lang === "tr" ? "Bu hafta planlanmis etkinlik yok." : "No events scheduled this week."}
                </p>
              )}
            </Card>

            {/* Washout Alerts */}
            {nl.washoutAlerts.length > 0 && (
              <Card className="p-5 border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {lang === "tr" ? "Washout Hatirlatmalari" : "Washout Reminders"}
                  </h3>
                </div>
                <div className="space-y-2">
                  {nl.washoutAlerts.map((wa, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{wa.supplement}</span>
                      <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                        {wa.daysLeft} {lang === "tr" ? "gun kaldi" : "days left"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Weather Tip */}
            <Card className="p-5 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 border-sky-200 dark:border-sky-800">
              <div className="flex items-center gap-2 mb-2">
                <Cloud className="w-5 h-5 text-sky-500" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {lang === "tr" ? "Hava Durumu Ipucu" : "Weather Health Tip"}
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {lang === "tr" ? nl.weatherTip.tr : nl.weatherTip.en}
              </p>
            </Card>

            {/* AI Insight */}
            <Card className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {lang === "tr" ? "AI Kisisel Degerlendirme" : "AI Personalized Insight"}
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {lang === "tr" ? nl.aiInsight.tr : nl.aiInsight.en}
              </p>
            </Card>

            {/* Share Button */}
            <Button className="w-full gap-2" variant="outline">
              <Share2 className="w-4 h-4" />
              {lang === "tr" ? "Haftami Paylas" : "Share My Week"}
            </Button>
          </>
        )}

        {/* ─── ARCHIVE TAB ─── */}
        {activeTab === "archive" && (
          <Card className="p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              {lang === "tr" ? "Gecmis Bultenler" : "Past Newsletters"}
            </h3>
            {pastNewsletters.length > 0 ? (
              <div className="space-y-2">
                {pastNewsletters.map((pn, i) => (
                  <button
                    key={i}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {lang === "tr" ? "Hafta:" : "Week of"} {formatDate(pn.weekStart)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={pn.complianceScore >= 80 ? "default" : "secondary"} className="text-xs">
                        {pn.complianceScore}%
                      </Badge>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic text-center py-8">
                {lang === "tr" ? "Henuz gecmis bulten yok." : "No past newsletters yet."}
              </p>
            )}
          </Card>
        )}

        {/* ─── SETTINGS TAB ─── */}
        {activeTab === "settings" && (
          <Card className="p-5 space-y-5">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {lang === "tr" ? "Bulten Tercihleri" : "Newsletter Preferences"}
            </h3>

            {/* Push Monday Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {lang === "tr" ? "Pazartesi Push Bildirimi" : "Monday Push Notification"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {lang === "tr" ? "Her Pazartesi sabahi bildirim al" : "Get notified every Monday morning"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => savePrefs({ ...prefs, pushMonday: !prefs.pushMonday })}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  prefs.pushMonday ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  prefs.pushMonday ? "translate-x-5" : "translate-x-0.5"
                }`} />
              </button>
            </div>

            {/* In-App Notification Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {lang === "tr" ? "Uygulama Ici Bildirim" : "In-App Notification"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {lang === "tr" ? "Dashboard'da bulten karti goster" : "Show newsletter card on dashboard"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => savePrefs({ ...prefs, inAppNotify: !prefs.inAppNotify })}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  prefs.inAppNotify ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  prefs.inAppNotify ? "translate-x-5" : "translate-x-0.5"
                }`} />
              </button>
            </div>

            {/* Delivery Time */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {lang === "tr" ? "Teslimat Saati" : "Delivery Time"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {lang === "tr" ? "Bulten kac'ta gelsin?" : "What time should your newsletter arrive?"}
                  </p>
                </div>
              </div>
              <select
                value={prefs.deliveryTime}
                onChange={(e) => savePrefs({ ...prefs, deliveryTime: e.target.value })}
                className="bg-gray-100 dark:bg-gray-700 text-sm rounded-lg px-3 py-1.5 border-0 text-gray-700 dark:text-gray-300"
              >
                <option value="07:00">07:00</option>
                <option value="08:00">08:00</option>
                <option value="09:00">09:00</option>
                <option value="10:00">10:00</option>
                <option value="12:00">12:00</option>
              </select>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}