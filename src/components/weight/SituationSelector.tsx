"use client";

import { SITUATION_OPTIONS, type Situation } from "@/data/weight";

type SituationSelectorProps = {
  value: Situation | null;
  onChange: (value: Situation) => void;
};

export function SituationSelector({ value, onChange }: SituationSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {SITUATION_OPTIONS.map((option) => {
        const active = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`choice-button rounded-[1rem] border px-3 py-3 text-center transition sm:rounded-[1.2rem] sm:px-4 sm:py-4 ${
              active
                ? "border-[rgba(232,69,60,0.28)] bg-[var(--accent-soft)]"
                : "border-[rgba(26,26,26,0.08)] bg-white/88"
            }`}
          >
            <div className="flex flex-col items-center">
              <span className="text-2xl leading-none">{option.emoji}</span>
              <p className={`mt-2 text-[0.82rem] font-black leading-5 sm:hidden ${active ? "text-[var(--accent)]" : "text-[var(--text-main)]"}`}>
                {option.shortLabel}
              </p>
              <p className={`mt-2 hidden text-[0.82rem] font-black leading-5 sm:block ${active ? "text-[var(--accent)]" : "text-[var(--text-main)]"}`}>
                {option.label}
              </p>
              <p className="mt-1 hidden text-[0.68rem] leading-5 text-[var(--text-sub)] sm:block">{option.sub}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
