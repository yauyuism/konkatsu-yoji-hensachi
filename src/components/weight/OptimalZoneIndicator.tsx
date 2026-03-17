import { OPTIMAL_ZONES, WEIGHT_JUDGMENT_META, getSituationOption, type Situation, type WeightJudgment } from "@/data/weight";

type OptimalZoneIndicatorProps = {
  situation: Situation;
  totalWeight: number;
  partnerWeight: number;
  judgment: WeightJudgment;
};

function toPercent(value: number, max: number) {
  return `${(value / max) * 100}%`;
}

export function OptimalZoneIndicator({ situation, totalWeight, partnerWeight, judgment }: OptimalZoneIndicatorProps) {
  const zone = OPTIMAL_ZONES[situation];
  const situationOption = getSituationOption(situation);
  const scaleMax = Math.max(zone.veryHeavyThreshold + 0.8, totalWeight + 0.8, partnerWeight + 0.8, 4);
  const judgmentMeta = WEIGHT_JUDGMENT_META[judgment];

  const zoneMessage = totalWeight < zone.min
    ? `この関係では ${Math.abs(totalWeight - zone.min).toFixed(1)}kg 軽め。`
    : totalWeight > zone.max
      ? `この関係では ${Math.abs(totalWeight - zone.max).toFixed(1)}kg オーバー。`
      : "この関係では適正ゾーン内。";

  return (
    <section className="paper-card rounded-[2rem] border border-[color:var(--line)] bg-[var(--card)] p-5 shadow-[0_28px_70px_rgba(26,26,26,0.08)] sm:p-7">
      <h2 className="text-2xl font-black text-[var(--text-main)]">この関係での適正ゾーン</h2>
      <p className="mt-3 text-sm leading-7 text-[var(--text-sub)]">
        {situationOption.shortLabel}の適正重量は {zone.min.toFixed(1)}-{zone.max.toFixed(1)}kg。{zoneMessage}
      </p>

      <div className="mt-6 rounded-[1.6rem] border border-[rgba(26,26,26,0.08)] bg-white/88 px-4 py-6">
        <div className="relative h-16">
          <div className="absolute left-0 right-0 top-8 h-3 rounded-full bg-[rgba(26,26,26,0.08)]" />
          <div
            className="absolute top-8 h-3 rounded-full bg-[rgba(16,185,129,0.18)]"
            style={{ left: toPercent(zone.min, scaleMax), width: `calc(${toPercent(zone.max - zone.min, scaleMax)})` }}
          />
          <div
            className="absolute top-1 flex -translate-x-1/2 flex-col items-center gap-1"
            style={{ left: toPercent(totalWeight, scaleMax) }}
          >
            <span className="text-xs font-black" style={{ color: judgmentMeta.color }}>
              あなた
            </span>
            <span className="h-6 w-0.5 rounded-full" style={{ backgroundColor: judgmentMeta.color }} />
          </div>
          <div
            className="absolute top-12 flex -translate-x-1/2 flex-col items-center gap-1"
            style={{ left: toPercent(partnerWeight, scaleMax) }}
          >
            <span className="h-5 w-0.5 rounded-full bg-[#6B7280]" />
            <span className="text-xs font-black text-[#6B7280]">相手</span>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 text-xs font-bold text-[var(--text-sub)]">
          <span>0.0kg</span>
          <span>{zone.min.toFixed(1)}kg</span>
          <span>{zone.max.toFixed(1)}kg</span>
          <span>{scaleMax.toFixed(1)}kg</span>
        </div>
      </div>
    </section>
  );
}
