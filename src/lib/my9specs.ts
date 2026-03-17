import { AGE_MAX, AGE_MIN, type ConditionGender } from "@/data/conditions";
import {
  EXCLUSIVE_GROUPS,
  NONE_SPEC_IDS,
  SPEC_CATEGORY_ORDER,
  SPEC_OPTIONS_BY_ID,
  type SpecCategory,
  type SpecOption,
} from "@/data/spec-options";
import { calculate, getTotalPoolCount, type Conditions } from "@/lib/conditions";

export const MY9_SPECS_MAX_SELECTION = 9;
export const CUSTOM_SPEC_MAX_LENGTH = 20;

const CUSTOM_SPEC_ESTIMATED_RATE = 0.45;

export type CustomSpecInput = {
  id: string;
  text: string;
  category: SpecCategory;
};

export type CustomSpecOption = {
  id: string;
  category: SpecCategory;
  label: string;
  emoji: "✍️";
  filterType: "soft";
  estimatedFilterRate: number;
  isCustom: true;
};

export type SelectedSpecOption = SpecOption | CustomSpecOption;

export type My9SpecsSelectionState = {
  presetIds: string[];
  customInputs: CustomSpecInput[];
};

export type My9SpecsReliability = "high" | "medium" | "low";

export type My9SpecsImpact = {
  option: SelectedSpecOption;
  withoutCount: number;
  increase: number;
  reductionRate: number;
};

export type My9SpecsEstimate = {
  count: number;
  hardCount: number;
  softAdjusted: number;
  totalPoolCount: number;
  percentageWithinGender: number;
  reliability: My9SpecsReliability;
  reliabilityLabel: string;
  reliabilityNote: string;
  estimatedOptionCount: number;
  noneSelectionCount: number;
  noteWarning: string | null;
  impacts: My9SpecsImpact[];
  topImpact: My9SpecsImpact | null;
  leastImpact: My9SpecsImpact | null;
  comment: string;
  hardConditions: Conditions;
};

type SearchParamsRecord = Record<string, string | string[] | undefined>;

type SerializedCustomInput = {
  c?: unknown;
  t?: unknown;
};

function toRecordValue(value: string | string[] | undefined) {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value[0];
  }

  return undefined;
}

function buildConflictMap() {
  const map = new Map<string, Set<string>>();

  for (const ids of Object.values(EXCLUSIVE_GROUPS)) {
    for (const id of ids) {
      const conflicts = map.get(id) ?? new Set<string>();
      for (const other of ids) {
        if (other !== id) {
          conflicts.add(other);
        }
      }
      map.set(id, conflicts);
    }
  }

  return map;
}

const CONFLICTS_BY_ID = buildConflictMap();

function isSpecCategory(value: string): value is SpecCategory {
  return SPEC_CATEGORY_ORDER.includes(value as SpecCategory);
}

function normalizeCustomText(text: string) {
  return text.replace(/\s+/g, " ").trim().slice(0, CUSTOM_SPEC_MAX_LENGTH);
}

function createRuntimeCustomId() {
  return `custom:${Date.now().toString(36)}:${Math.random().toString(36).slice(2, 8)}`;
}

function createParsedCustomId(category: SpecCategory, text: string, index: number) {
  return `custom:${index}:${category}:${encodeURIComponent(text).slice(0, 48)}`;
}

export function getCustomSpecOption(input: CustomSpecInput): CustomSpecOption {
  return {
    id: input.id,
    category: input.category,
    label: input.text,
    emoji: "✍️",
    filterType: "soft",
    estimatedFilterRate: CUSTOM_SPEC_ESTIMATED_RATE,
    isCustom: true,
  };
}

function sanitizeSelectionState(presetIds: string[], customInputs: CustomSpecInput[]): My9SpecsSelectionState {
  const nextPresetIds = sanitizeSelectedSpecIds(presetIds);
  const availableCustomSlots = Math.max(0, MY9_SPECS_MAX_SELECTION - nextPresetIds.length);

  return {
    presetIds: nextPresetIds,
    customInputs: sanitizeCustomInputs(customInputs).slice(0, availableCustomSlots),
  };
}

function parseSerializedCustomInputs(raw: string | undefined) {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return sanitizeCustomInputs(
      parsed.map((item, index) => {
        if (!item || typeof item !== "object") {
          return null;
        }

        const record = item as SerializedCustomInput;
        return {
          id: createParsedCustomId(
            typeof record.c === "string" && isSpecCategory(record.c) ? record.c : SPEC_CATEGORY_ORDER[0],
            typeof record.t === "string" ? record.t : "",
            index
          ),
          category: typeof record.c === "string" && isSpecCategory(record.c) ? record.c : SPEC_CATEGORY_ORDER[0],
          text: typeof record.t === "string" ? record.t : "",
        };
      })
    );
  } catch {
    return [];
  }
}

export function getSpecById(id: string) {
  return SPEC_OPTIONS_BY_ID.get(id);
}

export function getConflictingPresetIds(id: string) {
  return Array.from(CONFLICTS_BY_ID.get(id) ?? []);
}

export function getSelectedSpecs(presetIds: string[], customInputs: CustomSpecInput[] = []): SelectedSpecOption[] {
  const presetOptions = presetIds
    .map((id) => getSpecById(id))
    .filter((option): option is SpecOption => Boolean(option));
  const customOptions = customInputs.map((input) => getCustomSpecOption(input));

  return [...presetOptions, ...customOptions];
}

export function getSelectedCount(presetIds: string[], customInputs: CustomSpecInput[] = []) {
  return presetIds.length + customInputs.length;
}

export function getSelectedCountInCategory(
  category: SpecCategory,
  presetIds: string[],
  customInputs: CustomSpecInput[] = []
) {
  const presetCount = presetIds.reduce((count, id) => {
    const option = getSpecById(id);
    return option?.category === category ? count + 1 : count;
  }, 0);
  const customCount = customInputs.filter((input) => input.category === category).length;

  return presetCount + customCount;
}

export function getFirstSelectedCategory(presetIds: string[], customInputs: CustomSpecInput[] = []) {
  const firstPreset = presetIds
    .map((id) => getSpecById(id))
    .find((option): option is SpecOption => Boolean(option));

  if (firstPreset) {
    return firstPreset.category;
  }

  if (customInputs[0]) {
    return customInputs[0].category;
  }

  return SPEC_CATEGORY_ORDER[0];
}

export function togglePresetSpec(selectedPresetIds: string[], optionId: string, occupiedCount: number) {
  if (selectedPresetIds.includes(optionId)) {
    return selectedPresetIds.filter((id) => id !== optionId);
  }

  const option = getSpecById(optionId);
  if (!option) {
    return selectedPresetIds;
  }

  const conflicts = CONFLICTS_BY_ID.get(optionId) ?? new Set<string>();
  const nextPresetIds = selectedPresetIds.filter((id) => !conflicts.has(id));
  const releasedSlots = selectedPresetIds.length - nextPresetIds.length;
  const nextTotalCount = occupiedCount - releasedSlots + 1;

  if (nextTotalCount > MY9_SPECS_MAX_SELECTION) {
    return selectedPresetIds;
  }

  return [...nextPresetIds, optionId];
}

export function sanitizeSelectedSpecIds(ids: string[]) {
  return ids.reduce<string[]>((current, id) => {
    const option = getSpecById(id);
    if (!option || current.includes(id)) {
      return current;
    }

    const conflicts = CONFLICTS_BY_ID.get(id) ?? new Set<string>();
    const next = current.filter((currentId) => !conflicts.has(currentId));

    if (next.length >= MY9_SPECS_MAX_SELECTION) {
      return current;
    }

    return [...next, id];
  }, []);
}

export function sanitizeCustomInputs(inputs: Array<CustomSpecInput | null | undefined>) {
  const dedupe = new Set<string>();
  const next: CustomSpecInput[] = [];

  for (const input of inputs) {
    if (!input || !isSpecCategory(input.category)) {
      continue;
    }

    const text = normalizeCustomText(input.text);
    if (!text) {
      continue;
    }

    const dedupeKey = `${input.category}:${text.toLowerCase()}`;
    if (dedupe.has(dedupeKey)) {
      continue;
    }

    dedupe.add(dedupeKey);
    next.push({
      id: input.id || createRuntimeCustomId(),
      category: input.category,
      text,
    });
  }

  return next;
}

export function addCustomSpec(
  currentCustomInputs: CustomSpecInput[],
  category: SpecCategory,
  text: string,
  occupiedCount: number
) {
  const normalizedText = normalizeCustomText(text);
  if (!normalizedText || occupiedCount >= MY9_SPECS_MAX_SELECTION) {
    return currentCustomInputs;
  }

  const duplicate = currentCustomInputs.some(
    (input) => input.category === category && input.text.toLowerCase() === normalizedText.toLowerCase()
  );

  if (duplicate) {
    return currentCustomInputs;
  }

  return [
    ...currentCustomInputs,
    {
      id: createRuntimeCustomId(),
      category,
      text: normalizedText,
    },
  ];
}

export function removeCustomSpec(currentCustomInputs: CustomSpecInput[], id: string) {
  return currentCustomInputs.filter((input) => input.id !== id);
}

export function countNoneSpecs(selected: SelectedSpecOption[]) {
  return selected.filter((option) => NONE_SPEC_IDS.has(option.id)).length;
}

function isStatisticalOption(option: SelectedSpecOption) {
  return (
    (option.filterType === "income" ||
      option.filterType === "height" ||
      option.filterType === "education" ||
      option.filterType === "region") &&
    "filterValue" in option &&
    option.filterValue !== undefined
  );
}

function isEstimatedOption(option: SelectedSpecOption) {
  return !isStatisticalOption(option) && option.estimatedFilterRate < 1;
}

function getStrictestNumericFilter(selected: SelectedSpecOption[], type: "income" | "height") {
  const candidates = selected.filter(
    (option): option is SpecOption & { filterValue: number } =>
      option.filterType === type && "filterValue" in option && typeof option.filterValue === "number"
  );

  if (candidates.length === 0) {
    return 0;
  }

  return candidates.reduce((strictest, option) => {
    return option.filterValue > strictest ? option.filterValue : strictest;
  }, 0);
}

function getSingleValueFilter<TValue extends string>(
  selected: SelectedSpecOption[],
  type: "education" | "region",
  fallback: TValue
) {
  const option = selected.find(
    (candidate): candidate is SpecOption & { filterValue: TValue } =>
      candidate.filterType === type && "filterValue" in candidate && typeof candidate.filterValue === "string"
  );

  return option?.filterValue ?? fallback;
}

export function buildMy9SpecsHardConditions(selected: SelectedSpecOption[], targetGender: ConditionGender): Conditions {
  return {
    targetGender,
    ageMin: AGE_MIN,
    ageMax: AGE_MAX,
    incomeMin: getStrictestNumericFilter(selected, "income"),
    incomeMax: 0,
    heightMin: getStrictestNumericFilter(selected, "height"),
    heightMax: 0,
    education: getSingleValueFilter(selected, "education", "any"),
    region: getSingleValueFilter(selected, "region", "all"),
  };
}

function getReliabilityMeta(reliability: My9SpecsReliability) {
  switch (reliability) {
    case "high":
      return {
        reliabilityLabel: "統計データ中心の推計",
        reliabilityNote: "年収・身長・学歴・居住地の統計を中心に推計しています。",
      };
    case "medium":
      return {
        reliabilityLabel: "統計＋推計値を含む概算",
        reliabilityNote: "年齢感や性格・趣味など、一部に推計値を含む概算です。",
      };
    default:
      return {
        reliabilityLabel: "ざっくり目安",
        reliabilityNote: "推計値の比重が高いので、参考程度の目安として見てください。",
      };
  }
}

export function getMy9SpecsComment(count: number, topImpactLabel: string) {
  if (count <= 10) {
    return `${count}人。ほぼ実在しない組み合わせです。でもこの条件で諦められないなら、出会い方を変えるしかない。アプリで偶然拾うより、紹介や共通コミュニティのほうがまだ現実的です。`;
  }

  if (count <= 100) {
    return `${count}人。東京ドームの観客に1人いるかどうかのレベル。9条件のうち「${topImpactLabel}」を外すだけで桁が変わる可能性があります。全部を満たす人を探すより、8条件で出会って1条件は後から見極めるほうが現実的です。`;
  }

  if (count <= 1000) {
    return `${count}人。いるにはいます。ただし全員がアプリにいるわけではありません。この条件ならアプリだけでなく、紹介や相談所の併用も視野に入る人数です。`;
  }

  if (count <= 10000) {
    return `${count}人。十分に出会える人数です。問題はこの人たちも同じように条件で選んでいること。相手条件と同じくらい、自分の見られ方も点検したほうが強いです。`;
  }

  if (count <= 100000) {
    return `${count}人。条件はかなり現実的です。ここから先は条件より、プロフィールと会話の質で差がつきます。`;
  }

  return `${count}人。条件はかなり広めです。もう少し「これだけは譲れない」を絞ると、自分に合う人を見つけやすくなります。`;
}

function calculateEstimateBase(selected: SelectedSpecOption[], targetGender: ConditionGender) {
  const hardConditions = buildMy9SpecsHardConditions(selected, targetGender);
  const hardCount = calculate(hardConditions);
  const estimatedOptions = selected.filter(isEstimatedOption);
  const rawEstimatedRate = estimatedOptions.reduce((rate, option) => rate * option.estimatedFilterRate, 1);
  const correlationBoost = 1 + Math.max(0, estimatedOptions.length - 1) * 0.15;
  const adjustedEstimatedRate = Math.min(rawEstimatedRate * correlationBoost, 1);
  const count = Math.max(1, Math.round(hardCount * adjustedEstimatedRate));
  const totalPoolCount = getTotalPoolCount(targetGender);
  const percentageWithinGender = totalPoolCount > 0 ? (count / totalPoolCount) * 100 : 0;
  const reliability: My9SpecsReliability =
    estimatedOptions.length <= 2 ? "high" : estimatedOptions.length <= 5 ? "medium" : "low";

  return {
    count,
    hardCount,
    softAdjusted: count,
    totalPoolCount,
    percentageWithinGender,
    reliability,
    estimatedOptionCount: estimatedOptions.length,
    hardConditions,
  };
}

function calculateImpacts(selected: SelectedSpecOption[], targetGender: ConditionGender, currentCount: number) {
  return selected
    .map<My9SpecsImpact>((option) => {
      const nextSelected = selected.filter((candidate) => candidate.id !== option.id);
      const withoutCount = calculateEstimateBase(nextSelected, targetGender).count;
      const increase = Math.max(0, withoutCount - currentCount);
      const reductionRate = withoutCount > 0 ? 1 - currentCount / withoutCount : 0;

      return {
        option,
        withoutCount,
        increase,
        reductionRate: Math.max(0, reductionRate),
      };
    })
    .sort((left, right) => {
      if (right.reductionRate !== left.reductionRate) {
        return right.reductionRate - left.reductionRate;
      }

      return right.increase - left.increase;
    });
}

export function getMy9SpecsEstimate(selected: SelectedSpecOption[], targetGender: ConditionGender): My9SpecsEstimate {
  const base = calculateEstimateBase(selected, targetGender);
  const impacts = calculateImpacts(selected, targetGender, base.count);
  const topImpact = impacts[0] ?? null;
  const leastImpact = impacts[impacts.length - 1] ?? null;
  const noneSelectionCount = countNoneSpecs(selected);
  const noteWarning =
    noneSelectionCount >= 3 ? "「気にしない」が多すぎると9枠がもったいない。本当に譲れない条件だけ選んでみて。" : null;
  const reliabilityMeta = getReliabilityMeta(base.reliability);

  return {
    ...base,
    ...reliabilityMeta,
    noneSelectionCount,
    noteWarning,
    impacts,
    topImpact,
    leastImpact,
    comment: getMy9SpecsComment(base.count, topImpact?.option.label ?? "複数条件"),
  };
}

export function buildConditionCheckerUrl(selected: SelectedSpecOption[], targetGender: ConditionGender) {
  const params = new URLSearchParams({
    g: targetGender,
    from: "my9specs",
  });

  const incomeMin = getStrictestNumericFilter(selected, "income");
  if (incomeMin > 0) {
    params.set("i", String(incomeMin));
  }

  const heightMin = getStrictestNumericFilter(selected, "height");
  if (heightMin > 0) {
    params.set("hmin", String(heightMin));
  }

  const education = getSingleValueFilter(selected, "education", "any");
  if (education !== "any") {
    params.set("e", education);
  }

  const region = getSingleValueFilter(selected, "region", "all");
  if (region !== "all") {
    params.set("r", region);
  }

  return `/conditions?${params.toString()}`;
}

export function getMy9SpecsShareLabels(selected: SelectedSpecOption[]) {
  return selected.map((option) => option.label).join("／");
}

export function parseMy9SpecsSearchParams(searchParams: SearchParamsRecord) {
  const gender = toRecordValue(searchParams.g) === "female" ? "female" : "male";
  const rawPresetIds = toRecordValue(searchParams.s) ?? "";
  const rawCustomInputs = toRecordValue(searchParams.cx);
  const selection = sanitizeSelectionState(
    rawPresetIds
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
    parseSerializedCustomInputs(rawCustomInputs)
  );

  return {
    targetGender: gender as ConditionGender,
    ...selection,
  };
}

export function serializeMy9SpecsSearchParams(
  targetGender: ConditionGender,
  presetIds: string[],
  customInputs: CustomSpecInput[] = []
) {
  const selection = sanitizeSelectionState(presetIds, customInputs);
  const params = new URLSearchParams({
    g: targetGender,
  });

  if (selection.presetIds.length > 0) {
    params.set("s", selection.presetIds.join(","));
  }

  if (selection.customInputs.length > 0) {
    params.set(
      "cx",
      JSON.stringify(selection.customInputs.map((input) => ({ c: input.category, t: input.text })))
    );
  }

  return params.toString();
}
