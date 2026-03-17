import type { Metadata } from "next";

import { WeightResultScreen } from "@/components/weight/WeightResultScreen";
import {
  getWeightLineShareUrl,
  getWeightOgImageUrl,
  getWeightResultDescription,
  getWeightResultFromSearchParams,
  getWeightResultPath,
  getWeightResultTitle,
  getWeightResultUrl,
  getWeightXShareUrl,
} from "@/lib/weight-share";

type WeightResultPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }: WeightResultPageProps): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const parsed = getWeightResultFromSearchParams(resolvedSearchParams);
  const title = getWeightResultTitle(parsed.situation, parsed.result);
  const description = getWeightResultDescription(parsed.situation, parsed.result);
  const ogImageUrl = getWeightOgImageUrl({
    situation: parsed.situation,
    totalWeight: parsed.result.totalWeight,
    partnerWeight: parsed.result.partnerWeight,
    messageCount: parsed.messageCount,
    myMessageCount: parsed.sourceMeta.myMessageCount,
    theirMessageCount: parsed.sourceMeta.theirMessageCount,
    inputMode: parsed.sourceMeta.inputMode,
    confidence: parsed.sourceMeta.confidence,
    imageCount: parsed.sourceMeta.imageCount,
    breakdown: parsed.result.breakdown,
    analysisComment: parsed.analysisComment,
  });

  return {
    title,
    description,
    alternates: {
      canonical: getWeightResultPath({
        situation: parsed.situation,
        totalWeight: parsed.result.totalWeight,
        partnerWeight: parsed.result.partnerWeight,
        messageCount: parsed.messageCount,
        myMessageCount: parsed.sourceMeta.myMessageCount,
        theirMessageCount: parsed.sourceMeta.theirMessageCount,
        inputMode: parsed.sourceMeta.inputMode,
        confidence: parsed.sourceMeta.confidence,
        imageCount: parsed.sourceMeta.imageCount,
        breakdown: parsed.result.breakdown,
        analysisComment: parsed.analysisComment,
      }),
    },
    openGraph: {
      title: `${title} | やうゆの婚活診断`,
      description,
      type: "article",
      url: getWeightResultPath({
        situation: parsed.situation,
        totalWeight: parsed.result.totalWeight,
        partnerWeight: parsed.result.partnerWeight,
        messageCount: parsed.messageCount,
        myMessageCount: parsed.sourceMeta.myMessageCount,
        theirMessageCount: parsed.sourceMeta.theirMessageCount,
        inputMode: parsed.sourceMeta.inputMode,
        confidence: parsed.sourceMeta.confidence,
        imageCount: parsed.sourceMeta.imageCount,
        breakdown: parsed.result.breakdown,
        analysisComment: parsed.analysisComment,
      }),
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
      title: `${title} | やうゆの婚活診断`,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function WeightResultPage({ searchParams }: WeightResultPageProps) {
  const resolvedSearchParams = await searchParams;
  const parsed = getWeightResultFromSearchParams(resolvedSearchParams);
  const sharePayload = {
    situation: parsed.situation,
    totalWeight: parsed.result.totalWeight,
    partnerWeight: parsed.result.partnerWeight,
    messageCount: parsed.messageCount,
    myMessageCount: parsed.sourceMeta.myMessageCount,
    theirMessageCount: parsed.sourceMeta.theirMessageCount,
    inputMode: parsed.sourceMeta.inputMode,
    confidence: parsed.sourceMeta.confidence,
    imageCount: parsed.sourceMeta.imageCount,
    breakdown: parsed.result.breakdown,
    analysisComment: parsed.analysisComment,
  };

  return (
    <WeightResultScreen
      situation={parsed.situation}
      result={parsed.result}
      messageCount={parsed.messageCount}
      sourceMeta={parsed.sourceMeta}
      analysisComment={parsed.analysisComment}
      comment={parsed.comment}
      xShareUrl={getWeightXShareUrl(sharePayload)}
      lineShareUrl={getWeightLineShareUrl(sharePayload)}
      restartHref="/weight"
    />
  );
}
