import type { Metadata } from "next";

import { getSiteUrl } from "@/lib/site-url";

export const SITE_NAME = "婚活診断LAB by やうゆ";
export const DEFAULT_SITE_TITLE = "婚活・恋愛の癖を知る無料診断メディア";
export const DEFAULT_SITE_DESCRIPTION =
  "婚活・恋愛の癖を知る無料診断メディア。自分に合わない頑張り方を見直し、自分に合う出会い方を知るための入口です。";

const OGP_IMAGE_WIDTH = 1200;
const OGP_IMAGE_HEIGHT = 630;
const OGP_IMAGE_TYPE = "image/png";
const OGP_CACHE_BUSTER = "20260626";
const X_ACCOUNT = "@yauyuism";

type ShareMetadataOptions = {
  title: string;
  description: string;
  path: `/${string}` | "/";
  imagePath: `/${string}`;
  imageAlt: string;
  absoluteTitle?: boolean;
  ogTitle?: string;
  ogDescription?: string;
  siteName?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  imageVersion?: string;
  robots?: Metadata["robots"];
};

export function buildShareMetadata({
  title,
  description,
  path,
  imagePath,
  imageAlt,
  absoluteTitle,
  ogTitle,
  ogDescription,
  siteName,
  twitterTitle,
  twitterDescription,
  imageVersion,
  robots,
}: ShareMetadataOptions): Metadata {
  const siteUrl = getSiteUrl();
  const absolutePageUrl = new URL(path, siteUrl).toString();
  const absoluteImageUrl = new URL(imagePath, siteUrl);
  absoluteImageUrl.searchParams.set("v", imageVersion ?? OGP_CACHE_BUSTER);

  const resolvedOgTitle = ogTitle ?? `${title} | ${SITE_NAME}`;
  const resolvedOgDescription = ogDescription ?? description;
  const resolvedTwitterTitle = twitterTitle ?? resolvedOgTitle;
  const resolvedTwitterDescription = twitterDescription ?? resolvedOgDescription;
  const resolvedSiteName = siteName ?? SITE_NAME;

  return {
    title: absoluteTitle ? { absolute: title } : title,
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
      siteName: resolvedSiteName,
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
