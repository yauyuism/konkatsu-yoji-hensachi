import { MarketApp } from "@/components/market/MarketApp";
import { buildShareMetadata } from "@/lib/metadata";
import { parseMarketSearchParams } from "@/lib/market";

type MarketPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata = buildShareMetadata({
  title: "婚活スペック年収換算",
  description: "あなたの婚活スペック、年収換算でどのくらい？ 年齢・年収・身長・学歴・居住地から希少性を見直す無料ツールです。",
  path: "/market",
  imagePath: "/og/market-top.png?v=20260316",
  imageAlt: "婚活スペック年収換算のトップOGP画像",
  ogDescription: "あなたの婚活スペック、年収換算でどのくらい？ 条件チェッカーの逆視点で希少性を見ます。",
  twitterDescription: "あなたの婚活スペック、年収換算でどのくらい？ 年齢・年収・身長・学歴・居住地から希少性を見ます。",
});

export default async function MarketPage({ searchParams }: MarketPageProps) {
  const resolvedSearchParams = await searchParams;
  const initialSpec = parseMarketSearchParams(resolvedSearchParams);

  return <MarketApp initialSpec={initialSpec} />;
}
