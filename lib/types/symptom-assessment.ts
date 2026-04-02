// © 2026 Doctopal — All Rights Reserved

export interface ConversationStep {
  questionId: string;
  questionText: string;
  selectedOptionId: string;
  selectedOptionLabel: string;
  timestamp: number;
}

export interface AssessmentQuestion {
  text: string;
  subtext?: string;
  type: "single_select" | "multi_select" | "scale";
  options: { id: string; label: string; emoji?: string }[];
}

export interface PossibleCondition {
  name: string;
  confidence: number;
  severity: "low" | "medium" | "high" | "critical";
  description?: string;
}

export interface PhytotherapySuggestion {
  name: string;
  evidence: "A" | "B" | "C";
  description: string;
  caution?: string;
}

export interface AssessmentResponse {
  nextQuestion: AssessmentQuestion;
  possibleConditions: PossibleCondition[];
  progress: number;
  isComplete: boolean;
  urgency: "emergency" | "see_doctor_today" | "see_doctor_soon" | "monitor" | "self_care";
  reasoning?: string;
  medicationAlerts?: string[];
  phytotherapySuggestions?: PhytotherapySuggestion[];
  finalSummary?: string;
}

export interface UserProfile {
  age?: number;
  gender?: string;
  medications?: string[];
  allergies?: string[];
  conditions?: string[];
  kidneyStatus?: string;
  liverStatus?: string;
  pregnancyStatus?: string;
}

export interface AssessmentRequest {
  step: number;
  history: ConversationStep[];
  userProfile?: UserProfile;
  assessmentFor?: "self" | "child" | "other";
  childAge?: string;
  otherAge?: number;
  otherGender?: string;
  lang?: "en" | "tr";
  initialCategory?: string;
}
