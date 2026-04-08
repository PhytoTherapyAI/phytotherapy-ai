// © 2026 DoctoPal — All Rights Reserved
// Auto-generated types for Supabase tables
// Matches supabase/schema.sql

export type Gender = "male" | "female" | "other" | "prefer_not_to_say";
export type AlcoholUse = string; // "none" | "former|freq" | "active|freq" (compound format)
export type SmokingUse = string; // "none" | "current|amount|years" | "former|amount|years|quit" (compound format)
export type AllergySeverity = "anaphylaxis" | "urticaria" | "mild_skin" | "gi_intolerance" | "unknown" | "mild" | "moderate" | "severe";
export type QueryType = "interaction" | "general" | "blood_test";
export type ConsentType = "terms_of_service" | "privacy_policy" | "medical_disclaimer";

export interface UserProfile {
  id: string;
  full_name: string | null;
  birth_date: string | null;
  age: number | null;
  gender: Gender | null;
  is_pregnant: boolean;
  is_breastfeeding: boolean;
  alcohol_use: AlcoholUse;
  smoking_use: SmokingUse;
  kidney_disease: boolean;
  liver_disease: boolean;
  recent_surgery: boolean;
  chronic_conditions: string[];
  // Layer 2
  height_cm: number | null;
  weight_kg: number | null;
  blood_group: string | null;
  diet_type: string | null;
  exercise_frequency: string | null;
  sleep_quality: string | null;
  supplements: string[];
  // System
  onboarding_complete: boolean;
  onboarding_layer2_complete: boolean;
  consent_timestamp: string | null;
  last_medication_update: string | null;
  created_at: string;
  updated_at: string;
  // Contact & Location
  country: string | null;
  city: string | null;
  phone: string | null;
  recovery_email: string | null;
  // Premium — Sprint 14
  plan: "free" | "premium" | "family" | "doctor" | null;
  trial_started_at: string | null;
  premium_expires_at: string | null;
  // Doctor verification — Sprint 17
  is_doctor_verified: boolean;
  doctor_license_url: string | null;
  // Permission state — JSONB
  permission_state: Record<string, unknown> | null;
  // Vaccines — JSONB array
  vaccines: VaccineEntryDB[];
}

export interface VaccineEntryDB {
  id: string;
  name: string;
  last_date?: string;
  status: "done" | "not_done" | "unknown";
  reminder?: boolean;
}

export interface UserMedication {
  id: string;
  user_id: string;
  brand_name: string | null;
  generic_name: string | null;
  dosage: string | null;
  frequency: string | null;
  is_active: boolean;
  added_at: string;
}

export interface UserAllergy {
  id: string;
  user_id: string;
  allergen: string;
  severity: AllergySeverity;
  added_at: string;
}

export interface QueryHistory {
  id: string;
  user_id: string | null;
  query_text: string;
  response_text: string | null;
  query_type: QueryType | null;
  is_favorite: boolean;
  created_at: string;
}

export interface BloodTest {
  id: string;
  user_id: string;
  test_data: Record<string, unknown>;
  analysis_result: string | null;
  pdf_url: string | null;
  created_at: string;
}

export interface ConsentRecord {
  id: string;
  user_id: string;
  consent_type: ConsentType;
  ip_address: string | null;
  user_agent: string | null;
  consent_text: string | null;
  timestamp: string;
}

export interface DailyCheckIn {
  id: string;
  user_id: string;
  check_date: string;
  energy_level: number | null;
  sleep_quality: number | null;
  mood: number | null;
  bloating: number | null;
  notes: string | null;
  health_score: number | null;
  created_at: string;
}

// ── Family Profiles — Sprint 11 ──────────────
export type FamilyRelationship = "spouse" | "child" | "parent" | "sibling" | "other";

export interface FamilyMember {
  id: string;
  owner_id: string;
  full_name: string;
  birth_date: string | null;
  age: number | null;
  gender: Gender | null;
  relationship: FamilyRelationship;
  is_minor: boolean;
  is_pregnant: boolean;
  is_breastfeeding: boolean;
  alcohol_use: AlcoholUse;
  smoking_use: SmokingUse;
  kidney_disease: boolean;
  liver_disease: boolean;
  chronic_conditions: string[];
  supplements: string[];
  height_cm: number | null;
  weight_kg: number | null;
  created_at: string;
  updated_at: string;
}

export interface FamilyMedication {
  id: string;
  family_member_id: string;
  brand_name: string | null;
  generic_name: string | null;
  dosage: string | null;
  frequency: string | null;
  is_active: boolean;
  added_at: string;
}

export interface FamilyAllergy {
  id: string;
  family_member_id: string;
  allergen: string;
  severity: AllergySeverity;
  added_at: string;
}

// ── Sleep Records — New Tools ──────────────
export interface SleepRecord {
  id: string;
  user_id: string;
  date: string;
  bedtime: string | null;
  wake_time: string | null;
  sleep_duration: number | null;
  sleep_quality: number | null;
  wake_count: number;
  dreams: boolean;
  factors: string[];
  notes: string | null;
  created_at: string;
}

// ── Mood Records — Mental Wellness ──────────────
export interface MoodRecord {
  id: string;
  user_id: string;
  date: string;
  mood: number | null;
  energy: number | null;
  stress: number | null;
  anxiety: number | null;
  focus: number | null;
  triggers: string[];
  coping_methods: string[];
  notes: string | null;
  created_at: string;
}

// ── Nutrition Records ──────────────
export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface NutritionRecord {
  id: string;
  user_id: string;
  date: string;
  meal_type: MealType | null;
  description: string | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  fiber: number | null;
  key_nutrients: Record<string, unknown> | null;
  food_drug_alerts: string[];
  image_used: boolean;
  created_at: string;
}

// ── Cycle Records — Women's Health ──────────────
export type FlowIntensity = "light" | "moderate" | "heavy" | "spotting";
export type CycleMood = "great" | "good" | "neutral" | "low" | "very_low";

export interface CycleRecord {
  id: string;
  user_id: string;
  period_start: string;
  period_end: string | null;
  flow_intensity: FlowIntensity | null;
  symptoms: string[];
  mood: CycleMood | null;
  notes: string | null;
  created_at: string;
}

// ── Contraceptive Records ──────────────
export interface ContraceptiveRecord {
  id: string;
  user_id: string;
  contraceptive_type: string;
  brand_name: string | null;
  active_ingredient: string | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  daily_reminder: boolean;
  notes: string | null;
  created_at: string;
}

// ── Vaccination Records ──────────────
export interface VaccinationRecord {
  id: string;
  user_id: string;
  family_member_id: string | null;
  vaccine_name: string;
  vaccine_type: string | null;
  dose_number: number;
  date_administered: string | null;
  next_due_date: string | null;
  provider: string | null;
  batch_number: string | null;
  notes: string | null;
  created_at: string;
}

// ── Allergy & Intolerance Records ──────────────
export type AllergyIntoleranceType = "allergy" | "intolerance" | "sensitivity";

export interface AllergyIntoleranceRecord {
  id: string;
  user_id: string;
  type: AllergyIntoleranceType | null;
  trigger_name: string;
  category: string | null;
  severity: AllergySeverity | null;
  symptoms: string[];
  diagnosed_by_doctor: boolean;
  diagnosis_date: string | null;
  notes: string | null;
  created_at: string;
}

export interface AllergyReactionLog {
  id: string;
  user_id: string;
  allergy_id: string | null;
  reaction_date: string;
  severity: string | null;
  symptoms: string[];
  trigger_food: string | null;
  treatment_used: string | null;
  notes: string | null;
}

// ── Rehabilitation ──────────────
export type RehabPhase = "acute" | "subacute" | "recovery" | "maintenance";

export interface RehabProgram {
  id: string;
  user_id: string;
  surgery_type: string | null;
  surgery_date: string | null;
  condition: string | null;
  phase: RehabPhase | null;
  exercises: Record<string, unknown> | null;
  restrictions: string[];
  start_date: string | null;
  target_end_date: string | null;
  notes: string | null;
  created_at: string;
}

export interface RehabDailyLog {
  id: string;
  user_id: string;
  program_id: string | null;
  date: string;
  pain_level: number | null;
  exercises_completed: Record<string, unknown> | null;
  mobility_score: number | null;
  swelling: "none" | "mild" | "moderate" | "severe" | null;
  notes: string | null;
  created_at: string;
}

// ── Pain Records ──────────────
export interface PainRecord {
  id: string;
  user_id: string;
  date: string;
  location: string;
  intensity: number | null;
  pain_type: string | null;
  duration: string | null;
  triggers: string[];
  relief_methods: string[];
  medications_taken: string[];
  notes: string | null;
  created_at: string;
}

// ── Bot Subscriptions — WhatsApp/Telegram ──────────────
export type BotChannel = "whatsapp" | "telegram";
export type BotStatus = "active" | "paused" | "disconnected";

export interface BotSubscription {
  id: string;
  user_id: string;
  channel: BotChannel;
  channel_id: string;
  display_name: string | null;
  status: BotStatus;
  daily_plan_enabled: boolean;
  send_time: string;
  language: "en" | "tr";
  last_message_sent: string | null;
  last_user_reply: string | null;
  total_messages_sent: number;
  total_tasks_completed: number;
  connected_at: string;
  updated_at: string;
}

export interface BotMessage {
  id: string;
  subscription_id: string | null;
  user_id: string;
  channel: string;
  direction: "outgoing" | "incoming";
  content: string;
  task_id: string | null;
  task_completed: boolean;
  sent_at: string;
  delivered_at: string | null;
  read_at: string | null;
}

// ── Health Metrics — Integrated Health Data ──────────────
export type MetricSource = "manual" | "wearable" | "lab_test" | "doctor_note" | "fhir_import" | "apple_health" | "google_fit" | "fitbit" | "garmin" | "oura" | "doctopal_app";
export type MetricStatus = "normal" | "high" | "low" | "critical";

export interface HealthMetric {
  id: string;
  user_id: string;
  source: MetricSource;
  source_id: string | null;
  metric_type: string;
  loinc_code: string | null;
  value: number;
  unit: string;
  status: MetricStatus | null;
  fhir_resource_type: string | null;
  fhir_resource_id: string | null;
  measured_at: string;
  imported_at: string;
}

export interface IntegrationConnection {
  id: string;
  user_id: string;
  provider: string;
  access_token_encrypted: string | null;
  refresh_token_encrypted: string | null;
  token_expires_at: string | null;
  scopes: string[];
  status: "active" | "expired" | "revoked";
  last_sync_at: string | null;
  total_records_synced: number;
  connected_at: string;
  updated_at: string;
}

// ── Verification Documents ──────────────
export type VerificationStatus = "pending" | "approved" | "rejected" | "expired";
export type DocumentType = "diploma_registration" | "institution_id" | "edevlet_certificate" | "ttb_license" | "other";

export interface VerificationDocument {
  id: string;
  user_id: string;
  document_type: DocumentType;
  encrypted_path: string;
  original_filename_hash: string | null;
  file_size: number;
  mime_type: string;
  diploma_number: string | null;
  ttb_sicil_number: string | null;
  verification_status: VerificationStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  reviewer_notes: string | null;
  uploaded_at: string;
  updated_at: string | null;
  expires_at: string | null;
}

// ── Doctor Referral System ──────────────
export interface DoctorReferralCode {
  id: string;
  doctor_id: string;
  code: string;
  link: string | null;
  is_active: boolean;
  created_at: string;
}

export type ReferralStatus = "registered" | "active" | "premium" | "churned";

export interface ReferralRecord {
  id: string;
  referral_code_id: string | null;
  doctor_id: string | null;
  patient_id: string | null;
  status: ReferralStatus;
  credits_earned: number;
  created_at: string;
}

export type LinkedRelationship = "mother" | "father" | "child" | "spouse" | "grandparent" | "sibling" | "other";

export interface LinkedAccount {
  id: string;
  parent_user_id: string;
  linked_user_id: string;
  relationship: LinkedRelationship;
  permissions: string[];
  pays_subscription: boolean;
  is_accepted: boolean;
  invite_email: string | null;
  created_at: string;
}

// ── Content Embeddings — Vector Search ──────────────
export type ContentType = "article" | "supplement" | "herb" | "doctor" | "tool" | "condition";

export interface ContentEmbedding {
  id: string;
  content_type: ContentType;
  content_id: string;
  title: string;
  title_tr: string | null;
  description: string | null;
  description_tr: string | null;
  href: string;
  category: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Supabase Database type for typed client
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfile;
        Insert: Partial<UserProfile> & { id: string };
        Update: Partial<UserProfile>;
      };
      user_medications: {
        Row: UserMedication;
        Insert: Omit<UserMedication, "id" | "added_at"> & { id?: string; added_at?: string };
        Update: Partial<UserMedication>;
      };
      user_allergies: {
        Row: UserAllergy;
        Insert: Omit<UserAllergy, "id" | "added_at"> & { id?: string; added_at?: string };
        Update: Partial<UserAllergy>;
      };
      query_history: {
        Row: QueryHistory;
        Insert: Omit<QueryHistory, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<QueryHistory>;
      };
      blood_tests: {
        Row: BloodTest;
        Insert: Omit<BloodTest, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<BloodTest>;
      };
      consent_records: {
        Row: ConsentRecord;
        Insert: Omit<ConsentRecord, "id" | "timestamp"> & { id?: string; timestamp?: string };
        Update: Partial<ConsentRecord>;
      };
    };
  };
}
