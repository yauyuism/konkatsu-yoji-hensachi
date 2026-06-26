import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DeaiFitApp } from "@/components/deai-fit/DeaiFitApp";
import { DEAI_FIT_TYPE_ORDER } from "@/lib/deai-fit";
import { DEAI_FIT_DISPLAY_META } from "@/lib/deai-fit-display";
import { DEAI_FIT_SHARE_VERSION, getDeaiFitResultSlug, resolveDeaiFitTypeFromSlug } from "@/lib/deai-fit-share";
import { buildShareMetadata } from "@/lib/metadata";

const title = "あなたに合う出会い方診断";

type DeaiFitResultPageProps = {
  params: Promise<{
    type: string;
  }>;
};

export function generateStaticParams() {
  return DEAI_FIT_TYPE_ORDER.map((type) => ({
    type: getDeaiFitResultSlug(type),
  }));
}

async function resolveResultType(params: DeaiFitResultPageProps["params"]) {
  const { type } = await params;

  return resolveDeaiFitTypeFromSlug(type);
}

export async function generateMetadata({ params }: DeaiFitResultPageProps): Promise<Metadata> {
  const resultType = await resolveResultType(params);

  if (!resultType) {
    return {};
  }

  const meta = DEAI_FIT_DISPLAY_META[resultType];
  const resultSlug = getDeaiFitResultSlug(resultType);

  return buildShareMetadata({
    title: `${meta.resultLabel} | ${title}`,
    description: meta.shareCopy,
    path: `/diagnoses/deai-fit/result/${resultSlug}`,
    imagePath: `/og/deai-fit/${resultSlug}.png`,
    imageAlt: `${title} ${meta.resultLabel}の診断カード`,
    absoluteTitle: true,
    ogTitle: `${title}｜${meta.resultLabel}`,
    ogDescription: meta.shareCopy,
    twitterTitle: `${title}｜${meta.resultLabel}`,
    twitterDescription: meta.shareCopy,
    imageVersion: DEAI_FIT_SHARE_VERSION,
    siteName: "診断ラボ",
  });
}

export default async function DeaiFitResultPage({ params }: DeaiFitResultPageProps) {
  const resultType = await resolveResultType(params);

  if (!resultType) {
    notFound();
  }

  return <DeaiFitApp initialResultType={resultType} isShareResultPage />;
}
