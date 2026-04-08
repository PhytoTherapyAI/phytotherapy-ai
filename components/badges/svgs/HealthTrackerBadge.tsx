interface Props { locked?: boolean; size?: number }

export default function HealthTrackerBadge({ locked = false, size = 100 }: Props) {
  const id = 'htb'
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`${id}-gold`} cx="35%" cy="30%">
          <stop offset="0%" stopColor="#FFE566" />
          <stop offset="40%" stopColor="#D4A017" />
          <stop offset="100%" stopColor="#8B6914" />
        </radialGradient>
        <linearGradient id={`${id}-inner`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#14532d" />
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
        {/* Outer gold ring */}
        <circle cx="50" cy="50" r="46" fill={`url(#${id}-gold)`} filter={`url(#${id}-shadow)`} />

        {/* Inner dark green area */}
        <circle cx="50" cy="50" r="38" fill={`url(#${id}-inner)`} />

        {/* Light reflection */}
        <ellipse cx="42" cy="34" rx="16" ry="8" fill="rgba(255,255,255,0.2)" />

        {/* Growing seedling - pot/soil */}
        <ellipse cx="50" cy="68" rx="12" ry="3" fill="#8B6914" opacity="0.6" />

        {/* Stem */}
        <path d="M50 68 C50 60 50 52 50 44" stroke="#86efac" strokeWidth="2.5" strokeLinecap="round" />

        {/* Left leaf */}
        <path
          d="M50 54 C42 50 38 44 42 40 C46 40 50 46 50 54"
          fill="#4ade80"
          stroke="#16a34a"
          strokeWidth="0.8"
        />

        {/* Right leaf */}
        <path
          d="M50 48 C58 44 62 38 58 34 C54 34 50 40 50 48"
          fill="#4ade80"
          stroke="#16a34a"
          strokeWidth="0.8"
        />

        {/* Top leaf (newest, bright) */}
        <path
          d="M50 44 C46 38 44 32 48 28 C52 28 54 34 50 44"
          fill="#86efac"
          stroke="#22c55e"
          strokeWidth="0.8"
        />

        {/* Leaf veins */}
        <path d="M48 50 L44 44" stroke="#166534" strokeWidth="0.5" opacity="0.5" />
        <path d="M52 44 L56 38" stroke="#166534" strokeWidth="0.5" opacity="0.5" />
        <path d="M49 40 L47 32" stroke="#166534" strokeWidth="0.5" opacity="0.5" />

        {/* Golden roots */}
        <path d="M50 68 C46 72 42 74 40 76" stroke="#D4A017" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
        <path d="M50 68 C54 72 58 74 60 76" stroke="#D4A017" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
        <path d="M50 68 L50 76" stroke="#D4A017" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
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
