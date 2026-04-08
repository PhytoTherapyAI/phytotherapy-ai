interface Props { locked?: boolean; size?: number }

export default function WelcomeBadge({ locked = false, size = 100 }: Props) {
  const id = 'wb'
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`${id}-gold`} cx="35%" cy="30%">
          <stop offset="0%" stopColor="#FFE566" />
          <stop offset="40%" stopColor="#D4A017" />
          <stop offset="100%" stopColor="#8B6914" />
        </radialGradient>
        <linearGradient id={`${id}-inner`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#166534" />
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
        {/* Shield shape - outer gold frame */}
        <path
          d="M50 4 L90 20 L90 52 C90 72 72 88 50 96 C28 88 10 72 10 52 L10 20 Z"
          fill={`url(#${id}-gold)`}
          filter={`url(#${id}-shadow)`}
        />

        {/* Shield inner area */}
        <path
          d="M50 10 L84 24 L84 52 C84 69 68 83 50 90 C32 83 16 69 16 52 L16 24 Z"
          fill={`url(#${id}-inner)`}
        />

        {/* Geometric border pattern on shield edges */}
        <path
          d="M50 13 L81 26 L81 52 C81 67 66 80 50 87 C34 80 19 67 19 52 L19 26 Z"
          fill="none"
          stroke="rgba(255,229,102,0.3)"
          strokeWidth="1"
          strokeDasharray="4 3"
        />

        {/* Light reflection */}
        <ellipse cx="44" cy="30" rx="18" ry="8" fill="rgba(255,255,255,0.2)" />

        {/* Leaf + pulse icon */}
        {/* Leaf */}
        <path
          d="M38 62 C38 44 50 36 62 36 C62 48 54 62 38 62 Z"
          fill="#a7f3d0"
          stroke="#065f46"
          strokeWidth="1.2"
        />
        {/* Leaf vein */}
        <path
          d="M40 60 C44 52 50 46 58 38"
          fill="none"
          stroke="#065f46"
          strokeWidth="0.8"
          opacity="0.7"
        />
        <path d="M46 54 L50 48" fill="none" stroke="#065f46" strokeWidth="0.6" opacity="0.5" />
        <path d="M43 57 L48 52" fill="none" stroke="#065f46" strokeWidth="0.6" opacity="0.5" />

        {/* Pulse line through leaf */}
        <polyline
          points="30,52 40,52 44,44 48,58 52,46 56,54 60,54 70,54"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.9"
        />
      </g>

      {/* Lock overlay */}
      {locked && (
        <g>
          <path
            d="M50 4 L90 20 L90 52 C90 72 72 88 50 96 C28 88 10 72 10 52 L10 20 Z"
            fill="rgba(120,120,120,0.3)"
          />
          <rect x="42" y="50" width="16" height="14" rx="2" fill="none" stroke="white" strokeWidth="2.5" opacity="0.8" />
          <path d="M44 50 V46 A6 6 0 0 1 56 46 V50" fill="none" stroke="white" strokeWidth="2.5" opacity="0.8" />
        </g>
      )}
    </svg>
  )
}
