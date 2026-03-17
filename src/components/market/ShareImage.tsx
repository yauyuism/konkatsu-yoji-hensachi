import { forwardRef } from "react";

import { MARKET_GENDER_LABELS } from "@/data/market";
import { formatMarketPercent, getMarketShareSpecSummary, type MarketAnalysis, type MarketUserSpec } from "@/lib/market";

type ShareImageProps = {
  user: MarketUserSpec;
  analysis: MarketAnalysis;
};

export const ShareImage = forwardRef<HTMLDivElement, ShareImageProps>(function ShareImage(
  { user, analysis },
  ref
) {
  return (
    <div
      ref={ref}
      className="w-[560px] rounded-[1.8rem] border border-[color:var(--line)] bg-white p-6 shadow-[0_24px_60px_rgba(26,26,26,0.08)]"
    >
      <p className="text-center text-xs font-bold tracking-[0.22em] text-[var(--accent)]">MARKET VALUE</p>

      <div className="mt-6 rounded-[1.5rem] bg-[linear-gradient(145deg,rgba(232,69,60,0.08),rgba(249,115,22,0.05))] px-5 py-8 text-center">
        <p className="text-lg font-black text-[var(--text-main)]">あなたの婚活スペックの希少性は</p>
        <div className="mt-4 flex items-end justify-center gap-2">
          <span className="text-xl font-bold text-[var(--text-sub)]">年収</span>
          <span className="font-numeric text-[5rem] font-black leading-none text-[#E8453C]">{analysis.incomeEquivalent}</span>
          <span className="text-xl font-bold text-[var(--text-sub)]">万円</span>
        </div>
        <p className="mt-2 text-lg font-black text-[var(--text-main)]">相当のレア度</p>
        <p className="mt-3 text-base font-bold text-[var(--text-sub)]">
          未婚{MARKET_GENDER_LABELS[user.gender]}の上位 {formatMarketPercent(analysis.overallPercentile)}%
        </p>
        <p className="mt-2 text-xs leading-6 text-[var(--text-sub)]">各スペックのレア度を掛け合わせた概算</p>
      </div>

      <div className="mt-5 rounded-[1.3rem] border border-[rgba(26,26,26,0.08)] bg-[rgba(248,247,244,0.9)] px-4 py-4 text-sm leading-7 text-[var(--text-main)]">
        {getMarketShareSpecSummary(user)}
      </div>

      <div className="mt-5 flex items-center justify-between text-sm font-bold text-[var(--text-sub)]">
        <span>#婚活スペック年収換算</span>
        <span>@yauyuism</span>
      </div>
    </div>
  );
});
