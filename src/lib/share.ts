import type { Result } from "@/data/results";

import { getSiteUrl } from "@/lib/site-url";

const X_HASHTAG = "婚活四字熟語";
const X_VIA = "yauyuism";

function resolveOrigin() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return getSiteUrl();
}

export function getResultUrl(type: string) {
  return `${resolveOrigin()}/result/${type}`;
}

export function getMeaningPreview(meaning: string, maxLength = 40) {
  if (meaning.length <= maxLength) {
    return meaning;
  }

  return `${meaning.slice(0, maxLength)}…`;
}

export function getXShareUrl(result: Result, resultUrl: string) {
  const text = `私の婚活四字熟語は【${result.yoji}】でした\n\n${getMeaningPreview(result.meaning)}\n\nあなたは？→`;

  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    text
  )}&url=${encodeURIComponent(resultUrl)}&hashtags=${encodeURIComponent(X_HASHTAG)}&via=${encodeURIComponent(X_VIA)}`;
}

export function getLineShareUrl(result: Result, resultUrl: string) {
  const shareText = `私の婚活四字熟語は【${result.yoji}】でした\n\n${getMeaningPreview(
    result.meaning
  )}\n\nあなたは？→ ${resultUrl}\n#${X_HASHTAG}`;

  return `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(
    resultUrl
  )}&text=${encodeURIComponent(shareText)}`;
}
