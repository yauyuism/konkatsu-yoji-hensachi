import type { WeightTopFactor } from "@/lib/weight-types";

type BiggestFactorSectionProps = {
  topFactor: WeightTopFactor;
  analysisComment?: string | null;
};

export function BiggestFactorSection({ topFactor, analysisComment }: BiggestFactorSectionProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.02fr_0.98fr]">
      <section className="rounded-[1.8rem] border border-[rgba(232,69,60,0.14)] bg-[var(--accent-soft)] p-5 sm:p-6">
        <p className="text-sm font-bold tracking-[0.16em] text-[var(--accent)]">一番の原因</p>
        <p className="mt-4 text-lg font-black text-[var(--text-main)]">
          {topFactor.name} <span className="font-numeric text-[var(--accent)]">+{topFactor.weight.toFixed(1)}kg</span>
        </p>
        <p className="mt-3 text-sm leading-8 text-[var(--text-main)]">{topFactor.detail}</p>
      </section>

      <section className="soft-panel rounded-[1.8rem] p-5 sm:p-6">
        <p className="text-sm font-bold tracking-[0.16em] text-[var(--text-main)]">AIの構造分析</p>
        <p className="mt-4 text-sm leading-8 text-[var(--text-main)]">
          {analysisComment ?? "共有用ページでは構造コメントを省略しています。元の結果ページで見ると、会話の癖をもう少し細かく確認できます。"}
        </p>
        <p className="mt-4 text-xs leading-6 text-[var(--text-sub)]">
          このコメントは会話の構造だけを要約したものです。重量の数字自体は固定の計算式で算出しています。
        </p>
      </section>
    </div>
  );
}
