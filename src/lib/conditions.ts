import {
  AGE_MAX,
  AGE_MIN,
  AGE_GROUPS,
  EDUCATIONS,
  GENDER_LABELS,
  REGIONS,
  educationRatio,
  femaleHeightOptions,
  heightParams,
  incomeDistribution,
  incomeThresholds,
  maleHeightOptions,
  unmarriedPopulation,
  type AgeGroupKey,
  type ConditionGender,
  type ConditionRegion,
  type EducationKey,
} from "@/data/conditions";

export type Conditions = {
  targetGender: ConditionGender;
  ageMin: number;
  ageMax: number;
  incomeMin: number;
  incomeMax: number;
  heightMin: number;
  heightMax: number;
  education: EducationKey;
  region: ConditionRegion;
};

export type ImpactResult = {
  key: "income" | "height" | "education" | "region" | "age";
  condition: string;
  label: string;
  before: number;
  after: number;
  multiplier: number | null;
  increase: number;
};

export type CalculationSummary = {
  count: number;
  percentage: number;
  incomeRatio: number;
  heightRatio: number;
  educationRatio: number;
  impacts: ImpactResult[];
  comment: string;
  scaleComparisons: string[];
  totalPoolCount: number;
};

export const DEFAULT_CONDITIONS: Conditions = {
  targetGender: "male",
  ageMin: 25,
  ageMax: 35,
  incomeMin: 500,
  incomeMax: 0,
  heightMin: 170,
  heightMax: 0,
  education: "college",
  region: "tokyo",
};

const overallUnmarriedPopulation = Object.values(unmarriedPopulation).reduce((genderTotal, groups) => {
  return genderTotal + Object.values(groups).reduce((ageTotal, regions) => ageTotal + regions.all, 0);
}, 0);

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function toRecordValue(value: string | string[] | undefined) {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value[0];
  }

  return undefined;
}

function normalCDF(x: number, mean: number, sd: number) {
  const z = (x - mean) / sd;
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989422804014327 * Math.exp((-z * z) / 2);
  const probability =
    d *
    t *
    (0.31938153 +
      t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));

  return z > 0 ? 1 - probability : probability;
}

export function getHeightOptions(gender: ConditionGender) {
  return gender === "male" ? maleHeightOptions : femaleHeightOptions;
}

export function getHeightBoundLabel(value: number, bound: "min" | "max") {
  if (value === 0) {
    return "指定なし";
  }

  return bound === "min" ? `${value}cm以上` : `${value}cm以下`;
}

export function getHeightLabel(_gender: ConditionGender, heightMin: number, heightMax = 0) {
  if (heightMin === 0 && heightMax === 0) {
    return "指定なし";
  }

  if (heightMin > 0 && heightMax > 0) {
    if (heightMin === heightMax) {
      return `${heightMin}cm`;
    }

    return `${heightMin}〜${heightMax}cm`;
  }

  if (heightMin > 0) {
    return getHeightBoundLabel(heightMin, "min");
  }

  return getHeightBoundLabel(heightMax, "max");
}

export function getIncomeBoundLabel(value: number, bound: "min" | "max") {
  if (value === 0) {
    return "指定なし";
  }

  return bound === "min" ? `${value}万円以上` : `${value}万円以下`;
}

export function getIncomeLabel(incomeMin: number, incomeMax = 0) {
  if (incomeMin === 0 && incomeMax === 0) {
    return "指定なし";
  }

  if (incomeMin > 0 && incomeMax > 0) {
    if (incomeMin === incomeMax) {
      return `${incomeMin}万円`;
    }

    return `${incomeMin}〜${incomeMax}万円`;
  }

  if (incomeMin > 0) {
    return getIncomeBoundLabel(incomeMin, "min");
  }

  return getIncomeBoundLabel(incomeMax, "max");
}

export function getAgeLabel(ageMin: number, ageMax: number) {
  return `${ageMin}〜${ageMax}歳`;
}

export function getConditionSummaryList(conditions: Conditions) {
  return [
    `相手: ${GENDER_LABELS[conditions.targetGender]}`,
    `年齢: ${getAgeLabel(conditions.ageMin, conditions.ageMax)}`,
    `年収: ${getIncomeLabel(conditions.incomeMin, conditions.incomeMax)}`,
    `身長: ${getHeightLabel(conditions.targetGender, conditions.heightMin, conditions.heightMax)}`,
    `学歴: ${EDUCATIONS[conditions.education]}`,
    `エリア: ${REGIONS[conditions.region].label}`,
  ];
}

export function getConditionSummaryInline(conditions: Conditions) {
  return [
    GENDER_LABELS[conditions.targetGender],
    getAgeLabel(conditions.ageMin, conditions.ageMax),
    getIncomeLabel(conditions.incomeMin, conditions.incomeMax),
    getHeightLabel(conditions.targetGender, conditions.heightMin, conditions.heightMax),
    EDUCATIONS[conditions.education],
    REGIONS[conditions.region].label,
  ].join(" / ");
}

export function isAllConditionsUnspecified(conditions: Conditions) {
  return (
    conditions.ageMin === AGE_MIN &&
    conditions.ageMax === AGE_MAX &&
    conditions.incomeMin === 0 &&
    conditions.incomeMax === 0 &&
    conditions.heightMin === 0 &&
    conditions.heightMax === 0 &&
    conditions.education === "any" &&
    conditions.region === "all"
  );
}

export function getTotalPoolCount(gender: ConditionGender) {
  return Object.values(unmarriedPopulation[gender]).reduce((total, regions) => total + regions.all, 0);
}

export function formatConditionsCountLabel(count: number) {
  if (count < 100) {
    return "100人未満";
  }

  if (count >= 1_000_000) {
    return "1,000,000+人";
  }

  return `${count.toLocaleString()}人`;
}

export function getOverlappingAgeGroups(ageMin: number, ageMax: number) {
  return AGE_GROUPS.flatMap((group) => {
    const overlapMin = Math.max(ageMin, group.min);
    const overlapMax = Math.min(ageMax, group.max);

    if (overlapMin > overlapMax) {
      return [];
    }

    return [
      {
        group: group.key,
        overlap: (overlapMax - overlapMin + 1) / (group.max - group.min + 1),
      },
    ];
  });
}

export function getIncomeAboveRatio(gender: ConditionGender, ageGroup: AgeGroupKey, minIncome: number) {
  const distribution = incomeDistribution[gender][ageGroup];
  const thresholds = Object.keys(distribution)
    .map(Number)
    .sort((left, right) => left - right);

  if (minIncome <= thresholds[0]) {
    return distribution[thresholds[0]];
  }

  for (let index = thresholds.length - 1; index >= 0; index -= 1) {
    const lower = thresholds[index];

    if (lower > minIncome) {
      continue;
    }

    if (lower === minIncome || index === thresholds.length - 1) {
      return distribution[lower];
    }

    const upper = thresholds[index + 1];
    const progress = (minIncome - lower) / (upper - lower);
    return distribution[lower] + (distribution[upper] - distribution[lower]) * progress;
  }

  return 1;
}

function getIncomeUpperTailRatio(gender: ConditionGender, ageGroup: AgeGroupKey, maxIncome: number) {
  if (maxIncome === 0) {
    return 0;
  }

  const actualThresholds = incomeThresholds.filter((threshold) => threshold > 0);
  const currentIndex = actualThresholds.findIndex((threshold) => threshold === maxIncome);

  if (currentIndex < 0 || currentIndex >= actualThresholds.length - 1) {
    return 0;
  }

  const nextThreshold = actualThresholds[currentIndex + 1];
  return getIncomeAboveRatio(gender, ageGroup, nextThreshold);
}

export function getIncomeRangeRatio(
  gender: ConditionGender,
  ageGroup: AgeGroupKey,
  incomeMin: number,
  incomeMax: number
) {
  const lowerRatio = incomeMin > 0 ? getIncomeAboveRatio(gender, ageGroup, incomeMin) : 1;
  const upperTailRatio = getIncomeUpperTailRatio(gender, ageGroup, incomeMax);
  return Math.max(0, lowerRatio - upperTailRatio);
}

export function getHeightRatio(gender: ConditionGender, heightMin: number, heightMax: number) {
  if (heightMin === 0 && heightMax === 0) {
    return 1;
  }

  const { mean, sd } = heightParams[gender];
  const lower = heightMin > 0 ? normalCDF(heightMin - 0.5, mean, sd) : 0;
  const upper = heightMax > 0 ? normalCDF(heightMax + 0.5, mean, sd) : 1;

  return Math.max(0, upper - lower);
}

function getWeightedAgeRatio(
  conditions: Conditions,
  selector: (ageGroup: AgeGroupKey) => number
) {
  const ageGroups = getOverlappingAgeGroups(conditions.ageMin, conditions.ageMax);
  let weightedTotal = 0;
  let weightSum = 0;

  for (const { group, overlap } of ageGroups) {
    const weightBase = unmarriedPopulation[conditions.targetGender][group][conditions.region] * overlap;
    weightedTotal += selector(group) * weightBase;
    weightSum += weightBase;
  }

  return weightSum > 0 ? weightedTotal / weightSum : 0;
}

export function calculate(conditions: Conditions) {
  const ageGroups = getOverlappingAgeGroups(conditions.ageMin, conditions.ageMax);
  let total = 0;

  for (const { group, overlap } of ageGroups) {
    const unmarried = unmarriedPopulation[conditions.targetGender][group][conditions.region] * overlap;
    const incomeRatio = getIncomeRangeRatio(
      conditions.targetGender,
      group,
      conditions.incomeMin,
      conditions.incomeMax
    );
    const heightRatio = getHeightRatio(conditions.targetGender, conditions.heightMin, conditions.heightMax);
    const eduRatio = educationRatio[conditions.targetGender][group][conditions.education];

    total += unmarried * incomeRatio * heightRatio * eduRatio;
  }

  return Math.round(total);
}

export function calculatePercentage(count: number) {
  return overallUnmarriedPopulation > 0 ? (count / overallUnmarriedPopulation) * 100 : 0;
}

export function calculateImpacts(conditions: Conditions) {
  const baseline = calculate(conditions);
  const impacts: ImpactResult[] = [];

  if (conditions.incomeMin > 0 || conditions.incomeMax > 0) {
    const without = calculate({ ...conditions, incomeMin: 0, incomeMax: 0 });
    impacts.push({
      key: "income",
      condition: "年収",
      label: `${getIncomeLabel(conditions.incomeMin, conditions.incomeMax)} → 指定なし`,
      before: baseline,
      after: without,
      multiplier: baseline > 0 ? without / baseline : null,
      increase: without - baseline,
    });
  }

  if (conditions.heightMin > 0 || conditions.heightMax > 0) {
    const without = calculate({ ...conditions, heightMin: 0, heightMax: 0 });
    impacts.push({
      key: "height",
      condition: "身長",
      label: `${getHeightLabel(conditions.targetGender, conditions.heightMin, conditions.heightMax)} → 指定なし`,
      before: baseline,
      after: without,
      multiplier: baseline > 0 ? without / baseline : null,
      increase: without - baseline,
    });
  }

  if (conditions.education !== "any") {
    const without = calculate({ ...conditions, education: "any" });
    impacts.push({
      key: "education",
      condition: "学歴",
      label: `${EDUCATIONS[conditions.education]} → 指定なし`,
      before: baseline,
      after: without,
      multiplier: baseline > 0 ? without / baseline : null,
      increase: without - baseline,
    });
  }

  if (conditions.region !== "all") {
    const without = calculate({ ...conditions, region: "all" });
    impacts.push({
      key: "region",
      condition: "エリア",
      label: `${REGIONS[conditions.region].label} → 全国`,
      before: baseline,
      after: without,
      multiplier: baseline > 0 ? without / baseline : null,
      increase: without - baseline,
    });
  }

  const expandedAgeMin = Math.max(AGE_MIN, conditions.ageMin - 5);
  const expandedAgeMax = Math.min(AGE_MAX, conditions.ageMax + 5);

  if (expandedAgeMin !== conditions.ageMin || expandedAgeMax !== conditions.ageMax) {
    const without = calculate({
      ...conditions,
      ageMin: expandedAgeMin,
      ageMax: expandedAgeMax,
    });

    impacts.push({
      key: "age",
      condition: "年齢",
      label: `${getAgeLabel(conditions.ageMin, conditions.ageMax)} → ${getAgeLabel(expandedAgeMin, expandedAgeMax)}`,
      before: baseline,
      after: without,
      multiplier: baseline > 0 ? without / baseline : null,
      increase: without - baseline,
    });
  }

  return impacts.sort((left, right) => {
    const leftValue = left.multiplier ?? Number.POSITIVE_INFINITY;
    const rightValue = right.multiplier ?? Number.POSITIVE_INFINITY;
    return rightValue - leftValue;
  });
}

function getOneStepLowerIncome(incomeMin: number) {
  const index = incomeThresholds.indexOf(incomeMin as (typeof incomeThresholds)[number]);
  if (index <= 0) {
    return 0;
  }

  return incomeThresholds[index - 1] ?? 0;
}

function getOneStepHigherIncome(incomeMax: number) {
  if (incomeMax === 0) {
    return 0;
  }

  const index = incomeThresholds.indexOf(incomeMax as (typeof incomeThresholds)[number]);
  if (index < 0 || index >= incomeThresholds.length - 1) {
    return 0;
  }

  return incomeThresholds[index + 1] ?? 0;
}

function getOneStepBroaderIncome(conditions: Conditions) {
  const candidates: Array<Pick<Conditions, "incomeMin" | "incomeMax">> = [];

  if (conditions.incomeMin > 0) {
    candidates.push({
      incomeMin: getOneStepLowerIncome(conditions.incomeMin),
      incomeMax: conditions.incomeMax,
    });
  }

  if (conditions.incomeMax > 0) {
    candidates.push({
      incomeMin: conditions.incomeMin,
      incomeMax: getOneStepHigherIncome(conditions.incomeMax),
    });
  }

  if (candidates.length === 0) {
    return {
      incomeMin: 0,
      incomeMax: 0,
    };
  }

  return candidates.reduce((best, candidate) => {
    const bestRatio = getWeightedAgeRatio(conditions, (group) =>
      getIncomeRangeRatio(conditions.targetGender, group, best.incomeMin, best.incomeMax)
    );
    const candidateRatio = getWeightedAgeRatio(conditions, (group) =>
      getIncomeRangeRatio(conditions.targetGender, group, candidate.incomeMin, candidate.incomeMax)
    );
    return candidateRatio > bestRatio ? candidate : best;
  });
}

function getOneStepBroaderHeightMin(gender: ConditionGender, heightMin: number) {
  const options = getHeightOptions(gender);
  const index = options.findIndex((option) => option === heightMin);

  if (index <= 0) {
    return 0;
  }

  return options[index - 1] ?? 0;
}

function getOneStepBroaderHeightMax(gender: ConditionGender, heightMax: number) {
  const options = getHeightOptions(gender);
  const index = options.findIndex((option) => option === heightMax);

  if (index < 0) {
    return 0;
  }

  if (index >= options.length - 1) {
    return 0;
  }

  return options[index + 1] ?? 0;
}

function getOneStepBroaderHeight(conditions: Conditions) {
  const candidates: Array<Pick<Conditions, "heightMin" | "heightMax">> = [];

  if (conditions.heightMin > 0) {
    candidates.push({
      heightMin: getOneStepBroaderHeightMin(conditions.targetGender, conditions.heightMin),
      heightMax: conditions.heightMax,
    });
  }

  if (conditions.heightMax > 0) {
    candidates.push({
      heightMin: conditions.heightMin,
      heightMax: getOneStepBroaderHeightMax(conditions.targetGender, conditions.heightMax),
    });
  }

  if (candidates.length === 0) {
    return {
      heightMin: 0,
      heightMax: 0,
    };
  }

  return candidates.reduce((best, candidate) => {
    const bestRatio = getHeightRatio(conditions.targetGender, best.heightMin, best.heightMax);
    const candidateRatio = getHeightRatio(conditions.targetGender, candidate.heightMin, candidate.heightMax);
    return candidateRatio > bestRatio ? candidate : best;
  });
}

function getPrimaryAction(conditions: Conditions, impact: ImpactResult | undefined) {
  if (!impact) {
    return "会う前に切りすぎない運用へ寄せる";
  }

  switch (impact.key) {
    case "income": {
      const nextIncome = getOneStepBroaderIncome(conditions);
      return nextIncome.incomeMin !== conditions.incomeMin || nextIncome.incomeMax !== conditions.incomeMax
        ? `年収条件を ${getIncomeLabel(conditions.incomeMin, conditions.incomeMax)} から ${getIncomeLabel(nextIncome.incomeMin, nextIncome.incomeMax)} に少し広げる`
        : "年収条件を足切りではなく参考条件に下げる";
    }
    case "height": {
      const nextHeight = getOneStepBroaderHeight(conditions);
      return nextHeight.heightMin !== conditions.heightMin || nextHeight.heightMax !== conditions.heightMax
        ? `身長条件を ${getHeightLabel(conditions.targetGender, conditions.heightMin, conditions.heightMax)} から ${getHeightLabel(conditions.targetGender, nextHeight.heightMin, nextHeight.heightMax)} に少し広げる`
        : "身長条件の上限か下限を固定しすぎない";
    }
    case "education":
      return conditions.education === "graduate"
        ? "学歴を大学院卒固定から大卒以上へ緩める"
        : "学歴を足切り条件ではなく参考情報に下げる";
    case "region":
      return conditions.region === "tokyo"
        ? "エリアを東京から関東まで広げる"
        : "エリアを全国まで広げる";
    case "age":
      return `年齢幅を ${Math.max(AGE_MIN, conditions.ageMin - 3)}〜${Math.min(AGE_MAX, conditions.ageMax + 3)}歳あたりまで広げる`;
    default:
      return "条件を 1 つだけ緩めて反応を見る";
  }
}

function getIdealPressureLabel(primaryImpact: ImpactResult | undefined, secondaryImpact: ImpactResult | undefined) {
  if (primaryImpact && secondaryImpact && (secondaryImpact.multiplier ?? 1) >= 1.4) {
    return `${primaryImpact.condition}と${secondaryImpact.condition}の掛け算`;
  }

  if (primaryImpact) {
    return primaryImpact.condition;
  }

  return "複数条件の重なり";
}

function getStruggleReason(
  percentage: number,
  primaryImpact: ImpactResult | undefined,
  secondaryImpact: ImpactResult | undefined
) {
  if (primaryImpact && secondaryImpact && (primaryImpact.multiplier ?? 1) >= 1.6 && (secondaryImpact.multiplier ?? 1) >= 1.4) {
    return `${primaryImpact.condition}と${secondaryImpact.condition}を会う前の段階で同時に強く掛けているのが重いです。`;
  }

  if (primaryImpact && (primaryImpact.multiplier ?? 1) >= 1.8) {
    return `${primaryImpact.condition}を入口で強く足切りしているのが、いちばん詰まりやすいポイントです。`;
  }

  if (percentage < 0.3) {
    return "理想が高すぎるというより、複数条件を先に重ねて会う前に候補を削りすぎています。";
  }

  return "条件そのものより、優先順位が曖昧なまま複数の基準を同時に使っているのが苦戦要因です。";
}

function getDensityInsight(result: number, percentage: number) {
  const resultLabel = formatConditionsCountLabel(result);

  if (result < 100) {
    return `対象は${resultLabel}。かなりレアです。`;
  }

  if (percentage < 0.2) {
    return `対象は${resultLabel}。数字としては残っていますが、検索段階ではかなり狭い母数になります。`;
  }

  if (percentage < 1) {
    return `対象は${resultLabel}。絶望的ではないものの、感覚よりかなり早い段階で絞れています。`;
  }

  if (result >= 1_000_000) {
    return `対象は${resultLabel}。条件はかなり広めです。`;
  }

  return `対象は${resultLabel}。母数はまだ確保できています。`;
}

export function getResultComment(conditions: Conditions, result: number, impacts: ImpactResult[], percentage: number) {
  const primaryImpact = impacts[0];
  const secondaryImpact = impacts[1];
  const resultLabel = formatConditionsCountLabel(result);

  if (isAllConditionsUnspecified(conditions)) {
    return `いまは全条件が「指定なし」で、対象は${resultLabel}。出会えないというより、選ぶ軸がまだ定まっていない段階ですね。まずは年収かエリアを1つだけ入れてみてください。条件を何個も足すより、「これだけは外せない」を先に見つけたほうが婚活は進みます。広く取りすぎると、逆に判断が鈍りやすいです。`;
  }

  if (result < 100) {
    return `${getDensityInsight(result, percentage)}理想が高めに出ているのは${getIdealPressureLabel(primaryImpact, secondaryImpact)}です。${getStruggleReason(
      percentage,
      primaryImpact,
      secondaryImpact
    )}正直、このままだと会う前に候補を消しすぎます。まずは${getPrimaryAction(conditions, primaryImpact)}のが現実的。全部を妥協しなくていいので、最初に強く効いている条件だけを少し緩めたほうが、理想を壊さずに母数を戻せます。`;
  }

  if (result >= 1_000_000) {
    return `${getDensityInsight(result, percentage)}苦戦するとしたら、条件が厳しいからではなく、相手を見る軸が広すぎて判断が散るからです。今の課題は妥協より優先順位づけ。まずは年収・年齢・エリアのどれか1つだけを固定してみてください。何を重く見る人なのかが自分でも見えますし、広く会ってから絞る進め方のほうが、この設定では結果につながりやすいです。`;
  }
  return `${getDensityInsight(result, percentage)}理想が高めに出ているのは${getIdealPressureLabel(primaryImpact, secondaryImpact)}です。${getStruggleReason(
    percentage,
    primaryImpact,
    secondaryImpact
  )}たぶん苦戦するとしたら、会う前の入口で条件を掛けすぎる場面です。まずは${getPrimaryAction(conditions, primaryImpact)}のが効果的。${primaryImpact?.multiplier && primaryImpact.multiplier >= 1.5 ? `ここを先に動かしたほうが候補が戻るので、身長や学歴みたいに後から見られる条件は少し後ろへ回したほうがうまくいきます。` : `大きく条件を崩す必要はありません。効いている条件から順に微調整したほうが、理想と現実のバランスを取りやすいです。`}`;
}

export function getScaleComparisons(result: number) {
  const tokyoDome = result / 46_000;
  const scramble = result / 3_000;
  const budokan = result / 14_000;

  const domeSentence =
    tokyoDome >= 1
      ? `東京ドームの観客(46,000人)の ${tokyoDome.toFixed(1)} 倍。`
      : `東京ドームの観客(46,000人)の ${(tokyoDome * 100).toFixed(1)}%。`;
  const scrambleSentence =
    scramble >= 1
      ? `渋谷のスクランブル交差点を1回分の通行人(3,000人)で割ると約 ${Math.max(1, Math.round(scramble))} 回分。`
      : `渋谷のスクランブル交差点を1回分の通行人(3,000人)で見ると ${(scramble * 100).toFixed(1)}% くらい。`;
  const budokanSentence =
    budokan >= 1
      ? `日本武道館の満員(14,000人)なら ${budokan.toFixed(1)} 回分。`
      : `日本武道館の満員(14,000人)の ${(budokan * 100).toFixed(1)}%。`;

  return [domeSentence, scrambleSentence, budokanSentence];
}

export function getCalculationSummary(conditions: Conditions): CalculationSummary {
  const count = calculate(conditions);
  const percentage = calculatePercentage(count);
  const impacts = calculateImpacts(conditions);

  return {
    count,
    percentage,
    incomeRatio: getWeightedAgeRatio(conditions, (group) =>
      getIncomeRangeRatio(conditions.targetGender, group, conditions.incomeMin, conditions.incomeMax)
    ),
    heightRatio: getHeightRatio(conditions.targetGender, conditions.heightMin, conditions.heightMax),
    educationRatio: getWeightedAgeRatio(conditions, (group) => educationRatio[conditions.targetGender][group][conditions.education]),
    impacts,
    comment: getResultComment(conditions, count, impacts, percentage),
    scaleComparisons: getScaleComparisons(count),
    totalPoolCount: getTotalPoolCount(conditions.targetGender),
  };
}

export function serializeConditionsParams(conditions: Conditions) {
  const params = new URLSearchParams({
    g: conditions.targetGender,
    a: `${conditions.ageMin}-${conditions.ageMax}`,
    i: String(conditions.incomeMin),
    imax: String(conditions.incomeMax),
    hmin: String(conditions.heightMin),
    hmax: String(conditions.heightMax),
    e: conditions.education,
    r: conditions.region,
  });

  return params.toString();
}

function snapToClosestHeightOption(gender: ConditionGender, value: number, fallback: number) {
  const options = getHeightOptions(gender);

  if (!Number.isFinite(value)) {
    return fallback;
  }

  return options.reduce((closest, current) => {
    return Math.abs(current - value) < Math.abs(closest - value) ? current : closest;
  }, options[0] ?? fallback);
}

export function parseConditionsSearchParams(searchParams: Record<string, string | string[] | undefined>): Conditions {
  const gender = toRecordValue(searchParams.g);
  const targetGender = gender === "female" ? "female" : "male";
  const ageRange = toRecordValue(searchParams.a);
  const incomeMinParam = Number(toRecordValue(searchParams.imin) ?? toRecordValue(searchParams.i) ?? DEFAULT_CONDITIONS.incomeMin);
  const incomeMaxParam = Number(toRecordValue(searchParams.imax) ?? DEFAULT_CONDITIONS.incomeMax);
  const heightMinParam = toRecordValue(searchParams.hmin);
  const heightMaxParam = toRecordValue(searchParams.hmax);
  const legacyHeightParam = toRecordValue(searchParams.h);
  const education = toRecordValue(searchParams.e);
  const region = toRecordValue(searchParams.r);
  const [rawMin, rawMax] = (ageRange ?? `${DEFAULT_CONDITIONS.ageMin}-${DEFAULT_CONDITIONS.ageMax}`).split("-");
  const parsedAgeMin = Number(rawMin);
  const ageMin = clamp(Number.isFinite(parsedAgeMin) ? parsedAgeMin : DEFAULT_CONDITIONS.ageMin, AGE_MIN, AGE_MAX);
  const parsedAgeMax = Number(rawMax);
  const ageMax = clamp(Number.isFinite(parsedAgeMax) ? parsedAgeMax : DEFAULT_CONDITIONS.ageMax, ageMin, AGE_MAX);
  let incomeMin = incomeThresholds.includes(incomeMinParam as (typeof incomeThresholds)[number])
    ? incomeMinParam
    : DEFAULT_CONDITIONS.incomeMin;
  let incomeMax = incomeThresholds.includes(incomeMaxParam as (typeof incomeThresholds)[number])
    ? incomeMaxParam
    : DEFAULT_CONDITIONS.incomeMax;
  let heightMin = DEFAULT_CONDITIONS.heightMin;
  let heightMax = DEFAULT_CONDITIONS.heightMax;

  if (incomeMin > 0 && incomeMax > 0 && incomeMin > incomeMax) {
    [incomeMin, incomeMax] = [incomeMax, incomeMin];
  }

  if (heightMinParam !== undefined || heightMaxParam !== undefined) {
    heightMin =
      heightMinParam !== undefined ? snapToClosestHeightOption(targetGender, Number(heightMinParam), 0) : 0;
    heightMax =
      heightMaxParam !== undefined ? snapToClosestHeightOption(targetGender, Number(heightMaxParam), 0) : 0;
  } else if (legacyHeightParam !== undefined) {
    const legacyHeight = snapToClosestHeightOption(
      targetGender,
      Number(legacyHeightParam),
      targetGender === "female" ? DEFAULT_CONDITIONS.heightMax : DEFAULT_CONDITIONS.heightMin
    );

    if (targetGender === "female") {
      heightMin = 0;
      heightMax = legacyHeight;
    } else {
      heightMin = legacyHeight;
      heightMax = 0;
    }
  }

  if (heightMin > 0 && heightMax > 0 && heightMin > heightMax) {
    [heightMin, heightMax] = [heightMax, heightMin];
  }

  return {
    targetGender,
    ageMin,
    ageMax,
    incomeMin,
    incomeMax,
    heightMin,
    heightMax,
    education: education && education in EDUCATIONS ? (education as EducationKey) : DEFAULT_CONDITIONS.education,
    region: region && region in REGIONS ? (region as ConditionRegion) : DEFAULT_CONDITIONS.region,
  };
}

export function getConditionsResultFromSearchParams(searchParams: Record<string, string | string[] | undefined>) {
  const conditions = parseConditionsSearchParams(searchParams);
  const summary = getCalculationSummary(conditions);

  return {
    conditions,
    summary,
  };
}
