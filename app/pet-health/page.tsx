"use client";

import { useState } from "react";
import { PawPrint, AlertTriangle, ChevronDown, ChevronUp, Shield, Bug, Baby, Cat, Dog } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface ZoonoticDisease {
  name: { en: string; tr: string };
  source: { en: string; tr: string };
  transmission: { en: string; tr: string };
  symptoms: { en: string; tr: string };
  prevention: { en: string; tr: string };
  riskGroups: { en: string; tr: string };
  severity: "high" | "moderate" | "low";
}

const DISEASES: ZoonoticDisease[] = [
  {
    name: { en: "Toxoplasmosis", tr: "Toksoplazmoz" },
    source: { en: "Cats (feces)", tr: "Kediler (dışkı)" },
    transmission: { en: "Contact with infected cat feces, contaminated soil, or undercooked meat", tr: "Enfekte kedi diskisi, kontamine toprak veya az pismis etle temas" },
    symptoms: { en: "Usually asymptomatic in healthy adults. Flu-like symptoms possible.", tr: "Sağlıkli yetiskinlerde genellikle semptomsuz. Grip benzeri semptomlar mümkün." },
    prevention: { en: "Wear gloves when cleaning litter. Wash hands after. Pregnant women should avoid litter duty.", tr: "Kum temizlerken eldiven giyiniz. Sonra ellerinizi yikayiniz. Hamile kadinlar kum temizleme görevinden kacinmali." },
    riskGroups: { en: "CRITICAL for pregnant women (birth defects) and immunosuppressed patients", tr: "Hamile kadinlar (dogum kusuru) ve immunsuprese hastalar için KRITIK" },
    severity: "high",
  },
  {
    name: { en: "Ringworm (Dermatophytosis)", tr: "Saclı Deri Mantarı (Dermatofitoz)" },
    source: { en: "Cats, Dogs, Rabbits", tr: "Kediler, Kopekler, Tavsanlar" },
    transmission: { en: "Direct skin contact with infected animal or contaminated surfaces", tr: "Enfekte hayvan veya kontamine yuzeylerle doğrudan cilt temasi" },
    symptoms: { en: "Red, itchy, ring-shaped rash on skin", tr: "Ciltte kirmizi, kaşıntıli, halka seklinde dokuuntu" },
    prevention: { en: "Wash hands after handling pets. Treat pet infections promptly. Don't share towels.", tr: "Evcil hayvanlara dokunduktan sonra ellerinizi yikayiniz. Hayvan enfeksiyonlarini derhal tedavi ediniz." },
    riskGroups: { en: "Children and immunosuppressed patients", tr: "Cocuklar ve immunsuprese hastalar" },
    severity: "low",
  },
  {
    name: { en: "Cat Scratch Disease (Bartonellosis)", tr: "Kedi Tirmalama Hastaligi (Bartonelloz)" },
    source: { en: "Cats (especially kittens)", tr: "Kediler (ozellikle yavrular)" },
    transmission: { en: "Cat scratch or bite, flea bites", tr: "Kedi tirmigi veya isirmasi, pire isirmasi" },
    symptoms: { en: "Swollen lymph nodes, fever, fatigue near scratch site", tr: "Sisimmis lenf dugumleri, ates, tirmalama bolgesinde yorgunluk" },
    prevention: { en: "Avoid rough play. Trim cat nails. Treat flea infestations. Wash scratches immediately.", tr: "Sert oyundan kacininiz. Kedi tirnaklarini kesiniz. Pire istilalarini tedavi ediniz. Tirmiklari hemen yikayiniz." },
    riskGroups: { en: "Immunosuppressed patients (can cause severe systemic disease)", tr: "Immunsuprese hastalar (ciddi sistemik hastalıka neden olabilir)" },
    severity: "moderate",
  },
  {
    name: { en: "Leptospirosis", tr: "Leptospirozis" },
    source: { en: "Dogs, Rodents", tr: "Kopekler, Kemirgenler" },
    transmission: { en: "Contact with infected animal urine, contaminated water", tr: "Enfekte hayvan idrari, kontamine su ile temas" },
    symptoms: { en: "High fever, headache, muscle pain, jaundice in severe cases", tr: "Yüksek ates, bas ağrısi, kas ağrısi, ciddi vakalarda sarillik" },
    prevention: { en: "Vaccinate dogs. Avoid stagnant water. Wear protective gear when cleaning.", tr: "Kopekleri asilayiniz. Durgun sudan kacininiz. Temizlerken koruyucu ekipman giyiniz." },
    riskGroups: { en: "Outdoor workers, farmers, flood-exposed populations", tr: "Dis mekan calisanlari, ciftciler, sel maruz nufuslar" },
    severity: "high",
  },
  {
    name: { en: "Psittacosis (Parrot Fever)", tr: "Psittakoz (Papagan Hastaligi)" },
    source: { en: "Birds (parrots, budgies, pigeons)", tr: "Kuslar (papagan, muhabbet kusu, guvercin)" },
    transmission: { en: "Inhaling dried bird droppings or feather dust", tr: "Kurumus kus diskalari veya tuy tozunu soluma" },
    symptoms: { en: "Pneumonia-like: fever, cough, headache, muscle pain", tr: "Pnomoni benzeri: ates, oksuruk, bas ağrısi, kas ağrısi" },
    prevention: { en: "Clean cages regularly with wet methods. Good ventilation. Wear mask when cleaning.", tr: "Kafesleri duzzenli olarak islak yontemlerle temizleyiniz. Iyi havalandirma. Temizlerken maske takiniz." },
    riskGroups: { en: "Elderly, immunosuppressed, bird handlers", tr: "Yaslilar, immunsuprese, kus bakicilari" },
    severity: "moderate",
  },
];

const BITE_PROTOCOL = [
  { en: "Wash wound immediately with soap and running water for 15 minutes", tr: "Yarayi hemen sabun ve akan suyla 15 dakika yikayiniz" },
  { en: "Apply antiseptic (povidone-iodine preferred)", tr: "Antiseptik uygulayiniz (povidon-iyot tercih)" },
  { en: "Do NOT close the wound with stitches (infection risk)", tr: "Yarayi dikisle KAPATMAYIN (enfeksiyon riski)" },
  { en: "Go to emergency room for tetanus and rabies evaluation", tr: "Tetanoz ve kuduz degerlendirmesi için acil servise gidiniz" },
  { en: "Report the bite to local authorities if from unknown animal", tr: "Bilinmeyen hayvandan isirmaysa yerel yetkililere bildirinniz" },
];

const PREGNANCY_CAT_GUIDE = [
  { en: "Someone else should clean the litter box daily", tr: "Kum kabini baskasi her gun temizlemeli" },
  { en: "If you must clean it, wear gloves and wash hands thoroughly", tr: "Siz temizlemeniz gerekiyorsa eldiven giyin ve elleri iyice yikayiniz" },
  { en: "Keep cats indoors to prevent new Toxoplasma infection", tr: "Yeni Toxoplasma enfeksiyonunu önlemek için kedileri ic mekanda tutunuz" },
  { en: "Don't adopt new cats or handle strays during pregnancy", tr: "Hamilelik sirasinda yeni kedi sahiplenmeyin veya sokak kedilerine dokunmayiniz" },
  { en: "You do NOT need to give up your cat - just take precautions", tr: "Kedinizden vazgecmenize gerek YOK - sadece onlemlere uyunuz" },
  { en: "Get tested for Toxoplasma antibodies (IgG/IgM) early in pregnancy", tr: "Hameligin başında Toxoplasma antikorlari (IgG/IgM) testi yaptirin" },
];

const severityColor = (s: string) => {
  if (s === "high") return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  if (s === "moderate") return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
  return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
};

export default function PetHealthPage() {
  const { profile } = useAuth();
  const { lang } = useLang();
  const [expanded, setExpanded] = useState<number | null>(null);

  const isPregnant = profile?.is_pregnant === true;
  const conditions = Array.isArray(profile?.chronic_conditions) ? profile.chronic_conditions.join(" ").toLowerCase() : "";
  const isImmunosuppressed = conditions.includes("immuno") || conditions.includes("hiv") || conditions.includes("transplant");

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      <div className="text-center mb-8">
        <PawPrint className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{tx("pet.title", lang)}</h1>
        <p className="text-gray-600 dark:text-gray-400">{tx("pet.subtitle", lang)}</p>
      </div>

      {/* Profile-aware warnings */}
      {isPregnant && (
        <div className="mb-6 p-5 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-3">
            <Baby className="w-6 h-6 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold text-red-800 dark:text-red-300">
                {lang === "tr" ? "Hamilelik + Kedi Rehberi" : "Pregnancy + Cat Guide"}
              </p>
              <ul className="mt-2 space-y-1.5">
                {PREGNANCY_CAT_GUIDE.map((g, i) => (
                  <li key={i} className="text-sm text-red-700 dark:text-red-400 flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />{g[lang]}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {isImmunosuppressed && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 flex items-start gap-3">
          <Shield className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-400">
            {lang === "tr"
              ? "Immunsuprese hastalar zoonotik enfeksiyonlara karsi daha savunmasizdir. Evcil hayvan hijyenine ekstra dikkat ediniz ve veterinerinizle düzenlii iletisime geciniz."
              : "Immunosuppressed patients are more vulnerable to zoonotic infections. Pay extra attention to pet hygiene and consult your vet regularly."}
          </p>
        </div>
      )}

      {/* Zoonotic Diseases */}
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        {lang === "tr" ? "Zoonotik Hastalıklar" : "Zoonotic Diseases"}
      </h2>
      <div className="space-y-3 mb-10">
        {DISEASES.map((d, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <button onClick={() => setExpanded(expanded === i ? null : i)} className="w-full p-5 text-left flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bug className="w-5 h-5 text-amber-500" />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{d.name[lang]}</p>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${severityColor(d.severity)}`}>
                      {d.severity === "high" ? tx("common.high", lang) : d.severity === "moderate" ? tx("common.moderate", lang) : tx("common.low", lang)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{d.source[lang]}</p>
                </div>
              </div>
              {expanded === i ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </button>
            {expanded === i && (
              <div className="px-5 pb-5 space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">{lang === "tr" ? "Bulasma" : "Transmission"}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{d.transmission[lang]}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">{tx("common.symptoms", lang)}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{d.symptoms[lang]}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">{lang === "tr" ? "Korunma" : "Prevention"}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{d.prevention[lang]}</p>
                </div>
                <div className="p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg">
                  <p className="text-xs font-medium text-amber-600 mb-0.5">{lang === "tr" ? "Risk Gruplari" : "Risk Groups"}</p>
                  <p className="text-sm text-amber-700 dark:text-amber-400">{d.riskGroups[lang]}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bite/Scratch Protocol */}
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        {lang === "tr" ? "Isirma / Tirmalama Protokolu" : "Bite / Scratch Protocol"}
      </h2>
      <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 p-5 mb-6">
        <ol className="space-y-2">
          {BITE_PROTOCOL.map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-red-700 dark:text-red-400">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-300 flex items-center justify-center text-xs font-bold">{i + 1}</span>
              {step[lang]}
            </li>
          ))}
        </ol>
      </div>

      <p className="text-xs text-gray-400 text-center mt-6">{tx("disclaimer.tool", lang)}</p>
    </div>
  );
}
