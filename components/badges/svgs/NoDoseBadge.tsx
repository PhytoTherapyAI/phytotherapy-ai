interface Props { locked?: boolean; size?: number }

export default function NoDoseBadge({ locked = false, size = 100 }: Props) {
  const id = 'ndb'
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`${id}-purple`} cx="35%" cy="30%">
          <stop offset="0%" stopColor="#d8b4fe" />
          <stop offset="40%" stopColor="#9333ea" />
          <stop offset="100%" stopColor="#581c87" />
        </radialGradient>
        <linearGradient id={`${id}-inner`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#3b0764" />
        </linearGradient>
        <linearGradient id={`${id}-bell`} x1="0.3" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="40%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#b45309" />
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
        {/* Outer purple ring */}
        <circle cx="50" cy="50" r="46" fill={`url(#${id}-purple)`} filter={`url(#${id}-shadow)`} />

        {/* Inner dark purple area */}
        <circle cx="50" cy="50" r="38" fill={`url(#${id}-inner)`} />

        {/* Light reflection */}
        <ellipse cx="42" cy="34" rx="16" ry="8" fill="rgba(255,255,255,0.18)" />

        {/* 3D Bell - main body */}
        <path
          d="M36 52 C36 38 42 28 50 28 C58 28 64 38 64 52 L68 56 L32 56 Z"
          fill={`url(#${id}-bell)`}
        />
        {/* Bell highlight */}
        <path
          d="M40 52 C40 40 44 32 50 32"
          fill="none"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Bell top knob */}
        <circle cx="50" cy="26" r="3" fill="#fbbf24" stroke="#b45309" strokeWidth="0.8" />
        {/* Knob highlight */}
        <circle cx="49" cy="25" r="1" fill="rgba(255,255,255,0.5)" />

        {/* Bell bottom rim */}
        <ellipse cx="50" cy="56" rx="18" ry="2.5" fill="#b45309" />
        <ellipse cx="50" cy="55.5" rx="18" ry="2" fill="#d97706" />

        {/* Bell clapper */}
        <circle cx="50" cy="58" r="2.5" fill="#92400e" />
        <circle cx="49.5" cy="57.5" r="0.8" fill="rgba(255,255,255,0.3)" />

        {/* Pulse line below bell */}
        <polyline
          points="28,68 36,68 40,62 44,72 48,64 52,70 56,66 60,68 72,68"
          fill="none"
          stroke="#e9d5ff"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.7"
        />

        {/* Sound waves */}
        <path d="M26 42 C22 46 22 52 26 56" fill="none" stroke="#e9d5ff" strokeWidth="1.2" opacity="0.4" strokeLinecap="round" />
        <path d="M74 42 C78 46 78 52 74 56" fill="none" stroke="#e9d5ff" strokeWidth="1.2" opacity="0.4" strokeLinecap="round" />
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
