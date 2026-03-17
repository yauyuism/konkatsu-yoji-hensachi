import type { HensachiAxisInfo } from "@/lib/hensachi";

type HensachiAxisBarsProps = {
  axes: HensachiAxisInfo[];
};

export function HensachiAxisBars({ axes }: HensachiAxisBarsProps) {
  return (
    <div className="grid gap-4">
      {axes.map((axis) => (
        <div key={axis.code}>
          <div className="mb-2 flex items-center justify-between gap-4 text-sm">
            <span className="font-bold text-[var(--text-main)]">{axis.label}</span>
            <span className="number-display font-black text-[var(--text-main)]">{axis.hensachi}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-[rgba(59,130,246,0.12)]">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#3B82F6,#60A5FA)] transition-[width] duration-700 ease-out"
              style={{ width: `${axis.hensachi}%` }}
            />
          </div>
          <p className="mt-2 text-sm leading-6 text-[var(--text-sub)]">{axis.comment}</p>
        </div>
      ))}
    </div>
  );
}
