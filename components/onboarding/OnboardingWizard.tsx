"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Leaf, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { createBrowserClient } from "@/lib/supabase";
import { useLang } from "@/components/layout/language-toggle";
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

  const totalSteps = showLayer2 ? LAYER1_STEPS.length + 1 : LAYER1_STEPS.length;
  const isLayer2 = currentStep === LAYER1_STEPS.length;
  const currentStepInfo = isLayer2 ? LAYER2_STEP : LAYER1_STEPS[currentStep];
  const progress = ((currentStep + 1) / totalSteps) * 100;

  // Map visible step index to original step index for rendering
  const getOriginalStepIndex = (visibleIndex: number): number => {
    if (!skipPregnancy) return visibleIndex;
    // Steps: 0=basic, 1=meds, 2=allergies, [skip 3=pregnancy], 3=substances, 4=medical, 5=consent
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

  const handleNext = async () => {
    if (currentStep === LAYER1_STEPS.length - 1 && !showLayer2) {
      setShowLayer2(true);
      setCurrentStep(LAYER1_STEPS.length);
      return;
    }

    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
      return;
    }

    await saveOnboarding();
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
        alert(lang === "tr" ? "Oturumunuz sona erdi. Lütfen tekrar giriş yapın." : "Your session has expired. Please sign in again.");
        router.push("/auth/login");
        return;
      }

      const userId = user.id;
      console.log("[Onboarding] Saving for user:", userId);

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
          alert(lang === "tr" ? "İlaçlar kaydedilemedi. Tekrar deneyin." : "Failed to save medications. Please try again.");
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
          alert(lang === "tr" ? "Alerjiler kaydedilemedi. Tekrar deneyin." : "Failed to save allergies. Please try again.");
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
      alert(lang === "tr" ? "Bilgileriniz kaydedilemedi. Tekrar deneyin." : "Failed to save your information. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-3 flex items-center justify-center gap-2">
          <Leaf className="h-6 w-6 text-primary" />
          <span className="font-sans-heading text-lg font-bold">
            Phyto<span className="text-[#b8965a] dark:text-[#c9a86c]">therapy</span><span className="text-primary">.ai</span>
          </span>
        </div>
        <h1 className="font-sans-heading text-2xl font-bold">
          {lang === "tr" ? "Sağlık Profilinizi Oluşturun" : "Set Up Your Health Profile"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {lang === "tr"
            ? "Güvenli ve kişiselleştirilmiş öneriler sunmamızı sağlar"
            : "This helps us give you safe, personalized recommendations"}
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {lang === "tr" ? `Adım ${currentStep + 1} / ${totalSteps}` : `Step ${currentStep + 1} of ${totalSteps}`}
          </span>
          <span className="font-medium">{currentStepInfo.title}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-sans-heading">
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

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
          disabled={currentStep === 0 || isSubmitting}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {lang === "tr" ? "Geri" : "Back"}
        </Button>

        <div className="flex gap-2">
          {isLayer2 && (
            <Button variant="ghost" onClick={handleSkipLayer2} disabled={isSubmitting}>
              {lang === "tr" ? "Şimdilik atla" : "Skip for now"}
            </Button>
          )}

          <Button
            onClick={handleNext}
            disabled={!canProceed() || isSubmitting}
            className="bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? (
              lang === "tr" ? "Kaydediliyor..." : "Saving..."
            ) : currentStep >= totalSteps - 1 ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {lang === "tr" ? "Tamamla" : "Complete"}
              </>
            ) : (
              <>
                {lang === "tr" ? "İleri" : "Next"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
