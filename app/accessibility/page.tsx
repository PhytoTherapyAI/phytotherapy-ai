"use client";

import { Accessibility, Type, Mic, Layout, Dumbbell, Scale, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface Section {
  icon: React.ElementType;
  title: { en: string; tr: string };
  color: string;
  items: Array<{ title: { en: string; tr: string }; desc: { en: string; tr: string } }>;
}

const SECTIONS: Section[] = [
  {
    icon: Type,
    title: { en: "Visual Accessibility", tr: "Gorsel Erisilebilirlik" },
    color: "text-blue-500",
    items: [
      { title: { en: "Font Size Adjustment", tr: "Yazi Boyutu Ayarlama" }, desc: { en: "Use your browser's zoom (Ctrl/Cmd + to enlarge, Ctrl/Cmd - to reduce). All our pages are responsive and adapt to zoom levels.", tr: "Tarayicinizin zum'unu kullaniniz (Ctrl/Cmd + buyutmek, Ctrl/Cmd - kucultmek icin). Tum sayfalarimiz duyarlidir ve zum duzeylerine uyum saglar." } },
      { title: { en: "High Contrast Mode", tr: "Yüksek Kontrast Modu" }, desc: { en: "Use your operating system's high contrast mode or dark mode for better readability.", tr: "Daha iyi okunabilirlik icin isletim sisteminizin yüksek kontrast modunu veya karanlik modunu kullanin." } },
      { title: { en: "Screen Readers", tr: "Ekran Okuyucular" }, desc: { en: "Our app is built with semantic HTML and ARIA labels. Compatible with NVDA, JAWS, VoiceOver, and TalkBack.", tr: "Uygulamamiz semantik HTML ve ARIA etiketleriyle oluşturulmustur. NVDA, JAWS, VoiceOver ve TalkBack ile uyumludur." } },
    ],
  },
  {
    icon: Mic,
    title: { en: "Voice & Audio", tr: "Ses & Isitsel" },
    color: "text-purple-500",
    items: [
      { title: { en: "Voice Input (Coming Soon)", tr: "Sesli Giris (Yakinda)" }, desc: { en: "Describe your symptoms or ask health questions using your voice. Planned for future updates.", tr: "Sesyinizi kullanarak semptomlarinizi anlatin veya saglik sorulari sorun. Gelecek guncellemeler icin planlaniyor." } },
      { title: { en: "Text-to-Speech", tr: "Metin Okuma" }, desc: { en: "Use your device's built-in text-to-speech to have AI responses read aloud.", tr: "AI yanitlarinin sesli okunmasi icin cihazinizin yerlesik metin okuma ozelligini kullaniniz." } },
    ],
  },
  {
    icon: Layout,
    title: { en: "Simplified UI Mode (Concept)", tr: "Basitlestirilmis Arayuz (Konsept)" },
    color: "text-green-500",
    items: [
      { title: { en: "Large Buttons", tr: "Buyuk Dugmeler" }, desc: { en: "Planned: A simplified view with larger touch targets for users with motor difficulties.", tr: "Planlanan: Motor guclugu olan kullanicilar icin daha buyuk dokunma hedefleriyle basitlestirilmis gorunum." } },
      { title: { en: "Reduced Complexity", tr: "Azaltilmis Karmasiklik" }, desc: { en: "Planned: Essential features only, removing advanced options for easier navigation.", tr: "Planlanan: Daha kolay navigasyon icin gelismis secenekleri kaldirarak yalnizca temel ozellikler." } },
    ],
  },
  {
    icon: Dumbbell,
    title: { en: "Adaptive Exercise", tr: "Uyarlanmis Egzersiz" },
    color: "text-teal-500",
    items: [
      { title: { en: "Seated Exercises", tr: "Oturarak Egzersizler" }, desc: { en: "All stretching and yoga routines include seated alternatives for wheelchair users.", tr: "Tum esneme ve yoga rutinleri tekerlekli sandalye kullananlar icin oturarak alternatifleri icerir." } },
      { title: { en: "Low-Impact Options", tr: "Düşük Etkili Secenekler" }, desc: { en: "Walking tracker includes wheelchair push distance. Yoga guide includes gentle modifications.", tr: "Yuruyus takipcisi tekerlekli sandalye itme mesafesini icerir. Yoga rehberi nazik modifikasyonlar icerir." } },
      { title: { en: "Visual Impairment Exercises", tr: "Gorme Engelliler Icin Egzersiz" }, desc: { en: "Audio-guided exercises planned for future release.", tr: "Gelecek surumler icin sesli rehberli egzersizler planlaniyor." } },
    ],
  },
  {
    icon: Scale,
    title: { en: "Disability Rights (Turkey)", tr: "Engelli Haklari (Turkiye)" },
    color: "text-amber-500",
    items: [
      { title: { en: "Health Report", tr: "Sağlık Raporu" }, desc: { en: "Disability health report: Apply at any state hospital. Required for benefits.", tr: "Engelli saglik raporu: Herhangi bir devlet hastanesinde basvuru. Haklar icin gerekli." } },
      { title: { en: "Tax Exemptions", tr: "Vergi Muafiyetleri" }, desc: { en: "Income tax reduction based on disability level. Vehicle purchase tax exemption for 90%+ disability.", tr: "Engellilik duzeyine gore gelir vergisi indirimi. %90+ engelliler icin arac alim vergisi muafiyeti." } },
      { title: { en: "Free Public Transport", tr: "Ucretsiz Toplu Tasima" }, desc: { en: "Free public transport in most Turkish cities for disability card holders.", tr: "Cogu Turk sehrinde engelli karti sahipleri icin ucretsiz toplu tasima." } },
      { title: { en: "Home Care Salary", tr: "Evde Bakim Maasi" }, desc: { en: "Monthly payment for caregivers of severely disabled individuals. Apply at SYDV.", tr: "Agir engelli bireylerin bakicilari icin aylik odeme. SYDV'ye basvurun." } },
      { title: { en: "Employment Quota", tr: "Istihdam Kotasi" }, desc: { en: "Companies with 50+ employees must employ 3% disabled workers. Public sector: 4%.", tr: "50+ calisan sirketlerin %3 engelli calistirmasi zorunlu. Kamu sektoru: %4." } },
    ],
  },
  {
    icon: FileText,
    title: { en: "Useful Resources", tr: "Faydali Kaynaklar" },
    color: "text-red-500",
    items: [
      { title: { en: "SHCEK / ASHB", tr: "SHCEK / ASHB" }, desc: { en: "Ministry of Family and Social Services: Main body for disability services in Turkey.", tr: "Aile ve Sosyal Hizmetler Bakanligi: Turkiye'de engelli hizmetleri icin ana kurum." } },
      { title: { en: "Engelli Bilgi Hatti: 183", tr: "Engelli Bilgi Hatti: 183" }, desc: { en: "Call 183 for disability-related questions and guidance in Turkey.", tr: "Turkiye'de engellilikle ilgili sorular ve yonlendirme icin 183'u arayin." } },
      { title: { en: "WHO Disability Resources", tr: "DSO Engellilik Kaynaklari" }, desc: { en: "World Health Organization resources on disability and rehabilitation.", tr: "Dunya Sağlık Orgutu engellilik ve rehabilitasyon kaynaklari." } },
    ],
  },
];

export default function AccessibilityPage() {
  const { lang } = useLang();
  const [expanded, setExpanded] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      <div className="text-center mb-8">
        <Accessibility className="w-10 h-10 text-blue-500 mx-auto mb-3" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{tx("access.title", lang)}</h1>
        <p className="text-gray-600 dark:text-gray-400">{tx("access.subtitle", lang)}</p>
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
                {s.items.map((item, j) => (
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

      <p className="text-xs text-gray-400 text-center mt-6">{tx("disclaimer.tool", lang)}</p>
    </div>
  );
}
