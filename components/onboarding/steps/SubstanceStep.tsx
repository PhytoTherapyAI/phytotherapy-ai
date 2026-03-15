"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Wine, Cigarette } from "lucide-react";
import type { OnboardingData } from "../OnboardingWizard";

interface Props {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

export function SubstanceStep({ data, updateData }: Props) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Wine className="h-4 w-4" />
          Alcohol Use
        </Label>
        <RadioGroup
          value={data.alcohol_use}
          onValueChange={(v) => v && updateData({ alcohol_use: v })}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="none" id="alc-none" />
            <Label htmlFor="alc-none" className="font-normal">None</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="occasional" id="alc-occ" />
            <Label htmlFor="alc-occ" className="font-normal">Occasional (social drinking)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="regular" id="alc-reg" />
            <Label htmlFor="alc-reg" className="font-normal">Regular (several times a week)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="heavy" id="alc-heavy" />
            <Label htmlFor="alc-heavy" className="font-normal">Heavy (daily)</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Cigarette className="h-4 w-4" />
          Smoking
        </Label>
        <RadioGroup
          value={data.smoking_use}
          onValueChange={(v) => v && updateData({ smoking_use: v })}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="none" id="smk-none" />
            <Label htmlFor="smk-none" className="font-normal">Never smoked</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="former" id="smk-former" />
            <Label htmlFor="smk-former" className="font-normal">Former smoker (quit)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="current" id="smk-current" />
            <Label htmlFor="smk-current" className="font-normal">Current smoker</Label>
          </div>
        </RadioGroup>
      </div>

      <p className="text-xs text-muted-foreground">
        Alcohol and smoking can interact with both medications and herbal supplements. This information helps us provide safer recommendations.
      </p>
    </div>
  );
}
