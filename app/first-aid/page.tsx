// © 2026 DoctoPal — All Rights Reserved
"use client";

import { useState } from "react";
import { Cross, Phone, ChevronDown, ChevronUp, Heart, Flame, Bug, Skull, Bone, Wind, Baby, Droplets, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/components/layout/language-toggle";
import { tx, txObj } from "@/lib/translations";

interface FirstAidSection {
  id: string;
  icon: React.ReactNode;
  titleEn: string;
  titleTr: string;
  color: string;
  borderColor: string;
  stepsEn: string[];
  stepsTr: string[];
  warningEn?: string;
  warningTr?: string;
}

const SECTIONS: FirstAidSection[] = [
  {
    id: "cpr",
    icon: <Heart className="w-5 h-5" />,
    titleEn: "CPR (Cardiopulmonary Resuscitation)",
    titleTr: "KPR (Kardiyopulmoner Resusitasyon)",
    color: "text-red-600 dark:text-red-400",
    borderColor: "border-red-200 dark:border-red-800",
    stepsEn: [
      "Check the scene is safe, then check the person for responsiveness.",
      "Call 112 (or 911) immediately or ask someone else to call.",
      "Place the person on their back on a firm, flat surface.",
      "Place the heel of one hand on the center of the chest, between the nipples.",
      "Place your other hand on top and interlock fingers.",
      "Push hard and fast: 5-6 cm deep, 100-120 compressions per minute.",
      "After 30 compressions, tilt the head back, lift the chin, give 2 rescue breaths.",
      "Continue 30:2 ratio until help arrives or the person recovers.",
    ],
    stepsTr: [
      "Ortamin güvenli olduğunu kontrol edin, kisiyi bilince kontrol edin.",
      "Hemen 112'yi arayın veya birinden aramasıni isteyin.",
      "Kisiyi sert ve duz bir zemine sirt ustu yatirin.",
      "Bir elinizin topu kismini göğüs kafesinin ortasina, meme uclari hizasina yerlestirin.",
      "Diger elinizi ustune koyun, parmaklari kenetleyin.",
      "Sert ve hizli basin: 5-6 cm derinlikte, dakikada 100-120 basi.",
      "30 basidan sonra basi geriye egin, cenesi yukari kaldir, 2 kurtarma nefesi verin.",
      "Yardim gelene veya kisi iyilesene kadar 30:2 oraniyla devam edin.",
    ],
    warningEn: "If you are not trained in rescue breaths, do compression-only CPR.",
    warningTr: "Kurtarma nefesinde egitimli degilseniz, sadece basi yaparak devam edin.",
  },
  {
    id: "heimlich",
    icon: <Wind className="w-5 h-5" />,
    titleEn: "Heimlich Maneuver (Choking - Adult)",
    titleTr: "Heimlich Manevrasi (Bogulma - Yetiskin)",
    color: "text-orange-600 dark:text-orange-400",
    borderColor: "border-orange-200 dark:border-orange-800",
    stepsEn: [
      "Ask the person: 'Are you choking?' If they cannot speak, cough, or breathe, act.",
      "Stand behind the person and wrap your arms around their waist.",
      "Make a fist with one hand and place it just above the navel.",
      "Grab your fist with your other hand.",
      "Give quick, upward thrusts into the abdomen.",
      "Repeat until the object is expelled or the person loses consciousness.",
      "If unconscious, lower to the ground and begin CPR.",
    ],
    stepsTr: [
      "Kisiye sorun: 'Boguluyormusunuz?' Konusamiyor, oksuremiyor, nefes alamiyorsa harekete gecin.",
      "Kisinin arkasina gecin ve kollarinizi bel hizasinda sarin.",
      "Bir elinizle yumruk yapin, gobek deliginin hemen uzerine yerlestirin.",
      "Diger elinizle yumrugunuzu kavrarin.",
      "Karna hizli, yukari doğru basklar yapin.",
      "Nesne cikana veya kisi bilincini kaybedene kadar tekrarlayin.",
      "Bilinc kaybederse, yere yatirin ve KPR'ye başlayin.",
    ],
  },
  {
    id: "choking-child",
    icon: <Baby className="w-5 h-5" />,
    titleEn: "Choking (Infant/Child)",
    titleTr: "Bogulma (Bebek/Cocuk)",
    color: "text-pink-600 dark:text-pink-400",
    borderColor: "border-pink-200 dark:border-pink-800",
    stepsEn: [
      "For infants under 1: Hold face-down on your forearm, supporting the head.",
      "Give 5 firm back blows between the shoulder blades with heel of hand.",
      "Turn baby face-up. Give 5 chest thrusts with 2 fingers on breastbone.",
      "Alternate back blows and chest thrusts until object is removed.",
      "For children over 1: Use the Heimlich maneuver (abdominal thrusts) as for adults.",
      "If child becomes unconscious, begin CPR immediately.",
      "Call 112 if not already done.",
    ],
    stepsTr: [
      "1 yas alti bebekler icin: Yuz altta olacak sekilde on kolunuzda tutun, basini destekleyin.",
      "Kurek kemikleri arasina avuc ici ile 5 sert sirt darbesi verin.",
      "Bebegi yuz uste cevirin. Göğüs kemiqi uzerine 2 parmakla 5 göğüs basisi yapin.",
      "Nesne cikana kadar sirt darbeleri ve göğüs basilarini degisimli yapin.",
      "1 yas ustu cocuklar icin: Yetiskinlerdeki gibi Heimlich manevrasi uygulayin.",
      "Cocuk bilincini kaybederse hemen KPR'ye başlayin.",
      "Henuz aranmadiysa 112'yi arayın.",
    ],
  },
  {
    id: "burns",
    icon: <Flame className="w-5 h-5" />,
    titleEn: "Burns",
    titleTr: "Yaniklar",
    color: "text-red-600 dark:text-red-400",
    borderColor: "border-red-200 dark:border-red-800",
    stepsEn: [
      "Remove the person from the source of the burn.",
      "Cool the burn under cool (not cold) running water for at least 20 minutes.",
      "Remove clothing and jewelry near the burn (unless stuck to skin).",
      "Do NOT apply ice, butter, toothpaste, or creams to the burn.",
      "Cover with a clean, non-fluffy material (cling film works well).",
      "For chemical burns: brush off dry chemicals, then rinse with water for 20+ minutes.",
      "Seek medical help for burns larger than the palm, on face/hands/joints, or deep burns.",
    ],
    stepsTr: [
      "Kisiyi yanik kaynagindan uzaklastirin.",
      "Yanigi en az 20 dakika serin (soguk degil) akan su altinda tutun.",
      "Yanik yakinindaki giysiler ve takilari cikarin (deriye yapismadiysa).",
      "Buz, tereyagi, dis macunu veya krem SURMEYLN.",
      "Temiz, tuysuz bir malzemeyle ortin (streç film ise yarar).",
      "Kimyasal yaniklar icin: kuru kimyasallari firçalayin, 20+ dakika suyla duralayin.",
      "Avuc icinden buyuk, yuz/el/eklem bolgesinde veya derin yaniklar için tibbi yardim alin.",
    ],
  },
  {
    id: "bleeding",
    icon: <Droplets className="w-5 h-5" />,
    titleEn: "Severe Bleeding",
    titleTr: "Siddetli Kanama",
    color: "text-red-700 dark:text-red-400",
    borderColor: "border-red-200 dark:border-red-800",
    stepsEn: [
      "Call 112 for severe bleeding.",
      "Apply direct pressure to the wound with a clean cloth or bandage.",
      "Press firmly and do not remove the cloth even if blood soaks through. Add more on top.",
      "If possible, raise the injured area above the level of the heart.",
      "Keep pressure until help arrives.",
      "Do NOT apply a tourniquet unless trained and bleeding is life-threatening from a limb.",
      "Keep the person warm and calm. Watch for signs of shock.",
    ],
    stepsTr: [
      "Siddetli kanama için 112'yi arayın.",
      "Temiz bir bez veya bandajla yaraya doğrudan baski uygulayin.",
      "Sikica basin ve kan sizsa bile bezi cikarmayim. Uzerine yeni ekleyin.",
      "Mumkunse yarali bolgeyi kalp seviyesinin uzerine kaldirin.",
      "Yardim gelene kadar baskiyi sürdürn.",
      "Egitimli degilseniz ve kanama bir uzuvdan hayati tehlike oluşturmuyorsa turnike UYGULAMAYIN.",
      "Kisiyi sicak ve sakin tutun. Sok belirtilerini izleyin.",
    ],
    warningEn: "Seek immediate medical attention for any wound that won't stop bleeding after 10 minutes of direct pressure.",
    warningTr: "10 dakika doğrudan baski sonrasi durmayan her kanama için acil tibbi yardim alin.",
  },
  {
    id: "poisoning",
    icon: <Skull className="w-5 h-5" />,
    titleEn: "Poisoning",
    titleTr: "Zehirlenme",
    color: "text-purple-600 dark:text-purple-400",
    borderColor: "border-purple-200 dark:border-purple-800",
    stepsEn: [
      "Call 112 or Poison Control Center (114 in Turkey) immediately.",
      "Try to identify the poison (keep the container/label if possible).",
      "Do NOT induce vomiting unless specifically told to by medical professionals.",
      "If the person is unconscious, place in recovery position.",
      "If poison is on skin, remove contaminated clothing and rinse skin with water.",
      "If poison is in eyes, rinse with clean water for at least 15 minutes.",
      "Monitor breathing and be prepared to start CPR if needed.",
    ],
    stepsTr: [
      "Hemen 112 veya Zehir Danışma Merkezini (114) arayın.",
      "Zehiri tanimlamayin calsin (mumkunse kutu/etiketi saklayin).",
      "Tip profesyoneli soylemedikce KUSTURMAYIN.",
      "Kisi bilincini kaybettiyse iyileşme (yan yatis) pozisyonuna getirin.",
      "Zehir cilde temas ettiyse kirli giysiler cikarin, cildi suyla duralayin.",
      "Zehir gozle temas ettiyse en az 15 dakika temiz suyla duralayin.",
      "Solunum izleyin, gerekirse KPR'ye hazir olun.",
    ],
    warningEn: "Never try to neutralize a poison (e.g., giving acid for alkali). Let professionals decide.",
    warningTr: "Asla zehiri notralise etmeye çalışmayin (ornegin alkaliye asit vermek). Profesyonellere bırakın.",
  },
  {
    id: "snakebite",
    icon: <Bug className="w-5 h-5" />,
    titleEn: "Snake Bite",
    titleTr: "Yilan Isirmasi",
    color: "text-green-600 dark:text-green-400",
    borderColor: "border-green-200 dark:border-green-800",
    stepsEn: [
      "Move away from the snake. Do not try to catch or kill it.",
      "Call 112 immediately.",
      "Keep the bitten limb still and below heart level.",
      "Remove watches, rings, or tight clothing near the bite.",
      "Do NOT cut the wound, suck out venom, or apply a tourniquet.",
      "Do NOT apply ice or immerse in cold water.",
      "Note the time of the bite and the snake's appearance if possible.",
      "Keep calm and still to slow venom spread.",
    ],
    stepsTr: [
      "Yilandan uzaklasin. Yakalamaya veya oldurmeye çalışmayin.",
      "Hemen 112'yi arayın.",
      "Isirilan uzvu hareketsiz tutun ve kalp seviyesinin altinda tutun.",
      "Isirma yakinindaki saat, yuzuk veya dar giysileri cikarin.",
      "Yarayi KESMEYIN, zehiri emmeye çalışmayin, turnike UYGULAMAYIN.",
      "Buz UYGULAMAYIN veya soguk suya BATIRMAYIN.",
      "Isirma zamanini ve mümkünse yilanin gorunumunu not edin.",
      "Zehirin yayilmasini yavaslatmak için sakin ve hareketsiz kalin.",
    ],
  },
  {
    id: "anaphylaxis",
    icon: <AlertTriangle className="w-5 h-5" />,
    titleEn: "Anaphylaxis (Severe Allergic Reaction)",
    titleTr: "Anafilaksi (Siddetli Alerjik Reaksiyon)",
    color: "text-red-600 dark:text-red-400",
    borderColor: "border-red-200 dark:border-red-800",
    stepsEn: [
      "Call 112 immediately. This is a life-threatening emergency.",
      "If the person has an EpiPen (adrenaline auto-injector), help them use it on outer thigh.",
      "Help the person lie down with legs raised (unless breathing is difficult — then sit up).",
      "Remove the trigger if possible (e.g., remove bee stinger).",
      "A second EpiPen dose can be given after 5 minutes if no improvement.",
      "Monitor breathing constantly. Be prepared to start CPR.",
      "Do NOT give anything to eat or drink.",
    ],
    stepsTr: [
      "Hemen 112'yi arayın. Bu hayati tehlike arz eden bir acil durumdur.",
      "Kisinin EpiPen'i (adrenalin oto-enjektoru) varsa, dis uyluqa uygulamasina yardim edin.",
      "Kisinin bacaklar yukarda olacak sekilde yatmasina yardim edin (nefes alamiyorsa oturttun).",
      "Mumkunse tetikleyiciyi ortadan kaldirin (ornegin ari ignesini cikarin).",
      "5 dakika sonra duzelmezse ikinci EpiPen dozu verilebilir.",
      "Solunumu surekli izleyin. KPR'ye hazir olun.",
      "Yiyecek veya icecek VERMEYIN.",
    ],
    warningEn: "Anaphylaxis can be fatal within minutes. Do not wait to see if it gets better — call 112 and use EpiPen immediately.",
    warningTr: "Anafilaksi dakikalar icinde olumcul olabilir. Iyilesip iyileşmeyecegini beklemeyin — hemen 112'yi arayın ve EpiPen kullanin.",
  },
  {
    id: "fractures",
    icon: <Bone className="w-5 h-5" />,
    titleEn: "Fractures",
    titleTr: "Kiriklar",
    color: "text-gray-600 dark:text-gray-400",
    borderColor: "border-gray-200 dark:border-gray-700",
    stepsEn: [
      "Do not move the injured limb or try to straighten it.",
      "Call 112 for suspected spine, hip, or pelvis fractures.",
      "Immobilize the injury with a splint (use boards, magazines, or rolled clothing).",
      "Apply ice wrapped in cloth to reduce swelling (20 minutes on, 20 off).",
      "Check circulation below the injury (pulse, color, sensation).",
      "For open fractures (bone through skin): cover with clean dressing, do not push bone back.",
      "Treat for shock: keep warm, legs elevated (if no spinal injury suspected).",
    ],
    stepsTr: [
      "Yarali uzvu hareket ettirmeyin veya duzeltmeye çalışmayin.",
      "Omurga, kalca veya pelvis kirigi supheleniyorsaniz 112'yi arayın.",
      "Yarayi atel ile sabitleyin (tahta, dergi veya sarili giysi kullanin).",
      "Sismeyi azaltmak için beze sarilmis buz uygulayin (20 dakika acik, 20 kapali).",
      "Yaranin altinda kan dolasimini kontrol edin (nabiz, renk, his).",
      "Acik kiriklar (kemik deriden dışarı) icin: temiz pansuman ortin, kemigi geri itmeyin.",
      "Sok için onlem alin: sicak tutun, bacaklar yukarda (omurga yaralanmasi yoksa).",
    ],
  },
  {
    id: "drowning",
    icon: <Droplets className="w-5 h-5" />,
    titleEn: "Drowning",
    titleTr: "Bogulma (Suda)",
    color: "text-blue-600 dark:text-blue-400",
    borderColor: "border-blue-200 dark:border-blue-800",
    stepsEn: [
      "Call 112. Do not enter the water unless trained in water rescue.",
      "Throw a flotation device, rope, or anything that floats.",
      "Once on land, check for breathing.",
      "If not breathing, begin CPR immediately. Start with 5 rescue breaths, then 30:2.",
      "Place in recovery position if breathing but unconscious.",
      "Do NOT try to drain water from lungs (it is absorbed).",
      "Even if the person seems fine, they must go to a hospital (secondary drowning risk).",
    ],
    stepsTr: [
      "112'yi arayın. Su kurtarma egitimli degilseniz suya GIRMEYIN.",
      "Yuzen bir cisim, ip veya yuzebilecek herhangi bir sey atin.",
      "Karaya cikarinca solunumu kontrol edin.",
      "Nefes almiyorsa hemen KPR'ye başlayin. 5 kurtarma nefesiyle başlayin, sonra 30:2.",
      "Nefes aliyorsa ama bilinci yoksa iyileşme pozisyonuna getirin.",
      "Cigerlerden su bosaltmaya CALISMAYIN (su emilmistir).",
      "Kisi iyi gorunse bile hastaneye gitmeli (ikincil bogulma riski).",
    ],
    warningEn: "Secondary (dry) drowning can occur hours later. Always seek medical evaluation after a drowning incident.",
    warningTr: "Ikincil (kuru) bogulma saatler sonra ortaya cikabilir. Bogulma olayindan sonra mutlaka tibbi değerlendirme yaptirin.",
  },
];

export default function FirstAidPage() {
  const { lang } = useLang();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ cpr: true });

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Cross className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{tx("firstaid.title", lang)}</h1>
          <p className="text-gray-600 dark:text-gray-400">{tx("firstaid.subtitle", lang)}</p>
        </div>

        {/* Emergency Call */}
        <a
          href="tel:112"
          className="flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl p-4 mb-6 shadow-lg transition-colors"
        >
          <Phone className="w-6 h-6" />
          <span className="text-lg font-bold">{tx("firstaid.call112", lang)} — 112</span>
        </a>

        {/* Sections */}
        <div className="space-y-3">
          {SECTIONS.map((section) => (
            <div key={section.id} className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border ${section.borderColor} overflow-hidden`}>
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className={section.color}>{section.icon}</div>
                  <h2 className="font-semibold text-gray-900 dark:text-white">
                    {txObj(section, lang)}
                  </h2>
                </div>
                {expandedSections[section.id]
                  ? <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
              </button>

              {expandedSections[section.id] && (
                <div className="px-5 pb-5">
                  <ol className="space-y-3">
                    {({ en: section.stepsEn, tr: section.stepsTr }[lang] ?? section.stepsEn).map((step, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-sm font-bold text-red-600 dark:text-red-400">
                          {i + 1}
                        </span>
                        <span className="text-gray-700 dark:text-gray-300 pt-0.5">{step}</span>
                      </li>
                    ))}
                  </ol>
                  {({ en: section.warningEn, tr: section.warningTr }[lang] ?? section.warningEn) && (
                    <div className="mt-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl p-3 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        {txObj({ en: section.warningEn, tr: section.warningTr }, lang)}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="mt-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {tx("firstAid.disclaimer", lang)}
          </p>
        </div>
      </div>
    </div>
  );
}
