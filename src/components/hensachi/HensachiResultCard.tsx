"use client";

import dynamic from "next/dynamic";
import { forwardRef, useEffect, useState } from "react";

import { HensachiAxisBars } from "@/components/hensachi/HensachiAxisBars";
import { NormalDistributionChart } from "@/components/prof/NormalDistributionChart";
import type { HensachiDiagnosisResult } from "@/lib/hensachi";
import { useCountUp } from "@/lib/use-count-up";

type HensachiResultCardProps = {
  result: HensachiDiagnosisResult;
};

const DynamicRadarChart = dynamic(
  () => import("@/components/hensachi/HensachiRadarChart").then((module) => module.HensachiRadarChart),
  {
    ssr: false,
    loading: () => <div className="h-[280px] rounded-[12px] bg-[rgba(59,130,246,0.06)]" />,
  }
);

export const HensachiResultCard = forwardRef<HTMLDivElement, HensachiResultCardProps>(function HensachiResultCard(
  { result },
  ref
) {
  const animatedTotal = useCountUp(result.totalHensachi, 1500);
  const [showTitle, setShowTitle] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const titleTimer = window.setTimeout(() => setShowTitle(true), 1400);
    const chartTimer = window.setTimeout(() => setShowChart(true), 1700);
    const detailsTimer = window.setTimeout(() => setShowDetails(true), 2050);

    return () => {
      window.clearTimeout(titleTimer);
      window.clearTimeout(chartTimer);
      window.clearTimeout(detailsTimer);
    };
  }, []);

  return (
    <article ref={ref} className="paper-card relative overflow-hidden rounded-[16px] p-5 sm:p-7">
      <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(0deg,transparent_0_13%,rgba(26,26,26,0.05)_13%_14%,transparent_14%_100%),linear-gradient(90deg,transparent_0_10%,rgba(26,26,26,0.04)_10%_11%,transparent_11%_100%)]" />

      <div className="relative">
        <p className="text-center text-[0.74rem] font-medium tracking-[0.18em] text-[var(--text-sub)] sm:text-xs">
          マッチングアプリ偏差値
        </p>

        <div className="mt-5 text-center">
          <p className="text-xs font-bold tracking-[0.18em] text-[var(--text-sub)]">偏差値</p>
          <p className="number-display mt-4 text-[5.6rem] font-black leading-none sm:text-[7.5rem]" style={{ color: result.color }}>
            {animatedTotal}
          </p>
          <p className="mt-3 text-sm text-[var(--text-sub)]">上位 {result.topPercent}% に位置しています</p>
          <p
            className={`mt-4 text-2xl font-bold text-[var(--text-main)] transition duration-500 sm:text-3xl ${
              showTitle ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
            }`}
          >
            {result.title}
          </p>
          <p
            className={`mt-5 text-xs font-bold tracking-[0.16em] text-[var(--color-text-sub)] transition duration-500 ${
              showTitle ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
            }`}
          >
            あなたの通り名
          </p>
          <p
            className={`mt-2 text-base font-bold text-[var(--text-main)] transition duration-500 sm:text-lg ${
              showTitle ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
            }`}
          >
            {`「${result.nickname}」`}
          </p>
        </div>

        <div className={`card-section mt-8 transition duration-500 ${showChart ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
          <NormalDistributionChart score={result.totalHensachi} percentile={result.topPercent} />
        </div>

        <div className={`card-section mt-6 transition duration-500 ${showChart ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
          <section>
            <p className="text-sm font-bold tracking-[0.16em] text-[var(--text-main)]">レーダーチャート</p>
            <div className="mt-3">
              <DynamicRadarChart axes={result.axisDetails} />
            </div>
          </section>
        </div>

        <div className={`card-section mt-6 grid gap-6 transition duration-500 ${showDetails ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
          <section>
            <p className="text-sm font-bold tracking-[0.16em] text-[var(--text-main)]">科目別成績</p>
            <div className="mt-4">
              <HensachiAxisBars axes={result.axisDetails} />
            </div>
          </section>

          <section className="card-section">
            <p className="text-sm font-bold tracking-[0.16em] text-[var(--text-main)]">総評</p>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--text-main)] sm:text-base">{result.summary}</p>
          </section>
        </div>

        <div className="mt-6 flex items-end justify-between gap-3 text-sm font-medium text-[var(--text-sub)]">
          <div>#アプリ偏差値</div>
          <div>@yauyuism</div>
        </div>
      </div>
    </article>
  );
});
