// © 2026 DoctoPal — All Rights Reserved
// Apple Health export parser — runs in the browser.
// Input: a .zip file produced by the iPhone "Export All Health Data" flow.
// Inside the zip is a single huge `apple_health_export/export.xml` file with
// thousands of <Record /> elements. We parse it with fast-xml-parser, then
// fold like-typed records into per-day aggregates so the resulting metric
// count is reasonable (< 50k for a typical year of data).

import JSZip from "jszip"
import { XMLParser } from "fast-xml-parser"
import type {
  HealthMetricInput,
  HealthMetricType,
  ParsedHealthData,
  ParseProgressCallback,
} from "@/types/health-import"

// HK identifier → DoctoPal metric type + how to aggregate per day.
type Aggregation = "sum" | "avg" | "max" | "last"
const TYPE_MAP: Record<string, { metric: HealthMetricType; agg: Aggregation; unit: string }> = {
  HKQuantityTypeIdentifierStepCount:               { metric: "steps",                     agg: "sum",  unit: "count" },
  HKQuantityTypeIdentifierHeartRate:               { metric: "heart_rate",                agg: "avg",  unit: "bpm" },
  HKCategoryTypeIdentifierSleepAnalysis:           { metric: "sleep_duration",            agg: "sum",  unit: "hours" },
  HKQuantityTypeIdentifierBodyMass:                { metric: "weight",                    agg: "last", unit: "kg" },
  HKQuantityTypeIdentifierBloodPressureSystolic:   { metric: "blood_pressure_systolic",   agg: "avg",  unit: "mmHg" },
  HKQuantityTypeIdentifierBloodPressureDiastolic:  { metric: "blood_pressure_diastolic",  agg: "avg",  unit: "mmHg" },
  HKQuantityTypeIdentifierOxygenSaturation:        { metric: "blood_oxygen",              agg: "avg",  unit: "%" },
  HKQuantityTypeIdentifierBodyTemperature:         { metric: "body_temperature",          agg: "avg",  unit: "°C" },
  HKQuantityTypeIdentifierActiveEnergyBurned:      { metric: "calories_burned",           agg: "sum",  unit: "kcal" },
}

// Sleep "value" attribute on the asleep categories whose duration we count.
const SLEEP_ASLEEP_VALUES = new Set([
  "HKCategoryValueSleepAnalysisAsleep",
  "HKCategoryValueSleepAnalysisAsleepCore",
  "HKCategoryValueSleepAnalysisAsleepDeep",
  "HKCategoryValueSleepAnalysisAsleepREM",
  "HKCategoryValueSleepAnalysisAsleepUnspecified",
])

interface DayBucket {
  metric: HealthMetricType
  unit: string
  agg: Aggregation
  sum: number
  count: number
  max: number
  last: number
  lastTs: number
}

function dayKey(iso: string): string {
  return iso.slice(0, 10) // YYYY-MM-DD
}

export async function parseAppleHealth(
  file: File,
  onProgress?: ParseProgressCallback,
): Promise<ParsedHealthData> {
  onProgress?.({ phase: "unzipping", processed: 0 })
  const zip = await JSZip.loadAsync(file)

  // The export folder is usually `apple_health_export/export.xml`.
  let xmlEntry = zip.file(/apple_health_export\/export\.xml$/i)[0]
  if (!xmlEntry) xmlEntry = zip.file(/export\.xml$/i)[0]
  if (!xmlEntry) {
    throw new Error("export.xml not found inside the zip — is this an Apple Health export?")
  }

  onProgress?.({ phase: "parsing", processed: 0, message: "Reading XML…" })
  const xml = await xmlEntry.async("string")

  // fast-xml-parser is faster than sax on a single string and the XML is
  // already in memory after JSZip decompresses it. For the giant exports
  // (~100MB+ unzipped) we suggest preserveOrder=false + ignoreAttributes=
  // false so attributes land on the parsed object as `@_`-prefixed keys.
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    isArray: (name) => name === "Record",
  })
  const parsed = parser.parse(xml) as {
    HealthData?: { Record?: Array<Record<string, string>> }
  }
  const records = parsed?.HealthData?.Record || []

  onProgress?.({ phase: "aggregating", processed: 0, total: records.length })

  const buckets = new Map<string, DayBucket>() // key = `${metric}|${dayKey}`
  let earliest: number | null = null
  let latest: number | null = null

  for (let i = 0; i < records.length; i++) {
    const rec = records[i]
    const type = rec["@_type"] as string | undefined
    if (!type) continue
    const map = TYPE_MAP[type]
    if (!map) continue

    const startDate = rec["@_startDate"] as string | undefined
    if (!startDate) continue

    let value: number
    let unit = map.unit

    if (map.metric === "sleep_duration") {
      // Sleep records carry a categorical value, not a numeric quantity.
      // We sum the time between startDate and endDate of "asleep" rows.
      const sleepValue = rec["@_value"] as string | undefined
      if (!sleepValue || !SLEEP_ASLEEP_VALUES.has(sleepValue)) continue
      const endDate = rec["@_endDate"] as string | undefined
      if (!endDate) continue
      const ms = new Date(endDate).getTime() - new Date(startDate).getTime()
      if (!Number.isFinite(ms) || ms <= 0) continue
      value = ms / 3_600_000 // → hours
    } else {
      const raw = rec["@_value"] as string | undefined
      const num = raw ? Number(raw) : NaN
      if (!Number.isFinite(num)) continue
      value = num
      const recUnit = rec["@_unit"] as string | undefined
      if (recUnit) unit = recUnit
    }

    const startTs = new Date(startDate).getTime()
    if (!earliest || startTs < earliest) earliest = startTs
    if (!latest || startTs > latest) latest = startTs

    const key = `${map.metric}|${dayKey(startDate)}`
    let b = buckets.get(key)
    if (!b) {
      b = { metric: map.metric, unit, agg: map.agg, sum: 0, count: 0, max: -Infinity, last: 0, lastTs: 0 }
      buckets.set(key, b)
    }
    b.sum += value
    b.count++
    if (value > b.max) b.max = value
    if (startTs >= b.lastTs) { b.last = value; b.lastTs = startTs }

    // Yield to the event loop every 5000 records so the UI can repaint.
    if ((i & 0x1FFF) === 0) {
      onProgress?.({ phase: "aggregating", processed: i, total: records.length })
      await new Promise(r => setTimeout(r, 0))
    }
  }

  // Emit one HealthMetricInput per (metric, day) bucket.
  const metrics: HealthMetricInput[] = []
  for (const [key, b] of buckets) {
    const day = key.split("|")[1]
    let v: number
    switch (b.agg) {
      case "sum":  v = b.sum; break
      case "avg":  v = b.count ? b.sum / b.count : 0; break
      case "max":  v = b.max === -Infinity ? 0 : b.max; break
      case "last": v = b.last; break
    }
    metrics.push({
      metric_type: b.metric,
      value: Math.round(v * 100) / 100,
      unit: b.unit,
      measured_at: `${day}T12:00:00.000Z`, // anchor at midday UTC for the day bucket
    })
  }

  onProgress?.({ phase: "done", processed: metrics.length, total: records.length })

  return {
    metrics,
    dateRangeStart: earliest ? new Date(earliest).toISOString() : null,
    dateRangeEnd: latest ? new Date(latest).toISOString() : null,
    totalRecords: metrics.length,
  }
}
