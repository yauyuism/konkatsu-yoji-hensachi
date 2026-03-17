import { forwardRef } from "react";

import type { CalculationSummary, Conditions } from "@/lib/conditions";
import { formatConditionsCountLabel, getConditionSummaryInline } from "@/lib/conditions";

type ShareImageProps = {
  conditions: Conditions;
  summary: CalculationSummary;
};

export const ShareImage = forwardRef<HTMLDivElement, ShareImageProps>(function ShareImage(
  { conditions, summary },
  ref
) {
  return (
    <div
      ref={ref}
      className="w-[520px] rounded-[1.8rem] border border-[color:var(--line)] bg-white p-6 shadow-[0_24px_60px_rgba(26,26,26,0.08)]"
    >
      <p className="text-center text-xs font-bold tracking-[0.22em] text-[var(--accent)]">CONDITION CHECK</p>

      <div className="mt-6 rounded-[1.5rem] bg-[linear-gradient(145deg,rgba(232,69,60,0.08),rgba(59,130,246,0.06))] px-5 py-8 text-center">
        <p className="text-lg font-black text-[var(--text-main)]">あなたの条件に当てはまるのは</p>
        <p className="font-numeric mt-5 text-[4.2rem] font-black leading-none" style={{ color: summary.percentage < 0.2 ? "#E8453C" : "#3B82F6" }}>
          {formatConditionsCountLabel(summary.count)}
        </p>
        <p className="mt-3 text-base font-bold text-[var(--text-sub)]">未婚者全体の {summary.percentage.toFixed(2)}%</p>
      </div>

      <div className="mt-5 rounded-[1.3rem] border border-[rgba(26,26,26,0.08)] bg-[rgba(248,247,244,0.9)] px-4 py-4 text-sm leading-7 text-[var(--text-main)]">
        {getConditionSummaryInline(conditions)}
      </div>

      <div className="mt-5 flex items-center justify-between text-sm font-bold text-[var(--text-sub)]">
        <span>#条件リアリティチェック</span>
        <span>@yauyuism</span>
      </div>
    </div>
  );
});
