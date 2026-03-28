"use client";

import { useState } from "react";
import { Globe, Phone, MapPin, Syringe, Pill, FileText, ChevronDown, ChevronUp, AlertTriangle, ExternalLink } from "lucide-react";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface GuideSection {
  icon: React.ElementType;
  title: { en: string; tr: string };
  color: string;
  content: Array<{ title: { en: string; tr: string }; desc: { en: string; tr: string } }>;
}

const SECTIONS: GuideSection[] = [
  {
    icon: MapPin,
    title: { en: "How to Access Healthcare", tr: "Sağlık Hizmetlerine Nasil Erisirsiniz" },
    color: "text-teal-500",
    content: [
      { title: { en: "Step 1: Register at Immigration Office", tr: "Adim 1: Goc Idaresine Kayit" }, desc: { en: "Get your temporary protection ID or residence permit from the Provincial Directorate of Migration Management.", tr: "Il Goc Idaresi Mudurlugu'nden gecici koruma kimliginizi veya ikamet izninizi aliniz." } },
      { title: { en: "Step 2: Register at a Family Health Center (ASM)", tr: "Adim 2: Aile Sağlık Merkezi'ne (ASM) Kayit" }, desc: { en: "Go to the nearest ASM with your ID to register with a family doctor. This is free.", tr: "En yakin ASM'ye kimliginizle gidin, aile hekimine kayit yaptirin. Bu ucretsizdir." } },
      { title: { en: "Step 3: Get Your SGK Coverage", tr: "Adim 3: SGK Kapsamina Girin" }, desc: { en: "Temporary protection holders receive free healthcare through SGK. Registration at immigration office activates this.", tr: "Gecici koruma sahipleri SGK uzerinden ucretsiz saglik hizmeti alir. Goc idaresindeki kayit bunu aktive eder." } },
      { title: { en: "Emergency: No Registration Needed", tr: "Acil: Kayit Gerekli Degil" }, desc: { en: "Emergency rooms (Acil Servis) cannot refuse anyone regardless of legal status. Call 112 for emergencies.", tr: "Acil servisler yasal durumdan bagimsiz olarak kimseyi geri ceviremez. Aciller icin 112'yi arayin." } },
    ],
  },
  {
    icon: Syringe,
    title: { en: "Vaccination Catch-Up", tr: "Asi Tamamlama" },
    color: "text-blue-500",
    content: [
      { title: { en: "Children's Vaccines", tr: "Cocuk Asilari" }, desc: { en: "Free childhood vaccination program at ASMs. Bring any previous vaccination records. Catch-up schedules available for missed vaccines.", tr: "ASM'lerde ucretsiz cocukluk cagi asi programi. Onceki asi kayitlarinizi getirin. Kacirilmis asilar icin tamamlama programlari mevcuttur." } },
      { title: { en: "Adult Vaccinations", tr: "Yetiskin Asilari" }, desc: { en: "Hepatitis B, tetanus, and seasonal flu vaccines available free. COVID-19 vaccines at ASMs.", tr: "Hepatit B, tetanoz ve mevsimsel grip asilari ucretsiz mevcuttur. COVID-19 asilari ASM'lerde." } },
      { title: { en: "Pregnancy Vaccinations", tr: "Gebelik Asilari" }, desc: { en: "Td vaccine (tetanus-diphtheria) required during pregnancy. Free at ASMs.", tr: "Gebelikte Td asisi (tetanoz-difteri) gereklidir. ASM'lerde ucretsizdir." } },
    ],
  },
  {
    icon: Pill,
    title: { en: "Medication Equivalent Finder", tr: "İlaç Esdeger Bulucu" },
    color: "text-purple-500",
    content: [
      { title: { en: "Finding Your Medication", tr: "İlaçınizi Bulma" }, desc: { en: "Use our Drug Info tool to search for your medication's Turkish equivalent. Enter the generic/active ingredient name (not brand name) for best results.", tr: "İlaçınizin Turkiye'deki essdegerini bulmak icin İlaç Bilgi aracimizi kullaniniz. En iyi sonuclar icin etken madde adini girin (marka adi degil)." } },
      { title: { en: "Prescription Requirements", tr: "Recete Gereksinimleri" }, desc: { en: "Most medications require a prescription from a Turkish doctor. Some OTC medications may differ from your home country.", tr: "Cogu ilac Turk doktor recetesi gerektirir. Bazi recetesiz ilaclar anavataninizdakinden farkli olabilir." } },
      { title: { en: "SGK Drug Coverage", tr: "SGK İlaç Karsilamasi" }, desc: { en: "Many medications are covered by SGK with minimal copay. Ask your pharmacy about SGK coverage.", tr: "Bircok ilac SGK tarafından minimal katki payiyla karsilanir. Eczanenize SGK kapsamini sorun." } },
    ],
  },
  {
    icon: Phone,
    title: { en: "Emergency Numbers & Hotlines", tr: "Acil Numaralar & Yardim Hatlari" },
    color: "text-red-500",
    content: [
      { title: { en: "112 - Emergency (Ambulance/Fire/Police)", tr: "112 - Acil (Ambulans/Itfaiye/Polis)" }, desc: { en: "Available 24/7. Multilingual operators available in some cities.", tr: "7/24 kullanilabilir. Bazi sehirlerde cok dilli operatorler mevcuttur." } },
      { title: { en: "182 - SABIM (Patient Rights)", tr: "182 - SABIM (Hasta Haklari)" }, desc: { en: "Report healthcare access issues, file complaints about denied service.", tr: "Sağlık hizmeti erisim sorunlarini bildirin, reddedilen hizmet hakkinda sikayet dosyalayin." } },
      { title: { en: "183 - Social Support Line", tr: "183 - Sosyal Destek Hatti" }, desc: { en: "Social services information, disability services, family support.", tr: "Sosyal hizmetler bilgisi, engelli hizmetleri, aile destegi." } },
      { title: { en: "157 - Human Trafficking Hotline", tr: "157 - Insan Ticareti Yardim Hatti" }, desc: { en: "Confidential reporting and assistance for trafficking victims.", tr: "Insan ticareti magdurlari icin gizli bildirim ve yardim." } },
    ],
  },
  {
    icon: FileText,
    title: { en: "Useful Resources", tr: "Faydali Kaynaklar" },
    color: "text-amber-500",
    content: [
      { title: { en: "UNHCR Turkey", tr: "UNHCR Turkiye" }, desc: { en: "UN Refugee Agency - legal support, registration assistance, healthcare guidance.", tr: "BM Multeci Ajansi - hukuki destek, kayit yardimi, saglik hizmeti rehberligi." } },
      { title: { en: "IOM Turkey", tr: "IOM Turkiye" }, desc: { en: "International Organization for Migration - health assessments, travel health.", tr: "Uluslararasi Goc Orgutu - saglik degerlendirmeleri, seyahat sagligi." } },
      { title: { en: "Community Health Centers (SASAM)", tr: "Toplum Sağlık Merkezleri (SASAM)" }, desc: { en: "Migrant health centers in major cities with interpreters.", tr: "Buyuk sehirlerde tercumanli gocmen saglik merkezleri." } },
    ],
  },
];

export default function ImmigrantHealthPage() {
  const { lang } = useLang();
  const [expanded, setExpanded] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      <div className="text-center mb-8">
        <Globe className="w-10 h-10 text-teal-500 mx-auto mb-3" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{tx("immigrant.title", lang)}</h1>
        <p className="text-gray-600 dark:text-gray-400">{tx("immigrant.subtitle", lang)}</p>
      </div>

      {/* Multi-language note */}
      <div className="mb-6 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-200 dark:border-teal-800 flex items-start gap-3">
        <Globe className="w-5 h-5 text-teal-500 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-teal-700 dark:text-teal-400">
          {lang === "tr"
            ? "Bu rehber Turkce ve Ingilizce mevcuttur. Dil degistirmek icin sag ust kosedeki dil dugmesini kullaniniz."
            : "This guide is available in Turkish and English. Use the language toggle in the top right to switch."}
          <br />
          <span className="text-xs opacity-70">Arabic (planned) | Farsi (planned) | Dari (planned) | French (planned)</span>
        </p>
      </div>

      <div className="space-y-3">
        {SECTIONS.map((s, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <button onClick={() => setExpanded(expanded === i ? null : i)} className="w-full p-5 text-left flex items-center justify-between">
              <div className="flex items-center gap-3">
                <s.icon className={`w-5 h-5 ${s.color}`} />
                <p className="font-semibold text-gray-900 dark:text-white">{s.title[lang]}</p>
              </div>
              {expanded === i ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </button>
            {expanded === i && (
              <div className="px-5 pb-5 space-y-3">
                {s.content.map((item, j) => (
                  <div key={j} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="font-medium text-sm text-gray-900 dark:text-white mb-1">{item.title[lang]}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc[lang]}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Emergency box */}
      <div className="mt-6 p-5 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 text-center">
        <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="font-bold text-red-800 dark:text-red-300 text-lg">112</p>
        <p className="text-sm text-red-700 dark:text-red-400">
          {lang === "tr"
            ? "Acil durumlarda 112'yi arayin. Kayit veya kimlik gerekmez."
            : "Call 112 for emergencies. No registration or ID required."}
        </p>
      </div>

      <p className="text-xs text-gray-400 text-center mt-6">{tx("disclaimer.tool", lang)}</p>
    </div>
  );
}
