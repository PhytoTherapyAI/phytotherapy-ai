// © 2026 Doctopal — All Rights Reserved
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, AlertTriangle, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import type { OnboardingData } from "../OnboardingWizard";

interface Props {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

// Turkish-aware lowercase
function trLower(s: string): string {
  return s.replace(/İ/g, "i").replace(/I/g, "ı").replace(/Ş/g, "ş").replace(/Ğ/g, "ğ").replace(/Ü/g, "ü").replace(/Ö/g, "ö").replace(/Ç/g, "ç").toLowerCase();
}

// ── Allergen lists ──
interface AllergenDef { id: string; tr: string; en: string }

const COMMON_ALLERGENS: AllergenDef[] = [
  { id: "penicillin", tr: "Penisilin", en: "Penicillin" },
  { id: "amoxicillin", tr: "Amoksisilin", en: "Amoxicillin" },
  { id: "sulfonamides", tr: "Sülfonamidler", en: "Sulfonamides" },
  { id: "aspirin", tr: "Aspirin", en: "Aspirin" },
  { id: "ibuprofen", tr: "İbuprofen", en: "Ibuprofen" },
  { id: "cephalosporins", tr: "Sefalosporinler", en: "Cephalosporins" },
  { id: "latex", tr: "Lateks", en: "Latex" },
  { id: "peanuts", tr: "Yer Fıstığı", en: "Peanuts" },
  { id: "tree_nuts", tr: "Ağaç Kabukluları", en: "Tree Nuts" },
  { id: "shellfish", tr: "Kabuklu Deniz Ürünleri", en: "Shellfish" },
  { id: "eggs", tr: "Yumurta", en: "Eggs" },
  { id: "milk_allergy", tr: "Süt", en: "Milk" },
  { id: "soy", tr: "Soya", en: "Soy" },
  { id: "wheat_gluten", tr: "Buğday/Gluten", en: "Wheat/Gluten" },
  { id: "bee_venom", tr: "Arı Zehiri", en: "Bee Venom" },
  { id: "chamomile", tr: "Papatya", en: "Chamomile" },
  { id: "echinacea", tr: "Ekinezya", en: "Echinacea" },
  { id: "st_johns_wort", tr: "Sarı Kantaron", en: "St. John's Wort" },
  { id: "ginkgo_allergy", tr: "Ginkgo Biloba", en: "Ginkgo Biloba" },
];

const SENSITIVITY_ITEMS: AllergenDef[] = [
  { id: "lactose", tr: "Laktoz", en: "Lactose" },
  { id: "gluten_sensitivity", tr: "Gluten", en: "Gluten" },
  { id: "fructose", tr: "Fruktoz", en: "Fructose" },
  { id: "msg", tr: "MSG (Çin Tuzu)", en: "MSG" },
  { id: "histamine", tr: "Histamin", en: "Histamine" },
  { id: "fodmap", tr: "FODMAP", en: "FODMAP" },
  { id: "caffeine", tr: "Kafein", en: "Caffeine" },
  { id: "alcohol_sensitivity", tr: "Alkol", en: "Alcohol" },
];

const ALL_ITEMS = [...COMMON_ALLERGENS, ...SENSITIVITY_ITEMS];

const reactionColors: Record<string, string> = {
  anaphylaxis: "bg-red-200 text-red-900 dark:bg-red-900/30 dark:text-red-300",
  urticaria: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
  mild_skin: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
  gi_intolerance: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  intolerance: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  unknown: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

const REACTION_OPTIONS = [
  { value: "anaphylaxis", key: "onb.reactionAnaphylaxis", emoji: "🚨" },
  { value: "urticaria", key: "onb.reactionUrticaria", emoji: "⚠️" },
  { value: "mild_skin", key: "onb.reactionMildSkin", emoji: "🟡" },
  { value: "gi_intolerance", key: "onb.reactionGI", emoji: "🟠" },
  { value: "intolerance", key: "onb.reactionIntolerance", emoji: "🫃" },
  { value: "unknown", key: "onb.reactionUnknown", emoji: "❓" },
];

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => { setReduced(!!window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches); }, []);
  return reduced;
}

// Portal dropdown
function DropdownPortal({ children, show }: { children: React.ReactNode; show: boolean }) {
  if (!show || typeof document === "undefined") return null;
  return createPortal(<>{children}</>, document.body);
}

export function AllergiesStep({ data, updateData }: Props) {
  const { lang } = useLang();
  const reducedMotion = useReducedMotion();
  const [allergen, setAllergen] = useState("");
  const [severity, setSeverity] = useState("unknown");
  const [suggestions, setSuggestions] = useState<AllergenDef[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getName = useCallback((def: AllergenDef) => lang === "tr" ? def.tr : def.en, [lang]);

  // Defensive: ensure allergies is always an array
  const allergies = Array.isArray(data.allergies) ? data.allergies : [];
  const noAllergies = data.no_allergies === true;

  // Stable string for dependency tracking
  const addedNamesStr = allergies.map(a => a.allergen.toLowerCase()).join(",");

  // Autocomplete filter
  useEffect(() => {
    if (allergen.length < 1) {
      setSuggestions([]); setShowSuggestions(false); return;
    }
    const addedSet = new Set(addedNamesStr.split(","));
    const q = trLower(allergen);
    const matches = ALL_ITEMS.filter(a =>
      !addedSet.has(a.tr.toLowerCase()) && !addedSet.has(a.en.toLowerCase()) &&
      (trLower(a.tr).includes(q) || trLower(a.en).includes(q))
    );
    setSuggestions(matches.slice(0, 8));
    setShowSuggestions(matches.length > 0);
  }, [allergen, addedNamesStr]);

  // Position dropdown (portal) — recalculate on scroll
  useEffect(() => {
    if (!showSuggestions || !inputRef.current) return;
    const update = () => {
      const rect = inputRef.current?.getBoundingClientRect();
      if (rect) setDropdownPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update, true); window.removeEventListener("resize", update); };
  }, [showSuggestions, allergen]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const addAllergy = (name?: string, reactionType?: string) => {
    const n = (name || allergen).trim();
    if (!n) return;
    const s = reactionType || severity;

    // Anaphylaxis downgrade warning
    if (s === "intolerance") {
      const existing = allergies.find(a => a.allergen.toLowerCase() === n.toLowerCase());
      if (existing?.severity === "anaphylaxis") {
        if (typeof window !== "undefined" && !window.confirm(tx("onb.anaphylaxisWarning", lang))) return;
      }
    }

    const existingIdx = allergies.findIndex(a => a.allergen.toLowerCase() === n.toLowerCase());
    if (existingIdx >= 0) {
      const updated = [...allergies];
      updated[existingIdx] = { allergen: n, severity: s };
      updateData({ allergies: updated, no_allergies: false });
    } else {
      updateData({ allergies: [...allergies, { allergen: n, severity: s }], no_allergies: false });
    }
    setAllergen(""); setSeverity("unknown");
  };

  const removeAllergy = (index: number) => {
    updateData({ allergies: allergies.filter((_, i) => i !== index) });
  };

  const getReactionLabel = (val: string) => {
    const opt = REACTION_OPTIONS.find(o => o.value === val);
    return opt ? `${opt.emoji} ${tx(opt.key, lang)}` : val;
  };

  const quickAddChip = (def: AllergenDef, isSensitivity: boolean) => {
    const name = getName(def);
    const addedSet = new Set(allergies.map(a => a.allergen.toLowerCase()));
    if (addedSet.has(name.toLowerCase())) {
      const idx = allergies.findIndex(a => a.allergen.toLowerCase() === name.toLowerCase());
      if (idx >= 0) removeAllergy(idx);
    } else {
      addAllergy(name, isSensitivity ? "intolerance" : "unknown");
    }
  };

  const addedSet = new Set(allergies.map(a => a.allergen.toLowerCase()));

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {tx("onb.allergySubtitle", lang)}
      </p>

      <div className="flex items-center space-x-2">
        <Checkbox id="no-allergies" checked={noAllergies}
          onCheckedChange={(checked) => updateData({ no_allergies: checked === true, allergies: checked === true ? [] : allergies })} />
        <Label htmlFor="no-allergies" className="text-sm font-normal">
          {tx("onb.noAllergies", lang)}
        </Label>
      </div>

      {!noAllergies && (
        <>
          {/* ══ Allergy Chips ══ */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" />
              {tx("onb.allergyGroupAllergy", lang)}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_ALLERGENS.map(def => {
                const name = getName(def);
                const isAdded = addedSet.has(name.toLowerCase());
                return (
                  <Badge key={def.id} variant={isAdded ? "default" : "outline"}
                    className="cursor-pointer transition-colors text-xs"
                    onClick={() => quickAddChip(def, false)}>
                    {name}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* ══ Sensitivity / Intolerance Chips ══ */}
          <div className="space-y-3 pt-2 border-t">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5" />
              {tx("onb.allergyGroupSensitivity", lang)}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SENSITIVITY_ITEMS.map(def => {
                const name = getName(def);
                const isAdded = addedSet.has(name.toLowerCase());
                return (
                  <Badge key={def.id} variant={isAdded ? "default" : "outline"}
                    className={`cursor-pointer transition-colors text-xs ${isAdded ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                    onClick={() => quickAddChip(def, true)}>
                    {name}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* ══ Current Entries ══ */}
          {allergies.length > 0 && (
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {allergies.map((allergy, index) => (
                  <motion.div key={`${allergy.allergen}-${index}`}
                    layout={!reducedMotion}
                    initial={reducedMotion ? undefined : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={reducedMotion ? undefined : { opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0" />
                      <span className="font-medium text-sm">{allergy.allergen}</span>
                      <Badge className={reactionColors[allergy.severity] || "bg-slate-100"}>
                        {getReactionLabel(allergy.severity)}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeAllergy(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* ══ Add Form ══ */}
          <div className="space-y-3 rounded-lg border border-dashed p-4">
            <p className="text-sm font-medium">{tx("onb.addAllergy", lang)}</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="allergen" className="text-xs">{tx("onb.allergen", lang)}</Label>
                <div className="relative">
                  <Input ref={inputRef} id="allergen" placeholder={tx("onb.allergenPlaceholder", lang)}
                    value={allergen} onChange={(e) => setAllergen(e.target.value)}
                    onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                    autoComplete="off" />
                  <DropdownPortal show={showSuggestions && suggestions.length > 0}>
                    <div ref={dropdownRef}
                      style={{ position: "fixed", top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width, zIndex: 9999 }}
                      className="max-h-48 overflow-y-auto rounded-lg border bg-background shadow-lg">
                      {suggestions.map((s) => (
                        <button key={s.id} type="button"
                          onClick={() => { setAllergen(getName(s)); setShowSuggestions(false); }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted/50">
                          <AlertTriangle className="h-3 w-3 shrink-0 text-orange-400" />
                          {getName(s)}
                        </button>
                      ))}
                    </div>
                  </DropdownPortal>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">{tx("onb.reactionType", lang)}</Label>
                <Select value={severity} onValueChange={(v) => v && setSeverity(v)}>
                  <SelectTrigger className="min-w-[180px]">
                    <SelectValue placeholder={tx("onb.reactionUnknown", lang)}>
                      {(value: string | null) => {
                        const opt = REACTION_OPTIONS.find(o => o.value === value);
                        return opt ? `${opt.emoji} ${tx(opt.key, lang)}` : tx("onb.reactionUnknown", lang);
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-60 min-w-[240px]">
                    {REACTION_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.emoji} {tx(opt.key, lang)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => addAllergy()} disabled={!allergen.trim()}>
              <Plus className="mr-2 h-4 w-4" />
              {tx("onb.addAllergyBtn", lang)}
            </Button>
          </div>
        </>
      )}

      <p className="text-xs text-muted-foreground">
        {tx("onb.allergyNote", lang)}
      </p>
    </div>
  );
}
