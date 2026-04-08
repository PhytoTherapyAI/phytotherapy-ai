interface Props { locked?: boolean; size?: number }

export default function ImmunityBadge({ locked = false, size = 100 }: Props) {
  const id = 'imb'
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`${id}-steel`} cx="35%" cy="30%">
          <stop offset="0%" stopColor="#E8E8E8" />
          <stop offset="40%" stopColor="#A8A8A8" />
          <stop offset="100%" stopColor="#606060" />
        </radialGradient>
        <linearGradient id={`${id}-inner`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#1e3a5f" />
        </linearGradient>
        <pattern id={`${id}-steelTex`} width="6" height="6" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="6" y2="6" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
        </pattern>
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
        {/* Heater shield outer steel frame */}
        <path
          d="M50 4 L90 18 L90 50 C90 74 70 92 50 96 C30 92 10 74 10 50 L10 18 Z"
          fill={`url(#${id}-steel)`}
          filter={`url(#${id}-shadow)`}
        />

        {/* Shield inner dark blue area */}
        <path
          d="M50 10 L84 22 L84 50 C84 71 66 87 50 90 C34 87 16 71 16 50 L16 22 Z"
          fill={`url(#${id}-inner)`}
        />

        {/* Steel texture overlay */}
        <path
          d="M50 10 L84 22 L84 50 C84 71 66 87 50 90 C34 87 16 71 16 50 L16 22 Z"
          fill={`url(#${id}-steelTex)`}
        />

        {/* Light reflection */}
        <ellipse cx="44" cy="28" rx="16" ry="7" fill="rgba(255,255,255,0.15)" />

        {/* T-cell / hexagonal cell structure */}
        {/* Center hexagon */}
        <polygon
          points="50,32 58,36 58,44 50,48 42,44 42,36"
          fill="none"
          stroke="#93c5fd"
          strokeWidth="1.5"
        />
        {/* Inner pattern */}
        <circle cx="50" cy="40" r="3" fill="rgba(147,197,253,0.3)" stroke="#93c5fd" strokeWidth="0.8" />

        {/* Surrounding hexagonal cells */}
        <polygon points="50,22 56,25 56,31 50,34 44,31 44,25" fill="none" stroke="#60a5fa" strokeWidth="0.8" opacity="0.5" />
        <polygon points="60,36 66,39 66,45 60,48 54,45 54,39" fill="none" stroke="#60a5fa" strokeWidth="0.8" opacity="0.5" />
        <polygon points="40,36 46,39 46,45 40,48 34,45 34,39" fill="none" stroke="#60a5fa" strokeWidth="0.8" opacity="0.5" />
        <polygon points="60,46 66,49 66,55 60,58 54,55 54,49" fill="none" stroke="#60a5fa" strokeWidth="0.8" opacity="0.4" />
        <polygon points="40,46 46,49 46,55 40,58 34,55 34,49" fill="none" stroke="#60a5fa" strokeWidth="0.8" opacity="0.4" />
        <polygon points="50,52 56,55 56,61 50,64 44,61 44,55" fill="none" stroke="#60a5fa" strokeWidth="0.8" opacity="0.4" />

        {/* Antibody Y shapes floating */}
        <g opacity="0.6">
          <path d="M28 60 L28 66 M26 58 L28 60 L30 58" stroke="#bfdbfe" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M72 56 L72 62 M70 54 L72 56 L74 54" stroke="#bfdbfe" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M50 72 L50 78 M48 70 L50 72 L52 70" stroke="#bfdbfe" strokeWidth="1.2" strokeLinecap="round" />
        </g>

        {/* Plus symbol (medical) */}
        <rect x="47" y="37" width="6" height="1.5" rx="0.5" fill="#93c5fd" opacity="0.6" />
        <rect x="49.25" y="34.75" width="1.5" height="6" rx="0.5" fill="#93c5fd" opacity="0.6" />
      </g>

      {/* Lock overlay */}
      {locked && (
        <g>
          <path
            d="M50 4 L90 18 L90 50 C90 74 70 92 50 96 C30 92 10 74 10 50 L10 18 Z"
            fill="rgba(120,120,120,0.3)"
          />
          <rect x="42" y="50" width="16" height="14" rx="2" fill="none" stroke="white" strokeWidth="2.5" opacity="0.8" />
          <path d="M44 50 V46 A6 6 0 0 1 56 46 V50" fill="none" stroke="white" strokeWidth="2.5" opacity="0.8" />
        </g>
      )}
    </svg>
  )
}
