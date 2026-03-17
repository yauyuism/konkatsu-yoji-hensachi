import { kv } from "@vercel/kv";

import { axisPriority, type AxisKey } from "@/data/questions";
import { rarityLabels, results, resultTypes, type ResultType } from "@/data/results";
import { diagnoseAnswers, getDominantAxisLabel, rankAxes } from "@/lib/diagnosis";

export interface YojiStatsRequest {
  answerIndexes: number[];
}

export interface YojiStatRecord {
  id: string;
  createdAt: string;
  answerSignature: string;
  type: ResultType;
  yoji: string;
  rarity: keyof typeof rarityLabels;
  dominantAxis: AxisKey;
  secondaryAxis: AxisKey;
  scores: Record<AxisKey, number>;
}

export interface YojiStatsSnapshot {
  totalCount: number;
  avgScores: Array<{
    axis: AxisKey;
    label: string;
    avg: number;
  }>;
  typeRanking: Array<{
    type: ResultType;
    yoji: string;
    count: number;
  }>;
  raritySplit: Array<{
    rarity: keyof typeof rarityLabels;
    label: string;
    count: number;
  }>;
  dominantAxisRanking: Array<{
    axis: AxisKey;
    label: string;
    count: number;
  }>;
  secondaryAxisRanking: Array<{
    axis: AxisKey;
    label: string;
    count: number;
  }>;
  lastUpdated: string | null;
}

function isKvConfigured() {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

function getRecordRetention() {
  const raw = Number(process.env.YOJI_STATS_RECORD_RETENTION ?? process.env.STATS_RECORD_RETENTION ?? "3000");
  if (!Number.isFinite(raw) || raw <= 0) {
    return 0;
  }

  return Math.floor(raw);
}

function createRecordId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `yoji-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function round(value: number, digits: number) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function toNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

async function getNumber(key: string) {
  const value = await kv.get(key);
  return toNumber(value);
}

async function incrementFloat(key: string, value: number) {
  await kv.incrbyfloat(key, value);
}

function serializeAnswerSignature(answerIndexes: number[]) {
  return answerIndexes.join("");
}

export async function saveYojiStats(input: YojiStatsRequest) {
  if (!isKvConfigured()) {
    return;
  }

  try {
    const diagnosis = diagnoseAnswers(input.answerIndexes);
    const rankedAxes = rankAxes(diagnosis.scores);
    const dominantAxis = rankedAxes[0];
    const secondaryAxis = rankedAxes[1] ?? rankedAxes[0];
    const record: YojiStatRecord = {
      id: createRecordId(),
      createdAt: new Date().toISOString(),
      answerSignature: serializeAnswerSignature(input.answerIndexes),
      type: diagnosis.type,
      yoji: diagnosis.result.yoji,
      rarity: diagnosis.result.rarity,
      dominantAxis,
      secondaryAxis,
      scores: diagnosis.scores,
    };

    await kv.incr("yoji_stats:totalCount");
    await kv.incr(`yoji_stats:type:${record.type}`);
    await kv.incr(`yoji_stats:rarity:${record.rarity}`);
    await kv.incr(`yoji_stats:dominantAxis:${record.dominantAxis}`);
    await kv.incr(`yoji_stats:secondaryAxis:${record.secondaryAxis}`);

    for (const axis of axisPriority) {
      await incrementFloat(`yoji_stats:axis:${axis}:sum`, record.scores[axis]);
    }

    const retention = getRecordRetention();
    if (retention > 0) {
      await kv.lpush("yoji_stats:records", JSON.stringify(record));
      await kv.ltrim("yoji_stats:records", 0, retention - 1);
    }

    await kv.set("yoji_stats:lastUpdated", record.createdAt);
  } catch (error) {
    console.error("Failed to save yoji stats", error);
  }
}

export async function getYojiStatsSnapshot(): Promise<YojiStatsSnapshot> {
  if (!isKvConfigured()) {
    return {
      totalCount: 0,
      avgScores: axisPriority.map((axis) => ({
        axis,
        label: getDominantAxisLabel(axis),
        avg: 0,
      })),
      typeRanking: resultTypes.map((type) => ({
        type,
        yoji: results[type].yoji,
        count: 0,
      })),
      raritySplit: (Object.entries(rarityLabels) as Array<[keyof typeof rarityLabels, string]>).map(([rarity, label]) => ({
        rarity,
        label,
        count: 0,
      })),
      dominantAxisRanking: axisPriority.map((axis) => ({
        axis,
        label: getDominantAxisLabel(axis),
        count: 0,
      })),
      secondaryAxisRanking: axisPriority.map((axis) => ({
        axis,
        label: getDominantAxisLabel(axis),
        count: 0,
      })),
      lastUpdated: null,
    };
  }

  const [totalCount, lastUpdatedRaw] = await Promise.all([
    getNumber("yoji_stats:totalCount"),
    kv.get<string>("yoji_stats:lastUpdated"),
  ]);

  const avgScores = await Promise.all(
    axisPriority.map(async (axis) => {
      const sum = await getNumber(`yoji_stats:axis:${axis}:sum`);
      return {
        axis,
        label: getDominantAxisLabel(axis),
        avg: totalCount > 0 ? round(sum / totalCount, 1) : 0,
      };
    })
  );

  const typeRanking = await Promise.all(
    resultTypes.map(async (type) => ({
      type,
      yoji: results[type].yoji,
      count: await getNumber(`yoji_stats:type:${type}`),
    }))
  );
  typeRanking.sort((left, right) => right.count - left.count);

  const raritySplit = await Promise.all(
    (Object.entries(rarityLabels) as Array<[keyof typeof rarityLabels, string]>).map(async ([rarity, label]) => ({
      rarity,
      label,
      count: await getNumber(`yoji_stats:rarity:${rarity}`),
    }))
  );

  const dominantAxisRanking = await Promise.all(
    axisPriority.map(async (axis) => ({
      axis,
      label: getDominantAxisLabel(axis),
      count: await getNumber(`yoji_stats:dominantAxis:${axis}`),
    }))
  );
  dominantAxisRanking.sort((left, right) => right.count - left.count);

  const secondaryAxisRanking = await Promise.all(
    axisPriority.map(async (axis) => ({
      axis,
      label: getDominantAxisLabel(axis),
      count: await getNumber(`yoji_stats:secondaryAxis:${axis}`),
    }))
  );
  secondaryAxisRanking.sort((left, right) => right.count - left.count);

  return {
    totalCount,
    avgScores,
    typeRanking,
    raritySplit,
    dominantAxisRanking,
    secondaryAxisRanking,
    lastUpdated: typeof lastUpdatedRaw === "string" ? lastUpdatedRaw : null,
  };
}
