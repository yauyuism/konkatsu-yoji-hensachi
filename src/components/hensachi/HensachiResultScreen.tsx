"use client";

import { useEffect, useRef } from "react";

import { CreatorFollowPanel } from "@/components/CreatorFollowPanel";
import { CrossPromotion } from "@/components/CrossPromotion";
import { HensachiResultCard } from "@/components/hensachi/HensachiResultCard";
import { HensachiShareButtons } from "@/components/hensachi/HensachiShareButtons";
import { trackEvent } from "@/lib/analytics";
import type { HensachiDiagnosisResult } from "@/lib/hensachi";

type HensachiResultScreenProps = {
  result: HensachiDiagnosisResult;
  resultUrl: string;
  onRestart?: () => void;
  restartHref?: string;
};

export function HensachiResultScreen({
  result,
  resultUrl,
  onRestart,
  restartHref = "/hensachi",
}: HensachiResultScreenProps) {
  const captureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    trackEvent("hensachi_result_view", {
      quiz_name: "app_hensachi",
      result_title: result.title,
      total_hensachi: result.totalHensachi,
    });
  }, [result.title, result.totalHensachi]);

  return (
    <section className="screen-shell mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
      <div className="mx-auto max-w-4xl">
        <p className="eyebrow mx-auto w-fit rounded-full px-4 py-2 text-[0.72rem] font-bold tracking-[0.22em] text-[var(--accent)]">
          RESULT
        </p>

        <h1 className="mt-4 text-center text-3xl font-black leading-tight text-[var(--text-main)] sm:text-5xl">
          あなたのアプリ偏差値を、
          <span className="block text-[var(--accent)]">数字で可視化しました。</span>
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-7 text-[var(--text-sub)] sm:text-base">
          偏差値、通り名、5科目のバランスをまとめて見返せます。保存してXやLINEにもそのまま共有できます。
        </p>

        <div ref={captureRef} className="mt-8">
          <HensachiResultCard result={result} />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="soft-panel rounded-[1.8rem] p-5 sm:p-6">
            <p className="text-sm font-bold tracking-[0.16em] text-[var(--text-main)]">見どころ</p>
            <p className="mt-3 text-sm leading-7 text-[var(--text-sub)] sm:text-base">
              いちばん高い科目と低い科目の差を見ると、どこが武器でどこが詰まりやすいかが分かります。
              まずは総合偏差値、そのあと科目別成績の順で見るのがいちばん掴みやすいです。
            </p>
          </div>

          <div className="soft-panel rounded-[1.8rem] p-5 sm:p-6">
            <HensachiShareButtons
              result={result}
              resultUrl={resultUrl}
              captureRef={captureRef}
              onRestart={onRestart}
              restartHref={restartHref}
            />
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <CreatorFollowPanel
            context="hensachi_result"
            quizName="app_hensachi"
            title="改善ヒントを追うならここ"
            description="偏差値を上げる動き方や、プロフィール・写真・会話の詰まりどころは X と note で継続して整理しています。"
          />

          <CrossPromotion
            toolId="prof"
            eyebrow="NEXT"
            title="プロフィール偏差値も見る"
            description="偏差値の原因を入口から詰めるなら、次はプロフィール文を貼る診断がつながります。"
            ctaLabel="詳しく見る →"
          />
        </div>
      </div>
    </section>
  );
}
