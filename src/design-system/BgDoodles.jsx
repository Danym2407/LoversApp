import React from 'react';

/**
 * BgDoodles — Shared decorative SVG background.
 *
 * Renders scattered sparkles, a dashed ellipse, and a wavy line.
 * Position is absolute so the parent must be `position: relative`.
 *
 * Props:
 *   viewHeight  {number}  SVG viewBox height. Default 820. Pass 700 for shorter pages.
 */
export default function BgDoodles({ viewHeight = 820 }) {
  return (
    <svg
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.25 }}
      viewBox={`0 0 390 ${viewHeight}`}
      fill="none"
      aria-hidden
    >
      <text x="355" y="90"  fontSize="12" fill="#E8A020" fontFamily="serif">✦</text>
      <text x="20"  y="160" fontSize="9"  fill="#E05060" fontFamily="serif">✦</text>
      <text x="360" y="280" fontSize="8"  fill="#5B8ECC" fontFamily="serif">★</text>
      <text x="18"  y="420" fontSize="10" fill="#5BAA6A" fontFamily="serif">✦</text>
      <ellipse cx="356" cy="130" rx="18" ry="16" stroke="#5B8ECC" strokeWidth="1.5" strokeDasharray="4 3" fill="none" transform="rotate(-8 356 130)"/>
      <path d="M15 340 Q35 335 43 348" stroke="#E05060" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}
