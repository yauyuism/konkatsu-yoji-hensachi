import type { Metadata } from "next";
import Link from "next/link";

import { CreatorFollowPanel } from "@/components/CreatorFollowPanel";
import { ComparisonList } from "@/components/prof/stats/ComparisonList";
import { BadRanking } from "@/components/prof/stats/BadRanking";
import { DistributionChart } from "@/components/prof/stats/DistributionChart";
import { ImprovementStats } from "@/components/prof/stats/ImprovementStats";
import { ShareStatsButton } from "@/components/prof/stats/ShareStatsButton";
import { TotalCounter } from "@/components/prof/stats/TotalCounter";
import { getProfStatsOgImageUrl, getProfStatsXShareUrl } from "@/lib/prof-share";
import { getStatsSnapshot } from "@/lib/stats";

type StatsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const revalidate = 300;

export const metadata: Metadata = {
  title: "みんなのプロフ偏差値",
  description: "匿名化された診断結果から、平均偏差値やありがちなミスをまとめた統計ページです。",
  alternates: {
    canonical: "/prof/stats",
  },
  openGraph: {
    title: "みんなのプロフ偏差値 | 婚活診断LAB by アイカタ",
    description: "匿名化された診断結果から、平均偏差値やありがちなミスをまとめた統計ページです。",
    url: "/prof/stats",
    images: [getProfStatsOgImageUrl()],
  },
  twitter: {
    card: "summary_large_image",
    title: "みんなのプロフ偏差値 | 婚活診断LAB by アイカタ",
    description: "匿名化された診断結果から、平均偏差値やありがちなミスをまとめた統計ページです。",
    images: [getProfStatsOgImageUrl()],
  },
};

function parseOptionalTotal(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return parsed;
}

function estimateTopPercent(
  total: number,
  distribution: Array<{
    band: string;
    count: number;
  }>
) {
  const population = distribution.reduce((sum, item) => sum + item.count, 0);
  if (population === 0) {
    return null;
  }

  let above = 0;
  for (const item of distribution) {
    const [min, max] = item.band.split("-").map(Number);
    if (total < min) {
      above += item.count;
      continue;
    }
    if (total > max) {
      continue;
    }

    const width = Math.max(1, max - min + 1);
    const ratio = (max - total) / width;
    above += item.count * Math.max(0, Math.min(1, ratio));
  }

  return Math.round((above / population) * 100);
}

export default async function ProfStatsPage({ searchParams }: StatsPageProps) {
  const [stats, resolvedSearchParams] = await Promise.all([getStatsSnapshot(), searchParams]);
  const shareUrl = getProfStatsXShareUrl(stats);
  const selfTotal = parseOptionalTotal(resolvedSearchParams.t);
  const topPercent = selfTotal === null ? null : estimateTopPercent(selfTotal, stats.distribution);

  return (
    <section data-testid="prof-stats-page" className="screen-shell mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
      <div className="mx-auto max-w-5xl">
        <p className="eyebrow mx-auto w-fit rounded-full px-4 py-2 text-[0.72rem] font-bold tracking-[0.22em] text-[var(--accent)]">
          PROFILE STATS
        </p>
        <h1 data-testid="prof-stats-heading" className="mt-4 text-center text-3xl font-black leading-tight text-[var(--text-main)] sm:text-5xl">
          みんなの
          <span className="block text-[var(--accent)]">プロフ偏差値</span>
        </h1>

        <div className="mt-8 grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
          <TotalCounter count={stats.totalCount} />

          <div className="rounded-[1.8rem] border border-[color:rgba(26,26,26,0.08)] bg-white/88 p-5 sm:p-6">
            <p className="text-sm font-bold tracking-[0.16em] text-[var(--text-main)]">全体の平均偏差値</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.4rem] bg-[rgba(26,26,26,0.04)] px-4 py-4 text-center">
                <p className="text-xs font-bold tracking-[0.14em] text-[var(--text-sub)]">全体</p>
                <p className="font-numeric mt-2 text-4xl font-black text-[var(--text-main)]">{stats.avgHensachi}</p>
              </div>
              <div className="rounded-[1.4rem] bg-[rgba(59,130,246,0.08)] px-4 py-4 text-center">
                <p className="text-xs font-bold tracking-[0.14em] text-[#2563EB]">男性</p>
                <p className="font-numeric mt-2 text-4xl font-black text-[#3B82F6]">{stats.avgHensachiByGender.male ?? "-"}</p>
              </div>
              <div className="rounded-[1.4rem] bg-[rgba(232,69,60,0.08)] px-4 py-4 text-center">
                <p className="text-xs font-bold tracking-[0.14em] text-[var(--accent)]">女性</p>
                <p className="font-numeric mt-2 text-4xl font-black text-[var(--accent)]">{stats.avgHensachiByGender.female ?? "-"}</p>
              </div>
            </div>
            {topPercent !== null && selfTotal !== null ? (
              <p className="mt-4 text-sm font-bold text-[#10B981]">
                偏差値 {selfTotal} は上位 {topPercent}% くらいです。
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.02fr_0.98fr]">
          <DistributionChart data={stats.distribution} />
          <BadRanking data={stats.badRanking} total={stats.totalCount} />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <ComparisonList
            title="人気アプリ別 平均偏差値"
            data={stats.appStats.filter((item) => item.count > 0).map((item) => ({
              label: item.label,
              avg: item.avg,
            }))}
            accent="red"
          />
          <ComparisonList
            title="年齢層別 平均偏差値"
            data={stats.ageGroups.map((item) => ({
              label: item.group,
              avg: item.avg,
            }))}
          />
        </div>

        <div className="mt-6">
          <ImprovementStats
            avg={stats.avgImprovement}
            max={stats.maxImprovement}
            improvedAverage={stats.avgImprovedTotal}
          />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="soft-panel h-full rounded-[1.8rem] p-5 sm:p-6">
            <p className="text-sm font-bold tracking-[0.16em] text-[var(--text-main)]">次の導線</p>
            <p className="mt-3 text-sm leading-7 text-[var(--text-sub)]">
              数字を見たあとに、自分のプロフもその場で診断できます。統計データは匿名化された数値だけで作られています。
            </p>
            <div className="mt-5 grid gap-3">
              <Link
                href="/prof"
                data-testid="stats-diagnose-cta"
                className="cta-button inline-flex items-center justify-center rounded-[1.2rem] px-5 py-4 text-sm font-bold text-white"
              >
                診断する
              </Link>
              <ShareStatsButton href={shareUrl} />
            </div>
          </div>

          <CreatorFollowPanel
            context="prof_stats"
            quizName="prof_hensachi"
            title="もっと詳しい分析は @yauyuism"
            description="統計の数字をもとにした考察や改善論は、Xとnoteで続けて出していく前提です。"
            actionPosition="top"
          />
        </div>

        <section className="mt-6">
          <div className="soft-panel mx-auto w-full max-w-2xl rounded-[1.8rem] p-5 sm:p-6">
            <p className="text-[0.72rem] font-bold tracking-[0.2em] text-[var(--accent)]">TRY</p>
            <h2 className="mt-3 text-xl font-black leading-tight text-[var(--text-main)] sm:text-2xl">
              あなたのプロフも診断する
            </h2>
            <p className="mt-2 text-sm leading-7 text-[var(--text-sub)]">
              リアルなプロフィール文を貼って、偏差値と改善案を返す本編はこちら。
            </p>
            <Link
              href="/prof"
              className="text-link mt-4 inline-flex"
            >
              詳しく見る →
            </Link>
          </div>
        </section>
      </div>
    </section>
  );
}
