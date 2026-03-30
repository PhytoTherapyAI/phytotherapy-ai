// © 2026 Phytotherapy.ai — All Rights Reserved
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft, ArrowRight, Leaf, CheckCircle2,
  User, Pill, AlertTriangle, Baby, Wine, HeartPulse, FileCheck, Sparkles,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { createBrowserClient } from "@/lib/supabase";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import { markFirstLoginDone } from "@/lib/daily-med-check";
import type { UserProfile } from "@/lib/database.types";

// Step components
import { BasicInfoStep } from "@/components/onboarding/steps/BasicInfoStep";
import { MedicationsStep } from "@/components/onboarding/steps/MedicationsStep";
import { AllergiesStep } from "@/components/onboarding/steps/AllergiesStep";
import { PregnancyStep } from "@/components/onboarding/steps/PregnancyStep";
import { SubstanceStep } from "@/components/onboarding/steps/SubstanceStep";
import { MedicalHistoryStep } from "@/components/onboarding/steps/MedicalHistoryStep";
import { ConsentStep } from "@/components/onboarding/steps/ConsentStep";
import { OptionalProfileStep } from "@/components/onboarding/steps/OptionalProfileStep";

const STEP_ICONS = [User, Pill, AlertTriangle, Baby, Wine, HeartPulse, FileCheck];

// Bilingual step definitions
function getSteps(lang: "en" | "tr") {
  if (lang === "tr") {
    return [
      { id: "basic", title: "Temel Bilgiler", description: "Kendiniz hakkında bilgi verin" },
      { id: "medications", title: "Mevcut İlaçlar", description: "Kullandığınız aktif ilaçlar" },
      { id: "allergies", title: "Alerjiler", description: "Bilinen alerjileriniz" },
      { id: "pregnancy", title: "Gebelik & Emzirme", description: "Üreme sağlığı durumu" },
      { id: "substances", title: "Alkol & Sigara", description: "Madde kullanım bilgisi" },
      { id: "medical", title: "Tıbbi Geçmiş", description: "Önemli sağlık durumları" },
      { id: "consent", title: "Şartlar & Onay", description: "Tıbbi sorumluluk reddi" },
    ];
  }
  return [
    { id: "basic", title: "Basic Information", description: "Tell us about yourself" },
    { id: "medications", title: "Current Medications", description: "Active medications you take" },
    { id: "allergies", title: "Allergies", description: "Known allergies" },
    { id: "pregnancy", title: "Pregnancy & Breastfeeding", description: "Reproductive health status" },
    { id: "substances", title: "Alcohol & Smoking", description: "Substance use information" },
    { id: "medical", title: "Medical History", description: "Key health conditions" },
    { id: "consent", title: "Terms & Consent", description: "Medical disclaimer agreement" },
  ];
}

function getLayer2Step(lang: "en" | "tr") {
  if (lang === "tr") {
    return { id: "optional", title: "Kişiselleştir (İsteğe Bağlı)", description: "Daha iyi öneriler için yardımcı olun" };
  }
  return { id: "optional", title: "Personalize (Optional)", description: "Help us give better recommendations" };
}

export interface OnboardingData {
  // Step 1: Basic info
  full_name: string;
  birth_date: string;
  age: number | null;
  gender: string;
  // Step 2: Medications
  medications: { brand_name: string; generic_name: string; dosage: string; frequency: string }[];
  no_medications: boolean;
  // Step 3: Allergies
  allergies: { allergen: string; severity: string }[];
  no_allergies: boolean;
  // Step 4: Pregnancy
  is_pregnant: boolean;
  is_breastfeeding: boolean;
  // Step 5: Substances
  alcohol_use: string;
  smoking_use: string;
  // Step 6: Medical history
  kidney_disease: boolean;
  liver_disease: boolean;
  recent_surgery: boolean;
  chronic_conditions: string[];
  // Step 7: Consent
  consent_agreed: boolean;
  // Layer 2 (optional)
  height_cm: number | null;
  weight_kg: number | null;
  blood_group: string;
  diet_type: string;
  exercise_frequency: string;
  sleep_quality: string;
  supplements: string[];
}

const defaultData: OnboardingData = {
  full_name: "",
  birth_date: "",
  age: null,
  gender: "",
  medications: [],
  no_medications: false,
  allergies: [],
  no_allergies: false,
  is_pregnant: false,
  is_breastfeeding: false,
  alcohol_use: "none",
  smoking_use: "none",
  kidney_disease: false,
  liver_disease: false,
  recent_surgery: false,
  chronic_conditions: [],
  consent_agreed: false,
  height_cm: null,
  weight_kg: null,
  blood_group: "",
  diet_type: "",
  exercise_frequency: "",
  sleep_quality: "",
  supplements: [],
};

interface Props {
  profile: UserProfile;
}

export function OnboardingWizard({ profile }: Props) {
  const router = useRouter();
  const { refreshProfile } = useAuth();
  const { lang } = useLang();
  const [currentStep, setCurrentStep] = useState(0);
  const [showLayer2, setShowLayer2] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [slideDir, setSlideDir] = useState<"left" | "right">("left");
  const [data, setData] = useState<OnboardingData>({
    ...defaultData,
    full_name: profile.full_name ?? "",
  });

  const ALL_LAYER1_STEPS = getSteps(lang);
  const LAYER2_STEP = getLayer2Step(lang);

  // Skip pregnancy step (index 3) if user is male
  const skipPregnancy = data.gender === "male";
  const LAYER1_STEPS = skipPregnancy
    ? ALL_LAYER1_STEPS.filter((_, i) => i !== 3)
    : ALL_LAYER1_STEPS;

  // Icon indices adjusted for skipped pregnancy
  const stepIconIndices = skipPregnancy
    ? [0, 1, 2, 4, 5, 6]
    : [0, 1, 2, 3, 4, 5, 6];

  const totalSteps = showLayer2 ? LAYER1_STEPS.length + 1 : LAYER1_STEPS.length;
  const isLayer2 = currentStep === LAYER1_STEPS.length;
  const currentStepInfo = isLayer2 ? LAYER2_STEP : LAYER1_STEPS[currentStep];
  const progress = ((currentStep + 1) / totalSteps) * 100;

  // Map visible step index to original step index for rendering
  const getOriginalStepIndex = (visibleIndex: number): number => {
    if (!skipPregnancy) return visibleIndex;
    return visibleIndex >= 3 ? visibleIndex + 1 : visibleIndex;
  };
  const origStep = getOriginalStepIndex(currentStep);

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const canProceed = (): boolean => {
    switch (origStep) {
      case 0: return !!data.full_name.trim() && !!data.birth_date && data.age !== null && data.age >= 18 && !!data.gender;
      case 1: return data.no_medications || data.medications.length > 0;
      case 2: return data.no_allergies || data.allergies.length > 0;
      case 3: return true; // pregnancy
      case 4: return !!data.alcohol_use && !!data.smoking_use;
      case 5: return true; // medical history
      case 6: return data.consent_agreed;
      case 7: return true; // layer 2
      default: return false;
    }
  };

  const animateStep = (dir: "left" | "right", cb: () => void) => {
    setSlideDir(dir);
    setAnimating(true);
    setTimeout(() => {
      cb();
      setAnimating(false);
    }, 200);
  };

  const handleNext = async () => {
    if (currentStep === LAYER1_STEPS.length - 1 && !showLayer2) {
      animateStep("left", () => {
        setShowLayer2(true);
        setCurrentStep(LAYER1_STEPS.length);
      });
      return;
    }

    if (currentStep < totalSteps - 1) {
      animateStep("left", () => setCurrentStep((prev) => prev + 1));
      return;
    }

    await saveOnboarding();
  };

  const handleBack = () => {
    animateStep("right", () => setCurrentStep((prev) => Math.max(0, prev - 1)));
  };

  const handleSkipLayer2 = async () => {
    await saveOnboarding();
  };

  const saveOnboarding = async () => {
    setIsSubmitting(true);
    try {
      const supabase = createBrowserClient();

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error("Auth error during onboarding save:", authError);
        alert(tx("onb.sessionExpired", lang));
        router.push("/auth/login");
        return;
      }

      const userId = user.id;

      // 1. Save medications
      if (data.medications.length > 0) {
        await supabase.from("user_medications").delete().eq("user_id", userId);

        const medsToInsert = data.medications.map((med) => ({
          user_id: userId,
          brand_name: med.brand_name,
          generic_name: med.generic_name,
          dosage: med.dosage,
          frequency: med.frequency,
          is_active: true,
        }));

        const { error: medError } = await supabase
          .from("user_medications")
          .insert(medsToInsert);

        if (medError) {
          console.error("[Onboarding] Medication insert error:", medError);
          alert(tx("onb.medSaveError", lang));
          return;
        }
      }

      // 2. Save allergies
      if (data.allergies.length > 0) {
        await supabase.from("user_allergies").delete().eq("user_id", userId);

        const allergiesToInsert = data.allergies.map((allergy) => ({
          user_id: userId,
          allergen: allergy.allergen,
          severity: allergy.severity,
        }));

        const { error: allergyError } = await supabase
          .from("user_allergies")
          .insert(allergiesToInsert);

        if (allergyError) {
          console.error("[Onboarding] Allergy insert error:", allergyError);
          alert(tx("onb.allergySaveError", lang));
          return;
        }
      }

      // 3. Save consent record
      try {
        await supabase.from("consent_records").insert({
          user_id: userId,
          consent_type: "medical_disclaimer",
          consent_text: "User agreed to medical disclaimer and terms of service during onboarding.",
        });
      } catch (consentErr) {
        console.error("[Onboarding] Consent save failed (non-critical):", consentErr);
      }

      // 4. Update profile
      const { error: profileError } = await supabase
        .from("user_profiles")
        .update({
          full_name: data.full_name,
          birth_date: data.birth_date || null,
          age: data.age,
          gender: data.gender,
          is_pregnant: data.is_pregnant,
          is_breastfeeding: data.is_breastfeeding,
          alcohol_use: data.alcohol_use,
          smoking_use: data.smoking_use,
          kidney_disease: data.kidney_disease,
          liver_disease: data.liver_disease,
          recent_surgery: data.recent_surgery,
          chronic_conditions: data.chronic_conditions,
          height_cm: data.height_cm,
          weight_kg: data.weight_kg,
          blood_group: data.blood_group || null,
          diet_type: data.diet_type || null,
          exercise_frequency: data.exercise_frequency || null,
          sleep_quality: data.sleep_quality || null,
          supplements: data.supplements,
          onboarding_complete: true,
          onboarding_layer2_complete: isLayer2,
          consent_timestamp: new Date().toISOString(),
          last_medication_update: new Date().toISOString(),
        })
        .eq("id", userId);

      if (profileError) {
        console.error("[Onboarding] Profile update error:", profileError);
        throw profileError;
      }

      // 5. Mark first login as done + confirm all checks
      markFirstLoginDone();

      // 6. Refresh profile and redirect
      await refreshProfile();
      router.push("/");
    } catch (error) {
      console.error("Onboarding save error:", error);
      alert(tx("onb.saveError", lang));
    } finally {
      setIsSubmitting(false);
    }
  };

  const CurrentStepIcon = isLayer2 ? Sparkles : STEP_ICONS[stepIconIndices[currentStep]] || User;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center animate-in fade-in duration-500">
        <div className="mx-auto mb-3 flex items-center justify-center gap-2">
          <Leaf className="h-6 w-6 text-primary" />
          <span className="font-sans-heading text-lg font-bold">
            Phyto<span className="text-[#b8965a] dark:text-[#c9a86c]">therapy</span><span className="text-primary">.ai</span>
          </span>
        </div>
        <h1 className="font-sans-heading text-2xl font-bold">
          {tx("onb.setupTitle", lang)}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {tx("onb.setupDesc", lang)}
        </p>
      </div>

      {/* Step Progress Indicators */}
      <div className="flex items-center justify-center gap-1.5">
        {LAYER1_STEPS.map((step, i) => {
          const StepIcon = STEP_ICONS[stepIconIndices[i]] || User;
          const isCompleted = i < currentStep;
          const isCurrent = i === currentStep && !isLayer2;
          return (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 ${
                  isCompleted
                    ? "bg-primary text-primary-foreground scale-90"
                    : isCurrent
                      ? "bg-primary/15 text-primary ring-2 ring-primary/30 scale-110"
                      : "bg-muted text-muted-foreground scale-90"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <StepIcon className="h-3.5 w-3.5" />
                )}
              </div>
              {i < LAYER1_STEPS.length - 1 && (
                <div
                  className={`mx-0.5 h-0.5 w-4 rounded-full transition-colors duration-300 sm:w-6 ${
                    i < currentStep ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          );
        })}
        {showLayer2 && (
          <>
            <div className={`mx-0.5 h-0.5 w-4 rounded-full transition-colors duration-300 sm:w-6 ${
              isLayer2 ? "bg-primary" : "bg-muted"
            }`} />
            <div className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 ${
              isLayer2
                ? "bg-primary/15 text-primary ring-2 ring-primary/30 scale-110"
                : "bg-muted text-muted-foreground scale-90"
            }`}>
              <Sparkles className="h-3.5 w-3.5" />
            </div>
          </>
        )}
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{tx("onb.stepOf", lang)} {currentStep + 1} {tx("onb.of", lang)} {totalSteps}</span>
          <span className="font-medium text-foreground">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div
        className={`transition-all duration-200 ${
          animating
            ? slideDir === "left"
              ? "translate-x-[-8px] opacity-0"
              : "translate-x-[8px] opacity-0"
            : "translate-x-0 opacity-100"
        }`}
      >
        <Card className="border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2.5 font-sans-heading">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <CurrentStepIcon className="h-4 w-4 text-primary" />
              </div>
              {currentStepInfo.title}
            </CardTitle>
            <CardDescription>{currentStepInfo.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {origStep === 0 && <BasicInfoStep data={data} updateData={updateData} />}
            {origStep === 1 && <MedicationsStep data={data} updateData={updateData} />}
            {origStep === 2 && <AllergiesStep data={data} updateData={updateData} />}
            {origStep === 3 && !skipPregnancy && <PregnancyStep data={data} updateData={updateData} />}
            {origStep === 4 && <SubstanceStep data={data} updateData={updateData} />}
            {origStep === 5 && <MedicalHistoryStep data={data} updateData={updateData} />}
            {origStep === 6 && <ConsentStep data={data} updateData={updateData} />}
            {isLayer2 && <OptionalProfileStep data={data} updateData={updateData} />}
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0 || isSubmitting}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {tx("onb.back", lang)}
        </Button>

        <div className="flex gap-2">
          {isLayer2 && (
            <Button variant="ghost" onClick={handleSkipLayer2} disabled={isSubmitting}>
              {tx("onb.skipForNow", lang)}
            </Button>
          )}

          <Button
            onClick={handleNext}
            disabled={!canProceed() || isSubmitting}
            className="bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? (
              tx("onb.saving", lang)
            ) : currentStep >= totalSteps - 1 ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {tx("onb.complete", lang)}
              </>
            ) : (
              <>
                {tx("onb.next", lang)}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
