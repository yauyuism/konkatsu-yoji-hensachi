import type { HensachiDiagnosisResult } from "@/lib/hensachi";
import type { HensachiAxisKey } from "@/data/hensachi-questions";

import { getSiteUrl } from "@/lib/site-url";
import { serializeHensachiAxes } from "@/lib/hensachi";

const X_HASHTAG = "アプリ偏差値";
const X_VIA = "yauyuism";

function resolveOrigin() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return getSiteUrl();
}

export function getHensachiResultPath(result: Pick<HensachiDiagnosisResult, "axes" | "answerIndexes"> | Record<HensachiAxisKey, number>) {
  const axes = "axes" in result ? result.axes : result;
  const answerIndexes = "answerIndexes" in result ? result.answerIndexes : undefined;

  return `/hensachi/result?${serializeHensachiAxes(axes, answerIndexes)}`;
}

export function getHensachiResultUrl(result: Pick<HensachiDiagnosisResult, "axes" | "answerIndexes"> | Record<HensachiAxisKey, number>) {
  return `${resolveOrigin()}${getHensachiResultPath(result)}`;
}

export function getHensachiOgImageUrl(result: HensachiDiagnosisResult) {
  const params = new URLSearchParams(serializeHensachiAxes(result.axes, result.answerIndexes));
  params.set("total", String(result.totalHensachi));
  params.set("title", result.title);
  params.set("color", result.color);

  return `/api/og-hensachi?${params.toString()}`;
}

function getShareHighlights(result: HensachiDiagnosisResult) {
  const sortedAxes = [...result.axisDetails].sort((left, right) => right.hensachi - left.hensachi);

  return {
    bestAxis: sortedAxes[0],
    weakestAxis: sortedAxes[sortedAxes.length - 1],
  };
}

export function getHensachiShareDrafts(result: HensachiDiagnosisResult) {
  const simple = `マッチングアプリ偏差値【${result.totalHensachi}】${result.title}\n\n通り名：「${result.nickname}」\n\nあなたのアプリ力は？→`;

  return {
    primary: simple,
    line: `マッチングアプリ偏差値【${result.totalHensachi}】${result.title}\n通り名：「${result.nickname}」\nあなたのアプリ力は？→`,
  };
}

export function getHensachiXShareUrl(result: HensachiDiagnosisResult, resultUrl: string) {
  const text = getHensachiShareDrafts(result).primary;

  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    text
  )}&url=${encodeURIComponent(resultUrl)}&hashtags=${encodeURIComponent(X_HASHTAG)}&via=${encodeURIComponent(X_VIA)}`;
}

export function getHensachiLineShareUrl(result: HensachiDiagnosisResult, resultUrl: string) {
  const shareText = getHensachiShareDrafts(result).line;

  return `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(
    resultUrl
  )}&text=${encodeURIComponent(shareText)}`;
}
