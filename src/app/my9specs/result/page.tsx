import type { Metadata } from "next";

import { My9SpecsResultPanel } from "@/components/my9specs/My9SpecsResultPanel";
import { getSelectedSpecs, getMy9SpecsEstimate, parseMy9SpecsSearchParams } from "@/lib/my9specs";
import { getMy9SpecsBuilderPath, getMy9SpecsOgImageUrl, getMy9SpecsResultPath } from "@/lib/my9specs-share";
import { getSiteUrl } from "@/lib/site-url";

const OGP_IMAGE_TYPE = "image/png";
const OGP_CACHE_BUSTER = "20260317";
const X_ACCOUNT = "@yauyuism";

type My9SpecsResultPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }: My9SpecsResultPageProps): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const { targetGender, presetIds, customInputs } = parseMy9SpecsSearchParams(resolvedSearchParams);
  const selected = getSelectedSpecs(presetIds, customInputs);
  const estimate = getMy9SpecsEstimate(selected, targetGender);
  const title = `私が譲れない9条件 | 日本に約${estimate.count.toLocaleString()}人`;
  const siteUrl = getSiteUrl();
  const canonical = getMy9SpecsResultPath(targetGender, presetIds, customInputs);
  const canonicalUrl = new URL(canonical, siteUrl).toString();
  const ogImageUrl = new URL(getMy9SpecsOgImageUrl(targetGender, presetIds, customInputs), siteUrl);
  ogImageUrl.searchParams.set("v", OGP_CACHE_BUSTER);

  return {
    title,
    description: `この9条件を全部満たす人は日本に約${estimate.count.toLocaleString()}人。3×3カード付きでシェアできます。`,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${title} | 婚活診断LAB by やうゆ`,
      description: `譲れない条件を9つ選んだ結果、対象は約${estimate.count.toLocaleString()}人でした。`,
      type: "article",
      url: canonicalUrl,
      images: [
        {
          url: ogImageUrl,
          secureUrl: ogImageUrl,
          type: OGP_IMAGE_TYPE,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: X_ACCOUNT,
      creator: X_ACCOUNT,
      title: `${title} | 婚活診断LAB by やうゆ`,
      description: `この9条件を全部満たす人は日本に約${estimate.count.toLocaleString()}人。`,
      images: [
        {
          url: ogImageUrl,
          secureUrl: ogImageUrl,
          type: OGP_IMAGE_TYPE,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
  };
}

export default async function My9SpecsResultPage({ searchParams }: My9SpecsResultPageProps) {
  const resolvedSearchParams = await searchParams;
  const { targetGender, presetIds, customInputs } = parseMy9SpecsSearchParams(resolvedSearchParams);

  return (
    <section className="screen-shell mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
      <My9SpecsResultPanel
        targetGender={targetGender}
        presetIds={presetIds}
        customInputs={customInputs}
        editHref={getMy9SpecsBuilderPath(targetGender, presetIds, customInputs)}
      />
    </section>
  );
}
