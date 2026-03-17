import { getSituationOption, type Situation } from "@/data/weight";
import { getComment } from "@/lib/situation-judgment";
import { getTopFactor } from "@/lib/weight-calculator";
import { getSiteUrl } from "@/lib/site-url";
import { getSituationComparison } from "@/lib/situation-comparison";
import { roundTo1, roundTo2 } from "@/lib/text-analysis";
import { getJudgment } from "@/lib/weight-judgment";
import type { WeightAnalysisConfidence, WeightBreakdown, WeightInputMode, WeightResult, WeightSourceMeta } from "@/lib/weight-types";

const X_HASHTAG = "LINEメッセージ重量";
const X_VIA = "yauyuism";

type SearchParamValue = string | string[] | undefined;
type SearchParamsInput = Record<string, SearchParamValue>;

export interface WeightSharePayload {
  situation: Situation;
  totalWeight: number;
  partnerWeight: number;
  messageCount: number;
  myMessageCount: number;
  theirMessageCount: number;
  inputMode: WeightInputMode;
  confidence: WeightAnalysisConfidence;
  imageCount: number;
  breakdown: WeightBreakdown;
  analysisComment?: string;
}

function resolveOrigin() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return getSiteUrl();
}

function getParam(searchParams: SearchParamsInput, key: string) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value;
}

function parseNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseSituation(value: string | undefined): Situation {
  const option = getSituationOption((value as Situation | undefined) ?? "app_match");
  return option.value;
}

function parseInputMode(value: string | undefined): WeightInputMode {
  return value === "images" ? "images" : "text";
}

function parseConfidence(value: string | undefined): WeightAnalysisConfidence {
  if (value === "high" || value === "medium" || value === "low") {
    return value;
  }

  return "high";
}

function truncateComment(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  return value.trim().replace(/\s+/g, " ").slice(0, 80);
}

function buildBreakdownFromValues(searchParams: SearchParamsInput): WeightBreakdown {
  const textRatioValue = roundTo2(parseNumber(getParam(searchParams, "trv"), 1.2));
  const questionDensityValue = roundTo2(parseNumber(getParam(searchParams, "qdv"), 0.33));
  const emojiGapValue = roundTo2(parseNumber(getParam(searchParams, "egv"), 0.2));
  const topicInitRateValue = roundTo2(parseNumber(getParam(searchParams, "tiv"), 0.7));
  const lengthVarianceValue = roundTo1(parseNumber(getParam(searchParams, "lvv"), 36));

  return {
    baseWeight: {
      value: 1,
      weight: 1,
      detail: "全員共通の基礎重量",
    },
    textRatio: {
      value: textRatioValue,
      weight: roundTo1(parseNumber(getParam(searchParams, "trw"), Math.max(0, textRatioValue - 1) * 1.2)),
      detail: textRatioValue >= 1 ? `相手の${textRatioValue.toFixed(1)}倍書いてる` : `相手の${textRatioValue.toFixed(1)}倍の文量`,
    },
    questionDensity: {
      value: questionDensityValue,
      weight: roundTo1(parseNumber(getParam(searchParams, "qdw"), Math.max(0, questionDensityValue - 0.25) * 3)),
      detail: `質問率 ${(questionDensityValue * 100).toFixed(0)}%`,
    },
    emojiGap: {
      value: emojiGapValue,
      weight: roundTo1(parseNumber(getParam(searchParams, "egw"), Math.max(0, emojiGapValue) * 0.8)),
      detail: emojiGapValue > 0 ? `1通あたりで相手より${roundTo1(emojiGapValue)}個多い` : "絵文字量は相手以下",
    },
    topicInitRate: {
      value: topicInitRateValue,
      weight: roundTo1(parseNumber(getParam(searchParams, "tiw"), Math.max(0, topicInitRateValue - 0.5) * 2.5)),
      detail: `新しい話題の${Math.round(topicInitRateValue * 100)}%を自分が出してる`,
    },
    lengthVariance: {
      value: lengthVarianceValue,
      weight: roundTo1(parseNumber(getParam(searchParams, "lvw"), Math.max(0, lengthVarianceValue - 30) * 0.015)),
      detail: lengthVarianceValue > 30 ? `1通の長さが平均${Math.round(lengthVarianceValue)}文字ぶれる` : "1通の長さが安定してる",
    },
  };
}

export function serializeWeightResultParams(payload: WeightSharePayload) {
  const params = new URLSearchParams({
    s: payload.situation,
    w: payload.totalWeight.toFixed(1),
    pw: payload.partnerWeight.toFixed(1),
    mc: String(payload.messageCount),
    mm: String(payload.myMessageCount),
    tm: String(payload.theirMessageCount),
    im: payload.inputMode,
    cf: payload.confidence,
    ic: String(payload.imageCount),
    trv: payload.breakdown.textRatio.value.toFixed(2),
    trw: payload.breakdown.textRatio.weight.toFixed(1),
    qdv: payload.breakdown.questionDensity.value.toFixed(2),
    qdw: payload.breakdown.questionDensity.weight.toFixed(1),
    egv: payload.breakdown.emojiGap.value.toFixed(2),
    egw: payload.breakdown.emojiGap.weight.toFixed(1),
    tiv: payload.breakdown.topicInitRate.value.toFixed(2),
    tiw: payload.breakdown.topicInitRate.weight.toFixed(1),
    lvv: payload.breakdown.lengthVariance.value.toFixed(1),
    lvw: payload.breakdown.lengthVariance.weight.toFixed(1),
  });

  const analysisComment = truncateComment(payload.analysisComment);
  if (analysisComment) {
    params.set("ac", analysisComment);
  }

  return params.toString();
}

export function getWeightResultPath(payload: WeightSharePayload) {
  return `/weight/result?${serializeWeightResultParams(payload)}`;
}

export function getWeightResultUrl(payload: WeightSharePayload) {
  return `${resolveOrigin()}${getWeightResultPath(payload)}`;
}

export function getWeightOgImageUrl(payload: WeightSharePayload) {
  const topFactor = getTopFactor(payload.breakdown);
  const params = new URLSearchParams({
    w: payload.totalWeight.toFixed(1),
    pw: payload.partnerWeight.toFixed(1),
    s: payload.situation,
    j: getJudgment(payload.totalWeight, payload.situation),
    im: payload.inputMode,
    tf: topFactor.name,
    fw: topFactor.weight.toFixed(1),
  });

  return `/api/og-weight?${params.toString()}`;
}

export function getWeightResultFromSearchParams(searchParams: SearchParamsInput) {
  const situation = parseSituation(getParam(searchParams, "s"));
  const totalWeight = roundTo1(parseNumber(getParam(searchParams, "w"), 2.4));
  const partnerWeight = roundTo1(parseNumber(getParam(searchParams, "pw"), 1.5));
  const breakdown = buildBreakdownFromValues(searchParams);
  const topFactor = getTopFactor(breakdown);
  const judgment = getJudgment(totalWeight, situation);
  const messageCount = Math.max(0, Math.floor(parseNumber(getParam(searchParams, "mc"), 0)));
  const inputMode = parseInputMode(getParam(searchParams, "im"));
  const confidence = parseConfidence(getParam(searchParams, "cf"));
  const imageCount = Math.max(0, Math.floor(parseNumber(getParam(searchParams, "ic"), inputMode === "images" ? 1 : 0)));
  const myMessageCount = Math.max(0, Math.floor(parseNumber(getParam(searchParams, "mm"), Math.ceil(messageCount / 2))));
  const theirMessageCount = Math.max(0, Math.floor(parseNumber(getParam(searchParams, "tm"), Math.floor(messageCount / 2))));
  const analysisComment = truncateComment(getParam(searchParams, "ac"));
  const sourceMeta: WeightSourceMeta = {
    inputMode,
    confidence,
    imageCount,
    myMessageCount,
    theirMessageCount,
  };

  const result: WeightResult = {
    totalWeight,
    partnerWeight,
    weightDiff: roundTo1(totalWeight - partnerWeight),
    judgment,
    breakdown,
    topFactor,
    situationComparisons: getSituationComparison(totalWeight, situation),
  };

  return {
    situation,
    messageCount,
    analysisComment,
    sourceMeta,
    result: {
      ...result,
      situationComparisons: getSituationComparison(totalWeight, situation),
    },
    comment: getComment(situation, totalWeight, partnerWeight, topFactor),
  };
}

export function getWeightResultTitle(situation: Situation, result: Pick<WeightResult, "totalWeight">) {
  return `${getSituationOption(situation).shortLabel}のLINE重量は${result.totalWeight.toFixed(1)}kg`;
}

export function getWeightResultDescription(situation: Situation, result: Pick<WeightResult, "totalWeight" | "partnerWeight" | "weightDiff">) {
  const option = getSituationOption(situation);
  const sign = result.weightDiff > 0 ? "+" : "";
  return `${option.label}とのやりとりで、自分のLINE重量は${result.totalWeight.toFixed(1)}kg。相手は${result.partnerWeight.toFixed(1)}kg、重量差は${sign}${result.weightDiff.toFixed(1)}kg。`;
}

export function getWeightXShareUrl(payload: WeightSharePayload) {
  const option = getSituationOption(payload.situation);
  const topFactor = getTopFactor(payload.breakdown);
  const weightDiff = roundTo1(payload.totalWeight - payload.partnerWeight);
  const diffLabel = weightDiff > 0 ? `+${weightDiff}` : `${weightDiff}`;
  const firstLine = payload.inputMode === "images"
    ? `LINEのスクショを貼ったら、メッセージ重量 ${payload.totalWeight.toFixed(1)}kg でした`
    : `私のLINEメッセージ重量は ${payload.totalWeight.toFixed(1)}kg でした`;
  const text = `${firstLine}

相手との関係: ${option.emoji} ${option.label}
相手: ${payload.partnerWeight.toFixed(1)}kg / 重量差: ${diffLabel}kg

一番の原因は「${topFactor.name}」（+${topFactor.weight.toFixed(1)}kg）

あなたのLINE、何kg？→`;

  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    text
  )}&url=${encodeURIComponent(getWeightResultUrl(payload))}&hashtags=${encodeURIComponent(X_HASHTAG)}&via=${encodeURIComponent(X_VIA)}`;
}

export function getWeightLineShareUrl(payload: WeightSharePayload) {
  const option = getSituationOption(payload.situation);
  const topFactor = getTopFactor(payload.breakdown);
  const weightDiff = roundTo1(payload.totalWeight - payload.partnerWeight);
  const diffLabel = weightDiff > 0 ? `+${weightDiff}` : `${weightDiff}`;
  const prefix = payload.inputMode === "images" ? "LINEのスクショを貼ったら" : "LINEメッセージ重量の結果は";
  const text = `${prefix} ${payload.totalWeight.toFixed(1)}kg。相手との関係は${option.label}、相手は${payload.partnerWeight.toFixed(
    1
  )}kg、重量差は${diffLabel}kg。一番の原因は${topFactor.name}（+${topFactor.weight.toFixed(1)}kg）。`;

  return `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(
    getWeightResultUrl(payload)
  )}&text=${encodeURIComponent(text)}`;
}
