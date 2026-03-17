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
  Plus, X, Loader2, CheckCircle2, Settings, Save, Baby, Wine,
  Cigarette, Stethoscope, Sparkles,
} from "lucide-react";
import type { UserMedication, UserAllergy, AllergySeverity } from "@/lib/database.types";

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
    });
    setEditingHealth(true);
  };

  const saveHealthProfile = async () => {
    if (!profile) return;
    setSavingHealth(true);
    try {
      const supabase = createBrowserClient();
      await supabase
        .from("user_profiles")
        .update({
          is_pregnant: healthForm.is_pregnant,
          is_breastfeeding: healthForm.is_breastfeeding,
          alcohol_use: healthForm.alcohol_use,
          smoking_use: healthForm.smoking_use,
          kidney_disease: healthForm.kidney_disease,
          liver_disease: healthForm.liver_disease,
          recent_surgery: healthForm.recent_surgery,
          chronic_conditions: healthForm.chronic_conditions,
          height_cm: healthForm.height_cm,
          weight_kg: healthForm.weight_kg,
          blood_group: healthForm.blood_group || null,
          diet_type: healthForm.diet_type || null,
          exercise_frequency: healthForm.exercise_frequency || null,
          sleep_quality: healthForm.sleep_quality || null,
          supplements: healthForm.supplements,
        })
        .eq("id", profile.id);
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

  const confirmMedicationsCurrent = async () => {
    if (!profile) return;
    setConfirming(true);
    try {
      const supabase = createBrowserClient();
      await supabase
        .from("user_profiles")
        .update({ last_medication_update: new Date().toISOString() })
        .eq("id", profile.id);
      await refreshProfile();
    } catch (err) {
      console.error("Failed to confirm medications:", err);
    } finally {
      setConfirming(false);
    }
  };

  if (isLoading || !profile) {
    return (
      <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-heading mb-6 text-3xl font-semibold">
        {tx('profile.title', lang)}
      </h1>

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
                  : (lang === "tr" ? "Hiçbir zaman" : "Never")}
              </CardDescription>
            </div>
            {!isAddingMed && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => setIsAddingMed(true)}
              >
                <Plus className="h-4 w-4" />
                {tx('profile.addMed', lang)}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
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
                  {lang === "tr" ? "İptal" : "Cancel"}
                </Button>
              </div>
            </div>
          )}

          {/* Confirm medications are current */}
          <Separator />
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-primary/30 text-primary hover:bg-primary/10"
            onClick={confirmMedicationsCurrent}
            disabled={confirming}
          >
            {confirming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            {tx('profile.confirmCurrent', lang)}
          </Button>
        </CardContent>
      </Card>

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
            <p className="text-sm text-muted-foreground">
              {tx('profile.noAllergies', lang)}
            </p>
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
          {profile.is_pregnant && <Badge variant="outline">{lang === "tr" ? "Hamile" : "Pregnant"}</Badge>}
          {profile.is_breastfeeding && <Badge variant="outline">{lang === "tr" ? "Emziriyor" : "Breastfeeding"}</Badge>}
          {profile.kidney_disease && <Badge variant="destructive">{lang === "tr" ? "Böbrek Hastalığı" : "Kidney Disease"}</Badge>}
          {profile.liver_disease && <Badge variant="destructive">{lang === "tr" ? "Karaciğer Hastalığı" : "Liver Disease"}</Badge>}
          {profile.recent_surgery && <Badge variant="outline">{lang === "tr" ? "Yakın Ameliyat" : "Recent Surgery"}</Badge>}
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
              {tr ? "Sağlık Profilini Düzenle" : "Edit Health Profile"}
            </CardTitle>
            {!editingHealth ? (
              <Button variant="outline" size="sm" onClick={startEditingHealth}>
                {tr ? "Düzenle" : "Edit"}
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
                  {tr ? "Kaydet" : "Save"}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setEditingHealth(false)}>
                  {tr ? "İptal" : "Cancel"}
                </Button>
              </div>
            )}
          </div>
          <CardDescription>
            {tr
              ? "Alerjiler, gebelik, madde kullanımı, kronik hastalıklar ve yaşam tarzı bilgilerinizi buradan güncelleyebilirsiniz."
              : "Update your allergies, pregnancy status, substance use, chronic conditions, and lifestyle info here."}
          </CardDescription>
        </CardHeader>

        {editingHealth && (
          <CardContent className="space-y-6">
            {/* Allergies Section */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-base font-semibold">
                <AlertTriangle className="h-4 w-4" />
                {tr ? "Alerjiler" : "Allergies"}
              </Label>
              <div className="flex flex-wrap gap-2">
                {allergies.map((allergy) => (
                  <Badge key={allergy.id} variant="destructive" className="gap-1">
                    {allergy.allergen} ({allergy.severity})
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeAllergy(allergy.id)} />
                  </Badge>
                ))}
                {allergies.length === 0 && (
                  <p className="text-sm text-muted-foreground">{tr ? "Alerji yok" : "No allergies"}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder={tr ? "Alerjen adı..." : "Allergen name..."}
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
                    <SelectItem value="mild">{tr ? "Hafif" : "Mild"}</SelectItem>
                    <SelectItem value="moderate">{tr ? "Orta" : "Moderate"}</SelectItem>
                    <SelectItem value="severe">{tr ? "Şiddetli" : "Severe"}</SelectItem>
                    <SelectItem value="anaphylaxis">{tr ? "Anafilaksi" : "Anaphylaxis"}</SelectItem>
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
                {tr ? "Gebelik / Emzirme" : "Pregnancy / Breastfeeding"}
              </Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-pregnant"
                    checked={healthForm.is_pregnant}
                    onCheckedChange={(c) => setHealthForm((p): HealthFormState => ({ ...p, is_pregnant: c === true }))}
                  />
                  <Label htmlFor="edit-pregnant" className="font-normal">{tr ? "Hamile" : "Pregnant"}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-bf"
                    checked={healthForm.is_breastfeeding}
                    onCheckedChange={(c) => setHealthForm((p): HealthFormState => ({ ...p, is_breastfeeding: c === true }))}
                  />
                  <Label htmlFor="edit-bf" className="font-normal">{tr ? "Emziriyor" : "Breastfeeding"}</Label>
                </div>
              </div>
            </div>

            <Separator />

            {/* Substance Use */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-base font-semibold">
                  <Wine className="h-4 w-4" />
                  {tr ? "Alkol" : "Alcohol"}
                </Label>
                <RadioGroup
                  value={healthForm.alcohol_use}
                  onValueChange={(v) => v && setHealthForm((p): HealthFormState => ({ ...p, alcohol_use: v }))}
                >
                  {[
                    { value: "none", en: "None", tr: "Kullanmıyorum" },
                    { value: "occasional", en: "Occasional", tr: "Ara sıra" },
                    { value: "regular", en: "Regular", tr: "Düzenli" },
                    { value: "heavy", en: "Heavy", tr: "Ağır" },
                  ].map((opt) => (
                    <div key={opt.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={opt.value} id={`edit-alc-${opt.value}`} />
                      <Label htmlFor={`edit-alc-${opt.value}`} className="font-normal">{tr ? opt.tr : opt.en}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-base font-semibold">
                  <Cigarette className="h-4 w-4" />
                  {tr ? "Sigara" : "Smoking"}
                </Label>
                <RadioGroup
                  value={healthForm.smoking_use}
                  onValueChange={(v) => v && setHealthForm((p): HealthFormState => ({ ...p, smoking_use: v }))}
                >
                  {[
                    { value: "none", en: "Never", tr: "Hiç içmedim" },
                    { value: "former", en: "Former", tr: "Eski içici" },
                    { value: "current", en: "Current", tr: "Aktif içici" },
                  ].map((opt) => (
                    <div key={opt.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={opt.value} id={`edit-smk-${opt.value}`} />
                      <Label htmlFor={`edit-smk-${opt.value}`} className="font-normal">{tr ? opt.tr : opt.en}</Label>
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
                {tr ? "Tıbbi Geçmiş" : "Medical History"}
              </Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-kidney"
                    checked={healthForm.kidney_disease}
                    onCheckedChange={(c) => setHealthForm((p): HealthFormState => ({ ...p, kidney_disease: c === true }))}
                  />
                  <Label htmlFor="edit-kidney" className="font-normal">{tr ? "Böbrek hastalığı" : "Kidney disease"}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-liver"
                    checked={healthForm.liver_disease}
                    onCheckedChange={(c) => setHealthForm((p): HealthFormState => ({ ...p, liver_disease: c === true }))}
                  />
                  <Label htmlFor="edit-liver" className="font-normal">{tr ? "Karaciğer hastalığı" : "Liver disease"}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-surgery"
                    checked={healthForm.recent_surgery}
                    onCheckedChange={(c) => setHealthForm((p): HealthFormState => ({ ...p, recent_surgery: c === true }))}
                  />
                  <Label htmlFor="edit-surgery" className="font-normal">{tr ? "Son 3 ayda ameliyat" : "Recent surgery (last 3 months)"}</Label>
                </div>
              </div>
              <div className="mt-2">
                <Label className="text-sm">{tr ? "Kronik Hastalıklar" : "Chronic Conditions"}</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["Diabetes", "Hypertension", "Asthma", "Heart Disease", "Thyroid Disorder", "Arthritis", "Depression", "Anxiety", "COPD", "Epilepsy"].map((c) => (
                    <Badge
                      key={c}
                      variant={healthForm.chronic_conditions.includes(c) ? "default" : "outline"}
                      className="cursor-pointer transition-colors"
                      onClick={() => toggleCondition(c)}
                    >
                      {tr ? ({
                        "Diabetes": "Diyabet", "Hypertension": "Hipertansiyon", "Asthma": "Astım",
                        "Heart Disease": "Kalp Hastalığı", "Thyroid Disorder": "Tiroid Bozukluğu",
                        "Arthritis": "Artrit", "Depression": "Depresyon", "Anxiety": "Anksiyete",
                        "COPD": "KOAH", "Epilepsy": "Epilepsi",
                      } as Record<string, string>)[c] || c : c}
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
                    placeholder={tr ? "Diğer hastalık..." : "Other condition..."}
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
                {tr ? "Yaşam Tarzı" : "Lifestyle"}
              </Label>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-sm">{tr ? "Boy (cm)" : "Height (cm)"}</Label>
                  <Input
                    type="number"
                    placeholder={tr ? "ör. 175" : "e.g., 175"}
                    value={healthForm.height_cm ?? ""}
                    onChange={(e) => setHealthForm((p): HealthFormState => ({ ...p, height_cm: e.target.value ? parseInt(e.target.value) : null }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm">{tr ? "Kilo (kg)" : "Weight (kg)"}</Label>
                  <Input
                    type="number"
                    placeholder={tr ? "ör. 70" : "e.g., 70"}
                    value={healthForm.weight_kg ?? ""}
                    onChange={(e) => setHealthForm((p): HealthFormState => ({ ...p, weight_kg: e.target.value ? parseFloat(e.target.value) : null }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-sm">{tr ? "Kan Grubu" : "Blood Group"}</Label>
                  <Select value={healthForm.blood_group} onValueChange={(v) => v && setHealthForm((p): HealthFormState => ({ ...p, blood_group: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder={tr ? "Seçin" : "Select"} />
                    </SelectTrigger>
                    <SelectContent>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm">{tr ? "Diyet Türü" : "Diet Type"}</Label>
                  <Select value={healthForm.diet_type} onValueChange={(v) => v && setHealthForm((p): HealthFormState => ({ ...p, diet_type: v }))}>
                    <SelectTrigger>
                      {healthForm.diet_type ? (
                        <span>{({ regular: tr ? "Normal" : "Regular", vegetarian: tr ? "Vejetaryen" : "Vegetarian", vegan: "Vegan", keto: "Keto", gluten_free: tr ? "Glutensiz" : "Gluten-free", halal: tr ? "Helal" : "Halal", other: tr ? "Diğer" : "Other" } as Record<string, string>)[healthForm.diet_type] || healthForm.diet_type}</span>
                      ) : (
                        <SelectValue placeholder={tr ? "Seçin" : "Select"} />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        { v: "regular", en: "Regular", tr: "Normal" },
                        { v: "vegetarian", en: "Vegetarian", tr: "Vejetaryen" },
                        { v: "vegan", en: "Vegan", tr: "Vegan" },
                        { v: "keto", en: "Keto", tr: "Keto" },
                        { v: "gluten_free", en: "Gluten-free", tr: "Glutensiz" },
                        { v: "halal", en: "Halal", tr: "Helal" },
                        { v: "other", en: "Other", tr: "Diğer" },
                      ].map((opt) => (
                        <SelectItem key={opt.v} value={opt.v}>{tr ? opt.tr : opt.en}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-sm">{tr ? "Egzersiz" : "Exercise"}</Label>
                  <Select value={healthForm.exercise_frequency} onValueChange={(v) => v && setHealthForm((p): HealthFormState => ({ ...p, exercise_frequency: v }))}>
                    <SelectTrigger>
                      {healthForm.exercise_frequency ? (
                        <span>{({ sedentary: tr ? "Hareketsiz" : "Sedentary", light: tr ? "Hafif (1-2/hafta)" : "Light (1-2x/week)", moderate: tr ? "Orta (3-4/hafta)" : "Moderate (3-4x/week)", active: tr ? "Aktif (5+/hafta)" : "Active (5+x/week)", athlete: tr ? "Sporcu" : "Athlete" } as Record<string, string>)[healthForm.exercise_frequency] || healthForm.exercise_frequency}</span>
                      ) : (
                        <SelectValue placeholder={tr ? "Seçin" : "Select"} />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        { v: "sedentary", en: "Sedentary", tr: "Hareketsiz" },
                        { v: "light", en: "Light (1-2x/week)", tr: "Hafif (1-2/hafta)" },
                        { v: "moderate", en: "Moderate (3-4x/week)", tr: "Orta (3-4/hafta)" },
                        { v: "active", en: "Active (5+x/week)", tr: "Aktif (5+/hafta)" },
                        { v: "athlete", en: "Athlete", tr: "Sporcu" },
                      ].map((opt) => (
                        <SelectItem key={opt.v} value={opt.v}>{tr ? opt.tr : opt.en}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm">{tr ? "Uyku" : "Sleep"}</Label>
                  <Select value={healthForm.sleep_quality} onValueChange={(v) => v && setHealthForm((p): HealthFormState => ({ ...p, sleep_quality: v }))}>
                    <SelectTrigger>
                      {healthForm.sleep_quality ? (
                        <span>{({ good: tr ? "İyi (7-9 saat)" : "Good (7-9 hours)", fair: tr ? "Orta" : "Fair", poor: tr ? "Kötü" : "Poor", insomnia: tr ? "Uykusuzluk" : "Insomnia" } as Record<string, string>)[healthForm.sleep_quality] || healthForm.sleep_quality}</span>
                      ) : (
                        <SelectValue placeholder={tr ? "Seçin" : "Select"} />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        { v: "good", en: "Good (7-9 hours)", tr: "İyi (7-9 saat)" },
                        { v: "fair", en: "Fair", tr: "Orta" },
                        { v: "poor", en: "Poor", tr: "Kötü" },
                        { v: "insomnia", en: "Insomnia", tr: "Uykusuzluk" },
                      ].map((opt) => (
                        <SelectItem key={opt.v} value={opt.v}>{tr ? opt.tr : opt.en}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Supplements */}
              <div className="space-y-2">
                <Label className="text-sm">{tr ? "Takviyeler" : "Supplements"}</Label>
                <div className="flex flex-wrap gap-2">
                  {["Vitamin D", "Vitamin B12", "Iron", "Omega-3", "Magnesium", "Zinc", "Probiotics", "Multivitamin"].map((s) => (
                    <Badge
                      key={s}
                      variant={healthForm.supplements.includes(s) ? "default" : "outline"}
                      className="cursor-pointer transition-colors"
                      onClick={() => toggleSupplement(s)}
                    >
                      {tr ? ({
                        "Vitamin D": "D Vitamini", "Vitamin B12": "B12 Vitamini", "Iron": "Demir",
                        "Omega-3": "Omega-3", "Magnesium": "Magnezyum", "Zinc": "Çinko",
                        "Probiotics": "Probiyotikler", "Multivitamin": "Multivitamin",
                      } as Record<string, string>)[s] || s : s}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        )}

        {!editingHealth && (
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {tr
                ? "Sağlık profilinizi güncellemek için \"Düzenle\" butonuna tıklayın."
                : "Click \"Edit\" to update your health profile."}
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
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              {tx('profile.downloadData', lang)}
            </Button>
            <Button variant="destructive" className="gap-2">
              <Trash2 className="h-4 w-4" />
              {tx('profile.deleteAccount', lang)}
            </Button>
          </div>
          <Separator className="my-4" />
          <p className="text-xs text-muted-foreground">
            {tx('profile.dataNote', lang)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
