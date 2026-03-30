// © 2026 Phytotherapy.ai — All Rights Reserved
"use client";

import { useState } from "react";
import {
  Plane,
  Loader2,
  Syringe,
  Pill,
  AlertTriangle,
  ShoppingBag,
  Clock,
  Phone,
  ChevronDown,
  ChevronUp,
  Shield,
  Lightbulb,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface VaccinationItem {
  name: string;
  reason: string;
  timing: string;
}

interface MedicationPlanItem {
  medication: string;
  adjustment: string;
  notes: string;
}

interface RiskItem {
  risk: string;
  severity: "high" | "moderate" | "low";
  description: string;
  prevention: string;
}

interface PharmacyItem {
  item: string;
  reason: string;
}

interface JetLagItem {
  day: string;
  advice: string;
}

interface EmergencyItem {
  service: string;
  number: string;
}

interface TravelResult {
  vaccinations: {
    required: VaccinationItem[];
    recommended: VaccinationItem[];
  };
  medicationPlan: MedicationPlanItem[];
  risks: RiskItem[];
  pharmacyChecklist: PharmacyItem[];
  jetLagPlan: JetLagItem[];
  emergencyNumbers: EmergencyItem[];
  generalTips: string[];
}

export default function TravelHealthPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TravelResult | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    vaccinations: true,
    medicationPlan: true,
    risks: true,
    pharmacy: true,
    jetLag: false,
    emergency: true,
    tips: false,
  });

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGenerate = async () => {
    if (!destination.trim()) {
      setError(tx("travel.noDestination", lang));
      return;
    }
    if (!startDate || !endDate) {
      setError(tx("travel.noDates", lang));
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (isAuthenticated && session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const res = await fetch("/api/travel-health", {
        method: "POST",
        headers,
        body: JSON.stringify({
          destination: destination.trim(),
          startDate,
          endDate,
          lang,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to get advice");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const severityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800";
      case "moderate":
        return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800";
      default:
        return "bg-green-100 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800";
    }
  };

  const SectionHeader = ({ title, icon: Icon, sectionKey, count }: { title: string; icon: React.ElementType; sectionKey: string; count?: number }) => (
    <button
      onClick={() => toggleSection(sectionKey)}
      className="flex w-full items-center justify-between rounded-t-lg border-b bg-sky-50/50 px-4 py-3 text-left dark:bg-sky-950/20"
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-sky-600 dark:text-sky-400" />
        <span className="text-sm font-semibold">{title}</span>
        {count !== undefined && (
          <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700 dark:bg-sky-900 dark:text-sky-300">
            {count}
          </span>
        )}
      </div>
      {expandedSections[sectionKey] ? (
        <ChevronUp className="h-4 w-4 text-muted-foreground" />
      ) : (
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      )}
    </button>
  );

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-sky-50 p-3 dark:bg-sky-950">
          <Plane className="h-6 w-6 text-sky-600 dark:text-sky-400" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
            {tx("travel.title", lang)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {tx("travel.subtitle", lang)}
          </p>
        </div>
      </div>

      {/* Guest notice */}
      {!isAuthenticated && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50/50 p-3 text-xs text-sky-800 dark:border-sky-800 dark:bg-sky-950/20 dark:text-sky-300">
          <LogIn className="h-3.5 w-3.5 shrink-0" />
          {tx("travel.loginRequired", lang)}
        </div>
      )}

      {!result && (
        <>
          {/* Destination */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium">
              {tx("travel.destination", lang)}
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder={tx("travel.destinationPlaceholder", lang)}
              maxLength={100}
              className="w-full rounded-lg border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
            />
          </div>

          {/* Travel Dates */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium">
              {tx("travel.dates", lang)}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  {tx("travel.startDate", lang)}
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  {tx("travel.endDate", lang)}
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
                />
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isLoading || !destination.trim()}
            className="w-full gap-2 bg-sky-600 hover:bg-sky-700 text-white"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {tx("travel.generating", lang)}
              </>
            ) : (
              <>
                <Plane className="h-4 w-4" />
                {tx("travel.generate", lang)}
              </>
            )}
          </Button>
        </>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Vaccinations */}
          {(result.vaccinations?.required?.length > 0 || result.vaccinations?.recommended?.length > 0) && (
            <div className="overflow-hidden rounded-lg border">
              <SectionHeader
                title={tx("travel.vaccinations", lang)}
                icon={Syringe}
                sectionKey="vaccinations"
                count={(result.vaccinations?.required?.length || 0) + (result.vaccinations?.recommended?.length || 0)}
              />
              {expandedSections.vaccinations && (
                <div className="p-4 space-y-3">
                  {result.vaccinations.required?.length > 0 && (
                    <div>
                      <h4 className="mb-2 flex items-center gap-1 text-xs font-bold text-red-600 dark:text-red-400">
                        <Shield className="h-3 w-3" />
                        {tx("travel.required", lang)}
                      </h4>
                      {result.vaccinations.required.map((v, i) => (
                        <div key={i} className="mb-2 rounded-lg border border-red-200 bg-red-50/50 p-3 dark:border-red-900 dark:bg-red-950/20">
                          <p className="text-sm font-medium">{v.name}</p>
                          <p className="text-xs text-muted-foreground">{v.reason}</p>
                          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                            <Clock className="mr-1 inline h-3 w-3" />{v.timing}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  {result.vaccinations.recommended?.length > 0 && (
                    <div>
                      <h4 className="mb-2 flex items-center gap-1 text-xs font-bold text-sky-600 dark:text-sky-400">
                        <Shield className="h-3 w-3" />
                        {tx("travel.recommended", lang)}
                      </h4>
                      {result.vaccinations.recommended.map((v, i) => (
                        <div key={i} className="mb-2 rounded-lg border bg-sky-50/30 p-3 dark:bg-sky-950/10">
                          <p className="text-sm font-medium">{v.name}</p>
                          <p className="text-xs text-muted-foreground">{v.reason}</p>
                          <p className="mt-1 text-xs text-sky-600 dark:text-sky-400">
                            <Clock className="mr-1 inline h-3 w-3" />{v.timing}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Medication Plan */}
          {result.medicationPlan?.length > 0 && (
            <div className="overflow-hidden rounded-lg border">
              <SectionHeader
                title={tx("travel.medicationPlan", lang)}
                icon={Pill}
                sectionKey="medicationPlan"
                count={result.medicationPlan.length}
              />
              {expandedSections.medicationPlan && (
                <div className="p-4 space-y-2">
                  {result.medicationPlan.map((m, i) => (
                    <div key={i} className="rounded-lg border p-3">
                      <p className="text-sm font-medium">{m.medication}</p>
                      <p className="text-xs text-muted-foreground">{m.adjustment}</p>
                      {m.notes && (
                        <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">{m.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Regional Risks */}
          {result.risks?.length > 0 && (
            <div className="overflow-hidden rounded-lg border">
              <SectionHeader
                title={tx("travel.risks", lang)}
                icon={AlertTriangle}
                sectionKey="risks"
                count={result.risks.length}
              />
              {expandedSections.risks && (
                <div className="p-4 space-y-2">
                  {result.risks.map((r, i) => (
                    <div key={i} className={`rounded-lg border p-3 ${severityColor(r.severity)}`}>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{r.risk}</p>
                        <span className="rounded-full px-2 py-0.5 text-xs font-medium">
                          {tx(`travel.severity.${r.severity}`, lang)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs opacity-80">{r.description}</p>
                      <p className="mt-1 text-xs font-medium">
                        <Shield className="mr-1 inline h-3 w-3" />{r.prevention}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pharmacy Checklist */}
          {result.pharmacyChecklist?.length > 0 && (
            <div className="overflow-hidden rounded-lg border">
              <SectionHeader
                title={tx("travel.pharmacy", lang)}
                icon={ShoppingBag}
                sectionKey="pharmacy"
                count={result.pharmacyChecklist.length}
              />
              {expandedSections.pharmacy && (
                <div className="p-4 space-y-1">
                  {result.pharmacyChecklist.map((p, i) => (
                    <div key={i} className="flex items-start gap-2 rounded p-2 hover:bg-muted/30">
                      <input type="checkbox" className="mt-1 h-3.5 w-3.5 rounded accent-sky-600" />
                      <div>
                        <p className="text-sm font-medium">{p.item}</p>
                        <p className="text-xs text-muted-foreground">{p.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Jet Lag Plan */}
          {result.jetLagPlan?.length > 0 && (
            <div className="overflow-hidden rounded-lg border">
              <SectionHeader
                title={tx("travel.jetLag", lang)}
                icon={Clock}
                sectionKey="jetLag"
                count={result.jetLagPlan.length}
              />
              {expandedSections.jetLag && (
                <div className="p-4 space-y-2">
                  {result.jetLagPlan.map((j, i) => (
                    <div key={i} className="flex gap-3 rounded-lg border p-3">
                      <span className="shrink-0 rounded bg-sky-100 px-2 py-1 text-xs font-bold text-sky-700 dark:bg-sky-900 dark:text-sky-300">
                        {j.day}
                      </span>
                      <p className="text-sm">{j.advice}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Emergency Numbers */}
          {result.emergencyNumbers?.length > 0 && (
            <div className="overflow-hidden rounded-lg border">
              <SectionHeader
                title={tx("travel.emergency", lang)}
                icon={Phone}
                sectionKey="emergency"
                count={result.emergencyNumbers.length}
              />
              {expandedSections.emergency && (
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-2">
                    {result.emergencyNumbers.map((e, i) => (
                      <div key={i} className="rounded-lg border border-red-200 bg-red-50/30 p-3 text-center dark:border-red-900 dark:bg-red-950/20">
                        <p className="text-xs text-muted-foreground">{e.service}</p>
                        <p className="text-lg font-bold text-red-600 dark:text-red-400">{e.number}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* General Tips */}
          {result.generalTips?.length > 0 && (
            <div className="overflow-hidden rounded-lg border">
              <SectionHeader
                title={tx("travel.generalTips", lang)}
                icon={Lightbulb}
                sectionKey="tips"
                count={result.generalTips.length}
              />
              {expandedSections.tips && (
                <div className="p-4 space-y-1">
                  {result.generalTips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <span className="mt-1 text-sky-500">•</span>
                      <p>{tip}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* New Search */}
          <Button
            variant="outline"
            onClick={() => {
              setResult(null);
              setDestination("");
              setStartDate("");
              setEndDate("");
            }}
            className="w-full"
          >
            {tx("travel.newSearch", lang)}
          </Button>
        </div>
      )}

      {/* Footer Disclaimer */}
      <p className="mt-6 text-center text-xs text-muted-foreground">
        {tx("disclaimer.tool", lang)}
      </p>
    </div>
  );
}
