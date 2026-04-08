interface Props { locked?: boolean; size?: number }

export default function IdentityBadge({ locked = false, size = 100 }: Props) {
  const id = 'ib'
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`${id}-silver`} cx="35%" cy="30%">
          <stop offset="0%" stopColor="#F0F0F0" />
          <stop offset="40%" stopColor="#C0C0C0" />
          <stop offset="100%" stopColor="#808080" />
        </radialGradient>
        <linearGradient id={`${id}-inner`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#1e40af" />
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
        {/* Outer silver ring */}
        <circle cx="50" cy="50" r="46" fill={`url(#${id}-silver)`} filter={`url(#${id}-shadow)`} />

        {/* Inner blue area */}
        <circle cx="50" cy="50" r="38" fill={`url(#${id}-inner)`} />

        {/* Light reflection */}
        <ellipse cx="42" cy="34" rx="16" ry="8" fill="rgba(255,255,255,0.22)" />

        {/* Person silhouette - head */}
        <circle cx="50" cy="38" r="9" fill="none" stroke="#e0f2fe" strokeWidth="2.2" />

        {/* Person silhouette - body */}
        <path
          d="M32 68 C32 54 40 48 50 48 C60 48 68 54 68 68"
          fill="none"
          stroke="#e0f2fe"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* Fine detail lines on person */}
        <line x1="50" y1="48" x2="50" y2="56" stroke="#93c5fd" strokeWidth="1" opacity="0.5" />
        <line x1="44" y1="52" x2="56" y2="52" stroke="#93c5fd" strokeWidth="1" opacity="0.5" />

        {/* Small checkmark badge */}
        <circle cx="65" cy="36" r="7" fill="#22c55e" stroke="#15803d" strokeWidth="1" />
        <polyline points="61,36 64,39 69,33" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
