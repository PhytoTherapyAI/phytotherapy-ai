"use client";

import { useState } from "react";
import { useLang } from "@/components/layout/language-toggle";
import {
  Cross, Star, ChefHat, Flower, HeartPulse, Heart, Globe, Shield,
  PawPrint, Beaker, Accessibility, Users, BookOpen,
} from "lucide-react";
import dynamic from "next/dynamic";

// ── Guide definitions ───────────────────────
interface GuideTab {
  id: string;
  title: { en: string; tr: string };
  icon: typeof Cross;
  color: string;
}

const GUIDES: GuideTab[] = [
  { id: "first-aid", title: { en: "First Aid", tr: "İlk Yardım" }, icon: Cross, color: "text-red-500" },
  { id: "hajj-health", title: { en: "Hajj & Umrah", tr: "Hac & Umre" }, icon: Star, color: "text-amber-500" },
  { id: "food-prep", title: { en: "Food Prep", tr: "Besin Hazırlama" }, icon: ChefHat, color: "text-orange-500" },
  { id: "seasonal-food", title: { en: "Seasonal Foods", tr: "Mevsimsel Besinler" }, icon: Flower, color: "text-green-500" },
  { id: "post-icu", title: { en: "Post-ICU", tr: "Yoğun Bakım Sonrası" }, icon: HeartPulse, color: "text-violet-500" },
  { id: "organ-transplant", title: { en: "Organ Transplant", tr: "Organ Nakli" }, icon: Heart, color: "text-pink-500" },
  { id: "immigrant-health", title: { en: "Immigrant Health", tr: "Göçmen Sağlığı" }, icon: Globe, color: "text-teal-500" },
  { id: "military-health", title: { en: "Military Health", tr: "Askerlik Sağlığı" }, icon: Shield, color: "text-gray-600" },
  { id: "pet-health", title: { en: "Pet Health", tr: "Evcil Hayvan Sağlığı" }, icon: PawPrint, color: "text-amber-600" },
  { id: "detox-facts", title: { en: "Detox Facts", tr: "Detoks Gerçekleri" }, icon: Beaker, color: "text-emerald-500" },
  { id: "accessibility", title: { en: "Accessibility", tr: "Erişilebilirlik" }, icon: Accessibility, color: "text-blue-500" },
  { id: "social-prescription", title: { en: "Social Prescription", tr: "Sosyal Reçete" }, icon: Users, color: "text-indigo-500" },
];

// ── Lazy-load each guide component ──────────
const GuideComponents: Record<string, React.ComponentType> = {
  "first-aid": dynamic(() => import("@/app/first-aid/page"), { ssr: false }),
  "hajj-health": dynamic(() => import("@/app/hajj-health/page"), { ssr: false }),
  "food-prep": dynamic(() => import("@/app/food-prep/page"), { ssr: false }),
  "seasonal-food": dynamic(() => import("@/app/seasonal-food/page"), { ssr: false }),
  "post-icu": dynamic(() => import("@/app/post-icu/page"), { ssr: false }),
  "organ-transplant": dynamic(() => import("@/app/organ-transplant/page"), { ssr: false }),
  "immigrant-health": dynamic(() => import("@/app/immigrant-health/page"), { ssr: false }),
  "military-health": dynamic(() => import("@/app/military-health/page"), { ssr: false }),
  "pet-health": dynamic(() => import("@/app/pet-health/page"), { ssr: false }),
  "detox-facts": dynamic(() => import("@/app/detox-facts/page"), { ssr: false }),
  "accessibility": dynamic(() => import("@/app/accessibility/page"), { ssr: false }),
  "social-prescription": dynamic(() => import("@/app/social-prescription/page"), { ssr: false }),
};

export default function HealthGuidesPage() {
  const { lang } = useLang();
  const [activeGuide, setActiveGuide] = useState<string | null>(null);

  const ActiveComponent = activeGuide ? GuideComponents[activeGuide] : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 mb-4">
            <BookOpen className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {lang === "tr" ? "Sağlık Rehberleri" : "Health Guides"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
            {lang === "tr"
              ? "Özel durumlar için kapsamlı sağlık rehberleri"
              : "Comprehensive health guides for special situations"}
          </p>
        </div>

        {activeGuide ? (
          <>
            {/* Back button + guide selector */}
            <div className="mb-6">
              <button
                onClick={() => setActiveGuide(null)}
                className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-4"
              >
                ← {lang === "tr" ? "Tüm Rehberler" : "All Guides"}
              </button>

              {/* Horizontal scroll tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                {GUIDES.map(guide => {
                  const Icon = guide.icon;
                  const isActive = activeGuide === guide.id;
                  return (
                    <button
                      key={guide.id}
                      onClick={() => setActiveGuide(guide.id)}
                      className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                        isActive
                          ? "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white shadow-sm"
                          : "border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? guide.color : ""}`} />
                      {guide.title[lang as "en" | "tr"]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Guide Content */}
            {ActiveComponent && <ActiveComponent />}
          </>
        ) : (
          /* Guide Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {GUIDES.map(guide => {
              const Icon = guide.icon;
              return (
                <button
                  key={guide.id}
                  onClick={() => setActiveGuide(guide.id)}
                  className="flex flex-col items-center gap-3 p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm transition-all text-center group"
                >
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 group-hover:scale-105 transition-transform">
                    <Icon className={`w-6 h-6 ${guide.color}`} />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {guide.title[lang as "en" | "tr"]}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
