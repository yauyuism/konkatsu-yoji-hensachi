import { kv } from "@vercel/kv";

import type { InputMethod, ReadFilterResult, SupportedApp } from "@/lib/convert-filter";
import { getCalculationSummary, serializeConditionsParams, type Conditions } from "@/lib/conditions";

export type ConditionsStatsRequest = {
  conditions: Conditions;
  inputMethod: InputMethod;
  screenshotApp?: SupportedApp | null;
  screenshotConfidence?: ReadFilterResult["confidence"] | null;
};

export type ConditionsRarityBand =
  | "under_0_05"
  | "under_0_1"
  | "under_0_5"
  | "under_1"
  | "under_3"
  | "over_3";

export type ConditionsPrimaryImpact = "income" | "height" | "education" | "region" | "age" | "none";

export interface ConditionsStatRecord {
  id: string;
  createdAt: string;
  inputMethod: InputMethod;
  targetGender: Conditions["targetGender"];
  ageMin: number;
  ageMax: number;
  ageSpan: number;
  incomeMin: number;
  incomeMax: number;
  heightMin: number;
  heightMax: number;
  education: Conditions["education"];
  region: Conditions["region"];
  count: number;
  percentage: number;
  rarityBand: ConditionsRarityBand;
  primaryImpact: ConditionsPrimaryImpact;
  primaryImpactMultiplier: number | null;
  screenshotApp: SupportedApp | null;
  screenshotConfidence: ReadFilterResult["confidence"] | null;
  conditionsKey: string;
}

function isKvConfigured() {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

function getRecordRetention() {
  const raw = Number(process.env.CONDITIONS_STATS_RECORD_RETENTION ?? process.env.STATS_RECORD_RETENTION ?? "3000");
  if (!Number.isFinite(raw) || raw <= 0) {
    return 0;
  }

  return Math.floor(raw);
}

function createRecordId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `conditions-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function round(value: number, digits: number) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function getRarityBand(percentage: number): ConditionsRarityBand {
  if (percentage < 0.05) {
    return "under_0_05";
  }
  if (percentage < 0.1) {
    return "under_0_1";
  }
  if (percentage < 0.5) {
    return "under_0_5";
  }
  if (percentage < 1) {
    return "under_1";
  }
  if (percentage < 3) {
    return "under_3";
  }

  return "over_3";
}

function getPrimaryImpactKey(
  value: ReturnType<typeof getCalculationSummary>["impacts"][number] | undefined
): ConditionsPrimaryImpact {
  return value?.key ?? "none";
}

async function incrementFloat(key: string, value: number) {
  await kv.incrbyfloat(key, value);
}

export async function saveConditionsStats(input: ConditionsStatsRequest) {
  if (!isKvConfigured()) {
    return;
  }

  try {
    const summary = getCalculationSummary(input.conditions);
    const primaryImpact = summary.impacts[0];
    const record: ConditionsStatRecord = {
      id: createRecordId(),
      createdAt: new Date().toISOString(),
      inputMethod: input.inputMethod,
      targetGender: input.conditions.targetGender,
      ageMin: input.conditions.ageMin,
      ageMax: input.conditions.ageMax,
      ageSpan: input.conditions.ageMax - input.conditions.ageMin + 1,
      incomeMin: input.conditions.incomeMin,
      incomeMax: input.conditions.incomeMax,
      heightMin: input.conditions.heightMin,
      heightMax: input.conditions.heightMax,
      education: input.conditions.education,
      region: input.conditions.region,
      count: summary.count,
      percentage: round(summary.percentage, 4),
      rarityBand: getRarityBand(summary.percentage),
      primaryImpact: getPrimaryImpactKey(primaryImpact),
      primaryImpactMultiplier: primaryImpact?.multiplier === null || primaryImpact?.multiplier === undefined
        ? null
        : round(primaryImpact.multiplier, 3),
      screenshotApp: input.inputMethod === "screenshot" ? input.screenshotApp ?? null : null,
      screenshotConfidence: input.inputMethod === "screenshot" ? input.screenshotConfidence ?? null : null,
      conditionsKey: serializeConditionsParams(input.conditions),
    };

    await kv.incr("conditions_stats:totalCount");
    await incrementFloat("conditions_stats:countSum", record.count);
    await incrementFloat("conditions_stats:percentageSum", record.percentage);
    await kv.incr(`conditions_stats:inputMethod:${record.inputMethod}`);
    await kv.incr(`conditions_stats:gender:${record.targetGender}`);
    await kv.incr(`conditions_stats:education:${record.education}`);
    await kv.incr(`conditions_stats:region:${record.region}`);
    await kv.incr(`conditions_stats:income:${record.incomeMin}`);
    await kv.incr(`conditions_stats:incomeMax:${record.incomeMax}`);
    await kv.incr(`conditions_stats:heightMin:${record.heightMin}`);
    await kv.incr(`conditions_stats:heightMax:${record.heightMax}`);
    await kv.incr(`conditions_stats:rarity:${record.rarityBand}`);
    await kv.incr(`conditions_stats:primaryImpact:${record.primaryImpact}`);
    await kv.incr(`conditions_stats:ageSpan:${record.ageSpan}`);

    if (record.inputMethod === "screenshot" && record.screenshotApp) {
      await kv.incr(`conditions_stats:screenshotApp:${record.screenshotApp}`);
    }

    if (record.inputMethod === "screenshot" && record.screenshotConfidence) {
      await kv.incr(`conditions_stats:screenshotConfidence:${record.screenshotConfidence}`);
    }

    const retention = getRecordRetention();
    if (retention > 0) {
      await kv.lpush("conditions_stats:records", JSON.stringify(record));
      await kv.ltrim("conditions_stats:records", 0, retention - 1);
    }

    await kv.set("conditions_stats:lastUpdated", record.createdAt);
  } catch (error) {
    console.error("Failed to save conditions stats", error);
  }
}
