"use client";

import type { InputMethod } from "@/lib/convert-filter";

type InputMethodSelectorProps = {
  selectedMethod: InputMethod | null;
  onSelect: (method: InputMethod) => void;
};

const methodCards: Array<{
  value: InputMethod;
  eyebrow: string;
  title: string;
  description: string;
  badge?: string;
}> = [
  {
    value: "manual",
    eyebrow: "📝 自分で入力",
    title: "条件をスライダーで設定する",
    description: "年齢・年収・身長・学歴・エリアを自分で動かして、その場で人数を見ます。",
  },
  {
    value: "screenshot",
    eyebrow: "📱 スクショで読み取る",
    title: "アプリの検索条件を貼るだけ",
    description: "検索条件画面のスクショを読み取り、スライダーの初期値を自動で埋めます。",
    badge: "NEW",
  },
];

export function InputMethodSelector({ selectedMethod, onSelect }: InputMethodSelectorProps) {
  return (
    <section className="paper-card rounded-[2rem] border border-[color:var(--line)] bg-[var(--card)] p-5 shadow-[0_18px_42px_rgba(26,26,26,0.06)] sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-[0.18em] text-[var(--accent)]">INPUT METHOD</p>
          <h2 className="mt-3 text-2xl font-black text-[var(--text-main)]">条件の入力方法を選んでください</h2>
        </div>
        <p className="text-sm leading-7 text-[var(--text-sub)]">あとから切り替えても、結果の見え方は同じです。</p>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {methodCards.map((card) => {
          const active = selectedMethod === card.value;

          return (
            <button
              key={card.value}
              type="button"
              onClick={() => onSelect(card.value)}
              data-testid={`input-method-${card.value}`}
              className={`choice-button relative rounded-[1.7rem] border p-6 text-left transition ${
                active
                  ? "border-[rgba(232,69,60,0.26)] bg-[var(--accent-soft)]"
                  : "border-[rgba(26,26,26,0.08)] bg-white/88"
              }`}
            >
              {card.badge ? (
                <span className="absolute right-4 top-4 rounded-full bg-[rgba(59,130,246,0.12)] px-3 py-1 text-[0.7rem] font-black tracking-[0.12em] text-[#3B82F6]">
                  {card.badge}
                </span>
              ) : null}
              <p className="text-sm font-black text-[var(--accent)]">{card.eyebrow}</p>
              <h3 className="mt-4 text-xl font-black leading-tight text-[var(--text-main)]">{card.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--text-sub)]">{card.description}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
