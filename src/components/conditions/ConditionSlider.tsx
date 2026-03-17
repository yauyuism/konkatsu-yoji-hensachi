"use client";

type ConditionSliderProps = {
  options: readonly number[];
  value: number;
  onChange: (value: number) => void;
  valueLabel: string;
  helper?: string;
  startLabel: string;
  endLabel: string;
  ariaLabel?: string;
  activeSide?: "left" | "right";
};

export function ConditionSlider({
  options,
  value,
  onChange,
  valueLabel,
  helper,
  startLabel,
  endLabel,
  ariaLabel,
  activeSide = "left",
}: ConditionSliderProps) {
  const index = Math.max(0, options.findIndex((option) => option === value));
  const progress = options.length > 1 ? (index / (options.length - 1)) * 100 : 0;

  return (
    <div className="rounded-[1.5rem] border border-[rgba(26,26,26,0.08)] bg-white/88 p-4 sm:p-5">
      <div className="flex items-center justify-between text-sm font-bold text-[var(--text-sub)]">
        <span>{startLabel}</span>
        <span>{endLabel}</span>
      </div>

      <div className="relative mt-4 h-10">
        <div className="absolute left-0 top-1/2 h-2 w-full -translate-y-1/2 rounded-full bg-[#E5E7EB]" />
        <div
          className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-[var(--data-bar)]"
          style={
            activeSide === "right"
              ? {
                  left: `${progress}%`,
                  right: 0,
                }
              : {
                  left: 0,
                  width: `${progress}%`,
                }
          }
        />
        <input
          type="range"
          min={0}
          max={options.length - 1}
          step={1}
          value={index}
          onChange={(event) => onChange(options[Number(event.target.value)] ?? options[0])}
          className="condition-slider absolute inset-0"
          aria-label={ariaLabel ?? valueLabel}
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="tag rounded-full px-4 py-2 text-sm font-bold text-[var(--data-bar-strong)]">
          {valueLabel}
        </p>
        {helper ? <p className="text-right text-xs leading-6 text-[var(--text-sub)] sm:text-sm">{helper}</p> : null}
      </div>
    </div>
  );
}
