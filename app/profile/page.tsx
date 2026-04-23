// © 2026 DoctoPal — All Rights Reserved
"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { ProfileShellV2 } from "@/components/profile-v2/ProfileShellV2";
import { MedicationInteractionBanner } from "@/components/safety/MedicationInteractionBanner";
import { checkInteractionsAfterAdd, type InteractionCheckResult } from "@/lib/safety/check-med-interactions";

// F-SAFETY-001 post-launch feature flag. The helper (including telemetry
// breadcrumbs) always runs so we keep capturing interaction-check signal
// even when the UI is kill-switched; the banner UI hides when this is
// "false". Default is enabled — set NEXT_PUBLIC_SAFETY_BANNER=false in
// Vercel env to disable the banner without a code deploy if something
// goes wrong in production.
const SAFETY_BANNER_ENABLED = process.env.NEXT_PUBLIC_SAFETY_BANNER !== "false";
import { useAuth } from "@/lib/auth-context";
import { useFamily } from "@/lib/family-context";
import { createBrowserClient } from "@/lib/supabase";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import { translateCondition, isSurgery, stripPrefix } from "@/lib/condition-translations";
import { readDraft, persistDraft, clearDraft, DRAFT_KEYS } from "@/lib/ui/draft-persist";
import { SOSButton } from "@/components/family/SOSButton";
import { PrivacySettings } from "@/components/profile/PrivacySettings";
import { LocalizedTitle } from "@/components/layout/LocalizedTitle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  User, Pill, AlertTriangle, Shield, Trash2,
  Plus, X, Loader2, CheckCircle2, Check, Save, Baby,
  Stethoscope, Sparkles, Camera, MapPin, Users, Mail,
  UserPlus, ChevronDown, ChevronUp, Phone, Edit3, Star,
  AlertCircle,
} from "lucide-react";
import type { UserMedication, UserAllergy, AllergySeverity, UserProfile } from "@/lib/database.types";
import { MedicationScanner } from "@/components/scanner/MedicationScanner";
import { shouldAskPermission } from "@/lib/permission-state";
import { PermissionBottomSheet } from "@/components/permissions/PermissionBottomSheet";
import { VaccineProfileSection } from "@/components/profile/VaccineProfileSection";
import { FamilyManagementSettings } from "@/components/profile/FamilyManagementSettings";
import { useActiveProfile } from "@/lib/use-active-profile";
import { BADGES, evaluateBadges, type UserStats } from "@/lib/badges";
import { txObj } from "@/lib/translations";
import {
  calculateProfilePower,
  getCompletionMessage,
  ProfilePowerHeader,
  MotivationCard,
  SectionXPBadge,
  EmptyStateCTA,
  type ProfilePowerInput,
} from "@/components/profile/ProfileGamification";
import BadgeIcon from "@/components/badges/BadgeIcon";
import { LifestyleSection } from "@/components/profile/LifestyleSection";
import { ProfileSupplementsStep, ProfileMedicalHistoryStep, ProfileFamilyHistoryStep, ProfileSubstanceStep } from "@/components/profile/OnboardingAdapters";
import { toTurkishFrequency } from "@/lib/frequency";
import { PDFDownloadButton } from "@/components/pdf/PDFDownloadButton";
import { AvatarPicker } from "@/components/profile/AvatarPicker";
import { InlineEdit } from "@/components/profile/InlineEdit";
import { EmergencyContactsSection } from "@/components/profile/EmergencyContactsSection";
import { LinkedAccountsSection } from "@/components/profile/LinkedAccountsSection";
import { AllergiesSection } from "@/components/profile/AllergiesSection";

interface DrugSuggestion {
  brandName: string;
  genericName: string;
}

// ═══════════════════════════════════════════════════════════════════════
// F-PROFILE-001 legacy fork (Commit 1)
//
// Default route renders the new sidebar shell (ProfileShellV2) which
// lives in components/profile-v2/. The 1981-line monolith below is
// preserved as LegacyProfilePage and reachable via `?legacy=true` —
// that URL is the fallback surfaced by every placeholder tab. Once
// Commits 2-5 migrate each tab's real content, Commit 6 deletes the
// legacy body + the `?legacy=true` branch (with a silent redirect for
// any bookmarked URL).
// ═══════════════════════════════════════════════════════════════════════
export default function ProfilePage() {
  const searchParams = useSearchParams();
  const isLegacy = searchParams.get("legacy") === "true";
  if (!isLegacy) return <ProfileShellV2 />;
  return <LegacyProfilePage />;
}

function LegacyProfilePage() {
  const router = useRouter();
  const { lang } = useLang();
  const { isAuthenticated, isLoading, profile: authProfile, user, refreshProfile } = useAuth();
  const { activeUserId, isOwnProfile, canEdit, hasManageRole, needsPremiumToEdit } = useActiveProfile();
  const { familyGroup } = useFamily();
  const [viewedProfile, setViewedProfile] = useState<UserProfile | null>(null);
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

  // Session 42 F-D-006: medication-add form draft persistence. Same pattern
  // as FamilyHistorySection (Session 39) now that the shared helpers live in
  // lib/ui/draft-persist. Persist while the add panel is open, restore when
  // reopened, clear on successful save. Cancel just closes — leaves the
  // draft around so an accidental close doesn't throw away the user's
  // typing (mirrors the Session 39 behavior the user already knows).
  useEffect(() => {
    if (!isAddingMed) return;
    const draft = readDraft<{ brand: string; generic: string; dosage: string; frequency: string }>(
      DRAFT_KEYS.profileMedicationAdd,
    );
    if (draft) {
      setNewBrandName(draft.brand || "");
      setNewGenericName(draft.generic || "");
      setNewDosage(draft.dosage || "");
      setNewFrequency(draft.frequency || "");
    }
  }, [isAddingMed]);
  useEffect(() => {
    if (!isAddingMed) return;
    persistDraft(DRAFT_KEYS.profileMedicationAdd, {
      brand: newBrandName,
      generic: newGenericName,
      dosage: newDosage,
      frequency: newFrequency,
    });
  }, [isAddingMed, newBrandName, newGenericName, newDosage, newFrequency]);

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
    if (!profile || !canEdit) return;
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
    if (!profile || !canEdit) return;
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
        .eq("id", activeUserId);

      if (error) {
        console.error("Supabase update error:", error);
        // Retry after 1s delay (cold start / connection issue)
        await new Promise(r => setTimeout(r, 1000));
        const { error: retryError } = await supabase
          .from("user_profiles")
          .update(updateData)
          .eq("id", activeUserId);
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

  // F-SAFETY-001: interaction check state — populated after a successful
  // medication insert via checkInteractionsAfterAdd(). Alert survives
  // until the user dismisses it (no autoclose — clinical UX rule).
  // Loading flag drives the "Etkileşimler kontrol ediliyor..." toast.
  const [medInteractionAlert, setMedInteractionAlert] = useState<InteractionCheckResult | null>(null);
  const [medInteractionLoading, setMedInteractionLoading] = useState(false);
  const [medInteractionRateLimited, setMedInteractionRateLimited] = useState(false);

  const showSaveToast = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const addAllergy = async () => {
    if (!newAllergen.trim() || !user || !canEdit) return;
    try {
      const supabase = createBrowserClient();
      const { data, error } = await supabase.from("user_allergies").insert({
        user_id: activeUserId,
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
    if (!canEdit) return;
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
    if (!canEdit) return;
    setHealthForm((prev) => ({
      ...prev,
      chronic_conditions: prev.chronic_conditions.includes(condition)
        ? prev.chronic_conditions.filter((c) => c !== condition)
        : [...prev.chronic_conditions, condition],
    }));
  };

  const addCustomCondition = () => {
    if (!canEdit) return;
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
    if (!canEdit) return;
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

  // Fetch viewed profile data when viewing another user
  useEffect(() => {
    if (!activeUserId || isOwnProfile) {
      setViewedProfile(null);
      return;
    }
    const supabase = createBrowserClient();
    supabase
      .from("user_profiles")
      .select("*")
      .eq("id", activeUserId)
      .single()
      .then(({ data }) => {
        if (data) setViewedProfile(data as UserProfile);
      });
  }, [activeUserId, isOwnProfile]);

  // The effective profile — falls back to authProfile when viewing own data,
  // or to the fetched viewedProfile when looking at a family member.
  // Exposed as `profile` so the large render tree (100+ `profile.x` reads)
  // automatically pivots on the active profile.
  const profile = isOwnProfile ? authProfile : viewedProfile;

  // Command-palette deep links land here with #vucut-olculeri / #medications /
  // #allergy-card etc. Two phases:
  //   (1) If the hash maps to a section that lives INSIDE the collapsed
  //       "Sağlık Profilim" card (BMI / kan grubu / yaşam tarzı / takviye /
  //       üreme), flip editingHealth=true so the target actually mounts.
  //       The standalone cards (#medications, #medical-history,
  //       #allergy-card, #vaccines) render unconditionally and don't need
  //       this — but we still need to wait for `profile` to fill since the
  //       conditional Cards (medical-history, allergy) only mount after.
  //   (2) After a short delay (give the new section + Cards a frame to
  //       paint) smooth-scroll the target into view + flash a 2 s emerald
  //       ring. Ref-guard so re-renders / family-profile switches don't
  //       re-fire the scroll.
  const hashScrollDoneRef = useRef(false);

  // Hashes that live inside the collapsed Health Profile card. Anchors
  // OUTSIDE this set (#medications, #allergy-card, #vaccines,
  // #medical-history) are top-level Cards and don't require unfolding.
  const HEALTH_PROFILE_HASHES = useMemo(
    () => new Set([
      "vucut-olculeri",
      "kan-grubu",
      "yasam-tarzi",
      "takviyelerim",
      "ureme-sagligi",
    ]),
    [],
  );

  useEffect(() => {
    if (!profile || hashScrollDoneRef.current) return;
    if (typeof window === "undefined") return;
    const rawHash = window.location.hash;
    if (!rawHash || rawHash.length < 2) return;
    const hashId = rawHash.slice(1); // strip leading #

    // Phase 1: open the Health Profile card if the target is inside it.
    if (HEALTH_PROFILE_HASHES.has(hashId)) {
      setEditingHealth(true);
    }

    // Phase 2: wait for the section to mount (longer when we just toggled
    // editingHealth — the inner LifestyleSection / supplements / repro
    // blocks need at least one frame to render before scrollIntoView can
    // find them).
    const delay = HEALTH_PROFILE_HASHES.has(hashId) ? 400 : 200;
    const t = setTimeout(() => {
      let el: Element | null = null;
      try { el = document.querySelector(rawHash); } catch { /* invalid selector */ }
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      el.classList.add("ring-2", "ring-emerald-500", "ring-offset-2", "rounded-xl", "transition-all");
      window.setTimeout(() => {
        el?.classList.remove("ring-2", "ring-emerald-500", "ring-offset-2");
      }, 2000);
      hashScrollDoneRef.current = true;
    }, delay);
    return () => clearTimeout(t);
  }, [profile, HEALTH_PROFILE_HASHES]);

  useEffect(() => {
    if (!activeUserId) return;
    const supabase = createBrowserClient();

    Promise.all([
      supabase.from("user_medications").select("*").eq("user_id", activeUserId).eq("is_active", true),
      supabase.from("user_allergies").select("*").eq("user_id", activeUserId),
      supabase.from("blood_tests").select("id", { count: "exact", head: true }).eq("user_id", activeUserId),
      supabase.from("query_history").select("query_type, created_at").eq("user_id", activeUserId).order("created_at", { ascending: false }).limit(5),
      supabase.from("daily_check_ins").select("check_date").eq("user_id", activeUserId).order("check_date", { ascending: false }).limit(30),
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
          const d = new Date(streakRes.data[i].check_date); d.setHours(0, 0, 0, 0);
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
  }, [activeUserId, lang]);

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
    if (!newBrandName.trim() || !user || !canEdit) return;
    setSavingMed(true);
    try {
      // F-SAFETY-001 cosmetic: OpenFDA's generic_name often arrives with
      // underscores ("warfarin_sodium") or hyphens. Normalise once at
      // write-time so every downstream consumer (interaction-map prompt,
      // SBAR PDF, chat profile context) gets a clean human-readable name.
      // Title-casing is left to display layers — the user might want
      // "PARACETAMOL" all-caps or a specific brand styling.
      const normaliseMedName = (s: string) =>
        s.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
      const supabase = createBrowserClient();
      const { data, error } = await supabase.from("user_medications").insert({
        user_id: activeUserId,
        brand_name: normaliseMedName(newBrandName),
        generic_name: newGenericName.trim() ? normaliseMedName(newGenericName) : null,
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
      clearDraft(DRAFT_KEYS.profileMedicationAdd); // Session 42 F-D-006
      setIsAddingMed(false);
      showSaveToast();

      // ── F-SAFETY-001: fire interaction check against the new regimen.
      // Async/best-effort — a slow /api/interaction-map call should never
      // block the UI from clearing the form. Result lands in
      // medInteractionAlert, which renders the top-of-page banner. Previous
      // alert is cleared first so a stale one doesn't survive past a new
      // insert that happens to be safe.
      setMedInteractionAlert(null);
      setMedInteractionRateLimited(false);
      if (activeUserId) {
        void checkInteractionsAfterAdd({
          userId: activeUserId,
          lang: (lang === "tr" ? "tr" : "en") as "tr" | "en",
          onLoadingStart: () => setMedInteractionLoading(true),
          onResult: (result) => {
            setMedInteractionLoading(false);
            if (result.dangerous.length > 0 || result.caution.length > 0) {
              setMedInteractionAlert(result);
            }
          },
          onRateLimited: () => setMedInteractionRateLimited(true),
          onError: () => setMedInteractionLoading(false),
        });
      }

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
    if (!canEdit) return;
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
    if (!profile || !canEdit) return;
    setConfirming(true);
    try {
      const supabase = createBrowserClient();
      await supabase
        .from("user_profiles")
        .update({ last_medication_update: new Date().toISOString() })
        .eq("id", activeUserId);
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

  // ── Profile Completion (SINGLE SOURCE OF TRUTH) ──
  // Tek `calculateProfilePower` çağrısı — hem Profil Gücü kartı hem de alt banner
  // bu hesaplamadan beslenir. Eski 8-item `completionChecks` array'i kaldırıldı
  // (banner ile kart arasındaki %56 vs %100 tutarsızlığının kaynağıydı).
  const vaccinesArr = Array.isArray(profile.vaccines) ? profile.vaccines : [];
  const powerInput: ProfilePowerInput = {
    hasBasicInfo: !!(profile.full_name && profile.age && profile.gender),
    medicationCount: medications.length,
    supplementCount: (profile.supplements || []).filter((s: string) => !s.startsWith("meta:")).length,
    hasAllergies: allergies.length > 0,
    hasChronicConditions: (profile.chronic_conditions || []).filter((c: string) => !c.startsWith('family:')).length > 0,
    hasFamilyHistory: (profile.chronic_conditions || []).some((c: string) => c.startsWith('family:')),
    vaccineCount: vaccinesArr.filter((v: { status: string }) => v.status === 'done').length,
    hasContactInfo: !!(profile.country || profile.city || profile.phone),
    hasLifestyle: !!(profile.height_cm || profile.weight_kg || profile.exercise_frequency || profile.sleep_quality),
  };
  const power = calculateProfilePower(powerInput);
  const completionPct = power.percentage;

  // Motivation logic — hangi bölüme yönlendirelim? (banner mesajı için ayrı)
  const motivationOrder: { id: string; done: boolean }[] = [
    { id: "name", done: !!profile.full_name },
    { id: "meds", done: medications.length > 0 },
    { id: "allergies", done: allergies.length > 0 },
    { id: "medical", done: profile.kidney_disease !== null && profile.kidney_disease !== undefined },
    { id: "lifestyle", done: !!(profile.alcohol_use || profile.smoking_use) },
    { id: "body", done: !!(profile.height_cm && profile.weight_kg) },
    { id: "blood", done: !!(profile.blood_group) },
  ];
  const nextIncomplete = motivationOrder.find(c => !c.done);

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
      <LocalizedTitle tr="Profil" en="Profile" />
      {/* View-only banner — other member, no manage role */}
      {!isOwnProfile && !hasManageRole && (
        <div className="mb-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-950/20 px-4 py-3 text-center">
          <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
            {tx("family.viewOnlyBanner", lang).replace("{name}", profile?.full_name?.split(" ")[0] || (tr ? "Aile üyesi" : "Family member"))}
          </p>
        </div>
      )}
      {/* Premium required — has manage role but not Premium */}
      {!isOwnProfile && needsPremiumToEdit && (
        <div className="mb-4 rounded-xl border border-amber-300 dark:border-amber-700 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-center sm:text-left">
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
              {tx("family.viewOnlyBanner", lang).replace("{name}", profile?.full_name?.split(" ")[0] || (tr ? "Aile üyesi" : "Family member"))}
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
              {tx("family.upgradeToEdit", lang)}
            </p>
          </div>
          <Link
            href="/pricing"
            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition-colors"
          >
            ✨ {tx("family.upgradeCta", lang)}
          </Link>
        </div>
      )}
      {/* Full manage — other member, has role AND Premium */}
      {!isOwnProfile && canEdit && (
        <div className="mb-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/80 dark:bg-emerald-950/20 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-emerald-800 dark:text-emerald-300 font-medium">
            {tx("family.managingBanner", lang).replace("{name}", profile?.full_name?.split(" ")[0] || (tr ? "Aile üyesi" : "Family member"))}
          </p>
        </div>
      )}

      {/* SOS — always visible when viewing a family member (emergency features
          are never gated behind Premium or management role; KVKK/safety) */}
      {!isOwnProfile && familyGroup?.id && (
        <div className="mb-4 rounded-xl border-2 border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/20 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-start gap-2 flex-1">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-900 dark:text-red-200">
                {tr ? "Acil Durum" : "Emergency"}
              </p>
              <p className="text-xs text-red-700 dark:text-red-300">
                {tr
                  ? `${profile?.full_name?.split(" ")[0] || "Bu kişi"} için aile üyelerine acil bildirim gönder`
                  : `Send an emergency alert to family members about ${profile?.full_name?.split(" ")[0] || "this person"}`}
              </p>
            </div>
          </div>
          <SOSButton
            groupId={familyGroup.id}
            targetName={profile?.full_name?.split(" ")[0] || null}
            lang={lang as "en" | "tr"}
          />
        </div>
      )}
      {/* Save success toast */}
      {saveSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-sm font-medium">{tx("common.saved", lang)}</span>
        </div>
      )}

      {/* F-SAFETY-001 toasts — rate-limit info + loading indicator.
          Banner itself is mounted above the page title below. */}
      {medInteractionRateLimited && (
        <div className="fixed bottom-24 right-4 z-40 bg-blue-100 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 px-4 py-2 rounded-lg shadow-lg text-xs max-w-sm border border-blue-200 dark:border-blue-800">
          {tr
            ? "Etkileşim kontrolü şu an yoğun, birkaç dakika sonra otomatik tekrar denenecek."
            : "Interaction check is busy right now — we'll retry automatically in a few minutes."}
        </div>
      )}
      {medInteractionLoading && (
        <div className="fixed bottom-20 right-4 z-40 bg-card border border-border text-foreground px-4 py-2 rounded-lg shadow-lg text-xs flex items-center gap-2">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          {tr ? "Etkileşimler kontrol ediliyor…" : "Checking interactions…"}
        </div>
      )}

      <h1 className="font-heading mb-4 text-3xl font-semibold">
        {tx('profile.title', lang)}
      </h1>

      {/* ── PROFILE POWER HEADER (single source: `power` computed once above) ── */}
      {profile && <ProfilePowerHeader power={power} input={powerInput} lang={lang as 'en' | 'tr'} />}

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
            {/* Avatar — DiceBear picker */}
            <div className="relative shrink-0">
              <AvatarPicker
                userId={activeUserId || user!.id}
                userName={profile.full_name || user?.email?.split("@")[0] || ""}
                lang={lang as "en" | "tr"}
                onAvatarChange={refreshProfile}
              />
              <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow">
                <span className="text-xs font-bold">{"\u2713"}</span>
              </div>
            </div>
            {/* Info + Score */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-bold flex items-center gap-2">
                {profile.full_name || user?.email?.split("@")[0] || "Member"}
                {canEdit && (
                  <button onClick={startEditingHealth} className="text-gray-400 hover:text-primary transition-colors" aria-label={tr ? "Düzenle" : "Edit"}>
                    <Edit3 className="h-4 w-4" />
                  </button>
                )}
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
              <p className="text-xl font-bold text-emerald-600">{(profile.supplements || []).filter((s: string) => !s.startsWith("meta:")).length || 0}</p>
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
                  supplementsTracked: (profile.supplements || []).filter((s: string) => !s.startsWith("meta:")).length, waterGoalHits: 0,
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

      {/* ── Dynamic completion banner (driven by same `power.percentage`) ── */}
      {(() => {
        const msg = getCompletionMessage(power.percentage, lang as 'en' | 'tr');
        // Tone → color (only "done" gets the celebratory green; others use neutral primary tint)
        const palette = msg.tone === 'done'
          ? { border: 'border-green-200 dark:border-green-800', bg: 'bg-green-50 dark:bg-green-950/20', circleBg: 'bg-green-100 dark:bg-green-900/30', icon: 'text-green-600', title: 'text-green-800 dark:text-green-300', sub: 'text-green-600 dark:text-green-400' }
          : msg.tone === 'almost'
          ? { border: 'border-emerald-200 dark:border-emerald-800', bg: 'bg-emerald-50 dark:bg-emerald-950/20', circleBg: 'bg-emerald-100 dark:bg-emerald-900/30', icon: 'text-emerald-600', title: 'text-emerald-800 dark:text-emerald-300', sub: 'text-emerald-600 dark:text-emerald-400' }
          : msg.tone === 'good'
          ? { border: 'border-blue-200 dark:border-blue-800', bg: 'bg-blue-50 dark:bg-blue-950/20', circleBg: 'bg-blue-100 dark:bg-blue-900/30', icon: 'text-blue-600', title: 'text-blue-800 dark:text-blue-300', sub: 'text-blue-600 dark:text-blue-400' }
          : msg.tone === 'progress'
          ? { border: 'border-amber-200 dark:border-amber-800', bg: 'bg-amber-50 dark:bg-amber-950/20', circleBg: 'bg-amber-100 dark:bg-amber-900/30', icon: 'text-amber-600', title: 'text-amber-800 dark:text-amber-300', sub: 'text-amber-600 dark:text-amber-400' }
          : { border: 'border-orange-200 dark:border-orange-800', bg: 'bg-orange-50 dark:bg-orange-950/20', circleBg: 'bg-orange-100 dark:bg-orange-900/30', icon: 'text-orange-600', title: 'text-orange-800 dark:text-orange-300', sub: 'text-orange-600 dark:text-orange-400' };
        return (
          <div className={`mb-6 rounded-xl border ${palette.border} ${palette.bg} p-4 flex items-center gap-3`}>
            <div className={`h-10 w-10 rounded-full ${palette.circleBg} flex items-center justify-center flex-shrink-0`}>
              {msg.tone === 'done'
                ? <CheckCircle2 className={`h-5 w-5 ${palette.icon}`} />
                : <Sparkles className={`h-5 w-5 ${palette.icon}`} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${palette.title}`}>{msg.title}</p>
              <p className={`text-xs ${palette.sub}`}>{msg.subtitle}</p>
            </div>
          </div>
        );
      })()}

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
              <PDFDownloadButton lang={lang as "en" | "tr"} className="flex-1 sm:flex-initial" />
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
            <InlineEdit value={profile.full_name} lang={lang} placeholder={tr ? "Adın" : "Your name"} disabled={!canEdit}
              onSave={async (v) => { if (!canEdit) return; const sb = createBrowserClient(); await sb.from("user_profiles").update({ full_name: v }).eq("id", profile.id); await refreshProfile(); }} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{tx('profile.email', lang)}</p>
            <p className="font-medium">{user?.email || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{tx('profile.age', lang)}</p>
            <InlineEdit value={profile.age} lang={lang} type="number" placeholder={tr ? "Yaş" : "Age"} disabled={!canEdit}
              onSave={async (v) => { if (!canEdit) return; const sb = createBrowserClient(); await sb.from("user_profiles").update({ age: parseInt(v) || null }).eq("id", profile.id); await refreshProfile(); }} />
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
                <InlineEdit value={displayValue} lang={lang} type="chips" disabled={!canEdit}
                  options={[
                    { value: "male", label: tr ? "Erkek" : "Male" },
                    { value: "female", label: tr ? "Kadın" : "Female" },
                    { value: "other", label: tr ? "Diğer" : "Other" },
                  ]}
                  onSave={async (v) => { if (!canEdit) return; const sb = createBrowserClient(); await sb.from("user_profiles").update({ gender: v }).eq("id", profile.id); await refreshProfile(); }} />
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

      {/* F-SAFETY-001 (post-launch UX): banner lives HERE — right above
          the Medications card where the user was focused when they hit
          Save. Banner's own post-mount effect scrollIntoView({ center })
          and flashes a 3 s ring so even a user already mid-page sees the
          alert. Feature flag NEXT_PUBLIC_SAFETY_BANNER guards the UI;
          helper still fires + collects telemetry when the flag is off
          so we can iterate safely. */}
      {SAFETY_BANNER_ENABLED && medInteractionAlert && (
        <MedicationInteractionBanner
          dangerous={medInteractionAlert.dangerous}
          caution={medInteractionAlert.caution}
          summary={medInteractionAlert.summary}
          lang={(lang === "tr" ? "tr" : "en") as "tr" | "en"}
          onDismiss={() => setMedInteractionAlert(null)}
          onAskDoctor={() => setSbarEmailOpen(true)}
        />
      )}

      {/* Medications — Editable */}
      <Card id="medications" className={`mb-6 rounded-xl shadow-sm hover:shadow-md transition-shadow scroll-mt-20 ${medications.length > 0 ? 'border-l-4 border-l-green-500' : ''}`}>
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
                  disabled={!canEdit}
                  onClick={() => canEdit && setIsAddingMed(true)}
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
              userId={activeUserId || user.id}
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
              onClick={() => canEdit && setIsAddingMed(true)}
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
                          {med.frequency && <Badge variant="outline">{tr ? toTurkishFrequency(med.frequency) : med.frequency}</Badge>}
                        </div>
                      )}
                    </div>
                  </div>
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => removeMedication(med.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
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
              canEdit && (
                <Button variant="outline" size="sm" onClick={startEditingHealth}>
                  {tx("profile.edit", lang)}
                </Button>
              )
            ) : (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={saveHealthProfile}
                  disabled={savingHealth || !canEdit}
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
                {/* anchor target for command-palette "hamilelik / emzirme" */}
                <div id="ureme-sagligi" className="space-y-3 scroll-mt-20">
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

            {/* Substance Use — Onboarding SubstanceStep reuse (with pack-year details) */}
            <ProfileSubstanceStep
              alcoholUse={healthForm.alcohol_use}
              smokingUse={healthForm.smoking_use}
              onUpdate={(updates) => setHealthForm(p => ({
                ...p,
                ...(updates.alcohol_use !== undefined ? { alcohol_use: updates.alcohol_use } : {}),
                ...(updates.smoking_use !== undefined ? { smoking_use: updates.smoking_use } : {}),
              }))}
            />

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
              <ProfileMedicalHistoryStep
                chronicConditions={healthForm.chronic_conditions}
                onUpdate={(conditions) => setHealthForm(p => ({ ...p, chronic_conditions: conditions }))}
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

            {/* Supplements — Onboarding SupplementsStep reuse
                anchor target for command-palette "takviye / supplement" */}
            <div id="takviyelerim" className="space-y-3 scroll-mt-20">
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
              <ProfileSupplementsStep
                userId={activeUserId || user!.id}
                supplements={healthForm.supplements}
                onUpdate={(supps) => setHealthForm(p => ({ ...p, supplements: supps }))}
              />
            </div>

            <Separator />

            {/* Gamified Lifestyle Section
                anchor target for command-palette "yaşam tarzı / alkol / sigara" */}
            <div id="yasam-tarzi" className="space-y-3 scroll-mt-20">
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
                disabled={savingHealth || !canEdit}
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

        {!editingHealth && canEdit && (
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
        const surgNames = ["Bariatric Surgery"];
        const surgItems = conditions.filter((c: string) => surgNames.includes(c) || isSurgery(c));
        const groupDefs = [
          { key: "cardio", label: tr ? "Kardiyovasküler" : "Cardiovascular", icon: "❤️", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300", items: conditions.filter((c: string) => cardio.includes(c)) },
          { key: "endo", label: tr ? "Endokrin" : "Endocrine", icon: "🩺", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300", items: conditions.filter((c: string) => endo.includes(c)) },
          { key: "neuro", label: tr ? "Nörolojik" : "Neurological", icon: "🧠", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300", items: conditions.filter((c: string) => neuro.includes(c)) },
          { key: "resp", label: tr ? "Solunum" : "Respiratory", icon: "🫁", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300", items: conditions.filter((c: string) => resp.includes(c)) },
          { key: "surg", label: tr ? "Cerrahi Geçmiş" : "Surgical History", icon: "🔪", color: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300", items: surgItems },
        ].filter(g => g.items.length > 0);
        const others = conditions.filter((c: string) => ![...cardio, ...endo, ...neuro, ...resp, ...surgNames].includes(c) && !isSurgery(c));

        // Cardiometabolic risk detection
        const hasCardioMetabolic = conditions.includes("Diabetes") && conditions.includes("Hypertension");

        return (
          <>
            {!isEmpty && <Card className="mb-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-purple-500 scroll-mt-20" id="medical-history">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  {`🏥 ${conditions.length + (hasCritical ? 1 : 0)} ${tr ? "Kronik Durum Kayıtlı" : "Chronic Conditions Recorded"}`}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(
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
                          {g.items.map((c: string) => <Badge key={c} className={g.color}>{translateCondition(c, lang)}</Badge>)}
                        </div>
                      </div>
                    ))}
                    {others.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {others.map((c: string) => <Badge key={c} variant="secondary">{translateCondition(c, lang)}</Badge>)}
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
            </Card>}

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
                        <ProfileFamilyHistoryStep
                          chronicConditions={profile.chronic_conditions || []}
                          onUpdate={async (conditions) => {
                            const supabase = createBrowserClient();
                            await supabase.from('user_profiles').update({ chronic_conditions: conditions }).eq('id', activeUserId);
                            await refreshProfile();
                          }}
                        />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          {familyItems.map((c: string) => (
                            <div key={c} className="flex items-center justify-between rounded-lg border px-3 py-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm">{c.toLowerCase().includes("heart") || c.toLowerCase().includes("kalp") ? "❤️" : c.toLowerCase().includes("diabet") || c.toLowerCase().includes("diyabet") ? "🩸" : "🧬"}</span>
                                <span className="text-sm font-medium">{translateCondition(c, lang)}</span>
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

      {/* Sections that do their own mutations — lock down when !canEdit.
          RLS also protects at DB layer (user_id = auth.uid() on inserts/updates)
          but this prevents the UI from pretending mutations worked. */}
      <div className={!canEdit ? "pointer-events-none opacity-70 select-none" : undefined}>
        {!canEdit && (
          <div className="mb-3 rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20 p-3 text-xs text-amber-800 dark:text-amber-200 pointer-events-auto">
            {tr
              ? "⚠️ Bu profili yalnızca görüntüleyebilirsin. Düzenleme için aile kurucusunun yönetim izni vermesi ve Premium üyelik gerekir."
              : "⚠️ You can only view this profile. Editing requires management permission from the family owner and an active Premium subscription."}
          </div>
        )}
        {/* Allergies — SBAR enriched */}
        <AllergiesSection
          lang={lang}
          allergies={allergies}
          newAllergen={newAllergen}
          setNewAllergen={setNewAllergen}
          newAllergenSeverity={newAllergenSeverity}
          setNewAllergenSeverity={setNewAllergenSeverity}
          addAllergy={addAllergy}
          removeAllergy={removeAllergy}
        />
      </div>

      {/* Health Flags card moved up — see above */}


      {/* Data Management moved to Settings page */}

      {/* Notification Permission Bottom Sheet */}
      <PermissionBottomSheet
        type="notification"
        open={showNotifPermission}
        onGranted={() => setShowNotifPermission(false)}
        onDismissed={() => setShowNotifPermission(false)}
      />

      <div className={!canEdit ? "pointer-events-none opacity-70 select-none" : undefined}>
        {/* Vaccine Profile */}
        <VaccineProfileSection lang={lang} userId={activeUserId || profile.id} initialVaccines={Array.isArray(profile.vaccines) ? profile.vaccines : undefined} />

        {/* Family Management Permission — always own settings, not the viewed profile's */}
        {canEdit && <FamilyManagementSettings lang={lang} />}

        {/* Emergency Contacts */}
        <EmergencyContactsSection lang={lang} userId={activeUserId || profile.id} />

        {/* Linked Accounts — only show for own profile */}
        {isOwnProfile && <LinkedAccountsSection lang={lang} userId={activeUserId || profile.id} />}
      </div>

      {/* Privacy Settings & Consent Management (KVKK Md.11 — MADDE 1-3, 10) */}
      {/* Privacy Settings — ONLY for own profile (KVKK: consent must be unambiguous).
          Hidden entirely when viewing a family member to prevent the user from
          accidentally changing their *own* consent while looking at someone else. */}
      {isOwnProfile && (
        <Card className="mb-6 rounded-xl shadow-sm hover:shadow-md transition-shadow" id="privacy-settings">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <span>🔒</span>
              {tr ? "Gizlilik Ayarları" : "Privacy Settings"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PrivacySettings />
          </CardContent>
        </Card>
      )}

      {/* Scanners removed — kept for mobile app later */}

      {/* FAB removed — SBAR PDF download/email available in Doctor Summary card */}
    </div>
  );
}
