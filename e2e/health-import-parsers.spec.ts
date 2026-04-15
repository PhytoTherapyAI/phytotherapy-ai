// © 2026 DoctoPal — All Rights Reserved
// Smoke-tests the Apple Health + Google Fit parsers end-to-end with
// fixtures, then asserts that /api/health-imports and /api/health-metrics
// reject anonymous traffic. The real upload flow is exercised manually
// (we don't have a logged-in test user in this CI yet).

import { test, expect } from "@playwright/test"
import JSZip from "jszip"
import { parseAppleHealth } from "@/lib/health-import/apple-health-parser"
import { parseGoogleFit } from "@/lib/health-import/google-fit-parser"
import { APPLE_HEALTH_MOCK_XML } from "@/lib/health-import/__fixtures__/apple-health-mock"
import { GOOGLE_FIT_MOCK_FILES } from "@/lib/health-import/__fixtures__/google-fit-mock"

async function makeAppleZip(): Promise<File> {
  const zip = new JSZip()
  zip.file("apple_health_export/export.xml", APPLE_HEALTH_MOCK_XML)
  const blob = await zip.generateAsync({ type: "blob" })
  return new File([blob], "export.zip", { type: "application/zip" })
}

async function makeGoogleZip(): Promise<File> {
  const zip = new JSZip()
  for (const [path, body] of Object.entries(GOOGLE_FIT_MOCK_FILES)) {
    zip.file(path, body)
  }
  const blob = await zip.generateAsync({ type: "blob" })
  return new File([blob], "takeout-fit.zip", { type: "application/zip" })
}

test.describe("health-import parsers (smoke)", () => {
  test("Apple Health parser produces per-day buckets across the right metric types", async () => {
    const file = await makeAppleZip()
    const parsed = await parseAppleHealth(file)

    expect(parsed.totalRecords).toBeGreaterThan(0)
    expect(parsed.dateRangeStart).toBeTruthy()
    expect(parsed.dateRangeEnd).toBeTruthy()

    const types = new Set(parsed.metrics.map(m => m.metric_type))
    expect(types.has("steps")).toBe(true)
    expect(types.has("heart_rate")).toBe(true)
    expect(types.has("sleep_duration")).toBe(true)
    expect(types.has("weight")).toBe(true)
    expect(types.has("calories_burned")).toBe(true)

    // 2024-01-15 step total = 3500 + 2200 = 5700 (sum aggregation)
    const jan15Steps = parsed.metrics.find(
      m => m.metric_type === "steps" && m.measured_at.startsWith("2024-01-15"),
    )
    expect(jan15Steps?.value).toBe(5700)

    // 2024-01-15 HR avg = (68 + 74) / 2 = 71
    const jan15Hr = parsed.metrics.find(
      m => m.metric_type === "heart_rate" && m.measured_at.startsWith("2024-01-15"),
    )
    expect(jan15Hr?.value).toBeCloseTo(71, 1)

    // Sleep is bucketed by startDate's day (2024-01-15 23:00 → 2024-01-16 02:00 → bucket=2024-01-15)
    const sleepDays = parsed.metrics.filter(m => m.metric_type === "sleep_duration")
    expect(sleepDays.length).toBeGreaterThanOrEqual(1)
  })

  test("Google Fit parser maps step / heart_rate / sleep / weight correctly", async () => {
    const file = await makeGoogleZip()
    const parsed = await parseGoogleFit(file)

    expect(parsed.totalRecords).toBeGreaterThan(0)
    const types = new Set(parsed.metrics.map(m => m.metric_type))
    expect(types.has("steps")).toBe(true)
    expect(types.has("heart_rate")).toBe(true)
    expect(types.has("sleep_duration")).toBe(true)
    expect(types.has("weight")).toBe(true)

    // Same step total as the Apple fixture by design.
    const jan15Steps = parsed.metrics.find(
      m => m.metric_type === "steps" && m.measured_at.startsWith("2024-01-15"),
    )
    expect(jan15Steps?.value).toBe(5700)

    // Sleep is bucketed by start day, so the 23:00→02:00 segment belongs to 2024-01-15.
    const jan15Sleep = parsed.metrics.find(
      m => m.metric_type === "sleep_duration" && m.measured_at.startsWith("2024-01-15"),
    )
    expect(jan15Sleep?.value).toBeGreaterThan(0)

    // Weight is "last" aggregation; one record → that value.
    const weight = parsed.metrics.find(m => m.metric_type === "weight")
    expect(weight?.value).toBe(72.5)
  })

  test("Apple parser rejects a zip without export.xml", async () => {
    const zip = new JSZip()
    zip.file("readme.txt", "not a health export")
    const blob = await zip.generateAsync({ type: "blob" })
    const file = new File([blob], "wrong.zip", { type: "application/zip" })
    await expect(parseAppleHealth(file)).rejects.toThrow(/export\.xml/i)
  })

  test("Google Fit parser rejects a zip with no Fit data", async () => {
    const zip = new JSZip()
    zip.file("Takeout/SomethingElse/file.json", "{}")
    const blob = await zip.generateAsync({ type: "blob" })
    const file = new File([blob], "wrong.zip", { type: "application/zip" })
    await expect(parseGoogleFit(file)).rejects.toThrow(/Fit/i)
  })
})

test.describe("health-import API (auth gate)", () => {
  test("anonymous calls to /api/health-imports return 401", async ({ request }) => {
    for (const method of ["GET", "POST", "PATCH", "DELETE"] as const) {
      const res = await request.fetch("/api/health-imports", { method })
      expect(res.status()).toBe(401)
    }
  })

  test("anonymous calls to /api/health-metrics return 401", async ({ request }) => {
    for (const method of ["GET", "POST"] as const) {
      const res = await request.fetch("/api/health-metrics", { method })
      expect(res.status()).toBe(401)
    }
  })
})
