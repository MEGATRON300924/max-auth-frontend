export function MaxIdentityGraphic({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 640 520" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="max-line" x1="90" y1="80" x2="550" y2="450" gradientUnits="userSpaceOnUse">
          <stop stopColor="#60A5FA" />
          <stop offset="1" stopColor="#2563EB" />
        </linearGradient>
        <linearGradient id="max-core" x1="270" y1="180" x2="390" y2="340" gradientUnits="userSpaceOnUse">
          <stop stopColor="#EFF6FF" />
          <stop offset="1" stopColor="#BFDBFE" />
        </linearGradient>
        <filter id="max-shadow" x="120" y="110" width="400" height="330" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="18" stdDeviation="22" floodColor="#2563EB" floodOpacity="0.16" />
        </filter>
        <clipPath id="max-logo-clip">
          <circle cx="320" cy="260" r="60" />
        </clipPath>
      </defs>

      <circle cx="320" cy="260" r="205" stroke="currentColor" strokeOpacity="0.06" />
      <circle cx="320" cy="260" r="155" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="5 10" />
      <circle cx="320" cy="260" r="112" stroke="#3B82F6" strokeOpacity="0.12" />

      <g stroke="url(#max-line)" strokeWidth="2" strokeLinecap="round">
        <path d="M320 260L145 150" /><path d="M320 260L500 145" />
        <path d="M320 260L535 315" /><path d="M320 260L170 375" />
        <path d="M320 260L320 92" /><path d="M320 260L320 430" />
      </g>

      <g fill="#3B82F6">
        <circle cx="145" cy="150" r="6" /><circle cx="500" cy="145" r="6" />
        <circle cx="535" cy="315" r="6" /><circle cx="170" cy="375" r="6" />
        <circle cx="320" cy="92" r="6" /><circle cx="320" cy="430" r="6" />
      </g>

      <g filter="url(#max-shadow)">
        <circle cx="320" cy="260" r="86" fill="url(#max-core)" stroke="#3B82F6" strokeWidth="2" />
        <circle cx="320" cy="260" r="68" fill="white" fillOpacity="0.96" />
        <circle cx="320" cy="260" r="60" fill="white" />
        <image
          href="/logo.png"
          x="260"
          y="200"
          width="120"
          height="120"
          preserveAspectRatio="xMidYMid slice"
          clipPath="url(#max-logo-clip)"
        />
        <circle cx="320" cy="260" r="60" stroke="#3B82F6" strokeOpacity="0.14" />
      </g>

      <g fill="currentColor" fillOpacity="0.45">
        <circle cx="92" cy="260" r="3" /><circle cx="548" cy="260" r="3" />
        <circle cx="244" cy="55" r="3" /><circle cx="396" cy="465" r="3" />
      </g>
    </svg>
  );
}
