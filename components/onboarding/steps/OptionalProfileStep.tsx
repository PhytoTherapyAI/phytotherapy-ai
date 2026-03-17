"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Sparkles } from "lucide-react";
import { useLang } from "@/components/layout/language-toggle";
import type { OnboardingData } from "../OnboardingWizard";

interface Props {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

const commonSupplements = [
  "Vitamin D", "Vitamin B12", "Iron", "Omega-3",
  "Magnesium", "Zinc", "Probiotics", "Multivitamin",
];

const supplementsTR: Record<string, string> = {
  "Vitamin D": "D Vitamini",
  "Vitamin B12": "B12 Vitamini",
  "Iron": "Demir",
  "Omega-3": "Omega-3",
  "Magnesium": "Magnezyum",
  "Zinc": "Çinko",
  "Probiotics": "Probiyotikler",
  "Multivitamin": "Multivitamin",
};

const dietLabels: Record<string, Record<string, string>> = {
  regular: { en: "Regular (no restrictions)", tr: "Normal (kısıtlama yok)" },
  vegetarian: { en: "Vegetarian", tr: "Vejetaryen" },
  vegan: { en: "Vegan", tr: "Vegan" },
  keto: { en: "Keto", tr: "Keto" },
  gluten_free: { en: "Gluten-free", tr: "Glutensiz" },
  halal: { en: "Halal", tr: "Helal" },
  other: { en: "Other", tr: "Diğer" },
};

const exerciseLabels: Record<string, Record<string, string>> = {
  sedentary: { en: "Sedentary (no exercise)", tr: "Hareketsiz (egzersiz yok)" },
  light: { en: "Light (1-2x/week)", tr: "Hafif (haftada 1-2)" },
  moderate: { en: "Moderate (3-4x/week)", tr: "Orta (haftada 3-4)" },
  active: { en: "Active (5+x/week)", tr: "Aktif (haftada 5+)" },
  athlete: { en: "Athlete / Professional", tr: "Sporcu / Profesyonel" },
};

const sleepLabels: Record<string, Record<string, string>> = {
  good: { en: "Good (7-9 hours, refreshed)", tr: "İyi (7-9 saat, dinlenmiş)" },
  fair: { en: "Fair (sometimes restless)", tr: "Orta (bazen huzursuz)" },
  poor: { en: "Poor (frequent issues)", tr: "Kötü (sık sorun)" },
  insomnia: { en: "Insomnia / Severe problems", tr: "Uykusuzluk / Ciddi sorunlar" },
};

export function OptionalProfileStep({ data, updateData }: Props) {
  const { lang } = useLang();
  const tr = lang === "tr";
  const l = tr ? "tr" : "en";
  const [customSupplement, setCustomSupplement] = useState("");

  const displaySupplement = (s: string) => tr ? (supplementsTR[s] || s) : s;

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="h-4 w-4 text-primary" />
        {tr
          ? "Bu bilgiler önerilerimizi kişiselleştirmemize yardımcı olur. Atlayıp daha sonra doldurabilirsiniz."
          : "These details help us personalize your recommendations. You can skip this and fill it later."}
      </div>

      {/* Physical measurements */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="height">{tr ? "Boy (cm)" : "Height (cm)"}</Label>
          <Input
            id="height"
            type="number"
            placeholder={tr ? "ör. 175" : "e.g., 175"}
            value={data.height_cm ?? ""}
            onChange={(e) => updateData({ height_cm: e.target.value ? parseInt(e.target.value) : null })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="weight">{tr ? "Kilo (kg)" : "Weight (kg)"}</Label>
          <Input
            id="weight"
            type="number"
            placeholder={tr ? "ör. 70" : "e.g., 70"}
            value={data.weight_kg ?? ""}
            onChange={(e) => updateData({ weight_kg: e.target.value ? parseFloat(e.target.value) : null })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>{tr ? "Kan Grubu" : "Blood Group"}</Label>
        <Select value={data.blood_group} onValueChange={(v) => v && updateData({ blood_group: v })}>
          <SelectTrigger>
            <SelectValue placeholder={tr ? "Kan grubunuzu seçin" : "Select blood group"} />
          </SelectTrigger>
          <SelectContent>
            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((group) => (
              <SelectItem key={group} value={group}>{group}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{tr ? "Diyet Türü" : "Diet Type"}</Label>
        <Select value={data.diet_type} onValueChange={(v) => v && updateData({ diet_type: v })}>
          <SelectTrigger>
            {data.diet_type && dietLabels[data.diet_type]
              ? <span>{dietLabels[data.diet_type][l]}</span>
              : <SelectValue placeholder={tr ? "Diyetinizi seçin" : "Select your diet"} />}
          </SelectTrigger>
          <SelectContent>
            {Object.entries(dietLabels).map(([val, labels]) => (
              <SelectItem key={val} value={val}>{labels[l]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{tr ? "Egzersiz Sıklığı" : "Exercise Frequency"}</Label>
        <Select value={data.exercise_frequency} onValueChange={(v) => v && updateData({ exercise_frequency: v })}>
          <SelectTrigger>
            {data.exercise_frequency && exerciseLabels[data.exercise_frequency]
              ? <span>{exerciseLabels[data.exercise_frequency][l]}</span>
              : <SelectValue placeholder={tr ? "Ne sıklıkta egzersiz yapıyorsunuz?" : "How often do you exercise?"} />}
          </SelectTrigger>
          <SelectContent>
            {Object.entries(exerciseLabels).map(([val, labels]) => (
              <SelectItem key={val} value={val}>{labels[l]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{tr ? "Uyku Kalitesi" : "Sleep Quality"}</Label>
        <Select value={data.sleep_quality} onValueChange={(v) => v && updateData({ sleep_quality: v })}>
          <SelectTrigger>
            {data.sleep_quality && sleepLabels[data.sleep_quality]
              ? <span>{sleepLabels[data.sleep_quality][l]}</span>
              : <SelectValue placeholder={tr ? "Uyku kaliteniz nasıl?" : "How well do you sleep?"} />}
          </SelectTrigger>
          <SelectContent>
            {Object.entries(sleepLabels).map(([val, labels]) => (
              <SelectItem key={val} value={val}>{labels[l]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Supplements */}
      <div className="space-y-3">
        <Label>{tr ? "Mevcut Takviyeler / Vitaminler" : "Current Supplements / Vitamins"}</Label>
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
            .filter((s) => !commonSupplements.includes(s))
            .map((supplement) => (
              <Badge key={supplement} variant="default" className="gap-1">
                {displaySupplement(supplement)}
                <X className="h-3 w-3 cursor-pointer" onClick={() => toggleSupplement(supplement)} />
              </Badge>
            ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder={tr ? "Diğer takviye..." : "Other supplement..."}
            value={customSupplement}
            onChange={(e) => setCustomSupplement(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomSupplement())}
          />
          <Button variant="outline" size="sm" onClick={addCustomSupplement} disabled={!customSupplement.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
