"use client";

type CategoryTabsProps = {
  categories: Array<{
    id: string;
    label: string;
    selectedInCategory: number;
  }>;
  activeCategory: string;
  onSelect: (id: string) => void;
};

export function CategoryTabs({ categories, activeCategory, onSelect }: CategoryTabsProps) {
  return (
    <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
      {categories.map((category) => {
        const isActive = category.id === activeCategory;
        const hasSelection = category.selectedInCategory > 0;

        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect(category.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition ${
              isActive
                ? "bg-[var(--accent)] text-white"
                : hasSelection
                  ? "border border-[rgba(232,69,60,0.3)] bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "border border-[rgba(26,26,26,0.08)] bg-white text-[var(--text-main)]"
            }`}
          >
            <span>{category.label}</span>
            {hasSelection ? (
              <span
                className={`ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-black ${
                  isActive ? "bg-white/30 text-white" : "bg-[var(--accent)] text-white"
                }`}
              >
                {category.selectedInCategory}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
