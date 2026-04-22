// © 2026 DoctoPal — All Rights Reserved
// Session 44 Faz 2 C2.1: sonner Toaster wrapped against our custom
// ThemeProvider. Sonner's own `theme="system"` follows the OS media query;
// we instead respect the toggle state the user picks via the header theme
// button, so light users stay in light mode even on a dark-mode OS.
"use client";

import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "@/components/layout/theme-provider";

export function AppToaster() {
  const { theme } = useTheme();
  return (
    <SonnerToaster
      theme={theme}
      richColors
      closeButton
      position="bottom-right"
      duration={5000}
    />
  );
}
