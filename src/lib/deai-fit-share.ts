import type { DeaiFitType } from "@/lib/deai-fit";
import { getSiteUrl } from "@/lib/site-url";

const X_HASHTAGS = "出会い方診断,婚活疲れ";
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
  resultCode,
  resultLabel,
  shortCopy,
  suitedItems = [],
  resultUrl,
}: {
  resultCode?: string;
  resultLabel: string;
  shortCopy: string;
  suitedItems?: string[];
  resultUrl: string;
}) {
  const resultTitle = resultCode ? `${resultCode}｜${resultLabel}` : resultLabel;
  const suitedText = suitedItems.length > 0 ? `\n\n合いやすい出会い方：\n${suitedItems.slice(0, 3).join(" / ")}` : "";
  const text = `あなたに合う出会い方診断をやってみたら、\n「${resultTitle}」でした。\n\nひとことで言うと\n「${shortCopy}」${suitedText}\n\n気になる人はこちら`;

  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    text
  )}&url=${encodeURIComponent(resultUrl)}&hashtags=${encodeURIComponent(X_HASHTAGS)}&via=${encodeURIComponent(X_VIA)}`;
}
