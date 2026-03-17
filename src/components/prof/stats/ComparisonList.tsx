type ComparisonListProps = {
  title: string;
  data: Array<{
    label: string;
    avg: number | null;
  }>;
  accent?: "red" | "blue";
};

export function ComparisonList({ title, data, accent = "blue" }: ComparisonListProps) {
  const max = Math.max(...data.map((item) => item.avg ?? 0), 1);
  const color = accent === "red" ? "bg-[linear-gradient(90deg,#E8453C,#F97316)]" : "bg-[linear-gradient(90deg,#3B82F6,#60A5FA)]";

  return (
    <div className="rounded-[1.8rem] border border-[color:rgba(26,26,26,0.08)] bg-white/88 p-5 sm:p-6">
      <p className="text-sm font-bold tracking-[0.16em] text-[var(--text-main)]">{title}</p>
      <div className="mt-5 grid gap-3">
        {data.map((item) => (
          <div key={item.label} className="grid grid-cols-[110px_1fr_52px] items-center gap-3 text-sm">
            <p className="font-bold text-[var(--text-main)]">{item.label}</p>
            <div className="relative h-3 overflow-hidden rounded-full bg-[rgba(26,26,26,0.08)]">
              <div
                className={`absolute left-0 top-0 h-full rounded-full ${color}`}
                style={{ width: `${((item.avg ?? 0) / max) * 100}%` }}
              />
            </div>
            <p className="text-right font-bold text-[var(--text-sub)]">{item.avg ?? "-"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
