"use client";

import { useState } from "react";

import { getProfNickname, type DetailAnalysisResult, type ScoreSet } from "@/lib/prof";

type BeforeAfterProps = {
  originalProfile: string;
  result: {
    scores: ScoreSet;
    improvedProfile: DetailAnalysisResult["improvedProfile"];
  };
  onShareX: () => void;
  beforeNickname?: string;
};

export function BeforeAfter({ originalProfile, result, onShareX, beforeNickname }: BeforeAfterProps) {
  const before = result.scores.total;
  const after = result.improvedProfile.estimatedScores.total;
  const delta = after - before;
  const deltaLabel = delta >= 0 ? `+${delta}` : `${delta}`;
  const fixedBeforeNickname = beforeNickname ?? getProfNickname(result.scores);
  const afterNickname = getProfNickname(result.improvedProfile.estimatedScores);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result.improvedProfile.text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section data-testid="before-after" className="mx-auto w-full max-w-[640px]">
      <div className="soft-panel rounded-[1.8rem] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-[var(--accent)]">BEFORE / AFTER</p>
            <h3 className="mt-2 text-2xl font-black text-[var(--text-main)]">ビフォーアフター</h3>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="secondary-button rounded-[1.05rem] px-4 py-3 text-sm font-bold text-[var(--text-main)]"
          >
            {copied ? "コピーしました" : "改善プロフをコピー"}
          </button>
        </div>

        <div className="mt-5 grid gap-4">
          <div className="rounded-[1.6rem] border border-[rgba(16,185,129,0.18)] bg-[linear-gradient(135deg,rgba(16,185,129,0.12),rgba(16,185,129,0.05))] px-5 py-6 text-center sm:px-6">
            <p className="text-xs font-bold tracking-[0.18em] text-[#10B981]">この差分がいちばんシェアしどころ</p>
            <p data-testid="before-after-delta" className="mt-3 text-5xl font-black leading-none text-[#10B981] sm:text-6xl">{deltaLabel} UP</p>
            <p className="mt-3 text-sm font-bold tracking-[0.08em] text-[var(--text-main)]">
              偏差値 {before} → {after}
            </p>
            <p className="mt-3 text-sm leading-7 text-[var(--text-sub)]">
              {`通り名が「${fixedBeforeNickname}」から「${afterNickname}」へ。`}
            </p>
            <button
              type="button"
              onClick={onShareX}
              className="btn-primary mt-5 rounded-[1.15rem] bg-[#10B981] px-5 py-4 text-sm font-black text-white hover:bg-[#0ea371]"
            >
              この伸び幅をXでシェアする
            </button>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[1.4rem] bg-[rgba(107,114,128,0.08)] p-4">
              <p className="text-xs font-bold tracking-[0.16em] text-[var(--text-sub)]">BEFORE 偏差値 {before}</p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-8 text-[var(--text-main)]">{originalProfile}</p>
            </div>

            <div className="rounded-[1.4rem] border border-[rgba(16,185,129,0.16)] bg-[rgba(16,185,129,0.08)] p-4">
              <p className="text-xs font-bold tracking-[0.16em] text-[#10B981]">AFTER 偏差値 {after}</p>
              <p className="mt-2 text-sm font-bold tracking-[0.12em] text-[var(--text-main)]">AIが書き直したプロフ</p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-8 text-[var(--text-main)]">
                {result.improvedProfile.text}
              </p>

              <div className="mt-5 border-t border-[rgba(16,185,129,0.18)] pt-4">
                <p className="text-sm font-bold tracking-[0.16em] text-[var(--text-main)]">変更ポイント</p>
                <ul className="mt-3 grid gap-2 text-sm leading-7 text-[var(--text-sub)]">
                  {result.improvedProfile.changes.map((change) => (
                    <li key={change}>・{change}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
