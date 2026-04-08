interface Props { locked?: boolean; size?: number }

export default function HerbalistBadge({ locked = false, size = 100 }: Props) {
  const id = 'hb'
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`${id}-gold`} cx="35%" cy="30%">
          <stop offset="0%" stopColor="#FFE566" />
          <stop offset="40%" stopColor="#D4A017" />
          <stop offset="100%" stopColor="#8B6914" />
        </radialGradient>
        <linearGradient id={`${id}-inner`} x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#064e3b" />
        </linearGradient>
        <filter id={`${id}-shadow`}>
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="rgba(0,0,0,0.4)" />
        </filter>
        <filter id={`${id}-locked`}>
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncR type="linear" slope="0.6" />
            <feFuncG type="linear" slope="0.6" />
            <feFuncB type="linear" slope="0.6" />
          </feComponentTransfer>
        </filter>
      </defs>

      <g filter={locked ? `url(#${id}-locked)` : undefined}>
        {/* Leaf-shaped outer frame (gold) */}
        <path
          d="M50 4 C70 4 92 20 92 50 C92 75 70 96 50 96 C30 96 8 75 8 50 C8 20 30 4 50 4 Z"
          fill={`url(#${id}-gold)`}
          filter={`url(#${id}-shadow)`}
          transform="rotate(-15, 50, 50)"
        />
        {/* Leaf tip top */}
        <path
          d="M50 4 C52 -2 56 -2 58 4"
          fill={`url(#${id}-gold)`}
          transform="rotate(-15, 50, 50)"
        />

        {/* Inner emerald area */}
        <ellipse cx="50" cy="50" rx="36" ry="40" fill={`url(#${id}-inner)`} transform="rotate(-15, 50, 50)" />

        {/* Light reflection */}
        <ellipse cx="42" cy="32" rx="14" ry="8" fill="rgba(255,255,255,0.2)" transform="rotate(-15, 50, 50)" />

        {/* Gold leaf veins */}
        <path d="M50 22 L50 78" stroke="#D4A017" strokeWidth="1" opacity="0.4" />
        <path d="M50 35 L36 45" stroke="#D4A017" strokeWidth="0.7" opacity="0.3" />
        <path d="M50 35 L64 45" stroke="#D4A017" strokeWidth="0.7" opacity="0.3" />
        <path d="M50 50 L34 58" stroke="#D4A017" strokeWidth="0.7" opacity="0.3" />
        <path d="M50 50 L66 58" stroke="#D4A017" strokeWidth="0.7" opacity="0.3" />

        {/* Rod of Asclepius - staff */}
        <line x1="50" y1="26" x2="50" y2="76" stroke="#e0f2e9" strokeWidth="2.5" strokeLinecap="round" />

        {/* Snake wrapping around staff */}
        <path
          d="M50 30 C58 34 42 40 50 44 C58 48 42 54 50 58 C58 62 42 68 50 72"
          fill="none"
          stroke="#a7f3d0"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Small leaf on snake */}
        <path d="M55 36 C60 32 62 36 58 40" fill="#6ee7b7" stroke="#059669" strokeWidth="0.6" />
        <path d="M44 52 C39 48 37 52 41 56" fill="#6ee7b7" stroke="#059669" strokeWidth="0.6" />

        {/* Snake head */}
        <circle cx="50" cy="28" r="2.5" fill="#a7f3d0" />
        <circle cx="49" cy="27" r="0.7" fill="#064e3b" />
      </g>

      {/* Lock overlay */}
      {locked && (
        <g>
          <ellipse cx="50" cy="50" rx="44" ry="46" fill="rgba(120,120,120,0.3)" />
          <rect x="42" y="50" width="16" height="14" rx="2" fill="none" stroke="white" strokeWidth="2.5" opacity="0.8" />
          <path d="M44 50 V46 A6 6 0 0 1 56 46 V50" fill="none" stroke="white" strokeWidth="2.5" opacity="0.8" />
        </g>
      )}
    </svg>
  )
}
