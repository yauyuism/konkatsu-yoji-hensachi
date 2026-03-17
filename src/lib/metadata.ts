import type { Metadata } from "next";

import { getSiteUrl } from "@/lib/site-url";

export const SITE_NAME = "やうゆの婚活診断";
export const DEFAULT_SITE_TITLE = "SHINDAN LAB";
export const DEFAULT_SITE_DESCRIPTION =
  "診断で、自分を丸裸にする。恋愛と婚活を感覚ではなく数字で見直す診断ラボです。";

const OGP_IMAGE_WIDTH = 1200;
const OGP_IMAGE_HEIGHT = 630;
const OGP_IMAGE_TYPE = "image/png";
const OGP_CACHE_BUSTER = "20260316";
const X_ACCOUNT = "@yauyuism";

type ShareMetadataOptions = {
  title: string;
  description: string;
  path: `/${string}` | "/";
  imagePath: `/${string}`;
  imageAlt: string;
  ogTitle?: string;
  ogDescription?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  robots?: Metadata["robots"];
};

export function buildShareMetadata({
  title,
  description,
  path,
  imagePath,
  imageAlt,
  ogTitle,
  ogDescription,
  twitterTitle,
  twitterDescription,
  robots,
}: ShareMetadataOptions): Metadata {
  const siteUrl = getSiteUrl();
  const absolutePageUrl = new URL(path, siteUrl).toString();
  const absoluteImageUrl = new URL(imagePath, siteUrl);
  absoluteImageUrl.searchParams.set("v", OGP_CACHE_BUSTER);

  const resolvedOgTitle = ogTitle ?? `${title} | ${SITE_NAME}`;
  const resolvedOgDescription = ogDescription ?? description;
  const resolvedTwitterTitle = twitterTitle ?? resolvedOgTitle;
  const resolvedTwitterDescription = twitterDescription ?? resolvedOgDescription;

  return {
    title,
    description,
    robots,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: resolvedOgTitle,
      description: resolvedOgDescription,
      url: absolutePageUrl,
      type: "website",
      siteName: SITE_NAME,
      locale: "ja_JP",
      images: [
        {
          url: absoluteImageUrl,
          secureUrl: absoluteImageUrl,
          type: OGP_IMAGE_TYPE,
          width: OGP_IMAGE_WIDTH,
          height: OGP_IMAGE_HEIGHT,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: X_ACCOUNT,
      creator: X_ACCOUNT,
      title: resolvedTwitterTitle,
      description: resolvedTwitterDescription,
      images: [
        {
          url: absoluteImageUrl,
          secureUrl: absoluteImageUrl,
          type: OGP_IMAGE_TYPE,
          width: OGP_IMAGE_WIDTH,
          height: OGP_IMAGE_HEIGHT,
          alt: imageAlt,
        },
      ],
    },
  };
}
