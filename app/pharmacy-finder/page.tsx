// © 2026 DoctoPal — All Rights Reserved
"use client";

import { useState, useEffect } from "react";
import { MapPin, Search, ExternalLink, Pill, Clock, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import { shouldAskPermission, syncPermissionState } from "@/lib/permission-state";
import { PermissionBottomSheet } from "@/components/permissions/PermissionBottomSheet";

const PHARMACY_LINKS = [
  {
    nameEn: "Turkish Pharmacists' Association — On-Duty Pharmacies",
    nameTr: "Turk Eczacilar Birligi — Nobetci Eczaneler",
    url: "https://www.teb.org.tr",
    descEn: "Official on-duty pharmacy finder for all cities in Turkey",
    descTr: "Türkiye genelinde nobetci eczane bulucu",
    icon: <MapPin className="w-5 h-5" />,
  },
  {
    nameEn: "e-Nabiz Pharmacy Locator",
    nameTr: "e-Nabiz Eczane Bulucu",
    url: "https://enabiz.gov.tr",
    descEn: "Government health portal with nearby pharmacy search",
    descTr: "Devlet sağlık portali ile yakin eczane arama",
    icon: <Search className="w-5 h-5" />,
  },
  {
    nameEn: "Google Maps — Pharmacies Near Me",
    nameTr: "Google Maps — Yakinlardaki Eczaneler",
    url: "https://www.google.com/maps/search/pharmacy+near+me",
    descEn: "Find pharmacies nearby with opening hours and directions",
    descTr: "Yakinlardaki eczaneleri çalışma saatleri ve yol tarifiyle bulun",
    icon: <Clock className="w-5 h-5" />,
  },
];

const COMMON_EQUIVALENTS: Record<string, string[]> = {
  Paracetamol: ["Parol", "Minoset", "Tylol", "Calpol", "Nurofen (Ibuprofen - different)"],
  Ibuprofen: ["Advil", "Nurofen", "Brufen", "Dolgit"],
  Metformin: ["Glifor", "Glucophage", "Matofin", "Diaformin"],
  Omeprazole: ["Omeprol", "Losec", "Prilosec", "Omestad"],
  Amoxicillin: ["Largopen", "Amoklavin (with clavulanate)", "Amoxil", "Augmentin (with clavulanate)"],
  Atorvastatin: ["Lipitor", "Ator", "Etken"],
  Losartan: ["Cozaar", "Losacar", "Losartan Potasyum"],
  Amlodipine: ["Norvasc", "Amlodis", "Amlodipin"],
};

export default function PharmacyFinderPage() {
  const { lang } = useLang();
  const [searchTerm, setSearchTerm] = useState("");
  const [showLocationPerm, setShowLocationPerm] = useState(false);

  useEffect(() => {
    // Sync permission state from Supabase, then check
    syncPermissionState().then(() => {
      if (shouldAskPermission("location")) {
        setTimeout(() => setShowLocationPerm(true), 800);
      }
    });
  }, []);

  const filteredEquivalents = searchTerm.trim().length >= 2
    ? Object.entries(COMMON_EQUIVALENTS).filter(
        ([key, vals]) =>
          key.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vals.some((v) => v.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{tx("pharmacy.title", lang)}</h1>
          <p className="text-gray-600 dark:text-gray-400">{tx("pharmacy.subtitle", lang)}</p>
        </div>

        {/* External Links */}
        <div className="space-y-3 mb-8">
          {PHARMACY_LINKS.map((link, i) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-green-100 dark:border-gray-700 p-5 hover:shadow-md transition-shadow group"
            >
              <div className="text-green-600 dark:text-green-400">{link.icon}</div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                  {link[lang === "tr" ? "nameTr" : "nameEn"] as string}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {link[lang === "tr" ? "descTr" : "descEn"] as string}
                </p>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-green-500 transition-colors" />
            </a>
          ))}
        </div>

        {/* Emergency Pharmacy */}
        <a
          href="tel:112"
          className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-2xl p-4 mb-8 transition-colors"
        >
          <Phone className="w-5 h-5" />
          <span className="font-medium">
            {tx("pharmacy.callOnDuty", lang)}
          </span>
        </a>

        {/* Medication Equivalent Search */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-green-100 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Pill className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {tx("pharmacy.equivSearch", lang)}
            </h2>
          </div>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={tx("pharmacy.searchPlaceholder", lang)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {filteredEquivalents.length > 0 ? (
            <div className="space-y-3">
              {filteredEquivalents.map(([generic, brands]) => (
                <div key={generic} className="bg-green-50 dark:bg-green-900/10 rounded-xl p-4">
                  <p className="font-semibold text-green-800 dark:text-green-400 mb-2">
                    {tx("pharmacy.generic", lang)}: {generic}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {brands.map((b) => (
                      <span key={b} className="text-xs px-2 py-1 rounded-full bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-green-200 dark:border-gray-600">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : searchTerm.trim().length >= 2 ? (
            <p className="text-center text-gray-400 dark:text-gray-500 py-4 text-sm">
              {tx("pharmacy.noResults", lang)}
            </p>
          ) : (
            <p className="text-center text-gray-400 dark:text-gray-500 py-4 text-sm">
              {tx("pharmacy.enterToFind", lang)}
            </p>
          )}
        </div>

        {/* Disclaimer */}
        <div className="mt-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {tx("pharmacy.disclaimer", lang)}
          </p>
        </div>
      </div>

      {/* Location Permission Bottom Sheet */}
      <PermissionBottomSheet
        type="location"
        open={showLocationPerm}
        onGranted={() => {
          setShowLocationPerm(false);
          // Could open Google Maps with user's location
          window.open("https://www.google.com/maps/search/pharmacy+near+me", "_blank");
        }}
        onDismissed={() => setShowLocationPerm(false)}
      />
    </div>
  );
}
