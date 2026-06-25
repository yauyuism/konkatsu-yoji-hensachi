import type { DeaiFitType } from "@/lib/deai-fit";
import { getSiteUrl } from "@/lib/site-url";

const X_HASHTAGS = "あなたに合う出会い方診断,婚活疲れ,マチアプ疲れ";
const X_VIA = "yauyuism";

function resolveOrigin() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return getSiteUrl();
}

export function getDeaiFitResultPath(type: DeaiFitType) {
  return `/diagnoses/deai-fit?result=${encodeURIComponent(type)}`;
}

export function getDeaiFitResultUrl(type: DeaiFitType) {
  return `${resolveOrigin()}${getDeaiFitResultPath(type)}`;
}

export function getDeaiFitXShareUrl({
  resultLabel,
  shortCopy,
  resultUrl,
}: {
  resultLabel: string;
  shortCopy: string;
  resultUrl: string;
}) {
  const text = `あなたに合う出会い方診断をやったら「${resultLabel}」でした。\n\n${shortCopy}\n\nあなたは？→`;

  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    text
  )}&url=${encodeURIComponent(resultUrl)}&hashtags=${encodeURIComponent(X_HASHTAGS)}&via=${encodeURIComponent(X_VIA)}`;
}
