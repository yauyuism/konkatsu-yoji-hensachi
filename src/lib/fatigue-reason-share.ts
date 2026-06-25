import type { FatigueReasonType } from "@/lib/fatigue-reason";
import { getSiteUrl } from "@/lib/site-url";

const X_HASHTAGS = "婚活疲れ,マチアプ疲れ,婚活診断";
const X_VIA = "yauyuism";

function resolveOrigin() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return getSiteUrl();
}

export function getFatigueReasonResultPath(type: FatigueReasonType) {
  return `/diagnoses/konkatsu-fatigue?result=${type}`;
}

export function getFatigueReasonResultUrl(type: FatigueReasonType) {
  return `${resolveOrigin()}${getFatigueReasonResultPath(type)}`;
}

export function getFatigueReasonXShareUrl({
  resultLabel,
  shortCopy,
  resultUrl,
}: {
  resultLabel: string;
  shortCopy: string;
  resultUrl: string;
}) {
  const text = `婚活疲れ・マチアプ疲れ診断をやってみたら、私の結果は「${resultLabel}」でした。\n\n${shortCopy}\n\nあなたは？→`;

  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    text
  )}&url=${encodeURIComponent(resultUrl)}&hashtags=${encodeURIComponent(X_HASHTAGS)}&via=${encodeURIComponent(X_VIA)}`;
}
