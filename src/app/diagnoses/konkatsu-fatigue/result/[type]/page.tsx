import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FatigueReasonApp } from "@/components/fatigue-reason/FatigueReasonApp";
import { FATIGUE_REASON_TYPE_ORDER, isFatigueReasonType, type FatigueReasonType } from "@/lib/fatigue-reason";
import { FATIGUE_REASON_DISPLAY_META } from "@/lib/fatigue-reason-display";
import { buildShareMetadata } from "@/lib/metadata";

const title = "婚活疲れ・マチアプ疲れの理由診断";

type FatigueResultPageProps = {
  params: Promise<{
    type: string;
  }>;
};

const fatigueReasonShareTypes: FatigueReasonType[] = [...FATIGUE_REASON_TYPE_ORDER, "lowSignal"];

export function generateStaticParams() {
  return fatigueReasonShareTypes.map((type) => ({ type }));
}

async function resolveResultType(params: FatigueResultPageProps["params"]) {
  const { type } = await params;

  return isFatigueReasonType(type) ? type : null;
}

export async function generateMetadata({ params }: FatigueResultPageProps): Promise<Metadata> {
  const resultType = await resolveResultType(params);

  if (!resultType) {
    return {};
  }

  const meta = FATIGUE_REASON_DISPLAY_META[resultType];

  return buildShareMetadata({
    title: `${meta.resultLabel} | ${title}`,
    description: meta.shareCopy,
    path: `/diagnoses/konkatsu-fatigue/result/${resultType}`,
    imagePath: `/og/fatigue-reason/${resultType}.png`,
    imageAlt: `${title} ${meta.resultLabel}の診断カード`,
    absoluteTitle: true,
    ogTitle: `婚活疲れ診断の結果は「${meta.resultLabel}」`,
    ogDescription: meta.shareCopy,
    twitterTitle: `婚活疲れ診断の結果は「${meta.resultLabel}」`,
    twitterDescription: meta.shareCopy,
  });
}

export default async function FatigueResultPage({ params }: FatigueResultPageProps) {
  const resultType = await resolveResultType(params);

  if (!resultType) {
    notFound();
  }

  return <FatigueReasonApp initialResultType={resultType} isShareResultPage />;
}
