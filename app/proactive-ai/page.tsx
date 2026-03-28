"use client";

import { Brain, Bell, TrendingUp, AlertTriangle, Sparkles, Shield, Eye, Zap } from "lucide-react";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

const MOCK_ALERTS = [
  {
    icon: AlertTriangle,
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
    title: { en: "Vitamin D Pattern Detected", tr: "D Vitamini Oruntusnu Tespit Edildi" },
    desc: { en: "Your last 3 blood tests show declining Vitamin D. Current level 18 ng/mL is approaching deficiency. Consider supplementation before winter.", tr: "Son 3 kan tahliliniz dusen D vitamini gosteriyor. Mevcut seviye 18 ng/mL eksiklige yaklasiiyor. Kis oncesi takviye dusununuz." },
    time: { en: "2 hours ago", tr: "2 saat once" },
  },
  {
    icon: TrendingUp,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
    title: { en: "Medication Timing Insight", tr: "İlaç Zamanlama Icgorusu" },
    desc: { en: "You tend to miss your evening Metformin on weekends. Setting a weekend-specific reminder could improve adherence by ~20%.", tr: "Hafta sonlari aksam Metformin'inizi atlama egiliminde-siniz. Hafta sonuna ozel hatirlatici ayarlamak uyumu ~%20 artirabilir." },
    time: { en: "Yesterday", tr: "Dun" },
  },
  {
    icon: Zap,
    color: "text-green-500",
    bg: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
    title: { en: "Supplement Cycling Alert", tr: "Takviye Dongu Uyarısi" },
    desc: { en: "Your Ashwagandha cycle ends in 3 days. Based on your stress check-ins, a 1-week washout is recommended before restarting.", tr: "Ashwagandha dongunuz 3 gun sonra bitiyor. Stres check-in'lerinize gore yeniden baslamadan once 1 haftalik mola oneriliyor." },
    time: { en: "Today", tr: "Bugun" },
  },
  {
    icon: Eye,
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800",
    title: { en: "Sleep Quality Correlation", tr: "Uyku Kalitesi Korelasyonu" },
    desc: { en: "Your sleep quality drops 35% on days you consume caffeine after 2 PM. Consider switching to decaf in the afternoon.", tr: "Saat 14:00'ten sonra kafein tukettiginiz gunlerde uyku kaliteniz %35 dusuyor. Ogleden sonra kafeinsiz iceceklere gecis yapmayi dusununuz." },
    time: { en: "3 days ago", tr: "3 gun once" },
  },
];

const FEATURES = [
  { icon: Brain, title: { en: "Pattern Recognition", tr: "Oruntusu Tanima" }, desc: { en: "AI analyzes your health data over time to find meaningful patterns", tr: "AI saglik verilerinizi zaman icinde analiz ederek anlamli oruntuler bulur" } },
  { icon: Bell, title: { en: "Smart Notifications", tr: "Akilli Bildirimler" }, desc: { en: "Get alerts only when something genuinely needs your attention", tr: "Sadece gercekten dikkatinizi gerektiren durumlarda uyarı aliniz" } },
  { icon: Shield, title: { en: "Risk Prevention", tr: "Risk Onleme" }, desc: { en: "Early warnings about potential drug interactions or deficiencies", tr: "Potansiyel ilac etkilesimleri veya eksiklikler hakkinda erken uyarılar" } },
  { icon: TrendingUp, title: { en: "Trend Analysis", tr: "Trend Analizi" }, desc: { en: "Track biomarker trends across multiple blood tests", tr: "Birden fazla kan tahlilinde biyobelirtec trendlerini takip ediniz" } },
];

export default function ProactiveAIPage() {
  const { lang } = useLang();

  return (
    <div className="mx-auto max-w-4xl px-4 md:px-8 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" />
          {tx("tool.comingSoon", lang)}
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{tx("proactive.title", lang)}</h1>
        <p className="text-gray-600 dark:text-gray-400">{tx("proactive.subtitle", lang)}</p>
      </div>

      {/* Mock Alerts */}
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        {lang === "tr" ? "Ornek Uyarılar (Onizleme)" : "Example Alerts (Preview)"}
      </h2>
      <div className="space-y-3 mb-10">
        {MOCK_ALERTS.map((a, i) => (
          <div key={i} className={`${a.bg} border rounded-xl p-4`}>
            <div className="flex items-start gap-3">
              <a.icon className={`w-5 h-5 mt-0.5 ${a.color}`} />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{a.title[lang]}</p>
                  <span className="text-xs text-gray-400">{a.time[lang]}</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{a.desc[lang]}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Feature Grid */}
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        {lang === "tr" ? "Özellikler" : "Features"}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {FEATURES.map((f, i) => (
          <div key={i} className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <f.icon className="w-6 h-6 text-purple-500 mb-3" />
            <p className="font-semibold text-gray-900 dark:text-white mb-1">{f.title[lang]}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{f.desc[lang]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
