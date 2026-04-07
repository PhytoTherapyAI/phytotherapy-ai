// © 2026 Doctopal — All Rights Reserved
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X, Stethoscope, ShieldAlert } from "lucide-react";
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
  { id: "Bariatric Surgery", tr: "Bariatrik Cerrahi", en: "Bariatric Surgery" },
  { id: "Thyroid Disorder", tr: "Tiroid Bozukluğu", en: "Thyroid Disorder" },
];

// Turkish-aware lowercase for search
function trLower(s: string): string {
  return s
    .replace(/İ/g, "i")
    .replace(/I/g, "ı")
    .replace(/Ş/g, "ş")
    .replace(/Ğ/g, "ğ")
    .replace(/Ü/g, "ü")
    .replace(/Ö/g, "ö")
    .replace(/Ç/g, "ç")
    .toLowerCase();
}

// System-grouped conditions (stored in English for DB)
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
  {
    labelKey: "onb.categorySurgical",
    conditions: [
      { id: "Bariatric Surgery", key: "onb.bariatricSurgery" },
    ],
  },
];

export function MedicalHistoryStep({ data, updateData }: Props) {
  const { lang } = useLang();
  const [customCondition, setCustomCondition] = useState("");
  const [noChronic, setNoChronic] = useState(false);
  const [suggestions, setSuggestions] = useState<typeof DISEASE_AUTOCOMPLETE>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // All known condition IDs from groups
  const knownIds = CONDITION_GROUPS.flatMap(g => g.conditions.map(c => c.id));

  // Conditions that are NOT in the predefined chip groups (custom entries)
  const customConditions = data.chronic_conditions.filter(
    (c) => !knownIds.includes(c) && !c.startsWith("family:")
  );

  // Get display name for a condition
  const getConditionLabel = useCallback((id: string): string => {
    const found = DISEASE_AUTOCOMPLETE.find(d => d.id === id);
    if (found) return lang === "tr" ? found.tr : found.en;
    return id; // Custom free-text entry
  }, [lang]);

  // Autocomplete filter — min 2 chars, Turkish-aware
  useEffect(() => {
    if (customCondition.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setHighlightIdx(-1);
      return;
    }
    const q = trLower(customCondition);
    const already = new Set(data.chronic_conditions);
    const matches = DISEASE_AUTOCOMPLETE.filter(d =>
      !already.has(d.id) &&
      (trLower(d.tr).includes(q) || trLower(d.en).includes(q))
    );
    setSuggestions(matches.slice(0, 6));
    setShowSuggestions(true);
    setHighlightIdx(-1);
  }, [customCondition, data.chronic_conditions]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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
    setCustomCondition("");
    setShowSuggestions(false);
    setHighlightIdx(-1);
    inputRef.current?.focus();
  };

  const addCustomCondition = () => {
    const trimmed = customCondition.trim();
    if (!trimmed) return;
    addConditionFromAutocomplete(trimmed);
  };

  const handleNoChronic = (checked: boolean) => {
    setNoChronic(checked);
    if (checked) {
      updateData({
        chronic_conditions: data.chronic_conditions.filter(c => c.startsWith("family:")),
        kidney_disease: false,
        liver_disease: false,
        recent_surgery: false,
      });
    }
  };

  // Keyboard navigation for autocomplete
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) {
      if (e.key === "Enter") {
        e.preventDefault();
        addCustomCondition();
      }
      return;
    }

    const totalItems = suggestions.length + (customCondition.trim() ? 1 : 0); // +1 for "Add: ..." option

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx(prev => (prev + 1) % totalItems);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx(prev => (prev - 1 + totalItems) % totalItems);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightIdx >= 0 && highlightIdx < suggestions.length) {
        addConditionFromAutocomplete(suggestions[highlightIdx].id);
      } else {
        addCustomCondition();
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  // Check if free-text "Add: X" option should show
  const showFreeTextOption = customCondition.trim().length >= 2 &&
    !suggestions.some(s => trLower(s.tr) === trLower(customCondition) || trLower(s.en) === trLower(customCondition));

  return (
    <div className="space-y-5">
      {/* Clean bill of health */}
      <div className="flex items-center space-x-2 rounded-xl bg-green-50 dark:bg-green-950/20 p-3 border border-green-200 dark:border-green-800">
        <Checkbox
          id="no-chronic"
          checked={noChronic}
          onCheckedChange={(checked) => handleNoChronic(checked === true)}
        />
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
                    <Badge
                      key={cond.id}
                      variant={data.chronic_conditions.includes(cond.id) ? "default" : "outline"}
                      className="cursor-pointer transition-colors"
                      onClick={() => toggleCondition(cond.id)}
                    >
                      {tx(cond.key, lang)}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Custom conditions — chips with × remove + autocomplete input */}
          <div className="space-y-2">
            {customConditions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {customConditions.map((condition) => (
                  <Badge key={condition} variant="default" className="gap-1 pr-1">
                    {getConditionLabel(condition)}
                    <button
                      type="button"
                      onClick={() => toggleCondition(condition)}
                      className="ml-0.5 rounded-full p-0.5 hover:bg-primary-foreground/20 transition-colors"
                      aria-label={`Remove ${condition}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Autocomplete input */}
            <div className="relative">
              <Input
                ref={inputRef}
                placeholder={tx("onb.otherCondition", lang)}
                value={customCondition}
                onChange={(e) => setCustomCondition(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                autoComplete="off"
                className="focus:ring-2 focus:ring-green-400/40 focus:border-green-400"
              />

              {/* Autocomplete dropdown */}
              {showSuggestions && (suggestions.length > 0 || showFreeTextOption) && (
                <div
                  ref={dropdownRef}
                  className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-y-auto rounded-lg border bg-background shadow-lg"
                  role="listbox"
                >
                  {suggestions.map((s, idx) => (
                    <button
                      key={s.id}
                      type="button"
                      role="option"
                      aria-selected={idx === highlightIdx}
                      onClick={() => addConditionFromAutocomplete(s.id)}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                        idx === highlightIdx ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
                      }`}
                    >
                      <Stethoscope className="h-3 w-3 shrink-0 text-muted-foreground" />
                      <span>{lang === "tr" ? s.tr : s.en}</span>
                    </button>
                  ))}
                  {/* Free text "Add: ..." option */}
                  {showFreeTextOption && (
                    <button
                      type="button"
                      role="option"
                      aria-selected={highlightIdx === suggestions.length}
                      onClick={addCustomCondition}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm border-t transition-colors ${
                        highlightIdx === suggestions.length ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
                      }`}
                    >
                      <span className="text-muted-foreground">+</span>
                      <span>{tx("onb.addCustomPrefix", lang)} <strong>{customCondition.trim()}</strong></span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <p className="text-xs text-muted-foreground">
        {tx("onb.medHistoryNote", lang)}
      </p>
    </div>
  );
}
