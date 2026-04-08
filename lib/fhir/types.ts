// © 2026 DoctoPal — All Rights Reserved
// ============================================
// FHIR R4 Type Definitions for DoctoPal
// HL7 FHIR (Fast Healthcare Interoperability Resources)
// Customized for herbal/supplement data interoperability
// ============================================

// ── Base FHIR Types ──
export interface FHIRResource {
  resourceType: string
  id?: string
  meta?: {
    versionId?: string
    lastUpdated?: string
    profile?: string[]
    source?: string
  }
}

export interface FHIRCoding {
  system: string    // terminology URI
  code: string
  display: string
  version?: string
}

export interface FHIRCodeableConcept {
  coding: FHIRCoding[]
  text?: string
}

export interface FHIRReference {
  reference: string  // e.g., "Patient/123"
  display?: string
}

export interface FHIRPeriod {
  start?: string     // ISO 8601
  end?: string
}

export interface FHIRQuantity {
  value: number
  unit: string
  system?: string    // UCUM
  code?: string
}

export interface FHIRAnnotation {
  text: string
  time?: string
  authorReference?: FHIRReference
}

// ── Coding Systems ──
export const CODING_SYSTEMS = {
  SNOMED_CT: "http://snomed.info/sct",
  RXNORM: "http://www.nlm.nih.gov/research/umls/rxnorm",
  LOINC: "http://loinc.org",
  WHO_DD: "http://www.whocc.no/atc_ddd_index",
  ICD10: "http://hl7.org/fhir/sid/icd-10",
  UCUM: "http://unitsofmeasure.org",
  PHYTO_AI: "https://doctopal.com/fhir/CodeSystem/herbal-products",
  ENABIZ: "https://enabiz.gov.tr/fhir/CodeSystem",
} as const

// ══════════════════════════════════════════
// FHIR MedicationStatement — Herbal Supplement Use
// ══════════════════════════════════════════
export interface FHIRMedicationStatement extends FHIRResource {
  resourceType: "MedicationStatement"
  status: "active" | "completed" | "entered-in-error" | "intended" | "stopped" | "on-hold"
  medicationCodeableConcept: FHIRCodeableConcept
  subject: FHIRReference
  effectivePeriod?: FHIRPeriod
  dateAsserted?: string
  informationSource?: FHIRReference
  dosage?: {
    text?: string
    timing?: { repeat?: { frequency?: number; period?: number; periodUnit?: string } }
    route?: FHIRCodeableConcept
    doseAndRate?: { doseQuantity?: FHIRQuantity }[]
  }[]
  note?: FHIRAnnotation[]
  // Extensions for phytotherapy
  extension?: {
    url: string
    valueString?: string
    valueCoding?: FHIRCoding
    valueBoolean?: boolean
  }[]
}

// ══════════════════════════════════════════
// FHIR Observation — Lab Results, Vitals
// ══════════════════════════════════════════
export interface FHIRObservation extends FHIRResource {
  resourceType: "Observation"
  status: "final" | "preliminary" | "amended" | "corrected"
  category?: FHIRCodeableConcept[]
  code: FHIRCodeableConcept
  subject: FHIRReference
  effectiveDateTime?: string
  valueQuantity?: FHIRQuantity
  valueString?: string
  interpretation?: FHIRCodeableConcept[]
  referenceRange?: { low?: FHIRQuantity; high?: FHIRQuantity; text?: string }[]
  note?: FHIRAnnotation[]
}

// ══════════════════════════════════════════
// FHIR Patient — Minimal patient reference
// ══════════════════════════════════════════
export interface FHIRPatient extends FHIRResource {
  resourceType: "Patient"
  identifier?: { system: string; value: string }[]
  name?: { family: string; given: string[]; text?: string }[]
  gender?: "male" | "female" | "other" | "unknown"
  birthDate?: string
}

// ══════════════════════════════════════════
// FHIR Bundle — Collection of resources
// ══════════════════════════════════════════
export interface FHIRBundle extends FHIRResource {
  resourceType: "Bundle"
  type: "collection" | "document" | "message" | "transaction" | "searchset"
  total?: number
  entry?: { resource: FHIRResource; fullUrl?: string }[]
}

// ══════════════════════════════════════════
// FHIR AllergyIntolerance
// ══════════════════════════════════════════
export interface FHIRAllergyIntolerance extends FHIRResource {
  resourceType: "AllergyIntolerance"
  clinicalStatus: FHIRCodeableConcept
  verificationStatus: FHIRCodeableConcept
  type?: "allergy" | "intolerance"
  category?: ("food" | "medication" | "environment" | "biologic")[]
  criticality?: "low" | "high" | "unable-to-assess"
  code: FHIRCodeableConcept
  patient: FHIRReference
  recordedDate?: string
}
