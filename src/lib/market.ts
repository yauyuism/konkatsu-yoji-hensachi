import {
  MARKET_AGE_MAX,
  MARKET_AGE_MIN,
  MARKET_EDUCATION_LABELS,
  MARKET_GENDER_LABELS,
  MARKET_REGION_LABELS,
  femaleAgeDesirability,
  femaleIncomePercentile,
  femalePercentileToIncome,
  maleAgeDesirability,
  maleIncomePercentile,
  malePercentileToIncome,
  educationDesirability,
  marketEducationPercentile,
  marketHeightParams,
  marketRegionPercentile,
  regionDesirability,
  type MarketEducationKey,
  type MarketGender,
  type MarketRegionKey,
} from "@/data/market";
import { unmarriedPopulation } from "@/data/conditions";

export type MarketUserSpec = {
  gender: MarketGender;
  age: number;
  income: number;
  height: number;
  education: MarketEducationKey;
  region: MarketRegionKey;
};

export type MarketSpecKey = "age" | "income" | "height" | "education" | "region";

export type MarketBreakdownItem = {
  key: MarketSpecKey;
  label: string;
  value: string;
  percentile: number;
  incomeEquivalent: number;
  included: boolean;
  score: number;
  description: string;
};

export type MarketWhatIf = {
  key: "income" | "height" | "education" | "region";
  label: string;
  nextValue: string;
  incomeEquivalent: number;
  overallPercentile: number;
  delta: number;
};

export type MarketAnalysis = {
  specs: MarketBreakdownItem[];
  overallPercentile: number;
  incomeEquivalent: number;
  demandCount: number;
  demandShare: number;
  comment: string;
  methodologySteps: string[];
  note: string;
  whatIfs: MarketWhatIf[];
};

const marketSpecWeights: Record<MarketSpecKey, number> = {
  age: 0.25,
  income: 0.35,
  height: 0.1,
  education: 0.15,
  region: 0.15,
};

export const DEFAULT_MARKET_SPEC: MarketUserSpec = {
  gender: "male",
  age: 32,
  income: 550,
  height: 171,
  education: "college",
  region: "tokyo",
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

function roundToNearest(value: number, unit: number) {
  return Math.round(value / unit) * unit;
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

function interpolateRecord(table: Record<number, number>, input: number) {
  const thresholds = Object.keys(table)
    .map(Number)
    .sort((left, right) => left - right);

  if (input <= thresholds[0]) {
    return table[thresholds[0]];
  }

  const last = thresholds[thresholds.length - 1];
  if (input >= last) {
    return table[last];
  }

  for (let index = 0; index < thresholds.length - 1; index += 1) {
    const lower = thresholds[index];
    const upper = thresholds[index + 1];
    if (input < lower || input >= upper) {
      continue;
    }

    const ratio = (input - lower) / (upper - lower);
    return table[lower] + (table[upper] - table[lower]) * ratio;
  }

  return table[last];
}

function interpolateTuple(table: Array<[number, number]>, percentile: number) {
  for (let index = 0; index < table.length - 1; index += 1) {
    const [p1, income1] = table[index];
    const [p2, income2] = table[index + 1];

    if (percentile <= p1 && percentile >= p2) {
      const ratio = (p1 - percentile) / (p1 - p2);
      return Math.round(income1 + (income2 - income1) * ratio);
    }
  }

  if (percentile >= 100) {
    return 0;
  }

  return table[table.length - 1]?.[1] ?? 2000;
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

function getAgeDesirabilityRate(gender: MarketGender, age: number) {
  const table = gender === "male" ? maleAgeDesirability : femaleAgeDesirability;
  return table[age] ?? 0.5;
}

export function getAgePercentile(gender: MarketGender, age: number) {
  return clamp((1 - getAgeDesirabilityRate(gender, age)) * 100, 0.1, 99.9);
}

export function getIncomePercentile(gender: MarketGender, income: number) {
  const table = gender === "male" ? maleIncomePercentile : femaleIncomePercentile;
  return clamp(interpolateRecord(table, income), 0.02, 100);
}

export function percentileToIncome(gender: MarketGender, percentile: number) {
  const table = gender === "male" ? malePercentileToIncome : femalePercentileToIncome;
  return interpolateTuple(table, clamp(percentile, 0.02, 100));
}

export function getHeightPercentile(gender: MarketGender, height: number) {
  const { mean, sd } = marketHeightParams[gender];
  return clamp((1 - normalCDF(height, mean, sd)) * 100, 0.02, 100);
}

export function getEducationPercentile(gender: MarketGender, education: MarketEducationKey) {
  return marketEducationPercentile[gender][education];
}

export function getRegionPercentile(gender: MarketGender, region: MarketRegionKey) {
  return marketRegionPercentile[gender][region];
}

function percentileToPassRate(percentile: number) {
  return clamp(1 - percentile / 100, 0, 1);
}

function getOppositeGender(gender: MarketGender): MarketGender {
  return gender === "male" ? "female" : "male";
}

function getTotalUnmarried(gender: MarketGender, region: MarketRegionKey) {
  return Object.values(unmarriedPopulation[gender]).reduce((total, ageGroup) => total + ageGroup[region], 0);
}

function combineIncomeEquivalents(gender: MarketGender, specs: MarketBreakdownItem[]) {
  const included = specs.filter((item) => item.included);

  if (!included.length) {
    return percentileToIncome(gender, 100);
  }

  const totalWeight = included.reduce((total, item) => total + marketSpecWeights[item.key], 0);
  const weightedIncome = included.reduce(
    (total, item) => total + item.incomeEquivalent * (marketSpecWeights[item.key] / totalWeight),
    0
  );

  return clamp(roundToNearest(weightedIncome, 10), 100, 2500);
}

function getOverallPercentileFromIncomeEquivalent(gender: MarketGender, incomeEquivalent: number) {
  return round1(getIncomePercentile(gender, incomeEquivalent));
}

function buildBreakdown(user: MarketUserSpec) {
  const agePercentile = getAgePercentile(user.gender, user.age);
  const incomePercentile = user.income > 0 ? getIncomePercentile(user.gender, user.income) : null;
  const heightPercentile = user.height > 0 ? getHeightPercentile(user.gender, user.height) : null;
  const educationPercentile = getEducationPercentile(user.gender, user.education);
  const regionPercentile = getRegionPercentile(user.gender, user.region);

  const items: MarketBreakdownItem[] = [
    {
      key: "age",
      label: "年齢",
      value: `${user.age}歳`,
      percentile: round1(agePercentile),
      incomeEquivalent: percentileToIncome(user.gender, agePercentile),
      included: true,
      score: Math.max(0, 100 - agePercentile),
      description: "希望年齢差の分布から、異性が許容しやすい年齢帯を推計しています。",
    },
  ];

  if (incomePercentile !== null) {
    items.push({
      key: "income",
      label: "年収",
      value: `${user.income}万円`,
      percentile: round1(incomePercentile),
      incomeEquivalent: user.income,
      included: true,
      score: Math.max(0, 100 - incomePercentile),
      description: "賃金統計の累積分布から、同性未婚者の中での立ち位置を見ています。",
    });
  } else {
    items.push({
      key: "income",
      label: "年収",
      value: "未入力",
      percentile: 100,
      incomeEquivalent: 0,
      included: false,
      score: 0,
      description: "未入力なので総合計算から除外しています。",
    });
  }

  if (heightPercentile !== null) {
    items.push({
      key: "height",
      label: "身長",
      value: `${user.height}cm`,
      percentile: round1(heightPercentile),
      incomeEquivalent: percentileToIncome(user.gender, heightPercentile),
      included: true,
      score: Math.max(0, 100 - heightPercentile),
      description: "身長分布を正規分布近似し、上側の何%かを見ています。",
    });
  } else {
    items.push({
      key: "height",
      label: "身長",
      value: "未入力",
      percentile: 100,
      incomeEquivalent: 0,
      included: false,
      score: 0,
      description: "未入力なので総合計算から除外しています。",
    });
  }

  items.push(
    {
      key: "education",
      label: "学歴",
      value: MARKET_EDUCATION_LABELS[user.education],
      percentile: round1(educationPercentile),
      incomeEquivalent: percentileToIncome(user.gender, educationPercentile),
      included: true,
      score: Math.max(0, 100 - educationPercentile),
      description: "学歴以上の割合を使って、どれくらい上側かを見ています。",
    },
    {
      key: "region",
      label: "居住地",
      value: MARKET_REGION_LABELS[user.region],
      percentile: round1(regionPercentile),
      incomeEquivalent: percentileToIncome(user.gender, regionPercentile),
      included: true,
      score: Math.max(0, 100 - regionPercentile),
      description: "地域ごとの未婚人口シェアを、単独軸の希少性として見ています。",
    }
  );

  return items;
}

function formatDemandCountForComment(count: number) {
  if (count >= 100000) {
    return `${Math.round(count / 10000).toLocaleString()}万人`;
  }

  if (count >= 10000) {
    return `${(Math.round((count / 10000) * 10) / 10).toLocaleString()}万人`;
  }

  return `${count.toLocaleString()}人`;
}

function getSpecCommentLabel(item: MarketBreakdownItem) {
  switch (item.key) {
    case "income":
      return item.value.startsWith("年収") ? item.value : `年収${item.value}`;
    case "region":
      return `${item.value}在住`;
    default:
      return item.value;
  }
}

function getSpecCommentPriority(item: MarketBreakdownItem) {
  switch (item.key) {
    case "income":
      return 0;
    case "region":
      return 1;
    case "height":
      return 2;
    case "education":
      return 3;
    case "age":
    default:
      return 4;
  }
}

function joinJapaneseList(items: string[]) {
  if (items.length === 0) {
    return "";
  }

  if (items.length === 1) {
    return items[0];
  }

  if (items.length === 2) {
    return `${items[0]}と${items[1]}`;
  }

  return `${items.slice(0, -1).join("、")}、${items[items.length - 1]}`;
}

function getComment(
  analysis: Pick<MarketAnalysis, "demandCount" | "overallPercentile" | "specs">,
  gender: MarketGender
) {
  const standoutSpecs = analysis.specs
    .filter((item) => item.included)
    .sort(
      (left, right) =>
        left.percentile - right.percentile ||
        getSpecCommentPriority(left) - getSpecCommentPriority(right) ||
        right.incomeEquivalent - left.incomeEquivalent
    )
    .slice(0, 2)
    .map(getSpecCommentLabel);

  const rarityLead =
    analysis.overallPercentile <= 5
      ? "かなりレア寄り"
      : analysis.overallPercentile <= 15
        ? "しっかり上位"
        : analysis.overallPercentile <= 35
          ? "想像より埋もれにくい"
          : "数字だけで即不利とは言い切れない";

  const positionLine =
    analysis.overallPercentile <= 10
      ? "条件面だけを見るなら、プロフィールに大きな穴がなければ自然と候補に残りやすい位置です。"
      : analysis.overallPercentile <= 30
        ? "派手な一点突破ではなくても、複数条件をまとめて見るとちゃんと残る側にいます。"
        : analysis.overallPercentile <= 60
          ? "爆発的に目立つ数値ではないものの、入口で見落とされる側と決めつけるには早いです。"
          : "レア度だけで押し切るタイプではありませんが、ここから上がる余地はまだ十分あります。";

  const credibilityLine =
    analysis.overallPercentile <= 30
      ? "数字だけですべては決まりませんが、少なくとも会う前に候補から外されやすい側ではありません。"
      : analysis.overallPercentile <= 60
        ? "数字だけですべては決まりませんが、入口の弱さを決めつけるほどの結果ではありません。"
        : "数字だけですべては決まりませんが、ここから先は見せ方次第で印象をまだ動かせます。";

  const shareLine =
    analysis.overallPercentile <= 30
      ? "こういう結果は盛らずに淡々と見せたほうが、むしろ『思ったより強い』印象になりやすいので、軽くシェアしたくなる数字です。"
      : "こういう結果は無理に盛るより、改善の余地ごと見せたほうが自然に共感を集めやすいタイプです。";

  const standoutLine = standoutSpecs.length
    ? `特に効いているのは${joinJapaneseList(standoutSpecs)}で、総合の希少性をきれいに押し上げています。`
    : "";

  return `今回の診断では、あなたの婚活スペックは未婚${MARKET_GENDER_LABELS[gender]}の上位${formatMarketPercent(
    analysis.overallPercentile
  )}%くらいの希少性でした。${rarityLead}の水準です。${standoutLine}今の条件だけでも、あなたを条件内に入れやすい相手は約${formatDemandCountForComment(
    analysis.demandCount
  )}。${credibilityLine}${positionLine}${shareLine}`;
}

function buildMethodologySteps(user: MarketUserSpec, activeCount: number) {
  return [
    `年齢・年収・身長・学歴・居住地のうち、入力された ${activeCount} 軸を使って単独の上位割合を出しています。`,
    "各軸の上位割合を、国税庁の給与階級別分布も参照しながら同じ分位のものさしに揃えています。",
    "総合値は掛け算ではなく、年収35%・年齢25%・学歴15%・居住地15%・身長10%の重み付け平均です。未入力の軸がある場合は、残りの軸に重みを再配分しています。",
    "最後に、重み付けした値を未婚同性の上位何%くらいかに戻して表示しています。",
    `あなたを条件内に入れやすい相手人数は、${MARKET_REGION_LABELS[user.region]}にいる未婚異性人口に、年齢・年収・身長・学歴・居住地の許容率を掛けた概算です。`,
  ];
}

function getWhatIfCandidates(user: MarketUserSpec) {
  const candidates: MarketUserSpec[] = [];
  const incomeThresholds = [200, 300, 400, 500, 600, 700, 800, 900, 1000, 1200, 1500, 2000];

  for (const [region] of Object.entries(MARKET_REGION_LABELS)) {
    if (region !== user.region) {
      candidates.push({ ...user, region: region as MarketRegionKey });
    }
  }

  if (user.income > 0) {
    for (const threshold of incomeThresholds) {
      if (threshold > user.income) {
        candidates.push({ ...user, income: threshold });
      }
      if (candidates.filter((candidate) => candidate.income !== user.income).length >= 3) {
        break;
      }
    }
  }

  if (user.height > 0) {
    for (const delta of [3, 5]) {
      const nextHeight = clamp(user.height + delta, 130, 210);
      if (nextHeight !== user.height) {
        candidates.push({ ...user, height: nextHeight });
      }
    }
  }

  if (user.education === "highschool") {
    candidates.push({ ...user, education: "college" });
    candidates.push({ ...user, education: "graduate" });
  } else if (user.education === "college") {
    candidates.push({ ...user, education: "graduate" });
  }

  return candidates;
}

function getWhatIfLabel(current: MarketUserSpec, next: MarketUserSpec): Pick<MarketWhatIf, "key" | "label" | "nextValue"> {
  if (current.region !== next.region) {
    return {
      key: "region",
      label: `${MARKET_REGION_LABELS[current.region]} → ${MARKET_REGION_LABELS[next.region]}`,
      nextValue: `${MARKET_REGION_LABELS[next.region]}に住む`,
    };
  }

  if (current.income !== next.income) {
    return {
      key: "income",
      label: `年収${current.income}万 → ${next.income}万`,
      nextValue: `年収${next.income}万円`,
    };
  }

  if (current.height !== next.height) {
    return {
      key: "height",
      label: `身長${current.height}cm → ${next.height}cm`,
      nextValue: `${next.height}cm`,
    };
  }

  return {
    key: "education",
    label: `${MARKET_EDUCATION_LABELS[current.education]} → ${MARKET_EDUCATION_LABELS[next.education]}`,
    nextValue: MARKET_EDUCATION_LABELS[next.education],
  };
}

export function analyzeMarketSpecs(user: MarketUserSpec): MarketAnalysis {
  const specs = buildBreakdown(user);
  const activePercentiles = specs.filter((item) => item.included).map((item) => item.percentile);
  const incomeEquivalent = combineIncomeEquivalents(user.gender, specs);
  const overallPercentile = getOverallPercentileFromIncomeEquivalent(user.gender, incomeEquivalent);
  const oppositeGender = getOppositeGender(user.gender);
  const oppositeTotal = getTotalUnmarried(oppositeGender, user.region);
  const ageRate = getAgeDesirabilityRate(user.gender, user.age);
  const incomeRate = user.income > 0 ? percentileToPassRate(getIncomePercentile(user.gender, user.income)) : 1;
  const heightRate = user.height > 0 ? percentileToPassRate(getHeightPercentile(user.gender, user.height)) : 1;
  const educationRate = educationDesirability[user.gender][user.education];
  const regionRate = regionDesirability[user.gender][user.region];
  const demandCount = Math.round(oppositeTotal * ageRate * incomeRate * heightRate * educationRate * regionRate);
  const demandShare = oppositeTotal > 0 ? (demandCount / oppositeTotal) * 100 : 0;

  const base = {
    specs,
    overallPercentile,
    incomeEquivalent,
    demandCount,
    demandShare: round1(demandShare),
    comment: "",
    methodologySteps: [],
    note: "これはスペック条件の希少性を上位割合で見たもので、人間としての価値を表すものではありません。",
    whatIfs: [] as MarketWhatIf[],
  };

  const whatIfs = getWhatIfCandidates(user)
    .map((candidate) => {
      const candidateAnalysis = analyzeMarketSpecsWithoutWhatIf(candidate);
      const label = getWhatIfLabel(user, candidate);

      return {
        ...label,
        incomeEquivalent: candidateAnalysis.incomeEquivalent,
        overallPercentile: candidateAnalysis.overallPercentile,
        delta: candidateAnalysis.incomeEquivalent - incomeEquivalent,
      } satisfies MarketWhatIf;
    })
    .filter((item) => item.delta > 0)
    .sort((left, right) => right.delta - left.delta || left.overallPercentile - right.overallPercentile)
    .filter((item, index, list) => list.findIndex((candidate) => candidate.label === item.label) === index)
    .slice(0, 3);

  return {
    ...base,
    comment: getComment(
      {
        demandCount,
        overallPercentile,
        specs,
      },
      user.gender
    ),
    methodologySteps: buildMethodologySteps(user, activePercentiles.length),
    whatIfs,
  };
}

function analyzeMarketSpecsWithoutWhatIf(user: MarketUserSpec) {
  const specs = buildBreakdown(user);
  const incomeEquivalent = combineIncomeEquivalents(user.gender, specs);
  const overallPercentile = getOverallPercentileFromIncomeEquivalent(user.gender, incomeEquivalent);

  return {
    overallPercentile,
    incomeEquivalent,
  };
}

export function serializeMarketParams(user: MarketUserSpec) {
  const params = new URLSearchParams({
    g: user.gender,
    age: String(user.age),
    inc: String(user.income),
    h: String(user.height),
    e: user.education,
    r: user.region,
  });

  return params.toString();
}

export function parseMarketSearchParams(searchParams: Record<string, string | string[] | undefined>): MarketUserSpec {
  const gender = toRecordValue(searchParams.g);
  const age = Number(toRecordValue(searchParams.age));
  const income = Number(toRecordValue(searchParams.inc));
  const height = Number(toRecordValue(searchParams.h));
  const education = toRecordValue(searchParams.e);
  const region = toRecordValue(searchParams.r);

  return {
    gender: gender === "female" ? "female" : "male",
    age: clamp(Number.isFinite(age) ? age : DEFAULT_MARKET_SPEC.age, MARKET_AGE_MIN, MARKET_AGE_MAX),
    income: clamp(Number.isFinite(income) ? income : DEFAULT_MARKET_SPEC.income, 0, 2000),
    height: clamp(Number.isFinite(height) ? height : DEFAULT_MARKET_SPEC.height, 0, 210),
    education:
      education && education in MARKET_EDUCATION_LABELS
        ? (education as MarketEducationKey)
        : DEFAULT_MARKET_SPEC.education,
    region: region && region in MARKET_REGION_LABELS ? (region as MarketRegionKey) : DEFAULT_MARKET_SPEC.region,
  };
}

export function getMarketResultFromSearchParams(searchParams: Record<string, string | string[] | undefined>) {
  const user = parseMarketSearchParams(searchParams);
  const analysis = analyzeMarketSpecs(user);

  return {
    user,
    analysis,
  };
}

export function getMarketSpecSummary(user: MarketUserSpec) {
  return [
    `${user.age}歳`,
    user.income > 0 ? `年収${user.income}万` : "年収未入力",
    user.height > 0 ? `${user.height}cm` : "身長未入力",
    MARKET_EDUCATION_LABELS[user.education],
    MARKET_REGION_LABELS[user.region],
  ].join(" / ");
}

export function getMarketShareSpecSummary(user: MarketUserSpec) {
  return [
    `${user.age}歳`,
    user.income > 0 ? `年収${user.income}万` : null,
    user.height > 0 ? `${user.height}cm` : null,
    MARKET_EDUCATION_LABELS[user.education],
    MARKET_REGION_LABELS[user.region],
  ]
    .filter(Boolean)
    .join(" / ");
}

export function formatMarketPercent(value: number) {
  const rounded = round1(value);

  if (rounded < 0.1) {
    return "0.1未満";
  }

  if (rounded > 99) {
    return "99超";
  }

  return Number.isInteger(rounded) ? `${rounded}` : rounded.toFixed(1);
}

export function getMarketResultTitle(user: MarketUserSpec, analysis: MarketAnalysis) {
  return `婚活スペック上位チェック 上位${formatMarketPercent(analysis.overallPercentile)}%`;
}

export function getMarketResultDescription(user: MarketUserSpec, analysis: MarketAnalysis) {
  return `${getMarketSpecSummary(user)} の希少性は、未婚${MARKET_GENDER_LABELS[user.gender]}の上位${formatMarketPercent(
    analysis.overallPercentile
  )}%くらいです。`;
}
