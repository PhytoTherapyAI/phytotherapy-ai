"use client";

import { useState } from "react";
import {
  Wind,
  Heart,
  Activity,
  Shield,
  AlertTriangle,
  LogIn,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface AQILevel {
  range: string;
  label: { en: string; tr: string };
  color: string;
  bgColor: string;
  darkBgColor: string;
  general: { en: string; tr: string };
  sensitive: { en: string; tr: string };
  exercise: { en: string; tr: string };
  mask: { en: string; tr: string };
}

const AQI_LEVELS: AQILevel[] = [
  {
    range: "0-50",
    label: { en: "Good", tr: "Iyi" },
    color: "text-green-700 dark:text-green-400",
    bgColor: "bg-green-50",
    darkBgColor: "dark:bg-green-900/20",
    general: { en: "Air quality is satisfactory. No health risk.", tr: "Hava kalitesi tatmin edici. Saglik riski yok." },
    sensitive: { en: "No special precautions needed for asthma/COPD patients.", tr: "Astim/KOAH hastalari icin ozel onlem gerekmez." },
    exercise: { en: "All outdoor activities safe. Enjoy fresh air!", tr: "Tum dis mekan aktiviteleri guvenli. Temiz havanin keyfini cikarin!" },
    mask: { en: "No mask needed.", tr: "Maske gerekmez." },
  },
  {
    range: "51-100",
    label: { en: "Moderate", tr: "Orta" },
    color: "text-yellow-700 dark:text-yellow-400",
    bgColor: "bg-yellow-50",
    darkBgColor: "dark:bg-yellow-900/20",
    general: { en: "Acceptable quality. Unusually sensitive people may experience symptoms.", tr: "Kabul edilebilir kalite. Olaganustu hassas kisiler semptomlar yasayabilir." },
    sensitive: { en: "Asthma: carry rescue inhaler. COPD: monitor symptoms closely.", tr: "Astim: kurtarma inhaler yaninda tasiyin. KOAH: semptomlari yakindan izleyin." },
    exercise: { en: "Moderate outdoor exercise OK. Sensitive groups reduce prolonged exertion.", tr: "Orta duzeyde dis mekan egzersizi uygun. Hassas gruplar uzun sureli efor azaltsin." },
    mask: { en: "Optional. N95 for sensitive individuals during extended outdoor time.", tr: "Istege bagli. Hassas bireyler icin uzun sureli dis mekan zamani N95." },
  },
  {
    range: "101-150",
    label: { en: "Unhealthy for Sensitive Groups", tr: "Hassas Gruplar Icin Sagliksiz" },
    color: "text-orange-700 dark:text-orange-400",
    bgColor: "bg-orange-50",
    darkBgColor: "dark:bg-orange-900/20",
    general: { en: "Sensitive groups may experience health effects. General public less likely affected.", tr: "Hassas gruplar saglik etkileri yasayabilir. Genel halk daha az etkilenir." },
    sensitive: { en: "Asthma/COPD: reduce outdoor time. Use preventive inhaler before going out.", tr: "Astim/KOAH: dis mekan suresini azaltin. Disari cikmadan once koruyucu inhaler kullanin." },
    exercise: { en: "Sensitive groups: indoor exercise only. Others: limit intense outdoor activity to 1 hour.", tr: "Hassas gruplar: sadece ic mekan egzersizi. Digerleri: yogun dis mekan aktivitesini 1 saatle sinirlayin." },
    mask: { en: "N95 recommended for sensitive groups. KN95 acceptable alternative.", tr: "Hassas gruplar icin N95 oneriler. KN95 kabul edilebilir alternatif." },
  },
  {
    range: "151-200",
    label: { en: "Unhealthy", tr: "Sagliksiz" },
    color: "text-red-700 dark:text-red-400",
    bgColor: "bg-red-50",
    darkBgColor: "dark:bg-red-900/20",
    general: { en: "Everyone may experience health effects. Sensitive groups: serious effects.", tr: "Herkes saglik etkileri yasayabilir. Hassas gruplar: ciddi etkiler." },
    sensitive: { en: "Asthma/COPD: stay indoors with air purifier. Emergency inhaler accessible at all times.", tr: "Astim/KOAH: hava temizleyici ile ic mekanda kalin. Acil inhaler her zaman ulasılabilir olsun." },
    exercise: { en: "All groups: move exercise indoors. No outdoor running or cycling.", tr: "Tum gruplar: egzersizi ic mekana tasiyin. Dis mekanda kosu veya bisiklet yok." },
    mask: { en: "N95 mandatory outdoors. Surgical masks are NOT effective for PM2.5.", tr: "Dis mekanda N95 zorunlu. Cerrahi maskeler PM2.5 icin etkili DEGILDIR." },
  },
  {
    range: "201-300",
    label: { en: "Very Unhealthy", tr: "Cok Sagliksiz" },
    color: "text-purple-700 dark:text-purple-400",
    bgColor: "bg-purple-50",
    darkBgColor: "dark:bg-purple-900/20",
    general: { en: "Health alert: everyone at risk. Reduce all outdoor exposure.", tr: "Saglik uyarisi: herkes risk altinda. Tum dis mekan maruziyetini azaltin." },
    sensitive: { en: "Asthma/COPD: do NOT go outside. Keep windows sealed. Run air purifier on max.", tr: "Astim/KOAH: disari CIKMAYIN. Pencereleri kapali tutun. Hava temizleyiciyi maksimumda calistirin." },
    exercise: { en: "Indoor exercise only. Even indoor air quality may be affected — use HEPA filter.", tr: "Sadece ic mekan egzersizi. Ic mekan hava kalitesi bile etkilenebilir — HEPA filtre kullanin." },
    mask: { en: "N95 essential. Replace every 8 hours of use. Ensure proper seal (no gaps).", tr: "N95 zorunlu. Her 8 saatlik kullanimda degistirin. Uygun sizma olmadan takildigindan emin olun." },
  },
  {
    range: "301-500",
    label: { en: "Hazardous", tr: "Tehlikeli" },
    color: "text-rose-700 dark:text-rose-400",
    bgColor: "bg-rose-50",
    darkBgColor: "dark:bg-rose-900/20",
    general: { en: "Emergency conditions. Entire population affected. Stay indoors.", tr: "Acil durum kosullari. Tum nufus etkilenir. Ic mekanda kalin." },
    sensitive: { en: "Asthma/COPD: if breathing difficulty occurs, call 112/911 immediately.", tr: "Astim/KOAH: nefes darligi olursa derhal 112'yi arayin." },
    exercise: { en: "NO exercise of any kind, indoor or outdoor, unless air purifier confirmed.", tr: "Hava temizleyici olmadan hicbir tur egzersiz YAPILMAZ, ic veya dis mekan." },
    mask: { en: "N95 with exhalation valve for any necessary outdoor exposure. Minimize to minutes.", tr: "Zorunlu dis mekan maruziyeti icin ekshalasyon valfli N95. Dakikalarla sinirlayin." },
  },
];

export default function AirQualityPage() {
  const { isAuthenticated } = useAuth();
  const { lang } = useLang();
  const [aqiInput, setAqiInput] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<AQILevel | null>(null);

  const handleAQICheck = () => {
    const aqi = parseInt(aqiInput);
    if (isNaN(aqi) || aqi < 0) return;
    const level = AQI_LEVELS.find((l) => {
      const [min, max] = l.range.split("-").map(Number);
      return aqi >= min && aqi <= max;
    });
    setSelectedLevel(level || AQI_LEVELS[AQI_LEVELS.length - 1]);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">{tx("air.title", lang)}</h1>
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
            <Wind className="w-4 h-4" />
            {tx("air.title", lang)}
          </div>
          <h1 className="text-3xl font-bold">{tx("air.title", lang)}</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">{tx("air.subtitle", lang)}</p>
        </div>

        {/* AQI Input */}
        <div className="bg-card border rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold">
            {lang === "tr" ? "AQI Degerinizi Girin" : "Enter Your AQI Value"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {lang === "tr"
              ? "Yerel hava kalitesi endeksini airnow.gov, aqicn.org veya yerel kaynaklardan ogreneblirsiniz."
              : "Find your local AQI from airnow.gov, aqicn.org, or local sources."}
          </p>
          <div className="flex gap-3">
            <input
              type="number"
              min="0"
              max="500"
              value={aqiInput}
              onChange={(e) => setAqiInput(e.target.value)}
              placeholder="0-500"
              className="flex-1 px-4 py-2 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <Button onClick={handleAQICheck} className="bg-sky-600 hover:bg-sky-700 text-white">
              {lang === "tr" ? "Kontrol Et" : "Check"}
            </Button>
          </div>
        </div>

        {/* Selected AQI Result */}
        {selectedLevel && (
          <div className={`border-2 rounded-2xl p-6 space-y-4 ${selectedLevel.bgColor} ${selectedLevel.darkBgColor}`}>
            <div className="flex items-center justify-between">
              <h2 className={`text-2xl font-bold ${selectedLevel.color}`}>
                AQI {aqiInput}: {selectedLevel.label[lang]}
              </h2>
              <span className={`text-sm font-medium px-3 py-1 rounded-full border ${selectedLevel.color}`}>
                {selectedLevel.range}
              </span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-white/60 dark:bg-gray-900/40 rounded-xl p-4 space-y-1">
                <div className="flex items-center gap-2 font-medium text-sm">
                  <Shield className="w-4 h-4" />
                  {lang === "tr" ? "Genel Tavsiye" : "General Advice"}
                </div>
                <p className="text-sm">{selectedLevel.general[lang]}</p>
              </div>
              <div className="bg-white/60 dark:bg-gray-900/40 rounded-xl p-4 space-y-1">
                <div className="flex items-center gap-2 font-medium text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  {lang === "tr" ? "Astim / KOAH" : "Asthma / COPD"}
                </div>
                <p className="text-sm">{selectedLevel.sensitive[lang]}</p>
              </div>
              <div className="bg-white/60 dark:bg-gray-900/40 rounded-xl p-4 space-y-1">
                <div className="flex items-center gap-2 font-medium text-sm">
                  <Activity className="w-4 h-4" />
                  {lang === "tr" ? "Egzersiz" : "Exercise"}
                </div>
                <p className="text-sm">{selectedLevel.exercise[lang]}</p>
              </div>
              <div className="bg-white/60 dark:bg-gray-900/40 rounded-xl p-4 space-y-1">
                <div className="flex items-center gap-2 font-medium text-sm">
                  <Shield className="w-4 h-4" />
                  {lang === "tr" ? "Maske Rehberi" : "Mask Guidance"}
                </div>
                <p className="text-sm">{selectedLevel.mask[lang]}</p>
              </div>
            </div>
          </div>
        )}

        {/* Full AQI Reference Table */}
        <div className="bg-card border rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold">
            {lang === "tr" ? "AQI Referans Tablosu" : "AQI Reference Table"}
          </h2>
          <div className="grid gap-3">
            {AQI_LEVELS.map((level) => (
              <div
                key={level.range}
                className={`border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${level.bgColor} ${level.darkBgColor}`}
                onClick={() => {
                  setAqiInput(level.range.split("-")[0]);
                  setSelectedLevel(level);
                }}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-semibold ${level.color}`}>{level.label[lang]}</span>
                  <span className="text-sm text-muted-foreground">AQI {level.range}</span>
                </div>
                <p className="text-sm mt-1">{level.general[lang]}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="text-center text-xs text-muted-foreground px-4">
          {tx("disclaimer.tool", lang)}
        </div>
      </div>
    </div>
  );
}
