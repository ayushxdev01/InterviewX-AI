export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="ixBadge" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1A2C55" />
          <stop offset="100%" stopColor="#0D1117" />
        </linearGradient>
        <linearGradient id="ixChevron" x1="14" y1="16" x2="50" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8AB4FF" />
          <stop offset="100%" stopColor="#5B8DEF" />
        </linearGradient>
        <radialGradient id="ixSpark" cx="0.3" cy="0.3" r="0.9">
          <stop offset="0%" stopColor="#FFC0AB" />
          <stop offset="100%" stopColor="#FF7A59" />
        </radialGradient>
        <filter id="ixGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width="64" height="64" rx="16" fill="url(#ixBadge)" />
      <rect x="1" y="1" width="62" height="62" rx="15" stroke="#3D4A63" strokeWidth="1.2" />

      <g filter="url(#ixGlow)">
        <path
          d="M17 19 L30 32 L17 45"
          stroke="url(#ixChevron)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <rect x="33" y="40" width="16" height="6" rx="3" fill="url(#ixChevron)" />
      </g>

      <g filter="url(#ixGlow)">
        <path
          d="M47 10
             L49.3 16.7
             L56 19
             L49.3 21.3
             L47 28
             L44.7 21.3
             L38 19
             L44.7 16.7
             Z"
          fill="url(#ixSpark)"
        />
      </g>
    </svg>
  );
}