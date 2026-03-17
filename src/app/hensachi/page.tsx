import { HensachiApp } from "@/components/hensachi/HensachiApp";
import { buildShareMetadata } from "@/lib/metadata";

export const metadata = buildShareMetadata({
  title: "マッチングアプリ偏差値診断",
  description: "あなたのアプリ偏差値を採点。16問・約3分で、アプリ力を5軸の偏差値として可視化する無料診断です。",
  path: "/hensachi",
  imagePath: "/api/og-hensachi-top",
  imageAlt: "マッチングアプリ偏差値診断のトップOGP画像",
  ogDescription: "あなたのアプリ偏差値を採点。16問・約3分で、アプリ力を5軸の偏差値として可視化します。",
});

type HensachiPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HensachiPage({ searchParams }: HensachiPageProps) {
  const resolvedSearchParams = await searchParams;
  const skipIntro = (Array.isArray(resolvedSearchParams.skip) ? resolvedSearchParams.skip[0] : resolvedSearchParams.skip) === "1";

  return <HensachiApp skipIntro={skipIntro} />;
}
