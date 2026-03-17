"use client";

import { useRef, useSyncExternalStore } from "react";

import { CreatorFollowPanel } from "@/components/CreatorFollowPanel";
import type { Result } from "@/data/results";
import { CrossPromotion } from "@/components/CrossPromotion";
import { ResultCard } from "@/components/ResultCard";
import { ShareButtons } from "@/components/ShareButtons";

type ResultScreenProps = {
  result: Result;
  resultUrl: string;
  onRestart?: () => void;
  restartHref?: string;
};

export function ResultScreen({ result, resultUrl, onRestart, restartHref }: ResultScreenProps) {
  const captureRef = useRef<HTMLDivElement>(null);
  const origin = useSyncExternalStore(
    () => () => undefined,
    () => window.location.origin,
    () => {
      try {
        return new URL(resultUrl).origin;
      } catch {
        return "";
      }
    }
  );
  const resolvedResultUrl = origin ? `${origin}/result/${result.type}` : resultUrl;

  return (
    <section className="screen-shell mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
      <div className="mx-auto max-w-4xl">
        <p className="eyebrow mx-auto w-fit rounded-full px-4 py-2 text-[0.72rem] font-bold tracking-[0.22em] text-[var(--accent)]">
          RESULT
        </p>

        <h1 className="mt-4 text-center text-3xl font-black leading-tight text-[var(--text-main)] sm:text-5xl">
          あなたの婚活を、
          <span className="block text-[var(--accent)]">四字熟語で言うとこう。</span>
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-7 text-[var(--text-sub)] sm:text-base">
          保存してストーリーズやXに投稿できます。シェア時のリンク先は結果専用ページです。
        </p>

        <div className="mt-8">
          <ResultCard ref={captureRef} result={result} />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="soft-panel rounded-[1.8rem] p-5 sm:p-6">
            <p className="text-sm font-bold tracking-[0.16em] text-[var(--text-main)]">シェア用URL</p>
            <p className="mt-3 break-all text-sm leading-7 text-[var(--text-sub)]">{resolvedResultUrl}</p>
            <p className="mt-4 text-sm leading-7 text-[var(--text-sub)]">
              OGP画像には「{result.yoji}」が表示されます。XとLINEのプレビューでも結果が伝わります。
            </p>
          </div>

          <div className="soft-panel rounded-[1.8rem] p-5 sm:p-6">
            <ShareButtons
              result={result}
              resultUrl={resolvedResultUrl}
              captureRef={captureRef}
              onRestart={onRestart}
              restartHref={restartHref}
            />
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <CreatorFollowPanel
            context="yoji_result"
            quizName="konkatsu_yoji"
            title="言語化の続き"
            description="四字熟語で刺さった人向けに、Xでは短く、noteでは深く、婚活の解像度を上げる発信を続けています。"
          />

          <div className="soft-panel rounded-[1.8rem] p-5 sm:p-6">
            <p className="text-sm font-bold tracking-[0.16em] text-[var(--text-main)]">投稿ひとこと</p>
            <p className="mt-3 text-sm leading-7 text-[var(--text-sub)]">
              「私は{result.yoji}だった」で終わらせず、感想を1行添えるとSNSで反応が取りやすくなります。
            </p>
          </div>
        </div>

        <div className="mt-6">
          <CrossPromotion toolId="hensachi" eyebrow="SERIES" ctaLabel="数値化もしてみる →" />
        </div>
      </div>
    </section>
  );
}
