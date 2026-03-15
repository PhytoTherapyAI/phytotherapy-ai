"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Stethoscope } from "lucide-react";
import type { OnboardingData } from "../OnboardingWizard";

interface Props {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

const commonConditions = [
  "Diabetes", "Hypertension", "Asthma", "Heart Disease",
  "Thyroid Disorder", "Arthritis", "Depression", "Anxiety",
  "COPD", "Epilepsy",
];

export function MedicalHistoryStep({ data, updateData }: Props) {
  const [customCondition, setCustomCondition] = useState("");

  const toggleCondition = (condition: string) => {
    const existing = data.chronic_conditions;
    if (existing.includes(condition)) {
      updateData({ chronic_conditions: existing.filter((c) => c !== condition) });
    } else {
      updateData({ chronic_conditions: [...existing, condition] });
    }
  };

  const addCustomCondition = () => {
    if (!customCondition.trim()) return;
    if (!data.chronic_conditions.includes(customCondition.trim())) {
      updateData({ chronic_conditions: [...data.chronic_conditions, customCondition.trim()] });
    }
    setCustomCondition("");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Stethoscope className="h-4 w-4" />
          Critical Conditions
        </Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="kidney"
              checked={data.kidney_disease}
              onCheckedChange={(checked) => updateData({ kidney_disease: checked === true })}
            />
            <Label htmlFor="kidney" className="font-normal">Kidney disease</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="liver"
              checked={data.liver_disease}
              onCheckedChange={(checked) => updateData({ liver_disease: checked === true })}
            />
            <Label htmlFor="liver" className="font-normal">Liver disease</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="surgery"
              checked={data.recent_surgery}
              onCheckedChange={(checked) => updateData({ recent_surgery: checked === true })}
            />
            <Label htmlFor="surgery" className="font-normal">
              Surgery or hospitalization in the last 3 months
            </Label>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Label>Chronic Conditions</Label>
        <div className="flex flex-wrap gap-2">
          {commonConditions.map((condition) => (
            <Badge
              key={condition}
              variant={data.chronic_conditions.includes(condition) ? "default" : "outline"}
              className="cursor-pointer transition-colors"
              onClick={() => toggleCondition(condition)}
            >
              {condition}
            </Badge>
          ))}
        </div>

        {/* Custom conditions */}
        {data.chronic_conditions
          .filter((c) => !commonConditions.includes(c))
          .map((condition) => (
            <Badge key={condition} variant="default" className="gap-1">
              {condition}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => toggleCondition(condition)}
              />
            </Badge>
          ))}

        <div className="flex gap-2">
          <Input
            placeholder="Other condition..."
            value={customCondition}
            onChange={(e) => setCustomCondition(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomCondition())}
          />
          <Button variant="outline" size="sm" onClick={addCustomCondition} disabled={!customCondition.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Kidney and liver conditions significantly affect how herbs are metabolized. This ensures we never recommend anything that could worsen your condition.
      </p>
    </div>
  );
}
