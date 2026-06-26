import type { Metadata } from "next";

import { DeaiFitApp } from "@/components/deai-fit/DeaiFitApp";
import { isDeaiFitType } from "@/lib/deai-fit";
import { DEAI_FIT_DISPLAY_META } from "@/lib/deai-fit-display";
import { DEAI_FIT_SHARE_VERSION, getDeaiFitResultSlug } from "@/lib/deai-fit-share";
import { buildShareMetadata } from "@/lib/metadata";

type DeaiFitPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

const title = "あなたに合う出会い方診断";
const description = "マチアプ・相談所・紹介・外飲み・SNS。自分に合う出会い方を診断します。";
const topOgpImageVersion = "20260628";

const defaultMetadata = buildShareMetadata({
  title: "あなたに合う出会い方診断",
  description,
  path: "/diagnoses/deai-fit",
  imagePath: "/og/deai-fit-top.png",
  imageAlt: "あなたに合う出会い方診断のOGP画像",
  imageVersion: topOgpImageVersion,
  absoluteTitle: true,
  ogTitle: title,
  ogDescription: description,
});

export async function generateMetadata({ searchParams }: DeaiFitPageProps): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const resultParam = getSingleParam(resolvedSearchParams.result);

  if (!isDeaiFitType(resultParam)) {
    return defaultMetadata;
  }

  const meta = DEAI_FIT_DISPLAY_META[resultParam];
  const resultSlug = getDeaiFitResultSlug(resultParam);

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

export default async function DeaiFitPage({ searchParams }: DeaiFitPageProps) {
  const resolvedSearchParams = await searchParams;
  const resultParam = getSingleParam(resolvedSearchParams.result);
  const initialResultType = isDeaiFitType(resultParam) ? resultParam : null;

  return <DeaiFitApp initialResultType={initialResultType} />;
}
