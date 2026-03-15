"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { OnboardingData } from "../OnboardingWizard";

interface Props {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

export function BasicInfoStep({ data, updateData }: Props) {
  const ageWarning = data.age !== null && data.age < 18;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="full-name">Full Name *</Label>
        <Input
          id="full-name"
          placeholder="Enter your full name"
          value={data.full_name}
          onChange={(e) => updateData({ full_name: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="age">Age *</Label>
        <Input
          id="age"
          type="number"
          placeholder="Enter your age"
          min={1}
          max={120}
          value={data.age ?? ""}
          onChange={(e) => updateData({ age: e.target.value ? parseInt(e.target.value) : null })}
        />
        {ageWarning && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You must be 18 or older to use this service. Our recommendations are designed for adults only.
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="space-y-2">
        <Label>Gender *</Label>
        <Select value={data.gender} onValueChange={(v) => v && updateData({ gender: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Select your gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="other">Other</SelectItem>
            <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-muted-foreground">
        * Required fields. This information helps us provide safe, age-and-gender-appropriate recommendations.
      </p>
    </div>
  );
}
