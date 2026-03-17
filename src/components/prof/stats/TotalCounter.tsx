"use client";

import { useCountUp } from "@/lib/use-count-up";

type TotalCounterProps = {
  count: number;
};

export function TotalCounter({ count }: TotalCounterProps) {
  const animated = useCountUp(count, 1400);

  return (
    <div className="rounded-[1.8rem] border border-[color:rgba(26,26,26,0.08)] bg-white/88 p-5 text-center sm:p-6">
      <p className="text-sm font-bold tracking-[0.16em] text-[var(--text-main)]">累計診断数</p>
      <p className="font-numeric mt-3 text-5xl font-black text-[var(--accent)] sm:text-6xl">
        {animated.toLocaleString()}
      </p>
      <p className="mt-2 text-sm text-[var(--text-sub)]">匿名化された診断結果のみを集計しています</p>
    </div>
  );
}
