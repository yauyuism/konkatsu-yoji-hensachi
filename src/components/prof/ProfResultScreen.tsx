"use client";

import { useEffect, useRef, useState } from "react";

import { CreatorFollowPanel } from "@/components/CreatorFollowPanel";
import { AxisBarChart } from "@/components/prof/AxisBarChart";
import { BeforeAfter } from "@/components/prof/BeforeAfter";
import { HensachiDisplay } from "@/components/prof/HensachiDisplay";
import { HighlightedProfile } from "@/components/prof/HighlightedProfile";
import { NormalDistributionChart } from "@/components/prof/NormalDistributionChart";
import { RadarChart } from "@/components/prof/RadarChart";
import { ShareImage } from "@/components/prof/ShareImage";
import { TargetAudience } from "@/components/prof/TargetAudience";
import { trackEvent } from "@/lib/analytics";
import { useMarkCompletedTool } from "@/lib/completed-tools";
import { downloadResultImage } from "@/lib/result-image";
import {
  buildHighlightedText,
  getProfShareAppLabel,
  getProfTitleMeta,
  isAnalysisResult,
  type AnalyzeRequest,
  type PartialAnalysisResult,
} from "@/lib/prof";
import { getProfLineShareUrl, getProfResultUrl, getProfXShareUrl } from "@/lib/prof-share";

type DetailStatus = "idle" | "loading" | "error" | "done";

type ProfResultScreenProps = {
  result: PartialAnalysisResult;
  originalProfile: string;
  selectedApps: AnalyzeRequest["apps"];
  detailStatus: DetailStatus;
  onRetryDetails: () => void;
  onRestart: () => void;
};

function LoadingBlock({
  title,
  description,
  status,
  onRetry,
}: {
  title: string;
  description: string;
  status: DetailStatus;
  onRetry: () => void;
}) {
  return (
    <section className="rounded-[1.8rem] border border-[color:var(--line)] bg-white/86 p-5 sm:p-6">
      <p className="text-sm font-bold tracking-[0.16em] text-[var(--text-main)]">{title}</p>
      <p className="mt-3 text-sm leading-7 text-[var(--text-sub)]">{description}</p>

      {status === "loading" ? (
        <div className="mt-5 grid gap-3">
          <div className="h-5 w-2/3 animate-pulse rounded-full bg-[rgba(26,26,26,0.08)]" />
          <div className="h-24 animate-pulse rounded-[1.2rem] bg-[rgba(26,26,26,0.06)]" />
          <div className="h-24 animate-pulse rounded-[1.2rem] bg-[rgba(26,26,26,0.06)]" />
        </div>
      ) : (
        <div className="mt-5 rounded-[1.2rem] border border-[rgba(232,69,60,0.14)] bg-[var(--accent-soft)] px-4 py-4">
          <p className="text-sm font-bold text-[var(--accent)]">詳細の取得に失敗しました</p>
          <button
            type="button"
            onClick={onRetry}
            className="secondary-button mt-3 rounded-[1rem] px-4 py-3 text-sm font-bold text-[var(--text-main)]"
          >
            もう一度読み込む
          </button>
        </div>
      )}
    </section>
  );
}

export function ProfResultScreen({
  result,
  originalProfile,
  selectedApps,
  detailStatus,
  onRetryDetails,
  onRestart,
}: ProfResultScreenProps) {
  const captureRef = useRef<HTMLDivElement>(null);
  const improvedRef = useRef<HTMLDivElement>(null);
  const hasTrackedViewRef = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const detailedResult = isAnalysisResult(result) ? result : null;
  const titleMeta = getProfTitleMeta(result.scores.total);
  const improvedTotal = detailedResult?.improvedProfile.estimatedScores.total ?? null;
  const resultUrl = getProfResultUrl(result.scores, improvedTotal, result.nickname);
  const segments = buildHighlightedText(originalProfile, result.highlights);
  const diff = improvedTotal === null ? null : improvedTotal - result.scores.total;
  const isDetailsReady = Boolean(detailedResult);
  const shareAppLabel = getProfShareAppLabel(selectedApps);

  useMarkCompletedTool("prof");

  useEffect(() => {
    if (hasTrackedViewRef.current) {
      return;
    }

    hasTrackedViewRef.current = true;
    trackEvent("result_view", {
      quiz_name: "prof_hensachi",
      result_title: result.title,
      total_hensachi: result.scores.total,
      first_impression: result.scores.firstImpression,
      specificity: result.scores.specificity,
      sincerity: result.scores.sincerity,
      hookability: result.scores.hookability,
      safety: result.scores.safety,
    });
  }, [result]);

  const handleShare = (platform: "x" | "line", mode: "result" | "beforeAfter" = "result") => {
    const shareUrl = platform === "x"
      ? getProfXShareUrl(result, resultUrl, mode)
      : getProfLineShareUrl(result, resultUrl, mode);

    trackEvent("share_click", {
      quiz_name: "prof_hensachi",
      platform,
      mode,
      total_hensachi: result.scores.total,
    });
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  const handleSaveImage = async () => {
    if (!captureRef.current || isSaving || !detailedResult) {
      return;
    }

    trackEvent("save_image_click", {
      quiz_name: "prof_hensachi",
      total_hensachi: result.scores.total,
      improved_total_hensachi: detailedResult.improvedProfile.estimatedScores.total,
      mode: "result",
    });
    setIsSaving(true);
    try {
      await downloadResultImage(
        captureRef.current,
        `profile-hensachi-${result.scores.total}-${detailedResult.improvedProfile.estimatedScores.total}.png`
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section data-testid="prof-result" className="screen-shell mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
      <div className="mx-auto max-w-5xl">
        <p className="eyebrow mx-auto w-fit rounded-full px-4 py-2 text-[0.72rem] font-bold tracking-[0.22em] text-[var(--accent)]">
          PROFILE RESULT
        </p>

        <h1 className="mt-4 text-center text-3xl font-black leading-tight text-[var(--text-main)] sm:text-5xl">
          あなたのプロフ、
          <span className="block text-[var(--accent)]">異性からこう見えてる。</span>
        </h1>

        <div className="mt-8 grid gap-4">
          <div className="paper-card rounded-[2rem] border border-[color:var(--line)] bg-[var(--card)] p-5 sm:p-7">
            <p className="text-center text-[0.74rem] font-medium tracking-[0.18em] text-[var(--text-sub)]">プロフィール偏差値</p>

            <div className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <HensachiDisplay total={result.scores.total} title={result.title} color={titleMeta.color} nickname={result.nickname} />
                <button
                  type="button"
                  onClick={() => handleShare("x")}
                  data-testid="prof-share-top-x"
                  className="cta-button mt-4 inline-flex w-full items-center justify-center rounded-[1.3rem] px-6 py-4 text-base font-black text-white"
                >
                  この偏差値をXでシェアする
                </button>
                <p className="mt-3 text-center text-xs font-bold tracking-[0.08em] text-[var(--text-sub)]">
                  シェアすると、友だちやフォロワーから客観的なツッコミをもらいやすい。
                </p>
              </div>

              <div className="rounded-[1.5rem] bg-[rgba(232,69,60,0.08)] px-4 py-4 sm:px-5 sm:py-5">
                <p className="text-xs font-bold tracking-[0.16em] text-[var(--accent)]">プロフィール偏差値の考察</p>
                <p className="mt-3 whitespace-pre-line text-sm leading-8 text-[var(--text-main)] sm:text-[15px]">{result.summary}</p>
                <p className="mt-4 rounded-[1rem] bg-white/75 px-4 py-3 text-sm leading-7 text-[var(--text-sub)]">{result.comment}</p>
              </div>
            </div>

            <div className="mt-5">
              <NormalDistributionChart score={result.scores.total} />
            </div>
          </div>

          <div className="paper-card rounded-[2rem] border border-[color:var(--line)] bg-[var(--card)] p-5 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold tracking-[0.16em] text-[var(--text-main)]">科目別スコア</p>
                <p className="mt-2 text-sm leading-7 text-[var(--text-sub)]">
                  歪みが出ている軸ほど、改善後の伸びしろが大きいです。
                </p>
              </div>
              <div className="rounded-full bg-[rgba(59,130,246,0.08)] px-4 py-2 text-xs font-bold tracking-[0.08em] text-[#3B82F6]">
                レーダーで全体像を見る
              </div>
            </div>

            <div className="mt-5 rounded-[1.8rem] border border-[rgba(59,130,246,0.12)] bg-[rgba(59,130,246,0.05)] p-3 sm:p-5">
              <RadarChart scores={result.scores} />
            </div>

            <div className="mt-5 rounded-[1.6rem] border border-[rgba(26,26,26,0.08)] bg-white/86 p-4 sm:p-5">
              <AxisBarChart scores={result.scores} comments={result.axisComments} />
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          <div data-testid="target-audience" className="soft-panel rounded-[1.8rem] p-5 sm:p-6">
            {detailedResult ? (
              <>
                <p className="text-sm font-bold tracking-[0.16em] text-[var(--text-main)]">💘 このプロフに刺さる異性</p>
                <p className="mt-2 text-sm leading-7 text-[var(--text-sub)]">
                  誰にでも広く刺さる文ではなく、どの層に反応されやすいかを見ています。
                </p>
                <div className="mt-4">
                  <TargetAudience audience={detailedResult.targetAudience} />
                </div>
              </>
            ) : (
              <LoadingBlock
                title="💘 このプロフに刺さる異性"
                description="偏差値は先に出して、刺さる相手の分析は裏で続きを読ませています。"
                status={detailStatus}
                onRetry={onRetryDetails}
              />
            )}
          </div>
        </div>

        <div ref={improvedRef} className="mt-6 grid gap-4">
          {detailedResult ? (
            <BeforeAfter
              originalProfile={originalProfile}
              result={detailedResult}
              onShareX={() => handleShare("x", "beforeAfter")}
              beforeNickname={result.nickname}
            />
          ) : (
            <LoadingBlock
              title="✨ ビフォーアフター"
              description="改善後プロフと変更ポイントを生成中です。メイン結果は先に表示しています。"
              status={detailStatus}
              onRetry={onRetryDetails}
            />
          )}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="soft-panel rounded-[1.8rem] p-5 sm:p-6">
            <p className="text-sm font-bold tracking-[0.16em] text-[var(--text-main)]">シェア</p>
            <p className="mt-3 text-sm leading-7 text-[var(--text-sub)]">
              結果URLは偏差値だけを含み、プロフ原文は含みません。改善案は後から読み込まれてもシェアURLはそのまま使えます。
            </p>
            <div className="mt-5 flex justify-center">
              <div ref={captureRef}>
                <ShareImage appLabel={shareAppLabel} total={result.scores.total} />
              </div>
            </div>
            <div className="mt-5">
              <button
                type="button"
                onClick={() => handleShare("x")}
                className="cta-button inline-flex w-full items-center justify-center rounded-[1.25rem] px-5 py-4 text-sm font-black text-white"
              >
                Xでシェアする
              </button>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm font-bold text-[var(--text-main)]">
                <button
                  type="button"
                  onClick={() => handleShare("line")}
                  className="underline decoration-[rgba(26,26,26,0.3)] underline-offset-4 transition hover:text-[var(--accent)]"
                >
                  LINEで送る
                </button>
                <button
                  type="button"
                  onClick={handleSaveImage}
                  disabled={isSaving || !isDetailsReady}
                  className="underline decoration-[rgba(26,26,26,0.3)] underline-offset-4 transition hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? "画像を保存しています..." : "画像保存"}
                </button>
                <button
                  type="button"
                  onClick={() => improvedRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                  disabled={!isDetailsReady && detailStatus !== "loading"}
                  className="underline decoration-[rgba(26,26,26,0.3)] underline-offset-4 transition hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  改善案を見る
                </button>
                <button
                  type="button"
                  onClick={onRestart}
                  className="underline decoration-[rgba(26,26,26,0.3)] underline-offset-4 transition hover:text-[var(--accent)]"
                >
                  もう一度診断する
                </button>
              </div>
            </div>
            <p className="mt-4 text-xs leading-6 break-all text-[var(--text-sub)]">{resultUrl}</p>
            <p className="mt-3 text-sm font-bold text-[#10B981]">
              {diff === null ? "改善幅を計算中です。" : `改善後は +${diff} 点の見込み。`}
            </p>
            <a href="/prof" className="text-link mt-4 inline-flex">
              別のプロフで試す →
            </a>
          </div>

          <CreatorFollowPanel
            context="prof_result"
            quizName="prof_hensachi"
            title="@yauyuism"
            description="恋愛・婚活の短いコラムはX、長いコラムはnoteで更新しています。診断結果をさらに深掘りしたい時は見てください。"
            actionPosition="top"
          />
        </div>

        <section className="soft-panel mt-6 rounded-[1.8rem] p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold tracking-[0.16em] text-[var(--text-main)]">📝 プロフ診断書</p>
              <p className="mt-2 text-sm leading-7 text-[var(--text-sub)]">
                原文のまま、良い箇所と直したほうがいい箇所をマーキングしています。
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[rgba(232,69,60,0.1)] px-3 py-1 text-xs font-bold text-[var(--accent)]">
                赤 {result.highlights.bad.length}
              </span>
              <span className="rounded-full bg-[rgba(59,130,246,0.1)] px-3 py-1 text-xs font-bold text-[#3B82F6]">
                青 {result.highlights.good.length}
              </span>
              <button
                type="button"
                aria-expanded={isProfileOpen}
                aria-controls="profile-highlight-panel"
                onClick={() => setIsProfileOpen((current) => !current)}
                className="secondary-button rounded-[1rem] px-4 py-3 text-sm font-bold text-[var(--text-main)]"
              >
                {isProfileOpen ? "閉じる" : "詳しく見る"}
              </button>
            </div>
          </div>

          {!isProfileOpen ? (
            <div className="mt-4 rounded-[1.4rem] border border-[rgba(26,26,26,0.08)] bg-white/86 px-4 py-4 sm:px-5">
              <p className="text-sm leading-7 text-[var(--text-sub)]">
                まずは偏差値と刺さる相手を見て、気になったらここを開く流れで十分です。色付きの箇所をタップすると理由が開きます。
              </p>
            </div>
          ) : null}

          <div id="profile-highlight-panel" className={isProfileOpen ? "mt-4" : "hidden"}>
            <HighlightedProfile segments={segments} />
          </div>
        </section>

        <section className="soft-panel mt-6 rounded-[1.8rem] p-5 sm:p-6">
          <p className="text-[0.72rem] font-bold tracking-[0.2em] text-[var(--accent)]">DATA</p>
          <h3 className="mt-3 text-xl font-black leading-tight text-[var(--text-main)] sm:text-2xl">
            みんなの診断結果を見る
          </h3>
          <p className="mt-2 text-sm leading-7 text-[var(--text-sub)]">
            匿名化された診断データから、平均偏差値とありがちなミスを確認できます。
          </p>
          <div className="mt-4">
            <a
              href="/prof/stats"
              className="secondary-button inline-flex items-center justify-center rounded-[1rem] px-4 py-3 text-sm font-bold text-[var(--text-main)]"
            >
              詳しく見る
            </a>
          </div>
        </section>
      </div>
    </section>
  );
}
