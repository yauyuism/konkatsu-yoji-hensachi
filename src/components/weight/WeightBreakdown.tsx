import { shouldShowImprovement, getCompactBreakdownItems, buildWeightNarrative } from "@/lib/weight-insights";
import { getSortedFactors } from "@/lib/weight-calculator";
import type { AnalyzeWeightResponse, WeightReplyExample, WeightResult } from "@/lib/weight-types";

type WeightBreakdownProps = {
  result: WeightResult;
  analysisExplanation?: AnalyzeWeightResponse["explanation"] | null;
  analysisImprovement?: AnalyzeWeightResponse["improvement"] | null;
  analysisExample?: WeightReplyExample | null;
  analysisComment?: string | null;
};

function getExplanationHeading(judgment: WeightResult["judgment"]) {
  if (judgment === "balanced") {
    return "会話の特徴";
  }

  if (judgment === "light") {
    return "なぜ軽い？";
  }

  return "なぜ重い？";
}

export function WeightBreakdown({
  result,
  analysisExplanation,
  analysisImprovement,
  analysisExample,
  analysisComment,
}: WeightBreakdownProps) {
  const narrative = buildWeightNarrative(result, {
    explanation: analysisExplanation ?? undefined,
    improvement: analysisImprovement ?? undefined,
    example: analysisExample ?? undefined,
  });
  const compactItems = getCompactBreakdownItems(result.breakdown);
  const fullItems = getSortedFactors(result.breakdown);
  const showImprovement = shouldShowImprovement(result.judgment);

  return (
    <section className="paper-card rounded-[2rem] border border-[color:var(--line)] bg-[var(--card)] p-5 shadow-[0_28px_70px_rgba(26,26,26,0.08)] sm:p-7">
      <h2 className="text-2xl font-black text-[var(--text-main)]">内訳</h2>

      <div className="mt-6 rounded-[1.6rem] border border-[rgba(26,26,26,0.08)] bg-white/92 p-5 sm:p-6">
        <p className="text-base font-black text-[var(--text-main)]">合計 {result.totalWeight.toFixed(1)}kg の内訳</p>

        <div className="mt-5 grid gap-4">
          {compactItems.map((item) => (
            <div key={item.key} className="flex items-center gap-3">
              <span className={`w-24 shrink-0 text-sm ${item.key === "baseWeight" ? "text-[var(--text-sub)]" : "text-[var(--text-main)]"}`}>
                {item.name}
              </span>
              <div className="h-3 flex-1 rounded-full bg-[rgba(26,26,26,0.08)]">
                <div
                  className="h-3 rounded-full"
                  style={{
                    width: `${Math.max(10, (item.weight / result.totalWeight) * 100)}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
              <span className={`font-numeric w-10 text-right text-sm font-black ${item.key === "baseWeight" ? "text-[var(--text-sub)]" : "text-[var(--text-main)]"}`}>
                {item.weight.toFixed(1)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-[rgba(26,26,26,0.08)] pt-4">
          <span className="text-sm font-black text-[var(--text-main)]">合計</span>
          <span className="font-numeric text-base font-black text-[var(--text-main)]">{result.totalWeight.toFixed(1)}kg</span>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-black text-[var(--text-main)]">{getExplanationHeading(result.judgment)}</h3>
        <div className="mt-4 rounded-[1.5rem] bg-[rgba(248,247,244,0.92)] px-5 py-5 text-sm leading-8 text-[var(--text-main)]">
          {narrative.explanation}
        </div>
      </div>

      {showImprovement ? (
        <div className="mt-8">
          <h3 className="text-lg font-black text-[var(--text-main)]">どう直す？</h3>
          <div className="mt-4 rounded-[1.5rem] bg-[rgba(248,247,244,0.92)] px-5 py-5 text-sm leading-8 text-[var(--text-main)]">
            {narrative.improvement}
          </div>

          {narrative.example ? (
            <div className="mt-5 rounded-[1.6rem] border border-[rgba(26,26,26,0.08)] bg-[#FAFAF8] p-5 sm:p-6">
              <p className="text-lg font-black text-[var(--text-main)]">例えばこう返す</p>

              <div className="mt-4 rounded-[0.95rem] border-l-[3px] border-[#EF4444] bg-[#FEF2F2] px-4 py-4">
                <p className="text-xs font-bold text-[#EF4444]">✕ 今の送り方</p>
                <p className="mt-2 text-[15px] leading-7 text-[var(--text-main)]">{narrative.example.before}</p>
              </div>

              <div className="my-3 text-center text-xl text-[#9CA3AF]">↓</div>

              <div className="rounded-[0.95rem] border-l-[3px] border-[#10B981] bg-[#F0FDF4] px-4 py-4">
                <p className="text-xs font-bold text-[#10B981]">○ こう変える</p>
                <p className="mt-2 text-[15px] leading-7 text-[var(--text-main)]">{narrative.example.after}</p>
              </div>

              <p className="mt-3 text-sm leading-7 text-[var(--text-sub)]">→ {narrative.example.reason}</p>
            </div>
          ) : null}
        </div>
      ) : null}

      <details className="mt-8 rounded-[1.5rem] border border-[rgba(26,26,26,0.08)] bg-white/88 px-4 py-4 sm:px-5">
        <summary className="cursor-pointer list-none text-sm font-black text-[var(--text-main)] [&::-webkit-details-marker]:hidden">
          全項目の数値を見る
        </summary>

        <div className="mt-4 grid gap-4">
          {fullItems.map((factor) => (
            <div key={factor.key} className="rounded-[1.2rem] bg-[rgba(248,247,244,0.92)] px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-black text-[var(--text-main)]">{factor.name}</p>
                <p className="font-numeric text-base font-black text-[var(--text-main)]">+{factor.weight.toFixed(1)}kg</p>
              </div>
              <p className="mt-2 text-sm leading-7 text-[var(--text-sub)]">{factor.detail}</p>
            </div>
          ))}

          <div className="rounded-[1.2rem] bg-[rgba(248,247,244,0.92)] px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-black text-[var(--text-main)]">基礎重量</p>
              <p className="font-numeric text-base font-black text-[var(--text-main)]">{result.breakdown.baseWeight.weight.toFixed(1)}kg</p>
            </div>
            <p className="mt-2 text-sm leading-7 text-[var(--text-sub)]">{result.breakdown.baseWeight.detail}</p>
          </div>

          {analysisComment ? (
            <div className="rounded-[1.2rem] bg-[rgba(248,247,244,0.92)] px-4 py-4">
              <p className="text-sm font-black text-[var(--text-main)]">AIの構造メモ</p>
              <p className="mt-2 text-sm leading-7 text-[var(--text-sub)]">{analysisComment}</p>
            </div>
          ) : null}
        </div>
      </details>
    </section>
  );
}
