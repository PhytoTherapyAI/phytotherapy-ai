"use client";

import { useState } from "react";
import { Sun, Moon, Clock, Coffee, Dumbbell, Brain, Lightbulb, AlertTriangle } from "lucide-react";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

type Chronotype = "morning" | "evening";

interface ScheduleItem {
  time: { morning: string; evening: string };
  activity: { en: string; tr: string };
  icon: React.ElementType;
  tip: { en: string; tr: string };
}

const SCHEDULE: ScheduleItem[] = [
  { time: { morning: "05:30-06:30", evening: "07:30-08:30" }, activity: { en: "Wake up + sunlight", tr: "Uyanma + gunes isigi" }, icon: Sun, tip: { en: "Get 10-30 min bright light within 30 min of waking", tr: "Uyanmadan sonraki 30 dk icinde 10-30 dk parlak isik aliniz" } },
  { time: { morning: "06:30-07:00", evening: "08:30-09:00" }, activity: { en: "Exercise", tr: "Egzersiz" }, icon: Dumbbell, tip: { en: "Morning exercise boosts cortisol awakening response", tr: "Sabah egzersizi kortizol uyanma yaniti arttirir" } },
  { time: { morning: "07:00-07:30", evening: "09:00-09:30" }, activity: { en: "First caffeine", tr: "Ilk kafein" }, icon: Coffee, tip: { en: "Wait 90-120 min after waking for caffeine (cortisol peak)", tr: "Kafein icin uyanmadan 90-120 dk sonra bekleyiniz (kortizol zirvesi)" } },
  { time: { morning: "08:00-12:00", evening: "10:00-14:00" }, activity: { en: "Peak productivity", tr: "Zirve uretkenlik" }, icon: Brain, tip: { en: "Complex tasks, deep work, important decisions", tr: "Karmasik gorevler, derin calisma, onemli kararlar" } },
  { time: { morning: "13:00-14:00", evening: "15:00-16:00" }, activity: { en: "Post-lunch dip", tr: "Ogle sonrasi dusus" }, icon: Clock, tip: { en: "Light tasks, meetings. 20-min nap if possible (not after 3PM)", tr: "Hafif gorevler, toplantılar. Mumkunse 20 dk sekerleme (saat 15'ten sonra degil)" } },
  { time: { morning: "14:00-17:00", evening: "16:00-20:00" }, activity: { en: "Second wind", tr: "Ikinci enerji dalgasi" }, icon: Brain, tip: { en: "Good for creative tasks and collaboration", tr: "Yaratici gorevler ve isbirligi icin iyi" } },
  { time: { morning: "14:00", evening: "16:00" }, activity: { en: "Caffeine cutoff", tr: "Kafein kesim" }, icon: Coffee, tip: { en: "No caffeine after this time (8-10h before bed)", tr: "Bu saatten sonra kafein yok (yatmadan 8-10 saat once)" } },
  { time: { morning: "19:00", evening: "21:00" }, activity: { en: "Dim lights", tr: "Isiklari kis" }, icon: Lightbulb, tip: { en: "Reduce blue light, use warm lighting, enable night mode", tr: "Mavi isigi azaltiniz, sicak aydinlatma, gece modu etkinlestiriniz" } },
  { time: { morning: "21:00-21:30", evening: "23:00-23:30" }, activity: { en: "Sleep", tr: "Uyku" }, icon: Moon, tip: { en: "7-9 hours recommended. Cool room (18-20C)", tr: "7-9 saat onerili. Serin oda (18-20C)" } },
];

const SHIFT_WORKER_TIPS = [
  { en: "Use blackout curtains for daytime sleep", tr: "Gunduz uykusu icin karaartma perdeleri kullaniniz" },
  { en: "Wear sunglasses driving home after night shift", tr: "Gece vardiyasindan sonra eve giderken gunes gozlugu takiniz" },
  { en: "Strategic caffeine: use early in shift, stop 6h before bed", tr: "Stratejik kafein: vardiyanin basinda kullaniniz, yatmadan 6 saat once kesiniz" },
  { en: "Melatonin 0.5-3mg 30 min before planned sleep", tr: "Planlanan uykudan 30 dk once melatonin 0.5-3mg" },
  { en: "Keep consistent schedule even on off days when possible", tr: "Mumkun oldugunda tatil gunlerinde bile tutarli program surdrun" },
];

const SAD_INFO = {
  en: "Seasonal Affective Disorder (SAD) affects 1-3% of adults. Light therapy with 10,000 lux for 20-30 min within first hour of waking shows Grade A evidence. Start in early autumn before symptoms begin.",
  tr: "Mevsimsel Duygudurum Bozuklugu (SAD) yetiskinlerin %1-3'unu etkiler. Uyanmanin ilk saatinde 20-30 dk 10.000 lux isik terapisi A derecesi kanit gostermektedir. Belirtiler baslamadan once sonbaharin basinda baslatiniz.",
};

export default function CircadianRhythmPage() {
  const { lang } = useLang();
  const [chronotype, setChronotype] = useState<Chronotype>("morning");

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      <div className="text-center mb-8">
        <Sun className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{tx("circadian.title", lang)}</h1>
        <p className="text-gray-600 dark:text-gray-400">{tx("circadian.subtitle", lang)}</p>
      </div>

      {/* Chronotype Selector */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setChronotype("morning")}
          className={`flex-1 p-4 rounded-xl border-2 transition ${chronotype === "morning" ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20" : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"}`}
        >
          <Sun className={`w-6 h-6 mx-auto mb-1 ${chronotype === "morning" ? "text-amber-500" : "text-gray-400"}`} />
          <p className={`text-sm font-medium ${chronotype === "morning" ? "text-amber-700 dark:text-amber-300" : "text-gray-600 dark:text-gray-400"}`}>
            {lang === "tr" ? "Sabah Tipi" : "Morning Type"}
          </p>
          <p className="text-xs text-gray-400">{lang === "tr" ? "Erken kalkan" : "Early riser"}</p>
        </button>
        <button
          onClick={() => setChronotype("evening")}
          className={`flex-1 p-4 rounded-xl border-2 transition ${chronotype === "evening" ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"}`}
        >
          <Moon className={`w-6 h-6 mx-auto mb-1 ${chronotype === "evening" ? "text-indigo-500" : "text-gray-400"}`} />
          <p className={`text-sm font-medium ${chronotype === "evening" ? "text-indigo-700 dark:text-indigo-300" : "text-gray-600 dark:text-gray-400"}`}>
            {lang === "tr" ? "Aksam Tipi" : "Evening Type"}
          </p>
          <p className="text-xs text-gray-400">{lang === "tr" ? "Gec yatan" : "Night owl"}</p>
        </button>
      </div>

      {/* Schedule */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          {lang === "tr" ? "Optimal Günlük Program" : "Optimal Daily Schedule"}
        </h3>
        <div className="space-y-3">
          {SCHEDULE.map((s, i) => (
            <div key={i} className="flex items-start gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="min-w-[100px]">
                <span className="text-sm font-mono font-medium text-gray-900 dark:text-white">{s.time[chronotype]}</span>
              </div>
              <s.icon className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{s.activity[lang]}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.tip[lang]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shift Worker */}
      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 p-5 mb-6">
        <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> {lang === "tr" ? "Vardiyali Calisanlar Icin" : "For Shift Workers"}
        </h3>
        <ul className="space-y-2">
          {SHIFT_WORKER_TIPS.map((t, i) => (
            <li key={i} className="text-sm text-amber-700 dark:text-amber-400 flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" /> {t[lang]}
            </li>
          ))}
        </ul>
      </div>

      {/* SAD */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-5">
        <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
          <Lightbulb className="w-4 h-4" /> {lang === "tr" ? "Isik Terapisi & SAD" : "Light Therapy & SAD"}
        </h3>
        <p className="text-sm text-blue-700 dark:text-blue-400">{SAD_INFO[lang]}</p>
      </div>

      <p className="text-xs text-gray-400 text-center mt-6">{tx("disclaimer.tool", lang)}</p>
    </div>
  );
}
