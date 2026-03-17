import { kv } from "@vercel/kv";

import {
  badCategoryOptions,
  getProfAgeGroup,
  getProfAppLabel,
  getProfScoreBand,
  goodCategoryOptions,
  profAgeGroups,
  profAppOptions,
  profScoreBands,
  type AnalysisResult,
  type AnalyzeRequest,
  type HighlightCategoryBad,
  type HighlightCategoryGood,
  type ProfAppValue,
  type ProfGender,
} from "@/lib/prof";

export interface AnonymousStatRecord {
  id: string;
  createdAt: string;
  gender: ProfGender;
  ageGroup: string;
  apps: ProfAppValue[];
  profileLength: number;
  scores: AnalysisResult["scores"];
  title: string;
  badCategories: HighlightCategoryBad[];
  goodCategories: HighlightCategoryGood[];
  badCount: number;
  goodCount: number;
  targetMain: {
    ageRange: string;
    occupation: string;
  };
  improvedTotal: number;
  scoreDiff: number;
}

export interface StatsSnapshot {
  totalCount: number;
  genderSplit: {
    male: number;
    female: number;
  };
  avgHensachi: number;
  avgHensachiByGender: {
    male: number | null;
    female: number | null;
  };
  ageGroups: Array<{
    group: string;
    count: number;
    avg: number | null;
  }>;
  appStats: Array<{
    app: ProfAppValue;
    label: string;
    count: number;
    avg: number | null;
  }>;
  badRanking: Array<{
    category: HighlightCategoryBad;
    count: number;
  }>;
  distribution: Array<{
    band: string;
    count: number;
    percentage: number;
  }>;
  avgImprovement: number;
  maxImprovement: number;
  avgImprovedTotal: number;
  lastUpdated: string | null;
}

function isKvConfigured() {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

function getRecordRetention() {
  const raw = Number(process.env.STATS_RECORD_RETENTION ?? "500");
  if (!Number.isFinite(raw) || raw <= 0) {
    return 0;
  }

  return Math.floor(raw);
}

function createRecordId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `record-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function roundOne(value: number) {
  return Math.round(value * 10) / 10;
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

function uniq<T>(values: T[]) {
  return [...new Set(values)];
}

function includesKeyword(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword));
}

function deriveBadCategories(result: AnalysisResult, profileLength: number) {
  const joined = result.highlights.bad
    .flatMap((item) => [item.reason, item.suggestion ?? "", item.text])
    .join("\n");
  const detected: HighlightCategoryBad[] = [];

  if (includesKeyword(joined, ["具体", "抽象", "ふわ", "旅行", "映画鑑賞", "固有名詞"])) {
    detected.push("具体性が低い");
  }
  if (includesKeyword(joined, ["防御", "警戒", "NG", "お断り", "真剣な方のみ", "圧"])) {
    detected.push("防御的表現");
  }
  if (includesKeyword(joined, ["自虐", "卑下", "下げすぎ", "弱気"])) {
    detected.push("自虐しすぎ");
  }
  if (includesKeyword(joined, ["上から", "選別", "条件", "要求が強い"])) {
    detected.push("上から目線");
  }
  if (profileLength < 80 || includesKeyword(joined, ["短い", "情報が少ない", "薄い"])) {
    detected.push("情報不足");
  }
  if (includesKeyword(joined, ["テンプレ", "無難", "ありきたり"])) {
    detected.push("テンプレ感");
  }
  if (includesKeyword(joined, ["ネガティブ", "苦手", "嫌い", "愚痴"])) {
    detected.push("ネガティブ表現");
  }
  if (includesKeyword(joined, ["フック", "会話の糸口", "質問しづらい", "ツッコミ"])) {
    detected.push("ツッコミ余地がない");
  }
  if (includesKeyword(joined, ["冒頭", "出だし", "はじめまして"])) {
    detected.push("冒頭が弱い");
  }
  if (includesKeyword(joined, ["盛り", "作り込み", "大きく見せ"])) {
    detected.push("盛りすぎ");
  }

  return uniq(detected);
}

function deriveGoodCategories(result: AnalysisResult) {
  const joined = result.highlights.good
    .flatMap((item) => [item.reason, item.text])
    .join("\n");
  const detected: HighlightCategoryGood[] = [];

  if (includesKeyword(joined, ["固有名詞", "店名", "地名", "作品名"])) {
    detected.push("固有名詞あり");
  }
  if (includesKeyword(joined, ["フック", "質問", "会話のきっかけ", "ツッコミ"])) {
    detected.push("ツッコミ余地あり");
  }
  if (includesKeyword(joined, ["等身大", "自然", "誠実", "好感"])) {
    detected.push("等身大で好感");
  }
  if (includesKeyword(joined, ["冒頭", "最初", "入りが強い"])) {
    detected.push("冒頭が強い");
  }
  if (includesKeyword(joined, ["ユーモア", "笑い", "くすっと"])) {
    detected.push("ユーモアがある");
  }
  if (includesKeyword(joined, ["エピソード", "体験", "話"])) {
    detected.push("ストーリーがある");
  }
  if (includesKeyword(joined, ["数字", "年", "回", "週"])) {
    detected.push("数字が入っている");
  }
  if (includesKeyword(joined, ["将来", "一緒に", "イメージできる"])) {
    detected.push("将来像が見える");
  }

  return uniq(detected);
}

function normalizeBadCategories(input: AnalysisResult, profileLength: number) {
  const fromModel = uniq((input.statsCategories?.badCategories ?? []).filter((value): value is HighlightCategoryBad => {
    return badCategoryOptions.includes(value as HighlightCategoryBad);
  }));

  return fromModel.length > 0 ? fromModel : deriveBadCategories(input, profileLength);
}

function normalizeGoodCategories(input: AnalysisResult) {
  const fromModel = uniq((input.statsCategories?.goodCategories ?? []).filter((value): value is HighlightCategoryGood => {
    return goodCategoryOptions.includes(value as HighlightCategoryGood);
  }));

  return fromModel.length > 0 ? fromModel : deriveGoodCategories(input);
}

async function incrementFloat(key: string, value: number) {
  await kv.incrbyfloat(key, value);
}

export async function saveAnonymousStats(input: AnalyzeRequest, result: AnalysisResult) {
  if (!isKvConfigured()) {
    return;
  }

  try {
    const ageGroup = getProfAgeGroup(input.age);
    const apps = uniq(input.apps);
    const badCategories = normalizeBadCategories(result, input.profileText.length);
    const goodCategories = normalizeGoodCategories(result);
    const improvedTotal = result.improvedProfile.estimatedScores.total;
    const scoreDiff = improvedTotal - result.scores.total;
    const band = getProfScoreBand(result.scores.total);

    const record: AnonymousStatRecord = {
      id: createRecordId(),
      createdAt: new Date().toISOString(),
      gender: input.gender,
      ageGroup,
      apps,
      profileLength: input.profileText.length,
      scores: result.scores,
      title: result.title,
      badCategories,
      goodCategories,
      badCount: result.highlights.bad.length,
      goodCount: result.highlights.good.length,
      targetMain: {
        ageRange: result.targetAudience.main.ageRange,
        occupation: result.targetAudience.main.occupation,
      },
      improvedTotal,
      scoreDiff,
    };

    await kv.incr("stats:totalCount");
    await incrementFloat("stats:totalHensachiSum", result.scores.total);
    await kv.incr(`stats:gender:${record.gender}:count`);
    await incrementFloat(`stats:gender:${record.gender}:sum`, result.scores.total);
    await kv.incr(`stats:age:${record.ageGroup}:count`);
    await incrementFloat(`stats:age:${record.ageGroup}:sum`, result.scores.total);
    await kv.incr(`stats:band:${band}`);
    await incrementFloat("stats:improvement:sum", scoreDiff);
    await incrementFloat("stats:improvedTotal:sum", improvedTotal);

    for (const app of record.apps) {
      await kv.incr(`stats:app:${app}:count`);
      await incrementFloat(`stats:app:${app}:sum`, result.scores.total);
    }

    for (const category of record.badCategories) {
      await kv.incr(`stats:bad:${category}`);
    }

    for (const category of record.goodCategories) {
      await kv.incr(`stats:good:${category}`);
    }

    const currentMax = await getNumber("stats:improvement:max");
    if (scoreDiff > currentMax) {
      await kv.set("stats:improvement:max", scoreDiff);
    }

    const retention = getRecordRetention();
    if (retention > 0) {
      await kv.lpush("stats:records", JSON.stringify(record));
      await kv.ltrim("stats:records", 0, retention - 1);
    }

    await kv.set("stats:lastUpdated", record.createdAt);
  } catch (error) {
    console.error("Failed to save anonymous stats", error);
  }
}

export async function getStatsSnapshot(): Promise<StatsSnapshot> {
  if (!isKvConfigured()) {
    return {
      totalCount: 0,
      genderSplit: { male: 0, female: 0 },
      avgHensachi: 0,
      avgHensachiByGender: { male: null, female: null },
      ageGroups: profAgeGroups.map((group) => ({ group, count: 0, avg: null })),
      appStats: profAppOptions.map((app) => ({ app: app.value, label: app.label, count: 0, avg: null })),
      badRanking: badCategoryOptions.map((category) => ({ category, count: 0 })),
      distribution: profScoreBands.map((band) => ({ band, count: 0, percentage: 0 })),
      avgImprovement: 0,
      maxImprovement: 0,
      avgImprovedTotal: 0,
      lastUpdated: null,
    };
  }

  const [
    totalCount,
    totalSum,
    maleCount,
    maleSum,
    femaleCount,
    femaleSum,
    improvementSum,
    improvementMax,
    improvedTotalSum,
    lastUpdatedRaw,
  ] = await Promise.all([
    getNumber("stats:totalCount"),
    getNumber("stats:totalHensachiSum"),
    getNumber("stats:gender:male:count"),
    getNumber("stats:gender:male:sum"),
    getNumber("stats:gender:female:count"),
    getNumber("stats:gender:female:sum"),
    getNumber("stats:improvement:sum"),
    getNumber("stats:improvement:max"),
    getNumber("stats:improvedTotal:sum"),
    kv.get<string>("stats:lastUpdated"),
  ]);

  const ageGroups = await Promise.all(
    profAgeGroups.map(async (group) => {
      const [count, sum] = await Promise.all([
        getNumber(`stats:age:${group}:count`),
        getNumber(`stats:age:${group}:sum`),
      ]);

      return {
        group,
        count,
        avg: count > 0 ? roundOne(sum / count) : null,
      };
    })
  );

  const appStats = await Promise.all(
    profAppOptions.map(async (app) => {
      const [count, sum] = await Promise.all([
        getNumber(`stats:app:${app.value}:count`),
        getNumber(`stats:app:${app.value}:sum`),
      ]);

      return {
        app: app.value,
        label: getProfAppLabel(app.value),
        count,
        avg: count > 0 ? roundOne(sum / count) : null,
      };
    })
  );

  appStats.sort((left, right) => (right.avg ?? 0) - (left.avg ?? 0));

  const badRanking = await Promise.all(
    badCategoryOptions.map(async (category) => ({
      category,
      count: await getNumber(`stats:bad:${category}`),
    }))
  );
  badRanking.sort((left, right) => right.count - left.count);

  const distributionCounts = await Promise.all(
    profScoreBands.map(async (band) => ({
      band,
      count: await getNumber(`stats:band:${band}`),
    }))
  );

  const distribution = distributionCounts.map((item) => ({
    ...item,
    percentage: totalCount > 0 ? roundOne((item.count / totalCount) * 100) : 0,
  }));

  return {
    totalCount,
    genderSplit: {
      male: maleCount,
      female: femaleCount,
    },
    avgHensachi: totalCount > 0 ? roundOne(totalSum / totalCount) : 0,
    avgHensachiByGender: {
      male: maleCount > 0 ? roundOne(maleSum / maleCount) : null,
      female: femaleCount > 0 ? roundOne(femaleSum / femaleCount) : null,
    },
    ageGroups,
    appStats,
    badRanking,
    distribution,
    avgImprovement: totalCount > 0 ? roundOne(improvementSum / totalCount) : 0,
    maxImprovement: Math.round(improvementMax),
    avgImprovedTotal: totalCount > 0 ? roundOne(improvedTotalSum / totalCount) : 0,
    lastUpdated: typeof lastUpdatedRaw === "string" ? lastUpdatedRaw : null,
  };
}
