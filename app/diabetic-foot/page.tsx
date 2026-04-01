// © 2026 Doctopal — All Rights Reserved
"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Circle,
  AlertTriangle,
  ShieldAlert,
  LogIn,
  Sparkles,
  Footprints,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface ChecklistItem {
  id: string;
  label: { en: string; tr: string };
  description: { en: string; tr: string };
  done: boolean;
}

const FOOT_CHECKLIST: Omit<ChecklistItem, "done">[] = [
  {
    id: "inspect_top",
    label: { en: "Inspect top of both feet", tr: "Her iki ayagin ust kismini kontrol edin" },
    description: { en: "Look for swelling, color changes, blisters", tr: "Şişlik, renk değişikliği, su toplamalarina bakin" },
  },
  {
    id: "inspect_bottom",
    label: { en: "Inspect soles of both feet", tr: "Her iki ayagin tabanini kontrol edin" },
    description: { en: "Use a mirror if needed. Check for cracks, calluses, wounds", tr: "Gerekirse ayna kullanin. Catlaklar, nasirlar, yaralara bakin" },
  },
  {
    id: "inspect_toes",
    label: { en: "Check between all toes", tr: "Tum parmak aralarini kontrol edin" },
    description: { en: "Look for fungal infection, moisture, cracks", tr: "Mantar enfeksiyonu, nem, catlaklar için bakin" },
  },
  {
    id: "inspect_nails",
    label: { en: "Check toenails", tr: "Ayak tirnaklarini kontrol edin" },
    description: { en: "Look for ingrown nails, discoloration, thickening", tr: "Batan tirnak, renk değişikliği, kalinlasmaya bakin" },
  },
  {
    id: "sensation",
    label: { en: "Test sensation", tr: "His kontrolü" },
    description: { en: "Touch both feet — can you feel normally?", tr: "Her iki ayaginiza dokunun — normal hissediyor musunuz?" },
  },
  {
    id: "temperature",
    label: { en: "Feel temperature", tr: "Sicaklik kontrolü" },
    description: { en: "Are feet too hot, too cold, or normal?", tr: "Ayaklariniz cok sicak, cok soguk veya normal mi?" },
  },
  {
    id: "wash",
    label: { en: "Wash feet with lukewarm water", tr: "Ilik suyla ayaklarinizi yikayin" },
    description: { en: "Never hot water. Dry thoroughly, especially between toes", tr: "Asla sicak su kullanmayin. Ozellikle parmak aralarini iyice kurulayin" },
  },
  {
    id: "moisturize",
    label: { en: "Apply moisturizer (not between toes)", tr: "Nemlendirici surun (parmak aralari haric)" },
    description: { en: "Keep skin soft but avoid moisture buildup between toes", tr: "Cildi yumusak tutun ama parmak aralarinda nem birikiminden kacinin" },
  },
  {
    id: "socks",
    label: { en: "Wear clean, dry socks", tr: "Temiz, kuru corap giyin" },
    description: { en: "Seamless, moisture-wicking socks preferred", tr: "Dikissiz, nemi ceken coraplar tercih edin" },
  },
  {
    id: "shoes",
    label: { en: "Check shoes before wearing", tr: "Giymeden once ayakkabilari kontrol edin" },
    description: { en: "Feel inside for objects, rough spots, or damage", tr: "Icinde cisim, pururuzlu alanlar veya hasar olup olmadigini kontrol edin" },
  },
];

const EMERGENCY_SIGNS: Array<{ label: { en: string; tr: string }; color: string }> = [
  { label: { en: "Color change (black, blue, or white areas)", tr: "Renk değişikliği (siyah, mavi veya beyaz alanlar)" }, color: "text-red-600" },
  { label: { en: "Open wound or sore that won't heal", tr: "Kapanmayan acik yara" }, color: "text-red-600" },
  { label: { en: "Sudden severe swelling", tr: "Ani şiddetli şişlik" }, color: "text-red-600" },
  { label: { en: "Red streaks from a wound", tr: "Yaradan yayilan kirmizi cizgiler" }, color: "text-red-600" },
  { label: { en: "Warmth with redness (possible infection)", tr: "Kizariklikla birlikte isilik (olasi enfeksiyon)" }, color: "text-red-600" },
  { label: { en: "Fever with foot wound", tr: "Ayak yarasiyla birlikte ates" }, color: "text-red-600" },
  { label: { en: "Pus or foul-smelling drainage", tr: "Irin veya kotu kokulu akinti" }, color: "text-red-600" },
  { label: { en: "Loss of feeling in foot/toes", tr: "Ayak/parmaklarda his kaybi" }, color: "text-amber-600" },
];

const SHOE_GUIDE = [
  { en: "Always wear shoes, never walk barefoot", tr: "Her zaman ayakkabi giyin, yalinalak yurumenin" },
  { en: "Wide toe box — no pointed shoes", tr: "Genis burun — sivri ayakkabi kullanmayin" },
  { en: "Low heel (under 2 inches/5 cm)", tr: "Alcak topuk (5 cm altinda)" },
  { en: "Lace-up or velcro — adjustable fit", tr: "Bagcikli veya cirtcirtli — ayarlanabilir" },
  { en: "Buy shoes in the afternoon (feet swell)", tr: "Ayakkabi ogle sonrasi alin (ayaklar siser)" },
  { en: "Break in new shoes gradually (1-2 hours/day)", tr: "Yeni ayakkabilari yavasce alisin (gunde 1-2 saat)" },
];

const NEUROPATHY_SYMPTOMS = [
  { en: "Tingling or pins-and-needles sensation", tr: "Karisma veya igneleme hissi" },
  { en: "Burning sensation", tr: "Yanma hissi" },
  { en: "Numbness (loss of feeling)", tr: "Uyusma (his kaybi)" },
  { en: "Sharp or stabbing pain (worse at night)", tr: "Keskin veya saplanma tarzinda ağrı (gece artar)" },
  { en: "Sensitivity to touch", tr: "Dokunmaya duyarlılik" },
  { en: "Muscle weakness in feet", tr: "Ayaklarda kas gucsuzlugu" },
];

export default function DiabeticFootPage() {
  const { isAuthenticated } = useAuth();
  const { lang } = useLang();
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);

  useEffect(() => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem("diabetic-foot-checklist");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.date === today) {
        setChecklist(parsed.items);
        return;
      }
    }
    setChecklist(FOOT_CHECKLIST.map((item) => ({ ...item, done: false })));
  }, []);

  const toggleItem = (id: string) => {
    const updated = checklist.map((item) =>
      item.id === id ? { ...item, done: !item.done } : item
    );
    setChecklist(updated);
    localStorage.setItem("diabetic-foot-checklist", JSON.stringify({
      date: new Date().toDateString(),
      items: updated,
    }));
  };

  const completedCount = checklist.filter((i) => i.done).length;
  const progress = checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : 0;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">{tx("dfoot.title", lang)}</h1>
          <p className="text-muted-foreground">{tx("common.loginToUse", lang)}</p>
          <Button onClick={() => window.location.href = "/auth/login"}>
            <LogIn className="w-4 h-4 mr-2" /> {tx("nav.login", lang)}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-4 py-1.5 rounded-full text-sm font-medium">
            <Footprints className="w-4 h-4" />
            {tx("dfoot.title", lang)}
          </div>
          <h1 className="text-3xl font-bold">{tx("dfoot.title", lang)}</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">{tx("dfoot.subtitle", lang)}</p>
        </div>

        {/* Daily Foot Check */}
        <div className="bg-card border rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-orange-500" />
              {tx("dfoot.checklist", lang)}
            </h2>
            <span className="text-sm font-medium text-muted-foreground">
              {completedCount}/{checklist.length}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-orange-500 rounded-full h-2 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="grid gap-2">
            {checklist.map((item) => (
              <button
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`flex items-start gap-3 p-3 rounded-xl text-left transition-all ${
                  item.done
                    ? "bg-orange-50 dark:bg-orange-900/20"
                    : "bg-muted/50 hover:bg-muted"
                }`}
              >
                {item.done ? (
                  <CheckCircle2 className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <div className={`font-medium ${item.done ? "line-through opacity-70" : ""}`}>
                    {item.label[lang]}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {item.description[lang]}
                  </div>
                </div>
              </button>
            ))}
          </div>
          {progress === 100 && (
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-700 dark:text-green-400 font-medium">
              {tx("dfoot.completedToday", lang)}
            </div>
          )}
        </div>

        {/* Emergency Signs */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-red-700 dark:text-red-400">
            <ShieldAlert className="w-5 h-5" />
            {tx("dfoot.warning", lang)}
          </h2>
          <div className="grid gap-2">
            {EMERGENCY_SIGNS.map((sign, i) => (
              <div key={i} className={`flex items-center gap-2 text-sm ${sign.color}`}>
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{sign.label[lang]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Neuropathy Symptoms */}
        <div className="bg-card border rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            {tx("dfoot.neuropathy", lang)}
          </h2>
          <p className="text-sm text-muted-foreground">
            {tx("dfoot.neuropathyDesc", lang)}
          </p>
          <div className="grid sm:grid-cols-2 gap-2">
            {NEUROPATHY_SYMPTOMS.map((symptom, i) => (
              <div key={i} className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0" />
                {symptom[lang]}
              </div>
            ))}
          </div>
        </div>

        {/* Shoe Guide */}
        <div className="bg-card border rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold">
            {tx("dfoot.shoeGuide", lang)}
          </h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {SHOE_GUIDE.map((tip, i) => (
              <div key={i} className="flex items-center gap-2 bg-muted/50 rounded-lg p-3 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                {tip[lang]}
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="text-center text-xs text-muted-foreground px-4">
          {tx("disclaimer.tool", lang)}
        </div>
      </div>
    </div>
  );
}
