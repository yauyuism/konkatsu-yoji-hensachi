"use client";

import type { ReactNode } from "react";

import {
  MARKET_EDUCATION_LABELS,
  MARKET_GENDER_LABELS,
  MARKET_REGION_LABELS,
} from "@/data/market";
import type { MarketEducationKey, MarketGender, MarketRegionKey } from "@/data/market";
import type { MarketUserSpec } from "@/lib/market";

function SelectionGroup<T extends string>({
  value,
  onChange,
  options,
  columns = "sm:grid-cols-2 lg:grid-cols-3",
}: {
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string }>;
  columns?: string;
}) {
  return (
    <div className={`grid gap-3 ${columns}`}>
      {options.map((option) => {
        const active = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`choice-button rounded-[1.2rem] border px-4 py-4 text-sm font-black transition ${
              active
                ? "border-[var(--selected)] bg-[var(--selected)] text-white"
                : "border-[color:var(--line)] bg-[var(--bg-card)] text-[var(--text-main)]"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function FieldShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="paper-card rounded-[1.8rem] border border-[color:var(--line)] bg-[var(--card)] p-5 shadow-[0_18px_42px_rgba(26,26,26,0.06)] sm:p-6">
      <div>
        <h2 className="text-xl font-black text-[var(--text-main)]">{title}</h2>
        {description ? <p className="mt-2 text-sm leading-7 text-[var(--text-sub)]">{description}</p> : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function NumberField({
  id,
  suffix,
  min,
  max,
  required = false,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  suffix: string;
  min: number;
  max: number;
  required?: boolean;
  value: number;
  onChange: (value: number) => void;
  placeholder: string;
}) {
  return (
    <label htmlFor={id} className="flex items-center gap-3 rounded-[1.2rem] border border-[rgba(26,26,26,0.08)] bg-white/88 px-4 py-4">
      <input
        id={id}
        type="number"
        min={min}
        max={max}
        required={required}
        value={value === 0 && !required ? "" : value}
        onChange={(event) => {
          const nextValue = event.currentTarget.value;
          onChange(nextValue === "" ? 0 : Number(nextValue));
        }}
        placeholder={placeholder}
        className="w-full border-0 bg-transparent text-lg font-black text-[var(--text-main)] outline-none placeholder:text-[var(--text-sub)]"
      />
      <span className="shrink-0 text-sm font-bold text-[var(--text-sub)]">{suffix}</span>
    </label>
  );
}

type SpecInputFormProps = {
  value: MarketUserSpec;
  onChange: (nextValue: MarketUserSpec) => void;
  onSubmit: () => void;
  isPending?: boolean;
};

export function SpecInputForm({ value, onChange, onSubmit, isPending = false }: SpecInputFormProps) {
  const update = <K extends keyof MarketUserSpec>(key: K, nextValue: MarketUserSpec[K]) => {
    onChange({
      ...value,
      [key]: nextValue,
    });
  };

  return (
    <div className="grid gap-4">
      <FieldShell title="性別">
        <SelectionGroup<MarketGender>
          value={value.gender}
          onChange={(nextValue) => update("gender", nextValue)}
          options={Object.entries(MARKET_GENDER_LABELS).map(([key, label]) => ({
            value: key as MarketGender,
            label,
          }))}
          columns="sm:grid-cols-2"
        />
      </FieldShell>

      <FieldShell title="年齢">
        <NumberField
          id="market-age"
          min={20}
          max={49}
          required
          value={value.age}
          onChange={(nextValue) => update("age", Math.min(49, Math.max(20, nextValue || 20)))}
          suffix="歳"
          placeholder="32"
        />
      </FieldShell>

      <FieldShell title="年収（税込）">
        <NumberField
          id="market-income"
          min={0}
          max={2000}
          value={value.income}
          onChange={(nextValue) => update("income", Math.min(2000, Math.max(0, nextValue || 0)))}
          suffix="万円"
          placeholder="550"
        />
        <p className="mt-2 text-xs leading-6 text-[var(--text-sub)]">空欄ならこの軸を除外します。</p>
      </FieldShell>

      <FieldShell title="身長">
        <NumberField
          id="market-height"
          min={0}
          max={210}
          value={value.height}
          onChange={(nextValue) => update("height", Math.min(210, Math.max(0, nextValue || 0)))}
          suffix="cm"
          placeholder="171"
        />
        <p className="mt-2 text-xs leading-6 text-[var(--text-sub)]">空欄ならこの軸を除外します。</p>
      </FieldShell>

      <FieldShell title="最終学歴">
        <SelectionGroup<MarketEducationKey>
          value={value.education}
          onChange={(nextValue) => update("education", nextValue)}
          options={Object.entries(MARKET_EDUCATION_LABELS).map(([key, label]) => ({
            value: key as MarketEducationKey,
            label,
          }))}
        />
      </FieldShell>

      <FieldShell title="居住エリア">
        <SelectionGroup<MarketRegionKey>
          value={value.region}
          onChange={(nextValue) => update("region", nextValue)}
          options={Object.entries(MARKET_REGION_LABELS).map(([key, label]) => ({
            value: key as MarketRegionKey,
            label,
          }))}
          columns="sm:grid-cols-2 xl:grid-cols-5"
        />
      </FieldShell>

      <div className="soft-panel rounded-[1.5rem] border border-[color:var(--line)] p-4 sm:p-5">
        <button
          type="button"
          onClick={onSubmit}
          data-testid="market-submit"
          disabled={isPending}
          className="cta-button inline-flex w-full items-center justify-center rounded-[1.2rem] px-6 py-4 text-sm font-black text-white disabled:cursor-wait disabled:opacity-80"
        >
          {isPending ? "結果へ移動中..." : "年収に換算する"}
        </button>
        <p className="mt-3 text-center text-xs leading-6 text-[var(--text-sub)]">入力内容はサーバーに保存されません。</p>
      </div>
    </div>
  );
}
