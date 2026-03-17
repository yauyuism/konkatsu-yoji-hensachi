import { getSiteUrl } from "@/lib/site-url";

import {
  getConditionSummaryInline,
  serializeConditionsParams,
  type Conditions,
} from "@/lib/conditions";
import { type InputMethod } from "@/lib/convert-filter";

const X_HASHTAG = "条件リアリティチェック";
const X_VIA = "yauyuism";

function resolveOrigin() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return getSiteUrl();
}

function appendInputMethod(query: string, inputMethod: InputMethod) {
  return `${query}&m=${inputMethod}`;
}

function getLeadText(inputMethod: InputMethod, count: number, percentage: number) {
  return inputMethod === "screenshot"
    ? `結婚相手の条件をアプリのスクショから読み取ったら、未婚者全体の${percentage.toFixed(2)}%だった（約${count.toLocaleString()}人）`
    : `結婚相手の条件を入力したら、未婚者全体の${percentage.toFixed(2)}%だった（約${count.toLocaleString()}人）`;
}

export function getConditionsResultPath(conditions: Conditions, inputMethod: InputMethod = "manual") {
  return `/conditions/result?${appendInputMethod(serializeConditionsParams(conditions), inputMethod)}`;
}

export function getConditionsResultUrl(conditions: Conditions, inputMethod: InputMethod = "manual") {
  return `${resolveOrigin()}${getConditionsResultPath(conditions, inputMethod)}`;
}

export function getConditionsOgImageUrl(conditions: Conditions, inputMethod: InputMethod = "manual") {
  return `/api/og-conditions?${appendInputMethod(serializeConditionsParams(conditions), inputMethod)}`;
}

export function getConditionsXShareUrl(
  conditions: Conditions,
  count: number,
  percentage: number,
  inputMethod: InputMethod = "manual"
) {
  const text = `${getLeadText(inputMethod, count, percentage)}\n\n${getConditionSummaryInline(
    conditions
  )}\n\nあなたの"普通"は何人？→`;

  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    text
  )}&url=${encodeURIComponent(getConditionsResultUrl(conditions, inputMethod))}&hashtags=${encodeURIComponent(X_HASHTAG)}&via=${encodeURIComponent(X_VIA)}`;
}

export function getConditionsLineShareUrl(
  conditions: Conditions,
  count: number,
  percentage: number,
  inputMethod: InputMethod = "manual"
) {
  const text = `${getLeadText(inputMethod, count, percentage)}。 ${getConditionSummaryInline(conditions)}`;

  return `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(
    getConditionsResultUrl(conditions, inputMethod)
  )}&text=${encodeURIComponent(text)}`;
}

export function getConditionsShareAlt(conditions: Conditions) {
  return `条件リアリティチェック: ${getConditionSummaryInline(conditions)}`;
}
