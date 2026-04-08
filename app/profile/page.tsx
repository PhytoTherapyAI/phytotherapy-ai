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
import { BADGES, evaluateBadges, type UserStats } from "@/lib/badges";
import { txObj } from "@/lib/translations";
import {
  calculateProfilePower,
  ProfilePowerHeader,
  MotivationCard,
  SectionXPBadge,
  EmptyStateCTA,
  type ProfilePowerInput,
} from "@/components/profile/ProfileGamification";
import BadgeIcon from "@/components/badges/BadgeIcon";
import { LifestyleSection } from "@/components/profile/LifestyleSection";
import { ChronicConditionsEditor } from "@/components/profile/ChronicConditionsEditor";

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

  // Dynamic data (replacing hardcoded values)
  const [streakDays, setStreakDays] = useState(0);
  const [labTestCount, setLabTestCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState<{ icon: string; text: string; time: string }[]>([]);

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
      chronic_conditions: [...(profile.chronic_conditions || [])],
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
        // Retry after 1s delay (cold start / connection issue)
        await new Promise(r => setTimeout(r, 1000));
        const { error: retryError } = await supabase
          .from("user_profiles")
          .update(updateData)
          .eq("id", user!.id);
        if (retryError) {
          console.error("Retry also failed:", retryError);
          alert(tr ? "Kaydedilemedi. Lütfen tekrar dene." : "Save failed. Please try again.");
          setSavingHealth(false);
          return;
        }
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
  const [sbarLoading, setSbarLoading] = useState<"pdf" | "email" | null>(null);
  const [sbarEmailOpen, setSbarEmailOpen] = useState(false);
  const [sbarEmail, setSbarEmail] = useState("");

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

  // Restore scroll position on reload
  useEffect(() => {
    const saved = sessionStorage.getItem('profile_scroll');
    if (saved) setTimeout(() => window.scrollTo(0, parseInt(saved)), 100);
    const handleScroll = () => sessionStorage.setItem('profile_scroll', String(window.scrollY));
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!user) return;
    const supabase = createBrowserClient();

    Promise.all([
      supabase.from("user_medications").select("*").eq("user_id", user.id).eq("is_active", true),
      supabase.from("user_allergies").select("*").eq("user_id", user.id),
      supabase.from("blood_tests").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("query_history").select("query_type, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
      supabase.from("daily_check_ins").select("check_in_date").eq("user_id", user.id).order("check_in_date", { ascending: false }).limit(30),
    ]).then(([medsRes, allergyRes, labRes, activityRes, streakRes]) => {
      if (medsRes.data) setMedications(medsRes.data as UserMedication[]);
      if (allergyRes.data) setAllergies(allergyRes.data as UserAllergy[]);
      // Lab test count
      setLabTestCount(labRes.count ?? 0);
      // Streak calculation
      if (streakRes.data && streakRes.data.length > 0) {
        let streak = 0;
        const today = new Date(); today.setHours(0, 0, 0, 0);
        for (let i = 0; i < streakRes.data.length; i++) {
          const d = new Date(streakRes.data[i].check_in_date); d.setHours(0, 0, 0, 0);
          const expected = new Date(today); expected.setDate(expected.getDate() - i);
          if (d.getTime() === expected.getTime()) streak++;
          else break;
        }
        setStreakDays(streak);
      }
      // Recent activity from query_history
      if (activityRes.data && activityRes.data.length > 0) {
        const tr = lang === "tr";
        const typeIcons: Record<string, { icon: string; en: string; tr: string }> = {
          interaction: { icon: "✅", en: "Checked drug interaction", tr: "İlaç etkileşimi kontrol edildi" },
          blood_test: { icon: "🩸", en: "Uploaded blood test", tr: "Kan tahlili yüklendi" },
          general: { icon: "💬", en: "Asked health question", tr: "Sağlık sorusu soruldu" },
        };
        const now = Date.now();
        setRecentActivity(activityRes.data.slice(0, 3).map((a: { query_type: string; created_at: string }) => {
          const info = typeIcons[a.query_type] || typeIcons.general;
          const diff = now - new Date(a.created_at).getTime();
          const mins = Math.floor(diff / 60000);
          const hrs = Math.floor(diff / 3600000);
          const days = Math.floor(diff / 86400000);
          const time = days > 0 ? (tr ? `${days} gün önce` : `${days}d ago`) : hrs > 0 ? (tr ? `${hrs}s önce` : `${hrs}h ago`) : (tr ? `${mins}dk önce` : `${mins}m ago`);
          return { icon: info.icon, text: tr ? info.tr : info.en, time };
        }));
      }
    }).catch(() => { /* silent */ });
  }, [user, lang]);

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

  // Common drug default doses (same as onboarding)
  const DEFAULT_DOSES: Record<string, { dosage: string; frequency: string }> = {
    metformin: { dosage: "500mg", frequency: "Günde 2 kez" },
    lisinopril: { dosage: "10mg", frequency: "Günlük" },
    atorvastatin: { dosage: "20mg", frequency: "Günlük" },
    omeprazole: { dosage: "20mg", frequency: "Günlük" },
    pantoprazole: { dosage: "40mg", frequency: "Günlük" },
    amlodipine: { dosage: "5mg", frequency: "Günlük" },
    losartan: { dosage: "50mg", frequency: "Günlük" },
    levothyroxine: { dosage: "50mcg", frequency: "Günlük" },
    metoprolol: { dosage: "50mg", frequency: "Günde 2 kez" },
    aspirin: { dosage: "100mg", frequency: "Günlük" },
    ibuprofen: { dosage: "400mg", frequency: "Günde 3 kez" },
    paracetamol: { dosage: "500mg", frequency: "Günde 3 kez" },
    ramipril: { dosage: "5mg", frequency: "Günlük" },
    bisoprolol: { dosage: "5mg", frequency: "Günlük" },
    sertraline: { dosage: "50mg", frequency: "Günlük" },
    escitalopram: { dosage: "10mg", frequency: "Günlük" },
    pregabalin: { dosage: "75mg", frequency: "Günde 2 kez" },
    montelukast: { dosage: "10mg", frequency: "Günlük" },
    euthyrox: { dosage: "50mcg", frequency: "Günlük" },
    beloc: { dosage: "50mg", frequency: "Günde 2 kez" },
    concor: { dosage: "5mg", frequency: "Günlük" },
    coraspin: { dosage: "100mg", frequency: "Günlük" },
    parol: { dosage: "500mg", frequency: "Günde 3 kez" },
    arveles: { dosage: "25mg", frequency: "Günde 3 kez" },
    glifor: { dosage: "500mg", frequency: "Günde 2 kez" },
    nexium: { dosage: "20mg", frequency: "Günlük" },
    zoretanin: { dosage: "10mg", frequency: "Günlük" },
    isotretinoin: { dosage: "10mg", frequency: "Günlük" },
    roaccutane: { dosage: "10mg", frequency: "Günlük" },
  };

  const [autoDoseBadge, setAutoDoseBadge] = useState(false);

  const selectSuggestion = (s: DrugSuggestion) => {
    setNewBrandName(s.brandName);
    if (s.genericName && s.genericName.toLowerCase() !== s.brandName.toLowerCase()) {
      setNewGenericName(s.genericName);
    }
    // Auto-fill default dosage if known
    const generic = (s.genericName || s.brandName).toLowerCase();
    const brand = s.brandName.toLowerCase();
    const match = Object.entries(DEFAULT_DOSES).find(([key]) => generic.includes(key) || brand.includes(key));
    if (match) {
      setNewDosage(match[1].dosage);
      setNewFrequency(match[1].frequency);
      setAutoDoseBadge(true);
      setTimeout(() => setAutoDoseBadge(false), 2500);
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
      if (error) { console.error("Med insert error:", error); alert(tr ? "Kaydedilemedi, tekrar dene" : "Save failed, try again"); setSavingMed(false); return; }
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
  const [medConfirmed, setMedConfirmed] = useState(() => isMedRecentlyConfirmed());

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

      {/* ── PROFILE POWER HEADER ── */}
      {profile && (() => {
        const vaccines = Array.isArray(profile.vaccines) ? profile.vaccines : [];
        const powerInput: ProfilePowerInput = {
          hasBasicInfo: !!(profile.full_name && profile.age && profile.gender),
          medicationCount: medications.length,
          supplementCount: (profile.supplements || []).length,
          hasAllergies: allergies.length > 0,
          hasChronicConditions: (profile.chronic_conditions || []).filter((c: string) => !c.startsWith('family:')).length > 0,
          hasFamilyHistory: (profile.chronic_conditions || []).some((c: string) => c.startsWith('family:')),
          vaccineCount: vaccines.filter((v: { status: string }) => v.status === 'done').length,
          hasContactInfo: !!(profile.country || profile.city || profile.phone),
          hasLifestyle: !!(profile.height_cm || profile.weight_kg || profile.exercise_frequency || profile.sleep_quality),
        };
        const power = calculateProfilePower(powerInput);
        return <ProfilePowerHeader power={power} input={powerInput} lang={lang as 'en' | 'tr'} />;
      })()}

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
              <h2 className="text-xl font-bold flex items-center gap-2">
                {profile.full_name || user?.email?.split("@")[0] || "Member"}
                <button onClick={startEditingHealth} className="text-gray-400 hover:text-primary transition-colors" aria-label={tr ? "Düzenle" : "Edit"}>
                  <Edit3 className="h-4 w-4" />
                </button>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {tr ? "Üye:" : "Member since:"}{" "}
                {new Date(user?.created_at || Date.now()).toLocaleDateString(tr ? "tr-TR" : "en-US", { month: "long", year: "numeric" })}
              </p>
              {/* Streak badge */}
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-400">
                🔥 {tr ? `${streakDays} günlük seri` : `${streakDays}-day streak`}
              </div>
            </div>
            {/* Vitality Score — ring + bar + heartbeat */}
            {(() => {
              // Dynamic vitality score: profile completion (40%) + streak (30%) + meds+allergies (30%)
              const profileWeight = completionPct * 0.4;
              const streakWeight = Math.min(streakDays, 30) / 30 * 100 * 0.3;
              const dataWeight = (medications.length > 0 ? 50 : 0) + (allergies.length > 0 || (profile.chronic_conditions || []).length > 0 ? 50 : 0);
              const score = Math.round(Math.min(profileWeight + streakWeight + dataWeight * 0.3, 100));
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
                    {/* Decorative heartbeat SVG with glow + continuous motion */}
                    <svg width="80" height="24" viewBox="0 0 80 24" className="overflow-hidden"
                      style={{ filter: `drop-shadow(0 0 6px ${scoreColor}99)` }}>
                      <path
                        d="M0 12 L10 12 L15 4 L20 20 L25 8 L30 16 L35 12 L45 12 L50 4 L55 20 L60 8 L65 16 L70 12 L80 12"
                        fill="none" stroke={scoreColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                        strokeDasharray="200" className="ecg-line" style={{ opacity: 0.7 }}
                      />
                    </svg>
                  </div>
                  {/* Score label */}
                  <p className="text-[10px] text-muted-foreground font-medium text-center">
                    {tr ? "Canlılık Skoru" : "Vitality Score"}
                  </p>
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
              <p className="text-xl font-bold text-blue-600">{labTestCount}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">🩸 {tr ? "Yüklenen Tahlil" : "Lab Tests"}</p>
            </div>
          </div>

          {/* Achievement Badges preview — metalik */}
          <div className="mt-5">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              🏆 {tr ? "Başarı Rozetleri" : "Achievement Badges"}
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {(() => {
                const stats: UserStats = {
                  totalQueries: 0, totalCheckIns: streakDays, streakDays, bloodTestCount: labTestCount,
                  supplementsTracked: (profile.supplements || []).length, waterGoalHits: 0,
                  interactionChecks: 0, daysActive: streakDays, familyMembers: 0, pdfReports: 0,
                  vaccinesTracked: (Array.isArray(profile.vaccines) ? (profile.vaccines as { status: string }[]).filter(v => v.status === "done").length : 0),
                };
                const { earned, locked } = evaluateBadges(stats);
                return [
                  ...earned.slice(0, 6).map(b => ({ id: b.id, icon: b.icon, label: txObj(b, lang), earned: true })),
                  ...locked.slice(0, Math.max(0, 6 - earned.length)).map(b => ({ id: b.id, icon: b.icon, label: txObj(b, lang), earned: false })),
                ];
              })().map((b, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.08, type: "spring", stiffness: 300, damping: 20 }}
                    className="relative flex flex-col items-center rounded-lg p-2 text-center text-[10px] border transition-all hover:scale-105 cursor-default"
                  >
                    <BadgeIcon badgeId={b.id} locked={!b.earned} size={48} showAnimation={b.earned} fallbackEmoji={b.icon} />
                    <span className={`mt-1 leading-tight line-clamp-1 ${b.earned ? "font-semibold" : "text-muted-foreground"}`}>{b.label}</span>
                  </motion.div>
              ))}
            </div>
          </div>

          {/* Recent Activity micro-feed */}
          <div className="mt-5">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              📋 {tr ? "Son Aktiviteler" : "Recent Activity"}
            </h3>
            <div className="space-y-2">
              {(recentActivity.length > 0 ? recentActivity : [
                { icon: "💬", text: tr ? "Henüz aktivite yok" : "No activity yet", time: "" },
              ]).map((act, i) => (
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

      {/* Completion checks now shown inside ProfilePowerHeader */}

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

      {/* SBAR PDF Export — prominent placement */}
      <Card className="mb-6 border-primary/20 bg-gradient-to-r from-primary/5 to-emerald-500/5">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <span>📋</span>
                {tr ? "Doktor Görüşmesi İçin Özet Al" : "Get Summary for Doctor Visit"}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {tr ? "Tüm sağlık verilerini SBAR formatında profesyonel rapor olarak indir." : "Download all health data as a professional SBAR report."}
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button size="sm"
                onClick={async () => {
                  setSbarLoading("pdf");
                  try {
                    const supabase = createBrowserClient();
                    const { data: { session } } = await supabase.auth.getSession();
                    const res = await fetch("/api/sbar-pdf", {
                      method: "POST",
                      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
                      body: JSON.stringify({ lang }),
                    });
                    if (!res.ok) throw new Error("PDF failed");
                    const blob = await res.blob();
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url; a.download = `DoctoPal-SBAR-${new Date().toISOString().split("T")[0]}.pdf`;
                    a.click(); URL.revokeObjectURL(url);
                  } catch { alert(tr ? "PDF oluşturulamadı" : "PDF generation failed"); }
                  setSbarLoading(null);
                }}
                disabled={sbarLoading === "pdf"}
                className="flex-1 sm:flex-initial"
              >
                {sbarLoading === "pdf" ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />{tr ? "Oluşturuluyor..." : "Generating..."}</> : <><span className="mr-1.5">📥</span>{tr ? "PDF İndir" : "Download PDF"}</>}
              </Button>
              <Button size="sm" variant="outline"
                onClick={() => setSbarEmailOpen(!sbarEmailOpen)}
                className="flex-1 sm:flex-initial"
              >
                <span className="mr-1.5">📧</span>{tr ? "E-posta" : "Email"}
              </Button>
            </div>
          </div>
          {sbarEmailOpen && (
            <div className="mt-4 rounded-lg border p-3 space-y-2 bg-muted/30">
              <Input type="email" placeholder={tr ? "E-posta adresi" : "Email address"} value={sbarEmail} onChange={(e) => setSbarEmail(e.target.value)} className="h-8 text-sm" />
              <div className="flex gap-2">
                <Button size="sm" disabled={sbarLoading === "email"}
                  onClick={async () => {
                    setSbarLoading("email");
                    try {
                      const supabase = createBrowserClient();
                      const { data: { session } } = await supabase.auth.getSession();
                      const pdfRes = await fetch("/api/sbar-pdf", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` }, body: JSON.stringify({ lang }) });
                      if (!pdfRes.ok) throw new Error("PDF failed");
                      const blob = await pdfRes.blob();
                      const reader = new FileReader();
                      const base64 = await new Promise<string>((resolve, reject) => {
                        reader.onerror = () => reject(new Error("FileReader failed"));
                        reader.onload = () => { const r = reader.result as string | null; if (!r) { reject(new Error("No result")); return; } resolve(r.split(",")[1]); };
                        reader.readAsDataURL(blob);
                      });
                      await fetch("/api/sbar-email", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` }, body: JSON.stringify({ email: sbarEmail || user?.email, lang, pdfBase64: base64 }) });
                      setSbarEmailOpen(false); alert(tr ? "E-posta gönderildi!" : "Email sent!");
                    } catch { alert(tr ? "Gönderilemedi" : "Failed to send"); }
                    setSbarLoading(null);
                  }}>
                  {sbarLoading === "email" ? <Loader2 className="h-3 w-3 animate-spin" /> : (tr ? "Gönder" : "Send")}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSbarEmailOpen(false)}>{tr ? "İptal" : "Cancel"}</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Personal Info */}
      <Card className="mb-6" id="personal-info">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {tx('profile.personalInfo', lang)}
            </CardTitle>
            <p className="text-xs text-muted-foreground italic">
              {tr ? "Değere tıklayarak düzenle" : "Click a value to edit"}
            </p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">{tr ? "Sana nasıl hitap edelim" : "Display Name"}</p>
            <InlineEdit value={profile.full_name} lang={lang} placeholder={tr ? "Adın" : "Your name"}
              onSave={async (v) => { const sb = createBrowserClient(); await sb.from("user_profiles").update({ full_name: v }).eq("id", profile.id); await refreshProfile(); }} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{tx('profile.email', lang)}</p>
            <p className="font-medium">{user?.email || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{tx('profile.age', lang)}</p>
            <InlineEdit value={profile.age} lang={lang} type="number" placeholder={tr ? "Yaş" : "Age"}
              onSave={async (v) => { const sb = createBrowserClient(); await sb.from("user_profiles").update({ age: parseInt(v) || null }).eq("id", profile.id); await refreshProfile(); }} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{tx('profile.gender', lang)}</p>
            {(() => {
              const genderLabels: Record<string, Record<string, string>> = {
                male: { en: "Male", tr: "Erkek" },
                female: { en: "Female", tr: "Kadın" },
                other: { en: "Other", tr: "Diğer" },
              };
              const g = profile.gender || "";
              const displayValue = genderLabels[g]?.[lang] || null;
              return (
                <InlineEdit value={displayValue} lang={lang} type="chips"
                  options={[
                    { value: "male", label: tr ? "Erkek" : "Male" },
                    { value: "female", label: tr ? "Kadın" : "Female" },
                    { value: "other", label: tr ? "Diğer" : "Other" },
                  ]}
                  onSave={async (v) => { const sb = createBrowserClient(); await sb.from("user_profiles").update({ gender: v }).eq("id", profile.id); await refreshProfile(); }} />
              );
            })()}
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

          {/* ── Proaktif Sağlık Etiketleri ── */}
          {(() => {
            const tags: { icon: string; label: string; color: string; tooltip: string }[] = [];

            // Blood group risk
            if (profile.blood_group) {
              const bg = profile.blood_group.replace(/[+-]/g, "");
              const bgInsights: Record<string, { labelTr: string; labelEn: string; tipTr: string; tipEn: string }> = {
                A: { labelTr: "Mide & Hematolojik Tarama Önerilir", labelEn: "Gastric & Hematologic Screening Recommended", tipTr: "A kan grubu istatistiksel olarak mide ve hematolojik hastalıklara yatkınlık gösterir.", tipEn: "Blood type A shows statistical predisposition to gastric and hematologic conditions." },
                B: { labelTr: "Pankreas Sağlığı Takibi Önerilir", labelEn: "Pancreatic Health Monitoring Recommended", tipTr: "B kan grubu pankreas hastalıklarına yatkınlık gösterebilir.", tipEn: "Blood type B may show predisposition to pancreatic conditions." },
                AB: { labelTr: "Kardiyovasküler Takip Önerilir", labelEn: "Cardiovascular Monitoring Recommended", tipTr: "AB kan grubu kardiyovasküler hastalık riskini artırabilir.", tipEn: "Blood type AB may increase cardiovascular disease risk." },
                O: { labelTr: "Ülser & Mide Asidi Takibi Önerilir", labelEn: "Ulcer & Gastric Acid Monitoring Recommended", tipTr: "O kan grubu ülser ve mide asidi sorunlarına yatkınlık gösterir.", tipEn: "Blood type O shows predisposition to ulcer and gastric acid issues." },
              };
              const ins = bgInsights[bg];
              if (ins) tags.push({ icon: "🩸", label: tr ? ins.labelTr : ins.labelEn, color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300", tooltip: tr ? ins.tipTr : ins.tipEn });
            }

            // Age + gender screening
            const age = profile.age || 0;
            const gender = profile.gender;
            if (gender === "female" && age >= 40) tags.push({ icon: "🩺", label: tr ? "Mamografi Takibi Önerilir" : "Mammography Screening Recommended", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300", tooltip: tr ? "40 yaş üstü kadınlarda düzenli mamografi taraması önerilir." : "Regular mammography screening is recommended for women over 40." });
            if (gender === "male" && age >= 50) tags.push({ icon: "🩺", label: tr ? "Prostat Tarama Önerilir" : "Prostate Screening Recommended", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300", tooltip: tr ? "50 yaş üstü erkeklerde prostat taraması önerilir." : "Prostate screening is recommended for men over 50." });
            if (age >= 65) tags.push({ icon: "👴", label: tr ? "Geriatrik Takip Aktif" : "Geriatric Follow-up Active", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300", tooltip: tr ? "65 yaş üstü bireylerde kapsamlı geriatrik değerlendirme önerilir." : "Comprehensive geriatric assessment recommended for individuals over 65." });

            // Smoking
            const smokingStatus = (profile.smoking_use || "none").split("|")[0];
            if (smokingStatus === "current") tags.push({ icon: "🚬", label: tr ? "KOAH & Akciğer Tarama Önerilir" : "COPD & Lung Screening Recommended", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300", tooltip: tr ? "Aktif sigara kullanımı akciğer hastalığı riskini önemli ölçüde artırır." : "Active smoking significantly increases lung disease risk." });
            if (smokingStatus === "former") tags.push({ icon: "🚬", label: tr ? "Akciğer Tarama Önerilir" : "Lung Screening Recommended", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300", tooltip: tr ? "Eski sigara kullanıcılarında akciğer taraması önerilir." : "Lung screening is recommended for former smokers." });

            // BMI
            if (profile.height_cm && profile.weight_kg) {
              const bmi = Number(profile.weight_kg) / ((Number(profile.height_cm) / 100) ** 2);
              if (bmi >= 30) tags.push({ icon: "📏", label: `BMI: ${bmi.toFixed(1)} — ${tr ? "Metabolik Risk Takibi" : "Metabolic Risk Monitoring"}`, color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300", tooltip: tr ? "BMI 30 ve üzeri obezite sınıfına girer. Metabolik sendrom taraması önerilir." : "BMI 30+ is classified as obese. Metabolic syndrome screening recommended." });
              else if (bmi >= 25) tags.push({ icon: "📏", label: `BMI: ${bmi.toFixed(1)} — ${tr ? "Beslenme Takibi" : "Nutrition Monitoring"}`, color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300", tooltip: tr ? "BMI 25-30 arası kilolu sınıfına girer. Beslenme düzenlemesi önerilir." : "BMI 25-30 is classified as overweight. Dietary adjustment recommended." });
            }

            // Family early cardiac
            const familyItems = (profile.chronic_conditions || []).filter((c: string) => c.startsWith("family:"));
            if (familyItems.some((c: string) => c.toLowerCase().includes("heart") || c.toLowerCase().includes("kalp"))) {
              tags.push({ icon: "❤️", label: tr ? "Erken Kardiyovasküler Risk" : "Early Cardiovascular Risk", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300", tooltip: tr ? "Birinci derece akrabada erken kalp krizi genetik risk faktörüdür." : "Early heart attack in first-degree relative is a genetic risk factor." });
            }

            if (tags.length === 0) return null;

            return (
              <div className="mt-4 pt-4 border-t space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {tr ? "Proaktif Sağlık Etiketleri" : "Proactive Health Tags"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, i) => (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.08, type: "spring", stiffness: 300, damping: 20 }}
                      className="group relative">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium cursor-help ${tag.color}`}>
                        {tag.icon} {tag.label}
                      </span>
                      {/* Tooltip */}
                      <div className="invisible group-hover:visible absolute bottom-full left-0 mb-2 w-64 rounded-lg bg-card border shadow-lg p-3 z-50 transition-all opacity-0 group-hover:opacity-100">
                        <p className="text-xs text-foreground">{tag.tooltip}</p>
                        <p className="text-[10px] text-muted-foreground mt-1.5 italic">
                          {tr ? "Bu bilgi tıbbi teşhis değildir. Proaktif sağlık takibi için önerilmektedir." : "This is not a medical diagnosis. Recommended for proactive health monitoring."}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* Medications — Editable */}
      <Card id="medications" className={`mb-6 rounded-xl shadow-sm hover:shadow-md transition-shadow ${medications.length > 0 ? 'border-l-4 border-l-green-500' : ''}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                {tx('profile.activeMeds', lang)}
                <SectionXPBadge completed={medications.length > 0} />
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
          {/* Motivation card */}
          <MotivationCard
            id="motiv_meds"
            icon={"\u{1F48A}"}
            title={tr ? "Bunu atlama, ciddi s\u00f6yl\u00fcyorum" : "Don't skip this, I'm serious"}
            message={tr ? "Sar\u0131 kantaron gibi masum g\u00f6r\u00fcnen bitkiler baz\u0131 ila\u00e7larla kar\u0131\u015ft\u0131r\u0131l\u0131nca i\u015fler kar\u0131\u015f\u0131r. \u0130la\u00e7lar\u0131n\u0131 bilmeden \u00f6neri versem, sana yanl\u0131\u015f bir \u015fey s\u00f6yleyebilirim. O y\u00fczden s\u00f6yle \u2014 kimseye s\u00f6ylemeyece\u011fim \u{1F92B}" : "Herbs like St. John's Wort can mess things up when mixed with certain meds. If I don't know your medications, I might give you bad advice. So tell me \u2014 I won't tell anyone \u{1F92B}"}
            color="blue"
          />
          {/* Medication list */}
          {medications.length === 0 && !isAddingMed ? (
            <EmptyStateCTA
              icon={"\u{1F48A}"}
              title={tr ? "İlaç Ekle" : "Add Medication"}
              description={tr ? "İlaçlarını ekleyerek AI asistanının gücünü artır!" : "Power up your AI assistant by adding your medications!"}
              buttonText={tr ? "İlk İlacını Ekle" : "Add First Medication"}
              xpReward="+50 XP"
              onClick={() => setIsAddingMed(true)}
            />
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
                          {med.frequency && <Badge variant="outline">{tr ? ({
                            "1x daily": "Günlük", "2x daily": "Günde 2 kez", "3x daily": "Günde 3 kez",
                            "4x daily": "Günde 4 kez", "once daily": "Günlük", "twice daily": "Günde 2 kez",
                            "1x_daily": "Günlük", "once_daily": "Günlük", "once_a_day": "Günlük",
                            "twice_daily": "Günde 2 kez", "three_times_daily": "Günde 3 kez",
                            "four_times_daily": "Günde 4 kez", "2x_daily": "Günde 2 kez", "3x_daily": "Günde 3 kez",
                            "daily": "Günlük", "qd": "Günlük", "bid": "Günde 2 kez", "tid": "Günde 3 kez", "qid": "Günde 4 kez",
                            "every 8 hours": "Her 8 saatte", "every 12 hours": "Her 12 saatte",
                            "as needed": "Gerektiğinde", "as_needed": "Gerektiğinde", "prn": "Gerektiğinde",
                            "weekly": "Haftalık", "monthly": "Aylık",
                            "Günlük": "Günlük", "Günde 2 kez": "Günde 2 kez", "Günde 3 kez": "Günde 3 kez",
                          } as Record<string, string>)[med.frequency] || med.frequency : med.frequency}</Badge>}
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
              {autoDoseBadge && (
                <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-2 text-sm text-green-700 dark:text-green-300">
                  <Check className="h-4 w-4" />
                  {tr ? "Önerilen doz otomatik dolduruldu ✓" : "Suggested dose auto-filled ✓"}
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  onClick={addMedication}
                  disabled={!newBrandName.trim() || savingMed}
                  className="flex-1 gap-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {savingMed ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {tr ? "Kaydet" : "Save"}
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

      {/* Edit Health Profile — moved here, right below Active Medications */}
      <Card className="mb-6 rounded-xl shadow-sm hover:shadow-md transition-shadow" id="edit-health">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              {tr ? "Sağlık Profilim" : "My Health Profile"}
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
            {tr ? "Sağlık geçmişin = Benim süper gücüm 💪 Ne kadar çok bilirsem, o kadar isabetli olurum." : "Your health history = My superpower 💪 The more I know, the more accurate I become."}
          </CardDescription>
        </CardHeader>

        {editingHealth && (
          <CardContent className="space-y-6">
            {/* Pregnancy / Breastfeeding — hidden for male */}
            {profile.gender !== 'male' && (
              <>
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
              </>
            )}

            {/* Substance Use — Chip-based with celebration */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-base font-semibold">
                  <Wine className="h-4 w-4" />
                  {tx("profile.alcohol", lang)}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "none", emoji: "\u{1F7E2}", tr: "Kullanmıyorum", en: "None" },
                    { value: "former", emoji: "\u{1F7E1}", tr: "Bıraktım", en: "Former" },
                    { value: "active", emoji: "\u{1F534}", tr: "Aktif", en: "Active" },
                  ].map(opt => (
                    <button key={opt.value} type="button"
                      onClick={() => setHealthForm((p): HealthFormState => ({ ...p, alcohol_use: opt.value }))}
                      className={`rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all ${
                        healthForm.alcohol_use.split("|")[0] === opt.value
                          ? opt.value === "none"
                            ? "border-green-500 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 scale-[1.02]"
                            : "border-primary bg-primary/10 text-primary"
                          : "border-muted hover:border-primary/30 text-muted-foreground"
                      }`}>
                      {opt.emoji} {tr ? opt.tr : opt.en}
                      {healthForm.alcohol_use.split("|")[0] === opt.value && opt.value === "none" && " \u2705"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-base font-semibold">
                  <Cigarette className="h-4 w-4" />
                  {tx("profile.smoking", lang)}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "none", emoji: "\u{1F7E2}", tr: "Kullanmıyorum", en: "None" },
                    { value: "former", emoji: "\u{1F7E1}", tr: "Bıraktım", en: "Former" },
                    { value: "current", emoji: "\u{1F534}", tr: "Aktif", en: "Active" },
                  ].map(opt => (
                    <button key={opt.value} type="button"
                      onClick={() => setHealthForm((p): HealthFormState => ({ ...p, smoking_use: opt.value }))}
                      className={`rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all ${
                        healthForm.smoking_use.split("|")[0] === opt.value
                          ? opt.value === "none"
                            ? "border-green-500 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 scale-[1.02]"
                            : "border-primary bg-primary/10 text-primary"
                          : "border-muted hover:border-primary/30 text-muted-foreground"
                      }`}>
                      {opt.emoji} {tr ? opt.tr : opt.en}
                      {healthForm.smoking_use.split("|")[0] === opt.value && opt.value === "none" && " \u2705"}
                    </button>
                  ))}
                </div>
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
                  <Label htmlFor="edit-liver" className="font-normal text-sm">{"\u{1FA78}"} {tx("onb.bleedingDisorder", lang)}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="edit-surgery" checked={healthForm.recent_surgery}
                    onCheckedChange={(c) => setHealthForm((p): HealthFormState => ({ ...p, recent_surgery: c === true }))} />
                  <Label htmlFor="edit-surgery" className="font-normal text-sm">{"\u{1F6E1}\u{FE0F}"} {tx("onb.immuneSuppressed", lang)}</Label>
                </div>
              </div>
            </div>

            {/* Chronic Conditions — Full Editor with Autocomplete + Med Suggestion */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-base font-semibold">
                <Stethoscope className="h-4 w-4" />
                {tx("profile.chronicConditions", lang)}
                <SectionXPBadge completed={healthForm.chronic_conditions.filter(c => !c.startsWith('family:')).length > 0} />
              </Label>
              <MotivationCard
                id="motiv_chronic"
                icon={"\u{1F3E5}"}
                title={tr ? "Sen herkese benzemiyorsun (iyi anlamda)" : "You're not like everyone (in a good way)"}
                message={tr ? "Diyabetli birine 'bol meyve ye' demek kan \u015fekerini u\u00e7urabilir. Hastal\u0131\u011f\u0131n\u0131 bilmeden sana 'herkese uyan' \u00f6neriler veririm. Sen herkese uymuyor musun? Ben de. \u{1F60E}" : "Telling a diabetic to 'eat lots of fruit' can spike their blood sugar. Without knowing your conditions, I give generic advice. You don't fit the mold? Neither do I. \u{1F60E}"}
                color="purple"
              />
              <ChronicConditionsEditor
                conditions={healthForm.chronic_conditions}
                medications={medications.map(m => ({ brand_name: m.brand_name, generic_name: m.generic_name }))}
                onToggle={toggleCondition}
                onAdd={(id) => {
                  if (!healthForm.chronic_conditions.includes(id)) {
                    setHealthForm(p => ({ ...p, chronic_conditions: [...p.chronic_conditions, id] }));
                  }
                }}
                lang={lang as 'en' | 'tr'}
              />
              {/* Family history */}
              {healthForm.chronic_conditions.filter(c => c.startsWith("family:")).length > 0 && (
                <div className="border-t pt-2 mt-2">
                  <p className="text-xs font-semibold text-muted-foreground mb-1.5">{"\u{1F9EC}"} {tr ? "Soyge\u00e7mi\u015f" : "Family History"}</p>
                  <div className="flex flex-wrap gap-2">
                    {healthForm.chronic_conditions.filter(c => c.startsWith("family:")).map(c => (
                      <Badge key={c} variant="outline" className="gap-1 text-xs">
                        {c.replace("family:", "")}
                        <X className="h-3 w-3 cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleCondition(c); }} />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Supplements — Enhanced */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-base font-semibold">
                {"\u{1F33F}"} {tx("profile.supplements", lang)}
                <SectionXPBadge completed={healthForm.supplements.length > 0} />
              </Label>
              <MotivationCard
                id="motiv_supplements"
                icon={"\u{1F33F}"}
                title={tr ? "'Do\u011fald\u0131r, ne olabilir ki?'" : "'It's natural, what could go wrong?'"}
                message={tr ? "Her \u015fey. Beta-alanin ald\u0131\u011f\u0131nda elin kolun kar\u0131ncalanmaya ba\u015flarsa panikleyip acile ko\u015fma \u2014 bu normal, ama bunu bilmem laz\u0131m. Takviyelerini ekle, k\u00f6r u\u00e7mayay\u0131m." : "Everything. When you take beta-alanine and your hands start tingling, don't panic and rush to the ER \u2014 it's normal, but I need to know. Add your supplements so I don't fly blind."}
                color="green"
              />
              {/* Categorized supplement chip grid */}
              {[
                { cat: tr ? "VİTAMİN & MİNERAL" : "VITAMIN & MINERAL", items: [
                  { id: "Vitamin D", label: tx("profile.suppVitaminD", lang) },
                  { id: "Vitamin B12", label: tx("profile.suppVitaminB12", lang) },
                  { id: "Vitamin C", label: "Vitamin C" },
                  { id: "Iron", label: tx("profile.suppIron", lang) },
                  { id: "Magnesium", label: tx("profile.suppMagnesium", lang) },
                  { id: "Zinc", label: tx("profile.suppZinc", lang) },
                  { id: "Calcium", label: tr ? "Kalsiyum" : "Calcium" },
                  { id: "Folic Acid", label: tr ? "Folik Asit" : "Folic Acid" },
                  { id: "Multivitamin", label: tx("profile.suppMultivitamin", lang) },
                ]},
                { cat: tr ? "BİTKİSEL" : "HERBAL", items: [
                  { id: "Curcumin", label: tr ? "Kurkumin" : "Curcumin" },
                  { id: "Ashwagandha", label: "Ashwagandha" },
                  { id: "Valerian Root", label: tr ? "Kediotu" : "Valerian Root" },
                  { id: "Ginkgo Biloba", label: "Ginkgo Biloba" },
                  { id: "St. John's Wort", label: tr ? "Sarı Kantaron" : "St. John's Wort" },
                  { id: "Echinacea", label: "Ekinezya" },
                ]},
                { cat: tr ? "YAĞ ASİTLERİ" : "FATTY ACIDS", items: [
                  { id: "Omega-3", label: tx("profile.suppOmega3", lang) },
                  { id: "Coenzyme Q10", label: "Koenzim Q10" },
                  { id: "Fish Oil", label: tr ? "Balık Yağı" : "Fish Oil" },
                ]},
                { cat: tr ? "PROTEİN & SPOR" : "PROTEIN & SPORTS", items: [
                  { id: "Collagen", label: tr ? "Kolajen" : "Collagen" },
                  { id: "Creatine", label: "Kreatin" },
                  { id: "BCAA", label: "BCAA" },
                  { id: "Whey Protein", label: tr ? "Whey Protein" : "Whey Protein" },
                ]},
                { cat: tr ? "DİĞER" : "OTHER", items: [
                  { id: "Probiotics", label: tx("profile.suppProbiotics", lang) },
                  { id: "Melatonin", label: "Melatonin" },
                  { id: "Glucosamine", label: tr ? "Glukozamin" : "Glucosamine" },
                ]},
              ].map(group => (
                <div key={group.cat} className="space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{group.cat}</p>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map(s => (
                      <Badge key={s.id} variant={healthForm.supplements.includes(s.id) ? "default" : "outline"}
                        className="cursor-pointer transition-colors" onClick={() => toggleSupplement(s.id)}>
                        {s.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
              {/* Selected count + remove */}
              {healthForm.supplements.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-primary">
                    {tr ? `${healthForm.supplements.length} takviye seçili` : `${healthForm.supplements.length} supplements selected`}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {healthForm.supplements.map(s => (
                      <Badge key={s} variant="default" className="gap-1 text-xs">
                        {s}
                        <X className="h-3 w-3 cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleSupplement(s); }} />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Gamified Lifestyle Section */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-base font-semibold">
                <Sparkles className="h-4 w-4" />
                {tr ? "Yaşam Tarzı" : "Lifestyle"}
              </Label>
              <LifestyleSection
                data={{ height_cm: healthForm.height_cm, weight_kg: healthForm.weight_kg, blood_group: healthForm.blood_group, diet_type: healthForm.diet_type, exercise_frequency: healthForm.exercise_frequency, sleep_quality: healthForm.sleep_quality }}
                onChange={(updates) => setHealthForm((p): HealthFormState => ({ ...p, ...updates }))}
                lang={lang as "en" | "tr"}
              />
            </div>

            <Separator />

            {/* Contact & Location */}
            <div className="space-y-4">
                <Label className="flex items-center gap-2 text-base font-semibold">
                  <MapPin className="h-4 w-4" />
                  {tr ? "\u{1F4CD} İletişim & Konum" : "\u{1F4CD} Contact & Location"}
                </Label>
                <p className="text-xs text-muted-foreground -mt-2">
                  {tr ? "Acil durumda sana ulaşabilmemiz ve yakınındaki sağlık kurumlarını gösterebilmemiz için." : "So we can reach you in emergencies and show nearby health facilities."}
                </p>

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

            {/* Sticky Save button at bottom */}
            <div className="sticky bottom-0 mt-6 flex gap-2 border-t pt-4 bg-background pb-2 -mx-6 px-6 shadow-[0_-4px_12px_rgba(0,0,0,0.1)]">
              <Button
                onClick={saveHealthProfile}
                disabled={savingHealth}
                className="flex-1 gap-2 bg-primary hover:bg-primary/90"
              >
                {savingHealth ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {tr ? "Kaydet" : "Save Changes"}
              </Button>
              <Button variant="outline" onClick={() => setEditingHealth(false)}>
                {tx("profile.cancel", lang)}
              </Button>
            </div>
          </CardContent>
        )}

        {!editingHealth && (
          <CardContent className="py-3">
            <button onClick={startEditingHealth} className="text-sm text-primary font-medium hover:underline flex items-center gap-1.5">
              <Edit3 className="h-3.5 w-3.5" />
              {tr ? "Sa\u011fl\u0131k profilini d\u00fczenle" : "Edit health profile"}
            </button>
          </CardContent>
        )}
      </Card>

      {/* Medical History — SBAR enriched */}
      {(() => {
        const conditions = (profile.chronic_conditions || []).filter((c: string) => !c.startsWith("family:"));
        const familyItems = (profile.chronic_conditions || []).filter((c: string) => c.startsWith("family:"));
        const hasCritical = profile.is_pregnant || profile.is_breastfeeding || profile.kidney_disease || profile.liver_disease || profile.recent_surgery;
        const isEmpty = conditions.length === 0 && !hasCritical;

        const cardio = ["Hypertension", "Arrhythmia", "Heart Failure"];
        const endo = ["Diabetes", "Thyroid Disorder"];
        const neuro = ["Depression/Anxiety", "Epilepsy"];
        const resp = ["Asthma", "COPD"];
        const surg = ["Bariatric Surgery"];
        const groupDefs = [
          { key: "cardio", label: tr ? "Kardiyovasküler" : "Cardiovascular", icon: "❤️", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300", items: conditions.filter((c: string) => cardio.includes(c)) },
          { key: "endo", label: tr ? "Endokrin" : "Endocrine", icon: "🩺", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300", items: conditions.filter((c: string) => endo.includes(c)) },
          { key: "neuro", label: tr ? "Nörolojik" : "Neurological", icon: "🧠", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300", items: conditions.filter((c: string) => neuro.includes(c)) },
          { key: "resp", label: tr ? "Solunum" : "Respiratory", icon: "🫁", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300", items: conditions.filter((c: string) => resp.includes(c)) },
          { key: "surg", label: tr ? "Cerrahi" : "Surgical", icon: "🔪", color: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300", items: conditions.filter((c: string) => surg.includes(c)) },
        ].filter(g => g.items.length > 0);
        const others = conditions.filter((c: string) => ![...cardio, ...endo, ...neuro, ...resp, ...surg].includes(c));

        // Cardiometabolic risk detection
        const hasCardioMetabolic = conditions.includes("Diabetes") && conditions.includes("Hypertension");

        return (
          <>
            <Card className={`mb-6 rounded-xl shadow-sm hover:shadow-md transition-shadow ${isEmpty ? "border-green-200 dark:border-green-800" : "border-l-4 border-l-purple-500"}`}
              style={isEmpty ? { backgroundColor: "var(--green-50, rgba(240,253,244,0.5))" } : {}} id="medical-history">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  {isEmpty
                    ? (tr ? "✅ Temiz Tıbbi Geçmiş" : "✅ Clean Medical History")
                    : `🏥 ${conditions.length + (hasCritical ? 1 : 0)} ${tr ? "Kronik Durum Kayıtlı" : "Chronic Conditions Recorded"}`}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEmpty ? (
                  <div className="space-y-3">
                    <p className="text-sm text-green-700 dark:text-green-400">
                      {tr ? "Kayıtlı kronik hastalığın yok. Bu, AI önerilerinin daha geniş bir yelpazede çalışması demek." : "No chronic conditions recorded. This means AI recommendations work across a wider range."}
                    </p>
                    <button onClick={() => { document.getElementById("edit-health")?.scrollIntoView({ behavior: "smooth" }); setTimeout(() => startEditingHealth(), 300); }}
                      className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                      <Plus className="h-3 w-3" /> {tr ? "Hastalık Ekle" : "Add Condition"}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Critical conditions */}
                    {hasCritical && (
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

                    {/* Grouped conditions with icons + colored badges */}
                    {groupDefs.map(g => (
                      <div key={g.key} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span>{g.icon}</span>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{g.label}</p>
                        </div>
                        <div className="flex flex-wrap gap-1.5 ml-6">
                          {g.items.map((c: string) => <Badge key={c} className={g.color}>{c}</Badge>)}
                        </div>
                      </div>
                    ))}
                    {others.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {others.map((c: string) => <Badge key={c} variant="secondary">{c}</Badge>)}
                      </div>
                    )}

                    {/* Cardiometabolic risk banner */}
                    {hasCardioMetabolic && (
                      <p className="text-xs text-amber-700 dark:text-amber-400 flex items-start gap-1.5 bg-amber-50 dark:bg-amber-950/20 rounded-lg px-3 py-2">
                        <span className="shrink-0 mt-0.5">⚡</span>
                        {tr ? "Kardiyometabolik risk profili tespit edildi. Düzenli takip önerilir." : "Cardiometabolic risk profile detected. Regular monitoring recommended."}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Soygeçmiş — separate card */}
            {(() => {
              const hasEarlyCardio = familyItems.some((c: string) => c.toLowerCase().includes("heart") || c.toLowerCase().includes("kalp"));
              return (
                <Card className={`mb-6 ${familyItems.length === 0 ? "border-blue-200 dark:border-blue-800" : hasEarlyCardio ? "border-l-4 border-l-red-500" : ""}`}
                  style={familyItems.length === 0 ? { backgroundColor: "var(--blue-50, rgba(239,246,255,0.5))" } : {}}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span>🧬</span>
                      {familyItems.length === 0
                        ? (tr ? "Aile Sağlık Geçmişi Eklenmedi" : "No Family Health History Added")
                        : (tr ? "Aile Sağlık Geçmişi" : "Family Health History")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {familyItems.length === 0 ? (
                      <div className="space-y-3">
                        <p className="text-sm text-blue-700 dark:text-blue-400">
                          {tr ? "Baban\u0131n 50'sinde kalp krizi ge\u00e7irmesi senin i\u00e7in \u00f6nemli bir ipucu. Genetik riskleri bilmeden seni erken uyaramam. Bu bilgi sigortan gibi \u2014 umar\u0131m hi\u00e7 kullanmazs\u0131n, ama olmas\u0131 iyi. \u{1F6E1}\u{FE0F}" : "Your dad's heart attack at 50 is an important clue for you. Without genetic risks, I can't warn you early. This info is like insurance \u2014 hopefully you'll never need it, but it's good to have. \u{1F6E1}\u{FE0F}"}
                        </p>
                        <button onClick={() => { document.getElementById("edit-health")?.scrollIntoView({ behavior: "smooth" }); setTimeout(() => startEditingHealth(), 300); }}
                          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                          <Plus className="h-3 w-3" /> {tr ? "Soygeçmiş Ekle" : "Add Family History"}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          {familyItems.map((c: string) => (
                            <div key={c} className="flex items-center justify-between rounded-lg border px-3 py-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm">{c.toLowerCase().includes("heart") || c.toLowerCase().includes("kalp") ? "❤️" : c.toLowerCase().includes("diabet") || c.toLowerCase().includes("diyabet") ? "🩸" : "🧬"}</span>
                                <span className="text-sm font-medium">{c.replace("family:", "")}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        {hasEarlyCardio && (
                          <p className="text-xs text-red-600 dark:text-red-400 flex items-start gap-1.5 bg-red-50 dark:bg-red-950/20 rounded-lg px-3 py-2">
                            <span className="shrink-0 mt-0.5">🔍</span>
                            {tr ? "Erken Kardiyovasküler Risk Taraması Önerilir" : "Early Cardiovascular Risk Screening Recommended"}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })()}
          </>
        );
      })()}

      {/* Allergies — SBAR enriched */}
      {(() => {
        const hasAnaphylaxis = allergies.some(a => a.severity === "anaphylaxis");
        const reactionConfig: Record<string, { emoji: string; color: string; label: string }> = {
          anaphylaxis: { emoji: "🔴", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300", label: tr ? "Anafilaksi" : "Anaphylaxis" },
          urticaria: { emoji: "🟡", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300", label: tr ? "Kurdeşen" : "Urticaria" },
          mild_skin: { emoji: "🟢", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300", label: tr ? "Hafif Kaşıntı" : "Mild Skin" },
          gi_intolerance: { emoji: "🔵", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300", label: tr ? "Sindirim / İntolerans" : "GI Intolerance" },
          intolerance: { emoji: "🔵", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300", label: tr ? "İntolerans" : "Intolerance" },
          mild_rash: { emoji: "🟢", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300", label: tr ? "Hafif Döküntü" : "Mild Rash" },
          unknown: { emoji: "❓", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300", label: tr ? "Bilmiyorum" : "Unknown" },
          mild: { emoji: "🟢", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300", label: tr ? "Hafif" : "Mild" },
          moderate: { emoji: "🟡", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300", label: tr ? "Orta" : "Moderate" },
          severe: { emoji: "🔴", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300", label: tr ? "Şiddetli" : "Severe" },
        };

        return (
          <Card id="allergy-card" className={`mb-6 rounded-xl shadow-sm hover:shadow-md transition-shadow ${hasAnaphylaxis ? "border-red-300 dark:border-red-700 border-l-4 border-l-red-500" : allergies.length > 0 ? "border-l-4 border-l-amber-500" : "border-green-200 dark:border-green-800"}`}
            style={hasAnaphylaxis ? { backgroundColor: "var(--red-50, rgba(254,242,242,0.5))" } : allergies.length === 0 ? { backgroundColor: "var(--green-50, rgba(240,253,244,0.5))" } : {}}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 flex-wrap">
                {hasAnaphylaxis ? (
                  <span className="animate-pulse">🚨</span>
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                )}
                {hasAnaphylaxis
                  ? (tr ? "Anafilaksi Uyarısı Aktif" : "Anaphylaxis Alert Active")
                  : allergies.length === 0
                    ? (tr ? "Alerjiler" : "Allergies")
                    : `${allergies.length} ${tr ? "Alerji Tanımlı" : allergies.length === 1 ? "Allergy Defined" : "Allergies Defined"}`}
                <SectionXPBadge completed={allergies.length > 0} />
                {allergies.length === 0 && !hasAnaphylaxis && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-500 px-2.5 py-1 text-[10px] font-bold text-white shadow">
                    🛡️ {tr ? "Alerji Yok" : "No Allergies"}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Motivation card */}
              <MotivationCard
                id="motiv_allergy"
                icon={"\u{26A0}\u{FE0F}"}
                title={tr ? "F\u0131st\u0131k konusunda \u015faka yapm\u0131yorum" : "I don't joke about peanuts"}
                message={tr ? "Alerji bilgisi olmadan \u00f6neri vermek, g\u00f6z\u00fc kapal\u0131 dart atmak gibi. Bazen tutturursun, bazen tutturmazs\u0131n. Sen tutturulmak istemiyorsun, de\u011fil mi? Ben de istemiyorum. Ekle. \u{1F3AF}" : "Giving advice without allergy info is like throwing darts blindfolded. Sometimes you hit, sometimes you don't. You don't want to be the dartboard, right? Neither do I. Add them. \u{1F3AF}"}
                color="yellow"
              />

              {/* Existing allergies list */}
              {allergies.length > 0 && (
                <div className="space-y-2">
                  {allergies.map((allergy) => {
                    const rc = reactionConfig[allergy.severity] || reactionConfig.unknown;
                    return (
                      <div key={allergy.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{rc.emoji}</span>
                          <span className="text-sm font-medium">{allergy.allergen}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={rc.color}>{rc.label}</Badge>
                          <button onClick={() => removeAllergy(allergy.id)} className="text-muted-foreground hover:text-destructive">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {hasAnaphylaxis && (
                    <p className="text-xs text-red-600 dark:text-red-400 flex items-start gap-1.5 bg-red-50 dark:bg-red-950/20 rounded-lg px-3 py-2">
                      <span className="shrink-0 mt-0.5">{"\u{26A1}"}</span>
                      {tr ? "Bu bilgi tüm AI önerilerinde otomatik filtreleme yapıyor." : "This data automatically filters all AI recommendations."}
                    </p>
                  )}
                </div>
              )}

              {allergies.length === 0 && (
                <p className="text-sm text-green-700 dark:text-green-400">
                  {tr ? "Kayıtlı alerjin yok. Güvenle öneri alabilirsin." : "No allergies recorded. You can safely receive recommendations."}
                </p>
              )}

              {/* Inline add allergy form — common allergen chips */}
              <div className="rounded-xl border border-dashed border-primary/30 p-4 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {tr ? "Yaygın Alerjenler" : "Common Allergens"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "Penicillin", tr: "Penisilin", en: "Penicillin" },
                    { id: "Sulfonamide", tr: "Sülfonamid", en: "Sulfonamide" },
                    { id: "NSAID", tr: "NSAİİ (İbuprofen vb.)", en: "NSAIDs" },
                    { id: "Peanut", tr: "Fıstık", en: "Peanut" },
                    { id: "Milk", tr: "Süt", en: "Milk" },
                    { id: "Egg", tr: "Yumurta", en: "Egg" },
                    { id: "Shellfish", tr: "Kabuklu Deniz Ürünü", en: "Shellfish" },
                    { id: "Gluten", tr: "Gluten", en: "Gluten" },
                    { id: "Soy", tr: "Soya", en: "Soy" },
                    { id: "Latex", tr: "Lateks", en: "Latex" },
                    { id: "Bee Venom", tr: "Arı Zehiri", en: "Bee Venom" },
                    { id: "Pollen", tr: "Polen", en: "Pollen" },
                  ].map(a => (
                    <Badge key={a.id} variant="outline" className="cursor-pointer hover:bg-primary/10 transition-colors"
                      onClick={() => { setNewAllergen(tr ? a.tr : a.en); }}>
                      {tr ? a.tr : a.en}
                    </Badge>
                  ))}
                </div>

                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-2">
                  {tr ? "Hassasiyetler" : "Sensitivities"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "Lactose", tr: "Laktoz", en: "Lactose" },
                    { id: "Fructose", tr: "Fruktoz", en: "Fructose" },
                    { id: "MSG", tr: "MSG", en: "MSG" },
                    { id: "Caffeine", tr: "Kafein", en: "Caffeine" },
                    { id: "Histamine", tr: "Histamin", en: "Histamine" },
                  ].map(a => (
                    <Badge key={a.id} variant="outline" className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors"
                      onClick={() => { setNewAllergen(tr ? a.tr : a.en); setNewAllergenSeverity("gi_intolerance" as AllergySeverity); }}>
                      {tr ? a.tr : a.en}
                    </Badge>
                  ))}
                </div>

                {/* Manual input + reaction type + add */}
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <Input
                    placeholder={tr ? "Alerjen adı..." : "Allergen name..."}
                    value={newAllergen}
                    onChange={(e) => setNewAllergen(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAllergy())}
                    className="flex-1"
                  />
                  <Select value={newAllergenSeverity} onValueChange={(v) => setNewAllergenSeverity(v as AllergySeverity)}>
                    <SelectTrigger className="w-full sm:w-44">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="anaphylaxis">{tr ? "🔴 Anafilaksi" : "🔴 Anaphylaxis"}</SelectItem>
                      <SelectItem value="urticaria">{tr ? "🟡 Kurdeşen" : "🟡 Urticaria"}</SelectItem>
                      <SelectItem value="mild_skin">{tr ? "🟢 Hafif Kaşıntı" : "🟢 Mild Skin"}</SelectItem>
                      <SelectItem value="gi_intolerance">{tr ? "🔵 İntolerans" : "🔵 Intolerance"}</SelectItem>
                      <SelectItem value="unknown">{tr ? "❓ Bilmiyorum" : "❓ Unknown"}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={addAllergy} disabled={!newAllergen.trim()} className="gap-1">
                    <Plus className="h-4 w-4" />
                    {tr ? "Ekle" : "Add"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {/* Health Flags card moved up — see above */}


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

      {/* FAB — SBAR PDF shortcut */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 20 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={async () => {
          setSbarLoading("pdf");
          try {
            const supabase = createBrowserClient();
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch("/api/sbar-pdf", {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
              body: JSON.stringify({ lang }),
            });
            if (!res.ok) throw new Error("PDF failed");
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url; a.download = `DoctoPal-SBAR-${new Date().toISOString().split("T")[0]}.pdf`;
            a.click(); URL.revokeObjectURL(url);
          } catch { alert(tr ? "PDF oluşturulamadı" : "PDF generation failed"); }
          setSbarLoading(null);
        }}
        disabled={sbarLoading === "pdf"}
        className="fixed bottom-36 right-4 md:bottom-20 md:right-8 z-[100] flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-3.5 shadow-xl hover:shadow-2xl transition-shadow group"
        aria-label={tr ? "Özet PDF Al" : "Get Summary PDF"}
      >
        {sbarLoading === "pdf"
          ? <Loader2 className="h-5 w-5 animate-spin" />
          : <span className="text-lg">📄</span>}
        <span className="max-w-0 overflow-hidden group-hover:max-w-[120px] transition-all duration-300 text-sm font-medium whitespace-nowrap">
          {tr ? "Özet Al" : "Get Summary"}
        </span>
      </motion.button>
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

// ── Inline Edit Helper ──
function InlineEdit({ value, onSave, type = "text", placeholder, lang, options }: {
  value?: string | number | null; onSave: (val: string) => Promise<void>; type?: "text" | "number" | "chips";
  placeholder?: string; lang: "en" | "tr"; options?: { value: string; label: string }[];
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value ?? ""));
  const [saving, setSaving] = useState(false);
  const addLabel = lang === "tr" ? "+ Ekle" : "+ Add";

  if (!editing && !value) {
    return <button onClick={() => setEditing(true)} className="text-sm font-medium text-primary hover:underline cursor-pointer">{addLabel}</button>;
  }
  if (!editing) {
    return <span className="font-medium cursor-pointer hover:text-primary transition-colors" onClick={() => { setDraft(String(value ?? "")); setEditing(true); }}>{String(value)}</span>;
  }

  const save = async () => {
    if (!draft.trim()) return;
    setSaving(true);
    await onSave(draft.trim());
    setSaving(false); setEditing(false);
  };

  if (type === "chips" && options) {
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        {options.map(o => (
          <button key={o.value} type="button" onClick={async () => { setSaving(true); await onSave(o.value); setSaving(false); setEditing(false); }}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${draft === o.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {o.label}
          </button>
        ))}
        <button onClick={() => setEditing(false)} className="flex items-center justify-center w-7 h-7 min-w-[44px] min-h-[44px] rounded-md text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 text-sm font-bold transition-colors ml-1">✗</button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <input type={type === "number" ? "number" : "text"} value={draft} onChange={e => setDraft(e.target.value)}
        placeholder={placeholder} autoFocus className="h-7 rounded-md border px-2 text-sm w-32 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none" />
      <button onClick={save} disabled={saving} className="flex items-center justify-center w-8 h-8 min-w-[44px] min-h-[44px] rounded-md text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/20 text-lg font-bold transition-colors">{saving ? "..." : "✓"}</button>
      <button onClick={() => setEditing(false)} className="flex items-center justify-center w-8 h-8 min-w-[44px] min-h-[44px] rounded-md text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 text-lg font-bold transition-colors">✗</button>
    </div>
  );
}

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
