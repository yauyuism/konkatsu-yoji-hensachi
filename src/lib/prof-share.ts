import type { BaseAnalysisResult, PartialAnalysisResult, ScoreSet } from "@/lib/prof";
import { serializeProfShareParams } from "@/lib/prof";
import { getSiteUrl } from "@/lib/site-url";
import type { StatsSnapshot } from "@/lib/stats";

const X_HASHTAG = "プロフ偏差値";
const X_VIA = "yauyuism";

export type ProfShareMode = "result" | "beforeAfter";

function resolveOrigin() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return getSiteUrl();
}

export function getProfResultPath(scores: ScoreSet, improvedTotal?: number | null, nickname?: string | null) {
  return `/prof/result?${serializeProfShareParams(scores, improvedTotal, nickname)}`;
}

export function getProfResultUrl(scores: ScoreSet, improvedTotal?: number | null, nickname?: string | null) {
  return `${resolveOrigin()}${getProfResultPath(scores, improvedTotal, nickname)}`;
}

export function getProfOgImageUrl(scores: ScoreSet, improvedTotal?: number | null) {
  return `/api/og-prof?${serializeProfShareParams(scores, improvedTotal)}`;
}

export function getProfStatsUrl() {
  return `${resolveOrigin()}/prof/stats`;
}

export function getProfStatsOgImageUrl() {
  return "/api/og-stats";
}

export function getProfShareDrafts(result: PartialAnalysisResult) {
  const before = result.scores.total;
  const after = result.improvedProfile?.estimatedScores.total ?? before;

  return {
    resultX: `プロフィール偏差値は${before}点だった\n\nプロフ文を貼るだけで、5項目のスコアと改善案が出る。→`,
    resultLine: `プロフィール偏差値は${before}点だった。プロフ文を貼るだけで診断できる`,
    beforeAfterX: `プロフィール偏差値 ${before} → ${after} に上がった\n\n改善案つきでプロフを見直せる。→`,
    beforeAfterLine: `プロフィール偏差値 ${before} → ${after} に上がった。改善案つきで見直せる`,
  };
}

export function getProfXShareUrl(result: BaseAnalysisResult | PartialAnalysisResult, resultUrl: string, mode: ProfShareMode = "result") {
  const drafts = getProfShareDrafts(result);
  const text = mode === "beforeAfter" ? drafts.beforeAfterX : drafts.resultX;

  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    text
  )}&url=${encodeURIComponent(resultUrl)}&hashtags=${encodeURIComponent(X_HASHTAG)}&via=${encodeURIComponent(X_VIA)}`;
}

export function getProfLineShareUrl(result: BaseAnalysisResult | PartialAnalysisResult, resultUrl: string, mode: ProfShareMode = "result") {
  const drafts = getProfShareDrafts(result);
  const text = mode === "beforeAfter" ? drafts.beforeAfterLine : drafts.resultLine;

  return `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(
    resultUrl
  )}&text=${encodeURIComponent(text)}`;
}

export function getProfStatsShareText(stats: StatsSnapshot) {
  const topMistake = stats.badRanking[0];
  const male = stats.avgHensachiByGender.male ?? 0;
  const female = stats.avgHensachiByGender.female ?? 0;
  const topPct = stats.totalCount > 0 ? Math.round((topMistake.count / stats.totalCount) * 100) : 0;

  return `マッチングアプリのプロフ偏差値、${stats.totalCount.toLocaleString()}人のデータが集まった\n\n男性平均 ${male} / 女性平均 ${female}\n一番多いミスは「${topMistake.category}」（${topPct}%）\n\nあなたは平均より上？下？→`;
}

export function getProfStatsXShareUrl(stats: StatsSnapshot) {
  const text = getProfStatsShareText(stats);
  const url = getProfStatsUrl();

  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    text
  )}&url=${encodeURIComponent(url)}&hashtags=${encodeURIComponent(X_HASHTAG)}&via=${encodeURIComponent(X_VIA)}`;
}
