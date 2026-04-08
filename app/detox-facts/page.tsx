// © 2026 DoctoPal — All Rights Reserved
"use client";

import { useState } from "react";
import { Leaf, CheckCircle2, XCircle, AlertTriangle, ChevronDown, ChevronUp, Beaker } from "lucide-react";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface DetoxItem {
  name: { en: string; tr: string };
  verdict: "works" | "myth" | "partial";
  grade: string;
  claim: { en: string; tr: string };
  reality: { en: string; tr: string };
  evidence: { en: string; tr: string };
  safetyNote?: { en: string; tr: string };
}

const ITEMS: DetoxItem[] = [
  {
    name: { en: "Milk Thistle (Silymarin)", tr: "Deve Dikeni (Silimarin)" },
    verdict: "works",
    grade: "B",
    claim: { en: "Detoxifies and protects the liver", tr: "Karacigeri detoks yapar ve korur" },
    reality: { en: "Silymarin has hepatoprotective properties. Used clinically for alcoholic liver disease and mushroom poisoning. Not a general 'detox' but genuinely supports liver function.", tr: "Silimarin hepatoprotektif özelliklere sahiptir. Alkolik karaciğer hastaligi ve mantar zehirlenmesinde klinik olarak kullanilir. Genel bir 'detoks' degil ama gerçekten karaciğer fonksiyonunu destekler." },
    evidence: { en: "Multiple RCTs show liver enzyme improvement. Grade B evidence.", tr: "Birden fazla RCT karaciğer enzim iyileşmesi gostermektedir. Derece B kanit." },
    safetyNote: { en: "Generally safe. May interact with certain medications (statins, anticoagulants).", tr: "Genel olarak güvenli. Bazi ilaclarla (statinler, antikoagulanlar) etkilesime girebilir." },
  },
  {
    name: { en: "Juice Cleanse / Detox Diets", tr: "Meyve Suyu Detoksu / Detoks Diyetleri" },
    verdict: "myth",
    grade: "D",
    claim: { en: "Removes toxins from the body by drinking only juices for days", tr: "Gunlerce sadece meyve suyu icerek vucuttan toksinleri atar" },
    reality: { en: "Your liver and kidneys already detoxify continuously. Juice cleanses provide no additional benefit, may cause blood sugar spikes, muscle loss, and nutrient deficiencies.", tr: "Karaciger ve böbrekleriniz zaten surekli detoks yapar. Meyve suyu detokslari ek fayda saglamaz, kan sekeri dalgalanmalarina, kas kaybina ve besin eksikliklerine neden olabilir." },
    evidence: { en: "No clinical evidence supports juice cleanse detoxification. Grade D.", tr: "Meyve suyu detoksifikasyonunu destekleyen klinik kanit yoktur. Derece D." },
  },
  {
    name: { en: "Activated Charcoal", tr: "Aktif Karbon" },
    verdict: "partial",
    grade: "C",
    claim: { en: "Binds toxins in the gut and removes them", tr: "Bağırsaktaki toksinleri baglar ve uzaklastirir" },
    reality: { en: "Effective for acute poisoning in emergency settings (within 1-2 hours). NOT effective for daily 'detox'. Can bind medications and nutrients, reducing their absorption.", tr: "Acil durumlarda akut zehirlenme için etkili (1-2 saat icinde). Günlük 'detoks' için etkili DEGILDIR. İlaç ve besinleri baglayarak emilimlerini azaltabilir." },
    evidence: { en: "Strong evidence for acute poisoning only. No evidence for daily use.", tr: "Sadece akut zehirlenme için guclu kanit. Günlük kullanim için kanit yok." },
    safetyNote: { en: "DANGEROUS if taken with medications — can block drug absorption!", tr: "İlaçlarla birlikte alinirsa TEHLIKELI — ilac emilimini engelleyebilir!" },
  },
  {
    name: { en: "N-Acetyl Cysteine (NAC)", tr: "N-Asetil Sistein (NAC)" },
    verdict: "works",
    grade: "A",
    claim: { en: "Supports liver detoxification and glutathione production", tr: "Karaciger detoksifikasyonunu ve glutatyon uretimini destekler" },
    reality: { en: "NAC is the clinical antidote for acetaminophen (paracetamol) overdose. It replenishes glutathione, the body's master antioxidant. Genuine hepatoprotective agent.", tr: "NAC, asetaminofen (parasetamol) dozaşımı için klinik antidottur. Vücudun ana antioksidani olan glutatyonu yeniler. Gerçek hepatoprotektif ajan." },
    evidence: { en: "Grade A evidence for acetaminophen toxicity. Grade B for general liver support.", tr: "Asetaminofen toksisitesi için Derece A kanit. Genel karaciğer desteği için Derece B." },
    safetyNote: { en: "Generally safe at 600-1200mg/day. Consult doctor if on blood thinners.", tr: "Gunde 600-1200mg'da genel olarak güvenli. Kan sulandirici kullaniyorsaniz doktora danışıniz." },
  },
  {
    name: { en: "Colon Cleanse / Enemas", tr: "Kolon Temizligi / Lavman" },
    verdict: "myth",
    grade: "D",
    claim: { en: "Removes built-up waste and toxins from the colon", tr: "Kolonda biriken atik ve toksinleri temizler" },
    reality: { en: "The colon naturally eliminates waste. Colon cleanses can disrupt electrolyte balance, damage gut flora, and in rare cases cause perforation. No medical indication for 'detox'.", tr: "Kolon doğal olarak atıkları atar. Kolon temizligi elektrolit dengesini bozabilir, bağırsak florasına zarar verebilir ve nadir durumlarda perforasyona neden olabilir." },
    evidence: { en: "No evidence of benefit. Risk of harm documented. Grade D.", tr: "Fayda kanıtı yok. Zarar riski belgelenistir. Derece D." },
  },
  {
    name: { en: "Dandelion Root Tea", tr: "Karahindiba Koku Cayi" },
    verdict: "partial",
    grade: "C",
    claim: { en: "Detoxifies the liver and acts as a diuretic", tr: "Karacigeri detoks yapar ve diuretik olarak etki eder" },
    reality: { en: "Has mild diuretic properties and may support bile production. Not a powerful 'detoxifier' but a reasonable liver-supportive herb with traditional use.", tr: "Hafif diuretik özelliklere sahiptir ve safra uretimini destekleyebilir. Guclu bir 'detoksifiye edici' degil ama geleneksel kullanimli makul bir karaciğer destekleyici bitki." },
    evidence: { en: "Limited human studies. Mostly animal and in-vitro data. Grade C.", tr: "Sinirli insan çalışmalari. Çoğunlukla hayvan ve in-vitro veriler. Derece C." },
  },
  {
    name: { en: "Foot Detox Pads", tr: "Ayak Detoks Pedleri" },
    verdict: "myth",
    grade: "D",
    claim: { en: "Draw toxins out through the feet while you sleep", tr: "Uyurken ayaklardan toksinleri ceker" },
    reality: { en: "The color change is due to a chemical reaction with sweat and moisture, not toxins. Toxins cannot be 'pulled' through the skin in this manner. Complete pseudoscience.", tr: "Renk degisimi toksinlerden degil, ter ve nemle kimyasal reaksiyondan kaynaklanir. Toksinler bu sekilde deriden 'cekilemez'. Tamamen sozde bilim." },
    evidence: { en: "Zero evidence. Multiple analyses show no toxins in used pads. Grade D.", tr: "Sifir kanit. Birden fazla analiz kullanilmis pedlerde toksin olmadigini gostermistir. Derece D." },
  },
];

const verdictStyle = (v: string) => {
  if (v === "works") return { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20", label: { en: "Evidence-Based", tr: "Kanita Dayali" } };
  if (v === "myth") return { icon: XCircle, color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20", label: { en: "Myth / No Evidence", tr: "Mit / Kanit Yok" } };
  return { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20", label: { en: "Partial / Limited", tr: "Kismi / Sinirli" } };
};

export default function DetoxFactsPage() {
  const { lang } = useLang();
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      <div className="text-center mb-8">
        <Beaker className="w-10 h-10 text-green-500 mx-auto mb-3" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{tx("detox.title", lang)}</h1>
        <p className="text-gray-600 dark:text-gray-400">{tx("detox.subtitle", lang)}</p>
      </div>

      {/* Key message */}
      <div className="mb-6 p-5 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
        <p className="text-sm text-green-800 dark:text-green-300 font-medium">
          {tx("detox.keyMessage", lang)}
        </p>
      </div>

      <div className="space-y-3">
        {ITEMS.map((item, i) => {
          const vs = verdictStyle(item.verdict);
          const VIcon = vs.icon;
          return (
            <div key={i} className={`${vs.bg} border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden`}>
              <button
                onClick={() => setExpanded(expanded === i ? null : i)}
                className="w-full p-5 text-left flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <VIcon className={`w-5 h-5 ${vs.color}`} />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{item.name[lang]}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs font-medium ${vs.color}`}>{vs.label[lang]}</span>
                      <span className="text-xs text-gray-400">|</span>
                      <span className="text-xs text-gray-500">{tx("common.evidence", lang)}: {item.grade}</span>
                    </div>
                  </div>
                </div>
                {expanded === i ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </button>
              {expanded === i && (
                <div className="px-5 pb-5 space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">{tx("detox.claim", lang)}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">{item.claim[lang]}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">{tx("detox.reality", lang)}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{item.reality[lang]}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">{tx("common.evidence", lang)}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{item.evidence[lang]}</p>
                  </div>
                  {item.safetyNote && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
                      <p className="text-sm text-amber-700 dark:text-amber-400 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        {item.safetyNote[lang]}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 text-center mt-6">{tx("disclaimer.tool", lang)}</p>
    </div>
  );
}
