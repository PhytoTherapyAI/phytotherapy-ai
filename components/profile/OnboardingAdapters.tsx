'use client'

import { useCallback, useMemo, useRef } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { SupplementsStep } from '@/components/onboarding/steps/SupplementsStep'
import { AllergiesStep } from '@/components/onboarding/steps/AllergiesStep'
import { FamilyHistoryStep } from '@/components/onboarding/steps/FamilyHistoryStep'
import { MedicalHistoryStep } from '@/components/onboarding/steps/MedicalHistoryStep'
import type { OnboardingData, SupplementEntry } from '@/components/onboarding/OnboardingWizard'

// ─── Shared: build a minimal OnboardingData from profile ───
function buildOnboardingData(overrides: Partial<OnboardingData>): OnboardingData {
  return {
    full_name: '', birth_date: '', age: null, gender: '',
    medications: [], no_medications: false,
    supplement_entries: [], no_supplements: false,
    allergies: [], no_allergies: false,
    is_pregnant: false, is_breastfeeding: false,
    alcohol_use: 'none', smoking_use: 'none',
    kidney_disease: false, liver_disease: false, recent_surgery: false,
    chronic_conditions: [],
    consent_agreed: false,
    height_cm: null, weight_kg: null, blood_group: '', diet_type: '',
    exercise_frequency: '', sleep_quality: '', supplements: [],
    ...overrides,
  }
}

// ─── 1. Supplements Adapter ───
interface SupplementsAdapterProps {
  userId: string
  supplements: string[]       // profile.supplements string array
  onUpdate: (supplements: string[]) => void
}

export function ProfileSupplementsStep({ userId, supplements, onUpdate }: SupplementsAdapterProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Convert string[] → SupplementEntry[]
  const entries: SupplementEntry[] = useMemo(() =>
    supplements.map(s => ({ id: s, name: s, isCustom: false })),
    [supplements]
  )

  const data = useMemo(() => buildOnboardingData({
    supplement_entries: entries,
    no_supplements: supplements.length === 0,
  }), [entries, supplements.length])

  const updateData = useCallback((updates: Partial<OnboardingData>) => {
    const newEntries = updates.supplement_entries ?? entries
    const newSupplements = newEntries.map(e => e.name)
    onUpdate(newSupplements)

    // Debounced save to Supabase
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      const supabase = createBrowserClient()
      await supabase.from('user_profiles').update({ supplements: newSupplements }).eq('id', userId)
    }, 800)
  }, [entries, onUpdate, userId])

  return <SupplementsStep data={data} updateData={updateData} />
}

// ─── 2. Allergies Adapter ───
interface AllergiesAdapterProps {
  userId: string
  allergies: { allergen: string; severity: string }[]
  onUpdate: (allergies: { allergen: string; severity: string }[]) => void
}

export function ProfileAllergiesStep({ userId, allergies, onUpdate }: AllergiesAdapterProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const data = useMemo(() => buildOnboardingData({
    allergies,
    no_allergies: allergies.length === 0,
  }), [allergies])

  const updateData = useCallback((updates: Partial<OnboardingData>) => {
    const newAllergies = updates.allergies ?? allergies
    const noAllergies = updates.no_allergies ?? false
    onUpdate(noAllergies ? [] : newAllergies)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      const supabase = createBrowserClient()
      if (noAllergies) {
        await supabase.from('user_allergies').delete().eq('user_id', userId)
      }
      // Individual allergy inserts are handled by the parent component's existing logic
    }, 800)
  }, [allergies, onUpdate, userId])

  return <AllergiesStep data={data} updateData={updateData} />
}

// ─── 3. Family History Adapter ───
interface FamilyHistoryAdapterProps {
  chronicConditions: string[]  // includes family: prefixed items
  onUpdate: (conditions: string[]) => void
}

export function ProfileFamilyHistoryStep({ chronicConditions, onUpdate }: FamilyHistoryAdapterProps) {
  const data = useMemo(() => buildOnboardingData({
    chronic_conditions: chronicConditions,
  }), [chronicConditions])

  const updateData = useCallback((updates: Partial<OnboardingData>) => {
    if (updates.chronic_conditions) {
      onUpdate(updates.chronic_conditions)
    }
  }, [onUpdate])

  return <FamilyHistoryStep data={data} updateData={updateData} />
}

// ─── 4. Chronic Conditions Adapter ───
interface ChronicAdapterProps {
  chronicConditions: string[]
  onUpdate: (conditions: string[]) => void
}

export function ProfileMedicalHistoryStep({ chronicConditions, onUpdate }: ChronicAdapterProps) {
  const data = useMemo(() => buildOnboardingData({
    chronic_conditions: chronicConditions,
  }), [chronicConditions])

  const updateData = useCallback((updates: Partial<OnboardingData>) => {
    if (updates.chronic_conditions) {
      onUpdate(updates.chronic_conditions)
    }
  }, [onUpdate])

  return <MedicalHistoryStep data={data} updateData={updateData} />
}
