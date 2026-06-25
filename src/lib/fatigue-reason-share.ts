import type { FatigueReasonType } from "@/lib/fatigue-reason";
import { getSiteUrl } from "@/lib/site-url";

const X_HASHTAGS = "婚活疲れ,マチアプ疲れ";
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
  topLabels,
  resultUrl,
}: {
  resultLabel: string;
  shortCopy: string;
  topLabels: string[];
  resultUrl: string;
}) {
  const topText = topLabels.slice(0, 3).map((label, index) => `${index + 1}. ${label}`).join("\n");
  const text = `婚活疲れ・マチアプ疲れの理由診断をやってみたら、\n「${resultLabel}」でした。\n${shortCopy}\n\n今のしんどさ：\n${topText}\n\n診断はこちら`;

  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    text
  )}&url=${encodeURIComponent(resultUrl)}&hashtags=${encodeURIComponent(X_HASHTAGS)}&via=${encodeURIComponent(X_VIA)}`;
}
