import type { SelectedSpecOption } from "@/lib/my9specs";

type NineGridProps = {
  selected: SelectedSpecOption[];
  title?: string;
  subtitle?: string;
  compact?: boolean;
};

export function NineGrid({
  selected,
  title = "あなたの譲れない9条件",
  subtitle = "#私の譲れない9条件",
  compact = false,
}: NineGridProps) {
  return (
    <div
      className={`overflow-hidden rounded-[1.8rem] border border-[rgba(26,26,26,0.08)] bg-[linear-gradient(145deg,#fffdf9_0%,#fff6f2_100%)] ${
        compact ? "p-4 sm:p-5" : "p-5 sm:p-6"
      }`}
    >
      <p className="font-numeric text-[0.72rem] font-black tracking-[0.22em] text-[var(--accent)]">MY 9 SPECS</p>
      <h3 className={`mt-2 font-black tracking-[-0.02em] text-[var(--text-main)] ${compact ? "text-lg" : "text-xl sm:text-[1.45rem]"}`}>
        {title}
      </h3>

      <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
        {selected.slice(0, 9).map((option) => (
          <div
            key={option.id}
            className={`flex aspect-square flex-col items-center justify-center rounded-[1.15rem] border border-[rgba(26,26,26,0.08)] bg-white px-2 text-center ${
              compact ? "min-h-[96px]" : "min-h-[112px] sm:min-h-[126px]"
            }`}
          >
            <span className={`${compact ? "text-[1.35rem]" : "text-[1.5rem] sm:text-[1.75rem]"}`}>{option.emoji}</span>
            <span className={`mt-2 font-bold leading-5 text-[var(--text-main)] ${compact ? "text-[0.72rem]" : "text-[0.82rem] sm:text-[0.9rem]"}`}>
              {option.label}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between gap-4 border-t border-[rgba(26,26,26,0.08)] pt-4 text-xs font-bold tracking-[0.08em] text-[var(--text-sub)]">
        <span>{subtitle}</span>
        <span>@yauyuism</span>
      </div>
    </div>
  );
}
