// © 2026 Doctopal — All Rights Reserved
"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Stethoscope, ShieldAlert } from "lucide-react";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import type { OnboardingData } from "../OnboardingWizard";

interface Props {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

// System-grouped conditions (stored in English for DB)
const CONDITION_GROUPS = [
  {
    labelKey: "onb.categoryCardio",
    conditions: [
      { id: "Hypertension", key: "onb.hypertension" },
      { id: "Arrhythmia", key: "onb.arrhythmia" },
      { id: "Heart Failure", key: "onb.heartFailure" },
    ],
  },
  {
    labelKey: "onb.categoryEndocrine",
    conditions: [
      { id: "Diabetes", key: "onb.diabetesType" },
      { id: "Thyroid Disorder", key: "onb.thyroid" },
    ],
  },
  {
    labelKey: "onb.categoryNeuro",
    conditions: [
      { id: "Depression/Anxiety", key: "onb.depressionAnxiety" },
      { id: "Epilepsy", key: "onb.epilepsy" },
    ],
  },
  {
    labelKey: "onb.categoryRespiratory",
    conditions: [
      { id: "Asthma", key: "onb.asthma" },
      { id: "COPD", key: "onb.copd" },
    ],
  },
  {
    labelKey: "onb.categorySurgical",
    conditions: [
      { id: "Bariatric Surgery", key: "onb.bariatricSurgery" },
    ],
  },
];

export function MedicalHistoryStep({ data, updateData }: Props) {
  const { lang } = useLang();
  const [customCondition, setCustomCondition] = useState("");
  const [noChronic, setNoChronic] = useState(false);

  const toggleCondition = (condition: string) => {
    setNoChronic(false);
    const existing = data.chronic_conditions;
    if (existing.includes(condition)) {
      updateData({ chronic_conditions: existing.filter((c) => c !== condition) });
    } else {
      updateData({ chronic_conditions: [...existing, condition] });
    }
  };

  const addCustomCondition = () => {
    if (!customCondition.trim()) return;
    setNoChronic(false);
    if (!data.chronic_conditions.includes(customCondition.trim())) {
      updateData({ chronic_conditions: [...data.chronic_conditions, customCondition.trim()] });
    }
    setCustomCondition("");
  };

  const handleNoChronic = (checked: boolean) => {
    setNoChronic(checked);
    if (checked) {
      // Keep family: entries, only clear medical conditions
      updateData({
        chronic_conditions: data.chronic_conditions.filter(c => c.startsWith("family:")),
        kidney_disease: false,
        liver_disease: false,
        recent_surgery: false,
      });
    }
  };

  // All known condition IDs from groups
  const knownIds = CONDITION_GROUPS.flatMap(g => g.conditions.map(c => c.id));

  return (
    <div className="space-y-5">
      {/* Clean bill of health */}
      <div className="flex items-center space-x-2 rounded-xl bg-green-50 dark:bg-green-950/20 p-3 border border-green-200 dark:border-green-800">
        <Checkbox
          id="no-chronic"
          checked={noChronic}
          onCheckedChange={(checked) => handleNoChronic(checked === true)}
        />
        <Label htmlFor="no-chronic" className="text-sm font-medium text-green-700 dark:text-green-400 cursor-pointer">
          🟢 {tx("onb.noChronic", lang)}
        </Label>
      </div>

      {!noChronic && (
        <>
          {/* Critical conditions */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <ShieldAlert className="h-4 w-4" />
              {tx("onb.criticalConditions", lang)}
            </Label>
            <div className="space-y-2 rounded-lg border border-red-200 dark:border-red-800 p-3 bg-red-50/50 dark:bg-red-950/10">
              <div className="flex items-center space-x-2">
                <Checkbox id="kidney" checked={data.kidney_disease}
                  onCheckedChange={(c) => updateData({ kidney_disease: c === true })} />
                <Label htmlFor="kidney" className="font-normal text-sm">{tx("onb.advancedOrganFailure", lang)}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="liver" checked={data.liver_disease}
                  onCheckedChange={(c) => updateData({ liver_disease: c === true })} />
                <Label htmlFor="liver" className="font-normal text-sm">🩸 {tx("onb.bleedingDisorder", lang)}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="immune" checked={data.recent_surgery}
                  onCheckedChange={(c) => updateData({ recent_surgery: c === true })} />
                <Label htmlFor="immune" className="font-normal text-sm">🛡️ {tx("onb.immuneSuppressed", lang)}</Label>
              </div>
            </div>
          </div>

          {/* System-grouped chronic conditions */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              {tx("onb.chronicConditions", lang)}
            </Label>
            {CONDITION_GROUPS.map((group) => (
              <div key={group.labelKey} className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {tx(group.labelKey, lang)}
                </p>
                <div className="flex flex-wrap gap-2">
                  {group.conditions.map((cond) => (
                    <Badge
                      key={cond.id}
                      variant={data.chronic_conditions.includes(cond.id) ? "default" : "outline"}
                      className="cursor-pointer transition-colors"
                      onClick={() => toggleCondition(cond.id)}
                    >
                      {tx(cond.key, lang)}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Custom conditions */}
          <div className="space-y-2">
            {data.chronic_conditions
              .filter((c) => !knownIds.includes(c))
              .map((condition) => (
                <Badge key={condition} variant="default" className="gap-1 mr-1">
                  {condition}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => toggleCondition(condition)} />
                </Badge>
              ))}
            <div className="flex gap-2">
              <Input
                placeholder={tx("onb.otherCondition", lang)}
                value={customCondition}
                onChange={(e) => setCustomCondition(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomCondition())}
              />
              <Button variant="outline" size="sm" onClick={addCustomCondition} disabled={!customCondition.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      <p className="text-xs text-muted-foreground">
        {tx("onb.medHistoryNote", lang)}
      </p>
    </div>
  );
}
