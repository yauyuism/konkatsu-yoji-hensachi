"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { CrossPromotion } from "@/components/CrossPromotion";
import { MethodologyDisclosure } from "@/components/weight/MethodologyDisclosure";
import { ShareImage } from "@/components/weight/ShareImage";
import { SituationComparisonCard } from "@/components/weight/SituationComparisonCard";
import { WeightBreakdown } from "@/components/weight/WeightBreakdown";
import { WeightDisplay } from "@/components/weight/WeightDisplay";
import { trackEvent } from "@/lib/analytics";
import { downloadResultImage } from "@/lib/result-image";
import type { Situation } from "@/data/weight";
import type { WeightReplyExample, WeightResult, WeightSourceMeta } from "@/lib/weight-types";

type WeightResultScreenProps = {
  situation: Situation;
  result: WeightResult;
  messageCount: number;
  sourceMeta: WeightSourceMeta;
  analysisComment?: string | null;
  analysisExplanation?: string | null;
  analysisImprovement?: string | null;
  analysisExample?: WeightReplyExample | null;
  comment: string;
  xShareUrl: string;
  lineShareUrl: string;
  onRestart?: () => void;
  restartHref?: string;
};

function buildInputSummary(sourceMeta: WeightSourceMeta) {
  const totalMessages = sourceMeta.myMessageCount + sourceMeta.theirMessageCount;

  if (sourceMeta.inputMode === "images") {
    return `スクショ${sourceMeta.imageCount}枚から ${totalMessages}通のメッセージを読み取りました（あなた: ${sourceMeta.myMessageCount}通 / 相手: ${sourceMeta.theirMessageCount}通）`;
  }

  return `テキストから ${totalMessages}通のメッセージを読み取りました（あなた: ${sourceMeta.myMessageCount}通 / 相手: ${sourceMeta.theirMessageCount}通）`;
}

function buildConfidenceNote(sourceMeta: WeightSourceMeta) {
  if (sourceMeta.confidence === "medium") {
    return "読み取り精度は中程度です。結果がズレていそうなら、スクショを増やすかテキストで貼り直してください。";
  }

  if (sourceMeta.confidence === "low") {
    return "読み取り精度は低めです。参考値として見つつ、気になるなら別の入力で測り直してください。";
  }

  return null;
}

export function WeightResultScreen({
  situation,
  result,
  messageCount,
  sourceMeta,
  analysisComment,
  analysisExplanation,
  analysisImprovement,
  analysisExample,
  comment,
  xShareUrl,
  lineShareUrl,
  onRestart,
  restartHref = "/weight",
}: WeightResultScreenProps) {
  const captureRef = useRef<HTMLDivElement>(null);
  const hasTrackedViewRef = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const confidenceNote = buildConfidenceNote(sourceMeta);

  useEffect(() => {
    if (hasTrackedViewRef.current) {
      return;
    }

    hasTrackedViewRef.current = true;
    trackEvent("weight_result_view", {
      quiz_name: "message_weight",
      situation,
      total_weight: result.totalWeight,
      partner_weight: result.partnerWeight,
      weight_diff: result.weightDiff,
      message_count: messageCount,
      top_factor: result.topFactor.key,
      input_mode: sourceMeta.inputMode,
      confidence: sourceMeta.confidence,
      image_count: sourceMeta.imageCount,
    });
  }, [
    messageCount,
    result.partnerWeight,
    result.topFactor.key,
    result.totalWeight,
    result.weightDiff,
    situation,
    sourceMeta.confidence,
    sourceMeta.imageCount,
    sourceMeta.inputMode,
  ]);

  const handleShareClick = (platform: "x" | "line") => {
    trackEvent("weight_share_click", {
      quiz_name: "message_weight",
      platform,
      situation,
      total_weight: result.totalWeight,
      input_mode: sourceMeta.inputMode,
    });
  };

  const handleSaveImage = async () => {
    if (!captureRef.current || isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      trackEvent("weight_save_image_click", {
        quiz_name: "message_weight",
        situation,
        total_weight: result.totalWeight,
      });
      await downloadResultImage(captureRef.current, `message-weight-${result.totalWeight.toFixed(1)}.png`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="screen-shell mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pt-10">
      <div className="mx-auto max-w-5xl">
        <section>
          <p className="text-sm font-bold tracking-[0.22em] text-[var(--text-sub)]">結果</p>
          <div className="mt-3">
            <WeightDisplay situation={situation} totalWeight={result.totalWeight} judgment={result.judgment} />
          </div>
          <div className="soft-panel mt-4 rounded-[1.8rem] p-5 sm:p-6">
            <div className="grid gap-3 sm:grid-cols-3">
              <a
                href={xShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleShareClick("x")}
                className="cta-button inline-flex items-center justify-center rounded-[1.2rem] px-5 py-4 text-sm font-black text-white"
              >
                Xでシェア
              </a>
              <a
                href={lineShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleShareClick("line")}
                className="secondary-button inline-flex items-center justify-center rounded-[1.2rem] px-5 py-4 text-sm font-black text-[var(--text-main)]"
              >
                LINEで送る
              </a>
              <button
                type="button"
                onClick={handleSaveImage}
                disabled={isSaving}
                className="soft-button inline-flex items-center justify-center rounded-[1.2rem] px-5 py-4 text-sm font-black text-[var(--text-main)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "画像を保存中..." : "画像を保存"}
              </button>
            </div>

            <p className="mt-4 text-sm leading-7 text-[var(--text-main)]">{buildInputSummary(sourceMeta)}</p>
            {confidenceNote ? (
              <p className="mt-3 rounded-[1.1rem] bg-[rgba(245,158,11,0.1)] px-4 py-4 text-sm leading-7 text-[#B45309]">{confidenceNote}</p>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-[var(--text-sub)]">
              <p>共有URLには重量結果だけを含めています。元の会話テキストやスクショは保存も共有もしません。</p>
              {onRestart ? (
                <button
                  type="button"
                  onClick={onRestart}
                  className="font-bold underline decoration-[rgba(26,26,26,0.3)] underline-offset-4 transition hover:text-[var(--accent)]"
                >
                  別のやりとりで測り直す
                </button>
              ) : (
                <Link
                  href={restartHref}
                  className="font-bold underline decoration-[rgba(26,26,26,0.3)] underline-offset-4 transition hover:text-[var(--accent)]"
                >
                  別のやりとりで測り直す
                </Link>
              )}
            </div>
          </div>
        </section>

        <section className="mt-8">
          <p className="text-sm font-bold tracking-[0.22em] text-[var(--text-sub)]">原因</p>
          <div className="mt-3">
            <WeightBreakdown
              result={result}
              analysisExplanation={analysisExplanation}
              analysisImprovement={analysisImprovement}
              analysisExample={analysisExample}
              analysisComment={analysisComment}
            />
          </div>
        </section>

        <section className="mt-8">
          <p className="text-sm font-bold tracking-[0.22em] text-[var(--text-sub)]">次にどうする</p>
          <div className="mt-3 rounded-[1.8rem] border border-[rgba(232,69,60,0.14)] bg-[var(--accent-soft)] p-5 sm:p-6">
            <p className="text-sm font-bold tracking-[0.16em] text-[var(--accent)]">やうゆの一言</p>
            <p className="mt-4 text-sm leading-8 text-[var(--text-main)]">{comment}</p>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <CrossPromotion
              href="/prof"
              eyebrow="NEXT"
              title="プロフィール偏差値を測る"
              description="会話の前にどこで止まっているかを見たいなら、次はプロフィール文を貼る診断がつながります。"
            />
            <CrossPromotion
              href="/conditions"
              eyebrow="NEXT"
              title="条件チェッカーで需給を見る"
              description="気持ちの重さではなく、相手の母数を数字で見たいときは条件チェッカーが向いています。"
            />
          </div>

          <div className="mt-4 grid gap-4">
            <MethodologyDisclosure />
            <SituationComparisonCard comparisons={result.situationComparisons} />
          </div>
        </section>
      </div>

      <div className="pointer-events-none fixed left-[-200vw] top-0">
        <ShareImage ref={captureRef} situation={situation} result={result} sourceMeta={sourceMeta} />
      </div>
    </section>
  );
}
