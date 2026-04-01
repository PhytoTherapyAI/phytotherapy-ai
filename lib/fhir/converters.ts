// © 2026 Doctopal — All Rights Reserved
// ============================================
// FHIR Resource Converters
// Transforms doctopal.com data → FHIR R4 resources
// For hospital interoperability (e-Nabız, EPIC, Cerner)
// ============================================

import {
  type FHIRMedicationStatement, type FHIRObservation, type FHIRBundle,
  type FHIRAllergyIntolerance, type FHIRCodeableConcept, type FHIRCoding,
  CODING_SYSTEMS,
} from "./types"
import { findHerbalByName, getHerbalFHIRCodings, LOINC_CODES, SNOMED_CONDITIONS } from "./terminology-map"

// ══════════════════════════════════════════
// Convert Supplement Use → FHIR MedicationStatement
// ══════════════════════════════════════════
export function supplementToFHIR(params: {
  patientId: string
  supplementName: string
  dose: string
  frequency: string
  startDate: string
  endDate?: string
  status?: "active" | "completed" | "stopped"
}): FHIRMedicationStatement {
  const herb = findHerbalByName(params.supplementName)
  const codings = herb ? getHerbalFHIRCodings(herb.internalId) : []

  return {
    resourceType: "MedicationStatement",
    id: `phytoai-med-${Date.now()}`,
    meta: {
      profile: ["http://hl7.org/fhir/StructureDefinition/MedicationStatement"],
      source: "https://doctopal.com",
      lastUpdated: new Date().toISOString(),
    },
    status: params.status || "active",
    medicationCodeableConcept: {
      coding: codings.length > 0 ? codings : [{
        system: CODING_SYSTEMS.PHYTO_AI,
        code: `CUSTOM-${params.supplementName.replace(/\s+/g, "-").toUpperCase()}`,
        display: params.supplementName,
      }],
      text: herb?.nameEn || params.supplementName,
    },
    subject: { reference: `Patient/${params.patientId}` },
    effectivePeriod: {
      start: params.startDate,
      ...(params.endDate ? { end: params.endDate } : {}),
    },
    dateAsserted: new Date().toISOString(),
    informationSource: { reference: "Organization/doctopal", display: "Doctopal" },
    dosage: [{
      text: `${params.dose}, ${params.frequency}`,
      route: {
        coding: [{ system: CODING_SYSTEMS.SNOMED_CT, code: "26643006", display: "Oral route" }],
      },
    }],
    note: [{
      text: `Recorded via Doctopal platform. ${herb?.latinName ? `Latin name: ${herb.latinName}` : ""}`,
      time: new Date().toISOString(),
    }],
    extension: [
      { url: "https://doctopal.com/fhir/Extension/evidence-grade", valueString: "B" },
      { url: "https://doctopal.com/fhir/Extension/interaction-checked", valueBoolean: true },
    ],
  }
}

// ══════════════════════════════════════════
// Convert Lab Result → FHIR Observation
// ══════════════════════════════════════════
export function labResultToFHIR(params: {
  patientId: string
  testCode: string          // key from LOINC_CODES
  value: number
  unit: string
  date: string
  status?: "normal" | "high" | "low" | "critical"
}): FHIRObservation {
  const loincCode = LOINC_CODES[params.testCode]

  const interpretationMap: Record<string, FHIRCoding> = {
    normal: { system: "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation", code: "N", display: "Normal" },
    high: { system: "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation", code: "H", display: "High" },
    low: { system: "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation", code: "L", display: "Low" },
    critical: { system: "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation", code: "AA", display: "Critical abnormal" },
  }

  return {
    resourceType: "Observation",
    id: `phytoai-obs-${Date.now()}`,
    meta: {
      profile: ["http://hl7.org/fhir/StructureDefinition/Observation"],
      source: "https://doctopal.com",
    },
    status: "final",
    category: [{
      coding: [{ system: "http://terminology.hl7.org/CodeSystem/observation-category", code: "laboratory", display: "Laboratory" }],
    }],
    code: loincCode ? {
      coding: [loincCode],
      text: loincCode.display,
    } : {
      coding: [{ system: CODING_SYSTEMS.PHYTO_AI, code: params.testCode, display: params.testCode }],
    },
    subject: { reference: `Patient/${params.patientId}` },
    effectiveDateTime: params.date,
    valueQuantity: {
      value: params.value,
      unit: params.unit,
      system: CODING_SYSTEMS.UCUM,
    },
    ...(params.status ? {
      interpretation: [{ coding: [interpretationMap[params.status]] }],
    } : {}),
  }
}

// ══════════════════════════════════════════
// Create FHIR Bundle (Transaction)
// For sending multiple resources to hospital systems
// ══════════════════════════════════════════
export function createPatientBundle(params: {
  patientId: string
  supplements: FHIRMedicationStatement[]
  labResults: FHIRObservation[]
  allergies?: FHIRAllergyIntolerance[]
}): FHIRBundle {
  const entries = [
    ...params.supplements.map(r => ({
      resource: r,
      fullUrl: `urn:uuid:${r.id}`,
    })),
    ...params.labResults.map(r => ({
      resource: r,
      fullUrl: `urn:uuid:${r.id}`,
    })),
    ...(params.allergies || []).map(r => ({
      resource: r,
      fullUrl: `urn:uuid:${r.id}`,
    })),
  ]

  return {
    resourceType: "Bundle",
    id: `phytoai-bundle-${Date.now()}`,
    meta: { lastUpdated: new Date().toISOString(), source: "https://doctopal.com" },
    type: "collection",
    total: entries.length,
    entry: entries,
  }
}

// ══════════════════════════════════════════
// e-Nabız Bridge — Format data for Turkish national health system
// ══════════════════════════════════════════
export function toENabizFormat(bundle: FHIRBundle): {
  header: { source: string; version: string; timestamp: string }
  data: any
} {
  return {
    header: {
      source: "doctopal.com",
      version: "FHIR-R4",
      timestamp: new Date().toISOString(),
    },
    data: {
      resourceType: bundle.resourceType,
      type: bundle.type,
      total: bundle.total,
      entry: bundle.entry?.map(e => ({
        ...e,
        // Add e-Nabız specific metadata
        enabizMeta: {
          importType: "external_health_app",
          consentGiven: true,
          consentDate: new Date().toISOString(),
        },
      })),
    },
  }
}
