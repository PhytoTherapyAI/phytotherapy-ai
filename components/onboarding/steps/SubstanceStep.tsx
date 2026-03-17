"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Wine, Cigarette } from "lucide-react";
import { useLang } from "@/components/layout/language-toggle";
import type { OnboardingData } from "../OnboardingWizard";

interface Props {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

export function SubstanceStep({ data, updateData }: Props) {
  const { lang } = useLang();
  const tr = lang === "tr";

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Wine className="h-4 w-4" />
          {tr ? "Alkol Kullanımı" : "Alcohol Use"}
        </Label>
        <RadioGroup
          value={data.alcohol_use}
          onValueChange={(v) => v && updateData({ alcohol_use: v })}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="none" id="alc-none" />
            <Label htmlFor="alc-none" className="font-normal">{tr ? "Kullanmıyorum" : "None"}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="occasional" id="alc-occ" />
            <Label htmlFor="alc-occ" className="font-normal">{tr ? "Ara sıra (sosyal içici)" : "Occasional (social drinking)"}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="regular" id="alc-reg" />
            <Label htmlFor="alc-reg" className="font-normal">{tr ? "Düzenli (haftada birkaç kez)" : "Regular (several times a week)"}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="heavy" id="alc-heavy" />
            <Label htmlFor="alc-heavy" className="font-normal">{tr ? "Ağır (günlük)" : "Heavy (daily)"}</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Cigarette className="h-4 w-4" />
          {tr ? "Sigara Kullanımı" : "Smoking"}
        </Label>
        <RadioGroup
          value={data.smoking_use}
          onValueChange={(v) => v && updateData({ smoking_use: v })}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="none" id="smk-none" />
            <Label htmlFor="smk-none" className="font-normal">{tr ? "Hiç içmedim" : "Never smoked"}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="former" id="smk-former" />
            <Label htmlFor="smk-former" className="font-normal">{tr ? "Eski içici (bıraktım)" : "Former smoker (quit)"}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="current" id="smk-current" />
            <Label htmlFor="smk-current" className="font-normal">{tr ? "Aktif içici" : "Current smoker"}</Label>
          </div>
        </RadioGroup>
      </div>

      <p className="text-xs text-muted-foreground">
        {tr
          ? "Alkol ve sigara hem ilaçlarla hem de bitkisel takviyelerle etkileşebilir. Bu bilgi daha güvenli öneriler sunmamızı sağlar."
          : "Alcohol and smoking can interact with both medications and herbal supplements. This information helps us provide safer recommendations."}
      </p>
    </div>
  );
}
