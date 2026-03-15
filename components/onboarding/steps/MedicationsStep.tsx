"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Pill } from "lucide-react";
import type { OnboardingData } from "../OnboardingWizard";

interface Props {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

export function MedicationsStep({ data, updateData }: Props) {
  const [brandName, setBrandName] = useState("");
  const [genericName, setGenericName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");

  const addMedication = () => {
    if (!brandName.trim() && !genericName.trim()) return;
    updateData({
      medications: [
        ...data.medications,
        {
          brand_name: brandName.trim(),
          generic_name: genericName.trim(),
          dosage: dosage.trim(),
          frequency: frequency.trim(),
        },
      ],
      no_medications: false,
    });
    setBrandName("");
    setGenericName("");
    setDosage("");
    setFrequency("");
  };

  const removeMedication = (index: number) => {
    updateData({
      medications: data.medications.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="no-meds"
          checked={data.no_medications}
          onCheckedChange={(checked) =>
            updateData({
              no_medications: checked === true,
              medications: checked === true ? [] : data.medications,
            })
          }
        />
        <Label htmlFor="no-meds" className="text-sm font-normal">
          I don&apos;t take any medications
        </Label>
      </div>

      {!data.no_medications && (
        <>
          {/* Current medications list */}
          {data.medications.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Your medications:</Label>
              {data.medications.map((med, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Pill className="h-4 w-4 text-emerald-600" />
                    <div>
                      <p className="font-medium">
                        {med.brand_name || med.generic_name}
                        {med.brand_name && med.generic_name && (
                          <span className="ml-1 text-sm text-muted-foreground">
                            ({med.generic_name})
                          </span>
                        )}
                      </p>
                      {(med.dosage || med.frequency) && (
                        <div className="flex gap-2">
                          {med.dosage && <Badge variant="secondary">{med.dosage}</Badge>}
                          {med.frequency && <Badge variant="outline">{med.frequency}</Badge>}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeMedication(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Add medication form */}
          <div className="space-y-3 rounded-lg border border-dashed p-4">
            <p className="text-sm font-medium">Add a medication</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="brand" className="text-xs">Brand Name</Label>
                <Input
                  id="brand"
                  placeholder="e.g., Glifor, Coumadin"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="generic" className="text-xs">Generic / Active Ingredient</Label>
                <Input
                  id="generic"
                  placeholder="e.g., Metformin, Warfarin"
                  value={genericName}
                  onChange={(e) => setGenericName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="dosage" className="text-xs">Dosage (optional)</Label>
                <Input
                  id="dosage"
                  placeholder="e.g., 500mg, 10mg"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="freq" className="text-xs">Frequency (optional)</Label>
                <Input
                  id="freq"
                  placeholder="e.g., twice daily, once at night"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                />
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={addMedication}
              disabled={!brandName.trim() && !genericName.trim()}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Medication
            </Button>
          </div>
        </>
      )}

      <p className="text-xs text-muted-foreground">
        We check every herbal recommendation against your medications for safety. This information is encrypted and only visible to you.
      </p>
    </div>
  );
}
