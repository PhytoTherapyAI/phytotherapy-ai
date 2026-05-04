/** @type {import('tailwindcss').Config} */
// Sprint 30 Commit 1 — DoctoPal mobile NativeWind v4 config.
// Design tokens mirror the web app's emerald/sage brand palette.
// Web app: tailwind.config.ts uses default Tailwind colors via shadcn CSS vars;
// mobile uses static color tokens since NativeWind v4 doesn't read CSS vars yet.
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // DoctoPal brand — emerald/sage palette (web parity)
        primary: {
          DEFAULT: "#059669", // emerald-600
          light: "#10b981",   // emerald-500
          dark: "#047857",    // emerald-700
          foreground: "#ffffff",
        },
        sage: {
          50:  "#f0f7f1",
          100: "#daece1",
          500: "#6b8f71",
          600: "#4a6b50",
          900: "#1f3024",
        },
        // Neutral surface tokens — mirror web shadcn defaults
        background: "#ffffff",
        foreground: "#0f172a",     // slate-900
        muted: "#f1f5f9",          // slate-100
        "muted-foreground": "#64748b", // slate-500
        border: "#e2e8f0",         // slate-200
        card: "#ffffff",
        destructive: "#dc2626",    // red-600
      },
    },
  },
  plugins: [],
};
