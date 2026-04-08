// © 2026 DoctoPal — All Rights Reserved
"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Info, Check, Loader2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/components/layout/language-toggle";
import { useAuth } from "@/lib/auth-context";
import { createBrowserClient } from "@/lib/supabase";
import { tx } from "@/lib/translations";
import { fetchGoogleProfile } from "@/lib/google-profile";
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

// Google "G" logo SVG
function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

type QuickFillState = "idle" | "loading" | "success" | "error" | "hidden";

export function BasicInfoStep({ data, updateData }: Props) {
  const { lang } = useLang();
  const { user } = useAuth();
  const [quickFillState, setQuickFillState] = useState<QuickFillState>("idle");

  // Detect if user logged in with Google
  const isGoogleUser = user?.app_metadata?.provider === "google" || user?.app_metadata?.providers?.includes("google");

  // Auto-fill name from user_metadata on mount (Layer 1 — no API call)
  useEffect(() => {
    if (!data.full_name && user?.user_metadata?.full_name) {
      updateData({ full_name: user.user_metadata.full_name });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGoogleQuickFill = async () => {
    setQuickFillState("loading");
    try {
      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.provider_token;

      if (!token) {
        // No provider token — fill from user_metadata only
        const meta = user?.user_metadata;
        if (meta?.full_name && !data.full_name) {
          updateData({ full_name: meta.full_name });
        }
        setQuickFillState("success");
        setTimeout(() => setQuickFillState("hidden"), 2000);
        return;
      }

      const profile = await fetchGoogleProfile(token);
      if (!profile) {
        setQuickFillState("error");
        return;
      }

      const updates: Partial<OnboardingData> = {};
      if (profile.name && !data.full_name) updates.full_name = profile.name;
      if (profile.birthDate) {
        updates.birth_date = profile.birthDate;
        updates.age = calcAge(profile.birthDate);
      }
      if (profile.gender) updates.gender = profile.gender;

      if (Object.keys(updates).length > 0) {
        updateData(updates);
      }

      setQuickFillState("success");
      setTimeout(() => setQuickFillState("hidden"), 2000);
    } catch {
      setQuickFillState("error");
    }
  };

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
      {/* Google Quick Fill Card */}
      {isGoogleUser && quickFillState !== "hidden" && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="rounded-xl border bg-white dark:bg-slate-900 p-4 shadow-sm"
          >
            {quickFillState === "success" ? (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-medium">
                <Check className="h-4 w-4" />
                {tx("onb.googleQuickSuccess", lang)}
              </div>
            ) : quickFillState === "error" ? (
              <p className="text-sm text-muted-foreground">
                {tx("onb.googleQuickError", lang)}
              </p>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-white dark:bg-slate-800">
                  <GoogleLogo className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{tx("onb.googleQuickTitle", lang)}</p>
                  <p className="text-xs text-muted-foreground">{tx("onb.googleQuickDesc", lang)}</p>
                </div>
                <button
                  type="button"
                  onClick={handleGoogleQuickFill}
                  disabled={quickFillState === "loading"}
                  className="shrink-0 flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  {quickFillState === "loading" ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      {tx("onb.googleQuickLoading", lang)}
                    </>
                  ) : (
                    <>
                      {tx("onb.googleQuickBtn", lang)}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* "Filled from Google" badge — shown after card disappears */}
      {quickFillState === "hidden" && (
        <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-medium">
          <GoogleLogo className="h-3.5 w-3.5" />
          <Check className="h-3 w-3" />
          {tx("onb.googleQuickBadge", lang)}
        </div>
      )}

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
