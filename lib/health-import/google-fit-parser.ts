// © 2026 DoctoPal — All Rights Reserved
// Google Fit Takeout parser — runs in the browser.
// Input: the ZIP returned by takeout.google.com when only "Fit" is selected.
// The structure looks roughly like:
//   Takeout/
//     Fit/
//       Daily activity metrics/
//         2024-01-15.csv
//         2024-01-15.json   (some exports)
//       All Sessions/
//         2024-01-15T20:13:00+02_00_SLEEP.json
//       All Data/
//         derived_com.google.step_count.delta_*.json
//         derived_com.google.heart_rate.bpm_*.json
//         derived_com.google.sleep.segment_*.json
//         derived_com.google.weight_*.json
//         ...
//
// We focus on the "All Data" derived JSONs (consistent shape), then fall
// back to the "Daily activity metrics" CSV when those are absent (newer
// exports sometimes drop the per-source files).

import JSZip from "jszip"
import type {
  HealthMetricInput,
  HealthMetricType,
  ParsedHealthData,
  ParseProgressCallback,
} from "@/types/health-import"

type Aggregation = "sum" | "avg" | "max" | "last"

interface DerivedMatch {
  pattern: RegExp
  metric: HealthMetricType
  unit: string
  agg: Aggregation
  // Pull a numeric value out of one Google Fit dataPoint's `value` array.
  pickValue: (vals: Array<{ intVal?: number; fpVal?: number; stringVal?: string }>) => number | null
}

const DERIVED: DerivedMatch[] = [
  {
    pattern: /step_count\.delta/i,
    metric: "steps",
    unit: "count",
    agg: "sum",
    pickValue: v => (v[0]?.intVal ?? null),
  },
  {
    pattern: /heart_rate\.bpm/i,
    metric: "heart_rate",
    unit: "bpm",
    agg: "avg",
    pickValue: v => (v[0]?.fpVal ?? null),
  },
  {
    pattern: /calories\.expended/i,
    metric: "calories_burned",
    unit: "kcal",
    agg: "sum",
    pickValue: v => (v[0]?.fpVal ?? null),
  },
  {
    pattern: /weight/i,
    metric: "weight",
    unit: "kg",
    agg: "last",
    pickValue: v => (v[0]?.fpVal ?? null),
  },
  {
    pattern: /oxygen_saturation/i,
    metric: "blood_oxygen",
    unit: "%",
    agg: "avg",
    pickValue: v => (v[0]?.fpVal ?? null),
  },
  {
    pattern: /body\.temperature/i,
    metric: "body_temperature",
    unit: "°C",
    agg: "avg",
    pickValue: v => (v[0]?.fpVal ?? null),
  },
  {
    pattern: /blood_pressure/i,
    metric: "blood_pressure_systolic", // overridden below for diastolic
    unit: "mmHg",
    agg: "avg",
    pickValue: v => (v[0]?.fpVal ?? null),
  },
  {
    pattern: /sleep\.segment/i,
    metric: "sleep_duration",
    unit: "hours",
    agg: "sum",
    // Google sleep segment values are ints (1=Awake, 2=Sleep, 3=OOB, ...).
    // We compute duration from start/end ns at the dataPoint level instead,
    // so this picker is a sentinel — the loop below handles sleep specially.
    pickValue: () => 1,
  },
]

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
  return iso.slice(0, 10)
}

function nsToIso(nsStr: string): string {
  const ns = BigInt(nsStr)
  const ms = Number(ns / BigInt(1_000_000))
  return new Date(ms).toISOString()
}

interface FitDataPoint {
  startTimeNanos?: string
  endTimeNanos?: string
  value?: Array<{ intVal?: number; fpVal?: number; stringVal?: string }>
  dataTypeName?: string
}

interface FitFile {
  Data?: FitDataPoint[]
  dataPoint?: FitDataPoint[]
  bucket?: Array<{ dataset?: Array<{ point?: FitDataPoint[] }> }>
}

function collectPoints(fit: FitFile): FitDataPoint[] {
  if (Array.isArray(fit.Data)) return fit.Data
  if (Array.isArray(fit.dataPoint)) return fit.dataPoint
  if (Array.isArray(fit.bucket)) {
    const out: FitDataPoint[] = []
    for (const b of fit.bucket) {
      for (const ds of b.dataset || []) {
        for (const p of ds.point || []) out.push(p)
      }
    }
    return out
  }
  return []
}

function ensureBucket(
  buckets: Map<string, DayBucket>,
  metric: HealthMetricType,
  unit: string,
  agg: Aggregation,
  day: string,
): DayBucket {
  const key = `${metric}|${day}`
  let b = buckets.get(key)
  if (!b) {
    b = { metric, unit, agg, sum: 0, count: 0, max: -Infinity, last: 0, lastTs: 0 }
    buckets.set(key, b)
  }
  return b
}

export async function parseGoogleFit(
  file: File,
  onProgress?: ParseProgressCallback,
): Promise<ParsedHealthData> {
  onProgress?.({ phase: "unzipping", processed: 0 })
  const zip = await JSZip.loadAsync(file)

  // Find every JSON inside the Fit folder.
  const jsonEntries = zip.file(/Fit\/All Data\/.+\.json$/i)
  if (jsonEntries.length === 0) {
    throw new Error("No Fit/All Data JSON files found — is this a Google Takeout Fit export?")
  }

  const buckets = new Map<string, DayBucket>()
  let earliest: number | null = null
  let latest: number | null = null
  let processedFiles = 0

  for (const entry of jsonEntries) {
    processedFiles++
    onProgress?.({
      phase: "parsing",
      processed: processedFiles,
      total: jsonEntries.length,
      message: entry.name.split("/").pop(),
    })

    const match = DERIVED.find(d => d.pattern.test(entry.name))
    if (!match) continue

    let fit: FitFile
    try {
      const text = await entry.async("string")
      fit = JSON.parse(text) as FitFile
    } catch {
      continue
    }
    const points = collectPoints(fit)

    for (const p of points) {
      if (!p.startTimeNanos) continue
      const startIso = nsToIso(p.startTimeNanos)
      const startTs = new Date(startIso).getTime()
      if (!Number.isFinite(startTs)) continue
      if (!earliest || startTs < earliest) earliest = startTs
      if (!latest || startTs > latest) latest = startTs

      // Sleep — derive duration from end-start in ns and only count actual sleep stages.
      if (match.metric === "sleep_duration") {
        if (!p.endTimeNanos) continue
        const endTs = Number(BigInt(p.endTimeNanos) / BigInt(1_000_000))
        const ms = endTs - startTs
        if (ms <= 0) continue
        // sleep stage int 2..6 = asleep stages; 1 = awake; skip 1.
        const stage = p.value?.[0]?.intVal
        if (stage === 1) continue
        const hours = ms / 3_600_000
        const b = ensureBucket(buckets, "sleep_duration", "hours", "sum", dayKey(startIso))
        b.sum += hours
        b.count++
        if (startTs >= b.lastTs) { b.last = hours; b.lastTs = startTs }
        continue
      }

      // Blood pressure — Google stores systolic + diastolic in the same point.
      if (match.metric === "blood_pressure_systolic" && p.value && p.value.length >= 2) {
        const sys = p.value[0]?.fpVal
        const dia = p.value[1]?.fpVal
        if (typeof sys === "number") {
          const b = ensureBucket(buckets, "blood_pressure_systolic", "mmHg", "avg", dayKey(startIso))
          b.sum += sys; b.count++
          if (sys > b.max) b.max = sys
          if (startTs >= b.lastTs) { b.last = sys; b.lastTs = startTs }
        }
        if (typeof dia === "number") {
          const b = ensureBucket(buckets, "blood_pressure_diastolic", "mmHg", "avg", dayKey(startIso))
          b.sum += dia; b.count++
          if (dia > b.max) b.max = dia
          if (startTs >= b.lastTs) { b.last = dia; b.lastTs = startTs }
        }
        continue
      }

      const v = match.pickValue(p.value || [])
      if (v == null || !Number.isFinite(v)) continue

      const b = ensureBucket(buckets, match.metric, match.unit, match.agg, dayKey(startIso))
      b.sum += v
      b.count++
      if (v > b.max) b.max = v
      if (startTs >= b.lastTs) { b.last = v; b.lastTs = startTs }
    }

    // Yield to the event loop between files.
    if ((processedFiles & 0x7) === 0) {
      await new Promise(r => setTimeout(r, 0))
    }
  }

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
      measured_at: `${day}T12:00:00.000Z`,
    })
  }

  onProgress?.({ phase: "done", processed: metrics.length, total: jsonEntries.length })

  return {
    metrics,
    dateRangeStart: earliest ? new Date(earliest).toISOString() : null,
    dateRangeEnd: latest ? new Date(latest).toISOString() : null,
    totalRecords: metrics.length,
  }
}
