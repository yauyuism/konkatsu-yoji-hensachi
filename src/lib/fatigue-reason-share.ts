import { isFatigueReasonType, type FatigueReasonType } from "@/lib/fatigue-reason";
import { getSiteUrl } from "@/lib/site-url";

const X_HASHTAGS = "婚活疲れ,マチアプ疲れ";

export const FATIGUE_REASON_RESULT_SLUGS: Record<FatigueReasonType, string> = {
  fastJudgment: "fast-judgment",
  wrongPeople: "wrong-people",
  purposeFirst: "purpose-first",
  profileInvisible: "profile-invisible",
  placeMismatch: "place-mismatch",
  overAdjusting: "over-adjusting",
  stagedFatigue: "staged-fatigue",
  reset: "reset",
  lowSignal: "low-signal",
};

const FATIGUE_REASON_TYPES_BY_SLUG = Object.entries(FATIGUE_REASON_RESULT_SLUGS).reduce<Record<string, FatigueReasonType>>(
  (accumulator, [type, slug]) => {
    accumulator[slug] = type as FatigueReasonType;

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

export function getFatigueReasonResultPath(type: FatigueReasonType) {
  return `/diagnoses/konkatsu-fatigue/result/${FATIGUE_REASON_RESULT_SLUGS[type]}`;
}

export function getFatigueReasonResultUrl(type: FatigueReasonType) {
  return `${resolveOrigin()}${getFatigueReasonResultPath(type)}`;
}

export function getFatigueReasonResultSlug(type: FatigueReasonType) {
  return FATIGUE_REASON_RESULT_SLUGS[type];
}

export function resolveFatigueReasonTypeFromSlug(value: string | null | undefined): FatigueReasonType | null {
  if (!value) {
    return null;
  }

  return FATIGUE_REASON_TYPES_BY_SLUG[value] ?? (isFatigueReasonType(value) ? value : null);
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
