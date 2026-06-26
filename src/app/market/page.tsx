import { MarketApp } from "@/components/market/MarketApp";
import { buildShareMetadata } from "@/lib/metadata";
import { parseMarketSearchParams } from "@/lib/market";

type MarketPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata = buildShareMetadata({
  title: "婚活スペック上位チェック",
  description: "あなたの婚活スペックは未婚同性の上位何%？ 年齢・年収・身長・学歴・居住地から希少性を見直す無料ツールです。",
  path: "/market",
  imagePath: "/og/market-top.png",
  imageAlt: "婚活スペック上位チェックのトップOGP画像",
  ogDescription: "あなたの婚活スペックは未婚同性の上位何%？ 条件チェッカーの逆視点で希少性を見ます。",
  twitterDescription: "あなたの婚活スペックは未婚同性の上位何%？ 年齢・年収・身長・学歴・居住地から希少性を見ます。",
  imageVersion: "20260628",
});

export default async function MarketPage({ searchParams }: MarketPageProps) {
  const resolvedSearchParams = await searchParams;
  const initialSpec = parseMarketSearchParams(resolvedSearchParams);

  return <MarketApp initialSpec={initialSpec} />;
}
