"use client";

import { AGE_MAX, AGE_MIN } from "@/data/conditions";

type AgeRangeSliderProps = {
  min: number;
  max: number;
  onChange: (next: { min: number; max: number }) => void;
};

export function AgeRangeSlider({ min, max, onChange }: AgeRangeSliderProps) {
  const range = AGE_MAX - AGE_MIN;
  const start = ((min - AGE_MIN) / range) * 100;
  const end = ((max - AGE_MIN) / range) * 100;

  return (
    <div className="rounded-[1.5rem] border border-[rgba(26,26,26,0.08)] bg-white/88 p-4 sm:p-5">
      <div className="flex items-center justify-between text-sm font-bold text-[var(--text-sub)]">
        <span>{AGE_MIN}歳</span>
        <span>{AGE_MAX}歳</span>
      </div>

      <div className="relative mt-4 h-10">
        <div className="absolute left-0 top-1/2 h-2 w-full -translate-y-1/2 rounded-full bg-[#E5E7EB]" />
        <div
          className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-[var(--data-bar)]"
          style={{
            left: `${start}%`,
            right: `${100 - end}%`,
          }}
        />
        <input
          type="range"
          min={AGE_MIN}
          max={AGE_MAX}
          value={min}
          onChange={(event) => onChange({ min: Math.min(Number(event.target.value), max), max })}
          className="range-thumb-only absolute inset-0 z-[2]"
          aria-label="年齢の下限"
        />
        <input
          type="range"
          min={AGE_MIN}
          max={AGE_MAX}
          value={max}
          onChange={(event) => onChange({ min, max: Math.max(Number(event.target.value), min) })}
          className="range-thumb-only absolute inset-0 z-[3]"
          aria-label="年齢の上限"
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="tag rounded-full px-4 py-2 text-sm font-bold text-[var(--data-bar-strong)]">
          {min}〜{max}歳
        </p>
        <p className="text-right text-xs leading-6 text-[var(--text-sub)] sm:text-sm">
          18〜60歳の範囲で指定します。
        </p>
      </div>
    </div>
  );
}
