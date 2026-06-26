type MethodologyDisclosureProps = {
  steps: string[];
};

export function MethodologyDisclosure({ steps }: MethodologyDisclosureProps) {
  return (
    <details className="paper-card rounded-[2rem] border border-[color:var(--line)] bg-[var(--card)] p-5 shadow-[0_28px_70px_rgba(26,26,26,0.08)] sm:p-7">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-2xl font-black text-[var(--text-main)] [&::-webkit-details-marker]:hidden">
        <span>計算ロジック</span>
        <span className="text-sm font-bold tracking-[0.08em] text-[var(--text-sub)]">タップで展開</span>
      </summary>
      <div className="mt-4 grid gap-3">
        {steps.map((step) => (
          <div key={step} className="rounded-[1.3rem] border border-[rgba(26,26,26,0.08)] bg-white/86 px-4 py-4 text-sm leading-7 text-[var(--text-main)]">
            {step}
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-[1.4rem] bg-[rgba(248,247,244,0.92)] px-4 py-4 text-sm leading-7 text-[var(--text-sub)]">
        データソース: 総務省「国勢調査」、国税庁「民間給与実態統計調査」、厚生労働省「国民健康・栄養調査」、文部科学省「学校基本調査」、
        国立社会保障・人口問題研究所「出生動向基本調査」、リクルートブライダル総研「婚活実態調査」ベースの推計値です。各軸を年収分布に置き換えた概算です。
      </div>
    </details>
  );
}
