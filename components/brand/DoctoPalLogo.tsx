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

function LogoIcon({ size, theme }: { size: number; theme: "light" | "dark" }) {
  const color = theme === "dark" ? "#34d399" : "#059669" // emerald-400 / emerald-600

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Stethoscope circle */}
      <circle cx="24" cy="24" r="16" stroke={color} strokeWidth="2.5" fill="none" />
      {/* Stethoscope tube going down */}
      <path
        d="M24 40 L24 44"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Stethoscope chest piece (small circle at bottom) */}
      <circle cx="24" cy="46" r="2" fill={color} />
      {/* Minimal leaf inside the circle */}
      <path
        d="M24 15 C20 19, 18 24, 21 28 C22.5 30, 24 30, 24 30 C24 30, 25.5 30, 27 28 C30 24, 28 19, 24 15Z"
        fill={color}
        opacity="0.9"
      />
      {/* Leaf center vein */}
      <line
        x1="24" y1="17" x2="24" y2="28"
        stroke={theme === "dark" ? "#064e3b" : "#ffffff"}
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  )
}

function Wordmark({ theme, className }: { theme: "light" | "dark"; className?: string }) {
  const doctoColor = theme === "dark" ? "#ffffff" : "#1e293b"
  const palColor = theme === "dark" ? "#34d399" : "#059669"

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
      <span style={{ color: doctoColor }}>Docto</span>
      <span style={{ color: palColor }}>Pal</span>
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

  // full = icon + wordmark
  return (
    <div className={`flex items-center ${s.gap} ${className}`}>
      <LogoIcon size={s.icon} theme={theme} />
      <Wordmark theme={theme} className={s.text} />
    </div>
  )
}
