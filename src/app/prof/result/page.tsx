import type { Metadata } from "next";
import Link from "next/link";

import { CreatorFollowPanel } from "@/components/CreatorFollowPanel";
import { AxisBarChart } from "@/components/prof/AxisBarChart";
import { HensachiDisplay } from "@/components/prof/HensachiDisplay";
import { ProfResultPageClient } from "@/components/prof/ProfResultPageClient";
import { getProfTitleMeta, parseProfShareParams } from "@/lib/prof";
import { getProfLineShareUrl, getProfOgImageUrl, getProfResultUrl, getProfXShareUrl } from "@/lib/prof-share";
import { getSiteUrl } from "@/lib/site-url";

type ProfResultPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

function buildShareResult(searchParams: Record<string, string | string[] | undefined>) {
  const { scores, improvedTotal, nickname, axisComments, titleMeta } = parseProfShareParams(searchParams);

  return {
    scores,
    improvedTotal,
    nickname,
    axisComments,
    titleMeta,
    description: `プロフィール偏差値は ${scores.total} 点。プロフィール文は保存せず、偏差値と科目別スコアだけをシェアできます。`,
  };
}

export async function generateMetadata({ searchParams }: ProfResultPageProps): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const result = buildShareResult(resolvedSearchParams);
  const query = new URLSearchParams(Object.entries(resolvedSearchParams).flatMap(([key, value]) => {
    if (typeof value === "string") {
      return [[key, value]];
    }
    if (Array.isArray(value) && value[0]) {
      return [[key, value[0]]];
    }
    return [];
  })).toString();
  const pageTitle = `プロフィール偏差値 ${result.scores.total}点`;
  const ogImageUrl = getProfOgImageUrl(result.scores, result.improvedTotal);

  return {
    title: pageTitle,
    description: result.description,
    alternates: {
      canonical: `/prof/result?${query}`,
    },
    openGraph: {
      title: `${pageTitle} | やうゆの婚活診断`,
      description: result.description,
      type: "article",
      url: `/prof/result?${query}`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${pageTitle} | やうゆの婚活診断`,
      description: result.description,
      images: [ogImageUrl],
    },
  };
}

export default async function ProfResultPage({ searchParams }: ProfResultPageProps) {
  const resolvedSearchParams = await searchParams;
  const { scores, improvedTotal, nickname, axisComments, titleMeta } = parseProfShareParams(resolvedSearchParams);
  const resultUrl = getProfResultUrl(scores, improvedTotal, nickname);
  const shareResult = {
    scores,
    title: titleMeta.title,
    nickname,
    axisComments,
    summary: "",
    highlights: { good: [], bad: [] },
    targetAudience: {
      main: { ageRange: "", occupation: "", persona: "", appHistory: "", personality: "", reason: "" },
      sub: { ageRange: "", occupation: "", persona: "", appHistory: "", personality: "", reason: "" },
      miss: { type: "", reason: "", improvementHint: "" },
    },
    improvedProfile: {
      text: "",
      estimatedScores: {
        ...scores,
        total: improvedTotal ?? scores.total,
      },
      changes: [],
    },
    comment: "",
  };

  return (
    <ProfResultPageClient
      fallback={
        <section className="screen-shell mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
          <div className="mx-auto max-w-4xl">
            <p className="eyebrow mx-auto w-fit rounded-full px-4 py-2 text-[0.72rem] font-bold tracking-[0.22em] text-[var(--accent)]">
              SHARE RESULT
            </p>
            <h1 className="mt-4 text-center text-3xl font-black leading-tight text-[var(--text-main)] sm:text-5xl">
              プロフ偏差値、
              <span className="block text-[var(--accent)]">シェア用サマリー</span>
            </h1>

            <div className="mt-8 grid gap-4 lg:grid-cols-[1.02fr_0.98fr]">
              <div className="paper-card rounded-[2rem] border border-[color:var(--line)] bg-[var(--card)] p-5 sm:p-7">
                <HensachiDisplay total={scores.total} title={titleMeta.title} color={titleMeta.color} nickname={nickname} />
                {improvedTotal ? (
                  <div className="mt-5 rounded-[1.4rem] bg-[rgba(16,185,129,0.08)] px-4 py-4 text-center">
                    <p className="text-sm font-bold text-[#047857]">改善後見込み</p>
                    <p className="font-numeric mt-2 text-4xl font-black text-[#10B981]">{improvedTotal}</p>
                  </div>
                ) : null}
              </div>

              <div className="paper-card rounded-[2rem] border border-[color:var(--line)] bg-[var(--card)] p-5 sm:p-7">
                <p className="text-sm font-bold tracking-[0.16em] text-[var(--text-main)]">科目別スコア</p>
                <div className="mt-4 rounded-[1.6rem] border border-[rgba(26,26,26,0.08)] bg-white/86 p-4">
                  <AxisBarChart scores={scores} comments={axisComments} />
                </div>
                <div className="mt-5 grid gap-3">
                  <a
                    href={getProfXShareUrl(shareResult, resultUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cta-button inline-flex items-center justify-center rounded-[1.2rem] px-5 py-4 text-sm font-bold text-white"
                  >
                    Xでシェア
                  </a>
                  <a
                    href={getProfLineShareUrl(shareResult, resultUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="secondary-button inline-flex items-center justify-center rounded-[1.2rem] px-5 py-4 text-sm font-bold text-[var(--text-main)]"
                  >
                    LINEで送る
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1.02fr_0.98fr]">
              <div className="soft-panel rounded-[1.8rem] p-5 sm:p-6">
                <p className="text-sm font-bold tracking-[0.16em] text-[var(--text-main)]">このURLに含まれるもの</p>
                <p className="mt-3 text-sm leading-7 text-[var(--text-sub)]">
                  偏差値と科目別スコアだけです。プロフィール原文や改善後文章は含みません。
                </p>
                <p className="mt-4 break-all text-xs leading-6 text-[var(--text-sub)]">{`${getSiteUrl()}/prof/result?${new URL(resultUrl).searchParams.toString()}`}</p>
                <Link
                  href="/prof"
                  className="cta-button mt-5 inline-flex w-full items-center justify-center rounded-[1.2rem] px-5 py-4 text-base font-bold text-white"
                >
                  自分のプロフも診断する
                </Link>
              </div>

              <CreatorFollowPanel
                context="prof_share_result"
                quizName="prof_hensachi"
                title="@yauyuism"
                description="診断だけで終わらせず、Xとnoteで改善の考え方も追えます。"
              />
            </div>
          </div>
        </section>
      }
    />
  );
}
