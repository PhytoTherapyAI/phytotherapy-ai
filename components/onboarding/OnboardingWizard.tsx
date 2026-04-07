// © 2026 Doctopal — All Rights Reserved
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft, ArrowRight, Leaf, CheckCircle2,
  User, Pill, AlertTriangle, Baby, Wine, HeartPulse, FileCheck, Shield, Sparkles, Dna, Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { createBrowserClient } from "@/lib/supabase";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import { markFirstLoginDone } from "@/lib/daily-med-check";
import { updatePermissionState } from "@/lib/permission-state";
import { getBadgeById, BADGE_POINTS } from "@/lib/badges";
import type { Badge } from "@/lib/badges";
import { BadgeCelebrationModal, triggerCelebration } from "@/components/gamification/BadgeCelebrationModal";
import { OnboardingFinale } from "@/components/gamification/OnboardingFinale";
import type { UserProfile } from "@/lib/database.types";

// Step components
import { BasicInfoStep } from "@/components/onboarding/steps/BasicInfoStep";
import { MedicationsStep } from "@/components/onboarding/steps/MedicationsStep";
import { AllergiesStep } from "@/components/onboarding/steps/AllergiesStep";
import { PregnancyStep } from "@/components/onboarding/steps/PregnancyStep";
import { SubstanceStep } from "@/components/onboarding/steps/SubstanceStep";
import { MedicalHistoryStep } from "@/components/onboarding/steps/MedicalHistoryStep";
import { ConsentStep } from "@/components/onboarding/steps/ConsentStep";
import { PermissionPreframeStep } from "@/components/onboarding/steps/PermissionPreframeStep";
import { FamilyHistoryStep } from "@/components/onboarding/steps/FamilyHistoryStep";
import { OptionalProfileStep } from "@/components/onboarding/steps/OptionalProfileStep";

const STEP_ICONS = [User, Pill, AlertTriangle, Baby, Wine, HeartPulse, Dna, Shield, FileCheck];

// "Why we ask" keys mapped to original step index
const WHY_KEYS = [
  "onb.whyBasic",           // 0: basic
  "onb.whyMeds",            // 1: medications
  "onb.whyAllergies",       // 2: allergies
  "onb.whyPregnancy",       // 3: pregnancy
  "onb.whySubstances",      // 4: substances
  "onb.whyMedHistory",      // 5: medical history
  "onb.whyFamilyHistory",   // 6: family history
  "onb.whyPermissions",     // 7: permissions preframe
  "onb.whyConsent",         // 8: consent
];

// Phase definitions: each step belongs to a phase (0, 1, or 2)
// Phase 0 = Basics (steps 0-1), Phase 1 = Health Profile (steps 2-6), Phase 2 = Permissions + Consent (steps 7-8)
const STEP_PHASE = [0, 0, 1, 1, 1, 1, 1, 2, 2]; // indexed by original step index

// Step definitions using i18n keys
const STEP_DEFS = [
  { id: "basic", titleKey: "onb.stepBasicTitle", descKey: "onb.stepBasicDesc" },
  { id: "medications", titleKey: "onb.stepMedsTitle", descKey: "onb.stepMedsDesc" },
  { id: "allergies", titleKey: "onb.stepAllergiesTitle", descKey: "onb.stepAllergiesDesc" },
  { id: "pregnancy", titleKey: "onb.stepPregnancyTitle", descKey: "onb.stepPregnancyDesc" },
  { id: "substances", titleKey: "onb.stepSubstancesTitle", descKey: "onb.stepSubstancesDesc" },
  { id: "medical", titleKey: "onb.stepMedicalTitle", descKey: "onb.stepMedicalDesc" },
  { id: "family", titleKey: "onb.stepFamilyTitle", descKey: "onb.stepFamilyDesc" },
  { id: "permissions", titleKey: "onb.stepPermissionsTitle", descKey: "onb.stepPermissionsDesc" },
  { id: "consent", titleKey: "onb.stepConsentTitle", descKey: "onb.stepConsentDesc" },
] as const;

function getSteps(lang: "en" | "tr") {
  return STEP_DEFS.map(s => ({
    id: s.id,
    title: tx(s.titleKey, lang),
    description: tx(s.descKey, lang),
  }));
}

function getLayer2Step(lang: "en" | "tr") {
  return {
    id: "optional",
    title: tx("onb.stepOptionalTitle", lang),
    description: tx("onb.stepOptionalDesc", lang),
  };
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
  const [currentStep, setCurrentStep] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("doctopal_onboarding_step");
      return saved ? parseInt(saved, 10) || 0 : 0;
    }
    return 0;
  });
  const [showLayer2, setShowLayer2] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const savingRef = useRef(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);
  const [slideDir, setSlideDir] = useState<"left" | "right">("left");
  const [showFinale, setShowFinale] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [data, setData] = useState<OnboardingData>(() => {
    // Restore from localStorage if user left mid-onboarding
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("doctopal_onboarding_draft");
        if (saved) {
          const parsed = JSON.parse(saved);
          return { ...defaultData, ...parsed, full_name: parsed.full_name || profile.full_name || "" };
        }
      } catch { /* ignore */ }
    }
    return { ...defaultData, full_name: profile.full_name ?? "" };
  });

  // Auto-save draft + step to localStorage on change
  const dataRef = useRef(data);
  dataRef.current = data;

  useEffect(() => {
    const timer = setTimeout(() => {
      try { localStorage.setItem("doctopal_onboarding_draft", JSON.stringify(dataRef.current)); } catch { /* ignore */ }
    }, 500);
    return () => clearTimeout(timer);
  }, [data]);

  useEffect(() => {
    try { localStorage.setItem("doctopal_onboarding_step", String(currentStep)); } catch { /* ignore */ }
  }, [currentStep]);

  // Clear draft on successful save
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem("doctopal_onboarding_draft");
      localStorage.removeItem("doctopal_onboarding_step");
    } catch { /* ignore */ }
  }, []);

  const ALL_LAYER1_STEPS = getSteps(lang);
  const LAYER2_STEP = getLayer2Step(lang);

  // Skip pregnancy step (index 3) if user is male
  const skipPregnancy = data.gender === "male";
  const LAYER1_STEPS = skipPregnancy
    ? ALL_LAYER1_STEPS.filter((_, i) => i !== 3)
    : ALL_LAYER1_STEPS;

  // Icon indices adjusted for skipped pregnancy
  const stepIconIndices = skipPregnancy
    ? [0, 1, 2, 4, 5, 6, 7, 8]
    : [0, 1, 2, 3, 4, 5, 6, 7, 8];

  // Clamp restored step to valid bounds (gender change can shrink step count)
  const maxStep = showLayer2 ? LAYER1_STEPS.length : LAYER1_STEPS.length - 1;
  if (currentStep > maxStep) {
    setCurrentStep(LAYER1_STEPS.length - 1);
  }
  const safeStep = Math.min(currentStep, maxStep);

  const totalSteps = showLayer2 ? LAYER1_STEPS.length + 1 : LAYER1_STEPS.length;
  const isLayer2 = safeStep === LAYER1_STEPS.length && showLayer2;
  const currentStepInfo = isLayer2 ? LAYER2_STEP : LAYER1_STEPS[safeStep];
  const progress = ((safeStep + 1) / totalSteps) * 100;

  // Map visible step index to original step index for rendering
  const getOriginalStepIndex = (visibleIndex: number): number => {
    if (!skipPregnancy) return visibleIndex;
    return visibleIndex >= 3 ? visibleIndex + 1 : visibleIndex;
  };
  const origStep = getOriginalStepIndex(safeStep);

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const canProceed = (): boolean => {
    switch (origStep) {
      case 0: return !!data.full_name.trim() && !!data.birth_date && data.age !== null && data.age >= 18 && !!data.gender;
      case 1: return data.no_medications || data.medications.length > 0;
      case 2: return true; // allergies now optional
      case 3: return true; // pregnancy
      case 4: return !!data.alcohol_use && !!data.smoking_use;
      case 5: return true; // medical history
      case 6: return true; // family history
      case 7: return true; // permissions preframe (info only)
      case 8: return data.consent_agreed;
      case 9: return true; // layer 2
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
    // Mark permission preframe as shown when leaving that step
    if (origStep === 7) {
      updatePermissionState({ preframe_shown: true });
    }

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
    if (savingRef.current) return;
    savingRef.current = true;
    setIsSubmitting(true);
    setSaveError(null);
    try {
      const supabase = createBrowserClient();

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error("Auth error during onboarding save:", authError);
        setSaveError(tx("onb.sessionExpired", lang));
        setTimeout(() => router.push("/auth/login"), 2000);
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
          setSaveError(tx("onb.medSaveError", lang));
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
          setSaveError(tx("onb.allergySaveError", lang));
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

      // 6. Award onboarding badges
      const badges: Badge[] = [];
      let points = 0;

      // "Identity Revealed" — name filled
      if (data.full_name.trim()) {
        const b = getBadgeById("identity_revealed");
        if (b) { badges.push(b); points += BADGE_POINTS[b.id] ?? 0; }
      }

      // "First Step" — medication saved
      if (data.medications.length > 0) {
        const b = getBadgeById("first_med");
        if (b) { badges.push(b); points += BADGE_POINTS[b.id] ?? 0; }
      }

      // "Welcome to DoctoPal" — onboarding complete
      const welcomeBadge = getBadgeById("welcome_doctopal");
      if (welcomeBadge) { badges.push(welcomeBadge); points += BADGE_POINTS[welcomeBadge.id] ?? 0; }

      setEarnedBadges(badges);
      setTotalPoints(points);

      // 7. Clear draft, refresh profile
      clearDraft();
      await refreshProfile();

      // 8. Fire celebration modals, then show finale after they finish
      if (badges.length > 0) {
        setCelebrating(true);
        badges.forEach(b => triggerCelebration(b, points));
        // Wait for celebrations to finish (4s per badge + 0.3s gap)
        setTimeout(() => {
          setCelebrating(false);
          setShowFinale(true);
        }, badges.length * 4300 + 500);
      } else {
        setShowFinale(true);
      }
    } catch (error) {
      console.error("Onboarding save error:", error);
      setSaveError(tx("onb.saveError", lang));
    } finally {
      setIsSubmitting(false);
      savingRef.current = false;
    }
  };

  const CurrentStepIcon = isLayer2 ? Sparkles : STEP_ICONS[stepIconIndices[safeStep]] || User;

  // Show celebration modals (badges earned)
  if (celebrating) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <BadgeCelebrationModal />
      </div>
    );
  }

  // Show finale screen after celebrations
  if (showFinale) {
    return <OnboardingFinale badges={earnedBadges} totalPoints={totalPoints} />;
  }

  return (
    <div className="space-y-6">
      <BadgeCelebrationModal />
      {/* Header */}
      <div className="text-center animate-in fade-in duration-500">
        <div className="mx-auto mb-3 flex items-center justify-center gap-2">
          <Leaf className="h-6 w-6 text-primary" />
          <span className="font-sans-heading text-lg font-bold">
            Docto<span className="text-primary">Pal</span>
          </span>
        </div>
        <h1 className="font-sans-heading text-2xl font-bold">
          {tx("onb.setupTitle", lang)}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {tx("onb.setupDesc", lang)}
        </p>
        <p className="mt-1 text-xs text-primary/60 font-medium">
          {tx("onb.moreInfoBetter", lang)}
        </p>
      </div>

      {/* 3-Phase Progress Bar */}
      {(() => {
        const phaseKeys = ["onb.phaseBasics", "onb.phaseHealth", "onb.phaseConsent"] as const;
        const currentOrigStep = isLayer2 ? 9 : getOriginalStepIndex(safeStep);
        const currentPhase = isLayer2 ? 2 : STEP_PHASE[currentOrigStep] ?? 0;

        return (
          <div className="space-y-3">
            {/* Phase indicators */}
            <div className="flex items-center justify-between gap-2">
              {phaseKeys.map((key, phaseIdx) => {
                const isPhaseComplete = phaseIdx < currentPhase;
                const isPhaseCurrent = phaseIdx === currentPhase;
                return (
                  <div key={key} className="flex flex-1 flex-col items-center gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                        isPhaseComplete
                          ? "bg-primary text-primary-foreground"
                          : isPhaseCurrent
                            ? "bg-primary/15 text-primary ring-2 ring-primary/30"
                            : "bg-muted text-muted-foreground"
                      }`}>
                        {isPhaseComplete ? <CheckCircle2 className="h-3.5 w-3.5" /> : phaseIdx + 1}
                      </div>
                      <span className={`text-xs font-medium transition-colors duration-300 ${
                        isPhaseCurrent ? "text-primary" : isPhaseComplete ? "text-foreground" : "text-muted-foreground"
                      }`}>
                        {tx(key, lang)}
                      </span>
                    </div>
                    {/* Phase progress line — smooth animated */}
                    <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
                        initial={false}
                        animate={{
                          width: isPhaseComplete ? "100%" : isPhaseCurrent ? `${Math.max(10, ((safeStep + 1) / totalSteps) * 100)}%` : "0%",
                        }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Step counter removed — phase bar is sufficient */}
          </div>
        );
      })()}

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
            {/* "Why we ask" explanation */}
            {!isLayer2 && WHY_KEYS[origStep] && (
              <p className="mt-2 text-xs text-muted-foreground/80 italic">
                {tx(WHY_KEYS[origStep], lang)}
              </p>
            )}
            {/* Reassurance on first step */}
            {origStep === 0 && (
              <p className="mt-2 text-xs text-primary/70 font-medium">
                {tx("onb.reassurance", lang)}
              </p>
            )}
          </CardHeader>
          <CardContent>
            {origStep === 0 && <BasicInfoStep data={data} updateData={updateData} />}
            {origStep === 1 && <MedicationsStep data={data} updateData={updateData} />}
            {origStep === 2 && <AllergiesStep data={data} updateData={updateData} />}
            {origStep === 3 && !skipPregnancy && <PregnancyStep data={data} updateData={updateData} />}
            {origStep === 4 && <SubstanceStep data={data} updateData={updateData} />}
            {origStep === 5 && <MedicalHistoryStep data={data} updateData={updateData} />}
            {origStep === 6 && <FamilyHistoryStep data={data} updateData={updateData} />}
            {origStep === 7 && <PermissionPreframeStep />}
            {origStep === 8 && <ConsentStep data={data} updateData={updateData} />}
            {isLayer2 && <OptionalProfileStep data={data} updateData={updateData} />}
          </CardContent>
        </Card>
      </div>

      {/* Save Error Banner with Retry */}
      {saveError && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800 p-3 flex items-center gap-3">
          <div className="flex-1">
            <p className="text-sm font-medium text-red-700 dark:text-red-400">{saveError}</p>
            <p className="text-xs text-red-500 dark:text-red-400/70 mt-0.5">
              {lang === "tr" ? "Lütfen tekrar deneyin. İnternet bağlantınızı kontrol edin." : "Please try again. Check your internet connection."}
            </p>
          </div>
          <button onClick={saveOnboarding}
            className="shrink-0 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition-colors">
            {tx("onb.retry", lang)}
          </button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={safeStep === 0 || isSubmitting}
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
            ) : safeStep >= totalSteps - 1 ? (
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

      {/* Trust Badge */}
      <div className="flex items-center justify-center gap-1.5 text-muted-foreground/50">
        <Lock className="h-3 w-3" />
        <span className="text-[10px]">
          {lang === "tr" ? "Uçtan Uca Şifreli • KVKK Uyumlu" : "End-to-End Encrypted • KVKK Compliant"}
        </span>
      </div>
    </div>
  );
}
