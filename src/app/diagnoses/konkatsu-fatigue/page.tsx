import type { Metadata } from "next";

import { FatigueReasonApp } from "@/components/fatigue-reason/FatigueReasonApp";
import { FATIGUE_REASON_DISPLAY_META } from "@/lib/fatigue-reason-display";
import { getFatigueReasonResultSlug, resolveFatigueReasonTypeFromSlug } from "@/lib/fatigue-reason-share";
import { buildShareMetadata } from "@/lib/metadata";

const title = "婚活疲れ・マチアプ疲れの理由診断";
const description = "会えるのに進まない理由を、出会い方・選び方・判断のクセから言語化します。";
const topOgpImageVersion = "20260628";

type KonkatsuFatiguePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

const defaultMetadata = buildShareMetadata({
  title,
  description,
  path: "/diagnoses/konkatsu-fatigue",
  imagePath: "/og/konkatsu-fatigue-top.png",
  imageAlt: "婚活疲れ・マチアプ疲れの理由診断のOGP画像",
  imageVersion: topOgpImageVersion,
  absoluteTitle: true,
  ogTitle: title,
  ogDescription: description,
});

export async function generateMetadata({ searchParams }: KonkatsuFatiguePageProps): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const resultParam = getSingleParam(resolvedSearchParams.result);
  const resultType = resolveFatigueReasonTypeFromSlug(resultParam);

  if (!resultType) {
    return defaultMetadata;
  }

  const meta = FATIGUE_REASON_DISPLAY_META[resultType];
  const resultSlug = getFatigueReasonResultSlug(resultType);

  return buildShareMetadata({
    title: `${meta.resultLabel} | ${title}`,
    description: meta.shareCopy,
    path: `/diagnoses/konkatsu-fatigue?result=${resultSlug}`,
    imagePath: `/og/fatigue-reason/${resultSlug}.png`,
    imageAlt: `${title} ${meta.resultLabel}の診断カード`,
    absoluteTitle: true,
    ogTitle: `婚活疲れ診断の結果は「${meta.resultLabel}」`,
    ogDescription: meta.shareCopy,
    twitterTitle: `婚活疲れ診断の結果は「${meta.resultLabel}」`,
    twitterDescription: meta.shareCopy,
  });
}

export default async function KonkatsuFatiguePage({ searchParams }: KonkatsuFatiguePageProps) {
  const resolvedSearchParams = await searchParams;
  const resultParam = getSingleParam(resolvedSearchParams.result);
  const initialResultType = resolveFatigueReasonTypeFromSlug(resultParam);

  return <FatigueReasonApp initialResultType={initialResultType} />;
}
