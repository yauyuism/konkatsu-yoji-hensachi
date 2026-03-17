"use client";

import { EDUCATIONS, GENDER_LABELS, REGIONS } from "@/data/conditions";
import type { ReadFilterResult } from "@/lib/convert-filter";

type ScreenshotConfirmProps = {
  result: ReadFilterResult;
  onApply: () => void;
  onRetry: () => void;
  onManualFallback: () => void;
};

function buildRecognizedItems(result: ReadFilterResult) {
  return [
    result.targetGender ? `相手の性別: ${GENDER_LABELS[result.targetGender]}` : null,
    result.ageMin !== null || result.ageMax !== null
      ? `年齢: ${result.ageMin ?? "?"}〜${result.ageMax ?? "?"}歳`
      : null,
    result.incomeMin !== null && result.incomeMax !== null
      ? `年収: ${result.incomeMin}〜${result.incomeMax}万円`
      : result.incomeMin !== null
        ? `年収: ${result.incomeMin}万円以上`
        : result.incomeMax !== null
          ? `年収: ${result.incomeMax}万円以下`
          : null,
    result.heightMin !== null && result.heightMax !== null
      ? `身長: ${result.heightMin}〜${result.heightMax}cm`
      : result.heightMin !== null
        ? `身長: ${result.heightMin}cm以上`
        : result.heightMax !== null
          ? `身長: ${result.heightMax}cm以下`
          : null,
    result.education ? `学歴: ${result.education}` : null,
    result.region ? `エリア: ${result.region}` : null,
  ].filter((value): value is string => Boolean(value));
}

function buildMissingItems(result: ReadFilterResult) {
  return [
    result.targetGender === null ? "相手の性別" : null,
    result.ageMin === null && result.ageMax === null ? "年齢" : null,
    result.incomeMin === null && result.incomeMax === null ? "年収" : null,
    result.heightMin === null && result.heightMax === null ? "身長" : null,
    !result.education ? "学歴" : null,
    !result.region ? "エリア" : null,
  ].filter((value): value is string => Boolean(value));
}

export function ScreenshotConfirm({ result, onApply, onRetry, onManualFallback }: ScreenshotConfirmProps) {
  const recognizedItems = buildRecognizedItems(result);
  const missingItems = buildMissingItems(result);
  const isLowConfidence = result.confidence === "low";

  return (
    <section className="paper-card rounded-[1.8rem] border border-[color:var(--line)] bg-[var(--card)] p-5 shadow-[0_18px_42px_rgba(26,26,26,0.06)] sm:p-6">
      <p className="text-xs font-bold tracking-[0.18em] text-[var(--accent)]">STEP 4</p>
      <h2 className="mt-3 text-2xl font-black text-[var(--text-main)]">読み取り結果の確認</h2>
      <p className="mt-2 text-sm leading-7 text-[var(--text-sub)]">
        違っている項目は、このあとスライダー画面でそのまま修正できます。
      </p>

      {isLowConfidence ? (
        <p className="mt-4 rounded-[1rem] border border-[rgba(249,115,22,0.18)] bg-[rgba(249,115,22,0.08)] px-4 py-3 text-sm font-bold text-[#C2410C]">
          読み取り精度が低い可能性があります。適用後にスライダーで確認してください。
        </p>
      ) : null}

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[1.4rem] border border-[rgba(26,26,26,0.08)] bg-white/88 p-4">
          <p className="text-sm font-black text-[var(--text-main)]">読み取れた項目</p>
          <div className="mt-4 grid gap-3">
            {recognizedItems.length > 0 ? (
              recognizedItems.map((item) => (
                <div key={item} className="flex items-center justify-between rounded-[1rem] bg-[rgba(16,185,129,0.08)] px-4 py-3 text-sm font-bold text-[var(--text-main)]">
                  <span>{item}</span>
                  <span className="text-[#10B981]">✓</span>
                </div>
              ))
            ) : (
              <p className="rounded-[1rem] bg-[rgba(26,26,26,0.05)] px-4 py-4 text-sm leading-7 text-[var(--text-sub)]">
                条件を読み取れませんでした。別のスクショか、手動入力へ進んでください。
              </p>
            )}
          </div>
        </div>

        <div className="rounded-[1.4rem] border border-[rgba(26,26,26,0.08)] bg-white/88 p-4">
          <p className="text-sm font-black text-[var(--text-main)]">読み取れなかった項目</p>
          <div className="mt-4 grid gap-3">
            {missingItems.length > 0 ? (
              missingItems.map((item) => (
                <div key={item} className="rounded-[1rem] bg-[rgba(26,26,26,0.05)] px-4 py-4 text-sm leading-7 text-[var(--text-sub)]">
                  {item}: 指定なしのまま開始し、必要ならあとで調整
                </div>
              ))
            ) : (
              <p className="rounded-[1rem] bg-[rgba(59,130,246,0.08)] px-4 py-4 text-sm leading-7 text-[#1D4ED8]">
                主要な条件はすべて読み取れました。
              </p>
            )}
          </div>
        </div>
      </div>

      {result.rawConditions.length > 0 ? (
        <div className="mt-4 rounded-[1.4rem] border border-[rgba(26,26,26,0.08)] bg-white/88 p-4">
          <p className="text-sm font-black text-[var(--text-main)]">分類しきれなかった条件</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {result.rawConditions.map((item) => (
              <span key={item} className="rounded-full bg-[rgba(26,26,26,0.06)] px-3 py-2 text-xs font-bold text-[var(--text-sub)]">
                {item}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onApply}
          data-testid="screenshot-apply-button"
          className="cta-button inline-flex items-center justify-center rounded-[1.2rem] px-6 py-4 text-sm font-black text-white"
        >
          この条件でチェックする
        </button>
        <button
          type="button"
          onClick={onRetry}
          className="secondary-button inline-flex items-center justify-center rounded-[1.2rem] px-6 py-4 text-sm font-black text-[var(--text-main)]"
        >
          別の画像でやり直す
        </button>
        <button
          type="button"
          onClick={onManualFallback}
          className="underline decoration-[rgba(26,26,26,0.3)] underline-offset-4 transition hover:text-[var(--accent)]"
        >
          手動で入力する
        </button>
      </div>
    </section>
  );
}
