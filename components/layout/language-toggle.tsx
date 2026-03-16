"use client";

import { useState, useEffect } from "react";

export function LanguageToggle() {
  const [lang, setLang] = useState("en");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved === "tr") setLang("tr");
    setReady(true);
  }, []);

  if (!ready) return <div className="h-8 w-12" />;

  return (
    <button
      type="button"
      onClick={() => {
        const next = lang === "en" ? "tr" : "en";
        setLang(next);
        localStorage.setItem("lang", next);
      }}
      className="flex h-8 cursor-pointer items-center gap-1 rounded-full px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      aria-label={lang === "en" ? "Switch to Turkish" : "Switch to English"}
    >
      <span className="text-sm">{lang === "en" ? "🇺🇸" : "🇹🇷"}</span>
      <span>{lang === "en" ? "EN" : "TR"}</span>
    </button>
  );
}
