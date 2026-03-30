"use client";

import { Users, Heart, Brain, Leaf, Shield, Sparkles } from "lucide-react";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

const GROUPS = [
  {
    icon: <Heart className="w-6 h-6" />,
    nameEn: "Diabetes Support",
    nameTr: "Diyabet Destegi",
    descEn: "Share experiences managing blood sugar, medication, and lifestyle changes",
    descTr: "Kan sekeri yönetimi, ilac ve yasam tarzi değişiklikleri deneyimlerini paylasin",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-900/20",
    members: "2.4k+",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    nameEn: "Thyroid Warriors",
    nameTr: "Tiroid Savasçilari",
    descEn: "Hypothyroidism, hyperthyroidism, Hashimoto's — you're not alone",
    descTr: "Hipotiroidi, hipertiroidi, Hashimoto — yalniz degilsiniz",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-900/20",
    members: "1.8k+",
  },
  {
    icon: <Leaf className="w-6 h-6" />,
    nameEn: "IBS & Gut Health",
    nameTr: "IBS & Bağırsak Sagligi",
    descEn: "Navigate IBS triggers, FODMAP diets, and digestive wellness together",
    descTr: "IBS tetikleyicileri, FODMAP diyetleri ve sindirim sağlığı birlikte yonetin",
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-900/20",
    members: "1.2k+",
  },
  {
    icon: <Brain className="w-6 h-6" />,
    nameEn: "Mental Health Circle",
    nameTr: "Mental Sağlık Cemberi",
    descEn: "Anxiety, depression, stress — a safe space to share and support",
    descTr: "Anksiyete, depresyon, stres — paylaşım ve destek için güvenli alan",
    color: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-50 dark:bg-teal-900/20",
    members: "3.1k+",
  },
];

const FEATURES_PREVIEW = [
  {
    icon: <Users className="w-5 h-5" />,
    en: "Peer-led, professionally moderated groups",
    tr: "Akran liderliginde, profesyonel moderasyonlu gruplar",
  },
  {
    icon: <Shield className="w-5 h-5" />,
    en: "Verified members only for privacy and safety",
    tr: "Gizlilik ve güvenlik için sadece doğrulanmis uyeler",
  },
  {
    icon: <Sparkles className="w-5 h-5" />,
    en: "AI-powered misinformation detection in posts",
    tr: "Gönderilerde AI destekli yanlis bilgi tespiti",
  },
];

export default function SupportGroupsPage() {
  const { lang } = useLang();

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-teal-600 dark:text-teal-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{tx("support.title", lang)}</h1>
          <div className="inline-block bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
            {tx("support.comingSoon", lang)}
          </div>
        </div>

        {/* Planned Groups */}
        <div className="space-y-3 mb-8">
          {GROUPS.map((g, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-teal-100 dark:border-gray-700 p-5 flex items-center gap-4 opacity-90"
            >
              <div className={`${g.bg} p-3 rounded-xl ${g.color}`}>{g.icon}</div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {lang === "tr" ? g.nameTr : g.nameEn}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {lang === "tr" ? g.descTr : g.descEn}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-teal-600 dark:text-teal-400 font-medium">{g.members}</span>
                <p className="text-xs text-gray-400">{tx("support.waiting", lang)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Features Preview */}
        <div className="bg-teal-50 dark:bg-teal-900/10 rounded-2xl border border-teal-200 dark:border-teal-800 p-6">
          <h3 className="font-semibold text-teal-800 dark:text-teal-400 mb-4">
            {tx("support.whatToExpect", lang)}
          </h3>
          <div className="space-y-3">
            {FEATURES_PREVIEW.map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-teal-700 dark:text-teal-300">
                <div className="text-teal-500">{f.icon}</div>
                <span className="text-sm">{lang === "tr" ? f.tr : f.en}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
