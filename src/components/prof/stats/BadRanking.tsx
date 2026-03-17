type BadRankingProps = {
  data: Array<{
    category: string;
    count: number;
  }>;
  total: number;
};

const icons = ["🥇", "🥈", "🥉"];

export function BadRanking({ data, total }: BadRankingProps) {
  return (
    <div className="rounded-[1.8rem] border border-[color:rgba(26,26,26,0.08)] bg-white/88 p-5 sm:p-6">
      <p className="text-sm font-bold tracking-[0.16em] text-[var(--text-main)]">みんながやりがちなミス TOP5</p>
      <div className="mt-5 grid gap-4">
        {data.slice(0, 5).map((item, index) => {
          const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
          return (
            <div key={item.category} className="rounded-[1.4rem] border border-[rgba(26,26,26,0.08)] bg-[var(--paper)] px-4 py-4">
              <p className="text-base font-black text-[var(--text-main)]">
                {icons[index] ?? `${index + 1}.`} {item.category}（{percentage}%）
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
