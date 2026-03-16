"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Leaf, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { createBrowserClient } from "@/lib/supabase";
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

const LAYER1_STEPS = [
  { id: "basic", title: "Basic Information", description: "Tell us about yourself" },
  { id: "medications", title: "Current Medications", description: "Active medications you take" },
  { id: "allergies", title: "Allergies", description: "Known allergies" },
  { id: "pregnancy", title: "Pregnancy & Breastfeeding", description: "Reproductive health status" },
  { id: "substances", title: "Alcohol & Smoking", description: "Substance use information" },
  { id: "medical", title: "Medical History", description: "Key health conditions" },
  { id: "consent", title: "Terms & Consent", description: "Medical disclaimer agreement" },
];

const LAYER2_STEP = {
  id: "optional",
  title: "Personalize (Optional)",
  description: "Help us give better recommendations",
};

export interface OnboardingData {
  // Step 1: Basic info
  full_name: string;
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
  const [currentStep, setCurrentStep] = useState(0);
  const [showLayer2, setShowLayer2] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    ...defaultData,
    full_name: profile.full_name ?? "",
  });

  const totalSteps = showLayer2 ? LAYER1_STEPS.length + 1 : LAYER1_STEPS.length;
  const isLayer2 = currentStep === LAYER1_STEPS.length;
  const currentStepInfo = isLayer2 ? LAYER2_STEP : LAYER1_STEPS[currentStep];
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 0: // Basic info
        return !!data.full_name.trim() && data.age !== null && data.age >= 18 && !!data.gender;
      case 1: // Medications
        return data.no_medications || data.medications.length > 0;
      case 2: // Allergies
        return data.no_allergies || data.allergies.length > 0;
      case 3: // Pregnancy
        return true; // Booleans always have a value
      case 4: // Substances
        return !!data.alcohol_use && !!data.smoking_use;
      case 5: // Medical history
        return true; // Booleans default to false
      case 6: // Consent
        return data.consent_agreed;
      case 7: // Optional
        return true;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (currentStep === LAYER1_STEPS.length - 1 && !showLayer2) {
      // End of Layer 1 — ask about Layer 2
      setShowLayer2(true);
      setCurrentStep(LAYER1_STEPS.length);
      return;
    }

    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
      return;
    }

    // Final step — save everything
    await saveOnboarding();
  };

  const handleSkipLayer2 = async () => {
    await saveOnboarding();
  };

  const saveOnboarding = async () => {
    setIsSubmitting(true);
    try {
      const supabase = createBrowserClient();

      // Verify we have an active auth session (required for RLS policies)
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error("Auth error during onboarding save:", authError);
        alert("Your session has expired. Please sign in again.");
        router.push("/auth/login");
        return;
      }

      const userId = user.id;
      console.log("[Onboarding] Saving for user:", userId);

      // 1. Save medications FIRST (before marking onboarding complete)
      if (data.medications.length > 0) {
        // Delete existing medications first (safe for retry)
        await supabase.from("user_medications").delete().eq("user_id", userId);

        const medsToInsert = data.medications.map((med) => ({
          user_id: userId,
          brand_name: med.brand_name,
          generic_name: med.generic_name,
          dosage: med.dosage,
          frequency: med.frequency,
          is_active: true,
        }));
        console.log("[Onboarding] Inserting medications:", medsToInsert);

        const { error: medError } = await supabase
          .from("user_medications")
          .insert(medsToInsert);

        if (medError) {
          console.error("[Onboarding] Medication insert error:", medError);
          alert("Failed to save medications. Please try again. Error: " + medError.message);
          return;
        }
        console.log("[Onboarding] Medications saved successfully");
      }

      // 2. Save allergies SECOND
      if (data.allergies.length > 0) {
        // Delete existing allergies first (safe for retry)
        await supabase.from("user_allergies").delete().eq("user_id", userId);

        const allergiesToInsert = data.allergies.map((allergy) => ({
          user_id: userId,
          allergen: allergy.allergen,
          severity: allergy.severity,
        }));
        console.log("[Onboarding] Inserting allergies:", allergiesToInsert);

        const { error: allergyError } = await supabase
          .from("user_allergies")
          .insert(allergiesToInsert);

        if (allergyError) {
          console.error("[Onboarding] Allergy insert error:", allergyError);
          alert("Failed to save allergies. Please try again. Error: " + allergyError.message);
          return;
        }
        console.log("[Onboarding] Allergies saved successfully");
      }

      // 3. Save consent record (non-critical — don't block on failure)
      try {
        await supabase.from("consent_records").insert({
          user_id: userId,
          consent_type: "medical_disclaimer",
          consent_text: "User agreed to medical disclaimer and terms of service during onboarding.",
        });
        console.log("[Onboarding] Consent record saved");
      } catch (consentErr) {
        console.error("[Onboarding] Consent save failed (non-critical):", consentErr);
      }

      // 4. Update profile LAST — only after medications and allergies are saved
      const { error: profileError } = await supabase
        .from("user_profiles")
        .update({
          full_name: data.full_name,
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
          // Layer 2
          height_cm: data.height_cm,
          weight_kg: data.weight_kg,
          blood_group: data.blood_group || null,
          diet_type: data.diet_type || null,
          exercise_frequency: data.exercise_frequency || null,
          sleep_quality: data.sleep_quality || null,
          supplements: data.supplements,
          // System — marked LAST so incomplete data doesn't get skipped
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
      console.log("[Onboarding] Profile updated — onboarding complete!");

      // 5. Refresh profile in context and redirect
      await refreshProfile();
      router.push("/");
    } catch (error) {
      console.error("Onboarding save error:", error);
      alert("Failed to save your information. Please try again.");
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
          <span className="text-lg font-bold">
            Phyto<span className="text-primary">therapy</span>.ai
          </span>
        </div>
        <h1 className="font-heading text-2xl font-bold">Set Up Your Health Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This helps us give you safe, personalized recommendations
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Step {currentStep + 1} of {totalSteps}
          </span>
          <span className="font-medium">{currentStepInfo.title}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {currentStepInfo.title}
          </CardTitle>
          <CardDescription>{currentStepInfo.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {currentStep === 0 && <BasicInfoStep data={data} updateData={updateData} />}
          {currentStep === 1 && <MedicationsStep data={data} updateData={updateData} />}
          {currentStep === 2 && <AllergiesStep data={data} updateData={updateData} />}
          {currentStep === 3 && <PregnancyStep data={data} updateData={updateData} />}
          {currentStep === 4 && <SubstanceStep data={data} updateData={updateData} />}
          {currentStep === 5 && <MedicalHistoryStep data={data} updateData={updateData} />}
          {currentStep === 6 && <ConsentStep data={data} updateData={updateData} />}
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
          Back
        </Button>

        <div className="flex gap-2">
          {isLayer2 && (
            <Button variant="ghost" onClick={handleSkipLayer2} disabled={isSubmitting}>
              Skip for now
            </Button>
          )}

          <Button
            onClick={handleNext}
            disabled={!canProceed() || isSubmitting}
            className="bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? (
              "Saving..."
            ) : currentStep >= totalSteps - 1 ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Complete
              </>
            ) : (
              <>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
