import type { Metadata } from "next";

import { MarketResultScreen } from "@/components/market/MarketResultScreen";
import { getMarketResultFromSearchParams, getMarketResultDescription, getMarketResultTitle } from "@/lib/market";
import {
  getMarketEditPath,
  getMarketLineShareUrl,
  getMarketOgImageUrl,
  getMarketResultPath,
  getMarketXShareUrl,
} from "@/lib/market-share";

type MarketResultPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }: MarketResultPageProps): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const { user, analysis } = getMarketResultFromSearchParams(resolvedSearchParams);
  const title = getMarketResultTitle(user, analysis);
  const description = getMarketResultDescription(user, analysis);
  const canonical = getMarketResultPath(user);
  const ogImageUrl = getMarketOgImageUrl(user);

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${title} | 婚活診断LAB by やうゆ`,
      description,
      type: "article",
      url: canonical,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | 婚活診断LAB by やうゆ`,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function MarketResultPage({ searchParams }: MarketResultPageProps) {
  const resolvedSearchParams = await searchParams;
  const { user, analysis } = getMarketResultFromSearchParams(resolvedSearchParams);

  return (
    <MarketResultScreen
      user={user}
      analysis={analysis}
      xShareUrl={getMarketXShareUrl(user, analysis)}
      lineShareUrl={getMarketLineShareUrl(user, analysis)}
      editHref={getMarketEditPath(user)}
    />
  );
}
