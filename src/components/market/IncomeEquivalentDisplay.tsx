import type { ReactNode } from "react";

import { formatMarketPercent } from "@/lib/market";
import { MARKET_GENDER_LABELS } from "@/data/market";
import type { MarketGender } from "@/data/market";

type IncomeEquivalentDisplayProps = {
  gender: MarketGender;
  incomeEquivalent: number;
  overallPercentile: number;
  note: string;
  actions?: ReactNode;
};

function formatHeroIncome(value: number) {
  if (value >= 2000) {
    return {
      value: "2,000+",
      unit: "万円",
    };
  }

  if (value <= 100) {
    return {
      value: "100",
      unit: "万円以下",
    };
  }

  return {
    value: value.toLocaleString(),
    unit: "万円",
  };
}

export function IncomeEquivalentDisplay({
  gender,
  incomeEquivalent,
  overallPercentile,
  note,
  actions,
}: IncomeEquivalentDisplayProps) {
  const heroIncome = formatHeroIncome(incomeEquivalent);

  return (
    <section className="paper-card rounded-[2rem] border border-[color:var(--line)] bg-[var(--card)] p-5 shadow-[0_28px_70px_rgba(26,26,26,0.08)] sm:p-7">
      <p className="eyebrow mx-auto w-fit rounded-full px-4 py-2 text-[0.72rem] font-bold tracking-[0.22em] text-[var(--accent)]">
        MARKET VALUE - RESULT
      </p>

      <div className="mt-6 text-center">
        <p className="text-base font-bold tracking-[0.06em] text-[var(--text-sub)]">あなたの婚活スペックの希少性は</p>
        <div className="mt-6 rounded-[1.8rem] border border-[rgba(232,69,60,0.14)] bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(255,245,240,0.92))] px-5 py-8 sm:px-7 sm:py-10">
          <p className="text-sm font-bold tracking-[0.16em] text-[var(--text-sub)]">年収換算</p>
          <div className="mt-4 flex flex-wrap items-end justify-center gap-x-2 gap-y-1 sm:gap-x-3">
            <span className="text-xl font-bold text-[var(--text-sub)] sm:text-2xl">年収</span>
            <span className="font-numeric text-[4.5rem] font-black leading-none tracking-[-0.02em] text-[var(--hero-number)] sm:text-[6rem]">
              {heroIncome.value}
            </span>
            <span className="text-xl font-bold text-[var(--text-main)] sm:text-2xl">{heroIncome.unit}</span>
          </div>
          <p className="mt-3 text-lg font-black text-[var(--text-main)] sm:text-xl">相当のレア度</p>
          <p className="mt-3 text-sm font-bold text-[var(--text-sub)]">
            未婚{MARKET_GENDER_LABELS[gender]}の上位 {formatMarketPercent(overallPercentile)}%
          </p>
        </div>

        <div className="mt-4 rounded-[1.3rem] border border-[rgba(59,130,246,0.14)] bg-[rgba(59,130,246,0.08)] px-4 py-4 text-sm leading-7 text-[var(--text-main)]">
          スペックは各軸の「上位○%」を掛け合わせた総合順位です。同じ順位にいる年収で例えています。
        </div>
      </div>

      {actions ? <div className="mt-6">{actions}</div> : null}

      <p className="mt-4 text-xs leading-6 text-[var(--text-tertiary)]">{note}</p>
    </section>
  );
}
