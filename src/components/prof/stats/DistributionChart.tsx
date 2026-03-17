type DistributionChartProps = {
  data: Array<{
    band: string;
    count: number;
    percentage: number;
  }>;
};

export function DistributionChart({ data }: DistributionChartProps) {
  const max = Math.max(...data.map((item) => item.count), 1);

  return (
    <div className="rounded-[1.8rem] border border-[color:rgba(26,26,26,0.08)] bg-white/88 p-5 sm:p-6">
      <p className="text-sm font-bold tracking-[0.16em] text-[var(--text-main)]">偏差値の分布</p>
      <div className="mt-5 grid gap-3">
        {data.map((item) => (
          <div key={item.band} className="grid grid-cols-[70px_1fr_58px] items-center gap-3 text-sm">
            <p className="font-bold text-[var(--text-main)]">{item.band}</p>
            <div className="relative h-3 overflow-hidden rounded-full bg-[rgba(59,130,246,0.08)]">
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-[linear-gradient(90deg,#3B82F6,#60A5FA)]"
                style={{ width: `${(item.count / max) * 100}%` }}
              />
            </div>
            <p className="text-right font-bold text-[var(--text-sub)]">{item.percentage}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}
