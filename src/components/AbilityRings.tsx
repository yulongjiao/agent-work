"use client";

import { useState, useEffect } from "react";

interface Skill {
  name: string;
  level: number;
}

export default function AbilityRings({ skills, size = 220 }: { skills: Skill[]; size?: number }) {
  const cx = size / 2, cy = size / 2;
  const [animVal, setAnimVal] = useState(0);

  useEffect(() => {
    let raf: number;
    let start: number | undefined;
    const run = (ts: number) => {
      if (start === undefined) start = ts;
      const p = Math.min((ts - start) / 1400, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setAnimVal(eased);
      if (p < 1) raf = requestAnimationFrame(run);
    };
    const t = setTimeout(() => { raf = requestAnimationFrame(run); }, 400);
    return () => { clearTimeout(t); cancelAnimationFrame(raf); };
  }, []);

  const colors = [
    ['#007AFF', '#00C6FF'],
    ['#5856D6', '#AF52DE'],
    ['#34C759', '#30D158'],
    ['#FF9500', '#FF6B00'],
    ['#FF2D55', '#FF375F'],
  ];
  const ringWidth = 6;
  const gap = 4;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        {colors.map((c, i) => (
          <linearGradient key={i} id={`ring${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={c[0]} /><stop offset="100%" stopColor={c[1]} />
          </linearGradient>
        ))}
      </defs>
      {skills.map((s, i) => {
        const r = (size / 2) - 20 - i * (ringWidth + gap);
        const circumference = 2 * Math.PI * r;
        const pct = (s.level / 100) * animVal;
        const dashLen = circumference * pct;
        const dashGap = circumference - dashLen;
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F5F5F7" strokeWidth={ringWidth} />
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={`url(#ring${i})`} strokeWidth={ringWidth}
              strokeDasharray={`${dashLen} ${dashGap}`}
              strokeLinecap="round"
              transform={`rotate(-90 ${cx} ${cy})`}
              style={{ filter: `drop-shadow(0 0 4px ${colors[i][0]}40)` }}
            />
          </g>
        );
      })}
      <text x={cx} y={cy - 8} textAnchor="middle" fontSize="26" fontWeight="700" fill="#1D1D1F">
        {Math.round(skills.reduce((a, s) => a + s.level, 0) / skills.length * animVal)}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="11" fill="#86868B">综合评分</text>
    </svg>
  );
}
