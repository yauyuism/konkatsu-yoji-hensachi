import { forwardRef } from "react";

import { OPTIMAL_ZONES, WEIGHT_JUDGMENT_META, getSituationOption } from "@/data/weight";
import type { Situation } from "@/data/weight";
import type { WeightResult, WeightSourceMeta } from "@/lib/weight-types";

type ShareImageProps = {
  situation: Situation;
  result: WeightResult;
  sourceMeta: WeightSourceMeta;
};

export const ShareImage = forwardRef<HTMLDivElement, ShareImageProps>(function ShareImage({ situation, result, sourceMeta }, ref) {
  const situationOption = getSituationOption(situation);
  const judgmentMeta = WEIGHT_JUDGMENT_META[result.judgment];
  const zone = OPTIMAL_ZONES[situation];
  const maxWeight = Math.max(zone.veryHeavyThreshold + 0.5, result.totalWeight + 0.5, result.partnerWeight + 0.5, 4);
  const myWidth = `${(result.totalWeight / maxWeight) * 100}%`;
  const partnerWidth = `${(result.partnerWeight / maxWeight) * 100}%`;
  const zoneWidth = `${((zone.max - zone.min) / maxWeight) * 100}%`;
  const zoneLeft = `${(zone.min / maxWeight) * 100}%`;
  const diffLabel = result.weightDiff > 0 ? `+${result.weightDiff.toFixed(1)}` : result.weightDiff.toFixed(1);

  return (
    <div
      ref={ref}
      className="w-[560px] rounded-[1.8rem] border border-[color:var(--line)] bg-white p-6 shadow-[0_24px_60px_rgba(26,26,26,0.08)]"
    >
      <p className="text-center text-xs font-bold tracking-[0.22em] text-[var(--accent)]">MESSAGE WEIGHT</p>
      <p className="mt-4 text-center text-base font-black text-[var(--text-main)]">
        {situationOption.emoji} {situationOption.label}
      </p>
      <p className="mt-2 text-center text-xs font-bold tracking-[0.16em] text-[var(--text-sub)]">
        {sourceMeta.inputMode === "images" ? `スクショ入力 ${sourceMeta.imageCount}枚` : "テキスト入力"}
      </p>

      <div className="mt-5 rounded-[1.5rem] bg-[linear-gradient(145deg,rgba(232,69,60,0.08),rgba(59,130,246,0.05))] px-5 py-7 text-center">
        <p className="text-lg font-black text-[var(--text-main)]">あなたのメッセージ重量</p>
        <p className="font-numeric mt-3 text-[4.5rem] font-black leading-none" style={{ color: judgmentMeta.color }}>
          {result.totalWeight.toFixed(1)}
        </p>
        <p className="mt-2 text-xl font-black text-[var(--text-main)]">kg</p>
        <p className="mt-2 text-base font-black" style={{ color: judgmentMeta.color }}>
          {judgmentMeta.label}
        </p>
      </div>

      <div className="mt-5 grid gap-3 text-sm font-bold text-[var(--text-main)]">
        <div className="flex items-center justify-between">
          <span>あなた</span>
          <span>{result.totalWeight.toFixed(1)}kg</span>
        </div>
        <div className="h-3 rounded-full bg-[rgba(26,26,26,0.08)]">
          <div className="h-3 rounded-full bg-[#3B82F6]" style={{ width: myWidth }} />
        </div>
        <div className="flex items-center justify-between">
          <span>相手</span>
          <span>{result.partnerWeight.toFixed(1)}kg</span>
        </div>
        <div className="h-3 rounded-full bg-[rgba(26,26,26,0.08)]">
          <div className="h-3 rounded-full bg-[#6B7280]" style={{ width: partnerWidth }} />
        </div>
      </div>

      <div className="mt-5 rounded-[1.3rem] bg-[rgba(248,247,244,0.9)] px-4 py-4">
        <p className="text-xs font-bold tracking-[0.16em] text-[var(--text-sub)]">適正ゾーン</p>
        <div className="relative mt-3 h-4 rounded-full bg-[rgba(26,26,26,0.08)]">
          <div className="absolute top-0 h-4 rounded-full bg-[rgba(16,185,129,0.18)]" style={{ left: zoneLeft, width: zoneWidth }} />
        </div>
        <p className="mt-2 text-sm font-bold text-[var(--text-main)]">
          {zone.min.toFixed(1)}-{zone.max.toFixed(1)}kg / 重量差 {diffLabel}kg
        </p>
      </div>

      <div className="mt-5 rounded-[1.3rem] border border-[rgba(26,26,26,0.08)] bg-white/86 px-4 py-4 text-sm leading-7 text-[var(--text-main)]">
        一番の原因: {result.topFactor.name}（+{result.topFactor.weight.toFixed(1)}kg）
      </div>

      <div className="mt-5 flex items-center justify-between text-sm font-bold text-[var(--text-sub)]">
        <span>#LINEメッセージ重量</span>
        <span>@yauyuism</span>
      </div>
    </div>
  );
});
