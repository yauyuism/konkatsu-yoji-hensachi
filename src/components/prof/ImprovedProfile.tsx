"use client";

import { useState } from "react";

import type { AnalysisResult } from "@/lib/prof";

type ImprovedProfileProps = {
  result: AnalysisResult;
};

export function ImprovedProfile({ result }: ImprovedProfileProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result.improvedProfile.text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section className="rounded-[1.8rem] border border-[rgba(16,185,129,0.16)] bg-white/90 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-[0.18em] text-[#10B981]">AI REWRITE</p>
          <h3 className="mt-2 text-2xl font-black text-[var(--text-main)]">AIが書き直したプロフ</h3>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="secondary-button rounded-[1.1rem] px-4 py-3 text-sm font-bold text-[var(--text-main)]"
        >
          {copied ? "コピーしました" : "改善プロフをコピー"}
        </button>
      </div>

      <div className="mt-5 rounded-[1.4rem] border border-[rgba(16,185,129,0.16)] bg-[rgba(16,185,129,0.05)] p-4">
        <p className="whitespace-pre-wrap text-sm leading-8 text-[var(--text-main)] sm:text-base">
          {result.improvedProfile.text}
        </p>
      </div>
    </section>
  );
}
