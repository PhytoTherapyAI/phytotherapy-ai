// © 2026 DoctoPal — All Rights Reserved
// ============================================
// Health Data Integrations — Schema & Config
// Apple Health, Google Fit, Garmin, Fitbit, Oura, Samsung Health
// ============================================

export type IntegrationProvider = "apple_health" | "google_fit" | "fitbit" | "garmin" | "oura" | "samsung_health" | "whoop" | "withings"
export type ConnectionStatus = "connected" | "disconnected" | "syncing" | "error"
export type MetricType = "heart_rate" | "steps" | "sleep" | "blood_oxygen" | "blood_pressure" | "blood_glucose" | "body_temperature" | "weight" | "calories_burned" | "hrv" | "respiratory_rate" | "stress"

// ── Provider Config ──
export interface ProviderConfig {
  id: IntegrationProvider
  name: string
  logo: string // emoji for now, swap with real logos
  color: string
  bgLight: string
  bgDark: string
  description: { en: string; tr: string }
  supportedMetrics: MetricType[]
  authType: "oauth2" | "sdk" | "manual"
  oauthUrl?: string
  available: boolean
}

export const PROVIDERS: ProviderConfig[] = [
  {
    id: "apple_health", name: "Apple Health", logo: "🍎", color: "#FF3B30",
    bgLight: "bg-red-50", bgDark: "dark:bg-red-950/20",
    description: { en: "Sync heart rate, steps, sleep, blood oxygen from your iPhone and Apple Watch", tr: "iPhone ve Apple Watch'tan nabız, adım, uyku, kan oksijeni senkronize edin" },
    supportedMetrics: ["heart_rate", "steps", "sleep", "blood_oxygen", "hrv", "calories_burned", "weight", "respiratory_rate"],
    authType: "sdk", available: true,
  },
  {
    id: "google_fit", name: "Google Fit", logo: "💚", color: "#4285F4",
    bgLight: "bg-blue-50", bgDark: "dark:bg-blue-950/20",
    description: { en: "Connect Google Fit to import activity, heart rate, and body measurements", tr: "Aktivite, nabız ve vücut ölçümlerini aktarmak için Google Fit'i bağlayın" },
    supportedMetrics: ["heart_rate", "steps", "sleep", "weight", "calories_burned", "blood_pressure"],
    authType: "oauth2", oauthUrl: "/api/integrations/google-fit/auth", available: true,
  },
  {
    id: "fitbit", name: "Fitbit", logo: "⌚", color: "#00B0B9",
    bgLight: "bg-teal-50", bgDark: "dark:bg-teal-950/20",
    description: { en: "Sync Fitbit data including sleep stages, SpO2, and stress management", tr: "Uyku evreleri, SpO2 ve stres yönetimi dahil Fitbit verilerini senkronize edin" },
    supportedMetrics: ["heart_rate", "steps", "sleep", "blood_oxygen", "hrv", "calories_burned", "weight", "stress"],
    authType: "oauth2", oauthUrl: "/api/integrations/fitbit/auth", available: true,
  },
  {
    id: "garmin", name: "Garmin Connect", logo: "🔺", color: "#007CC3",
    bgLight: "bg-blue-50", bgDark: "dark:bg-blue-950/20",
    description: { en: "Import Garmin data: advanced running metrics, body battery, pulse ox", tr: "Garmin verilerini aktarın: gelişmiş koşu metrikleri, vücut bataryası, nabız oksijen" },
    supportedMetrics: ["heart_rate", "steps", "sleep", "blood_oxygen", "hrv", "calories_burned", "stress", "respiratory_rate"],
    authType: "oauth2", oauthUrl: "/api/integrations/garmin/auth", available: true,
  },
  {
    id: "oura", name: "Oura Ring", logo: "💍", color: "#DCDCDC",
    bgLight: "bg-gray-50", bgDark: "dark:bg-gray-950/20",
    description: { en: "Sync Oura Ring sleep analysis, readiness score, and HRV data", tr: "Oura Ring uyku analizi, hazırlık skoru ve HRV verilerini senkronize edin" },
    supportedMetrics: ["heart_rate", "sleep", "hrv", "body_temperature", "respiratory_rate", "blood_oxygen"],
    authType: "oauth2", oauthUrl: "/api/integrations/oura/auth", available: true,
  },
  {
    id: "samsung_health", name: "Samsung Health", logo: "🔵", color: "#1428A0",
    bgLight: "bg-indigo-50", bgDark: "dark:bg-indigo-950/20",
    description: { en: "Connect Samsung Health from your Galaxy Watch and phone", tr: "Galaxy Watch ve telefonunuzdan Samsung Health'i bağlayın" },
    supportedMetrics: ["heart_rate", "steps", "sleep", "blood_oxygen", "blood_pressure", "weight", "stress"],
    authType: "sdk", available: false,
  },
  {
    id: "whoop", name: "WHOOP", logo: "🟢", color: "#44D62C",
    bgLight: "bg-green-50", bgDark: "dark:bg-green-950/20",
    description: { en: "Sync WHOOP recovery, strain, and sleep performance data", tr: "WHOOP toparlanma, zorlanma ve uyku performansı verilerini senkronize edin" },
    // "strain" is a WHOOP-specific metric not in the standard MetricType union
    supportedMetrics: ["heart_rate", "sleep", "hrv", "calories_burned", "respiratory_rate", "strain" as MetricType],
    authType: "oauth2", available: false,
  },
  {
    id: "withings", name: "Withings", logo: "⚖️", color: "#00BCD4",
    bgLight: "bg-cyan-50", bgDark: "dark:bg-cyan-950/20",
    description: { en: "Import Withings scale, blood pressure monitor, and sleep data", tr: "Withings tartı, tansiyon ölçer ve uyku verilerini aktarın" },
    supportedMetrics: ["weight", "blood_pressure", "sleep", "blood_oxygen", "body_temperature"],
    authType: "oauth2", available: false,
  },
]

// ── Metric Display Config ──
export const METRIC_CONFIG: Record<MetricType, { label: { en: string; tr: string }; unit: string; icon: string; color: string }> = {
  heart_rate: { label: { en: "Heart Rate", tr: "Nabız" }, unit: "bpm", icon: "Heart", color: "#EF4444" },
  steps: { label: { en: "Steps", tr: "Adım" }, unit: "", icon: "Footprints", color: "#22C55E" },
  sleep: { label: { en: "Sleep", tr: "Uyku" }, unit: "hrs", icon: "Moon", color: "#818CF8" },
  blood_oxygen: { label: { en: "Blood Oxygen", tr: "Kan Oksijeni" }, unit: "%", icon: "Droplets", color: "#0EA5E9" },
  blood_pressure: { label: { en: "Blood Pressure", tr: "Tansiyon" }, unit: "mmHg", icon: "Activity", color: "#F97316" },
  blood_glucose: { label: { en: "Blood Glucose", tr: "Kan Şekeri" }, unit: "mg/dL", icon: "Zap", color: "#EAB308" },
  body_temperature: { label: { en: "Temperature", tr: "Vücut Sıcaklığı" }, unit: "°C", icon: "Thermometer", color: "#F59E0B" },
  weight: { label: { en: "Weight", tr: "Kilo" }, unit: "kg", icon: "Scale", color: "#6366F1" },
  calories_burned: { label: { en: "Calories Burned", tr: "Yakılan Kalori" }, unit: "kcal", icon: "Flame", color: "#F97316" },
  hrv: { label: { en: "HRV", tr: "KDH (HRV)" }, unit: "ms", icon: "BarChart3", color: "#8B5CF6" },
  respiratory_rate: { label: { en: "Respiratory Rate", tr: "Solunum Hızı" }, unit: "br/min", icon: "Wind", color: "#14B8A6" },
  stress: { label: { en: "Stress Level", tr: "Stres Seviyesi" }, unit: "", icon: "Gauge", color: "#DC2626" },
}

// ── Normalized Health Data Schema ──
export interface HealthMetricRecord {
  id: string
  userId: string
  provider: IntegrationProvider
  metricType: MetricType
  value: number
  unit: string
  timestamp: string         // ISO 8601
  metadata?: Record<string, any>  // provider-specific extra data
}

export interface HealthDataSync {
  userId: string
  provider: IntegrationProvider
  status: ConnectionStatus
  connectedAt?: string
  lastSyncAt?: string
  totalRecords: number
  accessToken?: string       // encrypted, server-only
  refreshToken?: string      // encrypted, server-only
  tokenExpiresAt?: string
  scopes: string[]
  consentGivenAt?: string
}

// ── Consent Text ──
export const CONSENT_TEXT = {
  en: {
    title: "Health Data Access Permission",
    body: "By connecting this service, you authorize DoctoPal to access the following health data from your account. This data will be used solely to provide personalized health recommendations.",
    dataTypes: "Data types we'll access:",
    storage: "Your data is encrypted at rest (AES-256) and in transit (TLS 1.3). We never sell your data.",
    revoke: "You can disconnect and delete imported data at any time from this settings page.",
    kvkk: "This complies with KVKK (Turkish Data Protection Law) and GDPR. Your explicit consent is recorded.",
    agree: "I Agree & Connect",
    cancel: "Cancel",
  },
  tr: {
    title: "Sağlık Verisi Erişim İzni",
    body: "Bu hizmeti bağlayarak, DoctoPal'nin hesabınızdan aşağıdaki sağlık verilerine erişmesine izin verirsiniz. Bu veriler yalnızca kişiselleştirilmiş sağlık önerileri sunmak için kullanılacaktır.",
    dataTypes: "Erişeceğimiz veri türleri:",
    storage: "Verileriniz durağan halde (AES-256) ve aktarım sırasında (TLS 1.3) şifrelenir. Verilerinizi asla satmayız.",
    revoke: "Bu ayarlar sayfasından istediğiniz zaman bağlantıyı kesebilir ve aktarılan verileri silebilirsiniz.",
    kvkk: "Bu KVKK (Kişisel Verileri Koruma Kanunu) ve GDPR ile uyumludur. Açık rızanız kaydedilir.",
    agree: "Kabul Ediyorum ve Bağla",
    cancel: "İptal",
  },
}
