import type { Metadata } from "next";

import { CreatorFollowPanel } from "@/components/CreatorFollowPanel";
import { ConditionResultStorageSync } from "@/components/conditions/ConditionResultStorageSync";
import { ConditionsResultCard } from "@/components/conditions/ConditionsResultCard";
import { ConditionsStaticShareSection } from "@/components/conditions/ConditionsStaticShareSection";
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
      title: `${title} | 婚活診断LAB by やうゆ`,
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
      title: `${title} | 婚活診断LAB by やうゆ`,
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
            <ConditionsStaticShareSection
              conditions={conditions}
              summary={summary}
              inputMethod={inputMethod}
              xShareUrl={xShareUrl}
              lineShareUrl={lineShareUrl}
            />
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
