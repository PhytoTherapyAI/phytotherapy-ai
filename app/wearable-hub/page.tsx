"use client";

import { Watch, Heart, Footprints, Moon, Activity, Wifi, WifiOff, Smartphone } from "lucide-react";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

const DEVICES = [
  { name: "Apple Watch", brand: "Apple", icon: Watch, features: ["HR", "SpO2", "ECG", "Sleep", "Steps", "HRV"], color: "bg-gray-100 dark:bg-gray-800" },
  { name: "Garmin Venu", brand: "Garmin", icon: Activity, features: ["HR", "SpO2", "Sleep", "Steps", "HRV", "Stress"], color: "bg-blue-50 dark:bg-blue-900/30" },
  { name: "Fitbit Sense", brand: "Fitbit", icon: Heart, features: ["HR", "SpO2", "EDA", "Sleep", "Steps", "Skin Temp"], color: "bg-teal-50 dark:bg-teal-900/30" },
  { name: "Samsung Galaxy Watch", brand: "Samsung", icon: Smartphone, features: ["HR", "SpO2", "ECG", "Sleep", "Steps", "BIA"], color: "bg-purple-50 dark:bg-purple-900/30" },
  { name: "Xiaomi Mi Band", brand: "Xiaomi", icon: Activity, features: ["HR", "SpO2", "Sleep", "Steps", "Stress"], color: "bg-orange-50 dark:bg-orange-900/30" },
];

const METRICS = [
  { key: "Heart Rate", icon: Heart, desc: { en: "Continuous HR monitoring with anomaly detection", tr: "Anomali tespitli surekli nabiz izleme" }, color: "text-red-500" },
  { key: "Steps", icon: Footprints, desc: { en: "Daily step count synced to walking tracker", tr: "Yuruyus takipcisiyle senkronize gunluk adim sayisi" }, color: "text-green-500" },
  { key: "Sleep", icon: Moon, desc: { en: "Sleep stages, duration, and quality scoring", tr: "Uyku evreleri, sure ve kalite puanlamasi" }, color: "text-indigo-500" },
  { key: "SpO2", icon: Activity, desc: { en: "Blood oxygen saturation tracking", tr: "Kan oksijen saturasyonu takibi" }, color: "text-blue-500" },
  { key: "HRV", icon: Activity, desc: { en: "Heart rate variability for stress assessment", tr: "Stres değerlendirmesi için kalp hizi degiskenligi" }, color: "text-amber-500" },
];

export default function WearableHubPage() {
  const { lang } = useLang();

  return (
    <div className="mx-auto max-w-4xl px-4 md:px-8 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm font-medium mb-4">
          <WifiOff className="w-4 h-4" />
          {tx("tool.comingSoon", lang)}
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{tx("wearable.title", lang)}</h1>
        <p className="text-gray-600 dark:text-gray-400">{tx("wearable.subtitle", lang)}</p>
      </div>

      {/* Supported Devices */}
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        {tx("wearable.supportedDevices", lang)}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {DEVICES.map((d) => (
          <div key={d.name} className={`${d.color} rounded-xl p-5 border border-gray-200 dark:border-gray-700`}>
            <div className="flex items-center gap-3 mb-3">
              <d.icon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{d.name}</p>
                <p className="text-xs text-gray-500">{d.brand}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {d.features.map((f) => (
                <span key={f} className="px-2 py-0.5 bg-white/60 dark:bg-gray-700/60 rounded text-xs text-gray-700 dark:text-gray-300">{f}</span>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
              <Wifi className="w-3 h-3" />
              {tx("wearable.integrationPending", lang)}
            </div>
          </div>
        ))}
      </div>

      {/* Metrics Preview */}
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        {tx("wearable.metricsTitle", lang)}
      </h2>
      <div className="space-y-3 mb-10">
        {METRICS.map((m) => (
          <div key={m.key} className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <m.icon className={`w-5 h-5 mt-0.5 ${m.color}`} />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{m.key}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{m.desc[lang]}</p>
            </div>
          </div>
        ))}
      </div>

      {/* How it will work */}
      <div className="p-6 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-200 dark:border-violet-800">
        <h3 className="font-semibold text-violet-800 dark:text-violet-300 mb-2">
          {tx("wearable.howItWorks", lang)}
        </h3>
        <ol className="space-y-2 text-sm text-violet-700 dark:text-violet-400">
          <li>1. {tx("wearable.step1", lang)}</li>
          <li>2. {tx("wearable.step2", lang)}</li>
          <li>3. {tx("wearable.step3", lang)}</li>
          <li>4. {tx("wearable.step4", lang)}</li>
        </ol>
      </div>
    </div>
  );
}
