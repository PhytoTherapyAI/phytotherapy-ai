interface Props { locked?: boolean; size?: number }

export default function FirstStepBadge({ locked = false, size = 100 }: Props) {
  const id = 'fsb'
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`${id}-silver`} cx="35%" cy="30%">
          <stop offset="0%" stopColor="#F0F0F0" />
          <stop offset="40%" stopColor="#C0C0C0" />
          <stop offset="100%" stopColor="#808080" />
        </radialGradient>
        <linearGradient id={`${id}-inner`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id={`${id}-capsule1`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fca5a5" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
        <linearGradient id={`${id}-capsule2`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#f5f5f4" />
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
        <clipPath id={`${id}-hexClip`}>
          <path d="M50 6 L88 27 L88 73 L50 94 L12 73 L12 27 Z" />
        </clipPath>
      </defs>

      <g filter={locked ? `url(#${id}-locked)` : undefined}>
        {/* Hexagon outer silver frame */}
        <path
          d="M50 3 L91 25.5 L91 74.5 L50 97 L9 74.5 L9 25.5 Z"
          fill={`url(#${id}-silver)`}
          filter={`url(#${id}-shadow)`}
        />

        {/* Hexagon inner blue area */}
        <path
          d="M50 9 L85 28.5 L85 71.5 L50 91 L15 71.5 L15 28.5 Z"
          fill={`url(#${id}-inner)`}
        />

        {/* Light reflection */}
        <ellipse cx="44" cy="30" rx="18" ry="8" fill="rgba(255,255,255,0.2)" clipPath={`url(#${id}-hexClip)`} />

        {/* 3D Capsule - top half (red) */}
        <rect x="40" y="32" width="20" height="18" rx="10" fill={`url(#${id}-capsule1)`} />
        {/* Capsule highlight */}
        <ellipse cx="47" cy="38" rx="4" ry="6" fill="rgba(255,255,255,0.35)" />

        {/* 3D Capsule - bottom half (white/cream) */}
        <rect x="40" y="50" width="20" height="18" rx="10" fill={`url(#${id}-capsule2)`} />
        {/* Capsule highlight bottom */}
        <ellipse cx="47" cy="56" rx="4" ry="6" fill="rgba(255,255,255,0.3)" />

        {/* Capsule divider line */}
        <line x1="40" y1="50" x2="60" y2="50" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />

        {/* Metallic reflection stripe */}
        <rect x="44" y="34" width="2" height="32" rx="1" fill="rgba(255,255,255,0.15)" />
      </g>

      {/* Lock overlay */}
      {locked && (
        <g>
          <path
            d="M50 3 L91 25.5 L91 74.5 L50 97 L9 74.5 L9 25.5 Z"
            fill="rgba(120,120,120,0.3)"
          />
          <rect x="42" y="50" width="16" height="14" rx="2" fill="none" stroke="white" strokeWidth="2.5" opacity="0.8" />
          <path d="M44 50 V46 A6 6 0 0 1 56 46 V50" fill="none" stroke="white" strokeWidth="2.5" opacity="0.8" />
        </g>
      )}
    </svg>
  )
}
