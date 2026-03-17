"use client";

import { useEffect, useState } from "react";

const phases = [
  "プロフを読み込んでいます",
  "第一印象を分析中",
  "ツッコミ余地を検出中",
  "あなたに刺さる異性を特定中",
  "偏差値を算出しています",
];

export function ProfAnalyzingScreen() {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [previewScore, setPreviewScore] = useState(47);
  const [showSlowMessage, setShowSlowMessage] = useState(false);

  useEffect(() => {
    const phaseTimer = window.setInterval(() => {
      setPhaseIndex((current) => (current < phases.length - 1 ? current + 1 : current));
    }, 1100);

    const scoreTimer = window.setInterval(() => {
      setPreviewScore(38 + Math.floor(Math.random() * 35));
    }, 120);

    const slowTimer = window.setTimeout(() => {
      setShowSlowMessage(true);
    }, 10000);

    return () => {
      window.clearInterval(phaseTimer);
      window.clearInterval(scoreTimer);
      window.clearTimeout(slowTimer);
    };
  }, []);

  const progress = ((phaseIndex + 1) / phases.length) * 100;

  return (
    <section data-testid="prof-analyzing" className="screen-shell mx-auto max-w-4xl px-4 pb-16 pt-12 sm:px-6 sm:pt-16">
      <div className="paper-card rounded-[2rem] border border-[color:var(--line)] bg-[var(--card)] px-6 py-12 text-center shadow-[0_28px_70px_rgba(26,26,26,0.08)] sm:px-8 sm:py-16">
        <div className="rounded-[1.8rem] border border-[rgba(26,26,26,0.08)] bg-white/88 px-5 py-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
          <p className="text-[0.72rem] font-bold tracking-[0.24em] text-[var(--text-sub)]">偏差値を算出中</p>
          <p className="font-numeric mt-4 text-7xl font-black leading-none text-[var(--accent)] sm:text-[5.5rem]">
            {previewScore}
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-xl">
          <div className="h-2 overflow-hidden rounded-full bg-[rgba(26,26,26,0.08)]">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#E8453C,#F97316)] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <p className="mt-8 text-sm font-bold tracking-[0.24em] text-[var(--accent)]">ANALYZING</p>
        <h2 className="mt-4 text-3xl font-black text-[var(--text-main)] sm:text-4xl">{phases[phaseIndex]}</h2>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[var(--text-sub)] sm:text-base">
          5つの観点でスコア化して、ダメな箇所と改善案までまとめています。
        </p>
        {showSlowMessage ? (
          <p className="mt-4 text-sm font-bold text-[var(--accent)]">丁寧に読んでいます。もう少しだけ…</p>
        ) : null}
      </div>
    </section>
  );
}
