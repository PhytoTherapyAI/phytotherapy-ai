// © 2026 DoctoPal — All Rights Reserved
"use client";

import { Label } from "@/components/ui/label";
import { Wine, Cigarette } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import type { OnboardingData } from "../OnboardingWizard";

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => { setReduced(!!window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches); }, []);
  return reduced;
}

interface Props {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

// Chip button helper
function ChipButton({ selected, onClick, children, color }: {
  selected: boolean; onClick: () => void; children: React.ReactNode; color?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
        selected
          ? `${color || "bg-primary"} text-white shadow-sm`
          : "bg-muted text-muted-foreground hover:bg-muted/80"
      }`}
    >
      {children}
    </button>
  );
}

// Sub-question chip group
function ChipGroup({ label, options, value, onChange }: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2 pl-4 border-l-2 border-primary/20">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              value === opt.value
                ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SubstanceStep({ data, updateData }: Props) {
  const { lang } = useLang();
  const reducedMotion = useReducedMotion();

  // Parse smoking_use compound value: "current|1pack|5to15" or simple "none"
  const smokingParts = data.smoking_use.split("|");
  const smokingStatus = smokingParts[0] || "none";
  const smokingAmount = smokingParts[1] || "";
  const smokingYears = smokingParts[2] || "";
  const smokingQuit = smokingParts[3] || "";

  const setSmokingCompound = (status: string, amount?: string, years?: string, quit?: string) => {
    const parts = [status];
    if (amount) parts.push(amount);
    if (years) parts.push(years);
    if (quit) parts.push(quit);
    updateData({ smoking_use: parts.join("|") });
  };

  // Parse alcohol_use compound value
  const alcParts = data.alcohol_use.split("|");
  const alcStatus = alcParts[0] || "none";
  const alcFreq = alcParts[1] || "";

  const setAlcCompound = (status: string, freq?: string) => {
    updateData({ alcohol_use: freq ? `${status}|${freq}` : status });
  };

  return (
    <div className="space-y-6">
      {/* ═══ SMOKING ═══ */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Cigarette className="h-4 w-4" />
          {tx("onb.smokingUse", lang)}
        </Label>
        <div className="flex flex-wrap gap-2">
          <ChipButton
            selected={smokingStatus === "none"}
            onClick={() => updateData({ smoking_use: "none" })}
            color="bg-green-600"
          >
            🟢 {tx("onb.smokingNever", lang)}
          </ChipButton>
          <ChipButton
            selected={smokingStatus === "former"}
            onClick={() => setSmokingCompound("former")}
            color="bg-amber-600"
          >
            🟡 {tx("onb.smokingFormer", lang)}
          </ChipButton>
          <ChipButton
            selected={smokingStatus === "current"}
            onClick={() => setSmokingCompound("current")}
            color="bg-red-600"
          >
            🔴 {tx("onb.smokingActive", lang)}
          </ChipButton>
        </div>

        {/* Dynamic questions for active/former */}
        <AnimatePresence>
          {(smokingStatus === "current" || smokingStatus === "former") && (
            <motion.div
              key="smoking-sub"
              initial={reducedMotion ? undefined : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={reducedMotion ? undefined : { height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="space-y-3 mt-2">
                <ChipGroup
                  label={tx("onb.smokingAmount", lang)}
                  options={[
                    { value: "half_pack", label: tx("onb.smokingHalfPack", lang) },
                    { value: "1pack", label: tx("onb.smokingOnePack", lang) },
                    { value: "1.5plus", label: tx("onb.smokingMorePack", lang) },
                  ]}
                  value={smokingAmount}
                  onChange={(v) => setSmokingCompound(smokingStatus, v, smokingYears, smokingQuit)}
                />
                <ChipGroup
                  label={tx("onb.smokingYears", lang)}
                  options={[
                    { value: "1to5", label: tx("onb.smoking1to5", lang) },
                    { value: "5to15", label: tx("onb.smoking5to15", lang) },
                    { value: "15plus", label: tx("onb.smoking15plus", lang) },
                  ]}
                  value={smokingYears}
                  onChange={(v) => setSmokingCompound(smokingStatus, smokingAmount, v, smokingQuit)}
                />
                <AnimatePresence>
                  {smokingStatus === "former" && (
                    <motion.div
                      key="smoking-quit"
                      initial={reducedMotion ? undefined : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={reducedMotion ? undefined : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <ChipGroup
                        label={tx("onb.smokingQuitWhen", lang)}
                        options={[
                          { value: "lt1yr", label: tx("onb.smokingQuit1yr", lang) },
                          { value: "1to5yr", label: tx("onb.smokingQuit1to5", lang) },
                          { value: "gt5yr", label: tx("onb.smokingQuit5plus", lang) },
                        ]}
                        value={smokingQuit}
                        onChange={(v) => setSmokingCompound(smokingStatus, smokingAmount, smokingYears, v)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══ ALCOHOL ═══ */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Wine className="h-4 w-4" />
          {tx("onb.alcoholUse", lang)}
        </Label>
        <div className="flex flex-wrap gap-2">
          <ChipButton
            selected={alcStatus === "none"}
            onClick={() => updateData({ alcohol_use: "none" })}
            color="bg-green-600"
          >
            🟢 {tx("onb.alcNever", lang)}
          </ChipButton>
          <ChipButton
            selected={alcStatus === "former"}
            onClick={() => setAlcCompound("former")}
            color="bg-amber-600"
          >
            🟡 {tx("onb.alcFormer", lang)}
          </ChipButton>
          <ChipButton
            selected={alcStatus === "active"}
            onClick={() => setAlcCompound("active")}
            color="bg-red-600"
          >
            🔴 {tx("onb.alcActive", lang)}
          </ChipButton>
        </div>

        <AnimatePresence>
          {(alcStatus === "active" || alcStatus === "former") && (
            <motion.div
              key="alc-sub"
              initial={reducedMotion ? undefined : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={reducedMotion ? undefined : { height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="mt-2">
                <ChipGroup
                  label={tx("onb.alcFrequency", lang)}
                  options={[
                    { value: "social", label: tx("onb.alcSocial", lang) },
                    { value: "weekly", label: tx("onb.alcWeekly", lang) },
                    { value: "daily", label: tx("onb.alcDaily", lang) },
                  ]}
                  value={alcFreq}
                  onChange={(v) => setAlcCompound(alcStatus, v)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="text-xs text-muted-foreground">
        {tx("onb.substanceNote", lang)}
      </p>
    </div>
  );
}
