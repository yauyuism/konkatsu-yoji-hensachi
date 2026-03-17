import { kv } from "@vercel/kv";

import type { ConditionGender } from "@/data/conditions";
import type { SpecCategory } from "@/data/spec-options";
import type { CustomSpecInput, My9SpecsReliability } from "@/lib/my9specs";
import { getMy9SpecsEstimate, getSelectedSpecs, serializeMy9SpecsSearchParams } from "@/lib/my9specs";

export type My9SpecsStatsRequest = {
  targetGender: ConditionGender;
  presetIds: string[];
  customInputs?: CustomSpecInput[];
};

export type My9SpecsRarityBand =
  | "under_10"
  | "under_100"
  | "under_1000"
  | "under_10000"
  | "under_100000"
  | "over_100000";

export interface My9SpecsStatRecord {
  id: string;
  createdAt: string;
  targetGender: ConditionGender;
  presetIds: string[];
  customInputs: Array<{
    category: SpecCategory;
    text: string;
  }>;
  presetCount: number;
  customCount: number;
  selectedCount: number;
  noneSelectionCount: number;
  estimatedCount: number;
  hardCount: number;
  percentageWithinGender: number;
  reliability: My9SpecsReliability;
  rarityBand: My9SpecsRarityBand;
  topImpactId: string | null;
  topImpactLabel: string | null;
  topImpactCategory: SpecCategory | null;
  topImpactKind: "preset" | "custom" | null;
  selectionKey: string;
}

function isKvConfigured() {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

function getRecordRetention() {
  const raw = Number(process.env.MY9SPECS_STATS_RECORD_RETENTION ?? process.env.STATS_RECORD_RETENTION ?? "3000");
  if (!Number.isFinite(raw) || raw <= 0) {
    return 0;
  }

  return Math.floor(raw);
}

function createRecordId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `my9specs-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function round(value: number, digits: number) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function getRarityBand(count: number): My9SpecsRarityBand {
  if (count <= 10) {
    return "under_10";
  }
  if (count <= 100) {
    return "under_100";
  }
  if (count <= 1_000) {
    return "under_1000";
  }
  if (count <= 10_000) {
    return "under_10000";
  }
  if (count <= 100_000) {
    return "under_100000";
  }

  return "over_100000";
}

async function incrementFloat(key: string, value: number) {
  await kv.incrbyfloat(key, value);
}

export async function saveMy9SpecsStats(input: My9SpecsStatsRequest) {
  if (!isKvConfigured()) {
    return;
  }

  try {
    const customInputs = input.customInputs ?? [];
    const selected = getSelectedSpecs(input.presetIds, customInputs);
    if (selected.length !== 9) {
      return;
    }

    const estimate = getMy9SpecsEstimate(selected, input.targetGender);
    const topImpact = estimate.topImpact?.option ?? null;
    const topImpactKind = topImpact ? ("isCustom" in topImpact && topImpact.isCustom ? "custom" : "preset") : null;
    const topImpactId = topImpactKind === "preset" ? topImpact?.id ?? null : null;
    const topImpactCategory = topImpact?.category ?? null;

    const record: My9SpecsStatRecord = {
      id: createRecordId(),
      createdAt: new Date().toISOString(),
      targetGender: input.targetGender,
      presetIds: [...input.presetIds],
      customInputs: customInputs.map((item) => ({
        category: item.category,
        text: item.text,
      })),
      presetCount: input.presetIds.length,
      customCount: customInputs.length,
      selectedCount: selected.length,
      noneSelectionCount: estimate.noneSelectionCount,
      estimatedCount: estimate.count,
      hardCount: estimate.hardCount,
      percentageWithinGender: round(estimate.percentageWithinGender, 4),
      reliability: estimate.reliability,
      rarityBand: getRarityBand(estimate.count),
      topImpactId,
      topImpactLabel: topImpact?.label ?? null,
      topImpactCategory,
      topImpactKind,
      selectionKey: serializeMy9SpecsSearchParams(input.targetGender, input.presetIds, customInputs),
    };

    await kv.incr("my9specs_stats:totalCount");
    await incrementFloat("my9specs_stats:estimatedCountSum", record.estimatedCount);
    await incrementFloat("my9specs_stats:hardCountSum", record.hardCount);
    await incrementFloat("my9specs_stats:percentageSum", record.percentageWithinGender);
    await kv.incr(`my9specs_stats:gender:${record.targetGender}`);
    await kv.incr(`my9specs_stats:reliability:${record.reliability}`);
    await kv.incr(`my9specs_stats:rarity:${record.rarityBand}`);
    await kv.incr(`my9specs_stats:noneSelectionCount:${record.noneSelectionCount}`);
    await kv.incr(`my9specs_stats:customCount:${record.customCount}`);

    for (const presetId of record.presetIds) {
      await kv.incr(`my9specs_stats:spec:${presetId}`);
      await kv.incr(`my9specs_stats:gender:${record.targetGender}:spec:${presetId}`);
    }

    for (const customInput of record.customInputs) {
      await kv.incr(`my9specs_stats:customCategory:${customInput.category}`);
      await kv.incr(`my9specs_stats:gender:${record.targetGender}:customCategory:${customInput.category}`);
    }

    for (const option of selected) {
      await kv.incr(`my9specs_stats:categorySelection:${option.category}`);
      await kv.incr(`my9specs_stats:gender:${record.targetGender}:categorySelection:${option.category}`);
    }

    if (record.topImpactId) {
      await kv.incr(`my9specs_stats:topImpactSpec:${record.topImpactId}`);
    } else if (record.topImpactKind === "custom" && record.topImpactCategory) {
      await kv.incr(`my9specs_stats:topImpactCustomCategory:${record.topImpactCategory}`);
    }

    const retention = getRecordRetention();
    if (retention > 0) {
      await kv.lpush("my9specs_stats:records", JSON.stringify(record));
      await kv.ltrim("my9specs_stats:records", 0, retention - 1);
    }

    await kv.set("my9specs_stats:lastUpdated", record.createdAt);
  } catch (error) {
    console.error("Failed to save my9specs stats", error);
  }
}
