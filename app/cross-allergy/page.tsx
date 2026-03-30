// © 2026 Phytotherapy.ai — All Rights Reserved
"use client";

import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, Shield, Flower2, Bug, Shell, Apple, Milk } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx, Lang } from "@/lib/translations";

interface CrossAllergyGroup {
  primary: { en: string; tr: string };
  icon: React.ElementType;
  color: string;
  bg: string;
  crossReactive: Array<{ item: { en: string; tr: string }; risk: "high" | "moderate" | "low" }>;
  mechanism: { en: string; tr: string };
  prevalence: { en: string; tr: string };
}

const GROUPS: CrossAllergyGroup[] = [
  {
    primary: { en: "Latex Allergy", tr: "Lateks Alerjisi" },
    icon: Shield,
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
    crossReactive: [
      { item: { en: "Avocado", tr: "Avokado" }, risk: "high" },
      { item: { en: "Banana", tr: "Muz" }, risk: "high" },
      { item: { en: "Kiwi", tr: "Kivi" }, risk: "high" },
      { item: { en: "Chestnut", tr: "Kestane" }, risk: "high" },
      { item: { en: "Papaya", tr: "Papaya" }, risk: "moderate" },
      { item: { en: "Mango", tr: "Mango" }, risk: "moderate" },
      { item: { en: "Potato", tr: "Patates" }, risk: "low" },
      { item: { en: "Tomato", tr: "Domates" }, risk: "low" },
    ],
    mechanism: { en: "Shared chitinase and hevein-like proteins between latex and these fruits", tr: "Lateks ve bu meyveler arasinda paylasilan kitinaz ve hevein benzeri proteinler" },
    prevalence: { en: "30-50% of latex-allergic patients react to these foods", tr: "Lateks alerjisi olan hastalarin %30-50'si bu gidalara reaksiyon gosterir" },
  },
  {
    primary: { en: "Birch Pollen Allergy", tr: "Huş Poleni Alerjisi" },
    icon: Flower2,
    color: "text-green-600",
    bg: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
    crossReactive: [
      { item: { en: "Apple", tr: "Elma" }, risk: "high" },
      { item: { en: "Peach", tr: "Seftali" }, risk: "high" },
      { item: { en: "Cherry", tr: "Kiraz" }, risk: "high" },
      { item: { en: "Carrot", tr: "Havuc" }, risk: "high" },
      { item: { en: "Celery", tr: "Kereviz" }, risk: "moderate" },
      { item: { en: "Hazelnut", tr: "Findik" }, risk: "moderate" },
      { item: { en: "Almond", tr: "Badem" }, risk: "moderate" },
      { item: { en: "Soy", tr: "Soya" }, risk: "low" },
    ],
    mechanism: { en: "Bet v 1 homologous proteins (PR-10 family) cause Oral Allergy Syndrome", tr: "Bet v 1 homolog proteinler (PR-10 ailesi) Oral Alerji Sendromuna neden olur" },
    prevalence: { en: "50-70% of birch pollen allergics experience oral allergy syndrome", tr: "Hus poleni alerjisi olanlarin %50-70'i oral alerji sendromu yasar" },
  },
  {
    primary: { en: "Shellfish Allergy", tr: "Kabuklu Deniz Urunu Alerjisi" },
    icon: Shell,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
    crossReactive: [
      { item: { en: "Dust mites", tr: "Toz akarları" }, risk: "high" },
      { item: { en: "Cockroach", tr: "Hamam bocegi" }, risk: "high" },
      { item: { en: "Other crustaceans", tr: "Diger kabuklular" }, risk: "high" },
      { item: { en: "Mollusks (squid, snail)", tr: "Yumusakcalar (kalamar, salyangoz)" }, risk: "moderate" },
      { item: { en: "Insects (cricket protein)", tr: "Bocekler (cikcik proteini)" }, risk: "moderate" },
    ],
    mechanism: { en: "Shared tropomyosin protein across arthropods and mollusks", tr: "Eklem bacaklilar ve yumusakcalar arasinda paylasilan tropomiyozin proteini" },
    prevalence: { en: "Cross-reactivity with dust mites in 60-80% of cases", tr: "Vakalarin %60-80'inde toz akarlariyla capraz reaktivite" },
  },
  {
    primary: { en: "Grass Pollen Allergy", tr: "Cimen Poleni Alerjisi" },
    icon: Flower2,
    color: "text-lime-600",
    bg: "bg-lime-50 dark:bg-lime-900/20 border-lime-200 dark:border-lime-800",
    crossReactive: [
      { item: { en: "Wheat", tr: "Bugday" }, risk: "moderate" },
      { item: { en: "Melon", tr: "Kavun" }, risk: "moderate" },
      { item: { en: "Watermelon", tr: "Karpuz" }, risk: "moderate" },
      { item: { en: "Orange", tr: "Portakal" }, risk: "low" },
      { item: { en: "Tomato", tr: "Domates" }, risk: "low" },
    ],
    mechanism: { en: "Profilin and polcalcin cross-reactivity between grass pollen and foods", tr: "Cimen poleni ve gidalar arasinda profilin ve polkalsinn capraz reaktivitesi" },
    prevalence: { en: "20% of grass pollen allergics may react to these foods", tr: "Cimen poleni alerjisi olanlarin %20'si bu gidalara reaksiyon gostereiblir" },
  },
  {
    primary: { en: "Cow's Milk Allergy", tr: "Inek Sutu Alerjisi" },
    icon: Milk,
    color: "text-purple-600",
    bg: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800",
    crossReactive: [
      { item: { en: "Goat's milk", tr: "Keci sutu" }, risk: "high" },
      { item: { en: "Sheep's milk", tr: "Koyun sutu" }, risk: "high" },
      { item: { en: "Buffalo milk", tr: "Manda sutu" }, risk: "high" },
      { item: { en: "Beef", tr: "Siğir eti" }, risk: "moderate" },
      { item: { en: "Mare's milk", tr: "Kisrak sutu" }, risk: "low" },
    ],
    mechanism: { en: "Casein proteins are highly conserved across ruminant species", tr: "Kazein proteinleri gevisen turler arasinda yüksek oranda korunmustur" },
    prevalence: { en: "90%+ cross-reactivity between cow and goat/sheep milk", tr: "Inek ile keci/koyun sutu arasinda %90+ capraz reaktivite" },
  },
  {
    primary: { en: "Penicillin Allergy", tr: "Penisilin Alerjisi" },
    icon: Bug,
    color: "text-red-600",
    bg: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
    crossReactive: [
      { item: { en: "Amoxicillin", tr: "Amoksisilin" }, risk: "high" },
      { item: { en: "Ampicillin", tr: "Ampisilin" }, risk: "high" },
      { item: { en: "Cephalosporins (1st gen)", tr: "Sefalosporinler (1. nesil)" }, risk: "moderate" },
      { item: { en: "Cephalosporins (3rd gen)", tr: "Sefalosporinler (3. nesil)" }, risk: "low" },
      { item: { en: "Carbapenems", tr: "Karbapenemler" }, risk: "low" },
    ],
    mechanism: { en: "Beta-lactam ring structure shared across penicillin-class antibiotics", tr: "Penisilin sinifi antibiyotikler arasinda paylasilan beta-laktam halka yapisi" },
    prevalence: { en: "1-2% true cross-reactivity with cephalosporins (lower than previously thought)", tr: "Sefalosporinlerle %1-2 gerçek capraz reaktivite (daha once dusuunuldugunden düşük)" },
  },
];

const riskBadge = (risk: "high" | "moderate" | "low") => {
  if (risk === "high") return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400";
  if (risk === "moderate") return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400";
  return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400";
};

const riskLabel = (risk: string, lang: Lang) => {
  if (risk === "high") return tx("common.high", lang);
  if (risk === "moderate") return tx("common.moderate", lang);
  return tx("common.low", lang);
};

export default function CrossAllergyPage() {
  const { profile } = useAuth();
  const { lang } = useLang();
  const [expanded, setExpanded] = useState<number | null>(null);

  // Check user allergies for highlights
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userAllergies = (profile as any)?.allergies as string[] | undefined;

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      <div className="text-center mb-8">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{tx("crossallergy.title", lang)}</h1>
        <p className="text-gray-600 dark:text-gray-400">{tx("crossallergy.subtitle", lang)}</p>
      </div>

      {userAllergies && userAllergies.length > 0 && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
            {tx("crossAllergy.profileHighlight", lang)}
          </p>
        </div>
      )}

      <div className="space-y-4">
        {GROUPS.map((g, i) => (
          <div key={i} className={`${g.bg} border rounded-xl overflow-hidden`}>
            <button
              onClick={() => setExpanded(expanded === i ? null : i)}
              className="w-full p-5 text-left flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <g.icon className={`w-6 h-6 ${g.color}`} />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{g.primary[lang]}</p>
                  <p className="text-xs text-gray-500">{g.crossReactive.length} {tx("crossAllergy.crossReactiveItems", lang)}</p>
                </div>
              </div>
              {expanded === i ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </button>
            {expanded === i && (
              <div className="px-5 pb-5 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {g.crossReactive.map((cr, j) => (
                    <div key={j} className="flex items-center justify-between gap-2 p-2.5 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                      <span className="text-sm text-gray-800 dark:text-gray-200">{cr.item[lang]}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${riskBadge(cr.risk)}`}>{riskLabel(cr.risk, lang)}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">{tx("crossAllergy.mechanism", lang)}</p>
                    <p className="text-gray-600 dark:text-gray-400">{g.mechanism[lang]}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">{tx("crossAllergy.prevalence", lang)}</p>
                    <p className="text-gray-600 dark:text-gray-400">{g.prevalence[lang]}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 text-center mt-6">{tx("disclaimer.tool", lang)}</p>
    </div>
  );
}
