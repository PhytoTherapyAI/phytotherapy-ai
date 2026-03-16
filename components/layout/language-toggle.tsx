"use client";

import { useState, useEffect } from "react";

export function LanguageToggle() {
  const [lang, setLang] = useState("en");

  useEffect(() => {
    setLang(localStorage.getItem("lang") || "en");
  }, []);

  return (
    <button
      type="button"
      onClick={() => {
        const next = lang === "en" ? "tr" : "en";
        setLang(next);
        localStorage.setItem("lang", next);
      }}
      className="flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      aria-label={lang === "en" ? "Switch to Turkish" : "Switch to English"}
      suppressHydrationWarning
    >
      {lang === "tr" ? "🇹🇷 TR" : "🇺🇸 EN"}
    </button>
  );
}
