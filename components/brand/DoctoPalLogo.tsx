// © 2026 DoctoPal — All Rights Reserved
"use client"

interface DoctoPalLogoProps {
  size?: "sm" | "md" | "lg"
  variant?: "full" | "icon" | "wordmark"
  theme?: "light" | "dark"
  className?: string
}

const SIZES = {
  sm: { icon: 24, text: "text-lg", gap: "gap-1.5" },
  md: { icon: 32, text: "text-xl", gap: "gap-2" },
  lg: { icon: 48, text: "text-3xl", gap: "gap-3" },
}

// Brand colors
const BRAND = {
  light: { docto: "#1e293b", pal: "#3c7a52", icon: "#3c7a52", leaf: "#c4a86c" },
  dark:  { docto: "#f1f5f9", pal: "#86EFAC", icon: "#4a9460", leaf: "#c4a86c" },
}

function LogoIcon({ size, theme }: { size: number; theme: "light" | "dark" }) {
  const c = BRAND[theme].icon
  const leaf = BRAND[theme].leaf

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Rounded square container */}
      <rect x="1" y="1" width="38" height="38" rx="10" stroke={c} strokeWidth="2" fill="none" />
      {/* D letterform */}
      <path
        d="M12 10 L12 30 L20 30 C27 30, 32 25, 32 20 C32 15, 27 10, 20 10 Z"
        stroke={c}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Gold leaf accent on top-right of D curve */}
      <path
        d="M26 8 C28 6, 31 5.5, 33 6 C32 8, 30 9.5, 27.5 10"
        fill={leaf}
        opacity="0.9"
      />
      {/* Tiny leaf vein */}
      <path
        d="M27 8.5 C29 7, 31 6.5, 32 6.5"
        stroke={theme === "dark" ? "#0f172a" : "#ffffff"}
        strokeWidth="0.5"
        fill="none"
        opacity="0.4"
      />
    </svg>
  )
}

function Wordmark({ theme, className }: { theme: "light" | "dark"; className?: string }) {
  const colors = BRAND[theme]

  return (
    <span
      className={className}
      style={{
        fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
        fontWeight: 800,
        letterSpacing: "-0.03em",
        lineHeight: 1,
      }}
    >
      <span style={{ color: colors.docto }}>Docto</span>
      <span style={{ color: colors.pal }}>Pal</span>
    </span>
  )
}

export function DoctoPalLogo({
  size = "md",
  variant = "full",
  theme = "light",
  className = "",
}: DoctoPalLogoProps) {
  const s = SIZES[size]

  if (variant === "icon") {
    return (
      <div className={className}>
        <LogoIcon size={s.icon} theme={theme} />
      </div>
    )
  }

  if (variant === "wordmark") {
    return <Wordmark theme={theme} className={`${s.text} ${className}`} />
  }

  return (
    <div className={`flex items-center ${s.gap} ${className}`}>
      <LogoIcon size={s.icon} theme={theme} />
      <Wordmark theme={theme} className={s.text} />
    </div>
  )
}
