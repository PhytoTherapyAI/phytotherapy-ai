// ============================================
// Health Connect — Apple Health / Google Fit Integration
// Sprint 20 — Placeholder for future native implementation
// ============================================

export interface HealthData {
  steps?: number
  heartRate?: number
  sleepHours?: number
  activeCalories?: number
  weight?: number
  bloodPressureSystolic?: number
  bloodPressureDiastolic?: number
  bloodGlucose?: number
  oxygenSaturation?: number
}

export type HealthProvider = "apple_health" | "google_fit" | "none"

// Check if Web Health API or native bridges are available
export function getAvailableProvider(): HealthProvider {
  if (typeof window === "undefined") return "none"

  // Check for native bridge (React Native WebView will inject this)
  if ((window as unknown as Record<string, unknown>).AppleHealthBridge) return "apple_health"
  if ((window as unknown as Record<string, unknown>).GoogleFitBridge) return "google_fit"

  return "none"
}

// Request permission (will be implemented in React Native)
export async function requestHealthPermission(): Promise<boolean> {
  const provider = getAvailableProvider()
  if (provider === "none") return false

  // Placeholder — in React Native this calls the native module
  console.log(`[HealthConnect] Requesting permission for ${provider}`)
  return false // Not available in PWA
}

// Read today's health data
export async function readTodayHealth(): Promise<HealthData | null> {
  const provider = getAvailableProvider()
  if (provider === "none") return null

  // Placeholder
  console.log(`[HealthConnect] Reading health data from ${provider}`)
  return null
}

// Sync health data to Supabase
export async function syncHealthData(userId: string, data: HealthData): Promise<void> {
  try {
    await fetch("/api/health-sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, data, source: getAvailableProvider() }),
    })
  } catch (error) {
    console.error("[HealthConnect] Sync failed:", error)
  }
}

// Feature availability check
export function isHealthConnectAvailable(): boolean {
  return getAvailableProvider() !== "none"
}
