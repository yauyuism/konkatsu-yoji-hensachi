import type { FatigueReasonType } from "@/lib/fatigue-reason";
import { getSiteUrl } from "@/lib/site-url";

const X_HASHTAGS = "婚活疲れ,マチアプ疲れ";

function resolveOrigin() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return getSiteUrl();
}

export function getFatigueReasonResultPath(type: FatigueReasonType) {
  return `/diagnoses/konkatsu-fatigue/result/${type}`;
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
  const text = `婚活疲れ・マチアプ疲れの理由診断をやってみたら、\n「${resultLabel}」でした。\n\n${shortCopy}\n\n診断はこちら`;

  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    text
  )}&url=${encodeURIComponent(resultUrl)}&hashtags=${encodeURIComponent(X_HASHTAGS)}`;
}
