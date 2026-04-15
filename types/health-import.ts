// © 2026 DoctoPal — All Rights Reserved

export type HealthImportSource = 'apple_health' | 'google_fit'
export type HealthImportStatus = 'processing' | 'completed' | 'failed'

export type HealthMetricType =
  | 'steps'
  | 'heart_rate'
  | 'sleep_duration'
  | 'weight'
  | 'blood_pressure_systolic'
  | 'blood_pressure_diastolic'
  | 'blood_oxygen'
  | 'body_temperature'
  | 'calories_burned'

export interface HealthImport {
  id: string
  user_id: string
  source: HealthImportSource
  file_name: string
  status: HealthImportStatus
  records_imported: number
  date_range_start: string | null
  date_range_end: string | null
  error_message: string | null
  created_at: string
}

export interface HealthMetricInput {
  metric_type: HealthMetricType
  value: number
  unit: string
  measured_at: string // ISO timestamp
  source_id?: string  // optional external record id
}

export interface ParsedHealthData {
  metrics: HealthMetricInput[]
  dateRangeStart: string | null
  dateRangeEnd: string | null
  totalRecords: number
}

export interface ParseProgress {
  phase: 'unzipping' | 'parsing' | 'aggregating' | 'done'
  processed: number
  total?: number   // may be unknown for streaming parsers
  message?: string
}

export type ParseProgressCallback = (p: ParseProgress) => void
