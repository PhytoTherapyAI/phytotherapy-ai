"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import type { OnboardingData } from "../OnboardingWizard";

interface Props {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

function calcAge(birthDate: string): number | null {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function BasicInfoStep({ data, updateData }: Props) {
  const { lang } = useLang();

  const handleBirthDateChange = (value: string) => {
    updateData({ birth_date: value, age: calcAge(value) });
  };

  const ageWarning = data.age !== null && data.age < 18;

  // Max date = today, min date = 120 years ago
  const today = new Date().toISOString().split("T")[0];
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 120);
  const minDateStr = minDate.toISOString().split("T")[0];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="full-name">{tx("onb.fullName", lang)}</Label>
        <Input
          id="full-name"
          placeholder={tx("onb.fullNamePlaceholder", lang)}
          value={data.full_name}
          onChange={(e) => updateData({ full_name: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="birth-date">{tx("onb.birthDate", lang)}</Label>
        <Input
          id="birth-date"
          type="date"
          min={minDateStr}
          max={today}
          value={data.birth_date || ""}
          onChange={(e) => handleBirthDateChange(e.target.value)}
        />
        {data.age !== null && data.age >= 0 && (
          <p className="text-xs text-muted-foreground">
            {tx("onb.yourAge", lang)} {data.age}
          </p>
        )}
        {ageWarning && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {tx("onb.ageWarning", lang)}
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="space-y-2">
        <Label>{tx("onb.gender", lang)}</Label>
        <Select value={data.gender} onValueChange={(v) => v && updateData({ gender: v })}>
          <SelectTrigger>
            <SelectValue placeholder={tx("onb.genderPlaceholder", lang)} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">{tx("onb.male", lang)}</SelectItem>
            <SelectItem value="female">{tx("onb.female", lang)}</SelectItem>
            <SelectItem value="other">{tx("onb.other", lang)}</SelectItem>
            <SelectItem value="prefer_not_to_say">{tx("onb.preferNotToSay", lang)}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-muted-foreground">
        {tx("onb.requiredFields", lang)}
      </p>
    </div>
  );
}
