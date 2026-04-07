// © 2026 Doctopal — All Rights Reserved
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Pill, Loader2 } from "lucide-react";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import type { OnboardingData } from "../OnboardingWizard";

interface DrugSuggestion {
  brandName: string;
  genericName: string;
}

interface Props {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

export function MedicationsStep({ data, updateData }: Props) {
  const { lang } = useLang();
  const [brandName, setBrandName] = useState("");
  const [genericName, setGenericName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");

  // Autocomplete state for brand name
  const [brandSuggestions, setBrandSuggestions] = useState<DrugSuggestion[]>([]);
  const [showBrandSuggestions, setShowBrandSuggestions] = useState(false);
  const [isBrandSearching, setIsBrandSearching] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const brandInputRef = useRef<HTMLInputElement>(null);
  const brandDropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch drug suggestions
  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setBrandSuggestions([]);
      setShowBrandSuggestions(false);
      return;
    }
    setIsBrandSearching(true);
    try {
      const res = await fetch(`/api/drug-search?q=${encodeURIComponent(query)}`);
      const results: DrugSuggestion[] = await res.json();
      setBrandSuggestions(results);
      setShowBrandSuggestions(results.length > 0);
      setHighlightIndex(-1);
    } catch {
      setBrandSuggestions([]);
      setShowBrandSuggestions(false);
    } finally {
      setIsBrandSearching(false);
    }
  }, []);

  // Debounced brand name search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(brandName.trim());
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [brandName, fetchSuggestions]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        brandDropdownRef.current &&
        !brandDropdownRef.current.contains(e.target as Node) &&
        brandInputRef.current &&
        !brandInputRef.current.contains(e.target as Node)
      ) {
        setShowBrandSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Common default dosages for well-known drugs
  const DEFAULT_DOSES: Record<string, { dosage: string; frequency: string }> = {
    "metformin": { dosage: "500mg", frequency: "2x daily" },
    "lisinopril": { dosage: "10mg", frequency: "1x daily" },
    "atorvastatin": { dosage: "20mg", frequency: "1x daily" },
    "omeprazole": { dosage: "20mg", frequency: "1x daily" },
    "amlodipine": { dosage: "5mg", frequency: "1x daily" },
    "losartan": { dosage: "50mg", frequency: "1x daily" },
    "levothyroxine": { dosage: "50mcg", frequency: "1x daily" },
    "metoprolol": { dosage: "50mg", frequency: "2x daily" },
    "simvastatin": { dosage: "20mg", frequency: "1x daily" },
    "warfarin": { dosage: "5mg", frequency: "1x daily" },
    "aspirin": { dosage: "100mg", frequency: "1x daily" },
    "ibuprofen": { dosage: "400mg", frequency: "3x daily" },
    "paracetamol": { dosage: "500mg", frequency: "3x daily" },
  };

  const selectSuggestion = (suggestion: DrugSuggestion) => {
    setBrandName(suggestion.brandName);
    if (suggestion.genericName && suggestion.genericName.toLowerCase() !== suggestion.brandName.toLowerCase()) {
      setGenericName(suggestion.genericName);
    }
    // Auto-fill default dosage if known
    const generic = (suggestion.genericName || suggestion.brandName).toLowerCase();
    const match = Object.entries(DEFAULT_DOSES).find(([key]) => generic.includes(key));
    if (match) {
      setDosage(match[1].dosage);
      setFrequency(match[1].frequency);
    }
    setBrandSuggestions([]);
    setShowBrandSuggestions(false);
  };

  const handleBrandKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showBrandSuggestions && brandSuggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightIndex((prev) => (prev < brandSuggestions.length - 1 ? prev + 1 : 0));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightIndex((prev) => (prev > 0 ? prev - 1 : brandSuggestions.length - 1));
        return;
      }
      if (e.key === "Enter" && highlightIndex >= 0) {
        e.preventDefault();
        selectSuggestion(brandSuggestions[highlightIndex]);
        return;
      }
      if (e.key === "Escape") {
        setShowBrandSuggestions(false);
        return;
      }
    }
  };

  const addMedication = () => {
    if (!brandName.trim() && !genericName.trim()) return;
    updateData({
      medications: [
        ...data.medications,
        {
          brand_name: brandName.trim(),
          generic_name: genericName.trim(),
          dosage: dosage.trim(),
          frequency: frequency.trim(),
        },
      ],
      no_medications: false,
    });
    setBrandName("");
    setGenericName("");
    setDosage("");
    setFrequency("");
    setBrandSuggestions([]);
    setShowBrandSuggestions(false);
  };

  const removeMedication = (index: number) => {
    updateData({
      medications: data.medications.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="no-meds"
          checked={data.no_medications}
          onCheckedChange={(checked) =>
            updateData({
              no_medications: checked === true,
              medications: checked === true ? [] : data.medications,
            })
          }
        />
        <Label htmlFor="no-meds" className="text-sm font-normal">
          {tx('onb.noMeds', lang)}
        </Label>
      </div>

      {!data.no_medications && (
        <>
          {/* Current medications list */}
          {data.medications.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                {tx('onb.yourMeds', lang)}
              </Label>
              {data.medications.map((med, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Pill className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium">
                        {med.brand_name || med.generic_name}
                        {med.brand_name && med.generic_name && (
                          <span className="ml-1 text-sm text-muted-foreground">
                            ({med.generic_name})
                          </span>
                        )}
                      </p>
                      {(med.dosage || med.frequency) && (
                        <div className="flex gap-2">
                          {med.dosage && <Badge variant="secondary">{med.dosage}</Badge>}
                          {med.frequency && <Badge variant="outline">{med.frequency}</Badge>}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeMedication(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Add medication form */}
          <div className="space-y-3 rounded-lg border border-dashed p-4">
            <p className="text-sm font-medium">{tx('onb.addMed', lang)}</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="brand" className="text-xs">{tx('onb.brandName', lang)}</Label>
                <div className="relative">
                  <Input
                    ref={brandInputRef}
                    id="brand"
                    placeholder={tx('onb.brandPlaceholder', lang)}
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    onKeyDown={handleBrandKeyDown}
                    onFocus={() => {
                      if (brandSuggestions.length > 0) setShowBrandSuggestions(true);
                    }}
                    autoComplete="off"
                  />
                  {isBrandSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                  {showBrandSuggestions && brandSuggestions.length > 0 && (
                    <div
                      ref={brandDropdownRef}
                      className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-lg border bg-background shadow-lg"
                    >
                      {brandSuggestions.map((s, i) => (
                        <button
                          key={`${s.brandName}-${i}`}
                          type="button"
                          onClick={() => selectSuggestion(s)}
                          className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-muted/50 ${
                            i === highlightIndex ? "bg-muted/50" : ""
                          }`}
                        >
                          <Pill className="h-3 w-3 shrink-0 text-primary" />
                          <span className="font-medium">{s.brandName}</span>
                          {s.genericName && s.genericName.toLowerCase() !== s.brandName.toLowerCase() && (
                            <span className="text-xs text-muted-foreground">({s.genericName})</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="generic" className="text-xs">{tx('onb.genericName', lang)}</Label>
                <Input
                  id="generic"
                  placeholder={tx('onb.genericPlaceholder', lang)}
                  value={genericName}
                  onChange={(e) => setGenericName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="dosage" className="text-xs">{tx('onb.dosageLabel', lang)}</Label>
                <Input
                  id="dosage"
                  placeholder={tx('onb.dosagePlaceholder', lang)}
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="freq" className="text-xs">{tx('onb.freqLabel', lang)}</Label>
                <Input
                  id="freq"
                  placeholder={tx('onb.freqPlaceholder', lang)}
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                />
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={addMedication}
              disabled={!brandName.trim() && !genericName.trim()}
            >
              <Plus className="mr-2 h-4 w-4" />
              {tx('onb.addMedBtn', lang)}
            </Button>
          </div>
        </>
      )}

      <p className="text-xs text-amber-600 dark:text-amber-400/80">
        {tx('onb.doseDisclaimer', lang)}
      </p>
      <p className="text-xs text-muted-foreground">
        {tx('onb.medPrivacy', lang)}
      </p>
    </div>
  );
}
