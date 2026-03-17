export type ProfGender = "male" | "female";

export type ProfAppValue =
  | "pairs"
  | "with"
  | "omiai"
  | "tapple"
  | "tinder"
  | "bumble"
  | "toukare"
  | "marrish"
  | "zexy"
  | "other";

export type ScoreKey = "firstImpression" | "specificity" | "sincerity" | "hookability" | "safety";

export type HighlightKind = "good" | "bad" | "neutral";

export type HighlightCategoryBad =
  | "具体性が低い"
  | "防御的表現"
  | "自虐しすぎ"
  | "上から目線"
  | "情報不足"
  | "テンプレ感"
  | "ネガティブ表現"
  | "ツッコミ余地がない"
  | "冒頭が弱い"
  | "盛りすぎ";

export type HighlightCategoryGood =
  | "固有名詞あり"
  | "ツッコミ余地あり"
  | "等身大で好感"
  | "冒頭が強い"
  | "ユーモアがある"
  | "ストーリーがある"
  | "数字が入っている"
  | "将来像が見える";

export interface AnalyzeRequest {
  gender: ProfGender;
  age: number;
  apps: ProfAppValue[];
  profileText: string;
}

export interface ScoreSet {
  firstImpression: number;
  specificity: number;
  sincerity: number;
  hookability: number;
  safety: number;
  total: number;
}

export type ProfAxisComments = Record<ScoreKey, string>;

export interface HighlightNote {
  text: string;
  reason: string;
  suggestion?: string;
}

export interface TargetAudience {
  main: {
    ageRange: string;
    occupation: string;
    persona: string;
    appHistory: string;
    personality: string;
    reason: string;
  };
  sub: {
    ageRange: string;
    occupation: string;
    persona: string;
    appHistory: string;
    personality: string;
    reason: string;
  };
  miss: {
    type: string;
    reason: string;
    improvementHint: string;
  };
}

export interface BaseAnalysisResult {
  scores: ScoreSet;
  title: string;
  nickname: string;
  axisComments: ProfAxisComments;
  summary: string;
  highlights: {
    good: HighlightNote[];
    bad: HighlightNote[];
  };
  comment: string;
}

export interface AnalysisDetails {
  targetAudience: TargetAudience;
  improvedProfile: {
    text: string;
    estimatedScores: ScoreSet;
    changes: string[];
  };
  statsCategories?: {
    badCategories: HighlightCategoryBad[];
    goodCategories: HighlightCategoryGood[];
  };
}

export type DetailAnalysisResult = AnalysisDetails;

export type AnalysisResult = BaseAnalysisResult & AnalysisDetails;

export type PartialAnalysisResult = BaseAnalysisResult & Partial<AnalysisDetails>;

export interface HighlightedSegment {
  key: string;
  text: string;
  type: HighlightKind;
  reason?: string;
  suggestion?: string;
}

function compactWhitespace(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function clipSnippet(text: string, maxLength = 18) {
  const normalized = compactWhitespace(text);
  if (!normalized) {
    return "";
  }

  return normalized.length <= maxLength ? normalized : `${normalized.slice(0, maxLength)}…`;
}

export const profAxisOrder: ScoreKey[] = [
  "firstImpression",
  "specificity",
  "sincerity",
  "hookability",
  "safety",
];

export const profAxisLabels: Record<ScoreKey, string> = {
  firstImpression: "第一印象力",
  specificity: "具体性",
  sincerity: "誠実さ",
  hookability: "ツッコミ余地",
  safety: "地雷回避",
};

const profAxisCommentTemplates: Record<ScoreKey, [string, string, string, string]> = {
  firstImpression: [
    "冒頭2行で返事の入口が見えるプロフ",
    "土台はある。あと1行で記憶に残ります",
    "冒頭の1文を変えるだけで動く科目です",
    "3行目より前に置くカードが効きます",
  ],
  specificity: [
    "固有名詞があるから会話の入口が多い",
    "素材はある。地名か店名が1つあると強い",
    "『旅行』の先にまだ余白が残っています",
    "具体名を1つ置くと見え方が変わります",
  ],
  sincerity: [
    "盛らない温度感がそのまま安心に変わる",
    "ちゃんと誠実。少し素直さを足すと強い",
    "言い切りより体温が見える一文が効きます",
    "背伸びを1枚外すと空気がやわらぎます",
  ],
  hookability: [
    "1通目が来る理由を自分で置けています",
    "会話は始まる。もう1つフックがあると強い",
    "読む側のツッコミどころをまだ増やせます",
    "質問したくなる癖を1つ置くと動きます",
  ],
  safety: [
    "壁を作らずに線引きできているプロフ",
    "空気はやわらかい。語尾の角が取れると強い",
    "条件より温度感で伝えると伸びやすい帯",
    "守りの一文を外すだけで印象が変わります",
  ],
};

const strongestNicknameOptions: Record<ScoreKey, [string, string]> = {
  firstImpression: ["冒頭2行の魔術師", "つかみはOKの人"],
  specificity: ["固有名詞の弾幕", "Googleマップ付きプロフ"],
  sincerity: ["等身大の安心感", "盛らない勇気の持ち主"],
  hookability: ["メッセージが来やすい人", "話しかけたくなるプロフ"],
  safety: ["NG表現ゼロの優等生", "誰も傷つけないプロフ"],
};

const weakestNicknameOptions: Record<ScoreKey, [string, string]> = {
  firstImpression: ["スロースターター", "3行目から本気出すタイプ"],
  specificity: ["趣味は旅行、の代表", "テンプレートの申し子"],
  sincerity: ["盛り師見習い", "理想と現実の仲介人"],
  hookability: ["自己完結型プロフ", "話しかけるスキがない人"],
  safety: ["善意の地雷原", "知らずに壁を作る人"],
};

export const safetyRedFlagTerms = [
  "真剣な方のみ",
  "業者お断り",
  "ドタキャン",
  "NG",
  "お断り",
  "陰キャ",
  "メンヘラ",
  "普通の人",
  "まともな人",
  "常識のない",
  "冷やかし",
] as const;

export const profAppOptions: Array<{ value: ProfAppValue; label: string }> = [
  { value: "pairs", label: "Pairs" },
  { value: "with", label: "with" },
  { value: "omiai", label: "Omiai" },
  { value: "tapple", label: "tapple" },
  { value: "tinder", label: "Tinder" },
  { value: "bumble", label: "Bumble" },
  { value: "toukare", label: "東カレ" },
  { value: "marrish", label: "マリッシュ" },
  { value: "zexy", label: "ゼクシィ" },
  { value: "other", label: "その他" },
];

export const badCategoryOptions: HighlightCategoryBad[] = [
  "具体性が低い",
  "防御的表現",
  "自虐しすぎ",
  "上から目線",
  "情報不足",
  "テンプレ感",
  "ネガティブ表現",
  "ツッコミ余地がない",
  "冒頭が弱い",
  "盛りすぎ",
];

export const goodCategoryOptions: HighlightCategoryGood[] = [
  "固有名詞あり",
  "ツッコミ余地あり",
  "等身大で好感",
  "冒頭が強い",
  "ユーモアがある",
  "ストーリーがある",
  "数字が入っている",
  "将来像が見える",
];

const titleBands = [
  { min: 75, max: 80, title: "プロフの覇王", color: "#E8453C" },
  { min: 70, max: 74, title: "アプリの支配者", color: "#E8453C" },
  { min: 65, max: 69, title: "恋のスナイパー", color: "#F97316" },
  { min: 60, max: 64, title: "婚活エリート", color: "#F97316" },
  { min: 55, max: 59, title: "堅実なプレイヤー", color: "#3B82F6" },
  { min: 50, max: 54, title: "アプリ中級者", color: "#3B82F6" },
  { min: 45, max: 49, title: "発展途上の戦士", color: "#6B7280" },
  { min: 40, max: 44, title: "迷えるスワイパー", color: "#6B7280" },
  { min: 35, max: 39, title: "アプリ初心者", color: "#1A1A1A" },
  { min: 25, max: 34, title: "ここから伸びる人", color: "#1A1A1A" },
] as const;

const ageGroups = ["18-24", "25-29", "30-34", "35-39", "40+"] as const;
const scoreBands = ["75-80", "70-74", "65-69", "60-64", "55-59", "50-54", "45-49", "40-44", "35-39", "25-34"] as const;

export const profAgeGroups = [...ageGroups];
export const profScoreBands = [...scoreBands];

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function toNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

export function clampAxisScore(value: unknown) {
  return clamp(Math.round(toNumber(value) ?? 0), 0, 100);
}

export function clampTotalScore(value: unknown) {
  return clamp(Math.round(toNumber(value) ?? 25), 25, 80);
}

export function calculateTotalScoreFromAxes(scores: Pick<ScoreSet, "firstImpression" | "specificity" | "sincerity" | "hookability" | "safety">) {
  const average =
    (scores.firstImpression + scores.specificity + scores.sincerity + scores.hookability + scores.safety) / 5;

  return clampTotalScore(25 + average * 0.55);
}

export function sanitizeScoreSet(input: Partial<Record<keyof ScoreSet, unknown>> | undefined | null): ScoreSet {
  const normalized = {
    firstImpression: clampAxisScore(input?.firstImpression),
    specificity: clampAxisScore(input?.specificity),
    sincerity: clampAxisScore(input?.sincerity),
    hookability: clampAxisScore(input?.hookability),
    safety: clampAxisScore(input?.safety),
    total: clampTotalScore(input?.total),
  };

  return {
    ...normalized,
    total: calculateTotalScoreFromAxes(normalized),
  };
}

export function getProfTitleMeta(total: number) {
  return titleBands.find((band) => total >= band.min && total <= band.max) ?? titleBands[titleBands.length - 1];
}

export function getWeakestScoreKey(scores: Pick<ScoreSet, ScoreKey>) {
  return [...profAxisOrder].sort((left, right) => scores[left] - scores[right])[0];
}

export function getStrongestScoreKey(scores: Pick<ScoreSet, ScoreKey>) {
  return [...profAxisOrder].sort((left, right) => scores[right] - scores[left])[0];
}

function pickNicknameOption(options: readonly string[], seed: number) {
  return options[Math.abs(seed) % options.length] ?? options[0];
}

function getAxisComment(axis: ScoreKey, value: number) {
  const [high, upperMid, lowerMid, low] = profAxisCommentTemplates[axis];

  if (value >= 80) {
    return high;
  }

  if (value >= 60) {
    return upperMid;
  }

  if (value >= 40) {
    return lowerMid;
  }

  return low;
}

export function buildProfAxisComments(scores: Pick<ScoreSet, ScoreKey>): ProfAxisComments {
  return profAxisOrder.reduce<ProfAxisComments>((acc, axis) => {
    acc[axis] = getAxisComment(axis, scores[axis]);
    return acc;
  }, {} as ProfAxisComments);
}

export function getProfNickname(scores: Pick<ScoreSet, ScoreKey> & { total: number }) {
  const strongest = getStrongestScoreKey(scores);
  const weakest = getWeakestScoreKey(scores);
  const gap = scores[strongest] - scores[weakest];
  const options = gap >= 20 ? weakestNicknameOptions[weakest] : strongestNicknameOptions[strongest];

  return pickNicknameOption(options, scores.total + scores[strongest] + scores[weakest]);
}

export function getProfAgeGroup(age: number) {
  if (age < 25) {
    return "18-24";
  }
  if (age < 30) {
    return "25-29";
  }
  if (age < 35) {
    return "30-34";
  }
  if (age < 40) {
    return "35-39";
  }
  return "40+";
}

export function getProfScoreBand(total: number) {
  return getProfTitleMeta(total).min === 75
    ? "75-80"
    : getProfTitleMeta(total).min === 70
      ? "70-74"
      : getProfTitleMeta(total).min === 65
        ? "65-69"
        : getProfTitleMeta(total).min === 60
          ? "60-64"
          : getProfTitleMeta(total).min === 55
            ? "55-59"
            : getProfTitleMeta(total).min === 50
              ? "50-54"
              : getProfTitleMeta(total).min === 45
                ? "45-49"
                : getProfTitleMeta(total).min === 40
                  ? "40-44"
                  : getProfTitleMeta(total).min === 35
                    ? "35-39"
                    : "25-34";
}

export function getProfAppLabel(value: string) {
  return profAppOptions.find((option) => option.value === value)?.label ?? value;
}

export function getProfShareAppLabel(values: readonly string[]) {
  if (values.length === 0) {
    return "マッチングアプリ";
  }

  const labels = values.map((value) => getProfAppLabel(value)).filter(Boolean);
  if (labels.length === 0) {
    return "マッチングアプリ";
  }

  return labels.length === 1 ? labels[0] : `${labels[0]}など`;
}

function erfApprox(x: number) {
  const sign = x < 0 ? -1 : 1;
  const absolute = Math.abs(x);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const t = 1 / (1 + p * absolute);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absolute * absolute);
  return sign * y;
}

function standardNormalCdf(x: number) {
  return 0.5 * (1 + erfApprox(x / Math.sqrt(2)));
}

export function getProfTopPercentile(total: number) {
  const z = (clampTotalScore(total) - 50) / 13.5;
  return clamp(Math.round((1 - standardNormalCdf(z)) * 100), 1, 99);
}

function readSearchParam(input: string | string[] | undefined) {
  return Array.isArray(input) ? input[0] : input;
}

export function serializeProfShareParams(
  scores: ScoreSet,
  improvedTotal?: number | null,
  nickname?: string | null
) {
  const params = new URLSearchParams({
    fi: String(clampAxisScore(scores.firstImpression)),
    sp: String(clampAxisScore(scores.specificity)),
    sr: String(clampAxisScore(scores.sincerity)),
    hk: String(clampAxisScore(scores.hookability)),
    sf: String(clampAxisScore(scores.safety)),
    t: String(clampTotalScore(scores.total)),
  });

  if (typeof improvedTotal === "number" && Number.isFinite(improvedTotal)) {
    params.set("it", String(clampTotalScore(improvedTotal)));
  }

  if (nickname?.trim()) {
    params.set("nn", nickname.trim());
  }

  return params.toString();
}

export function parseProfShareParams(input: Record<string, string | string[] | undefined>) {
  const scores = sanitizeScoreSet({
    firstImpression: readSearchParam(input.fi),
    specificity: readSearchParam(input.sp),
    sincerity: readSearchParam(input.sr),
    hookability: readSearchParam(input.hk),
    safety: readSearchParam(input.sf),
    total: readSearchParam(input.t),
  });

  const improvedTotalRaw = toNumber(readSearchParam(input.it));
  const improvedTotal = improvedTotalRaw === null ? null : clampTotalScore(improvedTotalRaw);
  const nickname = typeof readSearchParam(input.nn) === "string" && readSearchParam(input.nn)?.trim()
    ? (readSearchParam(input.nn) as string).trim()
    : getProfNickname(scores);
  const axisComments = buildProfAxisComments(scores);

  return {
    scores,
    improvedTotal,
    nickname,
    axisComments,
    titleMeta: getProfTitleMeta(scores.total),
  };
}

export function getScoreDiff(before: number, after: number) {
  return Math.round(clampTotalScore(after) - clampTotalScore(before));
}

function rangesOverlap(start: number, end: number, usedRanges: Array<{ start: number; end: number }>) {
  return usedRanges.some((range) => start < range.end && end > range.start);
}

function locateTextRange(
  source: string,
  snippet: string,
  usedRanges: Array<{ start: number; end: number }>
) {
  const candidates = [snippet, snippet.trim()].filter(Boolean);

  for (const candidate of candidates) {
    let fromIndex = 0;
    while (fromIndex < source.length) {
      const start = source.indexOf(candidate, fromIndex);
      if (start === -1) {
        break;
      }

      const end = start + candidate.length;
      if (!rangesOverlap(start, end, usedRanges)) {
        return { start, end };
      }

      fromIndex = start + 1;
    }
  }

  return null;
}

export function buildHighlightedText(
  original: string,
  highlights: BaseAnalysisResult["highlights"]
): HighlightedSegment[] {
  const markers: Array<{
    start: number;
    end: number;
    type: "good" | "bad";
    reason: string;
    suggestion?: string;
  }> = [];
  const usedRanges: Array<{ start: number; end: number }> = [];

  for (const item of highlights.good) {
    const range = locateTextRange(original, item.text, usedRanges);
    if (!range) {
      continue;
    }

    usedRanges.push(range);
    markers.push({
      start: range.start,
      end: range.end,
      type: "good",
      reason: item.reason,
    });
  }

  for (const item of highlights.bad) {
    const range = locateTextRange(original, item.text, usedRanges);
    if (!range) {
      continue;
    }

    usedRanges.push(range);
    markers.push({
      start: range.start,
      end: range.end,
      type: "bad",
      reason: item.reason,
      suggestion: item.suggestion,
    });
  }

  markers.sort((left, right) => left.start - right.start);

  const segments: HighlightedSegment[] = [];
  let cursor = 0;

  for (const marker of markers) {
    if (marker.start > cursor) {
      segments.push({
        key: `neutral-${cursor}-${marker.start}`,
        text: original.slice(cursor, marker.start),
        type: "neutral",
      });
    }

    segments.push({
      key: `${marker.type}-${marker.start}-${marker.end}`,
      text: original.slice(marker.start, marker.end),
      type: marker.type,
      reason: marker.reason,
      suggestion: marker.suggestion,
    });
    cursor = marker.end;
  }

  if (cursor < original.length) {
    segments.push({
      key: `neutral-${cursor}-${original.length}`,
      text: original.slice(cursor),
      type: "neutral",
    });
  }

  if (segments.length === 0) {
    return [
      {
        key: "neutral-full",
        text: original,
        type: "neutral",
      },
    ];
  }

  return segments;
}

const strongestSummaryLines: Record<ScoreKey, (quote: string) => string> = {
  firstImpression: (quote) => `${quote}が冒頭の引っかかりになっています。`,
  specificity: (quote) => `${quote}が人物像を具体化しています。`,
  sincerity: (quote) => `${quote}が盛らない空気を作れています。`,
  hookability: (quote) => `${quote}が1通目の入口になっています。`,
  safety: () => "語気がやわらかく、警戒感を残しにくいです。",
};

const weakestProposalLines: Record<ScoreKey, (quote: string) => string> = {
  firstImpression: (quote) => `${quote}より前に、体温のある一文を置いてみて。`,
  specificity: (quote) => `${quote}を、地名か店名入りにしてみて。`,
  sincerity: (quote) => `${quote}は少し背伸びに見えやすいです。言い切りを1枚外してみて。`,
  hookability: (quote) => `${quote}の近くに、質問しやすい癖を1つ置いてみて。`,
  safety: (quote) => `${quote}は外しても伝わります。やわらかい言い回しに替えてみて。`,
};

const readerImpressionLines: Record<ScoreKey, string> = {
  firstImpression: "相手には『後半に良さがある人』と読まれやすいです。",
  specificity: "相手には『感じはいいけど像がまだぼんやりする人』と映りやすいです。",
  sincerity: "相手には『ちゃんとしてるけど少し作って見える人』と映りやすいです。",
  hookability: "相手には『安心だけど話しかける糸口が少ない人』と映りやすいです。",
  safety: "相手には『ちゃんとしてるけど少し壁がある人』と映りやすいです。",
};

const summaryClosingLines: Record<ScoreKey, string> = {
  firstImpression: "冒頭の2行で流れが変わるプロフです。",
  specificity: "固有名詞を1つ置くだけで印象が締まります。",
  sincerity: "盛らない方向に寄せると一気に自然になります。",
  hookability: "1通目が来る余白を足すと化けます。",
  safety: "守りの言い回しを抜くと空気が変わります。",
};

function quoteSnippet(text: string | undefined, fallback: string) {
  const clipped = clipSnippet(text ?? "", 10);
  return clipped ? `「${clipped}」` : fallback;
}

export function buildProfileSummary(result: Pick<BaseAnalysisResult, "scores" | "highlights">) {
  const strongest = getStrongestScoreKey(result.scores);
  const weakest = getWeakestScoreKey(result.scores);
  const goodQuote = quoteSnippet(result.highlights.good[0]?.text, "この一文");
  const badQuote = quoteSnippet(result.highlights.bad[0]?.text, "この表現");

  return [
    strongestSummaryLines[strongest](goodQuote),
    weakestProposalLines[weakest](badQuote),
    readerImpressionLines[weakest],
    summaryClosingLines[weakest],
  ].join("\n");
}

export function buildProfileCoachComment(result: Pick<BaseAnalysisResult, "scores" | "highlights">) {
  const strongest = profAxisLabels[getStrongestScoreKey(result.scores)];
  const weakest = profAxisLabels[getWeakestScoreKey(result.scores)];

  if (result.scores.total >= 60) {
    return `偏差値${result.scores.total}なら、ちゃんと勝負できます。${strongest}があるので入口は作れています。次は${weakest}を1つ触るほうが早いです。`;
  }

  if (result.scores.total >= 50) {
    return `偏差値${result.scores.total}は、埋もれずに戦える帯です。無難なまま止まるより、${weakest}に1手入れたほうが動きます。`;
  }

  if (result.scores.total >= 40) {
    return `偏差値${result.scores.total}は、作り方で見え方がかなり変わる帯です。${strongest}は残っているので、${weakest}から先に整えてみて。`;
  }

  return `今は作戦を替えると伸びやすい段階です。全部を直すより、${weakest}にまだ置いていないカードを1枚足すほうが効きます。`;
}

function normalizeGeneratedText(
  input: string | undefined | null,
  fallback: string,
  options: {
    min: number;
    max: number;
  }
) {
  const raw = (input ?? "").replace(/\r/g, "").trim();
  if (!raw) {
    return fallback;
  }

  const normalized = raw
    .split("\n")
    .map((line) => compactWhitespace(line))
    .filter(Boolean)
    .join("\n");

  if (normalized.length < options.min || normalized.length > options.max) {
    return fallback;
  }

  return normalized;
}

export function normalizeProfileSummary(input: string | undefined | null, fallback: string) {
  return normalizeGeneratedText(input, fallback, { min: 90, max: 220 });
}

export function normalizeProfileCoachComment(input: string | undefined | null, fallback: string) {
  return normalizeGeneratedText(input, fallback, { min: 45, max: 180 });
}

export function isBaseAnalysisResult(value: unknown): value is BaseAnalysisResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<BaseAnalysisResult>;
  return Boolean(
    candidate.scores &&
      candidate.highlights &&
      candidate.axisComments &&
      typeof candidate.title === "string" &&
      typeof candidate.nickname === "string" &&
      typeof candidate.summary === "string" &&
      typeof candidate.comment === "string"
  );
}

export function isAnalysisResult(value: unknown): value is AnalysisResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<AnalysisResult>;
  return Boolean(
    isBaseAnalysisResult(value) &&
      candidate.targetAudience &&
      candidate.improvedProfile &&
      typeof candidate.improvedProfile.text === "string"
  );
}
