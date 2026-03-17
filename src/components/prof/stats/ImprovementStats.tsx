type ImprovementStatsProps = {
  avg: number;
  max: number;
  improvedAverage: number;
};

export function ImprovementStats({ avg, max, improvedAverage }: ImprovementStatsProps) {
  return (
    <div className="rounded-[1.8rem] border border-[rgba(16,185,129,0.16)] bg-white/88 p-5 sm:p-6">
      <p className="text-sm font-bold tracking-[0.16em] text-[var(--text-main)]">AIが出した改善で何点上がる？</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-[1.4rem] bg-[rgba(16,185,129,0.08)] px-4 py-4">
          <p className="text-xs font-bold tracking-[0.14em] text-[#047857]">平均改善幅</p>
          <p className="font-numeric mt-2 text-4xl font-black text-[#10B981]">+{avg}</p>
        </div>
        <div className="rounded-[1.4rem] bg-[rgba(232,69,60,0.08)] px-4 py-4">
          <p className="text-xs font-bold tracking-[0.14em] text-[var(--accent)]">最大改善幅</p>
          <p className="font-numeric mt-2 text-4xl font-black text-[var(--accent)]">+{max}</p>
        </div>
        <div className="rounded-[1.4rem] bg-[rgba(59,130,246,0.08)] px-4 py-4">
          <p className="text-xs font-bold tracking-[0.14em] text-[#2563EB]">改善後平均</p>
          <p className="font-numeric mt-2 text-4xl font-black text-[#3B82F6]">{improvedAverage}</p>
        </div>
      </div>
    </div>
  );
}
