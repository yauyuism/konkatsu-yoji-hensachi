"use client";

import type { SpecOption } from "@/data/spec-options";

type SpecChipProps = {
  option: SpecOption;
  selected: boolean;
  disabled: boolean;
  onToggle: (id: string) => void;
};

export function SpecChip({ option, selected, disabled, onToggle }: SpecChipProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(option.id)}
      disabled={disabled && !selected}
      aria-pressed={selected}
      className={`spec-card group flex min-h-[88px] flex-col items-center justify-center rounded-[1rem] px-2 py-3 text-center transition ${
        disabled && !selected ? "cursor-not-allowed opacity-45" : "cursor-pointer hover:border-[rgba(26,26,26,0.2)]"
      }`}
    >
      <span className="text-[1.2rem] leading-none">{option.emoji}</span>
      <span className="mt-2 text-[0.78rem] font-bold leading-5 text-[var(--text-main)] sm:text-[0.82rem]">{option.label}</span>
      <span
        className="check-badge mt-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-black"
      >
        ✓
      </span>
    </button>
  );
}
