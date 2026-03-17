import { My9SpecsApp } from "@/components/my9specs/My9SpecsApp";
import { buildShareMetadata } from "@/lib/metadata";
import { parseMy9SpecsSearchParams } from "@/lib/my9specs";

type My9SpecsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata = buildShareMetadata({
  title: "私が譲れない9つの条件",
  description: "60個の条件から9つ選ぶと、理想条件の3×3カードと、その条件を満たす未婚者の推計人数を返します。",
  path: "/my9specs",
  imagePath: "/api/og-my9specs?mode=top",
  imageAlt: "私が譲れない9つの条件のOGP画像",
  ogTitle: "My 9 Specs | 私が譲れない9つの条件",
  ogDescription: "譲れない条件を9つ選ぶと、理想条件のカード画像と推計人数を返します。",
});

export default async function My9SpecsPage({ searchParams }: My9SpecsPageProps) {
  const resolvedSearchParams = await searchParams;
  const { targetGender, presetIds, customInputs } = parseMy9SpecsSearchParams(resolvedSearchParams);

  return (
    <My9SpecsApp
      initialTargetGender={targetGender}
      initialPresetIds={presetIds}
      initialCustomInputs={customInputs}
    />
  );
}
