import type { Metadata } from "next";

import { HensachiResultScreen } from "@/components/hensachi/HensachiResultScreen";
import { buildHensachiResultFromSearchParams, serializeHensachiAxes } from "@/lib/hensachi";
import { getHensachiOgImageUrl } from "@/lib/hensachi-share";
import { getSiteUrl } from "@/lib/site-url";

type HensachiResultPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }: HensachiResultPageProps): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const result = buildHensachiResultFromSearchParams(resolvedSearchParams);
  const query = serializeHensachiAxes(result.axes, result.answerIndexes);
  const pageTitle = `マッチングアプリ偏差値【${result.totalHensachi}】${result.title}`;
  const ogImageUrl = getHensachiOgImageUrl(result);

  return {
    title: pageTitle,
    description: result.summary,
    alternates: {
      canonical: `/hensachi/result?${query}`,
    },
    openGraph: {
      title: `${pageTitle} | 婚活診断LAB by アイカタ`,
      description: result.summary,
      type: "article",
      url: `/hensachi/result?${query}`,
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
      title: `${pageTitle} | 婚活診断LAB by アイカタ`,
      description: result.summary,
      images: [ogImageUrl],
    },
  };
}

export default async function HensachiResultPage({ searchParams }: HensachiResultPageProps) {
  const resolvedSearchParams = await searchParams;
  const result = buildHensachiResultFromSearchParams(resolvedSearchParams);
  const query = serializeHensachiAxes(result.axes, result.answerIndexes);

  return (
    <HensachiResultScreen
      result={result}
      resultUrl={`${getSiteUrl()}/hensachi/result?${query}`}
      restartHref="/hensachi"
    />
  );
}
