"use client";

import { useState, useEffect, useCallback } from "react";

type Lang = "en" | "tr";

const STORAGE_KEY = "phyto-lang";

export function useLanguage() {
  const [lang, setLang] = useState<Lang>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "tr") setLang("tr");
    setMounted(true);
    console.log("[Lang] Mounted, stored lang:", stored ?? "en (default)");
  }, []);

  const toggleLang = useCallback(() => {
    setLang((prev) => {
      const next: Lang = prev === "en" ? "tr" : "en";
      localStorage.setItem(STORAGE_KEY, next);
      console.log("[Lang] Toggled:", prev, "→", next);
      return next;
    });
  }, []);

  return { lang, toggleLang, mounted };
}

export function LanguageToggle() {
  const { lang, toggleLang, mounted } = useLanguage();

  // Avoid hydration mismatch — render placeholder during SSR
  if (!mounted) {
    return (
      <div className="flex h-8 w-14 items-center justify-center rounded-full" />
    );
  }

  const flag = lang === "en" ? "🇬🇧" : "🇹🇷";
  const label = lang === "en" ? "EN" : "TR";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("[Lang] Button clicked, current:", lang);
        toggleLang();
      }}
      className="flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      aria-label={`Switch to ${lang === "en" ? "Turkish" : "English"}`}
    >
      <span className="text-base leading-none">{flag}</span>
      <span className="font-semibold">{label}</span>
    </button>
  );
}
