"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { createBrowserClient } from "@/lib/supabase";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  User, Pill, AlertTriangle, Heart, Shield, Trash2, Download,
  Plus, X, Loader2, CheckCircle2, Check, Settings, Save, Baby, Wine,
  Cigarette, Stethoscope, Sparkles, Camera, MapPin, Users, Mail,
  UserPlus, ChevronDown, ChevronUp, Phone, Edit3, Star,
} from "lucide-react";
import type { UserMedication, UserAllergy, AllergySeverity } from "@/lib/database.types";
import { MedicationScanner } from "@/components/scanner/MedicationScanner";

interface DrugSuggestion {
  brandName: string;
  genericName: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { lang } = useLang();
  const { isAuthenticated, isLoading, profile, user, refreshProfile } = useAuth();
  const [medications, setMedications] = useState<UserMedication[]>([]);
  const [allergies, setAllergies] = useState<UserAllergy[]>([]);

  // Add medication state
  const [isAddingMed, setIsAddingMed] = useState(false);
  const [exportingData, setExportingData] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [newGenericName, setNewGenericName] = useState("");
  const [newDosage, setNewDosage] = useState("");
  const [newFrequency, setNewFrequency] = useState("");
  const [savingMed, setSavingMed] = useState(false);

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<DrugSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const brandInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Confirm state
  const [confirming, setConfirming] = useState(false);
  // Scanner state
  const [showScanner, setShowScanner] = useState(false);

  // Health profile editing state
  const [editingHealth, setEditingHealth] = useState(false);
  const [savingHealth, setSavingHealth] = useState(false);
  interface HealthFormState {
    is_pregnant: boolean;
    is_breastfeeding: boolean;
    alcohol_use: string;
    smoking_use: string;
    kidney_disease: boolean;
    liver_disease: boolean;
    recent_surgery: boolean;
    chronic_conditions: string[];
    height_cm: number | null;
    weight_kg: number | null;
    blood_group: string;
    diet_type: string;
    exercise_frequency: string;
    sleep_quality: string;
    supplements: string[];
    country: string;
    city: string;
    phone: string;
    recovery_email: string;
  }
  const [healthForm, setHealthForm] = useState<HealthFormState>({
    is_pregnant: false,
    is_breastfeeding: false,
    alcohol_use: "none",
    smoking_use: "none",
    kidney_disease: false,
    liver_disease: false,
    recent_surgery: false,
    chronic_conditions: [],
    height_cm: null,
    weight_kg: null,
    blood_group: "",
    diet_type: "",
    exercise_frequency: "",
    sleep_quality: "",
    supplements: [],
    country: "",
    city: "",
    phone: "",
    recovery_email: "",
  });
  const [newCondition, setNewCondition] = useState("");
  const [newAllergen, setNewAllergen] = useState("");
  const [newAllergenSeverity, setNewAllergenSeverity] = useState<AllergySeverity>("mild");

  const tr = lang === "tr";

  const startEditingHealth = () => {
    if (!profile) return;
    setHealthForm({
      is_pregnant: profile.is_pregnant,
      is_breastfeeding: profile.is_breastfeeding,
      alcohol_use: profile.alcohol_use || "none",
      smoking_use: profile.smoking_use || "none",
      kidney_disease: profile.kidney_disease,
      liver_disease: profile.liver_disease,
      recent_surgery: profile.recent_surgery,
      chronic_conditions: [...profile.chronic_conditions],
      height_cm: profile.height_cm,
      weight_kg: profile.weight_kg,
      blood_group: profile.blood_group || "",
      diet_type: profile.diet_type || "",
      exercise_frequency: profile.exercise_frequency || "",
      sleep_quality: profile.sleep_quality || "",
      supplements: [...(profile.supplements || [])],
      country: profile.country || "",
      city: profile.city || "",
      phone: profile.phone || "",
      recovery_email: profile.recovery_email || "",
    });
    setEditingHealth(true);
  };

  const saveHealthProfile = async () => {
    if (!profile) return;
    setSavingHealth(true);
    try {
      const supabase = createBrowserClient();
      const updateData: Record<string, any> = {
        is_pregnant: healthForm.is_pregnant ?? false,
        is_breastfeeding: healthForm.is_breastfeeding ?? false,
        alcohol_use: healthForm.alcohol_use || null,
        smoking_use: healthForm.smoking_use || null,
        kidney_disease: healthForm.kidney_disease ?? false,
        liver_disease: healthForm.liver_disease ?? false,
        recent_surgery: healthForm.recent_surgery ?? false,
        chronic_conditions: healthForm.chronic_conditions || [],
        supplements: healthForm.supplements || [],
      };
      // Only include optional fields if they have values (avoids column-not-found errors)
      if (healthForm.height_cm) updateData.height_cm = healthForm.height_cm;
      if (healthForm.weight_kg) updateData.weight_kg = healthForm.weight_kg;
      if (healthForm.blood_group) updateData.blood_group = healthForm.blood_group;
      if (healthForm.diet_type) updateData.diet_type = healthForm.diet_type;
      if (healthForm.exercise_frequency) updateData.exercise_frequency = healthForm.exercise_frequency;
      if (healthForm.sleep_quality) updateData.sleep_quality = healthForm.sleep_quality;
      if (healthForm.country) updateData.country = healthForm.country;
      if (healthForm.city) updateData.city = healthForm.city;
      if (healthForm.phone) updateData.phone = healthForm.phone;
      if (healthForm.recovery_email) updateData.recovery_email = healthForm.recovery_email;

      const { error } = await supabase
        .from("user_profiles")
        .update(updateData)
        .eq("user_id", user!.id);

      if (error) {
        console.error("Supabase update error:", error);
        // Retry with core fields only if some columns don't exist
        const { error: retryError } = await supabase
          .from("user_profiles")
          .update({
            is_pregnant: healthForm.is_pregnant ?? false,
            is_breastfeeding: healthForm.is_breastfeeding ?? false,
            kidney_disease: healthForm.kidney_disease ?? false,
            liver_disease: healthForm.liver_disease ?? false,
            recent_surgery: healthForm.recent_surgery ?? false,
            chronic_conditions: healthForm.chronic_conditions || [],
            alcohol_use: healthForm.alcohol_use || null,
            smoking_use: healthForm.smoking_use || null,
          })
          .eq("user_id", user!.id);
        if (retryError) console.error("Retry also failed:", retryError);
      }
      await refreshProfile();
      setEditingHealth(false);
    } catch (err) {
      console.error("Failed to save health profile:", err);
    } finally {
      setSavingHealth(false);
    }
  };

  const addAllergy = async () => {
    if (!newAllergen.trim() || !profile) return;
    try {
      const supabase = createBrowserClient();
      const { data } = await supabase.from("user_allergies").insert({
        user_id: profile.id,
        allergen: newAllergen.trim(),
        severity: newAllergenSeverity,
      }).select().single();
      if (data) setAllergies((prev) => [...prev, data as UserAllergy]);
      setNewAllergen("");
      setNewAllergenSeverity("mild");
    } catch (err) {
      console.error("Failed to add allergy:", err);
    }
  };

  const removeAllergy = async (id: string) => {
    try {
      const supabase = createBrowserClient();
      await supabase.from("user_allergies").delete().eq("id", id);
      setAllergies((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Failed to remove allergy:", err);
    }
  };

  const toggleCondition = (condition: string) => {
    setHealthForm((prev) => ({
      ...prev,
      chronic_conditions: prev.chronic_conditions.includes(condition)
        ? prev.chronic_conditions.filter((c) => c !== condition)
        : [...prev.chronic_conditions, condition],
    }));
  };

  const addCustomCondition = () => {
    if (!newCondition.trim()) return;
    if (!healthForm.chronic_conditions.includes(newCondition.trim())) {
      setHealthForm((prev) => ({
        ...prev,
        chronic_conditions: [...prev.chronic_conditions, newCondition.trim()],
      }));
    }
    setNewCondition("");
  };

  const toggleSupplement = (supplement: string) => {
    setHealthForm((prev) => ({
      ...prev,
      supplements: prev.supplements.includes(supplement)
        ? prev.supplements.filter((s) => s !== supplement)
        : [...prev.supplements, supplement],
    }));
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login?redirect=/profile");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!profile) return;
    const supabase = createBrowserClient();

    supabase
      .from("user_medications")
      .select("*")
      .eq("user_id", profile.id)
      .eq("is_active", true)
      .then(({ data }) => {
        if (data) setMedications(data as UserMedication[]);
      });

    supabase
      .from("user_allergies")
      .select("*")
      .eq("user_id", profile.id)
      .then(({ data }) => {
        if (data) setAllergies(data as UserAllergy[]);
      });
  }, [profile]);

  // Drug autocomplete
  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/drug-search?q=${encodeURIComponent(query)}`);
      const data: DrugSuggestion[] = await res.json();
      setSuggestions(data);
      setShowSuggestions(data.length > 0);
      setHighlightIndex(-1);
    } catch {
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(newBrandName.trim());
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [newBrandName, fetchSuggestions]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        brandInputRef.current && !brandInputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectSuggestion = (s: DrugSuggestion) => {
    setNewBrandName(s.brandName);
    if (s.genericName && s.genericName.toLowerCase() !== s.brandName.toLowerCase()) {
      setNewGenericName(s.genericName);
    }
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleBrandKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
        return;
      }
      if (e.key === "Enter" && highlightIndex >= 0) {
        e.preventDefault();
        selectSuggestion(suggestions[highlightIndex]);
        return;
      }
      if (e.key === "Escape") {
        setShowSuggestions(false);
        return;
      }
    }
  };

  const addMedication = async () => {
    if (!newBrandName.trim() || !profile) return;
    setSavingMed(true);
    try {
      const supabase = createBrowserClient();
      const { data } = await supabase.from("user_medications").insert({
        user_id: profile.id,
        brand_name: newBrandName.trim(),
        generic_name: newGenericName.trim() || null,
        dosage: newDosage.trim() || null,
        frequency: newFrequency.trim() || null,
        is_active: true,
      }).select().single();
      if (data) setMedications((prev) => [...prev, data as UserMedication]);
      setNewBrandName("");
      setNewGenericName("");
      setNewDosage("");
      setNewFrequency("");
      setIsAddingMed(false);
    } catch (err) {
      console.error("Failed to add medication:", err);
    } finally {
      setSavingMed(false);
    }
  };

  const removeMedication = async (id: string) => {
    try {
      const supabase = createBrowserClient();
      await supabase.from("user_medications").update({ is_active: false }).eq("id", id);
      setMedications((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error("Failed to remove medication:", err);
    }
  };

  const MED_CONFIRM_KEY = "phyto_med_profile_confirmed";
  const isMedRecentlyConfirmed = (): boolean => {
    if (typeof window === "undefined") return false;
    try {
      const stored = localStorage.getItem(MED_CONFIRM_KEY);
      if (!stored) return false;
      const confirmedAt = new Date(stored).getTime();
      return Date.now() - confirmedAt < 24 * 60 * 60 * 1000; // 24 hours
    } catch { return false; }
  };
  const [medConfirmed, setMedConfirmed] = useState(isMedRecentlyConfirmed);

  const confirmMedicationsCurrent = async () => {
    if (!profile) return;
    setConfirming(true);
    try {
      const supabase = createBrowserClient();
      await supabase
        .from("user_profiles")
        .update({ last_medication_update: new Date().toISOString() })
        .eq("id", profile.id);
      refreshProfile().catch(() => {});
      localStorage.setItem(MED_CONFIRM_KEY, new Date().toISOString());
      setMedConfirmed(true);
    } catch (err) {
      console.error("Failed to confirm medications:", err);
    }
    setConfirming(false);
  };

  if (isLoading || !profile) {
    return (
      <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // ── Profile Completion Score (Endowed Progress Effect — starts at 20%) ──
  const completionChecks = [
    { done: true, label: lang === "tr" ? "Hesap oluşturuldu" : "Account created" }, // always true = 20% head start
    { done: !!profile.full_name, label: lang === "tr" ? "Ad soyad girildi" : "Name entered" },
    { done: medications.length > 0, label: lang === "tr" ? "İlaçlar eklendi" : "Medications added" },
    { done: allergies.length > 0, label: lang === "tr" ? "Alerjiler girildi" : "Allergies entered" },
    { done: !!(profile.alcohol_use || profile.smoking_use), label: lang === "tr" ? "Yaşam tarzı bilgisi" : "Lifestyle info" },
    { done: !!(profile.kidney_disease !== undefined && profile.chronic_conditions?.length), label: lang === "tr" ? "Tıbbi geçmiş" : "Medical history" },
    { done: !!(profile.height_cm && profile.weight_kg), label: lang === "tr" ? "Boy & kilo" : "Height & weight" },
    { done: !!(profile.blood_group), label: lang === "tr" ? "Kan grubu" : "Blood group" },
  ];
  const completedCount = completionChecks.filter(c => c.done).length;
  const completionPct = Math.round((completedCount / completionChecks.length) * 100);
  const nextIncomplete = completionChecks.find(c => !c.done);

  return (
    <div className="mx-auto max-w-4xl px-4 md:px-8 py-8">
      <h1 className="font-heading mb-4 text-3xl font-semibold">
        {tx('profile.title', lang)}
      </h1>

      {/* ── Profile Completion Card ── */}
      {completionPct < 100 && (
        <div className="mb-6 rounded-xl border bg-gradient-to-r from-primary/5 to-amber-500/5 p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                {lang === "tr" ? "Profil Tamamlama" : "Profile Completion"}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {lang === "tr"
                  ? "Daha fazla bilgi = daha doğru ve kişisel öneriler"
                  : "More info = more accurate and personalized recommendations"}
              </p>
            </div>
            <span className="text-2xl font-bold text-primary">%{completionPct}</span>
          </div>
          {/* Progress bar */}
          <div className="h-2.5 rounded-full bg-muted/50 overflow-hidden mb-3">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-amber-500 transition-all duration-700"
              style={{ width: `${completionPct}%` }}
            />
          </div>
          {/* Completion items */}
          <div className="flex flex-wrap gap-2 mb-3">
            {completionChecks.map((check, i) => (
              <span key={i} className={`inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full ${
                check.done
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-muted text-muted-foreground"
              }`}>
                {check.done ? <CheckCircle2 className="h-3 w-3" /> : <span className="w-3 h-3 rounded-full border border-current opacity-40" />}
                {check.label}
              </span>
            ))}
          </div>
          {/* Next action nudge */}
          {nextIncomplete && (
            <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/20 rounded-lg px-3 py-2">
              <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
              {lang === "tr"
                ? `Sıradaki: "${nextIncomplete.label}" bilgisini ekleyerek önerilerimizi iyileştir`
                : `Next: Add "${nextIncomplete.label}" to improve your recommendations`}
            </p>
          )}
        </div>
      )}

      {/* ── Completed celebration ── */}
      {completionPct === 100 && (
        <div className="mb-6 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-green-800 dark:text-green-300">
              {lang === "tr" ? "Profilin %100 tamamlandı!" : "Your profile is 100% complete!"}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400">
              {lang === "tr"
                ? "Artık en doğru ve kişisel sağlık önerilerini alabilirsin"
                : "You'll now receive the most accurate and personalized health recommendations"}
            </p>
          </div>
        </div>
      )}

      {/* Personal Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {tx('profile.personalInfo', lang)}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">{tx('profile.name', lang)}</p>
            <p className="font-medium">{profile.full_name || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{tx('profile.email', lang)}</p>
            <p className="font-medium">{user?.email || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{tx('profile.age', lang)}</p>
            <p className="font-medium">{profile.age ?? "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{tx('profile.gender', lang)}</p>
            <p className="font-medium capitalize">{profile.gender?.replace("_", " ") || "—"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Medications — Editable */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                {tx('profile.activeMeds', lang)}
              </CardTitle>
              <CardDescription>
                {tx('profile.lastUpdated', lang)}{" "}
                {profile.last_medication_update
                  ? new Date(profile.last_medication_update).toLocaleDateString()
                  : tx("profile.never", lang)}
              </CardDescription>
            </div>
            {!isAddingMed && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => setShowScanner(!showScanner)}
                >
                  <Camera className="h-4 w-4" />
                  {tx('scanner.scanMedication', lang)}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => setIsAddingMed(true)}
                >
                  <Plus className="h-4 w-4" />
                  {tx('profile.addMed', lang)}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Medication Scanner */}
          {showScanner && user && (
            <MedicationScanner
              userId={user.id}
              lang={lang as "en" | "tr"}
              onMedicationFound={(brand, generic, dose) => {
                setNewBrandName(brand);
                setNewGenericName(generic);
                setNewDosage(dose);
                setIsAddingMed(true);
                setShowScanner(false);
              }}
            />
          )}
          {/* Medication list */}
          {medications.length === 0 && !isAddingMed ? (
            <p className="text-sm text-muted-foreground">
              {tx('profile.noMeds', lang)}
            </p>
          ) : (
            <div className="space-y-2">
              {medications.map((med) => (
                <div key={med.id} className="flex items-center justify-between rounded-lg border p-3">
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
                        <div className="mt-1 flex gap-2">
                          {med.dosage && <Badge variant="secondary">{med.dosage}</Badge>}
                          {med.frequency && <Badge variant="outline">{med.frequency}</Badge>}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => removeMedication(med.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Inline add medication form */}
          {isAddingMed && (
            <div className="space-y-3 rounded-lg border border-dashed border-primary/30 p-4">
              <p className="text-sm font-medium">{tx('onb.addMed', lang)}</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">{tx('onb.brandName', lang)}</Label>
                  <div className="relative">
                    <Input
                      ref={brandInputRef}
                      placeholder={tx('onb.brandPlaceholder', lang)}
                      value={newBrandName}
                      onChange={(e) => setNewBrandName(e.target.value)}
                      onKeyDown={handleBrandKeyDown}
                      onFocus={() => {
                        if (suggestions.length > 0) setShowSuggestions(true);
                      }}
                      autoComplete="off"
                    />
                    {isSearching && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    )}
                    {showSuggestions && suggestions.length > 0 && (
                      <div
                        ref={dropdownRef}
                        className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-lg border bg-background shadow-lg"
                      >
                        {suggestions.map((s, i) => (
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
                  <Label className="text-xs">{tx('onb.genericName', lang)}</Label>
                  <Input
                    placeholder={tx('onb.genericPlaceholder', lang)}
                    value={newGenericName}
                    onChange={(e) => setNewGenericName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{tx('onb.dosageLabel', lang)}</Label>
                  <Input
                    placeholder={tx('onb.dosagePlaceholder', lang)}
                    value={newDosage}
                    onChange={(e) => setNewDosage(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{tx('onb.freqLabel', lang)}</Label>
                  <Input
                    placeholder={tx('onb.freqPlaceholder', lang)}
                    value={newFrequency}
                    onChange={(e) => setNewFrequency(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={addMedication}
                  disabled={!newBrandName.trim() || savingMed}
                  className="gap-1 bg-primary hover:bg-primary/90"
                >
                  {savingMed ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  {tx('onb.addMedBtn', lang)}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsAddingMed(false);
                    setNewBrandName("");
                    setNewGenericName("");
                    setNewDosage("");
                    setNewFrequency("");
                    setSuggestions([]);
                    setShowSuggestions(false);
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  {tx("profile.cancel", lang)}
                </Button>
              </div>
            </div>
          )}

          {/* Confirm medications are current */}
          <Separator />
          <Button
            variant={medConfirmed ? "default" : "outline"}
            size="sm"
            className={`gap-2 ${medConfirmed ? "bg-green-500 hover:bg-green-600 text-white" : "border-primary/30 text-primary hover:bg-primary/10"}`}
            onClick={confirmMedicationsCurrent}
            disabled={confirming || medConfirmed}
          >
            {confirming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : medConfirmed ? (
              <Check className="h-4 w-4" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            {medConfirmed
              ? tx("profile.confirmed", lang)
              : tx('profile.confirmCurrent', lang)
            }
          </Button>
        </CardContent>
      </Card>

      {/* Scanners moved to /scanner page via Tools menu */}

      {/* Allergies */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            {tx('profile.allergies', lang)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allergies.length === 0 ? (
            <div>
              <p className="text-sm text-muted-foreground">{tx('profile.noAllergies', lang)}</p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {lang === "tr"
                  ? "Alerjilerini eklersen ilaç önerilerinde güvenliğin %40 artar"
                  : "Adding allergies improves your medication safety by 40%"}
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {allergies.map((allergy) => (
                <Badge key={allergy.id} variant="destructive">
                  {allergy.allergen} ({allergy.severity})
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Health Flags */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            {tx('profile.healthFlags', lang)}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {profile.is_pregnant && <Badge variant="outline">{tx("profile.pregnant", lang)}</Badge>}
          {profile.is_breastfeeding && <Badge variant="outline">{tx("profile.breastfeeding", lang)}</Badge>}
          {profile.kidney_disease && <Badge variant="destructive">{tx("profile.kidneyDisease", lang)}</Badge>}
          {profile.liver_disease && <Badge variant="destructive">{tx("profile.liverDisease", lang)}</Badge>}
          {profile.recent_surgery && <Badge variant="outline">{tx("profile.recentSurgery", lang)}</Badge>}
          {profile.chronic_conditions.map((c) => (
            <Badge key={c} variant="secondary">{c}</Badge>
          ))}
          {!profile.is_pregnant &&
            !profile.is_breastfeeding &&
            !profile.kidney_disease &&
            !profile.liver_disease &&
            !profile.recent_surgery &&
            profile.chronic_conditions.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {tx('profile.noFlags', lang)}
              </p>
            )}
        </CardContent>
      </Card>

      {/* Edit Health Profile */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {tx("profile.editHealthProfile", lang)}
            </CardTitle>
            {!editingHealth ? (
              <Button variant="outline" size="sm" onClick={startEditingHealth}>
                {tx("profile.edit", lang)}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={saveHealthProfile}
                  disabled={savingHealth}
                  className="gap-1 bg-primary hover:bg-primary/90"
                >
                  {savingHealth ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {tx("profile.save", lang)}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setEditingHealth(false)}>
                  {tx("profile.cancel", lang)}
                </Button>
              </div>
            )}
          </div>
          <CardDescription>
            {tx("profile.editHealthDesc", lang)}
          </CardDescription>
        </CardHeader>

        {editingHealth && (
          <CardContent className="space-y-6">
            {/* Allergies Section */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-base font-semibold">
                <AlertTriangle className="h-4 w-4" />
                {tx("profile.allergies", lang)}
              </Label>
              <div className="flex flex-wrap gap-2">
                {allergies.map((allergy) => (
                  <Badge key={allergy.id} variant="destructive" className="gap-1">
                    {allergy.allergen} ({allergy.severity})
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeAllergy(allergy.id)} />
                  </Badge>
                ))}
                {allergies.length === 0 && (
                  <p className="text-sm text-muted-foreground">{tx("profile.noAllergies", lang)}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder={tx("profile.allergenPlaceholder", lang)}
                  value={newAllergen}
                  onChange={(e) => setNewAllergen(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAllergy())}
                  className="flex-1"
                />
                <Select value={newAllergenSeverity} onValueChange={(v) => setNewAllergenSeverity(v as AllergySeverity)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mild">{tx("profile.severityMild", lang)}</SelectItem>
                    <SelectItem value="moderate">{tx("profile.severityModerate", lang)}</SelectItem>
                    <SelectItem value="severe">{tx("profile.severitySevere", lang)}</SelectItem>
                    <SelectItem value="anaphylaxis">{tx("profile.severityAnaphylaxis", lang)}</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={addAllergy} disabled={!newAllergen.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Pregnancy / Breastfeeding */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-base font-semibold">
                <Baby className="h-4 w-4" />
                {tx("profile.pregnancyBreastfeeding", lang)}
              </Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-pregnant"
                    checked={healthForm.is_pregnant}
                    onCheckedChange={(c) => setHealthForm((p): HealthFormState => ({ ...p, is_pregnant: c === true }))}
                  />
                  <Label htmlFor="edit-pregnant" className="font-normal">{tx("profile.pregnant", lang)}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-bf"
                    checked={healthForm.is_breastfeeding}
                    onCheckedChange={(c) => setHealthForm((p): HealthFormState => ({ ...p, is_breastfeeding: c === true }))}
                  />
                  <Label htmlFor="edit-bf" className="font-normal">{tx("profile.breastfeeding", lang)}</Label>
                </div>
              </div>
            </div>

            <Separator />

            {/* Substance Use */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-base font-semibold">
                  <Wine className="h-4 w-4" />
                  {tx("profile.alcohol", lang)}
                </Label>
                <RadioGroup
                  value={healthForm.alcohol_use}
                  onValueChange={(v) => v && setHealthForm((p): HealthFormState => ({ ...p, alcohol_use: v }))}
                >
                  {[
                    { value: "none", key: "profile.alcoholNone" },
                    { value: "occasional", key: "profile.alcoholOccasional" },
                    { value: "regular", key: "profile.alcoholRegular" },
                    { value: "heavy", key: "profile.alcoholHeavy" },
                  ].map((opt) => (
                    <div key={opt.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={opt.value} id={`edit-alc-${opt.value}`} />
                      <Label htmlFor={`edit-alc-${opt.value}`} className="font-normal">{tx(opt.key, lang)}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-base font-semibold">
                  <Cigarette className="h-4 w-4" />
                  {tx("profile.smoking", lang)}
                </Label>
                <RadioGroup
                  value={healthForm.smoking_use}
                  onValueChange={(v) => v && setHealthForm((p): HealthFormState => ({ ...p, smoking_use: v }))}
                >
                  {[
                    { value: "none", key: "profile.smokingNever" },
                    { value: "former", key: "profile.smokingFormer" },
                    { value: "current", key: "profile.smokingCurrent" },
                  ].map((opt) => (
                    <div key={opt.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={opt.value} id={`edit-smk-${opt.value}`} />
                      <Label htmlFor={`edit-smk-${opt.value}`} className="font-normal">{tx(opt.key, lang)}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>

            <Separator />

            {/* Medical History */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-base font-semibold">
                <Stethoscope className="h-4 w-4" />
                {tx("profile.medicalHistory", lang)}
              </Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-kidney"
                    checked={healthForm.kidney_disease}
                    onCheckedChange={(c) => setHealthForm((p): HealthFormState => ({ ...p, kidney_disease: c === true }))}
                  />
                  <Label htmlFor="edit-kidney" className="font-normal">{tx("profile.kidneyDisease", lang)}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-liver"
                    checked={healthForm.liver_disease}
                    onCheckedChange={(c) => setHealthForm((p): HealthFormState => ({ ...p, liver_disease: c === true }))}
                  />
                  <Label htmlFor="edit-liver" className="font-normal">{tx("profile.liverDisease", lang)}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-surgery"
                    checked={healthForm.recent_surgery}
                    onCheckedChange={(c) => setHealthForm((p): HealthFormState => ({ ...p, recent_surgery: c === true }))}
                  />
                  <Label htmlFor="edit-surgery" className="font-normal">{tx("profile.recentSurgery", lang)}</Label>
                </div>
              </div>
              <div className="mt-2">
                <Label className="text-sm">{tx("profile.chronicConditions", lang)}</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["Diabetes", "Hypertension", "Asthma", "Heart Disease", "Thyroid Disorder", "Arthritis", "Depression", "Anxiety", "COPD", "Epilepsy"].map((c) => (
                    <Badge
                      key={c}
                      variant={healthForm.chronic_conditions.includes(c) ? "default" : "outline"}
                      className="cursor-pointer transition-colors"
                      onClick={() => toggleCondition(c)}
                    >
                      {({
                        "Diabetes": tx("profile.conditionDiabetes", lang),
                        "Hypertension": tx("profile.conditionHypertension", lang),
                        "Asthma": tx("profile.conditionAsthma", lang),
                        "Heart Disease": tx("profile.conditionHeartDisease", lang),
                        "Thyroid Disorder": tx("profile.conditionThyroid", lang),
                        "Arthritis": tx("profile.conditionArthritis", lang),
                        "Depression": tx("profile.conditionDepression", lang),
                        "Anxiety": tx("profile.conditionAnxiety", lang),
                        "COPD": tx("profile.conditionCOPD", lang),
                        "Epilepsy": tx("profile.conditionEpilepsy", lang),
                      } as Record<string, string>)[c] || c}
                    </Badge>
                  ))}
                  {healthForm.chronic_conditions
                    .filter((c) => !["Diabetes", "Hypertension", "Asthma", "Heart Disease", "Thyroid Disorder", "Arthritis", "Depression", "Anxiety", "COPD", "Epilepsy"].includes(c))
                    .map((c) => (
                      <Badge key={c} variant="default" className="gap-1">
                        {c}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => toggleCondition(c)} />
                      </Badge>
                    ))}
                </div>
                <div className="mt-2 flex gap-2">
                  <Input
                    placeholder={tx("profile.otherConditionPlaceholder", lang)}
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomCondition())}
                  />
                  <Button variant="outline" size="sm" onClick={addCustomCondition} disabled={!newCondition.trim()}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            {/* Optional Lifestyle Data */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2 text-base font-semibold">
                <Sparkles className="h-4 w-4" />
                {tx("profile.lifestyle", lang)}
              </Label>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-sm">{tx("profile.height", lang)}</Label>
                  <Input
                    type="number"
                    placeholder={tx("profile.heightPlaceholder", lang)}
                    value={healthForm.height_cm ?? ""}
                    onChange={(e) => setHealthForm((p): HealthFormState => ({ ...p, height_cm: e.target.value ? parseInt(e.target.value) : null }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm">{tx("profile.weight", lang)}</Label>
                  <Input
                    type="number"
                    placeholder={tx("profile.weightPlaceholder", lang)}
                    value={healthForm.weight_kg ?? ""}
                    onChange={(e) => setHealthForm((p): HealthFormState => ({ ...p, weight_kg: e.target.value ? parseFloat(e.target.value) : null }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-sm">{tx("profile.bloodGroup", lang)}</Label>
                  <Select value={healthForm.blood_group} onValueChange={(v) => v && setHealthForm((p): HealthFormState => ({ ...p, blood_group: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder={tx("profile.select", lang)} />
                    </SelectTrigger>
                    <SelectContent>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm">{tx("profile.dietType", lang)}</Label>
                  <Select value={healthForm.diet_type} onValueChange={(v) => v && setHealthForm((p): HealthFormState => ({ ...p, diet_type: v }))}>
                    <SelectTrigger>
                      {healthForm.diet_type ? (
                        <span>{({ regular: tx("profile.dietRegular", lang), vegetarian: tx("profile.dietVegetarian", lang), vegan: tx("profile.dietVegan", lang), keto: tx("profile.dietKeto", lang), gluten_free: tx("profile.dietGlutenFree", lang), halal: tx("profile.dietHalal", lang), other: tx("profile.dietOther", lang) } as Record<string, string>)[healthForm.diet_type] || healthForm.diet_type}</span>
                      ) : (
                        <SelectValue placeholder={tx("profile.select", lang)} />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        { v: "regular", key: "profile.dietRegular" },
                        { v: "vegetarian", key: "profile.dietVegetarian" },
                        { v: "vegan", key: "profile.dietVegan" },
                        { v: "keto", key: "profile.dietKeto" },
                        { v: "gluten_free", key: "profile.dietGlutenFree" },
                        { v: "halal", key: "profile.dietHalal" },
                        { v: "other", key: "profile.dietOther" },
                      ].map((opt) => (
                        <SelectItem key={opt.v} value={opt.v}>{tx(opt.key, lang)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-sm">{tx("profile.exercise", lang)}</Label>
                  <Select value={healthForm.exercise_frequency} onValueChange={(v) => v && setHealthForm((p): HealthFormState => ({ ...p, exercise_frequency: v }))}>
                    <SelectTrigger>
                      {healthForm.exercise_frequency ? (
                        <span>{({ sedentary: tx("profile.exerciseSedentary", lang), light: tx("profile.exerciseLight", lang), moderate: tx("profile.exerciseModerate", lang), active: tx("profile.exerciseActive", lang), athlete: tx("profile.exerciseAthlete", lang) } as Record<string, string>)[healthForm.exercise_frequency] || healthForm.exercise_frequency}</span>
                      ) : (
                        <SelectValue placeholder={tx("profile.select", lang)} />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        { v: "sedentary", key: "profile.exerciseSedentary" },
                        { v: "light", key: "profile.exerciseLight" },
                        { v: "moderate", key: "profile.exerciseModerate" },
                        { v: "active", key: "profile.exerciseActive" },
                        { v: "athlete", key: "profile.exerciseAthlete" },
                      ].map((opt) => (
                        <SelectItem key={opt.v} value={opt.v}>{tx(opt.key, lang)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm">{tx("profile.sleep", lang)}</Label>
                  <Select value={healthForm.sleep_quality} onValueChange={(v) => v && setHealthForm((p): HealthFormState => ({ ...p, sleep_quality: v }))}>
                    <SelectTrigger>
                      {healthForm.sleep_quality ? (
                        <span>{({ good: tx("profile.sleepGood", lang), fair: tx("profile.sleepFair", lang), poor: tx("profile.sleepPoor", lang), insomnia: tx("profile.sleepInsomnia", lang) } as Record<string, string>)[healthForm.sleep_quality] || healthForm.sleep_quality}</span>
                      ) : (
                        <SelectValue placeholder={tx("profile.select", lang)} />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        { v: "good", key: "profile.sleepGood" },
                        { v: "fair", key: "profile.sleepFair" },
                        { v: "poor", key: "profile.sleepPoor" },
                        { v: "insomnia", key: "profile.sleepInsomnia" },
                      ].map((opt) => (
                        <SelectItem key={opt.v} value={opt.v}>{tx(opt.key, lang)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Supplements */}
              <div className="space-y-2">
                <Label className="text-sm">{tx("profile.supplements", lang)}</Label>
                <div className="flex flex-wrap gap-2">
                  {["Vitamin D", "Vitamin B12", "Iron", "Omega-3", "Magnesium", "Zinc", "Probiotics", "Multivitamin"].map((s) => (
                    <Badge
                      key={s}
                      variant={healthForm.supplements.includes(s) ? "default" : "outline"}
                      className="cursor-pointer transition-colors"
                      onClick={() => toggleSupplement(s)}
                    >
                      {({
                        "Vitamin D": tx("profile.suppVitaminD", lang),
                        "Vitamin B12": tx("profile.suppVitaminB12", lang),
                        "Iron": tx("profile.suppIron", lang),
                        "Omega-3": tx("profile.suppOmega3", lang),
                        "Magnesium": tx("profile.suppMagnesium", lang),
                        "Zinc": tx("profile.suppZinc", lang),
                        "Probiotics": tx("profile.suppProbiotics", lang),
                        "Multivitamin": tx("profile.suppMultivitamin", lang),
                      } as Record<string, string>)[s] || s}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Contact & Location */}
              <div className="space-y-4">
                <Label className="flex items-center gap-2 text-base font-semibold">
                  <MapPin className="h-4 w-4" />
                  {tr ? "İletişim & Konum" : "Contact & Location"}
                </Label>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-sm">{tr ? "Ülke" : "Country"}</Label>
                    <Input
                      placeholder={tr ? "Türkiye" : "Turkey"}
                      value={healthForm.country}
                      onChange={(e) => setHealthForm((p): HealthFormState => ({ ...p, country: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm">{tr ? "Şehir" : "City"}</Label>
                    <Input
                      placeholder={tr ? "İstanbul" : "Istanbul"}
                      value={healthForm.city}
                      onChange={(e) => setHealthForm((p): HealthFormState => ({ ...p, city: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-sm">{tr ? "Telefon" : "Phone"}</Label>
                    <Input
                      type="tel"
                      placeholder={tr ? "+90 5XX XXX XX XX" : "+1 (555) 000-0000"}
                      value={healthForm.phone}
                      onChange={(e) => setHealthForm((p): HealthFormState => ({ ...p, phone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm">{tr ? "Kurtarma E-postası" : "Recovery Email"}</Label>
                    <Input
                      type="email"
                      placeholder={tr ? "yedek@email.com" : "backup@email.com"}
                      value={healthForm.recovery_email}
                      onChange={(e) => setHealthForm((p): HealthFormState => ({ ...p, recovery_email: e.target.value }))}
                    />
                    <p className="text-[10px] text-muted-foreground">
                      {tr ? "Hesap kurtarma için ikincil e-posta" : "Secondary email for account recovery"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Save button at bottom — so user doesn't scroll back up */}
            <div className="mt-6 flex gap-2 border-t pt-4">
              <Button
                onClick={saveHealthProfile}
                disabled={savingHealth}
                className="flex-1 gap-2 bg-primary hover:bg-primary/90"
              >
                {savingHealth ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {tx("profile.save", lang)}
              </Button>
              <Button variant="outline" onClick={() => setEditingHealth(false)}>
                {tx("profile.cancel", lang)}
              </Button>
            </div>
          </CardContent>
        )}

        {!editingHealth && (
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {tx("profile.editHealthHint", lang)}
            </p>
          </CardContent>
        )}
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {tx('profile.dataPrivacy', lang)}
          </CardTitle>
          <CardDescription>{tx('profile.dataDesc', lang)}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              className="gap-2"
              disabled={exportingData}
              onClick={async () => {
                setExportingData(true)
                try {
                  const supabase = createBrowserClient()
                  const { data: { session } } = await supabase.auth.getSession()
                  if (!session) return
                  const res = await fetch("/api/user-data", {
                    headers: { Authorization: `Bearer ${session.access_token}` },
                  })
                  if (!res.ok) throw new Error("Export failed")
                  const blob = await res.blob()
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement("a")
                  a.href = url
                  a.download = `phytotherapy-data-${new Date().toISOString().split("T")[0]}.json`
                  a.click()
                  URL.revokeObjectURL(url)
                } catch {
                  alert(tx("profile.exportFailed", lang))
                } finally {
                  setExportingData(false)
                }
              }}
            >
              {exportingData ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {exportingData ? tx('data.exporting', lang) : tx('profile.downloadData', lang)}
            </Button>
            <Button
              variant="destructive"
              className="gap-2"
              disabled={deletingAccount}
              onClick={async () => {
                const confirmText = tx("profile.deleteConfirmText", lang)
                const input = prompt(tx('data.deleteConfirm', lang))
                if (input !== confirmText) return
                setDeletingAccount(true)
                try {
                  const supabase = createBrowserClient()
                  const { data: { session } } = await supabase.auth.getSession()
                  if (!session) return
                  const res = await fetch("/api/user-data", {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${session.access_token}` },
                  })
                  if (!res.ok) throw new Error("Delete failed")
                  await supabase.auth.signOut()
                  router.push("/")
                } catch {
                  alert(tx("profile.deleteFailed", lang))
                  setDeletingAccount(false)
                }
              }}
            >
              {deletingAccount ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              {deletingAccount ? tx('data.deleting', lang) : tx('profile.deleteAccount', lang)}
            </Button>
          </div>
          <Separator className="my-4" />
          <p className="text-xs text-muted-foreground">
            {tx('profile.dataNote', lang)}
          </p>
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      <EmergencyContactsSection lang={lang} userId={profile.id} />

      {/* Linked Accounts */}
      <LinkedAccountsSection lang={lang} userId={profile.id} />

      {/* Scanners removed — kept for mobile app later */}
    </div>
  );
}

// ============================================
// Linked Accounts Section Component
// ============================================
interface LinkedAccount {
  id: string;
  parent_user_id: string;
  linked_user_id: string | null;
  relationship: string;
  permissions: string[];
  pays_subscription: boolean;
  is_accepted: boolean;
  invite_email: string | null;
  created_at: string;
  linkedName?: string;
  parentName?: string;
}

// ── Emergency Contacts Section ──────────────────────
interface EmergencyContact {
  id: string; name: string; relationship: string; phoneNumber: string; isPrimary: boolean; priority: number;
}

const EC_RELATIONSHIPS = [
  { id: "spouse", label: { en: "Spouse", tr: "Eş" } },
  { id: "parent", label: { en: "Parent", tr: "Anne/Baba" } },
  { id: "child", label: { en: "Child", tr: "Çocuk" } },
  { id: "sibling", label: { en: "Sibling", tr: "Kardeş" } },
  { id: "doctor", label: { en: "Doctor", tr: "Doktor" } },
  { id: "friend", label: { en: "Friend", tr: "Arkadaş" } },
  { id: "other", label: { en: "Other", tr: "Diğer" } },
];

function EmergencyContactsSection({ lang, userId }: { lang: "en" | "tr"; userId: string }) {
  const tr = lang === "tr";
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", relationship: "spouse", phoneNumber: "" });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const data = localStorage.getItem(`emergency_contacts_${userId}`);
      if (data) setContacts(JSON.parse(data));
    } catch { /* corrupted */ }
  }, [userId]);

  const persist = (updated: EmergencyContact[]) => {
    setContacts(updated);
    localStorage.setItem(`emergency_contacts_${userId}`, JSON.stringify(updated));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addContact = () => {
    if (!form.name || !form.phoneNumber) return;
    persist([...contacts, {
      id: Date.now().toString(), name: form.name, relationship: form.relationship,
      phoneNumber: form.phoneNumber, isPrimary: contacts.length === 0, priority: contacts.length + 1,
    }]);
    setForm({ name: "", relationship: "spouse", phoneNumber: "" });
    setShowForm(false);
  };

  const updateContact = () => {
    if (!editingId) return;
    persist(contacts.map(c => c.id === editingId ? { ...c, ...form } : c));
    setEditingId(null);
    setForm({ name: "", relationship: "spouse", phoneNumber: "" });
    setShowForm(false);
  };

  const deleteContact = (id: string) => {
    const updated = contacts.filter(c => c.id !== id);
    if (updated.length > 0 && !updated.some(c => c.isPrimary)) updated[0].isPrimary = true;
    persist(updated.map((c, i) => ({ ...c, priority: i + 1 })));
  };

  const setPrimary = (id: string) => persist(contacts.map(c => ({ ...c, isPrimary: c.id === id })));

  const startEdit = (c: EmergencyContact) => {
    setEditingId(c.id);
    setForm({ name: c.name, relationship: c.relationship, phoneNumber: c.phoneNumber });
    setShowForm(true);
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-red-500" />
              {tr ? "Acil Durum Kişileri" : "Emergency Contacts"}
            </CardTitle>
            <CardDescription>{tr ? "Sağlık acilinde ulaşılacak kişiler" : "People to contact in a health emergency"}</CardDescription>
          </div>
          {contacts.length < 5 && !showForm && (
            <Button size="sm" variant="outline" onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: "", relationship: "spouse", phoneNumber: "" }); }}>
              <Plus className="h-4 w-4 mr-1" />{tr ? "Ekle" : "Add"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {saved && (
          <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 dark:bg-green-950/20 px-3 py-1.5 rounded-lg">
            <Check className="h-3 w-3" />{tr ? "Kaydedildi!" : "Saved!"}
          </div>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <div className="space-y-3 p-4 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5">
            <div>
              <Label className="text-xs">{tr ? "Ad Soyad" : "Full Name"} *</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder={tr ? "Örn: Ahmet Yılmaz" : "e.g. John Doe"} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">{tr ? "Yakınlık" : "Relationship"}</Label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 mt-1">
                {EC_RELATIONSHIPS.map(rel => (
                  <button key={rel.id} onClick={() => setForm({ ...form, relationship: rel.id })}
                    className={`px-2 py-1.5 rounded-md border text-xs transition-all ${
                      form.relationship === rel.id ? "border-primary bg-primary/10 font-medium" : "hover:border-primary/30"
                    }`}>
                    {rel.label[lang]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs">{tr ? "Telefon" : "Phone"} *</Label>
              <Input value={form.phoneNumber} onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
                type="tel" placeholder="+90 5XX XXX XX XX" className="mt-1 font-mono" />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={editingId ? updateContact : addContact} disabled={!form.name || !form.phoneNumber} className="gap-1">
                <Save className="h-3.5 w-3.5" />{tr ? "Kaydet" : "Save"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>
                {tr ? "İptal" : "Cancel"}
              </Button>
            </div>
          </div>
        )}

        {/* Contact List */}
        {contacts.length === 0 && !showForm && (
          <div className="text-center py-6">
            <Shield className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{tr ? "Henüz acil durum kişisi yok" : "No emergency contacts yet"}</p>
          </div>
        )}

        {contacts.sort((a, b) => a.priority - b.priority).map((contact, idx) => {
          const relLabel = EC_RELATIONSHIPS.find(r => r.id === contact.relationship)?.label[lang] || contact.relationship;
          return (
            <div key={contact.id} className={`flex items-center gap-3 p-3 rounded-lg border ${contact.isPrimary ? "border-red-300 bg-red-50/50 dark:border-red-800 dark:bg-red-950/10" : ""}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                contact.isPrimary ? "bg-red-500 text-white" : "bg-muted text-muted-foreground"
              }`}>
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium">{contact.name}</span>
                  {contact.isPrimary && (
                    <Badge className="text-[9px] bg-red-100 text-red-600 border-0 px-1.5">{tr ? "Birincil" : "Primary"}</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{relLabel} · <span className="font-mono">{contact.phoneNumber}</span></p>
              </div>
              <div className="flex items-center gap-0.5">
                <a href={`tel:${contact.phoneNumber}`}>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-green-600"><Phone className="h-3.5 w-3.5" /></Button>
                </a>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => startEdit(contact)}><Edit3 className="h-3 w-3" /></Button>
                {!contact.isPrimary && (
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setPrimary(contact.id)} title={tr ? "Birincil yap" : "Set primary"}>
                    <Star className="h-3 w-3" />
                  </Button>
                )}
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500" onClick={() => deleteContact(contact.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          );
        })}

        {contacts.length > 0 && (
          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-amber-500" />
            {tr ? "Acil durum kişileriniz Acil Kimlik kartınızda gösterilir" : "Emergency contacts appear on your Emergency ID card"}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function LinkedAccountsSection({ lang, userId }: { lang: "en" | "tr"; userId: string }) {
  const [asParent, setAsParent] = useState<LinkedAccount[]>([]);
  const [asLinked, setAsLinked] = useState<LinkedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [inviteEmail, setInviteEmail] = useState("");
  const [relationship, setRelationship] = useState("spouse");
  const [permViewData, setPermViewData] = useState(false);
  const [permPaySub, setPermPaySub] = useState(false);
  const [permManageMeds, setPermManageMeds] = useState(false);

  useEffect(() => {
    fetchLinked();
  }, [userId]);

  const fetchLinked = async () => {
    setLoading(true);
    try {
      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch("/api/linked-accounts", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setAsParent(data.asParent || []);
      setAsLinked(data.asLinked || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const sendInvite = async () => {
    if (!inviteEmail.trim()) return;
    setSending(true);
    setError(null);
    setSuccess(false);
    try {
      const permissions: string[] = [];
      if (permViewData) permissions.push("view_data");
      if (permPaySub) permissions.push("pays_subscription");
      if (permManageMeds) permissions.push("manage_medications");

      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/linked-accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: "invite",
          email: inviteEmail.trim(),
          relationship,
          permissions,
          pays_subscription: permPaySub,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to send invite");
        return;
      }

      setSuccess(true);
      setInviteEmail("");
      setPermViewData(false);
      setPermPaySub(false);
      setPermManageMeds(false);
      setShowForm(false);
      await fetchLinked();
    } catch {
      setError("Failed to send invite");
    } finally {
      setSending(false);
    }
  };

  const removeLinked = async (id: string) => {
    if (!confirm(tx("linked.removeConfirm", lang))) return;
    try {
      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await fetch("/api/linked-accounts", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ linkedAccountId: id }),
      });
      await fetchLinked();
    } catch {
      // silent
    }
  };

  const acceptInvite = async (id: string) => {
    try {
      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await fetch("/api/linked-accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ action: "accept", linkedAccountId: id }),
      });
      await fetchLinked();
    } catch {
      // silent
    }
  };

  const relationshipLabel = (rel: string): string => {
    const map: Record<string, string> = {
      mother: tx("linked.mother", lang),
      father: tx("linked.father", lang),
      child: tx("linked.child", lang),
      spouse: tx("linked.spouse", lang),
      grandparent: tx("linked.grandparent", lang),
      sibling: tx("linked.sibling", lang),
      other: tx("linked.other", lang),
    };
    return map[rel] || rel;
  };

  const relationships = [
    { value: "mother", label: tx("linked.mother", lang) },
    { value: "father", label: tx("linked.father", lang) },
    { value: "child", label: tx("linked.child", lang) },
    { value: "spouse", label: tx("linked.spouse", lang) },
    { value: "grandparent", label: tx("linked.grandparent", lang) },
    { value: "sibling", label: tx("linked.sibling", lang) },
    { value: "other", label: tx("linked.other", lang) },
  ];

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {tx("linked.title", lang)}
            </CardTitle>
            <CardDescription>{tx("linked.subtitle", lang)}</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            {showForm ? (lang === "tr" ? "Kapat" : "Close") : tx("linked.addAccount", lang)}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Invite Form */}
        {showForm && (
          <div className="space-y-3 rounded-lg border border-dashed border-primary/30 p-4">
            <div className="space-y-1">
              <Label className="text-xs">{tx("linked.email", lang)}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="name@example.com"
                  className="pl-10"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">{tx("linked.relationship", lang)}</Label>
              <Select value={relationship} onValueChange={(v) => v && setRelationship(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {relationships.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">{tx("linked.permissions", lang)}</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="perm-view"
                    checked={permViewData}
                    onCheckedChange={(c) => setPermViewData(c === true)}
                  />
                  <Label htmlFor="perm-view" className="text-sm font-normal">
                    {tx("linked.viewData", lang)}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="perm-pay"
                    checked={permPaySub}
                    onCheckedChange={(c) => setPermPaySub(c === true)}
                  />
                  <Label htmlFor="perm-pay" className="text-sm font-normal">
                    {tx("linked.paySubscription", lang)}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="perm-meds"
                    checked={permManageMeds}
                    onCheckedChange={(c) => setPermManageMeds(c === true)}
                  />
                  <Label htmlFor="perm-meds" className="text-sm font-normal">
                    {tx("linked.manageMeds", lang)}
                  </Label>
                </div>
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={sendInvite}
                disabled={!inviteEmail.trim() || sending}
                className="gap-1 bg-primary hover:bg-primary/90"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                {tx("linked.sendInvite", lang)}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowForm(false)}
              >
                <X className="h-4 w-4 mr-1" />
                {tx("profile.cancel", lang)}
              </Button>
            </div>
          </div>
        )}

        {/* Success message */}
        {success && (
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950/20 dark:text-green-300">
            <CheckCircle2 className="h-4 w-4" />
            {tx("linked.inviteSent", lang)}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : asParent.length === 0 && asLinked.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {tx("linked.noAccounts", lang)}
          </p>
        ) : (
          <div className="space-y-3">
            {/* Accounts I manage */}
            {asParent.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {tx("linked.iManage", lang)}
                </p>
                {asParent.map((account) => (
                  <div key={account.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium">
                          {account.linkedName || account.invite_email || "—"}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          <Badge variant="secondary" className="text-[10px]">
                            {relationshipLabel(account.relationship)}
                          </Badge>
                          <Badge
                            variant={account.is_accepted ? "default" : "outline"}
                            className="text-[10px]"
                          >
                            {account.is_accepted
                              ? tx("linked.accepted", lang)
                              : tx("linked.pending", lang)}
                          </Badge>
                          {account.permissions.map((p) => (
                            <Badge key={p} variant="outline" className="text-[10px]">
                              {p === "view_data"
                                ? lang === "tr" ? "Veri" : "View"
                                : p === "pays_subscription"
                                ? lang === "tr" ? "Ödeme" : "Pay"
                                : p === "manage_medications"
                                ? lang === "tr" ? "İlaç" : "Meds"
                                : p}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => removeLinked(account.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Accounts that manage me */}
            {asLinked.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {tx("linked.managedBy", lang)}
                </p>
                {asLinked.map((account) => (
                  <div key={account.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {account.parentName || "—"}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          <Badge variant="secondary" className="text-[10px]">
                            {relationshipLabel(account.relationship)}
                          </Badge>
                          {!account.is_accepted && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-5 text-[10px] gap-1"
                              onClick={() => acceptInvite(account.id)}
                            >
                              <Check className="h-3 w-3" />
                              {tx("linked.accepted", lang).split("!")[0]}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => removeLinked(account.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
