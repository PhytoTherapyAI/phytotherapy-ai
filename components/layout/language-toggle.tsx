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

  if (!ready) return <div className="h-8 w-16" />;

  const handleClick = () => {
    const next = lang === "en" ? "tr" : "en";
    setLang(next);
    localStorage.setItem("lang", next);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      aria-label={lang === "en" ? "Switch to Turkish" : "Switch to English"}
    >
      {lang === "en" ? (
        <>
          <span className="text-base leading-none">🇺🇸</span>
          <span className="font-semibold">EN</span>
        </>
      ) : (
        <>
          <span className="text-base leading-none">🇹🇷</span>
          <span className="font-semibold">TR</span>
        </>
      )}
    </button>
  );
}
