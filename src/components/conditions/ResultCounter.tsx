"use client";

import { useEffect, useRef, useState } from "react";

import { formatConditionsCountLabel } from "@/lib/conditions";

type ResultCounterProps = {
  count: number;
  percentage: number;
};

function getToneColor(percentage: number) {
  if (percentage < 0.2) {
    return "var(--accent)";
  }

  if (percentage < 1) {
    return "#F97316";
  }

  return "var(--data-bar-strong)";
}

export function ResultCounter({ count, percentage }: ResultCounterProps) {
  const previousRef = useRef(count);
  const [display, setDisplay] = useState(count);
  const toneColor = getToneColor(percentage);
  const displayLabel = formatConditionsCountLabel(display);

  useEffect(() => {
    const startValue = previousRef.current;
    const startAt = performance.now();
    const duration = 520;
    let frameId = 0;

    const animate = (now: number) => {
      const progress = Math.min((now - startAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(startValue + (count - startValue) * eased));

      if (progress < 1) {
        frameId = window.requestAnimationFrame(animate);
      } else {
        previousRef.current = count;
      }
    };

    frameId = window.requestAnimationFrame(animate);

    return () => window.cancelAnimationFrame(frameId);
  }, [count]);

  return (
    <div className="sticky top-0 z-40 py-1 sm:py-2" data-testid="conditions-live-count">
      <div
        className="rounded-[1rem] border border-[color:var(--line)] bg-[rgba(248,247,244,0.96)] px-5 py-4 backdrop-blur-xl sm:px-6 sm:py-5"
      >
        <div className="text-center">
          <p className="text-xs font-bold tracking-[0.18em] text-[var(--text-sub)]">LIVE COUNT</p>
          <p className="mt-2 text-sm font-bold text-[var(--text-main)] sm:text-base">あなたの条件に当てはまるのは</p>
          <p className="font-numeric mt-4 text-4xl font-black leading-none text-[var(--text-main)] sm:text-5xl">
            <span style={{ color: toneColor }}>{displayLabel}</span>
          </p>
          <p className="mt-3 text-sm font-bold text-[var(--text-sub)] sm:text-base">未婚者全体の {percentage.toFixed(2)}%</p>
        </div>
      </div>
    </div>
  );
}
