"use client";

import { useCountUp } from "@/lib/use-count-up";

type HensachiAnalyzingScreenProps = {
  phaseText: string;
  targetTotal: number;
};

export function HensachiAnalyzingScreen({ phaseText, targetTotal }: HensachiAnalyzingScreenProps) {
  const previewTotal = useCountUp(targetTotal, 3200);

  return (
    <section className="screen-shell mx-auto max-w-4xl px-4 pb-16 pt-12 sm:px-6 sm:pt-16">
      <div className="mx-auto max-w-2xl">
        <div className="paper-card rounded-[2.2rem] border border-[color:var(--line)] bg-[var(--card)] px-6 py-12 text-center shadow-[0_28px_70px_rgba(26,26,26,0.08)] sm:px-8 sm:py-16">
          <div className="rounded-[1.8rem] border border-[rgba(26,26,26,0.08)] bg-white/88 px-5 py-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
            <p className="text-[0.72rem] font-bold tracking-[0.24em] text-[var(--text-sub)]">偏差値を先読み中</p>
            <p className="font-numeric mt-4 text-7xl font-black leading-none text-[var(--accent)] sm:text-[5.5rem]">
              {previewTotal}
            </p>
          </div>

          <p className="mt-8 text-sm font-bold tracking-[0.24em] text-[var(--accent)]">ANALYZING</p>
          <h2 className="mt-4 text-3xl font-black text-[var(--text-main)] sm:text-4xl">{phaseText}</h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[var(--text-sub)] sm:text-base">
            回答パターンを整理して、5つの科目から総合偏差値を組み立てています。
          </p>
        </div>
      </div>
    </section>
  );
}
