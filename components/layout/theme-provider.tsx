// © 2026 DoctoPal — All Rights Reserved
"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // useState lazy init — localStorage hydration + media query at mount
  // without useEffect (react-hooks/set-state-in-effect). DOM class side
  // effect kept in useEffect (effects DO belong in effects).
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    try {
      const stored = localStorage.getItem("phyto-theme") as Theme | null;
      const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      return stored ?? preferred;
    } catch { return "light"; }
  });
  const [mounted, setMounted] = useState(false);

  // DOM class apply + SSR mounted guard.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- DOM class side effect + SSR mounted guard (Pattern 2.5, theme-driven document.documentElement mutation)
    setMounted(true);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("phyto-theme", next);
      document.documentElement.classList.add("transitioning");
      document.documentElement.classList.toggle("dark", next === "dark");
      setTimeout(() => document.documentElement.classList.remove("transitioning"), 500);
      return next;
    });
  }, []);

  // Prevent flash of wrong theme
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  // Return safe defaults during SSR/prerender when ThemeProvider isn't mounted yet
  if (context === undefined) {
    return { theme: "light" as Theme, toggleTheme: () => {} };
  }
  return context;
}
