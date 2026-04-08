interface Props { locked?: boolean; size?: number }

export default function StreakBadge({ locked = false, size = 100 }: Props) {
  const id = 'sb'
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${id}-ring`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fca5a5" />
          <stop offset="50%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
        <linearGradient id={`${id}-inner`} x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="50%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
        <radialGradient id={`${id}-heat`} cx="50%" cy="80%">
          <stop offset="0%" stopColor="rgba(251,191,36,0.4)" />
          <stop offset="100%" stopColor="rgba(251,191,36,0)" />
        </radialGradient>
        <filter id={`${id}-shadow`}>
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="rgba(0,0,0,0.4)" />
        </filter>
        <filter id={`${id}-glow`}>
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
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
        {/* Outer red-orange ring */}
        <circle cx="50" cy="50" r="46" fill={`url(#${id}-ring)`} filter={`url(#${id}-shadow)`} />

        {/* Inner fire gradient area */}
        <circle cx="50" cy="50" r="38" fill={`url(#${id}-inner)`} />

        {/* Heat wave background */}
        <circle cx="50" cy="50" r="38" fill={`url(#${id}-heat)`} />

        {/* Heat distortion waves */}
        <path d="M24 44 C28 40 32 44 36 40" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
        <path d="M64 44 C68 40 72 44 76 40" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
        <path d="M30 36 C34 32 38 36 42 32" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

        {/* Main flame - outer */}
        <path
          d="M50 20 C58 28 68 38 66 52 C66 64 58 72 50 74 C42 72 34 64 34 52 C34 38 42 28 50 20 Z"
          fill="#fbbf24"
          filter={`url(#${id}-glow)`}
        />

        {/* Flame mid layer */}
        <path
          d="M50 28 C56 34 62 42 60 52 C60 62 56 68 50 70 C44 68 40 62 40 52 C40 42 44 34 50 28 Z"
          fill="#f97316"
        />

        {/* Flame inner (hot core) */}
        <path
          d="M50 38 C54 42 58 48 56 54 C56 60 54 64 50 66 C46 64 44 60 44 54 C44 48 46 42 50 38 Z"
          fill="#fef3c7"
        />

        {/* White-hot center */}
        <ellipse cx="50" cy="56" rx="4" ry="6" fill="rgba(255,255,255,0.6)" />

        {/* Flame highlights */}
        <path d="M46 40 C44 46 44 50 46 54" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" strokeLinecap="round" />

        {/* Sparks */}
        <circle cx="40" cy="30" r="1.5" fill="#fef3c7" opacity="0.7" />
        <circle cx="62" cy="34" r="1" fill="#fef3c7" opacity="0.6" />
        <circle cx="36" cy="38" r="1" fill="#fef3c7" opacity="0.5" />
      </g>

      {/* Lock overlay */}
      {locked && (
        <g>
          <circle cx="50" cy="50" r="46" fill="rgba(120,120,120,0.3)" />
          <rect x="42" y="50" width="16" height="14" rx="2" fill="none" stroke="white" strokeWidth="2.5" opacity="0.8" />
          <path d="M44 50 V46 A6 6 0 0 1 56 46 V50" fill="none" stroke="white" strokeWidth="2.5" opacity="0.8" />
        </g>
      )}
    </svg>
  )
}
