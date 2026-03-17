"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Baby, AlertTriangle } from "lucide-react";
import { useLang } from "@/components/layout/language-toggle";
import type { OnboardingData } from "../OnboardingWizard";

interface Props {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

export function PregnancyStep({ data, updateData }: Props) {
  const { lang } = useLang();
  const tr = lang === "tr";
  const showWarning = data.is_pregnant || data.is_breastfeeding;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Baby className="h-4 w-4" />
          {tr ? "Şu anda hamile misiniz?" : "Are you currently pregnant?"}
        </Label>
        <RadioGroup
          value={data.is_pregnant ? "yes" : "no"}
          onValueChange={(v) => v && updateData({ is_pregnant: v === "yes" })}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="preg-no" />
            <Label htmlFor="preg-no" className="font-normal">{tr ? "Hayır" : "No"}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="preg-yes" />
            <Label htmlFor="preg-yes" className="font-normal">{tr ? "Evet" : "Yes"}</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Baby className="h-4 w-4" />
          {tr ? "Şu anda emziriyor musunuz?" : "Are you currently breastfeeding?"}
        </Label>
        <RadioGroup
          value={data.is_breastfeeding ? "yes" : "no"}
          onValueChange={(v) => v && updateData({ is_breastfeeding: v === "yes" })}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="bf-no" />
            <Label htmlFor="bf-no" className="font-normal">{tr ? "Hayır" : "No"}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="bf-yes" />
            <Label htmlFor="bf-yes" className="font-normal">{tr ? "Evet" : "Yes"}</Label>
          </div>
        </RadioGroup>
      </div>

      {showWarning && (
        <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800 dark:text-orange-200">
            {tr
              ? "Birçok bitkisel ürün gebelik ve emzirme döneminde güvenli değildir. Sistemimiz tüm önerilere ekstra güvenlik filtreleri uygulayacaktır."
              : "Many herbal products are unsafe during pregnancy and breastfeeding. Our system will apply extra safety filters to all recommendations for your protection."}
          </AlertDescription>
        </Alert>
      )}

      <p className="text-xs text-muted-foreground">
        {tr
          ? "Bu bilgi ek güvenlik filtrelerini etkinleştirir. Yaygın kullanılan birçok bitki gebelik ve emzirme döneminde kontrendikedir."
          : "This information activates additional safety filters. Many commonly used herbs are contraindicated during pregnancy and lactation."}
      </p>
    </div>
  );
}
