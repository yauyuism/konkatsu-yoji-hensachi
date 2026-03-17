import { kv } from "@vercel/kv";

import { hensachiBands } from "@/data/hensachi-results";
import { hensachiAxisLabels, hensachiAxisOrder, type HensachiAxisKey } from "@/data/hensachi-questions";
import { diagnoseHensachiAnswers } from "@/lib/hensachi";

export interface HensachiStatsRequest {
  answerIndexes: number[];
}

export interface HensachiStatRecord {
  id: string;
  createdAt: string;
  answerSignature: string;
  totalHensachi: number;
  topPercent: number;
  title: string;
  nickname: string;
  strongestAxis: HensachiAxisKey;
  weakestAxis: HensachiAxisKey;
  axes: Record<HensachiAxisKey, number>;
  rawScores: Record<HensachiAxisKey, number>;
}

export interface HensachiStatsSnapshot {
  totalCount: number;
  avgHensachi: number;
  avgTopPercent: number;
  axisAverages: Array<{
    axis: HensachiAxisKey;
    label: string;
    avg: number;
  }>;
  distribution: Array<{
    title: string;
    min: number;
    max: number;
    count: number;
    percentage: number;
  }>;
  strongestAxisRanking: Array<{
    axis: HensachiAxisKey;
    label: string;
    count: number;
  }>;
  weakestAxisRanking: Array<{
    axis: HensachiAxisKey;
    label: string;
    count: number;
  }>;
  lastUpdated: string | null;
}

function isKvConfigured() {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

function getRecordRetention() {
  const raw = Number(process.env.HENSACHI_STATS_RECORD_RETENTION ?? process.env.STATS_RECORD_RETENTION ?? "3000");
  if (!Number.isFinite(raw) || raw <= 0) {
    return 0;
  }

  return Math.floor(raw);
}

function createRecordId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `hensachi-${Date.now()}-${Math.random().toString(16).slice(2)}`;
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

function getStrongestAxis(axes: Record<HensachiAxisKey, number>) {
  return [...hensachiAxisOrder].sort((left, right) => axes[right] - axes[left] || hensachiAxisOrder.indexOf(left) - hensachiAxisOrder.indexOf(right))[0];
}

function getWeakestAxis(axes: Record<HensachiAxisKey, number>) {
  return [...hensachiAxisOrder].sort((left, right) => axes[left] - axes[right] || hensachiAxisOrder.indexOf(left) - hensachiAxisOrder.indexOf(right))[0];
}

export async function saveHensachiStats(input: HensachiStatsRequest) {
  if (!isKvConfigured()) {
    return;
  }

  try {
    const diagnosis = diagnoseHensachiAnswers(input.answerIndexes);
    const strongestAxis = getStrongestAxis(diagnosis.axes);
    const weakestAxis = getWeakestAxis(diagnosis.axes);
    const record: HensachiStatRecord = {
      id: createRecordId(),
      createdAt: new Date().toISOString(),
      answerSignature: diagnosis.answerSignature ?? input.answerIndexes.join(""),
      totalHensachi: diagnosis.totalHensachi,
      topPercent: round(diagnosis.topPercent, 1),
      title: diagnosis.title,
      nickname: diagnosis.nickname,
      strongestAxis,
      weakestAxis,
      axes: diagnosis.axes,
      rawScores: diagnosis.rawScores,
    };

    await kv.incr("hensachi_stats:totalCount");
    await incrementFloat("hensachi_stats:totalHensachiSum", record.totalHensachi);
    await incrementFloat("hensachi_stats:topPercentSum", record.topPercent);
    await kv.incr(`hensachi_stats:title:${record.title}`);
    await kv.incr(`hensachi_stats:strongestAxis:${record.strongestAxis}`);
    await kv.incr(`hensachi_stats:weakestAxis:${record.weakestAxis}`);

    for (const axis of hensachiAxisOrder) {
      await incrementFloat(`hensachi_stats:axis:${axis}:sum`, record.axes[axis]);
    }

    const retention = getRecordRetention();
    if (retention > 0) {
      await kv.lpush("hensachi_stats:records", JSON.stringify(record));
      await kv.ltrim("hensachi_stats:records", 0, retention - 1);
    }

    await kv.set("hensachi_stats:lastUpdated", record.createdAt);
  } catch (error) {
    console.error("Failed to save hensachi stats", error);
  }
}

export async function getHensachiStatsSnapshot(): Promise<HensachiStatsSnapshot> {
  if (!isKvConfigured()) {
    return {
      totalCount: 0,
      avgHensachi: 0,
      avgTopPercent: 0,
      axisAverages: hensachiAxisOrder.map((axis) => ({
        axis,
        label: hensachiAxisLabels[axis],
        avg: 0,
      })),
      distribution: hensachiBands.map((band) => ({
        title: band.title,
        min: band.min,
        max: band.max,
        count: 0,
        percentage: 0,
      })),
      strongestAxisRanking: hensachiAxisOrder.map((axis) => ({
        axis,
        label: hensachiAxisLabels[axis],
        count: 0,
      })),
      weakestAxisRanking: hensachiAxisOrder.map((axis) => ({
        axis,
        label: hensachiAxisLabels[axis],
        count: 0,
      })),
      lastUpdated: null,
    };
  }

  const [totalCount, totalHensachiSum, topPercentSum, lastUpdatedRaw] = await Promise.all([
    getNumber("hensachi_stats:totalCount"),
    getNumber("hensachi_stats:totalHensachiSum"),
    getNumber("hensachi_stats:topPercentSum"),
    kv.get<string>("hensachi_stats:lastUpdated"),
  ]);

  const axisAverages = await Promise.all(
    hensachiAxisOrder.map(async (axis) => {
      const sum = await getNumber(`hensachi_stats:axis:${axis}:sum`);
      return {
        axis,
        label: hensachiAxisLabels[axis],
        avg: totalCount > 0 ? round(sum / totalCount, 1) : 0,
      };
    })
  );

  const strongestAxisRanking = await Promise.all(
    hensachiAxisOrder.map(async (axis) => ({
      axis,
      label: hensachiAxisLabels[axis],
      count: await getNumber(`hensachi_stats:strongestAxis:${axis}`),
    }))
  );
  strongestAxisRanking.sort((left, right) => right.count - left.count);

  const weakestAxisRanking = await Promise.all(
    hensachiAxisOrder.map(async (axis) => ({
      axis,
      label: hensachiAxisLabels[axis],
      count: await getNumber(`hensachi_stats:weakestAxis:${axis}`),
    }))
  );
  weakestAxisRanking.sort((left, right) => right.count - left.count);

  const distributionCounts = await Promise.all(
    hensachiBands.map(async (band) => ({
      ...band,
      count: await getNumber(`hensachi_stats:title:${band.title}`),
    }))
  );

  return {
    totalCount,
    avgHensachi: totalCount > 0 ? round(totalHensachiSum / totalCount, 1) : 0,
    avgTopPercent: totalCount > 0 ? round(topPercentSum / totalCount, 1) : 0,
    axisAverages,
    distribution: distributionCounts.map((item) => ({
      title: item.title,
      min: item.min,
      max: item.max,
      count: item.count,
      percentage: totalCount > 0 ? round((item.count / totalCount) * 100, 1) : 0,
    })),
    strongestAxisRanking,
    weakestAxisRanking,
    lastUpdated: typeof lastUpdatedRaw === "string" ? lastUpdatedRaw : null,
  };
}
