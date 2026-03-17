"use client";

import { useState, useRef, useEffect, useCallback, KeyboardEvent } from "react";
import { X, Plus, Pill, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface DrugSuggestion {
  brandName: string;
  genericName: string;
}

interface DrugInputProps {
  medications: string[];
  onMedicationsChange: (meds: string[]) => void;
  disabled?: boolean;
}

export function DrugInput({ medications, onMedicationsChange, disabled }: DrugInputProps) {
  const { lang } = useLang()
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<DrugSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch suggestions with debounce
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

  // Debounced input handler
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(inputValue.trim());
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [inputValue, fetchSuggestions]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectSuggestion = (suggestion: DrugSuggestion) => {
    const name = suggestion.brandName;
    if (
      name &&
      !medications.some((m) => m.toLowerCase() === name.toLowerCase()) &&
      medications.length < 20
    ) {
      onMedicationsChange([...medications, name]);
    }
    setInputValue("");
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const addMedication = () => {
    const trimmed = inputValue.trim();
    if (
      trimmed &&
      !medications.some((m) => m.toLowerCase() === trimmed.toLowerCase()) &&
      medications.length < 20
    ) {
      onMedicationsChange([...medications, trimmed]);
      setInputValue("");
      setSuggestions([]);
      setShowSuggestions(false);
      inputRef.current?.focus();
    }
  };

  const removeMedication = (index: number) => {
    onMedicationsChange(medications.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
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

    if (e.key === "Enter") {
      e.preventDefault();
      addMedication();
    }
    if (e.key === "Backspace" && inputValue === "" && medications.length > 0) {
      removeMedication(medications.length - 1);
    }
  };

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-medium">
        <Pill className="h-4 w-4 text-primary" />
        {tx('di.label', lang)}
      </label>

      {/* Medication tags */}
      {medications.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {medications.map((med, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
            >
              <Pill className="h-3 w-3" />
              {med}
              {!disabled && (
                <button
                  onClick={() => removeMedication(index)}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-primary/20"
                  aria-label={`Remove ${med}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Input area with autocomplete */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            disabled={disabled}
            placeholder={
              medications.length === 0
                ? tx('di.placeholderEmpty', lang)
                : tx('di.placeholderMore', lang)
            }
            className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
            autoComplete="off"
          />

          {/* Loading indicator */}
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Autocomplete dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={dropdownRef}
              className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-lg border bg-background shadow-lg"
            >
              {suggestions.map((s, i) => (
                <button
                  key={`${s.brandName}-${i}`}
                  type="button"
                  onClick={() => selectSuggestion(s)}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-muted/50 ${
                    i === highlightIndex ? "bg-muted/50" : ""
                  }`}
                >
                  <Pill className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <span className="font-medium">{s.brandName}</span>
                    {s.genericName && s.genericName.toLowerCase() !== s.brandName.toLowerCase() && (
                      <span className="ml-1.5 text-xs text-muted-foreground">
                        ({s.genericName})
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <Button
          type="button"
          onClick={addMedication}
          disabled={disabled || !inputValue.trim()}
          className="gap-1 bg-primary hover:bg-primary/90"
          size="default"
        >
          <Plus className="h-4 w-4" />
          {tx('di.add', lang)}
        </Button>
      </div>

      {/* Hints */}
      <div className="flex items-start gap-2 rounded-lg bg-amber-50/50 px-3 py-2 dark:bg-amber-950/20">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
        <p className="text-xs text-amber-700 dark:text-amber-400">
          {tx('di.hint', lang)}
          {medications.length >= 15 && (
            <span className="font-medium"> ({20 - medications.length} slots remaining)</span>
          )}
        </p>
      </div>
    </div>
  );
}
