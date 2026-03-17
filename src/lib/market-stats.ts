import { kv } from "@vercel/kv";

import { analyzeMarketSpecs, serializeMarketParams, type MarketSpecKey, type MarketUserSpec } from "@/lib/market";

export type MarketStatsRequest = MarketUserSpec;

export type MarketRarityBand =
  | "under_0_1"
  | "under_0_5"
  | "under_1"
  | "under_3"
  | "under_10"
  | "over_10";

export type MarketStrongestSpec = MarketSpecKey | "none";

export interface MarketStatRecord extends MarketUserSpec {
  id: string;
  createdAt: string;
  incomeIncluded: boolean;
  heightIncluded: boolean;
  activeAxisCount: number;
  overallPercentile: number;
  incomeEquivalent: number;
  demandCount: number;
  demandShare: number;
  strongestSpec: MarketStrongestSpec;
  strongestPercentile: number | null;
  strongestIncomeEquivalent: number | null;
  rarityBand: MarketRarityBand;
  paramsKey: string;
}

function isKvConfigured() {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

function getRecordRetention() {
  const raw = Number(process.env.MARKET_STATS_RECORD_RETENTION ?? process.env.STATS_RECORD_RETENTION ?? "3000");
  if (!Number.isFinite(raw) || raw <= 0) {
    return 0;
  }

  return Math.floor(raw);
}

function createRecordId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `market-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function round(value: number, digits: number) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function getRarityBand(overallPercentile: number): MarketRarityBand {
  if (overallPercentile < 0.1) {
    return "under_0_1";
  }
  if (overallPercentile < 0.5) {
    return "under_0_5";
  }
  if (overallPercentile < 1) {
    return "under_1";
  }
  if (overallPercentile < 3) {
    return "under_3";
  }
  if (overallPercentile < 10) {
    return "under_10";
  }

  return "over_10";
}

function getStrongestSpec(
  specs: ReturnType<typeof analyzeMarketSpecs>["specs"]
): Pick<MarketStatRecord, "strongestSpec" | "strongestPercentile" | "strongestIncomeEquivalent"> {
  const strongest = specs
    .filter((item) => item.included)
    .sort((left, right) => left.percentile - right.percentile || right.incomeEquivalent - left.incomeEquivalent)[0];

  if (!strongest) {
    return {
      strongestSpec: "none",
      strongestPercentile: null,
      strongestIncomeEquivalent: null,
    };
  }

  return {
    strongestSpec: strongest.key,
    strongestPercentile: round(strongest.percentile, 2),
    strongestIncomeEquivalent: strongest.incomeEquivalent,
  };
}

async function incrementFloat(key: string, value: number) {
  await kv.incrbyfloat(key, value);
}

export async function saveMarketStats(input: MarketStatsRequest) {
  if (!isKvConfigured()) {
    return;
  }

  try {
    const analysis = analyzeMarketSpecs(input);
    const strongestSpec = getStrongestSpec(analysis.specs);
    const incomeIncluded = input.income > 0;
    const heightIncluded = input.height > 0;
    const activeAxisCount = analysis.specs.filter((item) => item.included).length;

    const record: MarketStatRecord = {
      ...input,
      id: createRecordId(),
      createdAt: new Date().toISOString(),
      incomeIncluded,
      heightIncluded,
      activeAxisCount,
      overallPercentile: round(analysis.overallPercentile, 4),
      incomeEquivalent: Math.round(analysis.incomeEquivalent),
      demandCount: Math.max(0, Math.round(analysis.demandCount)),
      demandShare: round(analysis.demandShare, 2),
      strongestSpec: strongestSpec.strongestSpec,
      strongestPercentile: strongestSpec.strongestPercentile,
      strongestIncomeEquivalent: strongestSpec.strongestIncomeEquivalent,
      rarityBand: getRarityBand(analysis.overallPercentile),
      paramsKey: serializeMarketParams(input),
    };

    await kv.incr("market_stats:totalCount");
    await incrementFloat("market_stats:overallPercentileSum", record.overallPercentile);
    await incrementFloat("market_stats:incomeEquivalentSum", record.incomeEquivalent);
    await incrementFloat("market_stats:demandCountSum", record.demandCount);
    await incrementFloat("market_stats:demandShareSum", record.demandShare);
    await kv.incr(`market_stats:gender:${record.gender}`);
    await kv.incr(`market_stats:education:${record.education}`);
    await kv.incr(`market_stats:region:${record.region}`);
    await kv.incr(`market_stats:age:${record.age}`);
    await kv.incr(`market_stats:income:${record.income}`);
    await kv.incr(`market_stats:height:${record.height}`);
    await kv.incr(`market_stats:incomeIncluded:${record.incomeIncluded ? "yes" : "no"}`);
    await kv.incr(`market_stats:heightIncluded:${record.heightIncluded ? "yes" : "no"}`);
    await kv.incr(`market_stats:activeAxisCount:${record.activeAxisCount}`);
    await kv.incr(`market_stats:rarity:${record.rarityBand}`);
    await kv.incr(`market_stats:strongestSpec:${record.strongestSpec}`);

    const retention = getRecordRetention();
    if (retention > 0) {
      await kv.lpush("market_stats:records", JSON.stringify(record));
      await kv.ltrim("market_stats:records", 0, retention - 1);
    }

    await kv.set("market_stats:lastUpdated", record.createdAt);
  } catch (error) {
    console.error("Failed to save market stats", error);
  }
}
