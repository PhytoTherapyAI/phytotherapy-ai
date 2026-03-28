"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Sun,
  Snowflake,
  Flower2,
  Leaf,
  CheckCircle2,
  AlertTriangle,
  Pill,
  Heart,
  Swords,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase";

type Season = "winter" | "spring" | "summer" | "autumn";
type EvidenceGrade = "A" | "B" | "C";

interface SeasonalSupplement {
  nameEN: string;
  nameTR: string;
  dose: string;
  duration: string;
  grade: EvidenceGrade;
  descriptionEN: string;
  descriptionTR: string;
}

interface LifestyleTip {
  en: string;
  tr: string;
}

interface ChecklistItem {
  en: string;
  tr: string;
}

interface SeasonData {
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  supplements: SeasonalSupplement[];
  lifestyle: LifestyleTip[];
  checklist: ChecklistItem[];
}

const SEASON_DATA: Record<Season, SeasonData> = {
  winter: {
    icon: Snowflake,
    colorClass: "text-blue-600 dark:text-blue-400",
    bgClass: "bg-blue-50 dark:bg-blue-950/30",
    borderClass: "border-blue-200 dark:border-blue-800",
    supplements: [
      {
        nameEN: "Vitamin D3",
        nameTR: "D3 Vitamini",
        dose: "2000-4000 IU/day",
        duration: "Oct - Mar",
        grade: "A",
        descriptionEN: "Essential for bone health, immune function, and mood regulation during reduced sunlight exposure.",
        descriptionTR: "Azalan gunes isigi doneminde kemik sagligi, bagisiklik fonksiyonu ve ruh hali duzenlenmesi icin gereklidir.",
      },
      {
        nameEN: "Vitamin C",
        nameTR: "C Vitamini",
        dose: "500-1000 mg/day",
        duration: "Throughout winter",
        grade: "B",
        descriptionEN: "Supports immune defense and may reduce cold duration.",
        descriptionTR: "Bagisiklik savunmasini destekler ve soguk alginligi suresini kisaltabilir.",
      },
      {
        nameEN: "Zinc",
        nameTR: "Cinko",
        dose: "15-30 mg/day",
        duration: "During illness or 2-3 months preventive",
        grade: "A",
        descriptionEN: "Critical for immune cell function. Most effective when taken at onset of cold symptoms.",
        descriptionTR: "Bagisiklik hucre fonksiyonu icin kritiktir. Soguk alginligi belirtilerinin baslangicindan alindiginda en etkilidir.",
      },
      {
        nameEN: "Elderberry",
        nameTR: "Murver",
        dose: "600-900 mg/day extract",
        duration: "Up to 5 days during illness",
        grade: "B",
        descriptionEN: "May reduce duration and severity of flu symptoms.",
        descriptionTR: "Grip belirtilerinin sure ve siddetini azaltabilir.",
      },
    ],
    lifestyle: [
      { en: "Use a light therapy lamp (10,000 lux) for 20-30 min each morning", tr: "Her sabah 20-30 dk isik terapisi lambasi kullanin (10.000 lux)" },
      { en: "Maintain indoor humidity between 40-60% to protect airways", tr: "Hava yollarini korumak icin ic ortam nemini %40-60 arasinda tutun" },
      { en: "Keep regular sleep schedule despite shorter days", tr: "Kisa gunlere ragmen duzenli uyku programi surdurün" },
      { en: "Stay active with indoor exercise at least 3x per week", tr: "Haftada en az 3 kez ic mekan egzersizi ile aktif kalin" },
      { en: "Wash hands frequently and ventilate rooms regularly", tr: "Elleri sik yikayin ve odalari duzenli havalandirin" },
    ],
    checklist: [
      { en: "Get annual flu vaccination", tr: "Yillik grip asisi olun" },
      { en: "Check Vitamin D levels", tr: "D vitamini seviyelerinizi kontrol ettirin" },
      { en: "Stock up on herbal teas (ginger, echinacea)", tr: "Bitki caylari stoklayın (zencefil, ekinezya)" },
      { en: "Review winter medication storage (cold-sensitive meds)", tr: "Kis ilac saklamasini gozden gecirin (soguga duyarli ilaclar)" },
      { en: "Set up humidifier in bedroom", tr: "Yatak odasina nemlendirici kurun" },
      { en: "Prepare warm layered clothing for outdoor activity", tr: "Dis mekan aktivitesi icin katmanli giysiler hazirlayin" },
    ],
  },
  spring: {
    icon: Flower2,
    colorClass: "text-pink-600 dark:text-pink-400",
    bgClass: "bg-pink-50 dark:bg-pink-950/30",
    borderClass: "border-pink-200 dark:border-pink-800",
    supplements: [
      {
        nameEN: "Quercetin",
        nameTR: "Kuersetin",
        dose: "500-1000 mg/day",
        duration: "Start 2 weeks before allergy season",
        grade: "B",
        descriptionEN: "Natural antihistamine that stabilizes mast cells. Most effective as prevention.",
        descriptionTR: "Mast hucrelerini stabilize eden dogal antihistaminiktir. Onleme olarak en etkilidir.",
      },
      {
        nameEN: "Nettle Leaf",
        nameTR: "Isirgan Yapragi",
        dose: "300-600 mg/day freeze-dried",
        duration: "Throughout allergy season",
        grade: "B",
        descriptionEN: "Traditional allergy remedy with anti-inflammatory properties.",
        descriptionTR: "Anti-inflamatuar ozelliklere sahip geleneksel alerji ilaci.",
      },
      {
        nameEN: "Probiotics",
        nameTR: "Probiyotikler",
        dose: "10-20 billion CFU/day",
        duration: "Ongoing, minimum 8 weeks",
        grade: "B",
        descriptionEN: "Specific strains (L. rhamnosus, B. lactis) may modulate allergic immune responses.",
        descriptionTR: "Belirli suslar (L. rhamnosus, B. lactis) alerjik bagisiklik yanitlarini duzenleyebilir.",
      },
      {
        nameEN: "Vitamin C",
        nameTR: "C Vitamini",
        dose: "1000 mg/day",
        duration: "During allergy season",
        grade: "B",
        descriptionEN: "Acts as a natural antihistamine and supports immune balance.",
        descriptionTR: "Dogal antihistaminik gorevi gorur ve bagisiklik dengesini destekler.",
      },
    ],
    lifestyle: [
      { en: "Monitor daily pollen counts and plan outdoor activities accordingly", tr: "Gunluk polen sayimlarini izleyin ve dis mekan aktivitelerini buna gore planlayin" },
      { en: "Shower and change clothes after being outdoors", tr: "Dis mekandan dondukten sonra dus alin ve elbise degistirin" },
      { en: "Use HEPA air purifiers indoors during high pollen days", tr: "Yuksek polenli gunlerde ic mekanda HEPA hava temizleyici kullanin" },
      { en: "Start spring exercise routine gradually", tr: "Bahar egzersiz rutinine yavascak baslayin" },
      { en: "Clean and air out winter bedding", tr: "Kis yatak takimlarini temizleyin ve havalandirin" },
    ],
    checklist: [
      { en: "Check allergy medication supply", tr: "Alerji ilaci stogunuzu kontrol edin" },
      { en: "Clean air filters and vents at home", tr: "Evdeki hava filtrelerini ve menfezleri temizleyin" },
      { en: "Start quercetin 2 weeks before peak season", tr: "Doruk mevsimden 2 hafta once kuersetine baslayin" },
      { en: "Schedule allergy testing if needed", tr: "Gerekirse alerji testi yaptirin" },
      { en: "Review spring exercise and nutrition plan", tr: "Bahar egzersiz ve beslenme planini gozden gecirin" },
    ],
  },
  summer: {
    icon: Sun,
    colorClass: "text-orange-600 dark:text-orange-400",
    bgClass: "bg-orange-50 dark:bg-orange-950/30",
    borderClass: "border-orange-200 dark:border-orange-800",
    supplements: [
      {
        nameEN: "Electrolytes",
        nameTR: "Elektrolitler",
        dose: "As needed with hydration",
        duration: "During heat/exercise",
        grade: "A",
        descriptionEN: "Essential for preventing dehydration and heat-related illness during summer activities.",
        descriptionTR: "Yaz aktiviteleri sirasinda dehidratasyon ve isiyla ilgili hastaliklari onlemek icin gereklidir.",
      },
      {
        nameEN: "Vitamin C",
        nameTR: "C Vitamini",
        dose: "500 mg/day",
        duration: "Throughout summer",
        grade: "B",
        descriptionEN: "Antioxidant protection against UV-induced oxidative stress.",
        descriptionTR: "UV kaynakli oksidatif strese karsi antioksidan koruma.",
      },
      {
        nameEN: "Aloe Vera",
        nameTR: "Aloe Vera",
        dose: "Topical as needed / 50ml juice daily",
        duration: "As needed for sunburn / daily for gut",
        grade: "C",
        descriptionEN: "Topical use soothes sunburn. Oral gel may support digestive health.",
        descriptionTR: "Topikal kullanimda gunes yanigini yatistirir. Oral jel sindirim sagligini destekleyebilir.",
      },
      {
        nameEN: "Probiotics",
        nameTR: "Probiyotikler",
        dose: "10-20 billion CFU/day",
        duration: "Especially when traveling",
        grade: "B",
        descriptionEN: "Helps prevent traveler's diarrhea and supports gut health in heat.",
        descriptionTR: "Gezgin ishali onlemeye yardimci olur ve sicakta bagirsak sagligini destekler.",
      },
    ],
    lifestyle: [
      { en: "Drink at least 2.5-3L water daily, more during exercise", tr: "Gunluk en az 2.5-3L su icin, egzersiz sirasinda daha fazla" },
      { en: "Apply SPF 30+ sunscreen and reapply every 2 hours", tr: "SPF 30+ gunes kremi surün ve her 2 saatte bir yenileyin" },
      { en: "Avoid strenuous outdoor activity during 11am-4pm", tr: "Saat 11-16 arasi yogun dis mekan aktivitesinden kacinin" },
      { en: "Eat water-rich fruits and vegetables (watermelon, cucumber)", tr: "Su bakimindan zengin meyve ve sebzeler tuketin (karpuz, salatalik)" },
      { en: "Check medication storage — some need refrigeration in heat", tr: "Ilac saklamasini kontrol edin — bazilari sicakta buzdolabi gerektirir" },
    ],
    checklist: [
      { en: "Stock up on electrolyte solutions", tr: "Elektrolit solüsyonları stoklayın" },
      { en: "Check sunscreen expiry dates", tr: "Gunes kremi son kullanma tarihlerini kontrol edin" },
      { en: "Set hydration reminders on phone", tr: "Telefona su icme hatirlaticilari kurun" },
      { en: "Prepare insect repellent", tr: "Bocek kovucu hazirlayin" },
      { en: "Review heat-sensitive medication storage", tr: "Isiya duyarli ilac saklamasini gozden gecirin" },
      { en: "Plan outdoor exercise for early morning or evening", tr: "Dis mekan egzersizlerini sabah erkenden veya aksama planlayin" },
    ],
  },
  autumn: {
    icon: Leaf,
    colorClass: "text-amber-600 dark:text-amber-400",
    bgClass: "bg-amber-50 dark:bg-amber-950/30",
    borderClass: "border-amber-200 dark:border-amber-800",
    supplements: [
      {
        nameEN: "Vitamin D3",
        nameTR: "D3 Vitamini",
        dose: "1000-2000 IU/day",
        duration: "Start in September/October",
        grade: "A",
        descriptionEN: "Begin supplementation as daylight decreases to maintain optimal levels through winter.",
        descriptionTR: "Kis boyunca optimal seviyeleri korumak icin gun isigi azaldikca takviyeye baslayin.",
      },
      {
        nameEN: "Echinacea",
        nameTR: "Ekinezya",
        dose: "300-500 mg/day standardized extract",
        duration: "8 weeks on, 1 week off",
        grade: "B",
        descriptionEN: "May reduce the risk and duration of common colds when taken preventively.",
        descriptionTR: "Onleyici olarak alindiginda soguk alginligi riskini ve suresini azaltabilir.",
      },
      {
        nameEN: "Zinc",
        nameTR: "Cinko",
        dose: "15 mg/day",
        duration: "Through flu season",
        grade: "A",
        descriptionEN: "Supports immune function as cold and flu season approaches.",
        descriptionTR: "Soguk alginligi ve grip mevsimi yaklasirken bagisiklik fonksiyonunu destekler.",
      },
      {
        nameEN: "Probiotics",
        nameTR: "Probiyotikler",
        dose: "10-20 billion CFU/day",
        duration: "Ongoing",
        grade: "B",
        descriptionEN: "Strengthens gut-immune axis before winter illness season.",
        descriptionTR: "Kis hastalik mevsiminden once bagirsak-bagisiklik ekseni güçlendirir.",
      },
    ],
    lifestyle: [
      { en: "Gradually adjust to earlier darkness — maintain light exposure in mornings", tr: "Erken karanliga yavascak uyum saglayin — sabahlari isik maruziyetini surdurün" },
      { en: "Begin immune-boosting nutrition (garlic, ginger, turmeric in cooking)", tr: "Bagisiklik guclendiren beslenmeye baslayin (yemeklerde sarimsak, zencefil, zerdecal)" },
      { en: "Get flu vaccination in October-November", tr: "Ekim-Kasim'da grip asisi olun" },
      { en: "Start indoor exercise alternatives for rainy days", tr: "Yagmurlu gunler icin ic mekan egzersiz alternatifleri baslayin" },
      { en: "Review and update medication supplies for winter", tr: "Kis icin ilac stoklarini gozden gecirin ve guncelleyin" },
    ],
    checklist: [
      { en: "Schedule flu vaccination", tr: "Grip asisi randevusu alin" },
      { en: "Start Vitamin D supplementation", tr: "D vitamini takviyesine baslayin" },
      { en: "Stock up on immune support supplements", tr: "Bagisiklik destek takviyeleri stoklayın" },
      { en: "Prepare cold and flu home remedies", tr: "Soguk alginligi ve grip icin ev ilaclari hazirlayin" },
      { en: "Check heating system and indoor air quality", tr: "Isitma sistemini ve ic hava kalitesini kontrol edin" },
      { en: "Review winter health insurance coverage", tr: "Kis saglik sigortasi kapsamini gozden gecirin" },
    ],
  },
};

function getCurrentSeason(): Season {
  const month = new Date().getMonth(); // 0-11
  if (month >= 11 || month <= 1) return "winter";
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  return "autumn";
}

const gradeColors: Record<EvidenceGrade, string> = {
  A: "bg-green-100 text-green-700 border-green-300 dark:bg-green-950/30 dark:text-green-400 dark:border-green-700",
  B: "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-700",
  C: "bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600",
};

export default function SeasonalHealthPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();
  const [currentSeason] = useState<Season>(getCurrentSeason());
  const [selectedSeason, setSelectedSeason] = useState<Season>(currentSeason);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [userMedications, setUserMedications] = useState<string[]>([]);

  const fetchMedications = useCallback(async () => {
    if (!isAuthenticated || !session?.access_token) return;
    try {
      const supabase = createBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: meds } = await supabase
        .from("user_medications")
        .select("brand_name, generic_name")
        .eq("user_id", user.id)
        .eq("is_active", true);
      if (meds) {
        setUserMedications(meds.map((m: { brand_name: string | null; generic_name: string | null }) => m.generic_name || m.brand_name || ""));
      }
    } catch {
      // Silent
    }
  }, [isAuthenticated, session?.access_token]);

  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);

  const seasonData = SEASON_DATA[selectedSeason];
  const SeasonIcon = seasonData.icon;

  const seasons: { key: Season; icon: React.ElementType }[] = [
    { key: "winter", icon: Snowflake },
    { key: "spring", icon: Flower2 },
    { key: "summer", icon: Sun },
    { key: "autumn", icon: Leaf },
  ];

  const toggleCheck = (key: string) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const gradeLabel = (grade: EvidenceGrade) => {
    if (grade === "A") return tx("seasonal.gradeA", lang);
    if (grade === "B") return tx("seasonal.gradeB", lang);
    return tx("seasonal.gradeC", lang);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className={`rounded-lg p-3 ${seasonData.bgClass}`}>
          <SeasonIcon className={`h-6 w-6 ${seasonData.colorClass}`} />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
            {tx("seasonal.title", lang)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {tx("seasonal.subtitle", lang)}
          </p>
        </div>
      </div>

      {/* Season Selector */}
      <div className="mb-6 flex gap-2">
        {seasons.map((s) => {
          const Icon = s.icon;
          const isActive = selectedSeason === s.key;
          const isCurrent = currentSeason === s.key;
          return (
            <button
              key={s.key}
              onClick={() => setSelectedSeason(s.key)}
              className={`flex flex-1 flex-col items-center gap-1 rounded-lg border p-3 text-xs font-medium transition-colors ${
                isActive
                  ? `${SEASON_DATA[s.key].bgClass} ${SEASON_DATA[s.key].borderClass} ${SEASON_DATA[s.key].colorClass}`
                  : "hover:bg-muted/50"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? SEASON_DATA[s.key].colorClass : "text-muted-foreground"}`} />
              <span>{tx(`seasonal.${s.key}`, lang)}</span>
              {isCurrent && (
                <span className="rounded-full bg-foreground/10 px-1.5 py-0.5 text-[9px]">
                  {tx("seasonal.currentSeason", lang)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Profile Warning */}
      {isAuthenticated && userMedications.length > 0 && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <div>
            <p className="font-medium">{tx("seasonal.profileWarning", lang)}</p>
            <p className="mt-1 text-muted-foreground">
              {lang === "tr" ? "Aktif ilaclariniz:" : "Your active medications:"}{" "}
              {userMedications.join(", ")}
            </p>
          </div>
        </div>
      )}

      {/* Supplements */}
      <div className="mb-6">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Pill className={`h-4 w-4 ${seasonData.colorClass}`} />
          {tx("seasonal.supplements", lang)}
        </h2>
        <div className="space-y-3">
          {seasonData.supplements.map((supp, i) => (
            <div key={i} className={`rounded-lg border p-4 ${seasonData.bgClass} ${seasonData.borderClass}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold">
                      {lang === "tr" ? supp.nameTR : supp.nameEN}
                    </h3>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${gradeColors[supp.grade]}`}>
                      {supp.grade} — {gradeLabel(supp.grade)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {lang === "tr" ? supp.descriptionTR : supp.descriptionEN}
                  </p>
                  <div className="mt-2 flex gap-4 text-xs">
                    <span className="font-medium">
                      <Shield className="mr-1 inline h-3 w-3" />
                      {tx("seasonal.dose", lang)}: {supp.dose}
                    </span>
                    <span className="text-muted-foreground">
                      {tx("seasonal.duration", lang)}: {supp.duration}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lifestyle Tips */}
      <div className="mb-6">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Heart className={`h-4 w-4 ${seasonData.colorClass}`} />
          {tx("seasonal.lifestyle", lang)}
        </h2>
        <div className="space-y-2">
          {seasonData.lifestyle.map((tip, i) => (
            <div key={i} className="flex items-start gap-2 rounded-lg border p-3">
              <span className={`mt-0.5 ${seasonData.colorClass}`}>•</span>
              <p className="text-sm">{lang === "tr" ? tip.tr : tip.en}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Checklist */}
      <div className="mb-6">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <CheckCircle2 className={`h-4 w-4 ${seasonData.colorClass}`} />
          {tx("seasonal.checklist", lang)}
        </h2>
        <div className="space-y-1">
          {seasonData.checklist.map((item, i) => {
            const key = `${selectedSeason}-${i}`;
            return (
              <label
                key={key}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                  checkedItems[key] ? "bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800" : "hover:bg-muted/30"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checkedItems[key] || false}
                  onChange={() => toggleCheck(key)}
                  className="h-4 w-4 rounded accent-green-600"
                />
                <span className={`text-sm ${checkedItems[key] ? "line-through text-muted-foreground" : ""}`}>
                  {lang === "tr" ? item.tr : item.en}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Boss Fight Link */}
      <div className={`rounded-lg border p-4 ${seasonData.bgClass} ${seasonData.borderClass}`}>
        <div className="flex items-center gap-3">
          <Swords className={`h-8 w-8 ${seasonData.colorClass}`} />
          <div className="flex-1">
            <h3 className="text-sm font-semibold">{tx("seasonal.bossFight", lang)}</h3>
            <p className="text-xs text-muted-foreground">
              {lang === "tr"
                ? "Mevsimsel saglik gorevleri icin Boss Fight protokollerine goz atin!"
                : "Check out Boss Fight protocols for seasonal health challenges!"}
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="gap-1">
              <Swords className="h-3 w-3" />
              {lang === "tr" ? "Git" : "Go"}
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <p className="mt-6 text-center text-xs text-muted-foreground">
        {tx("disclaimer.tool", lang)}
      </p>
    </div>
  );
}
