import { profAxisLabels, profAxisOrder, type ProfAxisComments, type ScoreSet } from "@/lib/prof";

type AxisBarChartProps = {
  scores: ScoreSet;
  comments?: ProfAxisComments;
};

export function AxisBarChart({ scores, comments }: AxisBarChartProps) {
  return (
    <div className="grid gap-4">
      {profAxisOrder.map((axis) => (
        <div key={axis}>
          <div className="grid grid-cols-[108px_1fr_42px] items-center gap-3 sm:grid-cols-[132px_1fr_48px]">
            <p className="text-sm font-bold text-[var(--text-main)]">{profAxisLabels[axis]}</p>
            <div className="relative h-3 overflow-hidden rounded-full bg-[rgba(59,130,246,0.1)]">
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-[var(--accent)]"
                style={{ width: `${scores[axis]}%` }}
              />
            </div>
            <p className="font-numeric text-right text-sm font-black text-[var(--text-main)]">{scores[axis]}</p>
          </div>
          {comments?.[axis] ? <p className="mt-2 text-xs leading-6 text-[var(--text-sub)] sm:text-sm">{comments[axis]}</p> : null}
        </div>
      ))}
    </div>
  );
}
