import { WEIGHT_JUDGMENT_META } from "@/data/weight";
import type { WeightSituationComparison } from "@/lib/weight-types";

type SituationComparisonCardProps = {
  comparisons: WeightSituationComparison[];
};

export function SituationComparisonCard({ comparisons }: SituationComparisonCardProps) {
  if (comparisons.length === 0) {
    return null;
  }

  const balancedTarget = comparisons.find((item) => item.judgment === "balanced");
  const insight = balancedTarget ? `もし「${balancedTarget.label}」だったら適正。今の重さは、その関係性を前提にした温度感です。` : null;

  return (
    <details className="soft-panel rounded-[1.8rem] p-5 sm:p-6">
      <summary className="cursor-pointer list-none text-base font-black text-[var(--text-main)] [&::-webkit-details-marker]:hidden">
        もしこの関係が変わったら？
      </summary>

      <p className="mt-4 text-sm leading-7 text-[var(--text-sub)]">
        同じ重量を、別の関係に当てはめたときの見え方です。気持ちの本当の温度が見えやすくなります。
      </p>

      <div className="mt-6 grid gap-3">
        {comparisons.map((item) => (
          <div
            key={item.situation}
            className="flex flex-wrap items-center justify-between gap-3 rounded-[1.4rem] border border-[rgba(26,26,26,0.08)] bg-white/88 px-4 py-4"
          >
            <p className="text-sm font-black text-[var(--text-main)]">もし「{item.label}」だったら</p>
            <span
              className="rounded-full px-3 py-1 text-sm font-black"
              style={{
                color: WEIGHT_JUDGMENT_META[item.judgment].color,
                backgroundColor: `${WEIGHT_JUDGMENT_META[item.judgment].color}14`,
              }}
            >
              {item.judgmentLabel}
            </span>
          </div>
        ))}
      </div>

      {insight ? (
        <div className="mt-5 rounded-[1.4rem] bg-[rgba(16,185,129,0.08)] px-4 py-4 text-sm leading-7 text-[#047857]">
          {insight}
        </div>
      ) : null}
    </details>
  );
}
