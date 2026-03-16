"use client";

import { useState, useEffect } from "react";

type Lang = "en" | "tr";

const STORAGE_KEY = "phyto-lang";

export function useLanguage() {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (stored === "en" || stored === "tr") {
      setLang(stored);
    }
  }, []);

  const toggleLang = () => {
    const next: Lang = lang === "en" ? "tr" : "en";
    setLang(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  return { lang, toggleLang };
}

export function LanguageToggle() {
  const { lang, toggleLang } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLang}
      className="flex h-8 items-center gap-1 rounded-full px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      aria-label={`Switch to ${lang === "en" ? "Turkish" : "English"}`}
    >
      {lang === "en" ? (
        <>
          <span className="text-sm" role="img" aria-label="English">🇬🇧</span>
          <span>EN</span>
        </>
      ) : (
        <>
          <span className="text-sm" role="img" aria-label="Turkish">🇹🇷</span>
          <span>TR</span>
        </>
      )}
    </button>
  );
}
