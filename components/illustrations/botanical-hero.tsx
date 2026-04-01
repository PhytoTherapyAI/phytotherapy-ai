// © 2026 Doctopal — All Rights Reserved
"use client";

export function BotanicalHero({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Background leaf cluster — subtle, large */}
      <g opacity="0.08">
        <ellipse cx="200" cy="280" rx="160" ry="200" fill="var(--brand, #5aac74)" />
      </g>

      {/* Main stem */}
      <path
        d="M200 480 C200 380, 195 300, 200 180"
        stroke="var(--brand, #5aac74)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />

      {/* Left leaves */}
      <path
        d="M200 360 C180 340, 120 330, 100 310 C110 340, 150 360, 200 360Z"
        fill="var(--brand, #5aac74)"
        opacity="0.6"
      />
      <path
        d="M200 310 C175 285, 110 270, 85 245 C100 280, 145 305, 200 310Z"
        fill="var(--brand, #5aac74)"
        opacity="0.5"
      />
      <path
        d="M200 260 C180 240, 130 230, 115 210 C125 240, 160 255, 200 260Z"
        fill="var(--brand, #5aac74)"
        opacity="0.4"
      />

      {/* Right leaves */}
      <path
        d="M200 340 C220 320, 280 310, 300 290 C290 320, 250 340, 200 340Z"
        fill="var(--brand, #5aac74)"
        opacity="0.6"
      />
      <path
        d="M200 285 C225 260, 290 250, 310 225 C295 260, 255 280, 200 285Z"
        fill="var(--brand, #5aac74)"
        opacity="0.5"
      />
      <path
        d="M200 235 C218 218, 270 210, 285 193 C275 220, 240 235, 200 235Z"
        fill="var(--brand, #5aac74)"
        opacity="0.4"
      />

      {/* Flower / bud at top */}
      <ellipse cx="200" cy="165" rx="18" ry="22" fill="var(--gold, #b8965a)" opacity="0.8" />
      <ellipse cx="190" cy="158" rx="12" ry="18" fill="var(--gold, #b8965a)" opacity="0.6" />
      <ellipse cx="210" cy="158" rx="12" ry="18" fill="var(--gold, #b8965a)" opacity="0.6" />
      <ellipse cx="200" cy="148" rx="10" ry="16" fill="var(--gold, #b8965a)" opacity="0.9" />

      {/* EKG line running through the plant */}
      <path
        d="M30 300 L100 300 L120 300 L140 280 L155 340 L170 260 L185 320 L200 290 L215 300 L280 300 L370 300"
        stroke="var(--brand, #5aac74)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.35"
      />

      {/* Molecule dots — scattered around */}
      <circle cx="80" cy="200" r="4" fill="var(--brand, #5aac74)" opacity="0.25" />
      <circle cx="95" cy="185" r="3" fill="var(--brand, #5aac74)" opacity="0.2" />
      <line x1="80" y1="200" x2="95" y2="185" stroke="var(--brand, #5aac74)" strokeWidth="1" opacity="0.15" />

      <circle cx="320" cy="180" r="4" fill="var(--gold, #b8965a)" opacity="0.3" />
      <circle cx="340" cy="195" r="3" fill="var(--gold, #b8965a)" opacity="0.25" />
      <line x1="320" y1="180" x2="340" y2="195" stroke="var(--gold, #b8965a)" strokeWidth="1" opacity="0.2" />

      <circle cx="310" cy="380" r="3.5" fill="var(--brand, #5aac74)" opacity="0.2" />
      <circle cx="328" cy="370" r="2.5" fill="var(--brand, #5aac74)" opacity="0.15" />
      <line x1="310" y1="380" x2="328" y2="370" stroke="var(--brand, #5aac74)" strokeWidth="1" opacity="0.12" />

      <circle cx="70" cy="400" r="3" fill="var(--gold, #b8965a)" opacity="0.2" />
      <circle cx="55" cy="390" r="2.5" fill="var(--gold, #b8965a)" opacity="0.15" />
      <line x1="70" y1="400" x2="55" y2="390" stroke="var(--gold, #b8965a)" strokeWidth="1" opacity="0.12" />

      {/* Medical cross — subtle top-right */}
      <g opacity="0.12" transform="translate(330, 130)">
        <rect x="-2" y="-8" width="4" height="16" rx="1" fill="var(--brand, #5aac74)" />
        <rect x="-8" y="-2" width="16" height="4" rx="1" fill="var(--brand, #5aac74)" />
      </g>

      {/* Medical cross — subtle bottom-left */}
      <g opacity="0.1" transform="translate(60, 440)">
        <rect x="-1.5" y="-6" width="3" height="12" rx="1" fill="var(--brand, #5aac74)" />
        <rect x="-6" y="-1.5" width="12" height="3" rx="1" fill="var(--brand, #5aac74)" />
      </g>
    </svg>
  );
}
