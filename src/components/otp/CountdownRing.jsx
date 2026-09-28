'use client';

import React from 'react';

/**
 * Anel de contagem regressiva do código (30s).
 * A cor muda perto do fim, mas o número de segundos sempre aparece junto em texto —
 * a informação não depende só da cor.
 */
export default function CountdownRing({ percent = 100, seconds, size = 44, stroke, showLabel = false }) {
  const sw = stroke ?? Math.max(2.5, size / 11);
  const r = (size - sw) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.max(0, Math.min(100, percent)) / 100);

  const color = seconds <= 5 ? 'var(--danger)' : seconds <= 10 ? 'var(--warning)' : 'var(--accent)';

  return (
    <span className="relative inline-grid place-items-center shrink-0" style={{ width: size, height: size }} aria-hidden="true">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={sw} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: percent >= 97 ? 'none' : 'stroke-dashoffset 1s linear, stroke 200ms' }}
        />
      </svg>
      {showLabel && (
        <span className="absolute inset-0 grid place-items-center text-[13px] font-semibold tabular text-fg">{seconds}</span>
      )}
    </span>
  );
}
