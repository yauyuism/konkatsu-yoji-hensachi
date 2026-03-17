"use client";

import { CustomInputCard } from "@/components/my9specs/CustomInputCard";
import { SpecChip } from "@/components/my9specs/SpecChip";
import { SPEC_CATEGORY_ORDER, SPEC_OPTIONS, type SpecCategory } from "@/data/spec-options";
import type { CustomSpecInput } from "@/lib/my9specs";
import {
  getConflictingPresetIds,
  getCustomSpecOption,
  getSelectedCount,
  getSelectedSpecs,
  MY9_SPECS_MAX_SELECTION,
} from "@/lib/my9specs";

type SpecPickerProps = {
  activeCategory: SpecCategory;
  presetIds: string[];
  customInputs: CustomSpecInput[];
  onToggle: (id: string) => void;
  onAddCustom: (category: SpecCategory, text: string) => void;
  onNavigateCategory: (category: SpecCategory) => void;
};

function getOptionsByCategory(category: SpecCategory) {
  return SPEC_OPTIONS.filter((option) => option.category === category);
}

function getNextCategory(category: SpecCategory) {
  const currentIndex = SPEC_CATEGORY_ORDER.indexOf(category);
  if (currentIndex < 0 || currentIndex >= SPEC_CATEGORY_ORDER.length - 1) {
    return null;
  }

  return SPEC_CATEGORY_ORDER[currentIndex + 1] ?? null;
}

export function SpecPicker({
  activeCategory,
  presetIds,
  customInputs,
  onToggle,
  onAddCustom,
  onNavigateCategory,
}: SpecPickerProps) {
  const maxedOut = getSelectedCount(presetIds, customInputs) >= MY9_SPECS_MAX_SELECTION;
  const categoryOptions = getOptionsByCategory(activeCategory);
  const categoryCustomInputs = customInputs.filter((input) => input.category === activeCategory);
  const selectedById = new Set(getSelectedSpecs(presetIds, customInputs).map((option) => option.id));
  const nextCategory = getNextCategory(activeCategory);

  return (
    <section key={activeCategory} className="animate-category-fade">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-black tracking-[-0.02em] text-[var(--text-main)]">{activeCategory}</h3>
        <p className="text-xs font-bold tracking-[0.12em] text-[var(--text-sub)]">{categoryOptions.length} OPTIONS</p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        {categoryOptions.map((option) => (
          <SpecChip
            key={option.id}
            option={option}
            selected={selectedById.has(option.id)}
            disabled={
              maxedOut &&
              !selectedById.has(option.id) &&
              !getConflictingPresetIds(option.id).some((conflictId) => selectedById.has(conflictId))
            }
            onToggle={onToggle}
          />
        ))}

        {categoryCustomInputs.map((input) => {
          const option = getCustomSpecOption(input);

          return (
            <SpecChip
              key={input.id}
              option={option}
              selected
              disabled={false}
              onToggle={onToggle}
            />
          );
        })}

        <CustomInputCard category={activeCategory} disabled={maxedOut} onAdd={(text) => onAddCustom(activeCategory, text)} />
      </div>

      {nextCategory ? (
        <button
          type="button"
          onClick={() => onNavigateCategory(nextCategory)}
          className="mt-6 w-full rounded-[1rem] border border-[rgba(26,26,26,0.08)] bg-white px-5 py-4 text-left text-sm font-bold text-[var(--text-main)] transition hover:border-[rgba(26,26,26,0.2)]"
        >
          次: {nextCategory} →
        </button>
      ) : null}
    </section>
  );
}
