import { kv } from "@vercel/kv";

import type { Situation, WeightFactorKey, WeightJudgment } from "@/data/weight";
import { getTopFactor } from "@/lib/weight-calculator";
import type { WeightAnalysisConfidence, WeightBreakdown, WeightGender, WeightInputMode } from "@/lib/weight-types";

export interface WeightStatsRequest {
  gender: WeightGender;
  situation: Situation;
  inputMode: WeightInputMode;
  confidence: WeightAnalysisConfidence;
  imageCount: number;
  totalWeight: number;
  partnerWeight: number;
  weightDiff: number;
  judgment: WeightJudgment;
  breakdown: WeightBreakdown;
  messageCount: number;
}

export interface WeightStatRecord extends WeightStatsRequest {
  id: string;
  createdAt: string;
  topFactor: WeightFactorKey;
  textRatioValue: number;
  textRatioWeight: number;
  questionDensityValue: number;
  questionDensityWeight: number;
  emojiGapValue: number;
  emojiGapWeight: number;
  topicInitRateValue: number;
  topicInitRateWeight: number;
  lengthVarianceValue: number;
  lengthVarianceWeight: number;
}

function isKvConfigured() {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

function getRecordRetention() {
  const raw = Number(process.env.WEIGHT_STATS_RECORD_RETENTION ?? process.env.STATS_RECORD_RETENTION ?? "3000");
  if (!Number.isFinite(raw) || raw <= 0) {
    return 0;
  }

  return Math.floor(raw);
}

function createRecordId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `weight-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function round(value: number, digits: number) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

async function incrementFloat(key: string, value: number) {
  await kv.incrbyfloat(key, value);
}

export async function saveWeightStats(input: WeightStatsRequest) {
  if (!isKvConfigured()) {
    return;
  }

  try {
    const topFactor = getTopFactor(input.breakdown);
    const record: WeightStatRecord = {
      ...input,
      id: createRecordId(),
      createdAt: new Date().toISOString(),
      totalWeight: round(input.totalWeight, 1),
      partnerWeight: round(input.partnerWeight, 1),
      weightDiff: round(input.weightDiff, 1),
      messageCount: Math.max(0, Math.floor(input.messageCount)),
      topFactor: topFactor.key,
      textRatioValue: round(input.breakdown.textRatio.value, 2),
      textRatioWeight: round(input.breakdown.textRatio.weight, 1),
      questionDensityValue: round(input.breakdown.questionDensity.value, 2),
      questionDensityWeight: round(input.breakdown.questionDensity.weight, 1),
      emojiGapValue: round(input.breakdown.emojiGap.value, 2),
      emojiGapWeight: round(input.breakdown.emojiGap.weight, 1),
      topicInitRateValue: round(input.breakdown.topicInitRate.value, 2),
      topicInitRateWeight: round(input.breakdown.topicInitRate.weight, 1),
      lengthVarianceValue: round(input.breakdown.lengthVariance.value, 1),
      lengthVarianceWeight: round(input.breakdown.lengthVariance.weight, 1),
    };

    await kv.incr("weight_stats:totalCount");
    await incrementFloat("weight_stats:totalWeightSum", record.totalWeight);
    await incrementFloat("weight_stats:partnerWeightSum", record.partnerWeight);
    await incrementFloat("weight_stats:weightDiffSum", record.weightDiff);
    await incrementFloat("weight_stats:messageCountSum", record.messageCount);
    await kv.incr(`weight_stats:gender:${record.gender}`);
    await kv.incr(`weight_stats:situation:${record.situation}`);
    await kv.incr(`weight_stats:inputMode:${record.inputMode}`);
    await kv.incr(`weight_stats:confidence:${record.confidence}`);
    await kv.incr(`weight_stats:judgment:${record.judgment}`);
    await kv.incr(`weight_stats:topFactor:${record.topFactor}`);

    const retention = getRecordRetention();
    if (retention > 0) {
      await kv.lpush("weight_stats:records", JSON.stringify(record));
      await kv.ltrim("weight_stats:records", 0, retention - 1);
    }

    await kv.set("weight_stats:lastUpdated", record.createdAt);
  } catch (error) {
    console.error("Failed to save weight stats", error);
  }
}
