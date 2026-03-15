"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, AlertTriangle } from "lucide-react";
import type { OnboardingData } from "../OnboardingWizard";

interface Props {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

const severityColors: Record<string, string> = {
  mild: "bg-yellow-100 text-yellow-800",
  moderate: "bg-orange-100 text-orange-800",
  severe: "bg-red-100 text-red-800",
  anaphylaxis: "bg-red-200 text-red-900",
};

export function AllergiesStep({ data, updateData }: Props) {
  const [allergen, setAllergen] = useState("");
  const [severity, setSeverity] = useState("mild");

  const addAllergy = () => {
    if (!allergen.trim()) return;
    updateData({
      allergies: [...data.allergies, { allergen: allergen.trim(), severity }],
      no_allergies: false,
    });
    setAllergen("");
    setSeverity("mild");
  };

  const removeAllergy = (index: number) => {
    updateData({ allergies: data.allergies.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="no-allergies"
          checked={data.no_allergies}
          onCheckedChange={(checked) =>
            updateData({
              no_allergies: checked === true,
              allergies: checked === true ? [] : data.allergies,
            })
          }
        />
        <Label htmlFor="no-allergies" className="text-sm font-normal">
          I have no known allergies
        </Label>
      </div>

      {!data.no_allergies && (
        <>
          {data.allergies.length > 0 && (
            <div className="space-y-2">
              {data.allergies.map((allergy, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span className="font-medium">{allergy.allergen}</span>
                    <Badge className={severityColors[allergy.severity]}>{allergy.severity}</Badge>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeAllergy(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3 rounded-lg border border-dashed p-4">
            <p className="text-sm font-medium">Add an allergy</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="allergen" className="text-xs">Allergen</Label>
                <Input
                  id="allergen"
                  placeholder="e.g., Penicillin, Chamomile, Nuts"
                  value={allergen}
                  onChange={(e) => setAllergen(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Severity</Label>
                <Select value={severity} onValueChange={(v) => v && setSeverity(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mild">Mild</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="severe">Severe</SelectItem>
                    <SelectItem value="anaphylaxis">Anaphylaxis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={addAllergy} disabled={!allergen.trim()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Allergy
            </Button>
          </div>
        </>
      )}

      <p className="text-xs text-muted-foreground">
        Herbal products may cross-react with known allergies. We filter recommendations accordingly.
      </p>
    </div>
  );
}
