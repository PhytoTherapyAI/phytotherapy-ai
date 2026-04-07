// © 2026 Doctopal — All Rights Reserved
"use client";

import { useState, useRef, useEffect } from "react";
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
  { id: "milk", tr: "Süt", en: "Milk" },
  { id: "soy", tr: "Soya", en: "Soy" },
  { id: "wheat_gluten", tr: "Buğday/Gluten", en: "Wheat/Gluten" },
  { id: "bee_venom", tr: "Arı Zehiri", en: "Bee Venom" },
  { id: "chamomile", tr: "Papatya", en: "Chamomile" },
  { id: "echinacea", tr: "Ekinezya", en: "Echinacea" },
  { id: "st_johns_wort", tr: "Sarı Kantaron", en: "St. John's Wort" },
  { id: "ginkgo", tr: "Ginkgo Biloba", en: "Ginkgo Biloba" },
];

const SENSITIVITY_ITEMS: AllergenDef[] = [
  { id: "lactose", tr: "Laktoz", en: "Lactose" },
  { id: "gluten", tr: "Gluten", en: "Gluten" },
  { id: "fructose", tr: "Fruktoz", en: "Fructose" },
  { id: "msg", tr: "MSG (Çin Tuzu)", en: "MSG" },
  { id: "histamine", tr: "Histamin", en: "Histamine" },
  { id: "fodmap", tr: "FODMAP", en: "FODMAP" },
  { id: "caffeine", tr: "Kafein", en: "Caffeine" },
  { id: "alcohol", tr: "Alkol", en: "Alcohol" },
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

const reducedMotion = typeof window !== "undefined"
  ? window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches
  : false;

export function AllergiesStep({ data, updateData }: Props) {
  const { lang } = useLang();
  const [allergen, setAllergen] = useState("");
  const [severity, setSeverity] = useState("unknown");
  const [suggestions, setSuggestions] = useState<AllergenDef[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getName = (def: AllergenDef) => lang === "tr" ? def.tr : def.en;

  // Already added allergen names
  const addedNames = new Set(data.allergies.map(a => a.allergen.toLowerCase()));

  // Autocomplete filter
  useEffect(() => {
    if (allergen.length < 1) {
      setSuggestions([]); setShowSuggestions(false); return;
    }
    const q = allergen.toLowerCase();
    const matches = ALL_ITEMS.filter(a =>
      !addedNames.has(getName(a).toLowerCase()) &&
      (a.tr.toLowerCase().includes(q) || a.en.toLowerCase().includes(q))
    );
    setSuggestions(matches.slice(0, 8));
    setShowSuggestions(matches.length > 0);
  }, [allergen, addedNames, lang]);

  // Close dropdown on outside click
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
      const existing = data.allergies.find(a => a.allergen.toLowerCase() === n.toLowerCase());
      if (existing?.severity === "anaphylaxis") {
        if (!window.confirm(tx("onb.anaphylaxisWarning", lang))) return;
      }
    }

    // Update or add
    const existingIdx = data.allergies.findIndex(a => a.allergen.toLowerCase() === n.toLowerCase());
    if (existingIdx >= 0) {
      const updated = [...data.allergies];
      updated[existingIdx] = { allergen: n, severity: s };
      updateData({ allergies: updated, no_allergies: false });
    } else {
      updateData({
        allergies: [...data.allergies, { allergen: n, severity: s }],
        no_allergies: false,
      });
    }
    setAllergen("");
    setSeverity("unknown");
  };

  const removeAllergy = (index: number) => {
    updateData({ allergies: data.allergies.filter((_, i) => i !== index) });
  };

  const getReactionLabel = (val: string) => {
    const opt = REACTION_OPTIONS.find(o => o.value === val);
    return opt ? `${opt.emoji} ${tx(opt.key, lang)}` : val;
  };

  // Quick add from chip — uses "intolerance" for sensitivities, "unknown" for allergens
  const quickAddChip = (def: AllergenDef, isSensitivity: boolean) => {
    const name = getName(def);
    if (addedNames.has(name.toLowerCase())) {
      // Remove if already added
      const idx = data.allergies.findIndex(a => a.allergen.toLowerCase() === name.toLowerCase());
      if (idx >= 0) removeAllergy(idx);
    } else {
      addAllergy(name, isSensitivity ? "intolerance" : "unknown");
    }
  };

  return (
    <div className="space-y-4">
      {/* Subtitle */}
      <p className="text-xs text-muted-foreground">
        {tx("onb.allergySubtitle", lang)}
      </p>

      {/* No allergies checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="no-allergies"
          checked={data.no_allergies}
          onCheckedChange={(checked) =>
            updateData({
              no_allergies: checked === true,
              allergies: checked === true ? [] : data.allergies,
            })
          }
        />
        <Label htmlFor="no-allergies" className="text-sm font-normal">
          {tx("onb.noAllergies", lang)}
        </Label>
      </div>

      {!data.no_allergies && (
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
                const isAdded = addedNames.has(name.toLowerCase());
                return (
                  <Badge key={def.id}
                    variant={isAdded ? "default" : "outline"}
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
                const isAdded = addedNames.has(name.toLowerCase());
                return (
                  <Badge key={def.id}
                    variant={isAdded ? "default" : "outline"}
                    className={`cursor-pointer transition-colors text-xs ${isAdded ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                    onClick={() => quickAddChip(def, true)}>
                    {name}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* ══ Current Entries ══ */}
          {data.allergies.length > 0 && (
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {data.allergies.map((allergy, index) => (
                  <motion.div
                    key={`${allergy.allergen}-${index}`}
                    layout={!reducedMotion}
                    initial={reducedMotion ? undefined : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={reducedMotion ? undefined : { opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
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
              {/* Allergen with autocomplete */}
              <div className="space-y-1">
                <Label htmlFor="allergen" className="text-xs">{tx("onb.allergen", lang)}</Label>
                <div className="relative">
                  <Input
                    ref={inputRef}
                    id="allergen"
                    placeholder={tx("onb.allergenPlaceholder", lang)}
                    value={allergen}
                    onChange={(e) => setAllergen(e.target.value)}
                    onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                    autoComplete="off"
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <div
                      ref={dropdownRef}
                      className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-lg border bg-background shadow-lg"
                    >
                      {suggestions.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => { setAllergen(getName(s)); setShowSuggestions(false); }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted/50"
                        >
                          <AlertTriangle className="h-3 w-3 shrink-0 text-orange-400" />
                          {getName(s)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Reaction Type dropdown */}
              <div className="space-y-1">
                <Label className="text-xs">{tx("onb.reactionType", lang)}</Label>
                <Select value={severity} onValueChange={(v) => v && setSeverity(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder={tx("onb.reactionUnknown", lang)}>
                      {(() => {
                        const opt = REACTION_OPTIONS.find(o => o.value === severity);
                        return opt ? `${opt.emoji} ${tx(opt.key, lang)}` : severity;
                      })()}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
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
