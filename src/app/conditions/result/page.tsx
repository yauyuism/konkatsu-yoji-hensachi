import type { Metadata } from "next";
import Link from "next/link";

import { CreatorFollowPanel } from "@/components/CreatorFollowPanel";
import { ConditionResultStorageSync } from "@/components/conditions/ConditionResultStorageSync";
import { ConditionsResultCard } from "@/components/conditions/ConditionsResultCard";
import { getConditionsResultFromSearchParams } from "@/lib/conditions";
import { getInputMethod } from "@/lib/convert-filter";
import { getSiteUrl } from "@/lib/site-url";
import {
  getConditionsLineShareUrl,
  getConditionsOgImageUrl,
  getConditionsResultPath,
  getConditionsXShareUrl,
} from "@/lib/conditions-share";

const OGP_IMAGE_TYPE = "image/png";
const OGP_CACHE_BUSTER = "20260316";
const X_ACCOUNT = "@yauyuism";

type ConditionsResultPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }: ConditionsResultPageProps): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const { conditions, summary } = getConditionsResultFromSearchParams(resolvedSearchParams);
  const inputMethod = getInputMethod(resolvedSearchParams.m);
  const canonical = getConditionsResultPath(conditions, inputMethod);
  const title = `条件リアリティチェック ${summary.percentage.toFixed(2)}%（${summary.count.toLocaleString()}人）`;
  const siteUrl = getSiteUrl();
  const canonicalUrl = new URL(canonical, siteUrl).toString();
  const ogImageUrl = new URL(getConditionsOgImageUrl(conditions, inputMethod), siteUrl);
  ogImageUrl.searchParams.set("v", OGP_CACHE_BUSTER);

  return {
    title,
    description: `未婚者全体の ${summary.percentage.toFixed(2)}%。約 ${summary.count.toLocaleString()} 人です。`,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${title} | 婚活診断LAB by アイカタ`,
      description: `条件を入れると、未婚者全体の何%かと人数をリアルタイムで推計します。今回は ${summary.percentage.toFixed(2)}%（約 ${summary.count.toLocaleString()} 人）。`,
      type: "article",
      url: canonicalUrl,
      images: [
        {
          url: ogImageUrl,
          secureUrl: ogImageUrl,
          type: OGP_IMAGE_TYPE,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: X_ACCOUNT,
      creator: X_ACCOUNT,
      title: `${title} | 婚活診断LAB by アイカタ`,
      description: `未婚者全体の ${summary.percentage.toFixed(2)}%（約 ${summary.count.toLocaleString()} 人）。`,
      images: [
        {
          url: ogImageUrl,
          secureUrl: ogImageUrl,
          type: OGP_IMAGE_TYPE,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
  };
}

export default async function ConditionsResultPage({ searchParams }: ConditionsResultPageProps) {
  const resolvedSearchParams = await searchParams;
  const { conditions, summary } = getConditionsResultFromSearchParams(resolvedSearchParams);
  const inputMethod = getInputMethod(resolvedSearchParams.m);
  const xShareUrl = getConditionsXShareUrl(conditions, summary.count, summary.percentage, inputMethod);
  const lineShareUrl = getConditionsLineShareUrl(conditions, summary.count, summary.percentage, inputMethod);

  return (
    <section className="screen-shell mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
      <div className="mx-auto max-w-5xl">
        <ConditionResultStorageSync conditions={conditions} summary={summary} />
        <ConditionsResultCard
          conditions={conditions}
          summary={summary}
          shareSection={
            <section className="soft-panel rounded-[1rem] p-5 sm:p-6">
              <p className="text-sm font-bold tracking-[0.16em] text-[var(--text-main)]">シェア</p>
              <p className="mt-3 text-sm leading-7 text-[var(--text-sub)]">条件だけを URL 化しているので、個人情報や入力履歴は含みません。</p>
              {inputMethod === "screenshot" ? (
                <p className="mt-3 rounded-[1rem] bg-[rgba(59,130,246,0.08)] px-4 py-3 text-sm font-bold text-[#1D4ED8]">
                  この結果はスクショ読み取りから始めた条件としてシェアされます。
                </p>
              ) : null}

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <a
                  href={xShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  Xでシェアする
                </a>
                <Link
                  href="/conditions"
                  className="btn-secondary"
                >
                  条件を変えてやり直す
                </Link>
              </div>
              <div className="mt-4 flex flex-wrap gap-4">
                <a href={lineShareUrl} target="_blank" rel="noopener noreferrer" className="share-icon-link">
                  <span aria-hidden="true">📩</span>
                  LINEで送る
                </a>
              </div>
            </section>
          }
          supportSection={
            <CreatorFollowPanel
              context="conditions_share_result"
              quizName="conditions_check"
              title="@yauyuism"
              description="診断をきっかけに条件の考え方まで追うなら、X と note をどうぞ。"
              actionPosition="top"
            />
          }
          logicPanel={
            <details className="rounded-[1rem] border border-[color:var(--line)] bg-white p-5">
              <summary className="cursor-pointer list-none text-sm font-black text-[var(--text-main)]">計算ロジック</summary>
              <div className="mt-3 space-y-2 text-sm leading-7 text-[var(--text-sub)]">
                <p>未婚者数に、年齢の重なり・年収分布・身長分布・学歴比率を掛け合わせて推計しています。</p>
                <p>年齢は5歳刻み統計に按分し、年収・学歴は年齢帯ごとの分布、身長は性別ごとの分布で近似しています。</p>
                <p>各条件を独立と仮定した概算なので、実数とはズレる場合があります。</p>
              </div>
            </details>
          }
        />
      </div>
    </section>
  );
}
