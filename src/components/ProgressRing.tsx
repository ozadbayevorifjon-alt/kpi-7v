"use client";

import type { CSSProperties } from "react";

type Props = {
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
};

export default function ProgressRing({
  value,
  max = 30,
  size = 150,
  stroke = 13,
  label,
  sublabel,
}: Props) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / max));
  const target = c * (1 - pct);

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="55%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(148,163,184,0.14)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ring-grad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={target}
          className="anim-ring"
          style={{ "--ring-c": c, filter: "drop-shadow(0 0 10px rgba(59,130,246,0.55))" } as CSSProperties}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="text-3xl font-black tracking-tight text-white">
            {label ?? value}
            <span className="ml-0.5 text-sm font-bold text-slate-500">/{max}</span>
          </p>
          {sublabel ? <p className="mt-0.5 text-[11px] font-medium text-slate-400">{sublabel}</p> : null}
        </div>
      </div>
    </div>
  );
}
