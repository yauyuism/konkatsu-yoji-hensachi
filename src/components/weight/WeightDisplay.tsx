import { WEIGHT_JUDGMENT_META, getSituationOption, type Situation, type WeightJudgment } from "@/data/weight";

type WeightDisplayProps = {
  situation: Situation;
  totalWeight: number;
  judgment: WeightJudgment;
};

export function WeightDisplay({ situation, totalWeight, judgment }: WeightDisplayProps) {
  const situationOption = getSituationOption(situation);
  const judgmentMeta = WEIGHT_JUDGMENT_META[judgment];

  return (
    <section className="paper-card rounded-[2rem] border border-[color:var(--line)] bg-[var(--card)] p-5 shadow-[0_28px_70px_rgba(26,26,26,0.08)] sm:p-7">
      <p className="eyebrow mx-auto w-fit rounded-full px-4 py-2 text-[0.72rem] font-bold tracking-[0.22em] text-[var(--accent)]">
        MESSAGE WEIGHT RESULT
      </p>

      <div className="mt-5 text-center">
        <p className="text-sm font-bold tracking-[0.16em] text-[var(--text-sub)]">相手との関係</p>
        <p className="mt-2 text-lg font-black text-[var(--text-main)] sm:text-xl">
          {situationOption.emoji} {situationOption.label}
        </p>
      </div>

      <div
        className="mt-8 rounded-[1.7rem] px-5 py-8 text-center"
        style={{
          background: `linear-gradient(145deg, ${judgmentMeta.color}14, rgba(59,130,246,0.05))`,
        }}
      >
        <p className="text-sm font-bold tracking-[0.16em] text-[var(--text-sub)]">あなたのメッセージ重量</p>
        <p className="font-numeric mt-4 text-6xl font-black sm:text-7xl" style={{ color: judgmentMeta.color }}>
          {totalWeight.toFixed(1)}
        </p>
        <p className="mt-2 text-xl font-black text-[var(--text-main)]">kg</p>
        <p className="mt-3 text-base font-black" style={{ color: judgmentMeta.color }}>
          判定: {judgmentMeta.label}
        </p>
      </div>
    </section>
  );
}
