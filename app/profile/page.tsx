// © 2026 Doctopal — All Rights Reserved
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { createBrowserClient } from "@/lib/supabase";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  User, Pill, AlertTriangle, Heart, Shield, Trash2,
  Plus, X, Loader2, CheckCircle2, Check, Settings, Save, Baby, Wine,
  Cigarette, Stethoscope, Sparkles, Camera, MapPin, Users, Mail,
  UserPlus, ChevronDown, ChevronUp, Phone, Edit3, Star,
} from "lucide-react";
import type { UserMedication, UserAllergy, AllergySeverity } from "@/lib/database.types";
import { MedicationScanner } from "@/components/scanner/MedicationScanner";
import { shouldAskPermission } from "@/lib/permission-state";
import { PermissionBottomSheet } from "@/components/permissions/PermissionBottomSheet";
import { VaccineProfileSection } from "@/components/profile/VaccineProfileSection";

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
  // Data export/delete moved to Settings page
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
  // Permission bottom sheet
  const [showNotifPermission, setShowNotifPermission] = useState(false);

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
  const [newAllergenSeverity, setNewAllergenSeverity] = useState<AllergySeverity>("unknown");

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
      // Always include all fields — columns confirmed to exist in user_profiles
      updateData.height_cm = healthForm.height_cm || null;
      updateData.weight_kg = healthForm.weight_kg || null;
      updateData.blood_group = healthForm.blood_group || null;
      updateData.diet_type = healthForm.diet_type || null;
      updateData.exercise_frequency = healthForm.exercise_frequency || null;
      updateData.sleep_quality = healthForm.sleep_quality || null;
      updateData.country = healthForm.country || null;
      updateData.city = healthForm.city || null;
      updateData.phone = healthForm.phone || null;
      updateData.recovery_email = healthForm.recovery_email || null;

      const { error } = await supabase
        .from("user_profiles")
        .update(updateData)
        .eq("id", user!.id);

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
          .eq("id", user!.id);
        if (retryError) console.error("Retry also failed:", retryError);
      }
      await refreshProfile();
      setEditingHealth(false);
      showSaveToast();
    } catch (err) {
      console.error("Failed to save health profile:", err);
    } finally {
      setSavingHealth(false);
    }
  };

  const [saveSuccess, setSaveSuccess] = useState(false);

  const showSaveToast = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const addAllergy = async () => {
    if (!newAllergen.trim() || !user) return;
    try {
      const supabase = createBrowserClient();
      const { data, error } = await supabase.from("user_allergies").insert({
        user_id: user.id,
        allergen: newAllergen.trim(),
        severity: newAllergenSeverity,
      }).select().single();
      if (error) { console.error("Allergy insert error:", error); return; }
      if (data) setAllergies((prev) => [...prev, data as UserAllergy]);
      setNewAllergen("");
      setNewAllergenSeverity("unknown");
      showSaveToast();
    } catch (err) {
      console.error("Failed to add allergy:", err);
    }
  };

  const removeAllergy = async (id: string) => {
    try {
      const supabase = createBrowserClient();
      const { error } = await supabase.from("user_allergies").delete().eq("id", id);
      if (!error) {
        setAllergies((prev) => prev.filter((a) => a.id !== id));
        showSaveToast();
      }
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
    if (!user) return;
    const supabase = createBrowserClient();

    Promise.all([
      supabase.from("user_medications").select("*").eq("user_id", user.id).eq("is_active", true),
      supabase.from("user_allergies").select("*").eq("user_id", user.id),
    ]).then(([medsRes, allergyRes]) => {
      if (medsRes.data) setMedications(medsRes.data as UserMedication[]);
      if (allergyRes.data) setAllergies(allergyRes.data as UserAllergy[]);
    }).catch(() => { /* silent */ });
  }, [user]);

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
    if (!newBrandName.trim() || !user) return;
    setSavingMed(true);
    try {
      const supabase = createBrowserClient();
      const { data, error } = await supabase.from("user_medications").insert({
        user_id: user.id,
        brand_name: newBrandName.trim(),
        generic_name: newGenericName.trim() || null,
        dosage: newDosage.trim() || null,
        frequency: newFrequency.trim() || null,
        is_active: true,
      }).select().single();
      if (error) { console.error("Med insert error:", error); setSavingMed(false); return; }
      if (data) setMedications((prev) => [...prev, data as UserMedication]);
      setNewBrandName("");
      setNewGenericName("");
      setNewDosage("");
      setNewFrequency("");
      setIsAddingMed(false);
      showSaveToast();
      // Ask for notification permission on first med save
      if (shouldAskPermission("notification")) {
        setTimeout(() => setShowNotifPermission(true), 500);
      }
    } catch (err) {
      console.error("Failed to add medication:", err);
    } finally {
      setSavingMed(false);
    }
  };

  const removeMedication = async (id: string) => {
    try {
      const supabase = createBrowserClient();
      const { error } = await supabase.from("user_medications").update({ is_active: false }).eq("id", id);
      if (!error) {
        setMedications((prev) => prev.filter((m) => m.id !== id));
        showSaveToast();
      }
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
        .eq("id", user!.id);
      refreshProfile().catch(() => {});
      localStorage.setItem(MED_CONFIRM_KEY, new Date().toISOString());
      setMedConfirmed(true);
    } catch (err) {
      console.error("Failed to confirm medications:", err);
    }
    setConfirming(false);
  };

  if (isLoading || !profile) {
    return <PageSkeleton variant="form" />;
  }

  // ── Profile Completion Score (Endowed Progress Effect — starts at 20%) ──
  const completionChecks = [
    { id: "account", done: true, label: tx("profile.accountCreated", lang) },
    { id: "name", done: !!profile.full_name, label: tx("profile.nameEntered", lang) },
    { id: "meds", done: medications.length > 0, label: tx("profile.medsAdded", lang) },
    { id: "allergies", done: allergies.length > 0, label: tx("profile.allergiesEntered", lang) },
    { id: "lifestyle", done: !!(profile.alcohol_use || profile.smoking_use), label: tx("profile.lifestyleInfo", lang) },
    { id: "medical", done: profile.kidney_disease !== null && profile.kidney_disease !== undefined, label: tx("profile.medicalHistory", lang) },
    { id: "body", done: !!(profile.height_cm && profile.weight_kg), label: tx("profile.heightWeight", lang) },
    { id: "blood", done: !!(profile.blood_group), label: tx("profile.bloodGroup", lang) },
  ];
  const completedCount = completionChecks.filter(c => c.done).length;
  const completionPct = Math.round((completedCount / completionChecks.length) * 100);
  const nextIncomplete = completionChecks.find(c => !c.done);

  // Clinical motivation message based on missing field
  const getMotivation = () => {
    if (!nextIncomplete) return null;
    const motivMap: Record<string, { msgKey: string; ctaKey: string; href: string }> = {
      meds: { msgKey: "profile.motiv.meds", ctaKey: "profile.motiv.ctaMeds", href: "#medications" },
      allergies: { msgKey: "profile.motiv.allergies", ctaKey: "profile.motiv.ctaAllergies", href: "#allergies" },
      medical: { msgKey: "profile.motiv.medical", ctaKey: "profile.motiv.ctaMedical", href: "#medical-history" },
      name: { msgKey: "profile.motiv.name", ctaKey: "profile.motiv.ctaName", href: "#personal-info" },
      lifestyle: { msgKey: "profile.motiv.lifestyle", ctaKey: "profile.motiv.ctaLifestyle", href: "#personal-info" },
      body: { msgKey: "profile.motiv.body", ctaKey: "profile.motiv.ctaBody", href: "#edit-health" },
      blood: { msgKey: "profile.motiv.blood", ctaKey: "profile.motiv.ctaBlood", href: "#edit-health" },
    };
    const m = motivMap[nextIncomplete.id];
    if (!m) return null;
    // Percentage-based general message
    const generalKey = completionPct >= 80 ? "profile.motiv.almost" : completionPct >= 50 ? "profile.motiv.good" : "profile.motiv.start";
    return { message: tx(m.msgKey, lang), cta: tx(m.ctaKey, lang), href: m.href, general: tx(generalKey, lang) };
  };
  const motivation = getMotivation();

  return (
    <div className="mx-auto max-w-4xl px-4 md:px-8 py-8">
      {/* Save success toast */}
      {saveSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-sm font-medium">{tx("common.saved", lang)}</span>
        </div>
      )}

      <h1 className="font-heading mb-4 text-3xl font-semibold">
        {tx('profile.title', lang)}
      </h1>

      {/* ── DIGITAL TWIN HERO ── */}
      {profile && (
        <div className="relative mb-6 rounded-2xl border bg-gradient-to-br from-primary/5 via-emerald-500/5 to-teal-500/5 p-6 shadow-sm overflow-hidden">
          {/* ── Allergy / Critical Status Badge (top-right) ── */}
          {(() => {
            const hasAnaphylaxis = allergies.some((a: UserAllergy) => a.severity === "anaphylaxis");
            const hasAllergies = allergies.length > 0;
            const isPregnant = profile.is_pregnant;

            return (
              <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex flex-col gap-1.5 z-10">
                {hasAnaphylaxis && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-lg animate-pulse">
                    🚨 {tr ? "Anafilaksi" : "Anaphylaxis"}
                  </span>
                )}
                {!hasAnaphylaxis && hasAllergies && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-bold text-white shadow">
                    ⚠️ {allergies.length} {tr ? "Alerji" : allergies.length === 1 ? "Allergy" : "Allergies"}
                  </span>
                )}
                {!hasAllergies && !hasAnaphylaxis && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-500 px-2.5 py-1 text-[10px] font-bold text-white shadow">
                    🛡️ {tr ? "Alerji Yok" : "No Allergies"}
                  </span>
                )}
                {isPregnant && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-500 px-2.5 py-1 text-[10px] font-bold text-white shadow">
                    🤰 {tr ? "Gebelik" : "Pregnancy"}
                  </span>
                )}
              </div>
            );
          })()}

          {/* Avatar + Name + Member since */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-primary bg-gradient-to-br from-primary/20 to-emerald-500/20 text-3xl font-bold text-primary shadow-xl">
                {profile.full_name
                  ? profile.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
                  : user?.email?.[0]?.toUpperCase() ?? "U"}
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow">
                <span className="text-xs font-bold">✓</span>
              </div>
            </div>
            {/* Info + Score */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-bold">
                {profile.full_name || user?.email?.split("@")[0] || "Member"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {tr ? "Üye:" : "Member since:"}{" "}
                {new Date(user?.created_at || Date.now()).toLocaleDateString(tr ? "tr-TR" : "en-US", { month: "long", year: "numeric" })}
              </p>
              {/* Streak badge */}
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-400">
                🔥 {tr ? "12 günlük seri" : "12-day streak"}
              </div>
            </div>
            {/* Vitality Score — ring + bar + heartbeat */}
            {(() => {
              const score = 78;
              const scoreColor = score >= 71 ? "#3c7a52" : score >= 41 ? "#f59e0b" : "#ef4444";
              const scoreEmoji = score >= 71 ? "⚡" : score >= 41 ? "😐" : "🔴";
              const scoreLabel = score >= 71
                ? (tr ? "Harika form" : "Great shape")
                : score >= 41
                  ? (tr ? "Gelişme var" : "Improving")
                  : (tr ? "Dikkat gerekiyor" : "Needs attention");
              const ringClass = score >= 71 ? "text-emerald-500" : score >= 41 ? "text-amber-500" : "text-red-500";

              return (
                <div className="flex flex-col items-center gap-2 shrink-0">
                  {/* Ring + Heartbeat SVG side by side */}
                  <div className="flex items-center gap-2">
                    <div className="relative flex h-20 w-20 items-center justify-center">
                      <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-muted/30" />
                        <motion.circle cx="18" cy="18" r="16" fill="none" stroke={scoreColor} strokeWidth="2.5"
                          strokeLinecap="round" initial={{ strokeDasharray: "0 100" }}
                          animate={{ strokeDasharray: `${score} 100` }}
                          transition={{ duration: 1.2, ease: "easeOut" }} />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-lg font-bold leading-none">{score}</span>
                        <span className="text-[8px] text-muted-foreground font-medium">/100</span>
                      </div>
                    </div>
                    {/* Decorative heartbeat SVG */}
                    <svg width="80" height="24" viewBox="0 0 80 24" className="opacity-60 overflow-hidden">
                      <motion.path
                        d="M0 12 L10 12 L15 4 L20 20 L25 8 L30 16 L35 12 L45 12 L50 4 L55 20 L60 8 L65 16 L70 12 L80 12"
                        fill="none" stroke={scoreColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 0.6 }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                      />
                    </svg>
                  </div>
                  {/* Score label */}
                  <p className="text-[10px] text-muted-foreground font-medium text-center">
                    {tr ? "Canlılık Skoru" : "Vitality Score"}
                  </p>

                  {/* Energy bar */}
                  <div className="w-full max-w-[160px] space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-medium" style={{ color: scoreColor }}>{scoreEmoji} {scoreLabel}</span>
                      <span className="text-muted-foreground">{score}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background: `linear-gradient(90deg, ${scoreColor}, ${scoreColor}aa)`,
                          boxShadow: `0 0 12px ${scoreColor}66`,
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Bento metrics */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-white/60 dark:bg-card/60 border p-3 text-center shadow-sm">
              <p className="text-xl font-bold text-primary">{medications.length || 0}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">💊 {tr ? "Aktif İlaç" : "Active Medications"}</p>
            </div>
            <div className="rounded-xl bg-white/60 dark:bg-card/60 border p-3 text-center shadow-sm">
              <p className="text-xl font-bold text-emerald-600">{(profile.supplements || []).length || 0}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">🌿 {tr ? "Günlük Takviye" : "Daily Supplements"}</p>
            </div>
            <div className="rounded-xl bg-white/60 dark:bg-card/60 border p-3 text-center shadow-sm">
              <p className="text-xl font-bold text-blue-600">4</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">🩸 {tr ? "Yüklenen Tahlil" : "Lab Tests"}</p>
            </div>
          </div>

          {/* Achievement Badges preview — metalik */}
          <div className="mt-5">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              🏆 {tr ? "Başarı Rozetleri" : "Achievement Badges"}
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { icon: "💧", label: tr ? "Hidrasyon Ustası" : "Hydration Master", earned: true, cat: "engagement" as const },
                { icon: "🌿", label: tr ? "Fitoterapist" : "Phyto Streak", earned: true, cat: "health" as const },
                { icon: "🩸", label: tr ? "Lab Savaşçısı" : "Lab Warrior", earned: false, cat: "health" as const },
                { icon: "🛡️", label: tr ? "Kalkan Ustası" : "Shield Master", earned: false, cat: "milestone" as const },
                { icon: "🧬", label: tr ? "DNA Kaşifi" : "DNA Explorer", earned: false, cat: "social" as const },
                { icon: "🏔️", label: tr ? "Şampiyon" : "Challenge Champion", earned: false, cat: "milestone" as const },
              ].map((b, i) => {
                const gradients: Record<string, { bg: string; shadow: string }> = {
                  health: { bg: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)", shadow: "0 4px 15px rgba(132,250,176,0.4)" },
                  engagement: { bg: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", shadow: "0 4px 15px rgba(79,172,254,0.4)" },
                  social: { bg: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)", shadow: "0 4px 15px rgba(161,140,209,0.4)" },
                  milestone: { bg: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)", shadow: "0 4px 15px rgba(253,160,133,0.4)" },
                };
                const g = gradients[b.cat] || gradients.health;
                return (
                  <motion.div key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.08, type: "spring", stiffness: 300, damping: 20 }}
                    className={`relative flex flex-col items-center rounded-lg p-2 text-center text-[10px] border transition-all ${
                      b.earned
                        ? "text-white hover:scale-105 cursor-default"
                        : "bg-gray-100 dark:bg-gray-800/30 border-dashed border-gray-200 dark:border-gray-700"
                    }`}
                    style={b.earned ? { background: g.bg, boxShadow: g.shadow } : {}}>
                    <span className={`text-xl ${b.earned ? "drop-shadow-md" : "grayscale opacity-30"}`}>{b.icon}</span>
                    <span className={`mt-0.5 leading-tight line-clamp-1 ${b.earned ? "text-white/90 font-semibold" : "text-gray-400"}`}>{b.label}</span>
                    {!b.earned && <span className="absolute top-1 right-1 text-[8px] text-gray-400">🔒</span>}
                    {b.earned && (
                      <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none"
                        style={{ background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s ease-out forwards" }} />
                    )}
                  </motion.div>
                );
              })}
            </div>
            <style jsx>{`@keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }`}</style>
          </div>

          {/* Recent Activity micro-feed */}
          <div className="mt-5">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              📋 {tr ? "Son Aktiviteler" : "Recent Activity"}
            </h3>
            <div className="space-y-2">
              {[
                { icon: "✅", text: tr ? "İlaç etkileşimi kontrol edildi" : "Checked drug interaction", time: tr ? "2s önce" : "2h ago" },
                { icon: "🩸", text: tr ? "Kan tahlili yüklendi" : "Uploaded blood test", time: tr ? "Dün" : "Yesterday" },
                { icon: "💊", text: tr ? "İlaçlar güncellendi" : "Updated medications", time: tr ? "3 gün önce" : "3 days ago" },
              ].map((act, i) => (
                <div key={i} className="flex items-center gap-2.5 rounded-lg bg-white/40 dark:bg-white/5 px-3 py-2">
                  <span className="text-sm">{act.icon}</span>
                  <span className="flex-1 text-xs text-muted-foreground">{act.text}</span>
                  <span className="text-[10px] text-muted-foreground/60">{act.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Profile Completion Card ── */}
      {completionPct < 100 && (
        <div className="mb-6 rounded-xl border bg-gradient-to-r from-primary/5 to-amber-500/5 p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                {tx("profile.completion", lang)}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {tx("profile.moreInfoBetter", lang)}
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
          {/* Clinical motivation nudge */}
          {motivation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.3 }}
              className="bg-amber-50 dark:bg-amber-950/20 rounded-lg px-3 py-2.5 space-y-1.5"
            >
              <p className="text-xs text-amber-700 dark:text-amber-400 flex items-start gap-1.5">
                <span className="shrink-0 mt-0.5">💡</span>
                <span>{motivation.message}</span>
              </p>
              <a href={motivation.href} className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline">
                {motivation.cta}
              </a>
            </motion.div>
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
              {tx("profile.complete100", lang)}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400">
              {tx("profile.completeMsg", lang)}
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
            <p className="text-sm text-muted-foreground">{tr ? "Sana nasıl hitap edelim" : "Display Name"}</p>
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
            <p className="font-medium capitalize">
              {(() => {
                const genderLabels: Record<string, Record<string, string>> = {
                  male: { en: "Male", tr: "Erkek" },
                  female: { en: "Female", tr: "Kadın" },
                  other: { en: "Other", tr: "Diğer" },
                  prefer_not_to_say: { en: "Prefer not to say", tr: "Belirtmek istemiyorum" },
                };
                const g = profile.gender || "";
                return genderLabels[g]?.[lang] || g.replace("_", " ") || "—";
              })()}
            </p>
          </div>
          {/* Substance use summary */}
          <div>
            <p className="text-sm text-muted-foreground">{tr ? "Sigara" : "Smoking"}</p>
            <p className="font-medium">
              {(() => {
                const s = (profile.smoking_use || "none").split("|")[0];
                const labels: Record<string, Record<string, string>> = {
                  none: { en: "🟢 Never", tr: "🟢 Hiç içmedim" },
                  former: { en: "🟡 Former", tr: "🟡 Bıraktım" },
                  current: { en: "🔴 Active", tr: "🔴 Aktif" },
                };
                return labels[s]?.[lang] || s;
              })()}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{tr ? "Alkol" : "Alcohol"}</p>
            <p className="font-medium">
              {(() => {
                const a = (profile.alcohol_use || "none").split("|")[0];
                const labels: Record<string, Record<string, string>> = {
                  none: { en: "🟢 Never", tr: "🟢 Hiç içmedim" },
                  former: { en: "🟡 Former", tr: "🟡 Bıraktım" },
                  active: { en: "🔴 Active", tr: "🔴 Aktif" },
                  occasional: { en: "🟡 Occasional", tr: "🟡 Ara sıra" },
                  regular: { en: "🔴 Regular", tr: "🔴 Düzenli" },
                  heavy: { en: "🔴 Heavy", tr: "🔴 Ağır" },
                };
                return labels[a]?.[lang] || a;
              })()}
            </p>
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

      {/* Medical History / Health Flags */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            {tx('profile.medicalHistory', lang)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Critical conditions */}
          {(profile.is_pregnant || profile.is_breastfeeding || profile.kidney_disease || profile.liver_disease || profile.recent_surgery) && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide">
                {tr ? "Kritik Durumlar" : "Critical Conditions"}
              </p>
              <div className="flex flex-wrap gap-2">
                {profile.is_pregnant && <Badge variant="outline" className="border-red-300 text-red-700 dark:text-red-400">🤰 {tx("profile.pregnant", lang)}</Badge>}
                {profile.is_breastfeeding && <Badge variant="outline" className="border-red-300 text-red-700 dark:text-red-400">🤱 {tx("profile.breastfeeding", lang)}</Badge>}
                {profile.kidney_disease && <Badge variant="destructive">{tx("onb.advancedOrganFailure", lang)}</Badge>}
                {profile.liver_disease && <Badge variant="destructive">🩸 {tx("onb.bleedingDisorder", lang)}</Badge>}
                {profile.recent_surgery && <Badge variant="destructive">🛡️ {tx("onb.immuneSuppressed", lang)}</Badge>}
              </div>
            </div>
          )}

          {/* Chronic conditions — grouped by system */}
          {(() => {
            const conditions = profile.chronic_conditions.filter(c => !c.startsWith("family:"));
            if (conditions.length === 0 && !profile.is_pregnant && !profile.is_breastfeeding && !profile.kidney_disease && !profile.liver_disease && !profile.recent_surgery) {
              return (
                <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-950/20 p-3 border border-green-200 dark:border-green-800">
                  <span className="text-green-600">🟢</span>
                  <p className="text-sm text-green-700 dark:text-green-400">{tx("onb.noChronic", lang)}</p>
                </div>
              );
            }
            if (conditions.length > 0) {
              // Group conditions by system
              const cardio = ["Hypertension", "Arrhythmia", "Heart Failure"];
              const endo = ["Diabetes", "Thyroid Disorder"];
              const neuro = ["Depression/Anxiety", "Epilepsy"];
              const resp = ["Asthma", "COPD"];
              const surg = ["Bariatric Surgery"];
              const groups = [
                { label: tr ? "Kardiyovasküler" : "Cardiovascular", items: conditions.filter(c => cardio.includes(c)) },
                { label: tr ? "Endokrin" : "Endocrine", items: conditions.filter(c => endo.includes(c)) },
                { label: tr ? "Nörolojik" : "Neurological", items: conditions.filter(c => neuro.includes(c)) },
                { label: tr ? "Solunum" : "Respiratory", items: conditions.filter(c => resp.includes(c)) },
                { label: tr ? "Cerrahi" : "Surgical", items: conditions.filter(c => surg.includes(c)) },
              ].filter(g => g.items.length > 0);
              const others = conditions.filter(c => ![...cardio, ...endo, ...neuro, ...resp, ...surg].includes(c));

              return (
                <div className="space-y-2">
                  {groups.map(g => (
                    <div key={g.label}>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{g.label}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {g.items.map(c => <Badge key={c} variant="secondary">{c}</Badge>)}
                      </div>
                    </div>
                  ))}
                  {others.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {others.map(c => <Badge key={c} variant="secondary">{c}</Badge>)}
                    </div>
                  )}
                </div>
              );
            }
            return null;
          })()}

          {/* Family History */}
          {profile.chronic_conditions.filter(c => c.startsWith("family:")).length > 0 && (
            <div className="space-y-2 border-t pt-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                🧬 {tr ? "Soygeçmiş" : "Family History"}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {profile.chronic_conditions.filter(c => c.startsWith("family:")).map((c) => (
                  <Badge key={c} variant="outline" className="text-xs">{c.replace("family:", "")}</Badge>
                ))}
              </div>
            </div>
          )}
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
            <div>
              <p className="text-sm text-muted-foreground">{tx('profile.noAllergies', lang)}</p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {tx("profile.addAllergiesTip", lang)}
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {allergies.map((allergy) => {
                const reactionLabels: Record<string, string> = {
                  anaphylaxis: "🚨 Anaphylaxis",
                  urticaria: "⚠️ Urticaria",
                  mild_skin: "🟡 Mild",
                  gi_intolerance: "🟠 Intolerance",
                  unknown: "❓ Unknown",
                  mild: "Mild", moderate: "Moderate", severe: "Severe",
                };
                return (
                  <Badge key={allergy.id} variant="destructive">
                    {allergy.allergen} ({reactionLabels[allergy.severity] || allergy.severity})
                  </Badge>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Health Flags card moved up — see above */}

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
                {allergies.map((allergy) => {
                  const rl: Record<string, string> = {
                    anaphylaxis: "🚨", urticaria: "⚠️", mild_skin: "🟡",
                    gi_intolerance: "🟠", unknown: "❓", mild: "M", moderate: "M", severe: "S",
                  };
                  return (
                    <Badge key={allergy.id} variant="destructive" className="gap-1">
                      {rl[allergy.severity] || ""} {allergy.allergen}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeAllergy(allergy.id)} />
                    </Badge>
                  );
                })}
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
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anaphylaxis">{tx("onb.reactionAnaphylaxis", lang)}</SelectItem>
                    <SelectItem value="urticaria">{tx("onb.reactionUrticaria", lang)}</SelectItem>
                    <SelectItem value="mild_skin">{tx("onb.reactionMildSkin", lang)}</SelectItem>
                    <SelectItem value="gi_intolerance">{tx("onb.reactionGI", lang)}</SelectItem>
                    <SelectItem value="unknown">{tx("onb.reactionUnknown", lang)}</SelectItem>
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
                  value={healthForm.alcohol_use.split("|")[0]}
                  onValueChange={(v) => v && setHealthForm((p): HealthFormState => ({ ...p, alcohol_use: v }))}
                >
                  {[
                    { value: "none", label: "🟢", key: "onb.alcNever" },
                    { value: "former", label: "🟡", key: "onb.alcFormer" },
                    { value: "active", label: "🔴", key: "onb.alcActive" },
                  ].map((opt) => (
                    <div key={opt.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={opt.value} id={`edit-alc-${opt.value}`} />
                      <Label htmlFor={`edit-alc-${opt.value}`} className="font-normal">{opt.label} {tx(opt.key, lang)}</Label>
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
                  value={healthForm.smoking_use.split("|")[0]}
                  onValueChange={(v) => v && setHealthForm((p): HealthFormState => ({ ...p, smoking_use: v }))}
                >
                  {[
                    { value: "none", label: "🟢", key: "onb.smokingNever" },
                    { value: "former", label: "🟡", key: "onb.smokingFormer" },
                    { value: "current", label: "🔴", key: "onb.smokingActive" },
                  ].map((opt) => (
                    <div key={opt.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={opt.value} id={`edit-smk-${opt.value}`} />
                      <Label htmlFor={`edit-smk-${opt.value}`} className="font-normal">{opt.label} {tx(opt.key, lang)}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>

            <Separator />

            {/* Critical Conditions */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-base font-semibold text-red-600 dark:text-red-400">
                <Shield className="h-4 w-4" />
                {tx("onb.criticalConditions", lang)}
              </Label>
              <div className="space-y-2 rounded-lg border border-red-200 dark:border-red-800 p-3 bg-red-50/50 dark:bg-red-950/10">
                <div className="flex items-center space-x-2">
                  <Checkbox id="edit-kidney" checked={healthForm.kidney_disease}
                    onCheckedChange={(c) => setHealthForm((p): HealthFormState => ({ ...p, kidney_disease: c === true }))} />
                  <Label htmlFor="edit-kidney" className="font-normal text-sm">{tx("onb.advancedOrganFailure", lang)}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="edit-liver" checked={healthForm.liver_disease}
                    onCheckedChange={(c) => setHealthForm((p): HealthFormState => ({ ...p, liver_disease: c === true }))} />
                  <Label htmlFor="edit-liver" className="font-normal text-sm">🩸 {tx("onb.bleedingDisorder", lang)}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="edit-surgery" checked={healthForm.recent_surgery}
                    onCheckedChange={(c) => setHealthForm((p): HealthFormState => ({ ...p, recent_surgery: c === true }))} />
                  <Label htmlFor="edit-surgery" className="font-normal text-sm">🛡️ {tx("onb.immuneSuppressed", lang)}</Label>
                </div>
              </div>
            </div>

            {/* Chronic Conditions — System Grouped */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-base font-semibold">
                <Stethoscope className="h-4 w-4" />
                {tx("profile.chronicConditions", lang)}
              </Label>

              {/* Cardiovascular */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">{tx("onb.categoryCardio", lang)}</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "Hypertension", key: "onb.hypertension" },
                    { id: "Arrhythmia", key: "onb.arrhythmia" },
                    { id: "Heart Failure", key: "onb.heartFailure" },
                  ].map(c => (
                    <Badge key={c.id} variant={healthForm.chronic_conditions.includes(c.id) ? "default" : "outline"}
                      className="cursor-pointer transition-colors" onClick={() => toggleCondition(c.id)}>
                      {tx(c.key, lang)}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Endocrine */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">{tx("onb.categoryEndocrine", lang)}</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "Diabetes", key: "onb.diabetesType" },
                    { id: "Thyroid Disorder", key: "onb.thyroid" },
                  ].map(c => (
                    <Badge key={c.id} variant={healthForm.chronic_conditions.includes(c.id) ? "default" : "outline"}
                      className="cursor-pointer transition-colors" onClick={() => toggleCondition(c.id)}>
                      {tx(c.key, lang)}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Neurological */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">{tx("onb.categoryNeuro", lang)}</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "Depression/Anxiety", key: "onb.depressionAnxiety" },
                    { id: "Epilepsy", key: "onb.epilepsy" },
                  ].map(c => (
                    <Badge key={c.id} variant={healthForm.chronic_conditions.includes(c.id) ? "default" : "outline"}
                      className="cursor-pointer transition-colors" onClick={() => toggleCondition(c.id)}>
                      {tx(c.key, lang)}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Respiratory */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">{tx("onb.categoryRespiratory", lang)}</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "Asthma", key: "onb.asthma" },
                    { id: "COPD", key: "onb.copd" },
                  ].map(c => (
                    <Badge key={c.id} variant={healthForm.chronic_conditions.includes(c.id) ? "default" : "outline"}
                      className="cursor-pointer transition-colors" onClick={() => toggleCondition(c.id)}>
                      {tx(c.key, lang)}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Surgical */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">{tx("onb.categorySurgical", lang)}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={healthForm.chronic_conditions.includes("Bariatric Surgery") ? "default" : "outline"}
                    className="cursor-pointer transition-colors" onClick={() => toggleCondition("Bariatric Surgery")}>
                    {tx("onb.bariatricSurgery", lang)}
                  </Badge>
                </div>
              </div>

              {/* Custom + Family conditions */}
              {(() => {
                const knownIds = ["Hypertension", "Arrhythmia", "Heart Failure", "Diabetes", "Thyroid Disorder", "Depression/Anxiety", "Epilepsy", "Asthma", "COPD", "Bariatric Surgery"];
                const customs = healthForm.chronic_conditions.filter(c => !knownIds.includes(c) && !c.startsWith("family:"));
                const family = healthForm.chronic_conditions.filter(c => c.startsWith("family:"));
                return (
                  <>
                    {customs.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {customs.map(c => (
                          <Badge key={c} variant="default" className="gap-1">
                            {c}
                            <X className="h-3 w-3 cursor-pointer" onClick={() => toggleCondition(c)} />
                          </Badge>
                        ))}
                      </div>
                    )}
                    {family.length > 0 && (
                      <div className="border-t pt-2 mt-2">
                        <p className="text-xs font-semibold text-muted-foreground mb-1.5">🧬 {tr ? "Soygeçmiş" : "Family History"}</p>
                        <div className="flex flex-wrap gap-2">
                          {family.map(c => (
                            <Badge key={c} variant="outline" className="gap-1 text-xs">
                              {c.replace("family:", "")}
                              <X className="h-3 w-3 cursor-pointer" onClick={() => toggleCondition(c)} />
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}

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
                  {tx("profile.contactLocation", lang)}
                </Label>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-sm">{tx("profile.country", lang)}</Label>
                    <Input
                      placeholder={tx("profile.countryPlaceholder", lang)}
                      value={healthForm.country}
                      onChange={(e) => setHealthForm((p): HealthFormState => ({ ...p, country: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm">{tx("profile.city", lang)}</Label>
                    <Input
                      placeholder={tx("profile.cityPlaceholder", lang)}
                      value={healthForm.city}
                      onChange={(e) => setHealthForm((p): HealthFormState => ({ ...p, city: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-sm">{tx("profile.phone", lang)}</Label>
                    <Input
                      type="tel"
                      placeholder={tx("profile.phonePlaceholder", lang)}
                      value={healthForm.phone}
                      onChange={(e) => setHealthForm((p): HealthFormState => ({ ...p, phone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm">{tx("profile.recoveryEmail", lang)}</Label>
                    <Input
                      type="email"
                      placeholder={tx("profile.recoveryPlaceholder", lang)}
                      value={healthForm.recovery_email}
                      onChange={(e) => setHealthForm((p): HealthFormState => ({ ...p, recovery_email: e.target.value }))}
                    />
                    <p className="text-[10px] text-muted-foreground">
                      {tx("profile.recoveryDesc", lang)}
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

      {/* Data Management moved to Settings page */}

      {/* Notification Permission Bottom Sheet */}
      <PermissionBottomSheet
        type="notification"
        open={showNotifPermission}
        onGranted={() => setShowNotifPermission(false)}
        onDismissed={() => setShowNotifPermission(false)}
      />

      {/* Vaccine Profile */}
      <VaccineProfileSection lang={lang} userId={profile.id} initialVaccines={Array.isArray(profile.vaccines) ? profile.vaccines : undefined} />

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
              {tx("profile.emergencyContacts", lang)}
            </CardTitle>
            <CardDescription>{tx("profile.emergencyDesc", lang)}</CardDescription>
          </div>
          {contacts.length < 5 && !showForm && (
            <Button size="sm" variant="outline" onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: "", relationship: "spouse", phoneNumber: "" }); }}>
              <Plus className="h-4 w-4 mr-1" />{tx("profile.add", lang)}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {saved && (
          <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 dark:bg-green-950/20 px-3 py-1.5 rounded-lg">
            <Check className="h-3 w-3" />{tx("profile.saved", lang)}
          </div>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <div className="space-y-3 p-4 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5">
            <div>
              <Label className="text-xs">{tx("profile.fullName", lang)} *</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder={tx("profile.fullNamePlaceholder", lang)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">{tx("profile.relationship", lang)}</Label>
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
              <Label className="text-xs">{tx("profile.phone", lang)} *</Label>
              <Input value={form.phoneNumber} onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
                type="tel" placeholder="+90 5XX XXX XX XX" className="mt-1 font-mono" />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={editingId ? updateContact : addContact} disabled={!form.name || !form.phoneNumber} className="gap-1">
                <Save className="h-3.5 w-3.5" />{tx("profile.save", lang)}
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>
                {tx("profile.cancel", lang)}
              </Button>
            </div>
          </div>
        )}

        {/* Contact List */}
        {contacts.length === 0 && !showForm && (
          <div className="text-center py-6">
            <Shield className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{tx("profile.noEmergency", lang)}</p>
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
                    <Badge className="text-[9px] bg-red-100 text-red-600 border-0 px-1.5">{tx("profile.primary", lang)}</Badge>
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
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setPrimary(contact.id)} title={tx("profile.setPrimary", lang)}>
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
            {tx("profile.emergencyNote", lang)}
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
      setError(tx("profile.errInviteFailed", lang));
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
            {showForm ? tx("common.close", lang) : tx("linked.addAccount", lang)}
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
                              {p === "view_data" ? tx("common.view", lang)
                                : p === "pays_subscription" ? tx("common.pay", lang)
                                : p === "manage_medications" ? tx("common.meds", lang)
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
