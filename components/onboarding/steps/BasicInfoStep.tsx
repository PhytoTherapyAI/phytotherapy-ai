// © 2026 Doctopal — All Rights Reserved
"use client";

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Info, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import { BirthDatePicker } from "../BirthDatePicker";
import type { OnboardingData } from "../OnboardingWizard";

interface Props {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

function calcAge(birthDate: string): number | null {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

const GENDER_OPTIONS = [
  { value: "male", labelKey: "onb.male" },
  { value: "female", labelKey: "onb.female" },
  { value: "other", labelKey: "onb.other" },
  { value: "prefer_not_to_say", labelKey: "onb.preferNotToSay" },
] as const;

// ── Inline Tooltip ──
export function FieldTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex ml-1">
      <button
        type="button"
        className="flex h-4 w-4 items-center justify-center rounded-full border border-muted-foreground/30 text-muted-foreground/50 hover:text-muted-foreground hover:border-muted-foreground/50 transition-colors"
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        aria-label="Info"
      >
        <Info className="h-2.5 w-2.5" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-50 w-52 max-w-[calc(100vw-5rem)] rounded-lg bg-white dark:bg-slate-800 border shadow-md p-2.5 text-[11px] text-muted-foreground leading-relaxed"
          >
            {text}
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

export function BasicInfoStep({ data, updateData }: Props) {
  const { lang } = useLang();

  const handleBirthDateChange = (value: string) => {
    updateData({ birth_date: value, age: calcAge(value) });
  };

  const ageWarning = data.age !== null && data.age < 18;

  const today = new Date().toISOString().split("T")[0];
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 120);
  const minDateStr = minDate.toISOString().split("T")[0];

  return (
    <div className="space-y-4">
      {/* Name / Display Name */}
      <div className="space-y-2">
        <Label htmlFor="full-name">{tx("onb.displayName", lang)}</Label>
        <Input
          id="full-name"
          placeholder={tx("onb.displayNamePlaceholder", lang)}
          value={data.full_name}
          onChange={(e) => updateData({ full_name: e.target.value })}
          className="text-base transition-all duration-200 focus:ring-2 focus:ring-green-400/40 focus:border-green-400"
        />
      </div>

      {/* Date of Birth */}
      <div className="space-y-2">
        <div className="flex items-center">
          <Label htmlFor="birth-date">{tx("onb.birthDate", lang)}</Label>
          <FieldTooltip text={tx("onb.tooltipBirthDate", lang)} />
        </div>
        <BirthDatePicker
          value={data.birth_date || ""}
          onChange={handleBirthDateChange}
          min={minDateStr}
          max={today}
          lang={lang}
        />
        {data.age !== null && data.age >= 0 && (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1">
            <span className="text-xs font-medium text-primary">
              {tx("onb.yourAge", lang)} {data.age}
            </span>
          </div>
        )}
        {ageWarning && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{tx("onb.ageWarning", lang)}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Biological Sex — animated chips */}
      <div className="space-y-2">
        <div className="flex items-center">
          <Label>{tx("onb.gender", lang)}</Label>
          <FieldTooltip text={tx("onb.tooltipGender", lang)} />
        </div>
        <div className="flex flex-wrap gap-2">
          {GENDER_OPTIONS.map((opt) => {
            const selected = data.gender === opt.value;
            return (
              <motion.button
                key={opt.value}
                type="button"
                onClick={() => updateData({ gender: opt.value })}
                whileTap={{ scale: 0.95 }}
                animate={{ scale: selected ? 1.02 : 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  selected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {tx(opt.labelKey, lang)}
                {/* Animated check mark */}
                <AnimatePresence>
                  {selected && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-1.5 inline-flex"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {tx("onb.requiredFields", lang)}
      </p>
    </div>
  );
}
