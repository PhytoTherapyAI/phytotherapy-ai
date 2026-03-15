"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { X, Plus, Pill, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DrugInputProps {
  medications: string[];
  onMedicationsChange: (meds: string[]) => void;
  disabled?: boolean;
}

export function DrugInput({ medications, onMedicationsChange, disabled }: DrugInputProps) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addMedication = () => {
    const trimmed = inputValue.trim();
    if (
      trimmed &&
      !medications.some((m) => m.toLowerCase() === trimmed.toLowerCase()) &&
      medications.length < 20
    ) {
      onMedicationsChange([...medications, trimmed]);
      setInputValue("");
      inputRef.current?.focus();
    }
  };

  const removeMedication = (index: number) => {
    onMedicationsChange(medications.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
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
        <Pill className="h-4 w-4 text-emerald-600" />
        Your Medications
      </label>

      {/* Medication tags */}
      {medications.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {medications.map((med, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
            >
              <Pill className="h-3 w-3" />
              {med}
              {!disabled && (
                <button
                  onClick={() => removeMedication(index)}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-emerald-200 dark:hover:bg-emerald-800"
                  aria-label={`Remove ${med}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={
              medications.length === 0
                ? "Enter medication name (e.g., Metformin, Lisinopril)"
                : "Add another medication..."
            }
            className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <Button
          type="button"
          onClick={addMedication}
          disabled={disabled || !inputValue.trim()}
          className="gap-1 bg-emerald-600 hover:bg-emerald-700"
          size="default"
        >
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      {/* Hints */}
      <div className="flex items-start gap-2 rounded-lg bg-amber-50/50 px-3 py-2 dark:bg-amber-950/20">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
        <p className="text-xs text-amber-700 dark:text-amber-400">
          Enter brand names (Advil, Glifor) or generic names (Ibuprofen, Metformin).
          We&apos;ll identify the active ingredients automatically.
          {medications.length >= 15 && (
            <span className="font-medium"> ({20 - medications.length} slots remaining)</span>
          )}
        </p>
      </div>
    </div>
  );
}
