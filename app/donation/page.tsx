// © 2026 Phytotherapy.ai — All Rights Reserved
"use client";

import { useState, useEffect } from "react";
import { Heart, Droplets, Plus, Trash2, AlertTriangle, ExternalLink, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface DonationEntry {
  id: string;
  type: "blood" | "platelet" | "plasma";
  date: string;
  location: string;
}

const BLOOD_COMPATIBILITY: Record<string, { canDonateTo: string[]; canReceiveFrom: string[] }> = {
  "O-": { canDonateTo: ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"], canReceiveFrom: ["O-"] },
  "O+": { canDonateTo: ["O+", "A+", "B+", "AB+"], canReceiveFrom: ["O-", "O+"] },
  "A-": { canDonateTo: ["A-", "A+", "AB-", "AB+"], canReceiveFrom: ["O-", "A-"] },
  "A+": { canDonateTo: ["A+", "AB+"], canReceiveFrom: ["O-", "O+", "A-", "A+"] },
  "B-": { canDonateTo: ["B-", "B+", "AB-", "AB+"], canReceiveFrom: ["O-", "B-"] },
  "B+": { canDonateTo: ["B+", "AB+"], canReceiveFrom: ["O-", "O+", "B-", "B+"] },
  "AB-": { canDonateTo: ["AB-", "AB+"], canReceiveFrom: ["O-", "A-", "B-", "AB-"] },
  "AB+": { canDonateTo: ["AB+"], canReceiveFrom: ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"] },
};

const BLOOD_TYPES = Object.keys(BLOOD_COMPATIBILITY);

const CONTRAINDICATION_MEDS = [
  { meds: { en: "Anticoagulants (Warfarin, Heparin)", tr: "Antikoagulanlar (Warfarin, Heparin)" }, status: "defer", note: { en: "Cannot donate while taking blood thinners", tr: "Kan sulandirici alirken bagis yapilamaz" } },
  { meds: { en: "Isotretinoin (Accutane)", tr: "Izotretinoin (Accutane)" }, status: "defer", note: { en: "1-month deferral after last dose", tr: "Son dozdan 1 ay erteleme" } },
  { meds: { en: "Finasteride (Propecia)", tr: "Finasterid (Propecia)" }, status: "defer", note: { en: "1-month deferral after last dose", tr: "Son dozdan 1 ay erteleme" } },
  { meds: { en: "Antibiotics", tr: "Antibiyotikler" }, status: "defer", note: { en: "Can donate once infection is resolved and antibiotic course completed", tr: "Enfeksiyon cozulup antibiyotik kuru tamamlandiktan sonra bagis yapilabilir" } },
  { meds: { en: "Most OTC pain relievers (Aspirin, Ibuprofen)", tr: "Çoğu recetesiz ağrı kesiciler (Aspirin, Ibuprofen)" }, status: "ok", note: { en: "Generally OK for whole blood donation", tr: "Tam kan bagisi için genellikle uygun" } },
];

const CENTERS = [
  { name: "Kizilay", url: "https://www.kizilay.org.tr/kan-bagisi", desc: { en: "Turkish Red Crescent - nationwide blood centers", tr: "Turk Kizilayi - ulke genelinde kan merkezleri" } },
  { name: "E-Nabiz Organ Bagisi", url: "https://enabiz.gov.tr", desc: { en: "Register for organ donation via E-Nabiz", tr: "E-Nabiz uzerinden organ bagisi kaydı" } },
];

export default function DonationPage() {
  const { profile } = useAuth();
  const { lang } = useLang();
  const [selectedType, setSelectedType] = useState<string>("");
  const [entries, setEntries] = useState<DonationEntry[]>([]);
  const [newDate, setNewDate] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newType, setNewType] = useState<"blood" | "platelet" | "plasma">("blood");

  useEffect(() => {
    const saved = localStorage.getItem("donation-history");
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  const saveEntries = (updated: DonationEntry[]) => {
    setEntries(updated);
    localStorage.setItem("donation-history", JSON.stringify(updated));
  };

  const addEntry = () => {
    if (!newDate) return;
    const entry: DonationEntry = { id: Date.now().toString(), type: newType, date: newDate, location: newLocation };
    saveEntries([entry, ...entries]);
    setNewDate(""); setNewLocation("");
  };

  const compat = selectedType ? BLOOD_COMPATIBILITY[selectedType] : null;

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      <div className="text-center mb-8">
        <Heart className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{tx("donation.title", lang)}</h1>
        <p className="text-gray-600 dark:text-gray-400">{tx("donation.subtitle", lang)}</p>
      </div>

      {/* Blood Type Compatibility */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Droplets className="w-5 h-5 text-red-500" /> {tx("donation.bloodCompatibility", lang)}
        </h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {BLOOD_TYPES.map((bt) => (
            <button
              key={bt}
              onClick={() => setSelectedType(bt === selectedType ? "" : bt)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${bt === selectedType ? "bg-red-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"}`}
            >
              {bt}
            </button>
          ))}
        </div>
        {compat && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-xs font-medium text-green-600 mb-2">{tx("donation.canDonateTo", lang)}</p>
              <div className="flex flex-wrap gap-1.5">
                {compat.canDonateTo.map((t) => <span key={t} className="px-2 py-0.5 bg-green-100 dark:bg-green-800/40 text-green-700 dark:text-green-400 rounded text-xs font-medium">{t}</span>)}
              </div>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs font-medium text-blue-600 mb-2">{tx("donation.canReceiveFrom", lang)}</p>
              <div className="flex flex-wrap gap-1.5">
                {compat.canReceiveFrom.map((t) => <span key={t} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-800/40 text-blue-700 dark:text-blue-400 rounded text-xs font-medium">{t}</span>)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Medication Contraindications */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" /> {tx("donation.contraindications", lang)}
        </h3>
        <div className="space-y-2">
          {CONTRAINDICATION_MEDS.map((m, i) => (
            <div key={i} className={`p-3 rounded-lg ${m.status === "defer" ? "bg-amber-50 dark:bg-amber-900/10" : "bg-green-50 dark:bg-green-900/10"}`}>
              <div className="flex items-center gap-2">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${m.status === "defer" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                  {m.status === "defer" ? tx("donation.defer", lang) : "OK"}
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{m.meds[lang]}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-12">{m.note[lang]}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Donation History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{tx("donation.history", lang)}</h3>
        <div className="flex gap-2 mb-3">
          <select value={newType} onChange={(e) => setNewType(e.target.value as "blood" | "platelet" | "plasma")} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm">
            <option value="blood">{tx("donation.blood", lang)}</option>
            <option value="platelet">{tx("donation.platelet", lang)}</option>
            <option value="plasma">{tx("donation.plasma", lang)}</option>
          </select>
          <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm" />
          <Button onClick={addEntry} disabled={!newDate} size="sm" className="bg-red-600 hover:bg-red-700 text-white"><Plus className="w-4 h-4" /></Button>
        </div>
        {entries.length > 0 ? (
          <div className="space-y-2">
            {entries.map((e) => (
              <div key={e.id} className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Droplets className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{e.type}</span>
                  <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar className="w-3 h-3" />{e.date}</span>
                </div>
                <button onClick={() => saveEntries(entries.filter((x) => x.id !== e.id))} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-2">{tx("donation.noRecords", lang)}</p>
        )}
      </div>

      {/* Centers */}
      <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 p-5 mb-6">
        <h3 className="font-semibold text-red-800 dark:text-red-300 mb-3">{tx("donation.centers", lang)}</h3>
        <div className="space-y-2">
          {CENTERS.map((c, i) => (
            <a key={i} href={c.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{c.name}</p>
                <p className="text-xs text-gray-500">{c.desc[lang]}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-red-500" />
            </a>
          ))}
        </div>
      </div>

      {/* Organ Donation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{tx("donation.organDonation", lang)}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {tx("donation.organDesc", lang)}
        </p>
        <a href="https://enabiz.gov.tr" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium">
          {tx("donation.registerENabiz", lang)} <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <p className="text-xs text-gray-400 text-center mt-6">{tx("disclaimer.tool", lang)}</p>
    </div>
  );
}
