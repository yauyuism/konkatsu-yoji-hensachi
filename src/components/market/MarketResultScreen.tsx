"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { CrossPromotion } from "@/components/CrossPromotion";
import { IncomeEquivalentDisplay } from "@/components/market/IncomeEquivalentDisplay";
import { MethodologyDisclosure } from "@/components/market/MethodologyDisclosure";
import { ShareImage } from "@/components/market/ShareImage";
import { trackEvent } from "@/lib/analytics";
import {
  formatMarketPercent,
  serializeMarketParams,
  type MarketAnalysis,
  type MarketBreakdownItem,
  type MarketUserSpec,
} from "@/lib/market";
import { downloadResultImage } from "@/lib/result-image";

type ConditionResultSnapshot = {
  count: number;
};

type MarketResultScreenProps = {
  user: MarketUserSpec;
  analysis: MarketAnalysis;
  xShareUrl: string;
  lineShareUrl: string;
  editHref: string;
};

async function saveMarketStats(user: MarketUserSpec) {
  const response = await fetch("/api/market-stats", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  if (!response.ok) {
    throw new Error(`匿名統計の保存に失敗しました (${response.status})`);
  }
}

function getSpecInsight(item: MarketBreakdownItem) {
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

function InlineSpecBreakdown({
  items,
  overallPercentile,
  incomeEquivalent,
  editHref,
}: {
  items: MarketBreakdownItem[];
  overallPercentile: number;
  incomeEquivalent: number;
  editHref: string;
}) {
  const excludedItems = items.filter((item) => !item.included);

  return (
    <section className="paper-card rounded-[2rem] p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold tracking-[0.16em] text-[var(--accent)]">内訳</p>
          <h2 className="mt-2 text-2xl font-black text-[var(--text-main)]">スペックの効き方</h2>
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
                  {item.included ? `年収で例えると ${item.incomeEquivalent.toLocaleString()}万相当` : "この軸は総合に含めていません"}
                </p>
              </div>
            </div>

            <div className="mt-4 h-2 rounded-full bg-[rgba(59,130,246,0.12)]">
              <div
                className="h-full rounded-full bg-[var(--color-accent)]"
                style={{ width: `${Math.max(6, Math.min(100, 100 - item.percentile))}%` }}
              />
            </div>

            <p className="mt-3 text-sm font-bold text-[var(--text-main)]">
              {item.included
                ? `上位${formatMarketPercent(item.percentile)}% → 年収${item.incomeEquivalent.toLocaleString()}万相当`
                : "この軸は未入力のため総合計算から除外しています。"}
            </p>
            <p className="mt-2 text-sm leading-7 text-[var(--text-sub)]">{getSpecInsight(item)}</p>
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
        <p className="text-xs font-bold tracking-[0.16em] text-[var(--accent)]">全部掛け合わせると</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <p className="text-lg font-black text-[var(--text-main)]">未婚同性の上位 {formatMarketPercent(overallPercentile)}%</p>
          <p className="number-display text-3xl font-black text-[var(--color-main)]">{incomeEquivalent.toLocaleString()}万相当</p>
        </div>
      </div>
    </section>
  );
}

function getGapTone(gap: number) {
  if (gap >= 2) {
    return {
      label: "かなり自分有利",
      color: "var(--positive)",
      background: "rgba(16,185,129,0.08)",
      headline: "あなたは「選ぶ側」にいます。",
      message:
        "あなたを条件内に入れる人のほうがかなり多い状態です。止まっているなら、問題はスペックよりプロフィールや会話の見せ方に寄っている可能性が高いです。",
    };
  }

  if (gap >= 1) {
    return {
      label: "やや自分有利",
      color: "var(--positive)",
      background: "rgba(16,185,129,0.08)",
      headline: "あなたは「選ぶ側」に近い位置です。",
      message: "婚活倍率は悪くありません。ここから先は、写真、プロフィール文、会う前のやり取りを整えると通りやすくなります。",
    };
  }

  return {
    label: "見直し余地あり",
    color: "var(--neutral)",
    background: "rgba(245,158,11,0.12)",
    headline: "あなたが求めている人のほうが多いです。",
    message: "不利というより、条件を少し絞りすぎている状態です。条件を1つ見直すだけで倍率がかなり変わる余地があります。",
  };
}

function InlineDemandGapSection({
  demandCount,
  demandShare,
  conditionResult,
}: {
  demandCount: number;
  demandShare: number;
  conditionResult: ConditionResultSnapshot | null;
}) {
  if (!conditionResult || conditionResult.count <= 0) {
    return (
      <section className="paper-card rounded-[2rem] p-5 sm:p-7">
        <h2 className="text-2xl font-black text-[var(--text-main)]">婚活倍率</h2>
        <p className="mt-3 text-sm leading-7 text-[var(--text-sub)]">
          今のスペックを条件内に入れやすい相手は、今の地域だけでも約 {demandCount.toLocaleString()} 人です。地域内の未婚異性に対する比率で見ると
          {` ${demandShare.toFixed(1)}%`} くらいです。
        </p>
      </section>
    );
  }

  const gap = demandCount / conditionResult.count;
  const tone = getGapTone(gap);

  return (
    <section className="paper-card rounded-[2rem] p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-[var(--text-main)]">婚活倍率</h2>
          <p className="mt-2 text-sm leading-7 text-[var(--text-sub)]">条件チェッカーの結果と、今回のスペック換算を同時に見ています。</p>
        </div>
        <div className="rounded-full px-4 py-2 text-xs font-black tracking-[0.12em]" style={{ color: tone.color, background: tone.background }}>
          {tone.label}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-[1.6rem] border border-[color:var(--line)] bg-white">
        <div className="grid divide-y divide-[color:var(--line)] sm:grid-cols-[1fr_auto_1fr] sm:divide-x sm:divide-y-0">
          <div className="p-5 text-center">
            <p className="text-xs font-bold tracking-[0.16em] text-[var(--text-sub)]">あなたが求めている相手</p>
            <p className="number-display mt-3 text-4xl font-black text-[var(--text-main)]">{conditionResult.count.toLocaleString()}</p>
            <p className="mt-2 text-sm leading-7 text-[var(--text-sub)]">条件チェッカーで残った人数</p>
          </div>
          <div className="p-5 text-center" style={{ background: tone.background }}>
            <p className="text-xs font-bold tracking-[0.16em]" style={{ color: tone.color }}>
              婚活倍率
            </p>
            <p className="number-display mt-3 text-5xl font-black leading-none" style={{ color: tone.color }}>
              {gap.toFixed(1)}倍
            </p>
          </div>
          <div className="p-5 text-center">
            <p className="text-xs font-bold tracking-[0.16em] text-[var(--text-sub)]">あなたを条件内に入れやすい相手</p>
            <p className="number-display mt-3 text-4xl font-black text-[var(--text-main)]">{demandCount.toLocaleString()}</p>
            <p className="mt-2 text-sm leading-7 text-[var(--text-sub)]">地域内の未婚異性に推計許容率を掛けた概算</p>
          </div>
        </div>
      </div>

      <div className="mt-5 border-t border-[color:var(--line)] pt-5">
        <p className="text-base font-black" style={{ color: tone.color }}>
          {tone.headline}
        </p>
        <p className="mt-3 text-sm leading-7 text-[var(--text-main)]">{tone.message}</p>
      </div>
    </section>
  );
}

function getShareLead(overallPercentile: number) {
  if (overallPercentile <= 10) {
    return "この結果はそのまま出しても強さが伝わりやすいので、軽く置いておくのに向いています。";
  }

  if (overallPercentile <= 30) {
    return "結果をそのまま貼れる文面を入れています。比較や反応を見る用に、そのまま出しやすい形です。";
  }

  return "結果文面は自動で入るので、そのままシェアできます。ネタとして出したいときにも使いやすい形にしています。";
}

function InlineShareSection({
  xShareUrl,
  lineShareUrl,
  editHref,
  isSaving,
  overallPercentile,
  onShareClick,
  onSaveImage,
}: {
  xShareUrl: string;
  lineShareUrl: string;
  editHref: string;
  isSaving: boolean;
  overallPercentile: number;
  onShareClick: (platform: "x" | "line") => void;
  onSaveImage: () => void;
}) {
  return (
    <section className="paper-card rounded-[2rem] border border-[color:var(--line)] bg-[var(--card)] p-5 sm:p-7">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-bold tracking-[0.16em] text-[var(--text-main)]">シェア</p>
        <p className="mt-3 text-sm leading-7 text-[var(--text-sub)]">{getShareLead(overallPercentile)}</p>

        <div className="mt-6 grid gap-4">
          <a
            href={xShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onShareClick("x")}
            className="cta-button inline-flex w-full items-center justify-center rounded-[1.6rem] px-6 py-5 text-xl font-black text-white"
          >
            Xでシェア
          </a>
          <a
            href={lineShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onShareClick("line")}
            className="secondary-button inline-flex w-full items-center justify-center rounded-[1.6rem] px-6 py-5 text-xl font-black text-[var(--text-main)]"
          >
            LINEで送る
          </a>
          <button
            type="button"
            onClick={onSaveImage}
            disabled={isSaving}
            className="secondary-button inline-flex w-full items-center justify-center rounded-[1.6rem] px-6 py-5 text-xl font-black text-[var(--text-main)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "保存中..." : "画像を保存"}
          </button>
          <Link
            href={editHref}
            className="secondary-button inline-flex w-full items-center justify-center rounded-[1.6rem] px-6 py-5 text-xl font-black text-[var(--text-main)]"
          >
            もう一度測定する
          </Link>
        </div>

        <p className="mt-5 text-xs leading-6 text-[var(--text-tertiary)]">
          URL には入力スペックだけを含めています。名前や履歴は保存しません。
        </p>
      </div>
    </section>
  );
}

export function MarketResultScreen({
  user,
  analysis,
  xShareUrl,
  lineShareUrl,
  editHref,
}: MarketResultScreenProps) {
  const captureRef = useRef<HTMLDivElement>(null);
  const hasTrackedViewRef = useRef(false);
  const savedStatKeysRef = useRef(new Set<string>());
  const [isSaving, setIsSaving] = useState(false);
  const [conditionResult, setConditionResult] = useState<ConditionResultSnapshot | null>(null);

  useEffect(() => {
    if (hasTrackedViewRef.current) {
      return;
    }

    hasTrackedViewRef.current = true;
    trackEvent("market_result_view", {
      quiz_name: "market_equivalent",
      gender: user.gender,
      age: user.age,
      income: user.income,
      height: user.height,
      education: user.education,
      region: user.region,
      overall_percentile: analysis.overallPercentile,
      income_equivalent: analysis.incomeEquivalent,
    });
  }, [analysis.incomeEquivalent, analysis.overallPercentile, user]);

  useEffect(() => {
    const statKey = serializeMarketParams(user);
    if (savedStatKeysRef.current.has(statKey)) {
      return;
    }

    savedStatKeysRef.current.add(statKey);
    void saveMarketStats(user).catch((error) => {
      console.warn("Failed to persist anonymous market stats", error);
      savedStatKeysRef.current.delete(statKey);
    });
  }, [user]);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem("conditionResult");
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw) as ConditionResultSnapshot | null;
      if (parsed && typeof parsed.count === "number") {
        setConditionResult(parsed);
      }
    } catch {
      setConditionResult(null);
    }
  }, []);

  const handleSaveImage = async () => {
    if (!captureRef.current || isSaving) {
      return;
    }

    trackEvent("market_save_image_click", {
      quiz_name: "market_equivalent",
      income_equivalent: analysis.incomeEquivalent,
    });

    setIsSaving(true);
    try {
      await downloadResultImage(captureRef.current, `market-value-${analysis.incomeEquivalent}.png`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShareClick = (platform: "x" | "line") => {
    trackEvent("market_share_click", {
      quiz_name: "market_equivalent",
      platform,
      income_equivalent: analysis.incomeEquivalent,
    });
  };

  return (
    <section data-testid="market-result" className="screen-shell mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
      <div className="mx-auto max-w-5xl">
        <IncomeEquivalentDisplay
          gender={user.gender}
          incomeEquivalent={analysis.incomeEquivalent}
          overallPercentile={analysis.overallPercentile}
          note={analysis.note}
        />

        <div className="mt-6 grid gap-4">
          <InlineShareSection
            xShareUrl={xShareUrl}
            lineShareUrl={lineShareUrl}
            editHref={editHref}
            isSaving={isSaving}
            overallPercentile={analysis.overallPercentile}
            onShareClick={handleShareClick}
            onSaveImage={handleSaveImage}
          />
          <InlineSpecBreakdown
            items={analysis.specs}
            overallPercentile={analysis.overallPercentile}
            incomeEquivalent={analysis.incomeEquivalent}
            editHref={editHref}
          />
          <InlineDemandGapSection
            demandCount={analysis.demandCount}
            demandShare={analysis.demandShare}
            conditionResult={conditionResult}
          />
        </div>

        <section className="mt-6 paper-card rounded-[2rem] p-5 sm:p-7">
          <p className="text-sm font-bold tracking-[0.16em] text-[var(--accent)]">診断結果をアドバイス</p>
          <p className="mt-4 text-sm leading-8 text-[var(--text-main)]">{analysis.comment}</p>
          <p className="mt-4 text-sm leading-7 text-[var(--text-sub)]">
            これはスペック条件のレア度であって、人間としての価値ではありません。スペックは入口で、本当に差がつくのは写真、プロフィール文、会う前の会話です。
          </p>

          <div className="mt-6 border-t border-[color:var(--line)] pt-6">
            <h2 className="text-2xl font-black text-[var(--text-main)]">次にやること</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <CrossPromotion
                toolId="conditions"
                eyebrow="CHECK"
                ctaLabel="婚活倍率を確認する →"
                className="border-[color:var(--line)] bg-[var(--bg-card)]"
              />
              <CrossPromotion
                toolId="prof"
                eyebrow="NEXT"
                ctaLabel="改善ポイントを見る →"
                className="border-[color:var(--line)] bg-[var(--bg-card)]"
              />
            </div>
          </div>
        </section>

        <div className="mt-6">
          <MethodologyDisclosure steps={analysis.methodologySteps} />
        </div>

        <p className="mt-6 text-xs leading-6 text-[var(--text-sub)]">
          ※ 総務省「国勢調査」、厚生労働省「賃金構造基本統計調査」「国民健康・栄養調査」、文部科学省「学校基本調査」、
          国立社会保障・人口問題研究所「出生動向基本調査」、婚活実態調査をもとにした推計値です。各軸を独立とみなした概算であり、実際の希少性や需要とは異なる場合があります。
        </p>
      </div>

      <div className="pointer-events-none fixed left-[-200vw] top-0">
        <ShareImage ref={captureRef} user={user} analysis={analysis} />
      </div>
    </section>
  );
}
