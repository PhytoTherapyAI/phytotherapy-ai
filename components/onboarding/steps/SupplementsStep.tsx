// © 2026 Doctopal — All Rights Reserved
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Leaf, Check, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import type { OnboardingData, SupplementEntry } from "../OnboardingWizard";

interface Props {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

// ── Turkish-aware lowercase ──
function trLower(s: string): string {
  return s.replace(/İ/g, "i").replace(/I/g, "ı").replace(/Ş/g, "ş").replace(/Ğ/g, "ğ").replace(/Ü/g, "ü").replace(/Ö/g, "ö").replace(/Ç/g, "ç").toLowerCase();
}

// ── Supplement database ──
interface SupplementDef {
  id: string;
  tr: string;
  en: string;
  category: "vitamin" | "herbal" | "omega" | "protein";
}

const SUPPLEMENT_DB: SupplementDef[] = [
  // Vitamin & Mineral
  { id: "vitamin_d3", tr: "D3 Vitamini", en: "Vitamin D3", category: "vitamin" },
  { id: "vitamin_b12", tr: "B12 Vitamini", en: "Vitamin B12", category: "vitamin" },
  { id: "b_complex", tr: "B Kompleks", en: "B Complex", category: "vitamin" },
  { id: "vitamin_c", tr: "C Vitamini", en: "Vitamin C", category: "vitamin" },
  { id: "magnesium", tr: "Magnezyum", en: "Magnesium", category: "vitamin" },
  { id: "zinc", tr: "Çinko", en: "Zinc", category: "vitamin" },
  { id: "iron", tr: "Demir", en: "Iron", category: "vitamin" },
  { id: "calcium", tr: "Kalsiyum", en: "Calcium", category: "vitamin" },
  { id: "folate", tr: "Folat", en: "Folate", category: "vitamin" },
  { id: "vitamin_k2", tr: "K2 Vitamini", en: "Vitamin K2", category: "vitamin" },
  // Herbal
  { id: "garlic", tr: "Sarımsak", en: "Garlic", category: "herbal" },
  { id: "turmeric", tr: "Zerdeçal", en: "Turmeric", category: "herbal" },
  { id: "echinacea", tr: "Ekinezya", en: "Echinacea", category: "herbal" },
  { id: "ashwagandha", tr: "Ashwagandha", en: "Ashwagandha", category: "herbal" },
  { id: "ginkgo", tr: "Ginkgo Biloba", en: "Ginkgo Biloba", category: "herbal" },
  { id: "valerian", tr: "Kediotu", en: "Valerian", category: "herbal" },
  { id: "lemon_balm", tr: "Melisa", en: "Lemon Balm", category: "herbal" },
  { id: "rosemary", tr: "Biberiye", en: "Rosemary", category: "herbal" },
  // Fatty Acids
  { id: "omega3", tr: "Omega-3", en: "Omega-3", category: "omega" },
  { id: "fish_oil", tr: "Balık Yağı", en: "Fish Oil", category: "omega" },
  { id: "krill_oil", tr: "Krill Yağı", en: "Krill Oil", category: "omega" },
  { id: "flaxseed_oil", tr: "Keten Tohumu Yağı", en: "Flaxseed Oil", category: "omega" },
  // Protein & Sports
  { id: "whey", tr: "Whey Protein", en: "Whey Protein", category: "protein" },
  { id: "creatine", tr: "Kreatin", en: "Creatine", category: "protein" },
  { id: "bcaa", tr: "BCAA", en: "BCAA", category: "protein" },
  { id: "collagen", tr: "Kolajen", en: "Collagen", category: "protein" },
  { id: "glutamine", tr: "Glutamin", en: "Glutamine", category: "protein" },
];

const CATEGORIES = [
  { key: "vitamin", labelKey: "onb.suppCatVitamin" },
  { key: "herbal", labelKey: "onb.suppCatHerbal" },
  { key: "omega", labelKey: "onb.suppCatOmega" },
  { key: "protein", labelKey: "onb.suppCatProtein" },
] as const;

const DOSE_UNITS = [
  { value: "mg", key: "onb.unitMg" },
  { value: "mcg", key: "onb.unitMcg" },
  { value: "IU", key: "onb.unitIU" },
  { value: "g", key: "onb.unitG" },
  { value: "ml", key: "onb.unitMl" },
  { value: "capsule", key: "onb.unitCapsule" },
  { value: "tablet", key: "onb.unitTablet" },
] as const;

const FREQUENCIES = [
  { value: "daily", key: "onb.freqDaily" },
  { value: "weekly_2_3", key: "onb.freqWeekly23" },
  { value: "weekly", key: "onb.freqWeekly" },
  { value: "monthly", key: "onb.freqMonthly" },
  { value: "irregular", key: "onb.freqIrregular" },
] as const;

const reducedMotion = typeof window !== "undefined"
  ? window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches
  : false;

export function SupplementsStep({ data, updateData }: Props) {
  const { lang } = useLang();
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<SupplementDef[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const entries = data.supplement_entries;
  const selectedIds = new Set(entries.map(e => e.id));

  const getName = useCallback((def: SupplementDef) => lang === "tr" ? def.tr : def.en, [lang]);

  // ── Autocomplete ──
  useEffect(() => {
    if (search.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setHighlightIdx(-1);
      return;
    }
    const q = trLower(search);
    const matches = SUPPLEMENT_DB.filter(s =>
      !selectedIds.has(s.id) && (trLower(s.tr).includes(q) || trLower(s.en).includes(q))
    );
    setSuggestions(matches.slice(0, 6));
    setShowSuggestions(true);
    setHighlightIdx(-1);
  }, [search, selectedIds]);

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // ── Add/Remove ──
  const addSupplement = useCallback((id: string, name: string, isCustom = false) => {
    if (selectedIds.has(id)) return;
    const entry: SupplementEntry = {
      id, name, frequency: "daily", isCustom,
    };
    updateData({
      supplement_entries: [...entries, entry],
      no_supplements: false,
    });
    setSearch("");
    setShowSuggestions(false);
    setHighlightIdx(-1);
    inputRef.current?.focus();
  }, [entries, selectedIds, updateData]);

  const removeSupplement = useCallback((id: string) => {
    updateData({ supplement_entries: entries.filter(e => e.id !== id) });
  }, [entries, updateData]);

  const updateEntry = useCallback((id: string, updates: Partial<SupplementEntry>) => {
    updateData({
      supplement_entries: entries.map(e => e.id === id ? { ...e, ...updates } : e),
    });
  }, [entries, updateData]);

  const toggleChip = useCallback((def: SupplementDef) => {
    if (selectedIds.has(def.id)) {
      removeSupplement(def.id);
    } else {
      addSupplement(def.id, getName(def));
    }
  }, [selectedIds, addSupplement, removeSupplement, getName]);

  const handleNoSupplements = (checked: boolean) => {
    updateData({
      no_supplements: checked,
      supplement_entries: checked ? [] : entries,
    });
  };

  // Free-text option
  const showFreeText = search.trim().length >= 2 &&
    !suggestions.some(s => trLower(s.tr) === trLower(search) || trLower(s.en) === trLower(search));

  const addCustom = () => {
    const trimmed = search.trim();
    if (!trimmed) return;
    const customId = `custom_${trimmed.toLowerCase().replace(/\s+/g, "_")}`;
    addSupplement(customId, trimmed, true);
  };

  // Keyboard nav
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) {
      if (e.key === "Enter") { e.preventDefault(); addCustom(); }
      return;
    }
    const total = suggestions.length + (showFreeText ? 1 : 0);
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlightIdx(p => (p + 1) % total); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHighlightIdx(p => (p - 1 + total) % total); }
    else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightIdx >= 0 && highlightIdx < suggestions.length) {
        const s = suggestions[highlightIdx];
        addSupplement(s.id, getName(s));
      } else { addCustom(); }
    } else if (e.key === "Escape") { setShowSuggestions(false); }
  };

  // Get frequency label for display
  const getFreqLabel = (val: string) => {
    const f = FREQUENCIES.find(f => f.value === val);
    return f ? tx(f.key, lang) : val;
  };

  return (
    <div className="space-y-5">
      {/* No supplements checkbox */}
      <div className="flex items-center space-x-2 rounded-xl bg-green-50 dark:bg-green-950/20 p-3 border border-green-200 dark:border-green-800">
        <Checkbox
          id="no-supplements"
          checked={data.no_supplements}
          onCheckedChange={(c) => handleNoSupplements(c === true)}
        />
        <Label htmlFor="no-supplements" className="text-sm font-medium text-green-700 dark:text-green-400 cursor-pointer">
          🟢 {tx("onb.suppNoSupplements", lang)}
        </Label>
      </div>

      {!data.no_supplements && (
        <>
          {/* ══ Popular Chips Grid ══ */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <Leaf className="h-3.5 w-3.5" />
              {tx("onb.suppPopular", lang)}
            </p>
            {CATEGORIES.map(cat => {
              const items = SUPPLEMENT_DB.filter(s => s.category === cat.key);
              return (
                <div key={cat.key} className="space-y-1.5">
                  <p className="text-[11px] font-medium text-muted-foreground/70">{tx(cat.labelKey, lang)}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {items.map(def => {
                      const selected = selectedIds.has(def.id);
                      return (
                        <motion.button
                          key={def.id}
                          type="button"
                          onClick={() => toggleChip(def)}
                          whileTap={reducedMotion ? undefined : { scale: 0.95 }}
                          animate={reducedMotion ? undefined : { scale: selected ? 1.02 : 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 20 }}
                          className={`relative rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                            selected
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {getName(def)}
                          <AnimatePresence>
                            {selected && !reducedMotion && (
                              <motion.span
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0 }}
                                transition={{ duration: 0.2 }}
                                className="ml-1 inline-flex"
                              >
                                <Check className="h-3 w-3" />
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ══ Search Autocomplete ══ */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                ref={inputRef}
                placeholder={tx("onb.suppSearch", lang)}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                autoComplete="off"
                className="pl-9 focus:ring-2 focus:ring-green-400/40 focus:border-green-400"
              />
            </div>
            {showSuggestions && (suggestions.length > 0 || showFreeText) && (
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
                    onClick={() => addSupplement(s.id, getName(s))}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                      idx === highlightIdx ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
                    }`}
                  >
                    <Leaf className="h-3 w-3 shrink-0 text-muted-foreground" />
                    {getName(s)}
                  </button>
                ))}
                {showFreeText && (
                  <button
                    type="button"
                    role="option"
                    aria-selected={highlightIdx === suggestions.length}
                    onClick={addCustom}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm border-t transition-colors ${
                      highlightIdx === suggestions.length ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
                    }`}
                  >
                    <span className="text-muted-foreground">+</span>
                    <span>{tx("onb.suppAddPrefix", lang)} <strong>{search.trim()}</strong></span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ══ Selected Supplements List ══ */}
          {entries.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {tx("onb.suppSelected", lang)} ({entries.length})
              </p>
              <AnimatePresence mode="popLayout">
                {entries.map((entry) => (
                  <motion.div
                    key={entry.id}
                    layout={!reducedMotion}
                    initial={reducedMotion ? undefined : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={reducedMotion ? undefined : { opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-lg border p-3"
                  >
                    {/* Desktop: row, Mobile: stack */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      {/* Name */}
                      <div className="flex items-center gap-2 sm:w-36 shrink-0">
                        <Leaf className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="text-sm font-medium truncate">{entry.name}</span>
                      </div>

                      {/* Dose + Unit */}
                      <div className="flex items-center gap-1.5 flex-1">
                        <Input
                          type="number"
                          placeholder={tx("onb.suppDosePlaceholder", lang)}
                          value={entry.dose || ""}
                          onChange={(e) => updateEntry(entry.id, { dose: e.target.value })}
                          className="h-8 text-xs w-20"
                        />
                        <Select
                          value={entry.doseUnit || "mg"}
                          onValueChange={(v) => updateEntry(entry.id, { doseUnit: v as SupplementEntry["doseUnit"] })}
                        >
                          <SelectTrigger className="h-8 text-xs w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DOSE_UNITS.map(u => (
                              <SelectItem key={u.value} value={u.value}>{tx(u.key, lang)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* Frequency */}
                        <Select
                          value={entry.frequency || "daily"}
                          onValueChange={(v) => updateEntry(entry.id, { frequency: v as SupplementEntry["frequency"] })}
                        >
                          <SelectTrigger className="h-8 text-xs flex-1 min-w-[100px]">
                            <SelectValue>
                              {getFreqLabel(entry.frequency || "daily")}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {FREQUENCIES.map(f => (
                              <SelectItem key={f.value} value={f.value}>{tx(f.key, lang)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => removeSupplement(entry.id)}
                        className="self-start sm:self-center rounded-full p-1 hover:bg-destructive/10 transition-colors"
                        aria-label={`Remove ${entry.name}`}
                      >
                        <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </>
      )}

      <p className="text-xs text-muted-foreground italic">
        {tx("onb.suppTooltip", lang)}
      </p>
    </div>
  );
}
