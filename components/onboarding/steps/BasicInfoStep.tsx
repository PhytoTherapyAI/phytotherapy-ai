"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useLang } from "@/components/layout/language-toggle";
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
  const tr = lang === "tr";

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
        <Label htmlFor="full-name">{tr ? "Ad Soyad *" : "Full Name *"}</Label>
        <Input
          id="full-name"
          placeholder={tr ? "Adınızı ve soyadınızı girin" : "Enter your full name"}
          value={data.full_name}
          onChange={(e) => updateData({ full_name: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="birth-date">{tr ? "Doğum Tarihi *" : "Date of Birth *"}</Label>
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
            {tr ? `Yaşınız: ${data.age}` : `Your age: ${data.age}`}
          </p>
        )}
        {ageWarning && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {tr
                ? "Bu hizmeti kullanmak için 18 yaşında veya daha büyük olmalısınız. Önerilerimiz yalnızca yetişkinler için tasarlanmıştır."
                : "You must be 18 or older to use this service. Our recommendations are designed for adults only."}
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="space-y-2">
        <Label>{tr ? "Cinsiyet *" : "Gender *"}</Label>
        <Select value={data.gender} onValueChange={(v) => v && updateData({ gender: v })}>
          <SelectTrigger>
            <SelectValue placeholder={tr ? "Cinsiyetinizi seçin" : "Select your gender"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">{tr ? "Erkek" : "Male"}</SelectItem>
            <SelectItem value="female">{tr ? "Kadın" : "Female"}</SelectItem>
            <SelectItem value="other">{tr ? "Diğer" : "Other"}</SelectItem>
            <SelectItem value="prefer_not_to_say">{tr ? "Belirtmek istemiyorum" : "Prefer not to say"}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-muted-foreground">
        {tr
          ? "* Zorunlu alanlar. Bu bilgiler yaşa ve cinsiyete uygun güvenli öneriler sunmamızı sağlar."
          : "* Required fields. This information helps us provide safe, age-and-gender-appropriate recommendations."}
      </p>
    </div>
  );
}
