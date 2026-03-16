"use client";

import { useState } from "react";
import { Loader2, FlaskConical, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BLOOD_TEST_MARKERS,
  CATEGORY_INFO,
  type BloodTestCategory,
} from "@/lib/blood-reference";

interface BloodTestFormProps {
  onSubmit: (values: Record<string, number>, gender: "male" | "female" | null) => void;
  isLoading: boolean;
}

const CATEGORY_ORDER: BloodTestCategory[] = [
  "lipid",
  "vitamin",
  "mineral",
  "metabolic",
  "thyroid",
  "inflammation",
  "liver",
  "kidney",
  "blood_count",
];

export function BloodTestForm({ onSubmit, isLoading }: BloodTestFormProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [gender, setGender] = useState<"male" | "female" | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(["lipid", "vitamin", "mineral", "metabolic"])
  );

  const filledCount = Object.values(values).filter((v) => v.trim() !== "").length;

  const handleChange = (markerId: string, value: string) => {
    // Allow only numbers and dots
    if (value !== "" && !/^\d*\.?\d*$/.test(value)) return;
    setValues((prev) => ({ ...prev, [markerId]: value }));
  };

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericValues: Record<string, number> = {};
    for (const [key, val] of Object.entries(values)) {
      const num = parseFloat(val);
      if (!isNaN(num) && num >= 0) {
        numericValues[key] = num;
      }
    }
    if (Object.keys(numericValues).length === 0) return;
    onSubmit(numericValues, gender);
  };

  // Quick fill demo data
  const fillDemo = () => {
    setValues({
      total_cholesterol: "245",
      ldl: "155",
      hdl: "42",
      triglycerides: "180",
      vitamin_d: "14",
      vitamin_b12: "350",
      ferritin: "8",
      hba1c: "6.2",
      fasting_glucose: "112",
      tsh: "3.2",
      crp: "4.5",
      hemoglobin: "11.8",
    });
    setGender("female");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Gender Selection */}
      <div className="rounded-lg border bg-card p-4">
        <Label className="mb-3 block text-sm font-medium">
          Biological Sex (for gender-specific reference ranges)
        </Label>
        <div className="flex gap-3">
          {(["male", "female"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGender(gender === g ? null : g)}
              className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                gender === g
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                  : "hover:border-muted-foreground/50"
              }`}
            >
              {g === "male" ? "Male" : "Female"}
            </button>
          ))}
        </div>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Enter the values from your blood test report. You only need to fill in the markers
          you have — leave the rest blank. At least 1 value is required.
        </p>
      </div>

      {/* Marker Categories */}
      {CATEGORY_ORDER.map((cat) => {
        const info = CATEGORY_INFO[cat];
        const markers = BLOOD_TEST_MARKERS.filter((m) => m.category === cat);
        const isExpanded = expandedCategories.has(cat);
        const filledInCat = markers.filter((m) => values[m.id]?.trim()).length;

        return (
          <div key={cat} className="rounded-lg border bg-card">
            <button
              type="button"
              onClick={() => toggleCategory(cat)}
              className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold">{info.label}</span>
                <span className="text-xs text-muted-foreground">
                  ({markers.length} markers)
                </span>
                {filledInCat > 0 && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                    {filledInCat} filled
                  </span>
                )}
              </div>
              <span className="text-muted-foreground">{isExpanded ? "▲" : "▼"}</span>
            </button>

            {isExpanded && (
              <div className="border-t p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  {markers.map((marker) => (
                    <div key={marker.id} className="space-y-1">
                      <Label
                        htmlFor={marker.id}
                        className="text-xs font-medium text-muted-foreground"
                      >
                        {marker.name}{" "}
                        <span className="text-[10px]">
                          ({marker.ranges.optimal_low}-{marker.ranges.optimal_high}{" "}
                          {marker.unit})
                        </span>
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id={marker.id}
                          type="text"
                          inputMode="decimal"
                          placeholder={`e.g. ${Math.round(
                            (marker.ranges.optimal_low + marker.ranges.optimal_high) / 2
                          )}`}
                          value={values[marker.id] || ""}
                          onChange={(e) => handleChange(marker.id, e.target.value)}
                          className="h-9"
                        />
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {marker.unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            type="submit"
            disabled={isLoading || filledCount === 0}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <FlaskConical className="h-4 w-4" />
                Analyze ({filledCount} markers)
              </>
            )}
          </Button>

          <Button type="button" variant="outline" size="sm" onClick={fillDemo}>
            Fill Demo Data
          </Button>
        </div>

        {filledCount > 0 && (
          <button
            type="button"
            onClick={() => setValues({})}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear all
          </button>
        )}
      </div>
    </form>
  );
}
