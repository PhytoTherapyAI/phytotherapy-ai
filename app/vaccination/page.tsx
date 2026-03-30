"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Syringe,
  Loader2,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  LogIn,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface VaccinationRecord {
  id: string;
  vaccine_name: string;
  vaccine_type: string;
  dose_number: number;
  date_administered: string;
  next_due_date: string | null;
  provider: string | null;
  notes: string | null;
}

interface Recommendation {
  vaccine: string;
  reason: string;
  priority: "high" | "medium" | "low";
  schedule: string;
}

interface RecommendationResult {
  recommendations: Recommendation[];
  notes: string;
}

const VACCINE_TYPES = [
  "flu",
  "covid",
  "hepatitis_b",
  "tetanus",
  "hpv",
  "pneumococcal",
  "zona",
  "other",
] as const;

export default function VaccinationPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();

  const [vaccinations, setVaccinations] = useState<VaccinationRecord[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form state
  const [vaccineName, setVaccineName] = useState("");
  const [vaccineType, setVaccineType] = useState<string>("flu");
  const [doseNumber, setDoseNumber] = useState("1");
  const [dateAdministered, setDateAdministered] = useState("");
  const [nextDueDate, setNextDueDate] = useState("");
  const [provider, setProvider] = useState("");
  const [notes, setNotes] = useState("");

  // AI recommendations
  const [recommendations, setRecommendations] = useState<RecommendationResult | null>(null);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const [showRecs, setShowRecs] = useState(false);

  const fetchVaccinations = useCallback(async () => {
    if (!isAuthenticated || !session?.access_token) {
      setIsLoadingList(false);
      return;
    }

    try {
      const res = await fetch("/api/vaccination", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setVaccinations(data.vaccinations || []);
      }
    } catch {
      // Silent fail
    } finally {
      setIsLoadingList(false);
    }
  }, [isAuthenticated, session?.access_token]);

  useEffect(() => {
    fetchVaccinations();
  }, [fetchVaccinations]);

  const handleSave = async () => {
    if (!vaccineName.trim() || !dateAdministered) {
      setError(tx("vacc.nameRequired", lang));
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/vaccination", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          vaccine_name: vaccineName.trim(),
          vaccine_type: vaccineType,
          dose_number: parseInt(doseNumber) || 1,
          date_administered: dateAdministered,
          next_due_date: nextDueDate || null,
          provider: provider.trim() || null,
          notes: notes.trim() || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }

      setSuccessMsg(tx("vacc.saved", lang));
      setTimeout(() => setSuccessMsg(null), 3000);

      // Reset form
      setVaccineName("");
      setVaccineType("flu");
      setDoseNumber("1");
      setDateAdministered("");
      setNextDueDate("");
      setProvider("");
      setNotes("");
      setShowForm(false);

      await fetchVaccinations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/vaccination?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.ok) {
        await fetchVaccinations();
      }
    } catch {
      // Silent
    } finally {
      setIsDeleting(null);
    }
  };

  const handleGetRecommendations = async () => {
    setIsLoadingRecs(true);
    try {
      const res = await fetch("/api/vaccination", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ action: "recommendations", lang }),
      });
      if (res.ok) {
        const data = await res.json();
        setRecommendations(data);
        setShowRecs(true);
      }
    } catch {
      // Silent
    } finally {
      setIsLoadingRecs(false);
    }
  };

  const getStatusColor = (nextDue: string | null) => {
    if (!nextDue) return "green";
    const due = new Date(nextDue);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "red";
    if (diffDays <= 30) return "yellow";
    return "green";
  };

  const getStatusLabel = (nextDue: string | null) => {
    const color = getStatusColor(nextDue);
    if (color === "red") return tx("vacc.overdue", lang);
    if (color === "yellow") return tx("vacc.dueSoon", lang);
    return tx("vacc.current", lang);
  };

  const statusStyles: Record<string, string> = {
    red: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400",
    yellow: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400",
    green: "bg-green-100 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400",
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-green-50 p-3 dark:bg-green-950">
            <Syringe className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
              {tx("vacc.title", lang)}
            </h1>
            <p className="text-sm text-muted-foreground">{tx("vacc.subtitle", lang)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50/50 p-4 text-sm text-green-800 dark:border-green-800 dark:bg-green-950/20 dark:text-green-300">
          <LogIn className="h-4 w-4" />
          {tx("vacc.loginRequired", lang)}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-green-50 p-3 dark:bg-green-950">
          <Syringe className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
            {tx("vacc.title", lang)}
          </h1>
          <p className="text-sm text-muted-foreground">{tx("vacc.subtitle", lang)}</p>
        </div>
      </div>

      {/* Success Message */}
      {successMsg && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400">
          <CheckCircle2 className="h-4 w-4" />
          {successMsg}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Add Button */}
      <div className="mb-4 flex gap-2">
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gap-2 bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="h-4 w-4" />
          {tx("vacc.addVaccine", lang)}
        </Button>
        <Button
          variant="outline"
          onClick={handleGetRecommendations}
          disabled={isLoadingRecs}
          className="gap-2"
        >
          {isLoadingRecs ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {isLoadingRecs ? tx("vacc.gettingRecommendations", lang) : tx("vacc.getRecommendations", lang)}
        </Button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="mb-6 rounded-lg border bg-card p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium">{tx("vacc.vaccineName", lang)}</label>
              <input
                type="text"
                value={vaccineName}
                onChange={(e) => setVaccineName(e.target.value)}
                placeholder={tx("vacc.vaccineNamePlaceholder", lang)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">{tx("vacc.vaccineType", lang)}</label>
              <select
                value={vaccineType}
                onChange={(e) => setVaccineType(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-400"
              >
                {VACCINE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {tx(`vacc.${type}`, lang)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium">{tx("vacc.doseNumber", lang)}</label>
              <input
                type="number"
                min="1"
                max="10"
                value={doseNumber}
                onChange={(e) => setDoseNumber(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">{tx("vacc.dateAdmin", lang)}</label>
              <input
                type="date"
                value={dateAdministered}
                onChange={(e) => setDateAdministered(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">{tx("vacc.nextDue", lang)}</label>
              <input
                type="date"
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium">{tx("vacc.provider", lang)}</label>
              <input
                type="text"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                placeholder={tx("vacc.providerPlaceholder", lang)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">{tx("vacc.notes", lang)}</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={tx("common.notes", lang)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-400"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {isSaving ? "..." : tx("vacc.addVaccine", lang)}
            </Button>
            <Button variant="ghost" onClick={() => setShowForm(false)}>
              {tx("common.close", lang)}
            </Button>
          </div>
        </div>
      )}

      {/* AI Recommendations */}
      {recommendations && showRecs && (
        <div className="mb-6 rounded-lg border border-purple-200 bg-purple-50/30 dark:border-purple-800 dark:bg-purple-950/20">
          <button
            onClick={() => setShowRecs(!showRecs)}
            className="flex w-full items-center justify-between px-4 py-3"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-semibold">{tx("vacc.recommendations", lang)}</span>
            </div>
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          </button>
          <div className="px-4 pb-4 space-y-2">
            {recommendations.recommendations?.map((rec, i) => (
              <div
                key={i}
                className={`rounded-lg border p-3 ${
                  rec.priority === "high"
                    ? "border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20"
                    : rec.priority === "medium"
                    ? "border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20"
                    : "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20"
                }`}
              >
                <p className="text-sm font-medium">{rec.vaccine}</p>
                <p className="text-xs text-muted-foreground">{rec.reason}</p>
                <p className="mt-1 text-xs">
                  <Clock className="mr-1 inline h-3 w-3" />
                  {rec.schedule}
                </p>
              </div>
            ))}
            {recommendations.notes && (
              <p className="text-xs text-muted-foreground italic">{recommendations.notes}</p>
            )}
          </div>
        </div>
      )}

      {/* Vaccination List */}
      <h2 className="mb-3 text-sm font-semibold">{tx("vacc.myVaccines", lang)}</h2>

      {isLoadingList ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-green-600" />
        </div>
      ) : vaccinations.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          <Syringe className="mx-auto mb-2 h-8 w-8 opacity-30" />
          {tx("vacc.noVaccines", lang)}
        </div>
      ) : (
        <div className="space-y-2">
          {vaccinations.map((v) => {
            const color = getStatusColor(v.next_due_date);
            return (
              <div
                key={v.id}
                className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{v.vaccine_name}</p>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusStyles[color]}`}>
                      {getStatusLabel(v.next_due_date)}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>{tx("vacc.dose", lang)} {v.dose_number}</span>
                    <span>{v.date_administered}</span>
                    {v.next_due_date && (
                      <span className={color === "red" ? "text-red-500 font-medium" : ""}>
                        {tx("vacc.nextDue", lang)}: {v.next_due_date}
                      </span>
                    )}
                    {v.provider && <span>{v.provider}</span>}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(v.id)}
                  disabled={isDeleting === v.id}
                  className="ml-2 rounded p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                >
                  {isDeleting === v.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Disclaimer */}
      <p className="mt-6 text-center text-xs text-muted-foreground">
        {tx("disclaimer.tool", lang)}
      </p>
    </div>
  );
}
