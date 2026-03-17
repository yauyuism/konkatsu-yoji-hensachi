"use client";

import { useEffect, useState, useTransition } from "react";

import { CategoryTabs } from "@/components/my9specs/CategoryTabs";
import { My9SpecsResultPanel } from "@/components/my9specs/My9SpecsResultPanel";
import { SpecPicker } from "@/components/my9specs/SpecPicker";
import { StickyProgressBar } from "@/components/my9specs/StickyProgressBar";
import { SPEC_CATEGORY_ORDER, type SpecCategory } from "@/data/spec-options";
import type { CustomSpecInput } from "@/lib/my9specs";
import {
  addCustomSpec,
  getFirstSelectedCategory,
  getMy9SpecsEstimate,
  getSelectedCount,
  getSelectedCountInCategory,
  getSelectedSpecs,
  MY9_SPECS_MAX_SELECTION,
  removeCustomSpec,
  togglePresetSpec,
} from "@/lib/my9specs";
import { getMy9SpecsBuilderPath } from "@/lib/my9specs-share";

type My9SpecsAppProps = {
  initialTargetGender?: "male" | "female";
  initialPresetIds?: string[];
  initialCustomInputs?: CustomSpecInput[];
};

function formatLivePercentage(value: number) {
  if (value < 0.01) {
    return `${value.toFixed(4)}%`;
  }

  if (value < 0.1) {
    return `${value.toFixed(3)}%`;
  }

  return `${value.toFixed(2)}%`;
}

export function My9SpecsApp({
  initialTargetGender = "male",
  initialPresetIds = [],
  initialCustomInputs = [],
}: My9SpecsAppProps) {
  const [targetGender, setTargetGender] = useState<"male" | "female">(initialTargetGender);
  const [presetIds, setPresetIds] = useState<string[]>(initialPresetIds);
  const [customInputs, setCustomInputs] = useState<CustomSpecInput[]>(initialCustomInputs);
  const [activeCategory, setActiveCategory] = useState<SpecCategory>(
    getFirstSelectedCategory(initialPresetIds, initialCustomInputs)
  );
  const [showResult, setShowResult] = useState(false);
  const [selectionPanelOpen, setSelectionPanelOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const selected = getSelectedSpecs(presetIds, customInputs);
  const liveEstimate = getMy9SpecsEstimate(selected, targetGender);
  const totalSelected = selected.length;
  const isComplete = totalSelected === MY9_SPECS_MAX_SELECTION;
  const displayResult = showResult && isComplete;

  const categories = SPEC_CATEGORY_ORDER.map((category) => ({
    id: category,
    label: category,
    selectedInCategory: getSelectedCountInCategory(category, presetIds, customInputs),
  }));

  useEffect(() => {
    if (!displayResult) {
      return;
    }

    window.requestAnimationFrame(() => {
      document.getElementById("my9specs-result")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, [displayResult]);

  function handleGenerate() {
    if (!isComplete) {
      return;
    }

    setShowResult(true);
  }

  function handleToggle(id: string) {
    if (id.startsWith("custom:")) {
      setCustomInputs((current) => removeCustomSpec(current, id));
      return;
    }

    startTransition(() => {
      setPresetIds((current) => togglePresetSpec(current, id, getSelectedCount(current, customInputs)));
    });
  }

  function handleAddCustom(category: SpecCategory, text: string) {
    startTransition(() => {
      setCustomInputs((current) => addCustomSpec(current, category, text, presetIds.length + current.length));
    });
  }

  function handleEdit() {
    setShowResult(false);
    window.requestAnimationFrame(() => {
      document.getElementById("my9specs-picker")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  return (
    <section className="screen-shell mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10">
      <header className="rounded-[2rem] border border-[rgba(26,26,26,0.08)] bg-[linear-gradient(145deg,#fffefa_0%,#fff4ee_100%)] p-6 sm:p-8">
        <p className="font-numeric text-[0.74rem] font-black tracking-[0.24em] text-[var(--accent)]">MY 9 SPECS</p>
        <h1 className="mt-3 text-[2rem] font-black leading-tight tracking-[-0.04em] text-[var(--text-main)] sm:text-[2.8rem]">
          結婚相手に譲れない条件、
          <span className="block text-[var(--accent)]">9つだけ選んで。</span>
        </h1>
        <p className="mt-5 max-w-3xl text-sm leading-8 text-[var(--text-sub)] sm:text-base">
          60個の条件から9つ選ぶと、あなたの「譲れない」が3×3の画像になります。
          選んだ条件を全部満たす人が日本に何人いるかも、その場でリアルタイム表示します。
        </p>
        <p className="mt-4 text-sm font-bold text-[var(--accent)]">↓ 下の条件から9つ選んでください</p>
      </header>

      <section id="my9specs-picker" className="mt-6 grid gap-5">
        <div className="paper-card rounded-[1.4rem] px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-black tracking-[0.14em] text-[var(--text-main)]">相手の性別</p>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
              {[
                { value: "male" as const, label: "男性" },
                { value: "female" as const, label: "女性" },
              ].map((option) => {
                const active = option.value === targetGender;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTargetGender(option.value)}
                    className={`rounded-full border px-4 py-2 text-sm font-black transition ${
                      active
                        ? "border-[rgba(232,69,60,0.3)] bg-[var(--accent-soft)] text-[var(--accent)]"
                        : "border-[rgba(26,26,26,0.08)] bg-white text-[var(--text-main)]"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div
          className={`sticky top-12 z-30 rounded-[1.4rem] border p-3 shadow-[0_6px_20px_rgba(26,26,26,0.05)] backdrop-blur-sm sm:p-4 ${
            liveEstimate.count < 10_000
              ? "border-[rgba(232,69,60,0.3)] bg-[rgba(255,245,244,0.8)]"
              : "border-[rgba(26,26,26,0.08)] bg-[rgba(248,247,244,0.95)]"
          }`}
        >
          <StickyProgressBar
            selected={totalSelected}
            total={MY9_SPECS_MAX_SELECTION}
            estimatedCount={liveEstimate.count}
            percentage={liveEstimate.percentageWithinGender}
            onComplete={handleGenerate}
          />
          <div
            className={`mt-3 border-t pt-3 ${
              liveEstimate.count < 10_000 ? "border-[rgba(232,69,60,0.14)]" : "border-[rgba(26,26,26,0.08)]"
            }`}
          >
            <CategoryTabs
              categories={categories}
              activeCategory={activeCategory}
              onSelect={(category) => setActiveCategory(category as SpecCategory)}
            />
          </div>
        </div>

        <div className="paper-card rounded-[1.6rem] p-5 sm:p-6">
          <SpecPicker
            activeCategory={activeCategory}
            presetIds={presetIds}
            customInputs={customInputs}
            onToggle={handleToggle}
            onAddCustom={handleAddCustom}
            onNavigateCategory={setActiveCategory}
          />
        </div>

        <div className="paper-card rounded-[1.6rem] p-5 sm:p-6">
          <button
            type="button"
            onClick={() => setSelectionPanelOpen((current) => !current)}
            className="flex w-full items-center justify-between gap-4 text-left"
          >
            <div>
              <p className="text-sm font-black tracking-[0.16em] text-[var(--text-main)]">いま選んでいる条件</p>
              <p className="mt-1 text-xs leading-6 text-[var(--text-sub)]">
                {selectionPanelOpen ? "閉じる" : "タップで展開"} / {totalSelected}件選択中
              </p>
            </div>
            <span className="text-sm font-black text-[var(--accent)]">{selectionPanelOpen ? "−" : "+"}</span>
          </button>

          {selectionPanelOpen ? (
            <div className="animate-slide-up mt-5 border-t border-[rgba(26,26,26,0.08)] pt-5">
              {selected.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selected.map((option) => (
                    <span
                      key={option.id}
                      className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-soft)] px-3 py-2 text-xs font-bold text-[var(--text-main)]"
                    >
                      <span>{option.emoji}</span>
                      <span>{option.label}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-7 text-[var(--text-sub)]">
                  まだ未選択です。まずは「これだけは外せない」を直感で押してみてください。
                </p>
              )}

              <div className="mt-5 rounded-[1.2rem] border border-[rgba(26,26,26,0.08)] bg-white p-4">
                <p className="text-sm font-bold text-[var(--text-sub)]">ここまでの条件で満たす人</p>
                <p className="font-numeric mt-2 text-4xl font-black leading-none text-[var(--accent)]">
                  {liveEstimate.count.toLocaleString()}
                  <span className="ml-2 text-base text-[var(--text-main)]">人</span>
                </p>
                <p className="mt-3 text-sm leading-7 text-[var(--text-main)]">
                  対象の未婚{targetGender === "male" ? "男性" : "女性"}全体の {formatLivePercentage(liveEstimate.percentageWithinGender)}
                </p>
                <p className="mt-2 text-xs leading-6 text-[var(--text-sub)]">{liveEstimate.reliabilityNote}</p>
              </div>

              {liveEstimate.noteWarning ? (
                <p className="mt-4 rounded-[1.1rem] border border-[rgba(245,158,11,0.18)] bg-[rgba(245,158,11,0.08)] px-4 py-3 text-sm font-bold leading-6 text-[#b45309]">
                  {liveEstimate.noteWarning}
                </p>
              ) : null}

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={!isComplete}
                  className={`rounded-[1rem] px-5 py-3 text-sm font-black transition ${
                    isComplete
                      ? "bg-[var(--accent)] text-white"
                      : "cursor-not-allowed bg-[rgba(26,26,26,0.08)] text-[var(--text-sub)]"
                  }`}
                >
                  9条件で画像を作る
                </button>
                <p className="text-sm leading-7 text-[var(--text-sub)]">
                  {isPending ? "人数を更新中..." : "同じ軸の条件は、より厳しいものを選ぶと自動で入れ替わります。"}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {displayResult ? (
        <div id="my9specs-result" className="mt-8">
          <My9SpecsResultPanel
            targetGender={targetGender}
            presetIds={presetIds}
            customInputs={customInputs}
            editHref={getMy9SpecsBuilderPath(targetGender, presetIds, customInputs)}
            onEdit={handleEdit}
          />
        </div>
      ) : null}
    </section>
  );
}
