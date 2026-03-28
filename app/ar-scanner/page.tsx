"use client";

import { Camera, Scan, Pill, Info, Sparkles, Smartphone, Layers, AlertCircle } from "lucide-react";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

const STEPS = [
  { icon: Camera, title: { en: "Point Camera", tr: "Kamerayi Tutun" }, desc: { en: "Aim your phone camera at any medication box or pill", tr: "Telefonunuzun kamerasini herhangi bir ilac kutusuna veya hapa tutun" } },
  { icon: Scan, title: { en: "Instant Recognition", tr: "Anlik Tanimlama" }, desc: { en: "AI identifies the medication in real-time using WebXR", tr: "AI, WebXR kullanarak ilacı gercek zamanli olarak tanir" } },
  { icon: Layers, title: { en: "AR Info Overlay", tr: "AR Bilgi Kaplama" }, desc: { en: "See drug info, interactions, and warnings overlaid on your camera view", tr: "İlaç bilgisi, etkileşimler ve uyarıları kamera görüntünüzün uzerinde görün" } },
  { icon: Pill, title: { en: "Add to Profile", tr: "Profile Ekle" }, desc: { en: "One tap to add recognized medication to your profile", tr: "Tanılan ilacı profilinize tek dokunuşla ekleyiniz" } },
];

const CAPABILITIES = [
  { en: "Medication box recognition (brand + generic name)", tr: "İlaç kutusu tanima (marka + etken madde)" },
  { en: "Pill shape and color identification", tr: "Hap sekli ve renk tanilama" },
  { en: "Real-time interaction check with your profile", tr: "Profilinizle gercek zamanli etkilesim kontrolu" },
  { en: "Dosage and frequency info overlay", tr: "Doz ve siklik bilgisi kaplama" },
  { en: "Barcode + QR code scanning support", tr: "Barkod + QR kod tarama destegi" },
  { en: "Multi-language medication database", tr: "Çok dilli ilac veritabani" },
];

export default function ARScannerPage() {
  const { lang } = useLang();

  return (
    <div className="mx-auto max-w-4xl px-4 md:px-8 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" />
          {tx("tool.comingSoon", lang)}
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{tx("ar.title", lang)}</h1>
        <p className="text-gray-600 dark:text-gray-400">{tx("ar.subtitle", lang)}</p>
      </div>

      {/* Concept Preview */}
      <div className="relative mb-10 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 p-8 text-center">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-4 w-24 h-24 border-2 border-cyan-400 rounded-lg animate-pulse" />
          <div className="absolute bottom-8 right-8 w-32 h-20 border-2 border-cyan-400 rounded-lg animate-pulse" style={{ animationDelay: "0.5s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-2 border-cyan-400 rounded-xl" />
        </div>
        <Smartphone className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
        <p className="text-white text-lg font-semibold mb-2">
          {lang === "tr" ? "WebXR Tabanli İlaç Tarayici" : "WebXR-Based Drug Scanner"}
        </p>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          {lang === "tr"
            ? "Ek uygulama gerektirmeden tarayicinizdan calisan artirilmis gerceklik deneyimi"
            : "Augmented reality experience running directly from your browser — no app required"}
        </p>
      </div>

      {/* How It Works */}
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        {lang === "tr" ? "Nasil Calisacak?" : "How It Will Work"}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-start gap-4 p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-bold text-sm">
              {i + 1}
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white mb-1">{s.title[lang]}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{s.desc[lang]}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Capabilities */}
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        {lang === "tr" ? "Yetenekler" : "Capabilities"}
      </h2>
      <div className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
        <ul className="space-y-2.5">
          {CAPABILITIES.map((c, i) => (
            <li key={i} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 flex-shrink-0" />
              {c[lang]}
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-amber-700 dark:text-amber-400">
          {lang === "tr"
            ? "AR Tarayici WebXR API destekleyen modern tarayicilarda calisacaktir. iOS Safari destegi sinirli olabilir."
            : "AR Scanner will work on modern browsers supporting WebXR API. iOS Safari support may be limited."}
        </p>
      </div>
    </div>
  );
}
