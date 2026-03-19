"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Beaker,
  Clock,
  Pill,
  Info,
  ShieldAlert,
  BookOpen,
  Plus,
  Loader2,
  Check,
} from "lucide-react";
import { SafetyBadge } from "./SafetyBadge";
import { useLang } from "@/components/layout/language-toggle";
import { useAuth } from "@/lib/auth-context";
import { tx } from "@/lib/translations";
import { createBrowserClient } from "@/lib/supabase";
import type { InteractionResult as InteractionResultType } from "@/lib/interaction-engine";

interface InteractionResultProps {
  result: InteractionResultType;
}

export function InteractionResult({ result }: InteractionResultProps) {
  const { lang } = useLang()
  const { user, isAuthenticated } = useAuth()

  const addToSupplements = async (herbName: string, dose: string | undefined, safety: string) => {
    if (!user) return false
    try {
      const supabase = createBrowserClient()
      // Check if already exists
      const { data: existing } = await supabase
        .from("calendar_events")
        .select("id")
        .eq("user_id", user.id)
        .eq("event_type", "supplement")
        .ilike("title", `%${herbName}%`)
        .limit(1)

      if (existing && existing.length > 0) return false // Already exists

      await supabase.from("calendar_events").insert({
        user_id: user.id,
        event_type: "supplement",
        title: herbName,
        description: dose || "",
        event_date: new Date().toISOString().split("T")[0],
        recurrence: "daily",
        metadata: {
          safety,
          dose: dose || "",
          frequency: "daily",
          addedFromInteraction: true,
        },
      })
      return true
    } catch {
      return false
    }
  }

  // Emergency state
  if (result.isEmergency) {
    return (
      <div className="rounded-xl border-2 border-red-500 bg-red-50 p-6 dark:bg-red-950/30">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-red-500 p-2">
            <ShieldAlert className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-red-800 dark:text-red-300" style={{ fontFamily: '"DM Sans", system-ui, sans-serif', fontWeight: 600 }}>
              {tx('safety.emergencyWarning', lang)}
            </h3>
            <p className="mt-2 text-red-700 dark:text-red-400">
              {result.emergencyMessage}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const safeHerbs = result.recommendations.filter((r) => r.safety === "safe");
  const cautionHerbs = result.recommendations.filter((r) => r.safety === "caution");
  const dangerousHerbs = result.recommendations.filter((r) => r.safety === "dangerous");

  return (
    <div className="space-y-6">
      {/* Medications Analyzed */}
      <div className="rounded-xl border bg-card p-5">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground" style={{ fontFamily: '"DM Sans", system-ui, sans-serif', fontWeight: 600 }}>
          <Pill className="h-4 w-4" />
          {tx('ir.medsAnalyzed', lang)}
        </h3>
        <div className="flex flex-wrap gap-2">
          {result.medicationsAnalyzed.map((med, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm"
            >
              <span className="font-medium">{med.brandName}</span>
              {med.genericName !== med.brandName && (
                <span className="text-muted-foreground">({med.genericName})</span>
              )}
              {med.verified ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              ) : (
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              )}
            </span>
          ))}
        </div>
        {result.medicationsAnalyzed.some((m) => !m.verified) && (
          <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
            <AlertTriangle className="mr-1 inline h-3 w-3" />
            {tx('ir.medsNotFound', lang)}
          </p>
        )}
      </div>

      {/* Profile Warnings */}
      {result.profileWarnings.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 dark:border-amber-800 dark:bg-amber-950/20">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400" style={{ fontFamily: '"DM Sans", system-ui, sans-serif', fontWeight: 600 }}>
            <ShieldAlert className="h-4 w-4" />
            {tx('ir.profileAlerts', lang)}
          </h3>
          <ul className="space-y-2">
            {result.profileWarnings.map((warning, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400"
              >
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Dangerous Herbs */}
      {dangerousHerbs.length > 0 && (
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-red-700 dark:text-red-400" style={{ fontFamily: '"DM Sans", system-ui, sans-serif', fontWeight: 600 }}>
            <XCircle className="h-5 w-5" />
            {tx('ir.avoidThese', lang)} ({dangerousHerbs.length})
          </h3>
          {dangerousHerbs.map((herb, i) => (
            <HerbCard key={i} herb={herb} />
          ))}
        </div>
      )}

      {/* Caution Herbs */}
      {cautionHerbs.length > 0 && (
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-amber-700 dark:text-amber-400" style={{ fontFamily: '"DM Sans", system-ui, sans-serif', fontWeight: 600 }}>
            <AlertTriangle className="h-5 w-5" />
            {tx('ir.useWithCaution', lang)} ({cautionHerbs.length})
          </h3>
          {cautionHerbs.map((herb, i) => (
            <HerbCard key={i} herb={herb} showAdd={isAuthenticated} onAdd={addToSupplements} />
          ))}
        </div>
      )}

      {/* Safe Herbs */}
      {safeHerbs.length > 0 && (
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-primary" style={{ fontFamily: '"DM Sans", system-ui, sans-serif', fontWeight: 600 }}>
            <CheckCircle2 className="h-5 w-5" />
            {tx('ir.safeAlternatives', lang)} ({safeHerbs.length})
          </h3>
          {safeHerbs.map((herb, i) => (
            <HerbCard key={i} herb={herb} showAdd={isAuthenticated} onAdd={addToSupplements} />
          ))}
        </div>
      )}

      {/* General Advice */}
      {result.generalAdvice && (
        <div className="rounded-xl border bg-blue-50/50 p-5 dark:bg-blue-950/20">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-400" style={{ fontFamily: '"DM Sans", system-ui, sans-serif', fontWeight: 600 }}>
            <BookOpen className="h-4 w-4" />
            {tx('ir.generalAdvice', lang)}
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-300">
            {result.generalAdvice}
          </p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950/30">
        <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
          {result.disclaimer}
        </p>
      </div>
    </div>
  );
}

// ============================================
// HerbCard Sub-Component
// ============================================

interface HerbCardProps {
  herb: InteractionResultType["recommendations"][0];
  showAdd?: boolean;
  onAdd?: (name: string, dose: string | undefined, safety: string) => Promise<boolean>;
}

function HerbCard({ herb, showAdd, onAdd }: HerbCardProps) {
  const { lang } = useLang()
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const tr = lang === "tr"

  const borderColor =
    herb.safety === "dangerous"
      ? "border-red-200 dark:border-red-800"
      : herb.safety === "caution"
        ? "border-amber-200 dark:border-amber-800"
        : "border-primary/20";

  const handleAdd = async () => {
    if (!onAdd || adding || added) return
    setAdding(true)
    const ok = await onAdd(herb.herb, herb.dosage || undefined, herb.safety)
    setAdding(false)
    if (ok) setAdded(true)
  }

  return (
    <div className={`rounded-xl border ${borderColor} bg-card p-5 transition-shadow hover:shadow-md`}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <h4 className="text-lg font-semibold" style={{ fontFamily: '"DM Sans", system-ui, sans-serif', fontWeight: 600 }}>{herb.herb}</h4>
        <SafetyBadge safety={herb.safety} />
      </div>

      <p className="mb-3 text-sm text-muted-foreground">{herb.reason}</p>

      {/* Mechanism */}
      {herb.mechanism && (
        <div className="mb-3 flex items-start gap-2 rounded-lg bg-muted/50 px-3 py-2">
          <Beaker className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {tx('ir.mechanism', lang)}
            </span>
            <p className="text-sm">{herb.mechanism}</p>
          </div>
        </div>
      )}

      {/* Interactions */}
      {herb.interactions.length > 0 && (
        <div className="mb-3">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {tx('ir.interactions', lang)}
          </span>
          <ul className="space-y-1">
            {herb.interactions.map((interaction, i) => (
              <li
                key={i}
                className="flex items-start gap-1.5 text-sm"
              >
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                {interaction}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Dosage & Duration (only for safe/caution) */}
      {herb.safety !== "dangerous" && (herb.dosage || herb.duration) && (
        <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {herb.dosage && (
            <div className="flex items-start gap-2 rounded-lg bg-primary/10 px-3 py-2">
              <Pill className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <span className="text-xs font-medium uppercase tracking-wide text-primary">
                  {tx('ir.dosage', lang)}
                </span>
                <p className="text-sm font-medium text-primary">
                  {herb.dosage}
                </p>
              </div>
            </div>
          )}
          {herb.duration && (
            <div className="flex items-start gap-2 rounded-lg bg-blue-50 px-3 py-2 dark:bg-blue-950/30">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
              <div>
                <span className="text-xs font-medium uppercase tracking-wide text-blue-700 dark:text-blue-400">
                  {tx('ir.maxDuration', lang)}
                </span>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  {herb.duration}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add to Supplements button (safe/caution only) */}
      {showAdd && herb.safety !== "dangerous" && (
        <button
          onClick={handleAdd}
          disabled={adding || added}
          className={`mb-3 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
            added
              ? "bg-primary/10 text-primary border border-primary/30"
              : "border border-dashed border-primary/40 text-primary hover:bg-primary/5 hover:border-primary active:scale-[0.98]"
          }`}
        >
          {adding ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : added ? (
            <Check className="h-4 w-4" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {added
            ? (tr ? "Takviyelerine eklendi!" : "Added to your supplements!")
            : (tr ? "Takviyelerime ekle" : "Add to my supplements")
          }
        </button>
      )}

      {/* Sources */}
      {herb.sources.length > 0 && (
        <div>
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {tx('ir.sources', lang)}
          </span>
          <div className="flex flex-wrap gap-2">
            {herb.sources.map((source, i) => (
              <a
                key={i}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-md border bg-muted/50 px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <ExternalLink className="h-3 w-3" />
                {source.title.length > 60
                  ? source.title.substring(0, 57) + "..."
                  : source.title}
                {source.year && ` (${source.year})`}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
