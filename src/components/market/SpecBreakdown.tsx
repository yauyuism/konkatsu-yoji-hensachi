"use client";

import Link from "next/link";

import type { MarketBreakdownItem } from "@/lib/market";
import { formatMarketPercent } from "@/lib/market";

type SpecBreakdownProps = {
  items: MarketBreakdownItem[];
  overallPercentile: number;
  editHref: string;
};

function getInsight(item: MarketBreakdownItem) {
  if (!item.included) {
    return `${item.label}は未入力なので除外しています。入力すると、もう少し精度の高い換算になります。`;
  }

  if (item.key === "income") {
    if (item.percentile <= 10) {
      return `${item.value}は上位${formatMarketPercent(item.percentile)}%。この軸が今のスペックの主砲です。`;
    }

    if (item.percentile <= 30) {
      return `${item.value}はしっかり効いています。会う前の足切りを越えやすいラインです。`;
    }

    return `${item.value}は極端な強みではないものの、平均より上なら十分に戦えます。`;
  }

  if (item.key === "age") {
    if (item.percentile <= 20) {
      return `${item.value}は婚活市場で通りやすい年齢帯です。ここは素直に強みとして見ていいです。`;
    }

    if (item.percentile <= 45) {
      return `${item.value}は市場の真ん中あたり。強みでも弱みでもなく、差がつきにくい軸です。`;
    }

    return `${item.value}だけで押す軸ではありません。ほかの条件や見せ方で十分に補える領域です。`;
  }

  if (item.key === "height") {
    if (item.percentile <= 20) {
      return `${item.value}は見た目の印象に効きやすい上位帯です。数字としても分かりやすい強みです。`;
    }

    if (item.percentile <= 50) {
      return `${item.value}は大きな弱点にはなりにくい水準です。ここで極端に不利ではありません。`;
    }

    return `${item.value}は差がつきにくい側です。写真の見せ方や全体の雰囲気のほうが効きやすいです。`;
  }

  if (item.key === "education") {
    if (item.percentile <= 20) {
      return `${item.value}は条件で効く人にはしっかり刺さります。学歴を重視する層には強い軸です。`;
    }

    if (item.percentile <= 55) {
      return `${item.value}は多数派に近いポジションです。ここだけでは差がつきにくい軸です。`;
    }

    return `${item.value}は大多数と同じ側なので、ここで優位を作るタイプではありません。`;
  }

  if (item.percentile <= 20) {
    return `${item.value}は希少性が高く、スペック全体を押し上げる軸です。`;
  }

  if (item.percentile <= 50) {
    return `${item.value}は平均より少し上です。派手ではないですが、総合点を底上げしています。`;
  }

  return `${item.value}は差がつきにくい軸です。ここより他の条件の寄与が大きくなります。`;
}

export function SpecBreakdown({ items, overallPercentile, editHref }: SpecBreakdownProps) {
  const excludedItems = items.filter((item) => !item.included);

  return (
    <section className="paper-card rounded-[2rem] border border-[color:var(--line)] bg-[var(--card)] p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold tracking-[0.16em] text-[var(--accent)]">内訳</p>
          <h2 className="mt-2 text-2xl font-black text-[var(--text-main)]">スペック別の内訳</h2>
          <p className="mt-2 text-sm leading-7 text-[var(--text-sub)]">各スペックを単独で見たときの位置を、分布の中で並べています。</p>
        </div>
        <Link href={editHref} className="text-link">
          条件を調整する →
        </Link>
      </div>

      <div className="mt-6 divide-y divide-[color:var(--line)]">
        {items.map((item) => (
          <div key={item.key} className="py-5 first:pt-0 last:pb-0">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold tracking-[0.16em] text-[var(--text-sub)]">{item.label}</p>
                <p className="mt-2 text-lg font-black text-[var(--text-main)]">{item.value}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold tracking-[0.16em] text-[var(--text-sub)]">
                  {item.included ? "同性の中での立ち位置" : "計算から除外"}
                </p>
                <p className="number-display mt-2 text-2xl font-black text-[var(--text-main)]">
                  {item.included ? `上位${formatMarketPercent(item.percentile)}%` : "未入力"}
                </p>
                <p className="mt-1 text-sm font-bold text-[var(--text-sub)]">
                  {item.included ? "この軸を総合計算に含めています" : "この軸は総合に含めていません"}
                </p>
              </div>
            </div>

            <div className="mt-4">
              {item.included ? (
                <div className="h-2 rounded-full bg-[rgba(59,130,246,0.12)]">
                  <div
                    className="h-full rounded-full bg-[var(--color-accent)]"
                    style={{ width: `${Math.max(6, Math.min(100, 100 - item.percentile))}%` }}
                  />
                </div>
              ) : (
                <div className="rounded-[1.35rem] border border-dashed border-[color:var(--line)] bg-[var(--bg-section)] px-4 py-10 text-center text-sm text-[var(--text-sub)]">
                  未入力のためこの軸は除外しています。
                </div>
              )}
            </div>

            <p className="mt-3 text-sm font-bold text-[var(--text-main)]">
              {item.included ? `この軸単体では上位${formatMarketPercent(item.percentile)}%` : "この軸は未入力のため総合計算から除外しています。"}
            </p>
            <p className="mt-2 text-sm leading-7 text-[var(--text-sub)]">{getInsight(item)}</p>
          </div>
        ))}
      </div>

      {excludedItems.length > 0 ? (
        <div className="mt-6 border-t border-[color:var(--line)] pt-5">
          <p className="text-sm leading-7 text-[var(--text-main)]">
            {excludedItems.map((item) => item.label).join("・")}は未入力のため除外しました。入力すると、より正確な換算になります。
          </p>
        </div>
      ) : null}

      <div className="mt-6 border-t border-[color:var(--line)] pt-5">
        <p className="text-xs font-bold tracking-[0.16em] text-[var(--accent)]">重み付けすると</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <p className="text-lg font-black text-[var(--text-main)]">未婚同性の中で</p>
          <p className="number-display text-3xl font-black text-[var(--color-main)]">上位 {formatMarketPercent(overallPercentile)}%</p>
        </div>
      </div>
    </section>
  );
}
