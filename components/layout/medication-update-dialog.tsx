// © 2026 DoctoPal — All Rights Reserved
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { createBrowserClient } from "@/lib/supabase";
import { useLang } from "@/components/layout/language-toggle";
import { useDailyMedCheck } from "@/lib/daily-med-check";
import { tx } from "@/lib/translations";
import type { UserMedication } from "@/lib/database.types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Pill, CheckCircle2, RefreshCw, Shield, AlertTriangle,
  Heart, ArrowRight, Loader2, Plus, X,
} from "lucide-react";

type DialogMode = "30day" | "15day" | "daily" | null;

interface DrugSuggestion {
  brandName: string;
  genericName: string;
}

export function MedicationUpdateDialog() {
  const router = useRouter();
  const pathname = usePathname();
  const { lang } = useLang();
  const {
    isAuthenticated, isLoading, profile,
    needsMedicationUpdate,
    refreshProfile,
  } = useAuth();
  const {
    needsDailyCheck, confirmDaily,
    needsOnboardingRefresh, confirmRefresh,
  } = useDailyMedCheck();

  const [open, setOpenState] = useState(false);
  // Wrapper: fire event when dialog closes so check-in knows it can open
  const setOpen = (val: boolean) => {
    setOpenState(val);
    if (!val) {
      setTimeout(() => window.dispatchEvent(new Event("med-dialog-closed")), 300);
    }
  };
  const [isConfirming, setIsConfirming] = useState(false);

  // 30-day mini onboarding state
  const [onboardingStep, setOnboardingStep] = useState(0); // 0=meds, 1=health
  const [medsConfirmed, setMedsConfirmed] = useState(false);
  const [healthConfirmed, setHealthConfirmed] = useState(false);

  // 15-day: embedded medication form state
  const [medications, setMedications] = useState<UserMedication[]>([]);
  const [loadingMeds, setLoadingMeds] = useState(false);
  const [brandName, setBrandName] = useState("");
  const [genericName, setGenericName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [brandSuggestions, setBrandSuggestions] = useState<DrugSuggestion[]>([]);
  const [showBrandSuggestions, setShowBrandSuggestions] = useState(false);
  const [isBrandSearching, setIsBrandSearching] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const brandInputRef = useRef<HTMLInputElement>(null);
  const brandDropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Determine which mode to show (priority: 30day > 15day > daily)
  // NEVER show on profile selection or onboarding routes
  const BLOCKED_ROUTES = ["/select-profile", "/onboarding", "/auth"];
  const isBlockedRoute = BLOCKED_ROUTES.some(r => pathname?.startsWith(r));

  const mode: DialogMode = (() => {
    if (isBlockedRoute) return null;
    if (!isAuthenticated || isLoading || !profile?.onboarding_complete) return null;
    if (needsOnboardingRefresh) return "30day";       // localStorage 30-day
    if (needsMedicationUpdate) return "15day";         // Supabase 15-day
    if (needsDailyCheck) return "daily";               // localStorage daily
    return null;
  })();

  const supabase = createBrowserClient();

  // Load medications when 15-day mode opens
  useEffect(() => {
    if (mode === "15day" && open && profile?.id) {
      setLoadingMeds(true);
      supabase
        .from("user_medications")
        .select("*")
        .eq("user_id", profile.id)
        .eq("is_active", true)
        .then(({ data }) => {
          setMedications(data || []);
          setLoadingMeds(false);
        });
    }
  }, [mode, open, profile?.id, supabase]);

  // Drug search autocomplete
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

  const selectSuggestion = (suggestion: DrugSuggestion) => {
    setBrandName(suggestion.brandName);
    if (suggestion.genericName && suggestion.genericName.toLowerCase() !== suggestion.brandName.toLowerCase()) {
      setGenericName(suggestion.genericName);
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

  const addMedication15Day = async () => {
    if (!brandName.trim() && !genericName.trim()) return;
    if (!profile?.id) return;
    try {
      const { data, error } = await supabase
        .from("user_medications")
        .insert({
          user_id: profile.id,
          brand_name: brandName.trim() || null,
          generic_name: genericName.trim() || null,
          dosage: dosage.trim() || null,
          frequency: frequency.trim() || null,
          is_active: true,
        })
        .select()
        .single();
      if (!error && data) {
        setMedications((prev) => [...prev, data as UserMedication]);
      }
    } catch (err) {
      console.error("Failed to add medication:", err);
    }
    setBrandName("");
    setGenericName("");
    setDosage("");
    setFrequency("");
    setBrandSuggestions([]);
    setShowBrandSuggestions(false);
  };

  const removeMedication15Day = async (medId: string) => {
    try {
      await supabase
        .from("user_medications")
        .update({ is_active: false })
        .eq("id", medId);
      setMedications((prev) => prev.filter((m) => m.id !== medId));
    } catch (err) {
      console.error("Failed to remove medication:", err);
    }
  };

  useEffect(() => {
    if (mode) {
      // Signal that med dialog is active — check-in should wait
      window.dispatchEvent(new Event("med-dialog-will-open"));
      const timer = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(timer);
    } else {
      setOpen(false);
    }
  }, [mode]);


  // Handle dialog close (X button)
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // daily mode: can be dismissed freely
      if (mode === "daily") {
        setOpen(false);
        return;
      }
      // 15-day and 30-day: mandatory, don't allow close
      return;
    }
    setOpen(newOpen);
  };

  // === 30-day: Complete mini onboarding ===
  const handle30DayComplete = async () => {
    setIsConfirming(true);
    try {
      await supabase
        .from("user_profiles")
        .update({ last_medication_update: new Date().toISOString() })
        .eq("id", profile!.id);
      confirmRefresh();
      await refreshProfile();
      setOpen(false);
      setOnboardingStep(0);
      setMedsConfirmed(false);
      setHealthConfirmed(false);
    } catch (err) {
      console.error("Failed to complete 30-day refresh:", err);
    } finally {
      setIsConfirming(false);
    }
  };

  // === 15-day: Confirm medications are reviewed ===
  const handle15DayConfirm = async () => {
    setIsConfirming(true);
    try {
      await supabase
        .from("user_profiles")
        .update({ last_medication_update: new Date().toISOString() })
        .eq("id", profile!.id);
      confirmDaily();
      await refreshProfile();
      setOpen(false);
    } catch (err) {
      console.error("Failed to update medication timestamp:", err);
    } finally {
      setIsConfirming(false);
    }
  };

  // === Daily: Quick confirm ===
  const handleDailyConfirm = async () => {
    setIsConfirming(true);
    try {
      await supabase
        .from("user_profiles")
        .update({ last_medication_update: new Date().toISOString() })
        .eq("id", profile!.id);
      confirmDaily();
      await refreshProfile();
      setOpen(false);
    } catch (err) {
      console.error("Failed to confirm daily check:", err);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleGoToProfile = () => {
    setOpen(false);
    router.push("/profile?tab=medications");
  };

  const handleGoToOnboarding = () => {
    setOpen(false);
    router.push("/onboarding?refresh=true");
  };

  if (!mode) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={mode === "15day" ? "sm:max-w-lg max-h-[85vh] overflow-y-auto" : "sm:max-w-md"}
        showCloseButton={mode === "daily"}
      >
        {/* ============= 30-DAY MODE: Mini Onboarding ============= */}
        {mode === "30day" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                {tx("refresh30.title", lang)}
              </DialogTitle>
              <DialogDescription>
                {tx("refresh30.desc", lang)}
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-lg border bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
              ⚠️ {tx("refresh30.warning", lang)}
            </div>

            {onboardingStep === 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Pill className="h-4 w-4 text-primary" />
                  {tx("refresh30.medsTitle", lang)}
                  <span className="ml-auto text-xs text-muted-foreground">1/2</span>
                </div>
                <div className="rounded-lg border p-3 text-sm text-muted-foreground">
                  {tx("refresh30.medsDesc", lang)}
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="meds-ok"
                    checked={medsConfirmed}
                    onCheckedChange={(c) => setMedsConfirmed(c === true)}
                  />
                  <Label htmlFor="meds-ok" className="text-sm">
                    {tx("refresh30.medsCheck", lang)}
                  </Label>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setOnboardingStep(1)}
                    disabled={!medsConfirmed}
                    className="gap-1 bg-primary hover:bg-primary/90"
                  >
                    {tx("refresh30.next", lang)}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" onClick={handleGoToProfile} className="gap-1">
                    <RefreshCw className="h-4 w-4" />
                    {tx("refresh30.updateMeds", lang)}
                  </Button>
                </div>
              </div>
            )}

            {onboardingStep === 1 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Heart className="h-4 w-4 text-primary" />
                  {tx("refresh30.healthTitle", lang)}
                  <span className="ml-auto text-xs text-muted-foreground">2/2</span>
                </div>
                <div className="rounded-lg border p-3 text-sm text-muted-foreground">
                  {tx("refresh30.healthDesc", lang)}
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {profile?.is_pregnant && (
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-primary">
                      {tx("med.pregnantFlag", lang)}
                    </span>
                  )}
                  {profile?.is_breastfeeding && (
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-primary">
                      {tx("med.breastfeedingFlag", lang)}
                    </span>
                  )}
                  {profile?.kidney_disease && (
                    <span className="rounded-full bg-red-100 px-2 py-1 text-red-700 dark:bg-red-950 dark:text-red-400">
                      {tx("med.kidneyFlag", lang)}
                    </span>
                  )}
                  {profile?.liver_disease && (
                    <span className="rounded-full bg-red-100 px-2 py-1 text-red-700 dark:bg-red-950 dark:text-red-400">
                      {tx("med.liverFlag", lang)}
                    </span>
                  )}
                  {(profile?.chronic_conditions || []).map((c) => (
                    <span key={c} className="rounded-full bg-muted px-2 py-1">
                      {c}
                    </span>
                  ))}
                  {!profile?.is_pregnant && !profile?.is_breastfeeding && !profile?.kidney_disease && !profile?.liver_disease && (profile?.chronic_conditions || []).length === 0 && (
                    <span className="text-muted-foreground">
                      {tx("med.noFlags", lang)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="health-ok"
                    checked={healthConfirmed}
                    onCheckedChange={(c) => setHealthConfirmed(c === true)}
                  />
                  <Label htmlFor="health-ok" className="text-sm">
                    {tx("refresh30.healthCheck", lang)}
                  </Label>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={handle30DayComplete}
                    disabled={!healthConfirmed || isConfirming}
                    className="gap-1 bg-primary hover:bg-primary/90"
                  >
                    {isConfirming ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    {tx("refresh30.complete", lang)}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGoToOnboarding}
                    className="gap-1"
                  >
                    <RefreshCw className="h-4 w-4" />
                    {tx("refresh30.updateHealth", lang)}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setOnboardingStep(0)}
                  >
                    {tx("med.back", lang)}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ============= 15-DAY MODE: Medication Review & Edit ============= */}
        {mode === "15day" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5 text-primary" />
                {tx("med.title15", lang)}
              </DialogTitle>
              <DialogDescription>
                {tx("med.desc15", lang)}
              </DialogDescription>
            </DialogHeader>

            {loadingMeds ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Current medications */}
                {medications.length > 0 ? (
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">
                      {tx("med.currentMeds", lang)}
                    </Label>
                    {medications.map((med) => (
                      <div
                        key={med.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <Pill className="h-4 w-4 text-primary" />
                          <div>
                            <p className="font-medium text-sm">
                              {med.brand_name || med.generic_name}
                              {med.brand_name && med.generic_name && (
                                <span className="ml-1 text-xs text-muted-foreground">
                                  ({med.generic_name})
                                </span>
                              )}
                            </p>
                            {(med.dosage || med.frequency) && (
                              <div className="flex gap-2 mt-1">
                                {med.dosage && <Badge variant="secondary" className="text-xs">{med.dosage}</Badge>}
                                {med.frequency && <Badge variant="outline" className="text-xs">{med.frequency}</Badge>}
                              </div>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removeMedication15Day(med.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                    {tx("med.empty", lang)}
                  </div>
                )}

                {/* Add medication form */}
                <div className="space-y-3 rounded-lg border border-dashed p-4">
                  <p className="text-sm font-medium">
                    {tx("med.addNew", lang)}
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label htmlFor="brand-15" className="text-xs">
                        {tx("med.brandLabel", lang)}
                      </Label>
                      <div className="relative">
                        <Input
                          ref={brandInputRef}
                          id="brand-15"
                          placeholder={tx("med.brandPlaceholder", lang)}
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
                      <Label htmlFor="generic-15" className="text-xs">
                        {tx("med.genericLabel", lang)}
                      </Label>
                      <Input
                        id="generic-15"
                        placeholder={tx("med.genericPlaceholder", lang)}
                        value={genericName}
                        onChange={(e) => setGenericName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="dosage-15" className="text-xs">
                        {tx("med.dosageLabel", lang)}
                      </Label>
                      <Input
                        id="dosage-15"
                        placeholder={tx("med.dosagePlaceholder", lang)}
                        value={dosage}
                        onChange={(e) => setDosage(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="freq-15" className="text-xs">
                        {tx("med.freqLabel", lang)}
                      </Label>
                      <Input
                        id="freq-15"
                        placeholder={tx("med.freqPlaceholder", lang)}
                        value={frequency}
                        onChange={(e) => setFrequency(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addMedication15Day}
                    disabled={!brandName.trim() && !genericName.trim()}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {tx("med.addBtn", lang)}
                  </Button>
                </div>

                {/* Confirm button */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handle15DayConfirm}
                    disabled={isConfirming}
                    className="gap-2 bg-primary hover:bg-primary/90"
                  >
                    {isConfirming ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    {tx("med.confirmBtn", lang)}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ============= DAILY MODE: Quick Confirm ============= */}
        {mode === "daily" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5 text-primary" />
                {tx("dailyMed.title", lang)}
              </DialogTitle>
              <DialogDescription>
                {tx("dailyMed.description", lang)}
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                onClick={handleDailyConfirm}
                disabled={isConfirming}
                className="gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                {isConfirming
                  ? tx("med.confirming", lang)
                  : tx("dailyMed.confirmSame", lang)}
              </Button>
              <Button
                onClick={handleGoToProfile}
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                <RefreshCw className="h-4 w-4" />
                {tx("dailyMed.update", lang)}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
