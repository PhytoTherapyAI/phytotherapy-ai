// © 2026 Doctopal — All Rights Reserved
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const GENDER_OPTIONS = [
  { value: "male", en: "Male", tr: "Erkek" },
  { value: "female", en: "Female", tr: "Kadın" },
  { value: "other", en: "Other", tr: "Diğer" },
  { value: "prefer_not_to_say", en: "Prefer not to say", tr: "Belirtmek istemiyorum" },
];

export function BasicInfoStep({ data, updateData }: Props) {
  const { lang } = useLang();

  const handleBirthDateChange = (value: string) => {
    updateData({ birth_date: value, age: calcAge(value) });
  };

  const ageWarning = data.age !== null && data.age < 18;

  const today = new Date().toISOString().split("T")[0];
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 120);
  const minDateStr = minDate.toISOString().split("T")[0];

  return (
    <div className="space-y-4">
      {/* Name / Display Name */}
      <div className="space-y-2">
        <Label htmlFor="full-name">{tx("onb.displayName", lang)}</Label>
        <Input
          id="full-name"
          placeholder={tx("onb.displayNamePlaceholder", lang)}
          value={data.full_name}
          onChange={(e) => updateData({ full_name: e.target.value })}
          className="text-base"
        />
      </div>

      {/* Date of Birth — styled card */}
      <div className="space-y-2">
        <Label htmlFor="birth-date">{tx("onb.birthDate", lang)}</Label>
        <div className="relative">
          <Input
            id="birth-date"
            type="date"
            min={minDateStr}
            max={today}
            value={data.birth_date || ""}
            onChange={(e) => handleBirthDateChange(e.target.value)}
            className="text-base h-11 rounded-xl bg-muted/30 border-muted-foreground/20 focus:bg-background"
          />
        </div>
        {data.age !== null && data.age >= 0 && (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1">
            <span className="text-xs font-medium text-primary">
              {tx("onb.yourAge", lang)} {data.age}
            </span>
          </div>
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

      {/* Biological Sex — chip buttons */}
      <div className="space-y-2">
        <Label>{tx("onb.gender", lang)}</Label>
        <p className="text-xs text-muted-foreground -mt-1">{tx("onb.genderNote", lang)}</p>
        <div className="flex flex-wrap gap-2">
          {GENDER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => updateData({ gender: opt.value })}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                data.gender === opt.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {lang === "tr" ? opt.tr : opt.en}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {tx("onb.requiredFields", lang)}
      </p>
    </div>
  );
}
