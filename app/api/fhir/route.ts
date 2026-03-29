// ============================================
// FHIR Interoperability API Bridge
// GET  /api/fhir?type=bundle    → Export patient FHIR bundle
// GET  /api/fhir?type=med&id=X  → Export single MedicationStatement
// POST /api/fhir                → Import FHIR resources from external
// ============================================

import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { checkRateLimit } from "@/lib/rate-limit"
import { supplementToFHIR, labResultToFHIR, createPatientBundle, toENabizFormat } from "@/lib/fhir/converters"

// ── FHIR Export: Generate FHIR bundle from user data ──
export async function GET(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown"
  const { allowed } = checkRateLimit(`fhir-export:${ip}`, 10, 60000)
  if (!allowed) return NextResponse.json({ error: "Rate limit" }, { status: 429 })

  const authHeader = req.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const token = authHeader.replace("Bearer ", "")
  const supabase = createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const url = new URL(req.url)
  const type = url.searchParams.get("type") || "bundle"
  const format = url.searchParams.get("format") || "fhir" // "fhir" or "enabiz"

  try {
    // Fetch user medications
    const { data: meds } = await supabase
      .from("user_medications")
      .select("medication_name, dosage, frequency, created_at")
      .eq("user_id", user.id)

    // Fetch blood test results
    const { data: tests } = await supabase
      .from("blood_tests")
      .select("test_data, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5)

    // Convert medications to FHIR MedicationStatements
    const fhirMeds = (meds || []).map(med => supplementToFHIR({
      patientId: user.id,
      supplementName: med.medication_name,
      dose: med.dosage || "as directed",
      frequency: med.frequency || "daily",
      startDate: med.created_at?.split("T")[0] || new Date().toISOString().split("T")[0],
    }))

    // Convert lab results to FHIR Observations
    const fhirObs: any[] = []
    ;(tests || []).forEach((test: any) => {
      const results = typeof test.test_data === "string" ? JSON.parse(test.test_data) : test.test_data
      if (Array.isArray(results)) {
        results.forEach((r: any) => {
          if (r.value && !isNaN(parseFloat(r.value))) {
            fhirObs.push(labResultToFHIR({
              patientId: user.id,
              testCode: (r.name || r.marker || "unknown").toLowerCase().replace(/\s+/g, "_"),
              value: parseFloat(r.value),
              unit: r.unit || "",
              date: test.created_at || new Date().toISOString(),
              status: r.status || "normal",
            }))
          }
        })
      }
    })

    // Create bundle
    const bundle = createPatientBundle({
      patientId: user.id,
      supplements: fhirMeds,
      labResults: fhirObs,
    })

    // Format based on request
    if (format === "enabiz") {
      return NextResponse.json(toENabizFormat(bundle), {
        headers: {
          "Content-Type": "application/fhir+json",
          "X-FHIR-Version": "4.0.1",
          "X-Source": "phytotherapy.ai",
        },
      })
    }

    return NextResponse.json(bundle, {
      headers: {
        "Content-Type": "application/fhir+json",
        "X-FHIR-Version": "4.0.1",
      },
    })

  } catch (err) {
    console.error("[FHIR] Export error:", err)
    return NextResponse.json({ error: "Export failed" }, { status: 500 })
  }
}

// ── FHIR Import: Receive resources from external systems ──
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown"
  const { allowed } = checkRateLimit(`fhir-import:${ip}`, 5, 60000)
  if (!allowed) return NextResponse.json({ error: "Rate limit" }, { status: 429 })

  const authHeader = req.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const token = authHeader.replace("Bearer ", "")
  const supabase = createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const contentType = req.headers.get("content-type") || ""
    if (!contentType.includes("json") && !contentType.includes("fhir")) {
      return NextResponse.json({ error: "Content-Type must be application/fhir+json or application/json" }, { status: 400 })
    }

    const body = await req.json()

    // Validate it's a FHIR resource
    if (!body.resourceType) {
      return NextResponse.json({ error: "Invalid FHIR resource: missing resourceType" }, { status: 400 })
    }

    // Process based on resource type
    let imported = 0

    if (body.resourceType === "Bundle" && body.entry) {
      for (const entry of body.entry) {
        const resource = entry.resource
        if (resource?.resourceType === "MedicationStatement") {
          // Import as medication
          const medName = resource.medicationCodeableConcept?.text ||
            resource.medicationCodeableConcept?.coding?.[0]?.display || "Unknown"
          await supabase.from("user_medications").upsert({
            user_id: user.id,
            medication_name: medName,
            source: "fhir_import",
          }, { onConflict: "user_id,medication_name" })
          imported++
        }
      }
    } else if (body.resourceType === "MedicationStatement") {
      const medName = body.medicationCodeableConcept?.text ||
        body.medicationCodeableConcept?.coding?.[0]?.display || "Unknown"
      await supabase.from("user_medications").upsert({
        user_id: user.id,
        medication_name: medName,
        source: "fhir_import",
      }, { onConflict: "user_id,medication_name" })
      imported = 1
    }

    return NextResponse.json({
      success: true,
      imported,
      message: `${imported} resource(s) imported successfully`,
    })

  } catch (err) {
    console.error("[FHIR] Import error:", err)
    return NextResponse.json({ error: "Import failed" }, { status: 500 })
  }
}
