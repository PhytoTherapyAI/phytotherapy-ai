// © 2026 Doctopal — All Rights Reserved
"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, AlertTriangle } from "lucide-react";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import type { OnboardingData } from "../OnboardingWizard";

interface Props {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

// Common allergens for autocomplete
const COMMON_ALLERGENS_EN = [
  "Penicillin", "Amoxicillin", "Sulfonamides", "Aspirin", "Ibuprofen",
  "Cephalosporins", "Latex", "Peanuts", "Tree Nuts", "Shellfish",
  "Eggs", "Milk", "Soy", "Wheat/Gluten", "Bee Venom",
  "Chamomile", "Echinacea", "St. John's Wort", "Ginkgo Biloba",
];
const COMMON_ALLERGENS_TR = [
  "Penisilin", "Amoksisilin", "Sülfonamidler", "Aspirin", "İbuprofen",
  "Sefalosporinler", "Lateks", "Yer Fıstığı", "Ağaç Kabukluları", "Kabuklu Deniz Ürünleri",
  "Yumurta", "Süt", "Soya", "Buğday/Gluten", "Arı Zehiri",
  "Papatya", "Ekinezya", "Sarı Kantaron", "Ginkgo Biloba",
];

const reactionColors: Record<string, string> = {
  anaphylaxis: "bg-red-200 text-red-900",
  urticaria: "bg-red-100 text-red-800",
  mild_skin: "bg-orange-100 text-orange-800",
  gi_intolerance: "bg-yellow-100 text-yellow-800",
  unknown: "bg-slate-100 text-slate-700",
};

const REACTION_OPTIONS = [
  { value: "anaphylaxis", key: "onb.reactionAnaphylaxis", emoji: "🚨" },
  { value: "urticaria", key: "onb.reactionUrticaria", emoji: "⚠️" },
  { value: "mild_skin", key: "onb.reactionMildSkin", emoji: "🟡" },
  { value: "gi_intolerance", key: "onb.reactionGI", emoji: "🟠" },
  { value: "unknown", key: "onb.reactionUnknown", emoji: "❓" },
];

export function AllergiesStep({ data, updateData }: Props) {
  const { lang } = useLang();
  const [allergen, setAllergen] = useState("");
  const [severity, setSeverity] = useState("unknown");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const allergenList = lang === "tr" ? COMMON_ALLERGENS_TR : COMMON_ALLERGENS_EN;

  // Autocomplete filter
  useEffect(() => {
    if (allergen.length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const q = allergen.toLowerCase();
    const matches = allergenList.filter(a => a.toLowerCase().includes(q));
    setSuggestions(matches.slice(0, 8));
    setShowSuggestions(matches.length > 0);
  }, [allergen, allergenList]);

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

  const addAllergy = () => {
    if (!allergen.trim()) return;
    updateData({
      allergies: [...data.allergies, { allergen: allergen.trim(), severity }],
      no_allergies: false,
    });
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

  return (
    <div className="space-y-4">
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
          {data.allergies.length > 0 && (
            <div className="space-y-2">
              {data.allergies.map((allergy, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0" />
                    <span className="font-medium">{allergy.allergen}</span>
                    <Badge className={reactionColors[allergy.severity] || "bg-slate-100"}>
                      {getReactionLabel(allergy.severity)}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeAllergy(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

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
                          key={s}
                          type="button"
                          onClick={() => { setAllergen(s); setShowSuggestions(false); }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted/50"
                        >
                          <AlertTriangle className="h-3 w-3 shrink-0 text-orange-400" />
                          {s}
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
            <Button variant="outline" size="sm" onClick={addAllergy} disabled={!allergen.trim()}>
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
