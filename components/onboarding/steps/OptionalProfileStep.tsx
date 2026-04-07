// © 2026 Doctopal — All Rights Reserved
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X, Sparkles, MapPin, Users, Heart, Dumbbell, Briefcase, Scale, Watch } from "lucide-react";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import type { OnboardingData } from "../OnboardingWizard";

interface Props {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

// Chip selector helper
function ChipSelect({ options, value, onChange, lang }: {
  options: { value: string; en: string; tr: string }[];
  value: string;
  onChange: (v: string) => void;
  lang: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
            value === opt.value
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          {lang === "tr" ? opt.tr : opt.en}
        </button>
      ))}
    </div>
  );
}

const MARITAL_OPTIONS = [
  { value: "single", en: "Living alone", tr: "Yalnız Yaşıyor" },
  { value: "married", en: "Married / Partner", tr: "Evli / Partneri var" },
  { value: "family", en: "With family", tr: "Ailesiyle" },
];

const INSURANCE_OPTIONS = [
  { value: "sgk", en: "Public (SGK)", tr: "SGK" },
  { value: "private", en: "Private", tr: "Özel Sağlık" },
  { value: "complementary", en: "Complementary", tr: "Tamamlayıcı" },
  { value: "none", en: "None", tr: "Yok" },
];

const DIET_OPTIONS = [
  { value: "regular", en: "Standard", tr: "Standart" },
  { value: "vegetarian", en: "Vegetarian", tr: "Vejetaryen" },
  { value: "vegan", en: "Vegan", tr: "Vegan" },
  { value: "intermittent_fasting", en: "Intermittent Fasting", tr: "Aralıklı Oruç" },
  { value: "keto", en: "Keto / Low-carb", tr: "Keto / Düşük Karbonhidrat" },
  { value: "carnivore", en: "Carnivore / Low-fiber", tr: "Karnivor / Düşük Lifli" },
];

const ACTIVITY_OPTIONS = [
  { value: "sedentary", en: "Sedentary", tr: "Hareketsiz" },
  { value: "regular", en: "Regular exercise", tr: "Düzenli Spor" },
  { value: "heavy", en: "Heavy training / Bodybuilding", tr: "Ağır Antrenman / Vücut Geliştirme" },
];

const WORK_OPTIONS = [
  { value: "daytime_desk", en: "Daytime / Desk job", tr: "Gündüz / Masa Başı" },
  { value: "shift_night", en: "Shift / Night work", tr: "Vardiyalı / Gece" },
  { value: "active_outdoor", en: "Active / Outdoor", tr: "Aktif / Açık Hava" },
];

const commonSupplements = [
  "Vitamin D", "Vitamin B12", "Iron", "Omega-3",
  "Magnesium", "Zinc", "Probiotics", "Multivitamin",
];
const supplementsTR: Record<string, string> = {
  "Vitamin D": "D Vitamini", "Vitamin B12": "B12 Vitamini", "Iron": "Demir",
  "Omega-3": "Omega-3", "Magnesium": "Magnezyum", "Zinc": "Çinko",
  "Probiotics": "Probiyotikler", "Multivitamin": "Multivitamin",
};

// Helper to get/set meta values stored in supplements array as "meta:key=value"
function getMeta(supplements: string[], key: string): string {
  const entry = supplements.find(s => s.startsWith(`meta:${key}=`));
  return entry ? entry.replace(`meta:${key}=`, "") : "";
}
function setMeta(supplements: string[], key: string, value: string): string[] {
  const filtered = supplements.filter(s => !s.startsWith(`meta:${key}=`));
  if (value) filtered.push(`meta:${key}=${value}`);
  return filtered;
}

export function OptionalProfileStep({ data, updateData }: Props) {
  const { lang } = useLang();
  const tr = lang === "tr";
  const [customSupplement, setCustomSupplement] = useState("");

  const displaySupplement = (s: string) => tr ? (supplementsTR[s] || s) : s;

  // Meta values stored in supplements array
  const city = getMeta(data.supplements, "city");
  const marital = getMeta(data.supplements, "marital");
  const insurance = getMeta(data.supplements, "insurance");
  const workSchedule = getMeta(data.supplements, "work");
  const wearable = getMeta(data.supplements, "wearable");

  const updateMeta = (key: string, value: string) => {
    updateData({ supplements: setMeta(data.supplements, key, value) });
  };

  const toggleSupplement = (supplement: string) => {
    if (data.supplements.includes(supplement)) {
      updateData({ supplements: data.supplements.filter((s) => s !== supplement) });
    } else {
      updateData({ supplements: [...data.supplements, supplement] });
    }
  };

  const addCustomSupplement = () => {
    if (!customSupplement.trim()) return;
    if (!data.supplements.includes(customSupplement.trim())) {
      updateData({ supplements: [...data.supplements, customSupplement.trim()] });
    }
    setCustomSupplement("");
  };

  // BMI calculation
  const bmi = data.height_cm && data.weight_kg
    ? (data.weight_kg / ((data.height_cm / 100) ** 2)).toFixed(1)
    : null;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="h-4 w-4 text-primary" />
        {tx("onb.optionalHint", lang)}
      </div>

      {/* ═══ SOCIODEMOGRAPHIC ═══ */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
          <MapPin className="h-3 w-3" /> {tr ? "Sosyodemografik" : "Sociodemographic"}
        </p>

        <div className="space-y-2">
          <Label className="text-xs">{tr ? "Yaşadığı Şehir / Bölge" : "City / Region"}</Label>
          <Input
            placeholder={tr ? "ör. İstanbul, Ankara" : "e.g., Istanbul, Ankara"}
            value={city}
            onChange={(e) => updateMeta("city", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs flex items-center gap-1.5">
            <Users className="h-3 w-3" /> {tr ? "Medeni Hal / Yaşam Düzeni" : "Living Situation"}
          </Label>
          <ChipSelect options={MARITAL_OPTIONS} value={marital} onChange={(v) => updateMeta("marital", v)} lang={lang} />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs flex items-center gap-1.5">
            <Heart className="h-3 w-3" /> {tr ? "Sigorta Durumu" : "Insurance Status"}
          </Label>
          <ChipSelect options={INSURANCE_OPTIONS} value={insurance} onChange={(v) => updateMeta("insurance", v)} lang={lang} />
        </div>
      </div>

      {/* ═══ NUTRITION & LIFESTYLE ═══ */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {tr ? "Beslenme & Yaşam Tarzı" : "Nutrition & Lifestyle"}
        </p>

        <div className="space-y-1.5">
          <Label className="text-xs">{tx("onb.dietType", lang)}</Label>
          <ChipSelect options={DIET_OPTIONS} value={data.diet_type} onChange={(v) => updateData({ diet_type: v })} lang={lang} />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs flex items-center gap-1.5">
            <Dumbbell className="h-3 w-3" /> {tr ? "Fiziksel Aktivite" : "Physical Activity"}
          </Label>
          <ChipSelect options={ACTIVITY_OPTIONS} value={data.exercise_frequency} onChange={(v) => updateData({ exercise_frequency: v })} lang={lang} />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs flex items-center gap-1.5">
            <Briefcase className="h-3 w-3" /> {tr ? "Çalışma Düzeni" : "Work Schedule"}
          </Label>
          <ChipSelect options={WORK_OPTIONS} value={workSchedule} onChange={(v) => updateMeta("work", v)} lang={lang} />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">{tx("onb.sleepQuality", lang)}</Label>
          <ChipSelect
            options={[
              { value: "good", en: "Good (7-9h, refreshed)", tr: "İyi (7-9 saat, dinlenmiş)" },
              { value: "fair", en: "Fair (sometimes restless)", tr: "Orta (bazen huzursuz)" },
              { value: "poor", en: "Poor (frequent issues)", tr: "Kötü (sık sorun)" },
              { value: "insomnia", en: "Insomnia", tr: "Uykusuzluk" },
            ]}
            value={data.sleep_quality}
            onChange={(v) => updateData({ sleep_quality: v })}
            lang={lang}
          />
        </div>
      </div>

      {/* ═══ PHYSICAL MEASUREMENTS ═══ */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
          <Scale className="h-3 w-3" /> {tr ? "Fiziksel Ölçümler" : "Physical Measurements"}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="height" className="text-xs">{tx("onb.heightLabel", lang)}</Label>
            <Input
              id="height"
              type="number"
              placeholder={tx("onb.heightPlaceholder", lang)}
              value={data.height_cm ?? ""}
              onChange={(e) => updateData({ height_cm: e.target.value ? parseInt(e.target.value) : null })}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="weight" className="text-xs">{tx("onb.weightLabel", lang)}</Label>
            <Input
              id="weight"
              type="number"
              placeholder={tx("onb.weightPlaceholder", lang)}
              value={data.weight_kg ?? ""}
              onChange={(e) => updateData({ weight_kg: e.target.value ? parseFloat(e.target.value) : null })}
            />
          </div>
        </div>
        {bmi && (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1">
            <span className="text-xs font-medium text-primary">BMI: {bmi}</span>
          </div>
        )}
      </div>

      {/* ═══ BLOOD GROUP ═══ */}
      <div className="space-y-2">
        <Label className="text-xs">{tx("onb.bloodGroup", lang)}</Label>
        <Select value={data.blood_group} onValueChange={(v) => v && updateData({ blood_group: v })}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder={tx("onb.bloodGroupPlaceholder", lang)} />
          </SelectTrigger>
          <SelectContent>
            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => (
              <SelectItem key={g} value={g}>{g}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ═══ WEARABLE ═══ */}
      <div className="flex items-center space-x-2 rounded-lg border p-3">
        <Watch className="h-4 w-4 text-muted-foreground" />
        <Label className="text-sm font-normal flex-1">
          {tr ? "Akıllı saat veya tansiyon aleti kullanıyor musunuz?" : "Do you use a smartwatch or blood pressure monitor?"}
        </Label>
        <Checkbox
          checked={wearable === "yes"}
          onCheckedChange={(c) => updateMeta("wearable", c ? "yes" : "")}
        />
      </div>

      {/* ═══ SUPPLEMENTS ═══ */}
      <div className="space-y-3">
        <Label className="text-xs">{tx("onb.supplements", lang)}</Label>
        <div className="flex flex-wrap gap-2">
          {commonSupplements.map((supplement) => (
            <Badge
              key={supplement}
              variant={data.supplements.includes(supplement) ? "default" : "outline"}
              className="cursor-pointer transition-colors"
              onClick={() => toggleSupplement(supplement)}
            >
              {displaySupplement(supplement)}
            </Badge>
          ))}
          {data.supplements
            .filter((s) => !commonSupplements.includes(s) && !s.startsWith("meta:"))
            .map((supplement) => (
              <Badge key={supplement} variant="default" className="gap-1">
                {displaySupplement(supplement)}
                <X className="h-3 w-3 cursor-pointer" onClick={() => toggleSupplement(supplement)} />
              </Badge>
            ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder={tx("onb.otherSupplement", lang)}
            value={customSupplement}
            onChange={(e) => setCustomSupplement(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomSupplement())}
            className="h-9"
          />
          <Button variant="outline" size="sm" onClick={addCustomSupplement} disabled={!customSupplement.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
