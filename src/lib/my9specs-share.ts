import type { ConditionGender } from "@/data/conditions";
import type { CustomSpecInput } from "@/lib/my9specs";
import { getMy9SpecsShareLabels, getSelectedSpecs, serializeMy9SpecsSearchParams } from "@/lib/my9specs";
import { getSiteUrl } from "@/lib/site-url";

const X_HASHTAG = "私の譲れない9条件";
const X_VIA = "yauyuism";

function resolveOrigin() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return getSiteUrl();
}

export function getMy9SpecsBuilderPath(
  targetGender: ConditionGender,
  presetIds: string[] = [],
  customInputs: CustomSpecInput[] = []
) {
  const query = serializeMy9SpecsSearchParams(targetGender, presetIds, customInputs);
  return query ? `/my9specs?${query}` : "/my9specs";
}

export function getMy9SpecsResultPath(
  targetGender: ConditionGender,
  presetIds: string[],
  customInputs: CustomSpecInput[] = []
) {
  return `/my9specs/result?${serializeMy9SpecsSearchParams(targetGender, presetIds, customInputs)}`;
}

export function getMy9SpecsResultUrl(
  targetGender: ConditionGender,
  presetIds: string[],
  customInputs: CustomSpecInput[] = []
) {
  return `${resolveOrigin()}${getMy9SpecsResultPath(targetGender, presetIds, customInputs)}`;
}

export function getMy9SpecsOgImageUrl(
  targetGender: ConditionGender,
  presetIds: string[],
  customInputs: CustomSpecInput[] = []
) {
  return `/api/og-my9specs?${serializeMy9SpecsSearchParams(targetGender, presetIds, customInputs)}`;
}

export function getMy9SpecsXShareUrl(
  targetGender: ConditionGender,
  presetIds: string[],
  customInputs: CustomSpecInput[],
  count: number
) {
  const labels = getMy9SpecsShareLabels(getSelectedSpecs(presetIds, customInputs));
  const text = `結婚相手に譲れない条件を9つ選んだら、全部満たす人は日本に${count.toLocaleString()}人でした\n\n${labels}\n\nあなたの譲れない条件は？→`;

  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(
    getMy9SpecsResultUrl(targetGender, presetIds, customInputs)
  )}&hashtags=${encodeURIComponent(X_HASHTAG)}&via=${encodeURIComponent(X_VIA)}`;
}

export function getMy9SpecsLineShareUrl(
  targetGender: ConditionGender,
  presetIds: string[],
  customInputs: CustomSpecInput[],
  count: number
) {
  const labels = getMy9SpecsShareLabels(getSelectedSpecs(presetIds, customInputs));
  const text = `結婚相手に譲れない条件を9つ選んだら、全部満たす人は日本に${count.toLocaleString()}人でした。 ${labels}`;

  return `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(
    getMy9SpecsResultUrl(targetGender, presetIds, customInputs)
  )}&text=${encodeURIComponent(text)}`;
}
