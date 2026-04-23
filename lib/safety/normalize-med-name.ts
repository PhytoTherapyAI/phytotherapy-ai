// © 2026 DoctoPal — All Rights Reserved
//
// Single source of truth for cleaning a medication / supplement name
// before it lands in user_medications or user_profiles.supplements.
//
// Why this exists:
//   OpenFDA's drug-search API often returns generic_name with slug-style
//   underscores ("warfarin_sodium"), and OCR scanners produce names with
//   stray hyphens / multiple spaces / leading whitespace. F-SAFETY-001
//   surfaced this in the safety banner ("İzotretinoin + Warfarin_sodium")
//   and we patched display + the profile insert path; this helper
//   centralises the same rule across every other ingest surface
//   (MedicationScanner, 15-day confirm dialog, OnboardingWizard,
//   ProfileSupplementsStep update path).
//
// Display-side title-casing intentionally lives elsewhere
// (MedicationInteractionBanner.titleCaseMed) — at write time the user's
// own typing is preserved verbatim ("PARACETAMOL" stays uppercase).

export function normalizeMedName(s: string | null | undefined): string {
  if (!s) return ""
  return s
    .replace(/[_-]+/g, " ")   // slug separators → space
    .replace(/\s+/g, " ")     // collapse runs of whitespace
    .trim()
}

/** Convenience: clean both brand and generic in one call, returning a
 *  shape ready to spread into a Supabase insert payload. Null-safe so
 *  callers don't need to remember to coerce empty generic to null. */
export function normalizeMedFields(input: {
  brand_name?: string | null
  generic_name?: string | null
}): { brand_name: string; generic_name: string | null } {
  const brand = normalizeMedName(input.brand_name)
  const generic = normalizeMedName(input.generic_name)
  return {
    brand_name: brand,
    generic_name: generic.length > 0 ? generic : null,
  }
}
