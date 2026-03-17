"use client";

import { useAnimatedNumber } from "@/lib/use-animated-number";

type StickyProgressBarProps = {
  selected: number;
  total: number;
  estimatedCount: number;
  percentage: number;
  onComplete: () => void;
};

function getCountStyle(count: number) {
  if (count >= 1_000_000) {
    return "text-sm font-bold";
  }

  if (count >= 100_000) {
    return "text-base font-black";
  }

  if (count >= 10_000) {
    return "text-lg font-black";
  }

  return "text-xl font-black";
}

export function StickyProgressBar({
  selected,
  total,
  estimatedCount,
  percentage,
  onComplete,
}: StickyProgressBarProps) {
  const isComplete = selected >= total;
  const animatedCount = useAnimatedNumber(estimatedCount);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-black text-[var(--text-main)] sm:text-[15px]">
          {selected} / {total}
          {isComplete ? " ✓" : " 選択中"}
        </p>
        <p className={`font-numeric text-[var(--accent)] ${getCountStyle(estimatedCount)}`}>
          {animatedCount.toLocaleString()}人
        </p>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[rgba(26,26,26,0.08)]">
        <div
          className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-300"
          style={{ width: `${Math.min(100, (selected / total) * 100)}%` }}
        />
      </div>

      <p className="sr-only">未婚者全体の {percentage.toFixed(4)}%</p>

      {isComplete ? (
        <button type="button" onClick={onComplete} className="btn-primary animate-slide-up mt-3 w-full rounded-[1rem] text-sm">
          画像を作る →
        </button>
      ) : null}
    </div>
  );
}
