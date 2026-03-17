import { WEIGHT_FACTOR_LABELS, type Situation, type WeightFactorKey } from "@/data/weight";
import { getSituationComparison } from "@/lib/situation-comparison";
import { getJudgment } from "@/lib/weight-judgment";
import { getOverlapRatio, roundTo1, roundTo2, standardDeviation } from "@/lib/text-analysis";
import type { AnalyzedMessage, WeightBreakdown, WeightResult, WeightTopFactor } from "@/lib/weight-types";

export const BASE_WEIGHT = 1;

function calculateTopicInitRate(primaryMessages: AnalyzedMessage[], secondaryMessages: AnalyzedMessage[], targetIsMine: boolean) {
  const allMessages = [...primaryMessages, ...secondaryMessages].sort((left, right) => left.index - right.index);

  let totalNewTopics = 0;
  let primaryNewTopics = 0;

  for (let index = 1; index < allMessages.length; index += 1) {
    const previous = allMessages[index - 1];
    const current = allMessages[index];
    const isNewTopic = getOverlapRatio(previous.text, current.text) < 0.15;

    if (!isNewTopic) {
      continue;
    }

    totalNewTopics += 1;
    if (current.isMine === targetIsMine) {
      primaryNewTopics += 1;
    }
  }

  return totalNewTopics > 0 ? primaryNewTopics / totalNewTopics : 0.5;
}

function buildTextRatioDetail(value: number, secondaryTotalChars: number) {
  if (secondaryTotalChars <= 0) {
    return "比較対象が少ないため補正なし";
  }

  if (value >= 1) {
    return `相手の${value.toFixed(1)}倍書いてる`;
  }

  return `相手の${value.toFixed(1)}倍の文量`;
}

function buildBreakdown(primaryMessages: AnalyzedMessage[], secondaryMessages: AnalyzedMessage[], targetIsMine: boolean): WeightBreakdown {
  const primaryTotalChars = primaryMessages.reduce((sum, message) => sum + message.charCount, 0);
  const secondaryTotalChars = secondaryMessages.reduce((sum, message) => sum + message.charCount, 0);
  const textRatioValue = secondaryTotalChars > 0 ? primaryTotalChars / secondaryTotalChars : 1;
  const textRatioWeight = Math.max(0, textRatioValue - 1) * 1.2;

  const questionCount = primaryMessages.filter((message) => message.hasQuestion).length;
  const questionDensityValue = primaryMessages.length > 0 ? questionCount / primaryMessages.length : 0;
  const questionDensityWeight = Math.max(0, questionDensityValue - 0.25) * 3;

  const primaryEmojiRate = primaryMessages.reduce((sum, message) => sum + message.emojiCount, 0) / Math.max(1, primaryMessages.length);
  const secondaryEmojiRate = secondaryMessages.reduce((sum, message) => sum + message.emojiCount, 0) / Math.max(1, secondaryMessages.length);
  const emojiGapValue = primaryEmojiRate - secondaryEmojiRate;
  const emojiGapWeight = Math.max(0, emojiGapValue) * 0.8;

  const topicInitRateValue = calculateTopicInitRate(primaryMessages, secondaryMessages, targetIsMine);
  const topicInitRateWeight = Math.max(0, topicInitRateValue - 0.5) * 2.5;

  const lengths = primaryMessages.map((message) => message.charCount);
  const lengthVarianceValue = standardDeviation(lengths);
  const lengthVarianceWeight = Math.max(0, lengthVarianceValue - 30) * 0.015;

  return {
    baseWeight: {
      value: BASE_WEIGHT,
      weight: BASE_WEIGHT,
      detail: "全員共通の基礎重量",
    },
    textRatio: {
      value: roundTo2(textRatioValue),
      weight: roundTo1(textRatioWeight),
      detail: buildTextRatioDetail(textRatioValue, secondaryTotalChars),
    },
    questionDensity: {
      value: roundTo2(questionDensityValue),
      weight: roundTo1(questionDensityWeight),
      detail: `${primaryMessages.length}通中${questionCount}通に質問あり`,
    },
    emojiGap: {
      value: roundTo2(emojiGapValue),
      weight: roundTo1(emojiGapWeight),
      detail: emojiGapValue > 0
        ? `1通あたりで相手より${roundTo1(emojiGapValue)}個多い`
        : "絵文字量は相手以下",
    },
    topicInitRate: {
      value: roundTo2(topicInitRateValue),
      weight: roundTo1(topicInitRateWeight),
      detail: `新しい話題の${Math.round(topicInitRateValue * 100)}%を自分が出してる`,
    },
    lengthVariance: {
      value: roundTo1(lengthVarianceValue),
      weight: roundTo1(lengthVarianceWeight),
      detail: lengthVarianceValue > 30
        ? `1通の長さが平均${Math.round(lengthVarianceValue)}文字ぶれる`
        : "1通の長さが安定してる",
    },
  };
}

function sumBreakdown(breakdown: WeightBreakdown) {
  return roundTo1(
    breakdown.baseWeight.weight +
      breakdown.textRatio.weight +
      breakdown.questionDensity.weight +
      breakdown.emojiGap.weight +
      breakdown.topicInitRate.weight +
      breakdown.lengthVariance.weight
  );
}

export function getTopFactor(breakdown: WeightBreakdown): WeightTopFactor {
  const [topFactor] = getSortedFactors(breakdown);

  return topFactor;
}

export function getSortedFactors(breakdown: WeightBreakdown): WeightTopFactor[] {
  return (Object.keys(WEIGHT_FACTOR_LABELS) as WeightFactorKey[]).map((key) => ({
    key,
    name: WEIGHT_FACTOR_LABELS[key],
    weight: breakdown[key].weight,
    detail: breakdown[key].detail,
  })).sort((left, right) => right.weight - left.weight);
}

export function calculateWeight(myMessages: AnalyzedMessage[], theirMessages: AnalyzedMessage[], situation: Situation): WeightResult {
  const myBreakdown = buildBreakdown(myMessages, theirMessages, true);
  const partnerBreakdown = buildBreakdown(theirMessages, myMessages, false);
  const totalWeight = sumBreakdown(myBreakdown);
  const partnerWeight = sumBreakdown(partnerBreakdown);
  const topFactor = getTopFactor(myBreakdown);

  return {
    totalWeight,
    partnerWeight,
    weightDiff: roundTo1(totalWeight - partnerWeight),
    judgment: getJudgment(totalWeight, situation),
    breakdown: myBreakdown,
    topFactor,
    situationComparisons: getSituationComparison(totalWeight, situation),
  };
}
