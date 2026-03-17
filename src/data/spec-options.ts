import type { EducationKey, ConditionRegion } from "@/data/conditions";

export type SpecFilterType = "income" | "age" | "height" | "education" | "region" | "soft";

export type SpecCategory =
  | "お金"
  | "年齢"
  | "見た目"
  | "性格"
  | "学歴"
  | "住まい"
  | "生活"
  | "趣味";

export type SpecFilterValue = number | EducationKey | Exclude<ConditionRegion, "all" | "tokai" | "other">;

export type SpecOption = {
  id: string;
  category: SpecCategory;
  label: string;
  emoji: string;
  filterType: SpecFilterType;
  filterValue?: SpecFilterValue;
  estimatedFilterRate: number;
};

export const SPEC_CATEGORY_ORDER: SpecCategory[] = [
  "お金",
  "年齢",
  "見た目",
  "性格",
  "学歴",
  "住まい",
  "生活",
  "趣味",
];

export const SPEC_OPTIONS: SpecOption[] = [
  { id: "inc_400", category: "お金", label: "年収400万以上", emoji: "💰", filterType: "income", filterValue: 400, estimatedFilterRate: 0.48 },
  { id: "inc_500", category: "お金", label: "年収500万以上", emoji: "💰", filterType: "income", filterValue: 500, estimatedFilterRate: 0.28 },
  { id: "inc_600", category: "お金", label: "年収600万以上", emoji: "💰", filterType: "income", filterValue: 600, estimatedFilterRate: 0.16 },
  { id: "inc_800", category: "お金", label: "年収800万以上", emoji: "💎", filterType: "income", filterValue: 800, estimatedFilterRate: 0.058 },
  { id: "inc_1000", category: "お金", label: "年収1000万以上", emoji: "💎", filterType: "income", filterValue: 1000, estimatedFilterRate: 0.022 },
  { id: "inc_none", category: "お金", label: "年収は気にしない", emoji: "🆓", filterType: "income", estimatedFilterRate: 1.0 },
  { id: "inc_stable", category: "お金", label: "正社員", emoji: "🏢", filterType: "soft", estimatedFilterRate: 0.65 },
  { id: "inc_save", category: "お金", label: "貯金がちゃんとある", emoji: "🏦", filterType: "soft", estimatedFilterRate: 0.4 },

  { id: "age_same", category: "年齢", label: "同い年がいい", emoji: "🎂", filterType: "age", estimatedFilterRate: 0.08 },
  { id: "age_older", category: "年齢", label: "年上がいい", emoji: "⬆️", filterType: "age", estimatedFilterRate: 0.45 },
  { id: "age_younger", category: "年齢", label: "年下がいい", emoji: "⬇️", filterType: "age", estimatedFilterRate: 0.4 },
  { id: "age_3", category: "年齢", label: "3歳差まで", emoji: "📅", filterType: "age", estimatedFilterRate: 0.25 },
  { id: "age_5", category: "年齢", label: "5歳差まで", emoji: "📅", filterType: "age", estimatedFilterRate: 0.4 },
  { id: "age_none", category: "年齢", label: "年齢は気にしない", emoji: "🆓", filterType: "age", estimatedFilterRate: 1.0 },

  { id: "look_clean", category: "見た目", label: "清潔感", emoji: "✨", filterType: "soft", estimatedFilterRate: 0.7 },
  { id: "height_165", category: "見た目", label: "身長165cm以上", emoji: "📏", filterType: "height", filterValue: 165, estimatedFilterRate: 0.72 },
  { id: "height_170", category: "見た目", label: "身長170cm以上", emoji: "📏", filterType: "height", filterValue: 170, estimatedFilterRate: 0.5 },
  { id: "height_175", category: "見た目", label: "身長175cm以上", emoji: "📏", filterType: "height", filterValue: 175, estimatedFilterRate: 0.24 },
  { id: "look_smile", category: "見た目", label: "笑顔がいい", emoji: "😊", filterType: "soft", estimatedFilterRate: 0.6 },
  { id: "look_fashion", category: "見た目", label: "服のセンスがいい", emoji: "👔", filterType: "soft", estimatedFilterRate: 0.35 },
  { id: "look_fit", category: "見た目", label: "体型が普通〜細め", emoji: "🏃", filterType: "soft", estimatedFilterRate: 0.55 },
  { id: "look_none", category: "見た目", label: "見た目は気にしない", emoji: "🆓", filterType: "soft", estimatedFilterRate: 1.0 },

  { id: "char_calm", category: "性格", label: "穏やか", emoji: "🕊️", filterType: "soft", estimatedFilterRate: 0.4 },
  { id: "char_funny", category: "性格", label: "話が面白い", emoji: "😂", filterType: "soft", estimatedFilterRate: 0.3 },
  { id: "char_independent", category: "性格", label: "自立してる", emoji: "💪", filterType: "soft", estimatedFilterRate: 0.45 },
  { id: "char_kind", category: "性格", label: "優しい", emoji: "🤝", filterType: "soft", estimatedFilterRate: 0.6 },
  { id: "char_positive", category: "性格", label: "ポジティブ", emoji: "☀️", filterType: "soft", estimatedFilterRate: 0.45 },
  { id: "char_listen", category: "性格", label: "話を聞いてくれる", emoji: "👂", filterType: "soft", estimatedFilterRate: 0.5 },
  { id: "char_honest", category: "性格", label: "嘘をつかない", emoji: "🪞", filterType: "soft", estimatedFilterRate: 0.55 },
  { id: "char_respect", category: "性格", label: "価値観を押し付けない", emoji: "🙏", filterType: "soft", estimatedFilterRate: 0.4 },
  { id: "char_ambitious", category: "性格", label: "向上心がある", emoji: "🔥", filterType: "soft", estimatedFilterRate: 0.35 },
  { id: "char_communication", category: "性格", label: "言葉にしてくれる", emoji: "💬", filterType: "soft", estimatedFilterRate: 0.3 },

  { id: "edu_college", category: "学歴", label: "大卒以上", emoji: "🎓", filterType: "education", filterValue: "college", estimatedFilterRate: 0.55 },
  { id: "edu_grad", category: "学歴", label: "大学院卒", emoji: "🎓", filterType: "education", filterValue: "graduate", estimatedFilterRate: 0.07 },
  { id: "edu_none", category: "学歴", label: "学歴は気にしない", emoji: "🆓", filterType: "education", estimatedFilterRate: 1.0 },
  { id: "job_pro", category: "学歴", label: "専門職（医師・弁護士等）", emoji: "⚕️", filterType: "soft", estimatedFilterRate: 0.03 },
  { id: "job_public", category: "学歴", label: "公務員", emoji: "🏛️", filterType: "soft", estimatedFilterRate: 0.06 },
  { id: "job_flex", category: "学歴", label: "リモートワーク可", emoji: "💻", filterType: "soft", estimatedFilterRate: 0.25 },

  { id: "area_tokyo", category: "住まい", label: "東京", emoji: "🗼", filterType: "region", filterValue: "tokyo", estimatedFilterRate: 0.11 },
  { id: "area_kanto", category: "住まい", label: "関東圏", emoji: "📍", filterType: "region", filterValue: "kanto", estimatedFilterRate: 0.29 },
  { id: "area_kansai", category: "住まい", label: "関西圏", emoji: "📍", filterType: "region", filterValue: "kansai", estimatedFilterRate: 0.15 },
  { id: "area_near", category: "住まい", label: "自分と同じエリア", emoji: "🏠", filterType: "region", estimatedFilterRate: 0.15 },
  { id: "area_none", category: "住まい", label: "住まいは気にしない", emoji: "🆓", filterType: "region", estimatedFilterRate: 1.0 },

  { id: "life_nosmoking", category: "生活", label: "タバコ吸わない", emoji: "🚭", filterType: "soft", estimatedFilterRate: 0.75 },
  { id: "life_cook", category: "生活", label: "料理ができる", emoji: "🍳", filterType: "soft", estimatedFilterRate: 0.35 },
  { id: "life_children", category: "生活", label: "子ども欲しい", emoji: "👶", filterType: "soft", estimatedFilterRate: 0.55 },
  { id: "life_nochildren", category: "生活", label: "子どもは要らない", emoji: "🙅", filterType: "soft", estimatedFilterRate: 0.2 },
  { id: "life_dualincome", category: "生活", label: "共働きOK", emoji: "💼", filterType: "soft", estimatedFilterRate: 0.65 },
  { id: "life_pet", category: "生活", label: "ペットOK", emoji: "🐱", filterType: "soft", estimatedFilterRate: 0.45 },
  { id: "life_clean", category: "生活", label: "部屋がきれい", emoji: "🧹", filterType: "soft", estimatedFilterRate: 0.35 },
  { id: "life_nodrink", category: "生活", label: "お酒飲まない/控えめ", emoji: "🍵", filterType: "soft", estimatedFilterRate: 0.4 },
  { id: "life_family", category: "生活", label: "家族を大事にする", emoji: "👪", filterType: "soft", estimatedFilterRate: 0.55 },
  { id: "life_money", category: "生活", label: "金銭感覚が合う", emoji: "💳", filterType: "soft", estimatedFilterRate: 0.4 },

  { id: "hobby_outdoor", category: "趣味", label: "アウトドア好き", emoji: "⛰️", filterType: "soft", estimatedFilterRate: 0.3 },
  { id: "hobby_indoor", category: "趣味", label: "インドア理解がある", emoji: "🎮", filterType: "soft", estimatedFilterRate: 0.55 },
  { id: "hobby_travel", category: "趣味", label: "旅行好き", emoji: "✈️", filterType: "soft", estimatedFilterRate: 0.5 },
  { id: "hobby_food", category: "趣味", label: "食の好みが合う", emoji: "🍽️", filterType: "soft", estimatedFilterRate: 0.4 },
  { id: "hobby_music", category: "趣味", label: "音楽の趣味が合う", emoji: "🎵", filterType: "soft", estimatedFilterRate: 0.25 },
  { id: "hobby_laugh", category: "趣味", label: "笑いのツボが同じ", emoji: "🤣", filterType: "soft", estimatedFilterRate: 0.25 },
  { id: "hobby_alone", category: "趣味", label: "1人の時間を尊重", emoji: "🧘", filterType: "soft", estimatedFilterRate: 0.45 },
] as const;

export const SPEC_OPTIONS_BY_ID = new Map(SPEC_OPTIONS.map((option) => [option.id, option]));

export const EXCLUSIVE_GROUPS: Record<string, string[]> = {
  income: ["inc_400", "inc_500", "inc_600", "inc_800", "inc_1000", "inc_none"],
  agePreference: ["age_same", "age_older", "age_younger", "age_none"],
  ageRange: ["age_3", "age_5", "age_none"],
  height: ["height_165", "height_170", "height_175", "look_none"],
  appearanceSoft: ["look_clean", "look_smile", "look_fashion", "look_fit", "look_none"],
  education: ["edu_college", "edu_grad", "edu_none"],
  region: ["area_tokyo", "area_kanto", "area_kansai", "area_near", "area_none"],
  children: ["life_children", "life_nochildren"],
};

export const NONE_SPEC_IDS = new Set(["inc_none", "age_none", "look_none", "edu_none", "area_none"]);
