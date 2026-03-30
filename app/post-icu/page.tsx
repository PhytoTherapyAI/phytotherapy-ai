"use client";

import { useState } from "react";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Brain,
  Apple,
  Moon,
  Pill,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Activity,
  Shield,
} from "lucide-react";

interface Section {
  id: string;
  icon: React.ReactNode;
  titleEN: string;
  titleTR: string;
  items: { en: string; tr: string }[];
  badgeEN?: string;
  badgeTR?: string;
  badgeColor?: string;
}

const sections: Section[] = [
  {
    id: "physical",
    icon: <Activity className="w-5 h-5" />,
    titleEN: "Physical Rehabilitation Timeline",
    titleTR: "Fiziksel Rehabilitasyon Zamanlama",
    badgeEN: "Weeks 1-12",
    badgeTR: "Hafta 1-12",
    badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    items: [
      { en: "Week 1-2: Passive range of motion exercises in bed, sit upright 20 min/day", tr: "Hafta 1-2: Yatakta pasif hareket egzersizleri, gunluk 20 dk oturma" },
      { en: "Week 3-4: Active assisted exercises, transfer to chair, short hallway walks", tr: "Hafta 3-4: Yardimli aktif egzersizler, sandalyeye transfer, kisa koridor yuruyusleri" },
      { en: "Week 5-8: Independent walking 10-15 min, light resistance band exercises", tr: "Hafta 5-8: 10-15 dk bagimsiz yuruyus, hafif dirence bandi egzersizleri" },
      { en: "Week 9-12: Gradual return to daily activities, stamina building exercises", tr: "Hafta 9-12: Günlük aktivitelere kademeli donus, dayaniklilik egzersizleri" },
      { en: "ICU-acquired weakness affects up to 80% of ICU survivors — recovery is slow but steady", tr: "YBU kaynaklı kas gucsuzlugu hastalarin %80'ini etkiler — iyileşme yavas ama istikrarlidir" },
      { en: "Track grip strength weekly as a simple progress indicator", tr: "İlerleme gostergesi olarak haftalik kavrama gücü takibi yapin" },
      { en: "Respiratory muscle training: incentive spirometer 10 reps, 3x/day", tr: "Solunum kasi egitimi: tesvikli spirometre 10 tekrar, gunde 3 kez" },
      { en: "Fall prevention: always have support nearby for first 4 weeks", tr: "Dusme onleme: ilk 4 hafta her zaman yakinizda destek bulundurun" },
      { en: "Fatigue management: alternate 30 min activity with 30 min rest", tr: "Yorgunluk yönetimi: 30 dk aktivite ile 30 dk dinlenmeyi degistirin" },
      { en: "Physical therapy referral recommended within first week of discharge", tr: "Taburculuktan sonraki ilk hafta fizyoterapi sevki onerilir" },
    ],
  },
  {
    id: "mental",
    icon: <Brain className="w-5 h-5" />,
    titleEN: "Mental Health Recovery",
    titleTR: "Ruh Sagligi Iyilesmesi",
    badgeEN: "PTSD Risk: 20-30%",
    badgeTR: "TSSB Riski: %20-30",
    badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    items: [
      { en: "PTSD affects 20-30% of ICU survivors — nightmares, flashbacks, hypervigilance", tr: "TSSB YBU hastalarinin %20-30'unda gorulur — kabuslar, flashback, asiri tetikte olma" },
      { en: "Anxiety and depression are common in 30-50% of survivors for up to 12 months", tr: "Anksiyete ve depresyon hastalarin %30-50'sinde 12 aya kadar devam edebilir" },
      { en: "Delirium recovery: confusion and memory gaps may persist for weeks", tr: "Deliryum iyileşmesi: kafa karisikligi ve hafiza boslugu haftalarca surebilir" },
      { en: "Cognitive impairment: difficulty concentrating, word-finding problems are normal", tr: "Bilissel bozukluk: odaklanma güçlüğü, kelime bulma sorunları normaldir" },
      { en: "Keep an ICU diary — writing about your experience helps process trauma", tr: "YBU günlüğü tutun — deneyimlerinizi yazmak travma işlemede yardımcı olur" },
      { en: "Seek professional help if symptoms persist beyond 4 weeks", tr: "Belirtiler 4 haftadan uzun surerse profesyonel yardim alin" },
      { en: "Family members also experience PTSD — include them in recovery plan", tr: "Aile uyeleri de TSSB yasayabilir — onlari iyileşme planina dahil edin" },
      { en: "Peer support groups for ICU survivors show significant benefit", tr: "YBU hayatta kalanlar için akran destek gruplari önemli fayda gosterir" },
      { en: "Sleep disturbances are very common — maintain consistent sleep schedule", tr: "Uyku bozukluklari cok yaygındır — tutarlı uyku programı sürdürmeye çalışın" },
      { en: "Mindfulness and breathing exercises can help manage anxiety episodes", tr: "Farkindalik ve nefes egzersizleri anksiyete ataklarini yonetmeye yardımcı olur" },
    ],
  },
  {
    id: "nutrition",
    icon: <Apple className="w-5 h-5" />,
    titleEN: "Nutrition Rebuilding",
    titleTR: "Beslenme Yeniden Yapilandirmasi",
    badgeEN: "High Protein",
    badgeTR: "Yüksek Protein",
    badgeColor: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    items: [
      { en: "Protein target: 1.2-1.5 g/kg/day to rebuild muscle mass lost in ICU", tr: "Protein hedefi: YBU'da kaybedilen kas kutlesini yeniden oluşturmak için 1.2-1.5 g/kg/gun" },
      { en: "Small frequent meals (5-6/day) if appetite is reduced", tr: "Istah azalmissa kucuk sik öğünler (gunde 5-6)" },
      { en: "Calorie needs are 25-30% higher than normal during recovery", tr: "Iyilesme doneminde kalori ihtiyaci normalden %25-30 daha fazladir" },
      { en: "Vitamin D supplementation often needed — many ICU patients are deficient", tr: "D vitamini takviyesi genellikle gereklidir — bircok YBU hastasinda eksiktir" },
      { en: "Iron and B12 levels should be checked — anemia is common post-ICU", tr: "Demir ve B12 seviyeleri kontrol edilmeli — anemi YBU sonrasi yaygındır" },
      { en: "Hydration: aim for 1.5-2L/day unless fluid-restricted", tr: "Hidrasyon: sivi kısıtlamasi yoksa gunde 1.5-2L hedefleyin" },
      { en: "Oral nutritional supplements (ONS) may bridge the gap if eating is difficult", tr: "Yemek yemek zorsa oral nutrisyonel supplementler (ONS) acigin kapatilmasina yardımcı olabilir" },
      { en: "Zinc supplementation supports wound healing and immune recovery", tr: "Cinko takviyesi yara iyileşmesini ve bağışıklik toparlanmasini destekler" },
      { en: "Avoid alcohol during recovery — it impairs healing and interacts with medications", tr: "Iyilesme surecinde alkolden kacinin — iyileşmeyi bozar ve ilaclarla etkilesir" },
      { en: "Swallowing difficulties (dysphagia) may require modified food textures", tr: "Yutma güçlüğü (disfaji) degistirilmis gida dokusu gerektirebilir" },
    ],
  },
  {
    id: "sleep",
    icon: <Moon className="w-5 h-5" />,
    titleEN: "Sleep Recovery Protocol",
    titleTR: "Uyku Iyilesme Protokolu",
    badgeEN: "Critical",
    badgeTR: "Kritik",
    badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    items: [
      { en: "ICU disrupts circadian rhythm — it takes 4-8 weeks to normalize", tr: "YBU sirkadiyen ritmi bozar — normallesme 4-8 hafta surer" },
      { en: "Set consistent wake/sleep times even if you cannot sleep", tr: "Uyuyamasaniz bile tutarlı uyanma/uyuma saatleri belirleyin" },
      { en: "Morning sunlight exposure (30 min) helps reset internal clock", tr: "Sabah gunes isigina maruz kalma (30 dk) biyolojik saati sifirlamaya yardımcı olur" },
      { en: "Avoid screens 1 hour before bed — blue light worsens sleep disruption", tr: "Yatmadan 1 saat once ekranlardan kacinin — mavi isik uyku bozuklugunu arttırır" },
      { en: "Melatonin 0.5-3mg may help but discuss with your doctor first", tr: "Melatonin 0.5-3mg yardımcı olabilir ancak once doktorunuzla görüşün" },
      { en: "Nightmares are common — trauma-focused CBT can help", tr: "Kabuslar yaygındır — travma odakli BDT yardımcı olabilir" },
      { en: "Keep bedroom cool (18-20C), dark, and quiet", tr: "Yatak odasini serin (18-20C), karanlik ve sessiz tutun" },
      { en: "Limit naps to 20-30 min before 2 PM", tr: "Sekeremeyi ogleden sonra 2'den once 20-30 dk ile sinirlandirin" },
      { en: "Relaxation techniques before bed: progressive muscle relaxation, 4-7-8 breathing", tr: "Yatmadan once gevesme teknikleri: ilerlemeli kas gevsemesi, 4-7-8 nefes" },
      { en: "Report persistent insomnia to your doctor — medication review may be needed", tr: "Devam eden uykusuzlugu doktorunuza bildirin — ilac incelemesi gerekebilir" },
    ],
  },
  {
    id: "medication",
    icon: <Pill className="w-5 h-5" />,
    titleEN: "Medication Review Checklist",
    titleTR: "İlaç İnceleme Kontrol Listesi",
    badgeEN: "Essential",
    badgeTR: "Zorunlu",
    badgeColor: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    items: [
      { en: "Review ALL medications with your doctor within 1 week of discharge", tr: "Taburculuktan sonraki 1 hafta icinde TUM ilaçları doktorunuzla gözden geçirin" },
      { en: "Compare pre-ICU medications with discharge medications — what changed and why?", tr: "YBU öncesi ilaçları taburculuk ilaclarıyla karşılastirin — ne degisti ve neden?" },
      { en: "Check for duplicate medications (hospital + home prescriptions)", tr: "Tekrarlayan ilaclar için kontrol edin (hastane + ev receteleri)" },
      { en: "Verify correct doses — ICU medications are often at different doses", tr: "Doğru dozlari doğrulayin — YBU ilaçları genellikle farklı dozlardadır" },
      { en: "Ask about stopping criteria: when should each medication be discontinued?", tr: "Birakma kriterlerini sorun: her ilac ne zaman kesilmeli?" },
      { en: "Check for drug interactions between old and new medications", tr: "Eski ve yeni ilaclar arasindaki ilac etkilesimlerini kontrol edin" },
      { en: "Antibiotics: complete the full course, do not stop early", tr: "Antibiyotikler: tam kuru tamamlayın, erken birakmayin" },
      { en: "Blood thinners may be new — understand monitoring requirements", tr: "Kan suyulticilari yeni olabilir — izleme gerekliliklerini anlayin" },
      { en: "Pain management: create a tapering plan to avoid dependency", tr: "Ağrı yönetimi: bağımliliktan kacinmak için kademeli azaltma plani oluşturun" },
      { en: "Keep an updated medication list in your wallet and phone", tr: "Cuzdaninizda ve telefonunuzda guncel ilac listesi bulundurun" },
      { en: "Report any new side effects immediately — your body is more sensitive post-ICU", tr: "Yeni yan etkileri hemen bildirin — vücudunuz YBU sonrasi daha hassastir" },
    ],
  },
];

export default function PostICUPage() {
  const { lang } = useLang();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 px-4 py-2 rounded-full text-sm font-medium">
            <Shield className="w-4 h-4" />
            {tx("postIcu.badge", lang)}
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            {tx("postIcu.title", lang)}
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {tx("postIcu.subtitle", lang)}
          </p>
        </div>

        {/* Warning */}
        <Card className="border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 p-4">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              {tx("postIcu.warning", lang)}
            </p>
          </div>
        </Card>

        {/* Sections */}
        {sections.map((section) => (
          <Card key={section.id} className="overflow-hidden">
            <Button
              variant="ghost"
              className="w-full flex items-center justify-between p-4 h-auto hover:bg-muted/50"
              onClick={() => toggle(section.id)}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  {section.icon}
                </div>
                <span className="font-semibold text-left">
                  {lang === "tr" ? section.titleTR : section.titleEN}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {section.badgeEN && (
                  <Badge className={section.badgeColor} variant="secondary">
                    {lang === "tr" ? section.badgeTR : section.badgeEN}
                  </Badge>
                )}
                {expanded[section.id] ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </Button>
            {expanded[section.id] && (
              <div className="px-4 pb-4 space-y-2">
                {section.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors"
                  >
                    <Heart className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">
                      {item[lang as "en" | "tr"]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-4">
          {tx("postIcu.footer", lang)}
        </div>
      </div>
    </div>
  );
}
