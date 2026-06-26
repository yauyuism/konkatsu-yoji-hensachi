"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

import { CrossPromotion } from "@/components/CrossPromotion";
import { SpecInputForm } from "@/components/market/SpecInputForm";
import { trackEvent } from "@/lib/analytics";
import { markToolCompleted } from "@/lib/completed-tools";
import { getMarketResultPath } from "@/lib/market-share";
import { type MarketUserSpec } from "@/lib/market";

type MarketAppProps = {
  initialSpec: MarketUserSpec;
};

export function MarketApp({ initialSpec }: MarketAppProps) {
  const router = useRouter();
  const formRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState(initialSpec);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    trackEvent("market_submit", {
      quiz_name: "market_equivalent",
      gender: user.gender,
      age: user.age,
      income: user.income,
      height: user.height,
      education: user.education,
      region: user.region,
    });

    markToolCompleted("market");

    startTransition(() => {
      router.push(getMarketResultPath(user));
    });
  };

  const handleScrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section data-testid="market-page" className="screen-shell relative mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-16">
      <div className="absolute left-[-4rem] top-10 h-44 w-44 rounded-full bg-[rgba(232,69,60,0.08)] blur-3xl" />
      <div className="absolute right-[-2rem] top-28 h-56 w-56 rounded-full bg-[rgba(59,130,246,0.1)] blur-3xl" />

      <div className="relative z-10 mx-auto max-w-4xl">
        <div className="paper-card rounded-[2.2rem] border border-[color:var(--line)] bg-[var(--card)] p-6 shadow-[0_28px_70px_rgba(26,26,26,0.08)] sm:p-8">
          <p className="eyebrow inline-flex rounded-full px-4 py-2 text-[0.72rem] font-bold tracking-[0.24em] text-[var(--accent)]">
            MARKET VALUE
          </p>

          <h1 className="mt-5 text-4xl font-black leading-tight text-[var(--text-main)] sm:text-5xl lg:text-6xl">
            あなたの婚活スペック、
            <span className="block">未婚同性の中で</span>
            <span className="block text-[var(--accent)]">上位何%？</span>
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--text-sub)] sm:text-lg">
            年齢・年収・身長・学歴・居住地から、スペック条件の希少性を上位割合で見ます。
          </p>

          <div className="mt-6 flex flex-wrap gap-3 text-sm text-[var(--text-sub)]">
            {["無料", "登録不要", "約30秒", "保存なし"].map((item) => (
              <span key={item} className="soft-pill rounded-full px-4 py-2">
                {item}
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={handleScrollToForm}
            className="secondary-button mt-8 inline-flex items-center justify-center rounded-[1.2rem] px-6 py-4 text-sm font-black text-[var(--text-main)]"
          >
            スペックを入れてみる ↓
          </button>
        </div>

        <div
          ref={formRef}
          className="mt-6 paper-card rounded-[2rem] border border-[color:var(--line)] bg-[var(--card)] p-5 shadow-[0_28px_70px_rgba(26,26,26,0.08)] sm:p-7"
        >
          <h2 className="text-2xl font-black text-[var(--text-main)]">あなたのスペック</h2>
          <div className="mt-6">
            <SpecInputForm value={user} onChange={setUser} onSubmit={handleSubmit} isPending={isPending} />
          </div>
        </div>

        <div className="mt-8 border-t border-[color:var(--line)] pt-8">
          <h2 className="text-2xl font-black text-[var(--text-main)]">他の診断もやる</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <CrossPromotion
              toolId="conditions"
              eyebrow="CHECK"
              ctaLabel="婚活倍率を見る →"
              className="border-[color:var(--line)] bg-[var(--bg-card)]"
            />
            <CrossPromotion
              toolId="prof"
              eyebrow="NEXT"
              ctaLabel="次の改善を見る →"
              className="border-[color:var(--line)] bg-[var(--bg-card)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
