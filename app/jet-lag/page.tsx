"use client";

import { useState } from "react";
import {
  Plane,
  Sun,
  Moon,
  Clock,
  Pill,
  Utensils,
  Loader2,
  LogIn,
  Sparkles,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface JetLagResult {
  timeDifference: number;
  direction: string;
  adjustmentDays: number;
  melatoninPlan: { preTravelDays: number; timing: string; dose: string; notes: string };
  lightExposureSchedule: Array<{ day: string; seekLight: string; avoidLight: string }>;
  mealTimingPlan: Array<{ day: string; breakfast: string; lunch: string; dinner: string }>;
  medicationAdjustments: Array<{ medication: string; currentTiming: string; newTiming: string; transitionMethod: string; warning: string }>;
  hourByHourPlan: Array<{ time: string; action: string; reason: string }>;
  generalTips: string[];
}

const TIMEZONES = [
  "UTC-12:00", "UTC-11:00", "UTC-10:00", "UTC-9:00", "UTC-8:00 (PST)",
  "UTC-7:00 (MST)", "UTC-6:00 (CST)", "UTC-5:00 (EST)", "UTC-4:00",
  "UTC-3:00", "UTC-2:00", "UTC-1:00", "UTC+0:00 (GMT)", "UTC+1:00 (CET)",
  "UTC+2:00 (EET)", "UTC+3:00 (Turkey)", "UTC+4:00", "UTC+4:30",
  "UTC+5:00", "UTC+5:30 (India)", "UTC+6:00", "UTC+7:00",
  "UTC+8:00 (China/HK)", "UTC+9:00 (Japan/Korea)", "UTC+9:30",
  "UTC+10:00 (Sydney)", "UTC+11:00", "UTC+12:00 (NZ)",
];

export default function JetLagPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();
  const [origin, setOrigin] = useState("UTC+3:00 (Turkey)");
  const [destination, setDestination] = useState("UTC-5:00 (EST)");
  const [travelDate, setTravelDate] = useState(new Date().toISOString().split("T")[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<JetLagResult | null>(null);

  const handleGenerate = async () => {
    if (!session?.access_token) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/jet-lag", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          lang,
          origin_timezone: origin,
          destination_timezone: destination,
          travel_date: travelDate,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to generate plan");
      }

      const data = await res.json();
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">{tx("jetlag.title", lang)}</h1>
          <p className="text-muted-foreground">{lang === "tr" ? "Bu araci kullanmak icin giris yapin" : "Please log in to use this tool"}</p>
          <Button onClick={() => window.location.href = "/auth/login"}>
            <LogIn className="w-4 h-4 mr-2" /> {tx("nav.login", lang)}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 px-4 py-1.5 rounded-full text-sm font-medium">
            <Plane className="w-4 h-4" />
            {tx("jetlag.title", lang)}
          </div>
          <h1 className="text-3xl font-bold">{tx("jetlag.title", lang)}</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">{tx("jetlag.subtitle", lang)}</p>
        </div>

        {/* Input Form */}
        <div className="bg-card border rounded-2xl p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">{tx("jetlag.origin", lang)}</label>
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full mt-1 px-4 py-2 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">{tx("jetlag.destination", lang)}</label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full mt-1 px-4 py-2 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">{lang === "tr" ? "Seyahat Tarihi" : "Travel Date"}</label>
            <input
              type="date"
              value={travelDate}
              onChange={(e) => setTravelDate(e.target.value)}
              className="w-full mt-1 px-4 py-2 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <Button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full bg-sky-600 hover:bg-sky-700 text-white"
            size="lg"
          >
            {isLoading ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" />{lang === "tr" ? "Plan oluşturuluyor..." : "Generating plan..."}</>
            ) : (
              <><Sparkles className="mr-2 h-5 w-5" />{tx("jetlag.generate", lang)}</>
            )}
          </Button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-2xl p-6 text-center space-y-2">
              <p className="text-2xl font-bold text-sky-700 dark:text-sky-400">
                {result.timeDifference > 0 ? "+" : ""}{result.timeDifference}h {result.direction === "east" ? (lang === "tr" ? "Doguya" : "East") : (lang === "tr" ? "Batiya" : "West")}
              </p>
              <p className="text-sm text-muted-foreground">
                {lang === "tr" ? `Tahmini uyum suresi: ${result.adjustmentDays} gun` : `Estimated adjustment: ${result.adjustmentDays} days`}
              </p>
            </div>

            {/* Melatonin Plan */}
            {result.melatoninPlan && (
              <div className="bg-card border rounded-2xl p-6 space-y-3">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Moon className="w-5 h-5 text-indigo-500" />
                  {lang === "tr" ? "Melatonin Zamanlama Plani" : "Melatonin Timing Plan"}
                </h2>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-3">
                    <div className="text-xs font-medium text-muted-foreground">{lang === "tr" ? "Seyahat Oncesi" : "Pre-Travel"}</div>
                    <div className="font-medium">{result.melatoninPlan.preTravelDays} {lang === "tr" ? "gun once basla" : "days before"}</div>
                  </div>
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-3">
                    <div className="text-xs font-medium text-muted-foreground">{lang === "tr" ? "Zamanlama" : "Timing"}</div>
                    <div className="font-medium">{result.melatoninPlan.timing}</div>
                  </div>
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-3">
                    <div className="text-xs font-medium text-muted-foreground">{lang === "tr" ? "Doz" : "Dose"}</div>
                    <div className="font-medium">{result.melatoninPlan.dose}</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{result.melatoninPlan.notes}</p>
              </div>
            )}

            {/* Light Exposure */}
            {result.lightExposureSchedule?.length > 0 && (
              <div className="bg-card border rounded-2xl p-6 space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Sun className="w-5 h-5 text-yellow-500" />
                  {lang === "tr" ? "Isik Maruziyeti Programı" : "Light Exposure Schedule"}
                </h2>
                <div className="grid gap-3">
                  {result.lightExposureSchedule.map((item, i) => (
                    <div key={i} className="grid grid-cols-3 gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                      <div className="font-medium text-sm">{item.day}</div>
                      <div className="text-sm text-green-600 dark:text-green-400">{item.seekLight}</div>
                      <div className="text-sm text-red-600 dark:text-red-400">{item.avoidLight}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Meal Timing */}
            {result.mealTimingPlan?.length > 0 && (
              <div className="bg-card border rounded-2xl p-6 space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-orange-500" />
                  {lang === "tr" ? "Yemek Zamanlama Plani" : "Meal Timing Plan"}
                </h2>
                <div className="grid gap-3">
                  {result.mealTimingPlan.map((item, i) => (
                    <div key={i} className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
                      <div className="font-medium mb-2">{item.day}</div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div><span className="text-muted-foreground">{lang === "tr" ? "Kahvalti:" : "Breakfast:"}</span> {item.breakfast}</div>
                        <div><span className="text-muted-foreground">{lang === "tr" ? "Ogle:" : "Lunch:"}</span> {item.lunch}</div>
                        <div><span className="text-muted-foreground">{lang === "tr" ? "Aksam:" : "Dinner:"}</span> {item.dinner}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Medication Adjustments */}
            {result.medicationAdjustments?.length > 0 && (
              <div className="bg-card border rounded-2xl p-6 space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Pill className="w-5 h-5 text-red-500" />
                  {lang === "tr" ? "İlaç Zamanlama Ayarlamalari" : "Medication Timing Adjustments"}
                </h2>
                <div className="grid gap-3">
                  {result.medicationAdjustments.map((med, i) => (
                    <div key={i} className="border border-red-200 dark:border-red-800 rounded-xl p-4 space-y-2">
                      <div className="font-semibold">{med.medication}</div>
                      <div className="grid sm:grid-cols-2 gap-2 text-sm">
                        <div><span className="text-muted-foreground">{lang === "tr" ? "Mevcut:" : "Current:"}</span> {med.currentTiming}</div>
                        <div><span className="text-muted-foreground">{lang === "tr" ? "Yeni:" : "New:"}</span> {med.newTiming}</div>
                      </div>
                      <p className="text-sm">{med.transitionMethod}</p>
                      {med.warning && <p className="text-sm text-red-600 dark:text-red-400 font-medium">{med.warning}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hour by Hour Plan */}
            {result.hourByHourPlan?.length > 0 && (
              <div className="bg-card border rounded-2xl p-6 space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-sky-500" />
                  {lang === "tr" ? "Saat Saat Plan" : "Hour-by-Hour Plan"}
                </h2>
                <div className="grid gap-2">
                  {result.hourByHourPlan.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-sky-50 dark:bg-sky-900/20 rounded-xl">
                      <span className="font-mono text-sm font-bold text-sky-600 dark:text-sky-400 min-w-[60px]">{item.time}</span>
                      <div>
                        <div className="text-sm font-medium">{item.action}</div>
                        <div className="text-xs text-muted-foreground">{item.reason}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* General Tips */}
            {result.generalTips?.length > 0 && (
              <div className="bg-card border rounded-2xl p-6 space-y-3">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  {lang === "tr" ? "Genel Ipuclari" : "General Tips"}
                </h2>
                {result.generalTips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    {tip}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Disclaimer */}
        <div className="text-center text-xs text-muted-foreground px-4">
          {tx("disclaimer.tool", lang)}
        </div>
      </div>
    </div>
  );
}
