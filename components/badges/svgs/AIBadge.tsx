interface Props { locked?: boolean; size?: number }

export default function AIBadge({ locked = false, size = 100 }: Props) {
  const id = 'aib'
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`${id}-gold`} cx="35%" cy="30%">
          <stop offset="0%" stopColor="#FFE566" />
          <stop offset="40%" stopColor="#D4A017" />
          <stop offset="100%" stopColor="#8B6914" />
        </radialGradient>
        <linearGradient id={`${id}-inner`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#0f4c4e" />
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
        {/* Diamond shape - outer gold frame */}
        <path
          d="M50 4 L92 50 L50 96 L8 50 Z"
          fill={`url(#${id}-gold)`}
          filter={`url(#${id}-shadow)`}
        />

        {/* Diamond inner teal area */}
        <path
          d="M50 12 L84 50 L50 88 L16 50 Z"
          fill={`url(#${id}-inner)`}
        />

        {/* Light reflection */}
        <path d="M50 16 L72 44 L50 20 L28 44 Z" fill="rgba(255,255,255,0.12)" />

        {/* Neural network - nodes */}
        {/* Input layer */}
        <circle cx="30" cy="40" r="3" fill="#5eead4" opacity="0.8" />
        <circle cx="30" cy="50" r="3" fill="#5eead4" opacity="0.8" />
        <circle cx="30" cy="60" r="3" fill="#5eead4" opacity="0.8" />

        {/* Hidden layer */}
        <circle cx="50" cy="36" r="3.5" fill="#99f6e4" />
        <circle cx="50" cy="50" r="3.5" fill="#99f6e4" />
        <circle cx="50" cy="64" r="3.5" fill="#99f6e4" />

        {/* Output layer */}
        <circle cx="70" cy="45" r="3" fill="#5eead4" opacity="0.8" />
        <circle cx="70" cy="55" r="3" fill="#5eead4" opacity="0.8" />

        {/* Connections - input to hidden */}
        <line x1="33" y1="40" x2="47" y2="36" stroke="#5eead4" strokeWidth="0.7" opacity="0.5" />
        <line x1="33" y1="40" x2="47" y2="50" stroke="#5eead4" strokeWidth="0.7" opacity="0.4" />
        <line x1="33" y1="50" x2="47" y2="36" stroke="#5eead4" strokeWidth="0.7" opacity="0.4" />
        <line x1="33" y1="50" x2="47" y2="50" stroke="#5eead4" strokeWidth="0.7" opacity="0.5" />
        <line x1="33" y1="50" x2="47" y2="64" stroke="#5eead4" strokeWidth="0.7" opacity="0.4" />
        <line x1="33" y1="60" x2="47" y2="50" stroke="#5eead4" strokeWidth="0.7" opacity="0.4" />
        <line x1="33" y1="60" x2="47" y2="64" stroke="#5eead4" strokeWidth="0.7" opacity="0.5" />

        {/* Connections - hidden to output */}
        <line x1="53" y1="36" x2="67" y2="45" stroke="#5eead4" strokeWidth="0.7" opacity="0.5" />
        <line x1="53" y1="36" x2="67" y2="55" stroke="#5eead4" strokeWidth="0.7" opacity="0.4" />
        <line x1="53" y1="50" x2="67" y2="45" stroke="#5eead4" strokeWidth="0.7" opacity="0.5" />
        <line x1="53" y1="50" x2="67" y2="55" stroke="#5eead4" strokeWidth="0.7" opacity="0.5" />
        <line x1="53" y1="64" x2="67" y2="45" stroke="#5eead4" strokeWidth="0.7" opacity="0.4" />
        <line x1="53" y1="64" x2="67" y2="55" stroke="#5eead4" strokeWidth="0.7" opacity="0.5" />

        {/* AI Eye in center node */}
        <ellipse cx="50" cy="50" rx="5" ry="3.5" fill="none" stroke="#ffffff" strokeWidth="1.2" opacity="0.8" />
        <circle cx="50" cy="50" r="1.8" fill="#ffffff" opacity="0.9" />

        {/* Sparkle nodes - glowing */}
        <circle cx="50" cy="36" r="1" fill="#ffffff" opacity="0.7" />
        <circle cx="50" cy="64" r="1" fill="#ffffff" opacity="0.7" />
      </g>

      {/* Lock overlay */}
      {locked && (
        <g>
          <path d="M50 4 L92 50 L50 96 L8 50 Z" fill="rgba(120,120,120,0.3)" />
          <rect x="42" y="50" width="16" height="14" rx="2" fill="none" stroke="white" strokeWidth="2.5" opacity="0.8" />
          <path d="M44 50 V46 A6 6 0 0 1 56 46 V50" fill="none" stroke="white" strokeWidth="2.5" opacity="0.8" />
        </g>
      )}
    </svg>
  )
}
