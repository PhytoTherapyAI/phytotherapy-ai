"use client";

import { useState, useEffect, useCallback } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Plus,
  ShieldAlert,
  X,
  Search,
  LogIn,
  Pill,
  Leaf,
  Wind,
  Utensils,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface AllergyRecord {
  id: string;
  type: string;
  trigger_name: string;
  category: string;
  severity: string;
  symptoms: string[];
  diagnosed_by_doctor: boolean;
  notes: string;
  created_at: string;
}

interface CrossCheckResult {
  conflicts: Array<{
    allergy: string;
    conflictsWith: string;
    risk: "high" | "moderate" | "low";
    explanation: string;
  }>;
  warnings: Array<{ message: string }>;
  summary: string;
}

const SEVERITY_CONFIG: Record<string, { color: string; label: string; labelTr: string }> = {
  mild: { color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", label: "Mild", labelTr: "Hafif" },
  moderate: { color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", label: "Moderate", labelTr: "Orta" },
  severe: { color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", label: "Severe", labelTr: "Siddetli" },
  anaphylaxis: { color: "bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-300", label: "Anaphylaxis", labelTr: "Anafilaksi" },
};

const CATEGORY_ICONS: Record<string, typeof Utensils> = {
  food: Utensils,
  medication: Pill,
  environmental: Wind,
  supplement: Leaf,
};

const COMMON_SYMPTOMS_EN = [
  "Hives", "Itching", "Swelling", "Rash", "Nausea", "Vomiting",
  "Diarrhea", "Sneezing", "Runny nose", "Wheezing", "Headache",
  "Stomach pain", "Throat tightness", "Difficulty breathing",
];

const COMMON_SYMPTOMS_TR = [
  "Ürtiker", "Kaşıntı", "Şişlik", "Dokutu", "Bulantı", "Kusma",
  "İshal", "Hapşırma", "Burun akıntısı", "Hırıltılı solunum", "Bas ağrısi",
  "Karin ağrısi", "Bogaz sıkışması", "Nefes darlığı",
];

export default function AllergyMapPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();
  const [records, setRecords] = useState<AllergyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [crossCheck, setCrossCheck] = useState<CrossCheckResult | null>(null);
  const [isCrossChecking, setIsCrossChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formType, setFormType] = useState<string>("allergy");
  const [formTrigger, setFormTrigger] = useState("");
  const [formCategory, setFormCategory] = useState("food");
  const [formSeverity, setFormSeverity] = useState("mild");
  const [formSymptoms, setFormSymptoms] = useState<string[]>([]);
  const [formDoctorDiagnosed, setFormDoctorDiagnosed] = useState(false);
  const [formNotes, setFormNotes] = useState("");

  const commonSymptoms = lang === "tr" ? COMMON_SYMPTOMS_TR : COMMON_SYMPTOMS_EN;

  const fetchRecords = useCallback(async () => {
    if (!session?.access_token) return;
    try {
      const res = await fetch("/api/allergy-map", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRecords(data.records || []);
      }
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    if (isAuthenticated) fetchRecords();
    else setIsLoading(false);
  }, [isAuthenticated, fetchRecords]);

  const handleSave = async () => {
    if (!formTrigger.trim()) return;
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/allergy-map", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          type: formType,
          trigger_name: formTrigger.trim(),
          category: formCategory,
          severity: formSeverity,
          symptoms: formSymptoms,
          diagnosed_by_doctor: formDoctorDiagnosed,
          notes: formNotes.trim(),
          lang,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Save failed");
      }

      setSuccess(tx("allergy.saved", lang));
      setShowForm(false);
      resetForm();
      fetchRecords();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCrossCheck = async () => {
    setIsCrossChecking(true);
    setCrossCheck(null);
    setError(null);

    try {
      const res = await fetch("/api/allergy-map", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ action: "cross-check", lang }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Cross-check failed");
      }

      const data = await res.json();
      setCrossCheck(data.crossCheck);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsCrossChecking(false);
    }
  };

  const resetForm = () => {
    setFormType("allergy");
    setFormTrigger("");
    setFormCategory("food");
    setFormSeverity("mild");
    setFormSymptoms([]);
    setFormDoctorDiagnosed(false);
    setFormNotes("");
  };

  const toggleSymptom = (s: string) => {
    setFormSymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const generateEmergencyCard = () => {
    const severeAllergies = records.filter(
      (r) => r.severity === "severe" || r.severity === "anaphylaxis"
    );
    const allAllergies = records.map((r) => r.trigger_name);

    const cardText = [
      "--- ALLERGY ALERT CARD ---",
      "",
      ...(severeAllergies.length > 0
        ? [
            "SEVERE/ANAPHYLAXIS:",
            ...severeAllergies.map((r) => `  !! ${r.trigger_name} (${r.severity})`),
            "",
          ]
        : []),
      "ALL ALLERGIES/INTOLERANCES:",
      ...allAllergies.map((a) => `  - ${a}`),
      "",
      "Generated by Phytotherapy.ai",
      new Date().toLocaleDateString(),
    ].join("\n");

    navigator.clipboard.writeText(cardText);
    setSuccess(tx("allergy.emergencyCardCopied", lang));
    setTimeout(() => setSuccess(null), 3000);
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
        <div className="rounded-xl border-2 border-dashed border-amber-200 bg-amber-50/50 p-12 text-center dark:border-amber-800 dark:bg-amber-950/20">
          <LogIn className="mx-auto mb-3 h-10 w-10 text-amber-400" />
          <p className="text-sm text-muted-foreground">{tx("allergy.loginRequired", lang)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-950">
          <ShieldAlert className="h-6 w-6 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
            {tx("allergy.title", lang)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {tx("allergy.subtitle", lang)}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mb-4 flex flex-wrap gap-2">
        <Button
          onClick={() => { setShowForm(!showForm); setSuccess(null); }}
          className="gap-2 bg-amber-600 hover:bg-amber-700 text-white"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          {tx("allergy.addNew", lang)}
        </Button>
        <Button
          variant="outline"
          onClick={handleCrossCheck}
          disabled={isCrossChecking || records.length === 0}
          className="gap-2"
          size="sm"
        >
          {isCrossChecking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          {tx("allergy.crossCheck", lang)}
        </Button>
        {records.length > 0 && (
          <Button
            variant="outline"
            onClick={generateEmergencyCard}
            className="gap-2"
            size="sm"
          >
            <Share2 className="h-4 w-4" />
            {tx("allergy.emergencyCard", lang)}
          </Button>
        )}
      </div>

      {/* Success */}
      {success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400">
          <CheckCircle2 className="mr-1 inline h-4 w-4" />
          {success}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50/30 p-4 dark:border-amber-800 dark:bg-amber-950/10">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold">{tx("allergy.addNew", lang)}</h3>
            <button onClick={() => { setShowForm(false); resetForm(); }}>
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          </div>

          <div className="space-y-3">
            {/* Type */}
            <div>
              <label className="mb-1 block text-xs font-medium">{tx("allergy.type", lang)}</label>
              <div className="flex gap-2">
                {(["allergy", "intolerance", "sensitivity"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setFormType(t)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      formType === t
                        ? "bg-amber-600 text-white"
                        : "bg-muted text-muted-foreground hover:bg-amber-100 dark:hover:bg-amber-900/30"
                    }`}
                  >
                    {t === "allergy" ? tx("allergy.allergyType", lang) : t === "intolerance" ? tx("allergy.intoleranceType", lang) : tx("allergy.sensitivityType", lang)}
                  </button>
                ))}
              </div>
            </div>

            {/* Trigger */}
            <div>
              <label className="mb-1 block text-xs font-medium">{tx("allergy.triggerName", lang)}</label>
              <input
                type="text"
                value={formTrigger}
                onChange={(e) => setFormTrigger(e.target.value)}
                placeholder={tx("allergy.triggerPlaceholder", lang)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>

            {/* Category */}
            <div>
              <label className="mb-1 block text-xs font-medium">{tx("allergy.category", lang)}</label>
              <div className="flex gap-2">
                {(["food", "medication", "environmental", "supplement"] as const).map((c) => {
                  const Icon = CATEGORY_ICONS[c] || Wind;
                  const labels: Record<string, string> = {
                    food: tx("allergy.food", lang),
                    medication: tx("allergy.medication", lang),
                    environmental: tx("allergy.environmental", lang),
                    supplement: tx("allergy.supplement", lang),
                  };
                  return (
                    <button
                      key={c}
                      onClick={() => setFormCategory(c)}
                      className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        formCategory === c
                          ? "bg-amber-600 text-white"
                          : "bg-muted text-muted-foreground hover:bg-amber-100 dark:hover:bg-amber-900/30"
                      }`}
                    >
                      <Icon className="h-3 w-3" />
                      {labels[c]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Severity */}
            <div>
              <label className="mb-1 block text-xs font-medium">{tx("allergy.severity", lang)}</label>
              <div className="flex gap-2">
                {(["mild", "moderate", "severe", "anaphylaxis"] as const).map((s) => {
                  const cfg = SEVERITY_CONFIG[s];
                  return (
                    <button
                      key={s}
                      onClick={() => setFormSeverity(s)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        formSeverity === s
                          ? cfg.color + " ring-2 ring-amber-400"
                          : "bg-muted text-muted-foreground hover:bg-amber-100 dark:hover:bg-amber-900/30"
                      }`}
                    >
                      {lang === "tr" ? cfg.labelTr : cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Symptoms */}
            <div>
              <label className="mb-1 block text-xs font-medium">
                {tx("common.symptoms", lang)}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {commonSymptoms.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggleSymptom(s)}
                    className={`rounded-full px-2.5 py-1 text-xs transition-colors ${
                      formSymptoms.includes(s)
                        ? "bg-amber-600 text-white"
                        : "bg-muted text-muted-foreground hover:bg-amber-100 dark:hover:bg-amber-900/30"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Doctor Diagnosed */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFormDoctorDiagnosed(!formDoctorDiagnosed)}
                className={`h-5 w-5 rounded border-2 transition-colors ${
                  formDoctorDiagnosed
                    ? "border-amber-600 bg-amber-600"
                    : "border-muted-foreground"
                }`}
              >
                {formDoctorDiagnosed && <CheckCircle2 className="h-4 w-4 text-white" />}
              </button>
              <span className="text-xs">{tx("allergy.doctorDiagnosed", lang)}</span>
            </div>

            {/* Notes */}
            <div>
              <label className="mb-1 block text-xs font-medium">
                {tx("common.notes", lang)}
              </label>
              <textarea
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                rows={2}
                maxLength={500}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>

            {/* Save */}
            <Button
              onClick={handleSave}
              disabled={isSaving || !formTrigger.trim()}
              className="w-full gap-2 bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {tx("allergy.save", lang)}
            </Button>
          </div>
        </div>
      )}

      {/* Cross-Check Results */}
      {crossCheck && (
        <div className="mb-6 space-y-3">
          {crossCheck.conflicts.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50/50 p-4 dark:border-red-800 dark:bg-red-950/20">
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-red-700 dark:text-red-400">
                <AlertTriangle className="h-3.5 w-3.5" />
                {tx("allergy.conflictsFound", lang)}
              </h3>
              <div className="space-y-2">
                {crossCheck.conflicts.map((c, i) => (
                  <div key={i} className="rounded-lg bg-white/50 p-3 dark:bg-black/20">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-sm font-medium">{c.allergy}</span>
                      <span className="text-xs text-muted-foreground">vs</span>
                      <span className="text-sm font-medium">{c.conflictsWith}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        c.risk === "high" ? "bg-red-200 text-red-800" : c.risk === "moderate" ? "bg-amber-200 text-amber-800" : "bg-green-200 text-green-800"
                      }`}>
                        {c.risk}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{c.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {crossCheck.warnings.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-800 dark:bg-amber-950/20">
              <h3 className="mb-2 text-sm font-semibold text-amber-700 dark:text-amber-400">
                {tx("allergy.warnings", lang)}
              </h3>
              {crossCheck.warnings.map((w, i) => (
                <p key={i} className="text-xs text-amber-600 dark:text-amber-300">
                  {w.message}
                </p>
              ))}
            </div>
          )}

          <div className="rounded-lg border p-3">
            <p className="text-sm">{crossCheck.summary}</p>
          </div>
        </div>
      )}

      {/* Records List */}
      <div className="mb-4">
        <h3 className="mb-3 text-sm font-semibold">{tx("allergy.myAllergies", lang)}</h3>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
          </div>
        ) : records.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed p-8 text-center">
            <ShieldAlert className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {tx("allergy.noRecords", lang)}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {records.map((r) => {
              const sevCfg = SEVERITY_CONFIG[r.severity] || SEVERITY_CONFIG.mild;
              const CatIcon = CATEGORY_ICONS[r.category] || AlertTriangle;
              return (
                <div key={r.id} className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/30">
                  <div className="rounded-lg bg-amber-50 p-2 dark:bg-amber-950/30">
                    <CatIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{r.trigger_name}</p>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${sevCfg.color}`}>
                        {lang === "tr" ? sevCfg.labelTr : sevCfg.label}
                      </span>
                      {r.diagnosed_by_doctor && (
                        <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                          {tx("allergy.doctor", lang)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {r.type} &middot; {r.category}
                      {r.symptoms && r.symptoms.length > 0 && ` &middot; ${r.symptoms.join(", ")}`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Disclaimer */}
      <p className="mt-6 text-center text-xs text-muted-foreground">
        {tx("disclaimer.tool", lang)}
      </p>
    </div>
  );
}
