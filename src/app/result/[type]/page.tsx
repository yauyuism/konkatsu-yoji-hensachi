import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { resultTypes, results } from "@/data/results";
import { ResultScreen } from "@/components/ResultScreen";
import { isResultType } from "@/lib/diagnosis";
import { getSiteUrl } from "@/lib/site-url";

type ResultPageProps = {
  params: Promise<{
    type: string;
  }>;
};

export function generateStaticParams() {
  return resultTypes.map((type) => ({ type }));
}

export async function generateMetadata({ params }: ResultPageProps): Promise<Metadata> {
  const { type: rawType } = await params;
  const type = rawType.toLowerCase();

  if (!isResultType(type)) {
    return {
      title: "結果が見つかりません",
      description: "存在しない診断結果です。",
    };
  }

  const result = results[type];
  const title = `【${result.yoji}】あなたの婚活四字熟語`;

  return {
    title,
    description: result.meaning,
    robots: {
      index: false,
      follow: false,
    },
    alternates: {
      canonical: `/result/${type}`,
    },
    openGraph: {
      title: `${title} | 婚活診断LAB by アイカタ`,
      description: result.meaning,
      type: "article",
      url: `/result/${type}`,
      images: [
        {
          url: `/api/og?type=${type}`,
          width: 1200,
          height: 630,
          alt: result.yoji,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | 婚活診断LAB by アイカタ`,
      description: result.meaning,
      images: [`/api/og?type=${type}`],
    },
  };
}

export default async function ResultPage({ params }: ResultPageProps) {
  const { type: rawType } = await params;
  const type = rawType.toLowerCase();

  if (!isResultType(type)) {
    notFound();
  }

  return (
    <ResultScreen
      result={results[type]}
      resultUrl={`${getSiteUrl()}/result/${type}`}
      restartHref="/yoji"
    />
  );
}
