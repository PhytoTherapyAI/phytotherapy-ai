// Auto-generated types for Supabase tables
// Matches supabase/schema.sql

export type Gender = "male" | "female" | "other" | "prefer_not_to_say";
export type AlcoholUse = "none" | "occasional" | "regular" | "heavy";
export type SmokingUse = "none" | "former" | "current";
export type AllergySeverity = "mild" | "moderate" | "severe" | "anaphylaxis";
export type QueryType = "interaction" | "general" | "blood_test";
export type ConsentType = "terms_of_service" | "privacy_policy" | "medical_disclaimer";

export interface UserProfile {
  id: string;
  full_name: string | null;
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
