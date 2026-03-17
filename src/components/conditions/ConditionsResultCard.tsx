import type { ReactNode } from "react";

import { ToolCard } from "@/components/ToolCard";
import {
  formatConditionsCountLabel,
  getConditionSummaryList,
  type CalculationSummary,
  type Conditions,
} from "@/lib/conditions";

type ConditionsResultCardProps = {
  conditions: Conditions;
  summary: CalculationSummary;
  shareSection?: ReactNode;
  adjustmentPanel?: ReactNode;
  logicPanel?: ReactNode;
  supportSection?: ReactNode;
};

function getHeroColor(percentage: number) {
  if (percentage < 0.2) {
    return "#E8453C";
  }

  if (percentage < 1) {
    return "#F97316";
  }

  if (percentage < 3) {
    return "#2563EB";
  }

  return "#10B981";
}

export function ConditionsResultCard({
  conditions,
  summary,
  shareSection,
  adjustmentPanel,
  logicPanel,
  supportSection,
}: ConditionsResultCardProps) {
  const heroColor = getHeroColor(summary.percentage);
  const displayCount = formatConditionsCountLabel(summary.count);

  return (
    <section className="paper-card rounded-[1rem] p-5 sm:p-7">
      <p className="eyebrow mx-auto w-fit px-3 py-1 text-[0.72rem] font-bold tracking-[0.22em] text-[var(--accent)]">
        CONDITION CHECK - RESULT
      </p>

      <div className="mt-6 text-center">
        <p className="text-sm font-bold tracking-[0.16em] text-[var(--text-sub)]">あなたの条件に当てはまるのは</p>
        <div className="result-frame mt-5 rounded-[1rem] border border-[color:var(--line)] bg-white px-5 py-8 sm:px-6 sm:py-10">
          <p className="number-display text-5xl font-black leading-none text-[var(--text-main)] sm:text-7xl lg:text-[5.6rem]">
            <span style={{ color: heroColor }}>{displayCount}</span>
          </p>
          <p className="mt-4 text-sm font-bold text-[var(--text-sub)] sm:text-base">未婚者全体の {summary.percentage.toFixed(2)}%</p>
        </div>
      </div>

      {shareSection ? <div className="mt-6">{shareSection}</div> : null}

      <section className="mt-6 rounded-[1rem] border border-[color:var(--line)] bg-white p-5">
        <p className="text-sm font-bold tracking-[0.16em] text-[var(--text-main)]">あなたの条件</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {getConditionSummaryList(conditions).map((item) => (
            <div key={item} className="border-b border-[color:var(--line)] px-1 py-3 text-sm font-bold text-[var(--text-main)] last:border-b-0">
              {item}
            </div>
          ))}
        </div>
      </section>

      <p className="mt-6 text-sm leading-7 text-[var(--text-sub)]">
        条件を変えるとどう変わるか試したい場合は、下の「条件を調整する」を開いてスライダーを動かしてみてください。
      </p>

      <section className="mt-6 rounded-[1rem] border border-[color:var(--line)] bg-white p-5">
        <p className="text-sm font-bold tracking-[0.16em] text-[var(--text-main)]">スケール比較</p>
        <div className="mt-4 space-y-3">
          {summary.scaleComparisons.map((item) => (
            <p key={item} className="text-sm leading-7 text-[var(--text-main)]">
              {item}
            </p>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-[1rem] border border-[rgba(232,69,60,0.14)] bg-[var(--accent-soft)] p-5">
        <p className="text-sm font-bold tracking-[0.16em] text-[var(--accent)]">診断結果をもとにアドバイス</p>
        <p className="mt-4 text-sm leading-8 text-[var(--text-main)]">{summary.comment}</p>
      </section>

      <section className="mt-6 rounded-[1rem] border border-[color:var(--line)] bg-white p-5">
        <p className="text-sm font-bold tracking-[0.16em] text-[var(--text-main)]">次にやること</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <ToolCard
            label="MARKET VALUE"
            title="婚活スペック年収換算"
            description="条件だけでなく、自分が探される側でどう見えるかも確認します。"
            tags={["フォーム入力", "約30秒"]}
            href="/market"
            ctaLabel="年収換算を開く →"
          />
          <ToolCard
            label="PROFILE CHECK"
            title="プロフィール偏差値診断"
            description="この人数の中で選ばれるプロフィールになっているかを点検します。"
            tags={["本文貼り付け", "約2分"]}
            href="/prof"
            ctaLabel="プロフ診断を開く →"
          />
        </div>
      </section>

      {adjustmentPanel ? <div className="mt-6">{adjustmentPanel}</div> : null}
      {logicPanel ? <div className="mt-4">{logicPanel}</div> : null}
      {supportSection ? <div className="mt-6">{supportSection}</div> : null}

      <p className="mt-6 text-xs leading-6 text-[var(--text-sub)]">
        ※ 総務省「国勢調査（令和2年）」、厚生労働省「賃金構造基本統計調査」、厚生労働省「国民健康・栄養調査」、文部科学省「学校基本調査」をもとにした推計値です。各条件を独立と仮定した概算であり、実際の人数とは異なる場合があります。
      </p>
    </section>
  );
}
