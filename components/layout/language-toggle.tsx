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
  }, []);

  const toggleLang = useCallback(() => {
    setLang((prev) => {
      const next: Lang = prev === "en" ? "tr" : "en";
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return { lang, toggleLang, mounted };
}

export function LanguageToggle() {
  const { lang, toggleLang, mounted } = useLanguage();

  // Avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="flex h-8 w-14 items-center justify-center rounded-full" />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleLang}
      className="flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      aria-label={`Switch to ${lang === "en" ? "Turkish" : "English"}`}
    >
      <span className="text-base leading-none">{lang === "en" ? "\ud83c\uddec\ud83c\udde7" : "\ud83c\uddf9\ud83c\uddf7"}</span>
      <span className="font-semibold">{lang === "en" ? "EN" : "TR"}</span>
    </button>
  );
}
