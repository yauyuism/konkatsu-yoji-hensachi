export type Situation =
  | "app_match"
  | "going_well"
  | "more_than_friends"
  | "crush"
  | "dating"
  | "living_together"
  | "ex"
  | "complicated";

export type WeightJudgment = "light" | "balanced" | "heavy" | "very_heavy";

export type WeightFactorKey =
  | "textRatio"
  | "questionDensity"
  | "emojiGap"
  | "topicInitRate"
  | "lengthVariance";

export interface OptimalZone {
  min: number;
  max: number;
  heavyThreshold: number;
  veryHeavyThreshold: number;
}

export interface SituationOption {
  value: Situation;
  emoji: string;
  label: string;
  shortLabel: string;
  sub: string;
}

export const SITUATION_OPTIONS: SituationOption[] = [
  { value: "app_match", emoji: "🔍", label: "アプリでマッチした相手", shortLabel: "アプリマッチ", sub: "まだ会ってない or 1-2回" },
  { value: "going_well", emoji: "🔥", label: "いい感じの相手", shortLabel: "いい感じ", sub: "デートしてる。たぶん両思い" },
  { value: "more_than_friends", emoji: "👫", label: "友達以上、恋人未満", shortLabel: "友達以上恋人未満", sub: "近いけど名前がつかない" },
  { value: "crush", emoji: "💭", label: "気になってる人", shortLabel: "片思い", sub: "片思い or 相手の気持ちが分からない" },
  { value: "dating", emoji: "💑", label: "恋人", shortLabel: "恋人", sub: "付き合ってる" },
  { value: "living_together", emoji: "🏠", label: "同棲・夫婦", shortLabel: "同棲・夫婦", sub: "一緒に暮らしてる" },
  { value: "ex", emoji: "🔄", label: "元カレ / 元カノ", shortLabel: "元恋人", sub: "別れた相手と連絡してる" },
  { value: "complicated", emoji: "🌀", label: "複雑な関係", shortLabel: "複雑な関係", sub: "一言では説明できない" },
];

export const OPTIMAL_ZONES: Record<Situation, OptimalZone> = {
  app_match: { min: 1.2, max: 2.0, heavyThreshold: 2.5, veryHeavyThreshold: 3.5 },
  going_well: { min: 1.3, max: 2.5, heavyThreshold: 3.0, veryHeavyThreshold: 4.0 },
  more_than_friends: { min: 1.0, max: 2.2, heavyThreshold: 2.8, veryHeavyThreshold: 3.5 },
  crush: { min: 1.0, max: 1.8, heavyThreshold: 2.2, veryHeavyThreshold: 3.0 },
  dating: { min: 1.5, max: 3.0, heavyThreshold: 3.5, veryHeavyThreshold: 4.5 },
  living_together: { min: 0.8, max: 2.0, heavyThreshold: 2.5, veryHeavyThreshold: 3.5 },
  ex: { min: 0.8, max: 1.5, heavyThreshold: 2.0, veryHeavyThreshold: 2.5 },
  complicated: { min: 1.0, max: 2.0, heavyThreshold: 2.5, veryHeavyThreshold: 3.5 },
};

export const SITUATION_COMPARISON_MAP: Record<Situation, Situation[]> = {
  app_match: ["dating"],
  going_well: ["app_match", "dating"],
  more_than_friends: ["crush", "dating"],
  crush: ["more_than_friends", "app_match"],
  dating: ["more_than_friends", "living_together"],
  living_together: ["dating"],
  ex: ["crush", "app_match"],
  complicated: ["more_than_friends", "dating"],
};

export const WEIGHT_FACTOR_LABELS: Record<WeightFactorKey, string> = {
  textRatio: "文量バランス",
  questionDensity: "質問密度",
  emojiGap: "絵文字温度差",
  topicInitRate: "話題起点率",
  lengthVariance: "メッセージ長のバラつき",
};

export const WEIGHT_JUDGMENT_META: Record<WeightJudgment, { label: string; color: string }> = {
  light: { label: "軽い", color: "#3B82F6" },
  balanced: { label: "ちょうどいい", color: "#10B981" },
  heavy: { label: "やや重い", color: "#F59E0B" },
  very_heavy: { label: "重い", color: "#E8453C" },
};

export function getSituationOption(situation: Situation) {
  return SITUATION_OPTIONS.find((option) => option.value === situation) ?? SITUATION_OPTIONS[0];
}
