// © 2026 Doctopal — All Rights Reserved
"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Heart, Dna } from "lucide-react";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import type { OnboardingData } from "../OnboardingWizard";

interface Props {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

const FAMILY_CONDITIONS = [
  { id: "Early Heart Attack", key: "onb.familyCardio", emoji: "💔" },
  { id: "Family Diabetes", key: "onb.familyDiabetes", emoji: "🩸" },
  { id: "Family Thyroid", key: "onb.familyThyroid", emoji: "🦋" },
  { id: "Familial Cancer", key: "onb.familyCancer", emoji: "🎗️" },
  { id: "Family Alzheimer", key: "onb.familyAlzheimer", emoji: "🧠" },
  { id: "Family Psychiatric", key: "onb.familyPsychiatric", emoji: "🧩" },
];

export function FamilyHistoryStep({ data, updateData }: Props) {
  const { lang } = useLang();
  // Store family history in supplements array as a temporary field (or we can add to chronic_conditions with a prefix)
  // Using a simple approach: store in chronic_conditions with "family:" prefix
  const familyConditions = data.chronic_conditions.filter(c => c.startsWith("family:"));
  const [noFamily, setNoFamily] = useState(false);

  const toggleFamily = (condId: string) => {
    const key = `family:${condId}`;
    setNoFamily(false);
    const existing = data.chronic_conditions;
    if (existing.includes(key)) {
      updateData({ chronic_conditions: existing.filter(c => c !== key) });
    } else {
      updateData({ chronic_conditions: [...existing, key] });
    }
  };

  const handleNoFamily = (checked: boolean) => {
    setNoFamily(checked);
    if (checked) {
      // Remove all family: entries
      updateData({
        chronic_conditions: data.chronic_conditions.filter(c => !c.startsWith("family:")),
      });
    }
  };

  const isFamilySelected = (condId: string) => data.chronic_conditions.includes(`family:${condId}`);

  return (
    <div className="space-y-5">
      {/* Clean bill */}
      <div className="flex items-center space-x-2 rounded-xl bg-green-50 dark:bg-green-950/20 p-3 border border-green-200 dark:border-green-800">
        <Checkbox
          id="no-family"
          checked={noFamily}
          onCheckedChange={(checked) => handleNoFamily(checked === true)}
        />
        <Label htmlFor="no-family" className="text-sm font-medium text-green-700 dark:text-green-400 cursor-pointer">
          🟢 {tx("onb.noFamilyHistory", lang)}
        </Label>
      </div>

      {!noFamily && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {FAMILY_CONDITIONS.map((cond) => (
              <Badge
                key={cond.id}
                variant={isFamilySelected(cond.id) ? "default" : "outline"}
                className="cursor-pointer transition-colors text-sm py-1.5 px-3"
                onClick={() => toggleFamily(cond.id)}
              >
                {cond.emoji} {tx(cond.key, lang)}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground italic">
        {tx("onb.familyWhyNote", lang)}
      </p>
    </div>
  );
}
