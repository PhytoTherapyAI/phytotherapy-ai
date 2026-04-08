// © 2026 DoctoPal — All Rights Reserved
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X, Stethoscope, ShieldAlert, Scissors, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Portal dropdown to avoid overflow clipping
function DropdownPortal({ children, show }: { children: React.ReactNode; show: boolean }) {
  if (!show || typeof document === "undefined") return null;
  return createPortal(<>{children}</>, document.body);
}
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import type { OnboardingData } from "../OnboardingWizard";

interface Props {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

// ── Autocomplete disease list (TR/EN pairs, stored as EN id) ──
const DISEASE_AUTOCOMPLETE: { id: string; tr: string; en: string }[] = [
  { id: "Diabetes", tr: "Diyabet", en: "Diabetes" },
  { id: "Type 1 Diabetes", tr: "Tip 1 Diyabet", en: "Type 1 Diabetes" },
  { id: "Type 2 Diabetes", tr: "Tip 2 Diyabet", en: "Type 2 Diabetes" },
  { id: "Gestational Diabetes", tr: "Gebelik Diyabeti", en: "Gestational Diabetes" },
  { id: "Hypertension", tr: "Hipertansiyon", en: "Hypertension" },
  { id: "Asthma", tr: "Astım", en: "Asthma" },
  { id: "COPD", tr: "KOAH", en: "COPD" },
  { id: "Hypothyroidism", tr: "Hipotiroidi", en: "Hypothyroidism" },
  { id: "Hyperthyroidism", tr: "Hipertiroidi", en: "Hyperthyroidism" },
  { id: "Kidney Failure", tr: "Böbrek Yetmezliği", en: "Kidney Failure" },
  { id: "Liver Failure", tr: "Karaciğer Yetmezliği", en: "Liver Failure" },
  { id: "Heart Failure", tr: "Kalp Yetmezliği", en: "Heart Failure" },
  { id: "Coronary Artery Disease", tr: "Koroner Arter Hastalığı", en: "Coronary Artery Disease" },
  { id: "Arrhythmia", tr: "Aritmi", en: "Arrhythmia" },
  { id: "Epilepsy", tr: "Epilepsi", en: "Epilepsy" },
  { id: "Migraine", tr: "Migren", en: "Migraine" },
  { id: "Depression/Anxiety", tr: "Depresyon / Anksiyete", en: "Depression / Anxiety" },
  { id: "Rheumatoid Arthritis", tr: "Romatoid Artrit", en: "Rheumatoid Arthritis" },
  { id: "Psoriasis", tr: "Sedef Hastalığı", en: "Psoriasis" },
  { id: "Lupus", tr: "Lupus", en: "Lupus" },
  { id: "Crohn's Disease", tr: "Crohn Hastalığı", en: "Crohn's Disease" },
  { id: "Ulcerative Colitis", tr: "Ülseratif Kolit", en: "Ulcerative Colitis" },
  { id: "Anemia", tr: "Anemi", en: "Anemia" },
  { id: "Sickle Cell Anemia", tr: "Orak Hücre Anemisi", en: "Sickle Cell Anemia" },
  { id: "Thalassemia", tr: "Talasemi", en: "Thalassemia" },
  { id: "Kidney Stones", tr: "Böbrek Taşı", en: "Kidney Stones" },
  { id: "Osteoporosis", tr: "Osteoporoz", en: "Osteoporosis" },
  { id: "Fibromyalgia", tr: "Fibromiyalji", en: "Fibromyalgia" },
  { id: "Multiple Sclerosis", tr: "Multiple Skleroz", en: "Multiple Sclerosis" },
  { id: "Parkinson's Disease", tr: "Parkinson", en: "Parkinson's Disease" },
  { id: "Alzheimer's Disease", tr: "Alzheimer", en: "Alzheimer's Disease" },
  { id: "PCOS", tr: "Polikistik Over Sendromu", en: "Polycystic Ovary Syndrome" },
  { id: "Endometriosis", tr: "Endometriozis", en: "Endometriosis" },
  { id: "Prostate Hypertrophy", tr: "Prostat Hipertrofisi", en: "Prostate Hypertrophy" },
  { id: "Glaucoma", tr: "Glokom", en: "Glaucoma" },
  { id: "Cataract", tr: "Katarakt", en: "Cataract" },
  { id: "Hearing Loss", tr: "İşitme Kaybı", en: "Hearing Loss" },
  { id: "Thyroid Disorder", tr: "Tiroid Bozukluğu", en: "Thyroid Disorder" },
];

// ── Surgery database ──
interface SurgeryDef { id: string; tr: string; en: string; cat: string }
const SURGERY_DB: SurgeryDef[] = [
  // Cardiovascular
  { id: "Bypass Surgery", tr: "Bypass Ameliyatı", en: "Bypass Surgery", cat: "cardio" },
  { id: "Heart Valve Surgery", tr: "Kalp Kapak Ameliyatı", en: "Heart Valve Surgery", cat: "cardio" },
  { id: "Pacemaker Implant", tr: "Kalp Pili Takılması (Pace Maker)", en: "Pacemaker Implant", cat: "cardio" },
  { id: "Stent Placement", tr: "Stent", en: "Stent Placement", cat: "cardio" },
  // General Surgery
  { id: "Appendectomy", tr: "Apandis Ameliyatı (Apendektomi)", en: "Appendectomy", cat: "general" },
  { id: "Cholecystectomy", tr: "Safra Kesesi Ameliyatı (Kolesistektomi)", en: "Cholecystectomy", cat: "general" },
  { id: "Hernia Repair", tr: "Fıtık Ameliyatı", en: "Hernia Repair", cat: "general" },
  { id: "Inguinal Hernia", tr: "Kasık Fıtığı Ameliyatı", en: "Inguinal Hernia Repair", cat: "general" },
  { id: "Bowel Resection", tr: "Bağırsak Kesme Ameliyatı (Rezeksiyon)", en: "Bowel Resection", cat: "general" },
  // Bariatric / Digestive
  { id: "Bariatric Surgery", tr: "Bariatrik Cerrahi", en: "Bariatric Surgery", cat: "bariatric" },
  { id: "Gastric Sleeve", tr: "Gastrik Sleeve", en: "Gastric Sleeve", cat: "bariatric" },
  { id: "Gastric Bypass", tr: "Gastrik Bypass", en: "Gastric Bypass", cat: "bariatric" },
  { id: "Gastric Band", tr: "Mide Bandı", en: "Gastric Band", cat: "bariatric" },
  // Orthopedics
  { id: "Knee Replacement", tr: "Diz Protezi", en: "Knee Replacement", cat: "ortho" },
  { id: "Hip Replacement", tr: "Kalça Protezi", en: "Hip Replacement", cat: "ortho" },
  { id: "Spinal Surgery", tr: "Omurga Ameliyatı", en: "Spinal Surgery", cat: "ortho" },
  { id: "Spondylolisthesis Surgery", tr: "Omurga Kayması Ameliyatı (Spondilolistezis)", en: "Spondylolisthesis Surgery", cat: "ortho" },
  { id: "Meniscus Surgery", tr: "Menisküs Ameliyatı", en: "Meniscus Surgery", cat: "ortho" },
  { id: "Fracture Fixation", tr: "Kırık Tespiti (Plak/Vida)", en: "Fracture Fixation", cat: "ortho" },
  // Urology / Gynecology
  { id: "Prostate Surgery", tr: "Prostat Ameliyatı", en: "Prostate Surgery", cat: "urogyn" },
  { id: "Kidney Stone Surgery", tr: "Böbrek Taşı Ameliyatı", en: "Kidney Stone Surgery", cat: "urogyn" },
  { id: "Varicocele Surgery", tr: "Varikosel Ameliyatı", en: "Varicocele Surgery", cat: "urogyn" },
  { id: "Hysterectomy", tr: "Rahim Ameliyatı (Histerektomi)", en: "Hysterectomy", cat: "urogyn" },
  { id: "Cesarean Section", tr: "Sezaryen", en: "Cesarean Section", cat: "urogyn" },
  { id: "Ovarian Cyst Surgery", tr: "Over Kisti Ameliyatı", en: "Ovarian Cyst Surgery", cat: "urogyn" },
  { id: "Tubal Ligation", tr: "Tüp Bağlama (Ligasyon)", en: "Tubal Ligation", cat: "urogyn" },
  // Neurology
  { id: "Brain Tumor Surgery", tr: "Beyin Tümörü Ameliyatı", en: "Brain Tumor Surgery", cat: "neuro" },
  { id: "Disc Herniation Surgery", tr: "Bel/Boyun Fıtığı Ameliyatı (Disk Hernisi)", en: "Disc Herniation Surgery", cat: "neuro" },
  { id: "Carpal Tunnel Surgery", tr: "Bilek Sıkışma Siniri Ameliyatı (Karpal Tünel)", en: "Carpal Tunnel Surgery", cat: "neuro" },
  // Eye / ENT
  { id: "Cataract Surgery", tr: "Katarakt Ameliyatı", en: "Cataract Surgery", cat: "eyeent" },
  { id: "LASIK", tr: "Lazer Göz Ameliyatı (LASIK)", en: "LASIK", cat: "eyeent" },
  { id: "Tonsillectomy", tr: "Bademcik Ameliyatı (Tonsillektomi)", en: "Tonsillectomy", cat: "eyeent" },
  { id: "Sinus Surgery", tr: "Sinüs Ameliyatı", en: "Sinus Surgery", cat: "eyeent" },
  { id: "Strabismus Surgery", tr: "Şaşılık Ameliyatı", en: "Strabismus Surgery", cat: "eyeent" },
  { id: "Ear Tube Insertion", tr: "Kulak Tüpü Takılması", en: "Ear Tube Insertion", cat: "eyeent" },
  // Other
  { id: "Thyroid Surgery", tr: "Tiroid Ameliyatı", en: "Thyroid Surgery", cat: "other" },
  { id: "Breast Surgery", tr: "Meme Ameliyatı", en: "Breast Surgery", cat: "other" },
  { id: "Organ Transplant", tr: "Organ Nakli", en: "Organ Transplant", cat: "other" },
  { id: "Plastic Surgery", tr: "Plastik Cerrahi", en: "Plastic Surgery", cat: "other" },
];

const SURGERY_CATS = [
  { key: "cardio", labelKey: "onb.surgeryCatCardio" },
  { key: "general", labelKey: "onb.surgeryCatGeneral" },
  { key: "bariatric", labelKey: "onb.surgeryCatBariatric" },
  { key: "ortho", labelKey: "onb.surgeryCatOrtho" },
  { key: "urogyn", labelKey: "onb.surgeryCatUroGyn" },
  { key: "neuro", labelKey: "onb.surgeryCatNeuro" },
  { key: "eyeent", labelKey: "onb.surgeryCatEyeEnt" },
  { key: "other", labelKey: "onb.surgeryCatOther" },
] as const;

// Turkish-aware lowercase for search
function trLower(s: string): string {
  return s
    .replace(/İ/g, "i").replace(/I/g, "ı").replace(/Ş/g, "ş")
    .replace(/Ğ/g, "ğ").replace(/Ü/g, "ü").replace(/Ö/g, "ö")
    .replace(/Ç/g, "ç").toLowerCase();
}

// ── Surgery helpers ──
// Format: "surgery:ID|YEAR" or "surgery:ID"
function parseSurgeryEntry(s: string): { id: string; year?: number } | null {
  if (!s.startsWith("surgery:")) return null;
  const parts = s.slice(8).split("|");
  return { id: parts[0], year: parts[1] ? parseInt(parts[1], 10) : undefined };
}

function encodeSurgery(id: string, year?: number): string {
  return year ? `surgery:${id}|${year}` : `surgery:${id}`;
}

// System-grouped conditions (no longer includes surgical)
const CONDITION_GROUPS = [
  {
    labelKey: "onb.categoryCardio",
    conditions: [
      { id: "Hypertension", key: "onb.hypertension" },
      { id: "Arrhythmia", key: "onb.arrhythmia" },
      { id: "Heart Failure", key: "onb.heartFailure" },
    ],
  },
  {
    labelKey: "onb.categoryEndocrine",
    conditions: [
      { id: "Diabetes", key: "onb.diabetesType" },
      { id: "Thyroid Disorder", key: "onb.thyroid" },
    ],
  },
  {
    labelKey: "onb.categoryNeuro",
    conditions: [
      { id: "Depression/Anxiety", key: "onb.depressionAnxiety" },
      { id: "Epilepsy", key: "onb.epilepsy" },
    ],
  },
  {
    labelKey: "onb.categoryRespiratory",
    conditions: [
      { id: "Asthma", key: "onb.asthma" },
      { id: "COPD", key: "onb.copd" },
    ],
  },
];

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => { setReduced(!!window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches); }, []);
  return reduced;
}

export function MedicalHistoryStep({ data, updateData }: Props) {
  const { lang } = useLang();
  const reducedMotion = useReducedMotion();
  const [customCondition, setCustomCondition] = useState("");
  const [noChronic, setNoChronic] = useState(false);
  const [suggestions, setSuggestions] = useState<typeof DISEASE_AUTOCOMPLETE>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Surgery autocomplete state
  const [surgerySearch, setSurgerySearch] = useState("");
  const [surgerySuggestions, setSurgerySuggestions] = useState<SurgeryDef[]>([]);
  const [showSurgerySugg, setShowSurgerySugg] = useState(false);
  const [surgeryHighlight, setSurgeryHighlight] = useState(-1);
  const [editingYear, setEditingYear] = useState<string | null>(null);
  const [diseaseDropPos, setDiseaseDropPos] = useState({ top: 0, left: 0, width: 0 });
  const [surgeryDropPos, setSurgeryDropPos] = useState({ top: 0, left: 0, width: 0 });
  const surgeryDropRef = useRef<HTMLDivElement>(null);
  const surgeryInputRef = useRef<HTMLInputElement>(null);

  // All known condition IDs from groups
  const knownIds = CONDITION_GROUPS.flatMap(g => g.conditions.map(c => c.id));

  // Conditions that are NOT in the predefined chip groups and NOT surgery/family
  const customConditions = data.chronic_conditions.filter(
    (c) => !knownIds.includes(c) && !c.startsWith("family:") && !c.startsWith("surgery:")
  );

  // Extract surgery entries
  const surgeryEntries = data.chronic_conditions
    .map(c => ({ raw: c, parsed: parseSurgeryEntry(c) }))
    .filter((e): e is { raw: string; parsed: { id: string; year?: number } } => e.parsed !== null);

  const selectedSurgeryIds = new Set(surgeryEntries.map(e => e.parsed.id));

  const getSurgeryLabel = useCallback((id: string): string => {
    const found = SURGERY_DB.find(s => s.id === id);
    return found ? (lang === "tr" ? found.tr : found.en) : id;
  }, [lang]);

  // Get display name for a condition
  const getConditionLabel = useCallback((id: string): string => {
    const found = DISEASE_AUTOCOMPLETE.find(d => d.id === id);
    if (found) return lang === "tr" ? found.tr : found.en;
    return id;
  }, [lang]);

  // Stable dependency strings
  const conditionsStr = data.chronic_conditions.join(",");
  const surgeryIdsStr = surgeryEntries.map(e => e.parsed.id).join(",");

  // ── Disease autocomplete ──
  useEffect(() => {
    if (customCondition.length < 2) {
      setSuggestions([]); setShowSuggestions(false); setHighlightIdx(-1); return;
    }
    const q = trLower(customCondition);
    const already = new Set(conditionsStr.split(","));
    const matches = DISEASE_AUTOCOMPLETE.filter(d =>
      !already.has(d.id) && (trLower(d.tr).includes(q) || trLower(d.en).includes(q))
    );
    setSuggestions(matches.slice(0, 6));
    setShowSuggestions(true);
    setHighlightIdx(-1);
  }, [customCondition, conditionsStr]);

  // ── Surgery autocomplete ──
  useEffect(() => {
    if (surgerySearch.length < 2) {
      setSurgerySuggestions([]); setShowSurgerySugg(false); setSurgeryHighlight(-1); return;
    }
    const q = trLower(surgerySearch);
    const selIds = new Set(surgeryIdsStr.split(","));
    const matches = SURGERY_DB.filter(s =>
      !selIds.has(s.id) && (trLower(s.tr).includes(q) || trLower(s.en).includes(q))
    );
    setSurgerySuggestions(matches.slice(0, 6));
    setShowSurgerySugg(true);
    setSurgeryHighlight(-1);
  }, [surgerySearch, surgeryIdsStr]);

  // Position dropdowns (portal) — recalculate on scroll
  useEffect(() => {
    if (!showSuggestions || !inputRef.current) return;
    const update = () => { const r = inputRef.current?.getBoundingClientRect(); if (r) setDiseaseDropPos({ top: r.bottom + 4, left: r.left, width: r.width }); };
    update(); window.addEventListener("scroll", update, true); window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update, true); window.removeEventListener("resize", update); };
  }, [showSuggestions, customCondition]);

  useEffect(() => {
    if (!showSurgerySugg || !surgeryInputRef.current) return;
    const update = () => { const r = surgeryInputRef.current?.getBoundingClientRect(); if (r) setSurgeryDropPos({ top: r.bottom + 4, left: r.left, width: r.width }); };
    update(); window.addEventListener("scroll", update, true); window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update, true); window.removeEventListener("resize", update); };
  }, [showSurgerySugg, surgerySearch]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
      if (surgeryDropRef.current && !surgeryDropRef.current.contains(e.target as Node) &&
          surgeryInputRef.current && !surgeryInputRef.current.contains(e.target as Node)) {
        setShowSurgerySugg(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ── Condition helpers ──
  const toggleCondition = (condition: string) => {
    setNoChronic(false);
    const existing = data.chronic_conditions;
    if (existing.includes(condition)) {
      updateData({ chronic_conditions: existing.filter((c) => c !== condition) });
    } else {
      updateData({ chronic_conditions: [...existing, condition] });
    }
  };

  const addConditionFromAutocomplete = (id: string) => {
    setNoChronic(false);
    if (!data.chronic_conditions.includes(id)) {
      updateData({ chronic_conditions: [...data.chronic_conditions, id] });
    }
    setCustomCondition(""); setShowSuggestions(false); setHighlightIdx(-1);
    inputRef.current?.focus();
  };

  const addCustomCondition = () => {
    const trimmed = customCondition.trim();
    if (!trimmed) return;
    addConditionFromAutocomplete(trimmed);
  };

  // ── Surgery helpers ──
  const addSurgery = (id: string) => {
    if (selectedSurgeryIds.has(id)) return;
    setNoChronic(false);
    updateData({ chronic_conditions: [...data.chronic_conditions, encodeSurgery(id)] });
    setSurgerySearch(""); setShowSurgerySugg(false); setSurgeryHighlight(-1);
    surgeryInputRef.current?.focus();
  };

  const removeSurgery = (surgeryId: string) => {
    updateData({
      chronic_conditions: data.chronic_conditions.filter(c => {
        const p = parseSurgeryEntry(c);
        return !p || p.id !== surgeryId;
      }),
    });
  };

  const updateSurgeryYear = (surgeryId: string, year: number | undefined) => {
    updateData({
      chronic_conditions: data.chronic_conditions.map(c => {
        const p = parseSurgeryEntry(c);
        if (p && p.id === surgeryId) return encodeSurgery(surgeryId, year);
        return c;
      }),
    });
  };

  const addCustomSurgery = () => {
    const trimmed = surgerySearch.trim();
    if (!trimmed) return;
    addSurgery(trimmed);
  };

  const toggleSurgeryChip = (def: SurgeryDef) => {
    if (selectedSurgeryIds.has(def.id)) {
      removeSurgery(def.id);
    } else {
      addSurgery(def.id);
    }
  };

  const handleNoChronic = (checked: boolean) => {
    setNoChronic(checked);
    if (checked) {
      updateData({
        chronic_conditions: data.chronic_conditions.filter(c => c.startsWith("family:")),
        kidney_disease: false, liver_disease: false, recent_surgery: false,
      });
    }
  };

  // ── Keyboard nav: disease ──
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) { if (e.key === "Enter") { e.preventDefault(); addCustomCondition(); } return; }
    const total = suggestions.length + (customCondition.trim() ? 1 : 0);
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlightIdx(p => (p + 1) % total); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHighlightIdx(p => (p - 1 + total) % total); }
    else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightIdx >= 0 && highlightIdx < suggestions.length) addConditionFromAutocomplete(suggestions[highlightIdx].id);
      else addCustomCondition();
    } else if (e.key === "Escape") setShowSuggestions(false);
  };

  // ── Keyboard nav: surgery ──
  const handleSurgeryKeyDown = (e: React.KeyboardEvent) => {
    if (!showSurgerySugg) { if (e.key === "Enter") { e.preventDefault(); addCustomSurgery(); } return; }
    const showFree = surgerySearch.trim().length >= 2 &&
      !surgerySuggestions.some(s => trLower(s.tr) === trLower(surgerySearch) || trLower(s.en) === trLower(surgerySearch));
    const total = surgerySuggestions.length + (showFree ? 1 : 0);
    if (e.key === "ArrowDown") { e.preventDefault(); setSurgeryHighlight(p => (p + 1) % total); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSurgeryHighlight(p => (p - 1 + total) % total); }
    else if (e.key === "Enter") {
      e.preventDefault();
      if (surgeryHighlight >= 0 && surgeryHighlight < surgerySuggestions.length) addSurgery(surgerySuggestions[surgeryHighlight].id);
      else addCustomSurgery();
    } else if (e.key === "Escape") setShowSurgerySugg(false);
  };

  const showFreeTextOption = customCondition.trim().length >= 2 &&
    !suggestions.some(s => trLower(s.tr) === trLower(customCondition) || trLower(s.en) === trLower(customCondition));

  const showSurgeryFreeText = surgerySearch.trim().length >= 2 &&
    !surgerySuggestions.some(s => trLower(s.tr) === trLower(surgerySearch) || trLower(s.en) === trLower(surgerySearch));

  return (
    <div className="space-y-5">
      {/* Clean bill of health */}
      <div className="flex items-center space-x-2 rounded-xl bg-green-50 dark:bg-green-950/20 p-3 border border-green-200 dark:border-green-800">
        <Checkbox id="no-chronic" checked={noChronic}
          onCheckedChange={(checked) => handleNoChronic(checked === true)} />
        <Label htmlFor="no-chronic" className="text-sm font-medium text-green-700 dark:text-green-400 cursor-pointer">
          🟢 {tx("onb.noChronic", lang)}
        </Label>
      </div>

      {!noChronic && (
        <>
          {/* Critical conditions */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <ShieldAlert className="h-4 w-4" />
              {tx("onb.criticalConditions", lang)}
            </Label>
            <div className="space-y-2 rounded-lg border border-red-200 dark:border-red-800 p-3 bg-red-50/50 dark:bg-red-950/10">
              {/* Pregnancy — hidden for male users */}
              {data.gender !== "male" && (
                <div className="flex items-center space-x-2">
                  <Checkbox id="pregnancy-critical" checked={data.is_pregnant || data.is_breastfeeding}
                    onCheckedChange={(c) => updateData({ is_pregnant: c === true, is_breastfeeding: c === true })} />
                  <Label htmlFor="pregnancy-critical" className="font-normal text-sm">🤰 {tx("onb.pregnancyBreastfeedingPlan", lang)}</Label>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Checkbox id="kidney" checked={data.kidney_disease}
                  onCheckedChange={(c) => updateData({ kidney_disease: c === true })} />
                <Label htmlFor="kidney" className="font-normal text-sm">{tx("onb.advancedOrganFailure", lang)}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="liver" checked={data.liver_disease}
                  onCheckedChange={(c) => updateData({ liver_disease: c === true })} />
                <Label htmlFor="liver" className="font-normal text-sm">🩸 {tx("onb.bleedingDisorder", lang)}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="immune" checked={data.recent_surgery}
                  onCheckedChange={(c) => updateData({ recent_surgery: c === true })} />
                <Label htmlFor="immune" className="font-normal text-sm">🛡️ {tx("onb.immuneSuppressed", lang)}</Label>
              </div>
            </div>
          </div>

          {/* System-grouped chronic conditions */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              {tx("onb.chronicConditions", lang)}
            </Label>
            {CONDITION_GROUPS.map((group) => (
              <div key={group.labelKey} className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {tx(group.labelKey, lang)}
                </p>
                <div className="flex flex-wrap gap-2">
                  {group.conditions.map((cond) => (
                    <Badge key={cond.id}
                      variant={data.chronic_conditions.includes(cond.id) ? "default" : "outline"}
                      className="cursor-pointer transition-colors"
                      onClick={() => toggleCondition(cond.id)}>
                      {tx(cond.key, lang)}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Custom conditions — chips + autocomplete */}
          <div className="space-y-2">
            {customConditions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {customConditions.map((condition) => (
                  <Badge key={condition} variant="default" className="gap-1 pr-1">
                    {getConditionLabel(condition)}
                    <button type="button" onClick={() => toggleCondition(condition)}
                      className="ml-0.5 rounded-full p-0.5 hover:bg-primary-foreground/20 transition-colors"
                      aria-label={`Remove ${condition}`}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <div className="relative">
              <Input ref={inputRef} placeholder={tx("onb.otherCondition", lang)}
                value={customCondition} onChange={(e) => setCustomCondition(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                autoComplete="off"
                className="focus:ring-2 focus:ring-green-400/40 focus:border-green-400" />
              <DropdownPortal show={showSuggestions && (suggestions.length > 0 || showFreeTextOption)}>
                <div ref={dropdownRef} role="listbox"
                  style={{ position: "fixed", top: diseaseDropPos.top, left: diseaseDropPos.left, width: diseaseDropPos.width, zIndex: 9999 }}
                  className="max-h-56 overflow-y-auto rounded-lg border bg-background shadow-lg">
                  {suggestions.map((s, idx) => (
                    <button key={s.id} type="button" role="option" aria-selected={idx === highlightIdx}
                      onClick={() => addConditionFromAutocomplete(s.id)}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                        idx === highlightIdx ? "bg-primary/10 text-primary" : "hover:bg-muted/50"}`}>
                      <Stethoscope className="h-3 w-3 shrink-0 text-muted-foreground" />
                      <span>{lang === "tr" ? s.tr : s.en}</span>
                    </button>
                  ))}
                  {showFreeTextOption && (
                    <button type="button" role="option" aria-selected={highlightIdx === suggestions.length}
                      onClick={addCustomCondition}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm border-t transition-colors ${
                        highlightIdx === suggestions.length ? "bg-primary/10 text-primary" : "hover:bg-muted/50"}`}>
                      <span className="text-muted-foreground">+</span>
                      <span>{tx("onb.addCustomPrefix", lang)} <strong>{customCondition.trim()}</strong></span>
                    </button>
                  )}
                </div>
              </DropdownPortal>
            </div>
          </div>

          {/* ══════ Surgical History Section ══════ */}
          <div className="space-y-3 pt-2 border-t">
            <Label className="flex items-center gap-2">
              <Scissors className="h-4 w-4" />
              {tx("onb.categorySurgical", lang)}
            </Label>

            {/* Category chip grids */}
            {SURGERY_CATS.map(cat => {
              const items = SURGERY_DB.filter(s => s.cat === cat.key);
              return (
                <div key={cat.key} className="space-y-1">
                  <p className="text-[11px] font-medium text-muted-foreground/70">{tx(cat.labelKey, lang)}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {items.map(def => {
                      const selected = selectedSurgeryIds.has(def.id);
                      return (
                        <Badge key={def.id}
                          variant={selected ? "default" : "outline"}
                          className="cursor-pointer transition-colors text-xs"
                          onClick={() => toggleSurgeryChip(def)}>
                          {lang === "tr" ? def.tr : def.en}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Surgery autocomplete search */}
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input ref={surgeryInputRef}
                  placeholder={tx("onb.surgerySearch", lang)}
                  value={surgerySearch} onChange={(e) => setSurgerySearch(e.target.value)}
                  onKeyDown={handleSurgeryKeyDown}
                  onFocus={() => { if (surgerySuggestions.length > 0) setShowSurgerySugg(true); }}
                  autoComplete="off"
                  className="pl-9 focus:ring-2 focus:ring-green-400/40 focus:border-green-400" />
              </div>
              <DropdownPortal show={showSurgerySugg && (surgerySuggestions.length > 0 || showSurgeryFreeText)}>
                <div ref={surgeryDropRef} role="listbox"
                  style={{ position: "fixed", top: surgeryDropPos.top, left: surgeryDropPos.left, width: surgeryDropPos.width, zIndex: 9999 }}
                  className="max-h-56 overflow-y-auto rounded-lg border bg-background shadow-lg">
                  {surgerySuggestions.map((s, idx) => (
                    <button key={s.id} type="button" role="option" aria-selected={idx === surgeryHighlight}
                      onClick={() => addSurgery(s.id)}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                        idx === surgeryHighlight ? "bg-primary/10 text-primary" : "hover:bg-muted/50"}`}>
                      <Scissors className="h-3 w-3 shrink-0 text-muted-foreground" />
                      <span>{lang === "tr" ? s.tr : s.en}</span>
                    </button>
                  ))}
                  {showSurgeryFreeText && (
                    <button type="button" role="option" aria-selected={surgeryHighlight === surgerySuggestions.length}
                      onClick={addCustomSurgery}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm border-t transition-colors ${
                        surgeryHighlight === surgerySuggestions.length ? "bg-primary/10 text-primary" : "hover:bg-muted/50"}`}>
                      <span className="text-muted-foreground">+</span>
                      <span>{tx("onb.surgeryAddPrefix", lang)} <strong>{surgerySearch.trim()}</strong></span>
                    </button>
                  )}
                </div>
              </DropdownPortal>
            </div>

            {/* Selected surgeries with year + remove */}
            {surgeryEntries.length > 0 && (
              <AnimatePresence mode="popLayout">
                {surgeryEntries.map(({ raw, parsed }) => (
                  <motion.div key={parsed.id}
                    layout={!reducedMotion}
                    initial={reducedMotion ? undefined : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={reducedMotion ? undefined : { opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-2 rounded-lg border p-2.5">
                    <Scissors className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="text-sm font-medium flex-1 truncate">{getSurgeryLabel(parsed.id)}</span>

                    {/* Year inline input */}
                    {editingYear === parsed.id ? (
                      <Input type="number" min={1950} max={new Date().getFullYear()}
                        placeholder={tx("onb.surgeryYearPlaceholder", lang)}
                        defaultValue={parsed.year || ""}
                        className="h-7 w-20 text-xs"
                        autoFocus
                        onBlur={(e) => {
                          const v = parseInt(e.target.value, 10);
                          updateSurgeryYear(parsed.id, v >= 1950 && v <= new Date().getFullYear() ? v : undefined);
                          setEditingYear(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                          if (e.key === "Escape") setEditingYear(null);
                        }} />
                    ) : (
                      <button type="button" onClick={() => setEditingYear(parsed.id)}
                        className="text-[11px] text-muted-foreground hover:text-foreground transition-colors px-1.5 py-0.5 rounded hover:bg-muted">
                        {parsed.year
                          ? `${parsed.year}`
                          : `+ ${tx("onb.surgeryYearLabel", lang)}`}
                      </button>
                    )}

                    <button type="button" onClick={() => removeSurgery(parsed.id)}
                      className="rounded-full p-0.5 hover:bg-destructive/10 transition-colors"
                      aria-label={`Remove ${parsed.id}`}>
                      <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </>
      )}

{/* Note removed — whyMedHistory in card header is sufficient */}
    </div>
  );
}
