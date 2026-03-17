"use client";

import { useCountUp } from "@/lib/use-count-up";

type HensachiDisplayProps = {
  total: number;
  title: string;
  color: string;
  nickname?: string;
};

export function HensachiDisplay({ total, title, color, nickname }: HensachiDisplayProps) {
  const animated = useCountUp(total, 1600);

  return (
    <div className="rounded-[1.6rem] border border-[color:var(--line)] bg-white px-5 py-8 text-center sm:px-8 sm:py-10">
      <p className="text-xs font-bold tracking-[0.18em] text-[var(--text-sub)]">偏差値</p>
      <p className="number-display mt-4 text-[5.5rem] font-black leading-none sm:text-[7.5rem]" style={{ color }}>
        {animated}
      </p>
      <p className="mt-4 text-2xl font-bold text-[var(--text-main)] sm:text-[24px]">{title}</p>
      {nickname ? (
        <p className="mt-3 text-sm text-[var(--text-sub)]">{`通り名: ${nickname}`}</p>
      ) : null}
    </div>
  );
}
