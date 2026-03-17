"use client";

import { forwardRef } from "react";

import { rarityLabels, type Result } from "@/data/results";
import { SealStamp } from "@/components/SealStamp";

type ResultCardProps = {
  result: Result;
  animateCharacters?: boolean;
};

export const ResultCard = forwardRef<HTMLDivElement, ResultCardProps>(function ResultCard(
  { result, animateCharacters = true },
  ref
) {
  return (
    <article
      ref={ref}
      className="paper-card relative overflow-hidden rounded-[2rem] border border-[color:var(--line)] bg-[var(--card)] p-5 shadow-[0_28px_70px_rgba(26,26,26,0.1)] sm:p-7"
    >
      <div className="absolute inset-0 opacity-[0.03] [background-image:radial-gradient(circle_at_25%_20%,#1A1A1A_0,transparent_28%),radial-gradient(circle_at_75%_35%,#1A1A1A_0,transparent_24%),repeating-linear-gradient(0deg,#1A1A1A_0_1px,transparent_1px_7px)]" />

      <div className="relative">
        <p className="text-center text-[0.74rem] font-medium tracking-[0.18em] text-[var(--text-sub)] sm:text-xs">
          あなたの婚活を四字熟語で表すと
        </p>

        <div className="mt-4 flex justify-center">
          <span className="rare-badge inline-flex rounded-full px-4 py-2 text-xs font-bold tracking-[0.2em] text-[var(--accent)]">
            ✦ {rarityLabels[result.rarity]} ✦
          </span>
        </div>

        <div className="result-frame mt-5 rounded-[1.75rem] border border-[color:rgba(26,26,26,0.08)] bg-white/80 px-4 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] sm:px-8 sm:py-8">
          <div className="mx-auto grid max-w-[17rem] grid-cols-2 gap-3 sm:max-w-[19rem] sm:gap-4">
            {Array.from(result.yoji).map((character, index) => (
              <span
                key={`${character}-${index}`}
                className={`yoji-character flex aspect-square items-center justify-center rounded-[1.4rem] border border-[color:rgba(26,26,26,0.08)] bg-[var(--paper)] text-[3.1rem] font-black text-[var(--text-main)] shadow-[0_10px_24px_rgba(26,26,26,0.06)] sm:text-[4.2rem] ${
                  animateCharacters ? "animate-yoji-reveal" : ""
                }`}
                style={animateCharacters ? { animationDelay: `${index * 0.18}s` } : undefined}
              >
                {character}
              </span>
            ))}
          </div>
        </div>

        <p className="mt-5 text-center text-sm font-medium tracking-[0.2em] text-[var(--text-sub)] sm:text-base">
          {result.reading}
        </p>

        <div className="mx-auto mt-5 h-px w-full max-w-[28rem] bg-[linear-gradient(90deg,transparent,rgba(26,26,26,0.16),transparent)]" />

        <div className="mx-auto mt-5 max-w-[30rem] text-center text-sm leading-7 text-[var(--text-main)] sm:text-base">
          <p>{result.meaning}</p>
        </div>

        <section className="mt-6 rounded-[1.6rem] border border-[color:rgba(249,115,22,0.18)] bg-[var(--accent-subtle)] px-5 py-4">
          <p className="text-sm font-bold tracking-[0.16em] text-[var(--accent)]">一言</p>
          <p className="mt-2 text-sm leading-7 text-[var(--text-main)] sm:text-base">{result.advice}</p>
        </section>

        <div className="mt-6 flex items-end justify-between gap-3">
          <div className="text-sm font-medium text-[var(--text-sub)]">@yauyuism</div>
          <SealStamp />
        </div>
      </div>
    </article>
  );
});
