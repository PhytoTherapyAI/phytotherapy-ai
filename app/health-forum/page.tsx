"use client";

import { MessageSquare, Users, ThumbsUp, BookOpen, Shield, Bell } from "lucide-react";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

const FEATURES = [
  {
    icon: <MessageSquare className="w-6 h-6" />,
    titleEn: "Moderated Discussions",
    titleTr: "Moderatorlu Tartismalar",
    descEn: "All posts reviewed by health professionals for safety",
    descTr: "Tum gonderiler saglik profesyonelleri tarafindan incelenir",
  },
  {
    icon: <Users className="w-6 h-6" />,
    titleEn: "Topic Communities",
    titleTr: "Konu Topluluklari",
    descEn: "Diabetes, thyroid, nutrition, fitness, mental health, and more",
    descTr: "Diyabet, tiroid, beslenme, fitness, mental saglik ve dahasi",
  },
  {
    icon: <ThumbsUp className="w-6 h-6" />,
    titleEn: "Evidence-Based Answers",
    titleTr: "Kanita Dayali Yanitlar",
    descEn: "AI-assisted fact-checking on health claims in posts",
    descTr: "Gonderilerdeki saglik iddialarina AI destekli dogrulama",
  },
  {
    icon: <BookOpen className="w-6 h-6" />,
    titleEn: "Shared Experiences",
    titleTr: "Paylasilan Deneyimler",
    descEn: "Learn from others on the same health journey",
    descTr: "Ayni saglik yolculugundaki insanlardan ogrenin",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    titleEn: "Anonymous Posting",
    titleTr: "Anonim Paylasim",
    descEn: "Share sensitive health questions without revealing identity",
    descTr: "Kimliginizi aciklamadan hassas saglik sorulari paylasln",
  },
  {
    icon: <Bell className="w-6 h-6" />,
    titleEn: "Smart Notifications",
    titleTr: "Akilli Bildirimler",
    descEn: "Get notified when experts answer your questions",
    descTr: "Uzmanlar sorularinizi yanitladiginda bildirim alin",
  },
];

export default function HealthForumPage() {
  const { lang } = useLang();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{tx("forum.title", lang)}</h1>
          <div className="inline-block bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
            {tx("forum.comingSoon", lang)}
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
            {lang === "tr"
              ? "Saglik yolculugunuzda yalniz degilsiniz. Moderatorlu, kanita dayali topluluk forumumuz yakinda hizmetinizde."
              : "You're not alone in your health journey. Our moderated, evidence-based community forum is coming soon."}
          </p>
        </div>

        {/* Feature Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-green-100 dark:border-gray-700 p-5 hover:shadow-md transition-shadow"
            >
              <div className="text-green-600 dark:text-green-400 mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {lang === "tr" ? f.titleTr : f.titleEn}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {lang === "tr" ? f.descTr : f.descEn}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <div className="bg-green-50 dark:bg-green-900/10 rounded-2xl border border-green-200 dark:border-green-800 p-6">
            <p className="text-green-800 dark:text-green-400 font-medium">
              {lang === "tr"
                ? "Lansman bildirimini almak icin uygulamayi kullanmaya devam edin!"
                : "Keep using the app to be notified when we launch!"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
