import type { Metadata } from "next";

import { FatigueReasonApp } from "@/components/fatigue-reason/FatigueReasonApp";
import { isFatigueReasonType } from "@/lib/fatigue-reason";
import { FATIGUE_REASON_DISPLAY_META } from "@/lib/fatigue-reason-display";
import { buildShareMetadata } from "@/lib/metadata";

const title = "婚活疲れ・マチアプ疲れの理由診断";
const description =
  "会えるのに進まない理由を、婚活相談の現場でよく出る悩みからタイプ別に診断します。マチアプ疲れ、婚活疲れ、相談所前の迷いを一度整理したい人へ。";

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
  imagePath: "/api/og-top",
  imageAlt: "婚活疲れ・マチアプ疲れの理由診断のOGP画像",
  ogTitle: title,
  ogDescription: description,
});

export async function generateMetadata({ searchParams }: KonkatsuFatiguePageProps): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const resultParam = getSingleParam(resolvedSearchParams.result);

  if (!isFatigueReasonType(resultParam)) {
    return defaultMetadata;
  }

  const meta = FATIGUE_REASON_DISPLAY_META[resultParam];

  return buildShareMetadata({
    title: `${meta.resultLabel} | ${title}`,
    description: meta.shareCopy,
    path: `/diagnoses/konkatsu-fatigue?result=${resultParam}`,
    imagePath: `/api/og-fatigue-reason?result=${resultParam}`,
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
  const initialResultType = isFatigueReasonType(resultParam) ? resultParam : null;

  return <FatigueReasonApp initialResultType={initialResultType} />;
}
