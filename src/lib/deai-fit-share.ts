import type { DeaiFitType } from "@/lib/deai-fit";
import { getSiteUrl } from "@/lib/site-url";

export const DEAI_FIT_RESULT_SLUGS: Record<DeaiFitType, string> = {
  "O-C-Q-D": "ocqd",
  "O-C-Q-N": "ocqn",
  "O-C-S-D": "ocsd",
  "O-C-S-N": "ocsn",
  "O-V-Q-D": "ovqd",
  "O-V-Q-N": "ovqn",
  "O-V-S-D": "ovsd",
  "O-V-S-N": "ovsn",
  "F-C-Q-D": "fcqd",
  "F-C-Q-N": "fcqn",
  "F-C-S-D": "fcsd",
  "F-C-S-N": "fcsn",
  "F-V-Q-D": "fvqd",
  "F-V-Q-N": "fvqn",
  "F-V-S-D": "fvsd",
  "F-V-S-N": "fvsn",
};

const DEAI_FIT_TYPES_BY_SLUG = Object.entries(DEAI_FIT_RESULT_SLUGS).reduce<Record<string, DeaiFitType>>(
  (accumulator, [type, slug]) => {
    accumulator[slug] = type as DeaiFitType;

    return accumulator;
  },
  {}
);

function resolveOrigin() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return getSiteUrl();
}

export function getDeaiFitResultPath(type: DeaiFitType) {
  return `/diagnoses/deai-fit/result/${DEAI_FIT_RESULT_SLUGS[type]}`;
}

export function getDeaiFitResultUrl(type: DeaiFitType) {
  return `${resolveOrigin()}${getDeaiFitResultPath(type)}`;
}

export function getDeaiFitResultSlug(type: DeaiFitType) {
  return DEAI_FIT_RESULT_SLUGS[type];
}

export function resolveDeaiFitTypeFromSlug(value: string | null | undefined): DeaiFitType | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim();
  const lower = normalized.toLowerCase();

  if (DEAI_FIT_TYPES_BY_SLUG[lower]) {
    return DEAI_FIT_TYPES_BY_SLUG[lower];
  }

  const upperType = normalized.toUpperCase();

  return DEAI_FIT_TYPES_BY_SLUG[upperType.replaceAll("-", "").toLowerCase()] ?? null;
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
  const text = `あなたに合う出会い方診断をやってみたら、\n「${resultTitle}」でした。\n\n${shortCopy}${suitedText}\n\n診断はこちら`;

  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(resultUrl)}`;
}
