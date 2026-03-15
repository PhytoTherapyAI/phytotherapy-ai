"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Sparkles } from "lucide-react";
import type { OnboardingData } from "../OnboardingWizard";

interface Props {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

const commonSupplements = [
  "Vitamin D", "Vitamin B12", "Iron", "Omega-3",
  "Magnesium", "Zinc", "Probiotics", "Multivitamin",
];

export function OptionalProfileStep({ data, updateData }: Props) {
  const [customSupplement, setCustomSupplement] = useState("");

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
        <Sparkles className="h-4 w-4 text-emerald-600" />
        These details help us personalize your recommendations. You can skip this and fill it later.
      </div>

      {/* Physical measurements */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="height">Height (cm)</Label>
          <Input
            id="height"
            type="number"
            placeholder="e.g., 175"
            value={data.height_cm ?? ""}
            onChange={(e) => updateData({ height_cm: e.target.value ? parseInt(e.target.value) : null })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input
            id="weight"
            type="number"
            placeholder="e.g., 70"
            value={data.weight_kg ?? ""}
            onChange={(e) => updateData({ weight_kg: e.target.value ? parseFloat(e.target.value) : null })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Blood Group</Label>
        <Select value={data.blood_group} onValueChange={(v) => v && updateData({ blood_group: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Select blood group" />
          </SelectTrigger>
          <SelectContent>
            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((group) => (
              <SelectItem key={group} value={group}>{group}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Diet Type</Label>
        <Select value={data.diet_type} onValueChange={(v) => v && updateData({ diet_type: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Select your diet" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="regular">Regular (no restrictions)</SelectItem>
            <SelectItem value="vegetarian">Vegetarian</SelectItem>
            <SelectItem value="vegan">Vegan</SelectItem>
            <SelectItem value="keto">Keto</SelectItem>
            <SelectItem value="gluten_free">Gluten-free</SelectItem>
            <SelectItem value="halal">Halal</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Exercise Frequency</Label>
        <Select value={data.exercise_frequency} onValueChange={(v) => v && updateData({ exercise_frequency: v })}>
          <SelectTrigger>
            <SelectValue placeholder="How often do you exercise?" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sedentary">Sedentary (no exercise)</SelectItem>
            <SelectItem value="light">Light (1-2x/week)</SelectItem>
            <SelectItem value="moderate">Moderate (3-4x/week)</SelectItem>
            <SelectItem value="active">Active (5+x/week)</SelectItem>
            <SelectItem value="athlete">Athlete / Professional</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Sleep Quality</Label>
        <Select value={data.sleep_quality} onValueChange={(v) => v && updateData({ sleep_quality: v })}>
          <SelectTrigger>
            <SelectValue placeholder="How well do you sleep?" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="good">Good (7-9 hours, refreshed)</SelectItem>
            <SelectItem value="fair">Fair (sometimes restless)</SelectItem>
            <SelectItem value="poor">Poor (frequent issues)</SelectItem>
            <SelectItem value="insomnia">Insomnia / Severe problems</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Supplements */}
      <div className="space-y-3">
        <Label>Current Supplements / Vitamins</Label>
        <div className="flex flex-wrap gap-2">
          {commonSupplements.map((supplement) => (
            <Badge
              key={supplement}
              variant={data.supplements.includes(supplement) ? "default" : "outline"}
              className="cursor-pointer transition-colors"
              onClick={() => toggleSupplement(supplement)}
            >
              {supplement}
            </Badge>
          ))}
          {data.supplements
            .filter((s) => !commonSupplements.includes(s))
            .map((supplement) => (
              <Badge key={supplement} variant="default" className="gap-1">
                {supplement}
                <X className="h-3 w-3 cursor-pointer" onClick={() => toggleSupplement(supplement)} />
              </Badge>
            ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Other supplement..."
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
