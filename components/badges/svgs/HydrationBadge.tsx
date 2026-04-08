interface Props { locked?: boolean; size?: number }

export default function HydrationBadge({ locked = false, size = 100 }: Props) {
  const id = 'hyb'
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`${id}-gold`} cx="35%" cy="30%">
          <stop offset="0%" stopColor="#FFE566" />
          <stop offset="40%" stopColor="#D4A017" />
          <stop offset="100%" stopColor="#8B6914" />
        </radialGradient>
        <linearGradient id={`${id}-inner`} x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0c4a6e" />
        </linearGradient>
        <linearGradient id={`${id}-drop`} x1="0.3" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor="#e0f2fe" />
          <stop offset="30%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
        <radialGradient id={`${id}-refract`} cx="35%" cy="35%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
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
        <clipPath id={`${id}-dropClip`}>
          <path d="M50 8 C50 8 78 44 78 60 C78 76 66 88 50 88 C34 88 22 76 22 60 C22 44 50 8 50 8 Z" />
        </clipPath>
      </defs>

      <g filter={locked ? `url(#${id}-locked)` : undefined}>
        {/* Water drop shape - outer gold frame */}
        <path
          d="M50 4 C50 4 82 42 82 60 C82 78 68 92 50 92 C32 92 18 78 18 60 C18 42 50 4 50 4 Z"
          fill={`url(#${id}-gold)`}
          filter={`url(#${id}-shadow)`}
        />

        {/* Inner sapphire blue area */}
        <path
          d="M50 10 C50 10 76 44 76 60 C76 74 64 86 50 86 C36 86 24 74 24 60 C24 44 50 10 50 10 Z"
          fill={`url(#${id}-inner)`}
        />

        {/* Crystal drop in center */}
        <path
          d="M50 26 C50 26 66 48 66 58 C66 66 58 74 50 74 C42 74 34 66 34 58 C34 48 50 26 50 26 Z"
          fill={`url(#${id}-drop)`}
        />

        {/* Light refraction effect */}
        <ellipse cx="44" cy="48" rx="6" ry="10" fill={`url(#${id}-refract)`} />

        {/* Reflection at bottom */}
        <ellipse cx="50" cy="78" rx="14" ry="3" fill="rgba(125,211,252,0.2)" />

        {/* H2O molecule */}
        {/* Oxygen */}
        <circle cx="50" cy="56" r="4" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
        <text x="50" y="58.5" textAnchor="middle" fontSize="5" fill="rgba(255,255,255,0.7)" fontFamily="sans-serif" fontWeight="bold">O</text>

        {/* Hydrogen left */}
        <circle cx="40" cy="62" r="3" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
        <text x="40" y="64" textAnchor="middle" fontSize="4" fill="rgba(255,255,255,0.6)" fontFamily="sans-serif" fontWeight="bold">H</text>

        {/* Hydrogen right */}
        <circle cx="60" cy="62" r="3" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
        <text x="60" y="64" textAnchor="middle" fontSize="4" fill="rgba(255,255,255,0.6)" fontFamily="sans-serif" fontWeight="bold">H</text>

        {/* Bonds */}
        <line x1="46" y1="58" x2="43" y2="60" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
        <line x1="54" y1="58" x2="57" y2="60" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />

        {/* Tiny bubbles */}
        <circle cx="42" cy="42" r="2" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.6" />
        <circle cx="56" cy="38" r="1.5" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" />
        <circle cx="38" cy="52" r="1" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" />
      </g>

      {/* Lock overlay */}
      {locked && (
        <g>
          <path
            d="M50 4 C50 4 82 42 82 60 C82 78 68 92 50 92 C32 92 18 78 18 60 C18 42 50 4 50 4 Z"
            fill="rgba(120,120,120,0.3)"
          />
          <rect x="42" y="50" width="16" height="14" rx="2" fill="none" stroke="white" strokeWidth="2.5" opacity="0.8" />
          <path d="M44 50 V46 A6 6 0 0 1 56 46 V50" fill="none" stroke="white" strokeWidth="2.5" opacity="0.8" />
        </g>
      )}
    </svg>
  )
}
