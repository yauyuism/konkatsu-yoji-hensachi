"use client";

import Link from "next/link";
import { useRef, useState } from "react";

import { CreatorFollowPanel } from "@/components/CreatorFollowPanel";
import { NineGrid } from "@/components/my9specs/NineGrid";
import type { CustomSpecInput } from "@/lib/my9specs";
import { buildConditionCheckerUrl, getMy9SpecsEstimate, getSelectedSpecs } from "@/lib/my9specs";
import { getMy9SpecsLineShareUrl, getMy9SpecsXShareUrl } from "@/lib/my9specs-share";
import { downloadResultImage } from "@/lib/result-image";
import { useMarkCompletedTool } from "@/lib/completed-tools";

type My9SpecsResultPanelProps = {
  targetGender: "male" | "female";
  presetIds: string[];
  customInputs: CustomSpecInput[];
  editHref: string;
  onEdit?: () => void;
};

function formatSharePercentage(value: number) {
  if (value < 0.01) {
    return `${value.toFixed(4)}%`;
  }

  if (value < 0.1) {
    return `${value.toFixed(3)}%`;
  }

  return `${value.toFixed(2)}%`;
}

function formatReduction(value: number) {
  return `${Math.round(value * 100)}%`;
}

function NextStepCard({
  eyebrow,
  title,
  description,
  href,
  cta,
}: {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  cta: string;
}) {
  return (
    <Link href={href} className="card card-interactive flex h-full flex-col rounded-[1.4rem] p-5 sm:p-6">
      <p className="font-numeric text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-sub)]">{eyebrow}</p>
      <h3 className="mt-3 text-lg font-black tracking-[-0.02em] text-[var(--text-main)]">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[var(--text-sub)]">{description}</p>
      <p className="mt-auto pt-5 text-sm font-bold text-[var(--accent)]">{cta}</p>
    </Link>
  );
}

export function My9SpecsResultPanel({
  targetGender,
  presetIds,
  customInputs,
  editHref,
  onEdit,
}: My9SpecsResultPanelProps) {
  const selected = getSelectedSpecs(presetIds, customInputs);
  const estimate = getMy9SpecsEstimate(selected, targetGender);
  const xShareUrl = getMy9SpecsXShareUrl(targetGender, presetIds, customInputs, estimate.count);
  const lineShareUrl = getMy9SpecsLineShareUrl(targetGender, presetIds, customInputs, estimate.count);
  const conditionCheckerUrl = buildConditionCheckerUrl(selected, targetGender);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const targetGenderLabel = targetGender === "male" ? "未婚男性" : "未婚女性";

  useMarkCompletedTool("my9specs");

  async function handleSaveImage() {
    if (!cardRef.current || isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      await downloadResultImage(cardRef.current, "my-9-specs.png");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="grid gap-6">
      <section className="paper-card rounded-[1.8rem] p-5 sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[0.98fr_1.02fr]">
          <div ref={cardRef}>
            <NineGrid selected={selected} />
          </div>

          <div className="flex flex-col justify-center">
            <p className="font-numeric text-[0.72rem] font-black tracking-[0.24em] text-[var(--accent)]">RESULT</p>
            <h2 className="mt-3 text-[1.9rem] font-black leading-tight tracking-[-0.03em] text-[var(--text-main)] sm:text-[2.5rem]">
              この9条件を
              <span className="block text-[var(--accent)]">全部満たす人は</span>
            </h2>

            <div className="mt-6 rounded-[1.6rem] border border-[rgba(232,69,60,0.16)] bg-[linear-gradient(180deg,#fff8f5_0%,#ffffff_100%)] px-5 py-6 sm:px-6 sm:py-7">
              <p className="text-sm font-bold tracking-[0.14em] text-[var(--text-sub)]">日本に約</p>
              <p className="font-numeric mt-3 text-5xl font-black leading-none text-[var(--accent)] sm:text-[4.6rem]">
                {estimate.count.toLocaleString()}
                <span className="ml-2 text-[1.4rem] text-[var(--text-main)] sm:text-[1.8rem]">人</span>
              </p>
              <div className="mt-5 rounded-[1.2rem] border border-[rgba(26,26,26,0.08)] bg-white p-4 text-sm leading-7 text-[var(--text-main)]">
                <p>
                  {targetGenderLabel} 約{estimate.totalPoolCount.toLocaleString()}人の中の {formatSharePercentage(estimate.percentageWithinGender)}
                </p>
                <p className="mt-2 text-[var(--text-sub)]">
                  {estimate.reliabilityLabel}。{estimate.reliabilityNote}
                </p>
              </div>
            </div>

            {estimate.noteWarning ? (
              <p className="mt-4 rounded-[1.1rem] border border-[rgba(245,158,11,0.18)] bg-[rgba(245,158,11,0.08)] px-4 py-3 text-sm font-bold leading-6 text-[#b45309]">
                {estimate.noteWarning}
              </p>
            ) : null}

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <a href={xShareUrl} target="_blank" rel="noopener noreferrer" className="btn-primary rounded-[1rem]">
                Xでシェアする
              </a>
              <button type="button" onClick={handleSaveImage} className="btn-secondary rounded-[1rem]" disabled={isSaving}>
                {isSaving ? "画像を保存中..." : "画像を保存"}
              </button>
              <a href={lineShareUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary rounded-[1rem]">
                LINEで送る
              </a>
              {onEdit ? (
                <button type="button" onClick={onEdit} className="btn-secondary rounded-[1rem]">
                  条件を変える
                </button>
              ) : (
                <Link href={editHref} className="btn-secondary rounded-[1rem]">
                  条件を変える
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="paper-card rounded-[1.6rem] p-5 sm:p-6">
          <p className="text-sm font-black tracking-[0.16em] text-[var(--text-main)]">条件別のインパクト</p>
          <div className="mt-5 grid gap-4">
            {estimate.topImpact ? (
              <div className="rounded-[1.2rem] border border-[rgba(232,69,60,0.14)] bg-[var(--accent-soft)] p-4">
                <p className="text-sm font-bold text-[var(--accent)]">一番人数を減らしてる条件</p>
                <p className="mt-2 text-lg font-black text-[var(--text-main)]">
                  {estimate.topImpact.option.emoji} {estimate.topImpact.option.label}
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--text-main)]">
                  これだけで候補が {formatReduction(estimate.topImpact.reductionRate)} 減ります。
                </p>
              </div>
            ) : null}

            {estimate.leastImpact ? (
              <div className="rounded-[1.2rem] border border-[rgba(26,26,26,0.08)] bg-white p-4">
                <p className="text-sm font-bold text-[var(--text-sub)]">意外と影響が小さい条件</p>
                <p className="mt-2 text-lg font-black text-[var(--text-main)]">
                  {estimate.leastImpact.option.emoji} {estimate.leastImpact.option.label}
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--text-main)]">
                  候補減少は {formatReduction(estimate.leastImpact.reductionRate)} ほど。ここは思ったより母数を削っていません。
                </p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="paper-card rounded-[1.6rem] p-5 sm:p-6">
          <p className="text-sm font-black tracking-[0.16em] text-[var(--text-main)]">やうゆの一言</p>
          <p className="mt-4 text-sm leading-8 text-[var(--text-main)] sm:text-base">{estimate.comment}</p>
          <p className="mt-4 text-xs leading-6 text-[var(--text-sub)]">
            ※ 年齢感・性格・価値観・趣味と自由入力は、統計で直接取れない条件として推計値を含みます。
          </p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <NextStepCard
          eyebrow="CONDITION CHECKER"
          title="条件チェッカーでもっと詳しく見る"
          description="統計で反映できる条件だけを引き継いで、スライダー付きで細かく確認できます。"
          href={conditionCheckerUrl}
          cta="条件チェッカーを開く →"
        />
        <NextStepCard
          eyebrow="SPEC RANK"
          title="自分のスペックも上位チェックしてみる"
          description="条件で探すだけでなく、自分が探される側としてどれくらいレアかも確認できます。"
          href="/market"
          cta="上位チェックを開く →"
        />
      </section>

      <CreatorFollowPanel
        context="my9specs_result"
        quizName="my9specs"
        title="@yauyuism"
        description="条件の話を数字と現実感で見直したい人向けに、X と note で考察を続けています。"
        actionPosition="top"
      />
    </div>
  );
}
