interface Props { locked?: boolean; size?: number }

export default function FamilyBadge({ locked = false, size = 100 }: Props) {
  const id = 'fb'
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`${id}-gold`} cx="35%" cy="30%">
          <stop offset="0%" stopColor="#FFE566" />
          <stop offset="40%" stopColor="#D4A017" />
          <stop offset="100%" stopColor="#8B6914" />
        </radialGradient>
        <linearGradient id={`${id}-inner`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#6b21a8" />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="50%" cy="50%">
          <stop offset="0%" stopColor="rgba(192,132,252,0.4)" />
          <stop offset="100%" stopColor="rgba(192,132,252,0)" />
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
      </defs>

      <g filter={locked ? `url(#${id}-locked)` : undefined}>
        {/* Shield outer gold frame */}
        <path
          d="M50 4 L90 20 L90 52 C90 72 72 88 50 96 C28 88 10 72 10 52 L10 20 Z"
          fill={`url(#${id}-gold)`}
          filter={`url(#${id}-shadow)`}
        />

        {/* Shield inner purple area */}
        <path
          d="M50 10 L84 24 L84 52 C84 69 68 83 50 90 C32 83 16 69 16 52 L16 24 Z"
          fill={`url(#${id}-inner)`}
        />

        {/* Protection glow */}
        <circle cx="50" cy="50" r="28" fill={`url(#${id}-glow)`} />

        {/* Light reflection */}
        <ellipse cx="44" cy="28" rx="16" ry="7" fill="rgba(255,255,255,0.18)" />

        {/* Family silhouettes - Adult left */}
        <circle cx="36" cy="40" r="5.5" fill="none" stroke="#f0e6ff" strokeWidth="1.8" />
        <path d="M27 58 C27 50 31 46 36 46 C41 46 45 50 45 58" fill="none" stroke="#f0e6ff" strokeWidth="1.8" strokeLinecap="round" />

        {/* Adult right */}
        <circle cx="64" cy="40" r="5.5" fill="none" stroke="#f0e6ff" strokeWidth="1.8" />
        <path d="M55 58 C55 50 59 46 64 46 C69 46 73 50 73 58" fill="none" stroke="#f0e6ff" strokeWidth="1.8" strokeLinecap="round" />

        {/* Child center */}
        <circle cx="50" cy="48" r="4.5" fill="none" stroke="#f0e6ff" strokeWidth="1.8" />
        <path d="M43 63 C43 57 46 54 50 54 C54 54 57 57 57 63" fill="none" stroke="#f0e6ff" strokeWidth="1.8" strokeLinecap="round" />

        {/* Shield mini icon on top */}
        <path
          d="M50 18 L57 21 V27 C57 31 54 34 50 35 C46 34 43 31 43 27 V21 Z"
          fill="rgba(255,229,102,0.5)"
          stroke="#FFE566"
          strokeWidth="0.8"
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
