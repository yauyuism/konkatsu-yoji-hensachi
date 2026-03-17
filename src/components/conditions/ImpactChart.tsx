import { formatConditionsCountLabel, type ImpactResult } from "@/lib/conditions";

type ImpactChartProps = {
  impacts: ImpactResult[];
  totalPoolCount: number;
};

function formatMultiplier(multiplier: number | null) {
  if (multiplier === null) {
    return "∞";
  }

  return multiplier.toFixed(1);
}

function getImpactStyle(multiplier: number | null) {
  if (multiplier === null || multiplier >= 3) {
    return { fontSize: "3rem", color: "#10B981" };
  }

  if (multiplier >= 2) {
    return { fontSize: "2.5rem", color: "#10B981" };
  }

  if (multiplier >= 1.5) {
    return { fontSize: "2.2rem", color: "#10B981" };
  }

  return { fontSize: "2rem", color: "#6B7280" };
}

function getImpactComment(rank: number, impact: ImpactResult) {
  if (impact.multiplier === null) {
    return `${impact.condition}条件を外すだけで候補が立ち上がります。まず見直すならここ。`;
  }

  if (rank === 0) {
    return `${impact.condition}条件を外すだけで候補が${impact.multiplier.toFixed(1)}倍に。一番コスパの高い条件緩和です。`;
  }

  if (impact.multiplier >= 2) {
    return `${impact.condition}を緩めると候補が倍増。かなり効く条件です。`;
  }

  if (impact.multiplier >= 1.5) {
    return `${impact.condition}を外すと5割以上増えます。地味ですが効きます。`;
  }

  return `${impact.condition}の影響は小さめ。この条件は優先して守ってもよさそうです。`;
}

function getRankLabel(index: number) {
  if (index === 0) {
    return "🥇";
  }
  if (index === 1) {
    return "🥈";
  }
  if (index === 2) {
    return "🥉";
  }
  return `${index + 1}.`;
}

function getAfterLabel(impact: ImpactResult) {
  return impact.label.split(" → ")[1] ?? impact.label;
}

export function ImpactChart({ impacts, totalPoolCount }: ImpactChartProps) {
  const maxIncrease = impacts.reduce((max, impact) => Math.max(max, impact.increase), 0);

  if (impacts.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-[rgba(26,26,26,0.08)] bg-white/92 px-5 py-5">
        <p className="text-sm font-black text-[var(--text-main)]">いまは外せる条件がほとんどありません</p>
        <p className="mt-2 text-sm leading-7 text-[var(--text-sub)]">
          条件がほぼ指定なしなので、このセクションは表示されません。まずは年収かエリアを1つだけ足してみると差が出ます。
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {impacts.map((impact, index) => {
        const width = maxIncrease > 0 ? (impact.increase / maxIncrease) * 100 : 0;
        const style = getImpactStyle(impact.multiplier);
        const increasePercent = impact.before > 0 ? ((impact.after - impact.before) / impact.before) * 100 : null;

        return (
          <article
            key={impact.key}
            className="rounded-[1.7rem] border border-[rgba(16,185,129,0.14)] bg-white/94 px-5 py-5 shadow-[0_16px_34px_rgba(16,185,129,0.06)] sm:px-6"
          >
            <div className="flex items-center gap-3 text-sm font-black text-[var(--text-main)]">
              <span className="text-base">{getRankLabel(index)}</span>
              <span>{impact.condition}を「{getAfterLabel(impact)}」にすると</span>
            </div>

            <p className="font-numeric mt-4 text-base font-black text-[var(--text-main)] sm:text-lg">
              {formatConditionsCountLabel(impact.before)} → {formatConditionsCountLabel(impact.after)}
            </p>

            <p className="font-numeric mt-4 font-black leading-none" style={style}>
              × {formatMultiplier(impact.multiplier)}
            </p>

            <div className="mt-4">
              <div className="h-3 overflow-hidden rounded-full bg-[rgba(16,185,129,0.12)]">
                <div
                  className="h-full rounded-full bg-[var(--positive)]"
                  style={{ width: `${Math.max(18, width)}%` }}
                />
              </div>
              <p className="mt-2 text-right text-sm font-black text-[var(--positive)]">
                {increasePercent === null ? "+∞%" : `+${Math.round(increasePercent)}%`}
              </p>
            </div>

            <p className="mt-4 text-sm leading-7 text-[var(--text-sub)]">{getImpactComment(index, impact)}</p>
          </article>
        );
      })}

      <div className="rounded-[1.4rem] border border-[rgba(26,26,26,0.08)] bg-[rgba(248,247,244,0.92)] px-4 py-4 text-sm leading-7 text-[var(--text-sub)]">
        <span className="font-black text-[var(--text-main)]">全部外すと:</span> {formatConditionsCountLabel(totalPoolCount)}（未婚異性の全数）
      </div>
    </div>
  );
}
